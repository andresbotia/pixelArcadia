# M15C.2 — Worlds 13–16, Levels 121–160

Imported Frozen North (121–130), Volcanic Forge (131–140), Carnival of Wonders (141–150), and Lantern Dynasty (151–160). Each has its normal authored JSON, compiled runtime module, campaign manifest entry, and world skin. The registry contains exactly one active definition for each ID 1–160.

Branch: `milestone/1-core-prototype`. M15C.1 was already committed as `d3df888`. No branch was created; no commit or push was made.

## Source and preservation

Used only `/Users/andres/Desktop/pixel-arcadia-import-ready-121-160/`:

- `world-13.json` through `world-16.json` → `content/levels/`.
- `palette-world-13.json` through `palette-world-16.json` → `content/palettes/world-NN-palette-extension.json`.
- `IMPORT_NOTES_121_160.md`, `VISUAL_REVIEW_121_160.md`, `VALIDATION_121_160.json`, `SMALL_CAPACITY_AUDIT_121_160.json`, and `review/expected-author-certificate.txt` supplied reference evidence and the independent test certificate.

All eight imported source files are byte-identical to the stable handoff. SHA256 assertions pin the four original level arrays; runtime definitions match the parsed source exactly. `replacesLegacy=false` is retained for every level 121–160, with no legacy replacement logic applied to this batch. Queues, grids, witnesses, capacities, difficulty labels, and tiny Pals remain intact.

## Palette and glyphs

`ORB_COLOR_IDS` grows from 34 to 36 by appending `garnet`, then `verdigris`. The original 34 IDs, ordering, and fill values are pinned by tests. No new renderer primitive or render loop was introduced.

| ID | Fill | Rim / chip border | Semantic glyph | Studio character |
|---|---|---|---|---|
| garnet | `#8E1B1B` | `#CC9898` | `theta`: ring + horizontal bar, length 0.56 | `g` |
| verdigris | `#1B8C8C` | `#98CBCB` | `lidded-triangle`: filled down-triangle + horizontal lid, length 0.62, offset `[0,-0.44]` | `v` |

Both use `lightOnDark` contrast. Names and part definitions remain unique at full, compact, and minimal detail. The stored authored palette specifications are preserved as provenance; runtime garnet explicitly supersedes the authored diamond glyph, and verdigris uses the corrected lid offset. Actual RN/Skia production-component screenshots confirm theta's open shape and verdigris's lid separation at 2× and 3×, at the 6pt minimum mark size. Accepted fills are unchanged; garnet/maroon/red/umber and verdigris/teal/forest/green/slate remain identifiable with assist OFF and ON.

## Replay and validator

All 40 authored witnesses pass exact production replay. Independent test replay checks every written action: accepted, legal T/H only, and more than zero hits. Every final state is won with zero uncleared pixels, empty Holding and tunnels, zero pending, zero rejected actions, zero item actions, and zero zero-hit actions. Peak pending is also zero.

Commands:

```sh
# Each world compiled structurally without bypass flags:
npx tsx scripts/levels.ts compile --file content/levels/world-13.json --target src/game/levels/compiledWorld13.ts
# Repeated for worlds 14, 15, 16.
npx tsx scripts/levels.ts validate --from 121 --to 160
npx tsx scripts/levels.ts validate --from 121 --to 160 --witness-only
```

Default validator: **40 passed, 0 failed, 0 warnings** in 465.2s. **29 witness + solver passes; 11 witness-proven / solver-inconclusive passes**: 122, 130, 133, 135, 137, 138, 139, 146, 150, 155, 156. This exactly matches the stable handoff classification. Default 100,000-node / 30-second limits were used without modification. Witness-only CLI: 40 passed, 0 failed in 715ms.

All boards are coreV2, have exactly three tunnels, are 48×48, and have per-color total charge capacity equal to pixel count. Existing Active capacity 5 and Holding capacity 3 are unchanged.

## Tiny Pals, breathers, finales, difficulty

All **82 capacity 1–2 Pals** remain unchanged: handoff classification 57 NECESSARY, 2 MERGEABLE, 23 SUSPICIOUS. The optional merges in 133 and 135 were not applied. Hash checks preserve the complete certified queues.

Breathers 125, 135, 145, 155 retain peak Holding 2, zero full-Holding states, shortest witnesses in their respective worlds, fewer bridges than non-breather world averages, and fewer Pals than those averages. The original capacity distributions are preserved. No assertion requires fewer Pals than both neighbors; 135 keeps its certified 78 Pals while 134 keeps 76.

| Level | Role | Pixels | Colors | Pals | Witness | Peak Holding | Bridges | Cleanup |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| 125 | breather | 2172 | 10 | 57 | 73 | 2 | 5 | 2 |
| 135 | breather | 2180 | 12 | 78 | 86 | 2 | 4 | 2 |
| 145 | breather | 2190 | 16 | 59 | 68 | 2 | 5 | 2 |
| 155 | breather | 2196 | 17 | 55 | 72 | 2 | 5 | 3 |
| 130 | Frost Wyrm | 2230 | 18 | 97 | 112 | 3 | 8 | 3 |
| 140 | Heart of the Volcano | 2238 | 15 | 100 | 112 | 3 | 7 | 3 |
| 150 | Grand Parade | 2246 | 20 | 94 | 115 | 3 | 9 | 5 |
| 160 | Celestial Dragon Parade | 2259 | 19 | 99 | 114 | 3 | 8 | 3 |

Every level's full seven-value author certificate is asserted against independent production replay, including the finales. Finale pressure, bridges, and route structure remain certified. Visuals: 140 and 160 remain premium; 150 remains partly strong; 130 remains the weaker visual finale.

159 Temple Bell remains `extreme`: 81 actions, 65 Pals, nine bridges. The handoff's progression evidence supports considering `super-hard` as a later metadata-only adjustment. No difficulty label or queue was changed during this import.

## Production visual confirmation

Rendered all 40 imported definitions with actual `StaticPixelField` + Skia CanvasKit, production geometry/materials/reachability, and assist OFF/ON at both 2× and 3×. A 347×430pt available board region represents a 375pt phone with 28pt horizontal margins. Isolated marks additionally use actual `ColorAssistMark` through RN Web and actual Skia field rendering. Every world capture contains ten rendered canvases, no recorded browser errors, and the correct device scale.

This uses production renderer components, not the handoff's Python approximation. It confirms initial board art and both assist implementations; it does not claim a native-device animation/playthrough review.

Result: **30 PASS, 10 MINOR, 0 REAL DEFECT**, matching the prior review. Assist adds the expected texture at this density; no new import defect or substantially worse subject silhouette was found. Pale white/ivory/ice/seafoam/sand distinction remains available through the established glyphs and material tokens.

| MINOR level | Accepted concern confirmed |
|---|---|
| 121 | Bear can read as a cloud |
| 125 | White penguin bodies blend into snow; closest concern to a real defect |
| 128 | Wolf pack is weak |
| 130 | Wyrm blends into the aurora at phone scale |
| 132 | Gem specks add sky noise |
| 133 | Anvil is ambiguous |
| 142 | Ferris wheel center is busy |
| 144 | Red balloon reads most clearly; pale balloons merge into clouds |
| 150 | Parade float center is ambiguous |
| 154 | Crane is hard to locate |

No grid or artwork was edited. Review screenshots, browser evidence, build inputs, capture script, per-level classification JSON, and validation/test logs are retained locally under ignored `dist/m15c2-review/`. Sheets: `world13-off-2x.png` through `world16-on-3x.png`; isolated comparisons: `glyphs-2x-detail.png`, `glyphs-3x-detail.png`.

## Tests, static checks, performance, publication

**19 targeted Jest suites, 495 tests passed**, no broad Jest run. Scope: new Worlds 13–16 and palette tests; witness policy; Worlds 9–12 regression; existing palette infrastructure and World 6/7/8/9/12 color tests; color assist; world skins and campaign metadata; published campaign; Studio round-trip, serialization, validation, model, thumbnails, and manifest; static pixel grouping. Existing tests were updated only for expanded counts/ranges or the Studio manifest test's stale legacy-registry import.

Targeted tests cover palette ordering/unique IDs, exact fills/rims/tokens, unique Studio encoding, unknown-color rejection, all-detail unique glyphs, theta semantics, corrected lid, a representative 36-color schema/Studio board, all garnet/verdigris production boards, unique coreV2 levels, exact replay/final states, certified capacities/metrics, breathers, finales, tiny-Pal preservation, dev availability, and campaign blocking.

`npx tsc --noEmit`: PASS. ESLint all touched/new TypeScript files: PASS, no output. `git diff --check`: PASS. An ephemeral review TSX input was moved outside TypeScript's project scope before the final typecheck; no project dependency or compiler configuration was changed.

Performance inspection: `orbColors[color]`, `orbGlow[color]`, and `COLOR_MARKS[color]` remain direct lookups. `buildPixelBuckets` retains one O(pixels) pass into a Map; `StaticPixelField` rebuilds paths by bucket membership and reuses cached subtrees. Palette growth changes only the vocabulary and possible bucket count. No full-board × palette scan or per-frame work was introduced; no optimization was added.

`PUBLISHED_MAX_LEVEL = 50` and `CAMPAIGN_VERSION = 'v2-50'` are unchanged. Campaign publication tests and per-level checks block 121–160; dev index exposes all 40. Gate rules, capacities, tunnel count, endgame fast-forward, ads, IAP, analytics, Game Center, and the board ceiling were not modified.

## Git diff --stat

Tracked-file diff (new files remain untracked, not staged):

```text
 src/game/engine/types.ts                                   |  4 +++-
 src/game/levels/__tests__/campaignMetadata.test.ts         | 12 ++++++++----
 src/game/levels/__tests__/campaignV2World912.test.ts       |  2 +-
 src/game/levels/__tests__/publishedCampaign.test.ts        |  2 +-
 src/game/levels/authoring/__tests__/paletteWorld6.test.ts  |  2 +-
 src/game/levels/authoring/__tests__/paletteWorld78.test.ts | 12 ++++++------
 .../levels/authoring/__tests__/paletteWorld912.test.ts     | 14 +++++++-------
 src/game/levels/campaign.ts                                |  8 ++++++--
 src/game/levels/levels.ts                                  | 10 +++++++++-
 src/game/rendering/__tests__/colorAssist.test.ts           | 12 ++++++------
 src/game/studio/__tests__/campaign.test.ts                 |  2 +-
 src/game/studio/grid.ts                                    |  8 +++++---
 src/theme/__tests__/worldSkins.test.ts                     |  2 +-
 src/theme/colorAssist.ts                                   | 10 ++++++----
 src/theme/colors.ts                                        |  8 +++++++-
 src/theme/worldSkins.ts                                    |  6 +++++-
 16 files changed, 73 insertions(+), 41 deletions(-)
```

New files: four source world JSON files, four palette specifications, four compiled modules, two targeted test suites, and this report (15 files). Source world JSON and compiled modules account for 41,974 added lines; the remainder is palette metadata and targeted verification.
