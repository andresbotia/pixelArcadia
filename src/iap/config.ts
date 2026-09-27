/**
 * RevenueCat configuration (M13). Only PUBLIC SDK keys ever live in the app:
 *   iOS  `appl_…` · Android `goog_…` · RevenueCat Test Store `test_…`
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

const PREFIX = { ios: 'appl_', android: 'goog_' } as const;

/** Pick the key for this build. Missing/invalid → `off` (purchases unavailable; the game is unaffected). */
export function resolveRevenueCatKey(input: { platform: string; isDev: boolean; keys: RevenueCatKeys }): ResolvedRevenueCatKey {
  const { platform, isDev, keys } = input;
  if (platform !== 'ios' && platform !== 'android') return { key: null, mode: 'off', note: `purchases unsupported on ${platform}` };
  const all = [keys.ios, keys.android, keys.testStore].map((k) => k?.trim()).filter(Boolean) as string[];
  if (all.some((k) => k.startsWith('sk_'))) return { key: null, mode: 'off', note: 'a SECRET RevenueCat key was supplied — refused' };

  const test = keys.testStore?.trim();
  if (isDev && test?.startsWith('test_')) return { key: test, mode: 'testStore' };

  const key = (platform === 'ios' ? keys.ios : keys.android)?.trim();
  if (!key) return { key: null, mode: 'off', note: 'no RevenueCat public key configured' };
  if (!key.startsWith(PREFIX[platform])) return { key: null, mode: 'off', note: `RevenueCat ${platform} key must start with ${PREFIX[platform]}` };
  return { key, mode: 'store' };
}
