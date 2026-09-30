import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { createAdsSaveState, sanitizeAdsSaveState } from '../cadence';
import { AdsController } from '../controller';
import { GOOGLE_SAMPLE_APP_IDS, GOOGLE_TEST_UNIT_IDS, readProductionUnitIds, resolveAdUnits, type ProductionUnitIds } from '../config';
import { FakeSdk, flush } from './fakeSdk';

const root = resolve(__dirname, '../../..');
const eas = JSON.parse(readFileSync(join(root, 'eas.json'), 'utf8')) as { build: Record<string, { env: Record<string, string> }> };
const productionEnv = eas.build.production!.env;

const PROD: ProductionUnitIds = {
  ios: {
    INTERSTITIAL_CAMPAIGN: productionEnv.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID,
    REWARDED_RETRY: productionEnv.EXPO_PUBLIC_ADMOB_IOS_REWARDED_RETRY_ID,
    REWARDED_HEART: productionEnv.EXPO_PUBLIC_ADMOB_IOS_REWARDED_HEART_ID,
  },
  android: {},
};
const REAL_APP_ID = productionEnv.ADMOB_IOS_APP_ID;
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
    expect(r.units).toEqual({
      INTERSTITIAL_CAMPAIGN: 'ca-app-pub-5253670144191495/4538971187',
      REWARDED_RETRY: 'ca-app-pub-5253670144191495/4978040608',
      REWARDED_HEART: 'ca-app-pub-5253670144191495/5972481515',
    });
  });

  it('the EAS production env feeds the existing literal Expo public reads', () => {
    const keys = Object.keys(productionEnv);
    for (const key of keys) process.env[key] = productionEnv[key];
    try {
      expect(readProductionUnitIds().ios).toEqual(PROD.ios);
    } finally {
      for (const key of keys) delete process.env[key];
    }
    expect(eas.build.development!.env.EXPO_PUBLIC_ADS_TEST_MODE).toBe('1');
    expect(eas.build.preview!.env.EXPO_PUBLIC_ADS_TEST_MODE).toBe('1');
    expect(productionEnv.EXPO_PUBLIC_ADS_TEST_MODE).toBe('0');
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

  it('blank, placeholder, sample, wrong-publisher and obsolete bidding units never reach the SDK', () => {
    for (const bad of ['', 'ca-app-pub-5253670144191495/0000000000',
      GOOGLE_TEST_UNIT_IDS.ios.interstitial, 'ca-app-pub-1111111111111111/2222222222',
      `ca-app-pub-5253670144191495/${'6490432820'}`]) {
      const r = resolveAdUnits({ ...base, production: { ...PROD, ios: { ...PROD.ios, INTERSTITIAL_CAMPAIGN: bad } } });
      expect(r.units.INTERSTITIAL_CAMPAIGN).toBeNull();
      expect(r.notes).toContain('INTERSTITIAL_CAMPAIGN: no valid production unit id — placement off');
    }
  });

  it.each(['INTERSTITIAL_CAMPAIGN', 'REWARDED_RETRY', 'REWARDED_HEART'] as const)(
    'a missing %s stays unavailable without affecting the other placements', (placement) => {
      const r = resolveAdUnits({ ...base, production: { ...PROD, ios: { ...PROD.ios, [placement]: undefined } } });
      expect(r.units[placement]).toBeNull();
      expect(Object.values(r.units).filter(Boolean)).toHaveLength(2);
    },
  );

  it('invalid rewarded configuration never requests an ad or reports a reward', async () => {
    jest.useFakeTimers();
    const resolved = resolveAdUnits({ ...base, production: { ...PROD, ios: {
      ...PROD.ios, REWARDED_RETRY: '', REWARDED_HEART: 'placeholder',
    } } });
    const sdk = new FakeSdk();
    const controller = new AdsController(sdk, resolved.units, { requestOptions: () => ({ nonPersonalized: true }) });
    controller.start();
    await flush();
    expect(sdk.handles).toHaveLength(1);
    await expect(controller.show('REWARDED_RETRY')).resolves.toMatchObject({ outcome: 'unavailable', rewarded: false });
    await expect(controller.show('REWARDED_HEART')).resolves.toMatchObject({ outcome: 'unavailable', rewarded: false });
    jest.clearAllTimers();
    jest.useRealTimers();
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

  it('Expo config supplies the production native iOS App ID and keeps dev/preview on the sample ID', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const appConfig = require('../../../app.config.js') as ({ config }: { config: object }) => { plugins: unknown[] };
    const plugin = (plugins: unknown[]) => plugins.find((p): p is [string, Record<string, unknown>] =>
      Array.isArray(p) && p[0] === 'react-native-google-mobile-ads');
    const previousProfile = process.env.EAS_BUILD_PROFILE;
    const previousAppId = process.env.ADMOB_IOS_APP_ID;
    const previousTestMode = process.env.EXPO_PUBLIC_ADS_TEST_MODE;
    process.env.EAS_BUILD_PROFILE = 'production';
    process.env.ADMOB_IOS_APP_ID = REAL_APP_ID;
    const release = appConfig({ config: {} });
    expect(plugin(release.plugins)?.[1].iosAppId).toBe('ca-app-pub-5253670144191495~3800690302');
    delete process.env.EAS_BUILD_PROFILE;
    process.env.EXPO_PUBLIC_ADS_TEST_MODE = '0';
    expect(plugin(appConfig({ config: {} }).plugins)?.[1].iosAppId).toBe(REAL_APP_ID);
    process.env.EAS_BUILD_PROFILE = 'production';
    delete process.env.ADMOB_IOS_APP_ID;
    expect(() => appConfig({ config: {} })).toThrow('Production AdMob iOS App ID');
    process.env.EAS_BUILD_PROFILE = 'preview';
    process.env.EXPO_PUBLIC_ADS_TEST_MODE = '1';
    const preview = appConfig({ config: {} });
    const entry = plugin(preview.plugins);
    expect(entry).toBeDefined();
    expect(entry![1].iosAppId).toBe(GOOGLE_SAMPLE_APP_IDS.ios);
    expect(entry![1].androidAppId).toMatch(/^ca-app-pub-\d{16}~\d{10}$/);
    expect(entry![1].userTrackingUsageDescription).toBeUndefined();
    if (previousProfile === undefined) delete process.env.EAS_BUILD_PROFILE;
    else process.env.EAS_BUILD_PROFILE = previousProfile;
    if (previousAppId === undefined) delete process.env.ADMOB_IOS_APP_ID;
    else process.env.ADMOB_IOS_APP_ID = previousAppId;
    if (previousTestMode === undefined) delete process.env.EXPO_PUBLIC_ADS_TEST_MODE;
    else process.env.EXPO_PUBLIC_ADS_TEST_MODE = previousTestMode;
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
