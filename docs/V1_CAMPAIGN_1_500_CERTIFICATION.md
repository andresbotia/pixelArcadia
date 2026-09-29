# Pixel Arcadia v1 — 1–500 content certification

**CONTENT COMPLETE** for authoring and exact gameplay certification. This is not production launch approval.

| Check | Result |
|---|---|
| Active registry | **PASS** — 500 unique, contiguous IDs (1–500), 50 worlds, no gaps or duplicates |
| Source versus compiled | **PASS** — 500/500 exact definition matches, no invalid legacy replacement |
| Witness-aware validation | **PASS** — 500/500 stored exact production witnesses replay |
| Structural validation | **PASS** — 500/500 coreV2, three tunnels, ≤48×48, valid color IDs |
| Capacity totals | **PASS** — 500/500 exact per-color totals |
| Permanent palette | **44** colors |
| Published ceiling | **50** (`PUBLISHED_MAX_LEVEL` unchanged) |
| Campaign version | **v2-50** (unchanged) |

World 50 contributes ten exact clean wins, no real visual defects, and a default bounded-solver win for Level 500. The default solver was inconclusive at 491, 492, 493, and 496; those levels are witness-proven. The World 50 phone review found two minor presentation issues: 494 lower shadow breadth and 498 lower base cuts. The Level 500 fairness audit has eight unresolved single alternatives and one unresolved double alternative after targeted recovery; its unknown=0 preference remains open. A suspicious capacity-2 cerulean Pal remains documented at 493. These are explicit review items, not failed stored witnesses or structural errors.

Known **art-only publication blockers remain**: **186 — Drone Swarm** reads as smoke streaks, and **242 — Titan’s Return** reads as a mushroom. They were not changed in M16G. The campaign must stay development-only above Level 50 until the later release cleanup and production QA.

Certification used `scripts/m16g-certify.ts` to validate and replay all 500 stored witnesses without solving all 500. The machine result recorded 500 source definitions, 500 compiled definitions, 500 source matches, 500 structure passes, 500 witness passes, 500 capacity-total passes, and zero failures. World 50 authoring and deeper fairness evidence live in `docs/M16G_LEVELS_491_500_AUTHORING_REPORT.md` and `docs/audits/M16G_LEVELS_491_500_CERTIFICATES.json`.

Targeted validation passed **21 Jest suites / 879 tests**, TypeScript, ESLint on touched TypeScript, Python compilation, certificate schema, and whitespace checks. Rendering code was not changed; phone-scale production captures passed at 2×/3× with Color Assist off/on and zero console errors. The working tree remains uncommitted.
