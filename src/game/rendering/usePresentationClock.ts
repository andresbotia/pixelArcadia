import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  cancelAnimation, Easing, runOnJS, useDerivedValue, useSharedValue, withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { presentationTime, type PresentationTimebase } from '@/game/presentation/endgame';

/** How long one uninterrupted run of the board clock lasts before it re-arms itself. */
const CLOCK_SPAN_MS = 6 * 60 * 60 * 1000;

export interface PresentationClock {
  /** Board presentation time in ms since `epoch`, advanced on the UI thread. */
  now: SharedValue<number>;
  /** Presentation time (see `PresentationTimebase`) that board time 0 corresponds to. */
  epoch: number;
}

/** Plain wall clock at 1× — boards rendered without a session timebase. */
const WALL_CLOCK: PresentationTimebase = { anchorWallMs: 0, anchorPresentationMs: 0, rate: 1 };

/**
 * One UI-thread time source for every Pal on a board.
 *
 * Each Pal used to own a `withTiming` clock re-anchored from `Date.now()`
 * whenever a launch re-scripted its tail; each re-anchor landed a slightly
 * different frame's worth of latency, so existing Pals jumped ±3–6 px whenever
 * another Pal launched. Now the board anchors ONE linear clock and every Pal
 * derives `now - (launchedAtMs - epoch)` from it: re-scripts only change what a
 * Pal is scripted to do next, never where its time is.
 *
 * The clock only runs while `running` (a Pal is on screen), so an idle board
 * costs nothing per frame. It re-anchors only when it (re)starts — from idle,
 * or on return to the foreground (the session settles all flights when
 * backgrounded) — never while a Pal is mid-flight.
 *
 * M11.5: it advances at `timebase.rate` presentation-ms per wall-ms (1×, or
 * the endgame fast-forward rate). A rate change mid-flight continues from the
 * clock's CURRENT value — only the slope changes, so no Pal jumps. Scripts are
 * never touched: every Pal, shot, convoy hold and Gate beat simply arrives
 * sooner, in the same order.
 */
export function usePresentationClock(running: boolean, timebase: PresentationTimebase = WALL_CLOCK): PresentationClock {
  const [epoch] = useState(() => presentationTime(timebase, Date.now()));
  const now = useSharedValue(0);
  const timebaseRef = useRef(timebase);
  useEffect(() => { timebaseRef.current = timebase; });
  /** A run is in progress, so a rate change continues it instead of re-anchoring. */
  const anchored = useRef(false);
  const rate = timebase.rate;

  useEffect(() => {
    if (!running) { cancelAnimation(now); anchored.current = false; return; }
    const advance = () => {
      now.set(withTiming(now.get() + CLOCK_SPAN_MS * rate, { duration: CLOCK_SPAN_MS, easing: Easing.linear }, (finished) => {
        if (finished) runOnJS(advance)();
      }));
    };
    const anchor = () => {
      now.set(presentationTime(timebaseRef.current, Date.now()) - epoch);
      advance();
    };
    if (anchored.current) advance();
    else anchor();
    anchored.current = true;
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') anchor();
      else cancelAnimation(now);
    });
    return () => { sub.remove(); cancelAnimation(now); };
  }, [running, rate, epoch, now]);

  return useMemo(() => ({ now, epoch }), [now, epoch]);
}

/**
 * One Pal's pass time from the board clock, clamped to [0, endMs]. A UI-thread
 * mapper — no per-Pal animation, effect or JS timestamp.
 */
export function usePassClock(clock: PresentationClock, launchedAtMs: number, endMs: number): SharedValue<number> {
  const { now } = clock;
  const offset = launchedAtMs - clock.epoch;
  return useDerivedValue(() => Math.min(endMs, Math.max(0, now.value - offset)));
}
