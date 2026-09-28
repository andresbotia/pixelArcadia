import type { GameAction } from '@/game/engine/actions';
import { createGame } from '@/game/engine/createGame';
import { applyActionWithArrivals } from '@/game/engine/holdingArrival';
import type { GameState, LevelDefinition } from '@/game/engine/types';
import type { WitnessReplayEvidence } from './types';

export const WITNESS_ACTION = /^[TH][1-9]\d*$/;

/** Exact production replay, including gate arrivals and every written action. */
function replay(
  def: LevelDefinition,
  moves: readonly (string | GameAction)[],
): WitnessReplayEvidence {
  let state: GameState = createGame(def);
  let steps = 0;
  let rejected = 0;
  let failure: string | undefined;
  try {
    for (const move of moves) {
      let action: GameAction;
      if (typeof move === 'string') {
        if (!WITNESS_ACTION.test(move)) throw new Error(`Malformed action '${move}'`);
        const index = Number(move.slice(1)) - 1;
        const id = move[0] === 'T' ? state.tunnels[index]?.id : state.holding[index]?.id;
        if (!id) throw new Error(`Unavailable slot '${move}' at step ${steps + 1}`);
        action = { kind: move[0] === 'T' ? 'tunnel' : 'holding', id };
      } else {
        action = move;
      }
      const outcome = applyActionWithArrivals(state, action);
      state = outcome.state;
      if (!outcome.accepted) {
        rejected += 1;
        throw new Error(`Action ${steps + 1} rejected: ${outcome.rejection}`);
      }
      steps += 1;
      if (state.holding.length > state.holdingCapacity) throw new Error('Holding overflow');
      // Gate rejection commits loss even when the launch itself was accepted.
      if (state.status === 'lost') {
        rejected += 1;
        throw new Error(`Production engine lost at step ${steps}`);
      }
    }
  } catch (error) {
    failure = (error as Error).message;
  }
  const evidence = {
    steps, rejected,
    pixelsRemaining: state.pixels.filter(p => !p.cleared).length,
    holdingRemaining: state.holding.length,
    tunnelsRemaining: state.tunnels.reduce((n, tunnel) => n + tunnel.queue.length, 0),
    pendingRemaining: state.pendingHolding.length,
  };
  if (!failure && (state.status !== 'won' || evidence.pixelsRemaining !== 0
    || evidence.holdingRemaining !== 0 || evidence.tunnelsRemaining !== 0
    || evidence.pendingRemaining !== 0 || rejected !== 0)) {
    failure = `Incomplete final state: status=${state.status}, pixels=${evidence.pixelsRemaining}, Holding=${evidence.holdingRemaining}, tunnels=${evidence.tunnelsRemaining}, pending=${evidence.pendingRemaining}, rejected=${rejected}`;
  }
  return { ...evidence, valid: !failure, failure };
}

export function replayAuthoredWitness(def: LevelDefinition): WitnessReplayEvidence {
  if (!Array.isArray(def.winningWitness) || def.winningWitness.length === 0
    || !def.winningWitness.every(move => typeof move === 'string' && WITNESS_ACTION.test(move))) {
    return { valid: false, steps: 0, rejected: 0, pixelsRemaining: 0,
      holdingRemaining: 0, tunnelsRemaining: 0, pendingRemaining: 0,
      failure: 'winningWitness must be a nonempty array of T1/H1 slot actions' };
  }
  return replay(def, def.winningWitness);
}

export function replaySolverWitness(def: LevelDefinition, moves: readonly GameAction[]): WitnessReplayEvidence {
  return replay(def, moves);
}
