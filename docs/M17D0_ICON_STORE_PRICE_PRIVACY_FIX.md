# M17D.0 — Final app icon, TestFlight store price "N/A", Privacy Policy link

Branch `milestone/1-core-prototype`. Not committed or pushed. Publishing is unchanged: `PUBLISHED_MAX_LEVEL = 50` and `CAMPAIGN_VERSION = 'v2-50'`.

## Summary

| Issue | Root cause | Status |
| --- | --- | --- |
| App icon | The Portal Mosaic procedural generator was still the source. | **Fixed.** The attached PNG is now the single canonical source, and every icon is derived from it. |
| Store "N/A" | RevenueCat is configured correctly in build 10, but StoreKit returns no localized product for the 7 IDs. The cause is on the App Store Connect side and is still unverified. | **Diagnosed.** App-side state handling and diagnostics were also hardened. Prices will only appear after the App Store Connect fix (see below). |
| Privacy Policy | Settings passed `Linking.openURL` as a detached function. RN's `openURL` uses `this`, so it threw a `TypeError` that an empty `catch` swallowed. | **Fixed.** The fix also adds a visible fallback. |

---

## Part A — Final app icon

### Source

- The canonical source is `assets/brand/app-icon-source.png`. It is the attached PNG checked in **byte-for-byte**, SHA-256 `f4ce33a3d87fa4868d0097fb332aa930ac19ff156ccf04c97fa2fde2821a4225`.
- The source is 1024×1024 RGBA, sRGB, and fully opaque (minimum alpha 255). No padding was needed. The source has not been redrawn, recoloured or cropped.

### Treatment (technical processing only)

| Output | Treatment |
| --- | --- |
| `assets/icon.png` (iOS / App Store) | Same pixels as the source. The alpha channel is dropped (it was all 255) and the colour-profile chunk is stripped. Output is 1024×1024 RGB, with no transparency and no baked rounded corners. |
| `assets/android-icon-foreground.png`, `assets/adaptive-icon.png` | The artwork is flat (a gradient field, a glow and a shadowed head), so it can't be split into separate foreground and background layers without repainting. The least destructive option was used: the **whole artwork is the foreground**, scaled to exactly the 72/108 dp visible viewport. Its edge pixels are clamped outward across the rest of the 108 dp layer, so launcher parallax never shows a seam. |
| `assets/android-icon-background.png` | Solid launch blue `#3B63E8`, the existing icon background colour. It is covered by the opaque foreground. |
| `assets/android-icon-monochrome.png` | Android 13 themed icon (already configured). A white silhouette derived from the artwork's luminance (head, ears and eyes), with the same inset. |
| `assets/favicon.png` (64), `favicon-32.png`, `favicon-16.png`, plus `public/` copies | Mipmapped downscales of the artwork, opaque. |
| `public/apple-touch-icon.png` (180, new) | A downscale for the web home-screen icon. `app/+html.tsx` now links to it instead of the 64 px favicon. |

**Mask check (Android).** Rendered under circle, squircle, rounded-square and teardrop masks:
- The visor and both eyes sit well inside the 66 dp safe circle.
- The circle mask trims only the outer ear tips and the lower body sides. The artwork already cuts the body at its bottom edge.
- Squircle, rounded square and teardrop show the full artwork, the same as iOS.

**Dark / tinted iOS variants.** None were created. The project has no dark or tinted icon configuration, so per the brief this is left for later.

### Generator

`scripts/generate-brand-assets.mjs` was rewritten:
- It reads only `assets/brand/app-icon-source.png` and validates that it is 1024×1024 and opaque.
- It resamples with CanvasKit and encodes with pngjs, both already installed.
- `--out <dir>` writes the same tree elsewhere; the test uses this.
- All Portal Mosaic drawing code (arch, tiles, palette) is gone, and the old robot generator (`.py`) is still absent.
- **Determinism:** two runs produced identical SHA-256 for all 12 outputs, and the outputs match the checked-in files byte-for-byte. The Jest suite repeats this check on every run.

### Portal Mosaic removal

Regenerated (now the final art): `icon.png`, adaptive foreground/background/monochrome, `adaptive-icon.png`, and all favicons.

Deleted (Portal Mosaic only, with no runtime or config references):
- `assets/splash-icon.png`
- `assets/brand/icon-light.png`, `icon-dark.png`
- `assets/brand/logo-mark.svg`, `logo-mark-full.svg`, `logo-mark-mono-light.svg`, `logo-mark-mono-dark.svg`

The vector marks can't faithfully represent the raster artwork, and no dark variant may be invented.

Not touched:
- The splash (`assets/splash-logo.png`, unchanged)
- Wordmark and logo SVGs
- Historical docs that mention Portal Mosaic

### Native results (`npx expo prebuild --clean`, production profile env)

- **iOS:** `AppIcon.appiconset/App-Icon-1024x1024@1x.png` is 1024×1024 with `hasAlpha: no`. Its maximum per-channel difference from the approved source is **0**.
- **Android:** `mipmap-anydpi-v26/ic_launcher.xml` has background, foreground and **monochrome** entries. The legacy `ic_launcher`/`ic_launcher_round` and the adaptive layers in every density are generated from the new art (checked visually). `iconBackground` is `#3B63E8`.
- **Unchanged:**
  - Splash storyboard and `SplashScreenLogo`
  - Display name "Pixel Arcadia" (iOS and Android)
  - `PrivacyInfo.xcprivacy` (present and referenced from the Xcode project)
  - AdMob `GADApplicationIdentifier` (production app ID), `GADDelayAppMeasurementInit`, SKAdNetwork entry
  - Game Center entitlement

---

## Part B — TestFlight store prices show "N/A"

### Where "N/A" comes from

`src/iap/storeView.ts` `iapCardView()` returns `N/A` when the purchase status is `unavailable`, or when the store snapshot has no localized `priceString` for that product.

Separately, when the status is `unavailable` (no key, mode `off`, or the native module is missing), `StoreScreen` **does not render cards at all**. It shows "Coin packs, bundles and Remove Ads are unavailable right now." instead.

So an "N/A" *card* can only appear when RevenueCat **was configured** and a product lookup **finished** without a price for that ID. In build 10, loading showed `…` and only became `N/A` after the lookup answered. "N/A" was the steady state, not a loading artefact.

### Trace of the current TestFlight build

| Step | Evidence | Result |
| --- | --- | --- |
| Which build | `eas build:list`: build **10**, EAS id `10c9764f…`, profile `production`, commit `fcca652`, store distribution | This is the build under QA. |
| EAS production env | `eas env:list --environment production` (values masked) | `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` is set and `appl_`-prefixed. `eas.json` production has `EXPO_PUBLIC_REVENUECAT_MODE=store`. |
| What the binary received | Downloaded build 10's IPA and inspected the Hermes `main.jsbundle` string table (key never printed) | It contains one `appl_…` key (32 chars) and **no** `test_` Test Store key. All 7 product IDs are present. |
| Key selection | `resolveRevenueCatKey`: release + `store` + `appl_` → `{ mode: 'store' }` | The production App Store key is selected. Preview stays `off`; debug builds accept only a `test_` key. |
| RevenueCat project | `GET /v1/product_entitlement_mapping`, authenticated with that public key (read-only) | The key is valid. The project lists exactly the 7 IDs: `pixel_arcadia_coins_500`, `_coins_1500`, `_coins_3500`, `_coins_8000`, `_starter_pack`, `_booster_pack`, `_remove_ads`. Only `remove_ads` maps to the `remove_ads` entitlement. |
| Product fetch path | `sdk.ts` → `Purchases.getProducts(IAP_IDS, NON_SUBSCRIPTION)` → `RNPurchases.getProductInfo` → `RCCommonFunctionality getProductInfo` | On iOS, RevenueCat asks **StoreKit directly** for the bundle `com.andresbotia.orbitide`. The category argument is ignored, and the call **never rejects**: it resolves with only the products StoreKit returned. |
| Mapping | `p.identifier` → `productId`, `p.priceString` → card | This is correct, unit-tested, and passes the price through verbatim. |

### Root cause

Everything up to and including RevenueCat checks out in build 10: key, mode, configuration, product IDs and RevenueCat product setup. The "N/A" cards mean **StoreKit returned no localized product for these IDs** in the TestFlight sandbox.

That points at App Store Connect. The exact Apple-side reason was **not** observed: there's no App Store Connect access from here, and build 10 had no on-device diagnostics. In order of likelihood, the candidates are:

1. **IAP products not in "Ready to Submit".** "Missing Metadata" products are not served to sandbox. The M17B.2 brief reported the products as *Prepare for Submission* / RevenueCat *Missing Metadata*. Each product needs a reference name, a price, at least one localization (display name + description), and the review screenshot and notes.
2. **Paid Apps Agreement not Active**, or banking/tax incomplete. StoreKit then returns no products at all.
3. Availability or pricing not set for the tester's storefront, or recent edits that Apple has not yet propagated.

App-side ID mismatch is ruled out: the IDs in the binary, the RevenueCat project and the app catalog match exactly.

### App-side fixes (architecture preserved: direct product discovery, central controller)

These make the states honest and the cause visible. They **cannot** make Apple return products.

- **Loading vs unavailable.** `PurchasesSnapshot.productFetch` (`idle` / `loading` / `loaded` / `failed`):
  - Cards show a disabled `…` loading state until the store answers.
  - `N/A` appears only after the lookup answered without the product, or definitively failed.
  - Prices already on screen stay visible during a re-fetch.
- **Stale-answer guard.** Launch and Store-focus refreshes can overlap. Only the newest lookup may now set the product list, so a slow empty answer can't wipe out good prices.
- **Failure handling.** A rejected lookup sets `error`/`failed`, never throws, and recovers on the next Store visit (the existing focus refresh).
- **Safe diagnostics.**
  - `PurchasesController.diagnostics()` reports: resolved mode, whether `configure` ran, status, fetch state, requested/returned/priced counts, missing product IDs, and the last SDK error code (`code` / `readableErrorCode` only).
  - It never includes keys, transaction IDs or user IDs.
  - In DEBUG builds the controller also logs `products N/7 priced (M returned)`.
  - For TestFlight, **long-press the version row in Settings → About** to show this as an alert.
- No prices are hardcoded anywhere. Apple's `priceString` is shown verbatim.

**Unchanged:**
- Product IDs and all grants: 500 / 1500 / 3500 / 8000 coins; Starter +1000 coins and 3 of each item; Booster 5 of each item
- The durable `remove_ads` entitlement, and restore (Remove Ads only, never consumables)
- Ledger dedupe and PostHog events

### Account-side action required

In App Store Connect → Pixel Arcadia → Monetization → In-App Purchases:
- Every one of the 7 products must show **Ready to Submit** (not Missing Metadata). Fill in any missing price, localization, or review screenshot/notes.

In Business (Agreements, Tax, and Banking):
- **Paid Apps** must be **Active**, with banking and tax complete.

Then confirm with the next build: long-press the version in Settings. The expected result is `Products priced: 7/7 (returned 7)`.

If it still reads `0/7` with `configured` and no error, StoreKit is still returning nothing, and the cause remains in App Store Connect. On a Mac, Console.app filtered to the device and "RevenueCat" will also show RevenueCat's own configuration warning naming the unavailable products.

---

## Part C — Settings Privacy Policy does nothing

### Root cause

`SettingsScreen` called `openPrivacyPolicy(Linking.openURL)`, which passes the method **detached** from the `Linking` object. In React Native 0.86, `Libraries/Linking/Linking.js` is:

```js
openURL(url: string): Promise<void> {
  this._validateURL(url);
  ...
```

With `this` undefined, the call throws `TypeError` **before reaching native**. `openPrivacyPolicy` wrapped it in `try { … } catch { }`, so the tap did nothing: no Safari, no error, no crash.

The rest of the chain was ruled out:
- The row's `onPress` was attached, not disabled, and not overlaid.
- The Settings route renders this component.
- The URL in build 10's bundle was correct.

The existing unit test passed a bare `jest.fn()`, which never uses `this`, so it couldn't catch the bug. It was introduced in `fcca652`, the commit build 10 was built from.

### Fix

- `openPrivacyPolicy(linking, onError?)` takes the Linking **object** and calls `linking.openURL(PRIVACY_POLICY_URL)` as a method. It returns `true`/`false` and never throws.
- The Settings row calls `onPrivacyPolicy`. If opening fails, it shows an alert with the URL, and in DEBUG it also logs a warning.
- There is one canonical constant, `PRIVACY_POLICY_URL = 'https://andresbotia.github.io/pixelArcadia/privacy/'` in `src/ads/consent.ts`. Settings contains no literal URL.
- External Safari via RN `Linking`, no WebView. `canOpenURL` isn't needed for `https` (and would need an `LSApplicationQueriesSchemes` entry); `openURL`'s rejection is the failure signal.

**Unchanged:** Back, Color Assist, Restore Purchases (central controller), the app version label, and the conditional UMP "Ad Privacy Choices" row. The version row now also carries the diagnostics long-press; it has no tap action.

---

## Tests

Targeted Jest run on 6 suites, **0 failures**:
- `launchBrand`, `brand`, `iap`, and the four `src/ads` suites (including `consent`)
- 129 tests across launchBrand + brand + consent + iap, and 70 across the ads suites

| # | Requirement | Where |
| --- | --- | --- |
| 1–2 | Canonical icon exists, 1024², opaque, exact approved hash | `launchBrand` "keeps one canonical … source" |
| 3 | iOS icon RGB, no alpha, pixels identical to source | `launchBrand` "ships the source pixels…" |
| 4 | Generator deterministic and in sync (runs twice, byte-compares 12 outputs) | `launchBrand` "regenerates every icon output…" |
| 5 | No retired robot / Portal Mosaic hash; mosaic code and outputs gone | `launchBrand` `it.each` + "retires the Portal Mosaic generator…" |
| 6–7 | Android layers and favicon / apple-touch wired to generated files | `launchBrand` "wires Android adaptive layers and the favicon…" |
| 8 | Exactly the 7 IDs requested | `iap` "requests exactly the 7 App Store product ids" |
| 9 | Localized price verbatim | `iap` #22, "controller reports loading … then the localized prices" |
| 10 | Loading never renders N/A | `iap` "a card still waiting on the store shows loading" |
| 11 | Unavailable product handled safely | `iap` #23, #19, blank-price test, "0/7 … (the build-10 symptom)" |
| 12–14 | Production → App Store key, preview off, debug never production | `iap` "key resolution…", "EAS profiles select safe modes" |
| 15 | Fetch failure non-fatal and recovers | `iap` "a failed lookup is non-fatal…", "older, slower product lookup…" |
| 16–17 | Grants and restore unchanged | `iap` existing #5–9, starter/booster, #15–16, restore tests (unmodified, passing) |
| 18 | Exact live URL | `consent` (existing) |
| 19–21 | Row wired to a method call; `openURL` called once with the exact URL; failure non-fatal with fallback | `consent` "REGRESSION M17D.0…", "Settings passes the Linking object…", "opens the exact live policy URL…" |
| 22 | Other Settings rows functional | `launchBrand` "renders working controls…", "restores through the central IAP controller…" |
| 23–24 | `PUBLISHED_MAX_LEVEL === 50`, `CAMPAIGN_VERSION === 'v2-50'` | `launchBrand` "publishing unchanged" |

## Validation

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | Pass |
| ESLint (`--max-warnings=0`) on the 13 touched or new code files | Pass |
| `expo config` with development, preview and production EAS env | All pass. Icon, adaptive, monochrome, favicon and splash paths are correct. Production resolves the production AdMob app ID; dev/preview use the test ID. |
| Generator run twice | 12 / 12 outputs identical, and equal to the committed files |
| `npx expo prebuild --clean` (production env) | Pass. Native results are listed in Part A. The `expo-system-ui` warnings were already present. |
| Unsigned Release simulator compile (`xcodebuild … -configuration Release -sdk iphonesimulator CODE_SIGNING_ALLOWED=NO`, production env) | **BUILD SUCCEEDED** (includes the Release JS bundle) |
| `git diff --check` | Pass |

## Deployment

- The icon is compiled into the binary, so a **new EAS iOS build is required**. The privacy and store JS changes ride in the same build.
- **No OTA update was published.** A production EAS Update for runtime `0.1.0` could technically carry the JS-only fixes, but not the icon, so the new build is the correct path.

Next TestFlight build:

```sh
cd /Users/andres/Desktop/repos/pixel-arcade/pixelArcadia
# after review + commit
eas build --platform ios --profile production --auto-submit
```

(This is equivalent to `eas build --platform ios --profile production` followed by `eas submit --platform ios --latest`.) The build number auto-increments to 11.

Then on device:
1. Check the home-screen icon.
2. Settings → Privacy Policy should open Safari at the policy.
3. Long-press the version row to read the store diagnostics.
4. Store should show `…` and then localized prices, once App Store Connect is fixed.

## Remaining release blocker

**Real-money prices.** These depend on App Store Connect: IAP product state, and the Paid Apps Agreement with banking/tax. That can't be fixed in code. Verify with the build 11 diagnostics.

## Files

- **Icon:**
  - `assets/brand/app-icon-source.png` (new canonical source)
  - `scripts/generate-brand-assets.mjs`
  - Regenerated `assets/icon.png`, `adaptive-icon.png`, `android-icon-{foreground,background,monochrome}.png`, `favicon{,-32,-16}.png`, `public/favicon{,-32,-16}.png`
  - New `public/apple-touch-icon.png`
  - `app/+html.tsx`
  - The 7 Portal Mosaic files listed in Part A, deleted
- **Store:** `src/iap/controller.ts`, `storeView.ts`, `service.ts`, new `diagnostics.ts`
- **Privacy / Settings:** `src/ads/consent.ts`, `src/screens/SettingsScreen.tsx`
- **Tests:**
  - `src/game/__tests__/launchBrand.test.ts`, `brand.test.ts`
  - `src/iap/__tests__/iap.test.ts`, `fakePurchases.ts`
  - `src/ads/__tests__/consent.test.ts`
