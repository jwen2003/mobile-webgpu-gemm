// CPU/static/fake-device tests. No phone results or fabricated raw files.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {inputs,cpuReference,compare} from '../src/benchmark/gemm_math.mjs';
import {CASES,VARIANTS,roundOrder,variantUnsupported,comparisonStatistics} from '../src/benchmark/gemm_triple_math.mjs';
const source=await readFile(new URL('../src/benchmark/gemm_m1.wgsl',import.meta.url),'utf8');
assert.equal((source.match(/workgroupBarrier\(\)/g)||[]).length,2);assert.ok(!/\breturn\b/.test(source));
assert.match(source,/@workgroup_size\(64, 1, 1\)/);assert.ok(!source.includes('select('));
assert.match(source,/if \(n < dims.N\)/);assert.match(source,/if \(globalK < dims.K\)/);
function specialized(s,A,B){const C=new Float32Array(s.N).fill(NaN);let invalidBReads=0;
  for(let group=0;group<Math.ceil(s.N/64);group++){
    const sums=new Float32Array(64);
    for(let base=0;base<s.K;base+=64){const tile=new Float32Array(64);
      for(let lane=0;lane<64;lane++)if(base+lane<s.K)tile[lane]=A[base+lane];
      for(let lane=0;lane<64;lane++){const n=group*64+lane;
        if(n<s.N)for(let k=0;k<64;k++)if(base+k<s.K){const index=(base+k)*s.N+n;
          if(index>=B.length)invalidBReads++;sums[lane]=Math.fround(sums[lane]+Math.fround(tile[k]*B[index]));}
      }
    }
    for(let lane=0;lane<64;lane++)if(group*64+lane<s.N)C[group*64+lane]=sums[lane];
  }assert.equal(invalidBReads,0);return C;
}
for(const shape of CASES)for(const kind of ['integer','fractional']){
  const {A,B}=inputs(shape,kind);assert.equal(compare(specialized(shape,A,B),cpuReference(shape,A,B),kind).status,'PASS');
}
const plan=roundOrder(CASES.at(-1));assert.deepEqual(plan,roundOrder(CASES.at(-1)));
const orders=new Map();for(const r of plan.rounds)orders.set(r.order.join('/'),(orders.get(r.order.join('/'))||0)+1);
assert.equal(orders.size,6);assert.ok([...orders.values()].every(n=>n===5));
const limits={maxBufferSize:2**28,maxStorageBufferBindingSize:2**27,maxComputeWorkgroupSizeX:256,maxComputeWorkgroupSizeY:256,maxComputeWorkgroupSizeZ:64,
  maxComputeInvocationsPerWorkgroup:256,maxComputeWorkgroupsPerDimension:65535,maxComputeWorkgroupStorageSize:16384,maxStorageBuffersPerShaderStage:8,
  maxUniformBuffersPerShaderStage:12,maxUniformBufferBindingSize:65536,maxBindGroups:4,maxBindingsPerBindGroup:1000};
assert.ok(variantUnsupported({...CASES[0],M:2},limits,'specialized').some(s=>s.includes('M=1')));
assert.ok(variantUnsupported(CASES[0],{...limits,maxComputeWorkgroupStorageSize:128},'specialized').length);
assert.ok(variantUnsupported(CASES.at(-1),{...limits,maxComputeWorkgroupsPerDimension:15},'specialized').length);
const samples=[],pairs=[];
for(const phase of ['warmup','measured'])for(let roundId=0;roundId<(phase==='warmup'?10:30);roundId++){
  pairs.push({phase,roundId,correctness:{status:'PASS'}});
  for(const [variant,d] of [['naive',6553600],['tiled',13107200],['specialized',3276800]]){
    const start=BigInt(samples.length)*65601536n;
    samples.push({phase,roundId,variant,startTimestamp:String(start),endTimestamp:String(start+BigInt(d)),gpuPassDurationNs:d,submitToCompletionWallMs:1,correctness:{status:'PASS'}});
  }
}
let stats=comparisonStatistics(samples,CASES.at(-1),pairs);
assert.equal(stats.ratios['naive/specialized'].value,2);assert.equal(stats.ratios['tiled/specialized'].value,4);
assert.equal(stats.ratios['naive/tiled'].value,.5);
samples[32].gpuPassDurationNs=0;stats=comparisonStatistics(samples,CASES.at(-1),pairs);
assert.equal(stats.ratios['naive/specialized'].value,null);assert.equal(stats.ratios['naive/tiled'].value,.5);
assert.equal(comparisonStatistics(samples.slice(1),CASES.at(-1),pairs).ratios['naive/tiled'].value,null);
assert.doesNotThrow(()=>JSON.stringify(stats));
// Exercise the real controller with cached CPU mock outputs, including all120 timed
// calls. Synthetic timestamps are resolution-limited; never write these as phone data.
const elements=new Map();
for(const id of ['run','download','status','summary','thermal','charging','devtools','flag'])
  elements.set(id,{value:'UNKNOWN',disabled:false,textContent:'',listeners:{},addEventListener(event,fn){this.listeners[event]=fn;}});
let downloaded;
globalThis.document={visibilityState:'visible',hidden:false,getElementById:id=>elements.get(id),addEventListener(){},createElement(){return {click(){}};}};
globalThis.isSecureContext=true;globalThis.location={href:'http://localhost:8000/src/benchmark/gemm003.html'};
globalThis.GPUBufferUsage={STORAGE:128,COPY_DST:8,COPY_SRC:4,UNIFORM:64,QUERY_RESOLVE:512,MAP_READ:1};
globalThis.GPUMapMode={READ:1};
const allocations=[],mockLimits={...limits,maxBufferSize:8388608,maxStorageBufferBindingSize:8388608},mockOutputs=new WeakMap();
const mockDevice={features:new Set(['timestamp-query']),limits:mockLimits,lost:new Promise(()=>{}),addEventListener(){},destroy(){},
  pushErrorScope(){},async popErrorScope(){return null;},
  createBuffer(d){const b={...d,data:new ArrayBuffer(d.size),mapState:'unmapped',destroyed:false,destroy(){this.destroyed=true;},
    async mapAsync(){this.mapState='mapped';},getMappedRange(){return this.data;},unmap(){this.mapState='unmapped';}};allocations.push(b);return b;},
  createQuerySet(){const q={destroyed:false,destroy(){this.destroyed=true;}};allocations.push(q);return q;},
  createBindGroup(d){return d;},createShaderModule(){return {async getCompilationInfo(){return {messages:[]};}};},
  async createComputePipelineAsync(){return {getBindGroupLayout(){return {};}};},
  createCommandEncoder(){let bindings;const commands=[];return {beginComputePass(){return {setPipeline(){},setBindGroup(_,b){bindings=b;},
    dispatchWorkgroups(){const current=bindings;commands.push(()=>{const [a,b,c,u]=current.entries.map(e=>e.resource.buffer),[M,N,K]=new Uint32Array(u.data);
      if(!mockOutputs.has(a))mockOutputs.set(a,cpuReference({M,N,K},new Float32Array(a.data),new Float32Array(b.data)));
      new Float32Array(c.data).set(mockOutputs.get(a));});},end(){}};},
    resolveQuerySet(q,first,count,b){commands.push(()=>new BigUint64Array(b.data).set([10000000n,10065536n]));},
    copyBufferToBuffer(a,off,b,dst,size){commands.push(()=>new Uint8Array(b.data,dst,size).set(new Uint8Array(a.data,off,size)));},finish(){return commands;}};},
  queue:{writeBuffer(b,offset,data){new Uint8Array(b.data,offset,data.byteLength).set(new Uint8Array(data.buffer,data.byteOffset,data.byteLength));},
    submit(commands){for(const list of commands)for(const action of list)action();},async onSubmittedWorkDone(){}}};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{userAgent:'CPU MOCK — NOT PHONE',gpu:{async requestAdapter(){return {
  features:new Set(['timestamp-query']),limits:mockLimits,info:{vendor:'',architecture:'',device:'',description:''},async requestDevice(){return mockDevice;}};}}}});
globalThis.fetch=async path=>({ok:true,async text(){return readFile(new URL('../src/benchmark/'+path.replace('./',''),import.meta.url),'utf8');}});
const originalCreate=URL.createObjectURL;URL.createObjectURL=blob=>{downloaded=blob;return 'blob:mock';};URL.revokeObjectURL=()=>{};
await import('../src/benchmark/gemm003.js');assert.equal(elements.get('status').textContent,'NOT_RUN');
elements.get('run').listeners.click();
while(elements.get('run').disabled)await new Promise(resolve=>setTimeout(resolve,5));
elements.get('download').listeners.click();const exported=JSON.parse(await downloaded.text());
assert.equal(exported.status,'COMPLETE');assert.equal(exported.errors.length,0);
assert.equal(exported.correctness.filter(c=>c.status==='PASS').length,10);assert.equal(exported.performance[0].samples.length,120);
assert.equal(exported.performance[0].pairComparisons.length,40);
assert.ok(Object.values(exported.performance[0].statistics.ratios).every(r=>r.value===null));
assert.ok(exported.resources.length>0&&exported.resources.every(r=>r.destroyed));assert.ok(allocations.every(r=>r.destroyed&&r.mapState!=='mapped'));
assert.equal(exported.environment.adapter.info.vendor,'');assert.equal(exported.environment.manualState.thermal,'UNKNOWN');
assert.ok(exported.shaders.naive.sha256&&exported.shaders.tiled.sha256);URL.createObjectURL=originalCreate;
assert.ok(exported.correctness.filter(c=>!c.shape.performance).every(c=>c.fullArrays && Object.keys(c.fullArrays.outputs).length===3));
for(const c of exported.correctness.filter(c=>!c.shape.performance)){
  const ref=cpuReference(c.shape,new Float32Array(c.fullArrays.A),new Float32Array(c.fullArrays.B));
  assert.deepEqual([...ref],c.fullArrays.cpuReference);
  for(const out of Object.values(c.fullArrays.outputs))assert.equal(compare(new Float32Array(out),ref,c.kind).status,'PASS');
}
// Partial-allocation failure must also restore controls, clean resources and export.
const createBuffer=mockDevice.createBuffer;let calls=0;
mockDevice.createBuffer=function(d){if(++calls===3)throw new Error('injected allocation failure');return createBuffer.call(this,d);};
elements.get('run').listeners.click();while(elements.get('run').disabled)await new Promise(resolve=>setTimeout(resolve,5));
URL.createObjectURL=blob=>{downloaded=blob;return 'blob:mock';};
elements.get('download').listeners.click();const failed=JSON.parse(await downloaded.text());
assert.equal(failed.status,'ERROR');assert.ok(failed.errors.some(e=>e.message.includes('injected allocation failure')));
assert.ok(failed.resources.every(r=>r.destroyed));assert.equal(elements.get('download').disabled,false);URL.createObjectURL=originalCreate;
console.log('GEMM003 CPU/static/fake-native checks PASS: collective tails, fixed thresholds, six balanced permutations, limits, ratio/resolution gating, full120-pass controller, small-array replay, success/failure JSON export and cleanup. NO phone GPU test.');
