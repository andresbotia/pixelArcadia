import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HEART_REGEN_MS } from '@/game/hearts/config';
import {
  _clearHeartsCache,
  _setHeartsClock,
  peekHearts,
  refreshHearts,
  spendHeartForLoss,
  subscribeHearts,
} from '@/storage/hearts';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

const KEY = 'orbitide/hearts/v1';
const T0 = 1_750_000_000_000;
let now = T0;

describe('hearts storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    _clearHeartsCache();
    now = T0;
    _setHeartsClock(() => now);
    jest.mocked(AsyncStorage.setItem).mockClear();
  });

  it('a fresh install loads full without writing anything', async () => {
    const s = await refreshHearts();
    expect(s.hearts).toBe(5);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('persists a loss, and a duplicate report of the same run does not charge again', async () => {
    await refreshHearts();
    const [a, b] = await Promise.all([spendHeartForLoss('run-1'), spendHeartForLoss('run-1')]);
    expect([a.spent, b.spent]).toEqual([true, false]);
    const saved = JSON.parse((await AsyncStorage.getItem(KEY))!);
    expect(saved).toEqual({ hearts: 4, lastHeartRegenAt: T0, lastLossRunId: 'run-1' });
  });

  it('credits time spent closed on the next launch (restart = fresh cache)', async () => {
    await spendHeartForLoss('run-1');
    await spendHeartForLoss('run-2');
    _clearHeartsCache();
    now = T0 + HEART_REGEN_MS + 60_000; // app closed 31 minutes
    const s = await refreshHearts();
    expect(s.hearts).toBe(4);
    expect(s.lastHeartRegenAt).toBe(T0 + HEART_REGEN_MS);
  });

  it('only writes when regeneration actually changed the state', async () => {
    await spendHeartForLoss('run-1');
    jest.mocked(AsyncStorage.setItem).mockClear();
    now = T0 + 10 * 60_000;
    await refreshHearts();
    await refreshHearts();
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    now = T0 + HEART_REGEN_MS;
    await Promise.all([refreshHearts(), refreshHearts(), refreshHearts()]);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    expect(peekHearts()?.hearts).toBe(5);
  });

  it('notifies every subscriber with the same state', async () => {
    const seenA: number[] = [];
    const seenB: number[] = [];
    subscribeHearts((s) => seenA.push(s.hearts));
    subscribeHearts((s) => seenB.push(s.hearts));
    await spendHeartForLoss('run-1');
    expect(seenA).toEqual([4]);
    expect(seenB).toEqual([4]);
  });

  it('peek reconciles to the clock without persisting', async () => {
    await spendHeartForLoss('run-1');
    jest.mocked(AsyncStorage.setItem).mockClear();
    now = T0 + HEART_REGEN_MS;
    expect(peekHearts()?.hearts).toBe(5);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('repairs a corrupted save instead of trusting it', async () => {
    await AsyncStorage.setItem(KEY, JSON.stringify({ hearts: 42, lastHeartRegenAt: 'bad' }));
    expect((await refreshHearts()).hearts).toBe(5);
    await AsyncStorage.setItem(KEY, '{not json');
    _clearHeartsCache();
    expect((await refreshHearts()).hearts).toBe(5);
  });
});
