import AsyncStorage from '@react-native-async-storage/async-storage';

import { consumeRewardedRetry, createAdsSaveState, sanitizeAdsSaveState, type AdsSaveState } from '@/ads/cadence';

const STORAGE_KEY = 'orbitide/ads/v1';

/**
 * Saved ad POLICY state (cadence count + a pending rewarded retry) — never SDK
 * state. The in-memory copy is authoritative and read synchronously (the heart
 * gate decides at tap time); every change is written through in order.
 */
let cached: AdsSaveState | null = null;
let writeQueue: Promise<unknown> = Promise.resolve();

export interface AdsStore {
  get(): AdsSaveState;
  update(mutator: (s: AdsSaveState) => AdsSaveState): AdsSaveState;
}

/** Boot preload. Never rejects. */
export async function loadAdsState(): Promise<AdsSaveState> {
  if (cached) return cached;
  let loaded: AdsSaveState;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    loaded = raw ? sanitizeAdsSaveState(JSON.parse(raw)) : createAdsSaveState();
  } catch {
    loaded = createAdsSaveState();
  }
  // A write that raced the load (mutations before boot finished) wins.
  cached ??= loaded;
  return cached;
}

export const adsStore: AdsStore = {
  get() {
    return cached ?? createAdsSaveState();
  },
  update(mutator) {
    const current = cached ?? createAdsSaveState();
    const next = mutator(current);
    if (next === current) return current;
    cached = next;
    const snapshot = JSON.stringify(next);
    writeQueue = writeQueue.then(() => AsyncStorage.setItem(STORAGE_KEY, snapshot)).catch(() => {});
    return next;
  },
};

/**
 * Use the pending rewarded retry for `levelId`, if any — true exactly once per
 * reward. The heart gate calls this on every campaign start of that level.
 */
export function takeRewardedRetry(levelId: number): boolean {
  let consumed = false;
  adsStore.update((s) => {
    const r = consumeRewardedRetry(s, levelId);
    consumed = r.consumed;
    return r.state;
  });
  return consumed;
}

/** Test helpers. */
export function _resetAdsStore(): void {
  cached = null;
  writeQueue = Promise.resolve();
}

export function _flushAdsWrites(): Promise<unknown> {
  return writeQueue;
}
