import type { AdsPolicy } from './types';

/**
 * Ads policy from the Remove Ads entitlement (M13). Remove Ads turns off
 * FORCED ads only; rewarded ads are voluntary exchanges and stay on (and keep
 * preloading) either way.
 */
export function adsPolicyFor(hasRemoveAds: boolean): AdsPolicy {
  return { interstitialsEnabled: !hasRemoveAds, rewardedEnabled: true };
}
