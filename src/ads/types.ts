/**
 * Pixel Arcadia ad layer (M12) — shared types. Pure: no native imports.
 *
 * The app talks in PLACEMENTS (why an ad is shown), never in SDK objects.
 * Only `src/ads/sdk.ts` touches `react-native-google-mobile-ads`.
 */

/** Logical placements. Each has its own ad unit and its own ad instance. */
export type AdPlacement = 'INTERSTITIAL_CAMPAIGN' | 'REWARDED_RETRY' | 'REWARDED_HEART';

export const AD_PLACEMENTS: readonly AdPlacement[] = ['INTERSTITIAL_CAMPAIGN', 'REWARDED_RETRY', 'REWARDED_HEART'];

export type AdFormat = 'interstitial' | 'rewarded';

export const PLACEMENT_FORMAT: Readonly<Record<AdPlacement, AdFormat>> = {
  INTERSTITIAL_CAMPAIGN: 'interstitial',
  REWARDED_RETRY: 'rewarded',
  REWARDED_HEART: 'rewarded',
};

/**
 * Per-placement load state — the only ad state the UI ever sees.
 *  - idle: nothing loaded (about to load)
 *  - loading: request in flight
 *  - ready: loaded, can show now
 *  - showing: full-screen ad on screen
 *  - unavailable: ads off for this placement (SDK failed / no unit id / unsupported platform)
 *  - error: last load failed; a retry is scheduled
 */
export type AdLoadState = 'idle' | 'loading' | 'ready' | 'showing' | 'unavailable' | 'error';

export interface ShowResult {
  /**
   * closed: the ad opened and was dismissed. failed: it never opened (show
   * threw, errored, or timed out). unavailable: not ready / ads off. busy:
   * another ad is already showing.
   */
  outcome: 'closed' | 'failed' | 'unavailable' | 'busy';
  opened: boolean;
  /** The SDK's confirmed reward event fired (rewarded formats only). Never inferred from close. */
  rewarded: boolean;
}

/**
 * Monetization policy. M13 "Remove Ads" flips `interstitialsEnabled` off;
 * rewarded ads stay on — they are voluntary exchanges.
 */
export interface AdsPolicy {
  interstitialsEnabled: boolean;
  rewardedEnabled: boolean;
}

export const DEFAULT_ADS_POLICY: AdsPolicy = { interstitialsEnabled: true, rewardedEnabled: true };

/** Semantic ad events — the M14 PostHog vocabulary. Logged in dev only for now. */
export type AdAnalyticsEvent =
  | 'ad_interstitial_eligible'
  | 'ad_interstitial_shown'
  | 'ad_interstitial_failed'
  | 'ad_interstitial_skipped'
  | 'ad_rewarded_retry_started'
  | 'ad_rewarded_retry_earned'
  | 'ad_rewarded_retry_closed_without_reward'
  | 'ad_rewarded_retry_failed'
  | 'ad_rewarded_heart_started'
  | 'ad_rewarded_heart_earned'
  | 'ad_rewarded_heart_closed_without_reward'
  | 'ad_rewarded_heart_failed';

export type AdTracker = (event: AdAnalyticsEvent, props?: Record<string, string | number | boolean>) => void;

// ── SDK adapter boundary ───────────────────────────────────────────────────

export type AdHandleEvent = 'loaded' | 'error' | 'opened' | 'closed' | 'earned';

/** One loaded-or-loading full-screen ad. Single use: discarded after it shows. */
export interface AdHandle {
  load(): void;
  show(): Promise<void>;
  on(event: AdHandleEvent, listener: () => void): void;
  destroy(): void;
}

export interface AdRequestOptions {
  /** Until a consent layer exists, every request is non-personalized. */
  nonPersonalized: boolean;
}

/** Everything the controller needs from the native SDK. Faked in tests. */
export interface AdsSdk {
  initialize(): Promise<void>;
  create(format: AdFormat, unitId: string, options: AdRequestOptions): AdHandle;
}
