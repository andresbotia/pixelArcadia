import { useCallback } from 'react';
import { router, useFocusEffect, type Href } from 'expo-router';

import { OutOfHeartsModal } from '@/components/hearts/OutOfHeartsModal';
import { publishedProgress } from '@/game/levels/publishedCampaign';
import { HomeScreen } from '@/screens/HomeScreen';
import { useProgress } from '@/hooks/useProgress';
import { useEconomy } from '@/hooks/useEconomy';
import { useHeartGate } from '@/hooks/useHeartGate';
import { useHearts } from '@/hooks/useHearts';

export default function HomeRoute() {
  const { progress, loading, reset, reload } = useProgress();
  const { economy, reload: reloadEconomy } = useEconomy();
  const { hearts, nextHeartAt, refresh: refreshHearts } = useHearts();
  const gate = useHeartGate('campaign');
  // The published ceiling: Home never offers a level past PUBLISHED_MAX_LEVEL
  // (a completed campaign replays its last level); the raw save is untouched.
  const playableLevel = publishedProgress(progress).highestUnlockedLevel;

  useFocusEffect(
    useCallback(() => {
      void reload();
      void reloadEconomy();
      void refreshHearts();
    }, [reload, reloadEconomy, refreshHearts]),
  );

  const startLevel = useCallback(() => {
    router.push({
      pathname: '/game',
      params: { level: String(playableLevel) },
    });
  }, [playableLevel]);

  return (
    <>
      <HomeScreen
        highestUnlockedLevel={playableLevel}
        loading={loading}
        coins={economy.coins}
        hearts={hearts}
        nextHeartAt={nextHeartAt}
        onPlay={() => gate.guard(startLevel, playableLevel)}
        onShop={() => router.replace('/shop' as Href)}
        onLeaderboard={() => router.replace('/leaderboard' as Href)}
        onSettings={() => router.push('/settings' as Href)}
        onSecretReset={() => void reset()}
        onDevLevels={__DEV__ ? () => router.push('/dev/levels' as Href) : undefined}
      />
      <OutOfHeartsModal visible={gate.blocked} onClose={gate.dismiss} onPlay={() => gate.guard(startLevel, playableLevel)} source="home_play" />
    </>
  );
}
