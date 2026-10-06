// Opt-in collection holds; no changes to stock runtime/model algorithms.
export class MemoryCaptureGates {
 constructor({enabled,sessionId,clock=()=>({isoTime:new Date().toISOString(),wallMs:performance.now()}),publish=()=>{},show=()=>{},record=()=>{},protocol=null}){
  Object.assign(this,{enabled,clock,publish,show,record,protocol});this.resume=null;this.captureAccepted=false;this.idleAccepted=false;this.pendingMark=Promise.resolve();
  this.state={experimentId:'MEMORY002',sessionId,enabled,readiness:enabled?(protocol?'BLOCKED_UNTIL_IDLE_CAPTURE':'READY_FOR_CAPTURE'):'DISABLED',stage:'PAGE_IDLE',history:[]};this.mark('PAGE_IDLE');
 }
 mark(stage){const time=this.clock();this.state.stage=stage;this.captureAccepted=false;this.state.markerId=crypto.randomUUID();this.state.history.push({stage,...time});this.publish(JSON.parse(JSON.stringify(this.state)));
  if(this.enabled&&this.protocol){const marker={stage,markerId:this.state.markerId,pageEpochMs:Date.parse(time.isoTime),pageMonoMs:time.wallMs};this.pendingMark=this.pendingMark.then(()=>this.protocol.post('marker',marker)).catch(e=>{this.state.protocolError=e.message;this.publish(JSON.parse(JSON.stringify(this.state)));});}
 }
 async refresh(){if(!this.enabled||!this.protocol)return;await this.pendingMark;const s=await this.protocol.state();this.idleAccepted=s.idleAccepted===true;this.captureAccepted=s.captures.some(c=>c.markerId===this.state.markerId&&c.status==='ACCEPTED');this.state.idleAccepted=this.idleAccepted;this.state.captureAccepted=this.captureAccepted;this.state.readiness=this.idleAccepted?'READY_FOR_CAPTURE':'BLOCKED_UNTIL_IDLE_CAPTURE';this.publish(JSON.parse(JSON.stringify(this.state)));this.show(this.state.stage,Boolean(this.resume));return s;}
 async synchronize(){if(this.enabled&&this.protocol){await this.pendingMark;if(this.state.protocolError)throw new Error(this.state.protocolError);await this.protocol.sync();}}
 async wait(stage){this.mark(stage);if(!this.enabled)return;
  const start=this.clock();this.record('memory_capture_wait_start',{stage,...start});
  await this.synchronize();
  await new Promise(resolve=>{this.resume=resolve;this.show(stage,true);});
  this.resume=null;this.show(stage,false);this.record('memory_capture_wait_end',{stage,...this.clock()});await this.synchronize();
 }
 continue(){if(this.protocol&&!this.captureAccepted)return false;this.resume?.();return true;}
 abort(){this.resume?.();}
}

export function captureProtocol(sessionId,fetcher=fetch){
 const post=async(op,data)=>{const res=await fetcher('/__memory002/'+op,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId,...data}),signal:AbortSignal.timeout(5000)});if(!res.ok)throw new Error('Capture protocol HTTP '+res.status+';use serve_memory002.py');return res.json();};
 return {post,state:async()=>{const res=await fetcher('/__memory002/state?sessionId='+sessionId,{cache:'no-store',signal:AbortSignal.timeout(5000)});if(!res.ok)throw new Error('Capture server unavailable');return res.json();},sync:async()=>{const pageSendEpochMs=Date.now(),pageSendMonoMs=performance.now();const exchange=await post('clock',{pageSendEpochMs,pageSendMonoMs});const pageReceiveEpochMs=Date.now(),pageReceiveMonoMs=performance.now();return post('clock_ack',{exchangeId:exchange.exchangeId,pageReceiveEpochMs,pageReceiveMonoMs});}};
}
