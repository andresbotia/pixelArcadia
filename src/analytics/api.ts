import type { AnalyticsStore } from '@/storage/analytics';

import { EVENTS, type AnalyticsEventName, type AnalyticsProps } from './events';
import { durationSeconds, evaluateContentCeiling, highestCompletedLevel, levelsRemaining } from './progression';

/** The only thing that talks to PostHog. Faked in tests. */
export interface AnalyticsClient {
  capture(event: string, properties: AnalyticsProps): void;
  register(properties: AnalyticsProps): void;
  setPersonProperties(properties: AnalyticsProps): void;
}

export interface AnalyticsDeps {
  /** null → analytics off: every call is a safe no-op (still dev-logged). */
  client: AnalyticsClient | null;
  store: AnalyticsStore;
  now: () => number;
  publishedMax: number;
  log?: (message: string) => void;
}

export type ItemKey = 'undo' | 'extraSlot' | 'bomb';
const ITEM_NAME: Record<ItemKey, string> = { undo: 'undo', extraSlot: 'extra_slot', bomb: 'bomb' };

export type FailureReason = 'holding_overflow' | 'no_moves' | 'other';
export type RetryType = 'normal' | 'rewarded_ad';
export type OutOfHeartsSource = 'home_play' | 'world_levels' | 'retry' | 'other';

export interface RunStartInput {
  levelId: number;
  world: number;
  worldTitle: string;
  difficulty: string;
  /** Already cleared before this run (the economy's first-clear record). */
  isReplay: boolean;
  hearts: number;
  coins: number;
  inventory: Record<ItemKey, number>;
}

export interface RunHandle {
  readonly attempt: number;
  /** 'won' | 'lost' once the run ended, else null. */
  readonly result: 'won' | 'lost' | null;
  itemUsed(item: ItemKey, remaining: number): void;
  observeHolding(count: number): void;
  relaunched(): void;
  fastForward(state: { activeCount: number; holdingCount: number }): void;
  won(r: { isFirstClear: boolean; firstClearReward: number; heartsAfter: number | null; coinsAfter: number }): void;
  lost(r: { reason: FailureReason; heartsBefore: number | null; heartsAfter: number | null; coins: number; pendingCount: number }): void;
  /** Intentional exit (Home button / back navigation) before a result. No-op once ended. */
  abandon(): void;
}

/**
 * From a heart-spend result (`storage/hearts.spendHeartForLoss`): whether a
 * `heart_spent` event is due, and the before/after counts for `level_failed`.
 * A duplicate loss report or an empty bar is `spent: false` → no event.
 */
export function heartLossFigures(res: { spent: boolean; state: { hearts: number } }): { emitSpent: boolean; before: number; after: number } {
  return { emitSpent: res.spent, before: res.state.hearts + (res.spent ? 1 : 0), after: res.state.hearts };
}

const NOOP_RUN: RunHandle = {
  attempt: 0, result: null,
  itemUsed() {}, observeHolding() {}, relaunched() {}, fastForward() {}, won() {}, lost() {}, abandon() {},
};

/**
 * Semantic analytics for Pixel Arcadia. Every method is synchronous, cheap
 * and never throws — analytics can never block or break a game, purchase,
 * heart or ad flow. Once-guards live here (per run, per session, per
 * published max), so re-renders and repeated callbacks can't duplicate events.
 */
export function createAnalytics(deps: AnalyticsDeps) {
  const { store, now, publishedMax } = deps;
  let appOpenedSent = false;
  let highestRegistered: number | null = null;

  /**
   * Highest PUBLISHED level completed. Raw progress (and this store's history)
   * may run past the published ceiling — legacy/tester saves — but live
   * progression and the content ceiling only ever count published content.
   */
  const publishedCompleted = (highestUnlocked: number) =>
    Math.min(publishedMax, highestCompletedLevel(highestUnlocked, store.get().highestCompletedSeen));

  function log(message: string): void {
    try { deps.log?.(message); } catch { /* diagnostics are best-effort too */ }
  }

  function capture(event: AnalyticsEventName, props: AnalyticsProps = {}): void {
    try {
      log(`[analytics] ${event} ${JSON.stringify(props)}`);
      deps.client?.capture(event, props);
    } catch {
      log('[analytics] capture failed');
    }
  }

  function register(props: AnalyticsProps): void {
    try { deps.client?.register(props); } catch { /* never surfaces */ }
  }

  /** Person properties, sent only when a value actually changed. */
  function setPerson(props: Record<string, string | number | boolean>): void {
    try {
      const prev = store.get().personProps;
      const changed: Record<string, string | number | boolean> = {};
      for (const [k, v] of Object.entries(props)) if (prev[k] !== v) changed[k] = v;
      if (!Object.keys(changed).length) return;
      store.update((s) => ({ ...s, personProps: { ...s.personProps, ...changed } }));
      deps.client?.setPersonProperties(changed);
    } catch { /* never surfaces */ }
  }

  /** Once per cold start. */
  function appOpened(p: { highestUnlocked: number; coins: number; hearts: number | null; removeAdsOwned: boolean }): void {
    if (appOpenedSent) return;
    appOpenedSent = true;
    capture('app_opened', {
      highest_level: publishedCompleted(p.highestUnlocked),
      published_max_level: publishedMax,
      coins: p.coins,
      hearts: p.hearts,
      remove_ads_owned: p.removeAdsOwned,
    });
  }

  /**
   * Saved progress changed (launch, or a campaign win). Keeps
   * `current_highest_level` / person properties current and fires the content
   * ceiling alert once per published max.
   */
  function progressUpdated(highestUnlocked: number): void {
    try {
      const highestCompleted = publishedCompleted(highestUnlocked);
      if (highestRegistered !== highestCompleted) {
        highestRegistered = highestCompleted;
        register({ current_highest_level: highestCompleted });
      }
      setPerson({
        highest_level_completed: highestCompleted,
        highest_level_reached: Math.min(publishedMax, Math.max(highestCompleted, Math.floor(highestUnlocked))),
        published_max_level: publishedMax,
      });
      const ceiling = evaluateContentCeiling({ highestCompleted, publishedMax, alertedFor: store.get().ceilingAlertedFor });
      if (ceiling) {
        store.update((s) => ({ ...s, ceilingAlertedFor: [...s.ceilingAlertedFor, publishedMax] }));
        capture(EVENTS.contentCeilingApproaching, {
          highest_level_completed: highestCompleted,
          published_max_level: publishedMax,
          levels_remaining: ceiling.levelsRemaining,
          threshold: ceiling.threshold,
        });
      }
    } catch { /* never surfaces */ }
  }

  function setRemoveAdsOwned(owned: boolean): void {
    setPerson({ remove_ads_owned: owned });
  }

  /** A campaign run begins (mount, retry, or next level). Dev play is never tracked. */
  function startRun(
    mode: 'campaign' | 'dev',
    input: RunStartInput,
    retry?: { type: RetryType; previous: RunHandle | null },
  ): RunHandle {
    if (mode !== 'campaign') return NOOP_RUN;
    try {
      if (retry) {
        capture(EVENTS.levelRetried, {
          level: input.levelId,
          previous_result: retry.previous?.result ?? 'in_progress',
          retry_type: retry.type,
        });
      }
      const key = String(input.levelId);
      const attempt = (store.get().attempts[key] ?? 0) + 1;
      store.update((s) => ({ ...s, attempts: { ...s.attempts, [key]: attempt } }));
      return createRun(input, attempt);
    } catch {
      return NOOP_RUN;
    }
  }

  function createRun(input: RunStartInput, attempt: number): RunHandle {
    const startedAt = now();
    const used: Record<ItemKey, number> = { undo: 0, extraSlot: 0, bomb: 0 };
    let peakHolding = 0;
    let relaunches = 0;
    let fastForwarded = false;
    let result: 'won' | 'lost' | 'abandoned' | null = null;
    const base = (): AnalyticsProps => ({
      level: input.levelId,
      world: input.world,
      difficulty: input.difficulty,
      attempt_number: attempt,
      play_mode: 'campaign',
      published_max_level: publishedMax,
    });
    const itemsUsed = () => used.undo + used.extraSlot + used.bomb;

    capture(EVENTS.levelStarted, {
      ...base(),
      world_title: input.worldTitle,
      is_replay: input.isReplay,
      hearts_before: input.hearts,
      coins_before: input.coins,
      inventory_undo: input.inventory.undo,
      inventory_extra_slot: input.inventory.extraSlot,
      inventory_bomb: input.inventory.bomb,
    });

    return {
      attempt,
      get result() { return result === 'won' || result === 'lost' ? result : null; },
      itemUsed(item, remaining) {
        if (result) return;
        used[item] += 1;
        capture(EVENTS.itemUsed, { level: input.levelId, item: ITEM_NAME[item], remaining_inventory: Math.max(0, remaining), attempt_number: attempt });
      },
      observeHolding(count) {
        if (count > peakHolding) peakHolding = count;
      },
      relaunched() {
        if (!result) relaunches += 1;
      },
      fastForward(state) {
        if (fastForwarded || result) return;
        fastForwarded = true;
        capture(EVENTS.endgameFastForwardStarted, {
          level: input.levelId,
          attempt_number: attempt,
          active_count: state.activeCount,
          holding_count: state.holdingCount,
          time_since_level_start_seconds: durationSeconds(startedAt, now()),
        });
      },
      won(r) {
        if (result) return;
        result = 'won';
        store.update((s) => (input.levelId > s.highestCompletedSeen ? { ...s, highestCompletedSeen: input.levelId } : s));
        capture(EVENTS.levelCompleted, {
          ...base(),
          duration_seconds: durationSeconds(startedAt, now()),
          is_first_clear: r.isFirstClear,
          first_clear_reward_coins: r.isFirstClear ? r.firstClearReward : 0,
          hearts_after: r.heartsAfter,
          coins_before: input.coins,
          coins_after: r.coinsAfter,
          items_used_total: itemsUsed(),
          undo_used: used.undo,
          extra_slot_used: used.extraSlot,
          bomb_used: used.bomb,
          peak_holding: peakHolding,
          relaunch_count: relaunches,
          fast_forward_used: fastForwarded,
          levels_remaining: levelsRemaining(Math.min(publishedMax, Math.max(input.levelId, store.get().highestCompletedSeen)), publishedMax),
        });
      },
      lost(r) {
        if (result) return;
        result = 'lost';
        capture(EVENTS.levelFailed, {
          ...base(),
          duration_seconds: durationSeconds(startedAt, now()),
          failure_reason: r.reason,
          hearts_before_loss: r.heartsBefore,
          hearts_after_loss: r.heartsAfter,
          coins: r.coins,
          undo_used: used.undo,
          extra_slot_used: used.extraSlot,
          bomb_used: used.bomb,
          peak_holding: peakHolding,
          pending_count: r.pendingCount,
        });
      },
      abandon() {
        if (result) return;
        result = 'abandoned';
        capture(EVENTS.levelAbandoned, {
          level: input.levelId,
          attempt_number: attempt,
          elapsed_seconds: durationSeconds(startedAt, now()),
          items_used: itemsUsed(),
          peak_holding: peakHolding,
        });
      },
    };
  }

  function heartSpent(p: { levelId: number; heartsAfter: number }): void {
    capture(EVENTS.heartSpent, { reason: 'level_loss', level: p.levelId, hearts_after: p.heartsAfter });
  }

  function heartRegenerated(p: { amount: number; heartsAfter: number; offlineElapsedMinutes: number | null }): void {
    if (p.amount <= 0) return;
    capture(EVENTS.heartRegenerated, { amount: p.amount, hearts_after: p.heartsAfter, offline_elapsed_minutes: p.offlineElapsedMinutes });
  }

  function outOfHeartsViewed(source: OutOfHeartsSource, hearts: number): void {
    capture(EVENTS.outOfHeartsViewed, { source, hearts });
  }

  /** M12 ad boundary. A confirmed heart reward also records `heart_rewarded`. */
  function trackAd(event: AnalyticsEventName, props: AnalyticsProps = {}): void {
    capture(event, props);
    if (event === 'ad_rewarded_heart_earned') capture(EVENTS.heartRewarded, { source: 'rewarded_ad', amount: 1 });
  }

  /** M13 purchase boundary. Remove Ads ownership also becomes a person property. */
  function trackIap(event: AnalyticsEventName, props: AnalyticsProps = {}): void {
    capture(event, props);
    if (event === 'remove_ads_activated') setRemoveAdsOwned(true);
  }

  return {
    register, capture, appOpened, progressUpdated, setRemoveAdsOwned,
    startRun, heartSpent, heartRegenerated, outOfHeartsViewed, trackAd, trackIap,
  };
}

export type Analytics = ReturnType<typeof createAnalytics>;
