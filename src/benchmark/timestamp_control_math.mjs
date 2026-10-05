import { statistics } from './timing_math.mjs';
export function intervalDiagnostics(samples){
  let grid=0n;const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a;};
  const origin=samples.length?BigInt(samples[0].startTimestamp):0n;
  for(const s of samples)for(const k of ['startTimestamp','endTimestamp']){let v=BigInt(s[k])-origin;if(v<0n)v=-v;grid=gcd(grid,v);}
  const overlaps=[];let startInversions=0,endInversions=0;
  for(let i=1;i<samples.length;i++){
    const a=samples[i-1],b=samples[i],ns=BigInt(a.endTimestamp)-BigInt(b.startTimestamp);
    if(BigInt(b.startTimestamp)<BigInt(a.startTimestamp))startInversions++;
    if(BigInt(b.endTimestamp)<BigInt(a.endTimestamp))endInversions++;
    overlaps.push({previousPass:a.passId,nextPass:b.passId,previousCommand:a.commandBufferId,nextCommand:b.commandBufferId,
      previousSubmit:a.submitId,nextSubmit:b.submitId,signedEndMinusNextStartNs:ns.toString(),overlapNs:(ns>0n?ns:0n).toString(),
      category:a.commandBufferId===b.commandBufferId?'same_command_buffer':a.submitId===b.submitId?'same_submit':'cross_submit'});
  }
  const positive=overlaps.filter(s=>BigInt(s.overlapNs)>0n),durations=samples.map(s=>s.gpuPassDurationNs),stats=statistics(durations);
  return {passDurationNs:stats,observedTimestampDifferenceGcdNs:grid.toString(),startInversions,endInversions,adjacent:overlaps,
    positiveOverlapNs:statistics(positive.map(s=>Number(s.overlapNs))),atMost65536Ns:positive.filter(s=>BigInt(s.overlapNs)<=65536n).length,
    greaterThan65536Ns:positive.filter(s=>BigInt(s.overlapNs)>65536n).length,
    resolutionLimited:!stats||stats.zeroCount>0||stats.median<10*Math.max(65536,Number(grid)),
    cause:'UNKNOWN pending controlled observations; no overlap deletion or attribution repair',totalEndToEndGpuTime:'NOT_MEASURED'};
}
