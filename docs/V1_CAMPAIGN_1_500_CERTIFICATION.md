# Pixel Arcadia v1 — 1–500 content certification

**CAMPAIGN CONTENT CLEAN** after M17A. This certifies authored content and exact production gameplay; it is not App Store launch approval. Levels above 50 remain development-only pending real-device and release QA.

| Check | Result |
|---|---|
| Active registry | **PASS** — 500 unique, contiguous IDs (1–500), 50 worlds, no gaps or duplicates |
| Source versus compiled | **PASS** — 500/500 exact definition matches |
| Witness-aware validation | **PASS** — 500/500 stored exact production witnesses replay to clean wins |
| Structural validation | **PASS** — 500/500 coreV2, three tunnels, ≤48×48, valid color IDs |
| Capacity totals | **PASS** — 500/500 exact per-color totals |
| Permanent palette | **44** colors |
| Published ceiling | **50** (`PUBLISHED_MAX_LEVEL` unchanged) |
| Campaign version | **v2-50** (unchanged) |

M17A repaired the two known art blockers: Level 186 now reads as a drone swarm and Level 242 as a humanoid titan at phone-size production rendering. Level 242's old late one-tap cleanup was removed or safely merged. Level 500's eight unresolved single alternatives and one unresolved double alternative all have exact clean recovery witnesses; the final fairness totals are **535 recoverable / 18 fatal / 0 unknown** singles and **23 recoverable / 5 fatal / 0 unknown** targeted doubles. Level 500 retains its 145-action witness and passes the default bounded solver.

Certification used `scripts/m17a-certify.ts` to validate and replay all 500 stored witnesses without solving all 500. Its machine result records 500 source definitions, 500 compiled definitions, 500 source matches, 500 structure passes, 500 witness passes, 500 capacity-total passes, and zero failures. The per-case Level 500 recovery routes are replayed by `scripts/m17a-fairness.ts`. See [M17A cleanup report](M17A_CAMPAIGN_RELEASE_CLEANUP_REPORT.md) and [machine certificate](audits/M17A_CAMPAIGN_RELEASE_CLEANUP_CERTIFICATES.json).

Six targeted Jest suites passed (183 tests), plus TypeScript, ESLint on touched/new TypeScript, Python compilation, and whitespace checks. Level 186's default solver was inconclusive at its normal node cap; its exact stored witness passes. Level 242 and 500 pass the default solver. Browser production-renderer captures passed for the repaired boards and the 44 assist marks at 2×/3× without console errors. Physical-device QA remains to be done. The working tree remains uncommitted.
