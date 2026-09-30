# App Store age rating questionnaire prep

Prepared September 30, 2026 from the puzzle game, Store, ad, Game Center and UI code. No questionnaire has been submitted and no final age rating is claimed. Use App Store Connect → App Information → Set Up Age Ratings. [Apple's current flow](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/) asks about controls/capabilities and content frequency, then calculates ratings by region.

| Question area | Prepared response | Evidence / final check |
| --- | --- | --- |
| Parental controls, age assurance | No built-in controls or age gate | `app/`, `src/screens/` |
| User-generated content, messaging/chat, social media | No | Single-player gameplay; Game Center leaderboard is Apple-hosted score/achievement sharing, so review the exact questionnaire wording before submitting |
| Advertising | Yes | Interstitial and rewarded placements, `src/ads/flows.ts` |
| Unrestricted web access | No | Only fixed Privacy Policy external link; `src/screens/SettingsScreen.tsx` |
| Profanity/crude humor, alcohol/tobacco/drugs | None | Campaign text/art should receive final visual review |
| Horror/fear, medical/wellness, sexual content/nudity | None expected | Final visual review of all published art required |
| Cartoon/fantasy violence, realistic violence, guns/weapons | None expected | Puzzle combat terms/art should receive final visual review |
| Simulated gambling, gambling, contests, loot boxes | None | No random paid rewards or wagering; `src/game/economy/catalog.ts` |
| In-app purchases | Yes | Seven fixed products including Remove Ads; `src/iap/catalog.ts` |
| Made for Kids / higher override | Not Applicable unless developer chooses a category or legal minimum age | Privacy policy describes a general-audience game; do not choose Made for Kids without reviewing Apple's restrictions |

Open the live questionnaire, match each displayed question to this worksheet, inspect all 50 published levels and store/art, then save only after the developer confirms the answers. Apple may show different regional results. [Age-rating definitions](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions).
