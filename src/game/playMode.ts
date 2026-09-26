/**
 * How a level is being played. The ONE place that decides what a run is
 * allowed to persist — GameScreen and the economy hook read this policy
 * instead of checking `__DEV__` at each reward/save call site.
 *
 *  - `campaign`: the real game. Wins unlock the next level, settle first-clear
 *    coins, consume/buy items for real, and record finished tutorials.
 *  - `dev`: the dev-only Level Browser. Real gameplay, sandboxed progression:
 *    nothing the run does is written to player save data.
 */
export type PlayMode = 'campaign' | 'dev';

export interface PlayPolicy {
  /** Unlock the next level / report the win to campaign progression. */
  readonly persistProgress: boolean;
  /** Settle first-clear coin rewards. */
  readonly awardRewards: boolean;
  /** Item use and restock purchases touch the saved economy. */
  readonly persistEconomy: boolean;
  /** Finished tutorials are recorded as seen. */
  readonly persistTutorials: boolean;
  /** Destructive save tools (the debug overlay's real "reset progress") may be offered. */
  readonly allowProgressReset: boolean;
  /** Leaderboard scores / achievements may be sent to Game Center. */
  readonly allowGameCenterSubmission: boolean;
}

const POLICIES: Record<PlayMode, PlayPolicy> = {
  campaign: { persistProgress: true, awardRewards: true, persistEconomy: true, persistTutorials: true, allowProgressReset: true, allowGameCenterSubmission: true },
  dev: { persistProgress: false, awardRewards: false, persistEconomy: false, persistTutorials: false, allowProgressReset: false, allowGameCenterSubmission: false },
};

export function playPolicy(mode: PlayMode): PlayPolicy {
  return POLICIES[mode];
}

/**
 * The real progress-reset handler a run may expose, or `undefined` when its
 * policy forbids it — the control is then not rendered at all, so a dev test
 * session has no path to the player's campaign save.
 */
export function progressResetFor<T extends () => void>(mode: PlayMode, reset: T | undefined): T | undefined {
  return playPolicy(mode).allowProgressReset ? reset : undefined;
}
