/**
 * Analytics configuration (M14). Only PostHog PROJECT keys (`phc_…`, public
 * by design) are accepted; a personal API key (`phx_…`) is refused.
 *
 *  - Release builds (TestFlight / App Store): EXPO_PUBLIC_POSTHOG_API_KEY.
 *  - Dev builds: NEVER the production key. Only EXPO_PUBLIC_POSTHOG_DEV_API_KEY
 *    (a separate PostHog project) if set; otherwise analytics is off and events
 *    are only logged to the console.
 */
export const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com';

/** Players this far from the published max trigger `content_ceiling_approaching`. */
export const CONTENT_WARNING_DISTANCE = 50;
/** Below this published size the ceiling alert is off (a 50-level campaign would alert at level 0). */
export const CONTENT_CEILING_ALERT_MIN_MAX_LEVEL = 100;

/**
 * Privacy default: no GeoIP enrichment (no country/city on events). Flip only
 * with an explicit product decision + privacy-label update.
 */
export const DISABLE_GEOIP = true;

export interface AnalyticsEnv {
  apiKey?: string;
  devApiKey?: string;
  host?: string;
  /** "0" silences the dev console log of events. */
  debug?: string;
}

export function readAnalyticsEnv(): AnalyticsEnv {
  return {
    apiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
    devApiKey: process.env.EXPO_PUBLIC_POSTHOG_DEV_API_KEY,
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST,
    debug: process.env.EXPO_PUBLIC_ANALYTICS_DEBUG,
  };
}

export interface ResolvedAnalyticsConfig {
  /** off: nothing leaves the device. production / development: which PostHog project. */
  mode: 'off' | 'production' | 'development';
  apiKey: string | null;
  host: string;
  /** Dev-only compact console log of each semantic event. */
  logEvents: boolean;
  note?: string;
}

const isProjectKey = (k: string | undefined): k is string => !!k && /^phc_[A-Za-z0-9]{20,}$/.test(k.trim());

export function resolveAnalyticsConfig(input: { isDev: boolean; env: AnalyticsEnv }): ResolvedAnalyticsConfig {
  const { isDev, env } = input;
  const host = env.host?.trim() || DEFAULT_POSTHOG_HOST;
  const logEvents = isDev && env.debug !== '0';
  if (isDev) {
    const dev = env.devApiKey?.trim();
    return isProjectKey(dev)
      ? { mode: 'development', apiKey: dev, host, logEvents }
      : { mode: 'off', apiKey: null, host, logEvents, note: 'dev build: production analytics disabled (set EXPO_PUBLIC_POSTHOG_DEV_API_KEY for a dev project)' };
  }
  const key = env.apiKey?.trim();
  if (!key) return { mode: 'off', apiKey: null, host, logEvents, note: 'no PostHog API key' };
  if (!isProjectKey(key)) return { mode: 'off', apiKey: null, host, logEvents, note: 'PostHog key must be a project key (phc_…)' };
  return { mode: 'production', apiKey: key, host, logEvents };
}
