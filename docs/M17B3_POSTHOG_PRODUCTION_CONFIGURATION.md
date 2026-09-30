# M17B.3 — Production PostHog configuration

## Result and architecture

Pixel Arcadia keeps its existing `posthog-react-native` integration behind `src/analytics/service.ts` and the semantic API in `src/analytics/api.ts`. UI, gameplay, ads, and purchases call that API; only the service constructs PostHog. The public US Cloud project token is read from `EXPO_PUBLIC_POSTHOG_API_KEY`, and the ingestion host from `EXPO_PUBLIC_POSTHOG_HOST`. The production host must be exactly `https://us.i.posthog.com` (`https://us.posthog.com` is the UI host, not this app's ingestion setting). The token is never stored in this repository or printed by the app. A `phx_` personal API key is rejected.

`EXPO_PUBLIC_POSTHOG_MODE` now makes selection explicit in `eas.json`: development uses only a separate `EXPO_PUBLIC_POSTHOG_DEV_API_KEY` project token if one is supplied and differs from the configured production token; otherwise events stay on-device and may be logged in the dev console. Preview is off. Production/TestFlight uses the `phc_` production token only when mode, key, and host are valid. A non-debug preview build can no longer send to production just because the production token is present. A missing/malformed key or host, unknown mode, missing SDK, or constructor failure leaves analytics as a no-op; gameplay startup does not wait for PostHog. EAS Update must receive the same `EXPO_PUBLIC_POSTHOG_MODE=production`, token, and host from its production environment; build-profile `env` alone does not configure an update bundle. Remote EAS variable values were not independently inspected.

The service creates one module-level client and `startAnalytics()` registers build super properties at most once. `app/_layout.tsx` installs the heart-regeneration observer once at module load. The installed SDK (`posthog-react-native` 4.78.0) persists/queues events and handles mobile app-state flushing; the app does not wait for a network flush or add a shutdown loop. Manual ingestion on a TestFlight device is still needed to establish actual delivery to the account.

## Privacy and event safety

- No `identify()` call exists. The SDK maintains a persistent anonymous distinct ID; anonymous person profiles carry gameplay progress and Remove Ads ownership because the existing service uses `personProfiles: 'always'`. There is no email, real name, Apple ID, Game Center nickname, advertising ID, precise location, RevenueCat customer ID, or transaction ID in the app's explicit event properties. No ATT request was introduced for PostHog.
- Session replay remains disabled (`enableSessionReplay: false`); no recorder, screenshots, or touch capture are started. The app does not mount `PostHogProvider`, so provider screen/touch autocapture is absent. SDK lifecycle capture is disabled, as are JS/native error autocapture options. Events remain explicit.
- Client-side `disableGeoip: true` requests no GeoIP enrichment. It does **not** prove that the service never receives a network IP address or that project-side IP storage settings are correct. In the production PostHog project, manually verify the project setting to **discard IP data** and inspect a captured event for absence of IP-derived location properties. This dashboard/account setting was not accessible during this milestone. See [PostHog privacy controls](https://posthog.com/docs/privacy).
- Capture, registration, and person-property calls are best effort. PostHog exceptions and diagnostic-log exceptions are contained; diagnostics no longer stringify SDK errors that might include a token or other identifiers. Analytics cannot gate a level result, heart write, ad reward, IAP grant, or startup.

## Events, properties, and deduplication

The canonical names in `src/analytics/events.ts` remain unchanged: `app_opened`; `level_started`, `level_completed`, `level_failed`, `level_abandoned`, `level_retried`; `item_used`; `endgame_fast_forward_started`; `heart_spent`, `heart_regenerated`, `heart_rewarded`, `out_of_hearts_viewed`; and `content_ceiling_approaching`. Ads use `ad_interstitial_eligible/shown/failed/skipped`, `ad_rewarded_retry_started/earned/closed_without_reward/failed`, and the corresponding `ad_rewarded_heart_*` names. Purchases use `iap_viewed/started/cancelled/failed/completed/reward_granted`, `restore_started/completed`, and `remove_ads_activated`. These names are the app's actual vocabulary; no names were changed to match examples in the brief.

Build super properties are `app_version`, `build_number`, `platform`, `published_max_level`, `campaign_version`, `environment`, and `release_channel`; `current_highest_level` is registered when saved progression is evaluated and updated when it changes. The earliest startup event can precede that dynamic registration; `app_opened` also carries its own `highest_level` value. `environment=production` and production release-channel filtering distinguish live data; development events can only reach a separate project. No raw transaction/customer objects are passed to analytics; IAP events use product ID/category, reward summary, and localized price information.

Existing once-guards prevent duplicate `app_opened` per cold start, one terminal level result per run, one fast-forward event per run, one `content_ceiling_approaching` per published max per install, one rewarded-heart event per confirmed ad, and one IAP grant event per processed RevenueCat transaction. `remove_ads_activated` fires only on a false-to-true entitlement transition. React rerenders do not reconstruct the module-level client. The targeted tests cover the purchase result/listener/refresh overlap, ad reward duplication, and level-result duplication.

With `PUBLISHED_MAX_LEVEL = 50` and `CAMPAIGN_VERSION = 'v2-50'`, the ceiling event is disabled because the published maximum is below 100. At a future maximum of 500, it triggers when the highest **completed** published level reaches 450, once for that maximum. Neither publishing constant was changed.

## Manual dashboard: LIVE GAME HEALTH

Create a blank dashboard named **LIVE GAME HEALTH** in the production US Cloud project, then save/add the following insights. Set the dashboard default to **last 7 days, daily**; use **last 30 days, weekly** for low-volume patterns, and apply `environment = production` plus the production `release_channel` filter where available. Use the exact event names below. PostHog's [dashboard](https://posthog.com/docs/product-analytics/dashboards), [trends](https://posthog.com/docs/product-analytics/trends/overview), and [funnels](https://posthog.com/docs/product-analytics/funnels) documentation describes the available insight types.

| Insight | Suggested visualization / calculation |
| --- | --- |
| DAU | Daily unique anonymous distinct IDs on `app_opened`, line and current-value tile |
| App opens | Daily total `app_opened`, line |
| Level starts, completions, failures | Daily totals of `level_started`, `level_completed`, `level_failed`, three-series line |
| Completion rate | Formula: `level_completed` total / `level_started` total for the same interval; label as attempt-event ratio (a funnel may answer a different question) |
| Highest level distribution | Unique users by latest `highest_level_completed` person property, binned/bar chart; optionally compare event `current_highest_level` after initial registration |
| Out of hearts / rewarded hearts | Daily `out_of_hearts_viewed` and `heart_rewarded` totals, two-series line |
| Interstitial shows | Daily `ad_interstitial_shown` total, line |
| Rewarded completions | Daily totals for `ad_rewarded_retry_earned` and `ad_rewarded_heart_earned`, stacked bar |
| IAP starts, completions, failures | Daily `iap_started`, `iap_completed`, `iap_failed` totals, three-series line; break down by `product_id` |
| Remove Ads activations | Daily `remove_ads_activated` total, number/line |
| Item usage | Daily `item_used` total, breakdown by `item`, stacked bar |
| Content ceiling | Daily `content_ceiling_approaching` count and unique users, number/line, breakdown by `published_max_level` |

### Content-ceiling alert

After the 500-level campaign is published, save a production-filtered Trends insight for **unique users with `content_ceiling_approaching` in the last 24 hours**, with `published_max_level = 500`. Configure a threshold alert for **greater than 0** on that rolling daily count, route it to the team's chosen in-app/email destination, and verify one test notification plus alert recovery/quieting. The event is once per published maximum **per install**, so the alert is an early signal rather than a count of all near-ceiling sessions. At the current maximum of 50 there can be no genuine event; leave the alert dormant until the 500-level release. Confirm the desired alert control/destination is available on the current Free project before enabling it; no pay-as-you-go assumption is made.

## Remaining account and launch work

The PostHog dashboard and alert above were specified but **not created** because this session has no project/dashboard access. In the production project, verify the region, token-to-project association, IP-discard setting, replay/autocapture settings, and Free-plan event usage/limits. After a production TestFlight install, inspect Live Events for one `app_opened`, a level start/result, ad and IAP events when exercised, expected super properties, anonymous distinct IDs, and no forbidden identifiers. Confirm development and preview builds create no production events. Monitor event volume after launch and reduce only unnecessary event sources if Free-plan usage becomes material.

## Validation and files

Changed: `eas.json` (explicit per-profile mode), `src/analytics/config.ts` (strict mode/key/host selection), `src/analytics/service.ts` (safe constructor diagnostic), `src/analytics/api.ts` (safe capture diagnostics), `src/analytics/__tests__/analytics.test.ts` (configuration, constructor/privacy, and failure-isolation regressions), and this report. No AdMob, RevenueCat, economy, heart timing, Game Center, level content, or publishing files changed. No commit or push was made.

- Targeted Jest: **3 suites, 102 tests passed** (`src/analytics/__tests__/analytics.test.ts`, `src/ads/__tests__/flows.test.ts`, `src/iap/__tests__/iap.test.ts`). New coverage includes strict profile/key/host selection, constructor privacy options, init once/failure, diagnostic failure, and analytics failure isolation across level completion, rewarded hearts, and IAP grants.
- `npx tsc --noEmit`: **passed**.
- ESLint on touched TypeScript files: **passed**, zero warnings/errors.
- `npx expo config --type public --json` with development, preview, and production profile environments: **all three passed**. This validates local Expo config/profile modes, not remote EAS values or PostHog ingestion.
- `git diff --check`: **passed**. `git diff --stat`: **5 tracked files, 206 insertions, 25 deletions**, plus this new untracked report. No native build was requested or run.
