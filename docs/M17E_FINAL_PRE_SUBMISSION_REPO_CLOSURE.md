# M17E final pre-submission repository closure

## Starting state

- Branch: `milestone/1-core-prototype`.
- Starting working tree: clean (`git status --short` produced no entries).
- Last five commits: `94bcac0 feat: add StoreKit purchase diagnostics`; `7dcada8 Finalize app icon and TestFlight store diagnostics`; `fcca652 Complete release privacy and consent setup`; `58eb9d9 Add Pixel Arcadia privacy policy site`; `7f08d54 Add Pixel Arcadia privacy policy site`.
- No pre-existing uncommitted changes were found. The tracked StoreKit diagnostic module and Settings long-press UI were committed work, inspected before removal.

## Repository changes

- `src/game/levels/publishing.ts`: set `PUBLISHED_MAX_LEVEL = 500` and `CAMPAIGN_VERSION = 'v1-500'`. No level definitions or compiled campaign content changed.
- `src/storage/progress.ts`, `src/game/levels/campaignProgress.ts`: allow and document the completion sentinel `501` after clearing Level 500. This was a concrete release blocker: the previous `TOTAL_LEVELS` clamp kept a final clear at 500, so the campaign could not record completion. Normal play still rejects Level 501.
- `src/screens/SettingsScreen.tsx`: remove the long-press diagnostics entry and modal. Color Assist, Restore Purchases, Privacy Policy, and conditional Ad Privacy Choices remain.
- `src/iap/service.ts`, `src/iap/sdk.ts`, `src/iap/controller.ts`: remove the opt-in local Release diagnostic trace, extra RevenueCat storefront/offerings probes, and the unused diagnostic snapshot. Standard purchase lookup, purchases, restore, and development logging remain.
- Delete `src/iap/localDiagnostics.ts`, `src/iap/diagnostics.ts`, and the four tracked files in `modules/storekit-diagnostic/`; they served only the temporary probe.
- Update campaign and analytics assertions in targeted tests and the M16G/M17A certification script publication checks. Historical authoring data and certificates were not regenerated.
- Add this report and `docs/APP_STORE_SUBMISSION_CHECKLIST.md`.

## Production audit

### IAP

The production EAS profile sets `EXPO_PUBLIC_REVENUECAT_MODE=store`. `src/iap/config.ts` selects the iOS public SDK key from `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`, rejects `sk_` secret keys, and fails closed when a valid public key is missing. The key is not tracked. `eas env:list production` listed the public iOS key variable with its value masked. The physical TestFlight purchase and localized-price evidence was supplied in the handoff; this pass did not repeat device testing.

The catalog contains exactly seven IDs: `pixel_arcadia_coins_500`, `pixel_arcadia_coins_1500`, `pixel_arcadia_coins_3500`, `pixel_arcadia_coins_8000`, `pixel_arcadia_starter_pack`, `pixel_arcadia_booster_pack`, and `pixel_arcadia_remove_ads`. Their grants are respectively 500/1,500/3,500/8,000 coins; Starter Pack 1,000 coins plus three each of Undo, Extra Slot, and Bomb; Booster Pack five each of those items; and the durable `remove_ads` entitlement. The RevenueCat transaction ledger guards consumable grants. Restore updates the Remove Ads entitlement without regranting historical consumables. `adsPolicyFor(true)` disables forced interstitials and retains optional rewarded ads. IAP architecture was not changed.

### AdMob, consent, and privacy

`app.config.js` injects the production iOS AdMob app ID `ca-app-pub-5253670144191495~3800690302` for the production profile and refuses a missing or wrong value. The profile supplies interstitial `ca-app-pub-5253670144191495/4538971187`, rewarded retry `ca-app-pub-5253670144191495/4978040608`, and rewarded heart `ca-app-pub-5253670144191495/5972481515`. Development and preview use Google's sample app/test units. The obsolete partner-bidding suffix appears only in an explicit rejection rule and its test, not in a production configuration path.

UMP starts with ads closed, opens loading only when `canRequestAds`, and uses cached consent on a request/form failure. Failure does not block gameplay. Settings offers Ad Privacy Choices only when required and opens the published policy URL through `Linking.openURL`. Requests remain non-personalized; no ATT prompt was added.

### Branding, native config, and versioning

Resolved production Expo config reports Pixel Arcadia, iOS bundle ID and Android package `com.andresbotia.orbitide`, valid icon and splash paths, the existing EAS project/update URL, and `runtimeVersion.policy=appVersion`. The canonical source remains `assets/brand/app-icon-source.png`; generated icon references and splash reference exist. Legacy `orbitide` slug/scheme remain. No active app branding reference to Portal Mosaic was found. `eas.json` uses remote app version sourcing and production `autoIncrement: true`; no local build number was guessed or bumped.

## Release-safety search

Searched app, source, scripts, plugins, and release config for TODO/FIXME/TEMP/DEBUG, logging, local and staging URLs, placeholders, old branding, obsolete ad IDs, diagnostic UI, and secret-key patterns. The temporary StoreKit UI/native module and opt-in IAP trace were removed. Remaining development routes, Home reset, and DebugOverlay are gated by `__DEV__`; analytics/IAP diagnostics are development-gated. Ads may log a non-sensitive configuration warning in release if a placement is unavailable. Script `console.log` calls are authoring/CLI output. The obsolete ad ID occurs only as a blocked suffix and in its regression test. The remaining TODO concerns authoring difficulty weights; it is not a release path. Historical docs and tests retain old milestone terminology. No tracked RevenueCat server key or hardcoded private credential was found. No unrelated cleanup was made.

## Validation

- Targeted Jest: campaign boundary, World 50, economy, IAP, AdMob config, consent, branding, analytics: **8 suites / 174 tests passed**.
- Targeted Jest: authored world publication tests, M17A cleanup, play mode: **16 suites / 625 tests passed**.
- Targeted Jest: Game Center and ad controller/flows: **3 suites / 59 tests passed**.
- After the final IAP diagnostic removal, targeted Jest for IAP, campaign boundary, economy, AdMob config, and consent: **5 suites / 91 tests passed**.
- `npx tsc --noEmit`: passed.
- ESLint on touched TypeScript/TSX files: passed.
- `git diff --check`: passed.
- `npx expo config --json` with the production profile environment: resolved expected bundle/package, app name, AdMob app ID, ad unit variables, store mode, and valid icon/splash paths. The campaign maximum/version are TypeScript runtime constants and were verified by targeted tests, not Expo manifest fields.
- `eas env:list production`: public iOS RevenueCat key variable present; its value was not printed or copied.

## Remaining work and blockers

Account-side tasks are in `docs/APP_STORE_SUBMISSION_CHECKLIST.md`. They include metadata, screenshots, questionnaires, review information, all seven first-launch IAP attachments, app-ads.txt and DSA review checks, final build selection, release settings, and App Review submission. The final EAS/TestFlight build was not started. No repository-side blocker remains. No commit or push was made.

REPO READY FOR FINAL PRODUCTION BUILD
