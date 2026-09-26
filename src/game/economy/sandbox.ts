import type { GameplayItemId } from './config';

/** Item counts, structurally the saved economy's inventory. */
export type SandboxInventory = Readonly<Record<GameplayItemId, number>>;

/**
 * Sandbox inventory rules for a run whose play policy forbids persisting the
 * economy (dev test mode). Pure — they never touch storage.
 */
export function sandboxConsume<T extends SandboxInventory>(inv: T, itemId: GameplayItemId): T | null {
  return inv[itemId] > 0 ? { ...inv, [itemId]: inv[itemId] - 1 } : null;
}

/** Dev restock: a free unit for this run only — coins are never charged. */
export function sandboxRestock<T extends SandboxInventory>(inv: T, itemId: GameplayItemId): T {
  return { ...inv, [itemId]: inv[itemId] + 1 };
}

/**
 * The dev-play "purchase": always succeeds, whatever the real coin balance —
 * no affordability check, no charge, only the run's sandbox inventory grows.
 */
export function sandboxPurchase<T extends SandboxInventory>(inv: T, itemId: GameplayItemId): { success: true; charged: 0; inventory: T } {
  return { success: true, charged: 0, inventory: sandboxRestock(inv, itemId) };
}
