import {
  STORE_CATALOG,
  getProduct,
  type IapPurchaseType,
  type StoreProduct,
  type StoreSection,
} from '@/game/economy/catalog';

/**
 * The real-money slice of the ONE store catalog (`game/economy/catalog`),
 * which stays the authoritative product → reward map. RevenueCat/StoreKit only
 * contribute availability and the localized price text; they never decide
 * what a product grants.
 */
export type IapStoreProduct = StoreProduct & { price: { kind: 'iap'; productId: string; purchaseType: IapPurchaseType } };

function isIap(p: StoreProduct): p is IapStoreProduct {
  return p.price.kind === 'iap';
}

export const IAP_CATALOG: readonly IapStoreProduct[] = STORE_CATALOG.filter(isIap);

/** Every App Store product id we sell. */
export const IAP_IDS: readonly string[] = IAP_CATALOG.map((p) => p.price.productId);

/** Our product for a store product id, or undefined (unknown ids are ignored everywhere). */
export function iapProduct(productId: string): IapStoreProduct | undefined {
  const p = getProduct(productId);
  return p && isIap(p) ? p : undefined;
}

export function isConsumableProduct(productId: string): boolean {
  return iapProduct(productId)?.price.purchaseType === 'consumable';
}

export function iapProductsInSection(section: StoreSection): IapStoreProduct[] {
  return IAP_CATALOG.filter((p) => p.section === section);
}
