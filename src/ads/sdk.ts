import type { AdFormat, AdHandle, AdHandleEvent, AdRequestOptions, AdsSdk } from './types';

type GmaModule = typeof import('react-native-google-mobile-ads');

/**
 * The ONLY file that touches `react-native-google-mobile-ads`. Required
 * lazily inside a try: in Expo Go, on web, or in a build made before the
 * native module was added, the require (or the native lookup) throws — that
 * means "no ads", never a crash.
 */
export function createGoogleMobileAdsSdk(): AdsSdk | null {
  let gma: GmaModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    gma = require('react-native-google-mobile-ads') as GmaModule;
  } catch {
    return null;
  }
  const { default: mobileAds, InterstitialAd, RewardedAd, AdEventType, RewardedAdEventType } = gma;

  return {
    async initialize() {
      await mobileAds().initialize();
    },
    create(format: AdFormat, unitId: string, options: AdRequestOptions): AdHandle {
      const requestOptions = { requestNonPersonalizedAdsOnly: options.nonPersonalized };
      const ad = format === 'rewarded'
        ? RewardedAd.createForAdRequest(unitId, requestOptions)
        : InterstitialAd.createForAdRequest(unitId, requestOptions);
      const unsubscribers: (() => void)[] = [];
      const LIFECYCLE = {
        error: AdEventType.ERROR,
        opened: AdEventType.OPENED,
        closed: AdEventType.CLOSED,
      } as const;

      const on = (event: AdHandleEvent, listener: () => void) => {
        // Rewarded ads report load + reward on their own event types; the
        // lifecycle (error/opened/closed) is the shared AdEventType.
        if (format === 'rewarded') {
          const rewarded = ad as ReturnType<typeof RewardedAd.createForAdRequest>;
          if (event === 'loaded') unsubscribers.push(rewarded.addAdEventListener(RewardedAdEventType.LOADED, listener));
          else if (event === 'earned') unsubscribers.push(rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, listener));
          else unsubscribers.push(rewarded.addAdEventListener(LIFECYCLE[event], listener));
          return;
        }
        if (event === 'earned') return; // interstitials never reward
        const interstitial = ad as ReturnType<typeof InterstitialAd.createForAdRequest>;
        unsubscribers.push(interstitial.addAdEventListener(event === 'loaded' ? AdEventType.LOADED : LIFECYCLE[event], listener));
      };

      return {
        load: () => ad.load(),
        show: () => ad.show(),
        on,
        destroy: () => {
          for (const off of unsubscribers.splice(0)) {
            try { off(); } catch { /* ignore */ }
          }
          try { ad.removeAllListeners(); } catch { /* ignore */ }
          try { ad.destroy(); } catch { /* ignore */ }
        },
      };
    },
  };
}
