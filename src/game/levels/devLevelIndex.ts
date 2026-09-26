import { DEFAULT_ART_LEGEND, parsePixelArt } from '../engine/art';
import { resolveRuleset } from '../engine/ruleset';
import type { GameRuleset, LevelDefinition, LevelDifficulty } from '../engine/types';
import { CAMPAIGN_MANIFEST } from './campaign';
import { LEVEL_DEFINITIONS } from './levels';

/**
 * Dev-only Level Browser metadata. Everything here is derived from the runtime
 * level definitions and campaign manifest — no hand-duplicated metadata and no
 * solver work. Cheap enough to build for the whole campaign on screen open.
 */
export interface DevLevelRow {
  id: number;
  title: string;
  /** 1-based world number from the campaign manifest; 0 if the level is in no world. */
  world: number;
  worldTitle: string;
  difficulty: LevelDifficulty;
  ruleset: GameRuleset;
  width: number;
  height: number;
  pixels: number;
  colors: number;
  pals: number;
  holdingCapacity: number;
  /** Authored winning witness length, when the level carries one. */
  witness?: number;
}

export function devLevelRow(level: LevelDefinition): DevLevelRow {
  const art = parsePixelArt(level.id, level.pixelArt, { ...DEFAULT_ART_LEGEND, ...(level.legend ?? {}) });
  const worldIndex = CAMPAIGN_MANIFEST.worlds.findIndex((w) => w.levelIds.includes(level.id));
  const world = CAMPAIGN_MANIFEST.worlds[worldIndex];
  return {
    id: level.id,
    title: level.title,
    world: world ? worldIndex + 1 : 0,
    worldTitle: world?.title ?? '—',
    difficulty: level.difficulty,
    ruleset: resolveRuleset(level.ruleset),
    width: art.width,
    height: art.height,
    pixels: art.pixels.length,
    colors: new Set(art.pixels.map((p) => p.color)).size,
    pals: level.tunnels.reduce((n, tunnel) => n + tunnel.length, 0),
    holdingCapacity: level.holdingCapacity,
    witness: level.winningWitness?.length,
  };
}

let cached: DevLevelRow[] | null = null;

/** Every authored level, in campaign order. Built once, on first use. */
export function devLevelIndex(): DevLevelRow[] {
  cached ??= LEVEL_DEFINITIONS.map(devLevelRow);
  return cached;
}

export interface DevLevelFilter {
  /** 0 = all worlds. */
  world: number;
  difficulty: LevelDifficulty | 'all';
  /** Matches a level number exactly, or a case-insensitive title substring. */
  query: string;
}

export function filterDevLevels(rows: readonly DevLevelRow[], filter: DevLevelFilter): DevLevelRow[] {
  const q = filter.query.trim().toLowerCase();
  const asNumber = /^\d+$/.test(q) ? Number(q) : undefined;
  return rows.filter((row) => (
    (filter.world === 0 || row.world === filter.world)
    && (filter.difficulty === 'all' || row.difficulty === filter.difficulty)
    && (q === '' || row.id === asNumber || row.title.toLowerCase().includes(q))
  ));
}

/**
 * The authored level before / after `levelId` by level number (ids may have
 * gaps, so this walks the sorted list rather than doing ±1). `undefined` at
 * the first / last authored level.
 */
export function devNeighbours(levelId: number): { prev?: number; next?: number } {
  const i = LEVEL_DEFINITIONS.findIndex((l) => l.id === levelId);
  if (i < 0) return {};
  return { prev: LEVEL_DEFINITIONS[i - 1]?.id, next: LEVEL_DEFINITIONS[i + 1]?.id };
}
