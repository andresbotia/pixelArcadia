import fs from 'fs';
import { createGame } from '../../engine/createGame';
import { applyActionWithArrivals } from '../../engine/holdingArrival';
import { ORB_COLOR_IDS } from '../../engine/types';
import { loadAuthoredDirectory, loadAuthoredFile } from '../authoring/loader';
import { validateLevelPacket } from '../authoring/validate';
import { devLevelIndex } from '../devLevelIndex';
import { getLevel, LEVEL_DEFINITIONS } from '../levels';
import { isPublishedCampaignLevel } from '../publishedCampaign';
import { CAMPAIGN_VERSION, PUBLISHED_MAX_LEVEL } from '../publishing';

const certificate = JSON.parse(fs.readFileSync('docs/audits/M16G_LEVELS_491_500_CERTIFICATES.json', 'utf8')) as {
  levels: { id: number; pixels: number; colors: number; pals: number; witness: number;
    relaunches: number; bridges: number; peakHolding: number; holdingFullStates: number;
    smallPals: number; clean: boolean }[];
};
const levels = LEVEL_DEFINITIONS.filter(level => level.id >= 491 && level.id <= 500);

test('World 50 is the unique terminal world of the 1–500 source and runtime registries', () => {
  expect(LEVEL_DEFINITIONS.map(level => level.id)).toEqual(Array.from({ length: 500 }, (_, i) => i + 1));
  expect(new Set(LEVEL_DEFINITIONS.map(level => level.id)).size).toBe(500);
  expect(levels).toHaveLength(10);
  const source = loadAuthoredDirectory('content/levels');
  expect(source.errors).toEqual([]);
  expect(source.levels).toHaveLength(500);
  for (const level of source.levels) expect(getLevel(level.id)).toEqual(level);
  expect(loadAuthoredFile('content/levels/world-50.json').levels).toEqual(levels);
  expect(getLevel(501)).toBeUndefined();
});

test.each(levels)('level $id has valid geometry and a productive clean production witness', level => {
  const pinned = certificate.levels.find(entry => entry.id === level.id)!;
  expect(level.ruleset).toBe('coreV2');
  expect(level.replacesLegacy).toBe(false);
  expect(level.activeCapacity).toBe(5);
  expect(level.holdingCapacity).toBe(3);
  expect(level.tunnels).toHaveLength(3);
  expect(level.pixelArt).toHaveLength(48);
  expect(level.pixelArt.every(row => row.length === 48)).toBe(true);
  expect(validateLevelPacket(level, { runSolver: false })).toMatchObject({ valid: true, solvability: 'PROVEN_BY_WITNESS' });
  expect(level.tunnels.flat()).toHaveLength(pinned.pals);
  expect(level.tunnels.flat().filter(pal => pal.capacity <= 2)).toHaveLength(pinned.smallPals);
  expect(level.winningWitness).toHaveLength(pinned.witness);
  let state = createGame(level), peak = 0, full = 0, relaunches = 0;
  expect(state.pixels).toHaveLength(pinned.pixels);
  expect(new Set(state.pixels.map(pixel => pixel.color)).size).toBe(pinned.colors);
  for (const slot of level.winningWitness!) {
    const index = Number(slot.slice(1)) - 1;
    const action = slot[0] === 'T' ? { kind: 'tunnel' as const, id: state.tunnels[index]!.id }
      : { kind: 'holding' as const, id: state.holding[index]!.id };
    const before = state.pixels.filter(pixel => !pixel.cleared).length;
    const result = applyActionWithArrivals(state, action);
    expect(result.accepted).toBe(true);
    expect(result.state.pixels.filter(pixel => !pixel.cleared).length).toBeLessThan(before);
    state = result.state;
    expect(state.status).not.toBe('lost');
    peak = Math.max(peak, state.holding.length);
    full += Number(state.holding.length === 3);
    relaunches += Number(action.kind === 'holding');
  }
  expect(state.status).toBe('won');
  expect(state.pixels.every(pixel => pixel.cleared)).toBe(true);
  expect(state.holding).toHaveLength(0);
  expect(state.pendingHolding).toHaveLength(0);
  expect(state.tunnels.every(tunnel => tunnel.queue.length === 0)).toBe(true);
  expect(peak).toBe(pinned.peakHolding);
  expect(full).toBe(pinned.holdingFullStates);
  expect(relaunches).toBe(pinned.relaunches);
  expect(pinned.clean).toBe(true);
});

test('495 keeps relative breather relief and 500 retains the approved capstone geometry', () => {
  const breather = certificate.levels.find(level => level.id === 495)!;
  expect(breather.peakHolding).toBeLessThanOrEqual(2);
  expect(breather.holdingFullStates).toBe(0);
  expect(breather.witness).toBeLessThan(certificate.levels.find(level => level.id === 494)!.witness);
  expect(breather.witness).toBeLessThan(certificate.levels.find(level => level.id === 496)!.witness);
  const capstone = certificate.levels.find(level => level.id === 500)!;
  expect(capstone.pixels).toBe(2285);
  expect(capstone.colors).toBe(20);
  expect(capstone.smallPals).toBe(0);
  expect(capstone.peakHolding).toBe(3);
});

test('the final world is included in the v1-500 publication ceiling', () => {
  expect(ORB_COLOR_IDS).toHaveLength(44);
  expect(PUBLISHED_MAX_LEVEL).toBe(500);
  expect(CAMPAIGN_VERSION).toBe('v1-500');
  for (const level of levels) {
    expect(isPublishedCampaignLevel(level.id)).toBe(true);
    expect(devLevelIndex().find(entry => entry.id === level.id)).toMatchObject({ title: level.title, world: 50 });
  }
});
