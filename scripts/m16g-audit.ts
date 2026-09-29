/** Offline certificates and diagnostics, all through production actions. */
import fs from 'fs';
import { legalActions, launchCandidate, type GameAction } from '../src/game/engine/actions';
import { createGame } from '../src/game/engine/createGame';
import { resolveEpochLaunch } from '../src/game/engine/epoch';
import { applyActionWithArrivals } from '../src/game/engine/holdingArrival';
import { findFirstWinningWitness, stateKey } from '../src/game/engine/solver';
import type { GameState, LevelDefinition } from '../src/game/engine/types';
import { loadAuthoredFile } from '../src/game/levels/authoring/loader';
import { validateLevelPacket } from '../src/game/levels/authoring/validate';
import { replayAuthoredWitness } from '../src/game/levels/authoring/witness';

const defs = [50].flatMap(w => loadAuthoredFile(`content/levels/world-${w}.json`).levels);
const remaining = (s: GameState) => s.pixels.reduce((n,p) => n + Number(!p.cleared),0);
function actionFor(s: GameState, slot: string): GameAction {
  const i = Number(slot.slice(1))-1;
  return slot[0] === 'T' ? { kind: 'tunnel', id: s.tunnels[i]!.id } : { kind: 'holding', id: s.holding[i]!.id };
}
function clean(s: GameState) {
  return s.status === 'won' && remaining(s) === 0 && s.holding.length === 0
    && s.pendingHolding.length === 0 && s.tunnels.every(t => t.queue.length === 0);
}
function trace(def: LevelDefinition) {
  let s = createGame(def), peak = 0, full = 0, zero = 0, rejected = 0;
  const starts: GameState[] = [];
  const steps: { action: GameAction; chargeId: string; color: string; capacity: number; hits: number }[] = [];
  const launches = new Map<string, { steps: number[]; hits: number[] }>();
  for (const [i,slot] of def.winningWitness!.entries()) {
    starts.push(s);
    const action = actionFor(s,slot), charge = launchCandidate(s,action)!;
    const out = applyActionWithArrivals(s,action);
    const hits = remaining(s)-remaining(out.state);
    zero += Number(hits === 0); rejected += Number(!out.accepted);
    const history = launches.get(charge.id) ?? { steps: [], hits: [] };
    history.steps.push(i+1); history.hits.push(hits); launches.set(charge.id,history);
    steps.push({ action, chargeId: charge.id, color: charge.color, capacity: charge.capacity, hits });
    s = out.state; peak = Math.max(peak,s.holding.length); full += Number(s.holding.length === 3);
  }
  const pals = [...launches.values()];
  const bridges = pals.filter(p => p.hits[0]! >= 6 && p.steps.slice(1).some((step,i) => step-p.steps[0]! >= 3 && p.hits[i+1]! >= 6)).length;
  return { starts, steps, metrics: { id: def.id, dimensions: '48×48', pixels: createGame(def).pixels.length,
    occupancy: createGame(def).pixels.length / 2304 * 100, colors: new Set(createGame(def).pixels.map(p => p.color)).size,
    pals: def.tunnels.flat().length, witness: steps.length, relaunches: steps.filter(s => s.action.kind === 'holding').length,
    bridges, peakHolding: peak, holdingFullStates: full, smallPals: def.tunnels.flat().filter(c => c.capacity <= 2).length,
    zeroHits: zero, rejected, items: 0, clean: clean(s) } };
}
function options(s: GameState) {
  return legalActions(s).map(action => {
    const out = applyActionWithArrivals(s,action);
    const charge = launchCandidate(s,action)!;
    return { action, state: out.state, hits: remaining(s)-remaining(out.state), drained: out.heldCharge === null,
      capacity: charge.capacity, accepted: out.accepted };
  });
}
function bot(initial: GameState, policy: string) {
  let s=initial, rr=0, previous=''; const seen=new Set<string>();
  for (let step=0;step<400 && s.status==='playing';step++) {
    const key = `${remaining(s)}:${s.tunnels.map(t=>t.queue.length)}:${s.holding.map(c=>c.id+'='+c.capacity)}:${s.pendingHolding.map(c=>c.charge.id)}`;
    if (seen.has(key)) return { outcome:'deadlocked', steps:step }; seen.add(key);
    const candidates=options(s); if (!candidates.length) return { outcome:'deadlocked',steps:step };
    let choice;
    if (policy==='round-robin') {
      choice=candidates.find(c=>c.action.kind==='tunnel' && c.action.id===s.tunnels[rr%3]!.id);
      if (!choice) choice=candidates.find(c=>c.action.kind==='tunnel') ?? candidates.find(c=>c.hits>0);
      rr++;
    } else if (policy==='drain') {
      choice=candidates.find(c=>c.action.kind==='tunnel' && c.action.id===previous)
        ?? candidates.find(c=>c.action.kind==='tunnel') ?? candidates.find(c=>c.hits>0);
    } else {
      let pool=candidates;
      if (policy==='holding-first') {
        const held=pool.filter(c=>c.action.kind==='holding' && c.hits>0);
        if (held.length) pool=held;
      }
      if (policy==='noWaste') {
        const drains=pool.filter(c=>c.drained && c.hits>0);
        if (drains.length) pool=drains;
      }
      choice=pool.sort((a,b)=>b.hits-a.hits)[0];
    }
    if (!choice) return { outcome:'deadlocked',steps:step };
    previous=choice.action.id; s=choice.state;
  }
  return { outcome:clean(s)?'won':s.status==='lost'?'lost':'step-cap', steps:s.movesApplied-initial.movesApplied };
}
function repair(initial: GameState, intended: ReturnType<typeof trace>['steps']) {
  let s=initial;
  for (let i=0;i<240 && s.status==='playing';i++) {
    const choices=options(s).filter(c=>c.hits>0 && c.state.status!=='lost');
    choices.sort((a,b)=>{
      const rank=(action:GameAction)=> {
        const id=launchCandidate(s,action)!.id;
        const j=intended.findIndex(x=>x.chargeId===id && x.action.kind===action.kind);
        return j<0?10000:j;
      };
      return rank(a.action)-rank(b.action) || b.hits-a.hits;
    });
    if (!choices.length) break;
    s=choices[0]!.state;
  }
  if (clean(s)) return 'RECOVERED';
  if (bot(initial,'holding-first').outcome==='won' || bot(initial,'greedy').outcome==='won') return 'RECOVERED';
  if(initial.status==='lost') return 'IMMEDIATE_LOSS';
  // A small diagnostic recovery search does not change the campaign solver caps.
  const visited=new Set<string>();const deadline=performance.now()+30000;let nodes=0,truncated=false;
  function recover(current:GameState):boolean {
    if(clean(current)) return true;
    if(current.status!=='playing') return false;
    if(++nodes>100000 || performance.now()>deadline) {truncated=true;return false;}
    const key=stateKey(current);if(visited.has(key)) return false;visited.add(key);
    const candidates=options(current).filter(c=>c.accepted && c.state.status!=='lost')
      .sort((a,b)=>Number(b.hits>0)-Number(a.hits>0) || Number(b.drained)-Number(a.drained) || b.hits-a.hits);
    return candidates.some(c=>recover(c.state));
  }
  return recover(initial)?'RECOVERED':truncated?'INCONCLUSIVE':'FATAL';
}
function deviations(def:LevelDefinition,t:ReturnType<typeof trace>) {
  const cases: { kind:string; step:number; alternatives:GameAction[] }[]=[];
  const actual=t.steps[0]!.action;
  cases.push({kind:'alternative openings',step:0,alternatives:legalActions(t.starts[0]!).filter(a=>a.id!==actual.id)});
  for (const kind of ['premature high-capacity launch','skipped productive Holding relaunch','bridge timing mistake','obvious route fork']) {
    const index=t.starts.findIndex((s,i)=> {
      const fraction = kind.includes('high-capacity') ? 0.10 : kind.includes('Holding') ? 0.25 : kind.includes('bridge') ? 0.40 : 0.55;
      if (i < Math.max(3, Math.floor(t.steps.length * fraction)) || i > t.steps.length * 0.85) return false;
      if (kind.includes('Holding')) return t.steps[i]!.action.kind==='holding' && options(s).some(c=>c.action.kind==='tunnel' && c.hits>0);
      if (kind.includes('bridge')) return s.holding.length>=2 && t.steps[i]!.action.kind==='holding';
      return options(s).some(c=>c.action.id!==t.steps[i]!.action.id && c.action.kind==='tunnel'
        && (kind.includes('high-capacity')?c.capacity>=24:c.hits>=6));
    });
    if (index<0) { cases.push({kind,step:-1,alternatives:[]}); continue; }
    const s=t.starts[index]!;
    const alternatives=options(s).filter(c=>c.action.id!==t.steps[index]!.action.id
      && (kind.includes('high-capacity')?c.action.kind==='tunnel' && c.capacity>=24:
        kind.includes('Holding') || kind.includes('bridge')?c.action.kind==='tunnel':c.hits>=6))
      .sort((a,b)=>b.capacity-a.capacity).slice(0,2).map(c=>c.action);
    cases.push({kind,step:index,alternatives});
  }
  if (def.id === 500) {
    for (const fraction of [0.35, 0.65, 0.75]) {
      const start = Math.floor(t.steps.length * fraction);
      const index = t.starts.findIndex((state, i) => i >= start && i <= start + 8
        && options(state).some(option => option.hits >= 6 && option.action.id !== t.steps[i]!.action.id));
      if (index >= 0) {
        const alternatives = options(t.starts[index]!).filter(option => option.hits >= 6
          && option.action.id !== t.steps[index]!.action.id).sort((a,b) => b.hits-a.hits).slice(0,2).map(option => option.action);
        cases.push({kind:'milestone later route fork',step:index,alternatives});
      }
    }
  }
  return cases.flatMap(c=>c.alternatives.length?c.alternatives.map(action=> {
    const s=t.starts[c.step]!, out=applyActionWithArrivals(s,action);
    return { kind:c.kind,step:c.step+1,action,charge:launchCandidate(s,action),hits:remaining(s)-remaining(out.state),
      result:repair(out.state,t.steps.slice(c.step)), beforePending:s.pendingHolding.length, beforeHolding:s.holding.length, pending:out.state.pendingHolding.length, holding:out.state.holding.length };
  }):[{kind:c.kind,step:c.step,result:'NO_MATCHING_STATE'}]);
}
function tinyAudit(def:LevelDefinition,t:ReturnType<typeof trace>) {
  return def.tunnels.flatMap((queue,ti)=>queue.flatMap((pal,qi)=> {
    if (pal.capacity>2) return [];
    const id=`L${def.id}-t${ti}-c${qi}`, step=t.steps.findIndex(s=>s.chargeId===id);
    const before=t.starts[step]!;
    const colorRemaining=before.pixels.filter(p=>!p.cleared && p.color===pal.color).length;
    const exposed=resolveEpochLaunch(before,{chargeId:'tiny-front',source:'tunnel',originId:before.tunnels[ti]!.id,
      color:pal.color,capacity:colorRemaining,insertionTime:0,launchSequence:before.movesApplied}).charge.encounters.length;
    return [{tunnel:ti+1,position:qi+1,color:pal.color,capacity:pal.capacity,step:step+1,
      classification: exposed<=2?'NECESSARY':'SUSPICIOUS', exposedFront:exposed,
      reason:exposed<=2?'Production probe with the entire remaining colour budget confirms this route window exposes at most two hits. No tested safe same-colour merge survived productive replay and breather relief constraints; necessity is local to this witness window.':'More than two matching targets are exposed, but capacity is allocated to other Pals. Same-colour merges in all tunnels failed replay or breather constraints; retain as SUSPICIOUS.'}];
  }));
}
// Every adjacent same-colour pair is a candidate, including larger Pals. Removing one
// launch becomes a larger launch or productive relaunch; retain exact wins and breather relief.
function mergeTrial(def:LevelDefinition,ti:number,qi:number,qj:number,tj=ti) {
  const original=trace(def),trial=structuredClone(def);
  trial.tunnels[ti]![qi]!.capacity+=trial.tunnels[tj]![qj]!.capacity;
  trial.tunnels[tj]!.splice(qj,1);
  let state=createGame(trial);const moves:string[]=[];
  const oldLate=`L${def.id}-t${tj}-c${qj}`,oldEarly=`L${def.id}-t${ti}-c${qi}`;
  for(const step of original.steps) {
    let id=step.chargeId;
    if(id===oldLate) id=oldEarly;
    else if(id.startsWith(`L${def.id}-t${tj}-c`)) {
      const index=Number(id.split('-c')[1]);
      if(index>qj) id=`L${def.id}-t${tj}-c${index-1}`;
      else if(tj===ti && index===qi && qi>qj) id=`L${def.id}-t${ti}-c${index-1}`;
    }
    const tunnel=state.tunnels.findIndex(t=>t.queue[0]?.id===id);
    const held=state.holding.findIndex(c=>c.id===id);
    if(tunnel<0 && held<0) continue; // Earlier larger pass already exhausted this Pal.
    const action:GameAction=tunnel>=0?{kind:'tunnel',id:state.tunnels[tunnel]!.id}:{kind:'holding',id};
    const out=applyActionWithArrivals(state,action);
    if(!out.accepted || out.state.status==='lost' || remaining(state)===remaining(out.state)) return null;
    moves.push(tunnel>=0?`T${tunnel+1}`:`H${held+1}`);state=out.state;
    if(def.id%10===5 && state.holding.length>2) return null;
  }
  if (def.id % 10 === 5 && moves.filter(m => m[0] === 'H').length > 12) return null;
  trial.winningWitness=moves;
  return replayAuthoredWitness(trial).valid?trial:null;
}
function merge(def:LevelDefinition) {
  const merges:{tunnel:number;position:number;laterPosition:number;color:string;capacities:number[]}[]=[];
  let changed=true;
  while(changed) {
    changed=false;
    for(let ti=0;ti<3 && !changed;ti++) {
      const q=def.tunnels[ti]!;
      for(let qi=0;qi<q.length-1 && !changed;qi++) for(let qj=qi+1;qj<q.length;qj++) {
        if(q[qi]!.color!==q[qj]!.color || (qj!==qi+1 && q[qi]!.capacity>2 && q[qj]!.capacity>2)) continue;
        const trial=mergeTrial(def,ti,qi,qj);
        if(trial) {
          merges.push({tunnel:ti+1,position:qi+1,laterPosition:qj+1,color:q[qi]!.color,capacities:[q[qi]!.capacity,q[qj]!.capacity]});
          Object.assign(def,trial);changed=true;break;
        }
      }
    }
  }
  return merges;
}
function crossMerge(def:LevelDefinition) {
  const history:{earlyTunnel:number;earlyPosition:number;lateTunnel:number;latePosition:number;color:string;capacities:number[]}[]=[];
  let changed=true;
  while(changed) {
    changed=false;
    const t=trace(def);
    for(let tj=0;tj<3 && !changed;tj++) {
      const lateQueue=def.tunnels[tj]!;
      for(let qj=0;qj<lateQueue.length && !changed;qj++) {
        const late=lateQueue[qj]!;if(late.capacity>2) continue;
        const lateStep=t.steps.findIndex(s=>s.chargeId===`L${def.id}-t${tj}-c${qj}`);
        for(let ti=0;ti<3 && !changed;ti++) for(let qi=def.tunnels[ti]!.length-1;qi>=0;qi--) {
          if(ti===tj) continue;
          const early=def.tunnels[ti]![qi]!;
          if(early.color!==late.color) continue;
          const earlyStep=t.steps.findIndex(s=>s.chargeId===`L${def.id}-t${ti}-c${qi}`);
          if(earlyStep>=lateStep) continue;
          const trial=mergeTrial(def,ti,qi,qj,tj);
          if(trial) {
            history.push({earlyTunnel:ti+1,earlyPosition:qi+1,lateTunnel:tj+1,latePosition:qj+1,color:early.color,capacities:[early.capacity,late.capacity]});
            Object.assign(def,trial);changed=true;break;
          }
        }
      }
    }
  }
  return history;
}
function tally(cases:{result:string}[]) {
  return {tested:cases.length,recoverable:cases.filter(c=>c.result==='RECOVERED').length,
    fatal:cases.filter(c=>c.result==='IMMEDIATE_LOSS'||c.result==='FATAL').length,
    unknown:cases.filter(c=>c.result!=='RECOVERED' && c.result!=='IMMEDIATE_LOSS' && c.result!=='FATAL').length};
}
const mode=process.argv[2] ?? 'audit';
if(mode==='resolve-unknown') {
  const def=defs.find(d=>d.id===500)!;
  const t=trace(def);
  const result=JSON.parse(fs.readFileSync('dist/m16g/deep-fairness.json','utf8')) as {
    single:{cases:{step:number;kind:string;charge:string;result:string}[]};
    double:{cases:{firstStep:number;firstCharge:string;secondCharge:string;result:string}[]};
  };
  for (const c of result.single.cases.filter(c=>c.result==='INCONCLUSIVE')) {
    const i=c.step-1,s=t.starts[i]!;
    const a=options(s).find(o=>o.action.kind===c.kind && launchCandidate(s,o.action)?.id===c.charge)!;
    c.result=repair(a.state,t.steps.slice(i));console.log('single',c.step,c.charge,c.result);
  }
  for (const c of result.double.cases.filter(c=>c.result==='INCONCLUSIVE')) {
    const i=c.firstStep-1,s=t.starts[i]!;
    const a=options(s).find(o=>launchCandidate(s,o.action)?.id===c.firstCharge)!;
    const b=options(a.state).find(o=>launchCandidate(a.state,o.action)?.id===c.secondCharge)!;
    c.result=repair(b.state,t.steps.slice(i));console.log('double',c.firstStep,c.firstCharge,c.secondCharge,c.result);
  }
  const output={single:{...tally(result.single.cases),cases:result.single.cases},
    double:{...tally(result.double.cases),cases:result.double.cases}};
  fs.writeFileSync('dist/m16g/deep-fairness.json',JSON.stringify(output,null,2)+'\n');
  console.log(JSON.stringify({single:tally(output.single.cases),double:tally(output.double.cases)}));
} else if(mode==='deep') {
  const def=defs.find(d=>d.id===500)!;
  const t=trace(def);
  const singles: {step:number;kind:string;charge:string;hits:number;result:string}[]=[];
  for (let i=0;i<t.starts.length;i++) {
    const s=t.starts[i]!;
    for (const option of options(s)) {
      if (!option.accepted || option.hits<=0 || option.action.id===t.steps[i]!.action.id) continue;
      const charge=launchCandidate(s,option.action)!;
      const result=option.state.status==='lost'?'IMMEDIATE_LOSS':repair(option.state,t.steps.slice(i));
      singles.push({step:i+1,kind:option.action.kind,charge:charge.id,hits:option.hits,result});
      if (singles.length%25===0) console.log('single',singles.length,JSON.stringify(tally(singles)));
    }
  }
  const doubles: {firstStep:number;firstCharge:string;secondCharge:string;result:string}[]=[];
  const focus=[0,.12,.25,.4,.55,.7,.85].map(f=>Math.floor((t.starts.length-1)*f));
  for (const i of focus) {
    const s=t.starts[i]!;
    const first=options(s).filter(o=>o.accepted && o.hits>0 && o.action.id!==t.steps[i]!.action.id)
      .sort((a,b)=>b.hits-a.hits).slice(0,2);
    for (const a of first) {
      const second=options(a.state).filter(o=>o.accepted && o.hits>0 && o.action.id!==a.action.id)
        .sort((x,y)=>y.hits-x.hits).slice(0,2);
      for (const b of second) {
        const result=b.state.status==='lost'?'IMMEDIATE_LOSS':repair(b.state,t.steps.slice(i));
        doubles.push({firstStep:i+1,firstCharge:launchCandidate(s,a.action)!.id,
          secondCharge:launchCandidate(a.state,b.action)!.id,result});
      }
    }
  }
  const result={single:{...tally(singles),cases:singles},double:{...tally(doubles),cases:doubles}};
  fs.writeFileSync('dist/m16g/deep-fairness.json',JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({single:tally(singles),double:tally(doubles)}));
} else if(mode==='solver') {
  const w=Number(process.argv[3]); const results=process.argv[4]?JSON.parse(fs.readFileSync(`dist/m16g/solver-${w}.json`,'utf8')) as {id:number}[]:[];
  for(const def of defs.filter(d=>Math.floor((d.id-1)/10)+1===w && (!process.argv[4] || process.argv[4].split(',').includes(String(d.id))))) {
    const start=performance.now(); const r=findFirstWinningWitness(def);
    const result={id:def.id,status:r.solved?'PASS':'INCONCLUSIVE',nodes:r.nodes,timeMs:Math.round(performance.now()-start),
      nodeCapHit:r.nodeCapHit,timeCapHit:r.timeCapHit};
    const prior=results.findIndex(r=>r.id===def.id); if(prior>=0) results.splice(prior,1,result); else results.push(result); console.log(JSON.stringify(result));
    fs.writeFileSync(`dist/m16g/solver-${w}.json`,JSON.stringify(results,null,2)+'\n');
  }
} else if(mode==='merge' || mode==='cross-merge') {
  const selectedIds = process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',').map(Number);
  const selected = selectedIds ? defs.filter(d=>selectedIds.includes(d.id)) : defs;
  const historyFile = mode==='cross-merge'?'dist/m16g/cross-merges.json':'dist/m16g/merges.json';
  const history: {id:number;merges:unknown[]}[] = selectedIds && fs.existsSync(historyFile)
    ? JSON.parse(fs.readFileSync(historyFile,'utf8')).filter((h:{id:number})=>!selectedIds.includes(h.id)) : [];
  for(const def of selected) {
    const merged=mode==='cross-merge'?crossMerge(def):merge(def);history.push({id:def.id,merges:merged});console.log(def.id,merged.length,'merges',def.winningWitness!.length);
  }
  for(let w=50;w<=50;w++) {
    const file=`content/levels/world-${w}.json`,packet=JSON.parse(fs.readFileSync(file,'utf8'));
    packet.levels=defs.filter(d=>Math.floor((d.id-1)/10)+1===w); fs.writeFileSync(file,JSON.stringify(packet,null,2)+'\n');
  }
  fs.writeFileSync(mode==='cross-merge'?'dist/m16g/cross-merges.json':'dist/m16g/merges.json',JSON.stringify(history,null,2)+'\n');
} else {
  const results=defs.map(def=> {
    const t=trace(def), validation=validateLevelPacket(def,{runSolver:false});
    if(!validation.valid || !t.metrics.clean || t.metrics.zeroHits || t.metrics.rejected) throw new Error(`${def.id} certificate failed`);
    const bots=Object.fromEntries(['round-robin','greedy','drain','noWaste','holding-first'].map(p=>[p,bot(createGame(def),p)]));
    const result={...t.metrics,bots,tinyPals:tinyAudit(def,t),deviations:def.id>=498?deviations(def,t):[]};
    console.log(def.id,JSON.stringify(t.metrics),JSON.stringify(bots)); return result;
  });
  fs.writeFileSync('dist/m16g/certificates.json',JSON.stringify(results,null,2)+'\n');
}
