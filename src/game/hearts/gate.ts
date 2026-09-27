import { playPolicy, type PlayMode } from '@/game/playMode';

export type RunOutcome = 'won' | 'lost';

/**
 * May a run of `mode` start with `hearts` in the bank? Campaign needs at least
 * one heart; dev test mode ignores hearts entirely ({@link playPolicy}).
 * `rewardedRetry`: a confirmed rewarded-retry pass for this level (M12) lets
 * one campaign start through at 0 hearts. It never applies where ads don't.
 */
export function canStartLevel(mode: PlayMode, hearts: number, opts: { rewardedRetry?: boolean } = {}): boolean {
  const policy = playPolicy(mode);
  if (!policy.enforceHeartGate) return true;
  return hearts > 0 || (!!opts.rewardedRetry && policy.allowAds);
}

/** Hearts a finished run costs: 1 for a campaign loss, 0 for any win or any dev run. */
export function heartCostFor(mode: PlayMode, outcome: RunOutcome): 0 | 1 {
  return outcome === 'lost' && playPolicy(mode).spendHeartOnLoss ? 1 : 0;
}
