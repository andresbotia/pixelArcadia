import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'orbitide/analytics/v1';

/**
 * Analytics-only metadata (M14). DISPOSABLE: gameplay never reads it, and
 * losing it only resets counters. Progress stays authoritative in
 * `storage/progress`; nothing here duplicates it.
 */
export interface AnalyticsSaveState {
  /** Campaign starts per level id on this install. */
  attempts: Record<string, number>;
  /** Highest campaign level whose WIN analytics recorded (closes the end-of-registry gap). */
  highestCompletedSeen: number;
  /** Published maxes this install already sent `content_ceiling_approaching` for. */
  ceilingAlertedFor: number[];
  /** Last person properties sent — only changes are sent again. */
  personProps: Record<string, string | number | boolean>;
}

export function createAnalyticsSaveState(): AnalyticsSaveState {
  return { attempts: {}, highestCompletedSeen: 0, ceilingAlertedFor: [], personProps: {} };
}

function sanitize(raw: unknown): AnalyticsSaveState {
  const s = createAnalyticsSaveState();
  if (!raw || typeof raw !== 'object') return s;
  const r = raw as Record<string, unknown>;
  if (r.attempts && typeof r.attempts === 'object') {
    for (const [k, v] of Object.entries(r.attempts as Record<string, unknown>)) {
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) s.attempts[k] = Math.floor(v);
    }
  }
  if (typeof r.highestCompletedSeen === 'number' && Number.isFinite(r.highestCompletedSeen)) {
    s.highestCompletedSeen = Math.max(0, Math.floor(r.highestCompletedSeen));
  }
  if (Array.isArray(r.ceilingAlertedFor)) s.ceilingAlertedFor = r.ceilingAlertedFor.filter((n): n is number => typeof n === 'number');
  if (r.personProps && typeof r.personProps === 'object') {
    for (const [k, v] of Object.entries(r.personProps as Record<string, unknown>)) {
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') s.personProps[k] = v;
    }
  }
  return s;
}

export interface AnalyticsStore {
  get(): AnalyticsSaveState;
  update(mutator: (s: AnalyticsSaveState) => AnalyticsSaveState): AnalyticsSaveState;
}

let cached: AnalyticsSaveState | null = null;
let writeQueue: Promise<unknown> = Promise.resolve();

export async function loadAnalyticsState(): Promise<AnalyticsSaveState> {
  if (cached) return cached;
  let loaded: AnalyticsSaveState;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    loaded = raw ? sanitize(JSON.parse(raw)) : createAnalyticsSaveState();
  } catch {
    loaded = createAnalyticsSaveState();
  }
  cached ??= loaded;
  return cached;
}

export const analyticsStore: AnalyticsStore = {
  get() {
    return cached ?? (cached = createAnalyticsSaveState());
  },
  update(mutator) {
    const current = analyticsStore.get();
    const next = mutator(current);
    if (next === current) return current;
    cached = next;
    const snapshot = JSON.stringify(next);
    writeQueue = writeQueue.then(() => AsyncStorage.setItem(STORAGE_KEY, snapshot)).catch(() => {});
    return next;
  },
};

/** In-memory store for tests. */
export function createMemoryAnalyticsStore(initial: AnalyticsSaveState = createAnalyticsSaveState()): AnalyticsStore {
  let state = initial;
  return {
    get: () => state,
    update(mutator) {
      state = mutator(state);
      return state;
    },
  };
}

export function _resetAnalyticsStore(): void {
  cached = null;
  writeQueue = Promise.resolve();
}
