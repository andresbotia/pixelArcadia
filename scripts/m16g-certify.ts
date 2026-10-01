/** Fast, witness-aware v1 content certification. Never runs the solver on 1–500. */
import fs from 'fs';
import { loadAuthoredDirectory } from '../src/game/levels/authoring/loader';
import { validateLevelPacket } from '../src/game/levels/authoring/validate';
import { replayAuthoredWitness } from '../src/game/levels/authoring/witness';
import { LEVEL_DEFINITIONS } from '../src/game/levels/levels';
import { ORB_COLOR_IDS } from '../src/game/engine/types';
import { CAMPAIGN_MANIFEST } from '../src/game/levels/campaign';
import { PUBLISHED_MAX_LEVEL, CAMPAIGN_VERSION } from '../src/game/levels/publishing';

const source = loadAuthoredDirectory('content/levels');
const ids = Array.from({ length: 500 }, (_, i) => i + 1);
const sourceIds = source.levels.map(level => level.id).sort((a, b) => a - b);
const compiledIds = LEVEL_DEFINITIONS.map(level => level.id);
const sourceById = new Map(source.levels.map(level => [level.id, level]));
const failures: { id: number; issue: string }[] = [];
let witnesses = 0, structures = 0, capacityTotals = 0, sourceMatches = 0;
for (const level of LEVEL_DEFINITIONS) {
  const validation = validateLevelPacket(level, { runSolver: false });
  const replay = replayAuthoredWitness(level);
  if (validation.valid && level.ruleset === 'coreV2' && level.tunnels.length === 3
      && level.pixelArt.length <= 48 && level.pixelArt.every(row => row.length <= 48)
      && level.replacesLegacy !== undefined) structures++;
  else failures.push({ id: level.id, issue: `structure: ${JSON.stringify(validation)}` });
  if (replay.valid) witnesses++;
  else failures.push({ id: level.id, issue: `witness: ${JSON.stringify(replay)}` });
  const populations = new Map<string, number>();
  for (const row of level.pixelArt) for (const glyph of row) {
    if (glyph === '.') continue;
    const color = level.legend?.[glyph];
    if (color) populations.set(color, (populations.get(color) ?? 0) + 1);
  }
  const charges = new Map<string, number>();
  for (const pal of level.tunnels.flat()) charges.set(pal.color, (charges.get(pal.color) ?? 0) + pal.capacity);
  if ([...populations].every(([color, n]) => charges.get(color) === n)
      && [...charges].every(([color, n]) => populations.get(color) === n)) capacityTotals++;
  else failures.push({ id: level.id, issue: 'capacity totals' });
  if (JSON.stringify(sourceById.get(level.id)) === JSON.stringify(level)) sourceMatches++;
  else failures.push({ id: level.id, issue: 'source/compiled mismatch' });
}
const result = {
  totalLevels: LEVEL_DEFINITIONS.length,
  registry: JSON.stringify(sourceIds) === JSON.stringify(ids) && JSON.stringify(compiledIds) === JSON.stringify(ids)
    && new Set(compiledIds).size === 500 && CAMPAIGN_MANIFEST.worlds.length === 50 && source.errors.length === 0,
  sourceCount: source.levels.length, compiledCount: LEVEL_DEFINITIONS.length,
  sourceMatches, structures, witnesses, capacityTotals,
  paletteCount: ORB_COLOR_IDS.length, publishedMaxLevel: PUBLISHED_MAX_LEVEL, campaignVersion: CAMPAIGN_VERSION,
  failures,
};
fs.writeFileSync('dist/m16g/full-certification.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (!result.registry || result.sourceMatches !== 500 || result.structures !== 500 || result.witnesses !== 500
    || result.capacityTotals !== 500 || result.paletteCount !== 44 || result.publishedMaxLevel !== 500
    || result.campaignVersion !== 'v1-500') process.exitCode = 1;
