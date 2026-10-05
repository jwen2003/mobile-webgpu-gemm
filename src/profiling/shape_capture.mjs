// Bounded metadata/uniform-only observer. No GPU allocation, usage mutation or waits.
export function writeBufferBytes(data,dataOffset=0,size){
  const view=ArrayBuffer.isView(data),unit=view?(data.BYTES_PER_ELEMENT||1):1;
  const offset=(view?data.byteOffset:0)+dataOffset*unit;
  const available=view?data.byteLength:data.byteLength;
  const length=size===undefined?available-dataOffset*unit:size*unit;
  if(!Number.isSafeInteger(offset)||!Number.isSafeInteger(length)||length<0||dataOffset<0||dataOffset*unit+length>available)throw new Error('Invalid writeBuffer source range');
  return new Uint8Array(view?data.buffer:data,offset,length);
}
export class ShapeCapture {
  constructor(targetSource,{phase=()=> 'UNKNOWN',maxSamples=8,maxObjects=30000,maxUpdates=100000,maxOperations=30000,maxShadowBytes=8*1024*1024}={}){
    this.source=targetSource;this.phase=phase;this.limits={maxSamples,maxObjects,maxUpdates,maxOperations,maxShadowBytes,maxUniformBufferBytes:2*1024*1024};
    this.meta=new WeakMap();this.shadows=new WeakMap();this.groups=new WeakMap();this.pipelines=new WeakMap();this.shaders=new WeakSet();
    this.layouts=new WeakMap();this.commands=new WeakMap();this.restores=[];this.installed=new WeakMap();this.active=true;
    this.sequence=0;this.nextId=0;this.shadowBytes=0;this.snapshots=[];this.updates=[];this.updateIndex=new Map();this.failures=[];this.dropped=0;
    this.selectedEncoded=0;this.selectedSubmitted=0;this.overheadMs=0;this.calls={};this.compilationTasks=[];this.compilationMessages=[];this.shadowRefs=[];this.encodedOperations=0;
  }
  failure(s){if(this.failures.length<100)this.failures.push(String(s));else this.dropped++;}
  safe(fn){const start=performance.now();try{fn();}catch(e){this.failure(e.message);}finally{this.overheadMs+=performance.now()-start;}}
  id(o,kind,extra={}){if(!o||typeof o!=='object')return null;let m=this.meta.get(o);if(m)return m;
    if(this.nextId>=this.limits.maxObjects){this.dropped++;return null;}m={id:`shape-${kind}-${++this.nextId}`,kind,label:o.label||'',...extra};this.meta.set(o,m);return m;}
  wrap(o,name,hook,before=false){if(this.installed.get(o)?.has(name))return;
    if(typeof WeakRef!=='function')throw new Error('WeakRef unavailable; reversible capture not installed');
    const original=o[name],descriptor=Object.getOwnPropertyDescriptor(o,name),self=this;
    if(typeof original!=='function')throw new Error(`Missing ${name}`);
    const wrapper=function(...args){let result;
      if(before&&self.active)self.safe(()=>hook(this,args,undefined,++self.sequence));
      try{result=Reflect.apply(original,this,args);}catch(e){if(self.active)self.failure(`Native ${name}: ${e.message}`);throw e;} // Preserve native exception.
      if(!before&&self.active)self.safe(()=>hook(this,args,result,++self.sequence));
      if(self.active)self.calls[name]=(self.calls[name]||0)+1;return result;};
    Object.defineProperty(o,name,{configurable:true,writable:true,value:wrapper});if(o[name]!==wrapper)throw new Error(`Wrap failed ${name}`);
    let set=this.installed.get(o);if(!set){set=new Set();this.installed.set(o,set);}set.add(name);
    this.restores.push({ref:new WeakRef(o),name,descriptor,wrapper});
  }
  update(buffer,offset,bytes,origin,sequence){const s=this.shadows.get(buffer);if(!s)return;
    if(offset<0||offset+(bytes?.length||0)>s.bytes.length){this.failure('Uniform update range exceeds buffer');return;}
    const u={id:sequence,bufferId:this.meta.get(buffer)?.id,offset,length:bytes?.length??s.bytes.length,bytes:bytes&&bytes.length<=64?Array.from(bytes):null,origin,phase:this.phase()};
    if(this.updates.length<this.limits.maxUpdates){this.updates.push(u);this.updateIndex.set(sequence,u);}else this.dropped++;
    if(bytes){s.bytes.set(bytes,offset);s.known.fill(1,offset,offset+bytes.length);s.versions.fill(sequence,offset,offset+bytes.length);}
    else {s.known.fill(0);s.versions.fill(sequence);}s.version=sequence;
  }
  snapshot(group,offsets){const g=this.groups.get(group);if(!g)return {status:'UNKNOWN',reason:'Bind group metadata missing'};
    const dynamic=g.entries.filter(e=>e.dynamic).sort((a,b)=>a.binding-b.binding);
    if(offsets.length&&(!g.layoutKnown||dynamic.length!==offsets.length))return {status:'UNKNOWN',reason:'Dynamic offset layout unavailable',entries:g.entries.map(({nativeBuffer,...e})=>e)};
    const additions=new Map(dynamic.map((e,i)=>[e.binding,offsets[i]]));
    return {id:g.id,entries:g.entries.map(e=>{
      const extra=additions.get(e.binding)||0,offset=(e.offset||0)+extra,s=this.shadows.get(e.nativeBuffer);
      const {nativeBuffer,...clean}=e;const out={...clean,dynamicOffset:extra,effectiveOffset:offset};
      if(e.binding===3){
        if(!s||offset+16>s.bytes.length||e.size<16)out.uniform={status:'UNKNOWN',reason:'No safe small uniform shadow/range'};
        else{const known=s.known.slice(offset,offset+16),versions=[...new Set(s.versions.slice(offset,offset+16))];
          const bytes=Array.from(s.bytes.slice(offset,offset+16)),view=new DataView(Uint8Array.from(bytes).buffer);
          const provenance=new Map(),pending=[...versions];while(pending.length&&provenance.size<64){const id=pending.pop();if(provenance.has(id))continue;
            const record=this.updateIndex.get(id)||{id,origin:id===0?'WebGPU zero-initialization':'UNKNOWN_OR_DROPPED'};provenance.set(id,record);
            for(const parent of record.origin?.sourceUpdateIds||[])if(!provenance.has(parent))pending.push(parent);}
          if(pending.length)this.failure('Selected uniform provenance exceeds64 updates');
          out.uniform={status:known.every(Boolean)?'KNOWN':'UNKNOWN',bytes:known.every(Boolean)?bytes:null,
            i32:known.every(Boolean)?Array.from({length:4},(_,i)=>view.getInt32(i*4,true)):null,
            knownByteMask:Array.from(known),version:s.version,updateIds:versions,updates:[...provenance.values()]};
        }
      }return out;
    })};
  }
  install(device){
    const pipeline=(desc,p)=>{this.id(p,'pipeline');this.pipelines.set(p,{id:this.meta.get(p)?.id,shaderId:this.meta.get(desc.compute.module)?.id,target:this.shaders.has(desc.compute.module),
      entryPoint:desc.compute.entryPoint??null,constants:{...desc.compute.constants}});};
    this.wrap(device,'createShaderModule',(_, [d],m)=>{this.id(m,'shader');if(String(d.code)===this.source){this.shaders.add(m);
      if(typeof m.getCompilationInfo==='function')this.compilationTasks.push(m.getCompilationInfo().then(info=>{
        this.compilationMessages.push(...Array.from(info.messages,x=>({type:x.type,message:x.message,lineNum:x.lineNum,linePos:x.linePos})));
        if(info.messages.some(x=>x.type==='error'))this.failure('Selected WGSL compilation error');
      },e=>this.failure('Compilation info '+e.message)));}});
    this.wrap(device,'createComputePipeline',(_, [d],p)=>pipeline(d,p));
    this.wrap(device,'createComputePipelineAsync',(_, [d],promise)=>{promise.then(p=>{if(this.active)this.safe(()=>pipeline(d,p));},()=>{});});
    this.wrap(device,'createBuffer',(_, [d],b)=>{
      this.id(b,'buffer',{size:b.size??d.size,usage:b.usage??d.usage});
      const candidate=(d.usage&GPUBufferUsage.UNIFORM)||((d.usage&GPUBufferUsage.COPY_SRC)&&d.size<=256);
      if(candidate&&d.size<=this.limits.maxUniformBufferBytes&&this.shadowBytes+d.size<=this.limits.maxShadowBytes){
        this.shadowBytes+=d.size;this.shadowRefs.push(new WeakRef(b));this.shadows.set(b,{bytes:new Uint8Array(d.size),known:new Uint8Array(d.size).fill(d.mappedAtCreation?0:1),versions:new Float64Array(d.size),version:0});
        // Newly created unmapped WebGPU buffers are zero-initialized. Version0 records that origin.
        let ranges=[];
        this.wrap(b,'getMappedRange',(_,args,result)=>ranges.push({offset:args[0]||0,buffer:result}));
        this.wrap(b,'unmap',(self)=>{for(const r of ranges)this.update(self,r.offset,new Uint8Array(r.buffer),'mappedAtCreation/unmap',++this.sequence);ranges=[];},true);
      }else if(candidate)this.failure(`Uniform/staging shadow capacity unavailable: size=${d.size}, payloadUsed=${this.shadowBytes}, singleUniformLimit=${this.limits.maxUniformBufferBytes}, payloadBudget=${this.limits.maxShadowBytes}`);
    });
    this.wrap(device.queue,'writeBuffer',(_,args,__,seq)=>{
      const [b,bufferOffset,data,dataOffset,size]=args;if(!this.shadows.has(b))return;
      const bytes=writeBufferBytes(data,dataOffset??0,size);this.update(b,bufferOffset,bytes,{method:'queue.writeBuffer',bufferOffset,dataOffset:dataOffset??0,size:size??null,
        dataType:data.constructor.name,typedArrayByteOffset:ArrayBuffer.isView(data)?data.byteOffset:0,sourceByteLength:data.byteLength},seq);
    });
    this.wrap(device,'createTexture',(_, [d],t)=>{this.id(t,'texture',{width:t.width,height:t.height,depthOrArrayLayers:t.depthOrArrayLayers,format:t.format,dimension:t.dimension,usage:t.usage});
      this.wrap(t,'createView',(texture,[desc={}],v)=>this.id(v,'textureView',{texture:this.meta.get(texture),descriptor:{...desc}}));});
    this.wrap(device,'createBindGroupLayout',(_, [d],g)=>this.layouts.set(g,d.entries.map(e=>({binding:e.binding,bufferType:e.buffer?.type,hasDynamicOffset:!!e.buffer?.hasDynamicOffset}))));
    this.wrap(device,'createBindGroup',(_, [d],g)=>{this.id(g,'bindGroup');const layout=this.layouts.get(d.layout);
      this.groups.set(g,{id:this.meta.get(g)?.id,layoutKnown:!!layout,entries:d.entries.map(e=>{
        const r=e.resource;
        if(r.buffer){const m=this.meta.get(r.buffer);return {binding:e.binding,buffer:m||{id:null,size:r.buffer.size,usage:r.buffer.usage},nativeBuffer:r.buffer,
          offset:r.offset??0,size:r.size??(r.buffer.size-(r.offset??0)),dynamic:layout?.find(l=>l.binding===e.binding)?.hasDynamicOffset||false};}
        return {binding:e.binding,resource:this.meta.get(r)||{kind:'UNKNOWN'},dynamic:false};})});});
    this.wrap(device,'createCommandEncoder',(_,__,encoder)=>{if(!this.id(encoder,'encoder'))return;const operations=[];
      const append=op=>{if(++this.encodedOperations>this.limits.maxOperations){this.dropped++;return;}operations.push(op);};
      this.wrap(encoder,'copyBufferToBuffer',(_,args)=>{if(this.shadows.has(args[2]))append({type:'copy',args:[...args]});});
      this.wrap(encoder,'clearBuffer',(_,args)=>{if(this.shadows.has(args[0]))append({type:'clear',args:[...args]});});
      if(typeof encoder.copyTextureToBuffer==='function')this.wrap(encoder,'copyTextureToBuffer',(_,args)=>{if(this.shadows.has(args[1].buffer))append({type:'unknownWrite',buffer:args[1].buffer});});
      if(typeof encoder.beginRenderPass==='function')this.wrap(encoder,'beginRenderPass',()=>{
        this.failure('Render pass outside supported uniform provenance');for(const ref of this.shadowRefs){const b=ref.deref();if(b)this.update(b,0,null,'Untracked render pass possible write',++this.sequence);}});
      this.wrap(encoder,'beginComputePass',(_,__,pass)=>{this.id(pass,'pass');let current=null;const groups=new Map();
        this.wrap(pass,'setPipeline',(_, [p])=>{current=p;});
        this.wrap(pass,'setBindGroup',(_, [index,g,data=[],start,length],__,seq)=>{
          if(!Array.isArray(data)&&!ArrayBuffer.isView(data)){this.failure('Non-replayable dynamic offsets unavailable');return;}
          const offsets=Array.from(data);const used=start===undefined?offsets:offsets.slice(start,start+(length??(offsets.length-start)));
          groups.set(index,{g,offsets:used,setBindGroupSequence:seq});});
        const dispatch=(_,args,__,seq,indirect)=>{const p=this.pipelines.get(current);if(p?.target&&this.phase()==='GENERATION')this.selectedEncoded++;
          const relevant=p?.target||[...groups.values()].some(({g})=>(this.groups.get(g)?.entries||[]).some(e=>e.nativeBuffer&&this.shadows.has(e.nativeBuffer)&&(e.buffer.usage&GPUBufferUsage.STORAGE)));
          if(!relevant)return;
          append({type:'dispatch',pipeline:p,passId:this.meta.get(pass)?.id,encodeSequence:seq,phase:this.phase(),groups:new Map(groups),
            dispatch:indirect?{indirect:true,buffer:this.meta.get(args[0]),offset:args[1],workgroups:'UNKNOWN'}:{x:args[0],y:args[1]??1,z:args[2]??1}});};
        this.wrap(pass,'dispatchWorkgroups',(a,b,c,s)=>dispatch(a,b,c,s,false));
        this.wrap(pass,'dispatchWorkgroupsIndirect',(a,b,c,s)=>dispatch(a,b,c,s,true));
      });
      this.wrap(encoder,'finish',(_,__,command)=>{this.id(command,'commandBuffer');this.commands.set(command,operations);});
    });
    this.wrap(device.queue,'submit',(_, [commands],__,seq)=>{
      if(!Array.isArray(commands)){this.failure('Non-array submit sequence not consumed twice');return;}
      for(const command of commands){const ops=this.commands.get(command);if(!ops){this.failure('Untracked command buffer');continue;}
        for(const op of ops){
          if(op.type==='copy'){const [src,so,dst,off,len]=op.args,s=this.shadows.get(src),t=this.shadows.get(dst);if(!t)continue;
            if(s&&s.known.slice(so,so+len).length===len&&s.known.slice(so,so+len).every(Boolean))this.update(dst,off,s.bytes.slice(so,so+len),
              {method:'copyBufferToBuffer',sourceBufferId:this.meta.get(src)?.id,sourceOffset:so,destinationOffset:off,size:len,sourceUpdateIds:[...new Set(s.versions.slice(so,so+len))]},++this.sequence);
            else this.update(dst,0,null,'GPU copy: source bytes UNKNOWN; no post-generation substitution',++this.sequence);
          }else if(op.type==='clear'){const [b,off=0,size]=op.args,s=this.shadows.get(b);if(s)this.update(b,off,new Uint8Array(size??(s.bytes.length-off)),'GPU clearBuffer',++this.sequence);
          }else if(op.type==='unknownWrite'){if(this.shadows.has(op.buffer))this.update(op.buffer,0,null,'GPU texture copy bytes UNKNOWN',++this.sequence);
          }else{
            if(op.pipeline?.target&&op.phase==='GENERATION'){
              this.selectedSubmitted++;
              if(this.snapshots.length<this.limits.maxSamples)this.snapshots.push({submitSequence:seq,commandBufferId:this.meta.get(command)?.id,
                passId:op.passId,encodeSequence:op.encodeSequence,pipeline:op.pipeline,dispatch:op.dispatch,
                bindings:[...op.groups].map(([index,{g,offsets,setBindGroupSequence}])=>({index,setBindGroupSequence,dynamicOffsets:offsets,...this.snapshot(g,offsets)})),
                parameterBoundary:'Queue-order shadow after preceding writes/copies at this submission occurrence, not final buffer contents'});
              else this.dropped++;
            }
            // Conservatively invalidate any uniform/storage dual-use resource a dispatch could write.
            for(const {g} of op.groups.values())for(const e of this.groups.get(g)?.entries||[])if(e.nativeBuffer&&this.shadows.has(e.nativeBuffer)&&(e.buffer.usage&GPUBufferUsage.STORAGE))
              this.update(e.nativeBuffer,0,null,'Compute may write dual-use uniform/storage buffer',++this.sequence);
          }
        }
      }
    });
  }
  stop(){this.active=false;for(const r of this.restores.reverse()){const o=r.ref.deref();if(!o)continue;try{if(o[r.name]!==r.wrapper)throw new Error('Wrapper changed');if(r.descriptor)Object.defineProperty(o,r.name,r.descriptor);else delete o[r.name];}catch(e){this.failure(`Restore ${r.name}: ${e.message}`);}}this.restores=[];}
  export(){const missing=this.snapshots.filter(s=>s.bindings.find(g=>g.index===0)?.entries?.find(e=>e.binding===3)?.uniform?.status!=='KNOWN').length;
    return {collectorRevision:'SHAPE001-uniform-arena-v2',shadowHostArrayBytes:this.shadowBytes*10,status:this.failures.length||this.dropped||!this.selectedSubmitted?'INCOMPLETE':'COMPLETE',parameterBytesStatus:this.snapshots.length&&!missing?'KNOWN':'INCOMPLETE',missingUniformSnapshots:missing,
    logicalShapeStatus:'UNKNOWN_UNTIL_AXIS_PADDING_REVIEW',selectedEncoded:this.selectedEncoded,selectedSubmitted:this.selectedSubmitted,
    snapshots:this.snapshots,compilationMessages:this.compilationMessages,limits:this.limits,dropped:this.dropped,coverageFailures:this.failures,shadowBytes:this.shadowBytes,encodedRelevantOperations:this.encodedOperations,calls:this.calls,collectorCpuWallMs:this.overheadMs,
    limitations:['Only selected exact shader source; metadata and bounded CPU uniform-arena shadows only; exports selected16-byte parameters, no weights/activations read',
      'GPU-generated bytes unavailable unless queue-order provenance proves known; no final-content substitution/no usage mutation/no extra GPU readback',
      'No render-pass/worker/external device capture; bounded loss or wrapper failures INCOMPLETE',
      'Physical GPU completion, valid tensor axes and padding remain independent evidence requirements']};}
}
