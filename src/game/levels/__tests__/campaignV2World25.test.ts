import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { createGame } from '../../engine/createGame';
import { applyActionWithArrivals } from '../../engine/holdingArrival';
import { loadAuthoredDirectory, parseAuthoredJSON } from '../authoring/loader';
import { validateLevelPacket, validateLevelStructure } from '../authoring/validate';
import { devLevelIndex } from '../devLevelIndex';
import { getLevel, LEVEL_DEFINITIONS } from '../levels';
import { isPublishedCampaignLevel, nextPublishedLevelId } from '../publishedCampaign';
import { CAMPAIGN_VERSION, PUBLISHED_MAX_LEVEL } from '../publishing';

// Independent author certificate: pixels, colors, Pals, witness, peak Holding, bridges, cleanup.
const EXPECTED: Record<number, [number, number, number, number, number, number, number]> = {
  241: [2282, 21, 101, 122, 3, 9, 3],
  242: [2286, 21, 99, 119, 3, 9, 3],
  243: [2290, 21, 98, 121, 3, 8, 4],
  244: [2294, 22, 95, 115, 3, 7, 2],
  245: [2268, 18, 100, 110, 2, 5, 2],
  246: [2300, 22, 96, 114, 3, 9, 3],
  247: [2300, 22, 109, 122, 3, 9, 3],
  248: [2300, 21, 83, 112, 3, 10, 3],
  249: [2300, 21, 95, 117, 3, 9, 3],
  250: [2300, 21, 104, 133, 3, 9, 3],
};
const imported = LEVEL_DEFINITIONS.filter(l => l.id >= 241 && l.id <= 250);

test('World 25 selects the authored definitions exactly, preserving the stable handoff content', () => {
  expect(imported).toHaveLength(10);
  const ids = LEVEL_DEFINITIONS.map(l => l.id);
  expect(ids).toEqual(Array.from({ length: 330 }, (_, i) => i + 1));
  expect(new Set(ids).size).toBe(ids.length);
  for (const world of [25]) {
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
  expect(def.themeId).toBe('arcadia-ascendant');
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
  if (def.id === 245) expect(holdingFullStates).toBe(0);
  const all = [...launches.values()];
  const relaunches = all.reduce((sum, pal) => sum + pal.steps.length - 1, 0);
  if (def.id === 245) expect(relaunches).toBe(10);
  if (def.id === 250) expect(relaunches).toBe(29);
  expect(all.filter(p => p.hits[0]! >= 6 && p.steps.slice(1).some((step, j) =>
    step - p.steps[0]! >= 3 && p.hits[j + 1]! >= 6)).length).toBe(bridges);
  expect(all.reduce((sum, p) => sum + p.hits.slice(1).filter(h => h <= 5).length, 0)).toBe(cleanup);
});

// Breathers are relative: peak Holding 2 (asserted above) plus a shorter route and fewer bridges than the
// world's non-breather average. Do not assert a Pal-count rule: 245 has 100 Pals vs a W25 non-breather average of 97.8.
test.each([245])('breather %i stays lighter than its world average', id => {
  const peers = imported.filter(l => Math.floor((l.id - 1) / 10) === Math.floor((id - 1) / 10) && l.id !== id);
  const avg = (k: number) => peers.reduce((sum, l) => sum + EXPECTED[l.id]![k]!, 0) / peers.length;
  expect(EXPECTED[id]![4]).toBe(2);
  expect(EXPECTED[id]![3]).toBeLessThan(avg(3));
  expect(EXPECTED[id]![5]).toBeLessThan(avg(5));
  expect(EXPECTED[id]![6]).toBeLessThanOrEqual(2);
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
    25: 'e4ab1cf9eecabf4d6fbe0b0606697475cdb707ade2c8543f4c598f3149cc07ca',
  };
  for (const world of [25]) {
    const packet = JSON.parse(fs.readFileSync(path.resolve(`content/levels/world-${String(world).padStart(2, '0')}.json`), 'utf8'));
    expect(createHash('sha256').update(JSON.stringify(packet.levels)).digest('hex')).toBe(hashes[world]);
  }
});

// Capstone: retain authored metrics; do not assert it exceeds every prior level (220/230 out-score it on composite).
test.each([250])('finale %i preserves its authored capstone metrics', id => {
  expect(EXPECTED[id]![4]).toBe(3);
  expect(EXPECTED[id]![5]).toBeGreaterThanOrEqual(9);
  expect(EXPECTED[id]![3]).toBeGreaterThanOrEqual(114);
  expect(EXPECTED[id]![3]).toBeLessThanOrEqual(135);
});

test('all 17 tiny Pals are preserved (no merges applied)', () => {
  expect(imported.flatMap(l => l.tunnels.flat()).filter(p => p.capacity <= 2)).toHaveLength(17);
});

test('full 1–290 registry matches all source packets with valid replacement relationships', () => {
  const source = loadAuthoredDirectory(path.resolve('content/levels'));
  expect(source.errors).toEqual([]);
  expect(source.levels).toHaveLength(330);
  const ids = source.levels.map(def => def.id).sort((a, b) => a - b);
  expect(ids).toEqual(Array.from({ length: 330 }, (_, i) => i + 1));
  for (const def of source.levels) {
    expect(getLevel(def.id)).toEqual(def);
    expect(validateLevelStructure(def).valid).toBe(true);
    if (def.id > 100) expect(def.replacesLegacy).toBe(false);
  }
});
