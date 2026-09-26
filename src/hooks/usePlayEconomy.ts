import { useCallback, useMemo, useRef, useState } from 'react';

import type { GameplayItemId } from '@/game/economy/config';
import { sandboxConsume, sandboxPurchase } from '@/game/economy/sandbox';
import { playPolicy, type PlayMode } from '@/game/playMode';
import type { EconomyInventory, EconomyState } from '@/storage/economy';
import { useEconomy, type EconomyApi } from '@/hooks/useEconomy';

/**
 * The economy a gameplay screen talks to. Campaign play gets the real,
 * persisted {@link useEconomy}. A run whose {@link playPolicy} forbids
 * persisting the economy (dev Level Browser) gets a sandbox:
 *  - coins shown are the player's real balance, never changed;
 *  - inventory starts as a copy of the real one and item use / restock only
 *    change that copy — it is dropped when the run unmounts;
 *  - first-clear settlement never awards.
 * The saved economy is still only ever written by `storage/economy`.
 */
export function usePlayEconomy(mode: PlayMode): EconomyApi {
  const real = useEconomy();
  const sandboxed = !playPolicy(mode).persistEconomy;
  // `null` until the run first spends/restocks: until then it mirrors the real
  // inventory (which may still be loading), so the snapshot is never stale.
  const [local, setLocal] = useState<EconomyInventory | null>(null);
  const inventory = local ?? real.economy.inventory;
  // Handler-side copy of `local`, advanced synchronously on every spend so two
  // taps in one frame can't both spend the same unit. Never read in render.
  const localRef = useRef<EconomyInventory | null>(null);
  const realInventory = real.economy.inventory;

  const economy = useMemo<EconomyState>(
    () => ({ ...real.economy, inventory }),
    [real.economy, inventory],
  );

  const settleFirstClear = useCallback(async (_levelId: number) => (
    { awarded: false, reward: 0, state: economy }
  ), [economy]);

  const consumeItem = useCallback(async (itemId: GameplayItemId) => {
    const next = sandboxConsume(localRef.current ?? realInventory, itemId);
    if (!next) return false;
    localRef.current = next;
    setLocal(next);
    return true;
  }, [realInventory]);

  const buyItem = useCallback(async (itemId: GameplayItemId) => {
    const { inventory: next } = sandboxPurchase(localRef.current ?? realInventory, itemId);
    localRef.current = next;
    setLocal(next);
    return { success: true, price: 0, state: { ...economy, inventory: next } };
  }, [realInventory, economy]);

  const hasItem = useCallback((itemId: GameplayItemId) => inventory[itemId] > 0, [inventory]);
  const noop = useCallback(async () => {}, []);

  const purchaseItem = useCallback(async (itemId: GameplayItemId) => {
    const res = await buyItem(itemId);
    return { status: 'success' as const, charged: 0, state: res.state };
  }, [buyItem]);

  const sandbox = useMemo<EconomyApi>(() => ({
    economy,
    loading: real.loading,
    settleFirstClear,
    buyItem,
    purchaseItem,
    consumeItem,
    canAfford: () => true,
    hasItem,
    reload: noop,
    reset: noop,
  }), [economy, real.loading, settleFirstClear, buyItem, purchaseItem, consumeItem, hasItem, noop]);

  return sandboxed ? sandbox : real;
}
