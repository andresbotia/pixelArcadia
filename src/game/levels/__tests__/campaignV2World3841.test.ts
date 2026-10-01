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
  371: [2140, 16, 59, 93, 34, 10, 3, 1],
  372: [2220, 15, 61, 90, 29, 8, 3, 1],
  373: [2151, 17, 67, 100, 33, 10, 3, 0],
  374: [2187, 15, 71, 108, 37, 6, 3, 1],
  375: [2077, 13, 66, 78, 12, 2, 2, 3],
  376: [2124, 16, 58, 91, 33, 12, 3, 0],
  377: [2168, 15, 77, 111, 34, 15, 3, 0],
  378: [2210, 16, 56, 100, 44, 11, 3, 0],
  379: [2214, 15, 76, 109, 33, 14, 3, 2],
  380: [2265, 20, 85, 120, 35, 15, 3, 3],
  381: [2194, 15, 81, 113, 32, 10, 3, 0],
  382: [2180, 17, 90, 117, 27, 9, 3, 3],
  383: [2167, 15, 69, 98, 29, 9, 3, 4],
  384: [2173, 15, 83, 116, 33, 10, 3, 5],
  385: [2103, 12, 70, 82, 12, 4, 2, 3],
  386: [2207, 15, 58, 86, 28, 12, 3, 1],
  387: [2218, 16, 75, 107, 32, 8, 3, 2],
  388: [2204, 15, 71, 95, 24, 8, 3, 0],
  389: [2200, 17, 78, 112, 34, 17, 3, 1],
  390: [2267, 18, 84, 121, 37, 18, 3, 0],
  391: [2172, 15, 57, 93, 36, 15, 3, 1],
  392: [2198, 17, 67, 102, 35, 8, 3, 1],
  393: [2184, 15, 91, 116, 25, 8, 3, 3],
  394: [2096, 15, 76, 100, 24, 9, 3, 1],
  395: [2110, 13, 68, 80, 12, 5, 2, 3],
  396: [2184, 15, 80, 101, 21, 9, 3, 3],
  397: [2140, 17, 92, 128, 36, 9, 3, 1],
  398: [2220, 17, 83, 110, 27, 10, 3, 2],
  399: [2256, 17, 102, 130, 28, 9, 3, 5],
  400: [2280, 20, 74, 110, 36, 11, 3, 0],
  401: [2139, 14, 58, 86, 28, 8, 3, 1],
  402: [2144, 16, 64, 91, 27, 8, 3, 0],
  403: [2167, 15, 78, 113, 35, 14, 3, 1],
  404: [2220, 16, 60, 88, 28, 11, 3, 1],
  405: [2064, 13, 56, 68, 12, 6, 2, 4],
  406: [2149, 15, 78, 108, 30, 6, 3, 0],
  407: [2149, 15, 100, 118, 18, 11, 3, 6],
  408: [2125, 14, 63, 93, 30, 5, 3, 2],
  409: [2233, 17, 75, 114, 39, 14, 3, 1],
  410: [2245, 18, 83, 114, 31, 11, 3, 1],
};
const levels = LEVEL_DEFINITIONS.filter(l => l.id >= 371 && l.id <= 410);

test('all forty locked titles and packets select exactly one active new definition', () => {
  expect(levels).toHaveLength(40);
  expect(LEVEL_DEFINITIONS.map(l => l.id)).toEqual(Array.from({ length: 500 }, (_, i) => i + 1));
  expect(new Set(LEVEL_DEFINITIONS.map(l => l.id)).size).toBe(500);
  for (const world of [38, 39, 40, 41]) {
    const packet = loadAuthoredFile(`content/levels/world-${world}.json`);
    expect(packet.errors).toEqual([]);
    expect(packet.levels).toHaveLength(10);
    for (const def of packet.levels) expect(getLevel(def.id)).toEqual(def);
  }
  const titles = fs.readFileSync('docs/audits/M16D_LEVELS_371_410_CERTIFICATES.json', 'utf8');
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

test.each([375, 385, 395, 405])('breather %i retains relative route and Holding relief', id => {
  const peers = levels.filter(l => Math.floor((l.id - 1) / 10) === Math.floor((id - 1) / 10) && l.id !== id);
  const avg = (index: number) => peers.reduce((sum, l) => sum + EXPECTED[l.id]![index]!, 0) / peers.length;
  expect(EXPECTED[id]![6]).toBeLessThanOrEqual(2);
  expect(EXPECTED[id]![3]).toBeLessThan(avg(3));
  expect(EXPECTED[id]![4]).toBeLessThan(avg(4));
  expect(EXPECTED[id]![5]).toBeLessThan(avg(5));
});

test.each([380, 390, 400, 410])('finale %i retains strategic capacity and authored route metrics', id => {
  expect(EXPECTED[id]![6]).toBe(3);
  expect(EXPECTED[id]![3]).toBeLessThanOrEqual(135);
  expect(EXPECTED[id]![5]).toBeGreaterThanOrEqual(6);
});

test('every source through 500 matches the unique runtime registry', () => {
  const source = loadAuthoredDirectory('content/levels');
  expect(source.errors).toEqual([]);
  expect(source.levels).toHaveLength(500);
  for (const def of source.levels) expect(getLevel(def.id)).toEqual(def);
});

test('normal campaign publishes these levels while the dev index retains them', () => {
  expect(PUBLISHED_MAX_LEVEL).toBe(500);
  expect(CAMPAIGN_VERSION).toBe('v1-500');
  for (const def of levels) {
    expect(isPublishedCampaignLevel(def.id)).toBe(true);
    expect(devLevelIndex().find(l => l.id === def.id)).toMatchObject({ title: def.title, world: Math.ceil(def.id / 10) });
  }
  expect(getLevel(501)).toBeUndefined();
});

test('400 retains the single bent road and its large balanced populations', () => {
  const pixels = createGame(getLevel(400)!).pixels;
  expect(pixels.length).toBeGreaterThanOrEqual(2260);
  expect(new Set(pixels.map(p => p.color)).size).toBeGreaterThanOrEqual(19);
  const populations = new Map<string, number>();
  for (const p of pixels) populations.set(p.color, (populations.get(p.color) ?? 0) + 1);
  for (const count of populations.values()) expect(count).toBeGreaterThanOrEqual(25);
  const at = (x: number, y: number) => pixels.find(p => p.x === x && p.y === y)?.color;
  expect(at(18, 44)).toBe('graphite');
  expect(at(44, 18)).toBe('graphite');
  expect(at(25, 25)).toBe('ivory');
  expect(at(35, 5)).not.toBe('graphite');
});

test('all new boards use only the locked 44-color palette with visible material populations', () => {
  const palette = new Set(LEVEL_DEFINITIONS.flatMap(l => l.id <= 370 ? [] : createGame(l).pixels.map(p => p.color)));
  expect(palette.size).toBeLessThanOrEqual(44);
  for (const level of levels) {
    const counts = new Map<string, number>();
    for (const pixel of createGame(level).pixels) counts.set(pixel.color, (counts.get(pixel.color) ?? 0) + 1);
    for (const count of counts.values()) expect(count).toBeGreaterThanOrEqual(25);
  }
});
