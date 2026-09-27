import { useCallback } from 'react';
import { Redirect, router, useLocalSearchParams } from 'expo-router';

import { GameScreen } from '@/screens/GameScreen';
import { useProgress } from '@/hooks/useProgress';
import { FIRST_LEVEL } from '@/game/levels/levels';
import { isPublishedCampaignLevel } from '@/game/levels/publishedCampaign';
import { analytics } from '@/analytics/service';
import { gameCenter } from '@/services/gameCenter';

export default function GameRoute() {
  const params = useLocalSearchParams<{ level?: string }>();
  const { completeLevel, reset } = useProgress();

  const parsed = Number.parseInt(params.level ?? '', 10);
  const requested = Number.isFinite(parsed) ? parsed : FIRST_LEVEL;
  // Campaign play is limited to PUBLISHED levels: anything past the ceiling
  // (or unknown) is not a campaign level — go Home. Dev play has its own route.
  const levelId = isPublishedCampaignLevel(requested) ? requested : null;

  const handleWin = useCallback(
    (completed: number) => {
      // Local progress first; Game Center only mirrors it once saved, and is
      // fire-and-forget — a Game Center failure can never block the win.
      void completeLevel(completed).then((saved) => {
        // Analytics (M14): progression properties + content-ceiling check.
        analytics.progressUpdated(saved.highestUnlockedLevel);
        gameCenter.recordWin({
          mode: 'campaign',
          completedLevel: completed,
          highestUnlockedLevel: saved.highestUnlockedLevel,
        });
      });
    },
    [completeLevel],
  );

  const handleAdvance = useCallback((nextId: number) => {
    router.setParams({ level: String(nextId) });
  }, []);

  const handleExit = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, []);

  if (levelId === null) return <Redirect href="/" />;

  return (
    <GameScreen
      key={levelId}
      levelId={levelId}
      onWin={handleWin}
      onAdvance={handleAdvance}
      onExit={handleExit}
      onResetProgress={() => void reset()}
    />
  );
}
