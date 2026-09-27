/**
 * Hearts (lives) tuning. Pure data — the only place these numbers live; UI,
 * storage and tests all read them from here.
 */

/** Heart cap. Regeneration never fills past this. */
export const MAX_HEARTS = 5;

/** A fresh install starts full. */
export const STARTING_HEARTS = 5;

/** One heart regenerates every 30 minutes, measured from persisted timestamps. */
export const HEART_REGEN_MS = 30 * 60 * 1000;
