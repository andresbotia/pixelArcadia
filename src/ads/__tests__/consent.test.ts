import { AdConsentController, consentDebugOptions, openPrivacyPolicy, PRIVACY_POLICY_URL } from '../consent';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AdsController } from '../controller';
import { FakeSdk, flush, UNITS } from './fakeSdk';

const info = (canRequestAds: boolean, required = false, options = false) => ({
  status: required ? 'REQUIRED' : 'NOT_REQUIRED', canRequestAds,
  privacyOptionsRequirementStatus: options ? 'REQUIRED' : 'NOT_REQUIRED',
  isConsentFormAvailable: required,
} as const);

beforeEach(() => { jest.useFakeTimers(); });
afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });

function setup(updated = info(true), final = info(true)) {
  const sdk = new FakeSdk();
  const ads = new AdsController(sdk, UNITS, { requestOptions: () => ({ nonPersonalized: true }) });
  ads.setConsentAllowed(false);
  const native = {
    requestInfoUpdate: jest.fn().mockResolvedValue(updated),
    loadAndShowConsentFormIfRequired: jest.fn().mockResolvedValue(final),
    getConsentInfo: jest.fn().mockResolvedValue(final),
    showPrivacyOptionsForm: jest.fn().mockResolvedValue(final),
  };
  const consent = new AdConsentController(native, allowed => ads.setConsentAllowed(allowed));
  return { sdk, ads, native, consent };
}

it('requests consent info at startup and gates ad initialization and loads', async () => {
  const s = setup(info(false, true, true), info(true, false, true));
  s.consent.start();
  expect(s.native.requestInfoUpdate).toHaveBeenCalledTimes(1);
  expect(s.sdk.handles).toHaveLength(0);
  await flush();
  expect(s.native.loadAndShowConsentFormIfRequired).toHaveBeenCalledTimes(1);
  expect(s.sdk.handles).toHaveLength(3);
  expect(s.consent.isPrivacyOptionsRequired()).toBe(true);
  s.consent.start();
  expect(s.native.requestInfoUpdate).toHaveBeenCalledTimes(1);
});

it('skips the form internally when not required, opens privacy options only when required', async () => {
  const s = setup();
  s.consent.start();
  await flush();
  expect(s.consent.isPrivacyOptionsRequired()).toBe(false);
  await s.consent.showPrivacyOptions();
  expect(s.native.showPrivacyOptionsForm).not.toHaveBeenCalled();
  s.native.requestInfoUpdate.mockResolvedValue(info(true, false, true));
  s.native.loadAndShowConsentFormIfRequired.mockResolvedValue(info(true, false, true));
  // A fresh app launch updates the requirement; resume does not re-present a form.
  const next = new AdConsentController(s.native, allowed => s.ads.setConsentAllowed(allowed));
  next.start();
  await flush();
  await next.showPrivacyOptions();
  expect(s.native.showPrivacyOptionsForm).toHaveBeenCalledTimes(1);
});

it('consent failure is nonfatal and only cached canRequestAds can open the gate', async () => {
  const s = setup();
  s.native.requestInfoUpdate.mockRejectedValue(new Error('offline'));
  s.native.getConsentInfo.mockResolvedValue(info(false));
  s.consent.start();
  await flush();
  expect(s.sdk.handles).toHaveLength(0);
});

it('privacy choices can revoke cached inventory without affecting the app', async () => {
  const s = setup(info(true, false, true), info(true, false, true));
  s.consent.start();
  await flush();
  s.native.showPrivacyOptionsForm.mockResolvedValue(info(false, false, true));
  await s.consent.showPrivacyOptions();
  expect(s.sdk.handles.every(handle => handle.destroyed)).toBe(true);
  await expect(s.ads.show('REWARDED_HEART')).resolves.toMatchObject({ outcome: 'unavailable' });
});

it('release never receives debug geography or test device IDs', () => {
  expect(consentDebugOptions(false, 'EEA', 'test')).toBeUndefined();
  expect(consentDebugOptions(true, 'EEA', 'test')).toEqual({ debugGeography: 1, testDeviceIdentifiers: ['test'] });
  expect(PRIVACY_POLICY_URL).toBe('https://andresbotia.github.io/pixelArcadia/privacy/');
});

it('opens the exact live policy URL and contains URL failures', async () => {
  const open = jest.fn().mockRejectedValue(new Error('offline'));
  await expect(openPrivacyPolicy(open)).resolves.toBeUndefined();
  expect(open).toHaveBeenCalledWith(PRIVACY_POLICY_URL);
  await expect(openPrivacyPolicy(() => { throw new Error('native missing'); })).resolves.toBeUndefined();
});

it('app privacy metadata covers app-sent analytics and update identifier without claiming app tracking', () => {
  const app = JSON.parse(readFileSync(join(process.cwd(), 'app.json'), 'utf8'));
  const manifest = app.expo.ios.privacyManifests;
  expect(manifest.NSPrivacyTracking).toBe(false);
  const types = manifest.NSPrivacyCollectedDataTypes.map((entry: { NSPrivacyCollectedDataType: string }) => entry.NSPrivacyCollectedDataType);
  expect(types).toEqual(expect.arrayContaining([
    'NSPrivacyCollectedDataTypeProductInteraction', 'NSPrivacyCollectedDataTypeUserID',
    'NSPrivacyCollectedDataTypePurchaseHistory', 'NSPrivacyCollectedDataTypeDeviceID',
  ]));
  const policy = readFileSync(join(process.cwd(), 'site/privacy/index.html'), 'utf8');
  expect(policy).toContain('andresfbotia@gmail.com');
  expect(policy).not.toMatch(/TODO|PLACEHOLDER|example\.com/);
});
