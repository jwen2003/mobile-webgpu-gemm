import { rng, unsupported, timingStatistics } from './gemm_math.mjs';
import { VARIANTS as PAIR_VARIANTS, variantUnsupported as pairUnsupported } from './gemm_pair_math.mjs';
export const SHAPE_SEED=0x6e6d0031, PAIR_SEED=0x6e6d0032;
export const VARIANTS={...PAIR_VARIANTS,specialized:{workgroup:[64,1,1],shader:'gemm_m1.wgsl',sharedBytes:256,
  supports:'M=1 only',kBlock:64,outputMapping:'n=global_invocation_id.x, one column/lane',
  kBlocks:'ceil(K/64)',barriersPerWorkgroup:'2*ceil(K/64), every lane participates'}};
export const CASES=[[1,1],[5,7],[17,19],[65,67],[1024,1024]].map(([K,N],i)=>({id:i===4?'representative-gemv':`m1-${K}-${N}`,
  M:1,K,N,source:i===4?'REPRESENTATIVE_NOT_RECOVERED_RUNTIME_SHAPE':'CORRECTNESS_SYNTHETIC',performance:i===4,
  specializedExecution:{kBlocks:Math.ceil(K/64),barriersPerWorkgroup:2*Math.ceil(K/64),sharedBytes:256,dispatchWorkgroups:[Math.ceil(N/64),1,1]}}));
export const PERMUTATIONS=[['naive','tiled','specialized'],['naive','specialized','tiled'],['tiled','naive','specialized'],
  ['tiled','specialized','naive'],['specialized','naive','tiled'],['specialized','tiled','naive']];
export function shapeOrder(){return CASES.filter(s=>s.performance).map((s,configurationIndex)=>({...s,configurationIndex}));}
export function roundOrder(shape){const seed=(PAIR_SEED^shape.M)>>>0,next=rng(seed),orders=PERMUTATIONS.flatMap(p=>Array.from({length:5},()=>[...p]));
  for(let i=orders.length-1;i>0;i--){const j=Math.floor(next()/4294967296*(i+1));[orders[i],orders[j]]=[orders[j],orders[i]];}
  return {seed,rounds:orders.map((order,roundId)=>({roundId,order}))};}
export function warmupOrder(roundId){return [...PERMUTATIONS[roundId%6]];}
export function variantUnsupported(shape,limits,variant){
  if(variant!=='specialized')return pairUnsupported(shape,limits,variant);
  // Common row-major addressing/binding checks; specialized has a distinct 1D dispatch.
  const reasons=unsupported(shape,limits).filter(s=>!['8x8x1 workgroup unsupported','Dispatch dimension limit exceeded'].includes(s));
  if(shape.M!==1)reasons.push('UNSUPPORTED: specialized kernel requires M=1');
  if(limits.maxComputeWorkgroupSizeX<64||limits.maxComputeWorkgroupSizeY<1||limits.maxComputeWorkgroupSizeZ<1||limits.maxComputeInvocationsPerWorkgroup<64)
    reasons.push('64x1x1 workgroup unsupported');
  if(limits.maxComputeWorkgroupStorageSize<256)reasons.push('256 workgroup bytes required');
  if(Math.ceil(shape.N/64)>limits.maxComputeWorkgroupsPerDimension)reasons.push('Dispatch dimension limit exceeded');
  if(shape.K>0xffffffc0)reasons.push('K block increment exceeds safe u32 range');
  return [...new Set(reasons)];
}
export function comparisonStatistics(samples,shape,pairs){
  const names=Object.keys(VARIANTS),byVariant=Object.fromEntries(names.map(v=>[v,timingStatistics(samples.filter(s=>s.variant===v),shape)]));
  const unique=(rows,count)=>rows.length===count&&new Set(rows.map(s=>s.roundId)).size===count&&rows.every(s=>Number.isInteger(s.roundId)&&s.roundId>=0&&s.roundId<count);
  const complete=samples.length===120&&samples.every(s=>s.correctness?.status==='PASS')&&pairs.length===40
    &&pairs.every(p=>p.correctness?.status==='PASS')&&['warmup','measured'].every(phase=>{
      const n=phase==='warmup'?10:30;
      return unique(pairs.filter(p=>p.phase===phase),n)&&names.every(v=>unique(samples.filter(s=>s.phase===phase&&s.variant===v),n));
    })&&Object.values(byVariant).every(s=>s.completeMeasuredSet);
  const ratios={};
  for(const [numerator,denominator] of [['naive','specialized'],['tiled','specialized'],['naive','tiled']]){
    const a=byVariant[numerator],b=byVariant[denominator],allowed=complete&&[a,b].every(s=>s.status==='PRELIMINARY'&&s.gpuPassNs?.median>0);
    ratios[`${numerator}/${denominator}`]={value:allowed?a.gpuPassNs.median/b.gpuPassNs.median:null,
      reason:allowed?null:'Incomplete/failing set, missing time, measured zero or resolution limit'};
  }
  return {byVariant,ratios,primaryDefinition:'Ratio of medians from this GEMM003 run only; historical GEMM001/002 excluded',
    status:!complete?'INCOMPLETE_OR_NOT_MEASURED':Object.values(byVariant).some(s=>s.status==='RESOLUTION_LIMITED')?'RESOLUTION_LIMITED':'PRELIMINARY',
    completePassingPairedSet:complete};
}
