# M16B — Levels 291–330 production authoring report

Worlds 30 Cosmic Gods, 31 Ancient Machines, 32 Festival Worlds and 33 Alien Ecosystems are implemented as forty independent 48×48 Core V2 definitions. All locked titles are retained. No Levels 331+ were authored. Existing Levels 1–290 content and witnesses are unchanged.

40/40 structure and exact productive witnesses pass. Every final witness reaches win with zero uncleared pixels, empty Holding, three empty tunnels, zero pending arrivals, zero rejected actions/Gate losses and zero item use. Default bounded solver: 31 PASS, 9 INCONCLUSIVE. Witness-proven inconclusive IDs: 294, 296, 299, 300, 303, 304, 306, 307, 320.

Runtime registry and source agree through 330, with exactly one active definition per ID. All new packets use `replacesLegacy=false`. Publication remains `PUBLISHED_MAX_LEVEL=50`, `CAMPAIGN_VERSION='v2-50'`; the new block is dev-only. No commit or push.

## Silver implementation

Palette 41 → 42. The exact previous 41 IDs retain their order; silver is appended once. Fill `#BEBEBA`, rim `#E2E2DE`, label `SILVER`, Studio character `k`, and orbit parts `[{p:"ring",scale:0.7},{p:"bar",angle:0,len:0.95}]` match the locked specification. M16B artwork legends also encode silver as `k`; cerulean uses the distinct packet-local character `p`. The extension record is `content/palettes/world-30-palette-extension.json`.

Silver is available through the derived validator, Studio and analysis lists, direct fill/rim/label lookups and RN/Skia material/assist rendering. Unknown colors reject in artwork and tunnel definitions. Unique names, shapes at full/compact/minimal detail, character mapping and Studio round trip are tested.

**Corrected real implementation defect:** the RN renderer's generic minimum stroke closed the small orbit ring at 5.6–6pt. Reported before correction; the shared `assistStrokeWidth` caps only silver at `size × 0.08`. RN and Skia use the same correction. Fill, rim, primitive geometry and Studio mapping were not changed. The test checks open space above/below the crossing bar. Existing-color stroke behavior is unchanged.

Production pixels and 28pt Pal shells were reviewed OFF/ON at 2× and 3×, including white, stone, sage, sand, ice, navy and indigo adjacency plus near-black backgrounds. The neutral fill remains distinct; the orbit's protruding bar and small ring are legible after correction. Browser evidence: `dist/m16b/silver-2x.png`, `silver-3x.png`; both had 16 Skia canvases, ready state and no console errors. This is desktop browser verification at phone-like logical dimensions, not a physical iOS device claim.

## World metrics

| World | Mean pixels | Mean occupancy | Pal total | Pal range | Witness range | Small Pals |
|---|---:|---:|---:|---|---|---:|
| 30 | 2184.6 | 94.82% | 766 | 57–97 | 79–132 | 23 |
| 31 | 2205.4 | 95.72% | 737 | 58–90 | 81–121 | 18 |
| 32 | 2174.2 | 94.37% | 692 | 52–85 | 64–123 | 21 |
| 33 | 2168.7 | 94.13% | 615 | 49–86 | 68–108 | 14 |

Occupancy is filled cells / 2304. Pals count initial queued charges; relaunches are H actions. Strategic bridges use the existing audit convention: one Pal clears at least six pixels initially, then at least six in a later pass delayed by three or more actions. Holding peaks/full states are sampled after production actions with Gate arrivals settled.

## Per-level certificates

| ID | Title | Dimensions | Pixels | Occupancy | Colors | Pals | Witness | Relaunches | Bridges | Peak H | Cap 1–2 | Solver | Visual |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 291 | The Moon Weaver | 48×48 | 2146 | 93.14% | 14 | 83 | 105 | 22 | 4 | 3 | 4 | PASS | PASS |
| 292 | Sun-Eater Wolf | 48×48 | 2180 | 94.62% | 15 | 69 | 102 | 33 | 11 | 3 | 0 | PASS | PASS |
| 293 | The Orbit Diadem | 48×48 | 2134 | 92.62% | 16 | 89 | 109 | 20 | 5 | 3 | 8 | PASS | MINOR |
| 294 | Cupped Hands | 48×48 | 2228 | 96.70% | 13 | 57 | 85 | 28 | 13 | 3 | 1 | INCONCLUSIVE | PASS |
| 295 | Sleeping Crescent | 48×48 | 2087 | 90.58% | 12 | 67 | 79 | 12 | 1 | 2 | 6 | PASS | PASS |
| 296 | Nebula Throne | 48×48 | 2220 | 96.35% | 15 | 68 | 94 | 26 | 10 | 3 | 0 | INCONCLUSIVE | PASS |
| 297 | Dawn Scarab | 48×48 | 2184 | 94.79% | 15 | 86 | 117 | 31 | 10 | 3 | 0 | PASS | PASS |
| 298 | Twin Heavens | 48×48 | 2202 | 95.57% | 15 | 82 | 105 | 23 | 8 | 3 | 0 | PASS | PASS |
| 299 | Sky Bearers | 48×48 | 2220 | 96.35% | 16 | 68 | 96 | 28 | 12 | 3 | 1 | INCONCLUSIVE | PASS |
| 300 | The Astral Sovereign | 48×48 | 2245 | 97.44% | 20 | 97 | 132 | 35 | 14 | 3 | 3 | INCONCLUSIVE | PASS |
| 301 | Corroded Mechanism | 48×48 | 2215 | 96.14% | 14 | 79 | 100 | 21 | 11 | 3 | 1 | PASS | PASS |
| 302 | Clepsydra | 48×48 | 2133 | 92.58% | 14 | 65 | 89 | 24 | 10 | 3 | 0 | PASS | PASS |
| 303 | Solstice Engine | 48×48 | 2206 | 95.75% | 15 | 77 | 107 | 30 | 10 | 3 | 2 | INCONCLUSIVE | PASS |
| 304 | The Elephant Clock | 48×48 | 2227 | 96.66% | 15 | 89 | 121 | 32 | 13 | 3 | 0 | INCONCLUSIVE | MINOR |
| 305 | The Burning Mirror | 48×48 | 2141 | 92.93% | 13 | 75 | 87 | 12 | 3 | 2 | 7 | PASS | PASS |
| 306 | The Turning Pyramid | 48×48 | 2238 | 97.14% | 14 | 65 | 90 | 25 | 11 | 3 | 2 | INCONCLUSIVE | PASS |
| 307 | Armillary Vault | 48×48 | 2176 | 94.44% | 15 | 62 | 86 | 24 | 11 | 3 | 1 | INCONCLUSIVE | PASS |
| 308 | The Geared Deity | 48×48 | 2232 | 96.88% | 14 | 90 | 114 | 24 | 8 | 3 | 2 | PASS | PASS |
| 309 | Wind Organ Cliff | 48×48 | 2201 | 95.53% | 15 | 58 | 81 | 23 | 12 | 3 | 3 | PASS | PASS |
| 310 | The Buried Reckoner | 48×48 | 2285 | 99.18% | 17 | 77 | 106 | 29 | 9 | 3 | 0 | PASS | PASS |
| 311 | Plaza of Colors | 48×48 | 2112 | 91.67% | 15 | 54 | 84 | 30 | 11 | 3 | 1 | PASS | PASS |
| 312 | Thousand Kites | 48×48 | 2088 | 90.62% | 16 | 52 | 80 | 28 | 13 | 3 | 2 | PASS | PASS |
| 313 | Petal Carpet | 48×48 | 2244 | 97.40% | 17 | 73 | 98 | 25 | 13 | 3 | 6 | PASS | PASS |
| 314 | Wicker Giants | 48×48 | 2149 | 93.27% | 15 | 71 | 89 | 18 | 10 | 3 | 2 | PASS | PASS |
| 315 | Ribbon Pole | 48×48 | 2094 | 90.89% | 14 | 53 | 64 | 11 | 2 | 2 | 2 | PASS | PASS |
| 316 | Snow Sculpture Park | 48×48 | 2184 | 94.79% | 16 | 71 | 93 | 22 | 11 | 3 | 0 | PASS | PASS |
| 317 | Arches of Light | 48×48 | 2202 | 95.57% | 17 | 72 | 93 | 21 | 6 | 3 | 4 | PASS | PASS |
| 318 | Mask Hill | 48×48 | 2214 | 96.09% | 18 | 85 | 108 | 23 | 9 | 3 | 1 | PASS | PASS |
| 319 | Feathered Dancers | 48×48 | 2178 | 94.53% | 17 | 77 | 108 | 31 | 11 | 3 | 1 | PASS | PASS |
| 320 | Festival of the Turning World | 48×48 | 2277 | 98.83% | 21 | 84 | 123 | 39 | 14 | 3 | 2 | INCONCLUSIVE | PASS |
| 321 | Floating Grazers | 48×48 | 2112 | 91.67% | 14 | 65 | 96 | 31 | 11 | 3 | 2 | PASS | PASS |
| 322 | Glasswing Moths | 48×48 | 2196 | 95.31% | 14 | 61 | 89 | 28 | 10 | 3 | 1 | PASS | PASS |
| 323 | Gillwood | 48×48 | 2208 | 95.83% | 14 | 71 | 95 | 24 | 7 | 3 | 1 | PASS | PASS |
| 324 | Five-Fold Remains | 48×48 | 2131 | 92.49% | 15 | 49 | 80 | 31 | 11 | 3 | 1 | PASS | PASS |
| 325 | The Tierleaf | 48×48 | 2064 | 89.58% | 12 | 56 | 68 | 12 | 3 | 2 | 0 | PASS | PASS |
| 326 | The Waking Hill | 48×48 | 2180 | 94.62% | 16 | 66 | 92 | 26 | 12 | 3 | 1 | PASS | PASS |
| 327 | Polyp Tower | 48×48 | 2172 | 94.27% | 16 | 52 | 72 | 20 | 10 | 3 | 1 | PASS | PASS |
| 328 | Tendril Meadow | 48×48 | 2196 | 95.31% | 16 | 60 | 87 | 27 | 9 | 3 | 0 | PASS | PASS |
| 329 | Spore Burst | 48×48 | 2188 | 94.97% | 15 | 49 | 76 | 27 | 14 | 3 | 1 | PASS | PASS |
| 330 | The World-Carrier | 48×48 | 2240 | 97.22% | 18 | 86 | 108 | 22 | 14 | 3 | 6 | PASS | PASS |

## Queues, safe merges and small Pals

Queues were authored offline against `resolveEpochLaunch` and `applyActionWithArrivals` on each final board. The author measures exposed front encounters, assigns capacities from actual same-color remaining regions, reserves delayed value for selected Pals, and distributes the resulting sequence over exactly three tunnels. All final immutable packets are separately replayed. No engine targeting, launch spacing, drilling, Active, Holding or Gate behavior was modified.

569 safe merges retained: 500 within a tunnel and 69 across tunnels. Candidates combine matching colors into an earlier Pal and remove the later queued Pal; the identity-aware route is reconstructed and must replay to a productive clean win. Some removed launches become productive relaunches rather than reducing action count. Breathers additionally require Holding peak ≤2 and no more than twelve relaunches. Earlier merges that violated breather relief were rolled back and are excluded from these retained totals. Full capacities/positions are in the machine certificate.

Remaining capacity 1–2 inventory: 76; 72 NECESSARY, 4 SUSPICIOUS, 0 remaining MERGEABLE under the tested safe transformations. NECESSARY means a production probe with the entire remaining color budget exposed no more than two hits at this witness window. It is a route-local observation, not a universal proof that every winning route needs this capacity.

| Suspicious ID | Tunnel/position | Color/capacity | Witness step | Exposed matching front |
|---|---|---|---:|---:|
| 299 | T1/10 | cerulean/1 | 53 | 7 |
| 300 | T3/20 | ultramarine/1 | 71 | 4 |
| 307 | T1/4 | umber/1 | 22 | 4 |
| 314 | T3/14 | lavender/2 | 45 | 6 |

These four Pals have more productive exposed targets than their assigned capacity, while other Pals hold the remaining budget. Tested safe same-color transformations failed productive exact replay or relief constraints. They remain explicitly suspicious, not relabelled necessary.

| ID with ≥3 consecutive small launches | Step runs |
|---|---|
| 293 | 98,99,100,101,102 |
| 313 | 91,92,93; 95,96,97 |
| 317 | 89,90,91 |
| 330 | 98,99,100,101,102,103 |

The longest run is 6 initial launches of capacity 1–2. Runs count consecutive witness steps, so an intervening productive relaunch or larger launch breaks the train. All inventory entries and their actual front exposures are retained in the certificate; no empty or zero-hit cleanup action remains.

## Breathers and finales

| ID | Pals | Actions | Relaunches | Bridges | Peak H | H-full states |
|---|---:|---:|---:|---:|---:|---:|
| 295 | 67 | 79 | 12 | 1 | 2 | 0 |
| 300 | 97 | 132 | 35 | 14 | 3 | 42 |
| 305 | 75 | 87 | 12 | 3 | 2 | 0 |
| 310 | 77 | 106 | 29 | 9 | 3 | 59 |
| 315 | 53 | 64 | 11 | 2 | 2 | 0 |
| 320 | 84 | 123 | 39 | 14 | 3 | 43 |
| 325 | 56 | 68 | 12 | 3 | 2 | 0 |
| 330 | 86 | 108 | 22 | 14 | 3 | 45 |

All four breathers retain peak Holding 2, no H-full states, and lower action, relaunch and bridge counts than the mean of their nine world peers. They remain substantial late-campaign puzzles, with 64–87 productive actions. The tests compare within-world relief; there are no brittle monotonic difficulty assertions.

300 is a major visual milestone: 2245 pixels (within 2245–2275), 20 colors, a continuous silver body rim, fully enclosed dark eclipse, three-quarter seated knee/arm outline, held planet, bright river and tiny mortal shrine. Its 132 productive actions sit two above the finale guidance but below the 135 avoidance threshold; the extra actions follow separated rim, corona, crown, river and interior fronts, with no padding. The eclipse/rim/river/shrine are pinned by independent coordinate checks.

310 emphasizes a shielded three-level excavation and buried core; 320 emphasizes separated celebrations joined by a corridor over a curved world; 330 emphasizes hanging life and the underside silhouette. Their 106, 123 and 108 actions are accepted as natural geometry-derived routes, without padding them to the nominal 110-action lower guide. Finale bridge counts are 14/9/14/14, so none is defined by length or density alone.

## Finale deviation samples

Meaningful samples span early, middle and later witness states. Each finale tests alternate openings, premature high-capacity launches, skipped productive Holding, bridge timing and visible forks. Recovery uses identity-aware route repair, production heuristics and a separate diagnostic search of at most 2500 nodes / 2.5 seconds; it does not alter the default campaign solver caps. A failed bounded recovery is UNCLEAR, not a fatal proof.

| Finale | Recoverable | Fatal | Unclear | Samples |
|---|---:|---:|---:|---:|
| 300 | 9 | 0 | 0 | 9 |
| 310 | 10 | 0 | 0 | 10 |
| 320 | 10 | 0 | 0 | 10 |
| 330 | 10 | 0 | 0 | 10 |

All sampled deviations recovered; none demonstrated a hidden single-mistake trap. This is sampling, not exhaustive fairness proof. 300 supplied one qualifying high-capacity alternative at its selected window, yielding nine distinct samples. Detailed steps/actions, hit counts and post-deviation Holding/pending occupancy follow.

| Finale | Category | Step | Alternative | Hits | H/pending | Classification |
|---|---|---:|---|---:|---|---|
| 300 | alternative openings | 1 | tunnel tunnel-0 | 40 | 0/0 | recoverable |
| 300 | alternative openings | 1 | tunnel tunnel-1 | 37 | 0/0 | recoverable |
| 300 | premature high-capacity launch | 14 | tunnel tunnel-0 | 18 | 1/0 | recoverable |
| 300 | skipped productive Holding relaunch | 34 | tunnel tunnel-0 | 32 | 3/0 | recoverable |
| 300 | skipped productive Holding relaunch | 34 | tunnel tunnel-2 | 13 | 3/1 | recoverable |
| 300 | bridge timing mistake | 55 | tunnel tunnel-1 | 25 | 3/0 | recoverable |
| 300 | bridge timing mistake | 55 | tunnel tunnel-0 | 23 | 2/0 | recoverable |
| 300 | obvious route fork | 73 | tunnel tunnel-0 | 18 | 3/0 | recoverable |
| 300 | obvious route fork | 73 | holding L300-t0-c4 | 6 | 3/0 | recoverable |
| 310 | alternative openings | 1 | tunnel tunnel-0 | 52 | 0/0 | recoverable |
| 310 | alternative openings | 1 | tunnel tunnel-2 | 58 | 0/0 | recoverable |
| 310 | premature high-capacity launch | 11 | tunnel tunnel-1 | 35 | 3/0 | recoverable |
| 310 | premature high-capacity launch | 11 | tunnel tunnel-0 | 34 | 3/0 | recoverable |
| 310 | skipped productive Holding relaunch | 30 | tunnel tunnel-2 | 19 | 3/1 | recoverable |
| 310 | skipped productive Holding relaunch | 30 | tunnel tunnel-1 | 22 | 3/0 | recoverable |
| 310 | bridge timing mistake | 44 | tunnel tunnel-0 | 23 | 3/1 | recoverable |
| 310 | bridge timing mistake | 44 | tunnel tunnel-2 | 33 | 3/0 | recoverable |
| 310 | obvious route fork | 59 | tunnel tunnel-0 | 22 | 3/0 | recoverable |
| 310 | obvious route fork | 59 | tunnel tunnel-2 | 22 | 3/0 | recoverable |
| 320 | alternative openings | 1 | tunnel tunnel-0 | 84 | 0/0 | recoverable |
| 320 | alternative openings | 1 | tunnel tunnel-2 | 107 | 1/0 | recoverable |
| 320 | premature high-capacity launch | 13 | tunnel tunnel-1 | 32 | 3/0 | recoverable |
| 320 | premature high-capacity launch | 13 | tunnel tunnel-2 | 27 | 2/0 | recoverable |
| 320 | skipped productive Holding relaunch | 32 | tunnel tunnel-1 | 27 | 3/1 | recoverable |
| 320 | skipped productive Holding relaunch | 32 | tunnel tunnel-0 | 18 | 3/1 | recoverable |
| 320 | bridge timing mistake | 53 | tunnel tunnel-0 | 19 | 3/1 | recoverable |
| 320 | bridge timing mistake | 53 | tunnel tunnel-2 | 7 | 3/1 | recoverable |
| 320 | obvious route fork | 68 | tunnel tunnel-1 | 33 | 3/0 | recoverable |
| 320 | obvious route fork | 68 | tunnel tunnel-2 | 24 | 2/0 | recoverable |
| 330 | alternative openings | 1 | tunnel tunnel-1 | 95 | 1/0 | recoverable |
| 330 | alternative openings | 1 | tunnel tunnel-2 | 11 | 0/0 | recoverable |
| 330 | premature high-capacity launch | 11 | tunnel tunnel-2 | 45 | 2/0 | recoverable |
| 330 | premature high-capacity launch | 11 | tunnel tunnel-1 | 0 | 3/0 | recoverable |
| 330 | skipped productive Holding relaunch | 32 | tunnel tunnel-1 | 21 | 3/1 | recoverable |
| 330 | skipped productive Holding relaunch | 32 | tunnel tunnel-2 | 29 | 3/1 | recoverable |
| 330 | bridge timing mistake | 46 | tunnel tunnel-0 | 25 | 3/0 | recoverable |
| 330 | bridge timing mistake | 46 | tunnel tunnel-2 | 13 | 3/0 | recoverable |
| 330 | obvious route fork | 60 | holding L330-t1-c7 | 13 | 2/0 | recoverable |
| 330 | obvious route fork | 60 | tunnel tunnel-0 | 14 | 2/0 | recoverable |

## Bot diagnostics

| Policy | Won | Lost | Other |
|---|---:|---:|---:|
| round-robin | 0 | 40 | 0 |
| greedy | 0 | 40 | 0 |
| drain | 0 | 40 | 0 |
| noWaste | 6 | 34 | 0 |
| holding-first | 35 | 5 | 0 |

Productive-Holding-first wins 35/40 (87.5%), a very high percentage again. This is reported directly; content was not tuned to defeat that heuristic. Round-robin, greedy and drain lose every board; noWaste wins six. Strong heuristic success means these boards do not provide evidence of uniformly deep search difficulty merely because their artwork is unusual.

## Default solver

After exact certification, `findFirstWinningWitness` ran with the unchanged default 100,000-node / 30-second limits. Revised breathers and final 320 were rerun after their queue/art changes. 31 PASS / 9 INCONCLUSIVE; IDs 294, 296, 299, 300, 303, 304, 306, 307, 320. Every inconclusive definition has an independent exact authored witness. Per-level nodes, elapsed times and cap flags are included in the machine certificate.

## Production visual review

All forty final imported boards were reviewed using production `StaticPixelField` with assist OFF and ON at logical width 347pt and 2× pixels. Eight contact sheets are in `dist/m16b/world30-off-2x.png` through `world33-on-2x.png`. Updated World 32 was rendered again after the petal correction. Page verification passed ready state, ten canvases and no captured console errors on each board page. The palette sample pages passed at both 2× and 3×.

Final classification: **38 PASS, 2 MINOR, 0 unresolved REAL DEFECT**.

- **293 MINOR:** Crossing orbital loops compress into a busy central junction; five jewels, tilted diadem and horizon remain distinct.
- **304 MINOR:** The small open flank mechanism is dense at phone scale; elephant, raised tower and trunk remain clear.

The real RN orbit stroke defect described above was corrected and re-reviewed. No unresolved subject/composition failure, severe close-color merge, accidental artifact or visual mud remains.

| ID | Classification | Composition / review |
|---|---|---|
| 291 | PASS | Veiled left figure, crescent thread and unfinished loom with a woven mountain band. |
| 292 | PASS | Diagonal leaping wolf; silver body rim and open jaw-to-sun interval. |
| 293 | MINOR | Crossing orbital loops compress into a busy central junction; five jewels, tilted diadem and horizon remain distinct. |
| 294 | PASS | Two cupped hands cradle a bright galaxy spiral; fingers join at the lower bowl. |
| 295 | PASS | One sleeping crescent, attached inner-edge profile and broad painted star cloud. |
| 296 | PASS | Empty nebula throne with a true dark absent sitter and stepped astral dais. |
| 297 | PASS | Broad scarab emblem lifting a separate dawn sun through two foreleg bridges. |
| 298 | PASS | Back-to-back day/night profiles with bright hair crossing between the halves. |
| 299 | PASS | Four rimmed sky bearers under one continuous constellation dome and world band. |
| 300 | PASS | Seated rim-defined god, true eclipse head, raised-hand star river, nested held planet and tiny red-door shrine. |
| 301 | PASS | Stone fragment housing three exposed corroded gear structures and a dial. |
| 302 | PASS | Five stepped stone water basins and bronze spouts feeding a vertical float tower. |
| 303 | PASS | Pierced monolith with three bronze pointer arms aligned to a horizon sun. |
| 304 | MINOR | The small open flank mechanism is dense at phone scale; elephant, raised tower and trunk remain clear. |
| 305 | PASS | Large parabolic bronze dish on a stone tower; one straight beam over the sea. |
| 306 | PASS | Stepped pyramid: exterior left courses, interior right shafts, counterweights and drum. |
| 307 | PASS | Tilted bronze/gold/verdigris armillary loops around one teal core under an oculus. |
| 308 | PASS | Seated half-stone, half-exposed mechanism with a jagged silver erosion seam. |
| 309 | PASS | Three groups of irregular-height stone wind pipes, dark mouths and lower caves. |
| 310 | PASS | Tiny surface dig, a narrow excavation shaft, gear gallery, drum hall and buried core. |
| 311 | PASS | Three large powder clouds rising directly from one crowd mass between pale buildings. |
| 312 | PASS | One fish kite, five linked centipede segments and two diamond kites over a town. |
| 313 | PASS | Three six-lobed flowers with single-colour centres and leaf lobes between roof columns. |
| 314 | PASS | Two human-proportioned wicker giants, broad bronze weave bands and crossing ribbons. |
| 315 | PASS | Off-centre flower hub with eight plain coloured ribbons and endpoint dancers. |
| 316 | PASS | Three pale sculpture masses: castle, whale and a legged bear with off-centre lavender glow. |
| 317 | PASS | Six solid-colour nested light arches; sparse crown bulbs and a perspective street. |
| 318 | PASS | Five large three-colour masks on plain plaster, void eyes and one ivory stair. |
| 319 | PASS | Four dancers of increasing scale, each with a tall three-band backpiece, body and legs. |
| 320 | PASS | Curved day/night planet with three rim-city signatures, three connected petal blooms and an angled aurora. |
| 321 | PASS | Primary giant grazer; two smaller calves; five spire plants on a painted plain. |
| 322 | PASS | Dominant framed moth and smaller moth; filled ice panes and one coiled fern. |
| 323 | PASS | Central five-shelf gill tree plus two smaller two-shelf trees; broad magenta gill bands. |
| 324 | PASS | Five unequal ivory arms with sand channels on a dark basin, tip life and one void hub. |
| 325 | PASS | Five alternating amethyst/seafoam tiers; separate lavender/blush sky and smooth dune. |
| 326 | PASS | One huge eye with dark slit in a banded living hill, exactly three ridge trees. |
| 327 | PASS | Curling coral polyp colony, three gold flyers, painted pool and ground shade. |
| 328 | PASS | One pale grazer crossing four solid wave bands, with a painted umber wake. |
| 329 | PASS | Puffball feeds five growing billowing cloud forms; tip organisms and a dormant counterweight. |
| 330 | PASS | Manta underside, wing gill slits, three hanging forests, two falls, four fungal towers and lake; no belly face. |

### World 32 fragmentation

The revisions survive production: three broad cloud masses with no stems, at most five kite forms, six-lobed flowers instead of targets, two human-proportioned wicker giants, a simple eight-ribbon breather, a bear silhouette with offset glow, solid-color arches, five large masks, four upright-backpiece dancers and a visibly curved planetary finale. No single-pixel decoration is the primary visual language.

320 initially measured 38 same-color fragments of ≤4 cells because the thin eight-spoke radials were disconnected. Broader three-cell spokes and same-color inner loops now produce connected petal blooms, keeping the void hearts and all three blooms. The geometry was reauthored, merged, certified and solver-tested after that correction.

| ID | Same-color components | Fragments ≤4 |
|---|---:|---:|
| 311 | 25 | 4 |
| 312 | 37 | 11 |
| 313 | 33 | 6 |
| 314 | 55 | 6 |
| 315 | 47 | 17 |
| 316 | 28 | 4 |
| 317 | 50 | 16 |
| 318 | 29 | 2 |
| 319 | 45 | 7 |
| 320 | 44 | 13 |
| 321 | 48 | 7 |
| 322 | 41 | 12 |
| 323 | 60 | 2 |
| 324 | 54 | 10 |
| 325 | 22 | 2 |
| 326 | 34 | 3 |
| 327 | 40 | 11 |
| 328 | 34 | 3 |
| 329 | 42 | 13 |
| 330 | 50 | 5 |

The fragment metric uses four-neighbour color connectivity and counts narrow deliberate structures as well as decoration. Small named elements include dancers, kite strings, sparse bulbs, void-eye borders, tip organisms and the shrine.

### World 33 hierarchy

Each board has the reviewed primary form, secondary life and environmental frame. The giant grazer dominates two calves; glass panes are filled; Gillwood has broad gill bands and reduced shelf counts; ivory skeleton arms contrast against a dark basin; Tierleaf uses a separate sky palette; Waking Hill has one eye and three trees; the polyp arch has painted shade; the wake is umber; Spore Burst is a billowing five-cloud chain; the carrier has no paired belly marks. All ten read as intentional life/environment at phone scale.

### Existing close pairs

Graphite/navy/slate remain roles of dark body, carved aperture and cooler housing; silver/ivory borders reinforce key nested machinery. Bronze/umber are separated by gold spokes and patina; brown is burial soil or roofs rather than adjacent bronze interiors. Rose/maroon and pink/magenta accents use broad distinct regions and contrasting frames. Alien green-family masses use dark stems/ribs, while bright cloud/water and wing panes are bounded by darker or warm frames. Assist ON preserves distinct marks. The two minor issues above are the only retained crowded structures. No global hex edits were made.

## Numeric guidance and implementation variations

No titles or approved subject concepts were redesigned. Coordinates, material planes and void locations were curated within the authorized final-art scope. All bright sky, glass, snow, cloud, shade and wake regions are filled; void represents darkness, eclipse, true apertures or deliberate rounded dark framing.

Several boards retain fewer colors than the original design ranges to keep connected masses readable and avoid adding scattered tokens solely to meet a count. These are explicit numeric departures, not extra colors or changed subjects:

| ID | Final colors | Design range |
|---|---:|---|
| 291 | 14 | 15–17 |
| 294 | 13 | 16–18 |
| 295 | 12 | 13–15 |
| 296 | 15 | 16–18 |
| 297 | 15 | 16–18 |
| 298 | 15 | 17–19 |
| 299 | 16 | 17–19 |
| 308 | 14 | 15–17 |
| 311 | 15 | 17–19 |
| 314 | 15 | 16–18 |
| 317 | 17 | 18–20 |
| 323 | 14 | 15–17 |
| 329 | 15 | 16–18 |

Density departures are small: 303 = 2206 vs 2140–2190 (+16); 305 = 2141 vs 2090–2140 (+1); 311 = 2112 vs 2120–2170 (−8). They preserve their slot/beam/building geometry rather than altering the drawing for an exact numeric cutoff. All other final densities fit their revised per-level ranges. World means remain close to the design philosophy, and no board is pushed to 2300. Witnesses below the nominal normal/finale bands reflect natural efficient routes; no actions were padded.

## Validation and performance

- 22 targeted Jest suites: 834 tests pass across the targeted run plus failure-specific/final reruns. Coverage includes Worlds 30–33, changed historical registry/palette expectations, exact witnesses, publication/dev gating, color assist, world skins and Studio serialization. The initial campaign metadata test had a stale 29-world array; the 33-world array now passes.
- Final M16B witness-aware validator: 40 passed, 0 failed, 0 warnings.
- Full source registry witness-aware validator, explicit range 1–330: 330 passed, 0 failed, 0 warnings.
- `npx tsc --noEmit`: PASS.
- ESLint on touched/new TypeScript and TSX: PASS.
- `git diff --check`: PASS.

Runtime palette access remains direct lookup. Studio/validator registries still derive once from `ORB_COLOR_IDS`. Skia retains one-pass grouping and cached per-color/reachability render buckets. The new silver stroke rule is a constant-time per-mark/bucket calculation; it introduces no board × palette × frame scan. Offline raster authoring, diagnostics and solver scripts are not imported into runtime. No physical-device frame-time profiling was performed.

## Files and evidence

- Source packets: `content/levels/world-30.json` through `world-33.json`.
- Compiled modules: `src/game/levels/compiledWorld30.ts` through `compiledWorld33.ts`.
- Dedicated offline tools: `scripts/m16b-art.py`, `m16b-author.ts`, `m16b-audit.ts`.
- Targeted tests: `campaignV2World3033.test.ts`, `paletteWorld3033.test.ts`; historical count expectations updated.
- Machine certificate: `docs/audits/M16B_LEVELS_291_330_CERTIFICATES.json`, including all metrics, definition hashes, remaining small-Pal inventory, retained merge histories, solver results, bots and deviation samples.
- Review evidence and command logs: local ignored `dist/m16b/`.

`git diff --stat` below reports tracked modifications only; new/untracked packets, modules, scripts, tests and report are listed separately by `git status --short`. No staging, commit or push was performed.

```text
src/components/ColorAssistMark.tsx                           |  3 ++-
 src/game/engine/types.ts                                     |  3 ++-
 src/game/levels/__tests__/campaignMetadata.test.ts           | 12 ++++++++----
 src/game/levels/__tests__/campaignV2World1316.test.ts        |  2 +-
 src/game/levels/__tests__/campaignV2World1720.test.ts        |  2 +-
 src/game/levels/__tests__/campaignV2World2124.test.ts        |  2 +-
 src/game/levels/__tests__/campaignV2World25.test.ts          |  6 +++---
 src/game/levels/__tests__/campaignV2World2629.test.ts        | 10 +++++-----
 src/game/levels/__tests__/campaignV2World912.test.ts         |  2 +-
 src/game/levels/__tests__/levelDefinitions.test.ts           |  2 +-
 src/game/levels/__tests__/publishedCampaign.test.ts          |  2 +-
 src/game/levels/authoring/__tests__/paletteWorld1316.test.ts | 12 ++++++------
 src/game/levels/authoring/__tests__/paletteWorld1720.test.ts |  6 +++---
 src/game/levels/authoring/__tests__/paletteWorld2124.test.ts |  8 ++++----
 src/game/levels/authoring/__tests__/paletteWorld25.test.ts   |  6 +++---
 src/game/levels/authoring/__tests__/paletteWorld2629.test.ts |  8 ++++----
 src/game/levels/authoring/__tests__/paletteWorld6.test.ts    |  2 +-
 src/game/levels/authoring/__tests__/paletteWorld78.test.ts   | 12 ++++++------
 src/game/levels/authoring/__tests__/paletteWorld912.test.ts  | 12 ++++++------
 src/game/levels/campaign.ts                                  |  6 +++++-
 src/game/levels/levels.ts                                    | 10 +++++++++-
 src/game/rendering/StaticPixelField.tsx                      |  4 ++--
 src/game/rendering/__tests__/colorAssist.test.ts             | 12 ++++++------
 src/game/studio/grid.ts                                      |  5 +++--
 src/theme/__tests__/worldSkins.test.ts                       |  1 +
 src/theme/colorAssist.ts                                     | 11 +++++++++--
 src/theme/colors.ts                                          |  5 ++++-
 src/theme/worldSkins.ts                                      |  6 +++++-
 28 files changed, 103 insertions(+), 69 deletions(-)
```
