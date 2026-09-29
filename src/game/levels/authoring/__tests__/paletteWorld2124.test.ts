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

// Authored fills/rims from content/palettes/world-22/23-palette-extension.json (unchanged).
const APPROVED = { plum: '#5A2248', rose: '#E0457B' } as const;
const RIMS = { plum: '#B49BAC', rose: '#F1ABC3' } as const;
const CHARS = { plum: 'y', rose: 'e' } as const;
const MARKS = {
  plum: { name: 'pierced-ring', parts: [
    { p: 'ring', scale: 0.7 }, { p: 'bar', angle: 90, len: 0.2, offset: [0, -0.42] }, { p: 'bar', angle: 90, len: 0.2, offset: [0, 0.42] },
  ] },
  rose: { name: 'triangle-down-dot', parts: [{ p: 'tri', dir: 'down', fill: false }, { p: 'dot', scale: 0.3 }] },
} as const;
// Nearest-colour families and real board neighbours reviewed at phone scale (see VISUAL_REVIEW_201_240.md).
const FAMILY: Record<keyof typeof APPROVED, OrbColor[]> = {
  plum: ['purple', 'amethyst', 'magenta', 'maroon', 'navy', 'garnet', 'umber', 'indigo', 'ultramarine', 'graphite', 'mauve', 'teal'],
  rose: ['maroon', 'coral', 'red', 'pink', 'magenta', 'garnet', 'blush', 'mauve', 'umber', 'orange', 'stone', 'graphite'],
};
const COLORS = Object.keys(APPROVED) as (keyof typeof APPROVED)[];

test.each(COLORS)('%s validates, renders and round-trips through Studio', (color) => {
  const def = { id: 9800, title: color, themeId: 'gothic-kingdom', difficulty: 'easy' as const,
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
  expect(markContrast(color).strategy).toBe('lightOnDark');
  expect(createGame(toLevelDefinition(fromLevelDefinition(def))).pixels.map(p => p.color))
    .toEqual(createGame(def).pixels.map(p => p.color));
});

test('appends exactly plum, rose after the 39-colour baseline', () => {
  expect(ORB_COLOR_IDS).toHaveLength(44);
  expect(ORB_COLOR_IDS.slice(0, 39)).toEqual([
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
    'cerulean',
    'graphite',
    'sage',
  ]);
  expect(ORB_COLOR_IDS.slice(36, 39)).toEqual(['cerulean', 'graphite', 'sage']);
  expect(ORB_COLOR_IDS.slice(39, 41)).toEqual(COLORS);
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
  // Regressions caught in review: the authored literals collide at minimal detail.
  const partsOf = (c: OrbColor) => simplifiedMark(c, detail).parts.map(p => p.p).sort().join();
  expect(partsOf('rose')).not.toBe('bar,bar,ring'); // X + ring == umber ring-cross; X alone == pink cross
  expect(partsOf('plum')).not.toBe('ring,sq'); // ring + outline diamond collapses to a disc like maroon's diamond-dot
});

test('rose vs maroon and plum vs navy retain approved fill/rim contrast and distinct glyph families', () => {
  // rose/maroon dE00 12.5 (the weakest proposed pair). Their rims are near-identical (#F1ABC3 / #F0A2B2), so the
  // separation must come from fill value (~1.67x luminance) and the glyph; plum/navy are near-identical in grayscale.
  expect(luminance(orbColors.rose)).toBeGreaterThan(luminance(orbColors.maroon) * 1.5);
  expect(luminance(orbGlow.plum)).toBeGreaterThan(luminance(orbColors.plum) * 8);
  const prims = (c: OrbColor) => new Set(colorMark(c).parts.map(p => p.p));
  expect(prims('rose').has('tri')).toBe(true);
  expect(prims('maroon').has('tri')).toBe(false);
  expect(prims('plum').has('ring')).toBe(true);
  expect(prims('navy').has('ring')).toBe(false);
});

test.each([
  ...Array.from({ length: 10 }, (_, i) => [211 + i, 'plum'] as const),
  ...[231, 232, 233, 234, 236, 237, 238, 239, 240].map(id => [id, 'plum'] as const),
  ...Array.from({ length: 20 }, (_, i) => [221 + i, 'rose'] as const),
])('board %i uses %s and rejects when it is unregistered', (id, color) => {
  const def = getLevel(id)!;
  expect(createGame(def).pixels.some(p => p.color === color)).toBe(true);
  expect(validateLevelStructure(def).valid).toBe(true);
  const legend = Object.fromEntries(Object.entries(def.legend!).map(([ch, c]) => [ch, c === color ? 'unregistered' as OrbColor : c]));
  expect(validateLevelStructure({ ...def, legend }).valid).toBe(false);
});

test('World 21 adds no colour and uses neither plum nor rose; World 24 adds none beyond them', () => {
  for (let id = 201; id <= 210; id++) {
    const used = new Set(createGame(getLevel(id)!).pixels.map(p => p.color));
    for (const c of COLORS) expect(used.has(c)).toBe(false);
  }
  for (let id = 231; id <= 240; id++) {
    for (const p of createGame(getLevel(id)!).pixels) expect(ORB_COLOR_IDS).toContain(p.color);
  }
});
