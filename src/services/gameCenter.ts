import { Platform } from 'react-native';

import { GameCenterNative } from '../../modules/game-center';
import { createGameCenterService } from '@/game/gameCenter/service';
import { CAMPAIGN_MANIFEST } from '@/game/levels/campaign';
import { gameCenterSubmissionStore } from '@/storage/gameCenter';
import { loadProgress } from '@/storage/progress';

/** The app's one Game Center service (iOS only; unavailable everywhere else). */
export const gameCenter = createGameCenterService({
  bridge: Platform.OS === 'ios' ? GameCenterNative : null,
  store: gameCenterSubmissionStore,
  manifest: CAMPAIGN_MANIFEST,
  loadHighestUnlocked: async () => (await loadProgress()).highestUnlockedLevel,
  log: (message, error) => {
    if (__DEV__) console.warn(message, error);
  },
});
