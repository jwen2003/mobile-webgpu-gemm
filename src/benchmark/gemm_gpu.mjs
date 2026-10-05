// Shared GEMM001/GEMM002 GPU boundaries and error handling; shader math is untouched.
import { compare } from './gemm_math.mjs';
import { timestampInterval } from './timing_math.mjs';
export function allLimits(source) {
  const names=new Set();for(let o=source;o&&o!==Object.prototype;o=Object.getPrototypeOf(o))
    for(const k of Object.getOwnPropertyNames(o))if(typeof source[k]==='number')names.add(k);
  return Object.fromEntries([...names].sort().map(k=>[k,source[k]]));
}
export async function withGpuErrors({device,report,fail},stage,action) {
  let exception,value;const before=report.errors.length;
  for(const filter of ['internal','out-of-memory','validation'])device.pushErrorScope(filter);
  try{value=await action();}catch(e){exception=e;}
  finally{for(let i=0;i<3;i++)try{const error=await device.popErrorScope();if(error)fail(stage,error);}catch(e){fail(stage+' scope',e);}}
  if(exception)throw exception;if(report.errors.length>before)throw new Error(`${stage}: GPU error scope`);return value;
}
export function sampleBase(phase,index) {
  return {phase,index,startTimestamp:null,endTimestamp:null,gpuPassDurationNs:null,
    gpuPassDurationMs:null,submitToCompletionWallMs:null,mapReadbackWallMs:null,cpuCorrectnessWallMs:null,
    correctness:null,visibilityStateBefore:document.visibilityState,visibilityStateAfter:null};
}
export async function executeGemmPass(context,state,pipeline,sample,workgroup=[8,8,1]) {
  const {device,report,fail}=context;
  if(context.lost||report.errors.some(e=>e.stage!=='CPU correctness'))throw new Error('GPU/runtime error before pass');
  let actual;
  await withGpuErrors({device,report,fail},'pass encode/submit/readback',async()=>{
    const encoder=device.createCommandEncoder();
    const descriptor=state.query?{timestampWrites:{querySet:state.query,beginningOfPassWriteIndex:0,endOfPassWriteIndex:1}}:{};
    const pass=encoder.beginComputePass(descriptor);pass.setPipeline(pipeline);pass.setBindGroup(0,state.bindings);
    const outputWorkgroup=state.outputWorkgroupShape||workgroup;
    pass.dispatchWorkgroups(Math.ceil(state.shape.N/outputWorkgroup[0]),Math.ceil(state.shape.M/outputWorkgroup[1]),1);pass.end();
    if(state.query){encoder.resolveQuerySet(state.query,0,2,state.resolve,0);encoder.copyBufferToBuffer(state.resolve,0,state.timestamps,0,16);}
    encoder.copyBufferToBuffer(state.c,0,state.readback,0,state.bytes);
    const command=encoder.finish(),start=performance.now();device.queue.submit([command]);
    await device.queue.onSubmittedWorkDone();sample.submitToCompletionWallMs=performance.now()-start;
    // Optional full-path boundary ends before timestamp/output maps and CPU checks.
    if(sample.fullPathStartWallMs!==undefined)sample.completePathWallMs=performance.now()-sample.fullPathStartWallMs;
    const mapStart=performance.now();
    if(state.timestamps){try{await state.timestamps.mapAsync(GPUMapMode.READ);
      const v=new BigUint64Array(state.timestamps.getMappedRange());if(v[1]<v[0])throw new Error('Timestamp end precedes start');
      Object.assign(sample,timestampInterval(v[0],v[1]));}
      finally{if(state.timestamps.mapState==='mapped')state.timestamps.unmap();}}
    try{await state.readback.mapAsync(GPUMapMode.READ);actual=new Float32Array(state.readback.getMappedRange()).slice();}
    finally{if(state.readback.mapState==='mapped')state.readback.unmap();}
    sample.mapReadbackWallMs=performance.now()-mapStart;
    const checkStart=performance.now();sample.correctness=context.correctnessCheck?context.correctnessCheck(actual,state):compare(actual,state.reference,state.kind);
    sample.cpuCorrectnessWallMs=performance.now()-checkStart;
    sample.correctness.worst.row=Math.floor(sample.correctness.worst.index/state.shape.N);
    sample.correctness.worst.column=sample.correctness.worst.index%state.shape.N;
  });
  sample.visibilityStateAfter=document.visibilityState;
  return actual;
}
