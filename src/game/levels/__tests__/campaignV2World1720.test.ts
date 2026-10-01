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
  161: [2218, 21, 92, 117, 3, 8, 2],
  162: [2222, 20, 92, 109, 3, 8, 3],
  163: [2226, 21, 80, 98, 3, 7, 3],
  164: [2230, 20, 86, 103, 3, 8, 3],
  165: [2204, 17, 72, 88, 2, 6, 2],
  166: [2238, 21, 101, 112, 3, 7, 3],
  167: [2242, 18, 89, 106, 3, 8, 3],
  168: [2246, 21, 89, 104, 3, 7, 3],
  169: [2250, 19, 78, 94, 3, 8, 3],
  170: [2262, 21, 99, 119, 3, 9, 6],
  171: [2226, 19, 77, 96, 3, 7, 3],
  172: [2230, 19, 82, 103, 3, 7, 3],
  173: [2234, 20, 106, 118, 3, 8, 2],
  174: [2238, 19, 81, 100, 3, 7, 3],
  175: [2212, 16, 78, 94, 2, 5, 2],
  176: [2246, 20, 90, 106, 3, 7, 3],
  177: [2250, 19, 77, 94, 3, 7, 3],
  178: [2254, 18, 70, 88, 3, 8, 1],
  179: [2258, 20, 97, 112, 3, 9, 3],
  180: [2270, 20, 97, 112, 3, 8, 3],
  181: [2234, 18, 85, 106, 3, 8, 3],
  182: [2238, 20, 85, 105, 3, 9, 3],
  183: [2242, 21, 99, 117, 3, 7, 3],
  184: [2246, 18, 81, 95, 3, 7, 3],
  185: [2220, 17, 91, 98, 2, 5, 2],
  186: [2254, 16, 75, 85, 3, 8, 0],
  187: [2258, 20, 79, 98, 3, 9, 3],
  188: [2262, 17, 71, 88, 3, 9, 3],
  189: [2266, 15, 57, 83, 3, 10, 3],
  190: [2278, 18, 93, 109, 3, 9, 3],
  191: [2242, 20, 92, 113, 3, 8, 2],
  192: [2246, 19, 73, 91, 3, 8, 3],
  193: [2250, 21, 95, 110, 3, 6, 3],
  194: [2254, 21, 88, 105, 3, 9, 3],
  195: [2228, 17, 78, 89, 2, 6, 2],
  196: [2262, 19, 79, 97, 3, 7, 3],
  197: [2266, 20, 85, 99, 3, 7, 3],
  198: [2270, 21, 107, 128, 3, 8, 5],
  199: [2274, 21, 110, 128, 3, 10, 2],
  200: [2280, 20, 95, 114, 3, 9, 3],
};
const imported = LEVEL_DEFINITIONS.filter(l => l.id >= 161 && l.id <= 200);

test('four world modules select the authored definitions exactly, preserving the stable handoff content', () => {
  expect(imported).toHaveLength(40);
  const ids = LEVEL_DEFINITIONS.map(l => l.id);
  expect(ids).toEqual(Array.from({ length: 500 }, (_, i) => i + 1));
  expect(new Set(ids).size).toBe(ids.length);
  for (const world of [17, 18, 19, 20]) {
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
  expect(def.themeId).toBe(['steam-skyways', 'crystal-caverns', 'neon-megacity', 'dreamscapes'][Math.floor((def.id - 161) / 10)]);
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
  if ([165, 175, 185, 195].includes(def.id)) expect(holdingFullStates).toBe(0);
  const all = [...launches.values()];
  expect(all.filter(p => p.hits[0]! >= 6 && p.steps.slice(1).some((step, j) =>
    step - p.steps[0]! >= 3 && p.hits[j + 1]! >= 6)).length).toBe(bridges);
  expect(all.reduce((sum, p) => sum + p.hits.slice(1).filter(h => h <= 5).length, 0)).toBe(cleanup);
});

// Breathers are relative: peak Holding 2 (asserted above) plus a shorter route and fewer bridges than the
// world's non-breather average. Do not assert "shorter than both neighbours": 185 (98) is longer than 184/186.
test.each([165, 175, 185, 195])('breather %i stays lighter than its world average', id => {
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
    17: 'ca765f6620269b9e0bb14d85764140c686a5fb51a6ade5bc07fdc4fae3ce567c',
    18: 'c87a4d79bb510528a5f591ecd715f26703ad08c4c7ec7ed2608c322918edf25e',
    19: 'f7742595c4411e374fbbe03bafcf524223365d22a897b4f89f0c84248a2b322a',
    20: '0320ea1cefe92425ec4df7ff9f4739935534a8f81527bfeca0a2299b467b0507',
  };
  for (const world of [17, 18, 19, 20]) {
    const packet = JSON.parse(fs.readFileSync(path.resolve(`content/levels/world-${String(world).padStart(2, '0')}.json`), 'utf8'));
    expect(createHash('sha256').update(JSON.stringify(packet.levels)).digest('hex')).toBe(hashes[world]);
  }
});

test.each([170, 180, 190, 200])('finale %i preserves strong route metrics', id => {
  expect(EXPECTED[id]![4]).toBe(3);
  expect(EXPECTED[id]![5]).toBeGreaterThanOrEqual(8);
  expect(EXPECTED[id]![3]).toBeGreaterThanOrEqual(109);
});

test('all 58 tiny Pals are preserved', () => {
  expect(imported.flatMap(l => l.tunnels.flat()).filter(p => p.capacity <= 2)).toHaveLength(58);
});
