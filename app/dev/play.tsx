import type { ComponentType } from 'react';
import { Redirect } from 'expo-router';

/**
 * `/dev/play?level=N` — DEV-ONLY dev test mode play. Same `__DEV__`-gated
 * `require` as `/dev/levels`, so release bundles never include it and a
 * release deep link to it redirects Home.
 */
const Screen: ComponentType | null = __DEV__
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ? (require('../../src/screens/dev/devRoutes') as typeof import('../../src/screens/dev/devRoutes')).DevPlayRoute
  : null;

export default function DevPlayRoute() {
  if (!__DEV__ || !Screen) return <Redirect href="/" />;
  return <Screen />;
}
