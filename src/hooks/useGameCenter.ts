import { useSyncExternalStore } from 'react';

import type { GameCenterState } from '@/game/gameCenter/service';
import { gameCenter } from '@/services/gameCenter';

/** Game Center auth/player state for UI. Offline / signed-out is a normal state. */
export function useGameCenter(): GameCenterState {
  return useSyncExternalStore(gameCenter.subscribe, gameCenter.getState, gameCenter.getState);
}
