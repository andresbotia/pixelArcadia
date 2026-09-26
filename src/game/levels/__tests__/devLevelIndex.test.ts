import { createGame } from '../../engine/createGame';
import { devLevelIndex, devNeighbours, filterDevLevels } from '../devLevelIndex';
import { CAMPAIGN_MANIFEST } from '../campaign';
import { LEVEL_DEFINITIONS } from '../levels';

describe('dev Level Browser index', () => {
  const rows = devLevelIndex();

  it('lists every authored level, in level order', () => {
    expect(rows.map((r) => r.id)).toEqual(LEVEL_DEFINITIONS.map((l) => l.id));
  });

  it('derives board metadata from the runtime definitions', () => {
    for (const level of LEVEL_DEFINITIONS) {
      const row = rows.find((r) => r.id === level.id)!;
      const game = createGame(level);
      expect(row.title).toBe(level.title);
      expect(row.difficulty).toBe(level.difficulty);
      expect(row.width).toBe(game.width);
      expect(row.height).toBe(game.height);
      expect(row.pixels).toBe(game.pixels.length);
      expect(row.colors).toBe(new Set(game.pixels.map((p) => p.color)).size);
      expect(row.pals).toBe(level.tunnels.flat().length);
      expect(row.witness).toBe(level.winningWitness?.length);
    }
  });

  it('assigns worlds from the campaign manifest', () => {
    CAMPAIGN_MANIFEST.worlds.forEach((world, i) => {
      for (const id of world.levelIds) {
        const row = rows.find((r) => r.id === id)!;
        expect(row.world).toBe(i + 1);
        expect(row.worldTitle).toBe(world.title);
      }
    });
  });

  it('filters by world, difficulty, level number and title', () => {
    const w1 = filterDevLevels(rows, { world: 1, difficulty: 'all', query: '' });
    expect(w1.map((r) => r.id)).toEqual(CAMPAIGN_MANIFEST.worlds[0]!.levelIds);
    const easy = filterDevLevels(rows, { world: 0, difficulty: 'easy', query: '' });
    expect(easy.every((r) => r.difficulty === 'easy')).toBe(true);
    expect(filterDevLevels(rows, { world: 0, difficulty: 'all', query: '20' }).map((r) => r.id)).toContain(20);
    const title = rows[0]!.title;
    expect(filterDevLevels(rows, { world: 0, difficulty: 'all', query: title.toUpperCase() }).map((r) => r.id)).toContain(rows[0]!.id);
  });

  it('Previous / Next walk authored levels and stop at the ends', () => {
    const first = LEVEL_DEFINITIONS[0]!.id;
    const last = LEVEL_DEFINITIONS[LEVEL_DEFINITIONS.length - 1]!.id;
    expect(devNeighbours(first).prev).toBeUndefined();
    expect(devNeighbours(last).next).toBeUndefined();
    expect(devNeighbours(19)).toEqual({ prev: 18, next: 20 });
    expect(devNeighbours(20).next).toBe(21);
    expect(devNeighbours(-5)).toEqual({});
  });
});
