import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HEART_REGEN_MS } from '@/game/hearts/config';
import { canStartLevel } from '@/game/hearts/gate';
import { timeUntilNextHeart } from '@/game/hearts/state';
import { _clearEconomyCache, settleFirstClear } from '@/storage/economy';
import { _resetAdsStore, adsStore, takeRewardedRetry } from '@/storage/ads';
import {
  _clearHeartsCache,
  _devSetHearts,
  _setHeartsClock,
  grantHearts,
  peekHearts,
  refreshHearts,
  spendHeartForLoss,
} from '@/storage/hearts';

import { REWARD_GRACE_MS } from '../config';
import { AdsController } from '../controller';
import { createAdFlows } from '../flows';
import { DEFAULT_ADS_POLICY, type AdAnalyticsEvent, type AdsPolicy } from '../types';
import { FakeSdk, flush, UNITS } from './fakeSdk';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

const T0 = 1_750_000_000_000;
const MIN = 60_000;
let now = T0;

async function setup(policy: AdsPolicy = DEFAULT_ADS_POLICY, opts: { notLoaded?: string[] } = {}) {
  const sdk = new FakeSdk();
  const tracked: AdAnalyticsEvent[] = [];
  const ctl = new AdsController(sdk, UNITS, {
    requestOptions: () => ({ nonPersonalized: true }),
    track: (e) => tracked.push(e),
  });
  ctl.setInterstitialsEnabled(policy.interstitialsEnabled);
  ctl.start();
  await flush();
  const ready = (unit: string) => sdk.latest(unit).emit('loaded');
  for (const unit of Object.values(UNITS)) if (sdk.handles.some(h => h.unitId === unit) && !opts.notLoaded?.includes(unit)) ready(unit);
  const flows = createAdFlows({ ads: ctl, store: adsStore, policy: () => policy, grantHearts, now: () => now });
  return { sdk, ctl, flows, tracked, ready };
}

/** Drive a shown ad: opened → [earned…] → closed, then let the grace window pass. */
async function watch(sdk: FakeSdk, unit: string, opts: { earned?: number; opened?: boolean } = {}) {
  await flush();
  const h = sdk.latest(unit);
  if (opts.opened !== false) h.emit('opened');
  for (let i = 0; i < (opts.earned ?? 0); i++) h.emit('earned');
  h.emit('closed');
  jest.advanceTimersByTime(REWARD_GRACE_MS);
  await flush();
}

beforeEach(async () => {
  jest.useFakeTimers();
  await AsyncStorage.clear();
  _resetAdsStore();
  _clearHeartsCache();
  _clearEconomyCache();
  now = T0;
  _setHeartsClock(() => now);
});
afterEach(() => { jest.useRealTimers(); });

const count = () => adsStore.get().firstClearsSinceInterstitial;

describe('interstitial cadence', () => {
  it('1–3. first clears count 1, 2, then the third is due', async () => {
    const { flows } = await setup();
    flows.recordLevelClear('campaign', true);
    expect(count()).toBe(1);
    flows.recordLevelClear('campaign', true);
    expect(count()).toBe(2);
    flows.recordLevelClear('campaign', true);
    expect(count()).toBe(3);
  });

  it('nothing shows before the third first clear', async () => {
    const { flows, sdk } = await setup();
    flows.recordLevelClear('campaign', true);
    flows.recordLevelClear('campaign', true);
    await expect(flows.postWinBreak('campaign')).resolves.toBe('notDue');
    expect(sdk.latest(UNITS.INTERSTITIAL_CAMPAIGN).showCalls).toBe(0);
    expect(count()).toBe(2);
  });

  it('4. a shown interstitial consumes the cadence', async () => {
    const { flows, sdk, tracked } = await setup();
    for (let i = 0; i < 3; i++) flows.recordLevelClear('campaign', true);
    const p = flows.postWinBreak('campaign');
    await watch(sdk, UNITS.INTERSTITIAL_CAMPAIGN);
    await expect(p).resolves.toBe('shown');
    expect(count()).toBe(0);
    expect(tracked).toEqual(expect.arrayContaining(['ad_interstitial_eligible', 'ad_interstitial_shown']));
  });

  it('5. an unavailable third-slot ad is skipped, the player continues, and the cadence resets', async () => {
    const { flows, sdk, ctl } = await setup(DEFAULT_ADS_POLICY, { notLoaded: [UNITS.INTERSTITIAL_CAMPAIGN] });
    // No inventory: the interstitial's load fails.
    sdk.latest(UNITS.INTERSTITIAL_CAMPAIGN).emit('error');
    expect(ctl.getState('INTERSTITIAL_CAMPAIGN')).toBe('error');
    for (let i = 0; i < 3; i++) flows.recordLevelClear('campaign', true);
    await expect(flows.postWinBreak('campaign')).resolves.toBe('skipped');
    expect(count()).toBe(0);
    // Not chased: the very next win isn't due.
    flows.recordLevelClear('campaign', true);
    await expect(flows.postWinBreak('campaign')).resolves.toBe('notDue');
  });

  it('5b. an ad that fails to open is also skipped (never blocks), cadence reset', async () => {
    const { flows, sdk } = await setup();
    sdk.latest(UNITS.INTERSTITIAL_CAMPAIGN).showImpl = () => Promise.reject(new Error('boom'));
    for (let i = 0; i < 3; i++) flows.recordLevelClear('campaign', true);
    await expect(flows.postWinBreak('campaign')).resolves.toBe('skipped');
    expect(count()).toBe(0);
  });

  it('6. a replay clear does not count (economy first-clear settlement is the source)', async () => {
    const { flows } = await setup();
    const first = await settleFirstClear(7);
    flows.recordLevelClear('campaign', first.awarded);
    const replay = await settleFirstClear(7);
    flows.recordLevelClear('campaign', replay.awarded);
    expect([first.awarded, replay.awarded]).toEqual([true, false]);
    expect(count()).toBe(1);
  });

  it('7. dev clears never move the cadence, and dev never gets a break', async () => {
    const { flows, sdk } = await setup();
    flows.recordLevelClear('dev', true);
    expect(count()).toBe(0);
    for (let i = 0; i < 3; i++) flows.recordLevelClear('campaign', true);
    await expect(flows.postWinBreak('dev')).resolves.toBe('notDue');
    expect(count()).toBe(3);
    expect(sdk.latest(UNITS.INTERSTITIAL_CAMPAIGN).showCalls).toBe(0);
  });

  it('8. a rewarded ad suppresses the next interstitial opportunity', async () => {
    const { flows, sdk, ready } = await setup();
    for (let i = 0; i < 3; i++) flows.recordLevelClear('campaign', true);
    const r = flows.watchRewardedRetry('campaign', 4);
    await watch(sdk, UNITS.REWARDED_RETRY, { earned: 1 });
    await r;
    ready(UNITS.REWARDED_RETRY);
    await expect(flows.postWinBreak('campaign')).resolves.toBe('skipped');
    expect(sdk.latest(UNITS.INTERSTITIAL_CAMPAIGN).showCalls).toBe(0);
    expect(count()).toBe(0);
  });

  it('8b. suppression lasts one post-win transition only', async () => {
    const { flows, sdk } = await setup();
    const r = flows.watchRewardedHeart('campaign');
    await watch(sdk, UNITS.REWARDED_HEART, { earned: 1 });
    await r;
    expect(flows.isInterstitialSuppressed()).toBe(true);
    await expect(flows.postWinBreak('campaign')).resolves.toBe('notDue');
    expect(flows.isInterstitialSuppressed()).toBe(false);
  });

  it('9. the cadence resumes: 3 more first clears → the next interstitial shows', async () => {
    const { flows, sdk } = await setup();
    for (let i = 0; i < 3; i++) flows.recordLevelClear('campaign', true);
    let p = flows.postWinBreak('campaign');
    await watch(sdk, UNITS.INTERSTITIAL_CAMPAIGN);
    await expect(p).resolves.toBe('shown');
    sdk.latest(UNITS.INTERSTITIAL_CAMPAIGN).emit('loaded'); // the reload finished
    for (let i = 0; i < 2; i++) flows.recordLevelClear('campaign', true);
    await expect(flows.postWinBreak('campaign')).resolves.toBe('notDue');
    flows.recordLevelClear('campaign', true);
    p = flows.postWinBreak('campaign');
    await watch(sdk, UNITS.INTERSTITIAL_CAMPAIGN);
    await expect(p).resolves.toBe('shown');
  });

  it('Remove Ads policy: no interstitial request, slot consumed; both rewarded placements stay available', async () => {
    const { flows, sdk } = await setup({ interstitialsEnabled: false, rewardedEnabled: true });
    for (let i = 0; i < 3; i++) flows.recordLevelClear('campaign', true);
    await expect(flows.postWinBreak('campaign')).resolves.toBe('skipped');
    expect(sdk.handles.some(h => h.unitId === UNITS.INTERSTITIAL_CAMPAIGN)).toBe(false);
    const r = flows.watchRewardedHeart('campaign');
    await watch(sdk, UNITS.REWARDED_HEART, { earned: 1 });
    await expect(r).resolves.toBe(true);
    const retry = flows.watchRewardedRetry('campaign', 12);
    await watch(sdk, UNITS.REWARDED_RETRY, { earned: 1 });
    await expect(retry).resolves.toBe(true);
  });

  it('the cadence persists across restarts', async () => {
    const { flows } = await setup();
    flows.recordLevelClear('campaign', true);
    flows.recordLevelClear('campaign', true);
    await jest.requireActual<typeof import('@/storage/ads')>('@/storage/ads')._flushAdsWrites();
    _resetAdsStore();
    const { loadAdsState } = await import('@/storage/ads');
    expect((await loadAdsState()).firstClearsSinceInterstitial).toBe(2);
  });
});

describe('rewarded retry', () => {
  it('10. a loss spends one heart as before, and the rewarded retry does not refund it', async () => {
    const { flows, sdk } = await setup();
    await refreshHearts();
    await spendHeartForLoss('run-1');
    expect(peekHearts()!.hearts).toBe(4);
    const r = flows.watchRewardedRetry('campaign', 12);
    await watch(sdk, UNITS.REWARDED_RETRY, { earned: 1 });
    await expect(r).resolves.toBe(true);
    expect(peekHearts()!.hearts).toBe(4);
  });

  it('11–12. opening or closing without the reward grants no retry', async () => {
    const { flows, sdk, tracked } = await setup();
    const r = flows.watchRewardedRetry('campaign', 12);
    await watch(sdk, UNITS.REWARDED_RETRY);
    await expect(r).resolves.toBe(false);
    expect(adsStore.get().pendingRewardedRetry).toBeNull();
    expect(tracked).toContain('ad_rewarded_retry_closed_without_reward');
  });

  it('13–14. the confirmed reward grants exactly one retry authorization, even if the event repeats', async () => {
    const { flows, sdk } = await setup();
    const r = flows.watchRewardedRetry('campaign', 12);
    await watch(sdk, UNITS.REWARDED_RETRY, { earned: 3 });
    await expect(r).resolves.toBe(true);
    expect(adsStore.get().pendingRewardedRetry).toEqual({ levelId: 12, earnedAt: T0 });
    expect(takeRewardedRetry(12)).toBe(true);
    expect(takeRewardedRetry(12)).toBe(false);
  });

  it('15. the rewarded retry starts at 0 hearts (and only for that level)', async () => {
    const { flows, sdk } = await setup();
    await _devSetHearts(0);
    expect(canStartLevel('campaign', 0)).toBe(false);
    const r = flows.watchRewardedRetry('campaign', 12);
    await watch(sdk, UNITS.REWARDED_RETRY, { earned: 1 });
    await r;
    expect(takeRewardedRetry(13)).toBe(false);
    const pass = takeRewardedRetry(12);
    expect(canStartLevel('campaign', peekHearts()!.hearts, { rewardedRetry: pass })).toBe(true);
    expect(peekHearts()!.hearts).toBe(0); // starting cost nothing
  });

  it('16. the authorization is consumed exactly once', async () => {
    const { flows, sdk } = await setup();
    const r = flows.watchRewardedRetry('campaign', 3);
    await watch(sdk, UNITS.REWARDED_RETRY, { earned: 1 });
    await r;
    const uses = [takeRewardedRetry(3), takeRewardedRetry(3), takeRewardedRetry(3)];
    expect(uses).toEqual([true, false, false]);
    expect(canStartLevel('campaign', 0, { rewardedRetry: false })).toBe(false);
  });

  it('17. the retried run follows normal heart rules: a loss at 1 → 0, a loss at 0 stays 0', async () => {
    await setup();
    await _devSetHearts(1);
    expect((await spendHeartForLoss('retry-run-a')).state.hearts).toBe(0);
    const again = await spendHeartForLoss('retry-run-b');
    expect(again.spent).toBe(false);
    expect(again.state.hearts).toBe(0);
  });

  it('18. dev mode: no rewarded retry — no ad, no authorization, no pass through the gate', async () => {
    const { flows, sdk } = await setup();
    await expect(flows.watchRewardedRetry('dev', 5)).resolves.toBe(false);
    expect(sdk.latest(UNITS.REWARDED_RETRY).showCalls).toBe(0);
    expect(adsStore.get().pendingRewardedRetry).toBeNull();
    expect(canStartLevel('dev', 0, { rewardedRetry: true })).toBe(true); // dev ignores hearts anyway
  });
});

describe('rewarded heart', () => {
  it('19. 0 hearts + confirmed reward → 1', async () => {
    const { flows, sdk } = await setup();
    await _devSetHearts(0);
    const r = flows.watchRewardedHeart('campaign');
    await watch(sdk, UNITS.REWARDED_HEART, { earned: 1 });
    await expect(r).resolves.toBe(true);
    expect(peekHearts()!.hearts).toBe(1);
  });

  it('20. the reward keeps the running regen timer (12 min left stays 12 min)', async () => {
    const { flows, sdk } = await setup();
    await _devSetHearts(0); // timer anchored at T0
    now = T0 + 18 * MIN;
    const r = flows.watchRewardedHeart('campaign');
    await watch(sdk, UNITS.REWARDED_HEART, { earned: 1 });
    await r;
    const s = peekHearts()!;
    expect(s.hearts).toBe(1);
    expect(s.lastHeartRegenAt).toBe(T0);
    expect(timeUntilNextHeart(s, now)).toBe(HEART_REGEN_MS - 18 * MIN);
  });

  it('21. a grant at 4 → 5 clears the regen anchor', async () => {
    await setup();
    await _devSetHearts(4);
    const s = await grantHearts(1);
    expect(s).toMatchObject({ hearts: 5, lastHeartRegenAt: null });
  });

  it('22. duplicate reward callbacks grant one heart', async () => {
    const { flows, sdk } = await setup();
    await _devSetHearts(0);
    const r = flows.watchRewardedHeart('campaign');
    await watch(sdk, UNITS.REWARDED_HEART, { earned: 4 });
    await r;
    expect(peekHearts()!.hearts).toBe(1);
  });

  it('22b. rapid double taps: the second show is refused while the first is up', async () => {
    const { flows, sdk } = await setup();
    await _devSetHearts(0);
    const a = flows.watchRewardedHeart('campaign');
    const b = flows.watchRewardedHeart('campaign');
    await expect(b).resolves.toBe(false);
    await watch(sdk, UNITS.REWARDED_HEART, { earned: 1 });
    await a;
    expect(peekHearts()!.hearts).toBe(1);
  });

  it('23. close without the reward grants nothing', async () => {
    const { flows, sdk } = await setup();
    await _devSetHearts(0);
    const r = flows.watchRewardedHeart('campaign');
    await watch(sdk, UNITS.REWARDED_HEART);
    await expect(r).resolves.toBe(false);
    expect(peekHearts()!.hearts).toBe(0);
  });

  it('24. dev mode never grants a real heart', async () => {
    const { flows, sdk } = await setup();
    await _devSetHearts(0);
    await expect(flows.watchRewardedHeart('dev')).resolves.toBe(false);
    expect(sdk.latest(UNITS.REWARDED_HEART).showCalls).toBe(0);
    expect(peekHearts()!.hearts).toBe(0);
  });
});
