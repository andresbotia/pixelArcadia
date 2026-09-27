import { useCallback, useSyncExternalStore } from 'react';

import { ads, getAdsPolicy } from '@/ads/service';
import type { AdLoadState, AdPlacement, AdsPolicy } from '@/ads/types';

/** Live load state of one placement (idle/loading/ready/showing/unavailable/error). */
export function useAdPlacement(placement: AdPlacement): AdLoadState {
  const subscribe = useCallback((onChange: () => void) => ads.subscribe(onChange), []);
  const get = useCallback(() => ads.getState(placement), [placement]);
  return useSyncExternalStore(subscribe, get, get);
}

export function useAdsPolicy(): AdsPolicy {
  return getAdsPolicy();
}
