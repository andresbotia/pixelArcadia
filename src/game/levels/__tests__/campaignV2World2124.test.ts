import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { createGame } from '../../engine/createGame';
import { applyActionWithArrivals } from '../../engine/holdingArrival';
import { parseAuthoredJSON } from '../authoring/loader';
import { validateLevelPacket, validateLevelStructure } from '../authoring/validate';
import { devLevelIndex } from '../devLevelIndex';
import { getLevel, LEVEL_DEFINITIONS } from '../levels';
import { isPublishedCampaignLevel, nextPublishedLevelId } from '../publishedCampaign';
import { CAMPAIGN_VERSION, PUBLISHED_MAX_LEVEL } from '../publishing';

// Independent author certificate: pixels, colors, Pals, witness, peak Holding, bridges, cleanup.
const EXPECTED: Record<number, [number, number, number, number, number, number, number]> = {
  201: [2250, 21, 95, 118, 3, 8, 2],
  202: [2254, 22, 99, 115, 3, 9, 3],
  203: [2258, 22, 91, 116, 3, 9, 2],
  204: [2262, 22, 108, 122, 3, 8, 3],
  205: [2236, 18, 83, 90, 2, 4, 2],
  206: [2270, 21, 88, 109, 3, 10, 3],
  207: [2274, 19, 71, 88, 3, 9, 3],
  208: [2278, 22, 106, 124, 3, 9, 3],
  209: [2282, 21, 91, 111, 3, 9, 3],
  210: [2290, 19, 99, 114, 3, 9, 3],
  211: [2258, 22, 98, 116, 3, 6, 3],
  212: [2262, 21, 101, 123, 3, 6, 3],
  213: [2266, 20, 90, 102, 3, 7, 3],
  214: [2270, 19, 83, 107, 3, 8, 4],
  215: [2244, 18, 89, 102, 2, 5, 2],
  216: [2278, 21, 83, 109, 3, 6, 3],
  217: [2282, 20, 91, 104, 3, 6, 3],
  218: [2286, 20, 95, 116, 3, 9, 3],
  219: [2290, 17, 61, 79, 3, 7, 3],
  220: [2290, 21, 100, 124, 3, 10, 3],
  221: [2266, 19, 71, 85, 3, 8, 3],
  222: [2270, 22, 104, 132, 3, 8, 3],
  223: [2274, 22, 104, 123, 3, 9, 3],
  224: [2278, 22, 100, 115, 3, 10, 3],
  225: [2252, 18, 77, 95, 2, 7, 2],
  226: [2286, 20, 91, 115, 3, 8, 4],
  227: [2290, 19, 101, 122, 3, 9, 3],
  228: [2294, 22, 96, 116, 3, 9, 3],
  229: [2295, 21, 82, 109, 3, 10, 3],
  230: [2295, 22, 112, 130, 3, 10, 3],
  231: [2274, 21, 95, 113, 3, 9, 3],
  232: [2278, 20, 100, 115, 3, 7, 2],
  233: [2282, 21, 97, 115, 3, 10, 3],
  234: [2286, 19, 87, 105, 3, 9, 3],
  235: [2260, 18, 86, 103, 2, 6, 2],
  236: [2294, 21, 97, 116, 3, 8, 4],
  237: [2295, 21, 100, 116, 3, 9, 3],
  238: [2295, 21, 89, 116, 3, 10, 3],
  239: [2295, 21, 109, 122, 3, 9, 3],
  240: [2295, 22, 108, 134, 3, 9, 4],
};
const imported = LEVEL_DEFINITIONS.filter(l => l.id >= 201 && l.id <= 240);

test('four world modules select the authored definitions exactly, preserving the stable handoff content', () => {
  expect(imported).toHaveLength(40);
  const ids = LEVEL_DEFINITIONS.map(l => l.id);
  expect(ids).toEqual(Array.from({ length: 500 }, (_, i) => i + 1));
  expect(new Set(ids).size).toBe(ids.length);
  for (const world of [21, 22, 23, 24]) {
    const raw = fs.readFileSync(path.resolve(`content/levels/world-${String(world).padStart(2, '0')}.json`), 'utf8');
    const packet = parseAuthoredJSON(raw);
    expect(packet.errors).toEqual([]);
    expect(packet.levels).toHaveLength(10);
    for (const def of packet.levels) expect(getLevel(def.id)).toEqual(def);
  }
});

test.each(imported)('level $id preserves all author metrics and wins without items or rejected actions', def => {
  const [pixels, colors, pals, witness, peak, bridges, cleanup] = EXPECTED[def.id]!;
  expect(validateLevelPacket(def, { runSolver: false })).toMatchObject({ valid: true, solvability: 'PROVEN_BY_WITNESS' });
  expect(def.ruleset).toBe('coreV2');
  expect(def.holdingCapacity).toBe(3);
  expect(def.tunnels).toHaveLength(3);
  expect(def.replacesLegacy).toBe(false);
  expect(def.themeId).toBe(['storm-elementals', 'galactic-odyssey', 'gothic-kingdom', 'celestial-zodiac'][Math.floor((def.id - 201) / 10)]);
  expect(def.pixelArt).toHaveLength(48);
  expect(def.pixelArt.every(row => row.length === 48)).toBe(true);
  expect(def.tunnels.flat()).toHaveLength(pals);
  expect(def.winningWitness).toHaveLength(witness);
  expect(validateLevelStructure(def).valid).toBe(true);
  let state = createGame(def);
  expect(state.activeCapacity).toBe(5);
  expect(state.pixels).toHaveLength(pixels);
  expect(new Set(state.pixels.map(p => p.color)).size).toBe(colors);
  const need = new Map<string, number>(), have = new Map<string, number>();
  for (const p of state.pixels) need.set(p.color, (need.get(p.color) ?? 0) + 1);
  for (const c of def.tunnels.flat()) have.set(c.color, (have.get(c.color) ?? 0) + c.capacity);
  expect(have).toEqual(need);
  let peakHolding = 0, peakPending = 0, holdingFullStates = 0;
  const launches = new Map<string, { steps: number[]; hits: number[] }>();
  for (const [index, step] of def.winningWitness!.entries()) {
    expect(step).toMatch(/^[TH][1-3]$/); // No item actions.
    const n = Number(step.slice(1)) - 1;
    const charge = step[0] === 'T' ? state.tunnels[n]!.queue[0]! : state.holding[n]!;
    expect(charge).toBeDefined();
    const action = step[0] === 'T' ? { kind: 'tunnel' as const, id: state.tunnels[n]!.id }
      : { kind: 'holding' as const, id: charge.id };
    const before = state.pixels.filter(p => !p.cleared).length;
    const result = applyActionWithArrivals(state, action);
    expect(result.accepted).toBe(true);
    state = result.state;
    const hits = before - state.pixels.filter(p => !p.cleared).length;
    expect(hits).toBeGreaterThan(0);
    const pal = launches.get(charge.id) ?? { steps: [], hits: [] };
    pal.steps.push(index + 1); pal.hits.push(hits); launches.set(charge.id, pal);
    holdingFullStates += state.holding.length === 3 ? 1 : 0;
    peakHolding = Math.max(peakHolding, state.holding.length);
    peakPending = Math.max(peakPending, state.pendingHolding.length);
  }
  expect(state.status).toBe('won');
  expect(state.pixels.filter(p => !p.cleared)).toHaveLength(0);
  expect(state.holding).toHaveLength(0);
  expect(state.pendingHolding).toHaveLength(0);
  expect(peakPending).toBe(0);
  expect(state.tunnels.every(t => t.queue.length === 0)).toBe(true);
  expect(peakHolding).toBe(peak);
  if ([205, 215, 225, 235].includes(def.id)) expect(holdingFullStates).toBe(0);
  const all = [...launches.values()];
  expect(all.filter(p => p.hits[0]! >= 6 && p.steps.slice(1).some((step, j) =>
    step - p.steps[0]! >= 3 && p.hits[j + 1]! >= 6)).length).toBe(bridges);
  expect(all.reduce((sum, p) => sum + p.hits.slice(1).filter(h => h <= 5).length, 0)).toBe(cleanup);
});

// Breathers are relative: peak Holding 2 (asserted above) plus a shorter route and fewer bridges than the
// world's non-breather average. Do not assert "shorter than both neighbours" or a Pal-count rule (215 has 89 Pals vs a W22 average of 89.1).
test.each([205, 215, 225, 235])('breather %i stays lighter than its world average', id => {
  const peers = imported.filter(l => Math.floor((l.id - 1) / 10) === Math.floor((id - 1) / 10) && l.id !== id);
  const avg = (k: number) => peers.reduce((sum, l) => sum + EXPECTED[l.id]![k]!, 0) / peers.length;
  expect(EXPECTED[id]![4]).toBe(2);
  expect(EXPECTED[id]![3]).toBeLessThan(avg(3));
  expect(EXPECTED[id]![5]).toBeLessThan(avg(5));
  expect(EXPECTED[id]![6]).toBeLessThanOrEqual(2);
});

test('all authored levels are available in campaign and developer index', () => {
  expect(PUBLISHED_MAX_LEVEL).toBe(500);
  expect(CAMPAIGN_VERSION).toBe('v1-500');
  expect(nextPublishedLevelId(50)).toBe(51);
  const rows = devLevelIndex();
  for (const def of imported) {
    expect(isPublishedCampaignLevel(def.id)).toBe(true);
    const row = rows.find(r => r.id === def.id)!;
    expect(row.ruleset).toBe('coreV2');
    expect(row.title).toBe(def.title);
    expect(row.witness).toBe(EXPECTED[def.id]![3]);
    expect(row.world).toBe(Math.floor((def.id - 1) / 10) + 1);
  }
});

// Checksums of the authoritative stable handoff level arrays; top-level replacement metadata is excluded.
test('grids, queues, witnesses and level metadata remain byte-equivalent to the source arrays', () => {
  const hashes: Record<number, string> = {
    21: '16f0aaa27f336816fa61d990a28996e43305e4a7818d75fa2306d653ea9a2829',
    22: '5ed4eef836002b5346c72f37ba9fa33d149e769da6d0784e5e584dc3933f9229',
    23: '3f08099f4d8589c850c2a96ab3cfb6de728f8b9b40cab0ab0ff1a835cc9c439f',
    24: '2380808c4d63e0b8a38dfff975a5416c11ddd4b213563153a497328c3d4b038e',
  };
  for (const world of [21, 22, 23, 24]) {
    const packet = JSON.parse(fs.readFileSync(path.resolve(`content/levels/world-${String(world).padStart(2, '0')}.json`), 'utf8'));
    expect(createHash('sha256').update(JSON.stringify(packet.levels)).digest('hex')).toBe(hashes[world]);
  }
});

test.each([210, 220, 230, 240])('finale %i preserves strong route metrics', id => {
  expect(EXPECTED[id]![4]).toBe(3);
  expect(EXPECTED[id]![5]).toBeGreaterThanOrEqual(9);
  expect(EXPECTED[id]![3]).toBeGreaterThanOrEqual(114);
});

test('all 39 tiny Pals are preserved, including the optional merge candidates', () => {
  expect(imported.flatMap(l => l.tunnels.flat()).filter(p => p.capacity <= 2)).toHaveLength(39);
  expect(getLevel(215)!.tunnels[0]!.slice(28, 30).map(p => p.capacity)).toEqual([8, 2]);
  expect(getLevel(235)!.tunnels[0]!.slice(27, 29).map(p => p.capacity)).toEqual([8, 1]);
});
