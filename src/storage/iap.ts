import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'orbitide/iap/v1';

/**
 * Local cache of the Remove Ads entitlement. RevenueCat is the source of
 * truth; this only lets a launch (even offline, before RevenueCat answers)
 * start with the right ads policy. Consumables are never tracked here — their
 * ledger lives inside the economy save.
 */
let cachedRemoveAds = false;
let writeQueue: Promise<unknown> = Promise.resolve();

export async function loadIapCache(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as { hasRemoveAds?: unknown }) : null;
    cachedRemoveAds = parsed?.hasRemoveAds === true;
  } catch {
    cachedRemoveAds = false;
  }
  return cachedRemoveAds;
}

export function getCachedRemoveAds(): boolean {
  return cachedRemoveAds;
}

export function saveRemoveAds(owned: boolean): void {
  cachedRemoveAds = owned;
  const snapshot = JSON.stringify({ hasRemoveAds: owned });
  writeQueue = writeQueue.then(() => AsyncStorage.setItem(STORAGE_KEY, snapshot)).catch(() => {});
}

/** Test helpers. */
export function _resetIapCache(): void {
  cachedRemoveAds = false;
  writeQueue = Promise.resolve();
}
export function _flushIapWrites(): Promise<unknown> {
  return writeQueue;
}
