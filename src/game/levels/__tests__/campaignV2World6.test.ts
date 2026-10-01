import { parsePixelArt, DEFAULT_ART_LEGEND } from '../../engine/art';
import type { GameAction } from '../../engine/actions';
import { createGame } from '../../engine/createGame';
import { applyActionWithArrivals } from '../../engine/holdingArrival';
import { expectedTunnelCount } from '../../engine/ruleset';
import type { GameState, LevelDefinition } from '../../engine/types';
import { validateLevelStructure } from '../authoring/validate';
import { devLevelIndex } from '../devLevelIndex';
import { getLevel, LEVEL_DEFINITIONS, levelExists } from '../levels';
import { isPublishedCampaignLevel, nextPublishedLevelId } from '../publishedCampaign';
import { CAMPAIGN_VERSION, PUBLISHED_MAX_LEVEL } from '../publishing';

/**
 * Campaign V2 World 6 — World Landmarks (Levels 51–60), imported verbatim from
 * the authored packet. Witnesses are replayed, never re-solved: the author
 * solver-verified every level, so this suite only proves the import and the
 * runtime agree.
 */
const WORLD_6 = LEVEL_DEFINITIONS.filter((level) => level.id >= 51 && level.id <= 60);

/** Author sanity metrics (pixels, colours, witness, Pals, peak Holding). */
const EXPECTED: Record<number, { title: string; px: number; colors: number; witness: number; pals: number; peak: number }> = {
  51: { title: 'Leaning Tower of Pisa', px: 1485, colors: 15, witness: 75, pals: 70, peak: 2 },
  52: { title: 'Big Ben', px: 1481, colors: 15, witness: 72, pals: 67, peak: 2 },
  53: { title: 'Sydney Opera House', px: 1542, colors: 16, witness: 66, pals: 61, peak: 3 },
  54: { title: 'Taj Mahal', px: 1575, colors: 16, witness: 75, pals: 68, peak: 3 },
  55: { title: 'Eiffel Tower', px: 1580, colors: 16, witness: 59, pals: 57, peak: 1 },
  56: { title: 'Tower Bridge', px: 1612, colors: 17, witness: 85, pals: 79, peak: 3 },
  57: { title: 'Colosseum', px: 1610, colors: 17, witness: 84, pals: 78, peak: 3 },
  58: { title: 'Statue of Liberty', px: 1649, colors: 18, witness: 81, pals: 71, peak: 3 },
  59: { title: 'Golden Gate Bridge', px: 1754, colors: 18, witness: 94, pals: 85, peak: 3 },
  60: { title: 'World Wonders', px: 1753, colors: 19, witness: 86, pals: 78, peak: 3 },
};

interface WitnessReplay {
  state: GameState;
  rejected: number;
  peakHolding: number;
  peakPending: number;
  relaunches: number;
  relaunchedPals: number;
}

/** Witness steps: `Tn` launches tunnel n's front Pal, `Hn` relaunches Holding slot n. */
function toAction(state: GameState, step: string): GameAction | null {
  const index = Number(step.slice(1)) - 1;
  if (step[0] === 'T') {
    const tunnel = state.tunnels[index];
    return tunnel && tunnel.queue.length > 0 ? { kind: 'tunnel', id: tunnel.id } : null;
  }
  if (step[0] === 'H') {
    const held = state.holding[index];
    return held ? { kind: 'holding', id: held.id } : null;
  }
  return null;
}

function replayWitness(level: LevelDefinition): WitnessReplay {
  let state = createGame(level);
  let rejected = 0;
  let peakHolding = 0;
  let peakPending = 0;
  let relaunches = 0;
  const relaunched = new Set<string>();
  for (const step of level.winningWitness ?? []) {
    const action = toAction(state, step);
    if (!action) { rejected += 1; break; }
    const outcome = applyActionWithArrivals(state, action);
    if (!outcome.accepted) { rejected += 1; break; }
    if (action.kind === 'holding') { relaunches += 1; relaunched.add(action.id); }
    state = outcome.state;
    peakHolding = Math.max(peakHolding, state.holding.length);
    peakPending = Math.max(peakPending, state.pendingHolding.length);
  }
  return { state, rejected, peakHolding, peakPending, relaunches, relaunchedPals: relaunched.size };
}

const replays = new Map<number, WitnessReplay>();
const replayOf = (level: LevelDefinition) => {
  if (!replays.has(level.id)) replays.set(level.id, replayWitness(level));
  return replays.get(level.id)!;
};

test('World 6 is the ten imported World Landmarks levels, one definition per id', () => {
  expect(WORLD_6.map((level) => level.id)).toEqual([51, 52, 53, 54, 55, 56, 57, 58, 59, 60]);
  expect(WORLD_6.map((level) => level.title)).toEqual(Object.values(EXPECTED).map((e) => e.title));
  expect(WORLD_6.every((level) => level.themeId === 'world-landmarks')).toBe(true);
  expect(WORLD_6.every((level) => level.replacesLegacy === true)).toBe(true);
  const ids = LEVEL_DEFINITIONS.map((level) => level.id);
  expect(new Set(ids).size).toBe(ids.length);
  // Levels 61-100 are untouched by this import.
  expect(getLevel(61)?.themeId).not.toBe('world-landmarks');
});

// 13 + 14
test.each(WORLD_6)('level $id is Core V2 with exactly 3 tunnels and Holding 3', (level) => {
  expect(level.ruleset).toBe('coreV2');
  expect(level.tunnels).toHaveLength(3);
  expect(expectedTunnelCount(level.ruleset)).toBe(3);
  expect(level.holdingCapacity).toBe(3);
  expect(level.tunnels.every((tunnel) => tunnel.length > 0)).toBe(true);
});

// 15
test.each(WORLD_6)('level $id has an exact per-colour capacity budget and validates', (level) => {
  const state = createGame(level);
  const need = new Map<string, number>();
  const have = new Map<string, number>();
  for (const pixel of state.pixels) need.set(pixel.color, (need.get(pixel.color) ?? 0) + 1);
  for (const charge of level.tunnels.flat()) have.set(charge.color, (have.get(charge.color) ?? 0) + charge.capacity);
  expect(have).toEqual(need);

  const result = validateLevelStructure(level);
  expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
  expect(result.valid).toBe(true);
});

test.each(WORLD_6)('level $id matches the author metrics', (level) => {
  const e = EXPECTED[level.id]!;
  const art = parsePixelArt(level.id, level.pixelArt, { ...DEFAULT_ART_LEGEND, ...(level.legend ?? {}) });
  expect(art.width).toBe(48);
  expect(art.height).toBeGreaterThanOrEqual(46);
  expect(art.height).toBeLessThanOrEqual(48);
  expect(art.pixels).toHaveLength(e.px);
  expect(new Set(art.pixels.map((p) => p.color)).size).toBe(e.colors);
  expect(level.tunnels.flat()).toHaveLength(e.pals);
  expect(level.winningWitness).toHaveLength(e.witness);
});

// 16
test.each(WORLD_6)('level $id authored witness wins through the production engine', (level) => {
  const e = EXPECTED[level.id]!;
  // Items used 0: every step is a tunnel launch or Holding relaunch.
  expect(level.winningWitness!.every((step) => /^[TH][1-3]$/.test(step))).toBe(true);
  const r = replayOf(level);
  expect(r.rejected).toBe(0);
  expect(r.state.status).toBe('won');
  expect(r.state.pixels.filter((p) => !p.cleared)).toHaveLength(0);
  expect(r.state.holding).toHaveLength(0);
  expect(r.state.pendingHolding).toHaveLength(0);
  expect(r.peakPending).toBe(0);
  expect(r.peakHolding).toBe(e.peak);
  expect(r.state.holdingCapacity).toBe(3);
  expect(r.state.tunnels.every((tunnel) => tunnel.queue.length === 0)).toBe(true);
});

// 17
test('Level 55 stays the strategic breather between 54 and 56', () => {
  const byId = (id: number) => WORLD_6.find((level) => level.id === id)!;
  const l54 = byId(54);
  const l55 = byId(55);
  const l56 = byId(56);
  const r54 = replayOf(l54);
  const r55 = replayOf(l55);
  const r56 = replayOf(l56);
  expect(l55.difficulty).toBe('medium');
  expect(l55.winningWitness!.length).toBeLessThan(l54.winningWitness!.length);
  expect(l55.winningWitness!.length).toBeLessThan(l56.winningWitness!.length);
  expect(l55.tunnels.flat().length).toBeLessThan(l54.tunnels.flat().length);
  expect(l55.tunnels.flat().length).toBeLessThan(l56.tunnels.flat().length);
  expect(r55.peakHolding).toBe(1);
  expect(r55.peakHolding).toBeLessThan(r54.peakHolding);
  expect(r55.peakHolding).toBeLessThan(r56.peakHolding);
  // One strategic bridge + one cleanup relaunch.
  expect(r55.relaunches).toBe(2);
  expect(r55.relaunches).toBeLessThan(r54.relaunches);
  expect(r55.relaunches).toBeLessThan(r56.relaunches);
});

// 18
test('Level 60 carries the World Wonders finale metadata', () => {
  const l60 = WORLD_6.find((level) => level.id === 60)!;
  const r = replayOf(l60);
  expect(l60.title).toBe('World Wonders');
  expect(l60.difficulty).toBe('hard');
  expect(l60.tunnels.flat()).toHaveLength(78);
  expect(l60.winningWitness).toHaveLength(86);
  expect(r.peakHolding).toBe(3);
  // 4 strategic bridges (two of them relaunched twice) + 2 cleanups = 8 relaunches of 6 Pals.
  expect(r.relaunches).toBe(8);
  expect(r.relaunchedPals).toBe(6);
  // Most colourful board so far, and denser than everything before Level 59
  // (the M15A.1 sky fill leaves Golden Gate one pixel ahead).
  const rows = devLevelIndex().filter((row) => row.id <= 60);
  const row60 = rows.find((row) => row.id === 60)!;
  expect(row60.pixels).toBeGreaterThan(Math.max(...rows.filter((row) => row.id < 59).map((row) => row.pixels)));
  expect(row60.colors).toBe(Math.max(...rows.map((row) => row.colors)));
  expect(row60.colors).toBe(19);
});

// 19
test('normal campaign opens Level 51 under the 500-level ceiling', () => {
  expect(PUBLISHED_MAX_LEVEL).toBe(500);
  expect(CAMPAIGN_VERSION).toBe('v1-500');
  expect(isPublishedCampaignLevel(50)).toBe(true);
  for (const level of WORLD_6) expect(isPublishedCampaignLevel(level.id)).toBe(true);
  expect(nextPublishedLevelId(50)).toBe(51);
});

// 20
test('dev mode can open Levels 51-60 with their imported metadata', () => {
  const rows = devLevelIndex();
  for (const level of WORLD_6) {
    expect(levelExists(level.id)).toBe(true);
    const row = rows.find((r) => r.id === level.id)!;
    expect(row.title).toBe(EXPECTED[level.id]!.title);
    expect(row.ruleset).toBe('coreV2');
    expect(row.witness).toBe(EXPECTED[level.id]!.witness);
    expect(row.pals).toBe(EXPECTED[level.id]!.pals);
  }
});
