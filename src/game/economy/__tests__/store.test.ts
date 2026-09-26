import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as fs from 'fs';
import * as path from 'path';

import { M6_ECONOMY, type GameplayItemId } from '@/game/economy/config';
import {
  getProduct, itemCoinPrice, itemProductId, productsInSection, STORE_CATALOG,
} from '@/game/economy/catalog';
import { applyCoinPurchase } from '@/game/economy/purchase';
import { sandboxConsume, sandboxPurchase, sandboxRestock } from '@/game/economy/sandbox';
import {
  _clearEconomyCache, buyItem, loadEconomy, purchaseItem, purchaseProduct,
} from '@/storage/economy';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

const STORAGE_KEY = 'orbitide/economy/v1';
async function saved() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

describe('Store catalog', () => {
  it('sells Undo 75, Extra Slot 125, Bomb 150 for coins', () => {
    expect(itemCoinPrice('undo')).toBe(75);
    expect(itemCoinPrice('extraSlot')).toBe(125);
    expect(itemCoinPrice('bomb')).toBe(150);
  });

  it('takes prices from the economy config — one source', () => {
    for (const id of ['undo', 'extraSlot', 'bomb'] as GameplayItemId[]) {
      expect(getProduct(itemProductId(id))?.price).toEqual({ kind: 'coins', amount: M6_ECONOMY.itemPrices[id] });
    }
  });

  it('V1 lists only the three coin-priced item products, each granting one unit', () => {
    expect(STORE_CATALOG.map((p) => p.id)).toEqual(['item_undo', 'item_extraSlot', 'item_bomb']);
    expect(productsInSection('coins')).toEqual([]);
    expect(productsInSection('bundles')).toEqual([]);
    for (const p of STORE_CATALOG) {
      expect(p.price.kind).toBe('coins');
      expect(p.icon.kind).toBe('item');
      expect(p.reward).toEqual({ items: { [p.icon.itemId]: 1 } });
    }
  });
});

describe('applyCoinPurchase (pure)', () => {
  const state = Object.freeze({ coins: 100, inventory: Object.freeze({ undo: 0, extraSlot: 0, bomb: 0 }) });

  it('charges and grants in one new state', () => {
    const out = applyCoinPurchase(state, 'item_undo');
    expect(out.status).toBe('success');
    expect(out.charged).toBe(75);
    expect(out.state).toEqual({ coins: 25, inventory: { undo: 1, extraSlot: 0, bomb: 0 } });
  });

  it('returns the untouched input on every failure', () => {
    for (const id of ['item_bomb', 'nope']) {
      const out = applyCoinPurchase(state, id);
      expect(out.state).toBe(state);
      expect(out.charged).toBe(0);
    }
    expect(applyCoinPurchase(state, 'item_bomb').status).toBe('insufficientFunds');
    expect(applyCoinPurchase(state, 'nope').status).toBe('invalidProduct');
  });
});

describe('purchaseItem (persisted)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    _clearEconomyCache();
  });

  it.each([
    ['undo', 75],
    ['extraSlot', 125],
    ['bomb', 150],
  ] as [GameplayItemId, number][])('buys %s: deducts %i coins, +1 inventory, persisted', async (itemId, price) => {
    const before = await loadEconomy();
    const res = await purchaseItem(itemId);
    expect(res.status).toBe('success');
    expect(res.charged).toBe(price);
    expect(res.state.coins).toBe(before.coins - price);
    expect(res.state.inventory[itemId]).toBe(before.inventory[itemId] + 1);
    for (const other of ['undo', 'extraSlot', 'bomb'] as GameplayItemId[]) {
      if (other !== itemId) expect(res.state.inventory[other]).toBe(before.inventory[other]);
    }
    const disk = await saved();
    expect(disk.coins).toBe(before.coins - price);
    expect(disk.inventory[itemId]).toBe(before.inventory[itemId] + 1);
  });

  it('allows repeated purchases until the coins run out (300 → four Undos)', async () => {
    for (let i = 1; i <= 4; i++) {
      const res = await purchaseItem('undo');
      expect(res.status).toBe('success');
      expect(res.state.coins).toBe(300 - 75 * i);
      expect(res.state.inventory.undo).toBe(2 + i);
    }
    const fifth = await purchaseItem('undo');
    expect(fifth.status).toBe('insufficientFunds');
    expect(fifth.state.coins).toBe(0);
    expect(fifth.state.inventory.undo).toBe(6);
  });

  it('rapid parallel taps settle serially and never overspend', async () => {
    const results = await Promise.all(Array.from({ length: 6 }, () => purchaseItem('undo')));
    expect(results.filter((r) => r.status === 'success')).toHaveLength(4);
    const final = await loadEconomy();
    expect(final.coins).toBe(0);
    expect(final.inventory.undo).toBe(6);
  });

  it('insufficient funds changes nothing — memory or disk', async () => {
    await purchaseItem('bomb'); // 300 → 150
    await purchaseItem('extraSlot'); // 150 → 25
    const before = await loadEconomy();
    const diskBefore = await saved();
    const res = await purchaseItem('bomb');
    expect(res.status).toBe('insufficientFunds');
    expect(res.charged).toBe(0);
    expect(await loadEconomy()).toEqual(before);
    expect(await saved()).toEqual(diskBefore);
  });

  it('an invalid product changes nothing', async () => {
    const before = await loadEconomy();
    const res = await purchaseProduct('coins_500');
    expect(res.status).toBe('invalidProduct');
    expect(await loadEconomy()).toEqual(before);
    expect(await saved()).toBeNull();
  });
});

describe('Gameplay restock shares the Store purchase', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    _clearEconomyCache();
  });

  it('buyItem charges exactly the catalog price via the same operation', async () => {
    for (const id of ['undo', 'extraSlot', 'bomb'] as GameplayItemId[]) {
      await AsyncStorage.clear();
      _clearEconomyCache();
      const res = await buyItem(id);
      expect(res.success).toBe(true);
      expect(res.price).toBe(itemCoinPrice(id));
      expect(res.state.coins).toBe(300 - itemCoinPrice(id));
    }
  });

  it('the restock prompt and economy hook read prices only from the catalog', () => {
    const root = path.resolve(__dirname, '../../../..');
    for (const file of ['src/components/gameplay/RestockModal.tsx', 'src/hooks/useEconomy.ts', 'src/storage/economy.ts']) {
      const src = fs.readFileSync(path.join(root, file), 'utf8');
      expect(src).not.toMatch(/itemPrices/);
    }
    expect(fs.readFileSync(path.join(root, 'src/components/gameplay/RestockModal.tsx'), 'utf8')).toMatch(/itemCoinPrice\(/);
  });
});

describe('Dev sandbox stays isolated from the Store inventory', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    _clearEconomyCache();
  });

  it('sandbox restock / use never reach the saved economy', async () => {
    await purchaseItem('undo'); // a real Store purchase persists
    const real = await loadEconomy();
    const disk = await saved();

    let run = { ...real.inventory };
    run = sandboxRestock(run, 'bomb');
    run = sandboxRestock(run, 'bomb');
    run = sandboxConsume(run, 'undo') ?? run;

    expect(run.bomb).toBe(real.inventory.bomb + 2);
    expect(await loadEconomy()).toEqual(real);
    expect(await saved()).toEqual(disk);
  });

  it('the dev play economy never calls a real economy write', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../../../hooks/usePlayEconomy.ts'), 'utf8');
    expect(src).not.toMatch(/real\.(buyItem|purchaseItem|consumeItem|settleFirstClear|reset)\b/);
    // Only type imports from storage — no storage function is reachable from it.
    expect(src).not.toMatch(/^import (?!type )[^;]*from '@\/storage\/economy'/m);
  });
});

describe('Restock with 0 real coins', () => {
  const broke = { coins: 0, inventory: { undo: 1, extraSlot: 1, bomb: 1 }, rewardedLevelIds: [] };

  beforeEach(async () => {
    await AsyncStorage.clear();
    _clearEconomyCache();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(broke));
  });

  it('dev play: Bomb (150) restock succeeds free and the save is untouched', async () => {
    const real = await loadEconomy();
    expect(real.coins).toBe(0);
    expect(itemCoinPrice('bomb')).toBe(150);
    const disk = await saved();

    const res = sandboxPurchase(real.inventory, 'bomb');
    expect(res.success).toBe(true);
    expect(res.charged).toBe(0);
    expect(res.inventory.bomb).toBe(real.inventory.bomb + 1);

    expect(await saved()).toEqual(disk);
    expect((await loadEconomy()).coins).toBe(0);
    expect((await loadEconomy()).inventory).toEqual(broke.inventory);
  });

  it('campaign: the same restock is refused as insufficient funds, nothing changes', async () => {
    const disk = await saved();
    expect((await purchaseItem('bomb')).status).toBe('insufficientFunds');
    const legacy = await buyItem('bomb');
    expect(legacy.success).toBe(false);
    expect(legacy.reason).toBe('insufficientCoins');
    expect(await saved()).toEqual(disk);
  });

  it('the restock prompt leaves affordability to the economy behind onBuy', () => {
    // RN modal can't render under node; guard the regression at the source.
    const src = fs.readFileSync(path.resolve(__dirname, '../../../components/gameplay/RestockModal.tsx'), 'utf8');
    expect(src).not.toMatch(/coins\s*<\s*price/);
    expect(fs.readFileSync(path.resolve(__dirname, '../../../hooks/usePlayEconomy.ts'), 'utf8')).toMatch(/sandboxPurchase\(/);
  });
});
