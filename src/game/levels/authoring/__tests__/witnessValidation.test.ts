import { createGame } from '@/game/engine/createGame';
import * as arrivals from '@/game/engine/holdingArrival';
import * as search from '@/game/engine/solver';
import type { GameState, LevelDefinition } from '@/game/engine/types';
import { getLevel } from '@/game/levels/levels';
import { parseAuthoredJSON } from '../loader';
import { validateLevelPacket } from '../validate';
import { replayAuthoredWitness } from '../witness';

const easy: LevelDefinition = { id: 9910, title: 'Proof', themeId: 'first-light', difficulty: 'easy',
  holdingCapacity: 3, ruleset: 'coreV2', pixelArt: ['WWWW', 'WWWW', 'WWWW', 'WWWW'],
  tunnels: [[{ color: 'white', capacity: 8 }, { color: 'white', capacity: 8 }], [], []], winningWitness: ['T1', 'T1'] };
const withoutWitness = () => ({ ...easy, winningWitness: undefined });
afterEach(() => jest.restoreAllMocks());

test('valid witness and solver both prove the level', () => {
  const result = validateLevelPacket(easy);
  expect(result.valid).toBe(true);
  expect(result.structuralValidity).toBe('VALID');
  expect(result.solvability).toBe('PROVEN_BY_WITNESS_AND_SOLVER');
  expect(result.solver?.status).toBe('SOLVED');
});
test('valid witness with real node cap passes as inconclusive', () => {
  const result = validateLevelPacket(easy, { nodeCap: 0 });
  expect(result.valid).toBe(true);
  expect(result.solvability).toBe('PROVEN_BY_WITNESS');
  expect(result.solver?.nodeCapHit).toBe(true);
  expect(result.diagnostics.some(d => d.code === 'SOLVER_INCONCLUSIVE')).toBe(true);
});
test('valid witness with solver timeout passes as inconclusive', () => {
  jest.spyOn(search, 'findFirstWinningWitness').mockReturnValue({ solved: false, moves: [], nodes: 1, nodeCapHit: false, timeCapHit: true });
  const result = validateLevelPacket(easy);
  expect(result.valid).toBe(true);
  expect(result.solver?.timeCapHit).toBe(true);
  expect(result.solvability).toBe('PROVEN_BY_WITNESS');
});
test.each([['T4'], ['H1'], ['T1', 'T1', 'T1'], ['T0'], []].map(winningWitness => ({ winningWitness })))('invalid explicit witness %j fails, never falls back to solver', ({ winningWitness }) => {
  expect(validateLevelPacket({ ...easy, winningWitness }).valid).toBe(false);
});
test('witness leaving pixels fails', () => {
  const result = validateLevelPacket({ ...easy, winningWitness: ['T1'] });
  expect(result.valid).toBe(false);
  expect(result.witnessReplay?.pixelsRemaining).toBe(8);
});
test('witness leaving Holding fails under production staging semantics', () => {
  const staged: LevelDefinition = { ...easy, pixelArt: ['WWWW', 'WKKW', 'WKKW', 'WWWW'],
    tunnels: [[{ color: 'pink', capacity: 4 }], [{ color: 'white', capacity: 12 }], []], winningWitness: ['T1', 'T2'] };
  expect(replayAuthoredWitness(staged)).toMatchObject({ valid: false, holdingRemaining: 1, pixelsRemaining: 4 });
  expect(replayAuthoredWitness({ ...staged, winningWitness: ['T1', 'T2', 'H1'] }).valid).toBe(true);
});
// Fault injection proves the final guard independently of the engine's own win predicate.
test.each(['holding', 'pendingHolding', 'tunnels'] as const)('a reported win with leftover %s fails the final guard', field => {
  const initial = createGame(easy);
  const won: GameState = { ...initial, status: 'won' as const, pixels: initial.pixels.map(p => ({ ...p, cleared: true })),
    holding: [], pendingHolding: [], tunnels: initial.tunnels.map(t => ({ ...t, queue: [] })) };
  const dirty: GameState = { ...won, [field]: initial[field] };
  if (field === 'holding') dirty.holding = [initial.tunnels[0]!.queue[0]!];
  if (field === 'pendingHolding') dirty.pendingHolding = [{ charge: initial.tunnels[0]!.queue[0]!, grace: 0 }];
  jest.spyOn(arrivals, 'applyActionWithArrivals').mockReturnValue({ accepted: true, state: dirty } as unknown as ReturnType<typeof arrivals.applyActionWithArrivals>);
  expect(replayAuthoredWitness({ ...easy, winningWitness: ['T1'] }).valid).toBe(false);
});
test('rejected runtime action invalidates a witness', () => {
  jest.spyOn(arrivals, 'applyActionWithArrivals').mockReturnValue({ accepted: false, state: createGame(easy), rejection: 'holdingFull' } as unknown as ReturnType<typeof arrivals.applyActionWithArrivals>);
  expect(replayAuthoredWitness(easy)).toMatchObject({ valid: false, rejected: 1 });
});
test.each([
  { tunnels: [easy.tunnels[0]!] },
  { tunnels: [[{ color: 'white' as const, capacity: 15 }], [], []] },
  { pixelArt: ['WWWW', 'WW', 'WWWW', 'WWWW'] },
])('malformed structure is rejected before any witness replay', patch => {
  const spy = jest.spyOn(arrivals, 'applyActionWithArrivals');
  const result = validateLevelPacket({ ...easy, ...patch });
  expect(result.structuralValidity).toBe('INVALID');
  expect(result.valid).toBe(false);
  expect(spy).not.toHaveBeenCalled();
});
test('absent witness requires a solver win even when optional search is disabled', () => {
  expect(validateLevelPacket(withoutWitness(), { runSolver: false })).toMatchObject({ valid: true, solvability: 'PROVEN_BY_SOLVER' });
});
test('absent witness and capped solver fail with no proof', () => {
  expect(validateLevelPacket(withoutWitness(), { nodeCap: 0 })).toMatchObject({ valid: false, solvability: 'UNPROVEN', solver: { status: 'INCONCLUSIVE' } });
});
test('replay invokes the production settled-arrival action path', () => {
  const spy = jest.spyOn(arrivals, 'applyActionWithArrivals');
  expect(replayAuthoredWitness(easy).valid).toBe(true);
  expect(spy).toHaveBeenCalledTimes(2);
  expect(spy.mock.calls[1]![0].movesApplied).toBe(1);
});
test('normal easy legacy levels retain solver-based behavior', () => {
  expect(validateLevelPacket({ ...getLevel(1)!, winningWitness: undefined }).valid).toBe(true);
});
test('exhaustive solver contradiction cannot be ignored', () => {
  jest.spyOn(search, 'findFirstWinningWitness').mockReturnValue({ solved: false, moves: [], nodes: 3, nodeCapHit: false, timeCapHit: false });
  const result = validateLevelPacket(easy);
  expect(result.valid).toBe(false);
  expect(result.diagnostics.some(d => d.code === 'SOLVER_WITNESS_CONTRADICTION')).toBe(true);
});
test('solver exception and invalid solver replay fail despite authored proof', () => {
  const spy = jest.spyOn(search, 'findFirstWinningWitness').mockImplementation(() => { throw new Error('fault'); });
  expect(validateLevelPacket(easy).solver?.status).toBe('ERROR');
  spy.mockReturnValue({ solved: true, moves: [], nodes: 1, nodeCapHit: false, timeCapHit: false });
  expect(validateLevelPacket(easy).valid).toBe(false);
});
test('loader preserves empty and malformed witnesses for rejection', () => {
  for (const winningWitness of [[], 'T1', ['not-an-action']]) {
    const loaded = parseAuthoredJSON(JSON.stringify({ ...easy, winningWitness }), 'fixture');
    expect(loaded.errors.length > 0 || !validateLevelPacket(loaded.levels[0]!).valid).toBe(true);
  }
});
