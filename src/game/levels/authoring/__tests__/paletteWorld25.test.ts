import { createGame } from '@/game/engine/createGame';
import { ORB_COLOR_IDS, type OrbColor } from '@/game/engine/types';
import { getLevel } from '@/game/levels/levels';
import { COLOR_TO_CHAR } from '@/game/studio/grid';
import { colorMark, markContrast, simplifiedMark } from '@/theme/colorAssist';
import { orbColors, orbGlow } from '@/theme/colors';
import { validateLevelStructure } from '../validate';

// World 25 adds no colour: it must run entirely on the 41-colour registry (39 + plum/rose).
const W25 = Array.from({ length: 10 }, (_, i) => 241 + i);

test('the registry stays at 41 colours after World 25', () => {
  expect(ORB_COLOR_IDS).toHaveLength(41);
  expect(ORB_COLOR_IDS.slice(39)).toEqual(['plum', 'rose']);
});

test.each(W25)('level %i uses only registered colours, each with a fill, rim, Studio char and assist mark', id => {
  const def = getLevel(id)!;
  expect(validateLevelStructure(def).valid).toBe(true);
  const used = [...new Set(createGame(def).pixels.map(p => p.color))] as OrbColor[];
  expect(used.length).toBeGreaterThanOrEqual(18);
  for (const c of used) {
    expect(ORB_COLOR_IDS).toContain(c);
    expect(orbColors[c]).toMatch(/^#[0-9A-F]{6}$/);
    expect(orbGlow[c]).toMatch(/^#[0-9A-F]{6}$/);
    expect(COLOR_TO_CHAR[c]).toHaveLength(1);
    expect(colorMark(c).color).toBe(c);
    expect(markContrast(c).fill).toMatch(/^#/);
  }
  // Every used colour keeps a distinct minimal-detail mark on the same board.
  const shapes = used.map(c => JSON.stringify(simplifiedMark(c, 'minimal').parts));
  expect(new Set(shapes).size).toBe(used.length);
});

test('Level 250 exercises the documented close pairs and they stay mark-distinct', () => {
  const used = new Set(createGame(getLevel(250)!).pixels.map(p => p.color));
  const pairs: [OrbColor, OrbColor][] = [['rose', 'maroon'], ['graphite', 'slate'], ['graphite', 'navy'], ['plum', 'navy'], ['bronze', 'brown'], ['purple', 'plum']];
  for (const [a, b] of pairs) {
    if (used.has(a) && used.has(b)) {
      expect(simplifiedMark(a, 'minimal').parts).not.toEqual(simplifiedMark(b, 'minimal').parts);
    }
  }
});
