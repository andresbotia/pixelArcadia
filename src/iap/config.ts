/**
 * RevenueCat configuration (M13). Only PUBLIC SDK keys ever live in the app:
 *   iOS  `app1_…` (or legacy `appl_…`) · Android `goog_…` · Test Store `test_…`
 * A secret key (`sk_…`) is refused outright — it must never ship.
 *
 * `EXPO_PUBLIC_*` values are inlined at bundle time from LITERAL reads only.
 */

/** RevenueCat entitlement unlocked by the Remove Ads non-consumable. */
export const REMOVE_ADS_ENTITLEMENT = 'remove_ads';

export interface RevenueCatKeys {
  ios?: string;
  android?: string;
  /** RevenueCat Test Store key — dev builds only, never used in a release build. */
  testStore?: string;
}

export function readRevenueCatKeys(): RevenueCatKeys {
  return {
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    testStore: process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY,
  };
}

export interface ResolvedRevenueCatKey {
  key: string | null;
  mode: 'testStore' | 'store' | 'off';
  note?: string;
}

export type RevenueCatBuildMode = 'test' | 'store' | 'off';

/** Profile mode is inlined with the bundle; an absent release mode is safely off. */
export function readRevenueCatBuildMode(): RevenueCatBuildMode | undefined {
  const mode = process.env.EXPO_PUBLIC_REVENUECAT_MODE;
  return mode === 'test' || mode === 'store' || mode === 'off' ? mode : undefined;
}

const IOS_PUBLIC_PREFIXES = ['app1_', 'appl_'];

/** Pick the key for this build. Missing/invalid → `off` (purchases unavailable; the game is unaffected). */
export function resolveRevenueCatKey(input: {
  platform: string; isDev: boolean; keys: RevenueCatKeys; buildMode?: RevenueCatBuildMode;
}): ResolvedRevenueCatKey {
  const { platform, isDev, keys, buildMode } = input;
  if (platform !== 'ios' && platform !== 'android') return { key: null, mode: 'off', note: `purchases unsupported on ${platform}` };
  const all = [keys.ios, keys.android, keys.testStore].map((k) => k?.trim()).filter(Boolean) as string[];
  if (all.some((k) => k.startsWith('sk_'))) return { key: null, mode: 'off', note: 'a SECRET RevenueCat key was supplied — refused' };

  if (buildMode === 'off') return { key: null, mode: 'off', note: 'purchases disabled for this build' };
  const test = keys.testStore?.trim();
  if (isDev) {
    if (test?.startsWith('test_')) return { key: test, mode: 'testStore' };
    return { key: null, mode: 'off', note: 'no Test Store key configured for debug build' };
  }
  if (buildMode !== 'store') return { key: null, mode: 'off', note: 'release purchases require store build mode' };

  const key = (platform === 'ios' ? keys.ios : keys.android)?.trim();
  if (!key) return { key: null, mode: 'off', note: 'no RevenueCat public key configured' };
  const validPrefix = platform === 'ios'
    ? IOS_PUBLIC_PREFIXES.some(prefix => key.startsWith(prefix))
    : key.startsWith('goog_');
  if (!validPrefix) return { key: null, mode: 'off', note: `invalid RevenueCat ${platform} public key` };
  return { key, mode: 'store' };
}
