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
  121: [2186, 18, 76, 90, 3, 6, 2],
  122: [2190, 17, 84, 100, 3, 7, 2],
  123: [2194, 17, 82, 104, 3, 7, 4],
  124: [2198, 15, 73, 95, 3, 6, 5],
  125: [2172, 10, 57, 73, 2, 5, 2],
  126: [2206, 15, 82, 100, 3, 6, 3],
  127: [2210, 17, 89, 110, 3, 7, 3],
  128: [2214, 15, 87, 99, 3, 6, 2],
  129: [2218, 21, 88, 106, 3, 7, 3],
  130: [2230, 18, 97, 112, 3, 8, 3],
  131: [2194, 15, 83, 101, 3, 5, 3],
  132: [2198, 15, 79, 99, 3, 5, 3],
  133: [2202, 17, 83, 104, 3, 8, 3],
  134: [2206, 17, 76, 95, 3, 6, 2],
  135: [2180, 12, 78, 86, 2, 4, 2],
  136: [2214, 18, 96, 111, 3, 6, 3],
  137: [2218, 18, 88, 104, 3, 5, 4],
  138: [2222, 20, 92, 111, 3, 7, 4],
  139: [2226, 16, 81, 103, 3, 9, 3],
  140: [2238, 15, 100, 112, 3, 7, 3],
  141: [2202, 18, 89, 106, 3, 8, 3],
  142: [2206, 20, 97, 122, 3, 8, 5],
  143: [2210, 18, 96, 109, 3, 6, 3],
  144: [2214, 19, 92, 112, 3, 8, 3],
  145: [2190, 16, 59, 68, 2, 5, 2],
  146: [2222, 18, 101, 114, 3, 6, 3],
  147: [2226, 18, 79, 100, 3, 7, 3],
  148: [2230, 17, 70, 86, 3, 7, 3],
  149: [2234, 19, 68, 88, 3, 7, 3],
  150: [2246, 20, 94, 115, 3, 9, 5],
  151: [2210, 20, 92, 108, 3, 7, 3],
  152: [2214, 19, 81, 103, 3, 7, 3],
  153: [2218, 21, 85, 102, 3, 8, 3],
  154: [2222, 21, 89, 106, 3, 7, 2],
  155: [2196, 17, 55, 72, 2, 5, 3],
  156: [2230, 18, 98, 112, 3, 6, 3],
  157: [2234, 20, 87, 101, 3, 8, 3],
  158: [2238, 17, 81, 96, 3, 8, 3],
  159: [2242, 19, 65, 81, 3, 9, 3],
  160: [2259, 19, 99, 114, 3, 8, 3],
};
const imported = LEVEL_DEFINITIONS.filter(l => l.id >= 121 && l.id <= 160);

test('four world modules select the authored definitions exactly, preserving the stable handoff content', () => {
  expect(imported).toHaveLength(40);
  const ids = LEVEL_DEFINITIONS.map(l => l.id);
  expect(ids).toEqual(Array.from({ length: 250 }, (_, i) => i + 1));
  expect(new Set(ids).size).toBe(ids.length);
  for (const world of [13, 14, 15, 16]) {
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
  expect(def.themeId).toBe(['frozen-north', 'volcanic-forge', 'carnival-of-wonders', 'lantern-dynasty'][Math.floor((def.id - 121) / 10)]);
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
  if ([125, 135, 145, 155].includes(def.id)) expect(holdingFullStates).toBe(0);
  const all = [...launches.values()];
  expect(all.filter(p => p.hits[0]! >= 6 && p.steps.slice(1).some((step, j) =>
    step - p.steps[0]! >= 3 && p.hits[j + 1]! >= 6)).length).toBe(bridges);
  expect(all.reduce((sum, p) => sum + p.hits.slice(1).filter(h => h <= 5).length, 0)).toBe(cleanup);
});

test.each([125, 135, 145, 155])('breather %i retains a short route and fewer Pals than the world average', id => {
  const peers = imported.filter(l => Math.floor((l.id - 1) / 10) === Math.floor((id - 1) / 10) && l.id !== id);
  expect(EXPECTED[id]![2]).toBeLessThan(peers.reduce((sum, l) => sum + EXPECTED[l.id]![2], 0) / peers.length);
  expect(EXPECTED[id]![5]).toBeLessThan(peers.reduce((sum, l) => sum + EXPECTED[l.id]![5], 0) / peers.length);
  expect(EXPECTED[id]![3]).toBe(Math.min(...peers.map(l => EXPECTED[l.id]![3]), EXPECTED[id]![3]));
  const b = getLevel(id)!;
  for (const neighbor of [getLevel(id - 1)!, getLevel(id + 1)!]) {
    expect(b.winningWitness!.length).toBeLessThan(neighbor.winningWitness!.length);
  }
});

test('all new levels are dev-accessible while normal campaign remains capped at 50', () => {
  expect(PUBLISHED_MAX_LEVEL).toBe(50);
  expect(CAMPAIGN_VERSION).toBe('v2-50');
  expect(nextPublishedLevelId(50)).toBeUndefined();
  const rows = devLevelIndex();
  for (const def of imported) {
    expect(isPublishedCampaignLevel(def.id)).toBe(false);
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
  "13": "b65a0fa5bf6cac552e51a2c8ab31bf37814f839240c53256de94423938c7c523",
  "14": "6adf62f801029f77a1367ff1c9c3a871f469208690733f8fbe4d4961162769ad",
  "15": "d4338b9b4fe424558be2a9eab5da268e9cebbf6f22df5e076eb152b112fd0f94",
  "16": "03a2f45da4b814fba64fb1cb97b947ae01187d8c9d969d121296c2fd00d4a6c1"
};
  for (const world of [13, 14, 15, 16]) {
    const packet = JSON.parse(fs.readFileSync(path.resolve(`content/levels/world-${String(world).padStart(2, '0')}.json`), 'utf8'));
    expect(createHash('sha256').update(JSON.stringify(packet.levels)).digest('hex')).toBe(hashes[world]);
  }
});

test.each([130, 140, 150, 160])('finale %i preserves strong route metrics', id => {
  expect(EXPECTED[id]![4]).toBe(3);
  expect(EXPECTED[id]![5]).toBeGreaterThanOrEqual(7);
});

test('all 82 tiny Pals are preserved, including the optional merge candidates', () => {
  expect(imported.flatMap(l => l.tunnels.flat()).filter(p => p.capacity <= 2)).toHaveLength(82);
  expect(getLevel(133)!.tunnels.flat()).toHaveLength(83);
  expect(getLevel(135)!.tunnels.flat()).toHaveLength(78);
});
