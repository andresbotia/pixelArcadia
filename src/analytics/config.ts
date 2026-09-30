/**
 * Analytics configuration (M14). Only PostHog PROJECT keys (`phc_…`, public
 * by design) are accepted; a personal API key (`phx_…`) is refused.
 *
 *  - Production/TestFlight builds: the production project key and US host.
 *  - Development builds: only a separate dev project key, if configured.
 *  - Preview builds: off. Release builds without an explicit production mode
 *    are also off, even if the production project key is present.
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
  mode?: string;
  /** "0" silences the dev console log of events. */
  debug?: string;
}

export function readAnalyticsEnv(): AnalyticsEnv {
  return {
    apiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
    devApiKey: process.env.EXPO_PUBLIC_POSTHOG_DEV_API_KEY,
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST,
    mode: process.env.EXPO_PUBLIC_POSTHOG_MODE,
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
  const host = env.host?.trim() ?? '';
  const logEvents = isDev && env.debug !== '0';
  const off = (note: string): ResolvedAnalyticsConfig => ({ mode: 'off', apiKey: null, host, logEvents, note });
  if (env.mode === 'off') return off('analytics disabled for this build');
  if (host !== DEFAULT_POSTHOG_HOST) return off('PostHog US ingestion host missing or invalid');
  if (isDev) {
    if (env.mode !== 'development') return off('development analytics require a separate development mode');
    const dev = env.devApiKey?.trim();
    if (dev && dev === env.apiKey?.trim()) return off('development project key must differ from production');
    return isProjectKey(dev)
      ? { mode: 'development', apiKey: dev, host, logEvents }
      : off('development project key missing or invalid');
  }
  if (env.mode !== 'production') return off('release analytics require production mode');
  const key = env.apiKey?.trim();
  if (!key) return off('no PostHog project key');
  if (!isProjectKey(key)) return off('PostHog key must be a project key (phc_…)');
  return { mode: 'production', apiKey: key, host, logEvents };
}
