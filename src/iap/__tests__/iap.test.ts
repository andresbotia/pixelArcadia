import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { adsPolicyFor } from '@/ads/policy';
import { IAP_PRODUCT_IDS, STORE_CATALOG } from '@/game/economy/catalog';
import { applyIapGrant } from '@/game/economy/purchase';
import { _clearEconomyCache, loadEconomy, reconcileIapPurchases } from '@/storage/economy';
import { _flushIapWrites, _resetIapCache, getCachedRemoveAds, loadIapCache, saveRemoveAds } from '@/storage/iap';

import { IAP_CATALOG, IAP_IDS, iapProduct, isConsumableProduct } from '../catalog';
import { REMOVE_ADS_ENTITLEMENT, readRevenueCatBuildMode, readRevenueCatKeys, resolveRevenueCatKey } from '../config';
import { PurchasesController, type PurchasesSnapshot } from '../controller';
import { iapCardView, rewardLines } from '../storeView';
import type { AdsPolicy } from '@/ads/types';
import { FakePurchases, flush, localizedProducts } from './fakePurchases';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

const ID = IAP_PRODUCT_IDS;
const ALL_PRICES = localizedProducts({
  [ID.coins500]: '$0.99', [ID.coins1500]: '$2.99', [ID.coins3500]: '$4.99', [ID.coins8000]: '$9.99',
  [ID.starterPack]: '$2.99', [ID.boosterPack]: '$2.99', [ID.removeAds]: '$4.99',
});
const activeControllers: PurchasesController[] = [];

beforeEach(async () => {
  await AsyncStorage.clear();
  _clearEconomyCache();
  _resetIapCache();
});

afterEach(async () => {
  for (const controller of activeControllers.splice(0)) controller.stop();
  await flush();
  // Listener grants run in the background; drain the shared mutation queue
  // before another test clears the in-memory cache and AsyncStorage.
  await reconcileIapPurchases([{ transactionId: 'test_drain', productId: '__none__', purchasedAt: Date.now() }]);
  await _flushIapWrites();
});

/** A started controller wired to the REAL economy store, with ads policy captured. */
async function setup(opts: { key?: string | null; sdk?: FakePurchases | null; cachedRemoveAds?: boolean; logs?: string[] } = {}) {
  const sdk = opts.sdk === undefined ? new FakePurchases() : opts.sdk;
  if (sdk) sdk.storeProducts = ALL_PRICES;
  const policies: AdsPolicy[] = [];
  const ctl = new PurchasesController(sdk, opts.key === undefined ? 'appl_test' : opts.key, {
    reconcileConsumables: reconcileIapPurchases,
    persistRemoveAds: saveRemoveAds,
    onRemoveAdsChange: (owned) => policies.push(adsPolicyFor(owned)),
    log: (message) => opts.logs?.push(message),
  }, opts.cachedRemoveAds ?? false);
  activeControllers.push(ctl);
  await loadEconomy(); // boot preload: starts the IAP ledger before any purchase
  ctl.start();
  await ctl.refresh();
  await flush();
  return { sdk: sdk!, ctl, policies };
}

let serial = 0;
/**
 * Start a purchase and confirm it EXACTLY as the real SDK reports a success:
 * the result carries Apple's StoreKit transaction id, while its CustomerInfo
 * lists the new transaction under RevenueCat's own (different) id.
 */
async function confirmPurchase(sdk: FakePurchases, ctl: PurchasesController, productId: string, opts: { entitlements?: string[] } = {}) {
  serial += 1;
  const rcTx = { transactionId: `rc_${serial}`, productId, purchasedAt: Date.now() };
  const customer = {
    activeEntitlements: opts.entitlements ?? sdk.customer.activeEntitlements,
    transactions: [...sdk.customer.transactions, rcTx],
  };
  const p = ctl.purchase(productId);
  await flush();
  sdk.customer = customer;
  sdk.pending.shift()!.resolve({ status: 'purchased', productId, storeTransactionId: `20000000${900 + serial}`, customer });
  return { outcome: await p, rcTx };
}

/** A confirmed account transaction dated inside this install's ledger. */
async function tx(productId: string, transactionId: string) {
  const e = await loadEconomy();
  return { transactionId, productId, purchasedAt: e.iapLedger.startedAt + 1_000 };
}

describe('catalog', () => {
  it('1. every configured product id maps to exactly one reward', () => {
    expect(IAP_IDS).toEqual([
      'pixel_arcadia_coins_500', 'pixel_arcadia_coins_1500', 'pixel_arcadia_coins_3500',
      'pixel_arcadia_coins_8000', 'pixel_arcadia_starter_pack',
      'pixel_arcadia_booster_pack', 'pixel_arcadia_remove_ads',
    ]);
    expect([...IAP_IDS].sort()).toEqual(Object.values(ID).sort());
    for (const id of IAP_IDS) {
      expect(STORE_CATALOG.filter((p) => p.id === id || (p.price.kind === 'iap' && p.price.productId === id))).toHaveLength(1);
      const r = iapProduct(id)!.reward;
      expect(Boolean(r.coins || r.items || r.entitlement)).toBe(true);
    }
    expect(iapProduct(ID.coins500)!.reward).toEqual({ coins: 500 });
    expect(iapProduct(ID.coins1500)!.reward).toEqual({ coins: 1500 });
    expect(iapProduct(ID.coins3500)!.reward).toEqual({ coins: 3500 });
    expect(iapProduct(ID.coins8000)!.reward).toEqual({ coins: 8000 });
    expect(iapProduct(ID.starterPack)!.reward).toEqual({ coins: 1000, items: { undo: 3, extraSlot: 3, bomb: 3 } });
    expect(iapProduct(ID.boosterPack)!.reward).toEqual({ items: { undo: 5, extraSlot: 5, bomb: 5 } });
  });

  it('2. an unknown product id grants nothing', async () => {
    await loadEconomy();
    const before = await loadEconomy();
    expect(await reconcileIapPurchases([await tx('pixel_arcadia_coins_999999', 'rc_x')])).toEqual([]);
    expect(await loadEconomy()).toEqual(before);
    expect(iapProduct('item_undo')).toBeUndefined(); // coin-priced items are not IAP products
  });

  it('3. Remove Ads is non-consumable (an entitlement, never granted as a consumable)', async () => {
    expect(iapProduct(ID.removeAds)!.price.purchaseType).toBe('nonConsumable');
    expect(iapProduct(ID.removeAds)!.reward).toEqual({ entitlement: REMOVE_ADS_ENTITLEMENT });
    const before = await loadEconomy();
    expect(await reconcileIapPurchases([await tx(ID.removeAds, 'rc_ra')])).toEqual([]);
    expect(await loadEconomy()).toEqual(before);
  });

  it('4. coin packs (and bundles) are consumable', () => {
    for (const id of [ID.coins500, ID.coins1500, ID.coins3500, ID.coins8000, ID.starterPack, ID.boosterPack]) {
      expect(isConsumableProduct(id)).toBe(true);
    }
    expect(IAP_CATALOG.every((p) => !('amount' in p.price))).toBe(true); // no prices stored by us
  });
});

describe('consumable grants (atomic, ledgered)', () => {
  const coins = async () => (await loadEconomy()).coins;

  it('5–6. 500 → +500 coins, 1500 → +1500 coins', async () => {
    const start = await coins();
    await reconcileIapPurchases([await tx(ID.coins500, 'rc_1')]);
    expect(await coins()).toBe(start + 500);
    await reconcileIapPurchases([await tx(ID.coins1500, 'rc_2')]);
    expect(await coins()).toBe(start + 2000);
  });

  it('7. a bundle grants its exact coins and items into the existing economy', async () => {
    const before = await loadEconomy();
    await reconcileIapPurchases([await tx(ID.starterPack, 'rc_s')]);
    const after = await loadEconomy();
    expect(after.coins).toBe(before.coins + 1000);
    expect(after.inventory).toEqual({
      undo: before.inventory.undo + 3, extraSlot: before.inventory.extraSlot + 3, bomb: before.inventory.bomb + 3,
    });
    await reconcileIapPurchases([await tx(ID.boosterPack, 'rc_b')]);
    const boosted = await loadEconomy();
    expect(boosted.coins).toBe(after.coins);
    expect(boosted.inventory.bomb).toBe(after.inventory.bomb + 5);
  });

  it('8. the same transaction id twice grants once — even concurrently', async () => {
    const start = await coins();
    const t = await tx(ID.coins500, 'rc_dup');
    const results = await Promise.all([reconcileIapPurchases([t]), reconcileIapPurchases([t]), reconcileIapPurchases([t, t])]);
    expect(results.map((r) => r.length)).toEqual([1, 0, 0]);
    expect(await coins()).toBe(start + 500);
  });

  it('9. two different transaction ids both grant', async () => {
    const start = await coins();
    await reconcileIapPurchases([await tx(ID.coins500, 'rc_a'), await tx(ID.coins500, 'rc_b')]);
    expect(await coins()).toBe(start + 1000);
  });

  it('repeat starter and booster purchases grant once per distinct transaction', async () => {
    const before = await loadEconomy();
    const starter = await tx(ID.starterPack, 'rc_starter_repeat_1');
    const booster = await tx(ID.boosterPack, 'rc_booster_repeat_1');
    await reconcileIapPurchases([starter, booster, starter, booster]);
    await reconcileIapPurchases([
      await tx(ID.starterPack, 'rc_starter_repeat_2'),
      await tx(ID.boosterPack, 'rc_booster_repeat_2'),
    ]);
    const after = await loadEconomy();
    expect(after.coins).toBe(before.coins + 2000);
    for (const item of ['undo', 'extraSlot', 'bomb'] as const) {
      expect(after.inventory[item]).toBe(before.inventory[item] + 16);
    }
  });

  it('grant + ledger mark are one persisted write that survives a restart', async () => {
    const t = await tx(ID.coins3500, 'rc_persist');
    await reconcileIapPurchases([t]);
    const granted = await coins();
    _clearEconomyCache();
    const reloaded = await loadEconomy();
    expect(reloaded.iapLedger.processed).toContain('rc_persist');
    expect(reloaded.coins).toBe(granted);
    expect(await reconcileIapPurchases([t])).toEqual([]);
  });

  it('a failed grant write exposes neither reward nor processed marker and can retry', async () => {
    const before = await loadEconomy();
    const transaction = await tx(ID.coins3500, 'rc_write_retry');
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk unavailable'));
    await expect(reconcileIapPurchases([transaction])).rejects.toThrow('disk unavailable');
    expect(await loadEconomy()).toEqual(before);
    _clearEconomyCache();
    expect(await loadEconomy()).toEqual(before);
    expect(await reconcileIapPurchases([transaction])).toHaveLength(1);
    const after = await loadEconomy();
    expect(after.coins).toBe(before.coins + 3500);
    expect(after.iapLedger.processed).toContain(transaction.transactionId);
  });

  it('crash recovery: a confirmed consumable this install never granted is granted once on the next refresh', async () => {
    const start = await coins();
    const t = await tx(ID.coins8000, 'rc_crash');
    await reconcileIapPurchases([t]);
    await reconcileIapPurchases([t]);
    expect(await coins()).toBe(start + 8000);
  });

  it('restore/reinstall safety: transactions older than this install\'s ledger never become coins', async () => {
    const e = await loadEconomy();
    await reconcileIapPurchases([
      { transactionId: 'rc_old', productId: ID.coins8000, purchasedAt: e.iapLedger.startedAt - 1 },
      { transactionId: 'rc_nodate', productId: ID.coins8000, purchasedAt: Number.NaN },
    ]);
    expect(await coins()).toBe(e.coins);
  });

  it('the pure grant never mutates and rejects a missing transaction id', () => {
    const s = Object.freeze({ coins: 0, inventory: { undo: 0, extraSlot: 0, bomb: 0 }, iapLedger: { startedAt: 1, processed: [] } });
    expect(applyIapGrant(s, ID.coins500, '').status).toBe('invalidTransaction');
    expect(applyIapGrant(s, ID.coins500, 't').state).not.toBe(s);
    expect(applyIapGrant(s, ID.removeAds, 't').status).toBe('notConsumable');
    expect(s.coins).toBe(0);
  });
});

describe('purchase flow (controller)', () => {
  it('configures once, keeps one customer listener, and omits transaction ids from logs', async () => {
    const logs: string[] = [];
    const sdk = new FakePurchases();
    let configures = 0;
    sdk.configureImpl = (key) => { configures += 1; sdk.configured = key; };
    const { ctl } = await setup({ sdk, logs });
    ctl.start();
    expect(configures).toBe(1);
    expect(sdk.listeners.size).toBe(1);
    const { outcome, rcTx } = await confirmPurchase(sdk, ctl, ID.coins500);
    expect(outcome).toBe('purchased');
    expect(logs.join('\n')).not.toContain(rcTx.transactionId);
    expect(logs.join('\n')).not.toContain('20000000');
    expect(logs.join('\n')).not.toContain('appl_test');
  });

  it('10. a failed purchase grants nothing and reports failed', async () => {
    const { sdk, ctl } = await setup();
    const before = await loadEconomy();
    const p = ctl.purchase(ID.coins500);
    await flush();
    sdk.pending.shift()!.resolve({ status: 'failed', message: 'payment declined' });
    await expect(p).resolves.toBe('failed');
    expect(await loadEconomy()).toEqual(before);
  });

  it('10b. a throwing SDK purchase is contained as failed', async () => {
    const { sdk, ctl } = await setup();
    const before = await loadEconomy();
    const p = ctl.purchase(ID.coins500);
    await flush();
    sdk.pending.shift()!.reject(new Error('native crash'));
    await expect(p).resolves.toBe('failed');
    expect(await loadEconomy()).toEqual(before);
    expect(ctl.getSnapshot().status).toBe('ready');
  });

  it('11. a cancelled purchase grants nothing and returns quietly', async () => {
    const { sdk, ctl } = await setup();
    const before = await loadEconomy();
    const p = ctl.purchase(ID.starterPack);
    await flush();
    sdk.pending.shift()!.resolve({ status: 'cancelled' });
    await expect(p).resolves.toBe('cancelled');
    expect(await loadEconomy()).toEqual(before);
  });

  it('5 (end to end). buying 500 coins adds exactly 500', async () => {
    const { sdk, ctl } = await setup();
    const start = (await loadEconomy()).coins;
    const { outcome } = await confirmPurchase(sdk, ctl, ID.coins500);
    expect(outcome).toBe('purchased');
    expect((await loadEconomy()).coins).toBe(start + 500);
  });

  it('REGRESSION: StoreKit id ≠ RevenueCat id — result, listener, resume and restart never double-grant', async () => {
    const { sdk, ctl } = await setup();
    const start = (await loadEconomy()).coins;
    // The listener fires with the new transaction BEFORE the purchase promise
    // resolves (real RevenueCat ordering), then the result arrives with
    // Apple's id, then an app-resume refresh repeats CustomerInfo.
    const rcTx = { transactionId: 'rc_live', productId: ID.coins1500, purchasedAt: Date.now() };
    const p = ctl.purchase(ID.coins1500);
    await flush();
    sdk.emitCustomer({ activeEntitlements: [], transactions: [rcTx] });
    sdk.pending.shift()!.resolve({ status: 'purchased', productId: ID.coins1500, storeTransactionId: '2000000555', customer: sdk.customer });
    await expect(p).resolves.toBe('purchased');
    await flush();
    sdk.emitCustomer({ activeEntitlements: [], transactions: [rcTx] });
    await ctl.refresh();
    await flush();
    expect((await loadEconomy()).coins).toBe(start + 1500);
    _clearEconomyCache();
    await loadEconomy();
    await ctl.refresh(); // next launch
    await flush();
    expect((await loadEconomy()).coins).toBe(start + 1500);
  });

  it('a device clock that was AHEAD at ledger start never swallows a real purchase (and only that one is exempt)', async () => {
    const { sdk, ctl } = await setup();
    const e = await loadEconomy();
    const start = e.coins;
    const serverNow = e.iapLedger.startedAt - 6 * 60 * 60 * 1000; // store says 6h "before" the ledger
    const older = { transactionId: 'rc_restored_old', productId: ID.coins500, purchasedAt: serverNow - 1000 };
    const bought = { transactionId: 'rc_now', productId: ID.coins500, purchasedAt: serverNow };
    const p = ctl.purchase(ID.coins500);
    await flush();
    sdk.customer = { activeEntitlements: [], transactions: [older, bought] };
    sdk.pending.shift()!.resolve({ status: 'purchased', productId: ID.coins500, storeTransactionId: '2000000888', customer: sdk.customer });
    await expect(p).resolves.toBe('purchased');
    expect((await loadEconomy()).coins).toBe(start + 500); // this purchase only — the older one stays excluded
    await ctl.refresh();
    await flush();
    expect((await loadEconomy()).coins).toBe(start + 500);
  });

  it('if the result\'s CustomerInfo lagged, one fresh read delivers the reward', async () => {
    const { sdk, ctl } = await setup();
    const start = (await loadEconomy()).coins;
    const p = ctl.purchase(ID.coins500);
    await flush();
    sdk.customer = { activeEntitlements: [], transactions: [{ transactionId: 'rc_lag', productId: ID.coins500, purchasedAt: Date.now() }] };
    sdk.pending.shift()!.resolve({ status: 'purchased', productId: ID.coins500, storeTransactionId: '2000000777', customer: { activeEntitlements: [], transactions: [] } });
    await expect(p).resolves.toBe('purchased');
    expect((await loadEconomy()).coins).toBe(start + 500);
  });

  it('20. one purchase at a time', async () => {
    const { sdk, ctl } = await setup();
    const first = ctl.purchase(ID.coins500);
    await expect(ctl.purchase(ID.coins1500)).resolves.toBe('busy');
    await expect(ctl.restore()).resolves.toBe('failed');
    await flush();
    expect(sdk.pending).toHaveLength(1);
    sdk.pending.shift()!.resolve({ status: 'cancelled' });
    await first;
    expect(ctl.getSnapshot().activeOperation).toBeNull();
  });
});

describe('Remove Ads + ads policy', () => {
  it('12–14. inactive → interstitials on; active → interstitials off; rewarded always on', () => {
    expect(adsPolicyFor(false)).toEqual({ interstitialsEnabled: true, rewardedEnabled: true });
    expect(adsPolicyFor(true)).toEqual({ interstitialsEnabled: false, rewardedEnabled: true });
  });

  it('buying Remove Ads activates the entitlement and flips the ads policy at once', async () => {
    const { sdk, ctl, policies } = await setup();
    const before = (await loadEconomy()).coins;
    const { outcome } = await confirmPurchase(sdk, ctl, ID.removeAds, { entitlements: [REMOVE_ADS_ENTITLEMENT] });
    expect(outcome).toBe('purchased');
    expect((await loadEconomy()).coins).toBe(before); // an entitlement, not coins
    expect(ctl.getSnapshot().hasRemoveAds).toBe(true);
    expect(policies[policies.length - 1]).toEqual({ interstitialsEnabled: false, rewardedEnabled: true });
    await expect(ctl.purchase(ID.removeAds)).resolves.toBe('alreadyOwned');
  });

  it('15. the entitlement persists across a restart (cached) and is reconciled by RevenueCat', async () => {
    const first = await setup();
    first.sdk.emitCustomer({ activeEntitlements: [REMOVE_ADS_ENTITLEMENT], transactions: [] });
    await _flushIapWrites();
    _resetIapCache();
    expect(await loadIapCache()).toBe(true);
    // Next launch, OFFLINE: RevenueCat can't answer, the cached entitlement still applies.
    const offline = new FakePurchases();
    offline.customerImpl = () => Promise.reject(new Error('offline'));
    offline.productsImpl = () => Promise.reject(new Error('offline'));
    const second = await setup({ sdk: offline, cachedRemoveAds: getCachedRemoveAds() });
    expect(second.ctl.getSnapshot().hasRemoveAds).toBe(true);
    expect(second.policies[0]).toEqual({ interstitialsEnabled: false, rewardedEnabled: true });
    expect(second.ctl.getSnapshot().status).toBe('error');
    // RevenueCat later reports it revoked (refund): policy follows.
    offline.emitCustomer({ activeEntitlements: [], transactions: [] });
    expect(second.ctl.getSnapshot().hasRemoveAds).toBe(false);
    expect(second.policies[second.policies.length - 1]?.interstitialsEnabled).toBe(true);
  });

  it('16. restore activates the entitlement — and never turns old consumables into coins', async () => {
    const { sdk, ctl, policies } = await setup();
    const e = await loadEconomy();
    sdk.restoreImpl = () => Promise.resolve({
      activeEntitlements: [REMOVE_ADS_ENTITLEMENT],
      transactions: [
        { transactionId: 'rc_old_ra', productId: ID.removeAds, purchasedAt: e.iapLedger.startedAt - 10_000 },
        { transactionId: 'rc_old_coins', productId: ID.coins8000, purchasedAt: e.iapLedger.startedAt - 10_000 },
        { transactionId: 'rc_old_starter', productId: ID.starterPack, purchasedAt: e.iapLedger.startedAt - 10_000 },
        { transactionId: 'rc_old_booster', productId: ID.boosterPack, purchasedAt: e.iapLedger.startedAt - 10_000 },
      ],
    });
    await expect(ctl.restore()).resolves.toBe('restored');
    await flush();
    expect(ctl.getSnapshot().hasRemoveAds).toBe(true);
    expect(policies[policies.length - 1]).toEqual({ interstitialsEnabled: false, rewardedEnabled: true });
    expect((await loadEconomy()).coins).toBe(e.coins);
    expect((await loadEconomy()).inventory).toEqual(e.inventory);
  });

  it('restore with nothing owned reports it', async () => {
    const { ctl } = await setup();
    await expect(ctl.restore()).resolves.toBe('nothingToRestore');
  });

  it('21. a CustomerInfo refresh updates the entitlement', async () => {
    const { sdk, ctl } = await setup();
    expect(ctl.getSnapshot().hasRemoveAds).toBe(false);
    sdk.emitCustomer({ activeEntitlements: [REMOVE_ADS_ENTITLEMENT], transactions: [] });
    expect(ctl.getSnapshot().hasRemoveAds).toBe(true);
  });
});

describe('service safety', () => {
  it('17. a missing API key fails safely: unavailable, never configured, purchases refused', async () => {
    const sdk = new FakePurchases();
    const { ctl, policies } = await setup({ key: null, sdk });
    expect(ctl.getSnapshot().status).toBe('unavailable');
    expect(sdk.configured).toBeNull();
    await expect(ctl.purchase(ID.coins500)).resolves.toBe('unavailable');
    await expect(ctl.restore()).resolves.toBe('unavailable');
    expect(policies).toEqual([{ interstitialsEnabled: true, rewardedEnabled: true }]); // ads keep their default policy
  });

  it('17b. no native module at all (Expo Go / web) is the same', async () => {
    const { ctl } = await setup({ sdk: null });
    expect(ctl.getSnapshot().status).toBe('unavailable');
  });

  it('18. an initialization failure never throws', async () => {
    const sdk = new FakePurchases();
    sdk.configureImpl = () => { throw new Error('native init failed'); };
    let ctl!: PurchasesController;
    await expect((async () => { ({ ctl } = await setup({ sdk })); })()).resolves.toBeUndefined();
    expect(ctl.getSnapshot().status).toBe('unavailable');
  });

  it('19. unknown RevenueCat products are ignored; missing expected ones are unbuyable', async () => {
    const sdk = new FakePurchases();
    const { ctl } = await setup({ sdk });
    sdk.storeProducts = [...localizedProducts({ [ID.coins500]: '$0.99', some_other_app_product: '$1.99' })];
    await ctl.refresh();
    expect(Object.keys(ctl.getSnapshot().products)).toEqual([ID.coins500]);
    await expect(ctl.purchase(ID.coins8000)).resolves.toBe('unavailable');
  });

  it('key resolution: production public key, debug Test Store only, preview off, secret refused', () => {
    const keys = { ios: 'app1_public_example', testStore: 'test_example' };
    expect(resolveRevenueCatKey({ platform: 'ios', isDev: false, buildMode: 'store', keys })).toMatchObject({ key: keys.ios, mode: 'store' });
    expect(resolveRevenueCatKey({ platform: 'ios', isDev: false, buildMode: 'store', keys: { ios: 'appl_legacy' } }).mode).toBe('store');
    expect(resolveRevenueCatKey({ platform: 'ios', isDev: false, buildMode: 'store', keys: {} }).mode).toBe('off');
    expect(resolveRevenueCatKey({ platform: 'ios', isDev: false, buildMode: 'store', keys: { ios: 'goog_x' } }).mode).toBe('off');
    expect(resolveRevenueCatKey({ platform: 'ios', isDev: false, buildMode: 'off', keys }).mode).toBe('off');
    expect(resolveRevenueCatKey({ platform: 'ios', isDev: false, buildMode: 'test', keys }).mode).toBe('off');
    expect(resolveRevenueCatKey({ platform: 'ios', isDev: false, keys }).mode).toBe('off');
    expect(resolveRevenueCatKey({ platform: 'ios', isDev: true, buildMode: 'test', keys })).toMatchObject({ key: keys.testStore, mode: 'testStore' });
    expect(resolveRevenueCatKey({ platform: 'ios', isDev: true, buildMode: 'test', keys: { ios: keys.ios } }).mode).toBe('off');
    expect(resolveRevenueCatKey({ platform: 'ios', isDev: false, buildMode: 'store', keys: { ios: 'sk_secret' } }).mode).toBe('off');
    expect(resolveRevenueCatKey({ platform: 'web', isDev: false, buildMode: 'store', keys }).mode).toBe('off');
  });

  it('reads literal Expo public env values and EAS profiles select safe modes', () => {
    const beforeKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
    const beforeMode = process.env.EXPO_PUBLIC_REVENUECAT_MODE;
    try {
      process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY = 'app1_example_public';
      process.env.EXPO_PUBLIC_REVENUECAT_MODE = 'store';
      expect(readRevenueCatKeys().ios).toBe('app1_example_public');
      expect(readRevenueCatBuildMode()).toBe('store');
    } finally {
      if (beforeKey === undefined) delete process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
      else process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY = beforeKey;
      if (beforeMode === undefined) delete process.env.EXPO_PUBLIC_REVENUECAT_MODE;
      else process.env.EXPO_PUBLIC_REVENUECAT_MODE = beforeMode;
    }
    const eas = require('../../../eas.json') as { build: Record<'development' | 'preview' | 'production', { env: Record<string, string> }> };
    expect(eas.build.development.env.EXPO_PUBLIC_REVENUECAT_MODE).toBe('test');
    expect(eas.build.preview.env.EXPO_PUBLIC_REVENUECAT_MODE).toBe('off');
    expect(eas.build.production.env.EXPO_PUBLIC_REVENUECAT_MODE).toBe('store');
  });
});

describe('store cards', () => {
  const ready = (over: Partial<PurchasesSnapshot> = {}): PurchasesSnapshot => ({
    status: 'ready', products: Object.fromEntries(ALL_PRICES.map((p) => [p.productId, p])), productFetch: 'loaded', hasRemoveAds: false, activeOperation: null, ...over,
  });

  it('22. the price shown is the store\'s localized string, verbatim', () => {
    const eur = ready({ products: { [ID.coins500]: { productId: ID.coins500, priceString: '1,19 €' } } });
    expect(iapCardView(iapProduct(ID.coins500)!, eur)).toMatchObject({ priceLabel: '1,19 €', buttonLabel: 'BUY', disabled: false });
    expect(iapCardView(iapProduct(ID.removeAds)!, ready()).buttonLabel).toBe('PURCHASE');
  });

  it('23. a product the store did not return is disabled with no fabricated price', () => {
    const v = iapCardView(iapProduct(ID.coins8000)!, ready({ products: {} }));
    expect(v).toEqual({ priceLabel: null, buttonLabel: 'N/A', disabled: true, state: 'unavailable' });
  });

  it('a product with a blank localized price is unavailable in the card and controller', async () => {
    const sdk = new FakePurchases();
    const { ctl } = await setup({ sdk });
    sdk.storeProducts = localizedProducts({ [ID.coins500]: ' ' });
    await ctl.refresh();
    expect(iapCardView(iapProduct(ID.coins500)!, ctl.getSnapshot())).toEqual({
      priceLabel: null, buttonLabel: 'N/A', disabled: true, state: 'unavailable',
    });
    await expect(ctl.purchase(ID.coins500)).resolves.toBe('unavailable');
    expect(sdk.pending).toHaveLength(0);
  });

  it('24. owned Remove Ads shows OWNED, disabled', () => {
    expect(iapCardView(iapProduct(ID.removeAds)!, ready({ hasRemoveAds: true }))).toMatchObject({ buttonLabel: 'OWNED', disabled: true, state: 'owned' });
  });

  it('cards lock while another purchase is in flight', () => {
    const v = iapCardView(iapProduct(ID.coins500)!, ready({ activeOperation: ID.coins1500, status: 'purchasing' }));
    expect(v.disabled).toBe(true);
    expect(iapCardView(iapProduct(ID.coins1500)!, ready({ activeOperation: ID.coins1500 })).state).toBe('purchasing');
  });

  it('M17D.0: a card still waiting on the store shows loading, never N/A', () => {
    for (const snap of [
      ready({ status: 'initializing', products: {}, productFetch: 'idle' }),
      ready({ products: {}, productFetch: 'loading' }),
      ready({ status: 'error', products: {}, productFetch: 'loading' }), // retry after a failure
    ]) {
      expect(iapCardView(iapProduct(ID.coins500)!, snap)).toEqual({ priceLabel: null, buttonLabel: '…', disabled: true, state: 'loading' });
    }
    // Purchases off entirely (no SDK/key) is unavailable, not an endless loading state.
    expect(iapCardView(iapProduct(ID.coins500)!, ready({ status: 'unavailable', products: {}, productFetch: 'idle' })).state).toBe('unavailable');
    // A refresh with prices already on screen keeps showing them.
    expect(iapCardView(iapProduct(ID.coins500)!, ready({ productFetch: 'loaded' })).priceLabel).toBe('$0.99');
  });

  it('M17D.0: the controller reports loading until the store answers, then the localized prices', async () => {
    const sdk = new FakePurchases();
    let answer!: (p: typeof ALL_PRICES) => void;
    sdk.productsImpl = () => new Promise((resolve) => { answer = resolve; });
    const ctl = new PurchasesController(sdk, 'appl_test', {
      reconcileConsumables: reconcileIapPurchases, persistRemoveAds: saveRemoveAds, onRemoveAdsChange: () => {},
    });
    activeControllers.push(ctl);
    await loadEconomy();
    ctl.start();
    await flush();
    expect(ctl.getSnapshot().productFetch).toBe('loading');
    for (const p of IAP_CATALOG) expect(iapCardView(p, ctl.getSnapshot()).buttonLabel).toBe('…');
    answer(ALL_PRICES);
    await flush();
    expect(ctl.getSnapshot()).toMatchObject({ status: 'ready', productFetch: 'loaded' });
    for (const p of IAP_CATALOG) {
      const want = ALL_PRICES.find((x) => x.productId === p.price.productId)!.priceString;
      expect(iapCardView(p, ctl.getSnapshot())).toMatchObject({ priceLabel: want, disabled: false });
    }
  });

  it('M17D.0: requests exactly the 7 App Store product ids', async () => {
    const { sdk } = await setup();
    expect(sdk.requestedIds.length).toBeGreaterThan(0);
    for (const ids of sdk.requestedIds) {
      expect([...ids].sort()).toEqual([
        'pixel_arcadia_booster_pack', 'pixel_arcadia_coins_1500', 'pixel_arcadia_coins_3500', 'pixel_arcadia_coins_500',
        'pixel_arcadia_coins_8000', 'pixel_arcadia_remove_ads', 'pixel_arcadia_starter_pack',
      ]);
    }
  });

  it('M17D.0: a failed lookup is non-fatal, unavailable only after it failed, and recovers on the next refresh', async () => {
    const sdk = new FakePurchases();
    sdk.productsImpl = () => Promise.reject(Object.assign(new Error('secret-ish message'), { code: '23', readableErrorCode: 'CONFIGURATION_ERROR' }));
    const { ctl } = await setup({ sdk });
    // setup() seeds storeProducts but productsImpl rejects regardless.
    expect(ctl.getSnapshot()).toMatchObject({ status: 'error', productFetch: 'failed', products: {} });
    expect(iapCardView(iapProduct(ID.coins500)!, ctl.getSnapshot()).state).toBe('unavailable');
    await expect(ctl.purchase(ID.coins500)).resolves.toBe('unavailable');
    expect(Object.keys(ctl.getSnapshot().products)).toHaveLength(0);

    sdk.productsImpl = () => Promise.resolve(ALL_PRICES);
    await ctl.refresh();
    expect(ctl.getSnapshot()).toMatchObject({ status: 'ready', productFetch: 'loaded' });
    expect(Object.keys(ctl.getSnapshot().products)).toHaveLength(7);
  });

  it('M17D.0: StoreKit returning 0/7 products leaves purchase cards unavailable', async () => {
    const sdk = new FakePurchases();
    const { ctl } = await setup({ sdk });
    sdk.storeProducts = [];
    await ctl.refresh();
    expect(ctl.getSnapshot()).toMatchObject({ status: 'ready', productFetch: 'loaded', products: {} });
    expect(iapCardView(iapProduct(ID.removeAds)!, ctl.getSnapshot()).state).toBe('unavailable');
    for (const id of Object.values(ID)) {
      expect(iapCardView(iapProduct(id)!, ctl.getSnapshot()).state).toBe('unavailable');
    }
  });

  it('M17D.0: an older, slower product lookup never overwrites a newer answer', async () => {
    const sdk = new FakePurchases();
    const { ctl } = await setup({ sdk });
    const answers: ((p: typeof ALL_PRICES) => void)[] = [];
    sdk.productsImpl = () => new Promise((resolve) => { answers.push(resolve); });
    const first = ctl.refresh();
    const second = ctl.refresh();
    await flush();
    answers[1]!(ALL_PRICES); // newest answers first
    await second;
    answers[0]!([]); // stale empty answer arrives late
    await first;
    expect(Object.keys(ctl.getSnapshot().products)).toHaveLength(7);
  });

  it('bundle cards list their contents', () => {
    expect(rewardLines(iapProduct(ID.starterPack)!.reward)).toEqual(['1,000 Coins', '3 Undo', '3 Extra Slot', '3 Bomb']);
  });
});
