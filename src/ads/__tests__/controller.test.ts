import { AD_LOAD_TIMEOUT_MS, AD_OPEN_TIMEOUT_MS, AD_RETRY_BASE_MS, REWARD_GRACE_MS } from '../config';
import { AdsController } from '../controller';
import { FakeSdk, flush, UNITS } from './fakeSdk';

function setup(opts: { units?: Partial<typeof UNITS> | null } = {}) {
  const sdk = new FakeSdk();
  const units = { ...UNITS, ...(opts.units ?? {}) };
  const ctl = new AdsController(sdk, units, { requestOptions: () => ({ nonPersonalized: true }) });
  return { sdk, ctl };
}

async function startedAndReady() {
  const s = setup();
  s.ctl.start();
  await flush();
  for (const unit of Object.values(UNITS)) s.sdk.latest(unit).emit('loaded');
  return s;
}

beforeEach(() => { jest.useFakeTimers(); });
afterEach(() => { jest.useRealTimers(); });

describe('initialization', () => {
  it('preloads every placement after init, without anyone asking', async () => {
    const { sdk, ctl } = setup();
    ctl.start();
    expect(ctl.getState('REWARDED_HEART')).toBe('idle');
    await flush();
    expect(sdk.handles.map((h) => h.unitId).sort()).toEqual(Object.values(UNITS).sort());
    expect(ctl.getState('INTERSTITIAL_CAMPAIGN')).toBe('loading');
    sdk.latest(UNITS.INTERSTITIAL_CAMPAIGN).emit('loaded');
    expect(ctl.getState('INTERSTITIAL_CAMPAIGN')).toBe('ready');
  });

  it('25. init failure never throws; every placement becomes unavailable', async () => {
    const { sdk, ctl } = setup();
    sdk.initImpl = () => Promise.reject(new Error('no network'));
    expect(() => ctl.start()).not.toThrow();
    await flush();
    expect(ctl.getState('INTERSTITIAL_CAMPAIGN')).toBe('unavailable');
    expect(ctl.getState('REWARDED_RETRY')).toBe('unavailable');
    await expect(ctl.show('REWARDED_HEART')).resolves.toEqual({ outcome: 'unavailable', opened: false, rewarded: false });
  });

  it('a synchronously throwing init is also contained', async () => {
    const { sdk, ctl } = setup();
    sdk.initImpl = () => { throw new Error('native module missing'); };
    expect(() => ctl.start()).not.toThrow();
    expect(ctl.getState('REWARDED_HEART')).toBe('unavailable');
  });

  it('no SDK at all (Expo Go / web) → unavailable, shows resolve immediately', async () => {
    const ctl = new AdsController(null, UNITS, { requestOptions: () => ({ nonPersonalized: true }) });
    ctl.start();
    expect(ctl.getState('INTERSTITIAL_CAMPAIGN')).toBe('unavailable');
    await expect(ctl.show('INTERSTITIAL_CAMPAIGN')).resolves.toMatchObject({ outcome: 'unavailable' });
  });

  it('a placement without a unit id is unavailable; the others still work', async () => {
    const { sdk, ctl } = setup({ units: { REWARDED_RETRY: null as unknown as 'unit-retry' } });
    ctl.start();
    await flush();
    expect(ctl.getState('REWARDED_RETRY')).toBe('unavailable');
    sdk.latest(UNITS.REWARDED_HEART).emit('loaded');
    expect(ctl.getState('REWARDED_HEART')).toBe('ready');
  });
});

describe('loading', () => {
  it('26. a load failure never blocks: show resolves unavailable at once, then it retries with backoff', async () => {
    const { sdk, ctl } = setup();
    ctl.start();
    await flush();
    const first = sdk.latest(UNITS.REWARDED_RETRY);
    first.emit('error');
    expect(ctl.getState('REWARDED_RETRY')).toBe('error');
    await expect(ctl.show('REWARDED_RETRY')).resolves.toMatchObject({ outcome: 'unavailable', rewarded: false });
    jest.advanceTimersByTime(AD_RETRY_BASE_MS);
    const second = sdk.latest(UNITS.REWARDED_RETRY);
    expect(second).not.toBe(first);
    expect(first.destroyed).toBe(true);
    expect(ctl.getState('REWARDED_RETRY')).toBe('loading');
  });

  it('a load that never answers times out into the retry path', async () => {
    const { ctl } = setup();
    ctl.start();
    await flush();
    jest.advanceTimersByTime(AD_LOAD_TIMEOUT_MS);
    expect(ctl.getState('INTERSTITIAL_CAMPAIGN')).toBe('error');
  });

  it('a background load finishing never shows anything by itself', async () => {
    const { sdk } = await startedAndReady();
    expect(sdk.handles.every((h) => h.showCalls === 0)).toBe(true);
  });
});

describe('showing', () => {
  it('27. show() rejecting resolves failed (never throws) and reloads', async () => {
    const { sdk, ctl } = await startedAndReady();
    const h = sdk.latest(UNITS.INTERSTITIAL_CAMPAIGN);
    h.showImpl = () => Promise.reject(new Error('not-ready'));
    const res = await ctl.show('INTERSTITIAL_CAMPAIGN');
    expect(res).toEqual({ outcome: 'failed', opened: false, rewarded: false });
    expect(ctl.isShowing()).toBe(false);
    expect(ctl.getState('INTERSTITIAL_CAMPAIGN')).toBe('loading');
  });

  it('27b. an ad that never opens is abandoned by the watchdog', async () => {
    const { ctl } = await startedAndReady();
    const p = ctl.show('INTERSTITIAL_CAMPAIGN');
    jest.advanceTimersByTime(AD_OPEN_TIMEOUT_MS);
    await expect(p).resolves.toMatchObject({ outcome: 'failed', opened: false });
    expect(ctl.isShowing()).toBe(false);
  });

  it('28. after close the used ad is destroyed and a fresh one loads', async () => {
    const { sdk, ctl } = await startedAndReady();
    const used = sdk.latest(UNITS.INTERSTITIAL_CAMPAIGN);
    const p = ctl.show('INTERSTITIAL_CAMPAIGN');
    expect(ctl.getState('INTERSTITIAL_CAMPAIGN')).toBe('showing');
    used.emit('opened');
    used.emit('closed');
    await expect(p).resolves.toEqual({ outcome: 'closed', opened: true, rewarded: false });
    expect(used.destroyed).toBe(true);
    const fresh = sdk.latest(UNITS.INTERSTITIAL_CAMPAIGN);
    expect(fresh).not.toBe(used);
    expect(fresh.loadCalls).toBe(1);
    expect(ctl.getState('INTERSTITIAL_CAMPAIGN')).toBe('loading');
    // Stale callbacks from the spent ad can't touch the new one.
    used.emit('loaded');
    expect(ctl.getState('INTERSTITIAL_CAMPAIGN')).toBe('loading');
  });

  it('29. only one full-screen ad at a time', async () => {
    const { sdk, ctl } = await startedAndReady();
    const first = ctl.show('INTERSTITIAL_CAMPAIGN');
    await expect(ctl.show('REWARDED_HEART')).resolves.toMatchObject({ outcome: 'busy' });
    await expect(ctl.show('INTERSTITIAL_CAMPAIGN')).resolves.toMatchObject({ outcome: 'busy' });
    const h = sdk.latest(UNITS.INTERSTITIAL_CAMPAIGN);
    h.emit('opened');
    h.emit('closed');
    await first;
    expect(sdk.latest(UNITS.REWARDED_HEART).showCalls).toBe(0);
  });

  it('a not-ready placement resolves unavailable instead of waiting', async () => {
    const { ctl } = setup();
    ctl.start();
    await flush();
    await expect(ctl.show('REWARDED_RETRY')).resolves.toMatchObject({ outcome: 'unavailable' });
  });
});

describe('reward handling', () => {
  it('11. opening (or impression) never grants the reward', async () => {
    const { sdk, ctl } = await startedAndReady();
    const h = sdk.latest(UNITS.REWARDED_RETRY);
    let settled = false;
    const p = ctl.show('REWARDED_RETRY').then((r) => { settled = true; return r; });
    h.emit('opened');
    await flush();
    expect(settled).toBe(false);
    h.emit('closed');
    jest.advanceTimersByTime(REWARD_GRACE_MS);
    await expect(p).resolves.toEqual({ outcome: 'closed', opened: true, rewarded: false });
  });

  it('12. close without the reward event grants nothing', async () => {
    const { sdk, ctl } = await startedAndReady();
    const h = sdk.latest(UNITS.REWARDED_HEART);
    const p = ctl.show('REWARDED_HEART');
    h.emit('opened');
    h.emit('closed');
    jest.advanceTimersByTime(REWARD_GRACE_MS);
    expect((await p).rewarded).toBe(false);
  });

  it('13. the confirmed reward event grants it (resolved on close)', async () => {
    const { sdk, ctl } = await startedAndReady();
    const h = sdk.latest(UNITS.REWARDED_RETRY);
    const p = ctl.show('REWARDED_RETRY');
    h.emit('opened');
    h.emit('earned');
    h.emit('closed');
    await expect(p).resolves.toEqual({ outcome: 'closed', opened: true, rewarded: true });
  });

  it('14. duplicate reward / close callbacks resolve once with one reward', async () => {
    const { sdk, ctl } = await startedAndReady();
    const h = sdk.latest(UNITS.REWARDED_RETRY);
    const results: unknown[] = [];
    const p = ctl.show('REWARDED_RETRY').then((r) => { results.push(r); return r; });
    h.emit('opened');
    h.emit('earned');
    h.emit('earned');
    h.emit('closed');
    h.emit('closed');
    h.emit('earned');
    await p;
    await flush();
    expect(results).toEqual([{ outcome: 'closed', opened: true, rewarded: true }]);
  });

  it('a reward event arriving just after close (within the grace window) still counts', async () => {
    const { sdk, ctl } = await startedAndReady();
    const h = sdk.latest(UNITS.REWARDED_HEART);
    const p = ctl.show('REWARDED_HEART');
    h.emit('opened');
    h.emit('closed');
    jest.advanceTimersByTime(REWARD_GRACE_MS / 2);
    h.emit('earned');
    jest.advanceTimersByTime(REWARD_GRACE_MS);
    expect((await p).rewarded).toBe(true);
  });

  it('an error mid-show resolves failed with no reward', async () => {
    const { sdk, ctl } = await startedAndReady();
    const h = sdk.latest(UNITS.REWARDED_HEART);
    const p = ctl.show('REWARDED_HEART');
    h.emit('error');
    await expect(p).resolves.toEqual({ outcome: 'failed', opened: false, rewarded: false });
  });
});
