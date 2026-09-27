/**
 * Real-money purchases (M13) — shared types. Pure: no native imports. Only
 * `src/iap/sdk.ts` touches `react-native-purchases`; the UI sees these views.
 */

/** Purchase service status. */
export type IapStatus = 'unavailable' | 'initializing' | 'ready' | 'purchasing' | 'error';

/** A product the store actually returned: our id + StoreKit's localized price text. */
export interface IapProductInfo {
  productId: string;
  /** Localized, storefront-formatted price ("$0.99", "0,99 €"). Never built by us. */
  priceString: string;
  /** StoreKit's numeric price and ISO currency, for analytics only (optional). */
  price?: number;
  currencyCode?: string;
}

/** What the app needs from RevenueCat's CustomerInfo. */
export interface CustomerSnapshot {
  activeEntitlements: string[];
  /**
   * Every non-subscription transaction on the account (consumables +
   * non-consumables). `transactionId` is RevenueCat's OWN transaction id —
   * the one id space every consumable grant is keyed by (see controller).
   */
  transactions: { transactionId: string; productId: string; purchasedAt: number }[];
}

export type PurchaseAttempt =
  /**
   * `storeTransactionId` is Apple's StoreKit id — a DIFFERENT id space from
   * `CustomerSnapshot.transactions[].transactionId`; logged only, never a grant key.
   */
  | { status: 'purchased'; productId: string; storeTransactionId: string; customer: CustomerSnapshot }
  | { status: 'cancelled' }
  | { status: 'failed'; message: string };

export type PurchaseOutcome =
  /** Charged AND the reward is in the save (consumable) / entitlement recorded (Remove Ads). */
  | 'purchased'
  | 'cancelled'
  | 'failed'
  /** Service not ready, or the product was not returned by the store. */
  | 'unavailable'
  /** Another purchase is in progress. */
  | 'busy'
  /** Non-consumable already owned. */
  | 'alreadyOwned';

export type RestoreOutcome = 'restored' | 'nothingToRestore' | 'failed' | 'unavailable';

/** Everything the controller needs from RevenueCat. Faked in tests. */
export interface PurchasesSdk {
  configure(apiKey: string): void;
  getCustomer(): Promise<CustomerSnapshot>;
  /** Look up products by OUR ids; unknown/missing ids are simply absent. */
  getProducts(productIds: readonly string[]): Promise<IapProductInfo[]>;
  purchase(productId: string): Promise<PurchaseAttempt>;
  restore(): Promise<CustomerSnapshot>;
  onCustomerUpdate(listener: (customer: CustomerSnapshot) => void): () => void;
}

/** Semantic purchase events — the M14 PostHog vocabulary (dev-logged only). */
export type IapAnalyticsEvent =
  | 'iap_viewed'
  | 'iap_started'
  | 'iap_cancelled'
  | 'iap_failed'
  | 'iap_completed'
  | 'iap_reward_granted'
  | 'restore_started'
  | 'restore_completed'
  | 'remove_ads_activated';
