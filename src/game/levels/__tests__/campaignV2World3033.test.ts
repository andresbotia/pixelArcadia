import fs from 'fs';
import { createGame } from '../../engine/createGame';
import { applyActionWithArrivals } from '../../engine/holdingArrival';
import { loadAuthoredFile, loadAuthoredDirectory } from '../authoring/loader';
import { validateLevelPacket, validateLevelStructure } from '../authoring/validate';
import { devLevelIndex } from '../devLevelIndex';
import { getLevel, LEVEL_DEFINITIONS } from '../levels';
import { isPublishedCampaignLevel } from '../publishedCampaign';
import { CAMPAIGN_VERSION, PUBLISHED_MAX_LEVEL } from '../publishing';

// Independent production certificate: pixels, colours, Pals, actions, relaunches,
// strategic bridges, peak Holding, and remaining capacity 1–2 Pals.
const EXPECTED: Record<number, number[]> = {
  291: [2146, 14, 83, 105, 22, 4, 3, 4],
  292: [2180, 15, 69, 102, 33, 11, 3, 0],
  293: [2134, 16, 89, 109, 20, 5, 3, 8],
  294: [2228, 13, 57, 85, 28, 13, 3, 1],
  295: [2087, 12, 67, 79, 12, 1, 2, 6],
  296: [2220, 15, 68, 94, 26, 10, 3, 0],
  297: [2184, 15, 86, 117, 31, 10, 3, 0],
  298: [2202, 15, 82, 105, 23, 8, 3, 0],
  299: [2220, 16, 68, 96, 28, 12, 3, 1],
  300: [2245, 20, 97, 132, 35, 14, 3, 3],
  301: [2215, 14, 79, 100, 21, 11, 3, 1],
  302: [2133, 14, 65, 89, 24, 10, 3, 0],
  303: [2206, 15, 77, 107, 30, 10, 3, 2],
  304: [2227, 15, 89, 121, 32, 13, 3, 0],
  305: [2141, 13, 75, 87, 12, 3, 2, 7],
  306: [2238, 14, 65, 90, 25, 11, 3, 2],
  307: [2176, 15, 62, 86, 24, 11, 3, 1],
  308: [2232, 14, 90, 114, 24, 8, 3, 2],
  309: [2201, 15, 58, 81, 23, 12, 3, 3],
  310: [2285, 17, 77, 106, 29, 9, 3, 0],
  311: [2112, 15, 54, 84, 30, 11, 3, 1],
  312: [2088, 16, 52, 80, 28, 13, 3, 2],
  313: [2244, 17, 73, 98, 25, 13, 3, 6],
  314: [2149, 15, 71, 89, 18, 10, 3, 2],
  315: [2094, 14, 53, 64, 11, 2, 2, 2],
  316: [2184, 16, 71, 93, 22, 11, 3, 0],
  317: [2202, 17, 72, 93, 21, 6, 3, 4],
  318: [2214, 18, 85, 108, 23, 9, 3, 1],
  319: [2178, 17, 77, 108, 31, 11, 3, 1],
  320: [2277, 21, 84, 123, 39, 14, 3, 2],
  321: [2112, 14, 65, 96, 31, 11, 3, 2],
  322: [2196, 14, 61, 89, 28, 10, 3, 1],
  323: [2208, 14, 71, 95, 24, 7, 3, 1],
  324: [2131, 15, 49, 80, 31, 11, 3, 1],
  325: [2064, 12, 56, 68, 12, 3, 2, 0],
  326: [2180, 16, 66, 92, 26, 12, 3, 1],
  327: [2172, 16, 52, 72, 20, 10, 3, 1],
  328: [2196, 16, 60, 87, 27, 9, 3, 0],
  329: [2188, 15, 49, 76, 27, 14, 3, 1],
  330: [2240, 18, 86, 108, 22, 14, 3, 6],
};
const levels = LEVEL_DEFINITIONS.filter(l => l.id >= 291 && l.id <= 330);

test('all forty locked titles and packets select exactly one active new definition', () => {
  expect(levels).toHaveLength(40);
  expect(LEVEL_DEFINITIONS.map(l => l.id)).toEqual(Array.from({ length: 330 }, (_, i) => i + 1));
  expect(new Set(LEVEL_DEFINITIONS.map(l => l.id)).size).toBe(330);
  for (const world of [30, 31, 32, 33]) {
    const packet = loadAuthoredFile(`content/levels/world-${world}.json`);
    expect(packet.errors).toEqual([]);
    expect(packet.levels).toHaveLength(10);
    for (const def of packet.levels) expect(getLevel(def.id)).toEqual(def);
  }
  const titles = fs.readFileSync('docs/audits/M16B_LEVELS_291_330_CERTIFICATES.json', 'utf8');
  const certificate = JSON.parse(titles) as { levels: { id: number; title: string }[] };
  expect(levels.map(l => [l.id, l.title])).toEqual(certificate.levels.map(l => [l.id, l.title]));
});

test.each(levels)('level $id preserves its production geometry and exact constructive witness', def => {
  const [pixels, colors, pals, witness, relaunches, bridges, peak, tiny] = EXPECTED[def.id]!;
  expect(def.ruleset).toBe('coreV2');
  expect(def.activeCapacity).toBe(5);
  expect(def.holdingCapacity).toBe(3);
  expect(def.replacesLegacy).toBe(false);
  expect(def.tunnels).toHaveLength(3);
  expect(def.pixelArt).toHaveLength(48);
  expect(def.pixelArt.every(row => row.length === 48)).toBe(true);
  expect(validateLevelStructure(def)).toMatchObject({ valid: true });
  expect(validateLevelPacket(def, { runSolver: false })).toMatchObject({ valid: true, solvability: 'PROVEN_BY_WITNESS' });
  expect(def.tunnels.flat()).toHaveLength(pals!);
  expect(def.tunnels.flat().filter(c => c.capacity <= 2)).toHaveLength(tiny!);
  expect(def.winningWitness).toHaveLength(witness!);
  let state = createGame(def);
  expect(state.pixels).toHaveLength(pixels!);
  expect(new Set(state.pixels.map(p => p.color)).size).toBe(colors);
  const need = new Map<string, number>(), have = new Map<string, number>();
  for (const p of state.pixels) need.set(p.color, (need.get(p.color) ?? 0) + 1);
  for (const c of def.tunnels.flat()) have.set(c.color, (have.get(c.color) ?? 0) + c.capacity);
  expect(have).toEqual(need);
  let peakHolding = 0, held = 0;
  const history = new Map<string, { steps: number[]; hits: number[] }>();
  for (const [i, slot] of def.winningWitness!.entries()) {
    expect(slot).toMatch(/^[TH][1-3]$/);
    const n = Number(slot.slice(1)) - 1;
    const charge = slot[0] === 'T' ? state.tunnels[n]!.queue[0]! : state.holding[n]!;
    expect(charge).toBeDefined();
    const action = slot[0] === 'T' ? { kind: 'tunnel' as const, id: state.tunnels[n]!.id }
      : { kind: 'holding' as const, id: charge.id };
    const before = state.pixels.filter(p => !p.cleared).length;
    const out = applyActionWithArrivals(state, action);
    expect(out.accepted).toBe(true);
    const hits = before - out.state.pixels.filter(p => !p.cleared).length;
    expect(hits).toBeGreaterThan(0);
    const entry = history.get(charge.id) ?? { steps: [], hits: [] };
    entry.steps.push(i + 1); entry.hits.push(hits); history.set(charge.id, entry);
    state = out.state; peakHolding = Math.max(peakHolding, state.holding.length);
    held += Number(action.kind === 'holding');
    expect(state.pendingHolding.length).toBeLessThanOrEqual(1); // A travelling survivor may use the Gate grace window.
    expect(state.status).not.toBe('lost');
  }
  expect(state.status).toBe('won');
  expect(state.pixels.filter(p => !p.cleared)).toHaveLength(0);
  expect(state.holding).toHaveLength(0);
  expect(state.pendingHolding).toHaveLength(0);
  expect(state.tunnels.every(t => t.queue.length === 0)).toBe(true);
  expect(peakHolding).toBe(peak); expect(held).toBe(relaunches);
  expect([...history.values()].filter(p => p.hits[0]! >= 6 && p.steps.slice(1).some((step, j) =>
    step - p.steps[0]! >= 3 && p.hits[j + 1]! >= 6)).length).toBe(bridges);
});

test.each([295, 305, 315, 325])('breather %i retains relative route and Holding relief', id => {
  const peers = levels.filter(l => Math.floor((l.id - 1) / 10) === Math.floor((id - 1) / 10) && l.id !== id);
  const avg = (index: number) => peers.reduce((sum, l) => sum + EXPECTED[l.id]![index]!, 0) / peers.length;
  expect(EXPECTED[id]![6]).toBe(2);
  expect(EXPECTED[id]![3]).toBeLessThan(avg(3));
  expect(EXPECTED[id]![4]).toBeLessThan(avg(4));
  expect(EXPECTED[id]![5]).toBeLessThan(avg(5));
});

test.each([300, 310, 320, 330])('finale %i retains strategic capacity and authored route metrics', id => {
  expect(EXPECTED[id]![6]).toBe(3);
  expect(EXPECTED[id]![3]).toBeLessThanOrEqual(135);
  expect(EXPECTED[id]![5]).toBeGreaterThanOrEqual(9);
});

test('every source through 330 matches the unique runtime registry', () => {
  const source = loadAuthoredDirectory('content/levels');
  expect(source.errors).toEqual([]);
  expect(source.levels).toHaveLength(330);
  for (const def of source.levels) expect(getLevel(def.id)).toEqual(def);
});

test('normal campaign blocks all forty levels while the dev index permits them', () => {
  expect(PUBLISHED_MAX_LEVEL).toBe(50);
  expect(CAMPAIGN_VERSION).toBe('v2-50');
  for (const def of levels) {
    expect(isPublishedCampaignLevel(def.id)).toBe(false);
    expect(devLevelIndex().find(l => l.id === def.id)).toMatchObject({ title: def.title, world: Math.ceil(def.id / 10) });
  }
  expect(getLevel(331)).toBeUndefined();
});

test('300 retains its eclipse, river, seated rim and shrine scale', () => {
  const def = getLevel(300)!;
  const state = createGame(def);
  expect(state.pixels.length).toBeGreaterThanOrEqual(2245);
  expect(state.pixels.length).toBeLessThanOrEqual(2275);
  expect(state.pixels.some(p => p.x === 18 && p.y === 12)).toBe(false);
  for (const [x, y, color] of [[16, 9, 'gold'], [5, 28, 'silver'], [42, 23, 'ice'], [35, 43, 'red']] as const) {
    expect(state.pixels.find(p => p.x === x && p.y === y)?.color).toBe(color);
  }
});
