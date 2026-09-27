import type { AdPlacement } from './types';

/**
 * AdMob configuration (M12). Two different kinds of id — never mix them up:
 *
 *  - APP ID (`ca-app-pub-XXXX~YYYY`, tilde): identifies the app. Baked into the
 *    native Info.plist / AndroidManifest at PREBUILD by the
 *    `react-native-google-mobile-ads` plugin entry in `app.json`. The native SDK
 *    crashes at launch without it. Not read by JS except as a safety check.
 *  - AD UNIT IDs (`ca-app-pub-XXXX/ZZZZ`, slash): one per placement, chosen at
 *    RUNTIME here.
 *
 * Test ads are guaranteed by the UNIT ids: any dev build (`__DEV__`), or a
 * build with EXPO_PUBLIC_ADS_TEST_MODE=1, only ever requests Google's official
 * test units — even if production unit ids are present in the environment.
 * A release build uses production units only when they are configured; a
 * missing/malformed one turns that placement off (the game runs without it),
 * it never falls back to live-looking test ads in production.
 */

/** Google's published test ad units (identical to the library's `TestIds`). */
export const GOOGLE_TEST_UNIT_IDS = {
  ios: {
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
  },
  android: {
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
  },
} as const;

/** Google's published sample APP ids (what `app.json` carries until the real AdMob app exists). */
export const GOOGLE_SAMPLE_APP_IDS = {
  ios: 'ca-app-pub-3940256099942544~1458002511',
  android: 'ca-app-pub-3940256099942544~3347511713',
} as const;

export type AdsPlatform = 'ios' | 'android';
export type ProductionUnitIds = Record<AdsPlatform, Partial<Record<AdPlacement, string>>>;

/**
 * Production unit ids from EAS / `.env` (`EXPO_PUBLIC_*` is inlined at bundle
 * time, and only for LITERAL `process.env.X` reads — keep these spelled out).
 */
export function readProductionUnitIds(): ProductionUnitIds {
  return {
    ios: {
      INTERSTITIAL_CAMPAIGN: process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID,
      REWARDED_RETRY: process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_RETRY_ID,
      REWARDED_HEART: process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_HEART_ID,
    },
    android: {
      INTERSTITIAL_CAMPAIGN: process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID,
      REWARDED_RETRY: process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_RETRY_ID,
      REWARDED_HEART: process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_HEART_ID,
    },
  };
}

/** `EXPO_PUBLIC_ADS_TEST_MODE=1` pins test units in a release build (e.g. TestFlight/preview). */
export function readForceTestMode(): boolean {
  return process.env.EXPO_PUBLIC_ADS_TEST_MODE === '1';
}

const UNIT_ID = /^ca-app-pub-\d{16}\/\d{10}$/;
const APP_ID = /^ca-app-pub-\d{16}~\d{10}$/;

export type AdsMode = 'test' | 'live' | 'off';

export interface ResolvedAdUnits {
  mode: AdsMode;
  /** `null` → that placement is unavailable. */
  units: Record<AdPlacement, string | null>;
  /** Why ads (or a placement) are off — dev diagnostics only. */
  notes: string[];
}

const NONE: Record<AdPlacement, string | null> = { INTERSTITIAL_CAMPAIGN: null, REWARDED_RETRY: null, REWARDED_HEART: null };

/**
 * Pick the unit id for every placement. Pure — the caller supplies platform,
 * build flavour, env ids and the native app id.
 */
export function resolveAdUnits(input: {
  platform: string;
  isDev: boolean;
  forceTest: boolean;
  production: ProductionUnitIds;
  /** The app id the native build was configured with (from the plugin config). */
  appId: string | undefined;
}): ResolvedAdUnits {
  const { platform } = input;
  if (platform !== 'ios' && platform !== 'android') {
    return { mode: 'off', units: { ...NONE }, notes: [`ads unsupported on ${platform}`] };
  }
  if (input.isDev || input.forceTest) {
    const t = GOOGLE_TEST_UNIT_IDS[platform];
    return {
      mode: 'test',
      units: { INTERSTITIAL_CAMPAIGN: t.interstitial, REWARDED_RETRY: t.rewarded, REWARDED_HEART: t.rewarded },
      notes: [],
    };
  }
  // Live. Real unit ids against Google's SAMPLE app id can never serve — the
  // build was cut without the real AdMob app id. Fail safe: ads off. (An app id
  // we can't read at all — Expo may stop embedding `plugins` in the public
  // config — is not treated as misconfigured; the unit ids decide.)
  if (input.appId !== undefined && (!APP_ID.test(input.appId) || input.appId === GOOGLE_SAMPLE_APP_IDS[platform])) {
    return { mode: 'off', units: { ...NONE }, notes: ['release build without a real AdMob app id — ads off'] };
  }
  const ids = input.production[platform];
  const notes: string[] = [];
  const units = { ...NONE };
  for (const placement of Object.keys(NONE) as AdPlacement[]) {
    const id = ids[placement]?.trim();
    if (id && UNIT_ID.test(id)) units[placement] = id;
    else notes.push(`${placement}: no valid production unit id — placement off`);
  }
  return { mode: Object.values(units).some(Boolean) ? 'live' : 'off', units, notes };
}

/**
 * Request privacy. There is no consent layer yet (UMP is planned as M12.1),
 * so every request is NON-PERSONALIZED. When consent lands, this becomes the
 * one place that reads it.
 */
export function adRequestOptions(): { nonPersonalized: boolean } {
  return { nonPersonalized: true };
}

/** First load retry after a failed load; doubles per failure up to the cap. */
export const AD_RETRY_BASE_MS = 15_000;
export const AD_RETRY_MAX_MS = 5 * 60_000;
/** A load that reports neither loaded nor error by now is treated as failed. */
export const AD_LOAD_TIMEOUT_MS = 30_000;
/** `show()` must produce an OPENED event within this, or it counts as failed. */
export const AD_OPEN_TIMEOUT_MS = 5_000;
/**
 * After a rewarded ad CLOSES, wait this long for a late EARNED_REWARD before
 * deciding "no reward". Reward is still only ever granted on that event.
 */
export const REWARD_GRACE_MS = 500;
/** Interstitial cadence: one opportunity per this many campaign FIRST CLEARS. */
export const INTERSTITIAL_EVERY_FIRST_CLEARS = 3;
