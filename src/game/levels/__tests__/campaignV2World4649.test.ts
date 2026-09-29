import fs from 'fs';
import { createGame } from '../../engine/createGame';
import { applyActionWithArrivals } from '../../engine/holdingArrival';
import { loadAuthoredDirectory, loadAuthoredFile } from '../authoring/loader';
import { validateLevelPacket, validateLevelStructure } from '../authoring/validate';
import { devLevelIndex } from '../devLevelIndex';
import { getLevel, LEVEL_DEFINITIONS } from '../levels';
import { isPublishedCampaignLevel } from '../publishedCampaign';
import { CAMPAIGN_VERSION, PUBLISHED_MAX_LEVEL } from '../publishing';

type Certificate = {
  id: number; title: string; pixels: number; colors: number; pals: number;
  witness: number; relaunches: number; bridges: number; peakHolding: number;
  holdingFullStates: number; smallPals: number; clean: boolean;
};
const certificate = JSON.parse(fs.readFileSync('docs/audits/M16F_LEVELS_451_490_CERTIFICATES.json', 'utf8')) as {
  paletteCount: number; levels: Certificate[];
};
const levels = LEVEL_DEFINITIONS.filter(level => level.id >= 451 && level.id <= 490);
const expected = new Map(certificate.levels.map(entry => [entry.id, entry]));

test('Worlds 46–49 each have ten authored levels in the unique 1–500 registry', () => {
  expect(levels).toHaveLength(40);
  expect(certificate.paletteCount).toBe(44);
  expect(LEVEL_DEFINITIONS.map(level => level.id)).toEqual(Array.from({ length: 500 }, (_, i) => i + 1));
  for (const world of [46, 47, 48, 49]) {
    const packet = loadAuthoredFile(`content/levels/world-${world}.json`);
    expect(packet.errors).toEqual([]);
    expect(packet.levels).toHaveLength(10);
    for (const level of packet.levels) expect(getLevel(level.id)).toEqual(level);
  }
  expect(levels.map(level => [level.id, level.title])).toEqual(certificate.levels.map(entry => [entry.id, entry.title]));
  const source = loadAuthoredDirectory('content/levels');
  expect(source.errors).toEqual([]);
  expect(source.levels).toHaveLength(500);
  for (const level of source.levels) expect(getLevel(level.id)).toEqual(level);
});

test.each(levels)('level $id replays its exact clean production witness', def => {
  const pinned = expected.get(def.id)!;
  expect(def.ruleset).toBe('coreV2');
  expect(def.activeCapacity).toBe(5);
  expect(def.holdingCapacity).toBe(3);
  expect(def.replacesLegacy).toBe(false);
  expect(def.tunnels).toHaveLength(3);
  expect(def.pixelArt).toHaveLength(48);
  expect(def.pixelArt.every(row => row.length === 48)).toBe(true);
  expect(validateLevelStructure(def).valid).toBe(true);
  expect(validateLevelPacket(def, { runSolver: false })).toMatchObject({ valid: true, solvability: 'PROVEN_BY_WITNESS' });
  expect(def.tunnels.flat()).toHaveLength(pinned.pals);
  expect(def.tunnels.flat().filter(pal => pal.capacity <= 2)).toHaveLength(pinned.smallPals);
  expect(def.winningWitness).toHaveLength(pinned.witness);
  let state = createGame(def);
  expect(state.pixels).toHaveLength(pinned.pixels);
  expect(new Set(state.pixels.map(pixel => pixel.color)).size).toBe(pinned.colors);
  const counts = new Map<string, number>();
  for (const pixel of state.pixels) counts.set(pixel.color, (counts.get(pixel.color) ?? 0) + 1);
  for (const population of counts.values()) expect(population).toBeGreaterThanOrEqual(25);
  let peak = 0, full = 0, relaunches = 0;
  const launches = new Map<string, { steps: number[]; hits: number[] }>();
  for (const [index, slot] of def.winningWitness!.entries()) {
    const position = Number(slot.slice(1)) - 1;
    const charge = slot[0] === 'T' ? state.tunnels[position]!.queue[0]! : state.holding[position]!;
    expect(charge).toBeDefined();
    const action = slot[0] === 'T' ? { kind: 'tunnel' as const, id: state.tunnels[position]!.id }
      : { kind: 'holding' as const, id: charge.id };
    const remaining = state.pixels.filter(pixel => !pixel.cleared).length;
    const result = applyActionWithArrivals(state, action);
    expect(result.accepted).toBe(true);
    const hits = remaining - result.state.pixels.filter(pixel => !pixel.cleared).length;
    expect(hits).toBeGreaterThan(0);
    const history = launches.get(charge.id) ?? { steps: [], hits: [] };
    history.steps.push(index + 1); history.hits.push(hits); launches.set(charge.id, history);
    state = result.state;
    peak = Math.max(peak, state.holding.length);
    full += Number(state.holding.length === 3);
    relaunches += Number(action.kind === 'holding');
    expect(state.status).not.toBe('lost');
  }
  expect(state.status).toBe('won');
  expect(state.pixels.every(pixel => pixel.cleared)).toBe(true);
  expect(state.holding).toHaveLength(0);
  expect(state.pendingHolding).toHaveLength(0);
  expect(state.tunnels.every(tunnel => tunnel.queue.length === 0)).toBe(true);
  expect(pinned.clean).toBe(true);
  expect(peak).toBe(pinned.peakHolding);
  expect(full).toBe(pinned.holdingFullStates);
  expect(relaunches).toBe(pinned.relaunches);
  expect([...launches.values()].filter(history => history.hits[0]! >= 6
    && history.steps.slice(1).some((step, i) => step - history.steps[0]! >= 3 && history.hits[i + 1]! >= 6)).length).toBe(pinned.bridges);
});

test.each([455, 465, 475, 485])('breather %i has relative route and Holding relief', id => {
  const entry = expected.get(id)!;
  const peers = certificate.levels.filter(level => Math.ceil(level.id / 10) === Math.ceil(id / 10) && level.id !== id);
  const average = (field: 'witness' | 'relaunches' | 'bridges') =>
    peers.reduce((sum, level) => sum + level[field], 0) / peers.length;
  expect(entry.peakHolding).toBeLessThanOrEqual(2);
  expect(entry.holdingFullStates).toBe(0);
  expect(entry.witness).toBeLessThan(average('witness'));
  expect(entry.relaunches).toBeLessThan(average('relaunches'));
  expect(entry.bridges).toBeLessThan(average('bridges'));
});

test.each([460, 470, 480, 490])('finale %i retains a strategic route', id => {
  const entry = expected.get(id)!;
  expect(entry.peakHolding).toBe(3);
  expect(entry.bridges).toBeGreaterThanOrEqual(6);
  expect(entry.witness).toBeGreaterThan(100);
});

test('World 49 keeps dark fracture cores and a two-palette palace', () => {
  for (const def of levels.filter(level => level.id >= 481)) {
    expect(createGame(def).pixels.some(pixel => pixel.color === 'pink')).toBe(false);
  }
  const palace = createGame(getLevel(490)!);
  const at = (x: number, y: number) => palace.pixels.find(pixel => pixel.x === x && pixel.y === y)?.color;
  expect(at(22, 25)).toBeUndefined(); // True void inside the filled diagonal wedge.
  expect(at(8, 20)).toBe('cyan'); // Day-side palace window.
  expect(at(42, 40)).toBe('graphite'); // Drained dusk-side masonry.
});

test('M16F remains unpublished while the developer index includes it', () => {
  expect(PUBLISHED_MAX_LEVEL).toBe(50);
  expect(CAMPAIGN_VERSION).toBe('v2-50');
  for (const level of levels) {
    expect(isPublishedCampaignLevel(level.id)).toBe(false);
    expect(devLevelIndex().find(entry => entry.id === level.id)).toMatchObject({ title: level.title, world: Math.ceil(level.id / 10) });
  }
  expect(getLevel(501)).toBeUndefined();
});
