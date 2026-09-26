import { sandboxConsume, sandboxRestock } from '../economy/sandbox';
import { playPolicy, progressResetFor } from '../playMode';

describe('play mode policy', () => {
  it('campaign play persists everything', () => {
    expect(playPolicy('campaign')).toEqual({
      persistProgress: true, awardRewards: true, persistEconomy: true, persistTutorials: true,
      allowProgressReset: true, allowGameCenterSubmission: true,
    });
  });

  it('dev test mode persists nothing', () => {
    expect(playPolicy('dev')).toEqual({
      persistProgress: false, awardRewards: false, persistEconomy: false, persistTutorials: false,
      allowProgressReset: false, allowGameCenterSubmission: false,
    });
  });
});

describe('real progress reset', () => {
  it('campaign play keeps the exact reset handler', () => {
    const reset = jest.fn();
    expect(progressResetFor('campaign', reset)).toBe(reset);
  });

  it('dev test mode exposes no reset, so the real one can never run', () => {
    const reset = jest.fn();
    const exposed = progressResetFor('dev', reset);
    expect(exposed).toBeUndefined();
    exposed?.();
    expect(reset).not.toHaveBeenCalled();
  });
});

describe('dev sandbox inventory', () => {
  const inv = Object.freeze({ undo: 1, extraSlot: 0, bomb: 2 });

  it('spends from a copy, never the source inventory', () => {
    expect(sandboxConsume(inv, 'undo')).toEqual({ undo: 0, extraSlot: 0, bomb: 2 });
    expect(inv).toEqual({ undo: 1, extraSlot: 0, bomb: 2 });
  });

  it('refuses to spend an empty item', () => {
    expect(sandboxConsume(inv, 'extraSlot')).toBeNull();
  });

  it('restocks for free on a copy', () => {
    expect(sandboxRestock(inv, 'extraSlot')).toEqual({ undo: 1, extraSlot: 1, bomb: 2 });
    expect(inv.extraSlot).toBe(0);
  });
});
