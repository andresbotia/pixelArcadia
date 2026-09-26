import type { ComponentType } from 'react';
import { Redirect } from 'expo-router';

/**
 * `/dev/levels` — DEV-ONLY Level Browser.
 *
 * The screen is `require`d inside a `__DEV__` branch: Metro inlines `__DEV__`
 * as `false` in release builds and constant-folds this before collecting
 * dependencies, so the browser module is not in a production bundle at all.
 * Release builds redirect Home.
 */
const Screen: ComponentType | null = __DEV__
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ? (require('../../src/screens/dev/devRoutes') as typeof import('../../src/screens/dev/devRoutes')).DevLevelsRoute
  : null;

export default function DevLevelsRoute() {
  if (!__DEV__ || !Screen) return <Redirect href="/" />;
  return <Screen />;
}
