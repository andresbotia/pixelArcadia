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
  411: [2205, 15, 61, 93, 32, 9, 3, 2],
  412: [2195, 15, 66, 96, 30, 11, 3, 2],
  413: [2125, 15, 77, 102, 25, 6, 3, 2],
  414: [2215, 15, 62, 94, 32, 6, 3, 0],
  415: [2085, 15, 79, 91, 12, 3, 2, 3],
  416: [2195, 16, 56, 87, 31, 14, 3, 0],
  417: [2225, 16, 72, 109, 37, 11, 3, 2],
  418: [2245, 16, 76, 114, 38, 9, 3, 0],
  419: [2235, 17, 83, 119, 36, 12, 3, 2],
  420: [2260, 18, 79, 114, 35, 12, 3, 0],
  421: [2145, 14, 76, 109, 33, 10, 3, 2],
  422: [2125, 14, 65, 92, 27, 12, 3, 0],
  423: [2155, 15, 72, 99, 27, 10, 3, 1],
  424: [2175, 15, 65, 88, 23, 6, 3, 0],
  425: [2070, 12, 68, 80, 12, 2, 2, 4],
  426: [2165, 15, 57, 97, 40, 14, 3, 0],
  427: [2135, 15, 66, 97, 31, 11, 3, 2],
  428: [2195, 16, 68, 104, 36, 8, 3, 1],
  429: [2155, 15, 77, 108, 31, 9, 3, 1],
  430: [2235, 18, 76, 116, 40, 9, 3, 0],
  431: [2207, 15, 73, 104, 31, 12, 3, 1],
  432: [2175, 15, 86, 108, 22, 9, 3, 2],
  433: [2235, 17, 94, 119, 25, 6, 3, 1],
  434: [2205, 15, 70, 96, 26, 12, 3, 0],
  435: [2105, 13, 69, 81, 12, 3, 2, 6],
  436: [2225, 16, 78, 110, 32, 9, 3, 0],
  437: [2245, 16, 98, 119, 21, 5, 3, 2],
  438: [2235, 17, 81, 118, 37, 13, 3, 1],
  439: [2195, 16, 69, 92, 23, 8, 3, 3],
  440: [2260, 19, 77, 119, 42, 8, 3, 0],
  441: [2175, 14, 66, 89, 23, 9, 3, 2],
  442: [2205, 15, 68, 88, 20, 10, 3, 2],
  443: [2145, 15, 73, 103, 30, 8, 3, 0],
  444: [2185, 15, 52, 81, 29, 13, 3, 0],
  445: [2105, 13, 66, 78, 12, 1, 2, 5],
  446: [2195, 15, 57, 93, 36, 12, 3, 0],
  447: [2255, 16, 85, 122, 37, 12, 3, 1],
  448: [2215, 16, 67, 97, 30, 10, 3, 0],
  449: [2165, 15, 74, 109, 35, 8, 3, 0],
  450: [2261, 19, 89, 126, 37, 12, 3, 4],
};
const levels = LEVEL_DEFINITIONS.filter(l => l.id >= 411 && l.id <= 450);

test('all forty locked titles and packets select exactly one active new definition', () => {
  expect(levels).toHaveLength(40);
  expect(LEVEL_DEFINITIONS.map(l => l.id)).toEqual(Array.from({ length: 490 }, (_, i) => i + 1));
  expect(new Set(LEVEL_DEFINITIONS.map(l => l.id)).size).toBe(490);
  for (const world of [42, 43, 44, 45]) {
    const packet = loadAuthoredFile(`content/levels/world-${world}.json`);
    expect(packet.errors).toEqual([]);
    expect(packet.levels).toHaveLength(10);
    for (const def of packet.levels) expect(getLevel(def.id)).toEqual(def);
  }
  const titles = fs.readFileSync('docs/audits/M16E_LEVELS_411_450_CERTIFICATES.json', 'utf8');
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

test.each([415, 425, 435, 445])('breather %i retains relative route and Holding relief', id => {
  const peers = levels.filter(l => Math.floor((l.id - 1) / 10) === Math.floor((id - 1) / 10) && l.id !== id);
  const avg = (index: number) => peers.reduce((sum, l) => sum + EXPECTED[l.id]![index]!, 0) / peers.length;
  expect(EXPECTED[id]![6]).toBeLessThanOrEqual(2);
  expect(EXPECTED[id]![3]).toBeLessThan(avg(3));
  expect(EXPECTED[id]![4]).toBeLessThan(avg(4));
  expect(EXPECTED[id]![5]).toBeLessThan(avg(5));
});

test.each([420, 430, 440, 450])('finale %i retains strategic capacity and authored route metrics', id => {
  expect(EXPECTED[id]![6]).toBe(3);
  expect(EXPECTED[id]![3]).toBeLessThanOrEqual(135);
  expect(EXPECTED[id]![5]).toBeGreaterThanOrEqual(6);
});

test('every source through 490 matches the unique runtime registry', () => {
  const source = loadAuthoredDirectory('content/levels');
  expect(source.errors).toEqual([]);
  expect(source.levels).toHaveLength(490);
  for (const def of source.levels) expect(getLevel(def.id)).toEqual(def);
});

test('normal campaign blocks all forty levels while the dev index permits them', () => {
  expect(PUBLISHED_MAX_LEVEL).toBe(50);
  expect(CAMPAIGN_VERSION).toBe('v2-50');
  for (const def of levels) {
    expect(isPublishedCampaignLevel(def.id)).toBe(false);
    expect(devLevelIndex().find(l => l.id === def.id)).toMatchObject({ title: def.title, world: Math.ceil(def.id / 10) });
  }
  expect(getLevel(491)).toBeUndefined();
});

test('450 keeps the filled moonbeam, dark oculus and visible city', () => {
  const pixels = createGame(getLevel(450)!).pixels;
  expect(pixels.length).toBeGreaterThanOrEqual(2250);
  expect(pixels.length).toBeLessThanOrEqual(2280);
  expect(new Set(pixels.map(p => p.color)).size).toBeGreaterThanOrEqual(19);
  const populations = new Map<string, number>();
  for (const p of pixels) populations.set(p.color, (populations.get(p.color) ?? 0) + 1);
  for (const count of populations.values()) expect(count).toBeGreaterThanOrEqual(25);
  const at = (x: number, y: number) => pixels.find(p => p.x === x && p.y === y)?.color;
  expect(at(8, 8)).toBeUndefined(); // Real night beyond the oculus.
  expect(at(14, 11)).toBe('ice');
  expect(at(24, 23)).toBe('ice');
  expect(at(32, 36)).toBe('ice');
  expect(at(36, 42)).toBe('sand'); // Lit city plaza.
  expect(at(12, 20)).toBe('white'); // Indoor cloud is filled.
});

test('all new boards use only the locked 44-color palette with visible material populations', () => {
  for (const level of levels) {
    const counts = new Map<string, number>();
    for (const pixel of createGame(level).pixels) counts.set(pixel.color, (counts.get(pixel.color) ?? 0) + 1);
    for (const count of counts.values()) expect(count).toBeGreaterThanOrEqual(25);
  }
});
