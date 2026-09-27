/**
 * M11.5 — endgame fast-forward. Eligibility is pure engine state (every tunnel
 * queue empty); the effect is ONLY the presentation clock's rate. Scripts,
 * event order and engine outcomes are identical at 1× and at the endgame rate.
 */
import { act } from 'react';
import { createGame } from '@/game/engine/createGame';
import type { GameState, LevelDefinition, PendingArrival } from '@/game/engine/types';
import { ENDGAME_SPEED_MULTIPLIER } from '../constants';
import {
  createTimebase,
  isEndgameFastForwardEligible,
  presentationSpeedFor,
  presentationTime,
  retime,
} from '../endgame';
import { drive, expectConverged, mountSession, type DriveLog } from './sessionDriver';

jest.mock('react-native', () => ({ AppState: { addEventListener: jest.fn(() => ({ remove: jest.fn() })) } }));
jest.mock('@/game/feedback', () => ({ feedback: { emit: jest.fn(), cancelPending: jest.fn() } }));
jest.mock('@/game/hapticArbiter', () => ({ registerHit: jest.fn(), cancelHits: jest.fn() }));

const pal = { color: 'white' as const, capacity: 1 };

/** Three-tunnel (Legacy V1) state with the given queue lengths per tunnel. */
function withQueues(lengths: [number, number, number]): GameState {
  const level: LevelDefinition = {
    id: 9901, title: 'FF', themeId: 'test', difficulty: 'easy', holdingCapacity: 3,
    pixelArt: ['WWW', 'WWW', 'WWW'],
    tunnels: lengths.map((n) => Array.from({ length: n }, () => pal)),
  };
  return createGame(level);
}
const empty = () => withQueues([0, 0, 0]);
const someCharge = () => withQueues([1, 0, 0]).tunnels[0]!.queue[0]!;

describe('eligibility (canonical engine state)', () => {
  it('1. all tunnels empty → eligible', () => {
    expect(isEndgameFastForwardEligible(empty())).toBe(true);
  });

  it.each([
    ['2. T1', [1, 0, 0]],
    ['3. T2', [0, 1, 0]],
    ['4. T3', [0, 0, 1]],
  ] as const)('%s has one remaining Pal → not eligible', (_label, lengths) => {
    expect(isEndgameFastForwardEligible(withQueues([...lengths]))).toBe(false);
  });

  it('5. a hidden/deeper queue entry keeps it normal speed', () => {
    // Front consumed in some tunnels, but T2 still has entries beyond the visible window.
    expect(isEndgameFastForwardEligible(withQueues([0, 6, 0]))).toBe(false);
    // Bookkeeping entry with no "visible" front elsewhere: still a future Pal.
    const s = empty();
    const hidden: GameState = { ...s, tunnels: s.tunnels.map((t, i) => (i === 2 ? { ...t, queue: [someCharge()] } : t)) };
    expect(isEndgameFastForwardEligible(hidden)).toBe(false);
  });

  it('defensive: the helper scans the whole tunnels array, not a fixed index range', () => {
    // Synthetic state handed straight to the pure helper — NOT a valid level.
    // Production rules are exactly 3 tunnels (createGame rejects anything else);
    // this only proves the check never silently ignores a trailing entry.
    const s = empty();
    const extra: GameState = { ...s, tunnels: [...s.tunnels, { id: 'tunnel-extra', queue: [someCharge()] }] };
    expect(isEndgameFastForwardEligible(extra)).toBe(false);
  });

  it('6. tunnels empty + Active non-empty → eligible', () => {
    const s = empty();
    const active: GameState = { ...s, activeCharges: [{} as GameState['activeCharges'][number]] };
    expect(isEndgameFastForwardEligible(active)).toBe(true);
  });

  it('7. tunnels empty + Holding non-empty → eligible', () => {
    expect(isEndgameFastForwardEligible({ ...empty(), holding: [someCharge()] })).toBe(true);
  });

  it('8. tunnels empty + Active + Holding → eligible', () => {
    const s = empty();
    expect(isEndgameFastForwardEligible({
      ...s, holding: [someCharge()], activeCharges: [{} as GameState['activeCharges'][number]],
    })).toBe(true);
  });

  it('9. pendingHolding does not affect it — only tunnel exhaustion does', () => {
    const pending = [{ charge: someCharge() } as unknown as PendingArrival];
    expect(isEndgameFastForwardEligible({ ...empty(), pendingHolding: pending })).toBe(true);
    expect(isEndgameFastForwardEligible({ ...withQueues([0, 0, 1]), pendingHolding: pending })).toBe(false);
  });
});

describe('speed + timebase', () => {
  it('10. speed is 1 before eligibility', () => {
    expect(presentationSpeedFor(withQueues([1, 0, 0]))).toBe(1);
  });

  it('11. speed becomes the central multiplier (2.5) once eligible, and can be disabled', () => {
    expect(ENDGAME_SPEED_MULTIPLIER).toBe(2.5);
    expect(presentationSpeedFor(empty())).toBe(2.5);
    expect(presentationSpeedFor(empty(), false)).toBe(1);
  });

  it('is the identity at 1× and stays continuous across a rate change', () => {
    const tb = createTimebase(1000);
    expect(presentationTime(tb, 5000)).toBe(5000);
    const fast = retime(tb, 2.5, 5000);
    expect(presentationTime(fast, 5000)).toBe(5000); // no jump at the switch
    expect(presentationTime(fast, 5400)).toBe(6000); // 400 wall ms → 1000 presentation ms
    expect(retime(fast, 2.5, 9999)).toBe(fast); // same rate → same object
  });
});

// Blue has no exposed blue pixel: it laps and parks in Holding. White clears
// the ring and empties the last tunnel. The held blue then relaunches and wins.
const level: LevelDefinition = {
  id: 9902, title: 'Endgame', themeId: 'test', difficulty: 'easy', holdingCapacity: 3,
  pixelArt: ['WWW', 'WBW', 'WWW'],
  tunnels: [[{ color: 'blue', capacity: 1 }], [{ color: 'white', capacity: 8 }], []],
};
/** Scheduled in PRESENTATION ms, so both runs see the same action/event interleaving. */
const SCHEDULE = [{ at: 0, tunnel: 'tunnel-0' }, { at: 120, tunnel: 'tunnel-1' }, { at: 6000, held: 'c-0-0' }];

beforeEach(() => {
  jest.useFakeTimers();
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});
afterEach(() => { jest.useRealTimers(); });

function run(endgameFastForward: boolean): { log: DriveLog; final: GameState; view: GameState; rates: number[] } {
  const session = mountSession(level, { endgameFastForward });
  const heldId = session.get().engineState.tunnels[0]!.queue[0]!.id;
  const rates: number[] = [];
  const schedule = SCHEDULE.map((l) => ('held' in l ? { at: l.at, held: heldId } : l));
  const log = drive(session.get, schedule, { followTimebase: true, stepMs: 8 });
  rates.push(session.get().timebase.rate);
  const out = { log, final: session.get().engineState, view: session.get().state, rates };
  session.unmount();
  return out;
}

describe('session: fast-forward is presentation only', () => {
  it('rate stays 1 while a tunnel Pal remains, switches on the launch that empties the last tunnel', () => {
    const session = mountSession(level);
    const s = () => session.get();
    act(() => { s().launch('tunnel-0'); });
    expect(s().timebase.rate).toBe(1);
    act(() => { s().launch('tunnel-1'); });
    expect(s().timebase.rate).toBe(ENDGAME_SPEED_MULTIPLIER);
    // Undo can restore a tunnel Pal → back to normal speed.
    act(() => { s().undo(); });
    expect(s().engineState.tunnels.some((t) => t.queue.length > 0)).toBe(true);
    expect(s().timebase.rate).toBe(1);
    act(() => { s().restart(); });
    expect(s().timebase.rate).toBe(1);
    session.unmount();
  });

  it('12. a Holding relaunch after exhaustion stays accelerated', () => {
    const fast = run(true);
    expect(fast.final.status).toBe('won');
    expect(fast.rates).toEqual([ENDGAME_SPEED_MULTIPLIER]);
    const heldPass = fast.log.lastPass.get(fast.log.launched[2]!)!;
    expect(heldPass.origin).toBe('holding');
    // The relaunch leaves the tray at its tap; the win is its last beat. Under
    // fast-forward that whole script plays in totalMs / 2.5 wall ms (±1 step).
    const wallOf = (log: DriveLog) => log.statusAtMs! - log.holdingTimeline[log.holdingTimeline.length - 1]!.atMs;
    const normal = run(false);
    expect(Math.abs(wallOf(normal.log) - heldPass.totalMs)).toBeLessThanOrEqual(16);
    expect(Math.abs(wallOf(fast.log) - heldPass.totalMs / ENDGAME_SPEED_MULTIPLIER)).toBeLessThanOrEqual(16);
    expect(fast.log.statusAtMs!).toBeLessThan(normal.log.statusAtMs!);
  });

  it('13. presentation ordering and scripts are unchanged', () => {
    const fast = run(true);
    const normal = run(false);
    expect(fast.log.launched).toEqual(normal.log.launched);
    expect([...fast.log.terminals.entries()]).toEqual([...normal.log.terminals.entries()]);
    for (const id of normal.log.launched) {
      const a = fast.log.lastPass.get(id)!;
      const b = normal.log.lastPass.get(id)!;
      expect(a.events.map((e) => [e.kind, e.at])).toEqual(b.events.map((e) => [e.kind, e.at]));
      expect(a.shots.map((sh) => [sh.pixelId, sh.clearAt])).toEqual(b.shots.map((sh) => [sh.pixelId, sh.clearAt]));
      expect(a.convoyHolds).toEqual(b.convoyHolds);
    }
    expect(fast.log.holdingTimeline.map((h) => h.view)).toEqual(normal.log.holdingTimeline.map((h) => h.view));
    expect(fast.log.violations).toEqual([]);
    expect(normal.log.violations).toEqual([]);
    expect(fast.log.divergences).toEqual([]);
  });

  it('14. the engine outcome is identical at normal and fast presentation speed', () => {
    const fast = run(true);
    const normal = run(false);
    expect(fast.final).toEqual(normal.final);
    expect(fast.final.status).toBe('won');
    expectConverged(fast.view, fast.final);
    expectConverged(normal.view, normal.final);
  });
});
