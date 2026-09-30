import fs from 'fs';
import { createGame } from '../../engine/createGame';
import { applyActionWithArrivals } from '../../engine/holdingArrival';
import { launchCandidate, type GameAction } from '../../engine/actions';
import { getLevel, LEVEL_DEFINITIONS } from '../levels';
import { replayAuthoredWitness } from '../authoring/witness';
import { ORB_COLOR_IDS } from '../../engine/types';
import { CAMPAIGN_VERSION, PUBLISHED_MAX_LEVEL } from '../publishing';

test('M17A repaired boards keep exact clean production wins and difficulty metadata', () => {
  for (const id of [186, 242, 500]) {
    const definition = getLevel(id)!;
    expect(replayAuthoredWitness(definition)).toMatchObject({ valid: true, pixelsRemaining: 0, holdingRemaining: 0, tunnelsRemaining: 0, pendingRemaining: 0 });
  }
  for (const id of [159, 178, 216, 219]) expect(getLevel(id)!.difficulty).toBe('super-hard');
  for (const id of [189, 240]) expect(getLevel(id)!.difficulty).toBe('extreme');
  expect(getLevel(196)!.difficulty).toBe('super-hard');
  expect(LEVEL_DEFINITIONS.map(level => level.id)).toEqual(Array.from({ length: 500 }, (_, index) => index + 1));
  expect(ORB_COLOR_IDS).toHaveLength(44);
  expect([PUBLISHED_MAX_LEVEL, CAMPAIGN_VERSION]).toEqual([50, 'v2-50']);
});

test('the eight single and one double Level 500 alternatives all recover to clean wins', () => {
  const level = getLevel(500)!;
  const stored = JSON.parse(fs.readFileSync('docs/audits/M17A_LEVEL500_RECOVERY_WITNESSES.json', 'utf8')) as {
    recoveryWitnesses: { step: number; charge: string; secondCharge: string | null; actions: GameAction[] }[];
  };
  expect(stored.recoveryWitnesses).toHaveLength(9);
  expect(stored.recoveryWitnesses.filter(entry => entry.secondCharge)).toHaveLength(1);
  for (const entry of stored.recoveryWitnesses) {
    let state = createGame(level);
    for (const slot of level.winningWitness!.slice(0, entry.step - 1)) {
      const index = Number(slot.slice(1)) - 1;
      const action: GameAction = slot[0] === 'T'
        ? { kind: 'tunnel', id: state.tunnels[index]!.id }
        : { kind: 'holding', id: state.holding[index]!.id };
      state = applyActionWithArrivals(state, action).state;
    }
    expect(launchCandidate(state, entry.actions[0]!)?.id).toBe(entry.charge);
    for (const [index, action] of entry.actions.entries()) {
      if (index === 1 && entry.secondCharge) expect(launchCandidate(state, action)?.id).toBe(entry.secondCharge);
      const before = state.pixels.filter(pixel => !pixel.cleared).length;
      const result = applyActionWithArrivals(state, action);
      expect(result.accepted).toBe(true);
      state = result.state;
      expect(state.pixels.filter(pixel => !pixel.cleared).length).toBeLessThan(before);
    }
    expect(state.status).toBe('won');
    expect(state.pixels.filter(pixel => !pixel.cleared)).toHaveLength(0);
    expect(state.holding).toHaveLength(0);
    expect(state.pendingHolding).toHaveLength(0);
    expect(state.tunnels.every(tunnel => tunnel.queue.length === 0)).toBe(true);
  }
});
