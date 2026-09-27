import { useCallback, useState } from 'react';

import { canStartLevel } from '@/game/hearts/gate';
import { playPolicy, type PlayMode } from '@/game/playMode';
import { takeRewardedRetry } from '@/storage/ads';
import { peekHearts } from '@/storage/hearts';

export interface HeartGate {
  /**
   * Run `start` if a `mode` run may begin; otherwise raise the Out of Hearts
   * prompt instead. Every campaign entry point (Home PLAY, World Levels, the
   * post-loss Retry) routes through this.
   *
   * `levelId`: the level being started. A pending rewarded retry (M12) for it
   * is consumed by this start and lets it begin even at 0 hearts — the one free
   * start the player watched an ad for (it survives an app kill between the
   * reward and the retry).
   */
  guard: (start: () => void, levelId?: number) => void;
  /** Out of Hearts prompt is up. */
  blocked: boolean;
  dismiss: () => void;
}

export function useHeartGate(mode: PlayMode): HeartGate {
  const [blocked, setBlocked] = useState(false);

  const guard = useCallback((start: () => void, levelId?: number) => {
    // A pending rewarded retry for this level is used by this start (once).
    const rewardedRetry = levelId !== undefined && playPolicy(mode).allowAds && takeRewardedRetry(levelId);
    // Read the save at tap time (reconciled to now), not a rendered value, so
    // a heart that regenerated a moment ago is counted. Not loaded yet (boot
    // preloads it, so only on a storage failure) → fail open: a storage fault
    // must never lock the player out.
    const state = peekHearts();
    if (state === null || canStartLevel(mode, state.hearts, { rewardedRetry })) start();
    else setBlocked(true);
  }, [mode]);

  const dismiss = useCallback(() => setBlocked(false), []);

  return { guard, blocked, dismiss };
}
