import assert from 'node:assert/strict';
import fs from 'node:fs';
import {realShapeConfiguration} from '../src/benchmark/real_shape_config.mjs';
const e=JSON.parse(fs.readFileSync('src/benchmark/gemm004_shape.json','utf8')),c=realShapeConfiguration(e);
assert.equal(e.status,'REVIEWED_EXECUTION_SHAPE');assert.equal(e.validLogicalShape,null);
assert.deepEqual(c.shapeOrder()[0].M,8);assert.equal(c.shapeOrder()[0].K,1536);assert.equal(c.shapeOrder()[0].N,2048);
assert.equal(c.shapeOrder()[0].source,'REAL_MODEL_EXECUTION_PADDED_SHAPE_FP32_REWRITE');assert.deepEqual(Object.keys(c.VARIANTS),['naive','tiled']);
const rounds=c.roundOrder(e.shape).rounds;assert.equal(rounds.length,30);assert.equal(rounds.filter(r=>r.order[0]==='naive').length,15);assert.equal(rounds.filter(r=>r.order[0]==='tiled').length,15);
assert.throws(()=>realShapeConfiguration({...e,validLogicalShape:e.shape}));assert.throws(()=>realShapeConfiguration({...e,proofs:{...e.proofs,rowMajorMapping:'UNKNOWN'}}));
// Small synthetic block layout tests, not actual model values: eight lanes, four y partitions,
// two output blocks and eight source slices. Verify scatter and reductions independently.
const M=8,S=8,D=2,K=S*4,N=D*4;
const A=Array.from({length:M*K},(_,i)=>i%7-3),packed=Array.from({length:S*D*16},(_,i)=>(i*3)%11-5),B=new Array(K*N);
for(let s=0;s<S;s++)for(let d=0;d<D;d++)for(let t=0;t<4;t++)for(let j=0;j<4;j++)B[(4*s+t)*N+4*d+j]=packed[(s*D+d)*16+t*4+j];
for(let r=0;r<M;r++)for(let d=0;d<D;d++)for(let j=0;j<4;j++){
 let ref=0;for(let k=0;k<K;k++)ref+=A[r*K+k]*B[k*N+4*d+j];
 const part=Array(4).fill(0);for(let y=0;y<4;y++)for(let s=y;s<S;s+=4)for(let t=0;t<4;t++)part[y]+=A[r*K+4*s+t]*packed[(s*D+d)*16+t*4+j];
 assert.equal((part[0]+part[2])+(part[1]+part[3]),ref);
}
console.log('GEMM004 execution scope, manifest, two variants,15/15 orders, ambiguous-scope rejection and independent packed indexing/reduction CPU checks PASS. Phone NOT_RUN.');
