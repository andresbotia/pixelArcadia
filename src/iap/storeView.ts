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
  if (snap.status === 'initializing') return { priceLabel: null, buttonLabel: '…', disabled: true, state: 'loading' };
  const info = snap.products[id];
  if (snap.status === 'unavailable' || !info?.priceString?.trim()) {
    return { priceLabel: null, buttonLabel: 'N/A', disabled: true, state: 'unavailable' };
  }
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
