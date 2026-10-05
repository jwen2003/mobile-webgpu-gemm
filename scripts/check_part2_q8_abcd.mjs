import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeInput,references,half,fromHalf,verify,CONTRACT} from '../src/benchmark/part2_math.mjs';
import {packBVec4,quadOrder,PERMUTATIONS,VARIANTS,ratios,decodePacked,balance} from '../src/benchmark/part2_abcd_math.mjs';
// Independent collective-load interpreter;no fake data are written as phone results.
function vectorTiled(s,data){const layout=packBVec4(data,s),out=new Float32Array(s.M*s.N).fill(NaN);
for(let gy=0;gy<Math.ceil(s.M/8);gy++)for(let gx=0;gx<Math.ceil(s.N/32);gx++){
 const sums=new Float32Array(64*4);
 for(let base=0;base<s.K;base+=16){const ta=new Float32Array(128),tb=new Float32Array(128*4),writesA=new Uint8Array(128),writesB=new Uint8Array(128);
 for(let linear=0;linear<64;linear++)for(let slot=linear;slot<128;slot+=64){writesA[slot]++;writesB[slot]++;
  const row=gy*8+Math.floor(slot/16),ak=base+slot%16;if(row<s.M&&ak<s.K)ta[slot]=data.A[row*s.K+ak];
  const bk=base+Math.floor(slot/8),bv=gx*8+slot%8;if(bk<s.K)for(let c=0;c<4;c++){const n=bv*4+c;if(n<s.N){const q=(data.words[bk*data.rowWordStride+Math.floor(n/4)]>>>((n%4)*8))&255,idx=Math.floor(bk/32)*s.N+n;tb[slot*4+c]=half(Math.fround((q-data.zeros[idx])*fromHalf(data.scales[idx])));}}
 }
 assert.ok(writesA.every(x=>x===1)&&writesB.every(x=>x===1));
 for(let y=0;y<8;y++)for(let x=0;x<8;x++)for(let k=0;k<16;k++)if(base+k<s.K)for(let c=0;c<4;c++){const i=(y*8+x)*4+c;sums[i]=half(ta[y*16+k]*tb[(k*8+x)*4+c]+sums[i]);}
 }
 for(let y=0;y<8;y++)for(let x=0;x<8;x++)for(let c=0;c<4;c++){const row=gy*8+y,n=gx*32+x*4+c;if(row<s.M&&n<s.N)out[row*s.N+n]=sums[(y*8+x)*4+c];}
}return out;}
for(const M of [1,8,9,17])for(const K of [1,3,16,17,33,35])for(const N of [1,3,4,5,9,23,31,32,33,35])for(const kind of ['exact','fractional']){
 const s={M,K,N},data=makeInput(s,kind,8),layout=packBVec4(data,s),ref=references(s,data),actual=vectorTiled(s,data);assert.deepEqual(actual,ref.semantic);assert.equal(verify(actual,ref,kind,'FP16').status,'PASS');
 for(let k=0;k<K;k++){assert.deepEqual([...layout.values.subarray(k*layout.rowHalfStride,k*layout.rowHalfStride+N)],[...data.bHalf.subarray(k*N,(k+1)*N)]);assert.ok(layout.values.subarray(k*layout.rowHalfStride+N,(k+1)*layout.rowHalfStride).every(x=>x===0));}
}
const probe={M:1,K:3,N:1},data=makeInput(probe,'exact',8);data.A.set([2048,1,1]);data.scales.fill(0x3c00);data.zeros.fill(128);data.words.fill(129);assert.equal(vectorTiled(probe,data)[0],2048);
for(const M of [1,128])for(const salt of [0,0x50415448]){const p=quadOrder(M,salt),b=balance(p);assert.deepEqual(p,quadOrder(M,salt));assert.equal(p.length,30);for(const perm of PERMUTATIONS)assert.ok(p.some(x=>x.join()==perm.join()));for(const counts of Object.values(b.positions))assert.ok(counts.every(n=>n===7||n===8));assert.ok(Object.values(b.precedence).every(n=>n===15));}
for(const K of [1,17,33,35])for(const N of [1,7,9,35]){const s={M:1,K,N},d=makeInput(s,'fractional',8);assert.deepEqual(decodePacked(d,s),d.bHalf);const decoded=decodePacked(d,s);for(let k=0;k<K;k++)for(let n=0;n<N;n++){for(const q of [0,1,127,128,129,254,255]){const word=k*d.rowWordStride+(n>>>2),shift=n%4*8,old=d.words[word];d.words[word]=(old&~(255<<shift))|(q<<shift);assert.equal(decodePacked(d,s)[k*N+n],(await import('../src/benchmark/part2_math.mjs')).toHalf((q-d.zeros[Math.floor(k/32)*N+n])*fromHalf(d.scales[Math.floor(k/32)*N+n])));d.words[word]=old;}}}
const good=Object.fromEntries(['A','B','C','D'].map((v,i)=>[v,{status:'PRELIMINARY',gpuPassNs:{median:[4,8,6,2][i]}}]));assert.deepEqual(ratios(good),{AoverD:2,BoverD:4,CoverD:3});good.D.status='RESOLUTION_LIMITED';assert.deepEqual(ratios(good),{AoverD:null,BoverD:null,CoverD:null});
const source=fs.readFileSync('src/benchmark/part2_d_q8_f16.wgsl','utf8');assert.match(source,/packed:array<u32>/);assert.match(source,/&255u/);assert.match(source,/bk\/32u/);assert.match(source,/f16\(f32\(i32\(q\)/);assert.equal((source.match(/workgroupBarrier/g)||[]).length,2);assert.ok(!/\b(return|dot|subgroup)\b/.test(source.replace(/\/\/[^\n]*/g,'')));assert.equal(VARIANTS.D.sharedBytes,1280);assert.deepEqual(VARIANTS.D.outputWorkgroupShape,[32,8,1]);
console.log('PART2Q8ABCD CPU/static PASS: fused Q8 unsigned indexing and signed dequant,extremes/packing/group/tile/vector tails,half semantics,probe,30 balanced four-version rounds,ratio gates. NO phone GPU evidence.');
