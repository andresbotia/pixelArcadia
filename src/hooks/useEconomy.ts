import { useCallback, useEffect, useState } from 'react';
import {
  buyItem,
  consumeItem,
  DEFAULT_ECONOMY_STATE,
  loadEconomy,
  purchaseItem,
  resetEconomy,
  settleFirstClear,
  subscribeEconomy,
  type EconomyState,
  type PurchaseResult,
  type SettlementResult,
} from '@/storage/economy';
import { itemCoinPrice } from '@/game/economy/catalog';
import type { GameplayItemId } from '@/game/economy/config';

export interface EconomyApi {
  economy: EconomyState;
  loading: boolean;
  settleFirstClear: (levelId: number) => Promise<SettlementResult>;
  buyItem: (itemId: GameplayItemId) => Promise<PurchaseResult>;
  /** Store purchase: one unit of `itemId` for its catalog coin price. */
  purchaseItem: (itemId: GameplayItemId) => ReturnType<typeof purchaseItem>;
  consumeItem: (itemId: GameplayItemId) => Promise<boolean>;
  canAfford: (itemId: GameplayItemId) => boolean;
  hasItem: (itemId: GameplayItemId) => boolean;
  reload: () => Promise<void>;
  reset: () => Promise<void>;
}

export function useEconomy(): EconomyApi {
  const [economy, setEconomy] = useState<EconomyState>(DEFAULT_ECONOMY_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadEconomy()
      .then((state) => {
        if (active) {
          setEconomy(state);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    const unsubscribe = subscribeEconomy((next) => {
      if (active) {
        setEconomy(next);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const reload = useCallback(async () => {
    const loaded = await loadEconomy();
    setEconomy(loaded);
    setLoading(false);
  }, []);

  const handleSettleFirstClear = useCallback(async (levelId: number) => {
    return settleFirstClear(levelId);
  }, []);

  const handleBuyItem = useCallback(async (itemId: GameplayItemId) => {
    return buyItem(itemId);
  }, []);

  const handleConsumeItem = useCallback(async (itemId: GameplayItemId) => {
    const res = await consumeItem(itemId);
    return res.success;
  }, []);

  const canAfford = useCallback((itemId: GameplayItemId) => economy.coins >= itemCoinPrice(itemId), [economy.coins]);

  const hasItem = useCallback((itemId: GameplayItemId) => {
    return (economy.inventory[itemId] ?? 0) > 0;
  }, [economy.inventory]);

  const handleReset = useCallback(async () => {
    const resetState = await resetEconomy();
    setEconomy(resetState);
  }, []);

  return {
    economy,
    loading,
    settleFirstClear: handleSettleFirstClear,
    buyItem: handleBuyItem,
    purchaseItem,
    consumeItem: handleConsumeItem,
    canAfford,
    hasItem,
    reload,
    reset: handleReset,
  };
}
