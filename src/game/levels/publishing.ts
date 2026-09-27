/**
 * What the campaign PUBLISHES — the one place to bump when content ships.
 * Analytics, ceiling alerts and dashboards read these; gameplay does not.
 *
 * Note: the runtime currently contains more authored levels (51–100, legacy
 * ruleset) than are published as Campaign V2; this value is the product's
 * published ceiling, not the level registry's length.
 */
export const PUBLISHED_MAX_LEVEL = 50;

/** Content revision tag for comparing data across rebalances ("v2-50"). */
export const CAMPAIGN_VERSION = 'v2-50';
