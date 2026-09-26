import { router, type Href } from 'expo-router';

import type { PlayMode } from '@/game/playMode';

/**
 * Open a level. `campaign` is the production `/game` route; `dev` is the
 * `__DEV__`-only `/dev/play` route (dev test mode) and is a no-op in a
 * release build.
 */
export function launchLevel({ levelId, mode, replace = false }: { levelId: number; mode: PlayMode; replace?: boolean }): void {
  if (mode === 'dev' && !__DEV__) return;
  const href = {
    pathname: mode === 'dev' ? '/dev/play' : '/game',
    params: { level: String(levelId) },
  } as Href;
  if (replace) router.replace(href);
  else router.push(href);
}
