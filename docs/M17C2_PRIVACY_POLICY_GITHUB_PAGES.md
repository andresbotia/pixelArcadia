# M17C.2 — Privacy Policy + GitHub Pages hosting

Branch `milestone/1-core-prototype` (HEAD `a8a59f0`). Release/legal documentation only. **No commit or push.** No app code, config, ads, IAP, analytics, Game Center, level or publishing files changed (`git diff --quiet -- src app app.json eas.json app.config.js content` is clean). `PUBLISHED_MAX_LEVEL = 50`, `CAMPAIGN_VERSION = 'v2-50'`.

## Files
| Path | Purpose |
|---|---|
| `site/privacy/index.html` | **Privacy Policy source**: static, semantic HTML, no JavaScript |
| `site/styles.css` | Shared stylesheet: system font stack, no web fonts or external assets |
| `site/index.html` | Minimal Pixel Arcadia landing page linking to the policy |
| `.github/workflows/pages.yml` | GitHub Actions deployment of `site/` only |
| `docs/APP_STORE_PRIVACY_PREP.md` | App Store Connect App Privacy questionnaire prep |
| this report | |

## Deployment architecture and URL
- Remote `https://github.com/andresbotia/pixelArcadia.git`: **public** repository, default branch `main`. The repository slug is **`pixelArcadia`** (not Orbitide), so the URL carries the product name and there is no branding concern.
- Pages is **not enabled** yet (`GET /repos/andresbotia/pixelArcadia/pages` returns 404). There is no user site (`andresbotia.github.io` repo) and no custom domain, so the project site URL is determined by the account and repo name:
  - Site: `https://andresbotia.github.io/pixelArcadia/`
  - **Privacy Policy: `https://andresbotia.github.io/pixelArcadia/privacy/`**
- Why an Actions workflow instead of "deploy from branch `/docs`": `docs/` holds 60+ internal engineering reports that would become public web pages. The workflow uploads **only `site/`** and needs no build, dependencies or secrets.
- The workflow triggers on pushes touching `site/**` or the workflow on `main` or `milestone/1-core-prototype`, plus manual `workflow_dispatch`.
  - Permissions: `contents: read`; the deploy job adds only `pages: write` and `id-token: write`.
  - Actions: `actions/checkout@v7`, `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5` (current majors, checked against each repo's latest release).
  - Concurrency group `pages`.
- **Publish guard**: the build fails if `site/` contains `PRIVACY_CONTACT_EMAIL_REQUIRED`, or any script, iframe, external image or stylesheet, `@import`, or Google Analytics / Tag Manager / PostHog ingestion reference. **It will therefore refuse to publish until the contact email is filled in**, by design.

### Manual GitHub steps (activation is manual)
1. Replace `PRIVACY_CONTACT_EMAIL_REQUIRED` in `site/privacy/index.html` (section 16) with the real privacy contact address.
2. Commit `site/` and `.github/workflows/pages.yml`, then push.
3. GitHub → `andresbotia/pixelArcadia` → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. **Actions → "Deploy Pixel Arcadia site" → Run workflow**, choosing the branch that holds the files (or push a change under `site/`).
5. If the deploy job fails with *"Branch … is not allowed to deploy to github-pages due to environment protection rules"*: go to **Settings → Environments → github-pages → Deployment branches and tags** and add `milestone/1-core-prototype`, or merge to `main` and deploy from there.
6. Open **Settings → Pages** and copy the exact live URL. Confirm `…/privacy/` loads over HTTPS without authentication, and that **Enforce HTTPS** is on (default for `github.io`).
7. Enter that URL in **App Store Connect → App Privacy → Privacy Policy URL**. Then add the in-app Settings row (below).

## Privacy contact status: **RELEASE BLOCKER**
No release-safe support or privacy address is designated anywhere in the repo or project metadata. The GitHub profile has no public email, and the personal account email was deliberately **not** used. The policy therefore shows `PRIVACY_CONTACT_EMAIL_REQUIRED`, and the workflow blocks publication until it's replaced. Recommended: a dedicated address such as a `privacy@`/`support@` mailbox on a domain you control, or a dedicated app mailbox. The policy identifies the controller as "the developer of Pixel Arcadia, the seller shown on the App Store listing". Add a legal name or entity line if you want one printed.

## What the policy discloses (all from the code audit)

**Services disclosed**:
- Google AdMob (Google Mobile Ads SDK)
- PostHog (US Cloud)
- RevenueCat
- Apple: App Store, StoreKit and Game Center
- **Expo EAS Update**. The M17 service reports missed this one: the shipped app checks `u.expo.dev` on every launch (`EXUpdatesCheckOnLaunch = ALWAYS`) with an `EAS-Client-ID` install UUID. It is a real production network service, so it is disclosed.

Developer-only tools (Level Studio CanvasKit CDN, Jest, EAS Build) are not included.

**Local storage (§3)**:
- `orbitide/progress/v1`: highest unlocked level
- `…/tutorials/v1`
- `…/economy/v1`: coins, inventory, first-clear reward IDs, processed-IAP **transaction ledger**
- `…/hearts/v1`
- `…/settings/v1`: Color Assist
- `…/iap/v1`: cached Remove Ads
- `…/ads/v1`: cadence counters
- `…/analytics/v1`: attempt/dedupe bookkeeping
- `pixelarcadia/gamecenter/v1`: submission memo keyed by the Game Center player ID
- SDK-internal identifiers and queues

The policy notes that iCloud/device backups may include this data, and that there is no server-side progress sync.

**Analytics (§4)**:
- The explicit event vocabulary, in plain words, with a random anonymous ID.
- The app/OS/device-type/screen-size properties the SDK actually attaches. Device model, locale and timezone are *not* attached (the optional libraries are absent).
- Explicit *not collected* list: name, email, Game Center name, advertising IDs, precise location, Apple/RevenueCat transaction or customer IDs.
- Replay, screen/touch recording, automatic screen tracking and crash autocapture are off.
- "Asks PostHog not to derive location from IP" is stated precisely. The policy does **not** claim the IP is discarded (that account-side setting is unverified).

**Ads (§5)**:
- Interstitials only between levels, at most every third first-time completion, never mid-level or after a failure.
- Rewarded ads are optional (heart, or retry at zero hearts) and granted only on confirmed reward.
- Remove Ads turns off interstitials; rewarded ads stay available.
- What Google may process, and for which purposes.
- The app currently requests **non-personalized** ads and requests no ATT/IDFA. This is verified in code and stated as the current configuration.
- Consent language is conditional: "you may be shown a consent message… where the law requires". **UMP is not implemented; see blockers.**
- Google's partner-sites and privacy links.

**In-app purchases (§6)**:
- Apple processes payments; no card details reach us.
- RevenueCat's role (availability and prices, validation, Remove Ads status, restore), using an anonymous RevenueCat ID.
- The consumable/non-consumable list.
- **Restore brings back Remove Ads only**; consumables are not restored.

**Game Center (§7)**: optional and Apple-managed. The policy accurately says Apple gives the app the display name and player ID, which are used **on device only** (the "Signed in as" line and the submission memo). The app submits highest-cleared level and achievements, and never sends Game Center identity to analytics, ads or purchase providers (verified: no Game Center fields in `src/analytics`).

**Children (§10)**: general audience, not directed to children under 13 (or the local age of digital consent), no knowing collection, no chat or sharing features, non-personalized ad requests, and a parent contact path. The policy declares **no** age rating; none is configured in the repo, so the App Store age-rating questionnaire is still an owner decision.

**Regional rights (§13)**:
- GDPR (EEA/UK/CH) and US-state rights: access/copy, correction, deletion, objection/restriction, consent withdrawal, opt-out of sale or targeted-ad sharing, and non-discrimination.
- Contact-based requests only; the policy explicitly says there is no in-app tool.
- Verification may be needed. The policy is honest that pseudonymous analytics may not be linkable to a person.
- Right to complain to a data protection authority.
- Legal bases (contract, legitimate interests, consent) are in §2.

"Sell" is used precisely: "We do not sell your personal information… The app requests non-personalized ads, and we do not share your personal information for cross-context behavioral advertising." There are no blanket "we collect no data" claims; each provider's processing is described.

**Terms of Use**: not created (out of scope). If the App Store listing relies on Apple's Standard EULA (`https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`), nothing else is needed for Terms.

## Settings Privacy Policy row: **not added** (deliberate)
The URL is determined by the repo, but it returns 404 until the manual Pages activation and the contact email land. The brief forbids a broken row. Follow-up, once `https://andresbotia.github.io/pixelArcadia/privacy/` is live:
1. Add `export const PRIVACY_POLICY_URL = '<exact URL from Settings → Pages>';` to `src/theme/appIdentity.ts`.
2. Add an **About → Privacy Policy** row to `src/screens/SettingsScreen.tsx`: `Pressable`, `accessibilityRole="link"`, `onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}` (`Linking` from `react-native`; opens Safari, so no in-app web view).
3. Update `launchBrand.test.ts`: the current "invents no links" test forbids URLs and `Linking` in Settings, so relax it to allow exactly `PRIVACY_POLICY_URL`, and assert it equals the verified live URL.
4. Run the targeted brand tests, `tsc` and ESLint.

## app-ads.txt suitability
- AdMob requires `app-ads.txt` at the **root** of the developer website's host, and the App Store listing must include that developer website. For a URL with a path (`https://andresbotia.github.io/pixelArcadia/`), the crawler checks `https://andresbotia.github.io/app-ads.txt`. That is the host root, which a **project** Pages site cannot serve, since it only controls `/pixelArcadia/…`.
- **Workable options:**
  - (a) Create a **user site** repo named `andresbotia.github.io` containing only `/app-ads.txt`, and set the App Store developer (marketing) website to `https://andresbotia.github.io/` or the project URL. Both resolve to the same host root.
  - (b) Use a custom domain you own, with `app-ads.txt` at its root.
  - (c) Use Firebase Hosting, which Google documents as an alternative.
- GitHub Pages serves plain text at the root of a user site, so (a) is technically sufficient.
- **Do not create the file yet.** Its contents must be copied verbatim from AdMob → Apps → View all apps → app-ads.txt. Nothing is pre-written here, to avoid an incorrect seller line. After publishing, verify in AdMob; the crawl can take up to 24h+.

## App Store privacy questionnaire prep
See `docs/APP_STORE_PRIVACY_PREP.md`. It maps every data flow to Apple categories with VERIFIED vs NEEDS ACCOUNT-SIDE CONFIRMATION status:
- Device ID (Google, PostHog, Expo)
- Purchase History (RevenueCat, PostHog)
- Product Interaction and Advertising Data
- Diagnostics (Google SDK)
- Coarse Location (Google)
- "Not collected" categories

It also flags that the app-level `PrivacyInfo.xcprivacy` currently declares **no** collected data types. The JS-only PostHog SDK has no native manifest, so declare its data via `ios.privacyManifests` in `app.json` (a separate change).

## Validation
- **HTML** (local structural check of both pages):
  - doctype, `lang="en"`, responsive viewport
  - all tags balanced, exactly one `h1`, no heading-level jumps
  - no duplicate IDs; every in-page anchor resolves; relative links (`privacy/`, `../`, `../styles.css`) resolve
  - the contents list is numbered to match the section numbers, and all "see section N" references are correct
- **Links**: all 7 external provider links return HTTP 200: Google privacy, Google partner-sites, RevenueCat, PostHog, Apple privacy, Apple Game Center & Privacy, Expo.
- **No tracking**: no `<script>`, iframes, external images, stylesheets or fonts, and no analytics; `referrer` set to `no-referrer`. Checked by the workflow guard, simulated locally: the tracking check passes and the placeholder check blocks, as intended.
- **Accessibility**:
  - semantic `header`/`main`/`article`/`section`/`nav`/`footer`, a skip link, `caption` and `scope` on the table, and a decorative SVG with `aria-hidden`
  - links underlined, with a visible focus ring
  - WCAG contrast:
    - body 12.5:1
    - links 7.7:1
    - meta text 7.7:1
    - white on the launch-blue field ≥ 5.1:1. The first draft's lighter gradient top and off-white header/footer measured 2.65–4.25:1 and were fixed.
- **Rendered visually** (WebKit): the branded header uses the Portal Mosaic inline SVG and "PIXEL ARCADIA", with a white article card.
- **Branding**: "Pixel Arcadia" appears throughout; **0** occurrences of "Orbitide" on either page.
- **Placeholders**: only `PRIVACY_CONTACT_EMAIL_REQUIRED` (intentional, flagged).
- `npx tsc --noEmit`: pass. ESLint: no app files touched, so not applicable. `git diff --check`: clean; new files have no trailing whitespace and end with a newline.
- `git diff --stat`: no tracked-file changes. New untracked: `site/` (3 files), `.github/workflows/pages.yml`, `docs/APP_STORE_PRIVACY_PREP.md`, this report. Nothing staged.

## Remaining privacy-policy launch blockers
1. **Privacy contact email**: replace the placeholder. Deployment is blocked until then.
2. **Pages activation**: the manual steps above, then the Settings row and the App Store Connect URL.
3. **AdMob UMP / consent**: not implemented. Required before serving ads in the EEA/UK/CH. The policy's consent sentence is conditional, and must become accurate before broad serving.
4. **PostHog IP discard**: verify the project setting. The policy does not claim it.
5. **App privacy manifest / questionnaire** and **age rating**: complete per `APP_STORE_PRIVACY_PREP.md`.
