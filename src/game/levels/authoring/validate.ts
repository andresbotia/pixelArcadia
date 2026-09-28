import { DEFAULT_ART_LEGEND } from '@/game/engine/art';
import { MAX_BOARD_DIMENSION, MIN_BOARD_DIMENSION } from '@/game/engine/boardLimits';
import { createGame } from '@/game/engine/createGame';
import { defaultHoldingCapacity, expectedTunnelCount } from '@/game/engine/ruleset';
import { findFirstWinningWitness } from '@/game/engine/solver';
import { ORB_COLOR_IDS, type LevelDefinition, type OrbColor } from '@/game/engine/types';
import type { LevelValidationResult, ValidationDiagnostic, SolvabilityEvidence, SolverEvidence } from './types';
import { replayAuthoredWitness, replaySolverWitness, WITNESS_ACTION } from './witness';

export const VALID_ORB_COLORS: ReadonlySet<OrbColor> = new Set<OrbColor>(ORB_COLOR_IDS);

export const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard', 'super-hard', 'extreme']);

export { MAX_BOARD_DIMENSION, MIN_BOARD_DIMENSION };
export const MAX_BOARD_WIDTH = MAX_BOARD_DIMENSION;
export const MAX_BOARD_HEIGHT = MAX_BOARD_DIMENSION;

export interface ValidationOptions {
  /** Skip solving and replaying (for rapid structural/syntactic linting). Default: false */
  skipSolvability?: boolean;
  /** Disable diagnostic search only when an authored witness proves solvability. */
  runSolver?: boolean;
  /** Maximum node expansion cap for solver. Default: 100,000 */
  nodeCap?: number;
  /** Maximum elapsed time in milliseconds before capping search. Default: 30,000 */
  timeCapMs?: number;
  /** Allow tunnels to contain more charges than pixels require. Default: false */
  allowOverBudget?: boolean;
}

export interface StructuralValidationOptions {
  /** Allow tunnels to contain more charges than pixels require. Default: false */
  allowOverBudget?: boolean;
}

/**
 * Validates purely structural correctness of an authored level:
 * schema integrity, grid dimensions, supported colors, row lengths,
 * tunnel format, and charge totals. Does NOT run the solver.
 */
export function validateLevelStructure(
  def: LevelDefinition,
  options: StructuralValidationOptions = {},
): LevelValidationResult {
  const diagnostics: ValidationDiagnostic[] = [];
  const err = (code: string, message: string, field?: string) => {
    diagnostics.push({ code, severity: 'error', message, field });
  };
  const warn = (code: string, message: string, field?: string) => {
    diagnostics.push({ code, severity: 'warning', message, field });
  };

  const levelTag = `[Level ${def.id} "${def.title ?? 'Untitled'}"]`;

  // ── 1. Metadata Validation ────────────────────────────────────────────────
  if (!Number.isInteger(def.id) || def.id <= 0) {
    err('INVALID_ID', `${levelTag} Level ID must be a positive integer, got ${def.id}`, 'id');
  }

  if (!def.title || def.title.trim().length === 0) {
    warn('MISSING_TITLE', `${levelTag} Level has an empty title`, 'title');
  }

  if (!def.themeId || def.themeId.trim().length === 0) {
    warn('MISSING_THEME', `${levelTag} Level has an empty themeId`, 'themeId');
  }

  if (!VALID_DIFFICULTIES.has(def.difficulty)) {
    err(
      'INVALID_DIFFICULTY',
      `${levelTag} Difficulty '${def.difficulty}' is not one of: ${[...VALID_DIFFICULTIES].join(', ')}`,
      'difficulty',
    );
  }

  if (!Number.isInteger(def.holdingCapacity) || def.holdingCapacity <= 0) {
    err('INVALID_HOLDING', `${levelTag} Holding capacity must be a positive integer, got ${def.holdingCapacity}`, 'holdingCapacity');
  } else {
    const expectedHolding = defaultHoldingCapacity(def.ruleset);
    if (def.holdingCapacity !== expectedHolding) {
      warn(
        'NON_STANDARD_HOLDING',
        `${levelTag} Holding capacity is ${def.holdingCapacity} (standard ${def.ruleset ?? 'legacyV1'} level uses ${expectedHolding})`,
        'holdingCapacity',
      );
    }
  }

  if (def.winningWitness !== undefined && (!Array.isArray(def.winningWitness)
    || def.winningWitness.length === 0
    || !def.winningWitness.every(move => typeof move === 'string' && WITNESS_ACTION.test(move)))) {
    err('INVALID_WINNING_WITNESS', `${levelTag} winningWitness must be a nonempty array of T1/H1 slot actions`, 'winningWitness');
  }

  // ── 2. Grid Dimensions & Character Integrity ─────────────────────────────
  const inferredHeight = Array.isArray(def.pixelArt) ? def.pixelArt.length : 0;
  const inferredWidth = Array.isArray(def.pixelArt) && typeof def.pixelArt[0] === 'string'
    ? def.pixelArt[0].length
    : 0;

  if (!Array.isArray(def.pixelArt) || def.pixelArt.length === 0) {
    err('EMPTY_GRID', `${levelTag} pixelArt must be a non-empty array of strings`, 'pixelArt');
  } else {
    const height = inferredHeight;
    if (height < MIN_BOARD_DIMENSION || height > MAX_BOARD_HEIGHT) {
      err(
        'GRID_HEIGHT_OOB',
        `${levelTag} Grid height ${height} is outside valid range (${MIN_BOARD_DIMENSION}–${MAX_BOARD_HEIGHT})`,
        'pixelArt',
      );
    }

    const firstRowLen = inferredWidth;
    if (firstRowLen < MIN_BOARD_DIMENSION || firstRowLen > MAX_BOARD_WIDTH) {
      err(
        'GRID_WIDTH_OOB',
        `${levelTag} Grid width ${firstRowLen} is outside valid range (${MIN_BOARD_DIMENSION}–${MAX_BOARD_WIDTH})`,
        'pixelArt',
      );
    }

    const effectiveLegend: Record<string, OrbColor> = {
      ...DEFAULT_ART_LEGEND,
      ...(def.legend ?? {}),
    };

    // Check legend validity
    if (def.legend) {
      for (const [char, color] of Object.entries(def.legend)) {
        if (!VALID_ORB_COLORS.has(color)) {
          err('INVALID_LEGEND_COLOR', `${levelTag} Legend character '${char}' maps to unsupported color '${color}'`, 'legend');
        }
      }
    }

    const emptyChars = new Set(['.', ' ']);
    let totalPixels = 0;

    def.pixelArt.forEach((row, rowIndex) => {
      if (typeof row !== 'string') {
        err('MALFORMED_ROW', `${levelTag} Row ${rowIndex} is not a string`, `pixelArt[${rowIndex}]`);
        return;
      }
      if (row.length !== firstRowLen) {
        err(
          'RAGGED_ROW',
          `${levelTag} Row ${rowIndex} has length ${row.length}, expected uniform width ${firstRowLen}`,
          `pixelArt[${rowIndex}]`,
        );
      }

      for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
        const char = row[colIndex] ?? '.';
        if (emptyChars.has(char)) continue;
        totalPixels += 1;
        const color = effectiveLegend[char];
        if (!color) {
          err(
            'UNKNOWN_PIXEL_CHAR',
            `${levelTag} Unknown character '${char}' at row ${rowIndex}, col ${colIndex}. Add to legend or use standard chars (B,C,W,P,K,Y,O,R,G).`,
            `pixelArt[${rowIndex}][${colIndex}]`,
          );
        }
      }
    });

    if (totalPixels === 0) {
      err('NO_PIXELS', `${levelTag} Board has no colored pixels (all cells are empty)`, 'pixelArt');
    }
  }

  // ── 3. Tunnel Structure Integrity ─────────────────────────────────────────
  if (!Array.isArray(def.tunnels)) {
    err('INVALID_TUNNELS', `${levelTag} tunnels must be an array of ChargeSpec queues`, 'tunnels');
  } else if (def.tunnels.length !== expectedTunnelCount(def.ruleset)) {
    const expected = expectedTunnelCount(def.ruleset);
    err('TUNNEL_COUNT_MISMATCH', `${levelTag} Exactly ${expected} tunnels required, got ${def.tunnels.length}`, 'tunnels');
  } else {
    let totalCharges = 0;
    def.tunnels.forEach((queue, tIndex) => {
      if (!Array.isArray(queue)) {
        err('INVALID_TUNNEL_QUEUE', `${levelTag} Tunnel ${tIndex} is not an array`, `tunnels[${tIndex}]`);
        return;
      }
      queue.forEach((charge, cIndex) => {
        totalCharges += 1;
        if (!charge || typeof charge !== 'object') {
          err('INVALID_CHARGE', `${levelTag} Tunnel ${tIndex} charge ${cIndex} is not an object`, `tunnels[${tIndex}][${cIndex}]`);
          return;
        }
        if (!VALID_ORB_COLORS.has(charge.color)) {
          err(
            'INVALID_CHARGE_COLOR',
            `${levelTag} Tunnel ${tIndex} charge ${cIndex} has invalid color '${charge.color}'`,
            `tunnels[${tIndex}][${cIndex}].color`,
          );
        }
        if (!Number.isInteger(charge.capacity) || charge.capacity <= 0) {
          err(
            'INVALID_CHARGE_CAPACITY',
            `${levelTag} Tunnel ${tIndex} charge ${cIndex} capacity must be a positive integer, got ${charge.capacity}`,
            `tunnels[${tIndex}][${cIndex}].capacity`,
          );
        }
      });
    });

    if (totalCharges === 0) {
      err('EMPTY_TUNNELS', `${levelTag} All tunnels are empty; level has no charges`, 'tunnels');
    }
  }

  // ── 4. Exact Per-Color Charge Budget Validation ───────────────────────────
  if (diagnostics.every((d) => d.severity !== 'error')) {
    try {
      const state = createGame(def);
      const hitsNeededByColor = new Map<string, number>();
      const capacityProvidedByColor = new Map<string, number>();

      for (const pixel of state.pixels) {
        let hits = 1;
        if (pixel.modifier?.kind === 'frozen' || pixel.modifier?.kind === 'shielded') {
          hits += pixel.modifier.level ?? 1;
        }
        hitsNeededByColor.set(pixel.color, (hitsNeededByColor.get(pixel.color) ?? 0) + hits);
      }

      for (const queue of def.tunnels) {
        for (const charge of queue) {
          capacityProvidedByColor.set(
            charge.color,
            (capacityProvidedByColor.get(charge.color) ?? 0) + charge.capacity,
          );
        }
      }

      // Check colors needed on board
      for (const [color, needed] of hitsNeededByColor.entries()) {
        const provided = capacityProvidedByColor.get(color) ?? 0;
        if (provided === 0) {
          err(
            'MISSING_COLOR_CHARGE',
            `${levelTag} Board requires ${needed} '${color}' hits, but no tunnel carries '${color}' charges`,
            'tunnels',
          );
        } else if (provided < needed) {
          err(
            'BUDGET_UNDERFLOW',
            `${levelTag} Under-budget for '${color}': board requires ${needed} hits, tunnels only provide ${provided} (deficit: ${needed - provided})`,
            'tunnels',
          );
        } else if (provided > needed && !options.allowOverBudget) {
          err(
            'BUDGET_OVERFLOW',
            `${levelTag} Over-budget for '${color}': board requires ${needed} hits, tunnels provide ${provided} (surplus: ${provided - needed})`,
            'tunnels',
          );
        }
      }

      // Check charges for colors not on board
      for (const [color, provided] of capacityProvidedByColor.entries()) {
        if (!hitsNeededByColor.has(color) && provided > 0) {
          err(
            'UNUSED_COLOR_CHARGE',
            `${levelTag} Tunnels carry ${provided} '${color}' capacity, but no '${color}' pixels exist on the board`,
            'tunnels',
          );
        }
      }
    } catch (e) {
      err('ENGINE_REJECTED', `${levelTag} Engine failed to initialize game state: ${(e as Error).message}`);
    }
  }

  const valid = diagnostics.every((d) => d.severity !== 'error');

  return {
    levelId: def.id,
    title: def.title,
    valid,
    structuralValidity: valid ? 'VALID' : 'INVALID',
    solvability: 'NOT_CHECKED',
    solver: { status: 'NOT_RUN' },
    diagnostics,
    definition: valid ? def : null,
    width: valid ? inferredWidth : undefined,
    height: valid ? inferredHeight : undefined,
  };
}

/** Structure precedes constructive proof; bounded search remains mandatory without a witness. */
export function validateLevelPacket(
  def: LevelDefinition,
  options: ValidationOptions = {},
): LevelValidationResult {
  const structure = validateLevelStructure(def, options);
  if (!structure.valid || options.skipSolvability) return structure;
  const diagnostics = [...structure.diagnostics];
  const err = (code: string, message: string) => diagnostics.push({ code, severity: 'error' as const, message });
  const witnessReplay = def.winningWitness !== undefined ? replayAuthoredWitness(def) : undefined;
  let solvability: SolvabilityEvidence = witnessReplay?.valid ? 'PROVEN_BY_WITNESS' : 'UNPROVEN';
  let solver: SolverEvidence = { status: 'NOT_RUN' };
  let witnessLength = witnessReplay?.valid ? witnessReplay.steps : undefined;
  if (witnessReplay && !witnessReplay.valid) {
    err('INVALID_WINNING_WITNESS', witnessReplay.failure ?? 'Authored witness failed production replay');
  } else if (!witnessReplay || options.runSolver !== false) {
    const start = performance.now();
    try {
      const result = findFirstWinningWitness(def, {
        nodeCap: options.nodeCap ?? 100_000, timeCapMs: options.timeCapMs ?? 30_000,
      });
      solver = { status: result.solved ? 'SOLVED' : result.nodeCapHit || result.timeCapHit ? 'INCONCLUSIVE' : 'EXHAUSTED',
        nodes: result.nodes, timeMs: performance.now() - start,
        nodeCapHit: result.nodeCapHit, timeCapHit: result.timeCapHit,
        witnessLength: result.solved ? result.moves.length : undefined };
      if (result.solved) {
        const replay = replaySolverWitness(def, result.moves);
        if (!replay.valid) {
          solver.status = 'ERROR';
          err('SOLVER_REPLAY_INVALID', replay.failure ?? 'Solver witness failed production replay');
        } else {
          solvability = witnessReplay ? 'PROVEN_BY_WITNESS_AND_SOLVER' : 'PROVEN_BY_SOLVER';
          witnessLength ??= result.moves.length;
        }
      } else if (solver.status === 'INCONCLUSIVE') {
        if (witnessReplay?.valid) {
          diagnostics.push({ code: 'SOLVER_INCONCLUSIVE', severity: 'info',
            message: `Witness proven; bounded solver inconclusive (${result.nodes} states, node cap=${result.nodeCapHit}, time cap=${result.timeCapHit})` });
        } else {
          err('SOLVER_NODE_CAP_EXCEEDED', 'Bounded solver inconclusive; no solvability proof');
        }
      } else if (witnessReplay?.valid) {
        err('SOLVER_WITNESS_CONTRADICTION', `Investigate: solver exhausted ${result.nodes} states despite a valid production witness`);
      } else {
        err('LEVEL_UNSOLVABLE', `Exhausted all ${result.nodes} reachable states without a win`);
      }
    } catch (error) {
      solver = { status: 'ERROR', timeMs: performance.now() - start };
      err('SOLVER_EXCEPTION', `Solver crashed during verification: ${(error as Error).message}`);
    }
  }
  const valid = diagnostics.every(d => d.severity !== 'error');
  return { ...structure, valid, definition: valid ? def : null, diagnostics,
    solvability, witnessReplay, solver, witnessLength };
}
