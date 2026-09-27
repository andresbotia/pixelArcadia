import { HEART_REGEN_MS, MAX_HEARTS } from '../config';
import { canStartLevel, heartCostFor } from '../gate';
import {
  createHeartState,
  formatHeartCountdown,
  grantHeart,
  reconcileHeartState,
  sanitizeHeartState,
  spendHeart,
  timeUntilNextHeart,
  type HeartState,
} from '../state';

const T0 = 1_750_000_000_000;
const MIN = 60 * 1000;
const at = (hearts: number, lastHeartRegenAt: number | null): HeartState => ({ hearts, lastHeartRegenAt, lastLossRunId: null });

describe('hearts config', () => {
  it('is 5 max, one heart per 30 minutes', () => {
    expect(MAX_HEARTS).toBe(5);
    expect(HEART_REGEN_MS).toBe(30 * MIN);
  });
});

describe('spending', () => {
  it('1. starts at 5, full, with no timer', () => {
    const s = createHeartState();
    expect(s).toEqual({ hearts: 5, lastHeartRegenAt: null, lastLossRunId: null });
    expect(timeUntilNextHeart(s, T0)).toBeNull();
  });

  it('2. a loss takes 5 → 4 and starts the timer at the loss', () => {
    const res = spendHeart(createHeartState(), T0, 'run-a');
    expect(res.spent).toBe(true);
    expect(res.state.hearts).toBe(4);
    expect(res.state.lastHeartRegenAt).toBe(T0);
    expect(timeUntilNextHeart(res.state, T0)).toBe(HEART_REGEN_MS);
  });

  it('3. the same run is only ever charged once', () => {
    const first = spendHeart(createHeartState(), T0, 'run-a');
    const again = spendHeart(first.state, T0 + 10, 'run-a');
    expect(again.spent).toBe(false);
    expect(again.refusal).toBe('duplicate');
    expect(again.state.hearts).toBe(4);
    // A different run is a different loss.
    expect(spendHeart(again.state, T0 + 20, 'run-b').state.hearts).toBe(3);
  });

  it('4. a win costs nothing', () => {
    expect(heartCostFor('campaign', 'won')).toBe(0);
    expect(heartCostFor('campaign', 'lost')).toBe(1);
  });

  it('5. a dev-mode loss costs nothing', () => {
    expect(heartCostFor('dev', 'lost')).toBe(0);
    expect(heartCostFor('dev', 'won')).toBe(0);
  });

  it('cannot go below zero', () => {
    const res = spendHeart(at(0, T0), T0 + MIN, 'run-z');
    expect(res.spent).toBe(false);
    expect(res.refusal).toBe('empty');
    expect(res.state.hearts).toBe(0);
  });

  it('losing while the timer runs keeps the running timer (next heart not pushed back)', () => {
    const s = spendHeart(at(4, T0), T0 + 10 * MIN, 'run-b').state;
    expect(s.hearts).toBe(3);
    expect(s.lastHeartRegenAt).toBe(T0);
    expect(timeUntilNextHeart(s, T0 + 10 * MIN)).toBe(20 * MIN);
  });

  it('losing multiple hearts then waiting restores them one per interval', () => {
    let s = createHeartState();
    s = spendHeart(s, T0, 'a').state;
    s = spendHeart(s, T0 + MIN, 'b').state;
    s = spendHeart(s, T0 + 2 * MIN, 'c').state;
    expect(s.hearts).toBe(2);
    expect(reconcileHeartState(s, T0 + 30 * MIN).hearts).toBe(3);
    expect(reconcileHeartState(s, T0 + 60 * MIN).hearts).toBe(4);
    expect(reconcileHeartState(s, T0 + 90 * MIN)).toEqual({ ...s, hearts: 5, lastHeartRegenAt: null });
  });
});

describe('regeneration', () => {
  it('6. 29:59 elapsed grants nothing (and returns the same object)', () => {
    const s = at(3, T0);
    const next = reconcileHeartState(s, T0 + 30 * MIN - 1000);
    expect(next).toBe(s);
    expect(formatHeartCountdown(timeUntilNextHeart(next, T0 + 30 * MIN - 1000)!)).toBe('00:01');
  });

  it('7. 30:00 grants exactly one and advances the anchor by one interval', () => {
    const next = reconcileHeartState(at(3, T0), T0 + 30 * MIN);
    expect(next.hearts).toBe(4);
    expect(next.lastHeartRegenAt).toBe(T0 + 30 * MIN);
  });

  it('8. 60:00 grants two', () => {
    expect(reconcileHeartState(at(1, T0), T0 + 60 * MIN).hearts).toBe(3);
  });

  it('keeps partial progress: 31 min closed → +1 and 29 min to the next', () => {
    const next = reconcileHeartState(at(2, T0), T0 + 31 * MIN);
    expect(next.hearts).toBe(3);
    expect(timeUntilNextHeart(next, T0 + 31 * MIN)).toBe(29 * MIN);
  });

  it('10 minutes closed grants nothing', () => {
    expect(reconcileHeartState(at(2, T0), T0 + 10 * MIN).hearts).toBe(2);
  });

  it('2 hours closed grants four', () => {
    expect(reconcileHeartState(at(0, T0), T0 + 120 * MIN).hearts).toBe(4);
  });

  it('9. overnight caps at 5 and clears the timer', () => {
    const next = reconcileHeartState(at(0, T0), T0 + 10 * 60 * MIN);
    expect(next).toEqual({ hearts: 5, lastHeartRegenAt: null, lastLossRunId: null });
    expect(timeUntilNextHeart(next, T0 + 10 * 60 * MIN)).toBeNull();
  });

  it('10. full hearts never create a bogus timer or extra hearts', () => {
    const full = createHeartState();
    expect(reconcileHeartState(full, T0 + 24 * 60 * MIN)).toBe(full);
    // A stray anchor on a full save is cleared, never counted.
    expect(reconcileHeartState(at(5, T0), T0 + 90 * MIN)).toEqual({ hearts: 5, lastHeartRegenAt: null, lastLossRunId: null });
  });

  it('11. repeated reconcile never double-grants', () => {
    const once = reconcileHeartState(at(1, T0), T0 + 45 * MIN);
    const twice = reconcileHeartState(once, T0 + 45 * MIN);
    const thrice = reconcileHeartState(twice, T0 + 46 * MIN);
    expect(once.hearts).toBe(2);
    expect(twice).toBe(once);
    expect(thrice).toBe(once);
  });

  it('12. a future anchor (clock moved back / malformed) restarts the interval — no negatives, no burst', () => {
    const next = reconcileHeartState(at(2, T0 + 5 * 60 * MIN), T0);
    expect(next.hearts).toBe(2);
    expect(next.lastHeartRegenAt).toBe(T0);
    expect(timeUntilNextHeart(next, T0)).toBe(HEART_REGEN_MS);
    // Even an un-reconciled future anchor never reports more than one interval, or less than zero.
    const remaining = timeUntilNextHeart(at(2, T0 + 5 * 60 * MIN), T0)!;
    expect(remaining).toBeGreaterThanOrEqual(0);
    expect(remaining).toBeLessThanOrEqual(HEART_REGEN_MS);
  });

  it('ignores a non-finite clock', () => {
    const s = at(2, T0);
    expect(reconcileHeartState(s, Number.NaN)).toBe(s);
  });
});

describe('sanitize (loaded saves)', () => {
  it('defaults garbage to a full, fresh state', () => {
    expect(sanitizeHeartState(null, T0)).toEqual(createHeartState());
    expect(sanitizeHeartState('nope', T0)).toEqual(createHeartState());
    expect(sanitizeHeartState({ hearts: 'x' }, T0)).toEqual(createHeartState());
  });

  it('clamps impossible heart counts', () => {
    expect(sanitizeHeartState({ hearts: 99 }, T0).hearts).toBe(5);
    expect(sanitizeHeartState({ hearts: -3, lastHeartRegenAt: T0 }, T0).hearts).toBe(0);
    expect(sanitizeHeartState({ hearts: 2.9, lastHeartRegenAt: T0 }, T0).hearts).toBe(2);
    expect(sanitizeHeartState({ hearts: Infinity }, T0).hearts).toBe(5);
  });

  it('repairs a missing / malformed anchor below full by starting the timer now', () => {
    expect(sanitizeHeartState({ hearts: 3 }, T0).lastHeartRegenAt).toBe(T0);
    expect(sanitizeHeartState({ hearts: 3, lastHeartRegenAt: 'soon' }, T0).lastHeartRegenAt).toBe(T0);
    expect(sanitizeHeartState({ hearts: 3, lastHeartRegenAt: -1 }, T0).lastHeartRegenAt).toBe(T0);
  });

  it('drops the anchor when full', () => {
    expect(sanitizeHeartState({ hearts: 5, lastHeartRegenAt: T0 }, T0).lastHeartRegenAt).toBeNull();
  });
});

describe('grant', () => {
  it('adds hearts, caps at 5, and clears the timer at full', () => {
    expect(grantHeart(at(3, T0), T0 + MIN)).toEqual({ hearts: 4, lastHeartRegenAt: T0, lastLossRunId: null });
    expect(grantHeart(at(4, T0), T0 + MIN, 3)).toEqual({ hearts: 5, lastHeartRegenAt: null, lastLossRunId: null });
  });
});

describe('gate', () => {
  it('13. 0 hearts blocks a campaign start; any heart allows it', () => {
    expect(canStartLevel('campaign', 0)).toBe(false);
    expect(canStartLevel('campaign', 1)).toBe(true);
  });

  it('14. dev mode bypasses the heart gate', () => {
    expect(canStartLevel('dev', 0)).toBe(true);
  });
});

describe('countdown format', () => {
  it('renders MM:SS for the next heart, rounding up', () => {
    expect(formatHeartCountdown(HEART_REGEN_MS)).toBe('30:00');
    expect(formatHeartCountdown(29 * MIN + 14_000)).toBe('29:14');
    expect(formatHeartCountdown(12 * MIN + 1_500)).toBe('12:02');
    expect(formatHeartCountdown(1)).toBe('00:01');
    expect(formatHeartCountdown(0)).toBe('00:00');
    expect(formatHeartCountdown(-5000)).toBe('00:00');
  });
});
