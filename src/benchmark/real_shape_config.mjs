import * as pair from './gemm_pair_math.mjs';
import * as triple from './gemm_triple_math.mjs';
export function realShapeConfiguration(evidence){
  const execution=evidence.status==='REVIEWED_EXECUTION_SHAPE';
  if(!execution&&evidence.status!=='REVIEWED_LOGICAL_SHAPE')throw new Error('WAITING_FOR_SHAPE_EVIDENCE: review mathematical axes/layout and evidence scope; no guessed shape benchmark');
  const {M,N,K}=evidence.shape||{};
  if(![M,N,K].every(x=>Number.isSafeInteger(x)&&x>0))throw new Error('Invalid reviewed logical shape');
  if(!/^[a-f0-9]{64}$/.test(evidence.rawSha256||'')||!evidence.rawPath||!evidence.reviewDocument)throw new Error('Missing raw evidence provenance');
  for(const field of ['M','N','K','padding','batchHead','rowMajorMapping'])if(typeof evidence.proofs?.[field]!=='string'||!evidence.proofs[field].trim()||evidence.proofs[field].includes('UNKNOWN'))throw new Error(`Missing reviewed proof ${field}`);
  if(execution&&(evidence.evidenceCategory!=='EXECUTION_PADDED_ONLY'||evidence.validLogicalShape!==null))throw new Error('Execution evidence must explicitly retain unknown valid logical shape');
  const base=M===1?triple:pair;
  const shape={id:'reviewed-real-shape',M,N,K,performance:true,source:execution?'REAL_MODEL_EXECUTION_PADDED_SHAPE_FP32_REWRITE':'REAL_MODEL_LOGICAL_SHAPE_FP32_REWRITE',evidence};
  const cases=M===1?triple.CASES.filter(s=>!s.performance):pair.CASES.filter(s=>!s.performance);
  return {...base,experimentId:'GEMM004',realShapeEvidence:evidence,fullSmallArrays:true,CASES:[...cases,shape],
    shapeOrder:()=>[{...shape,configurationIndex:0}],
    warmupOrder:M===1?triple.warmupOrder:i=>i%2?['tiled','naive']:['naive','tiled']};
}
