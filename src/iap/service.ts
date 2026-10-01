import { Platform } from 'react-native';

import { adsPolicyFor } from '@/ads/policy';
import { analytics } from '@/analytics/service';
import { setAdsPolicy } from '@/ads/service';
import { reconcileIapPurchases } from '@/storage/economy';
import { getCachedRemoveAds, saveRemoveAds } from '@/storage/iap';

import { readRevenueCatBuildMode, readRevenueCatKeys, resolveRevenueCatKey } from './config';
import { PurchasesController } from './controller';
import { createRevenueCatSdk } from './sdk';

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;
const devLog = (message: string) => { if (isDev) console.log(message); };

let controller: PurchasesController | null = null;

/**
 * The single purchases controller. Created on first use — after boot has
 * loaded the Remove Ads cache — so it starts with the right entitlement.
 */
export function purchases(): PurchasesController {
  if (controller) return controller;
  const resolved = resolveRevenueCatKey({
    platform: Platform.OS, isDev, keys: readRevenueCatKeys(), buildMode: readRevenueCatBuildMode(),
  });
  devLog(`[iap] mode=${resolved.mode}${resolved.note ? ` (${resolved.note})` : ''}`);
  controller = new PurchasesController(
    resolved.key ? createRevenueCatSdk() : null,
    resolved.key,
    {
      reconcileConsumables: reconcileIapPurchases,
      persistRemoveAds: saveRemoveAds,
      onRemoveAdsChange: (owned) => {
        setAdsPolicy(adsPolicyFor(owned));
        analytics.setRemoveAdsOwned(owned); // person property, sent only when it changes
      },
      log: devLog,
      mode: resolved.note ? `${resolved.mode} (${resolved.note})` : resolved.mode,
      // Semantic purchase events → analytics (M14).
      track: (event, props) => analytics.trackIap(event, props),
    },
    getCachedRemoveAds(),
  );
  return controller;
}

/** App start (after boot preload): configure RevenueCat in the background. Never blocks, never throws. */
export function startPurchases(): void {
  try {
    purchases().start();
  } catch {
    devLog('[iap] start failed');
  }
}
