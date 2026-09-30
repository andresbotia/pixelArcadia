# App Store Connect App Privacy worksheet — Pixel Arcadia

Prepared September 30, 2026. No answers have been submitted. Enter the final answers in App Store Connect → App Privacy only after the account checks below. Apple's [App Privacy guidance](https://developer.apple.com/app-store/app-privacy-details/) requires accounting for embedded SDKs as well as app code. A random persistent identifier may be "linked" to a pseudonymous profile even without a name; the table distinguishes what the repository proves from provider behavior that requires confirmation.

| Apple category / type | Collected? | Linked? | Tracking? | Purpose / service / evidence | Confidence |
| --- | --- | --- | --- | --- | --- |
| Contact Info (all types) | NO | NO | NO | No account, email, phone or address collection; `src/analytics/api.ts`, `src/iap/sdk.ts` | VERIFIED |
| Health & Fitness (all) | NO | NO | NO | No health integration; `package.json` | VERIFIED |
| Financial Info (payment and credit) | NO | NO | NO | StoreKit processes payment; app receives no card data; `src/iap/sdk.ts` | VERIFIED |
| Location (precise) | NO | NO | NO | No location permission/API; `package.json`, `app.json` | VERIFIED |
| Location (coarse) | YES | YES per Google manifest | NO per Google manifest | Ad delivery/analytics, Google Mobile Ads bundled `PrivacyInfo.xcprivacy`; IP-derived location possible | VERIFIED for SDK declaration; ACCOUNT-SIDE CONFIRMATION REQUIRED for actual configuration |
| Sensitive Info | NO | NO | NO | No sensitive fields in explicit analytics; `src/analytics/events.ts` | VERIFIED |
| Contacts | NO | NO | NO | No contacts permission/API; `package.json` | VERIFIED |
| User Content (all types) | NO | NO | NO | No UGC, uploads, chat or files sent; `src/`, `app/` | VERIFIED |
| Browsing History | NO | NO | NO | No browser history collection; `src/`, `app/` | VERIFIED |
| Search History | NO | NO | NO | No search feature; `src/`, `app/` | VERIFIED |
| Identifiers → User ID | YES | NO to real-world identity; anonymous profile link exists | NO | PostHog random distinct ID, RevenueCat anonymous customer ID; `src/analytics/service.ts`, `src/iap/sdk.ts` | VERIFIED for app use; ACCOUNT-SIDE CONFIRMATION REQUIRED for provider reuse |
| Identifiers → Device ID | YES | Google manifest: YES; app/Expo: NO | Google manifest: YES | AdMob SDK and Expo EAS-Client-ID; Google SDK manifest, `expo-updates` generated files, `app.json` | ACCOUNT-SIDE CONFIRMATION REQUIRED before final tracking answer |
| Purchases → Purchase History | YES | NO in RevenueCat manifest; anonymous profile in PostHog | NO | RevenueCat transaction/entitlement service; PostHog product/category/price/Remove Ads events; `src/iap/service.ts`, `src/analytics/api.ts`, RevenueCat manifest | VERIFIED for app payloads; ACCOUNT-SIDE CONFIRMATION REQUIRED for provider linkage |
| Usage Data → Product Interaction | YES | Google manifest: YES; PostHog anonymous profile | NO in app manifest | Explicit gameplay/ad/IAP events to PostHog; ad interactions to Google; `src/analytics/api.ts`, `src/ads/sdk.ts`, Google manifest | VERIFIED for payloads; ACCOUNT-SIDE CONFIRMATION REQUIRED for provider linkage |
| Usage Data → Advertising Data | YES | YES per Google manifest | NO per Google manifest | AdMob ads, measurement; Google SDK manifest | VERIFIED for SDK declaration; ACCOUNT-SIDE CONFIRMATION REQUIRED for actual configuration |
| Diagnostics → Crash Data | YES | NO | NO | Google SDK manifest; no PostHog crash autocapture; `src/analytics/service.ts` | VERIFIED for SDK declaration |
| Diagnostics → Performance Data | YES | NO | NO | Google SDK manifest | VERIFIED for SDK declaration |
| Diagnostics → Other Diagnostic Data | YES | NO | NO | Google SDK manifest | VERIFIED for SDK declaration |
| Other Data | NO known additional type | NO | NO | Review final Xcode privacy report and network/device test | ACCOUNT-SIDE CONFIRMATION REQUIRED |

**Tracking question: unresolved release blocker.** [Apple defines tracking](https://developer.apple.com/app-store/user-privacy-and-data-use/) as linking this app's data with other companies' apps/sites for targeted ads or advertising measurement, or sharing with data brokers. App code requests non-personalized ads, does not request ATT/IDFA, and does not send PostHog IDs to Google. However the bundled Google Mobile Ads manifest declares `NSPrivacyCollectedDataTypeDeviceID` with tracking `true`; a local request flag cannot override what Google's SDK/account actually does. Confirm AdMob app/account settings, data use, mediation, and the final Xcode privacy report with Google and Apple guidance. If cross-app tracking occurs, obtain ATT and revise the manifest, policy, and worksheet before release; otherwise document the evidence for answering NO. Do not submit NO from this worksheet alone.

**Account verification before entry:** In AdMob Privacy & messaging publish the correct EEA/UK/Switzerland message for this app; confirm any ATT message is disabled (this binary has no tracking usage description) and inspect ad personalization/mediation settings. In PostHog Settings → Project settings (Environment) → enable and verify **Discard client IP data** for this existing project; the organization default only applies to new projects. Inspect a new event for absence of retained IP/GeoIP properties and confirm no downstream destination creates a profile from PII. In RevenueCat verify anonymous IDs and product/entitlement mapping. Generate the final Xcode privacy report from the archive and reconcile every SDK declaration. Review App Privacy answers again after any SDK/account change.

Sources: [Apple manifest data use](https://developer.apple.com/documentation/BundleResources/describing-data-use-in-privacy-manifests), [Apple tracking definition](https://developer.apple.com/app-store/user-privacy-and-data-use/), [Google iOS data disclosure](https://developers.google.com/admob/ios/privacy/data-disclosure), [PostHog IP control](https://posthog.com/tutorials/web-redact-properties#hiding-customer-ip-address), [RevenueCat Apple privacy](https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy).
