/**
 * Every analytics event name, in one place (lowercase snake_case). Call sites
 * use the semantic helpers in `src/analytics/api.ts`, never raw strings.
 */
export const EVENTS = {
  appOpened: 'app_opened',

  levelStarted: 'level_started',
  levelCompleted: 'level_completed',
  levelFailed: 'level_failed',
  levelAbandoned: 'level_abandoned',
  levelRetried: 'level_retried',
  itemUsed: 'item_used',
  endgameFastForwardStarted: 'endgame_fast_forward_started',

  heartSpent: 'heart_spent',
  heartRegenerated: 'heart_regenerated',
  heartRewarded: 'heart_rewarded',
  outOfHeartsViewed: 'out_of_hearts_viewed',

  contentCeilingApproaching: 'content_ceiling_approaching',
} as const;

export type CoreEventName = (typeof EVENTS)[keyof typeof EVENTS];

/** Ad (M12) and purchase (M13) events keep the names those layers already emit. */
export const AD_EVENTS = [
  'ad_interstitial_eligible', 'ad_interstitial_shown', 'ad_interstitial_failed', 'ad_interstitial_skipped',
  'ad_rewarded_retry_started', 'ad_rewarded_retry_earned', 'ad_rewarded_retry_closed_without_reward', 'ad_rewarded_retry_failed',
  'ad_rewarded_heart_started', 'ad_rewarded_heart_earned', 'ad_rewarded_heart_closed_without_reward', 'ad_rewarded_heart_failed',
] as const;

export const IAP_EVENTS = [
  'iap_viewed', 'iap_started', 'iap_cancelled', 'iap_failed', 'iap_completed', 'iap_reward_granted',
  'restore_started', 'restore_completed', 'remove_ads_activated',
] as const;

export type AnalyticsEventName = CoreEventName | (typeof AD_EVENTS)[number] | (typeof IAP_EVENTS)[number];

/** Flat, small, PII-free property values only. */
export type AnalyticsProps = Record<string, string | number | boolean | null>;
