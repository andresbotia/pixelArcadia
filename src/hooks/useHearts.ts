import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { MAX_HEARTS } from '@/game/hearts/config';
import { nextHeartAt, type HeartState } from '@/game/hearts/state';
import { peekHearts, refreshHearts, subscribeHearts } from '@/storage/hearts';

export interface HeartsApi {
  hearts: number;
  full: boolean;
  /** Epoch ms the next heart lands, `null` when full. Stable between regen events. */
  nextHeartAt: number | null;
  loading: boolean;
  /** Reconcile against the clock now (screen focus, etc.). */
  refresh: () => Promise<void>;
}

/**
 * Live view of the saved hearts. State changes only on real events (load,
 * loss, regen) — the per-second countdown is drawn by `HeartCountdown` from
 * `nextHeartAt`, so this hook never re-renders its screen every second and
 * never writes storage on a tick. It does schedule ONE timeout for the next
 * heart, plus a refresh whenever the app returns to the foreground, so hearts
 * earned while closed or backgrounded appear without user action.
 */
export function useHearts(): HeartsApi {
  const [state, setState] = useState<HeartState | null>(() => peekHearts());

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeHearts((next) => {
      if (active) setState(next);
    });
    void refreshHearts();
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void refreshHearts();
    });
    return () => {
      active = false;
      unsubscribe();
      sub.remove();
    };
  }, []);

  const at = state ? nextHeartAt(state) : null;
  useEffect(() => {
    if (at === null) return;
    // +50ms so the refresh lands just past the boundary, never a hair before it.
    const timer = setTimeout(() => void refreshHearts(), Math.max(0, at - Date.now()) + 50);
    return () => clearTimeout(timer);
  }, [at]);

  const refresh = useCallback(async () => {
    await refreshHearts();
  }, []);

  const hearts = state?.hearts ?? MAX_HEARTS;
  return {
    hearts,
    full: hearts >= MAX_HEARTS,
    nextHeartAt: at,
    loading: state === null,
    refresh,
  };
}
