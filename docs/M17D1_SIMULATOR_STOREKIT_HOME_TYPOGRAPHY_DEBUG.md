# M17D.1 — Simulator StoreKit and Home typography investigation

## Simulator and build

- **Device/runtime:** iPhone 18 Pro, iOS 27.0 (simulator UDID `D98C411B-1354-4177-AEA0-3E0726112700`), Xcode 27.0.
- **Workspace:** `/Users/andres/Desktop/repos/pixel-arcade/pixelArcadia/ios/PixelArcadia.xcworkspace`.
- Ran `npx expo prebuild --clean`; it completed successfully. The generated iOS scheme contains no StoreKit configuration reference. No `*.storekit` file exists in the generated iOS project or repository. No local StoreKit catalog was created.
- Inspected `.gitignore` and existing root `.env*` files first: there was no root env file, and `.env.local` is ignored. `eas env:pull production --path .env.local --non-interactive` supplied the public RevenueCat iOS, PostHog, and ad-unit values. The key was checked only for presence and its `app1_`/`appl_` public prefix; its value was never printed or committed.
- The local **Release** simulator build set `EXPO_PUBLIC_REVENUECAT_MODE=store`, `EXPO_PUBLIC_POSTHOG_MODE=production`, and `EXPO_PUBLIC_ADS_TEST_MODE=1`. The latter avoids live ads in the diagnostic run. `EXPO_PUBLIC_IAP_DIAGNOSTICS=1` enabled redacted local diagnostics. EAS development/preview/production profiles were not changed; production still uses the public App Store key, development still requires its separate Test Store key, and preview remains off. No production key is in tracked files.

## RevenueCat and StoreKit results

| Check | Simulator result |
| --- | --- |
| Configuration | Succeeded, anonymous app user, `store` mode/profile |
| RevenueCat JS SDK | `react-native-purchases` 10.10.2 |
| Native RevenueCat SDK | 5.90.2 in generated `Podfile.lock` |
| StoreKit path | RevenueCat SDK default; no local StoreKit configuration. Exact StoreKit version was not exposed by this JS path. |
| Storefront | USA |
| Direct RevenueCat products | **0/7 returned; 0/7 localized prices** |
| Current offering products | **0/7 usable**; `getOfferings()` rejected, so no package list was returned |
| Direct StoreKit products | Not tested: a separate native StoreKit query is not exposed by the installed JS architecture and would require invasive native diagnostic code |
| Direct lookup error | None: the request fulfilled with an empty array |
| Offering error | `RevenueCat.ErrorCode` code **23**; native log also reported `RevenueCat.OfferingsManager.Error error 1` and said dashboard products could not be fetched from App Store Connect |

The direct request used exactly these IDs: `pixel_arcadia_coins_500`, `pixel_arcadia_coins_1500`, `pixel_arcadia_coins_3500`, `pixel_arcadia_coins_8000`, `pixel_arcadia_starter_pack`, `pixel_arcadia_booster_pack`, and `pixel_arcadia_remove_ads`. **All seven were missing.** No localized price was fabricated. The Store showed N/A after the completed empty lookup. Existing loading cards use an ellipsis, and targeted state-machine tests confirmed that they do not show N/A while waiting. A failed lookup remains nonfatal; Store focus retries, and this change also retries when an open Store resumes from background. Product responses are cached, and a generation counter prevents an older request overwriting a newer one.

The evidence rules out an ordinary development/Test Store key mismatch in this run: the Release bundle selected the public iOS key and RevenueCat configured. It also rules out a missing request or a local `.storekit` override. Both RevenueCat discovery paths were unusable on this simulator. The remaining cause is upstream of the app's direct product mapping or specific to simulator sandbox availability; App Store Connect product availability/configuration is the leading release hypothesis, **not yet proven**. The simulator cannot establish whether the seven live sandbox products will load in TestFlight on a physical iPhone.

**Next physical step:** install the next TestFlight build on an iPhone, open Store, then long-press the Settings app-version row to read the existing IAP diagnostics. Confirm `configured`, `returned 7`, `priced 7`, and no missing IDs; verify all seven cards show Apple's localized prices and test a sandbox purchase/restore. If still 0/7, inspect the App Store Connect product and bundle association and the RevenueCat dashboard offering/product mappings using that physical TestFlight result. IAP availability remains a **release blocker** until this succeeds.

## Home typography and layout

The baseline fresh-install cold launch on this simulator had 300 coins and “Sunrise Peaks,” but the title, PLAY, difficulty, and nav labels appeared in thin system fallback faces. The supplied physical-device screenshots show the later heavy Rubik face after navigation. The lifecycle cause is in `app/_layout.tsx`: the navigation stack and Home mounted before `useFonts()` registered Rubik and Pixelify Sans; the boot overlay hid Home but did not stop its native `Text` views from being created. Those views could retain fallback metrics until route replacement remounted them. A font load error could also allow the boot overlay to finish over a final Home without the fonts.

The root now mounts the stack only after fonts load. A font error displays a restart message instead of rendering final Home with fallback fonts. Home's existing font tokens remain explicit: Rubik 800 for the level title and numeric balance, Rubik 900 for PLAY, Rubik 800 for difficulty, Rubik 700 for bottom nav, and Pixelify Sans 600 for the small LEVEL caption. No navigation-dependent font token or selected-tab font-family change was found. Thus the level-title, PLAY, difficulty, and bottom-nav fixes are the common font registration gate, without a typography redesign.

The reported `3...` coin truncation follows from fallback glyph metrics in a row where the coin text had `numberOfLines={1}`, only a 28-point minimum width, and could yield space to siblings. On this wider iPhone 18 Pro, 300 did **not** truncate in the baseline screenshot, so that device-specific observation remains an inference from the supplied narrower-device screenshot and the inspected layout. The coin value now has a 44-point floor and does not shrink; the spacer yields first, and the plus button, heart pill, and gear keep predictable sizes. The pill can still grow with content rather than reserving a huge fixed width. Formatting tests cover `0`, `300`, `999`, `1,000`, `9,999`, and `99,999` (`99.9K`). A narrower physical device and large accessibility font scale still merit visual checking.

## Simulator reproduction and verification

- Before the fix, a fresh-install cold Home showed thin PLAY/title/difficulty/nav text. A custom-scheme deep link raised a simulator confirmation sheet, so the baseline Store → Home navigation could not be captured before editing. The supplied screenshots document that half of the before/after comparison. The simulator reproduced the cold-start font failure, though its 402-point logical width did not reproduce the 300 ellipsis.
- After the fix, a cold launch showed **300**, the complete **Sunrise Peaks**, Rubik 900 **PLAY**, consistent difficulty and nav labels. The top coin and heart pills remained aligned.
- A temporary, local diagnostic route script cycled **Home → Store → Home → Trophies → Home twice** in the simulator. The returned Home kept the same typography and complete title. The Store screen displayed N/A after the empty product result. The temporary route script was removed from source after validation.
- Direct StoreKit query and an Apple sandbox purchase were not attempted on the simulator. No physical iPhone was connected.

## Checks and scope

- Targeted Jest: `brand.test.ts`, `formatCurrency.test.ts`, and `iap.test.ts`: **3 suites, 99 tests passed**. Existing IAP tests cover seven exact IDs, environment selection, loading/unavailable states, nonfatal failure, retry, and stale-response protection. The new regression checks cover font registration before route mount, explicit Home faces, coin sizing rules, and 300/1,000 formatting.
- `npx tsc --noEmit`: passed.
- ESLint on touched/new files: passed after removing one unused suppression.
- `git diff --check`: passed.
- `git diff --stat`: 8 tracked files, 77 insertions and 15 deletions; the new 56-line report and 12-line local diagnostic helper are untracked and therefore absent from that stat.
- `PUBLISHED_MAX_LEVEL` remains **50**; `CAMPAIGN_VERSION` remains **`v2-50`**.
- No levels, geometry, witnesses, economy grants, heart behavior, IAP IDs, ad IDs, UMP, PostHog events, Game Center IDs, icon, splash, or Privacy Policy were changed. No commit or push was made.

The opt-in diagnostic flag is absent from every EAS profile. Its local trace contains mode, country, requested and missing product IDs, counts, and error codes only; it does not record API keys, Apple ID, email, transaction IDs, or Game Center identity.
