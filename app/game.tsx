import { useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import { GameScreen } from '@/screens/GameScreen';
import { useProgress } from '@/hooks/useProgress';
import { FIRST_LEVEL, levelExists } from '@/game/levels/levels';
import { gameCenter } from '@/services/gameCenter';

export default function GameRoute() {
  const params = useLocalSearchParams<{ level?: string }>();
  const { completeLevel, reset } = useProgress();

  const parsed = Number.parseInt(params.level ?? '', 10);
  const levelId =
    Number.isFinite(parsed) && levelExists(parsed) ? parsed : FIRST_LEVEL;

  const handleWin = useCallback(
    (completed: number) => {
      // Local progress first; Game Center only mirrors it once saved, and is
      // fire-and-forget — a Game Center failure can never block the win.
      void completeLevel(completed).then((saved) => gameCenter.recordWin({
        mode: 'campaign',
        completedLevel: completed,
        highestUnlockedLevel: saved.highestUnlockedLevel,
      }));
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
