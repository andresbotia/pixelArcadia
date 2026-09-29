# M15C.4 — Worlds 21–24 import

Imported Levels 201–240 on `milestone/1-core-prototype`, starting from clean HEAD `c09514e` (the committed Worlds 17–20 import). No branch, commit, or push was created. All imported levels remain unpublished.

1. **Stable handoff:** Used only `/Users/andres/Desktop/pixel-arcadia-import-ready-201-240/`. Copied four world JSONs and four palette JSONs; all eight are byte-identical to the vetted files. Reviewed the advisory reference patch, certificates, visual/difficulty reviews, and occupancy/tiny-Pal audits. No original Desktop packets were used.
2. **Replacement metadata:** Retained `replacesLegacy=false` in all packets and every runtime definition. Each ID has exactly one active production definition; registry IDs remain contiguous 1–240. No legacy replacement mechanism was added.
3. **Palette:** **39 → 41**, appending only plum then rose through `ORB_COLOR_IDS`. Independently checked that all prior 39 IDs, order, fills, rims, labels, assist compositions, and Studio characters are unchanged. Worlds 21 and 24 introduce no new colors.
4. **Plum:** Exact authored fill `#5A2248`, rim `#B49BAC`, label `PLUM`, Studio `y`, light-on-dark assist contrast. The pale rim and actual Pal border remain visible against the dark background. Plum/navy separate by hue with assist OFF and by distinct marks with assist ON, including the heavily adjacent Level 220 fields.
5. **Pierced-ring:** Approved override implemented through existing primitives: `[{p:'ring',scale:0.7},{p:'bar',angle:90,len:0.2,offset:[0,-0.42]},{p:'bar',angle:90,len:0.2,offset:[0,0.42]}]`. The authored ring/diamond literal was not used. Both RN/component and Skia samples render the mark at minimum detail, at 2× and 3×. Tests verify exact parts and global mark uniqueness.
6. **Rose:** Exact authored fill `#E0457B`, rim `#F1ABC3`, label `ROSE`, Studio `e`, light-on-dark assist contrast. Rose/maroon remain **ACCEPTABLE WITH ASSIST**: their rims are nearly identical, so fill hue/value and glyph distinction carry the separation. Neither fill was altered.
7. **Down-triangle-dot:** Approved `triangle-down-dot` implemented as `[{p:'tri',dir:'down',fill:false},{p:'dot',scale:0.3}]`. The rejected X/ring literal was not used. Rendered through existing RN/component and Skia paths at 2× and 3×, alongside maroon, pink, umber, indigo, lavender, coral, and mauve. Exact parts, family distinctions, and uniqueness at every detail level pass. All 41 Studio characters are unique; both colors have material tokens, round-trip through Studio, and reject if replaced by an unregistered color.
8. **World 21 — Storm Elementals (201–210):** Copied, compiled, and wired into production level selection, campaign metadata, and world skin. Lightning and layered storm values retain its identity using existing colors. Its authored step up from W20 is preserved; the finale was not hardened based on score.
9. **World 22 — Galactic Odyssey (211–220):** Imported unchanged, adding plum. Deep-space fields, cosmic structures, and glow hierarchy survive rendering. Its softer middle is accepted: 216/217/219 retain their authored extreme labels, including 219’s 79-action route. These are future playtest/metadata observations.
10. **World 23 — Gothic Kingdom (221–230):** Imported unchanged, adding rose. Gothic architecture, windows, and light sources retain dark-scene readability. The handoff’s strongest authored composite world is preserved, including the visually weaker cathedral finale.
11. **World 24 — Celestial Zodiac (231–240):** Imported unchanged, adding no colors. Shared constellation/mountain framing and distinct zodiac subjects retain world identity at very high occupancy.
12. **Exact witnesses:** **40/40 PASS** in the actual imported runtime. Every action is legal, accepted, T/H-only, and productive; zero rejected, illegal, item, or zero-hit actions. Final states are won with zero remaining pixels, Holding, pending Holding, and tunnel queues. Peak pending is zero. All per-color capacities match targets. Exact grids, queues, capacities, witnesses, and labels were preserved; no reauthoring or regeneration.
13. **Solver:** **19 PASS / 21 INCONCLUSIVE; 40 passed, 0 failed, 0 warnings in the CLI summary.** Actual results match the handoff; full ID lists are below. Limits remain **100,000 nodes / 30 seconds**. An inconclusive bounded search does not invalidate constructive witness proof.
14. **Small Pals:** All **39** capacity 1–2 Pals preserved. Vetted audit: **37 NECESSARY, 2 MERGEABLE, 0 SUSPICIOUS**. Optional Level 215 T1 navy **8+2** and Level 235 T1 navy **8+1** merges were **not applied**. Tests independently check their unmerged queue positions and capacities; classifications are inherited from the vetted audit.
15. **Occupancy:** Independently counted actual runtime pixels and matched every level, empty-cell count, threshold membership, and world average. **35/40 ≥98%; 18/40 ≥99%**. Six boards reach **2295 pixels**: 229, 230, 237, 238, 239, 240. Source art remains unchanged; large flat color regions provide interior negative space. The authoritative audit is retained byte-for-byte at `docs/audits/M15C4_OCCUPANCY_AUDIT_201_240.json` for future device testing.

    | World | Mean pixels | Audit mean occupancy | ≥98% | ≥99% |
    | --- | --- | --- | --- | --- |
    | 21 | 2265.4 | 98.33% | 7 | 2 |
    | 22 | 2272.6 | 98.64% | 9 | 4 |
    | 23 | 2280.0 | 98.96% | 9 | 5 |
    | 24 | 2285.4 | 99.19% | 10 | 7 |

    W21’s 98.33% is the audit’s mean of rounded per-level percentages. Dividing its exact mean pixels by 2304 gives 98.32465%, displayed as 98.32%. This is a rounding convention difference, with identical pixel counts; the audit was preserved unchanged.

16. **Production visual review:** **35 PASS / 5 MINOR / 0 REAL DEFECT** after inspecting all 40 final imported boards, assist OFF and ON, at phone-like scale at both 2× and 3× (160 board views). Used actual `StaticPixelField`, production geometry/material/reachability, and Skia CanvasKit; glyph/Pal comparison sheets use actual `ColorAssistMark` and `PixelPalShell` via RN Web. All 16 world captures loaded ten canvases and recorded no browser errors. Both plum/navy and rose/maroon pairs retain the approved assist distinctions. This is browser review of production components, not native-device gameplay or animation testing.
17. **REAL DEFECT count:** **0 in this batch.** No new material visual defect or occupancy-driven mud appeared. Earlier Level 186 remains covered by the prior import’s publication block; its content was not touched.
18. **MINOR concerns retained:**

    | Level | Concern |
    | --- | --- |
    | 210 Tempest Titan | Graphite/slate body has a weak phone-scale silhouette against the storm |
    | 222 Gargoyle | Subject reads clearly only at larger preview |
    | 229 Dragon Knight | Busy; dragon reads mostly as a wing |
    | 230 The Crowned Cathedral | Flat stone facade; crown is not visually obvious |
    | 238 Capricorn | Goat body reads as a blob |

19. **Breathers:** 205/215/225/235 retain peak Holding 2, zero Holding-3 witness states, cleanup 2, and witness/bridge counts below their own non-breather world means. No neighbor-shortness, minimum-Pal, or strict monotonic difficulty assertion. **215 remains weak relative relief because W22 itself is soft**; its 102-action route need not be shortest (219 is 79), and its 89 Pals are close to W22’s non-breather mean 89.1.

    | Level | Pixels | Colors | Pals | Witness | Peak Holding | Bridges | Cleanup |
    | --- | --- | --- | --- | --- | --- | --- | --- |
    | 205 | 2236 | 18 | 83 | 90 | 2 | 4 | 2 |
    | 215 | 2244 | 18 | 89 | 102 | 2 | 5 | 2 |
    | 225 | 2252 | 18 | 77 | 95 | 2 | 7 | 2 |
    | 235 | 2260 | 18 | 86 | 103 | 2 | 6 | 2 |

20. **Finales:** Exact author metrics independently replayed and retained. 210 gameplay ACCEPTABLE / visuals MINOR; 220 STRONG / PASS; 230 STRONG / MINOR; 240 ACCEPTABLE / PASS. No numeric-ranking tuning.

    | Level | Pixels | Colors | Pals | Witness | Peak Holding | Bridges | Cleanup |
    | --- | --- | --- | --- | --- | --- | --- | --- |
    | 210 | 2290 | 19 | 99 | 114 | 3 | 9 | 3 |
    | 220 | 2290 | 21 | 100 | 124 | 3 | 10 | 3 |
    | 230 | 2295 | 22 | 112 | 130 | 3 | 10 | 3 |
    | 240 | 2295 | 22 | 108 | 134 | 3 | 9 | 4 |

21. **Level 220:** The Star Forge retains the handoff’s strongest finale assessment: 124 actions, 100 Pals, 10 bridges, and visual PASS. Its white-hot core, rings, and brackets stay readable against plum/navy. The vetted certificate’s 19 Holding-3 states and strong gameplay assessment remain unchanged.
22. **Level 230:** The Crowned Cathedral retains strong gameplay (130 actions, 112 Pals, 10 bridges). Its flat facade and weak crown remain MINOR; no repaint.
23. **Level 238:** Capricorn retains its hard non-finale profile (116 actions, 89 Pals, 10 bridges). Visual body weakness remains MINOR; no art or label change.
24. **Level 240:** The Zodiac Wheel retains the exact **134-action witness**, the longest in the current campaign. Coherent gold-rimmed wheel, spokes, and centered core retain visual PASS. Gameplay remains ACCEPTABLE and endurance-driven; no inflation or shortening.
25. **Publishing:** **`PUBLISHED_MAX_LEVEL=50`, `CAMPAIGN_VERSION='v2-50'`**. Both publication constants/code are unchanged. Normal campaign blocks 201–240, while dev index exposes all 40; boundary regression tests pass.
26. **Manual patch conflict resolution:** Excluded `paletteWorld1720.test.ts` from patch application. Manually updated length/unique counts 39→41 and `slice(36)`→`slice(36,39)`, preserving its full explicit `slice(0,36)` baseline list assertion. Also updated the relevant registry-size comments. The new palette suite explicitly asserts all prior 39 IDs/order.
27. **Targeted tests:** **23 suites / 697 tests PASS**, including the 99 new tests; no broad Jest run. Coverage includes all 40 seven-value author certificates, source/runtime equality and hashes, exact replay and clean final states, dimensions/tunnels/capacities, palette order/unique shapes/materials/Studio/unknown rejection, world-relative breathers, finales, unmerged tiny Pals, publication/dev gates, prior imports, world skins, witness-aware validation, relevant Studio and renderer suites. Witness-only CLI: **40 passed / 0 failed / 0 warnings**. Commands and full logs are retained locally below.
28. **TypeScript:** `npx tsc --noEmit` PASS.
29. **ESLint/whitespace:** ESLint PASS for all **25 touched/new TypeScript files**; `git diff --check` PASS. New files also receive a whitespace check. All four modules were generated by the normal compiler with structural validation, without bypass flags.
30. **Performance:** No engine or rendering algorithm change. Color/material/assist access stays direct by key. `buildPixelBuckets` retains a single O(n) pixel pass using a Map; `StaticPixelField` retains memoized buckets and cached per-bucket material paths/rendered nodes. No board × entire palette × frame processing was introduced. Near-full boards stay within the existing 48×48 limit. Findings are code-path inspection and renderer smoke checks, not a real-device frame-rate benchmark.
31. **Git diff:** Tracked diff and new file inventory are recorded below. Nothing staged, committed, or pushed; branch and HEAD unchanged. The temporary browser harness/screenshots/logs remain ignored under `dist/m15c4-review/`.

## Evidence and commands

- Compile: `npx tsx scripts/levels.ts compile --file content/levels/world-NN.json --target src/game/levels/compiledWorldNN.ts`, for NN=21–24.
- Exact replay CLI: `npx tsx scripts/levels.ts validate --from 201 --to 240 --witness-only`.
- Default solver CLI: `npx tsx scripts/levels.ts validate --from 201 --to 240`.
- Jest: `npx jest --runInBand --runTestsByPath` with the 23 explicit suites listed in `dist/m15c4-review/tests.log`.
- Typecheck: `npx tsc --noEmit`; lint: `npx eslint` with the 25 changed/new TS files.
- Whitespace: `git diff --check` plus all untracked file lines.
- `dist/m15c4-review/world21-off-2x.png` through `world24-on-3x.png`: 16 ten-board sheets.
- `dist/m15c4-review/glyphs-{plum,rose}-{2,3}x.png`: four production RN/Skia/Pal comparison sheets.
- `dist/m15c4-review/review-results.json`, `occupancy-results.json`, `solver-results.json` and validation/check logs. Browser console has existing Skia path-API deprecation warnings; no browser errors or rendering failure. The temporary browser/server were stopped after review.
- Original run logs: `/tmp/pixel-m15c4-{tests,witness-only,validator,tsc,eslint,capture}.log`.

## Default solver results

`npx tsx scripts/levels.ts validate --from 201 --to 240` completed successfully in 657.7 seconds.

- Solver PASS (19): 201, 202, 203, 206, 208, 209, 212, 214, 215, 221, 223, 224, 225, 226, 229, 231, 232, 234, 239.
- Solver INCONCLUSIVE (21): 204, 205, 207, 210, 211, 213, 216, 217, 218, 219, 220, 222, 227, 228, 230, 233, 235, 236, 237, 238, 240.
- All 40 are witness-proven; default caps unchanged. Per-level slow-search and solver-inconclusive diagnostics remain in the log; the CLI summary reports zero warnings.

## Git diff stat

`git diff --stat` (tracked files):

```text
 src/game/engine/types.ts                                   |  4 +++-
 src/game/levels/__tests__/campaignMetadata.test.ts         | 12 ++++++++----
 src/game/levels/__tests__/campaignV2World1316.test.ts      |  2 +-
 src/game/levels/__tests__/campaignV2World1720.test.ts      |  2 +-
 src/game/levels/__tests__/campaignV2World912.test.ts       |  2 +-
 src/game/levels/__tests__/publishedCampaign.test.ts        |  2 +-
 .../levels/authoring/__tests__/paletteWorld1316.test.ts    | 14 +++++++-------
 .../levels/authoring/__tests__/paletteWorld1720.test.ts    |  8 ++++----
 src/game/levels/authoring/__tests__/paletteWorld6.test.ts  |  2 +-
 src/game/levels/authoring/__tests__/paletteWorld78.test.ts | 12 ++++++------
 .../levels/authoring/__tests__/paletteWorld912.test.ts     | 12 ++++++------
 src/game/levels/campaign.ts                                |  8 ++++++--
 src/game/levels/levels.ts                                  | 10 +++++++++-
 src/game/rendering/__tests__/colorAssist.test.ts           | 12 ++++++------
 src/game/studio/grid.ts                                    |  6 ++++--
 src/theme/__tests__/worldSkins.test.ts                     |  1 +
 src/theme/colorAssist.ts                                   |  8 +++++---
 src/theme/colors.ts                                        |  9 ++++++++-
 src/theme/worldSkins.ts                                    |  6 +++++-
 19 files changed, 83 insertions(+), 49 deletions(-)
```

Git excludes untracked files from that command. These **16 new files** are also part of the import, giving **35 changed/new files** total:

```text
content/levels/world-21.json
content/levels/world-22.json
content/levels/world-23.json
content/levels/world-24.json
content/palettes/world-21-palette-extension.json
content/palettes/world-22-palette-extension.json
content/palettes/world-23-palette-extension.json
content/palettes/world-24-palette-extension.json
docs/M15C4_IMPORT_REPORT.md
docs/audits/M15C4_OCCUPANCY_AUDIT_201_240.json
src/game/levels/__tests__/campaignV2World2124.test.ts
src/game/levels/authoring/__tests__/paletteWorld2124.test.ts
src/game/levels/compiledWorld21.ts
src/game/levels/compiledWorld22.ts
src/game/levels/compiledWorld23.ts
src/game/levels/compiledWorld24.ts
```
