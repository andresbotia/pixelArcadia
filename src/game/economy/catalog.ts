import { ITEM_DISPLAY_NAMES, M6_ECONOMY, type GameplayItemId } from './config';

/**
 * The Pixel Arcadia Store catalog — the one list of things a player can buy.
 * Pure data: the Store screen renders it, the gameplay restock prompt prices
 * from it, and `storage/economy` settles purchases against it.
 *
 * Store V1 sold the three gameplay items for coins. M13 adds real-money
 * products (coin packs, item bundles, Remove Ads) as entries in the SAME list:
 * this catalog is the one authoritative product → reward map. The price of an
 * `iap` product is never stored here — the display price always comes from
 * the App Store (localized) at runtime.
 */

/** Where a product is shown. */
export type StoreSection = 'items' | 'coins' | 'bundles' | 'removeAds';

/** App Store product type. Consumables grant once per transaction; non-consumables are entitlements. */
export type IapPurchaseType = 'consumable' | 'nonConsumable';

/**
 * How a product is paid for.
 * - `coins`: settled locally against the saved coin balance.
 * - `iap`: a real-money App Store product (via RevenueCat). `productId` is the
 *   App Store Connect product id; the price text is StoreKit's, never ours.
 */
export type StorePrice =
  | { readonly kind: 'coins'; readonly amount: number }
  | { readonly kind: 'iap'; readonly productId: string; readonly purchaseType: IapPurchaseType };

/** Permanent entitlements a non-consumable unlocks (RevenueCat entitlement ids). */
export type EntitlementId = 'remove_ads';

/** What a purchase grants. Any mix of items and coins, or an entitlement. */
export interface StoreReward {
  readonly items?: Readonly<Partial<Record<GameplayItemId, number>>>;
  readonly coins?: number;
  readonly entitlement?: EntitlementId;
}

/** Art for a product card. */
export type StoreIcon =
  | { readonly kind: 'item'; readonly itemId: GameplayItemId }
  | { readonly kind: 'coins' }
  | { readonly kind: 'bundle' }
  | { readonly kind: 'removeAds' };

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

/** App Store product ids (M13). Clean, future-safe, never renamed once live. */
export const IAP_PRODUCT_IDS = {
  coins500: 'pixel_arcadia_coins_500',
  coins1500: 'pixel_arcadia_coins_1500',
  coins3500: 'pixel_arcadia_coins_3500',
  coins8000: 'pixel_arcadia_coins_8000',
  starterPack: 'pixel_arcadia_starter_pack',
  boosterPack: 'pixel_arcadia_booster_pack',
  removeAds: 'pixel_arcadia_remove_ads',
} as const;

function coinPack(productId: string, coins: number, description: string): StoreProduct {
  return {
    id: productId,
    section: 'coins',
    title: `${coins.toLocaleString('en-US')} Coins`,
    description,
    icon: { kind: 'coins' },
    reward: { coins },
    price: { kind: 'iap', productId, purchaseType: 'consumable' },
  };
}

const IAP_CATALOG: readonly StoreProduct[] = [
  coinPack(IAP_PRODUCT_IDS.coins500, 500, 'A handful of coins.'),
  coinPack(IAP_PRODUCT_IDS.coins1500, 1500, 'A pouch of coins.'),
  coinPack(IAP_PRODUCT_IDS.coins3500, 3500, 'A chest of coins.'),
  coinPack(IAP_PRODUCT_IDS.coins8000, 8000, 'A vault of coins.'),
  {
    id: IAP_PRODUCT_IDS.starterPack,
    section: 'bundles',
    title: 'Starter Pack',
    description: 'Coins plus a set of every item.',
    icon: { kind: 'bundle' },
    reward: { coins: 1000, items: { undo: 3, extraSlot: 3, bomb: 3 } },
    price: { kind: 'iap', productId: IAP_PRODUCT_IDS.starterPack, purchaseType: 'consumable' },
  },
  {
    id: IAP_PRODUCT_IDS.boosterPack,
    section: 'bundles',
    title: 'Booster Pack',
    description: 'A big stack of every item.',
    icon: { kind: 'bundle' },
    reward: { items: { undo: 5, extraSlot: 5, bomb: 5 } },
    price: { kind: 'iap', productId: IAP_PRODUCT_IDS.boosterPack, purchaseType: 'consumable' },
  },
  {
    id: IAP_PRODUCT_IDS.removeAds,
    section: 'removeAds',
    title: 'Remove Ads',
    description: 'No forced interstitial ads. Rewarded ads stay optional.',
    icon: { kind: 'removeAds' },
    reward: { entitlement: 'remove_ads' },
    price: { kind: 'iap', productId: IAP_PRODUCT_IDS.removeAds, purchaseType: 'nonConsumable' },
  },
];

export const STORE_CATALOG: readonly StoreProduct[] = [...ITEM_ORDER.map(itemProduct), ...IAP_CATALOG];

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
