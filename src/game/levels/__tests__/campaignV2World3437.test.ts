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
  331: [2160, 14, 63, 93, 30, 14, 3, 1],
  332: [2162, 16, 71, 100, 29, 11, 3, 0],
  333: [2154, 15, 59, 95, 36, 20, 3, 0],
  334: [2119, 14, 64, 87, 23, 7, 3, 2],
  335: [2124, 13, 73, 85, 12, 3, 2, 5],
  336: [2200, 16, 62, 87, 25, 8, 3, 2],
  337: [2193, 15, 84, 110, 26, 6, 3, 0],
  338: [2192, 16, 87, 101, 14, 9, 3, 1],
  339: [2174, 15, 73, 100, 27, 12, 3, 3],
  340: [2253, 19, 93, 120, 27, 10, 3, 3],
  341: [2188, 16, 89, 115, 26, 9, 3, 2],
  342: [2218, 16, 74, 100, 26, 10, 3, 0],
  343: [2160, 16, 72, 103, 31, 9, 3, 0],
  344: [2222, 17, 73, 108, 35, 6, 3, 4],
  345: [2124, 13, 46, 58, 12, 6, 2, 1],
  346: [2220, 17, 79, 112, 33, 10, 3, 4],
  347: [2208, 19, 82, 121, 39, 16, 3, 0],
  348: [2220, 17, 112, 136, 24, 8, 3, 3],
  349: [2242, 18, 97, 126, 29, 12, 3, 3],
  350: [2255, 20, 102, 136, 34, 11, 3, 2],
  351: [2184, 16, 70, 101, 31, 18, 3, 1],
  352: [2112, 15, 59, 94, 35, 16, 3, 0],
  353: [2172, 16, 78, 109, 31, 9, 3, 2],
  354: [2106, 15, 76, 113, 37, 16, 3, 1],
  355: [2084, 13, 72, 84, 12, 4, 2, 6],
  356: [2203, 16, 93, 118, 25, 9, 3, 9],
  357: [2103, 14, 55, 78, 23, 11, 3, 0],
  358: [2188, 15, 68, 96, 28, 11, 3, 3],
  359: [2210, 16, 72, 114, 42, 8, 3, 1],
  360: [2264, 18, 87, 120, 33, 10, 3, 1],
  361: [2110, 14, 87, 116, 29, 9, 3, 1],
  362: [2093, 14, 65, 91, 26, 13, 3, 0],
  363: [2144, 15, 73, 107, 34, 12, 3, 3],
  364: [2152, 14, 68, 94, 26, 11, 3, 0],
  365: [2084, 12, 68, 80, 12, 4, 1, 2],
  366: [2183, 15, 74, 105, 31, 7, 3, 0],
  367: [2155, 15, 58, 86, 28, 11, 3, 1],
  368: [2135, 15, 82, 103, 21, 8, 3, 2],
  369: [2147, 16, 93, 115, 22, 8, 3, 1],
  370: [2220, 18, 95, 130, 35, 12, 3, 1],
};
const levels = LEVEL_DEFINITIONS.filter(l => l.id >= 331 && l.id <= 370);

test('all forty locked titles and packets select exactly one active new definition', () => {
  expect(levels).toHaveLength(40);
  expect(LEVEL_DEFINITIONS.map(l => l.id)).toEqual(Array.from({ length: 370 }, (_, i) => i + 1));
  expect(new Set(LEVEL_DEFINITIONS.map(l => l.id)).size).toBe(370);
  for (const world of [34, 35, 36, 37]) {
    const packet = loadAuthoredFile(`content/levels/world-${world}.json`);
    expect(packet.errors).toEqual([]);
    expect(packet.levels).toHaveLength(10);
    for (const def of packet.levels) expect(getLevel(def.id)).toEqual(def);
  }
  const titles = fs.readFileSync('docs/audits/M16C_LEVELS_331_370_CERTIFICATES.json', 'utf8');
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

test.each([335, 345, 355, 365])('breather %i retains relative route and Holding relief', id => {
  const peers = levels.filter(l => Math.floor((l.id - 1) / 10) === Math.floor((id - 1) / 10) && l.id !== id);
  const avg = (index: number) => peers.reduce((sum, l) => sum + EXPECTED[l.id]![index]!, 0) / peers.length;
  expect(EXPECTED[id]![6]).toBeLessThanOrEqual(2);
  expect(EXPECTED[id]![3]).toBeLessThan(avg(3));
  expect(EXPECTED[id]![4]).toBeLessThan(avg(4));
  expect(EXPECTED[id]![5]).toBeLessThan(avg(5));
});

test.each([340, 350, 360, 370])('finale %i retains strategic capacity and authored route metrics', id => {
  expect(EXPECTED[id]![6]).toBe(3);
  expect(EXPECTED[id]![3]).toBeLessThanOrEqual(id === 350 ? 136 : 135);
  expect(EXPECTED[id]![5]).toBeGreaterThanOrEqual(6);
});

test('every source through 370 matches the unique runtime registry', () => {
  const source = loadAuthoredDirectory('content/levels');
  expect(source.errors).toEqual([]);
  expect(source.levels).toHaveLength(370);
  for (const def of source.levels) expect(getLevel(def.id)).toEqual(def);
});

test('normal campaign blocks all forty levels while the dev index permits them', () => {
  expect(PUBLISHED_MAX_LEVEL).toBe(50);
  expect(CAMPAIGN_VERSION).toBe('v2-50');
  for (const def of levels) {
    expect(isPublishedCampaignLevel(def.id)).toBe(false);
    expect(devLevelIndex().find(l => l.id === def.id)).toMatchObject({ title: def.title, world: Math.ceil(def.id / 10) });
  }
  expect(getLevel(371)).toBeUndefined();
});

test('350 retains its three-tier river capstone without palette specks', () => {
  const pixels = createGame(getLevel(350)!).pixels;
  expect(pixels.length).toBeGreaterThanOrEqual(2255);expect(pixels.length).toBeLessThanOrEqual(2290);
  const colors=[...new Set(pixels.map(p=>p.color))];expect(colors.length).toBeGreaterThanOrEqual(20);
  for(const color of colors)expect(pixels.filter(p=>p.color===color).length).toBeGreaterThanOrEqual(25);
  const at=(x:number,y:number)=>pixels.find(p=>p.x===x&&p.y===y)?.color;
  expect(at(34,12)).toBe('gold'); // dragon eye
  expect(at(35,20)).toBe('ice');expect(at(19,29)).toBe('ice');expect(at(9,41)).toBe('cerulean');
  expect(at(4,43)).toBe('gold'); // koi at river mouth
  expect(at(39,17)).toBeUndefined(); // dark whisker gap, not river light
});

test('370 night shading stays inside the Earth disc and preserves the layered court', () => {
  const pixels=createGame(getLevel(370)!).pixels;
  expect(pixels.find(p=>p.x===32&&p.y===4)?.color).toBe('navy');
  expect(pixels.find(p=>p.x===34&&p.y===9)?.color).toBe('gold');
  expect(pixels.find(p=>p.x===9&&p.y===14)?.color).toBe('silver');
});
