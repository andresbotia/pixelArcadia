# M17C.1 — Final Branding Implementation

Branch `milestone/1-core-prototype`. Source of truth: the M17C audit in `~/Desktop/pixel-arcadia-m17c-branding/`. Branding and presentation only. **No commit or push.**

Untouched: gameplay, engine, campaign content, ads, RevenueCat, PostHog, Game Center, economy/hearts, storage keys, bundle ID, Android package, slug, scheme, EAS IDs. `git diff --quiet` is clean for `src/game/levels/publishing.ts`, `content/`, `src/game/engine`, `src/storage`, `src/ads`, `src/iap`, `src/analytics`, `src/services`, `src/game/gameCenter` and `src/game/economy`.

## Icon: Portal Mosaic (replaces the legacy purple robot)

**Final concept:** a stepped white arcade arch (keystone, two shoulders, two upper posts, two pillars) with a pale-blue 3D lip and a soft drop shadow. It frames a 2×2 chunky pixel mosaic of pink `#FF4F8B`, gold `#FFC53D`, cyan `#4FE3FF` and mint `#3FD99A`. Each tile has a darker lip and a white glint. A pale-gold halo sits behind the mosaic. The field is the launch-blue gradient `#5C8CFF → #3B63E8 → #2450CC` with a soft `#9FD0FF` centre glow. There is no text, mascot, robot or screenshot. It is a production rendering of the approved `R-portal-mosaic` sketch, with the same geometry and palette plus the finish notes from `APP_ICON_CONCEPTS.md` (chunky lips, strokes ≥ 96 master units, 4 tiles only).

**Source:** `scripts/generate-brand-assets.mjs`, run with `node scripts/generate-brand-assets.mjs`. The output is deterministic (byte-identical across runs). It uses CanvasKit (already installed via `@shopify/react-native-skia`) and pngjs (via `@expo/image-utils`); no new dependency was added. It **replaces** `scripts/generate-brand-assets.py`, which regenerated the robot set: re-running that old script would have silently undone this milestone.

| File | Result |
|---|---|
| `assets/icon.png` | 1024×1024, **RGB, no alpha** (App Store requirement) |
| `assets/brand/icon-light.png` | copy of `icon.png` |
| `assets/brand/icon-dark.png` | 1024 opaque variant on the deep `AV.well` field (marketing; not wired) |
| `assets/android-icon-foreground.png`, `assets/adaptive-icon.png` | 1024 RGBA; mark scaled to 60% about its own centre (inside the adaptive safe zone) |
| `assets/android-icon-background.png` | 1024 opaque launch-blue field |
| `assets/android-icon-monochrome.png` | 1024 RGBA white silhouette (Android 13 themed icon) |
| `assets/splash-icon.png` | the mark on transparent (unreferenced by config; robot removed) |
| `assets/favicon.png` / `-32` / `-16`, `public/favicon*.png` | simplified mark (no halo/lips) on a rounded launch-blue plate |
| `assets/brand/logo-mark.svg`, `logo-mark-full.svg`, `logo-mark-mono-light.svg`, `logo-mark-mono-dark.svg` | Portal Mosaic vector, 120-unit viewBox, no filters/rasters |

Readability was checked at 180, 60, 40 and 29 px under the iOS squircle mask on light and dark wallpapers: the arch and four-colour block stay distinct at 29 px.

iOS 18 dark/tinted icon variants were **not** wired. SDK 57 supports `ios.icon: { light, dark, tinted }`, but Apple's dark/tinted artwork rules deserve a dedicated pass; iOS auto-derives them from the light icon until then.

## Config / web colours
| Field | Before | After |
|---|---|---|
| `android.adaptiveIcon.backgroundColor` | `#182055` | `#3B63E8` |
| `web.themeColor`, `web.backgroundColor` | `#0E1442` | `#3B63E8` |
| `app/+html.tsx` `theme-color` + html/body background | `#0E1442` | `#3B63E8` |
| `expo.icon`, `web.favicon`, adaptive image paths | unchanged paths, new art | — |

## Splash / loader
- Native splash: **unchanged** (`splash-logo.png`, 280pt, `#3B63E8`); the native → `BootSplash` hand-off is still pinned by `brand.test.ts`.
- Loader gradient (`src/theme/bootSplash.ts`): `['#5C8CFF', '#3B63E8', '#5236C8']` → `['#5C8CFF', '#3B63E8', '#2450CC']`. There is no violet on the startup path now, and the loader base and hand-off colour are unchanged.

## Settings (placeholder removed)
`SettingsPlaceholderScreen` ("Settings will live here. Nothing is wired yet.") is deleted. `app/settings.tsx` now renders `src/screens/SettingsScreen.tsx`, on the v2 shell gradient with glass cards and Rubik throughout:

- **Back**: 44pt glass button → `router.back()`.
- **Accessibility → Color Assist**: a `Switch` bound to the existing persisted `useColorAssist()` preference that gameplay already honours. Before this, it was only reachable from the dev Debug overlay.
- **Purchases → Restore Purchases**: see below.
- **About**: "Pixel Arcadia" plus the installed version/build from `expo-application` (hidden where unavailable, e.g. on web).
- **Not included**: Privacy Policy, Terms and Support rows. No such URLs exist in the repo, so none were invented. Haptics was also left out: `setHapticsEnabled` exists but is not persisted, and a toggle that resets on relaunch would be misleading.

### Restore Purchases
Wired through the existing central controller. The new `src/hooks/useRestorePurchases.ts` wraps `usePurchases().restore()` and holds only the running/message UI state and the outcome copy (moved verbatim out of `StoreScreen`). Both the Store's RESTORE PURCHASES row and Settings use it, so there is one copy of the flow. The semantics are unchanged: `PurchasesController.restore()` restores the Remove Ads entitlement, and its `grantFrom` only grants consumables not already granted, so nothing is re-granted. The Store row's visuals and copy are identical to before.

## Typography
| Label | Change |
|---|---|
| `PrimaryCta` label (Result "TRY AGAIN", Discovery play CTA) | system bold 17 → **Rubik 900** (`AV_FONT.black`), same size and tracking |
| `DifficultyGate` label | system 800 → **Rubik 800** (`AV_FONT.extraBold`) |
| `BombTargetingOverlay` banner | already Rubik 700 via `GP_TYPE.label`; removed the redundant `fontWeight: '700'` override, which can drop a custom face to the system font on Android |
| Settings | rebuilt entirely on `AV_FONT` (no `fontWeight`) |

**Corrections to the M17C audit** (found while implementing): `DifficultyGate` is only rendered by `LevelBadge`, which is not mounted (Home uses `HomeLevelCard`), so it was not actually visible. The bomb banner was already Rubik. Both were aligned anyway, since the changes are harmless.

System-font text that is still visible: the **capacity numerals on Pals** (`PixelPalFace`, `OrbitingCharge`, `HoldingTray`/`TunnelBar` legacy branches). They were left alone on purpose: they are gameplay rendering whose numeral sizing was tuned against the system face. They are a candidate for a separate, device-checked pass.

**Space Grotesk:** removed from `useFonts` in `app/_layout.tsx` (`useFonts` now imports from `expo-font`), so one less font loads at startup. Its only remaining consumers are the unrendered legacy `PixelArcadiaWordmark`/`BrandLockup` components and the `wordmark` token in `brand.ts`, which were kept to avoid churn. A test fails if any rendered file starts using them. The npm package is still installed, so the lockfile is untouched.

## PrimaryCta / Result styling
Only visual tokens changed; layout, press animation, idle glow and timing are identical.
- Primary fill: `brandGradient.cta` (amber `#FFD98A → #FFB24D → #F0871F`) → v2 gold `[AV.goldLight, AV.gold, AV.goldDeep]`, the exact Home PLAY ramp.
- Lip: `rgba(150,70,10,0.4)` → `AV.goldLip`. Glow: `#FF8A1F` → `AV.goldDeep`. Ink: `brandInk #2A1405` → `AV.goldInk`.
- Secondary: navy `brandGradient.surface` → `AV.glass` + `AV.glassBorder`, white ink. Disabled: `brandColor.surface` → `AV.glassDeep`.
- `PrimaryCta` no longer imports `@/theme/brand`. The `brand.ts` tokens themselves are unchanged (still pinned by `brand.test.ts`).

## User-facing Orbitide audit
**0** occurrences. `launchBrand.test.ts` strips comments from every `.tsx` under `src/` and `app/` (over 50 files) and asserts no `orbitide`.

Intentionally retained (internal): slug `orbitide`, scheme `orbitide`, bundle ID and Android package `com.andresbotia.orbitide`, the `orbitide/*/v1` AsyncStorage keys (renaming them would wipe saves), level-compiler comments, `scripts/levels.ts` CLI banners, `bootstrap.ps1`, docs, tests and `dist/`.

## Native regeneration (`CI=1 npx expo prebuild --clean`)
Succeeded; CocoaPods installed 122 pods. `ios/` and `android/` are gitignored (CNG) and were **not** added to git.

| Generated | Verified |
|---|---|
| iOS `AppIcon.appiconset/App-Icon-1024x1024@1x.png` | 1024×1024, no alpha, Portal Mosaic |
| iOS `SplashScreenBackground.colorset` | sRGB (0.2314, 0.3882, 0.9098) = **#3B63E8** (was stale #0E1442) |
| iOS `SplashScreenLogo.imageset` | the PIXEL ARCADIA pixel logo, 280/560/840 px; storyboard imageView 280×280 aspect-fit (was the robot at 100pt) |
| iOS `Info.plist` `CFBundleDisplayName` | Pixel Arcadia |
| Android `mipmap-anydpi-v26/ic_launcher.xml` | background, foreground and **monochrome** layers |
| Android `values/colors.xml` | `iconBackground`, `splashscreen_background`, `activityBackground` = #3B63E8 |
| Android `mipmap-*/ic_launcher*.webp` | Portal Mosaic (visually checked at xxxhdpi, incl. monochrome) |
| Android `strings.xml` `app_name` | Pixel Arcadia |

## Web
`+html.tsx` has theme colour and background `#3B63E8`, title `{PRODUCT_NAME}`, and `apple-touch-icon` pointing at the new `/favicon.png`. `web.favicon` → the new `assets/favicon.png`. A full `expo export -p web` was not run; the `.ico` is derived at export time from that file.

## Tests
- New `src/game/__tests__/launchBrand.test.ts` (35 tests) covers:
  - display name, and no user-facing Orbitide; internal IDs kept
  - no legacy robot/navy asset (SHA-256 denylist of the 12 retired files)
  - `icon.png` 1024² RGB with no alpha (PNG IHDR header, not pixels), Android adaptive layers 1024² RGBA
  - the robot generator is gone
  - launch blue `#3B63E8`, no `#182055`, no `#5236C8`, web theme `#3B63E8`
  - placeholder removed and Settings routed/wired (Switch ↔ `useColorAssist`, restore ↔ `useRestorePurchases`, version); no invented URLs; restore goes through the controller only
  - Rubik on the corrected labels; PrimaryCta on the AV gold ramp; Space Grotesk not loaded and unused by rendered files
  - `PUBLISHED_MAX_LEVEL === 50`, `CAMPAIGN_VERSION === 'v2-50'`
- Updated `brand.test.ts`: adaptive-icon background → `#3B63E8`, theme-color → `#3B63E8`, font-loading test now asserts that Space Grotesk is **not** loaded.
- Results: `launchBrand` + `brand` + `appIdentity`: **3 suites, 80 tests passed**. Regression check on the touched theme and restore path: `src/theme` + `src/iap`: **7 suites, 69 tests passed**. No broad Jest run.

## TypeScript / ESLint / Expo config / diff
- `npx tsc --noEmit`: **pass**.
- ESLint on all 16 touched/new code files: **pass** (0 problems).
- `npx expo config --type public` under `EAS_BUILD_PROFILE` development, preview and production (production with `ADMOB_IOS_APP_ID` set as in `eas.json`): all three resolve to name "Pixel Arcadia", icon `./assets/icon.png`, root/splash/adaptive/web colours `#3B63E8`, splash `./assets/splash-logo.png` @280, and unchanged bundle ID/slug. Only the AdMob app ID differs, as expected.
- `git diff --check`: **clean**.
- `git diff --stat`: 33 tracked files, +68/−461; binary asset swaps are listed in the stat. New untracked files: `scripts/generate-brand-assets.mjs`, `src/screens/SettingsScreen.tsx`, `src/hooks/useRestorePurchases.ts`, `src/game/__tests__/launchBrand.test.ts`, and this report. Deleted: `scripts/generate-brand-assets.py`, `src/screens/SettingsPlaceholderScreen.tsx`. Nothing is staged.

## Remaining launch-brand items (not code in this repo)
1. **Privacy Policy URL**: required for App Store Connect (AdMob, PostHog and RevenueCat are all live). Once it exists, add a Settings row.
2. **Store assets**: 6–8 iPhone 6.9" screenshots from levels 1–50 only, with no "500 levels" claim (storyboard in the M17C folder), plus 7 IAP review screenshots and metadata. Capture from an EAS build or the freshly prebuilt local project.
3. Optional: iOS dark/tinted icon variants, and a device-checked Rubik pass for the Pal capacity numerals.
4. Legacy unreferenced vector lockups (`assets/brand/logo-horizontal.svg`, `logo-stacked.svg`, `wordmark*.svg`) still show the M3.6 mark and Space Grotesk text. They are not shipped or rendered; retire them in a cleanup pass.
