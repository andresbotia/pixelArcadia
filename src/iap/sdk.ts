import type { CustomerSnapshot, IapProductInfo, PurchaseAttempt, PurchasesSdk } from './types';

type RcModule = typeof import('react-native-purchases');
type RcCustomerInfo = import('react-native-purchases').CustomerInfo;
type RcStoreProduct = import('react-native-purchases').PurchasesStoreProduct;

/**
 * The ONLY file that touches `react-native-purchases`. Required lazily inside
 * a try: in Expo Go, on web, or in a binary built before the native module was
 * added, it throws — that means "purchases unavailable", never a crash.
 */
export function createRevenueCatSdk(): PurchasesSdk | null {
  let rc: RcModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    rc = require('react-native-purchases') as RcModule;
  } catch {
    return null;
  }
  const Purchases = rc.default;
  /** Native product objects from the last lookup — purchaseStoreProduct needs them. */
  const storeProducts = new Map<string, RcStoreProduct>();

  const toSnapshot = (info: RcCustomerInfo): CustomerSnapshot => ({
    activeEntitlements: Object.keys(info.entitlements.active),
    transactions: info.nonSubscriptionTransactions.map((t) => ({
      // RevenueCat's transaction id (not the StoreKit one) — the grant ledger key.
      transactionId: t.transactionIdentifier,
      productId: t.productIdentifier,
      purchasedAt: Date.parse(t.purchaseDate),
    })),
  });

  const lookup = async (ids: readonly string[]): Promise<IapProductInfo[]> => {
    const found = await Purchases.getProducts([...ids], rc.PRODUCT_CATEGORY.NON_SUBSCRIPTION);
    for (const p of found) storeProducts.set(p.identifier, p);
    return found.map((p) => ({ productId: p.identifier, priceString: p.priceString, price: p.price, currencyCode: p.currencyCode }));
  };

  return {
    configure(apiKey) {
      // No appUserID → RevenueCat anonymous id. No account system in V1.
      Purchases.configure({ apiKey });
    },
    async getCustomer() {
      return toSnapshot(await Purchases.getCustomerInfo());
    },
    getProducts: lookup,
    async purchase(productId): Promise<PurchaseAttempt> {
      let product = storeProducts.get(productId);
      if (!product) {
        await lookup([productId]);
        product = storeProducts.get(productId);
      }
      if (!product) return { status: 'failed', message: `product ${productId} not available` };
      try {
        const res = await Purchases.purchaseStoreProduct(product);
        return {
          status: 'purchased',
          productId: res.transaction?.productIdentifier ?? res.productIdentifier,
          // Apple's id is retained only as purchase-result metadata.
          // The grant ledger uses CustomerInfo's RevenueCat transaction id.
          storeTransactionId: res.transaction?.transactionIdentifier ?? '',
          customer: toSnapshot(res.customerInfo),
        };
      } catch (e) {
        const err = e as { userCancelled?: boolean | null; code?: string; message?: string };
        if (err.userCancelled || err.code === rc.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return { status: 'cancelled' };
        return { status: 'failed', message: err.message ?? String(e) };
      }
    },
    async restore() {
      return toSnapshot(await Purchases.restorePurchases());
    },
    onCustomerUpdate(listener) {
      const l = (info: RcCustomerInfo) => listener(toSnapshot(info));
      Purchases.addCustomerInfoUpdateListener(l);
      return () => { Purchases.removeCustomerInfoUpdateListener(l); };
    },
  };
}
