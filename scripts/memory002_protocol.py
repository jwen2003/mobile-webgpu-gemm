"""Local-only MEMORY002 control ledger; no adb/model operations."""
import time,uuid,json,threading
from pathlib import Path

class Protocol:
 def __init__(self,directory):self.directory=Path(directory);self.directory.mkdir(parents=True,exist_ok=True);self.sessions={};self.lock=threading.RLock()
 def save(self,session):
  (self.directory/(session+'.json')).write_text(json.dumps(self.sessions[session],indent=2)+'\n',encoding='utf-8')
 def handle(self,operation,body):
  with self.lock:
   session=str(uuid.UUID(body['sessionId']));now=time.time()*1000
   s=self.sessions.setdefault(session,{'sessionId':session,'markers':[],'captures':[],'clockExchanges':[],'idleAccepted':False})
   if operation=='marker':
    stage=body['stage'];allowed=['PAGE_IDLE','MODEL_INIT','AFTER_INIT','TOKEN_PREPARATION','BEFORE_GENERATION','GENERATION','AFTER_GENERATION','DRAIN','AFTER_DRAIN','CLEANUP','FINISHED']
    if stage not in allowed:raise ValueError('Unknown stage')
    if stage=='MODEL_INIT' and not s['idleAccepted']:raise ValueError('PAGE_IDLE capture required before initialization')
    marker={k:body[k] for k in ['stage','pageEpochMs','pageMonoMs','markerId']};marker['hostReceivedEpochMs']=now;marker['hostReceivedMonoMs']=time.perf_counter()*1000;s['markers'].append(marker)
    result={'marker':marker,'idleAccepted':s['idleAccepted']}
   elif operation=='clock':
    result={'exchangeId':str(uuid.uuid4()),'pageSendEpochMs':body['pageSendEpochMs'],'pageSendMonoMs':body['pageSendMonoMs'],'hostReceiveEpochMs':now,'hostReceiveMonoMs':time.perf_counter()*1000,'hostSendEpochMs':time.time()*1000}
    s['clockExchanges'].append(result.copy())
   elif operation=='clock_ack':
    exchange=next(e for e in s['clockExchanges'] if e['exchangeId']==body['exchangeId'])
    elapsed=body['pageReceiveEpochMs']-exchange['pageSendEpochMs'];mono=body['pageReceiveMonoMs']-exchange['pageSendMonoMs']
    host_elapsed=now-exchange['hostReceiveEpochMs'];host_mono=time.perf_counter()*1000-exchange['hostReceiveMonoMs']
    valid=elapsed>=0 and abs(elapsed-mono)<=5 and abs(host_elapsed-host_mono)<=5
    exchange.update(pageReceiveEpochMs=body['pageReceiveEpochMs'],pageReceiveMonoMs=body['pageReceiveMonoMs'],hostMinusPageLowerMs=exchange['hostSendEpochMs']-body['pageReceiveEpochMs']-2,hostMinusPageUpperMs=exchange['hostReceiveEpochMs']-exchange['pageSendEpochMs']+2,status='BOUNDED' if valid else 'UNAVAILABLE_CLOCK_STEP',hostAckReceiveEpochMs=now)
    if exchange['hostMinusPageLowerMs']>exchange['hostMinusPageUpperMs']:exchange['status']='UNAVAILABLE_INVALID_BOUND'
    result=exchange
   elif operation=='start':
    if not s['markers']:raise ValueError('No page stage handshake')
    marker=s['markers'][-1];stage=body['stage']
    if stage!=marker['stage']:raise ValueError('Requested phase does not match received page marker')
    if stage!='PAGE_IDLE' and not s['idleAccepted']:raise ValueError('Idle prerequisite missing')
    capture={'captureId':str(uuid.uuid4()),'stage':stage,'markerId':marker['markerId'],'hostStartEpochMs':now,'hostStartMonoMs':time.perf_counter()*1000,'status':'STARTED'};s['captures'].append(capture);result=capture
   elif operation=='end':
    capture=next(c for c in s['captures'] if c['captureId']==body['captureId'])
    if capture['status']!='STARTED':raise ValueError('Capture already ended')
    roles=body.get('validatedRoles',[]);marker=s['markers'][-1]
    same=marker['markerId']==capture['markerId'];qualified=body.get('dataValid') is True and {'BROWSER_MAIN','GPU'}.issubset(roles)
    capture.update(hostEndEpochMs=now,hostEndMonoMs=time.perf_counter()*1000,archive=body.get('archive'),validatedRoles=roles,status='ACCEPTED' if same and qualified else 'INCOMPLETE',phase='HELD_HANDSHAKE_CONFIRMED_PENDING_PAGE_AUDIT' if same and capture['stage']!='GENERATION' else 'NEEDS_CLOCK_AUDIT',endMarkerId=marker['markerId'])
    if capture['stage']=='PAGE_IDLE' and capture['status']=='ACCEPTED':s['idleAccepted']=True
    result=capture
   elif operation=='state':result=s
   else:raise ValueError('Unknown operation')
   self.save(session);return json.loads(json.dumps(result))

def phase_with_offset(command_start,command_end,page_start,page_end,exchanges):
 """Conservative observed offset envelope; no bounded handshake => UNKNOWN.
 Assumes no unobserved clock step/drift beyond measured envelope; not a hardware guarantee.
 """
 good=[e for e in exchanges if e.get('status')=='BOUNDED']
 before=[e for e in good if e['hostAckReceiveEpochMs']<=command_start];after=[e for e in good if e['hostReceiveEpochMs']>=command_end]
 if not before or not after:return {'phase':'UNKNOWN','reason':'No bounded clock exchanges on both sides'}
 pair=[before[-1],after[0]];lo=min(e['hostMinusPageLowerMs'] for e in pair);hi=max(e['hostMinusPageUpperMs'] for e in pair)
 if max(e['hostMinusPageLowerMs'] for e in pair)>min(e['hostMinusPageUpperMs'] for e in pair):return {'phase':'UNKNOWN','reason':'Offset envelopes inconsistent; clock change possible'}
 earliest=command_start-hi;latest=command_end-lo
 phase='GENERATION_WITHIN_OBSERVED_CLOCK_BOUND' if earliest>=page_start+2 and latest<=page_end-2 else 'MIXED_OR_UNKNOWN'
 return {'phase':phase,'offsetEnvelopeMs':[lo,hi],'uncertaintyWidthMs':hi-lo,'possiblePageWindowMs':[earliest,latest],'assumption':'No unobserved clock step/drift outside bracketing measured envelope; causal nonnegative transport,2ms timestamp-resolution guard;not exact synchronization'}
