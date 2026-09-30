import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { CAMPAIGN_VERSION, PUBLISHED_MAX_LEVEL } from '@/game/levels/publishing';
import { analyticsStore } from '@/storage/analytics';

import { createAnalytics, type AnalyticsClient } from './api';
import { DISABLE_GEOIP, readAnalyticsEnv, resolveAnalyticsConfig } from './config';
import type { AnalyticsProps } from './events';

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;
const config = resolveAnalyticsConfig({ isDev, env: readAnalyticsEnv() });
const log = config.logEvents ? (m: string) => console.log(m) : undefined;
if (isDev) console.log(`[analytics] mode=${config.mode}${config.note ? ` (${config.note})` : ''}`);

/**
 * THE only place PostHog is constructed. Product analytics only:
 *  - anonymous PostHog distinct id; no identify(), no PII;
 *  - no session replay, no exception/crash autocapture, no autocapture of
 *    app lifecycle (we send our own `app_opened`);
 *  - no GeoIP enrichment (`DISABLE_GEOIP`);
 *  - SDK batching/queueing (default flush) persisted via AsyncStorage.
 * Any failure → null client → every analytics call is a no-op.
 */
function createPostHogClient(): AnalyticsClient | null {
  if (config.mode === 'off' || !config.apiKey) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PostHog } = require('posthog-react-native') as typeof import('posthog-react-native');
    const posthog = new PostHog(config.apiKey, {
      host: config.host,
      persistence: 'file',
      customStorage: AsyncStorage,
      captureAppLifecycleEvents: false,
      enableSessionReplay: false,
      errorTracking: { autocapture: { uncaughtExceptions: false, unhandledRejections: false, console: false, nativeCrashes: false } },
      personProfiles: 'always',
      disableGeoip: DISABLE_GEOIP,
    });
    return {
      capture: (event, properties) => posthog.capture(event, properties),
      register: (properties) => { void posthog.register(properties).catch(() => {}); },
      setPersonProperties: (properties) => posthog.setPersonProperties(properties),
    };
  } catch {
    if (isDev) console.log('[analytics] PostHog unavailable');
    return null;
  }
}

/** Build info as super properties (read natively; never guessed). */
function appSuperProps(): AnalyticsProps {
  const props: AnalyticsProps = {
    platform: Platform.OS,
    published_max_level: PUBLISHED_MAX_LEVEL,
    campaign_version: CAMPAIGN_VERSION,
    environment: config.mode === 'development' ? 'development' : 'production',
  };
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const app = require('expo-application') as typeof import('expo-application');
    props.app_version = app.nativeApplicationVersion ?? null;
    props.build_number = app.nativeBuildVersion ?? null;
  } catch { /* unavailable (web / old binary) */ }
  try {
    // EAS Update channel (development / preview / production build profile).
    // Deliberately NOT a TestFlight-vs-App-Store claim: one production binary serves both.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const updates = require('expo-updates') as typeof import('expo-updates');
    props.release_channel = updates.channel ?? null;
  } catch { /* unavailable */ }
  return props;
}

export const analytics = createAnalytics({
  client: createPostHogClient(),
  store: analyticsStore,
  now: () => Date.now(),
  publishedMax: PUBLISHED_MAX_LEVEL,
  log,
});

let started = false;
/** Register build super properties once. Never blocks, never throws. */
export function startAnalytics(): void {
  if (started) return;
  started = true;
  try {
    analytics.register(appSuperProps());
  } catch { /* never surfaces */ }
}
