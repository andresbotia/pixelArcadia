import { createGame } from '@/game/engine/createGame';
import { ORB_COLOR_IDS } from '@/game/engine/types';
import { getLevel } from '@/game/levels/levels';
import { COLOR_TO_CHAR } from '@/game/studio/grid';
import { colorMark, markContrast, simplifiedMark } from '@/theme/colorAssist';
import { orbColors, orbGlow } from '@/theme/colors';

test('M16A uses the original 41 colours after the silver append', () => {
  expect(ORB_COLOR_IDS).toHaveLength(42);
  expect(ORB_COLOR_IDS.slice(0, 41)).not.toContain('silver');
  expect(ORB_COLOR_IDS).not.toContain('terracotta');
  expect(ORB_COLOR_IDS).not.toContain('petrol');
});

test.each(Array.from({ length: 40 }, (_, i) => i + 251))('level %i preserves direct colour, Studio and distinct minimal assist mappings', id => {
  const used = [...new Set(createGame(getLevel(id)!).pixels.map(p => p.color))];
  for (const color of used) {
    expect(ORB_COLOR_IDS.slice(0, 41)).toContain(color);
    expect(orbColors[color]).toMatch(/^#[0-9A-F]{6}$/);
    expect(orbGlow[color]).toMatch(/^#[0-9A-F]{6}$/);
    expect(COLOR_TO_CHAR[color]).toHaveLength(1);
    expect(colorMark(color).color).toBe(color);
    expect(markContrast(color).fill).toMatch(/^#/);
  }
  const minimal = used.map(c => JSON.stringify(simplifiedMark(c, 'minimal').parts));
  expect(new Set(minimal).size).toBe(used.length);
});

test('validated light regions stay filled rather than near-black void', () => {
  for (const [id, x, y] of [[254, 25, 27], [262, 35, 8], [270, 24, 12], [290, 41, 18]]) {
    const cell = createGame(getLevel(id!)!).pixels.find(p => p.x === x && p.y === y);
    expect(cell).toBeDefined();
  }
});
