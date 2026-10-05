// Synthetic/mock outputs are held in memory only, never results/raw.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {intervalDiagnostics} from '../src/benchmark/timestamp_control_math.mjs';
const sample=(id,a,b)=>({passId:id,commandBufferId:id,submitId:id,startTimestamp:String(a),endTimestamp:String(b),gpuPassDurationNs:Number(b-a)});
const diagnostic=intervalDiagnostics([sample('a',9007199254740993n,9007199254872065n),sample('b',9007199254806529n,9007199254937601n)]);
assert.equal(diagnostic.adjacent[0].overlapNs,'65536');assert.equal(diagnostic.atMost65536Ns,1);assert.equal(diagnostic.cause.startsWith('UNKNOWN'),true);
const elements=new Map();for(const id of ['run','download','status','summary','thermal','charging','devtools','flag'])elements.set(id,{value:'UNKNOWN',listeners:{},addEventListener(k,f){this.listeners[k]=f;}});
globalThis.document={visibilityState:'visible',getElementById:id=>elements.get(id),addEventListener(){},createElement(){return {click(){}};}};
globalThis.isSecureContext=true;globalThis.location={href:'http://localhost:8000/src/benchmark/timestamp_control.html'};
globalThis.GPUBufferUsage={STORAGE:128,COPY_DST:8,COPY_SRC:4,UNIFORM:64,QUERY_RESOLVE:512,MAP_READ:1};globalThis.GPUMapMode={READ:1};
const limits={maxBufferSize:2**28,maxStorageBufferBindingSize:2**27,maxComputeWorkgroupSizeX:256,maxComputeInvocationsPerWorkgroup:256,
  maxComputeWorkgroupsPerDimension:65535,maxStorageBuffersPerShaderStage:8,maxUniformBufferBindingSize:65536};
const resources=[];let clock=9007199254740993n,submits=0,waits=0;
const device={limits,features:new Set(['timestamp-query']),destroy(){},lost:new Promise(()=>{}),addEventListener(){},pushErrorScope(){},async popErrorScope(){return null;},
  createBuffer(d){const b={...d,data:new ArrayBuffer(d.size),mapState:'unmapped',destroyed:false,async mapAsync(){this.mapState='mapped';},getMappedRange(){return this.data;},unmap(){this.mapState='unmapped';},destroy(){this.destroyed=true;}};resources.push(b);return b;},
  createQuerySet(d){const q={...d,values:new BigUint64Array(d.count),destroyed:false,destroy(){this.destroyed=true;}};resources.push(q);return q;},
  createShaderModule(){return {async getCompilationInfo(){return {messages:[]};}};},async createComputePipelineAsync(){return {getBindGroupLayout(){return {};}};},createBindGroup(d){return d;},
  createCommandEncoder(){const commands=[];return {beginComputePass(desc){const t=desc.timestampWrites;commands.push(()=>{t.querySet.values[t.beginningOfPassWriteIndex]=clock;});let group;
    return {setPipeline(){},setBindGroup(_,g){group=g;},dispatchWorkgroups(){const g=group;commands.push(()=>{
      const [a,b,c]=g.entries.map(e=>e.resource.buffer);const state=a.symbol||{base:new Float32Array(a.data).slice(),delta:0};c.symbol={base:state.base,delta:state.delta+1};clock+=65536n;
    });},end(){commands.push(()=>{t.querySet.values[t.endOfPassWriteIndex]=clock;clock+=65536n;});}};},
    copyBufferToBuffer(a,off,b,dst,size){commands.push(()=>{if(a.symbol){const out=new Float32Array(b.data);for(let i=0;i<out.length;i++)out[i]=a.symbol.base[i]+a.symbol.delta;}
      else new Uint8Array(b.data,dst,size).set(new Uint8Array(a.data,off,size));});},
    resolveQuerySet(q,first,count,b){commands.push(()=>new BigUint64Array(b.data).set(q.values.subarray(first,first+count)));},finish(){return commands;}};},
  queue:{writeBuffer(b,offset,data){new Uint8Array(b.data,offset,data.byteLength).set(new Uint8Array(data.buffer,data.byteOffset,data.byteLength));b.symbol=null;},submit(lists){submits++;for(const list of lists)for(const cmd of list)cmd();},async onSubmittedWorkDone(){waits++;}}};
Object.defineProperty(globalThis,'navigator',{value:{userAgent:'CPU MOCK',gpu:{async requestAdapter(){return {features:new Set(['timestamp-query']),limits,info:{},async requestDevice(){return device;}};}}},configurable:true});
globalThis.fetch=async path=>({ok:true,async text(){return readFile(new URL('../src/benchmark/'+path.replace('./',''),import.meta.url),'utf8');}});
let blob;URL.createObjectURL=b=>{blob=b;return 'blob:mock';};URL.revokeObjectURL=()=>{};
await import('../src/benchmark/timestamp_control.js');assert.equal(elements.get('status').textContent,'NOT_RUN');elements.get('run').listeners.click();
while(elements.get('run').disabled)await new Promise(r=>setTimeout(r,5));elements.get('download').listeners.click();const d=JSON.parse(await blob.text());
assert.equal(d.status,'COMPLETE');assert.equal(d.errors.length,0);assert.equal(d.modes.length,3);
for(const mode of d.modes){assert.equal(mode.samples.length,8);assert.equal(mode.correctness.length,8);assert.ok(mode.correctness.every(c=>c.status==='PASS'&&c.nonFiniteCount===0));
  assert.equal(new Set(mode.samples.flatMap(s=>s.queryIndices)).size,16);assert.equal(mode.diagnostics.observedTimestampDifferenceGcdNs,'65536');
  assert.equal(mode.diagnostics.startInversions,0);assert.equal(mode.diagnostics.endInversions,0);assert.ok(mode.samples.every(s=>s.gpuPassDurationNs===32*65536));
}
assert.equal(d.modes[0].submissions.length,2);assert.equal(d.modes[1].submissions.length,9);assert.equal(d.modes[2].submissions.filter(s=>s.waited).length,8);
assert.equal(submits,20);assert.equal(waits,14);assert.ok(resources.every(r=>r.destroyed&&r.mapState!=='mapped'));assert.ok(d.resources.every(r=>r.destroyed));
console.log('TIMING002 static/math/fake-native checks PASS: unique slots, dependencies, three submission modes, final resolve/map, full24 output checks, BigInt intervals, zero/grid/overlap and cleanup. NO phone GPU evidence.');
