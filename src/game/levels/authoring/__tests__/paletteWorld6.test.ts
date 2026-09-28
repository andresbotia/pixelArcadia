import { createGame } from '@/game/engine/createGame';
import { ORB_COLOR_IDS, type LevelDefinition, type OrbColor } from '@/game/engine/types';
import { ORB_COLOR_ORDER } from '@/game/studio/analysis/boardMetrics';
import { COLOR_TO_CHAR, ORB_COLORS } from '@/game/studio/grid';
import { pixelMaterial } from '@/theme/arcade';
import { colorMark, GAMEPLAY_COLORS, luminance, markContrast } from '@/theme/colorAssist';
import { orbColors, orbGlow, orbLabel } from '@/theme/colors';
import { getLevel } from '@/game/levels/levels';
import { VALID_ORB_COLORS, validateLevelStructure } from '../validate';

/** World 6 landmark palette extension — the five approved colours. */
const NEW_COLORS = {
  sand: '#E4CB98',
  brown: '#A0623A',
  stone: '#8E97A8',
  forest: '#2F8A57',
  maroon: '#B03A52',
} as const;

const ORIGINAL_15 = {
  white: '#EEF3FF', yellow: '#FFD23F', gold: '#F2A93B', orange: '#FF8A3C', red: '#FF4D4D',
  coral: '#FF6F7D', pink: '#FF7BC5', magenta: '#E85CD8', purple: '#B07CFF', indigo: '#6E6BF0',
  blue: '#3E7BFF', cyan: '#3BE1F0', teal: '#2FD3B4', green: '#3FDD9B', lime: '#9BE84A',
} as const;

const WELL = '#10245B';
const contrastRatio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

function singleColorLevel(color: OrbColor, id: number): LevelDefinition {
  return {
    id,
    title: `${color} acceptance`,
    themeId: 'world-landmarks',
    difficulty: 'easy',
    holdingCapacity: 3,
    ruleset: 'coreV2',
    legend: { X: color },
    pixelArt: ['.XX.', 'XXXX'],
    tunnels: [[{ color, capacity: 6 }], [], []],
  };
}

describe('World 6 palette extension', () => {
  // 1-5
  it.each(Object.keys(NEW_COLORS) as OrbColor[])('%s is accepted by the schema and validator', (color) => {
    expect(VALID_ORB_COLORS.has(color)).toBe(true);
    const level = singleColorLevel(color, 9600 + ORB_COLOR_IDS.indexOf(color));
    const res = validateLevelStructure(level);
    expect(res.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
    expect(res.valid).toBe(true);
    expect(createGame(level).pixels.every((p) => p.color === color)).toBe(true);
  });

  it('uses exactly the approved hex values', () => {
    for (const [color, hex] of Object.entries(NEW_COLORS)) expect(orbColors[color as OrbColor]).toBe(hex);
  });

  // 6
  it('leaves the original 15 colours, their order and their marks unchanged', () => {
    expect(ORB_COLOR_IDS.slice(0, 15)).toEqual(Object.keys(ORIGINAL_15));
    for (const [color, hex] of Object.entries(ORIGINAL_15)) expect(orbColors[color as OrbColor]).toBe(hex);
    expect(colorMark('blue').name).toBe('diamond');
    expect(colorMark('lime').name).toBe('stack');
  });

  // 7 + 8
  it('lets a level use more than 15 colours — the real 19-colour World 6 finale validates', () => {
    const l60 = getLevel(60)!;
    const colors = new Set(createGame(l60).pixels.map((p) => p.color));
    expect(colors.size).toBe(19);
    for (const c of Object.keys(NEW_COLORS)) expect(colors.has(c as OrbColor)).toBe(true);
    const res = validateLevelStructure(l60);
    expect(res.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
    expect(res.valid).toBe(true);
  });

  // 9
  it('still rejects unknown colours in legends and tunnels', () => {
    const bad: LevelDefinition = {
      ...singleColorLevel('sand', 9650),
      legend: { X: 'beige' as OrbColor },
      tunnels: [[{ color: 'beige' as OrbColor, capacity: 6 }], [], []],
    };
    const res = validateLevelStructure(bad);
    expect(res.valid).toBe(false);
    expect(res.diagnostics.some((d) => d.code === 'INVALID_LEGEND_COLOR')).toBe(true);
    expect(res.diagnostics.some((d) => d.code === 'INVALID_CHARGE_COLOR')).toBe(true);
    expect(VALID_ORB_COLORS.has('beige' as OrbColor)).toBe(false);
  });

  // 10
  it.each(Object.keys(NEW_COLORS) as OrbColor[])('%s maps to valid rendered styles', (color) => {
    for (const hex of [orbColors[color], orbGlow[color]]) expect(hex).toMatch(/^#[0-9A-F]{6}$/);
    expect(orbLabel[color]).toBe(color.toUpperCase());
    const material = pixelMaterial(color);
    expect(material.base).toBe(NEW_COLORS[color as keyof typeof NEW_COLORS]);
    expect(material.rim).toBe(orbGlow[color]);
    // The glow tint is the light rim on pixels and Pal chips: always lighter than the body.
    expect(luminance(orbGlow[color])).toBeGreaterThan(luminance(orbColors[color]));
  });

  it('gives the weakest-contrast bodies (brown, maroon) a clearly readable light rim', () => {
    for (const color of ['brown', 'maroon'] as const) {
      expect(contrastRatio(orbColors[color], WELL)).toBeLessThan(3.5);
      expect(contrastRatio(orbGlow[color], WELL)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(orbGlow[color], orbColors[color])).toBeGreaterThanOrEqual(2);
    }
  });

  // 11
  it.each(Object.keys(NEW_COLORS) as OrbColor[])('%s has a Color Assist glyph and contrast strategy', (color) => {
    const mark = colorMark(color);
    expect(mark.color).toBe(color);
    expect(mark.parts.length).toBeGreaterThanOrEqual(1);
    const contrast = markContrast(color);
    expect(contrast.fill).toMatch(/^#/);
  });

  // 12
  it('keeps one registry with no duplicate ids, mirrored by every palette list', () => {
    expect(ORB_COLOR_IDS).toHaveLength(34);
    expect(new Set(ORB_COLOR_IDS).size).toBe(ORB_COLOR_IDS.length);
    for (const list of [GAMEPLAY_COLORS, ORB_COLORS, [...ORB_COLOR_ORDER], [...VALID_ORB_COLORS]]) {
      expect([...list].sort()).toEqual([...ORB_COLOR_IDS].sort());
    }
    for (const map of [orbColors, orbGlow, orbLabel, COLOR_TO_CHAR]) {
      expect(Object.keys(map).sort()).toEqual([...ORB_COLOR_IDS].sort());
    }
    const hexes = Object.values(orbColors).map((h) => h.toUpperCase());
    expect(new Set(hexes).size).toBe(hexes.length);
    const chars = Object.values(COLOR_TO_CHAR);
    expect(new Set(chars).size).toBe(chars.length);
    const names = GAMEPLAY_COLORS.map((c) => colorMark(c).name);
    expect(new Set(names).size).toBe(names.length);
  });
});
