# Pixel Arcadia M17A — campaign release cleanup

**Status: CAMPAIGN CONTENT CLEAN.** This is a content and exact-gameplay result, not App Store launch approval. The published ceiling remains 50 and the campaign version remains `v2-50`; levels 51–500 stay development-only pending real-device and release QA. No engine gameplay, Holding, renderer architecture, palette membership, or Level 500 content changed.

## P0 repairs

| Level | Visual repair and phone result | Changed cells | Pixels / colors | Pals, old → new | Winning witness, old → new | Default solver |
|---|---|---:|---|---:|---:|---|
| 186 — Drone Swarm | Replaced narrow smoke-like sky streaks with three separated quadcopter silhouettes, cyan rotors, visible bodies/cockpits, and restrained warm lights above the existing neon skyline. **PASS** at 2×/3× production board size, assist on/off. | 324 | 2254 / 16 | 70 → 75 | 89 → 85 | INCONCLUSIVE at normal 100,000-node cap; exact clean witness PASS |
| 242 — Titan's Return | Replaced the mushroom cap/stalk with a horned head, separated neck and torso, broad shoulders/arms, fists, and split legs against the original dusk/forest context. **PASS** at 2×/3× production board size, assist on/off. | 789 | 2286 / 21 | 99 → 93 | 119 → 106 | PASS, 6,947 nodes; exact clean witness PASS |

Both altered boards had capacities recalculated, queues rebuilt, and new exact production witnesses authored. Structural validation, per-color capacity totals, and zero-pixel/empty-Holding/empty-tunnel/zero-pending endings pass. Level 242's three former one-tap charges near the end of Tunnel 3 disappeared in the reauthor. The newly generated final sand 24+1 pair was safely merged into sand 25 after a production replay proved the 106-step route still wins exactly. Other small Pals in the new queues are geometry-specific and were retained.

## Level 500 fairness closure

All nine previously unknown branches are **RECOVERABLE** with stored, productive production-engine recovery witnesses: single deviations at steps 18, 19, 20, 21, 22 (early white Pal), 29 and 30 (stone Pal), and 30 (other stone Pal), plus the step-18 white/white double deviation. Every route ends with zero pixels, empty Holding and tunnels, zero pending arrivals, and zero rejected moves. The original 145-action capstone witness, 101 Pals, 2285 pixels, and 20 colors remain; the default solver still passes. The extra ten witness actions over the preferred ~135 reflect meaningful bridge/relaunch and cleanup sequencing. No safe simplification justified changing the proven capstone solely for length. Its visual review is **PASS**.

| Alternatives | Tested | Recoverable | Fatal | Unknown |
|---|---:|---:|---:|---:|
| Single | 553 | 535 | 18 | **0** |
| Targeted double | 28 | 23 | 5 | **0** |

The pre-existing 18 fatal single deviations are visible full-Holding/pending-arrival mistakes documented in M16G. None of the nine newly resolved cases is fatal, so no content adjustment was warranted. The complete action-by-action recovery routes are in `audits/M17A_LEVEL500_RECOVERY_WITNESSES.json`; `scripts/m17a-fairness.ts` replays them.

## P1 visual review

The 27-level shortlist was checked from source pixels at enlarged scale. The priority items with weak identification remain minor presentation debt because a convincing improvement would require substantial pixel and queue/witness reauthoring without a confirmed publication blocker. They are queued for real-device review rather than speculative churn.

| Level | Outcome | Reason |
|---:|---|---|
| 125 | DEFERRED | Pale subject is soft but the scene still reads; stronger foreground needs reauthoring. |
| 128 | DEFERRED | Bright central silhouette competes with rainbow; no safe small pixel correction. |
| 130 | DEFERRED | Finale color bands are busy; broad recomposition needed for material gain. |
| 150 | NO CHANGE | Framed finale and central tower remain legible. |
| 170 | DEFERRED | Dominant subject is weak; meaningful silhouette change is broad. |
| 180 | NO CHANGE | Thin light detail reads as a deliberate central beam at board size. |
| 185 | DEFERRED | Abstract subject needs more than local pixel polish. |
| 210 | DEFERRED | Titan-like silhouette is softer than 242, but not a mistaken mushroom; device check retained. |
| 230 | DEFERRED | Facade/crown definition is flat; meaningful depth requires recomposition. |
| 241 | NO CHANGE | Row 31 is exactly 48 white pixels and reads as a continuous dawn flare/horizon across the foreground. Kept as intentional; confirm on device. |
| 269 | NO CHANGE | Green canopy and branch hierarchy read. |
| 272 | NO CHANGE | Hall perspective and light focal point read. |
| 280 | NO CHANGE | Foreground flame and backdrop remain distinct. |
| 293 | NO CHANGE | Circular subject reads within the scene. |
| 304 | NO CHANGE | Elephant silhouette remains clear. |
| 348 | NO CHANGE | Bright subject separates from vertical forest forms. |
| 357 | NO CHANGE | Mechanical round form remains legible. |
| 383 | NO CHANGE | Dark center has a deliberate bright rim. |
| 387 | NO CHANGE | Central eye/portal contrast reads. |
| 403 | NO CHANGE | Cyan ring and black center read. |
| 415 | NO CHANGE | Castle and foreground retain separation. |
| 424 | NO CHANGE | Circular focal point is clear. |
| 426 | NO CHANGE | Waterfall and ledge are legible. |
| 430 | NO CHANGE | Symmetric hanging structure reads. |
| 440 | NO CHANGE | Layered facade remains coherent. |
| 494 | DEFERRED | Lower shadow breadth is minor, not a blocker. |
| 498 | DEFERRED | Lower base cuts are minor, not a blocker. |

No P1 level was polished; only the two P0 visual blockers were repainted.

## Metadata and Color Assist

Difficulty-only changes: 159, 178, 216, and 219 moved from **extreme → super-hard** because their relative Pal/bridge/route pressure is softer than neighboring extreme levels. Their art, queues, and witnesses are unchanged. Levels 189 and 240 remain **extreme** (189 has ten meaningful bridges; 240 is a long finale with 134 actions). Level 196 remains **super-hard**; its softer route does not require a metadata change.

Umber's old ring-cross filled its interior at minimum detail. It is now a slashed ring (one shortened diagonal), distinct from garnet's horizontal theta, silver's full-width orbit bar, and the other 41 marks. RN and Skia consume the same shared mark model. All 44 marks were rendered in the production web paths in batches at 2× and 3×, with no missing glyphs or console errors; the 44 minimum-detail signatures remain unique. Umber fill and all palette color IDs are unchanged. Real-device confirmation remains on the watchlist.

## Certification and validation

Full 1–500 witness-aware certification passed: 500 unique contiguous IDs, 500 source/compiled matches, 500 structures, 500 exact capacity totals, and 500 clean production witnesses; palette count is 44. The full pass intentionally did not solve all 500. Default bounded solver results for changed gameplay boards: 186 **INCONCLUSIVE**, 242 **PASS**; Level 500 **PASS**. The inconclusive 186 search is a cap result, while its stored exact production witness passes. Six targeted Jest suites passed (183 tests), as did TypeScript, ESLint on touched/new TypeScript, Python compilation, and `git diff --check`. Production web rendering at 2×/3× showed no browser errors. No physical device test was available; see [real-device QA watchlist](M17A_REAL_DEVICE_QA_WATCHLIST.md).

The machine summary is [M17A campaign certificates](audits/M17A_CAMPAIGN_RELEASE_CLEANUP_CERTIFICATES.json); the Level 500 per-case machine evidence is [M17A fairness certificate](audits/M17A_LEVEL500_FAIRNESS_CERTIFICATE.json). Known real content defects after cleanup: **0**. No commit or push was made.

`git diff --stat` at completion: 17 tracked files, 929 insertions and 960 deletions (mostly regenerated level JSON/TypeScript), plus eight new report, certificate, script, and regression-test files. The five edited source worlds are 16, 18, 19, 22, and 25; no Level 500 source file changed.
