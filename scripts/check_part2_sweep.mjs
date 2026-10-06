import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeInput,references,half,fromHalf,toHalf,pack} from '../src/benchmark/part2_math.mjs';
import {PLAN,CANDIDATES,balancedOrder,orderCounts,selectAndCompare,limitsFor} from '../src/benchmark/part2_sweep_math.mjs';
import {generateShader,stockFile} from '../src/benchmark/part2_sweep_shader.mjs';
function collective(c,s,d,bits){if(c.variant==='A'){const out=new Float32Array(s.M*s.N);for(let m=0;m<s.M;m++)for(let n=0;n<s.N;n++){let v=0;for(let k=0;k<s.K;k++)v=half(d.A[m*s.K+k]*d.B[k*s.N+n]+v);out[m*s.N+n]=v;}return out;}
 const vector=c.variant!=='B',cols=vector?4:1,tn=c.wx*cols,tm=c.wy,lanes=c.wx*c.wy,out=new Float32Array(s.M*s.N).fill(NaN);
 for(let gy=0;gy<Math.ceil(s.M/tm);gy++)for(let gx=0;gx<Math.ceil(s.N/tn);gx++){
  const sums=new Float32Array(lanes*cols);
  for(let base=0;base<s.K;base+=c.tk){const ta=new Float32Array(tm*c.tk),tb=new Float32Array(c.tk*tn),aw=new Uint8Array(ta.length),bw=new Uint8Array(c.tk*c.wx);
   for(let linear=0;linear<lanes;linear++){
    for(let slot=linear;slot<ta.length;slot+=lanes){aw[slot]++;const m=gy*tm+Math.floor(slot/c.tk),k=base+slot%c.tk;if(m<s.M&&k<s.K)ta[slot]=d.A[m*s.K+k];}
    for(let slot=linear;slot<c.tk*c.wx;slot+=lanes){bw[slot]++;const k=base+Math.floor(slot/c.wx),v=gx*c.wx+slot%c.wx;for(let comp=0;comp<cols;comp++){const n=v*cols+comp;if(k<s.K&&n<s.N){let b=d.B[k*s.N+n];if(c.variant==='D'){const per=32/bits,q=(d.words[k*d.rowWordStride+Math.floor(n/per)]>>>((n%per)*bits))&((1<<bits)-1),g=Math.floor(k/32)*s.N+n;b=half(Math.fround((q-d.zeros[g])*fromHalf(d.scales[g])));}tb[slot*cols+comp]=b;}}}
   }assert.ok(aw.every(x=>x===1)&&bw.every(x=>x===1));
   for(let y=0;y<tm;y++)for(let x=0;x<c.wx;x++)for(let k=0;k<c.tk;k++)if(base+k<s.K)for(let comp=0;comp<cols;comp++){const i=(y*c.wx+x)*cols+comp;sums[i]=half(ta[y*c.tk+k]*tb[(k*c.wx+x)*cols+comp]+sums[i]);}
  }
  for(let y=0;y<tm;y++)for(let x=0;x<c.wx;x++)for(let comp=0;comp<cols;comp++){const m=gy*tm+y,n=gx*tn+x*cols+comp;if(m<s.M&&n<s.N)out[m*s.N+n]=sums[(y*c.wx+x)*cols+comp];}
 }return out;}
for(const bits of [4,8])for(const s of [{M:1,K:1,N:1},{M:3,K:5,N:7},{M:17,K:35,N:23},{M:1,K:33,N:9},{M:9,K:17,N:35},{M:17,K:17,N:33},{M:9,K:65,N:5}])for(const kind of ['exact','fractional']){const d=makeInput(s,kind,bits),ref=references(s,d);for(const c of CANDIDATES)assert.deepEqual(collective(c,s,d,bits),ref.semantic);}
for(const bits of [4,8]){const s={M:1,K:3,N:1},d=makeInput(s,'exact',bits);d.A.set([2048,1,1]);d.scales.fill(toHalf(1));d.zeros.fill(2**(bits-1));d.q.fill(2**(bits-1)+1);d.words=pack(d.q,3,1,bits);d.B.fill(1);for(const c of CANDIDATES)assert.equal(collective(c,s,d,bits)[0],2048);}
for(let n=1;n<=10;n++){const ids=CANDIDATES.slice(0,n).map(x=>x.id),o=balancedOrder(ids,30,123);assert.deepEqual(o,balancedOrder(ids,30,123));for(const counts of Object.values(orderCounts(o,ids)))assert.ok(Math.max(...counts)-Math.min(...counts)<=1);assert.ok(o.every(x=>new Set(x).size===n));}
for(const bits of [4,8])for(const c of CANDIDATES){const stock=fs.readFileSync('src/benchmark/'+stockFile(c,bits),'utf8'),source=generateShader(c,bits,stock);if(c.original)assert.equal(source,stock);else{assert.equal((source.match(/workgroupBarrier/g)||[]).length,2);assert.ok(!/\b(return|dot|subgroup)\b/.test(source));assert.match(source,new RegExp(`workgroup_size\\(${c.wx},${c.wy}\\)`));}assert.equal(c.sharedBytes,c.variant==='A'?0:2*c.tk*(c.wy+c.wx*(c.variant==='B'?1:4)));}
const summaries=Object.fromEntries(CANDIDATES.map(c=>[c.id,{status:'PRELIMINARY',gpuPassNs:{median:1000000},observedGridNs:'65536'}]));summaries['C-4x8-K16'].gpuPassNs.median=950000;let select=selectAndCompare(summaries,CANDIDATES);assert.equal(select.C.selected,'C-8x8-K16');assert.equal(select.C.status,'INDISTINGUISHABLE_WITHIN_ONE_GRID');summaries['C-4x8-K16'].gpuPassNs.median=900000;assert.equal(selectAndCompare(summaries,CANDIDATES).C.selected,'C-4x8-K16');summaries['C-4x8-K16'].status='RESOLUTION_LIMITED';assert.equal(selectAndCompare(summaries,CANDIDATES).C.selected,'C-8x8-K16');
const l={maxComputeInvocationsPerWorkgroup:64,maxComputeWorkgroupSizeX:256,maxComputeWorkgroupSizeY:256,maxComputeWorkgroupStorageSize:16384,maxStorageBuffersPerShaderStage:8,maxUniformBufferBindingSize:65536,maxBufferSize:2**28,maxStorageBufferBindingSize:2**27,maxComputeWorkgroupsPerDimension:65535};assert.ok(limitsFor(CANDIDATES.find(c=>c.id==='B-16x16-K16'),PLAN.shapes[0],l,4).length);assert.equal(limitsFor(CANDIDATES[0],PLAN.shapes[0],l,4).length,0);
console.log('Sweep CPU/static PASS: all candidates/tails/probe,cooperative loads/barriers,stock identity,position balance,limits,tie preference and resolution suppression. NO phone evidence.');

for(const bits of [4,8])for(const c of CANDIDATES)if(!c.original)assert.ok(!/\bmeta\b/.test(generateShader(c,bits)), "WGSL reserved meta identifier");
