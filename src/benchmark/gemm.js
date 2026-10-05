import { INPUT_SEED, ORDER_SEED, WORKGROUP, SHAPES, REAL_SHADER, TOLERANCES, inputs, cpuReference,
  compare, configurationOrder, unsupported, timingStatistics } from './gemm_math.mjs';
import { allLimits, withGpuErrors, executeGemmPass } from './gemm_gpu.mjs';
const ui = Object.fromEntries(['run','download','status','summary','thermal','charging','devtools','flag']
  .map(id => [id,document.getElementById(id)]));
const iso = () => new Date().toISOString();
let device = null, busy = false, lost = false, sampling = false;
function fresh() {
  return { schemaVersion:1, experimentId:'GEMM001', status:'NOT_RUN', startIsoTime:null,endIsoTime:null,
    environment:{ isoTime:iso(),userAgent:navigator.userAgent,secureContext:isSecureContext,pageUrl:location.href,
      adapter:null,device:null,manualState:Object.fromEntries(['thermal','charging','devtools','flag'].map(k=>[k,ui[k].value.trim()||'UNKNOWN'])) },
    visibility:{initialState:document.visibilityState,enteredBackground:document.hidden,samplingEnteredBackground:false,events:[]},
    contract:{ operation:'C=A*B',A:'row-major [M,K]',B:'row-major [K,N]',C:'row-major [M,N]',
      inputOutputDtype:'FP32',accumulation:'FP32; implementation may contract multiply/add into FMA',
      bias:false,activation:false,quantization:false,workgroup:WORKGROUP,uniform:'u32 [M,N,K,padding], 16 bytes',
      shaderSource:null,shaderSha256:null,shaderPath:'src/benchmark/gemm_naive.wgsl' },
    shapeEvidence:REAL_SHADER,shapes:SHAPES,input:{ seed:INPUT_SEED,algorithm:'xorshift32, A then B, same nonzero seed independently per shape/family',
      integer:'(nextU32 % 7)-3, exact products [-9,9], max absolute partial sum <=9*K <2^24',
      fractional:'fround(((nextU32 % 2001)-1000)/1000), bounded [-1,1], stored FP32 inputs' },
    reference:{method:'CPU independent i-k-j traversal, Float64Array accumulator, JS binary64 arithmetic from stored FP32 A/B',
      difference:'GPU FP32 accumulation / possible FMA differ from binary64 CPU sums; no GPU-generated reference',tolerances:TOLERANCES,
      policy:'Frozen before run; strict integer test; fractional absolute+relative acceptance; no relaxation after failures' },
    timing:{ warmupPasses:10,measuredPasses:30,dispatchesPerPass:1,orderSeed:ORDER_SEED,order:configurationOrder(),
      gpuStatus:'NOT_MEASURED',optionalFeature:'timestamp-query explicitly requested if adapter supports it; no silent requestDevice fallback',
      gpuBoundary:'begin/end compute pass timestampWrites, one dispatch; includes possible scheduling cost, not pure arithmetic execution',
      wallBoundary:'immediately before queue.submit to onSubmittedWorkDone completion; includes query resolve/C copy, excludes map/CPU correctness',
      protocol:'Serial completion, timestamp and full C map/unmap + CPU check before next submit; waiting/readback affects caches and run state',
      setup:'Pipeline, buffers, bindings, input upload and CPU reference outside all sampling loops',
      priorGridNs:65536,statistics:'Measured only; median midpoint, nearest-rank p95, min/max and zeros; no trimming or speedup',
      performanceInputFamily:'fractional; both integer and fractional initial correctness required' },
    compilationMessages:[],correctness:[],performance:[],errors:[] };
}
let report = fresh();
function render(message=report.status) {
  ui.status.textContent=message;ui.run.disabled=busy;ui.download.disabled=busy;
  for(const k of ['thermal','charging','devtools','flag'])ui[k].disabled=busy;
  ui.summary.textContent=JSON.stringify({status:report.status,correctness:report.correctness,
    performance:report.performance.map(c=>({shape:c.shape,status:c.status,reason:c.reason,samples:c.samples.length,statistics:c.statistics})),
    errors:report.errors},null,2);
}
function fail(stage,error) {
  report.errors.push({isoTime:iso(),stage,name:error?.name||'Error',message:error?.message||String(error)});
  report.status='ERROR';if(!busy)render();
}
function limits(source) {
  return allLimits(source);
}
async function scoped(stage,action) {
  return withGpuErrors({device,report,fail},stage,action);
}
const resources=new Set();
function buffer(label,size,usage){const b=device.createBuffer({label,size,usage});resources.add(b);return b;}
function release(state){for(const resource of state.local){try{resource.destroy();}finally{resources.delete(resource);}}}
async function setup(shape,kind,pipeline,hasTimestamps) {
  const start=performance.now(),data=inputs(shape,kind);
  const referenceStart=performance.now(),reference=cpuReference(shape,data.A,data.B);
  const referenceMs=performance.now()-referenceStart;
  const state=await scoped('buffer setup',async()=>{
    const local=[];const make=(label,size,usage)=>{const b=buffer(label,size,usage);local.push(b);return b;};
    const a=make('A',data.A.byteLength,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST);
    const b=make('B',data.B.byteLength,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST);
    const bytes=shape.M*shape.N*4;
    const c=make('C',bytes,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST);
    const uniform=make('dimensions',16,GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST);
    const readback=make('C readback',bytes,GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ);
    let query=null,resolve=null,timestamps=null;
    if(hasTimestamps){query=device.createQuerySet({type:'timestamp',count:2});local.push(query);resources.add(query);
      resolve=make('query resolve',16,GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC);
      timestamps=make('query readback',16,GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ);}
    const bindings=device.createBindGroup({layout:pipeline.getBindGroupLayout(0),
      entries:[a,b,c,uniform].map((buffer,binding)=>({binding,resource:{buffer}}))});
    device.queue.writeBuffer(a,0,data.A);device.queue.writeBuffer(b,0,data.B);
    device.queue.writeBuffer(c,0,new Float32Array(shape.M*shape.N).fill(NaN));
    device.queue.writeBuffer(uniform,0,new Uint32Array([shape.M,shape.N,shape.K,0]));
    await device.queue.onSubmittedWorkDone();
    return {local,c,bytes,readback,query,resolve,timestamps,bindings};
  });
  return {...state,shape,kind,reference,setupWallMs:performance.now()-start,referenceWallMs:referenceMs};
}
async function onePass(state,pipeline,sample) {
  return executeGemmPass({device,report,fail,lost},state,pipeline,sample,WORKGROUP);
}
function sampleBase(phase,index){return {phase,index,startTimestamp:null,endTimestamp:null,gpuPassDurationNs:null,
  gpuPassDurationMs:null,submitToCompletionWallMs:null,mapReadbackWallMs:null,cpuCorrectnessWallMs:null,
  correctness:null,visibilityStateBefore:document.visibilityState,visibilityStateAfter:null};}
async function run() {
  if(busy)return;device?.destroy();device=null;busy=true;lost=false;sampling=false;report=fresh();
  report.status='RUNNING';report.startIsoTime=iso();const states=new Map();let stage='environment';render('准备 GEMM001…');
  try{
    if(!isSecureContext||!navigator.gpu)throw new Error('Require secure localhost and navigator.gpu');
    const adapter=await navigator.gpu.requestAdapter();if(!adapter)throw new Error('requestAdapter returned null');
    report.environment.adapter={info:adapter.info?Object.fromEntries(['vendor','architecture','device','description'].map(k=>[k,adapter.info[k]])):null,
      features:[...adapter.features].sort(),limits:limits(adapter.limits)};
    const hasTimestamps=adapter.features.has('timestamp-query');stage='requestDevice';
    const descriptor={requiredFeatures:hasTimestamps?['timestamp-query']:[]};report.environment.requestDeviceDescriptor=descriptor;
    device=await adapter.requestDevice(descriptor);
    report.environment.device={features:[...device.features].sort(),limits:limits(device.limits)};
    if(hasTimestamps&&!device.features.has('timestamp-query'))throw new Error('Requested timestamp-query not enabled');
    report.timing.gpuStatus=hasTimestamps?'AVAILABLE_NOT_YET_MEASURED':'NOT_MEASURED';
    device.addEventListener('uncapturederror',e=>fail('GPU uncaptured',e.error));
    device.lost.then(info=>{if(info.reason!=='destroyed'){lost=true;fail('device lost',new Error(`${info.reason}: ${info.message}`));}});
    stage='shader fetch/compilation';const response=await fetch('./gemm_naive.wgsl',{cache:'no-store'});
    if(!response.ok)throw new Error(`WGSL HTTP ${response.status}`);
    const source=await response.text();report.contract.shaderSource=source;
    const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(source));
    report.contract.shaderSha256=[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');
    const legal=SHAPES.filter(s=>unsupported(s,device.limits).length===0);
    if(!legal.length){
      for(const shape of SHAPES)for(const kind of ['integer','fractional'])
        report.correctness.push({shape,kind,status:'SKIPPED',reasons:unsupported(shape,device.limits)});
      for(const shape of report.timing.order)report.performance.push({shape,status:'SKIPPED',reason:'Device limits',samples:[],statistics:null});
      report.status='INCOMPLETE';return;
    }
    const pipeline=await scoped('shader/pipeline',async()=>{
      const module=device.createShaderModule({code:source});const info=await module.getCompilationInfo();
      report.compilationMessages=[...info.messages].map(m=>({type:m.type,message:m.message,lineNum:m.lineNum,linePos:m.linePos}));
      if(report.compilationMessages.some(m=>m.type==='error'))throw new Error('WGSL compilation error; see compilationMessages');
      return device.createComputePipelineAsync({layout:'auto',compute:{module,entryPoint:'main'}});
    });
    for(const shape of SHAPES){
      const reasons=unsupported(shape,device.limits);
      if(reasons.length){for(const kind of ['integer','fractional'])report.correctness.push({shape,kind,status:'SKIPPED',reasons});continue;}
      for(const kind of ['integer','fractional']){
        stage=`correctness ${shape.id}/${kind}`;render(stage);const state=await setup(shape,kind,pipeline,hasTimestamps);
        const record={shape,kind,status:'RUNNING',seed:INPUT_SEED,setupWallMs:state.setupWallMs,referenceWallMs:state.referenceWallMs,
          sample:sampleBase('correctness',0)};report.correctness.push(record);
        await onePass(state,pipeline,record.sample);record.status=record.sample.correctness.status;
        if(record.status==='FAIL')fail('CPU correctness',new Error(`${shape.id}/${kind}: tolerance exceeded or nonfinite`));
        if(shape.performance&&kind==='fractional'&&record.status==='PASS')states.set(shape.id,state);else release(state);
      }
    }
    for(const shape of report.timing.order){
      const config={shape,status:'NOT_RUN',reason:null,samples:[],statistics:null};report.performance.push(config);
      const gate=report.correctness.filter(c=>c.shape.id===shape.id);
      if(gate.length!==2||!gate.every(c=>c.status==='PASS')){config.status='SKIPPED';config.reason='Both input-family initial correctness checks must PASS';continue;}
      if(!hasTimestamps){config.status='NOT_MEASURED';config.reason='timestamp-query unsupported; correctness still completed';continue;}
      const state=states.get(shape.id);stage=`timing ${shape.id}`;render(stage);sampling=true;
      for(let i=0;i<40;i++){
        const sample=sampleBase(i<10?'warmup':'measured',i<10?i:i-10);
        sample.executionOrder=report.performance.reduce((sum,c)=>sum+c.samples.length,0);
        sample.configurationIndex=shape.configurationIndex;
        config.samples.push(sample);await onePass(state,pipeline,sample);
        if(sample.correctness.status!=='PASS'){fail('CPU correctness',new Error(`${shape.id} sampling output FAIL`));break;}
      }
      sampling=false;config.statistics=timingStatistics(config.samples,shape);
      config.status=config.samples.length===40&&config.samples.every(s=>s.correctness?.status==='PASS')?'COMPLETE':'INCOMPLETE';
    }
    const correctnessComplete=report.correctness.length===10&&report.correctness.every(c=>c.status==='PASS');
    const performanceComplete=hasTimestamps&&report.performance.length===2&&report.performance.every(c=>c.status==='COMPLETE');
    report.timing.gpuStatus=hasTimestamps?(performanceComplete?'MEASURED':'INCOMPLETE'):'NOT_MEASURED';
    report.status=report.errors.length?'ERROR':!correctnessComplete?'INCOMPLETE':hasTimestamps?(performanceComplete?'COMPLETE':'INCOMPLETE'):'CORRECTNESS_ONLY';
  }catch(e){fail(stage,e);}
  finally{
    sampling=false;for(const resource of resources){try{resource.destroy();}catch(e){fail('resource cleanup',e);}}resources.clear();
    if(!report.performance.some(c=>c.samples.some(s=>s.gpuPassDurationNs!==null)))report.timing.gpuStatus='NOT_MEASURED';
    else if(report.status==='ERROR')report.timing.gpuStatus='INCOMPLETE';
    report.endIsoTime=iso();busy=false;render();
  }
}
document.addEventListener('visibilitychange',()=>{if(!busy)return;report.visibility.events.push({isoTime:iso(),state:document.visibilityState,sampling});
  if(document.hidden){report.visibility.enteredBackground=true;if(sampling)report.visibility.samplingEnteredBackground=true;}});
ui.run.addEventListener('click',()=>run().catch(e=>{fail('page',e);busy=false;render();}));
ui.download.addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');
  a.href=url;a.download=`GEMM001-${(report.endIsoTime||iso()).replace(/[:.]/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});render();
