import { HEART_REGEN_MS, MAX_HEARTS, STARTING_HEARTS } from './config';

/**
 * Persisted hearts. Regeneration is derived from timestamps, never from a
 * running timer: whoever loads or refreshes the state calls
 * {@link reconcileHeartState} with the current time and gets the hearts that
 * accrued while the app was closed.
 *
 * Pure — every function takes `now` explicitly, so the rules are testable
 * without a clock.
 */
export interface HeartState {
  /** 0..MAX_HEARTS, always an integer. */
  hearts: number;
  /**
   * Start (epoch ms) of the regen interval currently running: the next heart
   * lands at `lastHeartRegenAt + HEART_REGEN_MS`. `null` exactly when full —
   * a full bar has no timer.
   */
  lastHeartRegenAt: number | null;
  /**
   * Run id of the most recently charged loss. A second charge for the same
   * run is refused, so a loss reported twice can never cost two hearts.
   */
  lastLossRunId: string | null;
}

export function createHeartState(): HeartState {
  return { hearts: STARTING_HEARTS, lastHeartRegenAt: null, lastLossRunId: null };
}

function isTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

/**
 * Repair anything loaded from storage into a state the rules can trust:
 * integer hearts clamped to 0..MAX, no timer while full, and a running timer
 * (anchored at `now`) whenever below full but the anchor is missing/garbage.
 * A future anchor is left for {@link reconcileHeartState} to clamp.
 */
export function sanitizeHeartState(raw: unknown, now: number): HeartState {
  if (!raw || typeof raw !== 'object') return createHeartState();
  const r = raw as Record<string, unknown>;

  const hearts = typeof r.hearts === 'number' && Number.isFinite(r.hearts)
    ? Math.min(MAX_HEARTS, Math.max(0, Math.floor(r.hearts)))
    : STARTING_HEARTS;
  const lastLossRunId = typeof r.lastLossRunId === 'string' ? r.lastLossRunId : null;

  if (hearts >= MAX_HEARTS) return { hearts, lastHeartRegenAt: null, lastLossRunId };
  const lastHeartRegenAt = isTimestamp(r.lastHeartRegenAt) ? r.lastHeartRegenAt : now;
  return { hearts, lastHeartRegenAt, lastLossRunId };
}

/**
 * Grant every heart that fully regenerated between the anchor and `now`.
 *
 *  1. elapsed = now − anchor
 *  2. whole intervals = floor(elapsed / HEART_REGEN_MS)
 *  3. hearts += intervals, capped at MAX_HEARTS
 *  4. full → timer cleared; otherwise the anchor advances by exactly the
 *     intervals granted, so partial progress toward the next heart is kept
 *
 * Returns the SAME object when nothing changed, so callers can persist only on
 * `next !== current` and repeated reconciles can never double-grant.
 *
 * Clock defence: an anchor in the future (device clock moved back, or a
 * malformed save) restarts the interval at `now` — never a negative elapsed,
 * never a burst of free hearts.
 */
export function reconcileHeartState(state: HeartState, now: number): HeartState {
  if (!Number.isFinite(now)) return state;

  if (state.hearts >= MAX_HEARTS) {
    return state.hearts === MAX_HEARTS && state.lastHeartRegenAt === null
      ? state
      : { ...state, hearts: MAX_HEARTS, lastHeartRegenAt: null };
  }

  const anchor = state.lastHeartRegenAt;
  if (!isTimestamp(anchor) || anchor > now) return { ...state, lastHeartRegenAt: now };

  const intervals = Math.floor((now - anchor) / HEART_REGEN_MS);
  if (intervals <= 0) return state;

  const hearts = Math.min(MAX_HEARTS, Math.max(0, state.hearts) + intervals);
  if (hearts >= MAX_HEARTS) return { ...state, hearts: MAX_HEARTS, lastHeartRegenAt: null };
  return { ...state, hearts, lastHeartRegenAt: anchor + intervals * HEART_REGEN_MS };
}

/** Epoch ms the next heart lands, or `null` when full. */
export function nextHeartAt(state: HeartState): number | null {
  if (state.hearts >= MAX_HEARTS || state.lastHeartRegenAt === null) return null;
  return state.lastHeartRegenAt + HEART_REGEN_MS;
}

/** Ms until the NEXT heart (0..HEART_REGEN_MS), or `null` when full. */
export function timeUntilNextHeart(state: HeartState, now: number): number | null {
  const at = nextHeartAt(state);
  if (at === null) return null;
  return Math.min(HEART_REGEN_MS, Math.max(0, at - now));
}

export type SpendRefusal = 'empty' | 'duplicate';

export interface SpendResult {
  state: HeartState;
  spent: boolean;
  refusal?: SpendRefusal;
}

/**
 * Spend one heart (a campaign loss). Reconciles first so a heart that already
 * regenerated is counted. Spending from full starts the timer at `now`;
 * spending while the timer already runs leaves it alone, so the next heart
 * isn't pushed back. Passing the run's id makes the charge idempotent per run.
 */
export function spendHeart(state: HeartState, now: number, runId?: string): SpendResult {
  const current = reconcileHeartState(state, now);
  if (runId !== undefined && runId === current.lastLossRunId) {
    return { state: current, spent: false, refusal: 'duplicate' };
  }
  if (current.hearts <= 0) return { state: current, spent: false, refusal: 'empty' };

  return {
    state: {
      hearts: current.hearts - 1,
      lastHeartRegenAt: current.hearts >= MAX_HEARTS ? now : current.lastHeartRegenAt,
      lastLossRunId: runId ?? current.lastLossRunId,
    },
    spent: true,
  };
}

/**
 * Add hearts outside regeneration (future: rewarded ad / purchase). Capped at
 * MAX_HEARTS; reaching full clears the timer, otherwise the running interval
 * keeps its progress.
 */
export function grantHeart(state: HeartState, now: number, count = 1): HeartState {
  const current = reconcileHeartState(state, now);
  const add = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  if (add === 0) return current;
  const hearts = Math.min(MAX_HEARTS, current.hearts + add);
  if (hearts === current.hearts) return current;
  return hearts >= MAX_HEARTS
    ? { ...current, hearts, lastHeartRegenAt: null }
    : { ...current, hearts };
}

/** `MM:SS` for the next-heart countdown. Rounds up, so it never reads 00:00 early. */
export function formatHeartCountdown(ms: number): string {
  const total = Number.isFinite(ms) ? Math.max(0, Math.ceil(ms / 1000)) : 0;
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}
