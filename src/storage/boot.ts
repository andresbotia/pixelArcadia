import { loadEconomy } from '@/storage/economy';
import { loadHearts } from '@/storage/hearts';
import { loadProgress } from '@/storage/progress';

/**
 * Warm every save Home reads on its first frame (progress, coins, hearts), so
 * the launch loader lifts onto real values — no 0-coin / level-1 flash — and
 * the hearts cache is populated before any PLAY tap reads it. Hearts are
 * reconciled against the clock here, so time spent closed is credited at
 * launch. Never rejects: a storage fault just reveals Home with its defaults.
 */
export async function preloadSaveData(): Promise<void> {
  await Promise.allSettled([loadProgress(), loadEconomy(), loadHearts()]);
}
