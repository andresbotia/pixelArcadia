import { playPolicy, type PlayMode } from '@/game/playMode';

import {
  consumeInterstitialSlot,
  decideInterstitial,
  grantRewardedRetry,
  isInterstitialDue,
  recordCampaignFirstClear,
  type AdsSaveState,
} from './cadence';
import type { AdAnalyticsEvent, AdLoadState, AdPlacement, AdsPolicy, ShowResult } from './types';

export interface AdFlowDeps {
  ads: {
    getState(placement: AdPlacement): AdLoadState;
    show(placement: AdPlacement): Promise<ShowResult>;
    track(event: AdAnalyticsEvent, props?: Record<string, string | number | boolean>): void;
  };
  store: {
    get(): AdsSaveState;
    update(mutator: (s: AdsSaveState) => AdsSaveState): AdsSaveState;
  };
  policy: () => AdsPolicy;
  /** The central heart grant (`storage/hearts.grantHearts`) — keeps the regen anchor intact. */
  grantHearts: (count: number) => Promise<unknown>;
  now: () => number;
}

export type PostWinBreak = 'notDue' | 'shown' | 'skipped';

/**
 * The three product flows on top of the ad controller. Every flow is gated by
 * `playPolicy(mode).allowAds`, so dev play never shows an ad, never moves the
 * cadence and never grants anything real.
 */
export function createAdFlows(deps: AdFlowDeps) {
  const { ads, store } = deps;
  /**
   * Session-only: a rewarded ad was watched since the last post-win
   * transition, so that transition must not add an interstitial on top.
   */
  let suppressInterstitial = false;
  let breakInFlight: Promise<PostWinBreak> | null = null;

  const allowAds = (mode: PlayMode) => playPolicy(mode).allowAds;

  /**
   * A campaign level was cleared. Only a FIRST clear counts toward the
   * interstitial cadence (`firstClear` = the economy's idempotent first-clear
   * settlement awarded), so replaying cleared levels never produces ads.
   */
  function recordLevelClear(mode: PlayMode, firstClear: boolean): void {
    if (!allowAds(mode) || !firstClear) return;
    store.update(recordCampaignFirstClear);
  }

  /**
   * The between-levels break: called when the player leaves a won level (NEXT
   * or HOME on the win card), after the reveal and rewards are done. Resolves
   * when the player may continue — after the ad closes, or at once.
   *
   * Policy: a due slot is CONSUMED whether or not an ad shows (unavailable,
   * suppressed, disabled, failed): the next opportunity is 3 first clears
   * later — a missed ad never chases the player into the next level.
   */
  function postWinBreak(mode: PlayMode, context: { levelId?: number } = {}): Promise<PostWinBreak> {
    if (breakInFlight) return breakInFlight;
    if (!allowAds(mode)) return Promise.resolve('notDue');
    const suppressed = suppressInterstitial;
    // This post-level transition completes the suppression window.
    suppressInterstitial = false;
    const saved = store.get();
    const due = isInterstitialDue(saved);
    // Analytics context (M14): which level's exit, and the cadence count it closed.
    const props: Record<string, string | number | boolean> = {
      placement: 'INTERSTITIAL_CAMPAIGN',
      campaign_first_clears_since_last: saved.firstClearsSinceInterstitial,
      ...(context.levelId !== undefined ? { level: context.levelId } : {}),
    };
    const decision = decideInterstitial({
      due,
      suppressed,
      interstitialsEnabled: deps.policy().interstitialsEnabled,
      ready: ads.getState('INTERSTITIAL_CAMPAIGN') === 'ready',
    });
    if (decision === 'notDue') return Promise.resolve('notDue');
    ads.track('ad_interstitial_eligible', props);
    store.update(consumeInterstitialSlot);
    if (decision === 'skip') {
      ads.track('ad_interstitial_skipped', {
        ...props,
        reason: suppressed ? 'afterRewarded' : !deps.policy().interstitialsEnabled ? 'disabled' : 'notReady',
      });
      return Promise.resolve('skipped');
    }
    breakInFlight = ads.show('INTERSTITIAL_CAMPAIGN').then((res): PostWinBreak => {
      if (res.opened) {
        ads.track('ad_interstitial_shown', props);
        return 'shown';
      }
      ads.track('ad_interstitial_failed', { ...props, outcome: res.outcome });
      return 'skipped';
    }).finally(() => { breakInFlight = null; });
    return breakInFlight;
  }

  async function watchRewarded(
    mode: PlayMode,
    placement: 'REWARDED_RETRY' | 'REWARDED_HEART',
    onEarned: () => Promise<unknown> | void,
    context: Record<string, string | number | boolean> = {},
  ): Promise<boolean> {
    if (!allowAds(mode) || !deps.policy().rewardedEnabled) return false;
    const key = placement === 'REWARDED_RETRY' ? 'retry' : 'heart';
    const props = { placement, ...context };
    ads.track(`ad_rewarded_${key}_started`, props);
    const res = await ads.show(placement);
    if (res.opened) suppressInterstitial = true;
    if (res.rewarded) {
      await onEarned();
      ads.track(`ad_rewarded_${key}_earned`, props);
      return true;
    }
    ads.track(res.opened ? `ad_rewarded_${key}_closed_without_reward` : `ad_rewarded_${key}_failed`, { ...props, outcome: res.outcome });
    return false;
  }

  /**
   * Watch an ad for ONE free retry start of `levelId`. On the confirmed reward
   * the authorization is persisted (interruption-safe); the caller then starts
   * the retry through the heart gate, which consumes it (`takeRewardedRetry`).
   * The heart the loss cost is NOT refunded.
   */
  function watchRewardedRetry(mode: PlayMode, levelId: number): Promise<boolean> {
    return watchRewarded(mode, 'REWARDED_RETRY', () => {
      store.update((s) => grantRewardedRetry(s, levelId, deps.now()));
    }, { level: levelId });
  }

  /** Watch an ad for exactly +1 heart (capped; regen progress kept). */
  function watchRewardedHeart(mode: PlayMode): Promise<boolean> {
    return watchRewarded(mode, 'REWARDED_HEART', () => deps.grantHearts(1));
  }

  return {
    recordLevelClear,
    postWinBreak,
    watchRewardedRetry,
    watchRewardedHeart,
    /** Test/diagnostic view of the session suppression flag. */
    isInterstitialSuppressed: () => suppressInterstitial,
  };
}

export type AdFlows = ReturnType<typeof createAdFlows>;
