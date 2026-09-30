# Pixel Arcadia M17B.1 — production AdMob configuration

**Result:** Production iOS AdMob configuration is wired for the EAS `production` profile. Development and internal `preview` builds use Google's official test app/unit IDs. The ad state machine, cadence, reward rules, and campaign publishing are unchanged. The existing Remove Ads policy now also prevents interstitial *requests* during startup, after the cached entitlement is loaded. No commit or push was made.

## Architecture and configuration

The app already has one ad boundary: `src/ads/sdk.ts` is the only direct `react-native-google-mobile-ads` caller; `src/ads/controller.ts` owns initialization, preload, retries, listener cleanup, and idempotent reward events; `src/ads/flows.ts` owns the product cadence/reward policy. `src/ads/config.ts` reads literal `EXPO_PUBLIC_*` variables when the JS bundle is built. `app.json` supplied Google's sample native App IDs, and the release path previously had no production unit IDs. The installed Expo plugin writes `iosAppId` to iOS `GADApplicationIdentifier` at prebuild. The ignored local `ios/` directory is generated, not tracked.

| Placement | Production value | EAS build variable |
|---|---|---|
| Native iOS App ID | `ca-app-pub-5253670144191495~3800690302` | `ADMOB_IOS_APP_ID` |
| Campaign interstitial | `ca-app-pub-5253670144191495/4538971187` | `EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID` |
| Rewarded retry | `ca-app-pub-5253670144191495/4978040608` | `EXPO_PUBLIC_ADMOB_IOS_REWARDED_RETRY_ID` |
| Rewarded heart | `ca-app-pub-5253670144191495/5972481515` | `EXPO_PUBLIC_ADMOB_IOS_REWARDED_HEART_ID` |

The values are in `eas.json`'s production build `env`, following the existing iOS-specific runtime variable names. `app.config.js` selects the production native iOS ID only for the production build profile or explicit `EXPO_PUBLIC_ADS_TEST_MODE=0` (for a production EAS Update), and refuses an absent/incorrect native App ID. The sample ID in `app.json` remains the local fallback. Development and preview EAS profiles set `EXPO_PUBLIC_ADS_TEST_MODE=1`; runtime `__DEV__` also forces Google's official test units. Android has no Pixel Arcadia production IDs in this milestone, so its release placements remain unavailable. The obsolete partner-bidding interstitial ending `6490432820` is rejected by the runtime resolver and is not configured in EAS or the native plugin.

Production unit validation rejects absent, blank, malformed, sample, all-zero placeholder, wrong-publisher, and obsolete bidding IDs per placement. A rejected interstitial never requests the SDK, consumes a due three-first-clear opportunity, and does not chase it into the next level. A rejected rewarded unit returns unavailable and grants nothing. The existing resolver/controller diagnostics expose the unavailable placement, and release builds emit a one-time configuration warning without logging unit IDs.

## Locked product behavior and initialization

Interstitials remain between-level only, after every third qualifying first-clear campaign completion; losses and dev play do not show them. Rewarded retry remains a one-use authorization at zero hearts and does not refund the lost heart. Rewarded heart still grants one heart on confirmed reward while preserving the existing regen anchor behavior. Open and close callbacks grant nothing; duplicate earned callbacks cannot double-grant. Remove Ads suppresses forced ads while both rewarded placements remain available.

SDK initialization remains one-shot and asynchronous; startup never waits for it. The controller contains synchronous/asynchronous initialization failures, bounds load/open timeouts and retries, and discards listener-bearing handles after use. Startup now starts purchases after the save preload and then starts ads, so the cached Remove Ads policy is applied synchronously before the first ad load. Policy changes cancel any interstitial load/handle and later re-enable it if the entitlement is removed; rewarded slots are untouched.

## Privacy and external release items

There is **no UMP/consent flow** in the current code. Requests are currently non-personalized and the plugin delays app measurement initialization, but this does not certify regional consent/privacy compliance. A release owner must complete the privacy/consent decision and any required UMP/ATT implementation before enabling broad ad serving.

No suitable app website/domain or `app-ads.txt` file is configured in this repository. Once a domain is associated with the store listing, publish the exact seller line provided by the AdMob console at that domain's root `/app-ads.txt`, then verify it in AdMob. No domain or file was invented here. The AdMob console's current app-review/limited-serving state is external: the IDs are wired, but real serving may remain limited until that review/account state clears.

For normal iOS TestFlight/release builds, use `eas build --platform ios --profile production`; all four required build variables are already in `eas.json`, so no dashboard variables are required for that build. The `preview` profile is intentionally test-only. If publishing a production **EAS Update**, first add `ADMOB_IOS_APP_ID` and the three `EXPO_PUBLIC_ADMOB_IOS_*` values from the table above, plus `EXPO_PUBLIC_ADS_TEST_MODE=0`, to the Expo project's **Production environment** in the EAS dashboard (Project → Environment variables). Then use the production environment when creating the update. EAS Update does not take the build-profile `env` from `eas.json`; without those dashboard values the bundle safely has unavailable ad placements. Do not publish an update with the preview test-mode variable to the production branch.

Expo documents that build-profile `env` applies to [EAS Build](https://docs.expo.dev/build/eas-json/), while `eas update --environment production` reads the [server-side production environment](https://docs.expo.dev/eas/environment-variables/usage/). The exact update command, after the dashboard variables exist, is `eas update --branch production --environment production`.

## Verification

Three targeted ad suites passed: **61 tests** covering exact selection, missing/invalid placement behavior, obsolete-ID rejection, Remove Ads request/show behavior, confirmed/idempotent rewards, initialization, and cadence skip/no-chase. TypeScript, ESLint on changed files, and `git diff --check` passed. Expo config introspection resolved the native iOS `GADApplicationIdentifier` to Google's sample ID in development and the exact Pixel Arcadia ID in production build and production-update modes. The native plugin entry was valid. No full native build or generated iOS prebuild was run; introspection tested the plugin output without polluting the tracked tree.

Changed files: `app.config.js`, `eas.json`, `app/_layout.tsx`, `src/ads/config.ts`, `src/ads/controller.ts`, `src/ads/service.ts`, the three focused ad test files, and this report. Levels 1–500, `PUBLISHED_MAX_LEVEL=50`, and `CAMPAIGN_VERSION='v2-50'` were not touched in this milestone.

Scoped `git diff --stat` for M17B.1: eight tracked files, 166 insertions and 23 deletions, plus new `app.config.js` and this report. The working tree also contains the prior uncommitted M17A campaign changes; those were left intact.
