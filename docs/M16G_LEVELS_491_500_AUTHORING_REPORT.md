# M16G — World 50 production authoring (491–500)

World 50, **Arcadia Nexus**, is authored in `content/levels/world-50.json` and compiled into `src/game/levels/compiledWorld50.ts`. All ten levels use coreV2, 48×48 art, three tunnels, active capacity 5, Holding capacity 3, and exact productive production-engine witnesses. No engine, palette, or publication constant changed.

| Level | Title | Pixels | Fill | Colors | Pals | Witness | Relaunches | Bridges | Peak Holding | Small Pals | Solver | Visual |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 491 | Seams of Gold | 2215 | 96.1% | 17 | 93 | 120 | 27 | 12 | 3 | 2 | INCONCLUSIVE | PASS |
| 492 | The Bridge of Every World | 2205 | 95.7% | 18 | 81 | 111 | 30 | 13 | 3 | 6 | INCONCLUSIVE | PASS |
| 493 | The Tree of Districts | 2225 | 96.6% | 18 | 96 | 136 | 40 | 15 | 3 | 2 | INCONCLUSIVE | PASS |
| 494 | The Great Realigner | 2195 | 95.3% | 18 | 94 | 118 | 24 | 7 | 3 | 11 | PASS | MINOR |
| 495 | Homeward Harbour | 2125 | 92.2% | 15 | 78 | 90 | 12 | 6 | 2 | 5 | PASS | PASS |
| 496 | The Confluence of Worlds | 2205 | 95.7% | 19 | 103 | 137 | 34 | 12 | 3 | 4 | INCONCLUSIVE | PASS |
| 497 | The Terraced Nexus | 2250 | 97.7% | 19 | 98 | 136 | 38 | 11 | 3 | 3 | PASS | PASS |
| 498 | The Docking of Continents | 2215 | 96.1% | 19 | 108 | 143 | 35 | 5 | 3 | 5 | PASS | MINOR |
| 499 | Threshold of the Nexus | 2260 | 98.1% | 19 | 91 | 123 | 32 | 10 | 3 | 2 | PASS | PASS |
| 500 | The Arcadia Nexus | 2285 | 99.2% | 20 | 101 | 145 | 44 | 15 | 3 | 0 | PASS | PASS |

Average: **2218 pixels**, **96.27% fill**. Total **943 Pals** (range 78–108); witnesses range 90–145 actions. Every witness ended with a win, zero pixels, empty tunnels/Holding/pending, zero rejected actions, zero zero-hit actions, and zero items. The default bounded solver passed six levels and was inconclusive at **491, 492, 493, 496**; their exact witnesses establish solvability without changing global search limits.

## Route quality

A total of **208 safe same-color merges** were applied and replayed (182 within tunnels, 26 across tunnels). The remaining **40 capacity-1/2 Pals** were probed at their witness windows: 39 are locally **NECESSARY**. One at **493, tunnel 2, position 6, cerulean capacity 2, witness step 21** is **SUSPICIOUS** because a full-color probe exposes 13 targets; tested same-color merges failed productive replay. It is retained and visible in the machine certificate. There are no small Pals in 500 and no small-Pal cleanup run there.

**495 — Homeward Harbour** remains the relative breather: one ship and one connected harbor, 2,125 pixels, a 90-action route, Holding peak 2, no Holding-full states, and six bridges. Its route and pressure are below the adjacent levels.

**498–499** build from six docked continental masses into a framed gate approach. The 498 route has five bridges and peak Holding 3; the 499 gate has ten bridges and peak Holding 3. Their visual and route interaction, rather than monotonic numeric difficulty, carries the escalation. Nine sampled alternative actions were reviewed on each: 498 had six recoveries, two immediate losses, and one inconclusive diagnostic; all nine on 499 recovered.

## Level 500 — The Arcadia Nexus

Final art preserves the approved giant A: two causeways meet at a haloed white spire, a gold crossbar spans the light core, a city and blue river fill the lower interior, and four islands dock to the legs. Night stays on the left and dawn on the right. The crystal island underside uses **stone**, as the production correction requires. The board has **2,285 pixels (99.18%)**, **20 substantial colors** (minimum population 25), and **19 true void cells** confined to dark arch cuts. Gold/yellow, sand/ivory, and mauve/rose adjacency counts are all zero; bronze and magenta are absent.

Its certified route uses **101 Pals, 145 actions, 44 relaunches, 15 delayed-value bridges, Holding peak 3**, and no 1–2 capacity Pals. The route exceeds the preferred 115–135 band by ten actions; all actions are productive, and the broad 20-color, multi-bridge geometry accounts for the longer known clean route. The default bounded solver **PASS** independently found a win.

Deep fairness tested **553 single alternatives**: 527 recoverable, 18 immediate fatal, 8 unresolved after extended targeted recovery. The fatal singles occur only at steps 15, 61–62, 116, 122, and 124, where Holding is visibly full and one Pal is already pending; a further tunnel launch causes terminal overflow. The unknown=0 target remains unmet. **28 targeted two-action deviations** yielded 22 recoverable, 5 immediate fatal, and 1 unresolved. The unresolved cases and action IDs are preserved in the certificate; no unsupported fatal verdict was assigned.

Bots: round-robin **lost**, greedy **lost**, drain **lost**, noWaste **lost**, and productive-Holding-first **lost**. The capstone is not solved comfortably by these simple policies.

## Production visual review

All ten boards were rendered with the production `StaticPixelField` at phone scale at 2× and 3×, with Color Assist off and on. All 40 canvases loaded with no console errors. The final 500 was also reviewed as original 48×48 pixels, 16×16 and 8×8 majority thumbnails, and grayscale. Its A, crossbar, core, island bridges, river, and lighting split remain readable in each review. **PASS 8 · MINOR 2 · REAL DEFECT 0.**

- **494 MINOR:** the dark lower mechanical shadow is broad at phone size; the radial realignment and central light remain legible.
- **498 MINOR:** the lower continental shadow cuts leave small separated base segments; six masses and their gold docking paths remain clear.

Compared with earlier milestone finales, 250 is a floating palace, 300 a god figure, 350 an S-shaped journey, 400 a folded landscape, and 450 a nested interior. Level 500 is a frontal, world-scale **A of joined roads and bridges** with a light core. It echoes their scale and palette without reusing those silhouettes.

Visual artifacts in the local workspace: `dist/m16g/world50-{off,on}-{2,3}x.png`, `world50-gray-2x.png`, `capstone-{48,16,8}.png`, and `visual.json`. They are reproducible through `dist/m16g/build.cjs`, `dist/m16g/capture.py`, and `scripts/m16g-visual.py`. Full metrics, small-Pal probes, deviations, bots, and solver results are in `docs/audits/M16G_LEVELS_491_500_CERTIFICATES.json`.

## Final checks

The final source and compiled registry passed 500/500 witness-aware validations and exact capacity checks. Targeted Jest coverage passed **21 suites / 879 tests** (campaign, metadata, publication, palette, Color Assist, and Studio campaign). `npx tsc --noEmit`, ESLint on touched TypeScript, Python compilation, certificate schema, and `git diff --check` passed. The renderer architecture and permanent palette are unchanged; the production 2×/3× browser captures loaded ten canvases per mode with zero console errors. `git diff --stat` for tracked files shows 18 files, 49 insertions, and 44 deletions; the 12 new source, report, and certificate files appear separately as untracked. No files were staged or committed.
