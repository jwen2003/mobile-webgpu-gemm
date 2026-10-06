import {VERSION,RUNTIME_ROOT,MODEL_FILENAME,MODEL_PATH,validateModelManifest} from './config.mjs';
import {SESSION_PLAN,SESSION_OPTIONS,sessionTarget,buildExactPrompt} from './session_plan.mjs?v=baseline-session-v1';
import {SessionMemory,heapSnapshot} from './session_memory.mjs?v=baseline-session-v1';
import {MemoryCaptureGates,captureProtocol} from './memory002_gates.mjs?v=memory002-v2';
const ui=Object.fromEntries(['ordinal','target','run','cancel','download','status','output','summary','thermal','charging','devtools','flag','backgroundApps'].map(k=>[k,document.getElementById(k)]));
for(let i=1;i<=15;i++){const t=sessionTarget(i),o=document.createElement('option');o.value=String(i);o.textContent=`${i}: ${t.targetTokens} tokens / 第 ${t.repetition} 次`;ui.ordinal.append(o);}
ui.ordinal.value='1';const iso=()=>new Date().toISOString(),sessionId=crypto.randomUUID();let busy=false,attempted=false,cancelled=false,task=null,device=null,memory=null,report;
const captureEnabled=new URLSearchParams(location.search).get('memory002')==='1';
const captureContinue=document.getElementById('captureContinue');
const gates=new MemoryCaptureGates({enabled:captureEnabled,sessionId,protocol:captureEnabled?captureProtocol(sessionId):null,publish:state=>{globalThis.__memory002State=state;},show:(stage,waiting)=>{document.getElementById('captureStage').textContent=waiting?`等待电脑采样：${stage}；核对回执后继续`:`阶段：${stage}`;captureContinue.disabled=!waiting||!globalThis.__memory002State?.captureAccepted;},record:(type,detail)=>event(type,detail)});
document.getElementById('captureMode').textContent=captureEnabled?'MEMORY002 v2 · BLOCKED_UNTIL_IDLE_CAPTURE；空闲采样回执必需，结果不作为原stock延迟复验。':'历史BASELINE002模式；阶段等待未启用。';
captureContinue.addEventListener('click',()=>gates.continue());
document.getElementById('captureRefresh').addEventListener('click',async()=>{try{await gates.refresh();document.getElementById('captureMode').textContent=gates.idleAccepted?'MEMORY002 v2 · READY_FOR_CAPTURE':'MEMORY002 v2 · BLOCKED_UNTIL_IDLE_CAPTURE';render();}catch(e){document.getElementById('captureStage').textContent=e.message;}});
function fresh(){const ordinal=Number(ui.ordinal.value);return {experimentId:'BASELINE002',schemaVersion:1,implementationVersion:'baseline-session-v1',status:'NOT_RUN',readiness:captureEnabled?(gates.idleAccepted?'READY_FOR_CAPTURE':'BLOCKED_UNTIL_IDLE_CAPTURE'):'READY_FOR_PHONE',session:{id:sessionId,ordinal,...sessionTarget(ordinal),freshPageTaskDevice:true},plan:SESSION_PLAN,
 startIsoTime:null,endIsoTime:null,environment:{userAgent:navigator.userAgent,secureContext:isSecureContext,crossOriginIsolated:globalThis.crossOriginIsolated??false,pageUrl:location.href,manualState:Object.fromEntries(['thermal','charging','devtools','flag','backgroundApps'].map(k=>[k,ui[k].value.trim()||'UNKNOWN'])),probeAdapter:null,runtimeDevice:null,runtimeBackend:'UNKNOWN'},
 runtime:{package:'@mediapipe/tasks-genai',version:VERSION,modified:false,manifest:null,deviceCreation:'Stock createWebGpuDevice;no timestamp feature or limits added'},model:{filename:MODEL_FILENAME,localPath:MODEL_PATH,manifest:null,browserSha256:'UNAVAILABLE;desktop manifest plus browser HEAD size only'},
 config:{...SESSION_OPTIONS,maxTokensMeaning:'Total input+output capacity,not output count',textOnly:true,disableRewinding:'NOT_OVERRIDDEN;stock default',forceF32:'NOT_OVERRIDDEN;stock default',lora:'NONE'},
 methodology:{warmupGenerations:0,reason:'First-use baseline:tokenizer preparation before first and only generation;no generation warm-up',generationsPerTask:1,cache:'New task/device/page,stock defaults;no prior generation/KV reuse requested. Tokenizer preparation warms tokenizer;OS/browser/driver caches not reset or measured.',instrumentation:'Resource-only reversible wrappers + sparse heap snapshots and callback memory records;overhead included,not a fully unobserved control'},
 prompt:null,events:[],wallMetrics:{runtimePreparationMs:null,modelInitializationMs:null,tokenPreparationMs:null,tokenPreparationDrainMs:null,generationCallToCompletionMs:null,firstCallbackMs:null,postGenerationDrainMs:null},output:{streamedText:'',returnedText:null,finalText:''},lifecycle:{initialized:false,exactPromptVerified:false,generationStarted:false,generationResolved:false,doneObserved:false,nonemptyOutput:false,drainCompleted:false},
 memory:{snapshots:[],logicalResources:null,heapScope:'Sparse reported heap snapshots,not true continuous peak;do not add to logical GPU bytes',deviceRss:'UNAVAILABLE;external process capture requires independently archived evidence'},memoryCapture:{enabled:captureEnabled,version:'memory002-v2',readiness:captureEnabled?(gates.idleAccepted?'READY_FOR_CAPTURE':'BLOCKED_UNTIL_IDLE_CAPTURE'):'DISABLED',holds:['PAGE_IDLE','AFTER_INIT','BEFORE_GENERATION','AFTER_DRAIN'],scope:'Waits excluded from existing wall boundaries;sampling/holds affect execution state,not stock performance. PAGE_IDLE is before run click.'},visibility:{initialState:document.visibilityState,enteredBackground:false,events:[]},errors:[],droppedCallbacks:0,
 unavailable:{actualGeneratedTokens:'UNAVAILABLE',tokensPerSecond:'UNAVAILABLE',purePrefillLatency:'UNAVAILABLE',decodePhase:'UNAVAILABLE',perTokenLatency:'UNAVAILABLE',gpuKernelTiming:'UNAVAILABLE',physicalGpuMemory:'UNAVAILABLE',dispatchPerToken:'UNAVAILABLE'}};}
function event(type,detail={}){const e={type,isoTime:iso(),wallMs:performance.now(),...detail};report.events.push(e);return e;}
function snapshot(stage){report.memory.snapshots.push({stage,isoTime:iso(),wallMs:performance.now(),jsHeap:heapSnapshot(),logical:memory?.snapshot()??{status:'NOT_INSTALLED'}});}
function render(){ui.run.disabled=busy||attempted||(captureEnabled&&!gates.idleAccepted);ui.ordinal.disabled=busy||attempted;for(const k of ['thermal','charging','devtools','flag','backgroundApps'])ui[k].disabled=busy||attempted;ui.cancel.disabled=!busy;ui.target.textContent=`完整模板计入 ${sessionTarget(Number(ui.ordinal.value)).targetTokens} tokens`;
 ui.status.textContent=report.status;ui.output.textContent=report.output.finalText||report.output.streamedText;ui.summary.textContent=JSON.stringify({session:report.session,status:report.status,prompt:report.prompt?{targetTokens:report.prompt.targetTokens,verifiedFullTokens:report.prompt.verifiedFullTokens,bodyTokens:report.prompt.bodyTokens,templateOnlyTokens:report.prompt.templateOnlyTokens,sha256:report.prompt.sha256}:null,wallMetrics:report.wallMetrics,memory:report.memory,errors:report.errors},null,2);}
function fail(stage,e){report.errors.push({stage,isoTime:iso(),name:e?.name||'Error',message:e?.message||String(e)});}
function limits(l){const keys=new Set();for(let p=l;p&&p!==Object.prototype;p=Object.getPrototypeOf(p))for(const k of Object.getOwnPropertyNames(p))if(typeof l[k]==='number')keys.add(k);return Object.fromEntries([...keys].sort().map(k=>[k,l[k]]));}
async function getJson(path){const res=await fetch(path,{cache:'no-store'});if(!res.ok)throw new Error(`HTTP ${res.status}: ${path}`);return res.json();}
function checkCancelled(){if(cancelled)throw new Error('Session interrupted by user;preserve attempt');}
export async function runSession({loadRuntime=()=>import(`${RUNTIME_ROOT}/genai_bundle.mjs`)}={}){
 if(busy||attempted)return;if(captureEnabled){await gates.refresh();if(!gates.idleAccepted)throw new Error('Mandatory PAGE_IDLE capture missing;initialization blocked');await gates.synchronize();}attempted=true;busy=true;report=fresh();report.startIsoTime=iso();let stage='environment';report.status='PREPARING';render();
 try{
  if(!isSecureContext||!navigator.gpu)throw new Error('Secure-context WebGPU required');snapshot('BEFORE_RUNTIME');event('session_start');
  const adapter=await navigator.gpu.requestAdapter();if(!adapter)throw new Error('No environment probe adapter');report.environment.probeAdapter={info:adapter.info?Object.fromEntries(['vendor','architecture','device','description'].map(k=>[k,adapter.info[k]])):null,features:[...adapter.features],limits:limits(adapter.limits),scope:'Independent probe,not runtime device'};
  stage='runtime preparation';const start=event('runtime_preparation_start');report.runtime.manifest=await getJson('./runtime_manifest.json');if(report.runtime.manifest.version!==VERSION||report.runtime.manifest.package!=='@mediapipe/tasks-genai'||report.runtime.manifest.localRoot!==RUNTIME_ROOT)throw new Error('Fixed runtime manifest mismatch');
  const {FilesetResolver,LlmInference}=await loadRuntime();const fileset=await FilesetResolver.forGenAiTasks(`${RUNTIME_ROOT}/wasm`);report.runtime.fileset={...fileset};
  for(const path of [fileset.wasmLoaderPath,fileset.wasmBinaryPath]){const res=await fetch(path,{method:'HEAD',cache:'no-store'});if(!res.ok)throw new Error('Missing local WASM resource');}
  const end=event('runtime_preparation_end');report.wallMetrics.runtimePreparationMs=end.wallMs-start.wallMs;
  stage='model identity';const manifest=await getJson('/assets/models/model_manifest.json');validateModelManifest(manifest);report.model.manifest=manifest;
  const head=await fetch(MODEL_PATH,{method:'HEAD',cache:'no-store'});if(!head.ok||Number(head.headers.get('content-length'))!==manifest.actualBytes)throw new Error('Served Web model size mismatch');checkCancelled();
  stage='model initialization';report.status='INITIALIZING';render();snapshot('BEFORE_INIT');
  gates.mark('MODEL_INIT');
  await gates.synchronize();const initStart=event('initialization_start');
  device=await LlmInference.createWebGpuDevice();report.environment.runtimeDevice={features:[...device.features],limits:limits(device.limits),scope:'Actual stock helper device supplied to runtime;backend UNKNOWN'};
  device.addEventListener('uncapturederror',e=>fail('GPU uncaptured',e.error));device.lost.then(info=>{if(info.reason!=='destroyed')fail('device lost',new Error(info.message||info.reason));}).catch(e=>fail('device lost promise',e));
  memory=new SessionMemory();memory.setPhase('MODEL_INIT');memory.installResources(device);
  task=await LlmInference.createFromOptions(fileset,{...SESSION_OPTIONS,baseOptions:{modelAssetPath:MODEL_PATH,gpuOptions:{device}}});
  const initEnd=event('initialization_end');report.wallMetrics.modelInitializationMs=initEnd.wallMs-initStart.wallMs;report.lifecycle.initialized=true;snapshot('AFTER_INIT');checkCancelled();
  await gates.wait('AFTER_INIT');checkCancelled();
  stage='tokenizer preparation';report.status='TOKEN_PREPARATION';render();memory.setPhase('TOKEN_PREPARATION');const tokenStart=event('token_preparation_start');
  gates.mark('TOKEN_PREPARATION');
  report.prompt=await buildExactPrompt(text=>task.sizeInTokens(text),report.session.targetTokens,async()=>{checkCancelled();await new Promise(r=>setTimeout(r,0));});
  const tokenEnd=event('token_preparation_end');report.wallMetrics.tokenPreparationMs=tokenEnd.wallMs-tokenStart.wallMs;
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(report.prompt.fullPrompt));report.prompt.sha256=[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');
  report.lifecycle.exactPromptVerified=true;const tdStart=event('token_drain_start');await device.queue.onSubmittedWorkDone();const tdEnd=event('token_drain_end');report.wallMetrics.tokenPreparationDrainMs=tdEnd.wallMs-tdStart.wallMs;snapshot('AFTER_TOKEN_PREPARATION');checkCancelled();
  await gates.wait('BEFORE_GENERATION');checkCancelled();
  if(report.errors.length)throw new Error('Errors before generation');stage='generation';memory.setPhase('GENERATION');report.status='GENERATING';snapshot('BEFORE_GENERATION');render();report.lifecycle.generationStarted=true;
  const genStart=event('generation_start');
  gates.mark('GENERATION');
  try{
   const returned=await task.generateResponse(report.prompt.fullPrompt,(fragment,done)=>{
    const now=performance.now();if(report.wallMetrics.firstCallbackMs===null){report.wallMetrics.firstCallbackMs=now-genStart.wallMs;snapshot('FIRST_CALLBACK');}
    if(report.events.filter(e=>e.type==='callback').length>=10000){report.droppedCallbacks++;return;}
    report.events.push({type:'callback',isoTime:iso(),wallMs:now,relativeWallMs:now-genStart.wallMs,fragment:String(fragment),done:Boolean(done)});report.output.streamedText+=String(fragment);if(done)report.lifecycle.doneObserved=true;
   });
   const genEnd=event('generation_end',{promiseState:'RESOLVED'});gates.mark('AFTER_GENERATION');report.wallMetrics.generationCallToCompletionMs=genEnd.wallMs-genStart.wallMs;report.lifecycle.generationResolved=true;report.output.returnedText=returned;report.output.finalText=typeof returned==='string'?returned:report.output.streamedText;report.lifecycle.nonemptyOutput=Boolean(report.output.finalText.trim());
  }catch(e){event('generation_end',{promiseState:'REJECTED'});throw e;}
  finally{
   gates.mark('DRAIN');
   memory.setPhase('POST_GENERATION');snapshot('AFTER_GENERATION');const ds=event('gpu_drain_start');try{await device.queue.onSubmittedWorkDone();report.lifecycle.drainCompleted=true;}catch(e){fail('GPU drain',e);}const de=event('gpu_drain_end');report.wallMetrics.postGenerationDrainMs=de.wallMs-ds.wallMs;snapshot('AFTER_DRAIN');
  }
  await gates.wait('AFTER_DRAIN');checkCancelled();
  if(!report.lifecycle.doneObserved||!report.lifecycle.nonemptyOutput)throw new Error('Generation missing done or nonempty output');checkCancelled();
  report.status=report.errors.length?'ERROR':report.droppedCallbacks?'INCOMPLETE':'COMPLETE';
 }catch(e){fail(stage,e);report.status=cancelled?'INTERRUPTED':'ERROR';}
 finally{
  gates.mark('CLEANUP');gates.abort();
  if(memory)memory.setPhase('CLEANUP');try{task?.close();}catch(e){fail('task close',e);}task=null;snapshot('AFTER_TASK_CLOSE');
  try{device?.destroy();}catch(e){fail('device destroy',e);}device=null;
  if(memory){snapshot('AFTER_DEVICE_DESTROY');memory.stopAndRestore();report.memory.logicalResources=memory.exportResources();}
  if(report.status==='COMPLETE'&&report.errors.length)report.status='ERROR';if(report.status==='COMPLETE'&&report.memory.logicalResources?.snapshot.status==='INCOMPLETE')report.status='COMPLETE_WITH_MEMORY_LIMITATIONS';
  snapshot('AFTER_CLEANUP');event('session_end');report.endIsoTime=iso();report.readiness='EXECUTED';busy=false;render();
  gates.mark('FINISHED');
 }
}
report=fresh();ui.ordinal.addEventListener('change',()=>{if(!attempted){report=fresh();render();}});ui.run.addEventListener('click',()=>runSession());
ui.cancel.addEventListener('click',()=>{cancelled=true;gates.abort();report.cancelRequestedIsoTime=iso();try{task?.cancelProcessing();}catch(e){fail('cancelProcessing',e);}});
ui.download.addEventListener('click',()=>{const data={...report,memoryCapture:{...report.memoryCapture,stageMetadata:globalThis.__memory002State},exportedIsoTime:iso(),inProgressSnapshot:busy};const link=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));link.href=url;link.download=`${captureEnabled?'MEMORY002-':''}BASELINE002-L${report.session.targetTokens}-R${report.session.repetition}-${(report.endIsoTime||iso()).replace(/[:.]/g,'-')}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
document.addEventListener('visibilitychange',()=>{if(busy){report.visibility.events.push({isoTime:iso(),wallMs:performance.now(),state:document.visibilityState,stage:report.status});if(document.hidden)report.visibility.enteredBackground=true;}});
window.addEventListener('error',e=>fail('window error',e.error||new Error(e.message)));window.addEventListener('unhandledrejection',e=>fail('unhandled promise rejection',e.reason));render();
