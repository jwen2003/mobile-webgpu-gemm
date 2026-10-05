// Full CPU reference-domain audit only,never writes phone results.
import assert from 'node:assert/strict';
import {CASES,makeInput,references,verify} from '../src/benchmark/part2_math.mjs';
for(const bits of [4,8])for(const shape of CASES.filter(s=>s.performance))for(const kind of ['exact','fractional']){
 const refs=references(shape,makeInput(shape,kind,bits)),v=verify(refs.semantic,refs,kind,'FP16');
 assert.equal(v.status,'PASS');console.log(JSON.stringify({check:'CPU ONLY',bits,M:shape.M,K:shape.K,N:shape.N,kind,canonicalVsHighMaxAbsoluteError:v.high.maxAbsoluteError,status:v.status}));
}
