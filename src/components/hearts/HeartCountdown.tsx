import { memo, useEffect, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { formatHeartCountdown } from '@/game/hearts/state';

interface HeartCountdownProps {
  /** Epoch ms the next heart lands. */
  until: number;
  /** Tick only while visible (screen focused, app foregrounded). */
  live?: boolean;
  style?: StyleProp<TextStyle>;
}

/**
 * `MM:SS` to the next heart. Owns its own 1s tick so only this Text
 * re-renders — the screen around it and the saved state are untouched. Each
 * tick is scheduled onto the countdown's own second boundary, so digits flip
 * crisply instead of drifting against the real remaining time.
 */
export const HeartCountdown = memo(function HeartCountdown({ until, live = true, style }: HeartCountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!live) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = (delay: number) => {
      timer = setTimeout(() => {
        const t = Date.now();
        setNow(t);
        if (until - t > 0) schedule(((until - t) % 1000) || 1000);
      }, delay);
    };
    // Immediate catch-up (e.g. returning to Home after minutes away), then on the boundary.
    schedule(0);
    return () => clearTimeout(timer);
  }, [live, until]);

  return <Text style={style}>{formatHeartCountdown(until - now)}</Text>;
});
