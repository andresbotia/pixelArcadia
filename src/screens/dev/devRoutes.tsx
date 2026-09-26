import { useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import { FIRST_LEVEL, levelExists } from '@/game/levels/levels';
import { launchLevel } from '@/navigation/launchLevel';
import { DevLevelBrowserScreen } from '@/screens/dev/DevLevelBrowserScreen';
import { DevPlayScreen } from '@/screens/dev/DevPlayScreen';

/**
 * DEV-ONLY route bodies for `app/dev/*`. Only ever loaded through those
 * routes' `__DEV__`-gated `require`.
 */
export function DevLevelsRoute() {
  const onPlay = useCallback((levelId: number) => launchLevel({ levelId, mode: 'dev' }), []);
  const onClose = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, []);
  return <DevLevelBrowserScreen onPlay={onPlay} onClose={onClose} />;
}

export function DevPlayRoute() {
  const params = useLocalSearchParams<{ level?: string }>();
  const parsed = Number.parseInt(params.level ?? '', 10);
  const levelId = Number.isFinite(parsed) && levelExists(parsed) ? parsed : FIRST_LEVEL;

  // Prev / Next swap the param in place: no stack growth, and LIST's `back()`
  // always returns to the browser with its filters intact.
  const onNavigate = useCallback((id: number) => router.setParams({ level: String(id) }), []);
  const onBrowser = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/dev/levels');
  }, []);

  return <DevPlayScreen levelId={levelId} onNavigate={onNavigate} onBrowser={onBrowser} />;
}
