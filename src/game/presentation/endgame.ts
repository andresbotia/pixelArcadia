import { anyLaunchAvailable } from '@/game/engine/selectors';
import type { GameState } from '@/game/engine/types';
import { ENDGAME_SPEED_MULTIPLIER } from './constants';

/**
 * M11.5 — endgame fast-forward: presentation speed only.
 *
 * ELIGIBILITY (canonical engine state, never UI): every tunnel queue is empty.
 * `TunnelState.queue` holds ALL remaining authored Pals for that tunnel — the
 * visible front, the previews and every hidden entry — so an empty queue means
 * no Pal can ever launch from it again. Nothing else in `GameState` can feed a
 * tunnel. Active flights, Holding and pendingHolding are deliberately NOT part
 * of the condition: held Pals relaunching, Gate arrivals and final cleanup all
 * stay accelerated. It says nothing about win/loss — the engine still decides
 * every outcome.
 */
export function isEndgameFastForwardEligible(state: GameState): boolean {
  return !anyLaunchAvailable(state);
}

/** Presentation clock rate for `state`: 1, or ENDGAME_SPEED_MULTIPLIER once eligible. */
export function presentationSpeedFor(state: GameState, enabled = true): number {
  return enabled && isEndgameFastForwardEligible(state) ? ENDGAME_SPEED_MULTIPLIER : 1;
}

/**
 * Piecewise-linear map from wall time (`Date.now()`) to presentation time —
 * the ms every `FlightPass` timestamp is written in (`launchedAtMs + at`).
 * At rate 1 from creation it is the identity, so normal play is exactly the
 * pre-M11.5 clock. A rate change re-anchors at the switch instant, so
 * presentation time is continuous: no Pal jumps, only its speed changes.
 */
export interface PresentationTimebase {
  anchorWallMs: number;
  anchorPresentationMs: number;
  rate: number;
}

export function createTimebase(wallMs: number): PresentationTimebase {
  return { anchorWallMs: wallMs, anchorPresentationMs: wallMs, rate: 1 };
}

export function presentationTime(tb: PresentationTimebase, wallMs: number): number {
  return tb.anchorPresentationMs + (wallMs - tb.anchorWallMs) * tb.rate;
}

/** Same timebase when the rate is unchanged; otherwise re-anchored at `wallMs`. */
export function retime(tb: PresentationTimebase, rate: number, wallMs: number): PresentationTimebase {
  if (rate === tb.rate) return tb;
  return { anchorWallMs: wallMs, anchorPresentationMs: presentationTime(tb, wallMs), rate };
}
