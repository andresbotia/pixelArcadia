/** Replay the nine M16G unknown alternatives to exact clean Level 500 wins. */
import fs from 'fs';
import { loadAuthoredFile } from '../src/game/levels/authoring/loader';
import { createGame } from '../src/game/engine/createGame';
import { applyActionWithArrivals } from '../src/game/engine/holdingArrival';
import { launchCandidate, type GameAction } from '../src/game/engine/actions';
import { getLevel } from '../src/game/levels/levels';

interface RecoveryCase {
  step: number;
  charge: string;
  secondCharge: string | null;
  searchNodes: number;
  actions: GameAction[];
}

const definition = loadAuthoredFile('content/levels/world-50.json').levels.find(level => level.id === 500)!;
const stored = JSON.parse(fs.readFileSync('docs/audits/M17A_LEVEL500_RECOVERY_WITNESSES.json', 'utf8')) as {
  level: number; recoveryWitnesses: RecoveryCase[];
};
const failures: string[] = [];
if (JSON.stringify(definition) !== JSON.stringify(getLevel(500))) failures.push('source/compiled Level 500 mismatch');
if (stored.level !== 500 || stored.recoveryWitnesses.length !== 9) failures.push('wrong recovery case count');
const remaining = (state: ReturnType<typeof createGame>) => state.pixels.filter(pixel => !pixel.cleared).length;
const cases = stored.recoveryWitnesses.map(entry => {
  let state = createGame(definition);
  let rejected = 0;
  for (const [index, slot] of definition.winningWitness!.entries()) {
    if (index >= entry.step - 1) break;
    const n = Number(slot.slice(1)) - 1;
    const action: GameAction = slot[0] === 'T'
      ? { kind: 'tunnel', id: state.tunnels[n]!.id }
      : { kind: 'holding', id: state.holding[n]!.id };
    const result = applyActionWithArrivals(state, action);
    if (!result.accepted) rejected++;
    state = result.state;
  }
  const first = launchCandidate(state, entry.actions[0]!);
  if (first?.id !== entry.charge) failures.push(`${entry.step}/${entry.charge}: first charge mismatch`);
  let second: string | undefined;
  for (const [index, action] of entry.actions.entries()) {
    if (index === 1) second = launchCandidate(state, action)?.id;
    const before = remaining(state);
    const result = applyActionWithArrivals(state, action);
    if (!result.accepted) rejected++;
    if (result.state.status === 'lost' || remaining(result.state) >= before) {
      failures.push(`${entry.step}/${entry.charge}: unproductive or fatal action ${index + 1}`);
      break;
    }
    state = result.state;
  }
  if (entry.secondCharge && second !== entry.secondCharge) failures.push(`${entry.step}: second charge mismatch`);
  const clean = state.status === 'won' && remaining(state) === 0 && state.holding.length === 0
    && state.pendingHolding.length === 0 && state.tunnels.every(tunnel => tunnel.queue.length === 0)
    && rejected === 0;
  if (!clean) failures.push(`${entry.step}/${entry.charge}: no exact clean win`);
  return {
    firstStep: entry.step,
    firstCharge: entry.charge,
    secondCharge: entry.secondCharge,
    result: clean ? 'RECOVERABLE' : 'FAILED',
    recoveryActions: entry.actions.length,
    searchNodes: entry.searchNodes,
    pixelsRemaining: remaining(state),
    holdingRemaining: state.holding.length,
    pendingRemaining: state.pendingHolding.length,
    tunnelsRemaining: state.tunnels.reduce((sum, tunnel) => sum + tunnel.queue.length, 0),
    rejected,
  };
});
const singles = cases.filter(entry => entry.secondCharge === null);
const doubles = cases.filter(entry => entry.secondCharge !== null);
if (singles.length !== 8 || doubles.length !== 1) failures.push('wrong single/double case split');
const result = {
  level: 500,
  baseline: 'M16G 553 single and 28 double alternatives',
  singles: { tested: 553, recoverable: 527 + singles.filter(entry => entry.result === 'RECOVERABLE').length, fatal: 18, unknown: failures.length ? 8 : 0 },
  doubles: { tested: 28, recoverable: 22 + doubles.filter(entry => entry.result === 'RECOVERABLE').length, fatal: 5, unknown: failures.length ? 1 : 0 },
  recoveredCases: cases,
  failures,
};
fs.writeFileSync('docs/audits/M17A_LEVEL500_FAIRNESS_CERTIFICATE.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
