import { ITEM_DISPLAY_NAMES, type GameplayItemId } from '@/game/economy/config';
import type { StoreReward } from '@/game/economy/catalog';
import { formatCoinsFull } from '@/game/economy/formatCurrency';

import type { IapStoreProduct } from './catalog';
import type { PurchasesSnapshot } from './controller';

export interface IapCardView {
  /** StoreKit's localized price text, or null when there is none to show. Never fabricated. */
  priceLabel: string | null;
  buttonLabel: string;
  disabled: boolean;
  state: 'buy' | 'owned' | 'purchasing' | 'unavailable' | 'loading';
}

/** How a real-money product card renders for the current purchase state. Pure. */
export function iapCardView(product: IapStoreProduct, snap: PurchasesSnapshot): IapCardView {
  const id = product.price.productId;
  if (product.reward.entitlement === 'remove_ads' && snap.hasRemoveAds) {
    return { priceLabel: null, buttonLabel: 'OWNED', disabled: true, state: 'owned' };
  }
  const unavailable = { priceLabel: null, buttonLabel: 'N/A', disabled: true, state: 'unavailable' } as const;
  if (snap.status === 'unavailable') return unavailable; // no SDK / key: never configured
  const info = snap.products[id];
  const priced = !!info?.priceString?.trim();
  // Still asking the store: a loading card, never one that reads as permanently unavailable.
  if (snap.status === 'initializing' || (!priced && (snap.productFetch === 'idle' || snap.productFetch === 'loading'))) {
    return { priceLabel: null, buttonLabel: '…', disabled: true, state: 'loading' };
  }
  // Only once the store answered without this product (or the lookup failed).
  if (!info || !priced) return unavailable;
  if (snap.activeOperation === id) return { priceLabel: info.priceString, buttonLabel: '…', disabled: true, state: 'purchasing' };
  const buttonLabel = product.price.purchaseType === 'nonConsumable' ? 'PURCHASE' : 'BUY';
  // Another purchase/restore in flight: one at a time.
  return { priceLabel: info.priceString, buttonLabel, disabled: snap.activeOperation !== null, state: 'buy' };
}

const ITEM_ORDER: readonly GameplayItemId[] = ['undo', 'extraSlot', 'bomb'];

/** Human-readable contents of a reward ("1,000 Coins", "3 Undo", …). */
export function rewardLines(reward: StoreReward): string[] {
  const lines: string[] = [];
  if (reward.coins) lines.push(`${formatCoinsFull(reward.coins)} Coins`);
  for (const id of ITEM_ORDER) {
    const n = reward.items?.[id];
    if (n) lines.push(`${n} ${ITEM_DISPLAY_NAMES[id]}`);
  }
  return lines;
}
