import { loadAdsState } from '@/storage/ads';
import { loadAnalyticsState } from '@/storage/analytics';
import { loadEconomy } from '@/storage/economy';
import { loadHearts } from '@/storage/hearts';
import { loadIapCache } from '@/storage/iap';
import { loadProgress } from '@/storage/progress';

/**
 * Warm every save Home reads on its first frame (progress, coins, hearts),
 * the ad policy state (cadence, pending rewarded retry) and the cached Remove
 * Ads entitlement, so the launch loader lifts onto real values — no 0-coin /
 * level-1 flash — and the caches read synchronously (heart gate, ads policy)
 * are populated before any PLAY tap. Hearts are
 * reconciled against the clock here, so time spent closed is credited at
 * launch. Never rejects: a storage fault just reveals Home with its defaults.
 */
export async function preloadSaveData(): Promise<void> {
  await Promise.allSettled([loadProgress(), loadEconomy(), loadHearts(), loadAdsState(), loadIapCache(), loadAnalyticsState()]);
}
