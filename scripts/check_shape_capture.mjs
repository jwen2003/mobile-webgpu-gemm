import assert from 'node:assert/strict';
import {ShapeCapture,writeBufferBytes} from '../src/profiling/shape_capture.mjs';
import {realShapeConfiguration} from '../src/benchmark/real_shape_config.mjs';
globalThis.GPUBufferUsage={UNIFORM:64,COPY_SRC:4,STORAGE:128};
const original=new Uint32Array([99,10,20,30,40,88]),sub=original.subarray(1,5);
assert.deepEqual([...writeBufferBytes(sub,1,2)],Array.from(new Uint8Array(new Uint32Array([20,30]).buffer)));
assert.equal(writeBufferBytes(sub,1).length,12);assert.equal(writeBufferBytes(new DataView(original.buffer,4,16),4,8).length,8);
assert.equal(writeBufferBytes(original.buffer,4,8).length,8);assert.throws(()=>writeBufferBytes(sub,4,1));
const queue={writeBuffer(){return 'native write return';},submit(){return 'native submit return';}};
const device={queue,createShaderModule(){return {};},createComputePipeline(){return {};},createComputePipelineAsync(){return Promise.resolve({});},
  createTexture(){return {width:8,height:512,depthOrArrayLayers:1,format:'rgba16float',dimension:'2d',usage:4,createView(){return {};}};},
  createBindGroupLayout(){return {};},createBindGroup(){return {};},
  createBuffer(d){const data=new ArrayBuffer(d.size);return {...d,getMappedRange(off=0,size=d.size){return data.slice(off,off+size);},unmap(){},destroy(){}};},
  createCommandEncoder(){return {copyBufferToBuffer(){},clearBuffer(){},beginComputePass(){return {setPipeline(){},setBindGroup(){},dispatchWorkgroups(){return 7;},dispatchWorkgroupsIndirect(){},end(){}};},finish(){return {};}};}};
const nativeSubmit=queue.submit,nativeCreate=device.createBuffer,capture=new ShapeCapture('target',{phase:()=> 'GENERATION'});capture.install(device);
const shader=device.createShaderModule({code:'target'}),pipeline=device.createComputePipeline({compute:{module:shader,entryPoint:'main',constants:{0:8,1:4,2:1}}});
const uniform=device.createBuffer({size:1048576,usage:64}),layout=device.createBindGroupLayout({entries:[{binding:3,buffer:{hasDynamicOffset:true}}]});
const texture=device.createTexture(),view=texture.createView({baseMipLevel:0});
const group=device.createBindGroup({layout,entries:[{binding:0,resource:view},{binding:3,resource:{buffer:uniform,offset:722176,size:16}}]});
const encode=()=>{const e=device.createCommandEncoder(),p=e.beginComputePass();p.setPipeline(pipeline);p.setBindGroup(0,group,new Uint32Array([99,0,88]),1,1);assert.equal(p.dispatchWorkgroups(64,1,1),7);p.end();return e.finish();};
const command=encode();assert.equal(queue.writeBuffer(uniform,722176,sub,0,4),'native write return');assert.equal(queue.submit([command]),'native submit return');
const first=capture.export().snapshots[0].bindings[0].entries.find(e=>e.binding===3).uniform;assert.deepEqual(first.i32,[10,20,30,40]);
queue.writeBuffer(uniform,722176,new Int32Array([1,2,3,4]));queue.submit([command]);assert.deepEqual(first.i32,[10,20,30,40]);
assert.deepEqual(capture.export().snapshots[1].bindings[0].entries.find(e=>e.binding===3).uniform.i32,[1,2,3,4]);
assert.equal(capture.export().selectedEncoded,1);assert.equal(capture.export().selectedSubmitted,2);
const src=device.createBuffer({size:1024,usage:4}),e=device.createCommandEncoder();e.copyBufferToBuffer(src,0,uniform,722176,16);
const pass=e.beginComputePass();pass.setPipeline(pipeline);pass.setBindGroup(0,group,[0]);pass.dispatchWorkgroups(64);pass.end();queue.submit([e.finish()]);
assert.equal(capture.export().snapshots[2].bindings[0].entries.find(e=>e.binding===3).uniform.status,'UNKNOWN');
const staging=device.createBuffer({size:16,usage:4,mappedAtCreation:true});new Int32Array(staging.getMappedRange()).set([5,6,7,8]);staging.unmap();
const e2=device.createCommandEncoder();e2.copyBufferToBuffer(staging,0,uniform,722176,16);const p2=e2.beginComputePass();p2.setPipeline(pipeline);p2.setBindGroup(0,group,[0]);p2.dispatchWorkgroups(64);p2.end();queue.submit([e2.finish()]);
assert.deepEqual(capture.export().snapshots[3].bindings[0].entries.find(e=>e.binding===3).uniform.i32,[5,6,7,8]);
assert.equal(capture.export().coverageFailures.length,0);assert.equal(capture.export().collectorRevision,'SHAPE001-uniform-arena-v2');assert.equal(capture.export().shadowHostArrayBytes,capture.export().shadowBytes*10);assert.doesNotThrow(()=>JSON.stringify(capture.export()));capture.stop();assert.equal(queue.submit,nativeSubmit);assert.equal(device.createBuffer,nativeCreate);
assert.throws(()=>realShapeConfiguration({status:'WAITING_FOR_SHAPE_EVIDENCE'}));
const evidence={status:'REVIEWED_LOGICAL_SHAPE',shape:{M:1,K:17,N:19},rawSha256:'a'.repeat(64),rawPath:'CPU MOCK',reviewDocument:'CPU MOCK',proofs:Object.fromEntries(['M','N','K','padding','batchHead','rowMajorMapping'].map(k=>[k,'CPU MOCK']))};
assert.equal(Object.keys(realShapeConfiguration(evidence).VARIANTS).length,3);evidence.shape.M=128;assert.equal(Object.keys(realShapeConfiguration(evidence).VARIANTS).length,2);
evidence.proofs.padding='UNKNOWN';assert.throws(()=>realShapeConfiguration(evidence));
console.log('SHAPE001 CPU/native-mock checks PASS: source/dynamic offsets, queue-order versions, repeat submit, GPU unknown/known copies, return/restoration, gated shape. NO phone evidence.');

const limited=new ShapeCapture('target',{maxShadowBytes:16});limited.install(device);device.createBuffer({size:1048576,usage:64});assert.equal(limited.export().status,'INCOMPLETE');assert.match(limited.export().coverageFailures[0],/size=1048576/);limited.stop();
