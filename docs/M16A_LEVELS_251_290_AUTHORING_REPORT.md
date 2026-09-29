# M16A — Production authoring, Levels 251–290

Authored Desert Kingdoms, Deep Jungle, Underworld and Ocean Cities on `milestone/1-core-prototype`. Exactly forty new active definitions; `replacesLegacy=false`. Levels 291+ are absent. No commit or push. The v1 launch target remains 500; this milestone adds DEV-ONLY content.

## Certification and publication

**40/40 structural PASS; 40/40 exact production witness PASS.** Every written action is accepted, productive and T/H-only. Every final state is won, with pixels=0, Holding=0, tunnel queues=0, pending=0, rejected=0 and items=0. Per-colour capacities exactly equal the authored pixel budgets. All boards are 48×48, all have three tunnels, Active capacity 5 and Holding capacity 3.

Production engine files are unchanged. Launch/relaunch resolves one perimeter pass through the actual engine, front-visible blocking and encounter/bin rules. Transient pending survivors use the existing GateTerminal grace window; merged witnesses can have pending=1 during play. Pending consumes its existing Active slot and receives no early Holding reservation. The final pending count is always zero. Testing deliberately permits this valid transient state.

**Default bounded solver: 29 PASS / 11 INCONCLUSIVE.** Limits stayed at 100,000 nodes and 30 seconds, with no extended-cap validation. INCONCLUSIVE IDs: **251, 259, 260, 262, 266, 267, 270, 274, 278, 282, 288**. These levels remain constructively proven. All changed queues were rerun after their final merges. Nodes, durations and cap flags are in the evidence JSON.

**Registry: 290/290 PASS.** Every source packet normalizes to its active definition, IDs are exactly 1–290 without gaps/duplicates, and all source definitions validate with witness evidence. Worlds 26–29 compile through the existing compiler into separate `compiledWorld26.ts`–`compiledWorld29.ts` modules and register after W25. The remaining overlay filters `id > 290`. World manifests and skins carry the approved world names.

**Publication unchanged:** `PUBLISHED_MAX_LEVEL=50`; `CAMPAIGN_VERSION='v2-50'`. Campaign mode blocks all forty levels; dev lookup/index exposes them with worlds, titles, palettes and witnesses. No gameplay palette extension record is needed. The runtime palette remains **41 colours**; terracotta, petrol and silver are absent.

## World totals

Occupancy uses all 2304 board cells. Pal ranges count initial queue Pals. Bridges below are strategic capacity bridges: first-pass hits ≥6, a later pass ≥6, and at least three action positions of delay from the first launch. They are the same measurable definition used by the World 25 certificate; they are separate from an illustration’s physical bridge count.

| World | Mean pixels | Mean occupancy | Colours | Pal total / range | Witness range | Relaunch range | Strategic bridge range | Peak Holding | Small Pals | Solver P / I | Visual P / M / D |
| --- | ---: | ---: | --- | --- | --- | --- | --- | --- | ---: | --- | --- |
| 26 | 2158.1 | 93.67% | 13–19 | 834 / 75–100 | 94–132 | 17–32 | 8–19 | 2–3 | 28 | 7 / 3 | 10 / 0 / 0 |
| 27 | 2167.1 | 94.06% | 13–20 | 867 / 70–101 | 81–120 | 11–35 | 4–20 | 2–3 | 24 | 6 / 4 | 9 / 1 / 0 |
| 28 | 2180.1 | 94.62% | 12–17 | 761 / 60–106 | 79–129 | 18–28 | 5–15 | 2–3 | 27 | 8 / 2 | 8 / 2 / 0 |
| 29 | 2161.0 | 93.79% | 13–18 | 907 / 66–120 | 81–135 | 14–31 | 6–16 | 2–3 | 29 | 8 / 2 | 10 / 0 / 0 |

Density is intentionally below Worlds 21–25. The final world means are close to the approved ~2162 / ~2169 / ~2180 / ~2173 targets. No board was filled to a target-centre count. The minimum is 2087 pixels and maximum 2254; the block does not contain a 2280+ density train.

## Per-level production certificate

| Level / locked title | Dimensions | Pixels | Occupancy | Colours | Pals | Witness | Relaunches | Bridges | Peak Holding | Small Pals | Solver | Visual |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 251 — Salt Road Caravan | 48×48 | 2151 | 93.36% | 14 | 81 | 101 | 20 | 11 | 3 | 4 | INCONCLUSIVE | PASS |
| 252 — Buried Gate | 48×48 | 2121 | 92.06% | 15 | 75 | 94 | 19 | 11 | 3 | 6 | PASS | PASS |
| 253 — Mirage Palace | 48×48 | 2161 | 93.79% | 14 | 77 | 100 | 23 | 13 | 3 | 3 | PASS | PASS |
| 254 — Dune Strider | 48×48 | 2112 | 91.67% | 13 | 75 | 95 | 20 | 9 | 3 | 2 | PASS | PASS |
| 255 — Oasis Spring | 48×48 | 2102 | 91.23% | 14 | 90 | 107 | 17 | 8 | 2 | 4 | PASS | PASS |
| 256 — Sunward Ziggurat | 48×48 | 2170 | 94.18% | 14 | 76 | 102 | 26 | 11 | 3 | 1 | PASS | PASS |
| 257 — Keeper of the Pass | 48×48 | 2159 | 93.71% | 16 | 100 | 132 | 32 | 19 | 3 | 0 | PASS | PASS |
| 258 — The Haboob | 48×48 | 2208 | 95.83% | 16 | 89 | 121 | 32 | 15 | 3 | 2 | PASS | PASS |
| 259 — Rose-Cut Treasury | 48×48 | 2156 | 93.58% | 17 | 75 | 100 | 25 | 13 | 3 | 4 | INCONCLUSIVE | PASS |
| 260 — Canyon of Kings | 48×48 | 2241 | 97.27% | 19 | 96 | 125 | 29 | 19 | 3 | 2 | INCONCLUSIVE | PASS |
| 261 — Strangler Fig | 48×48 | 2160 | 93.75% | 15 | 77 | 98 | 21 | 16 | 3 | 2 | PASS | PASS |
| 262 — Three-Strand Falls | 48×48 | 2147 | 93.19% | 16 | 90 | 110 | 20 | 11 | 3 | 1 | INCONCLUSIVE | PASS |
| 263 — Shadow Jaguar | 48×48 | 2181 | 94.66% | 16 | 94 | 116 | 22 | 14 | 3 | 4 | PASS | PASS |
| 264 — Orchid Mantis | 48×48 | 2158 | 93.66% | 17 | 96 | 114 | 18 | 8 | 3 | 5 | PASS | PASS |
| 265 — Lily Pad Lagoon | 48×48 | 2093 | 90.84% | 13 | 70 | 81 | 11 | 4 | 2 | 0 | PASS | PASS |
| 266 — Fallen Idol | 48×48 | 2200 | 95.49% | 17 | 101 | 119 | 18 | 10 | 3 | 3 | INCONCLUSIVE | PASS |
| 267 — Nightflower | 48×48 | 2126 | 92.27% | 17 | 84 | 109 | 25 | 20 | 3 | 1 | INCONCLUSIVE | PASS |
| 268 — Ravine Crossing | 48×48 | 2116 | 91.84% | 17 | 73 | 95 | 22 | 14 | 3 | 1 | PASS | PASS |
| 269 — Emerald Constrictor | 48×48 | 2251 | 97.70% | 16 | 97 | 113 | 16 | 12 | 3 | 4 | PASS | MINOR |
| 270 — The Green Deep | 48×48 | 2239 | 97.18% | 20 | 85 | 120 | 35 | 13 | 3 | 3 | INCONCLUSIVE | PASS |
| 271 — Black River Ferryman | 48×48 | 2167 | 94.05% | 14 | 81 | 103 | 22 | 13 | 3 | 7 | PASS | PASS |
| 272 — Ribcage Road | 48×48 | 2160 | 93.75% | 13 | 60 | 79 | 19 | 13 | 3 | 5 | PASS | MINOR |
| 273 — Molten Braid | 48×48 | 2204 | 95.66% | 14 | 61 | 88 | 27 | 14 | 3 | 2 | PASS | PASS |
| 274 — The Chained One | 48×48 | 2181 | 94.66% | 14 | 80 | 103 | 23 | 14 | 3 | 0 | INCONCLUSIVE | PASS |
| 275 — The Long Descent | 48×48 | 2126 | 92.27% | 12 | 76 | 94 | 18 | 5 | 2 | 0 | PASS | PASS |
| 276 — Hanging Keep | 48×48 | 2150 | 93.32% | 14 | 67 | 92 | 25 | 13 | 3 | 3 | PASS | PASS |
| 277 — Court of Hoods | 48×48 | 2179 | 94.57% | 15 | 89 | 110 | 21 | 14 | 3 | 2 | PASS | PASS |
| 278 — Garnet Orchard | 48×48 | 2184 | 94.79% | 15 | 63 | 91 | 28 | 15 | 3 | 4 | INCONCLUSIVE | PASS |
| 279 — The Devouring Maw | 48×48 | 2196 | 95.31% | 16 | 78 | 103 | 25 | 14 | 3 | 0 | PASS | PASS |
| 280 — Kingdom Below | 48×48 | 2254 | 97.83% | 17 | 106 | 129 | 23 | 12 | 3 | 4 | PASS | MINOR |
| 281 — Dome District | 48×48 | 2149 | 93.27% | 16 | 89 | 114 | 25 | 13 | 3 | 3 | PASS | PASS |
| 282 — Kelp Spire | 48×48 | 2142 | 92.97% | 17 | 98 | 129 | 31 | 16 | 3 | 2 | INCONCLUSIVE | PASS |
| 283 — Reef Line | 48×48 | 2162 | 93.84% | 17 | 118 | 135 | 17 | 13 | 3 | 9 | PASS | PASS |
| 284 — Trench Station | 48×48 | 2087 | 90.58% | 17 | 81 | 107 | 26 | 14 | 3 | 2 | PASS | PASS |
| 285 — Coral Arch | 48×48 | 2098 | 91.06% | 13 | 66 | 81 | 15 | 6 | 2 | 0 | PASS | PASS |
| 286 — Sunken Colonnade | 48×48 | 2175 | 94.40% | 15 | 76 | 95 | 19 | 12 | 3 | 1 | PASS | PASS |
| 287 — Jellylight Market | 48×48 | 2193 | 95.18% | 17 | 120 | 134 | 14 | 9 | 3 | 3 | PASS | PASS |
| 288 — Nautilus Hall | 48×48 | 2183 | 94.75% | 17 | 88 | 114 | 26 | 14 | 3 | 3 | INCONCLUSIVE | PASS |
| 289 — Tidegate Viaduct | 48×48 | 2169 | 94.14% | 18 | 79 | 102 | 23 | 15 | 3 | 3 | PASS | PASS |
| 290 — The Waterline City | 48×48 | 2252 | 97.74% | 18 | 92 | 123 | 31 | 12 | 3 | 3 | PASS | PASS |

## Artwork, density and design decisions

Each board is a deterministic hand-drawn composition using integer raster primitives, authored individually in `scripts/m16a-art.py`. There is no random campaign generation. The final grids are serialized in the production JSON; no raster authoring or queue search runs in the app. Reference: the approved Desktop design package, including the campaign/world sheets, palette validation, variety/progression audits and readiness findings.

- **W26:** five caravan figures and long cast shadows; the buried arch crown; asymmetrical palace/mirage; long-legged beast and howdah; shaded pool/palms; seven ziggurat tiers and corner stair; seated guardian and winding pass; three broad dust bands; framed rose façade; two canyon walls and three arched crossings. The finale has exactly three illustrated bridge tiers, separate from its strategic Pal bridge metric.
- **W27:** true root-lattice holes around a pillar; unequal waterfall ribbons; diagonal cat/branch and grouped rosettes; outlined raised mantis forelegs among blooms; five lily pads and painted reflection; sideways idol sockets; offset luminous flower and three moths; sagging bridge; alternating snake/branch crossings; four strata with filled lime/yellow/ice shafts and a right-edge fall.
- **W28:** boat/figure/pole; seven receding rib pairs; restrained lava braid; back-facing chained figure and six anchors; diagonal descent and two pillars; downward keep towers; three distinct hooded judges; five petrified trees; interlocking jaw teeth; causeway, finger supports and nested keep. Fire stays localized. Red/orange/gold/yellow pixels in 273 and 280 were inspected as connected channels/glints rather than scattered background fill.
- **W29:** three closed dome rims and two tube links; tower/kelp weave; looping transit through coral heads; station, thin tether and trench; asymmetric coral arch/pavilion; receding columns and filled rays; three market rows and seven linked jelly lamps; shielded spiral rooms; different eight/five arch rhythms; readable waterline, crossing towers and three descending terraces.

**Void = dark only.** In 254, the inter-leg area is filled sky/far dunes and the dark upper band supplies void. In 262, cave/sliver darkness is void while mist and the upper light shaft are filled. In 270, all three shafts are filled and void belongs to understory/cavern pockets. Reflections in 265, canopy light in 266, rays in 286 and rays/waterline in 290 use actual pixels. The mantis head opening is interpreted as dark understory, consistent with the global void rule.

Final visual refinements made before certification: broad connected palm crowns in 255; narrower hood hollows in 277; more distinct receding rib paths in 272; six coherent market stalls across the three approved corridors in 287, with seven lamps retained; pale lavender domes in 253’s incomplete reflection. These retain the approved subjects and primary silhouettes. They reduce fragment noise or route burden. No approved world concept was redesigned.

**Small target-range exceptions:** 269 is 2251 vs its 2250 guide maximum; 270 is 2239 vs its 2240 guide minimum; 277 is 2179 vs 2200–2250; 284 is 2087 vs 2090–2140. Existing lattice openings, hood/throne separation and trench darkness were preserved. Ranges are guidance, so these areas were not filled merely to hit the numbers. 286 uses 15 colours vs the 16–18 guide: the column/ray hierarchy reads with its coherent existing subset, and an extra decorative colour was not added solely to meet a floor. All forty use approved world palette families.

## Breathers and finales

All four breathers retain peak Holding **2**, zero Holding-3 states, fewer strategic bridges, fewer relaunches and a shorter witness than their world’s other-level average. Each retains its visual subject. These are relative assertions; no brittle per-neighbour or monotonic progression rule was added.

| Breather | Pals | Actions | Relaunches | Bridges | Peak Holding |
| --- | ---: | ---: | ---: | ---: | ---: |
| 255 | 90 | 107 | 17 | 8 | 2 |
| 265 | 70 | 81 | 11 | 4 | 2 |
| 275 | 76 | 94 | 18 | 5 | 2 |
| 285 | 66 | 81 | 15 | 6 | 2 |

All finales retain peak Holding 3 and substantial delayed-value capacity use. The final routes are 125 / 120 / 129 / 123 actions. Their physical structures remain respectively canyon crossings, light shafts/strata, a causeway/finger-supported island, and waterline towers/transit terraces. They are not density or colour-count maxima by fiat.

**40 sampled finale deviations, 40 winning recoveries, 0 immediate losses, 0 remaining inconclusive recoveries.** Each finale has two alternative openings plus two samples in each of premature high-capacity launch, skipped productive Holding relaunch, bridge timing mistake and obvious route fork. These are deviations from the expert route at available, concrete front/held states. Recovery uses identity-aware rescheduling, production heuristic replay, then a local 2500-node / 2.5-second recovery search when needed. This recovery probe does not change campaign solver limits. The earlier unresolved alternate opening on 280 was recovered by the local probe.

No sampled single mistake was proven to force an unavoidable loss. Visible board fronts, remaining capacities and Holding pressure supply the clues. This is a targeted fairness sample, not exhaustive single-/double-deviation coverage. Every sample records its launch, capacity, immediate hits, Holding/pending state and recovery result in the certificate JSON.

## Small-Pal audit and every merge

Final capacity 1–2 inventory: **108 Pals: 107 NECESSARY / 0 remaining MERGEABLE / 1 SUSPICIOUS.** Necessary is a route-local geometric classification: the production engine, probed with the entire remaining budget of that colour at the recorded launch state, exposes at most two hits. This is not a proof that every possible alternate route needs that small Pal.

**517 accepted merge operations** (499 within tunnels, 18 across tunnels). Every pair has the same colour. Capacities were combined, the later Pal was removed, and subsequent slot actions were reconstructed by charge identity. All candidates use the unchanged grid. Accepted trials replay to clean wins with productive actions, and breathers cannot exceed Holding 2. Written-source replay is the final authority. Larger adjacent same-colour pairs were also checked where they safely reduced fragmentation.

**Every individual merge is documented** in [M16A_LEVELS_251_290_CERTIFICATES.json](audits/M16A_LEVELS_251_290_CERTIFICATES.json), `merges` and `crossMerges`: level, current queue positions before that operation, colour and both capacities. Apply each per-level list in order; positions are local to that stage, not immutable final IDs. The former saturated 253 draft is superseded; its replaced merges are excluded from the final inventory.

**Remaining SUSPICIOUS:** Level **270**, Tunnel **2**, queue position **8**, **verdigris capacity 1**, expert action **29**. Its current front exposes ten verdigris targets, while the remaining colour budget is assigned to other Pals. Same-colour merges across all tunnels failed exact replay/constraints. It stays explicitly flagged instead of being described as geometrically necessary. It is productive and outside the final cleanup tail.

The longest consecutive small-Pal initial-launch tail remains seven actions in 271. Other short runs are listed below. Each listed Pal passes the route-local frontier probe; these are different exposed colour remnants or separated regions. Total routes stay 79–135 actions. No capacity was split or route padded to create a train. Eliminating a different-colour remnant would require changing artwork or route exposure; the locked illustration is retained.

| Level | Longest consecutive capacity 1–2 initial-launch run |
| --- | ---: |
| 251 | 3 |
| 252 | 5 |
| 255 | 4 |
| 259 | 3 |
| 263 | 4 |
| 264 | 5 |
| 269 | 3 |
| 271 | 7 |
| 272 | 5 |
| 283 | 4 |

**Every remaining small Pal** is documented below. `Front` is maximum matching hits from the full remaining colour budget at its certified route window.

| Level | Tunnel / position | Colour | Capacity | Action | Front | Classification |
| --- | --- | --- | ---: | ---: | ---: | --- |
| 251 | 2 / 32 | blush | 1 | 96 | 1 | NECESSARY |
| 251 | 2 / 33 | umber | 1 | 99 | 1 | NECESSARY |
| 251 | 3 / 33 | coral | 2 | 95 | 2 | NECESSARY |
| 251 | 3 / 34 | maroon | 1 | 97 | 1 | NECESSARY |
| 252 | 1 / 29 | blush | 2 | 84 | 2 | NECESSARY |
| 252 | 1 / 30 | gold | 2 | 86 | 2 | NECESSARY |
| 252 | 2 / 28 | bronze | 2 | 85 | 2 | NECESSARY |
| 252 | 2 / 29 | maroon | 2 | 87 | 2 | NECESSARY |
| 252 | 2 / 30 | gold | 1 | 92 | 1 | NECESSARY |
| 252 | 3 / 15 | cerulean | 1 | 88 | 1 | NECESSARY |
| 253 | 1 / 29 | blush | 1 | 97 | 1 | NECESSARY |
| 253 | 3 / 32 | lavender | 2 | 96 | 2 | NECESSARY |
| 253 | 3 / 33 | orange | 1 | 99 | 1 | NECESSARY |
| 254 | 1 / 28 | yellow | 2 | 92 | 2 | NECESSARY |
| 254 | 3 / 30 | umber | 2 | 91 | 2 | NECESSARY |
| 255 | 1 / 35 | ivory | 2 | 104 | 2 | NECESSARY |
| 255 | 2 / 34 | brown | 2 | 102 | 2 | NECESSARY |
| 255 | 2 / 35 | seafoam | 2 | 105 | 2 | NECESSARY |
| 255 | 3 / 20 | green | 2 | 103 | 2 | NECESSARY |
| 256 | 2 / 32 | yellow | 2 | 102 | 2 | NECESSARY |
| 258 | 2 / 21 | yellow | 2 | 118 | 2 | NECESSARY |
| 258 | 3 / 34 | stone | 1 | 121 | 1 | NECESSARY |
| 259 | 1 / 30 | bronze | 1 | 96 | 1 | NECESSARY |
| 259 | 1 / 31 | maroon | 1 | 99 | 1 | NECESSARY |
| 259 | 2 / 27 | sand | 1 | 100 | 1 | NECESSARY |
| 259 | 3 / 17 | ice | 1 | 98 | 1 | NECESSARY |
| 260 | 2 / 22 | sand | 1 | 123 | 1 | NECESSARY |
| 260 | 3 / 40 | umber | 1 | 124 | 1 | NECESSARY |
| 261 | 2 / 15 | sage | 1 | 98 | 1 | NECESSARY |
| 261 | 3 / 30 | ivory | 1 | 96 | 1 | NECESSARY |
| 262 | 1 / 18 | lime | 2 | 108 | 2 | NECESSARY |
| 263 | 1 / 20 | stone | 1 | 113 | 1 | NECESSARY |
| 263 | 2 / 37 | lime | 1 | 111 | 1 | NECESSARY |
| 263 | 3 / 36 | pine | 2 | 110 | 2 | NECESSARY |
| 263 | 3 / 37 | slate | 1 | 112 | 1 | NECESSARY |
| 264 | 1 / 35 | pine | 2 | 111 | 2 | NECESSARY |
| 264 | 1 / 36 | stone | 1 | 114 | 1 | NECESSARY |
| 264 | 2 / 37 | lime | 2 | 110 | 2 | NECESSARY |
| 264 | 2 / 38 | umber | 2 | 112 | 2 | NECESSARY |
| 264 | 3 / 22 | olive | 1 | 113 | 1 | NECESSARY |
| 266 | 2 / 22 | umber | 2 | 118 | 2 | NECESSARY |
| 266 | 3 / 40 | olive | 2 | 116 | 2 | NECESSARY |
| 266 | 3 / 41 | verdigris | 1 | 119 | 1 | NECESSARY |
| 267 | 2 / 14 | graphite | 2 | 108 | 2 | NECESSARY |
| 268 | 3 / 29 | cerulean | 1 | 95 | 1 | NECESSARY |
| 269 | 2 / 37 | graphite | 1 | 109 | 1 | NECESSARY |
| 269 | 2 / 38 | yellow | 1 | 111 | 1 | NECESSARY |
| 269 | 3 / 40 | seafoam | 2 | 107 | 2 | NECESSARY |
| 269 | 3 / 41 | slate | 1 | 110 | 1 | NECESSARY |
| 270 | 1 / 3 | sage | 2 | 13 | 2 | NECESSARY |
| 270 | 2 / 3 | gold | 1 | 9 | 1 | NECESSARY |
| 270 | 2 / 8 | verdigris | 1 | 29 | 10 | SUSPICIOUS |
| 271 | 1 / 16 | garnet | 2 | 93 | 2 | NECESSARY |
| 271 | 1 / 17 | ivory | 2 | 98 | 2 | NECESSARY |
| 271 | 2 / 30 | gold | 2 | 94 | 2 | NECESSARY |
| 271 | 2 / 31 | garnet | 2 | 96 | 2 | NECESSARY |
| 271 | 3 / 31 | garnet | 2 | 92 | 2 | NECESSARY |
| 271 | 3 / 32 | bronze | 2 | 95 | 2 | NECESSARY |
| 271 | 3 / 33 | gold | 2 | 97 | 2 | NECESSARY |
| 272 | 1 / 22 | bronze | 2 | 71 | 2 | NECESSARY |
| 272 | 1 / 23 | lavender | 2 | 74 | 2 | NECESSARY |
| 272 | 2 / 24 | graphite | 2 | 72 | 2 | NECESSARY |
| 272 | 2 / 25 | orange | 2 | 75 | 2 | NECESSARY |
| 272 | 3 / 12 | ice | 2 | 73 | 2 | NECESSARY |
| 273 | 1 / 23 | ivory | 1 | 87 | 1 | NECESSARY |
| 273 | 3 / 25 | graphite | 2 | 86 | 2 | NECESSARY |
| 276 | 2 / 27 | lavender | 1 | 89 | 1 | NECESSARY |
| 276 | 3 / 26 | maroon | 2 | 87 | 2 | NECESSARY |
| 276 | 3 / 27 | yellow | 1 | 90 | 1 | NECESSARY |
| 277 | 3 / 34 | sand | 2 | 105 | 2 | NECESSARY |
| 277 | 3 / 35 | ice | 1 | 107 | 1 | NECESSARY |
| 278 | 1 / 24 | ivory | 2 | 85 | 2 | NECESSARY |
| 278 | 2 / 14 | bronze | 1 | 88 | 1 | NECESSARY |
| 278 | 3 / 24 | sand | 2 | 86 | 2 | NECESSARY |
| 278 | 3 / 25 | garnet | 1 | 89 | 1 | NECESSARY |
| 280 | 2 / 21 | lavender | 1 | 128 | 1 | NECESSARY |
| 280 | 3 / 42 | ivory | 2 | 124 | 2 | NECESSARY |
| 280 | 3 / 43 | umber | 2 | 126 | 2 | NECESSARY |
| 280 | 3 / 44 | sand | 1 | 129 | 1 | NECESSARY |
| 281 | 1 / 21 | slate | 2 | 113 | 2 | NECESSARY |
| 281 | 3 / 33 | ice | 2 | 110 | 2 | NECESSARY |
| 281 | 3 / 34 | navy | 2 | 112 | 2 | NECESSARY |
| 282 | 2 / 37 | coral | 2 | 126 | 2 | NECESSARY |
| 282 | 3 / 40 | cyan | 1 | 127 | 1 | NECESSARY |
| 283 | 1 / 46 | ice | 2 | 124 | 2 | NECESSARY |
| 283 | 1 / 47 | gold | 1 | 131 | 1 | NECESSARY |
| 283 | 2 / 42 | cyan | 2 | 125 | 2 | NECESSARY |
| 283 | 2 / 43 | sand | 2 | 127 | 2 | NECESSARY |
| 283 | 2 / 44 | coral | 1 | 130 | 1 | NECESSARY |
| 283 | 2 / 45 | magenta | 1 | 132 | 1 | NECESSARY |
| 283 | 2 / 46 | seafoam | 1 | 135 | 1 | NECESSARY |
| 283 | 3 / 24 | white | 2 | 128 | 2 | NECESSARY |
| 283 | 3 / 25 | pink | 1 | 133 | 1 | NECESSARY |
| 284 | 2 / 15 | bronze | 2 | 103 | 2 | NECESSARY |
| 284 | 3 / 34 | ivory | 2 | 104 | 2 | NECESSARY |
| 286 | 3 / 34 | sand | 1 | 94 | 1 | NECESSARY |
| 287 | 2 / 47 | navy | 2 | 130 | 2 | NECESSARY |
| 287 | 2 / 48 | bronze | 1 | 132 | 1 | NECESSARY |
| 287 | 3 / 26 | gold | 1 | 133 | 1 | NECESSARY |
| 288 | 1 / 32 | slate | 1 | 111 | 1 | NECESSARY |
| 288 | 2 / 37 | ultramarine | 1 | 112 | 1 | NECESSARY |
| 288 | 3 / 19 | navy | 2 | 108 | 2 | NECESSARY |
| 289 | 2 / 16 | stone | 2 | 98 | 2 | NECESSARY |
| 289 | 3 / 33 | umber | 2 | 99 | 2 | NECESSARY |
| 289 | 3 / 34 | cyan | 1 | 101 | 1 | NECESSARY |
| 290 | 2 / 36 | white | 2 | 120 | 2 | NECESSARY |
| 290 | 3 / 19 | lime | 2 | 118 | 2 | NECESSARY |
| 290 | 3 / 20 | cyan | 1 | 122 | 1 | NECESSARY |

## Bot diagnostics

Policies are deterministic: round-robin advances tunnel preferences then relaunches Holding; drain empties one tunnel before advancing; greedy maximizes immediate hits over legal actions; noWaste prefers actions that exhaust the Pal, then immediate hits; holding-first prefers productive held relaunches, then maximum immediate hits. Diagnostics include failures and no-op deadlocks. A bot win is diagnostic and never triggers reauthoring by itself.

| Policy | Won | Lost | Deadlocked / capped | Winning IDs |
| --- | ---: | ---: | ---: | --- |
| round-robin | 0 | 40 | 0 | — |
| greedy | 0 | 40 | 0 | — |
| drain | 0 | 40 | 0 | — |
| noWaste | 8 | 32 | 0 | 253, 262, 274, 275, 277, 284, 285, 286 |
| holding-first | 29 | 11 | 0 | 251, 252, 253, 254, 255, 256, 258, 259, 260, 261, 262, 263, 265, 268, 269, 271, 272, 273, 275, 276, 277, 279, 281, 282, 284, 285, 286, 288, 289 |

Exact per-level bot outcomes and action counts are in the certificate JSON. Naive round-robin/drain/greedy fail across the block. The productive-Holding policy often wins and exposes fair readable recovery routes; several hard boards and finales still defeat it. These outcomes do not rank difficulty or prove the existence of traps.

## Phone-scale visual and colour review

**37 PASS / 3 MINOR / 0 REAL DEFECTS.** Inspected all forty final production boards with assist OFF and ON using actual `StaticPixelField`, board geometry, materials, reachability and Skia CanvasKit, at 347 logical points and 2× pixel ratio. Each sheet has ten canvases. Browser verification reports no uncaught errors across all eight mode/world combinations. This is production web rendering at phone-like board scale; native motion/haptics were not tested in this content milestone.

Final local sheets: `dist/m16a/world{26,27,28,29}-{off,on}-2x.png`. 253’s W26 sheets were rebuilt and recaptured after its pale-reflection correction. Browser logs are `browser-checks.log` and `browser-final26.log`.

**Every MINOR concern:**

- **269:** The lower green body partially shares the foliage value. The pine edge and gold eye keep the S-curve identifiable; assist improves the crossing boundaries.
- **272:** The innermost ribs converge into a dense bright roof/spine near the vanishing point. The seven receding rib pairs and road remain identifiable; compact phone review accepted this as MINOR.
- **280:** The individual skeletal fingers are compressed at phone scale. Both supports, the diagonal causeway and dark upper-right keep remain readable; finger separation is a future polish opportunity.

**REAL DEFECTS: none.** Subjects remain identifiable and the intended void/light distinctions survive assist OFF/ON. No broken silhouette, severe merge or accidental board artifact was accepted.

**Colour-pair findings:** brown/umber carry lit/shadow form; bronze/brown accents are narrow and use contrasting sand/ivory/gold edges where architectural. Some adjacent brown/bronze cells remain in small material details, so assist is useful; no large faces collapse. Garnet/maroon robe/crust values share dark ranges, with ivory, gold or graphite boundaries. Graphite/navy/slate are reserved for cavern/water/structure masses and the phone review retained their edges. Jungle green/forest/pine/olive/sage/verdigris/seafoam use coherent depth masses; 269’s intended camouflage is the recorded minor concern. Cyan/cerulean/blue/ice remain distinct by value and outlines in waterfalls, glass and painted rays. Ocean water uses cerulean→blue→navy, verdigris glass/deep-water shadows, and small ultramarine accents. No indigo water band or petrol is introduced.

All used colours have runtime fill/rim tokens, Studio mapping, mark contrast strategy and unique minimal-detail assist marks on each board. Palette/assist tests pass. No global hex values, marks or Studio mappings were changed.

## Validation and performance

- Four packet compiles: PASS, ten definitions each; ordinary structural compiler, no bypass.
- Final witness-aware CLI, 251–290: **40 passed / 0 failed / 0 warnings**.
- Final full-source/index CLI, 1–290, witness-only: **290 passed / 0 failed / 0 warnings**.
- **16 targeted Jest suites / 567 tests PASS**; the two new suites were rerun after the final 253 refinement (**93 tests PASS**). No broad Jest run. Coverage: new worlds/metrics, exact replay and clean terminal state, registry/source parity, dev index, publication boundaries, previous W25/W21–24 certificates, witness validation, runtime authoring integration, palette/assist, relevant Studio and world skins.
- Initial test failures were corrected: stale registry count 250 became 290; the legacy fixture test now validates the active manifest against active IDs, and its pre-existing first-world density limits reflect the unchanged legacy silhouettes (85 for nonfinale, 95 for L10). The new replay test initially asserted pending=0 on every action; it now respects the production Gate grace window while retaining final pending=0.
- `npx tsc --noEmit`: PASS.
- ESLint on all **20 touched/new TypeScript files**: PASS.
- `git diff --check` plus whitespace checks on new tracked candidates: PASS.
- Runtime engine/render algorithms unchanged. Direct colour lookups, one-pass grouping and cached render data remain intact. The heavier colour probes and searches are confined to offline scripts. Registry/skin additions are static data, with no new per-frame board×palette scan.

Validation logs and screenshots remain under ignored `dist/m16a/`. Persistent review evidence is [M16A_LEVELS_251_290_CERTIFICATES.json](audits/M16A_LEVELS_251_290_CERTIFICATES.json). Tests independently pin the authored metrics and re-run production replay rather than trusting stored boolean certificates.

## Git diff

`git diff --stat` below covers tracked edits; Git excludes newly created files until staging. Nothing was staged, committed or pushed.

```text
 src/game/levels/__tests__/campaignMetadata.test.ts   | 12 ++++++++----
 .../levels/__tests__/campaignV2World1316.test.ts     |  2 +-
 .../levels/__tests__/campaignV2World1720.test.ts     |  2 +-
 .../levels/__tests__/campaignV2World2124.test.ts     |  2 +-
 src/game/levels/__tests__/campaignV2World25.test.ts  |  8 ++++----
 src/game/levels/__tests__/campaignV2World912.test.ts |  2 +-
 src/game/levels/__tests__/levelDefinitions.test.ts   | 20 +++++++++++---------
 src/game/levels/__tests__/publishedCampaign.test.ts  |  2 +-
 src/game/levels/campaign.ts                          |  6 +++++-
 src/game/levels/levels.ts                            | 10 +++++++++-
 src/theme/__tests__/worldSkins.test.ts               |  1 +
 src/theme/worldSkins.ts                              |  4 ++++
 12 files changed, 47 insertions(+), 24 deletions(-)
```

New files:

- `content/levels/world-26.json`
- `content/levels/world-27.json`
- `content/levels/world-28.json`
- `content/levels/world-29.json`
- `docs/M16A_LEVELS_251_290_AUTHORING_REPORT.md`
- `docs/audits/M16A_LEVELS_251_290_CERTIFICATES.json`
- `scripts/m16a-art.py`
- `scripts/m16a-audit.ts`
- `scripts/m16a-author.ts`
- `src/game/levels/__tests__/campaignV2World2629.test.ts`
- `src/game/levels/authoring/__tests__/paletteWorld2629.test.ts`
- `src/game/levels/compiledWorld26.ts`
- `src/game/levels/compiledWorld27.ts`
- `src/game/levels/compiledWorld28.ts`
- `src/game/levels/compiledWorld29.ts`

The new files include four source packets, four compiled world modules, two targeted test files, three offline authoring/audit scripts, this report and the persistent certificate JSON.
