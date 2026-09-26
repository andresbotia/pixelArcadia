import type { CampaignManifest } from '@/game/studio/campaign/types';
import { WORLD_COMPLETION_ACHIEVEMENTS } from './config';

/**
 * Pure Game Center planning: what (if anything) to send for a given local
 * progress. Local progress is authoritative; Game Center only mirrors it.
 */

/**
 * Highest campaign level cleared. Saved progress stores the highest UNLOCKED
 * level (beating N unlocks N + 1), so cleared = unlocked − 1. A just-won level
 * is folded in too, which also covers the final level (unlock caps there).
 */
export function highestClearedLevel(highestUnlockedLevel: number, justCleared?: number): number {
  return Math.max(0, highestUnlockedLevel - 1, justCleared ?? 0);
}

/** Finale level of each world-completion achievement, from the manifest. */
export function worldAchievementFinales(manifest: CampaignManifest): { achievementId: string; finaleLevel: number }[] {
  const out: { achievementId: string; finaleLevel: number }[] = [];
  for (const { worldId, achievementId } of WORLD_COMPLETION_ACHIEVEMENTS) {
    const ids = manifest.worlds.find((w) => w.id === worldId)?.levelIds ?? [];
    const finaleLevel = ids.length ? Math.max(...ids) : undefined;
    if (finaleLevel !== undefined) out.push({ achievementId, finaleLevel });
  }
  return out;
}

/** Achievements earned by a highest-cleared level. */
export function earnedAchievements(manifest: CampaignManifest, highestCleared: number): string[] {
  return worldAchievementFinales(manifest)
    .filter((a) => highestCleared >= a.finaleLevel)
    .map((a) => a.achievementId);
}

/** What this player has already been sent (successfully). */
export interface SubmittedMemo {
  score: number;
  achievements: readonly string[];
}

export interface SubmissionPlan {
  /** Score to submit, or undefined when it would not raise what was sent. */
  score?: number;
  /** Achievements not yet reported. */
  achievements: string[];
}

export function planSubmission(manifest: CampaignManifest, highestCleared: number, memo: SubmittedMemo): SubmissionPlan {
  const reported = new Set(memo.achievements);
  return {
    score: highestCleared > memo.score ? highestCleared : undefined,
    achievements: earnedAchievements(manifest, highestCleared).filter((id) => !reported.has(id)),
  };
}
