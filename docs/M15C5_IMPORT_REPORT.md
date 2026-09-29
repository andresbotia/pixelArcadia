# M15C.5 — World 25 import

Imported Arcadia Ascendant, Levels 241–250, on `milestone/1-core-prototype` from clean HEAD `9734841`. All authored content remains unchanged and unpublished. No branch, commit, or push was created.

1. **Stable handoff:** Used only `/Users/andres/Desktop/pixel-arcadia-import-ready-241-250/`. The two copied source files are byte-identical to its vetted files. Reviewed the import, visual, difficulty, small-Pal, and Level 250 deep-review certificates plus the advisory reference patch. No original Desktop authoring packet was used.
2. **Replacement metadata:** Retained **`replacesLegacy=false`** in the World 25 packet and all ten imported runtime definitions. There is no legacy replacement above 100. Full structural validation finds no invalid replacement relationship.
3. **Source/compiled files:** Added `content/levels/world-25.json`, `content/palettes/world-25-palette-extension.json`, and `src/game/levels/compiledWorld25.ts`. Generated the module through the normal compiler with structural validation and no bypass. Registered it after W24, set the remaining overlay filter to `id > 250`, and added campaign/world skin `arcadia-ascendant` (subtitle “Beyond every world”; accents `#F0C24B` / `#B9A6FF`, high `arcaneParticles`).
4. **Palette:** Remains **41 gameplay colors**, with no palette, glyph, Studio mapping, or engine-rule edits. All World 25 pixel colors and all 14 `requiredColorIds` exist in `ORB_COLOR_IDS`; every referenced extension file exists. Per-board minimal-detail marks remain distinct and used colors have fill/rim/Studio/assist tokens. The packet’s `requiresPaletteExtension=true` describes using earlier extensions; the palette file’s `false` describes adding no colors. Both authored values are preserved.
5. **Exact witnesses:** **10/10 PASS** after actual import. All exact actions are T/H-only, legal, accepted, and productive; zero rejected, illegal, item, or zero-hit actions. Every final state is won with zero remaining pixels, Holding, pending Holding, and tunnel queues; peak pending is zero. Per-color capacities equal target pixel totals. Grids, queues, capacities, witnesses, labels, and metadata were not reauthored or regenerated.
6. **Default bounded solver:** **7 PASS / 3 INCONCLUSIVE**, matching the handoff. PASS: **242, 243, 244, 245, 246, 249, 250**. INCONCLUSIVE: **241, 247, 248**. All ten are witness-proven. Default limits remain **100,000 nodes / 30 seconds**. CLI completed in 129.3 seconds: 10 passed, 0 failed, 0 warnings in its summary; slow-search/inconclusive diagnostics remain in the log.
7. **Occupancy:** Actual runtime pixel counts and percentages match every expected value. High occupancy is intentional; no pixels were removed. Mean is 2292 pixels (99.48%); all ten ≥98%, nine ≥99%, six ≥99.5%.

    | Level | Pixels | Occupancy |
    | --- | --- | --- |
    | 241 | 2282 | 99.05% |
    | 242 | 2286 | 99.22% |
    | 243 | 2290 | 99.39% |
    | 244 | 2294 | 99.57% |
    | 245 | 2268 | 98.44% |
    | 246 | 2300 | 99.83% |
    | 247 | 2300 | 99.83% |
    | 248 | 2300 | 99.83% |
    | 249 | 2300 | 99.83% |
    | 250 | 2300 | 99.83% |

8. **Tiny Pals:** All **17** capacity 1–2 Pals preserved. Vetted audit: **14 NECESSARY / 0 MERGEABLE / 3 SUSPICIOUS**. The suspicious Level 242 Tunnel 3 cleanup tail, queue positions 30–32 (gold 1, cerulean 1, cyan 1), remains intact. Exact source equality and runtime replay confirm preservation; classifications come from the vetted audit. No merges applied.
9. **Level 241 — MINOR:** The full-width white row around row 31 breaks both frame sides. It still reads as a horizon band at phone-like scale. Imported unchanged; confirm intended art during later polish.
10. **Level 242 — REAL DEFECT: BLOCK BEFORE PUBLISHING LEVEL 242.** Titan’s Return still reads as a giant mushroom; the intended titan remains unidentifiable at phone-like scale with assist OFF/ON. Imported unchanged as instructed. M15D should make the focused art change and recertify queue/witness behavior if geometry changes. No repaint, retitle, or queue change during this import.
11. **Level 245 breather:** Garden of Rest retains **peak Holding 2, zero Holding-3 states, 5 strategic bridges, 110 actions, and 10 relaunches**, the fewest in W25 (all peers have 13–29). Cleanup relaunches remain 2. Witness and bridge counts are below W25’s non-breather means. No adjacent-Pal-count rule: its 100 Pals exceed the non-breather mean 97.8; relief comes from Holding/bridge/relaunch pressure.
12. **Level 250 exact metrics:** Arcadia Eternal retains **2300 pixels, 21 colors, 104 Pals, 133 witness actions, 29 relaunches, 9 strategic bridges, peak Holding 3, and 3 cleanup relaunches**. These core metrics were independently checked during exact runtime replay. Grids/queues/witnesses and the level-array checksum remain exact. No strict monotonic or “hardest by every metric” assertion.
13. **Level 250 visuals:** **PASS.** Its ivory palace, cyan windows, gold dome/spire, floating island, and framed sky retain a clear phone-scale identity and successful campaign culmination. Large flat values supply negative space despite 99.83% occupancy. Inspected every imported board with assist OFF and ON at **2× and 3×**: **8 PASS / 1 MINOR (241) / 1 REAL DEFECT (242)**, matching the handoff. Four ten-board sheets load without browser errors. The console contains existing Skia path API deprecation warnings. Review uses actual production `StaticPixelField`, geometry, materials, reachability, and Skia CanvasKit in the browser; this is not a native-device gameplay/animation test.
14. **Level 250 gameplay:** **ACCEPTABLE**, retaining the approved fair, rich world finale without artificial hardening. The 246–249 plateau and 250 world peak are accepted; 250 need not exceed earlier capstones. Prior deep-analysis findings are carried forward, not rerun: **389/389 single deviations recoverable, 0 fatal/unknown; 799 targeted doubles with 18 fatal/0 unknown; 1358 spaced pairs with 84 fatal/0 unknown**. Fatal pairs center on visible skipped Holding relaunch windows. All four original authoring bots lose on 250, while Holding-first greedy wins W25 including 250; that approved playtest flag does not trigger queue tuning. Fairness/bot assessments here are the vetted baseline; import parity and exact replay show no behavior change.
15. **Full 1–250 registry:** **PASS.** All 250 source definitions exactly match active runtime definitions after loader normalization; IDs are exactly 1–250 with no gaps or duplicates. All 25 world modules are registered through the active index and grouped correctly in the manifest. Every level loads, validates structurally, and has a valid replacement relationship. Full witness-aware CLI with optional solver diagnostics disabled: **250 passed / 0 failed / 0 warnings**, 5.2 seconds. No broad exhaustive solver run.
16. **Publication:** Remains **`PUBLISHED_MAX_LEVEL=50`, `CAMPAIGN_VERSION='v2-50'`**. Publishing code is unchanged. Normal campaign blocks 241–250 (and all 51–250); dev index exposes all ten with correct theme/world/title/witness metadata. No levels published.
17. **Tests/results:** **20 targeted suites / 656 tests PASS**, including **29 new tests**. Coverage includes W25’s ten seven-value certificates, exact replay/clean states/relaunch metrics, source checksum/parity, full source/index/replacement integrity, existing palette/token/assist distinctions, dev index, publication boundaries, campaign metadata, prior imports, world skins, witness-aware validation, and relevant Studio suites. No broad Jest run or huge fairness searches. W25 witness-only CLI separately reports 10 passed / 0 failed / 0 warnings; full campaign witness-only CLI reports 250/250.
18. **TypeScript:** `npx tsc --noEmit` PASS.
19. **ESLint/whitespace:** ESLint PASS for all **13 touched/new TypeScript files**. `git diff --check` and new-file whitespace checks PASS. No engine/rendering algorithm changes; existing direct palette lookups, one-pass grouping, and cached render paths remain unchanged.
20. **Git diff:** Recorded below. Same branch and HEAD; nothing staged, committed, or pushed. Local browser harness, screenshots, and logs remain ignored under `dist/m15c5-review/`.

## Commands and local evidence

- `npx tsx scripts/levels.ts compile --file content/levels/world-25.json --target src/game/levels/compiledWorld25.ts`.
- `npx tsx scripts/levels.ts validate --from 241 --to 250` (default bounded diagnostics).
- `npx tsx scripts/levels.ts validate --from 241 --to 250 --witness-only`.
- `npx tsx scripts/levels.ts validate --from 1 --to 250 --witness-only --force`.
- `npx jest --runInBand --runTestsByPath` with the 20 explicit suites listed in `dist/m15c5-review/tests.log`.
- `npx tsc --noEmit`; `npx eslint` with the 13 changed/new TS files; `git diff --check`.
- `dist/m15c5-review/world25-{off,on}-{2,3}x.png`: four production ten-board sheets.
- `dist/m15c5-review/review-results.json`, `solver-results.json`, `occupancy-metrics.json`, and validation/check logs.
- Original run logs: `/tmp/pixel-m15c5-{tests,validator,witness-only,full-registry,tsc,eslint,capture}.log`.

## Git diff stat

Tracked edits (`git diff --stat`; Git excludes untracked files):

```text
 src/game/levels/__tests__/campaignMetadata.test.ts    | 9 +++++----
 src/game/levels/__tests__/campaignV2World1316.test.ts | 2 +-
 src/game/levels/__tests__/campaignV2World1720.test.ts | 2 +-
 src/game/levels/__tests__/campaignV2World2124.test.ts | 2 +-
 src/game/levels/__tests__/campaignV2World912.test.ts  | 2 +-
 src/game/levels/__tests__/publishedCampaign.test.ts   | 2 +-
 src/game/levels/campaign.ts                           | 3 ++-
 src/game/levels/levels.ts                             | 4 +++-
 src/theme/__tests__/worldSkins.test.ts                | 1 +
 src/theme/worldSkins.ts                               | 1 +
 10 files changed, 17 insertions(+), 11 deletions(-)
```

Six new files (16 changed/new files total):

- `content/levels/world-25.json`
- `content/palettes/world-25-palette-extension.json`
- `docs/M15C5_IMPORT_REPORT.md`
- `src/game/levels/__tests__/campaignV2World25.test.ts`
- `src/game/levels/authoring/__tests__/paletteWorld25.test.ts`
- `src/game/levels/compiledWorld25.ts`

