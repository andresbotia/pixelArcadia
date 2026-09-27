import { useCallback, useState } from 'react';

import { canStartLevel } from '@/game/hearts/gate';
import type { PlayMode } from '@/game/playMode';
import { peekHearts } from '@/storage/hearts';

export interface HeartGate {
  /**
   * Run `start` if a `mode` run may begin; otherwise raise the Out of Hearts
   * prompt instead. Every campaign entry point (Home PLAY, World Levels, the
   * post-loss Retry) routes through this.
   */
  guard: (start: () => void) => void;
  /** Out of Hearts prompt is up. */
  blocked: boolean;
  dismiss: () => void;
}

export function useHeartGate(mode: PlayMode): HeartGate {
  const [blocked, setBlocked] = useState(false);

  const guard = useCallback((start: () => void) => {
    // Read the save at tap time (reconciled to now), not a rendered value, so
    // a heart that regenerated a moment ago is counted. Not loaded yet (boot
    // preloads it, so only on a storage failure) → fail open: a storage fault
    // must never lock the player out.
    const state = peekHearts();
    if (state === null || canStartLevel(mode, state.hearts)) start();
    else setBlocked(true);
  }, [mode]);

  const dismiss = useCallback(() => setBlocked(false), []);

  return { guard, blocked, dismiss };
}
