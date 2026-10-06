import {CountObserver} from '../profiling/count_observer.mjs';
// Reuse the proven reversible native wrapping utility; NO shader/pass/dispatch/submit observer.
export function textureLogicalBytes(t){
 const bpp={r8unorm:1,r16float:2,r32float:4,rgba8unorm:4,'rgba8unorm-srgb':4,rgba16float:8,rgba32float:16}[t.format];
 if(!bpp)return null;let texels=0;
 for(let level=0;level<t.mipLevelCount;level++)texels+=Math.max(1,Math.floor(t.width/2**level))*Math.max(1,Math.floor(t.height/2**level))*(t.dimension==='3d'?Math.max(1,Math.floor(t.depthOrArrayLayers/2**level)):t.depthOrArrayLayers);
 return texels*bpp*t.sampleCount;
}
export class SessionMemory extends CountObserver{
 constructor(){super({maxEvents:0,maxObjects:100000,maxShaderBytes:0});this.phase='BEFORE_INIT';this.phases={};this.setPhase('BEFORE_INIT');this.textureLive=0;this.texturePeak=0;this.unknownTextureLive=0;this.unknownTextureCreated=0;this.resourceSequence=0;this.created={buffer:0,texture:0};this.destroyed={buffer:0,texture:0};}
 // Only exception diagnostics use parent record; resource calls do not accumulate event traces.
 record(){}
 installResources(device){
  for(const kind of ['buffer','texture'])this.wrap(device,kind==='buffer'?'createBuffer':'createTexture',(_,args,resource,phase)=>{
   const m=this.meta(resource,kind);if(!m)return;m.createdPhase=phase;m.createdSequence=this.resourceSequence++;m.createdWallMs=performance.now();m.destroyed=false;m.usage=resource.usage;
   if(kind==='buffer'){m.logicalBytes=resource.size;m.mappedAtCreation=Boolean(args[0].mappedAtCreation);}
   else{for(const key of ['width','height','depthOrArrayLayers','mipLevelCount','sampleCount','dimension','format'])m[key]=resource[key];m.logicalBytes=textureLogicalBytes(m);}
   if(m.logicalBytes===null){this.unknownTextureLive++;this.unknownTextureCreated++;}else{this.created[kind]+=m.logicalBytes;if(kind==='buffer'){this.liveBytes+=m.logicalBytes;this.peakBytes=Math.max(this.peakBytes,this.liveBytes);}else{this.textureLive+=m.logicalBytes;this.texturePeak=Math.max(this.texturePeak,this.textureLive);}}
   this.wrap(resource,'destroy',(self,__,___,destroyPhase)=>{const item=this.ids.get(self);if(!item){this.failure('Untracked destroy receiver');return;}if(item.destroyed)return;item.destroyed=true;item.destroyedPhase=destroyPhase;item.destroyedSequence=this.resourceSequence++;item.destroyedWallMs=performance.now();if(item.logicalBytes===null)this.unknownTextureLive--;else{this.destroyed[kind]+=item.logicalBytes;if(kind==='buffer')this.liveBytes-=item.logicalBytes;else this.textureLive-=item.logicalBytes;}});
  });
  if(this.coverageFailures.length)throw new Error(this.coverageFailures.join('; '));
 }
 snapshot(){return {status:this.coverageFailures.length||this.droppedMetadata||this.droppedDiagnostics?'INCOMPLETE':'OBSERVED',
   buffers:{currentLogicalBytes:this.liveBytes,peakLogicalBytes:this.peakBytes,createdBytes:this.created.buffer,explicitDestroyedBytes:this.destroyed.buffer},
   textures:{knownFormatCurrentLogicalBytes:this.textureLive,knownFormatPeakLogicalBytes:this.texturePeak,createdKnownFormatBytes:this.created.texture,explicitDestroyedKnownFormatBytes:this.destroyed.texture,unknownFormatLiveCount:this.unknownTextureLive,unknownFormatCreatedCount:this.unknownTextureCreated,totalLogicalBytes:this.unknownTextureLive?null:this.textureLive,status:this.unknownTextureLive?'PARTIAL_UNKNOWN_FORMAT':'KNOWN_FORMAT_LOGICAL_PAYLOAD'},
   limits:{maxObjects:this.limits.maxObjects},droppedMetadata:this.droppedMetadata,droppedDiagnostics:this.droppedDiagnostics,coverageFailures:[...this.coverageFailures],
   scope:'Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero.'};}
 exportResources(){return {snapshot:this.snapshot(),resources:this.objects.map(x=>({...x})),nativeErrors:this.errors};}
}
export function heapSnapshot(){
 try{const m=performance.memory;if(!m)return {status:'UNAVAILABLE',reason:'performance.memory not exposed',scope:'Non-standard JS heap only,not WASM/native/GPU/process memory'};
  const fields=Object.fromEntries(['usedJSHeapSize','totalJSHeapSize','jsHeapSizeLimit'].map(k=>[k,Number.isFinite(m[k])?m[k]:null]));
  return {status:Object.values(fields).every(x=>x!==null)?'AVAILABLE':'PARTIAL',...fields,scope:'performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS'};
 }catch(e){return {status:'UNAVAILABLE',reason:e.message};}
}
