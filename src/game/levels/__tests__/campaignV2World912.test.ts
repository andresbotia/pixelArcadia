import { createHash } from 'crypto';
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
  "81": [
    2154,
    18,
    78,
    102,
    3,
    4,
    6
  ],
  "82": [
    2158,
    20,
    82,
    100,
    3,
    5,
    3
  ],
  "83": [
    2162,
    18,
    82,
    99,
    3,
    6,
    4
  ],
  "84": [
    2166,
    17,
    82,
    100,
    3,
    5,
    3
  ],
  "85": [
    2140,
    13,
    67,
    81,
    2,
    4,
    2
  ],
  "86": [
    2174,
    18,
    92,
    103,
    3,
    6,
    3
  ],
  "87": [
    2178,
    18,
    81,
    95,
    3,
    5,
    3
  ],
  "88": [
    2182,
    16,
    85,
    99,
    3,
    6,
    3
  ],
  "89": [
    2230,
    18,
    97,
    113,
    3,
    6,
    3
  ],
  "90": [
    2198,
    19,
    94,
    109,
    3,
    7,
    3
  ],
  "91": [
    2162,
    18,
    93,
    107,
    3,
    5,
    3
  ],
  "92": [
    2166,
    18,
    82,
    106,
    3,
    6,
    3
  ],
  "93": [
    2170,
    20,
    70,
    96,
    3,
    7,
    7
  ],
  "94": [
    2174,
    20,
    89,
    106,
    3,
    5,
    5
  ],
  "95": [
    2148,
    13,
    84,
    89,
    2,
    3,
    2
  ],
  "96": [
    2182,
    18,
    85,
    104,
    3,
    6,
    7
  ],
  "97": [
    2186,
    21,
    77,
    98,
    3,
    6,
    5
  ],
  "98": [
    2190,
    18,
    89,
    110,
    3,
    6,
    2
  ],
  "99": [
    2194,
    17,
    101,
    118,
    3,
    7,
    4
  ],
  "100": [
    2206,
    18,
    90,
    105,
    3,
    7,
    3
  ],
  "101": [
    2170,
    19,
    98,
    109,
    3,
    5,
    4
  ],
  "102": [
    2174,
    20,
    92,
    107,
    3,
    7,
    4
  ],
  "103": [
    2178,
    18,
    91,
    108,
    3,
    7,
    2
  ],
  "104": [
    2182,
    19,
    99,
    117,
    3,
    7,
    3
  ],
  "105": [
    2156,
    15,
    76,
    92,
    2,
    4,
    2
  ],
  "106": [
    2190,
    18,
    84,
    104,
    3,
    7,
    6
  ],
  "107": [
    2194,
    17,
    84,
    107,
    3,
    7,
    3
  ],
  "108": [
    2198,
    18,
    89,
    100,
    3,
    8,
    2
  ],
  "109": [
    2202,
    19,
    99,
    114,
    3,
    6,
    5
  ],
  "110": [
    2214,
    21,
    89,
    119,
    3,
    7,
    7
  ],
  "111": [
    2178,
    21,
    73,
    102,
    3,
    5,
    6
  ],
  "112": [
    2182,
    19,
    90,
    98,
    3,
    5,
    3
  ],
  "113": [
    2186,
    20,
    91,
    107,
    3,
    7,
    6
  ],
  "114": [
    2190,
    21,
    93,
    105,
    3,
    6,
    3
  ],
  "115": [
    2164,
    14,
    77,
    86,
    2,
    3,
    2
  ],
  "116": [
    2198,
    18,
    91,
    106,
    3,
    7,
    3
  ],
  "117": [
    2202,
    18,
    94,
    113,
    3,
    6,
    3
  ],
  "118": [
    2206,
    20,
    88,
    109,
    3,
    8,
    4
  ],
  "119": [
    2210,
    18,
    87,
    110,
    3,
    7,
    3
  ],
  "120": [
    2222,
    21,
    86,
    108,
    3,
    8,
    7
  ]
};
const imported = LEVEL_DEFINITIONS.filter(l => l.id >= 81 && l.id <= 120);

test('four world modules select the authored definitions exactly, preserving the Desktop packet content', () => {
  expect(imported).toHaveLength(40);
  const ids = LEVEL_DEFINITIONS.map(l => l.id);
  expect(ids).toEqual(Array.from({ length: 410 }, (_, i) => i + 1));
  expect(new Set(ids).size).toBe(ids.length);
  for (const world of [9, 10, 11, 12]) {
    const raw = fs.readFileSync(path.resolve(`content/levels/world-${String(world).padStart(2, '0')}.json`), 'utf8');
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
  expect(def.replacesLegacy).toBe(def.id <= 100);
  expect(def.themeId).toBe(['prehistoric-titans', 'masterpiece-gallery', 'ancient-empires', 'enchanted-forest'][Math.floor((def.id - 81) / 10)]);
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

test.each([85, 95, 105, 115])('breather %i retains a shorter route and fewer Pals', id => {
  const b = getLevel(id)!;
  for (const neighbor of [getLevel(id - 1)!, getLevel(id + 1)!]) {
    expect(b.winningWitness!.length).toBeLessThan(neighbor.winningWitness!.length);
    expect(b.tunnels.flat().length).toBeLessThan(neighbor.tunnels.flat().length);
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

// Checksums of the authoritative Desktop level arrays; top-level replacement metadata is excluded.
test('grids, queues, witnesses and level metadata remain byte-equivalent to the source arrays', () => {
  const hashes: Record<number, string> = {
  "9": "0ad78f5ddca4838d0bf4ea9809c08333b0bde9c2f6bf17ca63a879344599dd17",
  "10": "8bdde69c563ca48f4fc052353778c0aee73226247491ab63141f013e8a2ccc9e",
  "11": "7f33533039cf94f379cc122fceadda1afe1aad515e7414ae3ba812eea14102e2",
  "12": "8fe2540e8c774bce501f636e29136393907c198421af63886ce9a5e763c6c1e8"
};
  for (const world of [9, 10, 11, 12]) {
    const packet = JSON.parse(fs.readFileSync(path.resolve(`content/levels/world-${String(world).padStart(2, '0')}.json`), 'utf8'));
    expect(createHash('sha256').update(JSON.stringify(packet.levels)).digest('hex')).toBe(hashes[world]);
  }
});
