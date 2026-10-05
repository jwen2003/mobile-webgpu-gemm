import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeInput,references,half,fromHalf,verify,CONTRACT} from '../src/benchmark/part2_math.mjs';
import {packBVec4,tripleOrder,PERMUTATIONS,VARIANTS,ratios} from '../src/benchmark/part2_abc_math.mjs';
// Independent collective-load interpreter;no fake data are written as phone results.
function vectorTiled(s,data){const layout=packBVec4(data,s),out=new Float32Array(s.M*s.N).fill(NaN);
for(let gy=0;gy<Math.ceil(s.M/8);gy++)for(let gx=0;gx<Math.ceil(s.N/32);gx++){
 const sums=new Float32Array(64*4);
 for(let base=0;base<s.K;base+=16){const ta=new Float32Array(128),tb=new Float32Array(128*4),writesA=new Uint8Array(128),writesB=new Uint8Array(128);
 for(let linear=0;linear<64;linear++)for(let slot=linear;slot<128;slot+=64){writesA[slot]++;writesB[slot]++;
  const row=gy*8+Math.floor(slot/16),ak=base+slot%16;if(row<s.M&&ak<s.K)ta[slot]=data.A[row*s.K+ak];
  const bk=base+Math.floor(slot/8),bv=gx*8+slot%8;if(bk<s.K&&bv<layout.rowStrideVectors)for(let c=0;c<4;c++)tb[slot*4+c]=fromHalf(layout.values[bk*layout.rowHalfStride+bv*4+c]);
 }
 assert.ok(writesA.every(x=>x===1)&&writesB.every(x=>x===1));
 for(let y=0;y<8;y++)for(let x=0;x<8;x++)for(let k=0;k<16;k++)if(base+k<s.K)for(let c=0;c<4;c++){const i=(y*8+x)*4+c;sums[i]=half(ta[y*16+k]*tb[(k*8+x)*4+c]+sums[i]);}
 }
 for(let y=0;y<8;y++)for(let x=0;x<8;x++)for(let c=0;c<4;c++){const row=gy*8+y,n=gx*32+x*4+c;if(row<s.M&&n<s.N)out[row*s.N+n]=sums[(y*8+x)*4+c];}
}return out;}
for(const M of [1,8,9,17])for(const K of [1,3,16,17,33,35])for(const N of [1,3,4,5,9,23,31,32,33,35])for(const kind of ['exact','fractional']){
 const s={M,K,N},data=makeInput(s,kind,4),layout=packBVec4(data,s),ref=references(s,data),actual=vectorTiled(s,data);assert.deepEqual(actual,ref.semantic);assert.equal(verify(actual,ref,kind,'FP16').status,'PASS');
 for(let k=0;k<K;k++){assert.deepEqual([...layout.values.subarray(k*layout.rowHalfStride,k*layout.rowHalfStride+N)],[...data.bHalf.subarray(k*N,(k+1)*N)]);assert.ok(layout.values.subarray(k*layout.rowHalfStride+N,(k+1)*layout.rowHalfStride).every(x=>x===0));}
}
const probe={M:1,K:3,N:1},data=makeInput(probe,'exact',4);data.A.set([2048,1,1]);data.bHalf.fill(0x3c00);assert.equal(vectorTiled(probe,data)[0],2048);
for(const M of [1,128]){const p=tripleOrder(M);assert.deepEqual(p,tripleOrder(M));assert.equal(p.length,30);for(const perm of PERMUTATIONS)assert.equal(p.filter(x=>x.join()==perm.join()).length,5);for(let pos=0;pos<3;pos++)for(const name of ['A','B','C'])assert.equal(p.filter(x=>x[pos]===name).length,10);}
const good=Object.fromEntries(['A','B','C'].map((v,i)=>[v,{status:'PRELIMINARY',gpuPassNs:{median:[4,8,2][i]}}]));assert.deepEqual(ratios(good),{AoverB:.5,AoverC:2,BoverC:4});good.C.status='RESOLUTION_LIMITED';assert.deepEqual(ratios(good),{AoverB:.5,AoverC:null,BoverC:null});good.A.status='NOT_MEASURED';assert.equal(ratios(good).AoverB,null);
const source=fs.readFileSync('src/benchmark/part2_c_f16.wgsl','utf8');assert.match(source,/array<vec4<f16>>/);assert.match(source,/sums=fma\(vec4<f16>\(av\)/);assert.equal((source.match(/workgroupBarrier/g)||[]).length,2);assert.ok(!/\b(return|dot|subgroup)\b/.test(source.replace(/\/\/[^\n]*/g,'')));assert.equal(VARIANTS.C.sharedBytes,1280);assert.deepEqual(VARIANTS.C.outputWorkgroupShape,[32,8,1]);
console.log('PART2ABC CPU/static PASS: vec4 row-layout values/zeros,collective loads/all tails,component-wise increasing-K reference,2048 probe,six orders5 each,ratio suppression. NO phone GPU evidence.');
