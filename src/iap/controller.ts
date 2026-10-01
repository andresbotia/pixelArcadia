import type { StoreTransactionRecord } from '@/game/economy/purchase';

import { IAP_IDS, iapProduct, isConsumableProduct } from './catalog';
import { iapEventProps } from './analyticsProps';
import { REMOVE_ADS_ENTITLEMENT } from './config';
import type {
  CustomerSnapshot,
  IapAnalyticsEvent,
  IapProductInfo,
  IapStatus,
  PurchaseOutcome,
  PurchasesSdk,
  RestoreOutcome,
} from './types';

export interface PurchasesDeps {
  /**
   * THE consumable grant (`storage/economy.reconcileIapPurchases`): every
   * account transaction not yet in the ledger (and newer than this install's
   * ledger) grants its catalog reward + ledger mark in one atomic save.
   * Returns what it granted.
   */
  reconcileConsumables(
    transactions: readonly StoreTransactionRecord[], opts?: { confirmedPurchaseOf?: string },
  ): Promise<StoreTransactionRecord[]>;
  /** Local cache of the entitlement so the next launch starts correct, even offline. */
  persistRemoveAds(owned: boolean): void;
  /** Ads policy hook: interstitials off while owned; rewarded untouched. */
  onRemoveAdsChange(owned: boolean): void;
  log?(message: string): void;
  track?(event: IapAnalyticsEvent, props?: Record<string, string | number | boolean>): void;
}

/**
 * Product lookup progress. `idle`/`loading` before any answer (cards show a
 * loading state, never "unavailable"); `loaded` once the store answered;
 * `failed` when the lookup errored and nothing is known.
 */
export type ProductFetchState = 'idle' | 'loading' | 'loaded' | 'failed';

export interface PurchasesSnapshot {
  status: IapStatus;
  /** Products the store actually returned, keyed by OUR product id. */
  products: Readonly<Record<string, IapProductInfo>>;
  productFetch: ProductFetchState;
  hasRemoveAds: boolean;
  /** Product whose purchase is in flight (or '__restore__'); null when idle. */
  activeOperation: string | null;
}

const RESTORE = '__restore__';

/** `code` / `readableErrorCode` of a RevenueCat error — never its message or payload. */
function errorCode(e: unknown): string {
  const err = (e ?? {}) as { code?: unknown; readableErrorCode?: unknown };
  const parts = [err.code, err.readableErrorCode].filter((v) => typeof v === 'string' || typeof v === 'number');
  return parts.length ? parts.join(' ') : 'unknown';
}

/**
 * RevenueCat-backed purchase state machine. Never throws, never blocks
 * startup. Guarantees:
 *  - consumable rewards come ONLY from RevenueCat's confirmed transaction list
 *    (CustomerInfo.nonSubscriptionTransactions), keyed by RevenueCat's
 *    transaction id. The purchase result, the CustomerInfo listener and every
 *    refresh feed that one ledger-guarded grant, so each transaction grants at
 *    most once whichever path — or how many paths — deliver it. (The purchase
 *    result's StoreKit transaction id is a different id space and is never
 *    used as a grant key: mixing the two would double-grant.)
 *  - one purchase/restore at a time;
 *  - Remove Ads follows the RevenueCat entitlement, cached locally so offline
 *    launches keep it; restores never turn consumables back into coins;
 *  - unknown store products are ignored; a product the store didn't return
 *    can't be bought (no fabricated prices).
 */
export class PurchasesController {
  private snapshot: PurchasesSnapshot;
  private readonly listeners = new Set<() => void>();
  private started = false;
  private offCustomer: (() => void) | null = null;
  /** Generation of the latest product lookup; older answers are dropped. */
  private fetchGen = 0;

  constructor(
    private readonly sdk: PurchasesSdk | null,
    private readonly apiKey: string | null,
    private readonly deps: PurchasesDeps,
    cachedRemoveAds = false,
  ) {
    this.snapshot = { status: 'unavailable', products: {}, productFetch: 'idle', hasRemoveAds: cachedRemoveAds, activeOperation: null };
  }

  getSnapshot(): PurchasesSnapshot {
    return this.snapshot;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  /** The Store's real-money sections were shown (M14 `iap_viewed`). */
  markViewed(): void {
    this.track('iap_viewed', {
      status: this.snapshot.status,
      products_available: Object.keys(this.snapshot.products).length,
      remove_ads_owned: this.snapshot.hasRemoveAds,
    });
  }

  /** Configure once and reconcile in the background. Applies the cached entitlement immediately. */
  start(): void {
    if (this.started) return;
    this.started = true;
    this.deps.onRemoveAdsChange(this.snapshot.hasRemoveAds);
    if (!this.sdk || !this.apiKey) {
      this.log('no SDK / API key — purchases unavailable');
      return;
    }
    try {
      this.sdk.configure(this.apiKey);
      this.log('RevenueCat configured; anonymous app user');
      this.offCustomer = this.sdk.onCustomerUpdate((c) => this.applyCustomer(c));
    } catch {
      this.log('configure failed — purchases unavailable');
      return;
    }
    this.set({ status: 'initializing' });
    void this.refresh();
  }

  /** Re-fetch products + customer (Store focus, after going back online). Never throws. */
  async refresh(): Promise<void> {
    if (!this.sdk || !this.apiKey || this.snapshot.status === 'unavailable') return;
    const gen = ++this.fetchGen;
    this.log(`direct products request: ${IAP_IDS.join(', ')}`);
    // Prices already shown stay up while re-fetching; otherwise the cards show loading.
    if (this.snapshot.productFetch !== 'loaded') this.set({ productFetch: 'loading' });
    const [customer, products] = await Promise.allSettled([this.sdk.getCustomer(), this.sdk.getProducts(IAP_IDS)]);
    if (customer.status === 'fulfilled') this.applyCustomer(customer.value);
    else this.log('customer info unavailable');
    // Overlapping refreshes (launch + Store focus): only the newest answer may set products.
    if (gen !== this.fetchGen) return;
    if (products.status === 'fulfilled') {
      const known: Record<string, IapProductInfo> = {};
      let returned = 0;
      for (const p of products.value) {
        if (!iapProduct(p.productId)) { this.log(`ignoring unknown store product ${p.productId}`); continue; }
        returned++;
        if (!p.priceString?.trim()) this.log(`store price unavailable for ${p.productId}`);
        else known[p.productId] = p;
      }
      for (const id of IAP_IDS) if (!known[id]) this.log(`store did not return ${id} — its card is disabled`);
      this.log(`products ${Object.keys(known).length}/${IAP_IDS.length} priced (${returned} returned)`);
      this.set({ products: known, productFetch: 'loaded', status: this.snapshot.activeOperation ? 'purchasing' : 'ready' });
    } else {
      this.log(`products unavailable (${errorCode(products.reason)})`);
      const productFetch = Object.keys(this.snapshot.products).length ? 'loaded' : 'failed';
      this.set(this.snapshot.activeOperation ? { productFetch } : { productFetch, status: 'error' });
    }
  }

  async purchase(productId: string): Promise<PurchaseOutcome> {
    const product = iapProduct(productId);
    const { status, activeOperation, products, hasRemoveAds } = this.snapshot;
    if (!this.sdk || !product || status === 'unavailable' || status === 'initializing') return 'unavailable';
    if (activeOperation) return 'busy';
    if (product.reward.entitlement === REMOVE_ADS_ENTITLEMENT && hasRemoveAds) return 'alreadyOwned';
    if (!products[productId]?.priceString?.trim()) return 'unavailable';

    this.set({ activeOperation: productId, status: 'purchasing' });
    this.track('iap_started', this.productProps(productId));
    try {
      let attempt;
      try {
        attempt = await this.sdk.purchase(productId);
      } catch (e) {
        attempt = { status: 'failed' as const, message: String(e) };
      }
      if (attempt.status === 'cancelled') {
        this.track('iap_cancelled', this.productProps(productId));
        return 'cancelled';
      }
      if (attempt.status === 'failed') {
        this.log('purchase failed');
        this.track('iap_failed', this.productProps(productId));
        return 'failed';
      }
      // Confirmed by the store. The result's CustomerInfo already lists the new
      // transaction; granting runs through the one ledger-guarded path.
      const bought = attempt.productId || productId;
      if (bought !== productId) this.log(`purchase result for ${bought}, requested ${productId}`);
      this.log(`purchased ${bought}`);
      this.applyEntitlements(attempt.customer);
      if (isConsumableProduct(bought)) {
        let granted = await this.grantFrom(attempt.customer, bought);
        if (!granted.some((t) => t.productId === bought)) {
          // Normally already granted (e.g. by the listener, which can fire
          // first). If RevenueCat's copy lagged, one fresh read; failing that,
          // the next refresh / listener / launch delivers it.
          try {
            granted = granted.concat(await this.grantFrom(await this.sdk.getCustomer(), bought));
          } catch { /* next refresh delivers */ }
        }
      }
      this.track('iap_completed', this.productProps(bought));
      return 'purchased';
    } finally {
      this.set({ activeOperation: null, status: 'ready' });
    }
  }

  /**
   * Restore Purchases. Brings back NON-consumables (Remove Ads) via the
   * entitlement; consumables are never re-granted (the ledger + its start
   * date exclude them).
   */
  async restore(): Promise<RestoreOutcome> {
    if (!this.sdk || this.snapshot.status === 'unavailable' || this.snapshot.status === 'initializing') return 'unavailable';
    if (this.snapshot.activeOperation) return 'failed';
    this.set({ activeOperation: RESTORE, status: 'purchasing' });
    this.track('restore_started');
    try {
      const customer = await this.sdk.restore();
      this.applyCustomer(customer);
      this.track('restore_completed', { remove_ads: this.snapshot.hasRemoveAds });
      return this.snapshot.hasRemoveAds ? 'restored' : 'nothingToRestore';
    } catch {
      this.log('restore failed');
      return 'failed';
    } finally {
      this.set({ activeOperation: null, status: 'ready' });
    }
  }

  stop(): void {
    this.offCustomer?.();
    this.offCustomer = null;
  }

  // ── internals ────────────────────────────────────────────────────────────

  /** Listener / refresh / restore: entitlements + any consumables not yet granted. */
  private applyCustomer(customer: CustomerSnapshot): void {
    this.applyEntitlements(customer);
    void this.grantFrom(customer);
  }

  private applyEntitlements(customer: CustomerSnapshot): void {
    const owned = customer.activeEntitlements.includes(REMOVE_ADS_ENTITLEMENT);
    if (owned !== this.snapshot.hasRemoveAds) {
      this.set({ hasRemoveAds: owned });
      this.deps.persistRemoveAds(owned);
      this.deps.onRemoveAdsChange(owned);
      if (owned) this.track('remove_ads_activated');
    }
  }

  /** THE consumable grant path. Never throws. */
  private async grantFrom(customer: CustomerSnapshot, confirmedPurchaseOf?: string): Promise<StoreTransactionRecord[]> {
    const consumables = customer.transactions.filter((t) => isConsumableProduct(t.productId));
    if (!consumables.length) return [];
    try {
      const granted = await this.deps.reconcileConsumables(consumables, confirmedPurchaseOf ? { confirmedPurchaseOf } : {});
      // Exactly once per transaction: the ledger only ever returns NEW grants,
      // whichever path (result / listener / refresh) got there first.
      for (const t of granted) {
        this.log(`granted ${t.productId}`);
        this.track('iap_reward_granted', this.productProps(t.productId));
      }
      return granted;
    } catch {
      this.log('grant failed');
      return [];
    }
  }

  /** Product-focused analytics properties. Never transaction ids or customer info. */
  private productProps(productId: string): Record<string, string | number | boolean> {
    return iapEventProps(productId, this.snapshot.products[productId]);
  }

  private set(patch: Partial<PurchasesSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch };
    for (const l of this.listeners) {
      try { l(); } catch { /* UI listener errors never break purchases */ }
    }
  }

  private track(event: IapAnalyticsEvent, props?: Record<string, string | number | boolean>): void {
    this.log(`event ${event}${props ? ` ${JSON.stringify(props)}` : ''}`);
    this.deps.track?.(event, props);
  }

  private log(message: string): void {
    this.deps.log?.(`[iap] ${message}`);
  }
}
