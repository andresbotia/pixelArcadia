import { createGame } from '@/game/engine/createGame';
import { ORB_COLOR_IDS, type LevelDefinition, type OrbColor } from '@/game/engine/types';
import { getLevel } from '@/game/levels/levels';
import { ORB_COLOR_ORDER } from '@/game/studio/analysis/boardMetrics';
import { COLOR_TO_CHAR, ORB_COLORS } from '@/game/studio/grid';
import { fromLevelDefinition, toLevelDefinition } from '@/game/studio/serialize';
import { pixelMaterial } from '@/theme/arcade';
import { assistStrokeWidth, colorMark, GAMEPLAY_COLORS, markContrast, simplifiedMark } from '@/theme/colorAssist';
import { orbColors, orbGlow, orbLabel } from '@/theme/colors';
import { VALID_ORB_COLORS, validateLevelStructure } from '../validate';

const BASELINE = ['white', 'yellow', 'gold', 'orange', 'red', 'coral', 'pink', 'magenta', 'purple', 'indigo',
  'blue', 'cyan', 'teal', 'green', 'lime', 'sand', 'brown', 'stone', 'forest', 'maroon', 'navy', 'seafoam',
  'slate', 'ivory', 'ice', 'amethyst', 'olive', 'umber', 'lavender', 'blush', 'bronze', 'ultramarine',
  'pine', 'mauve', 'garnet', 'verdigris', 'cerulean', 'graphite', 'sage', 'plum', 'rose'];
const SILVER: LevelDefinition = { id: 9830, title: 'Silver round trip', themeId: 'cosmic-gods', difficulty: 'hard',
  holdingCapacity: 3, activeCapacity: 5, ruleset: 'coreV2', replacesLegacy: false, legend: { k: 'silver' },
  pixelArt: ['kkkk', 'kkkk', 'kkkk', 'kkkk'], tunnels: [[{ color: 'silver', capacity: 16 }], [], []] };

test('silver appends once after the exact previous 41 IDs', () => {
  expect(ORB_COLOR_IDS).toEqual([...BASELINE, 'silver']);
  for (const list of [ORB_COLORS, GAMEPLAY_COLORS, ORB_COLOR_ORDER, [...VALID_ORB_COLORS]]) {
    expect([...list]).toEqual([...ORB_COLOR_IDS]);
  }
  for (const map of [orbColors, orbGlow, orbLabel, COLOR_TO_CHAR]) expect(Object.keys(map)).toEqual([...ORB_COLOR_IDS]);
  expect(new Set(Object.values(COLOR_TO_CHAR)).size).toBe(42);
  expect(new Set(Object.values(orbColors)).size).toBe(42);
  expect(ORB_COLOR_IDS).not.toContain('terracotta'); expect(ORB_COLOR_IDS).not.toContain('petrol');
});

test('locked silver tokens and Studio character round trip', () => {
  expect(orbColors.silver).toBe('#BEBEBA'); expect(orbGlow.silver).toBe('#E2E2DE');
  expect(orbLabel.silver).toBe('SILVER'); expect(COLOR_TO_CHAR.silver).toBe('k');
  expect(pixelMaterial('silver')).toMatchObject({ base: '#BEBEBA', rim: '#E2E2DE' });
  expect(markContrast('silver').strategy).toBe('darkOnLight');
  expect(validateLevelStructure(SILVER).valid).toBe(true);
  const restored = toLevelDefinition(fromLevelDefinition(SILVER));
  expect(createGame(restored).pixels.map(p => p.color)).toEqual(Array(16).fill('silver'));
  expect(restored.legend?.k).toBe('silver');
});

test.each(['full', 'compact', 'minimal'] as const)('orbit remains exact and unique at %s detail', detail => {
  expect(colorMark('silver').name).toBe('orbit');
  expect(simplifiedMark('silver', detail).parts).toEqual([{ p: 'ring', scale: 0.7 }, { p: 'bar', angle: 0, len: 0.95 }]);
  expect(new Set(ORB_COLOR_IDS.map(c => colorMark(c).name)).size).toBe(42);
  expect(new Set(ORB_COLOR_IDS.map(c => JSON.stringify(simplifiedMark(c, detail).parts))).size).toBe(42);
  for (const near of ['white', 'stone', 'sage', 'sand', 'ice'] as const) {
    expect(orbColors.silver).not.toBe(orbColors[near]);
    expect(simplifiedMark('silver', detail).parts).not.toEqual(simplifiedMark(near, detail).parts);
  }
});

test('unknown colour rejects in both artwork and Pal definitions', () => {
  const bad = 'cool-grey' as OrbColor;
  expect(validateLevelStructure({ ...SILVER, legend: { k: bad } }).valid).toBe(false);
  expect(validateLevelStructure({ ...SILVER, tunnels: [[{ color: bad, capacity: 16 }], [], []] }).valid).toBe(false);
});

test.each(Array.from({ length: 40 }, (_, i) => 291 + i))('level %i retains direct valid colour/assist/Studio mappings', id => {
  const def = getLevel(id)!;
  const used = [...new Set(createGame(def).pixels.map(p => p.color))];
  if (used.includes('silver')) expect(def.legend?.k).toBe('silver');
  for (const color of used) {
    expect(VALID_ORB_COLORS.has(color)).toBe(true);
    expect(orbColors[color]).toMatch(/^#[0-9A-F]{6}$/); expect(orbGlow[color]).toMatch(/^#[0-9A-F]{6}$/);
    expect(COLOR_TO_CHAR[color]).toHaveLength(1);
  }
  expect(new Set(used.map(c => JSON.stringify(simplifiedMark(c, 'minimal').parts))).size).toBe(used.length);
});

test('silver chip stroke keeps real openings above and below the horizontal orbit bar', () => {
  for (const size of [5.6, 6, 14]) {
    const stroke = assistStrokeWidth('silver', size, 0.18);
    const innerDiameter = size * 0.66 * 0.7 - 2 * stroke;
    expect(innerDiameter - stroke).toBeGreaterThan(size * 0.2);
  }
  expect(assistStrokeWidth('garnet', 6, 0.18)).toBe(1.08);
});
