import { ITEM_DISPLAY_NAMES, M6_ECONOMY, type GameplayItemId } from './config';

/**
 * The Pixel Arcadia Store catalog — the one list of things a player can buy.
 * Pure data: the Store screen renders it, the gameplay restock prompt prices
 * from it, and `storage/economy` settles purchases against it.
 *
 * Store V1 sells the three gameplay items for coins. The shapes below already
 * carry a payment kind and a general reward so later products (coin packs,
 * item + coin bundles paid through StoreKit / RevenueCat) are new catalog
 * entries plus a new payment path — not a store redesign.
 */

/** Where a product is shown. Only `items` has products in V1. */
export type StoreSection = 'items' | 'coins' | 'bundles';

/**
 * How a product is paid for.
 * - `coins`: settled locally against the saved coin balance (V1).
 * - `iap`: reserved for a store-platform product id; nothing settles it yet.
 */
export type StorePrice =
  | { readonly kind: 'coins'; readonly amount: number }
  | { readonly kind: 'iap'; readonly productId: string };

/** What a purchase grants. Any mix of items and coins. */
export interface StoreReward {
  readonly items?: Readonly<Partial<Record<GameplayItemId, number>>>;
  readonly coins?: number;
}

/** Art for a product card. */
export type StoreIcon = { readonly kind: 'item'; readonly itemId: GameplayItemId };

export interface StoreProduct {
  readonly id: string;
  readonly section: StoreSection;
  readonly title: string;
  readonly description: string;
  readonly icon: StoreIcon;
  readonly reward: StoreReward;
  readonly price: StorePrice;
}

const ITEM_DESCRIPTIONS: Record<GameplayItemId, string> = {
  undo: 'Undo your last move.',
  extraSlot: 'Add one extra Holding slot for this run.',
  bomb: 'Clear a targeted 3×3 area.',
};

const ITEM_ORDER: readonly GameplayItemId[] = ['undo', 'extraSlot', 'bomb'];

/** Catalog id of the single-unit coin product for a gameplay item. */
export function itemProductId(itemId: GameplayItemId): string {
  return `item_${itemId}`;
}

function itemProduct(itemId: GameplayItemId): StoreProduct {
  return {
    id: itemProductId(itemId),
    section: 'items',
    title: ITEM_DISPLAY_NAMES[itemId],
    description: ITEM_DESCRIPTIONS[itemId],
    icon: { kind: 'item', itemId },
    reward: { items: { [itemId]: 1 } },
    // Prices stay in the economy config (the single tunable source).
    price: { kind: 'coins', amount: M6_ECONOMY.itemPrices[itemId] },
  };
}

export const STORE_CATALOG: readonly StoreProduct[] = ITEM_ORDER.map(itemProduct);

export function getProduct(productId: string): StoreProduct | undefined {
  return STORE_CATALOG.find((p) => p.id === productId);
}

export function productsInSection(section: StoreSection): StoreProduct[] {
  return STORE_CATALOG.filter((p) => p.section === section);
}

/** Coin price of one unit of `itemId`, from the catalog. */
export function itemCoinPrice(itemId: GameplayItemId): number {
  const price = getProduct(itemProductId(itemId))?.price;
  if (price?.kind !== 'coins') throw new Error(`No coin product for item ${itemId}`);
  return price.amount;
}
