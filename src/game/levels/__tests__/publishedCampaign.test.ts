import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CAMPAIGN_MANIFEST } from '../campaign';
import { levelSlotState, summarizeWorlds } from '../campaignProgress';
import { levelExists } from '../levels';
import {
  isCampaignComplete,
  isPublishedCampaignLevel,
  nextPublishedLevelId,
  publishedHighestCompleted,
  publishedManifest,
  publishedProgress,
} from '../publishedCampaign';
import { CAMPAIGN_VERSION, PUBLISHED_MAX_LEVEL } from '../publishing';
import { loadProgress, unlockNext } from '@/storage/progress';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

const PROGRESS_KEY = 'orbitide/progress/v1';
beforeEach(async () => { await AsyncStorage.clear(); });

describe('published v1 campaign boundary', () => {
  it('publishes every authored level through 500 and no level beyond it', () => {
    expect(PUBLISHED_MAX_LEVEL).toBe(500);
    expect(CAMPAIGN_VERSION).toBe('v1-500');
    expect(CAMPAIGN_MANIFEST.orderedLevelIds).toHaveLength(500);
    for (let id = 1; id <= 500; id++) {
      expect(levelExists(id)).toBe(true);
      expect(isPublishedCampaignLevel(id)).toBe(true);
    }
    expect(isPublishedCampaignLevel(0)).toBe(false);
    expect(isPublishedCampaignLevel(501)).toBe(false);
  });

  it('opens Level 51 after Level 50 without migrating saved progress', async () => {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ highestUnlockedLevel: 50 }));
    const saved = await unlockNext(50);
    expect(saved.highestUnlockedLevel).toBe(51);
    expect(publishedProgress(saved).highestUnlockedLevel).toBe(51);
    expect(nextPublishedLevelId(50)).toBe(51);
    expect(isCampaignComplete(saved)).toBe(false);
  });

  it('records completion at 500, keeps it replayable, and offers no Level 501', async () => {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ highestUnlockedLevel: 500 }));
    const saved = await unlockNext(500);
    expect(saved.highestUnlockedLevel).toBe(501);
    expect(publishedHighestCompleted(saved.highestUnlockedLevel)).toBe(500);
    expect(isCampaignComplete(saved)).toBe(true);
    expect(publishedProgress(saved).highestUnlockedLevel).toBe(500);
    expect(levelSlotState(saved, 500)).toBe('complete');
    expect(nextPublishedLevelId(499)).toBe(500);
    expect(nextPublishedLevelId(500)).toBeUndefined();
  });

  it('exposes all 50 worlds through campaign UI and clamps older test saves', async () => {
    const manifest = publishedManifest(CAMPAIGN_MANIFEST);
    expect(manifest.worlds).toHaveLength(50);
    expect(manifest.orderedLevelIds).toHaveLength(500);
    expect(Math.max(...manifest.orderedLevelIds)).toBe(500);
    const legacy = { highestUnlockedLevel: 573 };
    expect(publishedProgress(legacy).highestUnlockedLevel).toBe(500);
    expect(summarizeWorlds(manifest, legacy)).toHaveLength(50);
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(legacy));
    expect((await loadProgress()).highestUnlockedLevel).toBe(501);
  });
});
