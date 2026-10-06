// One connection, bounded requests; no model/content/storage access.
const fs=require('node:fs'), http=require('node:http');
const port=Number(process.argv[2]);
const output=process.argv[3];
const rolesOnly=process.argv.includes('--roles-only');
const report={experimentId:'MEMORY002_METADATA',utcStart:new Date().toISOString(),targets:[],processes:[],targetRenderer:'UNKNOWN',errors:[],requestTimeoutMs:10000};
function get(path){return new Promise((resolve,reject)=>{
 const req=http.get({hostname:'127.0.0.1',port,path,agent:false},res=>{
  let text='';res.on('data',c=>text+=c);res.on('end',()=>{try{if(res.statusCode!==200)throw new Error('HTTP '+res.statusCode);resolve(JSON.parse(text));}catch(e){reject(e);}});
 });const timer=setTimeout(()=>req.destroy(new Error(path+' timeout')),10000);req.on('close',()=>clearTimeout(timer));req.on('error',reject);
});}
async function main(){let ws;const pending=new Map();let id=0;
 try{
  const version=await get('/json/version');report.browserVersion=version.Browser;
  const all=await get('/json/list');
  // Match known project paths independent of host/port/query. Drop unrelated URLs/titles.
  for(const t of all){try{const u=new URL(t.url);
   if(u.pathname==='/src/baseline/sessions.html'){
    const v=u.searchParams.get('v');
    report.targets.push({id:t.id,type:t.type,host:u.hostname,port:u.port|| (u.protocol==='https:'?'443':'80'),path:u.pathname,queryKeys:[...u.searchParams.keys()],versionQuery:['baseline-session-v1','memory002-v1'].includes(v)?v:(v===null?null:'OTHER'),memory002Query:u.searchParams.get('memory002')==='1'?'1':null,scheme:u.protocol});
   }
  }catch{}}
  const endpoint=new URL(version.webSocketDebuggerUrl);endpoint.hostname='127.0.0.1';endpoint.port=String(port);ws=new WebSocket(endpoint);
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('WebSocket timeout')),10000);ws.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});ws.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('WebSocket error'));},{once:true});});
  ws.addEventListener('message',e=>{const d=JSON.parse(e.data);const p=pending.get(d.id);if(p){pending.delete(d.id);clearTimeout(p.timer);d.error?p.reject(new Error(d.error.message)):p.resolve(d.result);}});
  function call(method,params={},sessionId){const key=++id;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(key);reject(new Error(method+' timeout'));},10000);pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method,params,...(sessionId?{sessionId}:{})}));});}
  const info=await call('SystemInfo.getProcessInfo');report.processes=info.processInfo.map(p=>({pid:p.id,type:p.type,evidence:'SystemInfo.getProcessInfo'}));
  report.mappingLimit='TargetInfo does not expose OS PID. No target renderer mapping proven; never infer from unique renderer.';
  report.stageQuery=rolesOnly?'SKIPPED_EXPLICIT_ROLES_ONLY':'ATTEMPTED';
  if(!rolesOnly&&report.targets.length===1){
   const target=report.targets[0];const attached=await call('Target.attachToTarget',{targetId:target.id,flatten:true});
   try{
    // Only project's explicitly published experiment/stage metadata; no arbitrary page state.
    const state=await call('Runtime.evaluate',{expression:'globalThis.__memory002State ? JSON.stringify(globalThis.__memory002State) : null',returnByValue:true},attached.sessionId);
    target.stageMetadata=typeof state.result?.value==='string'?JSON.parse(state.result.value):null;
   }finally{await call('Target.detachFromTarget',{sessionId:attached.sessionId});}
  }
  report.rendererFeasibility='CLOSED_UNKNOWN: one bounded offline protocol-schema review found no direct mapping;scope browser/GPU only';
  report.status='CONNECTED';
 }catch(e){report.status='ERROR';report.errors.push(e.message);}
 finally{for(const p of pending.values())clearTimeout(p.timer);ws?.close();report.utcEnd=new Date().toISOString();fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}
}
main();
