import type { AdsConsentDebugGeography, AdsConsentInfo, AdsConsentInfoOptions } from 'react-native-google-mobile-ads';

type ConsentSdk = Pick<typeof import('react-native-google-mobile-ads')['AdsConsent'],
  'requestInfoUpdate' | 'loadAndShowConsentFormIfRequired' | 'getConsentInfo' | 'showPrivacyOptionsForm'>;

export const PRIVACY_POLICY_URL = 'https://andresbotia.github.io/pixelArcadia/privacy/';

export async function openPrivacyPolicy(openURL: (url: string) => Promise<unknown>): Promise<void> {
  try { await openURL(PRIVACY_POLICY_URL); } catch { /* Settings remains usable offline */ }
}

/** Never configure a debug location or device in a release bundle. */
export function consentDebugOptions(isDev: boolean, geography?: 'EEA' | 'OTHER', deviceId?: string): AdsConsentInfoOptions | undefined {
  if (!isDev || !geography) return undefined;
  return { debugGeography: (geography === 'EEA' ? 1 : 4) as AdsConsentDebugGeography,
    ...(deviceId ? { testDeviceIdentifiers: [deviceId] } : {}) };
}

export class AdConsentController {
  private started = false;
  private optionsRequired = false;
  private listeners = new Set<() => void>();

  constructor(private readonly sdk: ConsentSdk | null, private readonly allowAds: (allowed: boolean) => void,
    private readonly options?: AdsConsentInfoOptions) {}

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  isPrivacyOptionsRequired(): boolean { return this.optionsRequired; }

  /** Called once per cold start. UMP work is deliberately outside the boot gate. */
  start(): void {
    if (this.started) return;
    this.started = true;
    void this.refresh();
  }

  private apply(info: AdsConsentInfo): void {
    const required = info.privacyOptionsRequirementStatus === 'REQUIRED';
    if (required !== this.optionsRequired) {
      this.optionsRequired = required;
      for (const listener of this.listeners) { try { listener(); } catch { /* UI isolation */ } }
    }
    this.allowAds(info.canRequestAds);
  }

  private async refresh(): Promise<void> {
    if (!this.sdk) return;
    try {
      const updated = await this.sdk.requestInfoUpdate(this.options);
      this.apply(updated); // A previous session may already permit ads.
      const final = await this.sdk.loadAndShowConsentFormIfRequired();
      this.apply(final);
    } catch {
      // Google permits using the previous session's status after a network/form error.
      try { this.apply(await this.sdk.getConsentInfo()); } catch { /* ads remain unavailable */ }
    }
  }

  async showPrivacyOptions(): Promise<void> {
    if (!this.sdk || !this.optionsRequired) return;
    try { this.apply(await this.sdk.showPrivacyOptionsForm()); }
    catch { try { this.apply(await this.sdk.getConsentInfo()); } catch { /* keep current state */ } }
  }
}
