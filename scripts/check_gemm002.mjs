// Synthetic CPU/fake-native checks only; never exported as phone results.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {inputs,cpuReference,compare} from '../src/benchmark/gemm_math.mjs';
import {CASES,shapeOrder,roundOrder,variantUnsupported,comparisonStatistics} from '../src/benchmark/gemm_pair_math.mjs';
import {executeGemmPass,sampleBase,withGpuErrors} from '../src/benchmark/gemm_gpu.mjs';
const source=await readFile(new URL('../src/benchmark/gemm_tiled.wgsl',import.meta.url),'utf8');
assert.equal((source.match(/workgroupBarrier\(\)/g)||[]).length,2);
assert.ok(!/\breturn\b/.test(source));
assert.match(source,/@workgroup_size\(16, 16, 1\)/);
assert.match(source,/tileA\[slot\] = 0.0/);assert.match(source,/tileB\[slot\] = 0.0/);
// Independently simulate collective tile loading, padded lanes and FP32 dot products.
function tiled(s,A,B){const C=new Float32Array(s.M*s.N).fill(NaN);
  for(let gy=0;gy<Math.ceil(s.M/16);gy++)for(let gx=0;gx<Math.ceil(s.N/16);gx++){
    const sums=new Float32Array(256);
    for(let base=0;base<s.K;base+=16){const ta=new Float32Array(256),tb=new Float32Array(256);
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){
        const row=gy*16+y,col=gx*16+x,slot=y*16+x;
        if(row<s.M&&base+x<s.K)ta[slot]=A[row*s.K+base+x];
        if(base+y<s.K&&col<s.N)tb[slot]=B[(base+y)*s.N+col];
      }
      for(let y=0;y<16;y++)for(let x=0;x<16;x++)for(let k=0;k<16;k++)
        sums[y*16+x]=Math.fround(sums[y*16+x]+Math.fround(ta[y*16+k]*tb[k*16+x]));
    }
    for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(gy*16+y<s.M&&gx*16+x<s.N)C[(gy*16+y)*s.N+gx*16+x]=sums[y*16+x];
  }return C;
}
for(const s of CASES.filter(s=>!s.performance))for(const kind of ['integer','fractional']){
  const {A,B}=inputs(s,kind);assert.equal(compare(tiled(s,A,B),cpuReference(s,A,B),kind).status,'PASS');
}
assert.deepEqual(shapeOrder(),shapeOrder());
for(const s of shapeOrder()){const p=roundOrder(s);assert.deepEqual(p,roundOrder(s));
  assert.equal(p.rounds.filter(r=>r.order[0]==='naive').length,15);assert.equal(p.rounds.filter(r=>r.order[0]==='tiled').length,15);
  assert.equal(new Set(p.rounds.map(r=>r.roundId)).size,30);
}
const limits={maxBufferSize:2**28,maxStorageBufferBindingSize:2**27,maxComputeWorkgroupSizeX:256,maxComputeWorkgroupSizeY:256,maxComputeWorkgroupSizeZ:64,
  maxComputeInvocationsPerWorkgroup:256,maxComputeWorkgroupsPerDimension:65535,maxComputeWorkgroupStorageSize:16384,maxStorageBuffersPerShaderStage:8,
  maxUniformBuffersPerShaderStage:12,maxUniformBufferBindingSize:65536,maxBindGroups:4,maxBindingsPerBindGroup:1000};
assert.ok(CASES.every(s=>variantUnsupported(s,limits,'tiled').length===0));
assert.ok(variantUnsupported(CASES[0],{...limits,maxComputeInvocationsPerWorkgroup:128},'tiled').length);
assert.ok(variantUnsupported(CASES[0],{...limits,maxComputeWorkgroupStorageSize:1024},'tiled').length);
const samples=[],pairs=[];
for(const phase of ['warmup','measured'])for(let roundId=0;roundId<(phase==='warmup'?10:30);roundId++){
  pairs.push({phase,roundId,correctness:{status:'PASS'}});
  for(const variant of ['naive','tiled']){const start=BigInt(samples.length)*65601536n,d=variant==='naive'?6553600n:13107200n;
    samples.push({phase,roundId,variant,startTimestamp:String(start),endTimestamp:String(start+d),gpuPassDurationNs:Number(d),submitToCompletionWallMs:1,correctness:{status:'PASS'}});
  }
}
const stats=comparisonStatistics(samples,shapeOrder()[0],pairs);assert.equal(stats.speedup,.5);assert.equal(stats.pairedDurationRatios.median,.5);
samples[20].gpuPassDurationNs=0;assert.equal(comparisonStatistics(samples,shapeOrder()[0],pairs).speedup,null);samples[20].gpuPassDurationNs=6553600;
assert.equal(comparisonStatistics(samples.slice(1),shapeOrder()[0],pairs).speedup,null);
const duplicate=structuredClone(samples);duplicate[22].roundId=0;assert.equal(comparisonStatistics(duplicate,shapeOrder()[0],pairs).speedup,null);
assert.doesNotThrow(()=>JSON.parse(JSON.stringify(stats)));
// Native-call mock verifies pass boundaries, serial timestamp/readback unmap and dispatch dimensions.
globalThis.document={visibilityState:'visible'};globalThis.GPUMapMode={READ:1};
const events=[],errors=[],buffer=data=>({mapState:'unmapped',async mapAsync(){events.push('map');this.mapState='mapped';},
  getMappedRange(){return data.buffer;},unmap(){events.push('unmap');this.mapState='unmapped';}});
const pass={setPipeline(){events.push('pipeline');},setBindGroup(){},dispatchWorkgroups(...args){events.push(args);},end(){events.push('end');}};
const encoder={beginComputePass(d){assert.equal(d.timestampWrites.endOfPassWriteIndex,1);events.push('begin');return pass;},
  resolveQuerySet(){events.push('resolve');},copyBufferToBuffer(){events.push('copy');},finish(){events.push('finish');return {};}};
const device={pushErrorScope(){},async popErrorScope(){return null;},createCommandEncoder(){return encoder;},queue:{submit(){events.push('submit');},async onSubmittedWorkDone(){events.push('done');}}};
const context={device,report:{errors},fail(stage,e){errors.push({stage,message:e.message});},lost:false};
const state={shape:{M:17,N:23,K:19},kind:'integer',query:{},resolve:{},timestamps:buffer(new BigUint64Array([9007199254740993n,9007199254806529n])),
  readback:buffer(new Float32Array(17*23)),reference:new Float64Array(17*23),bytes:17*23*4,c:{},bindings:{}};
for(const wg of [[8,8,1],[16,16,1]]){events.length=0;const sample=sampleBase('measured',0);await executeGemmPass(context,state,{},sample,wg);
  assert.deepEqual(events.find(Array.isArray),[Math.ceil(23/wg[0]),Math.ceil(17/wg[1]),1]);
  assert.ok(events.indexOf('end')<events.indexOf('resolve'));assert.ok(events.indexOf('done')<events.indexOf('map'));
  assert.equal(events.filter(e=>e==='submit').length,1);assert.equal(events.filter(e=>e==='unmap').length,2);
  assert.equal(sample.gpuPassDurationNs,65536);assert.equal(sample.correctness.status,'PASS');assert.doesNotThrow(()=>JSON.stringify(sample));
}
let pops=0;const original=new Error('native failure');
await assert.rejects(withGpuErrors({...context,device:{pushErrorScope(){},async popErrorScope(){pops++;return null;}}},'test',()=>{throw original;}),e=>e===original);
assert.equal(pops,3);
state.readback.mapAsync=async function(){throw new Error('map failure');};
await assert.rejects(executeGemmPass(context,state,{},sampleBase('measured',1)),/map failure/);assert.equal(state.timestamps.mapState,'unmapped');
// Exercise the real page controller/export/cleanup with a tiny mock device. Performance
// shapes are intentionally unsupported here; these values are NEVER phone evidence.
const elements=new Map();
for(const id of ['run','download','status','summary','thermal','charging','devtools','flag'])
  elements.set(id,{value:'UNKNOWN',disabled:false,textContent:'',listeners:{},addEventListener(event,fn){this.listeners[event]=fn;}});
let downloaded;
globalThis.document={visibilityState:'visible',hidden:false,getElementById:id=>elements.get(id),addEventListener(){},createElement(){return {click(){}};}};
globalThis.isSecureContext=true;globalThis.location={href:'http://localhost:8000/src/benchmark/gemm002.html'};
globalThis.GPUBufferUsage={STORAGE:128,COPY_DST:8,COPY_SRC:4,UNIFORM:64,QUERY_RESOLVE:512,MAP_READ:1};
const allocations=[],mockLimits={...limits,maxBufferSize:2048,maxStorageBufferBindingSize:2048};
const mockDevice={features:new Set(['timestamp-query']),limits:mockLimits,lost:new Promise(()=>{}),addEventListener(){},destroy(){},
  pushErrorScope(){},async popErrorScope(){return null;},
  createBuffer(d){const b={...d,data:new ArrayBuffer(d.size),mapState:'unmapped',destroyed:false,destroy(){this.destroyed=true;},
    async mapAsync(){this.mapState='mapped';},getMappedRange(){return this.data;},unmap(){this.mapState='unmapped';}};allocations.push(b);return b;},
  createQuerySet(){const q={destroyed:false,destroy(){this.destroyed=true;}};allocations.push(q);return q;},
  createBindGroup(d){return d;},createShaderModule(){return {async getCompilationInfo(){return {messages:[]};}};},
  async createComputePipelineAsync(){return {getBindGroupLayout(){return {};}};},
  createCommandEncoder(){let bindings;const commands=[];return {beginComputePass(){return {setPipeline(){},setBindGroup(_,b){bindings=b;},
    dispatchWorkgroups(){const current=bindings;commands.push(()=>{const [a,b,c,u]=current.entries.map(e=>e.resource.buffer),[M,N,K]=new Uint32Array(u.data);
      new Float32Array(c.data).set(cpuReference({M,N,K},new Float32Array(a.data),new Float32Array(b.data)));});},end(){}};},
    resolveQuerySet(q,first,count,b){commands.push(()=>new BigUint64Array(b.data).set([10000000n,10065536n]));},
    copyBufferToBuffer(a,off,b,dst,size){commands.push(()=>new Uint8Array(b.data,dst,size).set(new Uint8Array(a.data,off,size)));},finish(){return commands;}};},
  queue:{writeBuffer(b,offset,data){new Uint8Array(b.data,offset,data.byteLength).set(new Uint8Array(data.buffer,data.byteOffset,data.byteLength));},
    submit(commands){for(const list of commands)for(const action of list)action();},async onSubmittedWorkDone(){}}};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{userAgent:'CPU MOCK — NOT PHONE',gpu:{async requestAdapter(){return {
  features:new Set(['timestamp-query']),limits:mockLimits,info:{vendor:'',architecture:'',device:'',description:''},async requestDevice(){return mockDevice;}};}}}});
globalThis.fetch=async path=>({ok:true,async text(){return readFile(new URL('../src/benchmark/'+path.replace('./',''),import.meta.url),'utf8');}});
const originalCreate=URL.createObjectURL;URL.createObjectURL=blob=>{downloaded=blob;return 'blob:mock';};URL.revokeObjectURL=()=>{};
await import('../src/benchmark/gemm002.js');assert.equal(elements.get('status').textContent,'NOT_RUN');
elements.get('run').listeners.click();
while(elements.get('run').disabled)await new Promise(resolve=>setTimeout(resolve,5));
elements.get('download').listeners.click();const exported=JSON.parse(await downloaded.text());
assert.equal(exported.status,'INCOMPLETE');assert.equal(exported.errors.length,0);
assert.equal(exported.correctness.filter(c=>c.status==='PASS').length,8);assert.equal(exported.performance.filter(c=>c.status==='SKIPPED').length,2);
assert.ok(exported.resources.length>0&&exported.resources.every(r=>r.destroyed));assert.ok(allocations.every(r=>r.destroyed&&r.mapState!=='mapped'));
assert.equal(exported.environment.adapter.info.vendor,'');assert.equal(exported.environment.manualState.thermal,'UNKNOWN');
assert.ok(exported.shaders.naive.sha256&&exported.shaders.tiled.sha256);URL.createObjectURL=originalCreate;
console.log('GEMM002 CPU/static/fake-native checks PASS: collective tails, fixed thresholds, balanced seeded pairs, limits, speedup/zero/incomplete gating, serial query reuse, mapping/error scopes, page JSON export and resource cleanup. NO phone GPU test.');
