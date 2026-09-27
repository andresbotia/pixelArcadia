import type { CampaignManifest } from '@/game/studio/campaign/types';
import type { Progress } from '@/storage/progress';

import { levelExists } from './levels';
import { PUBLISHED_MAX_LEVEL } from './publishing';

/**
 * THE published-campaign boundary (M14.1). Everything campaign-facing — Home,
 * world/level select, the /game route, NEXT after a win, Game Center and
 * analytics — reads progress and levels through these, so `PUBLISHED_MAX_LEVEL`
 * is the one playable ceiling. Dev mode (Level Browser / dev play) bypasses it
 * on purpose to inspect unpublished content.
 *
 * Saved progress is NOT clamped: it keeps its raw meaning (highest level
 * unlocked — beating N records N + 1). Clearing the last published level
 * records one past it; that is how "the campaign is complete" is stored, and it
 * is why raising `PUBLISHED_MAX_LEVEL` later makes the next level playable with
 * no migration. Older saves above the ceiling (legacy/tester progress) are kept
 * intact and simply viewed through the clamp.
 *
 * Every function takes `max` (default: the published max) so tests can model a
 * larger future campaign.
 */

/** A level normal campaign play may open. */
export function isPublishedCampaignLevel(levelId: number, max: number = PUBLISHED_MAX_LEVEL): boolean {
  return Number.isInteger(levelId) && levelId >= 1 && levelId <= max && levelExists(levelId);
}

/** The next published level after `levelId` (undefined at the ceiling). */
export function nextPublishedLevelId(levelId: number, max: number = PUBLISHED_MAX_LEVEL): number | undefined {
  return isPublishedCampaignLevel(levelId + 1, max) ? levelId + 1 : undefined;
}

/** Saved progress as campaign UI must see it: the playable level never passes the ceiling. */
export function publishedProgress(progress: Progress, max: number = PUBLISHED_MAX_LEVEL): Progress {
  return { highestUnlockedLevel: Math.max(1, Math.min(progress.highestUnlockedLevel, max)) };
}

/** Highest PUBLISHED level completed (raw progress records beating N as N + 1). */
export function publishedHighestCompleted(highestUnlocked: number, max: number = PUBLISHED_MAX_LEVEL, justCleared = 0): number {
  return Math.min(max, Math.max(0, Math.floor(highestUnlocked) - 1, Math.floor(justCleared) || 0));
}

/** Every published level cleared — the valid "campaign complete" state. */
export function isCampaignComplete(progress: Progress, max: number = PUBLISHED_MAX_LEVEL): boolean {
  return publishedHighestCompleted(progress.highestUnlockedLevel, max) >= max;
}

/** The manifest with only published levels; worlds left empty are dropped. */
export function publishedManifest(manifest: CampaignManifest, max: number = PUBLISHED_MAX_LEVEL): CampaignManifest {
  return {
    ...manifest,
    worlds: manifest.worlds
      .map((w) => ({ ...w, levelIds: w.levelIds.filter((id) => id <= max) }))
      .filter((w) => w.levelIds.length > 0),
    orderedLevelIds: manifest.orderedLevelIds.filter((id) => id <= max),
  };
}
