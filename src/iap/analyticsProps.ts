import { ITEM_DISPLAY_NAMES, type GameplayItemId } from '@/game/economy/config';

import { iapProduct } from './catalog';
import type { IapProductInfo } from './types';

/**
 * Analytics properties for a real-money product (M14). Product-focused only:
 * catalog id/category/reward, and StoreKit's price when known. Transaction ids
 * and customer info are deliberately never included.
 */
export function iapEventProps(productId: string, info: IapProductInfo | undefined): Record<string, string | number | boolean> {
  const product = iapProduct(productId);
  const props: Record<string, string | number | boolean> = {
    product_id: productId,
    product_category: product?.section ?? 'unknown',
    coins_granted: product?.reward.coins ?? 0,
    remove_ads: product?.reward.entitlement === 'remove_ads',
  };
  const items = Object.entries(product?.reward.items ?? {})
    .map(([id, n]) => `${n} ${ITEM_DISPLAY_NAMES[id as GameplayItemId]}`)
    .join(', ');
  if (items) props.items_granted_summary = items;
  if (info) {
    props.localized_price = info.priceString;
    if (typeof info.price === 'number') props.price_amount = info.price;
    if (info.currencyCode) props.currency_code = info.currencyCode;
  }
  return props;
}
