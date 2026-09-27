/** Scriptable stand-in for RevenueCat. Nothing succeeds unless a test says so. */
import type { CustomerSnapshot, IapProductInfo, PurchaseAttempt, PurchasesSdk } from '../types';

export class FakePurchases implements PurchasesSdk {
  configured: string | null = null;
  configureImpl: (key: string) => void = (key) => { this.configured = key; };
  customer: CustomerSnapshot = { activeEntitlements: [], transactions: [] };
  customerImpl: () => Promise<CustomerSnapshot> = () => Promise.resolve(this.customer);
  storeProducts: IapProductInfo[] = [];
  productsImpl: () => Promise<IapProductInfo[]> = () => Promise.resolve(this.storeProducts);
  restoreImpl: () => Promise<CustomerSnapshot> = () => Promise.resolve(this.customer);
  /** Pending purchase promises, resolved by the test. */
  readonly pending: { productId: string; resolve: (a: PurchaseAttempt) => void; reject: (e: unknown) => void }[] = [];
  readonly listeners = new Set<(c: CustomerSnapshot) => void>();

  configure(apiKey: string): void { this.configureImpl(apiKey); }
  getCustomer(): Promise<CustomerSnapshot> { return this.customerImpl(); }
  getProducts(): Promise<IapProductInfo[]> { return this.productsImpl(); }
  purchase(productId: string): Promise<PurchaseAttempt> {
    return new Promise((resolve, reject) => { this.pending.push({ productId, resolve, reject }); });
  }
  restore(): Promise<CustomerSnapshot> { return this.restoreImpl(); }
  onCustomerUpdate(listener: (c: CustomerSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
  /** Push a CustomerInfo update, as RevenueCat's listener would. */
  emitCustomer(c: CustomerSnapshot): void {
    this.customer = c;
    for (const l of this.listeners) l(c);
  }
}

/** A StoreKit-like localized product list for our catalog. */
export function localizedProducts(prices: Record<string, string>): IapProductInfo[] {
  return Object.entries(prices).map(([productId, priceString]) => ({ productId, priceString }));
}

export async function flush(): Promise<void> {
  for (let i = 0; i < 10; i++) await Promise.resolve();
}
