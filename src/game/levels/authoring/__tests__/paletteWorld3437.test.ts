import { createGame } from '@/game/engine/createGame';
import { ORB_COLOR_IDS, type LevelDefinition, type OrbColor } from '@/game/engine/types';
import { getLevel } from '@/game/levels/levels';
import { ORB_COLOR_ORDER } from '@/game/studio/analysis/boardMetrics';
import { COLOR_TO_CHAR, ORB_COLORS } from '@/game/studio/grid';
import { fromLevelDefinition, toLevelDefinition } from '@/game/studio/serialize';
import { pixelMaterial } from '@/theme/arcade';
import { colorMark, GAMEPLAY_COLORS, markContrast, simplifiedMark } from '@/theme/colorAssist';
import { orbColors, orbGlow, orbLabel } from '@/theme/colors';
import { VALID_ORB_COLORS, validateLevelStructure } from '../validate';

const BASELINE = ['white', 'yellow', 'gold', 'orange', 'red', 'coral', 'pink', 'magenta', 'purple', 'indigo',
  'blue', 'cyan', 'teal', 'green', 'lime', 'sand', 'brown', 'stone', 'forest', 'maroon', 'navy', 'seafoam',
  'slate', 'ivory', 'ice', 'amethyst', 'olive', 'umber', 'lavender', 'blush', 'bronze', 'ultramarine',
  'pine', 'mauve', 'garnet', 'verdigris', 'cerulean', 'graphite', 'sage', 'plum', 'rose', 'silver'];
const NEW = [
  { color: 'moss', fill: '#5F6418', rim: '#C4B464', glyph: 'sprout', char: 'q' },
  { color: 'ash', fill: '#7B786E', rim: '#B4B4A8', glyph: 'girder', char: 'd' },
] as const;

test('only moss and ash append after the exact previous 42 colors', () => {
  expect(ORB_COLOR_IDS).toEqual([...BASELINE, 'moss', 'ash']);
  for (const list of [ORB_COLORS, GAMEPLAY_COLORS, ORB_COLOR_ORDER, [...VALID_ORB_COLORS]]) {
    expect([...list]).toEqual([...ORB_COLOR_IDS]);
  }
  for (const map of [orbColors, orbGlow, orbLabel, COLOR_TO_CHAR]) expect(Object.keys(map)).toEqual([...ORB_COLOR_IDS]);
  expect(new Set(Object.values(COLOR_TO_CHAR)).size).toBe(44);
  expect(new Set(Object.values(orbColors)).size).toBe(44);
});

test.each(NEW)('$color locked material tokens and Studio character round trip', ({color,fill,rim,glyph,char}) => {
  expect(orbColors[color]).toBe(fill); expect(orbGlow[color]).toBe(rim);
  expect(orbLabel[color]).toBe(color.toUpperCase()); expect(COLOR_TO_CHAR[color]).toBe(char);
  expect(pixelMaterial(color)).toMatchObject({base:fill,rim});
  expect(markContrast(color).strategy).toBe('lightOnDark'); expect(colorMark(color).name).toBe(glyph);
  const def: LevelDefinition = { id:9844,title:`${color} round trip`,themeId:'moon-kingdom',difficulty:'hard',
    activeCapacity:5,holdingCapacity:3,ruleset:'coreV2',replacesLegacy:false,pixelArt:Array(4).fill(char.repeat(4)),
    legend:{[char]:color},tunnels:[[{color,capacity:16}],[],[]] };
  expect(validateLevelStructure(def).valid).toBe(true);
  const restored=toLevelDefinition(fromLevelDefinition(def));
  expect(createGame(restored).pixels.map(p=>p.color)).toEqual(Array(16).fill(color));
  expect(restored.legend?.[char]).toBe(color);
});

test.each(['full','compact','minimal'] as const)('sprout and girder preserve their distinct topology at %s detail', detail => {
  expect(new Set(ORB_COLOR_IDS.map(c=>colorMark(c).name)).size).toBe(44);
  expect(new Set(ORB_COLOR_IDS.map(c=>JSON.stringify(simplifiedMark(c,detail).parts))).size).toBe(44);
  expect(simplifiedMark('moss',detail).parts).toEqual([
    {p:'bar',angle:90,len:0.5,offset:[0,0.2]},
    {p:'bar',angle:45,len:0.5,offset:[-0.16,-0.16]},
    {p:'bar',angle:-45,len:0.5,offset:[0.16,-0.16]},
  ]);
  expect(simplifiedMark('ash',detail).parts).toEqual([
    {p:'bar',angle:0,len:0.8,offset:[0,-0.3]},
    {p:'bar',angle:0,len:0.8,offset:[0,0.3]},
    {p:'bar',angle:90,len:0.6},
  ]);
});

test.each(Array.from({length:40},(_,i)=>331+i))('level %i uses valid unique material, Studio and assist mappings', id => {
  const def=getLevel(id)!;const pixels=createGame(def).pixels;const used=[...new Set(pixels.map(p=>p.color))];
  if(id<351)expect(used).not.toContain('moss');if(id<361)expect(used).not.toContain('ash');
  if(used.includes('moss'))expect(def.legend?.q).toBe('moss');
  if(used.includes('ash'))expect(def.legend?.d).toBe('ash');
  for(const color of used) {
    expect(VALID_ORB_COLORS.has(color)).toBe(true);expect(COLOR_TO_CHAR[color]).toHaveLength(1);
    expect(orbColors[color]).toMatch(/^#[0-9A-F]{6}$/);expect(orbGlow[color]).toMatch(/^#[0-9A-F]{6}$/);
    if(id>=351)expect(pixels.filter(p=>p.color===color).length).toBeGreaterThanOrEqual(25);
  }
});

test('new colors are introduced as substantial readable fields', () => {
  const beetle=createGame(getLevel(351)!).pixels;
  const populations=ORB_COLOR_IDS.map(c=>beetle.filter(p=>p.color===c).length);
  const moss=beetle.filter(p=>p.color==='moss').length;
  expect(moss).toBeGreaterThanOrEqual(150);
  expect(moss).toBe(Math.max(...populations));
  expect(populations.filter(n=>n>0).length).toBeGreaterThanOrEqual(15);
  expect(createGame(getLevel(361)!).pixels.filter(p=>p.color==='ash').length).toBeGreaterThanOrEqual(300);
});

test('unknown colors reject in both artwork and tunnel definitions', () => {
  const def=getLevel(351)!;const bad='khaki' as OrbColor;
  expect(validateLevelStructure({...def,legend:{...def.legend,q:bad}}).valid).toBe(false);
  expect(validateLevelStructure({...def,tunnels:[[{color:bad,capacity:1}],[],[]]}).valid).toBe(false);
});
