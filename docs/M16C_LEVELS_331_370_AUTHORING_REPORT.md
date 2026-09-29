# M16C — Levels 331–370 production authoring report

Worlds 34 Lost Futures, 35 Mythic Asia, 36 Giant Insects and 37 Moon Kingdom contain forty independent 48×48 Core V2 definitions. All locked titles are retained. No Levels 371+ were authored. Existing Levels 1–330 geometry, queues and witnesses are unchanged.

**40/40 structural validation and exact productive witnesses pass.** All final states are won with zero pixels, Holding, queued Pals and pending arrivals; rejected actions, zero-hit witness actions and item use are zero. Default solver: **34 PASS / 6 INCONCLUSIVE**. Inconclusive IDs: 333, 340, 347, 350, 355, 367. Each has an independently replayed authored witness.

Exactly three tunnels, Active 5, Holding 3, launch spacing 1, front-visible targeting, first-launched-first-served and GateTerminal semantics remain unchanged. Offline construction uses production encounter probes on each final geometry, reserves actual delayed same-color value and distributes the exact route over three queues. Transient draft queues are incomplete; only finished immutable packets are certified.

## Palette and phone-scale review

Palette **42 → 44**, preserving the exact previous 42 IDs and order, including silver. Only moss (#43, L351) and ash (#44, L361) were appended. Runtime fills/rims/labels, validator registries, Studio, material lookups and both renderers derive from the shared registry.

| Color | Fill | Rim | Label | Studio | Assist | Nearest approved ΔE00 |
| --- | --- | --- | --- | --- | --- | --- |
| moss | #5F6418 | #C4B464 | MOSS | q | sprout: vertical stem + two raised arms | bronze ~18.1 |
| ash | #7B786E | #B4B4A8 | ASH | d | girder: top/bottom bars + vertical stem | graphite ~16.9 |

Both marks use existing bar primitives and remain unique at full, compact and minimal detail. Both use lightOnDark contrast. No locked fill/rim/glyph or existing color token was changed. Each has its own extension record in content/palettes.

Moss covers 341 cells at 351 and is the largest single color population. Ash covers 524 cells at 361. Every color on 350 and all 351–370 boards has at least 25 cells.

Production Skia board samples OFF/ON, 6pt RN marks, 28pt Pal shells OFF/ON, light/dark backgrounds, color and grayscale were reviewed at both 2× and 3×. Moss was compared with bronze, olive, forest, pine and graphite; ash with graphite, stone, silver, slate, bronze and forest. The Y-fork and I-beam stay distinct. Grayscale moss/graphite and ash/forest are deliberately close; assist differentiates them, and production art uses contrasting material boundaries. Ash/slate and ash/bronze direct four-neighbor edges are eliminated by stone rims. Review is desktop browser at phone-like logical scale; no physical-device/frame-time claim.

## World metrics

| World | Mean pixels | Mean occupancy | Total Pals | Pal range | Witness range | Small Pals |
| --- | --- | --- | --- | --- | --- | --- |
| 34 | 2173.1 | 94.32% | 729 | 59–93 | 85–120 | 17 |
| 35 | 2205.7 | 95.73% | 826 | 46–112 | 58–136 | 19 |
| 36 | 2162.6 | 93.86% | 730 | 55–93 | 78–120 | 24 |
| 37 | 2142.3 | 92.98% | 763 | 58–95 | 80–130 | 11 |

Occupancy is filled cells / 2304. Pals count initial queue charges. A strategic bridge clears at least six cells initially and at least six on a later pass delayed by at least three actions. Holding/full states are measured when each production action returns; a travelling pending survivor may still occupy the Gate grace window.

## Per-level certificates

| ID | Title | Dimensions | Pixels | Occupancy | Colors | Pals | Actions | Relaunches | Bridges | Peak H | Cap 1–2 | Solver | Visual |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 331 | Monorail to Nowhere | 48×48 | 2160 | 93.75% | 14 | 63 | 93 | 30 | 14 | 3 | 1 | PASS | PASS |
| 332 | Silent Moon Colony | 48×48 | 2162 | 93.84% | 16 | 71 | 100 | 29 | 11 | 3 | 0 | PASS | PASS |
| 333 | Rocket Diner | 48×48 | 2154 | 93.49% | 15 | 59 | 95 | 36 | 20 | 3 | 0 | INCONCLUSIVE | PASS |
| 334 | Broken Skyway | 48×48 | 2119 | 91.97% | 14 | 64 | 87 | 23 | 7 | 3 | 2 | PASS | PASS |
| 335 | The Waiting Robot | 48×48 | 2124 | 92.19% | 13 | 73 | 85 | 12 | 3 | 2 | 5 | PASS | PASS |
| 336 | The Hollow Arcology | 48×48 | 2200 | 95.49% | 16 | 62 | 87 | 25 | 8 | 3 | 2 | PASS | PASS |
| 337 | Last Launch Gantry | 48×48 | 2193 | 95.18% | 15 | 84 | 110 | 26 | 6 | 3 | 0 | PASS | PASS |
| 338 | Pavilion of Progress | 48×48 | 2192 | 95.14% | 16 | 87 | 101 | 14 | 9 | 3 | 1 | PASS | PASS |
| 339 | The Unfinished Ring | 48×48 | 2174 | 94.36% | 15 | 73 | 100 | 27 | 12 | 3 | 3 | PASS | PASS |
| 340 | The Promised Tomorrow | 48×48 | 2253 | 97.79% | 19 | 93 | 120 | 27 | 10 | 3 | 3 | INCONCLUSIVE | PASS |
| 341 | Koi in the Mist | 48×48 | 2188 | 94.97% | 16 | 89 | 115 | 26 | 9 | 3 | 2 | PASS | PASS |
| 342 | Prayer-Flag Peaks | 48×48 | 2218 | 96.27% | 16 | 74 | 100 | 26 | 10 | 3 | 0 | PASS | PASS |
| 343 | Steppe Sky-Horses | 48×48 | 2160 | 93.75% | 16 | 72 | 103 | 31 | 9 | 3 | 0 | PASS | PASS |
| 344 | Twin Door Wardens | 48×48 | 2222 | 96.44% | 17 | 73 | 108 | 35 | 6 | 3 | 4 | PASS | PASS |
| 345 | Rice Terrace Hills | 48×48 | 2124 | 92.19% | 13 | 46 | 58 | 12 | 6 | 2 | 1 | PASS | PASS |
| 346 | The Stele Tortoise | 48×48 | 2220 | 96.35% | 17 | 79 | 112 | 33 | 10 | 3 | 4 | PASS | PASS |
| 347 | Cloud Palace | 48×48 | 2208 | 95.83% | 19 | 82 | 121 | 39 | 16 | 3 | 0 | INCONCLUSIVE | PASS |
| 348 | Nine-Tailed Grove | 48×48 | 2220 | 96.35% | 17 | 112 | 136 | 24 | 8 | 3 | 3 | PASS | MINOR |
| 349 | Ten-Thousand-Step Stair | 48×48 | 2242 | 97.31% | 18 | 97 | 126 | 29 | 12 | 3 | 3 | PASS | PASS |
| 350 | The Heavenly River | 48×48 | 2255 | 97.87% | 20 | 102 | 136 | 34 | 11 | 3 | 2 | INCONCLUSIVE | PASS |
| 351 | Carapace Causeway | 48×48 | 2184 | 94.79% | 16 | 70 | 101 | 31 | 18 | 3 | 1 | PASS | PASS |
| 352 | The Paper Nest | 48×48 | 2112 | 91.67% | 15 | 59 | 94 | 35 | 16 | 3 | 0 | PASS | PASS |
| 353 | Skimmer over the Marsh | 48×48 | 2172 | 94.27% | 16 | 78 | 109 | 31 | 9 | 3 | 2 | PASS | PASS |
| 354 | The Living Span | 48×48 | 2106 | 91.41% | 15 | 76 | 113 | 37 | 16 | 3 | 1 | PASS | PASS |
| 355 | The Silk Lantern | 48×48 | 2084 | 90.45% | 13 | 72 | 84 | 12 | 4 | 2 | 6 | INCONCLUSIVE | PASS |
| 356 | The Shed Shell | 48×48 | 2203 | 95.62% | 16 | 93 | 118 | 25 | 9 | 3 | 9 | PASS | PASS |
| 357 | Dew Web Valley | 48×48 | 2103 | 91.28% | 14 | 55 | 78 | 23 | 11 | 3 | 0 | PASS | MINOR |
| 358 | Leafcutter Sails | 48×48 | 2188 | 94.97% | 15 | 68 | 96 | 28 | 11 | 3 | 3 | PASS | PASS |
| 359 | Mandible Arch | 48×48 | 2210 | 95.92% | 16 | 72 | 114 | 42 | 8 | 3 | 1 | PASS | PASS |
| 360 | Queen of the Thousand Halls | 48×48 | 2264 | 98.26% | 18 | 87 | 120 | 33 | 10 | 3 | 1 | PASS | PASS |
| 361 | The Mare Road | 48×48 | 2110 | 91.58% | 14 | 87 | 116 | 29 | 9 | 3 | 1 | PASS | PASS |
| 362 | Rille Bridges | 48×48 | 2093 | 90.84% | 14 | 65 | 91 | 26 | 13 | 3 | 0 | PASS | PASS |
| 363 | The Stargazer Terraces | 48×48 | 2144 | 93.06% | 15 | 73 | 107 | 34 | 12 | 3 | 3 | PASS | PASS |
| 364 | The Regolith River | 48×48 | 2152 | 93.40% | 14 | 68 | 94 | 26 | 11 | 3 | 0 | PASS | PASS |
| 365 | The Stone Moon-Hare | 48×48 | 2084 | 90.45% | 12 | 68 | 80 | 12 | 4 | 1 | 2 | PASS | PASS |
| 366 | The Palace of Slow Steps | 48×48 | 2183 | 94.75% | 15 | 74 | 105 | 31 | 7 | 3 | 0 | PASS | PASS |
| 367 | Gate of the Red Eclipse | 48×48 | 2155 | 93.53% | 15 | 58 | 86 | 28 | 11 | 3 | 1 | INCONCLUSIVE | PASS |
| 368 | Tethered Spires | 48×48 | 2135 | 92.66% | 15 | 82 | 103 | 21 | 8 | 3 | 2 | PASS | PASS |
| 369 | Dust-Sail Harbour | 48×48 | 2147 | 93.19% | 16 | 93 | 115 | 22 | 8 | 3 | 1 | PASS | PASS |
| 370 | The Earthrise Court | 48×48 | 2220 | 96.35% | 18 | 95 | 130 | 35 | 12 | 3 | 1 | PASS | PASS |

## Safe merges and small-Pal audit

Retained **668 safe merges**: 590 within tunnels and 78 across tunnels. Matching capacities are transferred to the earlier Pal, the later queue entry removed, and an identity-aware reconstructed route must replay productively to a clean win. Some removed launches become productive Holding relaunches, so merge count is not action savings. Breathers additionally require Holding ≤2 and at most twelve relaunches. Full retained positions/capacities are in the machine certificate.

Remaining small Pals: **71**, comprising 70 NECESSARY, 1 SUSPICIOUS and zero remaining MERGEABLE under the tested transformations. NECESSARY is explicitly route-local: a production probe using the entire remaining color budget exposed at most two hits at that witness window. It is not a universal claim about all winning routes.

| ID | Tunnel/position | Color/capacity | Witness step | Exposed front |
| --- | --- | --- | --- | --- |
| 350 | T3/26 | blush/2 | 95 | 10 |

Suspicious entries expose more matching front targets than their capacity, with the rest of the budget assigned to other Pals. Tested merges failed productive replay or breather relief constraints; these remain suspicious rather than relabeled necessary.

Longest consecutive capacity-1–2 initial-launch run: **2**. An intervening relaunch or larger launch breaks the run. No zero-hit cleanup actions remain.

No runs of three or more small initial launches occur.

## Breathers and finales

| ID | Role | Pals | Actions | Relaunches | Bridges | Peak H | H-full states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 335 | breather | 73 | 85 | 12 | 3 | 2 | 0 |
| 340 | finale | 93 | 120 | 27 | 10 | 3 | 65 |
| 345 | breather | 46 | 58 | 12 | 6 | 2 | 0 |
| 350 | finale | 102 | 136 | 34 | 11 | 3 | 59 |
| 355 | breather | 72 | 84 | 12 | 4 | 2 | 0 |
| 360 | finale | 87 | 120 | 33 | 10 | 3 | 43 |
| 365 | breather | 68 | 80 | 12 | 4 | 1 | 0 |
| 370 | finale | 95 | 130 | 35 | 12 | 3 | 65 |

All four breathers retain peak Holding ≤2 and zero Holding-full states, with fewer actions, relaunches and bridges than their own world peers’ means. They remain substantial production puzzles. Tests compare relative relief, not monotonic progression.

350 is the major capstone: 2255 pixels, 20 colors, each ≥25 cells, a bright S-spine through three tiers, dragon eye/mane/whiskers, small heavenly palace and monastery, pines, reflected terrace bands, village and mouth koi. The sky transitions through night/lavender/rose to dawn. The thin full-length inner stripe was removed and pine crowns/river-mouth materials consolidated to reduce redundant nested fronts; the locked concept and all major structures remain. Its final 136 productive actions are one above the 135 avoidance guidance and six above the nominal finale band; the narrow falls hinge, tiered repeated colors and shielded mountain account for the route. No claim of globally shortest route is made and no actions were padded. 348 also has 136 natural actions from nine tail corridors woven through seven stalks.

## Finale fairness samples

| Finale | Recoverable | Fatal | Unclear | Samples |
| --- | --- | --- | --- | --- |
| 340 | 7 | 2 | 0 | 9 |
| 350 | 8 | 0 | 0 | 8 |
| 360 | 9 | 0 | 0 | 9 |
| 370 | 9 | 0 | 0 | 9 |

Samples cover alternate openings, premature large launches, skipped productive Holding, bridge timing and visible forks at early/middle/later states. Identity-aware repair, production heuristics and a separate 2500-node/2.5s diagnostic recovery search are used. Bounded failure is UNCLEAR, not fatal proof; the default solver limits are never increased. This is sampling, not exhaustive fairness proof.

| Finale | Category | Step | Alternative | Hits | Holding/pending | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 340 | alternative openings | 1 | tunnel tunnel-0 | 25 | 1/0 | RECOVERED |
| 340 | alternative openings | 1 | tunnel tunnel-1 | 20 | 0/0 | RECOVERED |
| 340 | premature high-capacity launch | 14 | tunnel tunnel-1 | 36 | 2/0 | RECOVERED |
| 340 | skipped productive Holding relaunch | 32 | tunnel tunnel-2 | 27 | 3/0 | IMMEDIATE_LOSS |
| 340 | skipped productive Holding relaunch | 32 | tunnel tunnel-0 | 35 | 3/0 | IMMEDIATE_LOSS |
| 340 | bridge timing mistake | 50 | tunnel tunnel-2 | 27 | 3/1 | RECOVERED |
| 340 | bridge timing mistake | 50 | tunnel tunnel-0 | 13 | 3/1 | RECOVERED |
| 340 | obvious route fork | 67 | tunnel tunnel-2 | 23 | 3/0 | RECOVERED |
| 340 | obvious route fork | 67 | tunnel tunnel-1 | 19 | 3/0 | RECOVERED |
| 350 | alternative openings | 1 | tunnel tunnel-0 | 56 | 1/0 | RECOVERED |
| 350 | alternative openings | 1 | tunnel tunnel-2 | 46 | 1/0 | RECOVERED |
| 350 | premature high-capacity launch | 14 | tunnel tunnel-0 | 10 | 3/0 | RECOVERED |
| 350 | skipped productive Holding relaunch | 35 | tunnel tunnel-1 | 17 | 3/0 | RECOVERED |
| 350 | skipped productive Holding relaunch | 35 | tunnel tunnel-2 | 14 | 3/0 | RECOVERED |
| 350 | bridge timing mistake | 56 | tunnel tunnel-0 | 17 | 3/1 | RECOVERED |
| 350 | bridge timing mistake | 56 | tunnel tunnel-1 | 11 | 3/1 | RECOVERED |
| 350 | obvious route fork | 75 | tunnel tunnel-0 | 25 | 3/0 | RECOVERED |
| 360 | alternative openings | 1 | tunnel tunnel-0 | 53 | 0/0 | RECOVERED |
| 360 | alternative openings | 1 | tunnel tunnel-2 | 61 | 0/0 | RECOVERED |
| 360 | premature high-capacity launch | 13 | tunnel tunnel-2 | 37 | 3/0 | RECOVERED |
| 360 | skipped productive Holding relaunch | 33 | tunnel tunnel-1 | 33 | 3/1 | RECOVERED |
| 360 | skipped productive Holding relaunch | 33 | tunnel tunnel-0 | 21 | 3/1 | RECOVERED |
| 360 | bridge timing mistake | 51 | tunnel tunnel-2 | 36 | 3/0 | RECOVERED |
| 360 | bridge timing mistake | 51 | tunnel tunnel-1 | 31 | 2/0 | RECOVERED |
| 360 | obvious route fork | 67 | tunnel tunnel-0 | 11 | 2/0 | RECOVERED |
| 360 | obvious route fork | 67 | tunnel tunnel-1 | 10 | 1/0 | RECOVERED |
| 370 | alternative openings | 1 | tunnel tunnel-0 | 7 | 0/0 | RECOVERED |
| 370 | alternative openings | 1 | tunnel tunnel-1 | 63 | 0/0 | RECOVERED |
| 370 | premature high-capacity launch | 14 | tunnel tunnel-0 | 16 | 3/1 | RECOVERED |
| 370 | skipped productive Holding relaunch | 34 | tunnel tunnel-2 | 34 | 3/0 | RECOVERED |
| 370 | skipped productive Holding relaunch | 34 | tunnel tunnel-1 | 33 | 3/0 | RECOVERED |
| 370 | bridge timing mistake | 60 | tunnel tunnel-1 | 10 | 3/1 | RECOVERED |
| 370 | bridge timing mistake | 60 | tunnel tunnel-0 | 12 | 3/1 | RECOVERED |
| 370 | obvious route fork | 72 | tunnel tunnel-0 | 31 | 3/1 | RECOVERED |
| 370 | obvious route fork | 72 | tunnel tunnel-1 | 17 | 3/1 | RECOVERED |

The two fatal samples are both 340 at action 32. The pre-action state has Holding 3/3 and one pending arrival. The witness relaunches H3 (silver, capacity 25) and clears all 25 cells, opening a seat. Instead launching T3 stone (48 capacity, 27 hits), or T1 blush (35 capacity, 35 hits), loses at GateTerminal. Even the drained blush launch fails to free an existing Holding seat for the pending arrival. These are full-Holding/pending timing consequences under unchanged engine rules; they are not evidence of an irreversible trap while spare Holding space exists. All other 33 sampled deviations recover. This limited sample does not prove general fairness.

## Bot diagnostics

| Policy | Won | Lost | Other |
| --- | --- | --- | --- |
| round-robin | 0 | 40 | 0 |
| greedy | 0 | 40 | 0 |
| drain | 0 | 40 | 0 |
| noWaste | 2 | 38 | 0 |
| holding-first | 29 | 11 | 0 |

Holding-first wins 29/40 (72.5%). M16B was 35/40 (87.5%); M16A was 29/40 (72.5%). This success rate is reported directly, and content was not reauthored merely to defeat the heuristic. Unusual art and long routes do not by themselves establish deep search difficulty.

## Production visual review

Final imported StaticPixelField boards were reviewed assist OFF/ON at logical width 347pt and 2× pixels. Eight contact sheets are under local ignored dist/m16c/. Every page reaches ready state with ten canvases and no captured console errors/error overlay. Both palette subjects additionally pass eight color/grayscale 2×/3× pages with sixteen canvases each.

Final classification: **38 PASS / 2 MINOR / 0 unresolved REAL DEFECT**. All MINOR issues: 348’s common tail junction is compressed behind bamboo; 357’s overlapping inner web lattice is dense at phone scale, while its off-centre hub/trunks/bridge remain legible.

Corrected authoring defects: (1) 339’s first ellipse was horizontal; it now tilts −18°. (2) 370’s night polygons painted beyond the Earth disc; shading is now clipped to the circular silhouette and the diagonal terminator remains clear. Both retain their approved subjects. Ash near-value material boundaries were also refined with stone edges. No new glyph rendering defect appeared; locked moss/ash tokens remain exact.

| ID | Visual | Review |
| --- | --- | --- |
| 331 | PASS | Stalled streamlined car on a curved chrome corridor, six pylons and an abrupt free end. |
| 332 | PASS | Four deserted cylinders, two dishes, toppled rover and low blue Earth on a lunar plain. |
| 333 | PASS | Boomerang roof, dark closed windows and a tall rocket sign beside the empty road. |
| 334 | PASS | Two severed diagonal deck corridors, four cars and one suspended broken-end car. |
| 335 | PASS | One waiting robot, broad stop canopy, bench and quiet sunset grass bands. |
| 336 | PASS | Three dark façade hollows expose layered floors in a stepped pyramid arcology. |
| 337 | PASS | Consistent gantry braces, tall rocket, three access arms and a sea-edge launch pad. |
| 338 | PASS | Three saucer masses on stalks, spiral observation ramp, open globe and dry fountain. |
| 339 | PASS | Tilted ring with six spokes, hub, three scaffold holes and a separate Earth limb. |
| 340 | PASS | Empty chrome skyline, needle spires, monorail loop, faded mural and foreground telescope terrace. |
| 341 | PASS | Gold and white/red koi curl around a peak through broad painted mist. |
| 342 | PASS | Three snow peaks, nested monastery, four flag spans and a filled glacier. |
| 343 | PASS | Three diagonal horses trail cloud manes above a low steppe and two yurts. |
| 344 | PASS | Asymmetric raised-fist and staff wardens flank an ajar lacquer doorway. |
| 345 | PASS | Long reflected-water contour bands with one small hut and painted far mist. |
| 346 | PASS | Low three-quarter tortoise plates carry an inscribed stele beside pines. |
| 347 | PASS | Three cloud islands at different heights joined by three colored bridge routes. |
| 348 | MINOR | Nine luminous tails weave behind seven bamboo stalks; the common junction is compressed at phone scale. |
| 349 | PASS | Six-switchback stair, three gates, waterfall and summit shrine in crossed mist bands. |
| 350 | PASS | Full-height bright river spine, sculpted dragon head, small palace, monastery, pines, terraces, village and koi. |
| 351 | PASS | Road and four wagons ride a large split shell; moss is the largest color population. |
| 352 | PASS | Tower-scale banded paper envelope, three patrolling wasps and >=4×4 dark comb cells. |
| 353 | PASS | Four filled wing panels around a diagonal narrow body; water shadow and stilt hut establish scale. |
| 354 | PASS | Eight chunky ant units span one dark gorge between a leaf and a nest cliff. |
| 355 | PASS | One off-centre warm cocoon, a two-cell silk thread, quiet branch and meadow. |
| 356 | PASS | Amber husk with a dark ivory-rimmed split, three jointed hooks and ladder/shrine platform. |
| 357 | MINOR | Five rings and ten named threads form an off-centre web; overlapping lattice is dense, but trunks, dew and rope bridge remain clear. |
| 358 | PASS | Eight broad leaf-sails repeat along a curved log to a mound over filled stream water. |
| 359 | PASS | Two opposed beetle masses and interlocking thick jaws frame a filled warm sun. |
| 360 | PASS | Clean jagged half-cutaway: four gallery tiers, queen core, solid exterior, spires and five alates. |
| 361 | PASS | A converging lamp road divides an ash plain; carved horizon city and a low Earth establish lunar scale. |
| 362 | PASS | A dark winding rille splits two plateau halves joined by three tall pale arches. |
| 363 | PASS | Five descending instrument terraces, filled comet wedge and dark basalt mirror pool. |
| 364 | PASS | Lateral pale dust meander, four barges and three bank villages with dark crevices. |
| 365 | PASS | Large resting stone hare with laid-back ears, broad contours, one lamp shrine and Earth crescent. |
| 366 | PASS | Asymmetric lit front and ash side palace above six giant stair steps and straight banners. |
| 367 | PASS | Continuous red/gold eclipse ring encloses true darkness within a rectangular carved gate. |
| 368 | PASS | Five spires and six floating blocks form a two-level tether/bridge network. |
| 369 | PASS | Nine crescent sails and filled wakes, four quay piers and a round dark customs court. |
| 370 | PASS | Half-lit circular Earth with filled navy/indigo night, sparse lights and seven court spurs in front. |

## Approved-design guidance departures

No locked title or subject was redesigned. Bright atmosphere, mist, wing panes, rivers and wakes remain filled. The 370 terminator moves slightly right (27 + 0.3y rather than the conceptual 22→38 diagonal) to expose a readable day arc above the overlapping court; it remains diagonal with a filled night side. Broad material planes stay inside defined masses rather than becoming scatter. Rounded dark framing follows the established board convention.

| ID | Pixels | Pixel guidance | Colors | Color guidance |
| --- | --- | --- | --- | --- |
| 334 | 2119 | 2110–2160 | 14 | 15–17 |
| 337 | 2193 | 2170–2220 | 15 | 16–18 |
| 339 | 2174 | 2140–2190 | 15 | 16–18 |

Small numeric departures preserve coherent subject/material geometry rather than adding density or colors solely to satisfy a range. Natural efficient witness lengths below the broad normal guidance are retained. The 350 and 348 136-action exceptions are disclosed above.

## Validation and performance

Targeted Jest verification covers 25 suites and 1036 tests: the initial run passed 1035 tests and exposed one older palette fixture with a fixed 42-cell board; after adapting its row count to the 44-color registry, all 29 tests in that suite pass on rerun. The two new suites pass 101 tests. Full witness-aware validation: 370 PASS, 0 FAIL, 0 WARN for Levels 1–370; new range: 40 PASS, 0 FAIL, 0 WARN. TypeScript (npx tsc --noEmit), ESLint over 36 touched/new TypeScript files plus the corrected fixture rerun, Python compilation and git diff --check pass. Logs remain under dist/m16c. No broad unrelated suite was run.

Runtime uses direct maps, one-pass grouping and cached render information. New marks add only three existing bar primitives per mark; no board × palette × frame scan was added. All raster drawing, material-edge refinement, queue generation, merges and search diagnostics are offline. Engine rules, rendering loops and publication constants are unchanged. No physical-device frame profiling was performed.

Publication remains PUBLISHED_MAX_LEVEL=50 and CAMPAIGN_VERSION=v2-50. All new levels are dev-only. Source/compiled registry agreement and unique contiguous IDs 1–370 are verified by targeted tests and the full witness-aware validator.

## Files and evidence

Source packets: content/levels/world-34.json through world-37.json. Compiled modules: src/game/levels/compiledWorld34.ts through compiledWorld37.ts. Offline tools: scripts/m16c-art.py, m16c-author.ts and m16c-audit.ts. Targeted new suites: campaignV2World3437.test.ts and paletteWorld3437.test.ts. Full audit: docs/audits/M16C_LEVELS_331_370_CERTIFICATES.json with definition hashes, color populations, all tiny Pals, merge histories, solver flags, bots, deviations and visual notes. Review images/logs remain local and ignored in dist/m16c.

No staging, commit or push. git diff --stat below includes tracked modifications only; new packets/modules/tools/tests/report are separately listed by git status --short.

```text
src/game/engine/types.ts                                 |  4 +++-
 src/game/levels/__tests__/campaignMetadata.test.ts       | 10 +++++++---
 src/game/levels/__tests__/campaignV2World1316.test.ts    |  2 +-
 src/game/levels/__tests__/campaignV2World1720.test.ts    |  2 +-
 src/game/levels/__tests__/campaignV2World2124.test.ts    |  2 +-
 src/game/levels/__tests__/campaignV2World25.test.ts      |  6 +++---
 src/game/levels/__tests__/campaignV2World2629.test.ts    | 10 +++++-----
 src/game/levels/__tests__/campaignV2World3033.test.ts    | 10 +++++-----
 src/game/levels/__tests__/campaignV2World912.test.ts     |  2 +-
 src/game/levels/__tests__/levelDefinitions.test.ts       |  2 +-
 src/game/levels/__tests__/publishedCampaign.test.ts      |  2 +-
 .../levels/authoring/__tests__/paletteWorld1316.test.ts  | 16 ++++++++--------
 .../levels/authoring/__tests__/paletteWorld1720.test.ts  |  6 +++---
 .../levels/authoring/__tests__/paletteWorld2124.test.ts  |  6 +++---
 .../levels/authoring/__tests__/paletteWorld25.test.ts    |  2 +-
 .../levels/authoring/__tests__/paletteWorld2629.test.ts  |  2 +-
 .../levels/authoring/__tests__/paletteWorld3033.test.ts  | 12 ++++++------
 .../levels/authoring/__tests__/paletteWorld6.test.ts     |  2 +-
 .../levels/authoring/__tests__/paletteWorld78.test.ts    | 12 ++++++------
 .../levels/authoring/__tests__/paletteWorld912.test.ts   | 12 ++++++------
 src/game/levels/campaign.ts                              |  4 ++++
 src/game/levels/levels.ts                                | 10 +++++++++-
 src/game/rendering/__tests__/colorAssist.test.ts         | 12 ++++++------
 src/game/studio/grid.ts                                  |  4 +++-
 src/theme/__tests__/worldSkins.test.ts                   |  1 +
 src/theme/colorAssist.ts                                 | 14 ++++++++++++--
 src/theme/colors.ts                                      |  8 +++++++-
 src/theme/worldSkins.ts                                  |  4 ++++
 28 files changed, 110 insertions(+), 69 deletions(-)
```
