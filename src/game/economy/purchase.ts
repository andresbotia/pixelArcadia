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
