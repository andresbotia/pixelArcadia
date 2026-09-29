import { createGame } from '@/game/engine/createGame';
import { ORB_COLOR_IDS, type OrbColor } from '@/game/engine/types';
import { getLevel } from '@/game/levels/levels';
import { ORB_COLOR_ORDER } from '@/game/studio/analysis/boardMetrics';
import { COLOR_TO_CHAR, ORB_COLORS } from '@/game/studio/grid';
import { fromLevelDefinition, toLevelDefinition } from '@/game/studio/serialize';
import { pixelMaterial } from '@/theme/arcade';
import { colorMark, GAMEPLAY_COLORS, luminance, markContrast, simplifiedMark } from '@/theme/colorAssist';
import { orbColors, orbGlow, orbLabel } from '@/theme/colors';
import { VALID_ORB_COLORS, validateLevelStructure } from '../validate';

// Authored fills/rims from content/palettes/world-18..20-palette-extension.json (unchanged).
const APPROVED = { cerulean: '#2FA0E0', graphite: '#555A66', sage: '#94A887' } as const;
const RIMS = { cerulean: '#A1D4F1', graphite: '#B2B4BA', sage: '#CED7C9' } as const;
const CHARS = { cerulean: 'c', graphite: 'r', sage: 's' } as const;
const STRATEGY = { cerulean: 'lightHaloed', graphite: 'lightOnDark', sage: 'lightHaloed' } as const;
const MARKS = {
  cerulean: { name: 'pinned-ring', parts: [{ p: 'ring', scale: 0.7 }, { p: 'bar', angle: 90, len: 0.3, offset: [0, -0.38] }] },
  graphite: { name: 'slashed-square', parts: [{ p: 'sq', angle: 0, fill: false }, { p: 'bar', angle: 45, len: 0.65 }] },
  sage: { name: 'anchor', parts: [
    { p: 'arc', dir: 'up', offset: [0, 0.1] }, { p: 'bar', angle: 90, len: 0.62 }, { p: 'bar', angle: 0, len: 0.28, offset: [0, -0.24] },
  ] },
} as const;
// Nearest-colour families reviewed at phone scale (see VISUAL_REVIEW_161_200.md).
const FAMILY: Record<keyof typeof APPROVED, OrbColor[]> = {
  cerulean: ['blue', 'cyan', 'ice', 'teal', 'navy', 'slate', 'ultramarine', 'indigo', 'verdigris', 'purple'],
  graphite: ['slate', 'navy', 'stone', 'sand', 'mauve', 'bronze', 'olive', 'umber', 'amethyst', 'indigo'],
  sage: ['green', 'forest', 'pine', 'seafoam', 'olive', 'verdigris', 'teal', 'lime', 'stone', 'ivory'],
};
const COLORS = Object.keys(APPROVED) as (keyof typeof APPROVED)[];

test.each(COLORS)('%s validates, renders and round-trips through Studio', (color) => {
  const def = { id: 9790, title: color, themeId: 'crystal-caverns', difficulty: 'easy' as const,
    holdingCapacity: 3, ruleset: 'coreV2' as const, legend: { X: color },
    pixelArt: ['XXXX', 'XXXX', 'XXXX', 'XXXX'], tunnels: [[{ color, capacity: 16 }], [], []] };
  expect(VALID_ORB_COLORS.has(color)).toBe(true);
  expect(validateLevelStructure(def).valid).toBe(true);
  expect(orbColors[color]).toBe(APPROVED[color]);
  expect(orbGlow[color]).toBe(RIMS[color]);
  expect(pixelMaterial(color).base).toBe(APPROVED[color]);
  expect(pixelMaterial(color).rim).toBe(RIMS[color]);
  expect(orbLabel[color]).toBe(color.toUpperCase());
  expect(COLOR_TO_CHAR[color]).toBe(CHARS[color]);
  expect(markContrast(color).strategy).toBe(STRATEGY[color]);
  expect(createGame(toLevelDefinition(fromLevelDefinition(def))).pixels.map(p => p.color))
    .toEqual(createGame(def).pixels.map(p => p.color));
});

test('appends exactly cerulean, graphite, sage after the 36-colour baseline', () => {
  expect(ORB_COLOR_IDS).toHaveLength(44);
  expect(ORB_COLOR_IDS.slice(0, 36)).toEqual([
    'white',
    'yellow',
    'gold',
    'orange',
    'red',
    'coral',
    'pink',
    'magenta',
    'purple',
    'indigo',
    'blue',
    'cyan',
    'teal',
    'green',
    'lime',
    'sand',
    'brown',
    'stone',
    'forest',
    'maroon',
    'navy',
    'seafoam',
    'slate',
    'ivory',
    'ice',
    'amethyst',
    'olive',
    'umber',
    'lavender',
    'blush',
    'bronze',
    'ultramarine',
    'pine',
    'mauve',
    'garnet',
    'verdigris',
  ]);
  expect(ORB_COLOR_IDS.slice(34, 36)).toEqual(['garnet', 'verdigris']);
  expect(ORB_COLOR_IDS.slice(36, 39)).toEqual(COLORS);
  for (const list of [ORB_COLORS, GAMEPLAY_COLORS, [...ORB_COLOR_ORDER], [...VALID_ORB_COLORS]]) {
    expect(list).toEqual([...ORB_COLOR_IDS]);
  }
  for (const map of [orbColors, orbGlow, orbLabel, COLOR_TO_CHAR]) {
    expect(Object.keys(map)).toEqual([...ORB_COLOR_IDS]);
  }
  expect(new Set(Object.values(COLOR_TO_CHAR)).size).toBe(44);
  expect(new Set(Object.values(orbColors)).size).toBe(44);
});

test.each(['full', 'compact', 'minimal'] as const)('new marks are exact and distinct from their colour family at %s detail', detail => {
  for (const color of COLORS) {
    expect(colorMark(color).name).toBe(MARKS[color].name);
    expect(simplifiedMark(color, detail).parts).toEqual(MARKS[color].parts);
    for (const near of FAMILY[color]) {
      expect(simplifiedMark(color, detail).parts).not.toEqual(simplifiedMark(near, detail).parts);
    }
  }
  // Regressions caught in review: the authored literals collide with existing marks.
  expect(simplifiedMark('cerulean', detail).parts).not.toEqual(simplifiedMark('purple', detail).parts); // filled tri-up
  expect(simplifiedMark('sage', detail).parts[0]).not.toEqual({ p: 'arc', dir: 'down' }); // umbrella reads as forest tee
});

test('graphite is separated from slate and navy by rim, contrast strategy and glyph family', () => {
  // Fills are close (dE00 12.7 / 13.1); readability relies on the pale rim and a box glyph.
  expect(luminance(orbGlow.graphite)).toBeGreaterThan(luminance(orbColors.graphite) * 3);
  expect(markContrast('graphite').strategy).toBe('lightOnDark');
  const box = (c: OrbColor) => colorMark(c).parts.some(p => p.p === 'sq');
  expect(box('graphite')).toBe(true);
  expect(box('slate')).toBe(false);
  expect(box('navy')).toBe(false);
});

test.each([
  ...Array.from({ length: 19 }, (_, i) => [171 + i, 'cerulean'] as const).filter(([id]) => id !== 190),
  ...Array.from({ length: 10 }, (_, i) => [181 + i, 'graphite'] as const),
  ...Array.from({ length: 10 }, (_, i) => [191 + i, 'sage'] as const),
  [193, 'cerulean'] as const, [199, 'cerulean'] as const, [200, 'cerulean'] as const,
])('board %i uses %s and rejects when it is unregistered', (id, color) => {
  const def = getLevel(id)!;
  expect(createGame(def).pixels.some(p => p.color === color)).toBe(true);
  expect(validateLevelStructure(def).valid).toBe(true);
  const legend = Object.fromEntries(Object.entries(def.legend!).map(([ch, c]) => [ch, c === color ? 'unregistered' as OrbColor : c]));
  expect(validateLevelStructure({ ...def, legend }).valid).toBe(false);
});

test('World 17 adds no colour and uses only the 36-colour baseline', () => {
  for (let id = 161; id <= 170; id++) {
    const used = new Set(createGame(getLevel(id)!).pixels.map(p => p.color));
    for (const c of COLORS) expect(used.has(c)).toBe(false);
  }
});
