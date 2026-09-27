import { useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';

import { WorldSelectScreen } from '@/screens/WorldSelectScreen';
import { CAMPAIGN_MANIFEST } from '@/game/levels/campaign';
import { summarizeWorlds } from '@/game/levels/campaignProgress';
import { publishedManifest } from '@/game/levels/publishedCampaign';
import { useProgress } from '@/hooks/useProgress';

export default function WorldsRoute() {
  const { progress, loading, reload } = useProgress();

  // Refresh unlocked state whenever we return here (e.g. after clearing a level).
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  // Published worlds/levels only. Completion reads the raw save (beating the
  // last published level is recorded one past it), so it shows as complete.
  const summaries = summarizeWorlds(publishedManifest(CAMPAIGN_MANIFEST), progress);

  return (
    <WorldSelectScreen
      summaries={summaries}
      loading={loading}
      onSelectWorld={(worldId) =>
        router.push({ pathname: '/world/[id]', params: { id: worldId } })
      }
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    />
  );
}
