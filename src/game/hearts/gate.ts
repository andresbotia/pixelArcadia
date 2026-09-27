import { playPolicy, type PlayMode } from '@/game/playMode';

export type RunOutcome = 'won' | 'lost';

/**
 * May a run of `mode` start with `hearts` in the bank? Campaign needs at least
 * one heart; dev test mode ignores hearts entirely ({@link playPolicy}).
 */
export function canStartLevel(mode: PlayMode, hearts: number): boolean {
  return !playPolicy(mode).enforceHeartGate || hearts > 0;
}

/** Hearts a finished run costs: 1 for a campaign loss, 0 for any win or any dev run. */
export function heartCostFor(mode: PlayMode, outcome: RunOutcome): 0 | 1 {
  return outcome === 'lost' && playPolicy(mode).spendHeartOnLoss ? 1 : 0;
}
