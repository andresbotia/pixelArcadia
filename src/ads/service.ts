import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { analytics } from '@/analytics/service';
import { adsStore } from '@/storage/ads';
import { grantHearts } from '@/storage/hearts';

import { adRequestOptions, readForceTestMode, readProductionUnitIds, resolveAdUnits } from './config';
import { AdsController } from './controller';
import { createAdFlows } from './flows';
import { createGoogleMobileAdsSdk } from './sdk';
import { AdConsentController, consentDebugOptions } from './consent';
import { DEFAULT_ADS_POLICY, type AdsPolicy } from './types';

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;
const devLog = (message: string) => { if (isDev) console.log(message); };

/** The AdMob app id this binary was prebuilt with (the plugin entry in app.json). */
function configuredAppId(): string | undefined {
  const plugins = (Constants.expoConfig?.plugins ?? []) as unknown[];
  for (const entry of plugins) {
    if (Array.isArray(entry) && entry[0] === 'react-native-google-mobile-ads') {
      const opts = entry[1] as { iosAppId?: string; androidAppId?: string } | undefined;
      return Platform.OS === 'ios' ? opts?.iosAppId : opts?.androidAppId;
    }
  }
  return undefined;
}

const resolved = resolveAdUnits({
  platform: Platform.OS,
  isDev,
  forceTest: readForceTestMode(),
  production: readProductionUnitIds(),
  appId: configuredAppId(),
});
devLog(`[ads] mode=${resolved.mode}${resolved.notes.length ? ` (${resolved.notes.join('; ')})` : ''}`);
if (!isDev && resolved.notes.length) console.warn(`[ads] configuration unavailable: ${resolved.notes.join('; ')}`);

/** The single ad controller. UI never touches SDK objects — only this, via flows and hooks. */
export const ads = new AdsController(
  resolved.mode === 'off' ? null : createGoogleMobileAdsSdk(),
  resolved.units,
  // Semantic ad events → analytics (M14). No SDK payloads ever cross this line.
  { requestOptions: adRequestOptions, log: devLog, track: (event, props) => analytics.trackAd(event, props) },
);
// Start the production controller closed; UMP opens it only on canRequestAds.
ads.setConsentAllowed(false);

function createConsentController(): AdConsentController {
  let native: typeof import('react-native-google-mobile-ads')['AdsConsent'] | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    native = (require('react-native-google-mobile-ads') as typeof import('react-native-google-mobile-ads')).AdsConsent;
  } catch { /* Expo Go / web: ads remain unavailable */ }
  const geography = process.env.EXPO_PUBLIC_UMP_DEBUG_GEOGRAPHY;
  const debugGeography = geography === 'EEA' || geography === 'OTHER' ? geography : undefined;
  return new AdConsentController(native, (allowed) => ads.setConsentAllowed(allowed),
    consentDebugOptions(isDev, debugGeography, process.env.EXPO_PUBLIC_UMP_TEST_DEVICE_ID));
}

export const adConsent = createConsentController();

/**
 * Monetization policy. M13's Remove Ads entitlement will turn
 * `interstitialsEnabled` off here; rewarded stays on.
 */
let policy: AdsPolicy = DEFAULT_ADS_POLICY;
export function getAdsPolicy(): AdsPolicy { return policy; }
export function setAdsPolicy(next: AdsPolicy): void {
  policy = next;
  ads.setInterstitialsEnabled(next.interstitialsEnabled);
}

export const adFlows = createAdFlows({
  ads,
  store: adsStore,
  policy: getAdsPolicy,
  grantHearts,
  now: () => Date.now(),
});

/** App start: initialize + preload in the background. Never blocks, never throws. */
export function startAds(): void {
  try {
    adConsent.start();
  } catch (e) {
    devLog(`[ads] start failed: ${String(e)}`);
  }
}
