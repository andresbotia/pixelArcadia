import { INTERSTITIAL_EVERY_FIRST_CLEARS } from './config';

/**
 * Persisted ad POLICY state (never SDK state). Pure rules; `storage/ads`
 * persists the result.
 */
export interface AdsSaveState {
  /** Campaign first clears since the last interstitial opportunity (0..3). */
  firstClearsSinceInterstitial: number;
  /**
   * A confirmed rewarded-retry reward not yet used. Persisted so an
   * interruption between the reward and the retry never cheats the player out
   * of what they watched; consumed by the next start of that level.
   */
  pendingRewardedRetry: { levelId: number; earnedAt: number } | null;
}

export function createAdsSaveState(): AdsSaveState {
  return { firstClearsSinceInterstitial: 0, pendingRewardedRetry: null };
}

export function sanitizeAdsSaveState(raw: unknown): AdsSaveState {
  if (!raw || typeof raw !== 'object') return createAdsSaveState();
  const r = raw as Record<string, unknown>;
  const count = typeof r.firstClearsSinceInterstitial === 'number' && Number.isFinite(r.firstClearsSinceInterstitial)
    ? Math.min(INTERSTITIAL_EVERY_FIRST_CLEARS, Math.max(0, Math.floor(r.firstClearsSinceInterstitial)))
    : 0;
  const p = r.pendingRewardedRetry as Record<string, unknown> | null | undefined;
  const pending = p && typeof p === 'object' && typeof p.levelId === 'number' && Number.isInteger(p.levelId)
    && typeof p.earnedAt === 'number' && Number.isFinite(p.earnedAt)
    ? { levelId: p.levelId, earnedAt: p.earnedAt }
    : null;
  return { firstClearsSinceInterstitial: count, pendingRewardedRetry: pending };
}

/** A campaign FIRST clear happened. Saturates at the cadence, so a skipped window never builds a backlog. */
export function recordCampaignFirstClear(s: AdsSaveState): AdsSaveState {
  const next = Math.min(INTERSTITIAL_EVERY_FIRST_CLEARS, s.firstClearsSinceInterstitial + 1);
  return next === s.firstClearsSinceInterstitial ? s : { ...s, firstClearsSinceInterstitial: next };
}

export function isInterstitialDue(s: AdsSaveState): boolean {
  return s.firstClearsSinceInterstitial >= INTERSTITIAL_EVERY_FIRST_CLEARS;
}

/**
 * The opportunity was used — shown OR skipped. Either way the count restarts:
 * an ad that couldn't show is dropped, never carried to the next level.
 */
export function consumeInterstitialSlot(s: AdsSaveState): AdsSaveState {
  return s.firstClearsSinceInterstitial === 0 ? s : { ...s, firstClearsSinceInterstitial: 0 };
}

export type InterstitialDecision = 'notDue' | 'show' | 'skip';

/** At a post-win transition: show, skip (and consume) or do nothing. */
export function decideInterstitial(input: {
  due: boolean;
  /** A rewarded ad was watched since the last post-win transition. */
  suppressed: boolean;
  interstitialsEnabled: boolean;
  ready: boolean;
}): InterstitialDecision {
  if (!input.due) return 'notDue';
  if (input.suppressed || !input.interstitialsEnabled || !input.ready) return 'skip';
  return 'show';
}

/** One confirmed rewarded-retry reward for `levelId` (replaces any older unused one). */
export function grantRewardedRetry(s: AdsSaveState, levelId: number, now: number): AdsSaveState {
  return { ...s, pendingRewardedRetry: { levelId, earnedAt: now } };
}

/** Use the pending retry for `levelId`, if there is one. Exactly once. */
export function consumeRewardedRetry(s: AdsSaveState, levelId: number): { state: AdsSaveState; consumed: boolean } {
  if (s.pendingRewardedRetry?.levelId !== levelId) return { state: s, consumed: false };
  return { state: { ...s, pendingRewardedRetry: null }, consumed: true };
}
