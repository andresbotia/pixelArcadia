/** Offline geometry-aware queue author. Never imported by the runtime. */
import fs from 'fs';
import { createGame } from '../src/game/engine/createGame';
import { resolveEpochLaunch } from '../src/game/engine/epoch';
import { applyActionWithArrivals } from '../src/game/engine/holdingArrival';
import type { ChargeSpec, GameState, LevelDefinition, OrbColor } from '../src/game/engine/types';
import { replayAuthoredWitness } from '../src/game/levels/authoring/witness';
import { validateLevelStructure } from '../src/game/levels/authoring/validate';

interface Draft { id: number; title: string; grid: string[]; legend: Record<string, OrbColor> }
const themes = ['desert-kingdoms', 'deep-jungle', 'underworld', 'ocean-cities'];
const names = ['Desert Kingdoms', 'Deep Jungle', 'Underworld', 'Ocean Cities'];
function hits(state: GameState, color: OrbColor, capacity: number): number {
  return resolveEpochLaunch(state, { chargeId: 'probe', source: 'tunnel', originId: 'tunnel-0',
    color, capacity, insertionTime: 0, launchSequence: state.movesApplied }).charge.encounters.length;
}
function author(draft: Draft, variant: number): LevelDefinition {
  const breather = draft.id % 10 === 5;
  const def: LevelDefinition = { id: draft.id, title: draft.title, themeId: themes[Math.floor((draft.id - 251) / 10)]!,
    difficulty: breather || draft.id === 251 ? 'hard' : 'super-hard', holdingCapacity: 3, activeCapacity: 5,
    ruleset: 'coreV2', replacesLegacy: false, pixelArt: draft.grid, legend: draft.legend, tunnels: [[], [], []] };
  let state = createGame(def);
  const budget = new Map<OrbColor, number>();
  for (const p of state.pixels) budget.set(p.color, (budget.get(p.color) ?? 0) + 1);
  const witness: string[] = [];
  const born = new Map<string, number>();
  let bridges = 0;
  for (let step = 0; step < 180 && state.pixels.some(p => !p.cleared); step++) {
    const held = state.holding.map((c, i) => ({ i, c, hits: hits(state, c.color, c.capacity), age: step - born.get(c.id)! }))
      .filter(c => c.hits > 0).sort((a,b) => b.hits - a.hits);
    // Relaunch when the later front has opened, giving other colours time to expose value.
    const ready = held.find(h => h.hits === h.c.capacity && h.age >= (breather ? 2 : 3));
    let move: string;
    if (ready || (state.holding.length >= (breather ? 2 : 3) && held.length) || [...budget.values()].every(n => n === 0)) {
      const h = ready ?? held[0];
      if (!h) throw new Error(`No productive relaunch ${draft.id}/${step}`);
      move = `H${h.i + 1}`;
      const out = applyActionWithArrivals(state, { kind: 'holding', id: h.c.id });
      if (!out.accepted) throw new Error('Held author failure');
      state = out.state.status === 'lost' ? { ...out.state, status: 'playing' } : out.state;
    } else {
      const candidates = [...budget].filter(([,n]) => n > 0)
        .map(([color,n]) => ({ color, n, hits: hits(state, color, n) })).filter(c => c.hits > 0);
      // High immediate exposure avoids cleanup grind. Equal front values use stable varied route choices.
      candidates.sort((a,b) => b.hits - a.hits || a.color.localeCompare(b.color));
      if ((variant === 4 || variant === 5) && candidates.length) {
        const scored = candidates.slice(0, 6).map(candidate => {
          const after = resolveEpochLaunch(state, { chargeId: 'lookahead', source: 'tunnel', originId: 'tunnel-0',
            color: candidate.color, capacity: candidate.hits, insertionTime: 0, launchSequence: step }).pixels;
          const future = { ...state, pixels: after };
          const exposure = [...budget].filter(([, n]) => n > 0).map(([color,n]) => hits(future, color, n));
          return { candidate, score: candidate.hits + exposure.reduce((a,b) => a+b,0) * (variant === 4 ? .35 : .8) };
        }).sort((a,b) => b.score - a.score);
        candidates.splice(0, 1, scored[0]!.candidate);
      }
      if (variant >= 6) candidates.sort((a,b) =>
        (variant === 6 ? b.hits*b.hits/b.n-a.hits*a.hits/a.n : b.hits+(variant===7?50:variant===8?100:200)*b.hits/b.n-a.hits-(variant===7?50:variant===8?100:200)*a.hits/a.n));
      const c = candidates[0];
      if (!c) {
        const h = held[0];
        if (!h) throw new Error(`No productive front ${draft.id}/${step}`);
        const out = applyActionWithArrivals(state, { kind: 'holding', id: h.c.id });
        if (!out.accepted) throw new Error('Blocked relaunch');
        state = out.state.status === 'lost' ? { ...out.state, status: 'playing' } : out.state;
        witness.push(`H${h.i + 1}`);
        continue;
      }
      let capacity = c.hits;
      const maxHolding = breather ? 2 : 3;
      // Reserve a later region only when this visible front already supplies substantial value.
      // Capacity beyond the first pass is tied to actual remaining same-colour pixels.
      if (state.holding.length < maxHolding && c.n > c.hits + 5 && c.hits >= 6
        && bridges < (breather ? 4 : draft.id % 10 === 0 ? 12 : 9)
        && step % (breather ? 7 : 4) === variant % (breather ? 7 : 4)) {
        const next = resolveEpochLaunch(state, { chargeId: 'next', source: 'tunnel', originId: 'tunnel-0',
          color: c.color, capacity: c.hits, insertionTime: 0, launchSequence: state.movesApplied }).pixels;
        const later = hits({ ...state, pixels: next }, c.color, c.n - c.hits);
        if (later >= 6) {
          capacity += Math.min(later, c.n - c.hits, breather ? 22 : 34);
          bridges++;
        }
      }
      // Distribute the exact route across three queues; the board dictates each colour/capacity.
      const ti = (step + variant + Math.floor(step / 5)) % 3;
      const spec: ChargeSpec = { color: c.color, capacity };
      const id = `L${draft.id}-t${ti}-c${def.tunnels[ti]!.length}`;
      def.tunnels[ti]!.push(spec); born.set(id, step);
      budget.set(c.color, c.n - capacity);
      state = { ...state, status: 'playing', tunnels: state.tunnels.map((t,i) => i === ti ? { ...t, queue: [{ id, ...spec }] } : t) };
      const out = applyActionWithArrivals(state, { kind: 'tunnel', id: state.tunnels[ti]!.id });
      if (!out.accepted) throw new Error('Tunnel author failure');
      state = out.state;
      // During construction, future queues have not yet been written. Only the immutable
      // completed definition is certified; transient construction deadlock is not evidence.
      if (state.status === 'lost') state = { ...state, status: 'playing' };
      move = `T${ti + 1}`;
    }
    witness.push(move);
  }
  def.winningWitness = witness;
  const proof = replayAuthoredWitness(def);
  if (!proof.valid || !validateLevelStructure(def).valid) throw new Error(`${draft.id} failed: ${JSON.stringify(proof)}`);
  return def;
}
const drafts = JSON.parse(fs.readFileSync('dist/m16a/art.json', 'utf8')) as Draft[];
const all: LevelDefinition[] = [];
const only = Number(process.argv.find(a => a.startsWith('--only='))?.split('=')[1] ?? 0);
for (const draft of drafts) {
  if (only && draft.id !== only) continue;
  const cacheFile = `dist/m16a/queue-${draft.id}.json`;
  const cached = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) as LevelDefinition : null;
  const variants = cached && JSON.stringify(cached.pixelArt) === JSON.stringify(draft.grid)
    ? (process.argv.includes('--market') && draft.id===287
      ? [cached, author(draft,6),author(draft,7),author(draft,8),author(draft,9)] : [cached]) : [draft.id % 4, 4, 5].map(v => author(draft, v));
  const def = variants.sort((a,b) => a.winningWitness!.length - b.winningWitness!.length)[0]!;
  fs.writeFileSync(cacheFile, JSON.stringify(def));
  all.push(def);
  console.log(draft.id, def.tunnels.flat().length, def.winningWitness!.length,
    def.winningWitness!.filter(s => s[0] === 'H').length, 'relaunches');
}
for (let w = 26; w <= 29 && !process.argv.includes('--market'); w++) {
  const authored = all.filter(l => Math.floor((l.id - 1) / 10) + 1 === w);
  if (!authored.length) continue;
  const existing = only ? JSON.parse(fs.readFileSync(`content/levels/world-${w}.json`, 'utf8')).levels as LevelDefinition[] : [];
  const levels = only ? existing.map(l => authored.find(a => a.id === l.id) ?? l) : authored;
  fs.writeFileSync(`content/levels/world-${w}.json`, JSON.stringify({ world: w, worldTitle: names[w-26],
    themeId: themes[w-26], replacesLegacy: false, authoringOnly: true, levels }, null, 2) + '\n');
}
