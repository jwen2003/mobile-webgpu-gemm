// CPU tests only: no fabricated GPU evidence.
import assert from 'node:assert/strict';
import { cpuReference, inputs, compare, configurationOrder, unsupported, timingStatistics, SHAPES, INPUT_SEED } from '../src/benchmark/gemm_math.mjs';
import { statistics, timestampInterval } from '../src/benchmark/timing_math.mjs';
const shape={M:2,K:3,N:2};
const expected=cpuReference(shape,new Float32Array([1,-2,3,0,4,-1]),new Float32Array([2,-1,3,2,-2,5]));
assert.deepEqual([...expected],[-10,10,14,3]);
assert.equal(compare(new Float32Array(expected),expected,'integer').status,'PASS');
assert.equal(compare(new Float32Array([-10,10,14,4]),expected,'integer').errorElementCount,1);
assert.equal(compare(new Float32Array([NaN,Infinity,14,3]),expected,'integer').nonFiniteCount,2);
assert.equal(compare(new Float32Array([.01]),new Float64Array([0]),'fractional').status,'FAIL');
assert.equal(compare(new Float32Array([.001]),new Float64Array([0]),'fractional').status,'PASS');
for(const s of SHAPES.slice(0,3))for(const kind of ['integer','fractional']){
  const {A,B}=inputs(s,kind),again=inputs(s,kind,INPUT_SEED);
  assert.deepEqual(A,again.A);assert.deepEqual(B,again.B);
  const ref=cpuReference(s,A,B);
  // Alternate independent dot traversal validates rectangular/boundary CPU addressing.
  for(let m=0;m<s.M;m++)for(let n=0;n<s.N;n++){
    let sum=0;for(let k=0;k<s.K;k++)sum+=A[m*s.K+k]*B[k*s.N+n];assert.equal(ref[m*s.N+n],sum);
  }
}
assert.deepEqual(configurationOrder(),configurationOrder());
const limits={maxBufferSize:2**28,maxStorageBufferBindingSize:2**27,maxComputeWorkgroupSizeX:256,maxComputeWorkgroupSizeY:256,
  maxComputeWorkgroupSizeZ:64,maxComputeInvocationsPerWorkgroup:256,maxComputeWorkgroupsPerDimension:65535,
  maxStorageBuffersPerShaderStage:8,maxUniformBuffersPerShaderStage:12,maxUniformBufferBindingSize:65536,maxBindGroups:4,maxBindingsPerBindGroup:1000};
assert.ok(SHAPES.every(s=>unsupported(s,limits).length===0));
assert.ok(unsupported(shape,{...limits,maxComputeInvocationsPerWorkgroup:32}).length);
assert.ok(unsupported({M:17,K:19,N:23},{...limits,maxBufferSize:128}).length);
assert.deepEqual(statistics([0,1,2,3]),{count:4,median:1.5,p95:3,min:0,max:3,zeroCount:1});
assert.equal(timestampInterval(9007199254740993n,9007199254806529n).gpuPassDurationNs,65536);
const samples=Array.from({length:30},(_,index)=>({phase:'measured',...timestampInterval(BigInt(index)*6553600n,BigInt(index)*6553600n+65536n),
  submitToCompletionWallMs:1,correctness:{status:'PASS'}}));
const limited=timingStatistics(samples,SHAPES[3]);assert.equal(limited.status,'RESOLUTION_LIMITED');assert.equal(limited.effectiveGflops,null);
samples[0].gpuPassDurationNs=0;const zero=timingStatistics(samples,SHAPES[3]);assert.equal(zero.gpuPassNs.zeroCount,1);
for(const s of samples)s.gpuPassDurationNs=6553600;
assert.ok(timingStatistics(samples,SHAPES[3]).effectiveGflops>0);
assert.equal(timingStatistics([],SHAPES[3]).status,'NOT_MEASURED');
console.log('GEMM001 CPU checks PASS: signed row-major reference, rectangular/boundary addressing, seeds, NaN/Inf/near-zero tolerances, legal limits, BigInt timestamps, nearest-rank stats and resolution/GFLOPs gating. NO phone GPU test.');
