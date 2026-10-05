import { allLimits, withGpuErrors } from './gemm_gpu.mjs';
import { timestampInterval } from './timing_math.mjs';
import { intervalDiagnostics } from './timestamp_control_math.mjs';
const ui=Object.fromEntries(['run','download','status','summary','thermal','charging','devtools','flag'].map(k=>[k,document.getElementById(k)]));
const N=1048576,PASSES=8,DISPATCHES=32,iso=()=>new Date().toISOString();let busy=false,device=null;
function fresh(){return {experimentId:'TIMING002',schemaVersion:1,status:'NOT_RUN',startIsoTime:null,endIsoTime:null,
  environment:{userAgent:navigator.userAgent,secureContext:isSecureContext,pageUrl:location.href,
    manualState:Object.fromEntries(['thermal','charging','devtools','flag'].map(k=>[k,ui[k].value.trim()||'UNKNOWN']))},
  visibility:{initialState:document.visibilityState,events:[]},config:{N,passes:PASSES,dispatchesPerPass:DISPATCHES,workgroup:64,
    operation:'Existing vector-add shader, ping-pong A/C; B=1. Next dispatch/pass consumes previous output.',
    input:'A[i]=(i%31)-15; all FP32 integer additions exact; expected after pass j = initial +32*(j+1)',
    modes:['one_command_buffer','continuous_submits','serial_wait'],query:'Unique indices2*j,2*j+1 per mode; new querySet/mode, no reuse',
    readback:'GPU output snapshot after each pass, outside timestamp interval; all query/output map after final completion',
    scope:'8 heterogeneous-in-sequence dependent pass intervals per mode, not repeated benchmark statistics',
    limitations:['32 dispatch pass NOT independent kernel latency; never divide by32',
      'Serial waits and per-pass output copy alter conditions; not stock model performance',
      'No pass duration sum/busy time/attribution breakdown; finite-sample grid only']},modes:[],resources:[],errors:[]};}
let report=fresh();const live=[];
function render(){ui.status.textContent=report.status;ui.run.disabled=busy;ui.download.disabled=busy;
  ui.summary.textContent=JSON.stringify({status:report.status,compilationMessages:report.shader?.compilationMessages,modes:report.modes,errors:report.errors},null,2);}
function fail(stage,e){report.errors.push({stage,message:e?.message||String(e),isoTime:iso()});report.status='ERROR';if(!busy)render();}
const scoped=(stage,fn)=>withGpuErrors({device,report,fail},stage,fn);
function tracked(object,info){const r={...info,destroyed:false};report.resources.push(r);live.push({object,record:r});return object;}
async function run(){if(busy)return;busy=true;device?.destroy();device=null;report=fresh();report.status='RUNNING';report.startIsoTime=iso();render();
  try{
    if(!isSecureContext||!navigator.gpu)throw new Error('Secure localhost/navigator.gpu required');
    const adapter=await navigator.gpu.requestAdapter();if(!adapter)throw new Error('No adapter');
    report.environment.adapter={info:adapter.info?Object.fromEntries(['vendor','architecture','device','description'].map(k=>[k,adapter.info[k]])):null,features:[...adapter.features],limits:allLimits(adapter.limits)};
    if(!adapter.features.has('timestamp-query')){report.status='UNSUPPORTED';return;}
    report.environment.requestDeviceDescriptor={requiredFeatures:['timestamp-query']};
    device=await adapter.requestDevice(report.environment.requestDeviceDescriptor);report.environment.device={features:[...device.features],limits:allLimits(device.limits)};
    if(!device.features.has('timestamp-query'))throw new Error('Requested timestamp-query not actually enabled');
    device.addEventListener('uncapturederror',e=>fail('GPU uncaptured',e.error));device.lost.then(i=>{if(i.reason!=='destroyed')fail('device lost',new Error(i.message));});
    const bytes=N*4,l=device.limits;
    if(bytes>l.maxBufferSize||bytes>l.maxStorageBufferBindingSize||l.maxComputeWorkgroupSizeX<64||l.maxComputeInvocationsPerWorkgroup<64||Math.ceil(N/64)>l.maxComputeWorkgroupsPerDimension||l.maxStorageBuffersPerShaderStage<3||l.maxUniformBufferBindingSize<16){report.status='SKIPPED';report.skipReason='Fixed workload resource limits; no silent shrink';return;}
    const response=await fetch('./timing_vector_add.wgsl',{cache:'no-store'});if(!response.ok)throw new Error('Shader HTTP '+response.status);
    const source=await response.text(),digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(source));
    report.shader={source,sha256:Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join(''),compilationMessages:[]};
    const pipeline=await scoped('shader/pipeline',async()=>{const module=device.createShaderModule({code:source}),info=await module.getCompilationInfo();
      report.shader.compilationMessages=Array.from(info.messages,m=>({type:m.type,message:m.message,lineNum:m.lineNum,linePos:m.linePos}));
      if(info.messages.some(m=>m.type==='error'))throw new Error('WGSL compilation failure');return device.createComputePipelineAsync({layout:'auto',compute:{module,entryPoint:'main'}});});
    const make=(size,usage,label)=>tracked(device.createBuffer({size,usage,label}),{kind:'buffer',size,usage,label});
    const ping=[0,1].map(i=>make(bytes,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC,`ping${i}`));
    const b=make(bytes,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,'B ones'),uniform=make(16,GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,'N');
    const groups=ping.map((a,i)=>device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:[a,b,ping[1-i],uniform].map((buffer,binding)=>({binding,resource:{buffer}}))}));
    const input=Float32Array.from({length:N},(_,i)=>(i%31)-15);
    device.queue.writeBuffer(b,0,new Float32Array(N).fill(1));device.queue.writeBuffer(uniform,0,new Uint32Array([N,0,0,0]));
    for(const mode of report.config.modes){
      const result={mode,status:'RUNNING',samples:[],correctness:[],submissions:[],diagnostics:null};report.modes.push(result);
      await scoped(mode,async()=>{
        const query=tracked(device.createQuerySet({type:'timestamp',count:PASSES*2,label:mode}),{kind:'querySet',label:mode,count:PASSES*2});
        const resolve=make(PASSES*16,GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC,mode+' resolve');
        const timestamps=make(PASSES*16,GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ,mode+' timestamps');
        const outputs=Array.from({length:PASSES},(_,i)=>make(bytes,GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ,`${mode} output${i}`));
        device.queue.writeBuffer(ping[0],0,input);device.queue.writeBuffer(ping[1],0,new Float32Array(N));await device.queue.onSubmittedWorkDone();
        let next=0,commandIndex=0,submitIndex=0,wallStart=null;
        const submit=async(command,wait)=>{if(wallStart===null)wallStart=performance.now();const start=performance.now(),submitId=mode+':submit'+submitIndex++;
          device.queue.submit([command]);const record={submitId,waited:wait,wallMs:null};result.submissions.push(record);
          if(wait){await device.queue.onSubmittedWorkDone();record.wallMs=performance.now()-start;}return submitId;};
        const encodePass=(encoder,j,commandBufferId)=>{const passId=mode+':pass'+j;
          const pass=encoder.beginComputePass({timestampWrites:{querySet:query,beginningOfPassWriteIndex:j*2,endOfPassWriteIndex:j*2+1}});
          pass.setPipeline(pipeline);for(let d=0;d<DISPATCHES;d++){pass.setBindGroup(0,groups[next]);pass.dispatchWorkgroups(Math.ceil(N/64));next=1-next;}pass.end();
          encoder.copyBufferToBuffer(ping[next],0,outputs[j],0,bytes);
          result.samples.push({passId,commandBufferId,submitId:null,querySetId:mode+':query',queryIndices:[j*2,j*2+1],passIndex:j,dispatches:DISPATCHES});};
        if(mode==='one_command_buffer'){
          const encoder=device.createCommandEncoder(),id=mode+':command'+commandIndex++;
          for(let j=0;j<PASSES;j++)encodePass(encoder,j,id);
          const sid=await submit(encoder.finish(),false);for(const s of result.samples)s.submitId=sid;
        }else for(let j=0;j<PASSES;j++){
          const encoder=device.createCommandEncoder(),id=mode+':command'+commandIndex++;encodePass(encoder,j,id);
          result.samples[j].submitId=await submit(encoder.finish(),mode==='serial_wait');
        }
        const end=device.createCommandEncoder();end.resolveQuerySet(query,0,PASSES*2,resolve,0);end.copyBufferToBuffer(resolve,0,timestamps,0,PASSES*16);
        await submit(end.finish(),false);await device.queue.onSubmittedWorkDone();result.enqueueToFinalCompletionWallMs=performance.now()-wallStart;
        const readStart=performance.now();
        try{await timestamps.mapAsync(GPUMapMode.READ);const data=new BigUint64Array(timestamps.getMappedRange());
          for(let j=0;j<PASSES;j++){if(data[j*2+1]<data[j*2])throw new Error('End before start');Object.assign(result.samples[j],timestampInterval(data[j*2],data[j*2+1]));}}
        finally{if(timestamps.mapState==='mapped')timestamps.unmap();}
        for(let j=0;j<PASSES;j++)try{await outputs[j].mapAsync(GPUMapMode.READ);const data=new Float32Array(outputs[j].getMappedRange());let errors=0,nonFinite=0,max=0;
          for(let i=0;i<N;i++){const expected=input[i]+DISPATCHES*(j+1);if(!Number.isFinite(data[i])){nonFinite++;errors++;continue;}const e=Math.abs(data[i]-expected);max=Math.max(max,e);if(e!==0)errors++;}
          result.correctness.push({passIndex:j,elementCount:N,status:errors?'FAIL':'PASS',errorElementCount:errors,nonFiniteCount:nonFinite,maxAbsoluteError:nonFinite?null:max});
        }finally{if(outputs[j].mapState==='mapped')outputs[j].unmap();}
        result.readbackAndCpuCheckWallMs=performance.now()-readStart;result.diagnostics=intervalDiagnostics(result.samples);
        result.status=result.correctness.every(c=>c.status==='PASS')?'COMPLETE':'FAIL';
      });
      if(report.errors.length)throw new Error('GPU error recorded');
    }
    report.status=report.modes.every(m=>m.status==='COMPLETE')?'COMPLETE':'FAIL';
  }catch(e){fail('TIMING002',e);}
  finally{for(const r of live.splice(0))try{r.object.destroy();r.record.destroyed=true;}catch(e){fail('cleanup',e);}report.endIsoTime=iso();busy=false;render();}
}
document.addEventListener('visibilitychange',()=>{if(busy)report.visibility.events.push({isoTime:iso(),state:document.visibilityState});});
ui.run.addEventListener('click',()=>run().catch(e=>{fail('page',e);busy=false;render();}));
ui.download.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'})),a=document.createElement('a');
  a.href=url;a.download=`TIMING002-${(report.endIsoTime||iso()).replace(/[:.]/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});render();
