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
const devLog = (message: string) => {
  const line = message.startsWith('[iap] ') ? message.slice(6) : message;
  if (isDev) console.log(`[iap] ${line}`);
};

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
  devLog(`mode=${resolved.mode}${resolved.note ? ` (${resolved.note})` : ''}; profile=${readRevenueCatBuildMode() ?? 'unset'}; anonymous=true`);
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
    devLog('start failed');
  }
}
