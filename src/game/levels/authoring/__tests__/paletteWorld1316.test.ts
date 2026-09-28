import { createGame } from '@/game/engine/createGame';
import { ORB_COLOR_IDS, type OrbColor } from '@/game/engine/types';
import { getLevel } from '@/game/levels/levels';
import { ORB_COLOR_ORDER } from '@/game/studio/analysis/boardMetrics';
import { COLOR_TO_CHAR, ORB_COLORS } from '@/game/studio/grid';
import { fromLevelDefinition, toLevelDefinition } from '@/game/studio/serialize';
import { pixelMaterial } from '@/theme/arcade';
import { colorMark, GAMEPLAY_COLORS, simplifiedMark, markContrast } from '@/theme/colorAssist';
import { orbColors, orbGlow, orbLabel } from '@/theme/colors';
import { VALID_ORB_COLORS, validateLevelStructure } from '../validate';

const APPROVED = { garnet: '#8E1B1B', verdigris: '#1B8C8C' } as const;
const RIMS = { garnet: '#CC9898', verdigris: '#98CBCB' } as const;
const EXISTING = {
  white: '#EEF3FF', yellow: '#FFD23F', gold: '#F2A93B', orange: '#FF8A3C', red: '#FF4D4D',
  coral: '#FF6F7D', pink: '#FF7BC5', magenta: '#E85CD8', purple: '#B07CFF', indigo: '#6E6BF0',
  blue: '#3E7BFF', cyan: '#3BE1F0', teal: '#2FD3B4', green: '#3FDD9B', lime: '#9BE84A',
  sand: '#E4CB98', brown: '#A0623A', stone: '#8E97A8', forest: '#2F8A57', maroon: '#B03A52',
  navy: '#244A73', seafoam: '#B8E8C6', slate: '#4F7282', ivory: '#FFF0C2', ice: '#AAD6FF', amethyst: '#793F98',
  olive: '#8C9A2B', umber: '#5E3B25', lavender: '#CDB6F7', blush: '#F7B8C8',
  bronze: '#9C7A3C', ultramarine: '#3A2FD6', pine: '#1E5A45', mauve: '#A5708F',
} as const;

test.each(Object.keys(APPROVED) as (keyof typeof APPROVED)[])('%s validates, renders and round-trips through Studio', (color) => {
  const def = { id: 9780, title: color, themeId: 'ocean-depths', difficulty: 'easy' as const,
    holdingCapacity: 3, ruleset: 'coreV2' as const, legend: { X: color },
    pixelArt: ['XXXX', 'XXXX', 'XXXX', 'XXXX'], tunnels: [[{ color, capacity: 16 }], [], []] };
  expect(VALID_ORB_COLORS.has(color)).toBe(true);
  expect(validateLevelStructure(def).valid).toBe(true);
  expect(orbColors[color]).toBe(APPROVED[color]);
  expect(pixelMaterial(color).base).toBe(APPROVED[color]);
  expect(pixelMaterial(color).rim).toBe(orbGlow[color]);
  expect(orbGlow[color]).toBe(RIMS[color]);
  expect(orbGlow[color]).toMatch(/^#[0-9A-F]{6}$/);
  expect(orbLabel[color]).toBe(color.toUpperCase());
  expect(markContrast(color).fill).toMatch(/^#/);
  expect(colorMark(color).color).toBe(color);
  expect(COLOR_TO_CHAR[color]).toHaveLength(1);
  expect(createGame(toLevelDefinition(fromLevelDefinition(def))).pixels.map(p => p.color))
    .toEqual(createGame(def).pixels.map(p => p.color));
});

test('preserves all existing fills and positions, appending exactly two approved IDs', () => {
  expect(ORB_COLOR_IDS.slice(0, 34)).toEqual(Object.keys(EXISTING));
  expect(ORB_COLOR_IDS.slice(34)).toEqual(Object.keys(APPROVED));
  for (const [color, hex] of Object.entries(EXISTING)) expect(orbColors[color as OrbColor]).toBe(hex);
  expect(ORB_COLOR_IDS).toHaveLength(36);
  expect(new Set(ORB_COLOR_IDS).size).toBe(36);
  for (const list of [ORB_COLORS, GAMEPLAY_COLORS, [...ORB_COLOR_ORDER], [...VALID_ORB_COLORS]]) {
    expect(list).toEqual([...ORB_COLOR_IDS]);
  }
  for (const map of [orbColors, orbGlow, orbLabel, COLOR_TO_CHAR]) {
    expect(Object.keys(map)).toEqual([...ORB_COLOR_IDS]);
  }
  expect(new Set(Object.values(COLOR_TO_CHAR)).size).toBe(36);
});

test.each(['full', 'compact', 'minimal'] as const)('all 36 assist shapes stay unique at %s detail', detail => {
  const names = ORB_COLOR_IDS.map(c => colorMark(c).name);
  const shapes = ORB_COLOR_IDS.map(c => JSON.stringify(simplifiedMark(c, detail).parts));
  expect(new Set(names).size).toBe(36);
  expect(new Set(shapes).size).toBe(36);
  expect(simplifiedMark('navy', detail)).not.toEqual(simplifiedMark('slate', detail));
  const pale = ['seafoam', 'ivory', 'ice', 'sand', 'yellow', 'white'] as const;
  expect(new Set(pale.map(c => JSON.stringify(simplifiedMark(c, detail).parts))).size).toBe(pale.length);
});

test('unknown colors reject and the real 22-color Colossus validates', () => {
  const l80 = getLevel(80)!;
  expect(new Set(createGame(l80).pixels.map(p => p.color)).size).toBe(22);
  expect(validateLevelStructure(l80).valid).toBe(true);
  const bad = { ...l80, legend: { ...l80.legend, X: 'ultraviolet' as OrbColor },
    tunnels: [[{ color: 'ultraviolet' as OrbColor, capacity: 1 }], [], []] };
  const result = validateLevelStructure(bad);
  expect(result.valid).toBe(false);
  expect(result.diagnostics.some(d => d.code === 'INVALID_LEGEND_COLOR')).toBe(true);
  expect(result.diagnostics.some(d => d.code === 'INVALID_CHARGE_COLOR')).toBe(true);
});

test('garnet theta and verdigris lid retain their distinct semantics at every detail', () => {
  expect(COLOR_TO_CHAR.garnet).toBe('g');
  expect(COLOR_TO_CHAR.verdigris).toBe('v');
  expect(colorMark('garnet').name).toBe('theta');
  expect(colorMark('verdigris').name).toBe('lidded-triangle');
  for (const detail of ['full', 'compact', 'minimal'] as const) {
    expect(simplifiedMark('garnet', detail).parts).toEqual([{ p: 'ring' }, { p: 'bar', angle: 0, len: 0.56 }]);
    expect(simplifiedMark('verdigris', detail).parts).toEqual([
      { p: 'tri', dir: 'down', fill: true }, { p: 'bar', angle: 0, len: 0.62, offset: [0, -0.44] },
    ]);
    for (const near of ['white', 'umber', 'maroon', 'red'] as const) {
      expect(simplifiedMark('garnet', detail).parts).not.toEqual(simplifiedMark(near, detail).parts);
    }
    for (const near of ['teal', 'forest', 'green', 'slate'] as const) {
      expect(simplifiedMark('verdigris', detail).parts).not.toEqual(simplifiedMark(near, detail).parts);
    }
  }
  for (const c of ['garnet', 'verdigris'] as const) expect(markContrast(c).strategy).toBe('lightOnDark');
});

test('a representative 36-color board uses the entire schema and Studio infrastructure', () => {
  const legend = Object.fromEntries(ORB_COLOR_IDS.map(c => [COLOR_TO_CHAR[c], c]));
  const pixelArt = Array.from({ length: 6 }, (_, y) => ORB_COLOR_IDS.slice(y * 6, y * 6 + 6).map(c => COLOR_TO_CHAR[c]).join(''));
  const def = { id: 9781, title: '36 colors', themeId: 'frozen-north', difficulty: 'easy' as const,
    holdingCapacity: 3, ruleset: 'coreV2' as const, legend, pixelArt,
    tunnels: [ORB_COLOR_IDS.map(color => ({ color, capacity: 1 })), [], []] };
  expect(validateLevelStructure(def).valid).toBe(true);
  const roundTrip = toLevelDefinition(fromLevelDefinition(def));
  expect(createGame(roundTrip).pixels.map(p => p.color)).toEqual([...ORB_COLOR_IDS]);
});

test.each(Array.from({ length: 20 }, (_, i) => i < 10 ? 131 + i : 151 + i - 10))('new-color board %i validates', id => {
  const def = getLevel(id)!;
  const color = id < 141 ? 'garnet' : 'verdigris';
  expect(createGame(def).pixels.some(p => p.color === color)).toBe(true);
  expect(validateLevelStructure(def).valid).toBe(true);
  const legend = Object.fromEntries(Object.entries(def.legend!).map(([ch, c]) => [ch, c === color ? 'unregistered' as OrbColor : c]));
  expect(validateLevelStructure({ ...def, legend }).valid).toBe(false);
});
