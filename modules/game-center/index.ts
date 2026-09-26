import { requireOptionalNativeModule } from 'expo';

/**
 * Typed JS face of the local `GameCenter` Expo module (`ios/GameCenterModule.swift`).
 * `null` wherever the native module isn't compiled in — Android, web, Expo Go,
 * Jest — so callers treat Game Center as simply unavailable.
 */
export type NativeAuthStatus = 'authenticating' | 'authenticated' | 'signedOut' | 'error';

export interface NativeAuthSnapshot {
  status: NativeAuthStatus;
  displayName: string | null;
  alias: string | null;
  gamePlayerId: string | null;
  error: string | null;
}

export type DashboardTarget = 'leaderboard' | 'achievements' | 'default';

export interface GameCenterNativeModule {
  getAuthState(): NativeAuthSnapshot;
  authenticate(): void;
  submitScore(score: number, leaderboardIds: string[]): Promise<void>;
  reportAchievements(ids: string[]): Promise<void>;
  showDashboard(target: DashboardTarget, leaderboardId: string | null): Promise<void>;
  addListener(event: 'onAuthChange', listener: (snapshot: NativeAuthSnapshot) => void): { remove(): void };
}

export const GameCenterNative = requireOptionalNativeModule<GameCenterNativeModule>('GameCenter');
