import type { CampaignManifest } from '@/game/studio/campaign/types';
import { playPolicy, type PlayMode } from '@/game/playMode';
import { GAME_CENTER_IDS } from './config';
import { highestClearedLevel, planSubmission, type SubmittedMemo } from './plan';

export type GameCenterStatus = 'unavailable' | 'authenticating' | 'authenticated' | 'signedOut' | 'error';

export interface GameCenterPlayer {
  displayName: string;
  /** Stable per-game player id (GameKit `gamePlayerID`). */
  gamePlayerId: string | null;
}

export interface GameCenterState {
  status: GameCenterStatus;
  player: GameCenterPlayer | null;
}

/** Native surface the service needs (the local `GameCenter` Expo module satisfies it). */
export interface GameCenterBridge {
  getAuthState(): AuthSnapshot;
  authenticate(): void;
  submitScore(score: number, leaderboardIds: string[]): Promise<void>;
  reportAchievements(ids: string[]): Promise<void>;
  showDashboard(target: 'leaderboard' | 'achievements' | 'default', leaderboardId: string | null): Promise<void>;
  addListener(event: 'onAuthChange', listener: (snapshot: AuthSnapshot) => void): { remove(): void };
}

export interface AuthSnapshot {
  status: 'authenticating' | 'authenticated' | 'signedOut' | 'error';
  displayName: string | null;
  alias: string | null;
  gamePlayerId: string | null;
  error: string | null;
}

/** Per-player record of what has already been sent, so nothing is re-sent needlessly. */
export interface SubmissionStore {
  load(playerKey: string): Promise<SubmittedMemo>;
  save(playerKey: string, memo: SubmittedMemo): Promise<void>;
}

export interface GameCenterDeps {
  /** `null` when GameKit isn't compiled in (Android, web, Expo Go, tests). */
  bridge: GameCenterBridge | null;
  store: SubmissionStore;
  manifest: CampaignManifest;
  /** Saved local progress — authoritative. */
  loadHighestUnlocked: () => Promise<number>;
  log?: (message: string, error?: unknown) => void;
}

export interface GameCenterService {
  getState(): GameCenterState;
  subscribe(listener: () => void): () => void;
  /** Begin authentication (once) and backfill from local progress when signed in. */
  start(): void;
  /**
   * A campaign level was won AND local progress already saved. Fire-and-forget:
   * never throws, never blocks the win. No-op unless the play policy allows
   * Game Center submission and a player is signed in.
   */
  recordWin(args: { mode: PlayMode; completedLevel: number; highestUnlockedLevel: number }): Promise<void>;
  /** Mirror saved local progress (score + earned achievements) to Game Center. */
  reconcile(): Promise<void>;
  openLeaderboard(): Promise<boolean>;
  openAchievements(): Promise<boolean>;
}

const UNAVAILABLE: GameCenterState = { status: 'unavailable', player: null };

function toState(snapshot: AuthSnapshot): GameCenterState {
  if (snapshot.status !== 'authenticated') return { status: snapshot.status, player: null };
  return {
    status: 'authenticated',
    player: {
      displayName: snapshot.displayName ?? snapshot.alias ?? 'Player',
      gamePlayerId: snapshot.gamePlayerId,
    },
  };
}

export function createGameCenterService(deps: GameCenterDeps): GameCenterService {
  const { bridge, store, manifest, loadHighestUnlocked } = deps;
  const log = deps.log ?? (() => {});
  let state: GameCenterState = UNAVAILABLE;
  let started = false;
  const listeners = new Set<() => void>();
  // One sync at a time, so rapid wins can't double-send.
  let queue: Promise<void> = Promise.resolve();

  const setState = (next: GameCenterState) => {
    const wasAuthed = state.status === 'authenticated' ? state.player?.gamePlayerId : undefined;
    state = next;
    for (const l of listeners) l();
    // Backfill whenever a (possibly different) player becomes authenticated.
    if (next.status === 'authenticated' && next.player?.gamePlayerId !== wasAuthed) void reconcile();
  };

  const playerKey = () => state.player?.gamePlayerId ?? state.player?.displayName ?? 'local';

  const sync = (highestCleared: number) => {
    const run = async () => {
      if (!bridge || state.status !== 'authenticated') return;
      const key = playerKey();
      let memo: SubmittedMemo;
      try {
        memo = await store.load(key);
      } catch (e) {
        log('Game Center: could not read submission memo', e);
        memo = { score: 0, achievements: [] };
      }
      const plan = planSubmission(manifest, highestCleared, memo);
      let next = memo;
      if (plan.score !== undefined) {
        try {
          await bridge.submitScore(plan.score, [GAME_CENTER_IDS.leaderboards.campaignProgress]);
          next = { ...next, score: plan.score };
        } catch (e) {
          log('Game Center: score submission failed', e);
        }
      }
      if (plan.achievements.length > 0) {
        try {
          await bridge.reportAchievements(plan.achievements);
          next = { ...next, achievements: [...next.achievements, ...plan.achievements] };
        } catch (e) {
          log('Game Center: achievement report failed', e);
        }
      }
      if (next !== memo) {
        try {
          await store.save(key, next);
        } catch (e) {
          log('Game Center: could not save submission memo', e);
        }
      }
    };
    queue = queue.then(run, run);
    return queue;
  };

  const reconcile = async () => {
    try {
      const unlocked = await loadHighestUnlocked();
      await sync(highestClearedLevel(unlocked));
    } catch (e) {
      log('Game Center: reconciliation failed', e);
    }
  };

  const open = async (target: 'leaderboard' | 'achievements') => {
    if (!bridge || state.status !== 'authenticated') return false;
    try {
      await bridge.showDashboard(target, target === 'leaderboard' ? GAME_CENTER_IDS.leaderboards.campaignProgress : null);
      return true;
    } catch (e) {
      log('Game Center: could not open dashboard', e);
      return false;
    }
  };

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    start() {
      if (started || !bridge) return;
      started = true;
      try {
        bridge.addListener('onAuthChange', (snapshot) => setState(toState(snapshot)));
        bridge.authenticate();
      } catch (e) {
        log('Game Center: authentication could not start', e);
        setState({ status: 'error', player: null });
      }
    },
    async recordWin({ mode, completedLevel, highestUnlockedLevel }) {
      if (!playPolicy(mode).allowGameCenterSubmission) return;
      try {
        await sync(highestClearedLevel(highestUnlockedLevel, completedLevel));
      } catch (e) {
        log('Game Center: win sync failed', e);
      }
    },
    reconcile,
    openLeaderboard: () => open('leaderboard'),
    openAchievements: () => open('achievements'),
  };
}
