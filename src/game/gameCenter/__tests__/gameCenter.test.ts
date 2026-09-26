import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { GAME_CENTER_IDS } from '../config';
import { earnedAchievements, highestClearedLevel, worldAchievementFinales } from '../plan';
import {
  createGameCenterService, type AuthSnapshot, type GameCenterBridge, type SubmissionStore,
} from '../service';
import type { SubmittedMemo } from '../plan';
import { CAMPAIGN_MANIFEST } from '@/game/levels/campaign';
import { loadProgress, unlockNext } from '@/storage/progress';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

const LB = GAME_CENTER_IDS.leaderboards.campaignProgress;
const W1 = GAME_CENTER_IDS.achievements.world1Complete;
const W2 = GAME_CENTER_IDS.achievements.world2Complete;
const W1_FINALE = Math.max(...CAMPAIGN_MANIFEST.worlds.find((w) => w.id === 'first-light')!.levelIds);

function mockBridge() {
  let listener: ((s: AuthSnapshot) => void) | null = null;
  const bridge = {
    getAuthState: jest.fn(),
    authenticate: jest.fn(),
    submitScore: jest.fn<Promise<void>, [number, string[]]>(async () => {}),
    reportAchievements: jest.fn<Promise<void>, [string[]]>(async () => {}),
    showDashboard: jest.fn(async () => {}),
    addListener: jest.fn((_e: 'onAuthChange', l: (s: AuthSnapshot) => void) => { listener = l; return { remove() {} }; }),
  } satisfies GameCenterBridge;
  const auth = (status: AuthSnapshot['status'] = 'authenticated') => listener?.({
    status, displayName: 'Ada', alias: 'ada', gamePlayerId: status === 'authenticated' ? 'G:1' : null, error: null,
  });
  return { bridge, auth };
}

function memoryStore(): SubmissionStore & { data: Map<string, SubmittedMemo> } {
  const data = new Map<string, SubmittedMemo>();
  return {
    data,
    load: async (k) => data.get(k) ?? { score: 0, achievements: [] },
    save: async (k, m) => { data.set(k, m); },
  };
}

async function setup(highestUnlocked = 1) {
  await AsyncStorage.setItem('orbitide/progress/v1', JSON.stringify({ highestUnlockedLevel: highestUnlocked }));
  const { bridge, auth } = mockBridge();
  const store = memoryStore();
  const service = createGameCenterService({
    bridge,
    store,
    manifest: CAMPAIGN_MANIFEST,
    loadHighestUnlocked: async () => (await loadProgress()).highestUnlockedLevel,
  });
  service.start();
  return { service, bridge, auth, store };
}

/** Let queued syncs settle. */
const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('world achievement mapping (from campaign metadata)', () => {
  it('World 1 finale is the last level of the first-light world', () => {
    expect(worldAchievementFinales(CAMPAIGN_MANIFEST)).toContainEqual({ achievementId: W1, finaleLevel: W1_FINALE });
    expect(earnedAchievements(CAMPAIGN_MANIFEST, W1_FINALE - 1)).not.toContain(W1);
    expect(earnedAchievements(CAMPAIGN_MANIFEST, W1_FINALE)).toContain(W1);
  });

  it('World 2 completes at Level 20', () => {
    expect(worldAchievementFinales(CAMPAIGN_MANIFEST)).toContainEqual({ achievementId: W2, finaleLevel: 20 });
    expect(earnedAchievements(CAMPAIGN_MANIFEST, 19)).not.toContain(W2);
    expect(earnedAchievements(CAMPAIGN_MANIFEST, 20)).toEqual([W1, W2]);
  });

  it('highest cleared = unlocked − 1, folding in the level just won', () => {
    expect(highestClearedLevel(1)).toBe(0);
    expect(highestClearedLevel(21)).toBe(20);
    expect(highestClearedLevel(47, 47)).toBe(47); // final-level cap
  });
});

describe('Game Center submission', () => {
  it('dev test mode submits nothing, even when signed in', async () => {
    const { service, bridge, auth } = await setup();
    auth();
    await flush();
    bridge.submitScore.mockClear();
    await service.recordWin({ mode: 'dev', completedLevel: 20, highestUnlockedLevel: 21 });
    expect(bridge.submitScore).not.toHaveBeenCalled();
    expect(bridge.reportAchievements).not.toHaveBeenCalled();
  });

  it('campaign wins submit the highest cleared level to the campaign leaderboard', async () => {
    const { service, bridge, auth } = await setup();
    auth();
    await flush();
    await service.recordWin({ mode: 'campaign', completedLevel: 1, highestUnlockedLevel: 2 });
    expect(bridge.submitScore).toHaveBeenLastCalledWith(1, [LB]);
    await service.recordWin({ mode: 'campaign', completedLevel: 20, highestUnlockedLevel: 21 });
    expect(bridge.submitScore).toHaveBeenLastCalledWith(20, [LB]);
  });

  it('awards World 1 on its finale and World 2 on Level 20, once each', async () => {
    const { service, bridge, auth } = await setup();
    auth();
    await flush();
    await service.recordWin({ mode: 'campaign', completedLevel: W1_FINALE, highestUnlockedLevel: W1_FINALE + 1 });
    expect(bridge.reportAchievements).toHaveBeenLastCalledWith([W1]);
    await service.recordWin({ mode: 'campaign', completedLevel: 20, highestUnlockedLevel: 21 });
    expect(bridge.reportAchievements).toHaveBeenLastCalledWith([W2]);
    await service.recordWin({ mode: 'campaign', completedLevel: 21, highestUnlockedLevel: 22 });
    expect(bridge.reportAchievements).toHaveBeenCalledTimes(2);
  });

  it('sends no score when progress did not rise (replays, lower levels)', async () => {
    const { service, bridge, auth } = await setup();
    auth();
    await flush();
    await service.recordWin({ mode: 'campaign', completedLevel: 12, highestUnlockedLevel: 13 });
    expect(bridge.submitScore).toHaveBeenCalledTimes(1);
    await service.recordWin({ mode: 'campaign', completedLevel: 5, highestUnlockedLevel: 13 });
    await service.recordWin({ mode: 'campaign', completedLevel: 12, highestUnlockedLevel: 13 });
    expect(bridge.submitScore).toHaveBeenCalledTimes(1);
  });

  it('sends nothing while signed out', async () => {
    const { service, bridge, auth } = await setup();
    auth('signedOut');
    await service.recordWin({ mode: 'campaign', completedLevel: 20, highestUnlockedLevel: 21 });
    expect(bridge.submitScore).not.toHaveBeenCalled();
    expect(service.getState().status).toBe('signedOut');
  });

  it('is a quiet no-op where Game Center is unavailable', async () => {
    const service = createGameCenterService({
      bridge: null, store: memoryStore(), manifest: CAMPAIGN_MANIFEST, loadHighestUnlocked: async () => 21,
    });
    service.start();
    expect(service.getState().status).toBe('unavailable');
    await expect(service.recordWin({ mode: 'campaign', completedLevel: 20, highestUnlockedLevel: 21 })).resolves.toBeUndefined();
    await expect(service.openLeaderboard()).resolves.toBe(false);
  });
});

describe('reconciliation on sign-in', () => {
  it('backfills score and earned achievements from SAVED local progress', async () => {
    const { bridge, auth, service } = await setup(22); // cleared through 21
    auth();
    await flush();
    await flush();
    expect(bridge.submitScore).toHaveBeenCalledWith(21, [LB]);
    expect(bridge.reportAchievements).toHaveBeenCalledWith([W1, W2]);
    expect(service.getState().player).toEqual({ displayName: 'Ada', gamePlayerId: 'G:1' });
  });

  it('does not re-send what this player already has', async () => {
    const { bridge, auth, store } = await setup(22);
    store.data.set('G:1', { score: 21, achievements: [W1, W2] });
    auth();
    await flush();
    await flush();
    expect(bridge.submitScore).not.toHaveBeenCalled();
    expect(bridge.reportAchievements).not.toHaveBeenCalled();
  });

  it('a fresh player with no progress sends nothing', async () => {
    const { bridge, auth } = await setup(1);
    auth();
    await flush();
    await flush();
    expect(bridge.submitScore).not.toHaveBeenCalled();
  });
});

describe('Game Center failures never block local progression', () => {
  it('a failing submission leaves the saved win intact and is retried later', async () => {
    const { service, bridge, auth, store } = await setup(1);
    auth();
    await flush();
    bridge.submitScore.mockRejectedValueOnce(new Error('offline'));
    bridge.reportAchievements.mockRejectedValueOnce(new Error('offline'));

    const saved = await unlockNext(20);
    await expect(service.recordWin({ mode: 'campaign', completedLevel: 20, highestUnlockedLevel: saved.highestUnlockedLevel })).resolves.toBeUndefined();

    expect((await loadProgress()).highestUnlockedLevel).toBe(21);
    expect(store.data.get('G:1')?.score ?? 0).toBe(0); // not marked sent

    await service.reconcile();
    expect(bridge.submitScore).toHaveBeenLastCalledWith(20, [LB]);
    expect(bridge.reportAchievements).toHaveBeenLastCalledWith([W1, W2]);
    expect(store.data.get('G:1')).toEqual({ score: 20, achievements: [W1, W2] });
  });
});
