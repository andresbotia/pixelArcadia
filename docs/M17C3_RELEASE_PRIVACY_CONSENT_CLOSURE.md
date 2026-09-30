# M17C.3 — release privacy and consent closure

Prepared September 30, 2026 on `milestone/1-core-prototype`. This is an implementation and evidence report, not an account-side certification. See [App Privacy worksheet](APP_STORE_PRIVACY_PREP.md) and [age rating worksheet](APP_STORE_AGE_RATING_PREP.md).

## Code and behavior

- Settings opens the live policy at `https://andresbotia.github.io/pixelArcadia/privacy/` via `Linking.openURL`; rejection and synchronous failure are contained. The row is styled with the existing Settings card. `Ad Privacy Choices` appears only when UMP reports `privacyOptionsRequirementStatus = REQUIRED`, and calls the native privacy-options form. No Terms or Support placeholder was added.
- Installed `react-native-google-mobile-ads` v17.2.0 already includes `AdsConsent` and native UMP on iOS/Android. No UMP package was added. At cold start, after save preload, `AdConsentController` requests consent information, offers a required form, and opens the ad gate only on Google's `canRequestAds`. Prior-session consent can open the gate after the information update. A network/form error checks Google's cached consent info. Missing native UMP or false/unknown permission leaves ads unavailable; the game never waits for UMP. Startup is one-shot, so app resume does not repeatedly present a form. A changed privacy choice can retire cached ad handles and stop future requests.
- Development can use `EXPO_PUBLIC_UMP_DEBUG_GEOGRAPHY=EEA` or `OTHER`, and optionally `EXPO_PUBLIC_UMP_TEST_DEVICE_ID`, in a **debug JS bundle only**. The release path sends no debug options; there is no automatic consent reset. Configure messages in AdMob → Privacy & messaging for the actual app ID. Ensure no ATT message is enabled: the app has no ATT request or `NSUserTrackingUsageDescription`.
- Ad request options remain `requestNonPersonalizedAdsOnly: true` in `src/ads/sdk.ts`/`src/ads/config.ts`. UMP consent does not switch the app to personalized ads. Remove Ads continues to block interstitial requests/shows, while optional rewarded retry/heart stays available if UMP allows ads. The existing ad flow cadence is unchanged; unavailable ads do not block progression. Android native config retains Google's test app ID because no production Android AdMob ID exists. `plugins/withUmpProguard.js` adds Google's documented consent SDK keep rule on prebuild.
- PostHog remains US Cloud, anonymous SDK identity, explicit events, no identify call, replay or lifecycle/error autocapture, no email/name/Game Center identity/transaction ID payloads, and safe no-op for missing config. `disableGeoip: true` is a **client request to skip geographic enrichment**, not proof that the network IP is discarded. PostHog's existing-project **Discard IP data** control must be enabled/verified in project settings; the organization default affects only new projects. The policy makes no discard promise. `personProfiles: 'always'` and `setPersonProperties` attach progress and Remove Ads status to a pseudonymous distinct ID, so “anonymous” does not mean no profile.
- Expo Updates remains enabled. Its startup check uses a random per-install EAS Client ID plus version/channel/platform and network IP. No claim is made that Expo gets a name or precise location. RevenueCat still uses anonymous customer identity, product/purchase/entitlement state, and StoreKit handles card details. Processed transaction IDs stay local to IAP and are not sent to PostHog. Game Center display name and player ID stay in local UI/submission memo; highest score and achievements go to Apple Game Center.

## App-owned privacy manifest and SDKs

`app.json` now supplies `ios.privacyManifests`. Prebuild generates `ios/PixelArcadia/PrivacyInfo.xcprivacy` in the app target resource build phase. The app-owned collected-data entries are:

| Entry | Purpose and reason |
| --- | --- |
| Product Interaction, Analytics, unlinked, non-tracking | App's explicit gameplay/ad/IAP events sent to PostHog |
| User ID, Analytics, unlinked, non-tracking | PostHog's app-generated pseudonymous distinct ID; no name/email identity |
| Purchase History, Analytics, unlinked, non-tracking | App sends product/category/price and Remove Ads status to PostHog, not transaction IDs |
| Device ID, App Functionality, unlinked, non-tracking | Expo Updates' random per-install EAS Client ID for updates |

The generated app manifest retains Expo/React Native required-reason API entries (File Timestamp C617.1, User Defaults CA92.1, System Boot Time 35F9.1, Disk Space E174.1), `NSPrivacyTracking=false` and empty tracking domains. The app makes no cross-app tracking use in its own code. Google Mobile Ads' bundled manifest separately declares diagnostic, coarse location, ad interaction/data, and **Device ID with tracking true**; RevenueCat declares Purchase History and User Defaults; Google UMP and React Native/Expo pods have their own manifests. App entries do not duplicate Google's ad diagnostics/location declarations or RevenueCat's purchase-service purpose. The final archive privacy report and AdMob account behavior must be reconciled before an App Store tracking answer is submitted.

## Store worksheets and policy

`APP_STORE_PRIVACY_PREP.md` covers YES and NO across all Apple category families, services, purposes, linkage/tracking and confidence. **Apple tracking determination remains account-side confirmation required**, because Google's SDK manifest declares Device ID tracking despite non-personalized app requests and no ATT. [Apple's definition](https://developer.apple.com/app-store/user-privacy-and-data-use/) turns on actual cross-app data linking; a non-personalized request alone does not prove NO. `APP_STORE_AGE_RATING_PREP.md` maps current questionnaire areas to the game; it does not claim a calculated rating. The live policy's ad consent and choices paragraphs were updated for the implemented UMP flow; IP discard was intentionally not promised. The GitHub Pages workflow must validate the edited policy on push.

## Account and release tasks

1. AdMob → Privacy & messaging: publish the EEA/UK/Switzerland message for the production iOS app; confirm no ATT prompt is configured, no unintended personalized/mediation behavior, and test UMP on a real eligible device. Verify AdMob app review/serving state. Google's [UMP guide](https://developers.google.com/admob/ios/privacy) and [React Native bridge guide](https://docs.page/invertase/react-native-google-mobile-ads/european-user-consent) describe the flow.
2. Resolve the Google manifest Device ID tracking declaration against actual AdMob account/SDK behavior. Generate Xcode's archive privacy report, decide the truthful App Store tracking answer, and update ATT/config/policy if tracking occurs. This is a **release blocker** until verified.
3. PostHog production US project: Settings → Project settings (Environment) → enable **Discard client IP data** and verify a newly captured event. Confirm person enrichment, replay/autocapture, ingestion host, and account destinations. M17B.3's **LIVE GAME HEALTH** dashboard and `content_ceiling_approaching` alert remain manual; its insight/alert specification is complete. The alert is dormant at the locked 50-level ceiling.
4. RevenueCat/App Store Connect: confirm product and entitlement mapping, privacy answers, and real-device purchase/restore behavior. Complete App Privacy and Age Ratings using the worksheets; do not submit from code alone.
5. Publish the exact AdMob-provided seller line at `https://andresbotia.github.io/app-ads.txt` through a user/org root Pages site or verified custom domain. Project Pages `/pixelArcadia/app-ads.txt` cannot satisfy that root. No guessed line was created.
6. For production EAS Updates, provision matching production environment variables in Expo; build-profile `env` does not automatically carry over. The policy site needs Pages deployment verification after push.

## Validation record

- Targeted Jest: **6 suites, 138 tests passed** (consent, ad controller/config/flows, analytics, Settings/branding).
- `npx tsc --noEmit`: passed. ESLint on touched/new JS/TS/TSX: passed.
- Expo config evaluation: development, preview and production passed with profile-appropriate native AdMob App IDs and four app privacy categories.
- `npx expo prebuild --clean`: passed; CocoaPods installed. Generated iOS manifest passed `plutil -lint`, contains all four categories, and is in Xcode target resources. Android has the UMP keep rule, sample App ID and delayed app measurement.
- Unsigned native iOS simulator compile: **BUILD SUCCEEDED**. The built `PixelArcadia.app` contains the app manifest plus Google Mobile Ads, UMP, RevenueCat, Expo/React Native and AsyncStorage privacy resources. This is a compile/resource check, not a device consent test or archive privacy report.
- `git diff --check`: passed. Publishing locks inspected: 50 / `v2-50`. Pages content guard passed. Staged diff scan found no private credential patterns; generated native files remain ignored. Final git status is checked after push.

No full Jest suite was requested. `PUBLISHED_MAX_LEVEL=50` and `CAMPAIGN_VERSION='v2-50'` remain locked.
