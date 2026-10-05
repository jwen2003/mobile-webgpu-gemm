import { SHAPES, rng, unsupported, timingStatistics } from './gemm_math.mjs';
import { statistics } from './timing_math.mjs';
export const SHAPE_SEED=0x6e6d0021, PAIR_SEED=0x6e6d0022;
export const VARIANTS=Object.freeze({naive:{workgroup:[8,8,1],shader:'gemm_naive.wgsl',sharedBytes:0},
  tiled:{workgroup:[16,16,1],shader:'gemm_tiled.wgsl',sharedBytes:2048,tile:[16,16,16]}});
export const CASES=[...SHAPES.filter(s=>!s.performance),
  {id:'gemv-tail',M:1,K:17,N:19,source:'CORRECTNESS_SYNTHETIC',performance:false},...SHAPES.filter(s=>s.performance)];
function shuffle(array,seed){const next=rng(seed);for(let i=array.length-1;i>0;i--){
  const j=Math.floor(next()/4294967296*(i+1));[array[i],array[j]]=[array[j],array[i]];}return array;}
export function shapeOrder(){return shuffle(CASES.filter(s=>s.performance).map(s=>({...s})),SHAPE_SEED)
  .map((s,configurationIndex)=>({...s,configurationIndex}));}
export function roundOrder(shape){
  const seed=(PAIR_SEED^shape.M)>>>0;
  const orders=shuffle(Array.from({length:30},(_,i)=>i<15?['naive','tiled']:['tiled','naive']),seed);
  return {seed,rounds:orders.map((order,roundId)=>({roundId,order}))};
}
export function variantUnsupported(shape,limits,variant){
  const reasons=unsupported(shape,limits);
  if(variant==='tiled'){
    if(limits.maxComputeWorkgroupSizeX<16||limits.maxComputeWorkgroupSizeY<16||limits.maxComputeInvocationsPerWorkgroup<256)
      reasons.push('Fixed 16x16 tile requires 256 invocations');
    if(limits.maxComputeWorkgroupStorageSize<2048)reasons.push('Fixed tile requires 2048 workgroup bytes');
    // No silent alternative tile or u32 baseK overflow.
    if(shape.K>0xfffffff0)reasons.push('Tiled baseK increment exceeds safe u32 range');
  }
  return [...new Set(reasons)];
}
export function comparisonStatistics(samples,shape,pairs){
  const byVariant=Object.fromEntries(Object.keys(VARIANTS).map(v=>[v,timingStatistics(samples.filter(s=>s.variant===v),shape)]));
  const measured=samples.filter(s=>s.phase==='measured');
  const phaseCounts=phase=>samples.filter(s=>s.phase===phase);
  const uniqueRounds=(phase,count)=>Object.keys(VARIANTS).every(v=>{
    const rows=phaseCounts(phase).filter(s=>s.variant===v);
    return rows.length===count&&new Set(rows.map(s=>s.roundId)).size===count&&rows.every(s=>Number.isInteger(s.roundId)&&s.roundId>=0&&s.roundId<count);
  });
  const pairPass=['warmup','measured'].every(phase=>{
    const rows=pairs.filter(p=>p.phase===phase),count=phase==='warmup'?10:30;
    return rows.length===count&&new Set(rows.map(p=>p.roundId)).size===count&&rows.every(p=>p.correctness?.status==='PASS'&&p.roundId>=0&&p.roundId<count);
  });
  const complete=samples.length===80&&samples.every(s=>s.correctness?.status==='PASS')&&pairPass
    &&uniqueRounds('warmup',10)&&uniqueRounds('measured',30)&&Object.values(byVariant).every(s=>s.completeMeasuredSet);
  const resolutionLimited=Object.values(byVariant).some(s=>s.status==='RESOLUTION_LIMITED');
  const allowed=complete&&!resolutionLimited&&Object.values(byVariant).every(s=>s.status==='PRELIMINARY'&&s.gpuPassNs?.median>0);
  const ratios=[];
  if(allowed)for(let roundId=0;roundId<30;roundId++){
    const naive=measured.find(s=>s.roundId===roundId&&s.variant==='naive');
    const tiled=measured.find(s=>s.roundId===roundId&&s.variant==='tiled');
    if(!naive||!tiled||naive.gpuPassDurationNs<=0||tiled.gpuPassDurationNs<=0)throw new Error('Invalid paired durations');
    ratios.push(naive.gpuPassDurationNs/tiled.gpuPassDurationNs);
  }
  return {byVariant,status:allowed?'PRELIMINARY':resolutionLimited?'RESOLUTION_LIMITED':'INCOMPLETE_OR_NOT_MEASURED',
    speedup:allowed?byVariant.naive.gpuPassNs.median/byVariant.tiled.gpuPassNs.median:null,
    primaryDefinition:'Same-run naive pass median / same-run tiled pass median; historical GEMM001 not used',
    pairedDurationRatios:allowed?statistics(ratios):null,pairedRawRatios:allowed?ratios:null,
    pairedRatioDefinition:'Statistics of 30 within-round naive/tiled duration ratios; different estimator from ratio of medians',
    suppressionReason:allowed?null:'Missing/failing samples or pairs, missing timestamps, measured zeros or resolution limit',
    completePassingPairedSet:complete};
}
