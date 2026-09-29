# M15C.3 — Worlds 17–20 import

Imported Levels 161–200 on `milestone/1-core-prototype`, starting at `2eb9d7f`. No branch, commit, or push was created. All imported levels remain unpublished.

1. **Stable handoff:** Used only `/Users/andres/Desktop/pixel-arcadia-import-ready-161-200/`. The four level JSON files and four palette JSON files are byte-identical to that handoff. Reviewed its reference patch and certificates; generated the four runtime modules through the normal compiler.
2. **Replacement metadata:** `replacesLegacy=false` is retained in every imported runtime definition and all four packets. There is exactly one active definition per ID, with contiguous IDs 1–200.
3. **Palette:** Appended cerulean, graphite, sage through `ORB_COLOR_IDS`: 36 → 39. The previous 36 IDs, order, fills, rims, labels, marks, and Studio characters are preserved.
4. **Cerulean:** Fill `#2FA0E0`, rim `#A1D4F1`, light-haloed contrast; approved **pinned-ring** replaces the raw authored triangle/disc description. Ring scale 0.7, vertical stem length 0.3 at `[0,-0.38]`. Distinct from purple, blue, cyan, ice, ultramarine, teal, and verdigris in production RN/component and Skia samples at minimum detail, 2× and 3×.
5. **Graphite:** Fill `#555A66`, rim `#B2B4BA`, light-on-dark contrast; retained **slashed-square** (outline square + 45° slash). Close fills remain acceptable with assist: graphite versus slate/navy has distinct marks, and the pale board rim and actual Pal chip border remain visible with assist OFF/ON.
6. **Sage:** Fill `#94A887`, rim `#CED7C9`, light-haloed contrast; approved **anchor** uses an upward arc at `[0,0.1]`, vertical bar length 0.62, and short horizontal bar length 0.28 at `[0,-0.24]`. It remains distinct from forest’s T and the green/pine/seafoam/olive/verdigris family in both renderers at 2× and 3×.
7. **Studio:** Stable, unique mappings `cerulean=c`, `graphite=r`, `sage=s`. Central lists and validators derive from the registry; all new colors round-trip, have production material tokens, and unknown colors reject.
8. **World 17 — Steam Skyways:** 161–170 copied, compiled, wired into level selection, campaign metadata, and world skin. No new color; bronze/brass, cloud framing, and mechanical compositions retain its identity.
9. **World 18 — Crystal Caverns:** 171–180 imported through the same architecture. Cerulean and neighboring cool colors render consistently in the final production boards.
10. **World 19 — Neon Megacity:** 181–190 imported unchanged. Dense city layouts and multiple layers of traffic, signage, and towers retain the more sophisticated late-world appearance relative to early Neon Nights. Its pressure-heavy certificate is preserved; no difficulty tuning was applied.
11. **World 20 — Dreamscapes:** 191–200 imported unchanged, with sage. Its cohesive muted dream palette and varied subjects survive production rendering.
12. **Exact witnesses:** **40/40 pass** in the imported runtime. Every exact action is legal, accepted, item-free, and clears at least one pixel. All end won with zero remaining pixels, Holding, pending Holding, and tunnel queues; zero rejected, illegal, item, or zero-hit actions. Structural checks and capacity/color totals pass. No witness, queue, capacity, grid, or label was rewritten.
13. **Bounded solver:** **25 PASS / 15 INCONCLUSIVE; 40 levels passed, 0 failed.** The actual results match the handoff; full ID lists appear below. The global limits remain 100,000 nodes / 30 seconds; constructive witness proof is retained when search is inconclusive.
14. **Small Pals:** All **53** capacity 1–2 Pals preserved. Handoff audit: **50 NECESSARY, 0 MERGEABLE, 3 SUSPICIOUS**. The suspicious Level 181 Tunnel 2 run (pink 2, cyan 1, orange 1, queue positions 26–28) remains intact. Classification is inherited from the vetted audit; source equality and runtime replay independently confirm preservation.
15. **Visual review:** **28 PASS, 11 MINOR, 1 REAL DEFECT**. Inspected all 40 imported boards with assist OFF and ON at phone-like scale, at both 2× and 3× (160 board views). Used the actual `StaticPixelField` with production geometry/material/reachability, Skia CanvasKit, actual `ColorAssistMark` via RN Web, and actual `PixelPalShell` samples. All 16 world captures loaded ten canvases and recorded no browser errors. This is production-component browser review, not a native-device gameplay or animation test. No material change from the vetted visual classifications appeared.
16. **Level 186 — Drone Swarm: BLOCK BEFORE PUBLISHING LEVEL 186.** Imported unchanged as instructed. It reads as smoke streaks; drones remain unreliable to identify at phone scale with assist OFF or ON. Later work must choose a focused repaint plus recertification or an appropriate retitle. No choice or repair was made here.
17. **MINOR concerns:** All remain documented and unchanged:

    | Level | Concern |
    | --- | --- |
    | 166 | Cloud mass merges with hull |
    | 167 | Bronze body on bronze background |
    | 170 | No single dominant focal subject |
    | 173 | Tiny subject on flat navy; detached edge blobs |
    | 178 | Sparse for extreme |
    | 180 | Thin drips/frame read as noise |
    | 181 | Busy one-cell traffic lanes |
    | 182 | Mech merges with graphite |
    | 185 | Noodle bar difficult to identify |
    | 187 | Graphite sky/towers merge |
    | 188 | Dragon reads as thin zigzag |

18. **Breathers:** 165, 175, 185, 195 retain peak Holding 2, no Holding-3 witness states, low bridge pressure, and at most two cleanup relaunches. Their witnesses and bridge counts are below their own world’s non-breather means. No neighbor-shortness or fewer-Pals assertion was added. In particular, 185 has 98 actions versus neighbors 184/186 at 95/89, and 91 Pals versus a world mean of 80; its relief comes primarily from Holding/bridge pressure.

    | Level | Pixels | Colors | Pals | Witness | Peak Holding | Bridges | Cleanup |
    | --- | --- | --- | --- | --- | --- | --- | --- |
    | 165 | 2204 | 17 | 72 | 88 | 2 | 6 | 2 |
    | 175 | 2212 | 16 | 78 | 94 | 2 | 5 | 2 |
    | 185 | 2220 | 17 | 91 | 98 | 2 | 5 | 2 |
    | 195 | 2228 | 17 | 78 | 89 | 2 | 6 | 2 |

19. **Finales:** All retain the exact author certificate metrics, independently replayed by the new suite. 170 and 180 retain STRONG gameplay / MINOR visuals; 190 retains ACCEPTABLE gameplay / PASS visuals; 200 retains STRONG gameplay / PASS visuals. No artificial hardening or monotonic ranking assertion.

    | Level | Pixels | Colors | Pals | Witness | Peak Holding | Bridges | Cleanup |
    | --- | --- | --- | --- | --- | --- | --- | --- |
    | 170 | 2262 | 21 | 99 | 119 | 3 | 9 | 6 |
    | 180 | 2270 | 20 | 97 | 112 | 3 | 8 | 3 |
    | 190 | 2278 | 18 | 93 | 109 | 3 | 9 | 3 |
    | 200 | 2280 | 20 | 95 | 114 | 3 | 9 | 3 |

20. **Level 200 milestone:** The Dreamer’s Eye retains a clear dominant eye, layered composition, coherent palette, and milestone-quality production rendering. Levels 198/199 may match or exceed its pressure metrics; their authored 128-action routes remain unchanged. Label flags are retained for future metadata/playtest work: 178 soft for extreme, 196 soft for super-hard, 189 short route but dense.
21. **Publishing:** `PUBLISHED_MAX_LEVEL=50`, `CAMPAIGN_VERSION='v2-50'`. Normal campaign blocks 161–200; dev index exposes all 40. Publication code is unchanged and regression tests pass.
22. **Targeted tests:** **21 suites / 598 tests pass**; no broad Jest run. New suites cover source/runtime identity, all 40 independent seven-value certificates, exact action replay/final state, metadata, grid/tunnel limits, color totals, 53 tiny Pals, world-relative breathers, finales, dev/publication gates, palette append order, tokens, unique marks, Studio mappings/round trips, and unknown-color rejection. Relevant published campaign, prior import, Studio, palette, color assist, static renderer, world skin, and witness validation suites pass. Witness-only CLI: **40 passed / 0 failed / 0 warnings**.
23. **TypeScript:** `npx tsc --noEmit` passes.
24. **ESLint/whitespace:** ESLint passes for every touched/new TypeScript file; `git diff --check` passes. Source/compiled modules are produced without validation bypasses.
25. **Performance:** No engine grouping or rendering algorithm was changed. Theme/material/mark access remains direct by color; `buildPixelBuckets` makes one pass over pixels using a Map, and `StaticPixelField` retains cached per-color paths. No board × full-palette per-frame scan was introduced. This is code-path inspection, not a frame-rate benchmark.
26. **Git diff:** Tracked diff and the additional untracked import files are recorded below. Nothing staged, committed, or pushed. Local browser harness/screenshots remain ignored in `dist/m15c3-review/`.

## Local evidence

- `dist/m15c3-review/world17-off-2x.png` through `world20-on-3x.png`: 16 world sheets, each showing ten boards.
- `dist/m15c3-review/glyphs-{cerulean,graphite,sage}-{2,3}x.png`: six production RN/Skia/Pal comparison sheets.
- `/tmp/pixel-m15c3-tests.log`, `/tmp/pixel-m15c3-witness-only.log`, `/tmp/pixel-m15c3-validator.log`, `/tmp/pixel-m15c3-tsc.log`, `/tmp/pixel-m15c3-eslint.log`, `/tmp/pixel-m15c3-capture.log`.

## Default solver results

`npx tsx scripts/levels.ts validate --from 161 --to 200` completed successfully.

- Solver PASS (25): 162, 164, 165, 166, 167, 168, 169, 170, 172, 174, 175, 179, 180, 182, 184, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197.
- Solver INCONCLUSIVE (15): 161, 163, 171, 173, 176, 177, 178, 181, 183, 185, 186, 187, 198, 199, 200.
- All 40 are witness-proven; no failed levels. Default caps unchanged. Slow-search diagnostics are expected and remain visible in the validator log.

## Git diff stat

`git diff --stat` (tracked files):

```text
 src/game/engine/types.ts                             |  5 ++++-
 src/game/levels/__tests__/campaignMetadata.test.ts   | 12 ++++++++----
 .../levels/__tests__/campaignV2World1316.test.ts     |  2 +-
 src/game/levels/__tests__/campaignV2World912.test.ts |  2 +-
 src/game/levels/__tests__/publishedCampaign.test.ts  |  2 +-
 .../authoring/__tests__/paletteWorld1316.test.ts     | 20 ++++++++++----------
 .../levels/authoring/__tests__/paletteWorld6.test.ts |  2 +-
 .../authoring/__tests__/paletteWorld78.test.ts       | 12 ++++++------
 .../authoring/__tests__/paletteWorld912.test.ts      | 12 ++++++------
 src/game/levels/campaign.ts                          |  8 ++++++--
 src/game/levels/levels.ts                            | 10 +++++++++-
 src/game/rendering/__tests__/colorAssist.test.ts     | 11 ++++++-----
 src/game/studio/grid.ts                              |  7 +++++--
 src/theme/__tests__/worldSkins.test.ts               |  1 +
 src/theme/colorAssist.ts                             |  9 ++++++---
 src/theme/colors.ts                                  | 12 +++++++++++-
 src/theme/worldSkins.ts                              |  6 +++++-
 17 files changed, 87 insertions(+), 46 deletions(-)
```

Git does not include untracked files in that command. The 15 new files below are also part of this import, giving 32 changed/new files in total:

```text
content/levels/world-17.json | new (5476 lines)
content/levels/world-18.json | new (5348 lines)
content/levels/world-19.json | new (5125 lines)
content/levels/world-20.json | new (5600 lines)
content/palettes/world-17-palette-extension.json | new (17 lines)
content/palettes/world-18-palette-extension.json | new (106 lines)
content/palettes/world-19-palette-extension.json | new (79 lines)
content/palettes/world-20-palette-extension.json | new (74 lines)
docs/M15C3_IMPORT_REPORT.md | new (75 lines before this stat block)
src/game/levels/__tests__/campaignV2World1720.test.ts | new (176 lines)
src/game/levels/authoring/__tests__/paletteWorld1720.test.ts | new (142 lines)
src/game/levels/compiledWorld17.ts | new (5481 lines)
src/game/levels/compiledWorld18.ts | new (5353 lines)
src/game/levels/compiledWorld19.ts | new (5132 lines)
src/game/levels/compiledWorld20.ts | new (5601 lines)
```
