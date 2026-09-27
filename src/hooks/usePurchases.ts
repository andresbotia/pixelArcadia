import { useCallback, useSyncExternalStore } from 'react';

import type { PurchasesSnapshot } from '@/iap/controller';
import { purchases } from '@/iap/service';

/** Live purchase state: status, store products (localized prices), Remove Ads ownership. */
export function usePurchases(): PurchasesSnapshot & {
  purchase: (productId: string) => ReturnType<ReturnType<typeof purchases>['purchase']>;
  restore: () => ReturnType<ReturnType<typeof purchases>['restore']>;
  refresh: () => Promise<void>;
} {
  const subscribe = useCallback((onChange: () => void) => purchases().subscribe(onChange), []);
  const get = useCallback(() => purchases().getSnapshot(), []);
  const snapshot = useSyncExternalStore(subscribe, get, get);
  const purchase = useCallback((productId: string) => purchases().purchase(productId), []);
  const restore = useCallback(() => purchases().restore(), []);
  const refresh = useCallback(() => purchases().refresh(), []);
  return { ...snapshot, purchase, restore, refresh };
}
