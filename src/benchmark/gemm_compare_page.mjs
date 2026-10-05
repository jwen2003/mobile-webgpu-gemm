import { INPUT_SEED, TOLERANCES, REAL_SHADER, inputs, cpuReference, compare } from './gemm_math.mjs';
import { allLimits, withGpuErrors, executeGemmPass, sampleBase } from './gemm_gpu.mjs';
export function mountGemmComparison(options) {
const { VARIANTS, CASES, SHAPE_SEED, PAIR_SEED, shapeOrder, roundOrder, variantUnsupported, comparisonStatistics, experimentId, warmupOrder, fullSmallArrays=false }=options;
const names=Object.keys(VARIANTS),count=names.length;
const ui=Object.fromEntries(['run','download','status','summary','thermal','charging','devtools','flag'].map(k=>[k,document.getElementById(k)]));
const iso=()=>new Date().toISOString();let device=null,busy=false,lost=false,sampling=false;
const liveResources=new Map();let resourceId=0;
function fresh(){return {schemaVersion:1,experimentId,status:'NOT_RUN',startIsoTime:null,endIsoTime:null,
  environment:{isoTime:iso(),userAgent:navigator.userAgent,secureContext:isSecureContext,pageUrl:location.href,adapter:null,device:null,
    manualState:Object.fromEntries(['thermal','charging','devtools','flag'].map(k=>[k,ui[k].value.trim()||'UNKNOWN']))},
  visibility:{initialState:document.visibilityState,enteredBackground:document.hidden,samplingEnteredBackground:false,events:[]},
  contract:{operation:'row-major A[M,K] * B[K,N] -> C[M,N]',inputOutputDtype:'FP32',accumulation:'FP32; possible FMA contraction',
    bias:false,activation:false,quantization:false,uniform:'u32 M,N,K,padding, 16 bytes at offset0'},
  variants:VARIANTS,specializedConfiguration:VARIANTS.specialized?{sharedBytes:256,kBlocks:'ceil(K/64)',barriersPerWorkgroup:'2*ceil(K/64)',outputMapping:'one adjacent N column/lane',supports:'M=1 only'}:null,shaders:{},shapeEvidence:options.realShapeEvidence||REAL_SHADER,shapes:CASES,
  modelShapeRecovery:fullSmallArrays?{document:'docs/model_shape_recovery.md',evidence:'results/analysis/profile002/gemm003_shape_candidate.json',
    completeShape:options.realShapeEvidence?.status==='REVIEWED_LOGICAL_SHAPE'?options.realShapeEvidence.shape:'UNKNOWN',executionShape:options.realShapeEvidence?.shape||null,evidenceCategory:options.realShapeEvidence?.evidenceCategory||null,realShapeAdded:options.realShapeEvidence?.status==='REVIEWED_LOGICAL_SHAPE',executionShapeAdded:!!options.realShapeEvidence,missing:options.realShapeEvidence?(options.realShapeEvidence.status==='REVIEWED_EXECUTION_SHAPE'?'Valid logical axes/padding, batch/head semantics and graph layer association remain UNKNOWN':null):'Uniform U.i0 values, binding ranges/offsets, texture extents/views, pipeline.constants and tensor padding/axis mapping'}:null,
  input:{seed:INPUT_SEED,algorithm:'Reuse GEMM001 xorshift32, A then B independently per shape/family',
    integer:'(nextU32%7)-3',fractional:'fround(((nextU32%2001)-1000)/1000)'},
  reference:{method:'Same GEMM001 independent i-k-j CPU Float64Array accumulation from stored FP32 inputs',
    difference:'CPU binary64 versus GPU FP32/possible FMA',tolerances:TOLERANCES,policy:'Frozen unchanged; no relaxation',
    crossVariant:'All unordered variant pairs, latter actual versus former expected, same family atol/rtol; no fractional bitwise equality requirement'},
  timing:{warmupPassesPerVariant:10,measuredPairedRounds:30,dispatchesPerPass:1,shapeSeed:SHAPE_SEED,pairSeed:PAIR_SEED,
    shapeOrder:shapeOrder(),plannedRounds:shapeOrder().map(s=>({shapeId:s.id,...roundOrder(s)})),gpuStatus:'NOT_MEASURED',
    warmupOrder:Array.from({length:10},(_,i)=>({roundId:i,order:warmupOrder(i)})),
    gpuBoundary:'One compute dispatch between timestampWrites begin/end; query resolve/C copy outside pass',
    wallBoundary:'Immediately before queue.submit to onSubmittedWorkDone completion; includes resolve/copies, excludes map/check',
    serialProtocol:'Previous pass completed and query/C fully mapped and unmapped before next submission; safely reuse query indices0,1',
    setup:'All pipelines, shared inputs/uniform/reference and independent C buffers outside sampling loops',
    performanceInputFamily:'fractional, after both families/variants/cross-comparison PASS',
    controls:'Same device, A/B/CPU reference, C usage and readback protocol; only kernel/workgroup/shared-memory scheme differ',
    changes:count===3?'naive8x8/tiled16x16/specialized64x1: workgroup shape, A load scheme and invalid rows change together; not isolation of one cost':'naive8x8 versus tiled16x16+2048 bytes workgroup memory and two barriers per K tile',
    priorGridNs:65536,statistics:'GEMM001 measured-only midpoint median/nearest-rank p95/min/max/zero/GCD and resolution rule',
    primarySpeedup:count===3?'Same-run naive/specialized, tiled/specialized, naive/tiled medians':'Same-run naive median / same-run tiled median; no historical denominator'},
  historicalContext:{experiment:'GEMM001',rawPath:'results/raw/GEMM001-2026-10-05T04-20-24-462Z.json',usage:'Background only, never used in speedup'},
  resources:[],correctness:[],performance:[],errors:[],limitations:[
    options.realShapeEvidence?(options.realShapeEvidence.status==='REVIEWED_EXECUTION_SHAPE'?'Reviewed execution/padded shape only; valid logical model shape/batch/head/layer UNKNOWN; synthetic FP32, not original FP16 operator replay; no model or Adreno benefit':'Reviewed logical shape with synthetic FP32 inputs, not original tensors/operator-equivalent execution; no model or Adreno benefit'):'Representative shapes, not recovered runtime shapes; no model or Adreno speedup claim',
    'Source facts about loads/barriers are not measured reuse/occupancy/cache/DRAM evidence',
    'Serial readback, pairing, CPU checks and order affect run state; one-run comparison is preliminary',
    'M=1 slowdown allowed; no tile/precision/vectorization/algorithm auto-tuning']};}
let report=fresh();
function render(message=report.status){ui.status.textContent=message;ui.run.disabled=busy;ui.download.disabled=busy;
  for(const k of ['thermal','charging','devtools','flag'])ui[k].disabled=busy;
  ui.summary.textContent=JSON.stringify({status:report.status,
    shaders:Object.fromEntries(Object.entries(report.shaders).map(([name,s])=>[name,{status:s.status,compilationMessages:s.compilationMessages,reasons:s.reasons}])),
    correctness:report.correctness.map(c=>({shape:c.shape,kind:c.kind,status:c.status,variants:c.variants,pairComparison:c.pairComparison})),
    performance:report.performance.map(c=>({shape:c.shape,status:c.status,reason:c.reason,sampleCount:c.samples.length,statistics:c.statistics})),errors:report.errors},null,2);}
function fail(stage,e){report.errors.push({isoTime:iso(),stage,name:e?.name||'Error',message:e?.message||String(e)});
  report.status='ERROR';if(!busy)render();}
const context=()=>({device,report,fail,lost});
const scoped=(stage,action)=>withGpuErrors(context(),stage,action);
function track(resource,meta){const record={id:`resource-${++resourceId}`,...meta,destroyed:false};report.resources.push(record);liveResources.set(resource,record);return resource;}
function destroy(resource){const record=liveResources.get(resource);try{resource.destroy();if(record)record.destroyed=true;}
  finally{liveResources.delete(resource);}}
function release(state){for(const r of state.local)destroy(r);}
async function setup(shape,kind,pipelines,available,hasTimestamps){
  const start=performance.now(),data=inputs(shape,kind),referenceStart=performance.now();
  const reference=cpuReference(shape,data.A,data.B),referenceMs=performance.now()-referenceStart;
  const result=await scoped('paired buffer setup',async()=>{
    const local=[],prefix=`${shape.id}/${kind}`;
    const make=(role,size,usage)=>{const label=prefix+'/'+role;const b=track(device.createBuffer({label,size,usage}),
      {kind:'buffer',label,role,size,usage,scope:'Logical allocation, not physical residency'});local.push(b);return b;};
    const a=make('shared A',data.A.byteLength,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST);
    const b=make('shared B',data.B.byteLength,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST);
    const uniform=make('shared dimensions',16,GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST);
    let query=null,resolve=null,timestamps=null;
    if(hasTimestamps){query=track(device.createQuerySet({type:'timestamp',count:2,label:prefix+'/shared query pair'}),
      {kind:'querySet',label:prefix+'/shared query pair',queryCount:2,indices:[0,1],reuse:'After prior pass completion/map/unmap only'});local.push(query);
      resolve=make('shared query resolve',16,GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC);
      timestamps=make('shared query readback',16,GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ);}
    const states={};const bytes=shape.M*shape.N*4;
    for(const variant of available){
      const c=make(variant+' independent C',bytes,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST);
      const readback=make(variant+' independent readback',bytes,GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ);
      const bindings=device.createBindGroup({layout:pipelines[variant].getBindGroupLayout(0),entries:[a,b,c,uniform]
        .map((buffer,binding)=>({binding,resource:{buffer}}))});
      device.queue.writeBuffer(c,0,new Float32Array(shape.M*shape.N).fill(NaN));
      states[variant]={shape,kind,reference,c,readback,bytes,bindings,query,resolve,timestamps};
    }
    device.queue.writeBuffer(a,0,data.A);device.queue.writeBuffer(b,0,data.B);
    device.queue.writeBuffer(uniform,0,new Uint32Array([shape.M,shape.N,shape.K,0]));await device.queue.onSubmittedWorkDone();
    return {local,states,resourceIds:local.map(r=>liveResources.get(r).id)};
  });
  return {...result,shape,kind,reference,data:fullSmallArrays&&!shape.performance?data:null,setupWallMs:performance.now()-start,referenceWallMs:referenceMs};
}
function pairCheck(actual,kind){const start=performance.now(),comparisons=[];
  for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){
    const expectedVariant=names[i],actualVariant=names[j];
    comparisons.push({expectedVariant,actualVariant,correctness:compare(actual[actualVariant],actual[expectedVariant],kind)});
  }
  return {correctness:count===2?comparisons[0].correctness:{status:comparisons.every(c=>c.correctness.status==='PASS')?'PASS':'FAIL'},comparisons,
    cpuPairComparisonWallMs:performance.now()-start,direction:'All unordered pairs with unchanged GEMM001 tolerances'};
}
function serializedValues(values){return Array.from(values,x=>Number.isFinite(x)?x:String(x));}
async function run(){
  if(busy)return;device?.destroy();device=null;busy=true;lost=false;sampling=false;resourceId=0;report=fresh();
  report.status='RUNNING';report.startIsoTime=iso();const retained=new Map();let stage='environment';let executionOrder=0;render('准备 '+experimentId+'…');
  try{
    if(!isSecureContext||!navigator.gpu)throw new Error('Require secure localhost and navigator.gpu');
    const adapter=await navigator.gpu.requestAdapter();if(!adapter)throw new Error('requestAdapter returned null');
    report.environment.adapter={info:adapter.info?Object.fromEntries(['vendor','architecture','device','description'].map(k=>[k,adapter.info[k]])):null,
      features:[...adapter.features].sort(),limits:allLimits(adapter.limits)};
    const hasTimestamps=adapter.features.has('timestamp-query');const request={requiredFeatures:hasTimestamps?['timestamp-query']:[]};
    report.environment.requestDeviceDescriptor=request;stage='requestDevice';device=await adapter.requestDevice(request);
    report.environment.device={features:[...device.features].sort(),limits:allLimits(device.limits)};
    if(hasTimestamps&&!device.features.has('timestamp-query'))throw new Error('Requested timestamp-query not enabled');
    device.addEventListener('uncapturederror',e=>fail('GPU uncaptured',e.error));
    device.lost.then(info=>{if(info.reason!=='destroyed'){lost=true;fail('device lost',new Error(`${info.reason}: ${info.message}`));}});
    const pipelines={};
    for(const [variant,settings] of Object.entries(VARIANTS)){
      stage=variant+' shader preparation';const response=await fetch('./'+settings.shader,{cache:'no-store'});
      if(!response.ok)throw new Error(`WGSL HTTP ${response.status}`);const source=await response.text();
      const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(source));
      const shader={path:'src/benchmark/'+settings.shader,source,sha256:[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join(''),
        workgroup:settings.workgroup,sharedBytes:settings.sharedBytes,status:'NOT_RUN',compilationMessages:[]};report.shaders[variant]=shader;
      if(!CASES.some(s=>variantUnsupported(s,device.limits,variant).length===0)){
        shader.status='SKIPPED';shader.reasons=variantUnsupported(CASES[0],device.limits,variant);continue;}
      pipelines[variant]=await scoped(variant+' shader/pipeline',async()=>{
        const module=device.createShaderModule({code:source});const info=await module.getCompilationInfo();
        shader.compilationMessages=[...info.messages].map(m=>({type:m.type,message:m.message,lineNum:m.lineNum,linePos:m.linePos}));
        if(shader.compilationMessages.some(m=>m.type==='error'))throw new Error(`${variant} compilation error`);
        return device.createComputePipelineAsync({layout:'auto',compute:{module,entryPoint:'main'}});
      });shader.status='READY';
    }
    for(const shape of CASES)for(const kind of ['integer','fractional']){
      stage=`correctness ${shape.id}/${kind}`;render(stage);
      const record={shape,kind,seed:INPUT_SEED,status:'NOT_RUN',variants:{},pairComparison:null};report.correctness.push(record);
      const available=[];
      for(const variant of Object.keys(VARIANTS)){
        const reasons=variantUnsupported(shape,device.limits,variant);
        record.variants[variant]={status:reasons.some(r=>r.startsWith('UNSUPPORTED:'))?'UNSUPPORTED':reasons.length?'SKIPPED':'NOT_RUN',reasons,sample:null};
        if(!reasons.length&&pipelines[variant])available.push(variant);
      }
      if(!available.length){record.status='SKIPPED';continue;}
      const state=await setup(shape,kind,pipelines,available,hasTimestamps);
      record.setupWallMs=state.setupWallMs;record.referenceWallMs=state.referenceWallMs;record.resourceIds=state.resourceIds;
      if(fullSmallArrays&&!shape.performance)record.fullArrays={A:serializedValues(state.data.A),B:serializedValues(state.data.B),outputs:{},cpuReference:serializedValues(state.reference),nonFiniteRepresentation:'NaN/Infinity/-Infinity as strings'};
      const actual={};
      for(const variant of available){const sample=sampleBase('correctness',0);Object.assign(sample,{variant,shape,workgroup:VARIANTS[variant].workgroup});
        record.variants[variant].sample=sample;actual[variant]=await executeGemmPass(context(),state.states[variant],pipelines[variant],sample,VARIANTS[variant].workgroup);
        record.variants[variant].status=sample.correctness.status;
        if(record.fullArrays)record.fullArrays.outputs[variant]=serializedValues(actual[variant]);
        if(sample.correctness.status!=='PASS')fail('CPU correctness',new Error(`${shape.id}/${kind}/${variant} FAIL`));}
      if(names.every(v=>actual[v])){record.pairComparison=pairCheck(actual,kind);
        if(record.pairComparison.correctness.status!=='PASS')fail('CPU correctness',new Error(`${shape.id}/${kind} naive/tiled mismatch`));}
      record.status=available.length<count?'SKIPPED':Object.values(record.variants).every(v=>v.status==='PASS')
        &&record.pairComparison?.correctness.status==='PASS'?'PASS':'FAIL';
      if(shape.performance&&kind==='fractional'&&record.status==='PASS')retained.set(shape.id,state);else release(state);
    }
    for(const shape of report.timing.shapeOrder){
      const plan=roundOrder(shape),config={shape,status:'NOT_RUN',reason:null,roundSeed:plan.seed,plannedRounds:plan.rounds,
        samples:[],pairComparisons:[],statistics:null};report.performance.push(config);
      const gate=report.correctness.filter(c=>c.shape.id===shape.id);
      if(gate.length!==2||!gate.every(c=>c.status==='PASS')){config.status='SKIPPED';config.reason='Both families and variants/cross-check must PASS; fixed tile not changed';continue;}
      if(!hasTimestamps){config.status='NOT_MEASURED';config.reason='timestamp-query unsupported; correctness still runs';continue;}
      const state=retained.get(shape.id);config.resourceIds=state.resourceIds;stage='paired timing '+shape.id;render(stage);sampling=true;
      const rounds=[...Array.from({length:10},(_,roundId)=>({roundId,phase:'warmup',order:warmupOrder(roundId)})),
        ...plan.rounds.map(r=>({...r,phase:'measured'}))];
      for(const round of rounds){
        const actual={};let passed=true;
        for(let orderInRound=0;orderInRound<count;orderInRound++){
          const variant=round.order[orderInRound],sample=sampleBase(round.phase,round.roundId);
          Object.assign(sample,{roundId:round.roundId,variant,shape,configurationIndex:shape.configurationIndex,
            executionOrder:executionOrder++,orderInRound,roundOrder:round.order,workgroup:VARIANTS[variant].workgroup});
          config.samples.push(sample);
          actual[variant]=await executeGemmPass(context(),state.states[variant],pipelines[variant],sample,VARIANTS[variant].workgroup);
          if(sample.correctness.status!=='PASS'){fail('CPU correctness',new Error(`${shape.id}/${variant}/${round.phase}/${round.roundId} FAIL`));passed=false;break;}
        }
        if(names.every(v=>actual[v])){const pair={phase:round.phase,roundId:round.roundId,order:round.order,...pairCheck(actual,'fractional')};
          config.pairComparisons.push(pair);if(pair.correctness.status!=='PASS'){fail('CPU correctness',new Error(`${shape.id} paired mismatch`));passed=false;}}
        if(!passed)break;
      }
      sampling=false;config.statistics=comparisonStatistics(config.samples,shape,config.pairComparisons);
      config.status=config.statistics.completePassingPairedSet?'COMPLETE':'INCOMPLETE';
    }
    const correct=report.correctness.length===CASES.length*2&&report.correctness.every(c=>c.status==='PASS');
    const timed=hasTimestamps&&report.performance.length===shapeOrder().length&&report.performance.every(c=>c.status==='COMPLETE');
    report.status=report.errors.length?'ERROR':!correct?'INCOMPLETE':hasTimestamps?(timed?'COMPLETE':'INCOMPLETE'):'CORRECTNESS_ONLY';
    report.timing.gpuStatus=hasTimestamps?(timed?'MEASURED':'INCOMPLETE'):'NOT_MEASURED';
  }catch(e){fail(stage,e);}
  finally{
    sampling=false;for(const resource of [...liveResources.keys()])try{destroy(resource);}catch(e){fail('resource cleanup',e);}
    if(!report.performance.some(c=>c.samples.some(s=>s.gpuPassDurationNs!==null)))report.timing.gpuStatus='NOT_MEASURED';
    else if(report.status==='ERROR')report.timing.gpuStatus='INCOMPLETE';
    report.endIsoTime=iso();busy=false;render();
  }
}
document.addEventListener('visibilitychange',()=>{if(!busy)return;report.visibility.events.push({isoTime:iso(),state:document.visibilityState,sampling});
  if(document.hidden){report.visibility.enteredBackground=true;if(sampling)report.visibility.samplingEnteredBackground=true;}});
ui.run.addEventListener('click',()=>run().catch(e=>{fail('page',e);busy=false;render();}));
ui.download.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=`${experimentId}-${(report.endIsoTime||iso()).replace(/[:.]/g,'-')}.json`;
  a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});render();

}
