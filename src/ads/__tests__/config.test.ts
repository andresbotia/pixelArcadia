import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { createAdsSaveState, sanitizeAdsSaveState } from '../cadence';
import { GOOGLE_SAMPLE_APP_IDS, GOOGLE_TEST_UNIT_IDS, resolveAdUnits, type ProductionUnitIds } from '../config';

const PROD: ProductionUnitIds = {
  ios: {
    INTERSTITIAL_CAMPAIGN: 'ca-app-pub-1111111111111111/1111111111',
    REWARDED_RETRY: 'ca-app-pub-1111111111111111/2222222222',
    REWARDED_HEART: 'ca-app-pub-1111111111111111/3333333333',
  },
  android: {},
};
const REAL_APP_ID = 'ca-app-pub-1111111111111111~9999999999';
const base = { platform: 'ios', isDev: false, forceTest: false, production: PROD, appId: REAL_APP_ID };
const allUnits = (r: ReturnType<typeof resolveAdUnits>) => Object.values(r.units);

describe('ad unit resolution', () => {
  it('30. dev builds ALWAYS use Google test units, even with production ids configured', () => {
    const r = resolveAdUnits({ ...base, isDev: true });
    expect(r.mode).toBe('test');
    expect(r.units).toEqual({
      INTERSTITIAL_CAMPAIGN: GOOGLE_TEST_UNIT_IDS.ios.interstitial,
      REWARDED_RETRY: GOOGLE_TEST_UNIT_IDS.ios.rewarded,
      REWARDED_HEART: GOOGLE_TEST_UNIT_IDS.ios.rewarded,
    });
    for (const id of Object.values(PROD.ios)) expect(allUnits(r)).not.toContain(id);
  });

  it('EXPO_PUBLIC_ADS_TEST_MODE pins test units in a release build (TestFlight)', () => {
    expect(resolveAdUnits({ ...base, forceTest: true }).mode).toBe('test');
  });

  it('release builds use configured production units', () => {
    const r = resolveAdUnits(base);
    expect(r.mode).toBe('live');
    expect(r.units.REWARDED_HEART).toBe(PROD.ios.REWARDED_HEART);
  });

  it('a missing/malformed production unit turns only that placement off (fail safe, no test fallback)', () => {
    const r = resolveAdUnits({
      ...base,
      production: { ios: { ...PROD.ios, REWARDED_RETRY: 'ca-app-pub-1111111111111111~2222222222' }, android: {} },
    });
    expect(r.units.REWARDED_RETRY).toBeNull();
    expect(r.units.INTERSTITIAL_CAMPAIGN).toBe(PROD.ios.INTERSTITIAL_CAMPAIGN);
    expect(allUnits(resolveAdUnits({ ...base, production: { ios: {}, android: {} } }))).toEqual([null, null, null]);
  });

  it('a release build still carrying Google\'s SAMPLE app id never requests live ads', () => {
    const r = resolveAdUnits({ ...base, appId: GOOGLE_SAMPLE_APP_IDS.ios });
    expect(r.mode).toBe('off');
    expect(allUnits(r)).toEqual([null, null, null]);
    expect(resolveAdUnits({ ...base, appId: 'garbage' }).mode).toBe('off');
    // Unreadable app id (public config without `plugins`) → the unit ids decide.
    expect(resolveAdUnits({ ...base, appId: undefined }).mode).toBe('live');
  });

  it('web (and anything else) has no ads', () => {
    expect(resolveAdUnits({ ...base, platform: 'web', isDev: true }).mode).toBe('off');
  });

  it('keeps app ids and unit ids distinct (tilde vs slash)', () => {
    for (const p of ['ios', 'android'] as const) {
      expect(GOOGLE_SAMPLE_APP_IDS[p]).toMatch(/~/);
      expect(GOOGLE_TEST_UNIT_IDS[p].interstitial).toMatch(/\//);
      expect(GOOGLE_TEST_UNIT_IDS[p].rewarded).toMatch(/\//);
    }
  });

  it('app.json wires the plugin with app ids (the native SDK crashes without them) and no ATT prompt', () => {
    const cfg = JSON.parse(readFileSync(join(resolve(__dirname, '../../..'), 'app.json'), 'utf8')) as { expo: { plugins: unknown[] } };
    const entry = cfg.expo.plugins.find((p): p is [string, Record<string, unknown>] => Array.isArray(p) && p[0] === 'react-native-google-mobile-ads');
    expect(entry).toBeDefined();
    expect(entry![1].iosAppId).toMatch(/^ca-app-pub-\d{16}~\d{10}$/);
    expect(entry![1].androidAppId).toMatch(/^ca-app-pub-\d{16}~\d{10}$/);
    expect(entry![1].userTrackingUsageDescription).toBeUndefined();
  });
});

describe('persisted ad state', () => {
  it('sanitizes garbage and clamps the cadence', () => {
    expect(sanitizeAdsSaveState(null)).toEqual(createAdsSaveState());
    expect(sanitizeAdsSaveState({ firstClearsSinceInterstitial: 99 }).firstClearsSinceInterstitial).toBe(3);
    expect(sanitizeAdsSaveState({ firstClearsSinceInterstitial: -2 }).firstClearsSinceInterstitial).toBe(0);
    expect(sanitizeAdsSaveState({ pendingRewardedRetry: { levelId: 'x' } }).pendingRewardedRetry).toBeNull();
    expect(sanitizeAdsSaveState({ pendingRewardedRetry: { levelId: 4, earnedAt: 10 } }).pendingRewardedRetry).toEqual({ levelId: 4, earnedAt: 10 });
  });
});
