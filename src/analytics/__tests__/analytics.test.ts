import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { AdsController } from '@/ads/controller';
import { createAdFlows } from '@/ads/flows';
import { DEFAULT_ADS_POLICY } from '@/ads/types';
import { FakeSdk, flush as flushAds, UNITS } from '@/ads/__tests__/fakeSdk';
import { IAP_PRODUCT_IDS } from '@/game/economy/catalog';
import { PUBLISHED_MAX_LEVEL } from '@/game/levels/publishing';
import { REMOVE_ADS_ENTITLEMENT } from '@/iap/config';
import { PurchasesController } from '@/iap/controller';
import { FakePurchases, flush as flushIap } from '@/iap/__tests__/fakePurchases';
import { _resetAdsStore, adsStore } from '@/storage/ads';
import { createMemoryAnalyticsStore, type AnalyticsStore } from '@/storage/analytics';
import { _clearEconomyCache, loadEconomy, reconcileIapPurchases } from '@/storage/economy';
import {
  _clearHeartsCache, _devSetHearts, _setHeartsClock, grantHearts, onHeartsRegenerated, refreshHearts, spendHeartForLoss,
} from '@/storage/hearts';
import { saveRemoveAds } from '@/storage/iap';

import { createAnalytics, heartLossFigures, type AnalyticsClient, type RunStartInput } from '../api';
import { DEFAULT_POSTHOG_HOST, readAnalyticsEnv, resolveAnalyticsConfig } from '../config';
import type { AnalyticsProps } from '../events';
import { contentCeilingThreshold, durationSeconds, highestCompletedLevel } from '../progression';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

class FakeClient implements AnalyticsClient {
  events: { event: string; props: AnalyticsProps }[] = [];
  registered: AnalyticsProps[] = [];
  person: AnalyticsProps[] = [];
  capture(event: string, props: AnalyticsProps) { this.events.push({ event, props }); }
  register(props: AnalyticsProps) { this.registered.push(props); }
  setPersonProperties(props: AnalyticsProps) { this.person.push(props); }
  named(event: string) { return this.events.filter((e) => e.event === event); }
}

let clock = 1_000_000;
function setup(opts: { publishedMax?: number; store?: AnalyticsStore; client?: AnalyticsClient | null } = {}) {
  const client = opts.client === undefined ? new FakeClient() : opts.client;
  const store = opts.store ?? createMemoryAnalyticsStore();
  const analytics = createAnalytics({ client, store, now: () => clock, publishedMax: opts.publishedMax ?? PUBLISHED_MAX_LEVEL });
  return { analytics, client: client as FakeClient, store };
}

const L12: RunStartInput = {
  levelId: 12, world: 2, worldTitle: 'Wild Garden', difficulty: 'medium', isReplay: false,
  hearts: 5, coins: 300, inventory: { undo: 2, extraSlot: 1, bomb: 0 },
};

beforeEach(async () => {
  clock = 1_000_000;
  await AsyncStorage.clear();
  _clearHeartsCache();
  _clearEconomyCache();
  _resetAdsStore();
});

describe('config + fail-safety', () => {
  it('1. missing API key → analytics off; every call is a safe no-op', () => {
    expect(resolveAnalyticsConfig({ isDev: false, env: {} }).mode).toBe('off');
    const { analytics } = setup({ client: null });
    expect(() => {
      const run = analytics.startRun('campaign', L12);
      run.itemUsed('undo', 1);
      run.won({ isFirstClear: true, firstClearReward: 50, heartsAfter: 5, coinsAfter: 350 });
      analytics.appOpened({ highestUnlocked: 3, coins: 1, hearts: 5, removeAdsOwned: false });
      analytics.progressUpdated(40);
      analytics.trackAd('ad_interstitial_shown');
    }).not.toThrow();
  });

  it('2. a throwing PostHog client never reaches the caller', () => {
    const angry: AnalyticsClient = {
      capture() { throw new Error('boom'); }, register() { throw new Error('boom'); }, setPersonProperties() { throw new Error('boom'); },
    };
    const { analytics } = setup({ client: angry });
    expect(() => {
      analytics.startRun('campaign', L12).lost({ reason: 'holding_overflow', heartsBefore: 5, heartsAfter: 4, coins: 0, pendingCount: 0 });
      analytics.startRun('campaign', L12).won({ isFirstClear: true, firstClearReward: 50, heartsAfter: 5, coinsAfter: 350 });
      analytics.progressUpdated(12);
      analytics.trackIap('iap_completed');
    }).not.toThrow();
  });

  it('a throwing diagnostic logger also cannot interrupt a completed run', () => {
    const analytics = createAnalytics({ client: null, store: createMemoryAnalyticsStore(), now: () => clock,
      publishedMax: PUBLISHED_MAX_LEVEL, log: () => { throw new Error('logger failed'); } });
    expect(() => analytics.startRun('campaign', L12).won({ isFirstClear: true, firstClearReward: 50, heartsAfter: 5, coinsAfter: 350 })).not.toThrow();
  });

  it('3. dev builds never send to the production project', () => {
    const prod = 'phc_' + 'a'.repeat(40);
    const host = DEFAULT_POSTHOG_HOST;
    expect(resolveAnalyticsConfig({ isDev: true, env: { apiKey: prod, host, mode: 'development' } })).toMatchObject({ mode: 'off', apiKey: null });
    expect(resolveAnalyticsConfig({ isDev: true, env: { apiKey: prod, devApiKey: prod, host, mode: 'development' } }).mode).toBe('off');
    expect(resolveAnalyticsConfig({ isDev: true, env: { apiKey: prod, devApiKey: 'phc_' + 'b'.repeat(40), host, mode: 'development' } }))
      .toMatchObject({ mode: 'development', apiKey: 'phc_' + 'b'.repeat(40) });
    expect(resolveAnalyticsConfig({ isDev: true, env: { apiKey: prod, host, mode: 'production' } }).mode).toBe('off');
    expect(resolveAnalyticsConfig({ isDev: false, env: { apiKey: prod, host, mode: 'production' } }))
      .toMatchObject({ mode: 'production', apiKey: prod, host });
    expect(resolveAnalyticsConfig({ isDev: false, env: { apiKey: prod, host, mode: 'off' } }).mode).toBe('off');
    expect(resolveAnalyticsConfig({ isDev: false, env: { apiKey: prod, host, mode: 'development' } }).mode).toBe('off');
    expect(resolveAnalyticsConfig({ isDev: false, env: { apiKey: prod, host } }).mode).toBe('off');
    expect(resolveAnalyticsConfig({ isDev: false, env: { apiKey: 'phx_personalsecretkey1234567890', host, mode: 'production' } }).mode).toBe('off');
    expect(resolveAnalyticsConfig({ isDev: true, env: { debug: '0' } }).logEvents).toBe(false);
  });

  it('requires a valid public project key and the exact US ingestion host', () => {
    const key = 'phc_' + 'a'.repeat(40);
    const production = (apiKey?: string, host?: string) => resolveAnalyticsConfig({ isDev: false, env: { apiKey, host, mode: 'production' } });
    expect(production(key, DEFAULT_POSTHOG_HOST).mode).toBe('production');
    expect(production(undefined, DEFAULT_POSTHOG_HOST).mode).toBe('off');
    expect(production('phc_short', DEFAULT_POSTHOG_HOST).mode).toBe('off');
    expect(production('phx_' + 'a'.repeat(40), DEFAULT_POSTHOG_HOST).mode).toBe('off');
    expect(production(key).mode).toBe('off');
    expect(production(key, 'https://us.posthog.com').mode).toBe('off');
    expect(production(key, 'http://us.i.posthog.com').mode).toBe('off');
  });

  it('reads only the public Expo variables and all EAS modes are explicit', () => {
    const previous = {
      key: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST,
      mode: process.env.EXPO_PUBLIC_POSTHOG_MODE,
    };
    try {
      process.env.EXPO_PUBLIC_POSTHOG_API_KEY = 'phc_' + 'a'.repeat(40);
      process.env.EXPO_PUBLIC_POSTHOG_HOST = DEFAULT_POSTHOG_HOST;
      process.env.EXPO_PUBLIC_POSTHOG_MODE = 'production';
      expect(readAnalyticsEnv()).toMatchObject({ apiKey: 'phc_' + 'a'.repeat(40), host: DEFAULT_POSTHOG_HOST, mode: 'production' });
    } finally {
      for (const [name, value] of Object.entries({
        EXPO_PUBLIC_POSTHOG_API_KEY: previous.key,
        EXPO_PUBLIC_POSTHOG_HOST: previous.host,
        EXPO_PUBLIC_POSTHOG_MODE: previous.mode,
      })) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
    const eas = require('../../../eas.json') as { build: Record<'development' | 'preview' | 'production', { env: Record<string, string> }> };
    expect(eas.build.development.env.EXPO_PUBLIC_POSTHOG_MODE).toBe('development');
    expect(eas.build.preview.env.EXPO_PUBLIC_POSTHOG_MODE).toBe('off');
    expect(eas.build.production.env.EXPO_PUBLIC_POSTHOG_MODE).toBe('production');
  });

  it('initializes once with explicit-event privacy settings and anonymous identity', () => {
    const previous = {
      key: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST,
      mode: process.env.EXPO_PUBLIC_POSTHOG_MODE,
    };
    process.env.EXPO_PUBLIC_POSTHOG_API_KEY = 'phc_' + 'a'.repeat(40);
    process.env.EXPO_PUBLIC_POSTHOG_HOST = DEFAULT_POSTHOG_HOST;
    process.env.EXPO_PUBLIC_POSTHOG_MODE = 'production';
    const constructed: { key: string; options: Record<string, unknown> }[] = [];
    const register = jest.fn((_props: AnalyticsProps) => Promise.resolve());
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.doMock('posthog-react-native', () => ({ PostHog: class {
      constructor(key: string, options: Record<string, unknown>) { constructed.push({ key, options }); }
      capture() {}
      register = register;
      setPersonProperties() {}
    } }));
    try {
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { analytics, startAnalytics } = require('../service') as typeof import('../service');
        startAnalytics();
        startAnalytics();
        analytics.appOpened({ highestUnlocked: 1, coins: 300, hearts: 5, removeAdsOwned: false });
        expect(register).toHaveBeenCalledTimes(1);
        expect(register.mock.calls[0]?.[0]).toMatchObject({
          platform: 'ios', published_max_level: PUBLISHED_MAX_LEVEL,
          campaign_version: 'v2-50', environment: 'production',
        });
      });
      expect(constructed).toHaveLength(1);
      expect(constructed[0]!.key).toBe('phc_' + 'a'.repeat(40));
      expect(constructed[0]!.options).toMatchObject({
        host: DEFAULT_POSTHOG_HOST,
        captureAppLifecycleEvents: false,
        enableSessionReplay: false,
        disableGeoip: true,
        errorTracking: { autocapture: { uncaughtExceptions: false, unhandledRejections: false, console: false, nativeCrashes: false } },
      });
    } finally {
      jest.dontMock('react-native');
      jest.dontMock('posthog-react-native');
      for (const [name, value] of Object.entries({
        EXPO_PUBLIC_POSTHOG_API_KEY: previous.key,
        EXPO_PUBLIC_POSTHOG_HOST: previous.host,
        EXPO_PUBLIC_POSTHOG_MODE: previous.mode,
      })) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
  });

  it('a PostHog constructor failure leaves analytics as a no-op', () => {
    const previous = {
      key: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST,
      mode: process.env.EXPO_PUBLIC_POSTHOG_MODE,
    };
    process.env.EXPO_PUBLIC_POSTHOG_API_KEY = 'phc_' + 'a'.repeat(40);
    process.env.EXPO_PUBLIC_POSTHOG_HOST = DEFAULT_POSTHOG_HOST;
    process.env.EXPO_PUBLIC_POSTHOG_MODE = 'production';
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.doMock('posthog-react-native', () => ({ PostHog: class { constructor() { throw new Error('init failed'); } } }));
    try {
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { analytics, startAnalytics } = require('../service') as typeof import('../service');
        expect(() => startAnalytics()).not.toThrow();
        expect(() => analytics.appOpened({ highestUnlocked: 1, coins: 300, hearts: 5, removeAdsOwned: false })).not.toThrow();
      });
    } finally {
      jest.dontMock('react-native');
      jest.dontMock('posthog-react-native');
      for (const [name, value] of Object.entries({
        EXPO_PUBLIC_POSTHOG_API_KEY: previous.key,
        EXPO_PUBLIC_POSTHOG_HOST: previous.host,
        EXPO_PUBLIC_POSTHOG_MODE: previous.mode,
      })) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
  });
});

describe('level runs', () => {
  it('4. level_started fires once per run (with the start context)', () => {
    const { analytics, client } = setup();
    analytics.startRun('campaign', L12);
    expect(client.named('level_started')).toHaveLength(1);
    expect(client.named('level_started')[0]!.props).toMatchObject({
      level: 12, world: 2, world_title: 'Wild Garden', difficulty: 'medium', attempt_number: 1, is_replay: false,
      hearts_before: 5, coins_before: 300, inventory_undo: 2, inventory_extra_slot: 1, inventory_bomb: 0,
      play_mode: 'campaign', published_max_level: PUBLISHED_MAX_LEVEL,
    });
  });

  it('5. attempt count increments per level and persists in the analytics store', () => {
    const { analytics, store } = setup();
    expect(analytics.startRun('campaign', L12).attempt).toBe(1);
    expect(analytics.startRun('campaign', L12).attempt).toBe(2);
    expect(analytics.startRun('campaign', { ...L12, levelId: 13 }).attempt).toBe(1);
    // A later session (new analytics instance, same store) continues the count.
    expect(setup({ store }).analytics.startRun('campaign', L12).attempt).toBe(3);
  });

  it('6–7. level_completed carries level/world and the first-clear flag', () => {
    const { analytics, client } = setup();
    const run = analytics.startRun('campaign', L12);
    run.itemUsed('undo', 1);
    run.observeHolding(2);
    run.observeHolding(3);
    run.observeHolding(1);
    run.relaunched();
    run.won({ isFirstClear: true, firstClearReward: 50, heartsAfter: 4, coinsAfter: 350 });
    expect(client.named('level_completed')[0]!.props).toMatchObject({
      level: 12, world: 2, difficulty: 'medium', attempt_number: 1, is_first_clear: true, first_clear_reward_coins: 50,
      hearts_after: 4, coins_before: 300, coins_after: 350, items_used_total: 1, undo_used: 1, extra_slot_used: 0,
      bomb_used: 0, peak_holding: 3, relaunch_count: 1, fast_forward_used: false, levels_remaining: PUBLISHED_MAX_LEVEL - 12,
    });
    const replay = analytics.startRun('campaign', { ...L12, isReplay: true });
    replay.won({ isFirstClear: false, firstClearReward: 0, heartsAfter: 4, coinsAfter: 350 });
    expect(client.named('level_completed')[1]!.props).toMatchObject({ is_first_clear: false, first_clear_reward_coins: 0 });
  });

  it('8. durations are sane (seconds, one decimal, never negative)', () => {
    const { analytics, client } = setup();
    const run = analytics.startRun('campaign', L12);
    clock += 42_537;
    run.won({ isFirstClear: false, firstClearReward: 0, heartsAfter: 5, coinsAfter: 300 });
    expect(client.named('level_completed')[0]!.props.duration_seconds).toBe(42.5);
    expect(durationSeconds(5000, 1000)).toBe(0);
    expect(durationSeconds(Number.NaN, 1000)).toBe(0);
  });

  it('9. level_failed fires once, with a stable reason and heart counts', () => {
    const { analytics, client } = setup();
    const run = analytics.startRun('campaign', L12);
    run.lost({ reason: 'holding_overflow', heartsBefore: 3, heartsAfter: 2, coins: 120, pendingCount: 1 });
    run.lost({ reason: 'holding_overflow', heartsBefore: 3, heartsAfter: 2, coins: 120, pendingCount: 1 });
    run.won({ isFirstClear: true, firstClearReward: 50, heartsAfter: 2, coinsAfter: 170 });
    expect(client.named('level_failed')).toHaveLength(1);
    expect(client.named('level_completed')).toHaveLength(0);
    expect(client.named('level_failed')[0]!.props).toMatchObject({
      failure_reason: 'holding_overflow', hearts_before_loss: 3, hearts_after_loss: 2, coins: 120, pending_count: 1,
    });
  });

  it('12. item_used carries level, item, remaining inventory and attempt', () => {
    const { analytics, client } = setup();
    analytics.startRun('campaign', L12).itemUsed('extraSlot', 0);
    expect(client.named('item_used')[0]!.props).toEqual({ level: 12, item: 'extra_slot', remaining_inventory: 0, attempt_number: 1 });
  });

  it('13. endgame_fast_forward_started fires once per run', () => {
    const { analytics, client } = setup();
    const run = analytics.startRun('campaign', L12);
    clock += 30_000;
    run.fastForward({ activeCount: 2, holdingCount: 1 });
    run.fastForward({ activeCount: 1, holdingCount: 1 });
    expect(client.named('endgame_fast_forward_started')).toHaveLength(1);
    expect(client.named('endgame_fast_forward_started')[0]!.props).toMatchObject({ active_count: 2, holding_count: 1, time_since_level_start_seconds: 30 });
    analytics.startRun('campaign', L12).fastForward({ activeCount: 1, holdingCount: 0 }); // a new run may fire again
    expect(client.named('endgame_fast_forward_started')).toHaveLength(2);
  });

  it('26. abandoned only on an intentional exit before a result', () => {
    const { analytics, client } = setup();
    const open = analytics.startRun('campaign', L12);
    open.abandon();
    open.abandon();
    const finished = analytics.startRun('campaign', L12);
    finished.won({ isFirstClear: false, firstClearReward: 0, heartsAfter: 5, coinsAfter: 300 });
    finished.abandon(); // Home from the win card
    const lost = analytics.startRun('campaign', L12);
    lost.lost({ reason: 'no_moves', heartsBefore: 5, heartsAfter: 4, coins: 0, pendingCount: 0 });
    lost.abandon(); // Home from the loss card
    expect(client.named('level_abandoned')).toHaveLength(1);
  });

  it('27. backgrounding never counts as abandoned (only the exit handler and unmount call abandon())', () => {
    const { analytics, client } = setup();
    analytics.startRun('campaign', L12); // run left open — as while the app sits in the background
    expect(client.named('level_abandoned')).toHaveLength(0);
    const src = readFileSync(join(resolve(__dirname, '../../..'), 'src/screens/GameScreen.tsx'), 'utf8');
    const calls = src.match(/\.abandon\(\)/g) ?? [];
    expect(calls).toHaveLength(2); // Home button handler + unmount cleanup
    expect(src).not.toMatch(/AppState[\s\S]{0,200}abandon/);
  });

  it('28. retries emit level_retried with the previous result and retry type, then a new level_started', () => {
    const { analytics, client } = setup();
    const first = analytics.startRun('campaign', L12);
    first.lost({ reason: 'holding_overflow', heartsBefore: 1, heartsAfter: 0, coins: 0, pendingCount: 0 });
    const second = analytics.startRun('campaign', L12, { type: 'rewarded_ad', previous: first });
    analytics.startRun('campaign', L12, { type: 'normal', previous: second }); // mid-run restart
    expect(client.named('level_retried').map((e) => e.props)).toEqual([
      { level: 12, previous_result: 'lost', retry_type: 'rewarded_ad' },
      { level: 12, previous_result: 'in_progress', retry_type: 'normal' },
    ]);
    expect(client.named('level_started').map((e) => e.props.attempt_number)).toEqual([1, 2, 3]);
  });

  it('dev play is never tracked', () => {
    const { analytics, client } = setup();
    const run = analytics.startRun('dev', L12);
    run.itemUsed('bomb', 0);
    run.lost({ reason: 'other', heartsBefore: null, heartsAfter: null, coins: 0, pendingCount: 0 });
    expect(client.events).toEqual([]);
  });
});

describe('hearts', () => {
  it('10. heart_spent is due exactly once per loss, even if the loss is reported twice', async () => {
    const { analytics, client } = setup();
    await refreshHearts();
    for (const res of [await spendHeartForLoss('run-1'), await spendHeartForLoss('run-1')]) {
      const h = heartLossFigures(res);
      if (h.emitSpent) analytics.heartSpent({ levelId: 12, heartsAfter: h.after });
    }
    expect(client.named('heart_spent')).toEqual([{ event: 'heart_spent', props: { reason: 'level_loss', level: 12, hearts_after: 4 } }]);
    await _devSetHearts(0);
    expect(heartLossFigures(await spendHeartForLoss('run-2'))).toEqual({ emitSpent: false, before: 0, after: 0 });
  });

  it('11. heart_regenerated reports the regenerated amount (offline time credited once)', async () => {
    const { analytics, client } = setup();
    let now = 5_000_000;
    _setHeartsClock(() => now);
    await _devSetHearts(2); // regen anchor = now
    onHeartsRegenerated((e) => analytics.heartRegenerated({
      amount: e.amount, heartsAfter: e.heartsAfter, offlineElapsedMinutes: e.elapsedMs === null ? null : Math.round(e.elapsedMs / 60_000),
    }));
    now += 65 * 60_000;
    await refreshHearts();
    await refreshHearts(); // nothing new
    expect(client.named('heart_regenerated').map((e) => e.props)).toEqual([{ amount: 2, hearts_after: 4, offline_elapsed_minutes: 65 }]);
    await grantHearts(1); // a rewarded heart is NOT regeneration
    expect(client.named('heart_regenerated')).toHaveLength(1);
  });
});

describe('ads (M12 boundary)', () => {
  async function adsSetup(analyticsClient?: AnalyticsClient) {
    const { analytics, client } = setup({ client: analyticsClient });
    const sdk = new FakeSdk();
    const ctl = new AdsController(sdk, UNITS, { requestOptions: () => ({ nonPersonalized: true }), track: (e, p) => analytics.trackAd(e, p) });
    ctl.start();
    await flushAds();
    for (const u of Object.values(UNITS)) sdk.latest(u).emit('loaded');
    const flows = createAdFlows({ ads: ctl, store: adsStore, policy: () => DEFAULT_ADS_POLICY, grantHearts, now: () => clock });
    return { client, sdk, flows };
  }
  async function watch(sdk: FakeSdk, unit: string, earned: boolean) {
    await flushAds();
    const h = sdk.latest(unit);
    h.emit('opened');
    if (earned) h.emit('earned');
    h.emit('closed');
    await flushAds();
  }

  it('14. ad_interstitial_eligible carries placement, level and the cadence count', async () => {
    jest.useFakeTimers();
    try {
      const { client, sdk, flows } = await adsSetup();
      for (let i = 0; i < 3; i++) flows.recordLevelClear('campaign', true);
      const p = flows.postWinBreak('campaign', { levelId: 9 });
      await watch(sdk, UNITS.INTERSTITIAL_CAMPAIGN, false);
      await p;
      const expected = { placement: 'INTERSTITIAL_CAMPAIGN', campaign_first_clears_since_last: 3, level: 9 };
      expect(client.named('ad_interstitial_eligible')[0]!.props).toEqual(expected);
      expect(client.named('ad_interstitial_shown')[0]!.props).toEqual(expected);
    } finally { jest.useRealTimers(); }
  });

  it('15. ad_rewarded_retry_earned is correct (and a close without reward is its own event)', async () => {
    jest.useFakeTimers();
    try {
      const { client, sdk, flows } = await adsSetup();
      let r = flows.watchRewardedRetry('campaign', 21);
      await watch(sdk, UNITS.REWARDED_RETRY, true);
      await r;
      expect(client.named('ad_rewarded_retry_earned')[0]!.props).toEqual({ placement: 'REWARDED_RETRY', level: 21 });
      sdk.latest(UNITS.REWARDED_RETRY).emit('loaded');
      r = flows.watchRewardedRetry('campaign', 21);
      await watch(sdk, UNITS.REWARDED_RETRY, false);
      jest.advanceTimersByTime(1000);
      await r;
      expect(client.named('ad_rewarded_retry_closed_without_reward')).toHaveLength(1);
      expect(client.named('ad_rewarded_retry_earned')).toHaveLength(1);
    } finally { jest.useRealTimers(); }
  });

  it('16. ad_rewarded_heart_earned also records heart_rewarded once', async () => {
    jest.useFakeTimers();
    try {
      const { client, sdk, flows } = await adsSetup();
      await _devSetHearts(0);
      const r = flows.watchRewardedHeart('campaign');
      await flushAds();
      const h = sdk.latest(UNITS.REWARDED_HEART);
      h.emit('opened'); h.emit('earned'); h.emit('earned'); h.emit('closed');
      await r;
      expect(client.named('ad_rewarded_heart_earned')).toHaveLength(1);
      expect(client.named('heart_rewarded').map((e) => e.props)).toEqual([{ source: 'rewarded_ad', amount: 1 }]);
    } finally { jest.useRealTimers(); }
  });

  it('a PostHog capture error cannot interrupt a rewarded heart', async () => {
    jest.useFakeTimers();
    try {
      const angry: AnalyticsClient = { capture() { throw new Error('offline'); }, register() {}, setPersonProperties() {} };
      const { sdk, flows } = await adsSetup(angry);
      await _devSetHearts(0);
      const reward = flows.watchRewardedHeart('campaign');
      await watch(sdk, UNITS.REWARDED_HEART, true);
      await expect(reward).resolves.toBe(true);
      expect((await refreshHearts()).hearts).toBe(1);
    } finally { jest.useRealTimers(); }
  });
});

describe('purchases (M13 boundary)', () => {
  async function iapSetup(cachedRemoveAds = false, analyticsClient?: AnalyticsClient) {
    const { analytics, client } = setup({ client: analyticsClient });
    const sdk = new FakePurchases();
    // An owner's RevenueCat account reports the entitlement from the first read.
    if (cachedRemoveAds) sdk.customer = { activeEntitlements: [REMOVE_ADS_ENTITLEMENT], transactions: [] };
    sdk.storeProducts = [{ productId: IAP_PRODUCT_IDS.coins500, priceString: '$0.99', price: 0.99, currencyCode: 'USD' },
      { productId: IAP_PRODUCT_IDS.removeAds, priceString: '$4.99', price: 4.99, currencyCode: 'USD' }];
    const ctl = new PurchasesController(sdk, 'appl_x', {
      reconcileConsumables: reconcileIapPurchases,
      persistRemoveAds: saveRemoveAds,
      onRemoveAdsChange: (owned) => analytics.setRemoveAdsOwned(owned),
      track: (e, p) => analytics.trackIap(e, p),
    }, cachedRemoveAds);
    await loadEconomy();
    ctl.start();
    await flushIap();
    return { client, sdk, ctl };
  }

  it('17. iap_completed carries product-focused properties (no transaction ids)', async () => {
    const { client, sdk, ctl } = await iapSetup();
    const p = ctl.purchase(IAP_PRODUCT_IDS.coins500);
    await flushIap();
    const rcTx = { transactionId: 'rc_1', productId: IAP_PRODUCT_IDS.coins500, purchasedAt: Date.now() };
    sdk.pending.shift()!.resolve({ status: 'purchased', productId: IAP_PRODUCT_IDS.coins500, storeTransactionId: '2000000001', customer: { activeEntitlements: [], transactions: [rcTx] } });
    await p;
    const props = client.named('iap_completed')[0]!.props;
    expect(props).toEqual({
      product_id: IAP_PRODUCT_IDS.coins500, product_category: 'coins', coins_granted: 500, remove_ads: false,
      localized_price: '$0.99', price_amount: 0.99, currency_code: 'USD',
    });
    expect(JSON.stringify(client.events)).not.toMatch(/rc_1|2000000001/);
  });

  it('18. purchase result + listener + refresh → one iap_reward_granted, one iap_completed', async () => {
    const { client, sdk, ctl } = await iapSetup();
    const rcTx = { transactionId: 'rc_2', productId: IAP_PRODUCT_IDS.coins500, purchasedAt: Date.now() };
    const p = ctl.purchase(IAP_PRODUCT_IDS.coins500);
    await flushIap();
    sdk.emitCustomer({ activeEntitlements: [], transactions: [rcTx] });
    sdk.pending.shift()!.resolve({ status: 'purchased', productId: IAP_PRODUCT_IDS.coins500, storeTransactionId: '2000000002', customer: sdk.customer });
    await p;
    await flushIap();
    sdk.emitCustomer({ activeEntitlements: [], transactions: [rcTx] });
    await ctl.refresh();
    await flushIap();
    expect(client.named('iap_reward_granted')).toHaveLength(1);
    expect(client.named('iap_completed')).toHaveLength(1);
  });

  it('19. remove_ads_activated only on the false → true transition', async () => {
    const fresh = await iapSetup();
    fresh.sdk.emitCustomer({ activeEntitlements: [REMOVE_ADS_ENTITLEMENT], transactions: [] });
    fresh.sdk.emitCustomer({ activeEntitlements: [REMOVE_ADS_ENTITLEMENT], transactions: [] });
    await fresh.ctl.refresh();
    expect(fresh.client.named('remove_ads_activated')).toHaveLength(1);
    // Next launch: already owned (cached, and RevenueCat agrees) → startup and
    // refreshes do NOT re-announce it.
    const owner = await iapSetup(true);
    owner.sdk.emitCustomer({ activeEntitlements: [REMOVE_ADS_ENTITLEMENT], transactions: [] });
    await owner.ctl.refresh();
    expect(owner.client.named('remove_ads_activated')).toHaveLength(0);
  });

  it('a PostHog capture error cannot interrupt a confirmed purchase grant', async () => {
    const angry: AnalyticsClient = { capture() { throw new Error('offline'); }, register() {}, setPersonProperties() {} };
    const { sdk, ctl } = await iapSetup(false, angry);
    const before = (await loadEconomy()).coins;
    const purchase = ctl.purchase(IAP_PRODUCT_IDS.coins500);
    await flushIap();
    sdk.pending.shift()!.resolve({ status: 'purchased', productId: IAP_PRODUCT_IDS.coins500,
      storeTransactionId: '2000000999', customer: { activeEntitlements: [], transactions: [
        { transactionId: 'rc_analytics_offline', productId: IAP_PRODUCT_IDS.coins500, purchasedAt: Date.now() },
      ] } });
    await expect(purchase).resolves.toBe('purchased');
    expect((await loadEconomy()).coins).toBe(before + 500);
  });
});

describe('progression + content ceiling', () => {
  it('20. highest level = COMPLETED (unlocked − 1), not unlocked', () => {
    const { analytics, client } = setup();
    analytics.progressUpdated(11); // level 11 unlocked ⇒ 10 completed
    expect(client.registered).toContainEqual({ current_highest_level: 10 });
    expect(client.person[0]).toMatchObject({ highest_level_completed: 10, highest_level_reached: 11 });
    expect(highestCompletedLevel(1, 0)).toBe(0); // fresh player: nothing completed
    expect(highestCompletedLevel(100, 99)).toBe(99);
    expect(highestCompletedLevel(100, 100)).toBe(100); // registry end: unlock can't move, the recorded win counts
  });

  it('person properties are only sent when they change', () => {
    const { analytics, client } = setup();
    analytics.progressUpdated(11);
    analytics.progressUpdated(11);
    analytics.setRemoveAdsOwned(false);
    analytics.setRemoveAdsOwned(false);
    expect(client.person).toHaveLength(2);
  });

  it('21. below the threshold → no ceiling event', () => {
    const { analytics, client } = setup({ publishedMax: 1000 });
    analytics.progressUpdated(950); // 949 completed
    expect(client.named('content_ceiling_approaching')).toHaveLength(0);
  });

  it('22–23. crossing the threshold fires once; repeated Home/starts/sessions never repeat it', () => {
    const { analytics, client, store } = setup({ publishedMax: 1000 });
    analytics.progressUpdated(951); // 950 completed = 1000 − 50
    analytics.progressUpdated(951);
    analytics.progressUpdated(960);
    expect(client.named('content_ceiling_approaching').map((e) => e.props)).toEqual([
      { highest_level_completed: 950, published_max_level: 1000, levels_remaining: 50, threshold: 950 },
    ]);
    const nextSession = setup({ publishedMax: 1000, store });
    nextSession.analytics.appOpened({ highestUnlocked: 961, coins: 0, hearts: 5, removeAdsOwned: false });
    nextSession.analytics.appOpened({ highestUnlocked: 961, coins: 0, hearts: 5, removeAdsOwned: false });
    nextSession.analytics.progressUpdated(961);
    expect(nextSession.client.named('content_ceiling_approaching')).toHaveLength(0);
    expect(nextSession.client.named('app_opened')).toHaveLength(1);
  });

  it('24. a bigger published campaign makes the player eligible for its new threshold', () => {
    const { analytics, store } = setup({ publishedMax: 1000 });
    analytics.progressUpdated(951);
    const expanded = setup({ publishedMax: 1500, store });
    expanded.analytics.progressUpdated(1300);
    expect(expanded.client.named('content_ceiling_approaching')).toHaveLength(0);
    expanded.analytics.progressUpdated(1451);
    expect(expanded.client.named('content_ceiling_approaching').map((e) => e.props.published_max_level)).toEqual([1500]);
  });

  it('25. with the current 50-level campaign the ceiling alert is disabled', () => {
    expect(PUBLISHED_MAX_LEVEL).toBe(50);
    expect(contentCeilingThreshold(50)).toBeNull();
    const { analytics, client } = setup({ publishedMax: 50 });
    for (const unlocked of [1, 2, 25, 50, 51, 100]) analytics.progressUpdated(unlocked);
    expect(client.named('content_ceiling_approaching')).toHaveLength(0);
    expect(contentCeilingThreshold(100)).toBe(50);
    expect(contentCeilingThreshold(500)).toBe(450);
  });
});
