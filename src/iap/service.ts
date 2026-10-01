import { Platform } from 'react-native';

import { adsPolicyFor } from '@/ads/policy';
import { analytics } from '@/analytics/service';
import { setAdsPolicy } from '@/ads/service';
import { reconcileIapPurchases } from '@/storage/economy';
import { getCachedRemoveAds, saveRemoveAds } from '@/storage/iap';

import { readRevenueCatBuildMode, readRevenueCatKeys, resolveRevenueCatKey } from './config';
import { PurchasesController } from './controller';
import { recordIapDiagnostic } from './localDiagnostics';
import { createRevenueCatSdk } from './sdk';

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;
// Opt-in for local Release simulator diagnostics. Never set in EAS profiles.
const localDiagnostics = process.env.EXPO_PUBLIC_IAP_DIAGNOSTICS === '1';
const devLog = (message: string) => {
  const line = message.startsWith('[iap] ') ? message.slice(6) : message;
  if (localDiagnostics) recordIapDiagnostic(line);
  else if (isDev) console.log(`[iap] ${line}`);
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
    devLog('start failed');
  }
}
