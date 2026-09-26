import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SubmittedMemo } from '@/game/gameCenter/plan';
import type { SubmissionStore } from '@/game/gameCenter/service';

const STORAGE_KEY = 'pixelarcadia/gamecenter/v1';

type Saved = Record<string, SubmittedMemo>;

async function readAll(): Promise<Saved> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? (parsed as Saved) : {};
  } catch {
    return {};
  }
}

/**
 * What has already been sent to Game Center, per player. A cache to avoid
 * needless writes only — never progression truth; losing it just re-sends.
 */
export const gameCenterSubmissionStore: SubmissionStore = {
  async load(playerKey) {
    const entry = (await readAll())[playerKey];
    return {
      score: typeof entry?.score === 'number' ? entry.score : 0,
      achievements: Array.isArray(entry?.achievements) ? entry.achievements.filter((a) => typeof a === 'string') : [],
    };
  },
  async save(playerKey, memo) {
    const all = await readAll();
    all[playerKey] = { score: memo.score, achievements: [...memo.achievements] };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },
};
