import fs from 'fs';
import path from 'path';
import { createGame } from '../../engine/createGame';
import { applyActionWithArrivals } from '../../engine/holdingArrival';
import { parseAuthoredJSON } from '../authoring/loader';
import { validateLevelStructure } from '../authoring/validate';
import { devLevelIndex } from '../devLevelIndex';
import { getLevel, LEVEL_DEFINITIONS } from '../levels';
import { isPublishedCampaignLevel, nextPublishedLevelId } from '../publishedCampaign';
import { CAMPAIGN_VERSION, PUBLISHED_MAX_LEVEL } from '../publishing';

// Independent author certificate: pixels, colors, Pals, witness, peak Holding, bridges, cleanup.
const EXPECTED: Record<number, [number, number, number, number, number, number, number]> = {
  61: [1772, 18, 78, 87, 3, 3, 6],
  62: [1792, 15, 69, 81, 3, 3, 9],
  63: [1812, 15, 74, 82, 2, 2, 5],
  64: [1834, 18, 90, 100, 3, 4, 6],
  65: [1818, 13, 81, 88, 2, 1, 6],
  66: [1855, 18, 93, 102, 3, 4, 5],
  67: [1878, 15, 72, 83, 3, 4, 7],
  68: [1898, 17, 93, 100, 2, 4, 3],
  69: [1924, 20, 83, 100, 3, 6, 11],
  70: [1954, 18, 100, 112, 3, 6, 6],
  71: [1968, 11, 78, 86, 3, 4, 4],
  72: [1988, 10, 67, 74, 3, 4, 3],
  73: [2008, 10, 74, 80, 2, 4, 2],
  74: [2028, 14, 82, 89, 3, 4, 3],
  75: [2000, 12, 77, 82, 2, 1, 4],
  76: [2048, 12, 84, 91, 2, 6, 1],
  77: [2070, 14, 77, 87, 2, 6, 4],
  78: [2100, 15, 77, 88, 3, 4, 5],
  79: [2140, 12, 83, 94, 2, 6, 5],
  80: [2160, 22, 99, 115, 3, 8, 8],
};
const imported = LEVEL_DEFINITIONS.filter(l => l.id >= 61 && l.id <= 80);

test('both world modules replace old definitions exactly, preserving the Desktop packet content', () => {
  expect(imported).toHaveLength(20);
  const ids = LEVEL_DEFINITIONS.map(l => l.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const world of [7, 8]) {
    const raw = fs.readFileSync(path.resolve(`content/levels/world-0${world}.json`), 'utf8');
    const packet = parseAuthoredJSON(raw);
    expect(packet.errors).toEqual([]);
    expect(packet.levels).toHaveLength(10);
    for (const def of packet.levels) expect(getLevel(def.id)).toEqual(def);
  }
});

test.each(imported)('level $id preserves all author metrics and wins without items or rejected actions', def => {
  const [pixels, colors, pals, witness, peak, bridges, cleanup] = EXPECTED[def.id]!;
  expect(def.ruleset).toBe('coreV2');
  expect(def.holdingCapacity).toBe(3);
  expect(def.tunnels).toHaveLength(3);
  expect(def.replacesLegacy).toBe(true);
  expect(def.themeId).toBe(def.id <= 70 ? 'ocean-depths' : 'mythic-realm');
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
  let peakHolding = 0, peakPending = 0;
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
  const all = [...launches.values()];
  expect(all.filter(p => p.hits[0]! >= 6 && p.steps.slice(1).some((step, j) =>
    step - p.steps[0]! >= 3 && p.hits[j + 1]! >= 6)).length).toBe(bridges);
  expect(all.reduce((sum, p) => sum + p.hits.slice(1).filter(h => h <= 5).length, 0)).toBe(cleanup);
});

test.each([65, 75])('breather %i retains shorter route, fewer Pals and one bridge', id => {
  const b = getLevel(id)!;
  for (const neighbor of [getLevel(id - 1)!, getLevel(id + 1)!]) {
    expect(b.winningWitness!.length).toBeLessThan(neighbor.winningWitness!.length);
    expect(b.tunnels.flat().length).toBeLessThan(neighbor.tunnels.flat().length);
  }
  expect(EXPECTED[id]!.slice(4, 6)).toEqual([2, 1]);
});

test('Colossus retains its 22 colors, eight bridges and accepted 115-action ceiling', () => {
  expect(EXPECTED[80]).toEqual([2160, 22, 99, 115, 3, 8, 8]);
  expect(getLevel(80)!.title).toBe('Mythic Colossus');
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
    expect(row.world).toBe(def.id <= 70 ? 7 : 8);
  }
});
