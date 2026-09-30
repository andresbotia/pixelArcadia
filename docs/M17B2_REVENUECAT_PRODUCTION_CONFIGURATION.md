# M17B.2 — Production RevenueCat configuration

## Result and scope

The iOS production/TestFlight profile selects the existing public RevenueCat SDK key from `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`. The supplied key begins `app1_`; the resolver now accepts that prefix (and legacy `appl_`). The key value is not stored in this repository or printed by the app. An absent/invalid key leaves purchases unavailable without blocking the game. No RevenueCat secret/server key is used.

The account-side RevenueCat offering, App Store Connect product records, and commerce agreements were **not independently inspected**; this report distinguishes local code/test results from the account details supplied in the milestone brief.

## Existing architecture and environment selection

- `app/_layout.tsx` preloads saved data, including the economy ledger and cached Remove Ads state, then calls `startPurchases()` without awaiting store/network discovery. `src/iap/service.ts` owns one lazy controller; `PurchasesController.start()` configures at most once and registers one customer-info listener. `src/iap/sdk.ts` is the only native RevenueCat import and loads it lazily, so missing native SDK/Expo Go/web is unavailable rather than a startup crash.
- `src/iap/config.ts` reads the literal public Expo variables `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`, and optional `EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY`. `EXPO_PUBLIC_REVENUECAT_MODE` makes the build intent explicit. `sk_` secret keys are refused. There is no server key in the client.
- `eas.json`: **development** mode `test`; a debug build uses only a valid `test_` Test Store key, and stays unavailable when no Test Store key is configured. The production iOS key present in the development EAS environment cannot become a debug purchase key. **Preview** mode `off`; it stays unavailable even if both keys exist. **Production/TestFlight** mode `store`; a non-debug iOS build uses the real `app1_` public key. A release build with missing/unknown mode stays unavailable, and no release build can select a Test Store key. Android still requires its own `goog_` public key when enabled.
- EAS Build profile `env` selects the mode for builds. EAS Update must also publish with the matching server-side environment variables; before a production update, verify both `EXPO_PUBLIC_REVENUECAT_MODE=store` and the public iOS key are in its **production** EAS environment. See [Expo environment variable usage](https://docs.expo.dev/eas/environment-variables/usage/). Public SDK keys are appropriate for client bundles; RevenueCat Test Store keys must stay out of release-compiled builds, including preview/TestFlight. See [RevenueCat SDK configuration](https://www.revenuecat.com/docs/getting-started/configuring-sdk) and [Test Store](https://www.revenuecat.com/docs/test-and-launch/sandbox/test-store).
- The installed `react-native-purchases` version is `10.10.2`, which supports Test Store. A Test Store key and corresponding Test Store product setup were **not supplied or verified**. Debug IAP therefore remains unavailable until those are configured.

## Catalog, discovery, prices, and grants

The authoritative product-to-reward map remains `src/game/economy/catalog.ts`; `src/iap/catalog.ts` exposes its real-money slice. The SDK uses RevenueCat's direct `getProducts([...IAP_IDS], NON_SUBSCRIPTION)` and `purchaseStoreProduct()` path. It does **not** call `getOfferings()` or use package identifiers at runtime. This is an SDK-supported purchase path ([RevenueCat purchase documentation](https://www.revenuecat.com/docs/getting-started/making-purchases)). The seven package names below are the **expected remote dashboard mapping**, not a second client catalog; they must be checked in RevenueCat. A missing/partial product response disables just those cards, and a blank localized price cannot be bought. The UI shows RevenueCat/StoreKit's `priceString`, with no runtime hardcoded currency price.

| Expected package in current offering `default` (`Pixel Arcadia Store`) | Exact App Store product ID | Type | App grant |
| --- | --- | --- | --- |
| `coins_500` | `pixel_arcadia_coins_500` | Consumable | 500 coins |
| `coins_1500` | `pixel_arcadia_coins_1500` | Consumable | 1,500 coins |
| `coins_3500` | `pixel_arcadia_coins_3500` | Consumable | 3,500 coins |
| `coins_8000` | `pixel_arcadia_coins_8000` | Consumable | 8,000 coins |
| `starter_pack` | `pixel_arcadia_starter_pack` | Consumable | 1,000 coins, 3 Undo, 3 Extra Slot, 3 Bomb |
| `booster_pack` | `pixel_arcadia_booster_pack` | Consumable | 5 Undo, 5 Extra Slot, 5 Bomb |
| `remove_ads` | `pixel_arcadia_remove_ads` | Non-consumable | Durable `remove_ads` access; no coins/items |

The seven **client IDs, types, and grants passed local tests**. The `default` offering's current status, display name, seven package assignments, and attachment of only `pixel_arcadia_remove_ads` to the `remove_ads` entitlement require a RevenueCat dashboard check. `pixel_arcadia_pro` has no runtime code reference; if it exists remotely, leave it empty/unused.

## Purchase, entitlement, and restore safety

- CustomerInfo's RevenueCat transaction identity is the processed-ledger key. The separate StoreKit purchase-result ID never keys a grant. Concurrent callback, purchase result, refresh, and restart paths converge on the serialized ledger; duplicate IDs cannot grant twice. Distinct starter/booster transactions can each grant their exact rewards.
- The consumable reward and processed marker share one economy state write. For real-money reconciliation, the write now must succeed **before** the new state is exposed in memory. A failed write exposes neither reward nor marker and a later customer refresh can retry. Transactions older than this install's ledger do not grant on restore/reinstall.
- `remove_ads` comes from active RevenueCat entitlements, with a local cache for offline startup. Purchase, restore, and customer refresh update the ads policy; owning it suppresses forced interstitials while rewarded ads remain available. A later customer update can correct stale cached ownership. Restore cannot re-grant old coins, starter, or booster transactions.
- Cancellation returns quietly and grants nothing. Failed SDK calls, network discovery errors, unknown/missing products, missing localized price, absent key, and missing native module all fail safely. The app no longer enables verbose RevenueCat SDK logging or logs full keys, transaction IDs, or raw SDK error strings.

## External release checks and physical-device QA

The milestone brief reports all seven Apple products as **Prepare for Submission** and RevenueCat may show **Missing Metadata**. These are external states, not client defects, and were not independently verified here. Before release, inspect every product's metadata, price, localization, review/submission state, and sandbox/TestFlight availability in App Store Connect; inspect the RevenueCat product import, `default` offering, seven custom packages, and the sole `remove_ads` entitlement attachment. Separately verify the Paid Apps Agreement, banking, and tax information. No code workaround was added for account setup.

On a physical iOS sandbox/TestFlight device, check: all seven localized prices and partial/unavailable behavior; each coin amount; exact starter/booster inventory, repeat purchases, and duplicate callback/relaunch behavior; cancellation and offline failure; Remove Ads purchase, relaunch, restore on another installation, entitlement revocation/refund correction, interstitial suppression, and continued optional rewarded ads. Confirm production/TestFlight uses the real public key and debug uses only Test Store (or stays unavailable). A simulator or unit tests cannot establish Apple commerce readiness.

## Validation and changed files

- Targeted Jest: **4 suites, 103 tests passed** (`src/iap/__tests__/iap.test.ts`, economy store/economy tests, ads flow tests). Coverage includes all seven IDs/grants, repeat packs, ledger write failure/retry, callback identity, restart/restore, entitlement, price, configuration, and initialization once.
- `npx tsc --noEmit`: **passed**.
- ESLint on touched TypeScript files: **passed**, zero warnings/errors.
- `npx expo config --type public --json` evaluated with development, preview, and production profile environments: **all three passed**. This validates local config evaluation and profile mode selection; it does not validate that the remote EAS key is populated or that RevenueCat/Apple return products.
- `git diff --check`: **passed**. No native prebuild/device build was run; no generated native files were touched. No commit or push was made.
- Changed: `eas.json` (mode per build profile), `src/iap/config.ts` (public-key and mode selection), `src/iap/service.ts` (mode wiring/safe logging), `src/iap/sdk.ts` (no verbose SDK logging), `src/iap/controller.ts` (safe logging and missing-price guard), `src/iap/storeView.ts` (unavailable card for blank price), `src/storage/economy.ts` (durable IAP write before grant visibility), `src/iap/types.ts` (metadata comment), `src/iap/__tests__/iap.test.ts` (regressions), and this report.
