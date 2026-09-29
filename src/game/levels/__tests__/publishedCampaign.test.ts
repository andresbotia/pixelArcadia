import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { createAnalytics, type AnalyticsClient } from '@/analytics/api';
import type { AnalyticsProps } from '@/analytics/events';
import { GAME_CENTER_IDS } from '@/game/gameCenter/config';
import { createGameCenterService, type AuthSnapshot, type GameCenterBridge, type SubmissionStore } from '@/game/gameCenter/service';
import type { SubmittedMemo } from '@/game/gameCenter/plan';
import { createMemoryAnalyticsStore } from '@/storage/analytics';
import { loadProgress, unlockNext } from '@/storage/progress';

import { CAMPAIGN_MANIFEST } from '../campaign';
import { levelSlotState, summarizeWorlds } from '../campaignProgress';
import { devLevelIndex } from '../devLevelIndex';
import { levelExists, nextLevelId } from '../levels';
import {
  isCampaignComplete,
  isPublishedCampaignLevel,
  nextPublishedLevelId,
  publishedHighestCompleted,
  publishedManifest,
  publishedProgress,
} from '../publishedCampaign';
import { CAMPAIGN_VERSION, PUBLISHED_MAX_LEVEL } from '../publishing';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

const repo = resolve(__dirname, '../../../..');
const src = (rel: string) => readFileSync(join(repo, rel), 'utf8');
const PROGRESS_KEY = 'orbitide/progress/v1';

beforeEach(async () => { await AsyncStorage.clear(); });

describe('published campaign boundary (PUBLISHED_MAX_LEVEL = 50)', () => {
  it('is the single published ceiling: 50 / v2-50, while the registry still holds 51–100', () => {
    expect(PUBLISHED_MAX_LEVEL).toBe(50);
    expect(CAMPAIGN_VERSION).toBe('v2-50');
    expect(levelExists(51)).toBe(true);
    expect(levelExists(100)).toBe(true);
  });

  it('1. campaign play cannot launch Level 51 (route redirects anything unpublished)', () => {
    expect(isPublishedCampaignLevel(50)).toBe(true);
    expect(isPublishedCampaignLevel(51)).toBe(false);
    expect(isPublishedCampaignLevel(100)).toBe(false);
    expect(isPublishedCampaignLevel(0)).toBe(false);
    const route = src('app/game.tsx');
    expect(route).toMatch(/isPublishedCampaignLevel\(requested\)/);
    expect(route).toMatch(/<Redirect href="\/" \/>/);
    expect(src('app/world/[id].tsx')).toMatch(/if \(!isPublishedCampaignLevel\(levelId\)\) return;/);
  });

  it('2–3. clearing Level 50 records the completion but does not unlock Level 51 for campaign play', async () => {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ highestUnlockedLevel: 50 }));
    const saved = await unlockNext(50);
    expect(saved.highestUnlockedLevel).toBe(51); // raw: "50 is beaten"
    expect(publishedHighestCompleted(saved.highestUnlockedLevel)).toBe(50);
    expect(isCampaignComplete(saved)).toBe(true);
    expect(publishedProgress(saved).highestUnlockedLevel).toBe(50);
    expect(isPublishedCampaignLevel(saved.highestUnlockedLevel)).toBe(false);
  });

  it('4. NEXT after Level 50 goes nowhere in campaign (win card offers Home only)', () => {
    expect(nextPublishedLevelId(49)).toBe(50);
    expect(nextPublishedLevelId(50)).toBeUndefined();
    const game = src('src/screens/GameScreen.tsx');
    expect(game).toMatch(/const next = mode === 'campaign' \? nextPublishedLevelId\(levelId\) : nextLevelId\(levelId\);/);
    expect(src('src/screens/HomeScreen.tsx')).toMatch(/nextLevelId=\{nextPublishedLevelId\(level\.id\)\}/);
  });

  it('5. Level 50 stays replayable once the campaign is complete', () => {
    const done = { highestUnlockedLevel: 51 };
    expect(publishedProgress(done).highestUnlockedLevel).toBe(50); // Home PLAY → Level 50
    expect(isPublishedCampaignLevel(50)).toBe(true);
    expect(levelSlotState(done, 50)).toBe('complete'); // selectable in World Levels
  });

  it('6. dev mode may still open Levels 51–100', () => {
    expect(nextLevelId(50)).toBe(51); // dev NEXT chain
    expect(devLevelIndex().some((row) => row.id === 51)).toBe(true);
    expect(devLevelIndex().some((row) => row.id === 100)).toBe(true);
    expect(src('src/screens/dev/devRoutes.tsx')).toMatch(/levelExists\(parsed\)/);
  });

  it('7. historical progress above the ceiling is preserved, never lowered', async () => {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ highestUnlockedLevel: 73 }));
    expect((await loadProgress()).highestUnlockedLevel).toBe(73);
    expect((await unlockNext(12)).highestUnlockedLevel).toBe(73);
    expect(JSON.parse((await AsyncStorage.getItem(PROGRESS_KEY))!).highestUnlockedLevel).toBe(73);
  });

  it('8. campaign UI clamps to the published max', () => {
    const legacy = { highestUnlockedLevel: 73 };
    expect(publishedProgress(legacy).highestUnlockedLevel).toBe(50);
    const manifest = publishedManifest(CAMPAIGN_MANIFEST);
    expect(manifest.worlds).toHaveLength(5);
    expect(Math.max(...manifest.worlds.flatMap((w) => w.levelIds))).toBe(50);
    expect(Math.max(...manifest.orderedLevelIds)).toBe(50);
    const summaries = summarizeWorlds(manifest, legacy);
    expect(summaries).toHaveLength(5);
    expect(summaries.every((s) => s.state === 'complete' && s.completedCount === s.totalCount)).toBe(true);
    expect(CAMPAIGN_MANIFEST.worlds).toHaveLength(45); // full authoring registry, independent of publication
  });

  it('9. Game Center never submits past the published max (legacy save of 73 → 50)', async () => {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ highestUnlockedLevel: 73 }));
    let listener: ((s: AuthSnapshot) => void) | null = null;
    const bridge = {
      getAuthState: jest.fn(),
      authenticate: jest.fn(),
      submitScore: jest.fn<Promise<void>, [number, string[]]>(async () => {}),
      reportAchievements: jest.fn<Promise<void>, [string[]]>(async () => {}),
      showDashboard: jest.fn(async () => {}),
      addListener: jest.fn((_e: 'onAuthChange', l: (s: AuthSnapshot) => void) => { listener = l; return { remove() {} }; }),
    } satisfies GameCenterBridge;
    const memo = new Map<string, SubmittedMemo>();
    const store: SubmissionStore = { load: async (k) => memo.get(k) ?? { score: 0, achievements: [] }, save: async (k, m) => { memo.set(k, m); } };
    const service = createGameCenterService({
      bridge, store,
      manifest: publishedManifest(CAMPAIGN_MANIFEST),
      publishedMax: PUBLISHED_MAX_LEVEL,
      loadHighestUnlocked: async () => (await loadProgress()).highestUnlockedLevel,
    });
    service.start();
    (listener as ((s: AuthSnapshot) => void) | null)?.({ status: 'authenticated', displayName: 'A', alias: 'a', gamePlayerId: 'G:1', error: null });
    await new Promise((r) => setTimeout(r, 0));
    await service.recordWin({ mode: 'campaign', completedLevel: 73, highestUnlockedLevel: 74 });
    await service.recordWin({ mode: 'dev', completedLevel: 99, highestUnlockedLevel: 100 });
    await new Promise((r) => setTimeout(r, 0));
    const scores = bridge.submitScore.mock.calls.map(([score]) => score);
    expect(scores).toContain(50);
    expect(Math.max(...scores)).toBe(50);
    // Achievements (world 1/2 finales) still come through normally at the clamped score.
    expect(bridge.reportAchievements.mock.calls.flat(2)).toEqual(
      expect.arrayContaining([GAME_CENTER_IDS.achievements.world1Complete, GAME_CENTER_IDS.achievements.world2Complete]),
    );
  });

  it('10. analytics reports published completion, clamped (history kept raw)', () => {
    const client = { events: [] as AnalyticsProps[], registered: [] as AnalyticsProps[], person: [] as AnalyticsProps[] };
    const fake: AnalyticsClient = {
      capture: (_e, p) => { client.events.push(p); },
      register: (p) => { client.registered.push(p); },
      setPersonProperties: (p) => { client.person.push(p); },
    };
    const store = createMemoryAnalyticsStore({ attempts: {}, highestCompletedSeen: 72, ceilingAlertedFor: [], personProps: {} });
    const analytics = createAnalytics({ client: fake, store, now: () => 0, publishedMax: PUBLISHED_MAX_LEVEL });
    analytics.progressUpdated(73);
    expect(client.registered).toContainEqual({ current_highest_level: 50 });
    expect(client.person[0]).toMatchObject({ highest_level_completed: 50, highest_level_reached: 50, published_max_level: 50 });
    expect(store.get().highestCompletedSeen).toBe(72);
  });

  it('11. raising the published max opens the next level with no migration', () => {
    const afterClearing50 = { highestUnlockedLevel: 51 }; // saved while the max was 50
    expect(publishedProgress(afterClearing50, 100).highestUnlockedLevel).toBe(51);
    expect(isPublishedCampaignLevel(51, 100)).toBe(true);
    expect(nextPublishedLevelId(50, 100)).toBe(51);
    expect(isCampaignComplete(afterClearing50, 100)).toBe(false);
    expect(publishedManifest(CAMPAIGN_MANIFEST, 100).worlds).toHaveLength(10);
  });
});
