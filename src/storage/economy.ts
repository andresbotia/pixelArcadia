import AsyncStorage from '@react-native-async-storage/async-storage';
import { itemCoinPrice, itemProductId } from '@/game/economy/catalog';
import { M6_ECONOMY, type GameplayItemId } from '@/game/economy/config';
import { applyCoinPurchase, type PurchaseStatus } from '@/game/economy/purchase';

const STORAGE_KEY = 'orbitide/economy/v1';

export interface EconomyInventory {
  undo: number;
  extraSlot: number;
  bomb: number;
}

export interface EconomyState {
  coins: number;
  inventory: EconomyInventory;
  rewardedLevelIds: number[];
}

export const DEFAULT_ECONOMY_STATE: EconomyState = {
  coins: M6_ECONOMY.startingCoins,
  inventory: {
    undo: M6_ECONOMY.startingInventory.undo,
    extraSlot: M6_ECONOMY.startingInventory.extraSlot,
    bomb: M6_ECONOMY.startingInventory.bomb,
  },
  rewardedLevelIds: [],
};

export function sanitizeEconomy(raw: unknown): EconomyState {
  if (!raw || typeof raw !== 'object') {
    return {
      coins: DEFAULT_ECONOMY_STATE.coins,
      inventory: { ...DEFAULT_ECONOMY_STATE.inventory },
      rewardedLevelIds: [],
    };
  }

  const r = raw as Record<string, unknown>;

  let coins = DEFAULT_ECONOMY_STATE.coins;
  if (typeof r.coins === 'number' && Number.isFinite(r.coins)) {
    coins = Math.max(0, Math.floor(r.coins));
  }

  const inventory: EconomyInventory = { ...DEFAULT_ECONOMY_STATE.inventory };
  if (r.inventory && typeof r.inventory === 'object') {
    const inv = r.inventory as Record<string, unknown>;
    for (const key of ['undo', 'extraSlot', 'bomb'] as const) {
      const val = inv[key];
      if (typeof val === 'number' && Number.isFinite(val)) {
        inventory[key] = Math.max(0, Math.floor(val));
      }
    }
  }

  const rewardedLevelIds: number[] = [];
  if (Array.isArray(r.rewardedLevelIds)) {
    const seen = new Set<number>();
    for (const id of r.rewardedLevelIds) {
      if (typeof id === 'number' && Number.isFinite(id)) {
        const floored = Math.floor(id);
        if (!seen.has(floored)) {
          seen.add(floored);
          rewardedLevelIds.push(floored);
        }
      }
    }
  }

  return {
    coins,
    inventory,
    rewardedLevelIds,
  };
}

type EconomyListener = (state: EconomyState) => void;
const listeners = new Set<EconomyListener>();

let cachedState: EconomyState | null = null;
let mutationQueue: Promise<unknown> = Promise.resolve();

export function subscribeEconomy(listener: EconomyListener): () => void {
  listeners.add(listener);
  if (cachedState) {
    listener(cachedState);
  }
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(state: EconomyState): void {
  for (const listener of listeners) {
    try {
      listener(state);
    } catch {
      // Ignore errors in listener callbacks
    }
  }
}

/** Load persisted economy state from storage. */
export async function loadEconomy(): Promise<EconomyState> {
  if (cachedState) {
    return cachedState;
  }
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) {
      cachedState = {
        coins: DEFAULT_ECONOMY_STATE.coins,
        inventory: { ...DEFAULT_ECONOMY_STATE.inventory },
        rewardedLevelIds: [],
      };
    } else {
      cachedState = sanitizeEconomy(JSON.parse(stored));
    }
  } catch {
    cachedState = {
      coins: DEFAULT_ECONOMY_STATE.coins,
      inventory: { ...DEFAULT_ECONOMY_STATE.inventory },
      rewardedLevelIds: [],
    };
  }
  return cachedState;
}

async function persistEconomy(state: EconomyState): Promise<EconomyState> {
  cachedState = state;
  notifyListeners(state);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Non-fatal: progress will stay in-memory for this session.
  }
  return state;
}

function queueMutation<T>(mutator: (current: EconomyState) => { next: EconomyState; result: T }): Promise<T> {
  const op = mutationQueue.then(async () => {
    const current = await loadEconomy();
    const { next, result } = mutator(current);
    if (next !== current) {
      await persistEconomy(next);
    }
    return result;
  });
  mutationQueue = op.catch(() => {});
  return op;
}

export interface SettlementResult {
  awarded: boolean;
  reward: number;
  state: EconomyState;
}

/**
 * Idempotently awards first-clear coins for `levelId`.
 * If level was already rewarded, returns awarded: false and does not mutate.
 */
export async function settleFirstClear(levelId: number): Promise<SettlementResult> {
  return queueMutation<SettlementResult>((current) => {
    if (current.rewardedLevelIds.includes(levelId)) {
      return {
        next: current,
        result: { awarded: false, reward: 0, state: current },
      };
    }

    const next: EconomyState = {
      ...current,
      coins: current.coins + M6_ECONOMY.firstClearReward,
      rewardedLevelIds: [...current.rewardedLevelIds, levelId],
    };

    return {
      next,
      result: {
        awarded: true,
        reward: M6_ECONOMY.firstClearReward,
        state: next,
      },
    };
  });
}

export interface StorePurchaseResult {
  status: PurchaseStatus;
  /** Coins charged (0 unless `success`). */
  charged: number;
  /** Economy after the attempt — unchanged unless `success`. */
  state: EconomyState;
}

/**
 * THE purchase operation. Settles one catalog product against the saved
 * economy inside the mutation queue: the coin charge and the reward are one
 * state transition ({@link applyCoinPurchase}) and one persist, so a purchase
 * either fully happens or leaves the save untouched. Every buy path (Store,
 * gameplay restock) goes through here.
 */
export async function purchaseProduct(productId: string): Promise<StorePurchaseResult> {
  return queueMutation<StorePurchaseResult>((current) => {
    const outcome = applyCoinPurchase(current, productId);
    return {
      next: outcome.state,
      result: { status: outcome.status, charged: outcome.charged, state: outcome.state },
    };
  });
}

export type ItemPurchaseStatus = 'success' | 'insufficientFunds' | 'invalidItem';

/** Buy one unit of a gameplay item for coins (Store V1's only product kind). */
export async function purchaseItem(itemId: GameplayItemId): Promise<{ status: ItemPurchaseStatus; charged: number; state: EconomyState }> {
  const res = await purchaseProduct(itemProductId(itemId));
  const status: ItemPurchaseStatus = res.status === 'success' || res.status === 'insufficientFunds' ? res.status : 'invalidItem';
  return { status, charged: res.charged, state: res.state };
}

export interface PurchaseResult {
  success: boolean;
  reason?: 'insufficientCoins' | 'unknownItem';
  price?: number;
  state: EconomyState;
}

/**
 * Purchases exactly 1 unit of `itemId` if player has sufficient coins.
 * Legacy result shape for the gameplay restock prompt; delegates to
 * {@link purchaseItem}, so there is one purchase implementation.
 */
export async function buyItem(itemId: GameplayItemId): Promise<PurchaseResult> {
  const res = await purchaseItem(itemId);
  if (res.status === 'invalidItem') return { success: false, reason: 'unknownItem', state: res.state };
  const price = itemCoinPrice(itemId);
  if (res.status === 'insufficientFunds') return { success: false, reason: 'insufficientCoins', price, state: res.state };
  return { success: true, price, state: res.state };
}

export interface ConsumeResult {
  success: boolean;
  state: EconomyState;
}

/**
 * Atomically consumes 1 unit of `itemId` from inventory.
 * Fails if quantity <= 0.
 */
export async function consumeItem(itemId: GameplayItemId): Promise<ConsumeResult> {
  return queueMutation<ConsumeResult>((current) => {
    if (current.inventory[itemId] <= 0) {
      return {
        next: current,
        result: { success: false, state: current },
      };
    }

    const next: EconomyState = {
      ...current,
      inventory: {
        ...current.inventory,
        [itemId]: current.inventory[itemId] - 1,
      },
    };

    return {
      next,
      result: { success: true, state: next },
    };
  });
}

/**
 * Reset economy to initial test configuration.
 */
export async function resetEconomy(): Promise<EconomyState> {
  return queueMutation(() => {
    const next: EconomyState = {
      coins: M6_ECONOMY.startingCoins,
      inventory: {
        undo: M6_ECONOMY.startingInventory.undo,
        extraSlot: M6_ECONOMY.startingInventory.extraSlot,
        bomb: M6_ECONOMY.startingInventory.bomb,
      },
      rewardedLevelIds: [],
    };
    return {
      next,
      result: next,
    };
  });
}

/** Dev-only test helper to clear in-memory cache between tests. */
export function _clearEconomyCache(): void {
  cachedState = null;
  mutationQueue = Promise.resolve();
}
