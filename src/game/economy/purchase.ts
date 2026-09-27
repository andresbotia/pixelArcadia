import type { GameplayItemId } from './config';
import { getProduct, type StoreProduct } from './catalog';

/** Saved-economy fields a purchase reads and writes (structural, storage-free). */
export interface PurchasableState {
  readonly coins: number;
  readonly inventory: Readonly<Record<GameplayItemId, number>>;
}

export type PurchaseStatus =
  | 'success'
  | 'insufficientFunds'
  /** No such product in the catalog. */
  | 'invalidProduct'
  /** The product is paid some other way (IAP) — not settleable with coins. */
  | 'unsupportedPayment';

export interface PurchaseOutcome<S extends PurchasableState> {
  status: PurchaseStatus;
  product?: StoreProduct;
  /** Coins charged (0 unless `success`). */
  charged: number;
  /** The state after the purchase — the SAME object as the input unless `success`. */
  state: S;
}

/**
 * Settle a coin purchase as one pure state transition: the charge and the
 * reward land in a single new state, or nothing changes at all. There is no
 * intermediate state in which coins are gone but the item is not granted.
 */
export function applyCoinPurchase<S extends PurchasableState>(state: S, productId: string): PurchaseOutcome<S> {
  const product = getProduct(productId);
  if (!product) return { status: 'invalidProduct', charged: 0, state };
  if (product.price.kind !== 'coins') return { status: 'unsupportedPayment', product, charged: 0, state };

  const cost = product.price.amount;
  if (state.coins < cost) return { status: 'insufficientFunds', product, charged: 0, state };

  const inventory = { ...state.inventory };
  for (const [itemId, qty] of Object.entries(product.reward.items ?? {}) as [GameplayItemId, number][]) {
    inventory[itemId] = (inventory[itemId] ?? 0) + qty;
  }
  const next: S = {
    ...state,
    coins: state.coins - cost + (product.reward.coins ?? 0),
    inventory,
  };
  return { status: 'success', product, charged: cost, state: next };
}

/**
 * Consumable-grant bookkeeping, stored INSIDE the economy save so a grant and
 * its "processed" mark are one write. `startedAt`: when this install began
 * keeping the ledger — crash recovery only replays store transactions newer
 * than it, so purchases from before a reinstall never turn back into coins.
 */
export interface IapLedger {
  readonly startedAt: number;
  readonly processed: readonly string[];
}

export interface IapGrantableState extends PurchasableState {
  readonly iapLedger: IapLedger;
}

export type IapGrantStatus = 'granted' | 'duplicate' | 'invalidProduct' | 'notConsumable' | 'invalidTransaction';

/**
 * Apply one CONFIRMED real-money consumable transaction: add its catalog
 * reward and record the transaction id, as one pure state transition. The same
 * transaction id can never grant twice. Non-consumables (Remove Ads) are never
 * granted here — they are entitlements, owned by RevenueCat.
 */
export function applyIapGrant<S extends IapGrantableState>(
  state: S, productId: string, transactionId: string,
): { status: IapGrantStatus; state: S } {
  if (!transactionId) return { status: 'invalidTransaction', state };
  const product = getProduct(productId);
  if (!product || product.price.kind !== 'iap') return { status: 'invalidProduct', state };
  if (product.price.purchaseType !== 'consumable') return { status: 'notConsumable', state };
  if (state.iapLedger.processed.includes(transactionId)) return { status: 'duplicate', state };

  const inventory = { ...state.inventory };
  for (const [itemId, qty] of Object.entries(product.reward.items ?? {}) as [GameplayItemId, number][]) {
    inventory[itemId] = (inventory[itemId] ?? 0) + qty;
  }
  const next: S = {
    ...state,
    coins: state.coins + (product.reward.coins ?? 0),
    inventory,
    iapLedger: { ...state.iapLedger, processed: [...state.iapLedger.processed, transactionId] },
  };
  return { status: 'granted', state: next };
}

/** A confirmed store transaction as the purchase SDK reports it. */
export interface StoreTransactionRecord {
  readonly transactionId: string;
  readonly productId: string;
  /** Epoch ms (NaN if unknown). */
  readonly purchasedAt: number;
}

/**
 * Grant every consumable transaction the store reports that this install's
 * ledger has not processed and that happened after the ledger began (older
 * ones — a reinstall + restore — never turn back into coins). Unknown
 * products and non-consumables are skipped.
 *
 * `confirmedPurchaseOf`: a purchase of this product was JUST confirmed in this
 * session. Its transaction (the newest unprocessed one of that product) is
 * granted even if its store date precedes the ledger start — that can only
 * mean the device clock was ahead when the ledger began, and a real purchase
 * must never be swallowed by a clock.
 */
export function reconcileIapTransactions<S extends IapGrantableState>(
  state: S, transactions: readonly StoreTransactionRecord[], opts: { confirmedPurchaseOf?: string } = {},
): { state: S; granted: StoreTransactionRecord[] } {
  let exempt: string | undefined;
  if (opts.confirmedPurchaseOf) {
    const newest = transactions
      .filter((t) => t.productId === opts.confirmedPurchaseOf && !state.iapLedger.processed.includes(t.transactionId))
      .sort((x, y) => (Number.isFinite(y.purchasedAt) ? y.purchasedAt : 0) - (Number.isFinite(x.purchasedAt) ? x.purchasedAt : 0))[0];
    exempt = newest?.transactionId;
  }
  let next = state;
  const granted: StoreTransactionRecord[] = [];
  for (const tx of transactions) {
    const dated = Number.isFinite(tx.purchasedAt) && tx.purchasedAt >= state.iapLedger.startedAt;
    if (!dated && tx.transactionId !== exempt) continue;
    const res = applyIapGrant(next, tx.productId, tx.transactionId);
    if (res.status === 'granted') {
      next = res.state;
      granted.push(tx);
    }
  }
  return { state: next, granted };
}
