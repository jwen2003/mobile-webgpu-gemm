// Actual CPU-only preflight;never writes fabricated phone records.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CASES,CONTRACT,makeInput,references,verify,pack,unpack,toHalf,fromHalf} from '../src/benchmark/part2_math.mjs';
import {decodePacked} from '../src/benchmark/part2_abcd_math.mjs';
const rows=[];
for(const shape of CASES.filter(s=>s.performance))for(const kind of ['exact','fractional']){
 const data=makeInput(shape,kind,8);
 assert.deepEqual(unpack(data.words,shape.K,shape.N,8),data.q);
 assert.deepEqual(decodePacked(data,shape),data.bHalf);
 const refs=references(shape,data),comparison=verify(refs.semantic,refs,kind,'FP16');
 assert.equal(comparison.status,'PASS');
 rows.push({shape,kind,canonicalVsHigh:comparison.high,canonicalVsFp32:comparison.fp32});
}
// Explicit unsigned-byte codes,including byte values that would be negative INT8.
for(const K of [1,31,32,33,65])for(const N of [1,3,4,5,7,9]){
 const shape={M:1,K,N},data=makeInput(shape,'fractional',8);
 data.zeros.fill(128);data.scales.fill(toHalf(1/512));
 data.q.set(Uint16Array.from(data.q,(_,i)=>[0,1,127,128,129,254,255][i%7]));
 data.words=pack(data.q,K,N,8);
 assert.deepEqual(unpack(data.words,K,N,8),data.q);
 const decoded=decodePacked(data,shape);
 for(let i=0;i<decoded.length;i++)assert.equal(fromHalf(decoded[i]),(data.q[i]-128)/512);
 if(N%4)for(let k=0;k<K;k++)assert.equal(data.words[(k+1)*data.rowWordStride-1]>>>(8*(N%4)),0);
}
const result={evidenceType:'CPU_REFERENCE_PREFLIGHT_ONLY',phoneStatus:'NOT_RUN',contractVersion:CONTRACT.version,bits:8,status:'PASS',thresholds:CONTRACT.thresholds,rows,
 basis:'Full fixed-seed representative input domains,actual unsigned codes/half A/scale. Canonical half accumulation vs binary64/FP32 remains within frozen bounds. Independent collective D interpreter/page mocks checked separately. This is not proof of every legal WGSL implementation or arbitrary model input.',
 limitations:'Some Q8 products/cancellation are subnormal;WGSL/compiler flush/rounding behavior can differ. Existing engineering thresholds remain frozen before phone execution;failures require diagnosis,not automatic relaxation.'};
fs.writeFileSync('results/analysis/q8_cpu_reference_validation.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({check:'CPU_ONLY',status:result.status,rows:rows.map(x=>({M:x.shape.M,kind:x.kind,maxAbsVsHigh:x.canonicalVsHigh.maxAbsoluteError,maxAbsVsFp32:x.canonicalVsFp32.maxAbsoluteError}))}));
