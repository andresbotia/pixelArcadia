import { useCallback, useEffect, useRef } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { OutOfHeartsModal } from '@/components/hearts/OutOfHeartsModal';
import { WorldLevelsScreen } from '@/screens/WorldLevelsScreen';
import { CAMPAIGN_MANIFEST } from '@/game/levels/campaign';
import { isPublishedCampaignLevel, publishedManifest } from '@/game/levels/publishedCampaign';
import { useHeartGate } from '@/hooks/useHeartGate';
import { useProgress } from '@/hooks/useProgress';

export default function WorldLevelsRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  const { progress, loading, reload } = useProgress();
  const gate = useHeartGate('campaign');
  const { guard } = gate;
  // The level the Out of Hearts prompt was raised for, so its PLAY opens it.
  const pendingLevel = useRef<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  // Published levels only: an unpublished world (or a stale/deep link to one)
  // is unknown here and bounces back to the map.
  const manifest = publishedManifest(CAMPAIGN_MANIFEST);
  const index = manifest.worlds.findIndex((w) => w.id === params.id);
  const world = index >= 0 ? manifest.worlds[index] : undefined;

  // Unknown/stale world id — bounce back to the map rather than render nothing.
  useEffect(() => {
    if (!world) router.replace('/worlds');
  }, [world]);

  const startLevel = useCallback((levelId: number) => {
    router.push({ pathname: '/game', params: { level: String(levelId) } });
  }, []);

  const selectLevel = useCallback((levelId: number) => {
    if (!isPublishedCampaignLevel(levelId)) return;
    pendingLevel.current = levelId;
    guard(() => startLevel(levelId), levelId);
  }, [guard, startLevel]);

  const retryPending = useCallback(() => {
    if (pendingLevel.current !== null) selectLevel(pendingLevel.current);
  }, [selectLevel]);

  if (!world) return null;

  return (
    <>
      <WorldLevelsScreen
        world={world}
        displayIndex={index + 1}
        progress={progress}
        loading={loading}
        onSelectLevel={selectLevel}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/worlds'))}
      />
      <OutOfHeartsModal visible={gate.blocked} onClose={gate.dismiss} onPlay={retryPending} source="world_levels" />
    </>
  );
}
