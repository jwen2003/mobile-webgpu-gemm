import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {SESSION_PLAN,SESSION_OPTIONS,sessionTarget,buildExactPrompt,PREFIX,SUFFIX} from '../src/baseline/session_plan.mjs';
import {SessionMemory,textureLogicalBytes} from '../src/baseline/session_memory.mjs';
// This tokenizer is a CPU test double,not the model tokenizer or phone evidence.
const tokenizer=t=>30+(t.startsWith(PREFIX)?6:0)+(t.match(/ data/g)||[]).length;
for(const length of [128,512,1024]){const p=await buildExactPrompt(tokenizer,length);assert.equal(p.verifiedFullTokens,length);assert.equal(p.fullPrompt,PREFIX+p.body+SUFFIX);assert.equal(p.totalTokenizerCalls,p.searchCalls.length+3);}
await assert.rejects(()=>buildExactPrompt(()=>undefined,128));await assert.rejects(()=>buildExactPrompt(()=>127,128));
for(const n of [128,512,1024])assert.equal(SESSION_PLAN.schedule.filter(x=>x===n).length,5);
assert.equal(sessionTarget(15).repetition,5);assert.equal(SESSION_OPTIONS.maxTokens,2048);
assert.equal(textureLogicalBytes({format:'rgba16float',width:8,height:4,depthOrArrayLayers:2,mipLevelCount:2,sampleCount:1,dimension:'2d'}),640);
assert.equal(textureLogicalBytes({format:'UNKNOWN'}),null);
const memory=new SessionMemory(),originalError=new Error('native error');
const fake={createBuffer(d){assert.equal(this,fake);if(d.fail)throw originalError;return {size:d.size,usage:3,destroy(){return 17;}};},createTexture(d){return {...d,usage:1,destroy(){return 9;}};}};
const orig=fake.createBuffer;memory.installResources(fake);let b=fake.createBuffer({size:20});assert.equal(memory.snapshot().buffers.currentLogicalBytes,20);assert.equal(b.destroy(),17);assert.equal(b.destroy(),17);assert.equal(memory.snapshot().buffers.currentLogicalBytes,0);
assert.throws(()=>fake.createBuffer({fail:true}),e=>e===originalError);
fake.createTexture({format:'UNKNOWN',width:1,height:1,depthOrArrayLayers:1,mipLevelCount:1,sampleCount:1,dimension:'2d'});assert.equal(memory.snapshot().textures.totalLogicalBytes,null);memory.stopAndRestore();assert.equal(fake.createBuffer,orig);

const elements=new Map();for(const k of ['ordinal','target','run','cancel','download','status','output','summary','thermal','charging','devtools','flag','backgroundApps','captureContinue','captureMode','captureStage','captureRefresh'])elements.set(k,{value:k==='ordinal'?'1':'UNKNOWN',textContent:'',disabled:false,listeners:{},addEventListener(k,f){this.listeners[k]=f;},append(){}});
globalThis.document={visibilityState:'visible',hidden:false,getElementById:k=>elements.get(k),createElement(){return {click(){},append(){}};},addEventListener(){}};
globalThis.window={addEventListener(){}};globalThis.location={href:'CPU MOCK'};globalThis.isSecureContext=true;
let released=false,createTasks=0,callbackMode='normal',identityFailure=false,heapEnabled=true;let lastDevice;
Object.defineProperty(performance,'memory',{configurable:true,get(){return heapEnabled?{usedJSHeapSize:123,totalJSHeapSize:456,jsHeapSizeLimit:789}:undefined;}});
function device(){return {features:new Set(['shader-f16']),limits:{maxBufferSize:2**28},lost:new Promise(()=>{}),addEventListener(){},createBuffer(d){return {size:d.size,usage:d.usage,destroy(){}};},createTexture(d){return {...d,width:4,height:4,depthOrArrayLayers:1,mipLevelCount:1,sampleCount:1,dimension:'2d',format:'rgba16float',usage:1,destroy(){}};},queue:{async onSubmittedWorkDone(){}},destroy(){released=true;}};}
Object.defineProperty(globalThis,'navigator',{value:{userAgent:'CPU MOCK',gpu:{async requestAdapter(){return {info:{vendor:'',architecture:'',device:'',description:''},features:new Set(['shader-f16']),limits:{maxBufferSize:2**28}};}}},configurable:true});
let mockIdleAccepted=true,mockMarker;
globalThis.fetch=async (path,options)=>({ok:true,status:200,headers:{get(){return identityFailure?'1':'3038117888';}},async json(){if(path.startsWith('/__memory002/')){const body=options?.body?JSON.parse(options.body):{};if(path.endsWith('/marker')){mockMarker=body;return {marker:body};}if(path.endsWith('/clock'))return {exchangeId:'mock'};if(path.endsWith('/clock_ack'))return {status:'BOUNDED'};return {idleAccepted:mockIdleAccepted,captures:mockMarker?[{markerId:mockMarker.markerId,status:'ACCEPTED'}]:[]};}return JSON.parse(await fs.readFile(path==='./runtime_manifest.json'?'src/baseline/runtime_manifest.json':'assets/models/model_manifest.json','utf8'));}});
let blob;URL.createObjectURL=b=>{blob=b;return 'blob:mock';};URL.revokeObjectURL=()=>{};
const runtime={FilesetResolver:{async forGenAiTasks(){return {wasmLoaderPath:'loader',wasmBinaryPath:'wasm'};}},LlmInference:{async createWebGpuDevice(){lastDevice=device();return lastDevice;},async createFromOptions(_,opts){assert.equal(opts.maxTokens,2048);assert.equal(opts.baseOptions.gpuOptions.device,lastDevice);createTasks++;const buffer=lastDevice.createBuffer({size:64,usage:1});lastDevice.createTexture({});return {sizeInTokens:tokenizer,async generateResponse(p,callback){assert.equal(tokenizer(p),128);if(callbackMode==='reject')throw new Error('mock generation error');callback('Hello ',false);if(callbackMode==='normal')callback('world.',true);return 'Hello world.';},close(){buffer.destroy();},cancelProcessing(){}};}}};
async function freshPage(tag){elements.get('ordinal').value='1';released=false;const mod=await import('../src/baseline/sessions.js?mock='+tag);await mod.runSession({loadRuntime:async()=>runtime});elements.get('download').listeners.click();return {mod,r:JSON.parse(await blob.text())};}
let {mod,r}=await freshPage('success');assert.equal(r.status,'COMPLETE');assert.equal(r.wallMetrics.firstCallbackMs,r.events.find(e=>e.type==='callback').relativeWallMs);assert.equal(released,true);assert.equal(r.memory.logicalResources.snapshot.buffers.currentLogicalBytes,0);assert.equal(r.memory.logicalResources.snapshot.textures.knownFormatCurrentLogicalBytes,128);assert.equal(r.unavailable.actualGeneratedTokens,'UNAVAILABLE');let before=createTasks;await mod.runSession({loadRuntime:async()=>runtime});assert.equal(createTasks,before);
let audit=spawnSync('python',['scripts/verify_baseline_sessions.py','--stdin'],{input:JSON.stringify(r),encoding:'utf8'});assert.equal(audit.status,0,audit.stderr);assert.equal(JSON.parse(audit.stdout).verification,'PASS');
callbackMode='reject';({r}=await freshPage('reject'));assert.equal(r.status,'ERROR');assert.ok(r.wallMetrics.postGenerationDrainMs!==null);assert.equal(released,true);
callbackMode='no-done';({r}=await freshPage('missing-done'));assert.equal(r.status,'ERROR');callbackMode='normal';identityFailure=true;({r}=await freshPage('identity'));assert.equal(r.status,'ERROR');identityFailure=false;heapEnabled=false;({r}=await freshPage('heap-unavailable'));assert.equal(r.status,'COMPLETE');assert.equal(r.memory.snapshots[0].jsHeap.status,'UNAVAILABLE');
globalThis.location.search='?memory002=1';
const continueTimer=setInterval(()=>{elements.get('captureRefresh').listeners.click?.();if(!elements.get('captureContinue').disabled)elements.get('captureContinue').listeners.click?.();},2);
try{
 ({r}=await freshPage('memory002-holds'));assert.equal(r.status,'COMPLETE');assert.equal(r.memoryCapture.enabled,true);
 const starts=r.events.filter(e=>e.type==='memory_capture_wait_start'),ends=r.events.filter(e=>e.type==='memory_capture_wait_end');
 assert.deepEqual(starts.map(e=>e.stage),['AFTER_INIT','BEFORE_GENERATION','AFTER_DRAIN']);assert.equal(ends.length,3);
 const event=t=>r.events.find(e=>e.type===t);
 assert.ok(event('initialization_end').wallMs<=starts[0].wallMs);assert.ok(ends[0].wallMs<=event('token_preparation_start').wallMs);
 assert.ok(ends[1].wallMs<=event('generation_start').wallMs);assert.ok(event('gpu_drain_end').wallMs<=starts[2].wallMs);
 assert.equal(r.wallMetrics.generationCallToCompletionMs,event('generation_end').wallMs-event('generation_start').wallMs);
 assert.equal(r.memoryCapture.stageMetadata.stage,'FINISHED');assert.equal(released,true);
}finally{clearInterval(continueTimer);}
mockIdleAccepted=false;const missingIdle=await import('../src/baseline/sessions.js?mock=missing-idle');const taskCountBefore=createTasks;await assert.rejects(()=>missingIdle.runSession({loadRuntime:async()=>runtime}),/PAGE_IDLE/);assert.equal(createTasks,taskCountBefore);assert.equal(elements.get('run').disabled,true);mockIdleAccepted=true;
const cancelTimer=setInterval(()=>{if(globalThis.__memory002State?.stage==='AFTER_INIT')elements.get('cancel').listeners.click();},2);
try{({r}=await freshPage('memory002-cancel'));assert.equal(r.status,'INTERRUPTED');assert.equal(r.lifecycle.generationStarted,false);assert.equal(released,true);assert.equal(r.memoryCapture.stageMetadata.stage,'FINISHED');}finally{clearInterval(cancelTimer);}
console.log('BASELINE002 CPU MOCK PASS:exact-search gating,15-session plan,resource lifecycle/native semantics,wall boundaries,independent Python audit,one generation/page,identity/error/missing-done/heap-unavailable handling. NOT model/phone evidence.');
