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
  251: [2151, 14, 81, 101, 20, 11, 3, 4],
  252: [2121, 15, 75, 94, 19, 11, 3, 6],
  253: [2161, 14, 77, 100, 23, 13, 3, 3],
  254: [2112, 13, 75, 95, 20, 9, 3, 2],
  255: [2102, 14, 90, 107, 17, 8, 2, 4],
  256: [2170, 14, 76, 102, 26, 11, 3, 1],
  257: [2159, 16, 100, 132, 32, 19, 3, 0],
  258: [2208, 16, 89, 121, 32, 15, 3, 2],
  259: [2156, 17, 75, 100, 25, 13, 3, 4],
  260: [2241, 19, 96, 125, 29, 19, 3, 2],
  261: [2160, 15, 77, 98, 21, 16, 3, 2],
  262: [2147, 16, 90, 110, 20, 11, 3, 1],
  263: [2181, 16, 94, 116, 22, 14, 3, 4],
  264: [2158, 17, 96, 114, 18, 8, 3, 5],
  265: [2093, 13, 70, 81, 11, 4, 2, 0],
  266: [2200, 17, 101, 119, 18, 10, 3, 3],
  267: [2126, 17, 84, 109, 25, 20, 3, 1],
  268: [2116, 17, 73, 95, 22, 14, 3, 1],
  269: [2251, 16, 97, 113, 16, 12, 3, 4],
  270: [2239, 20, 85, 120, 35, 13, 3, 3],
  271: [2167, 14, 81, 103, 22, 13, 3, 7],
  272: [2160, 13, 60, 79, 19, 13, 3, 5],
  273: [2204, 14, 61, 88, 27, 14, 3, 2],
  274: [2181, 14, 80, 103, 23, 14, 3, 0],
  275: [2126, 12, 76, 94, 18, 5, 2, 0],
  276: [2150, 14, 67, 92, 25, 13, 3, 3],
  277: [2179, 15, 89, 110, 21, 14, 3, 2],
  278: [2184, 15, 63, 91, 28, 15, 3, 4],
  279: [2196, 16, 78, 103, 25, 14, 3, 0],
  280: [2254, 17, 106, 129, 23, 12, 3, 4],
  281: [2149, 16, 89, 114, 25, 13, 3, 3],
  282: [2142, 17, 98, 129, 31, 16, 3, 2],
  283: [2162, 17, 118, 135, 17, 13, 3, 9],
  284: [2087, 17, 81, 107, 26, 14, 3, 2],
  285: [2098, 13, 66, 81, 15, 6, 2, 0],
  286: [2175, 15, 76, 95, 19, 12, 3, 1],
  287: [2193, 17, 120, 134, 14, 9, 3, 3],
  288: [2183, 17, 88, 114, 26, 14, 3, 3],
  289: [2169, 18, 79, 102, 23, 15, 3, 3],
  290: [2252, 18, 92, 123, 31, 12, 3, 3],
};
const levels = LEVEL_DEFINITIONS.filter(l => l.id >= 251 && l.id <= 290);

test('all forty locked titles and packets select exactly one active new definition', () => {
  expect(levels).toHaveLength(40);
  expect(LEVEL_DEFINITIONS.map(l => l.id)).toEqual(Array.from({ length: 290 }, (_, i) => i + 1));
  expect(new Set(LEVEL_DEFINITIONS.map(l => l.id)).size).toBe(290);
  for (const world of [26, 27, 28, 29]) {
    const packet = loadAuthoredFile(`content/levels/world-${world}.json`);
    expect(packet.errors).toEqual([]);
    expect(packet.levels).toHaveLength(10);
    for (const def of packet.levels) expect(getLevel(def.id)).toEqual(def);
  }
  const titles = fs.readFileSync('docs/audits/M16A_LEVELS_251_290_CERTIFICATES.json', 'utf8');
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

test.each([255, 265, 275, 285])('breather %i retains relative route and Holding relief', id => {
  const peers = levels.filter(l => Math.floor((l.id - 1) / 10) === Math.floor((id - 1) / 10) && l.id !== id);
  const avg = (index: number) => peers.reduce((sum, l) => sum + EXPECTED[l.id]![index]!, 0) / peers.length;
  expect(EXPECTED[id]![6]).toBe(2);
  expect(EXPECTED[id]![3]).toBeLessThan(avg(3));
  expect(EXPECTED[id]![4]).toBeLessThan(avg(4));
  expect(EXPECTED[id]![5]).toBeLessThan(avg(5));
});

test.each([260, 270, 280, 290])('finale %i retains strategic capacity and authored route metrics', id => {
  expect(EXPECTED[id]![6]).toBe(3);
  expect(EXPECTED[id]![3]).toBeLessThanOrEqual(130);
  expect(EXPECTED[id]![5]).toBeGreaterThanOrEqual(12);
});

test('every source through 290 matches the unique runtime registry', () => {
  const source = loadAuthoredDirectory('content/levels');
  expect(source.errors).toEqual([]);
  expect(source.levels).toHaveLength(290);
  for (const def of source.levels) expect(getLevel(def.id)).toEqual(def);
});

test('normal campaign blocks all forty levels while the dev index permits them', () => {
  expect(PUBLISHED_MAX_LEVEL).toBe(50);
  expect(CAMPAIGN_VERSION).toBe('v2-50');
  for (const def of levels) {
    expect(isPublishedCampaignLevel(def.id)).toBe(false);
    expect(devLevelIndex().find(l => l.id === def.id)).toMatchObject({ title: def.title, world: Math.ceil(def.id / 10) });
  }
  expect(getLevel(291)).toBeUndefined();
});
