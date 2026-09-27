import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  createHeartState,
  grantHeart,
  reconcileHeartState,
  sanitizeHeartState,
  spendHeart,
  type HeartState,
  type SpendResult,
} from '@/game/hearts/state';

const STORAGE_KEY = 'orbitide/hearts/v1';

/**
 * The saved hearts. Same shape as `storage/economy`: one in-memory cache,
 * every write serialized through one queue, listeners notified on change.
 * All rules live in `game/hearts/state` — this module only loads, reconciles
 * against the clock, and persists when the state actually changed.
 */

type HeartsListener = (state: HeartState) => void;
const listeners = new Set<HeartsListener>();

let cachedState: HeartState | null = null;
let mutationQueue: Promise<unknown> = Promise.resolve();
let clock: () => number = () => Date.now();

export function subscribeHearts(listener: HeartsListener): () => void {
  listeners.add(listener);
  if (cachedState) listener(cachedState);
  return () => {
    listeners.delete(listener);
  };
}

function notify(state: HeartState): void {
  for (const listener of listeners) {
    try {
      listener(state);
    } catch {
      // A listener error must never break a save.
    }
  }
}

/** Synchronous read of the loaded state reconciled to now; `null` before the first load. */
export function peekHearts(): HeartState | null {
  return cachedState ? reconcileHeartState(cachedState, clock()) : null;
}

async function readStored(now: number): Promise<HeartState> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? sanitizeHeartState(JSON.parse(stored), now) : createHeartState();
  } catch {
    return createHeartState();
  }
}

async function persist(state: HeartState): Promise<void> {
  cachedState = state;
  notify(state);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Non-fatal: the in-memory state still holds for this session.
  }
}

function queueMutation<T>(mutator: (current: HeartState, now: number) => { next: HeartState; result: T }): Promise<T> {
  const op = mutationQueue.then(async () => {
    const now = clock();
    const current = cachedState ?? (cachedState = await readStored(now));
    const { next, result } = mutator(current, now);
    if (next !== current) await persist(next);
    return result;
  });
  mutationQueue = op.catch(() => {});
  return op;
}

/**
 * Load (first call) and reconcile against the clock, persisting only when
 * hearts regenerated or the state needed repair. Safe to call from any number
 * of screens: reconciliation is idempotent and serialized.
 */
export function refreshHearts(): Promise<HeartState> {
  return queueMutation((current, now) => {
    const next = reconcileHeartState(current, now);
    return { next, result: next };
  });
}

/** Alias kept parallel to `loadEconomy` / `loadProgress` for boot preloading. */
export const loadHearts = refreshHearts;

/**
 * Charge one heart for a failed campaign run. `runId` makes it idempotent:
 * the same run can report its loss any number of times and costs one heart.
 */
export function spendHeartForLoss(runId: string): Promise<SpendResult> {
  return queueMutation((current, now) => {
    const res = spendHeart(current, now, runId);
    return { next: res.state, result: res };
  });
}

/** Add hearts outside regeneration. Not wired to any player action yet (M12 rewarded ads). */
export function grantHearts(count = 1): Promise<HeartState> {
  return queueMutation((current, now) => {
    const next = grantHeart(current, now, count);
    return { next, result: next };
  });
}

/** DEV-ONLY tooling: force a heart count (the Level Browser's save tools). */
export function _devSetHearts(hearts: number): Promise<HeartState> {
  return queueMutation((current, now) => {
    const next = sanitizeHeartState({ ...current, hearts, lastHeartRegenAt: now }, now);
    return { next, result: next };
  });
}

/** Test helpers. */
export function _clearHeartsCache(): void {
  cachedState = null;
  mutationQueue = Promise.resolve();
  listeners.clear();
}

export function _setHeartsClock(next: () => number): void {
  clock = next;
}
