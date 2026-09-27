import { CONTENT_CEILING_ALERT_MIN_MAX_LEVEL, CONTENT_WARNING_DISTANCE } from './config';

/**
 * Highest campaign level COMPLETED, from saved progress. Progress stores the
 * highest UNLOCKED level: beating N unlocks N+1, so completed = unlocked − 1…
 * except at the end of the level registry, where unlocking stops moving and
 * `unlocked − 1` would under-count a final clear. `completedSeen` (the highest
 * campaign win analytics has recorded) closes that gap. Never negative.
 */
export function highestCompletedLevel(highestUnlocked: number, completedSeen: number): number {
  return Math.max(0, Math.floor(highestUnlocked) - 1, Math.floor(completedSeen) || 0);
}

export function levelsRemaining(highestCompleted: number, publishedMax: number): number {
  return Math.max(0, publishedMax - highestCompleted);
}

/** Completed level at which the ceiling alert fires; null while the campaign is too small to matter. */
export function contentCeilingThreshold(publishedMax: number): number | null {
  if (publishedMax < CONTENT_CEILING_ALERT_MIN_MAX_LEVEL) return null;
  return publishedMax - CONTENT_WARNING_DISTANCE;
}

/**
 * Should `content_ceiling_approaching` fire now? Once per published-max
 * version: `alertedFor` holds the published maxes this install already alerted
 * for, so growing the campaign (1000 → 1500) makes the player eligible again.
 */
export function evaluateContentCeiling(input: {
  highestCompleted: number;
  publishedMax: number;
  alertedFor: readonly number[];
}): { threshold: number; levelsRemaining: number } | null {
  const threshold = contentCeilingThreshold(input.publishedMax);
  if (threshold === null) return null;
  if (input.highestCompleted < threshold) return null;
  if (input.alertedFor.includes(input.publishedMax)) return null;
  return { threshold, levelsRemaining: levelsRemaining(input.highestCompleted, input.publishedMax) };
}

/** Whole-run duration in seconds, one decimal, never negative. */
export function durationSeconds(startMs: number, endMs: number): number {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return 0;
  return Math.max(0, Math.round((endMs - startMs) / 100) / 10);
}
