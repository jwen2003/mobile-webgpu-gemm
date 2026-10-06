"""CPU-only protocol tests: idle prerequisite, ACK, timing ambiguity, HTTP path."""
import tempfile,uuid,json,threading,urllib.request,time
from http.server import ThreadingHTTPServer
from memory002_protocol import Protocol,phase_with_offset
from serve_memory002 import handler

def main():
 with tempfile.TemporaryDirectory() as directory:
  p=Protocol(directory);s=str(uuid.uuid4())
  def op(kind,**data):return p.handle(kind,{'sessionId':s,**data})
  def marker(stage):return op('marker',stage=stage,markerId=str(uuid.uuid4()),pageEpochMs=1000,pageMonoMs=10)
  marker('PAGE_IDLE')
  try:marker('MODEL_INIT');raise AssertionError('Missing idle accepted')
  except ValueError:pass
  start=op('start',stage='PAGE_IDLE');op('end',captureId=start['captureId'],validatedRoles=['BROWSER_MAIN'],dataValid=True)
  assert not op('state')['idleAccepted']
  start=op('start',stage='PAGE_IDLE');end=op('end',captureId=start['captureId'],validatedRoles=['BROWSER_MAIN','GPU'],dataValid=True)
  assert end['status']=='ACCEPTED' and op('state')['idleAccepted']
  marker('MODEL_INIT');marker('AFTER_INIT');start=op('start',stage='AFTER_INIT');marker('TOKEN_PREPARATION');end=op('end',captureId=start['captureId'],validatedRoles=['BROWSER_MAIN','GPU'],dataValid=True);assert end['status']=='INCOMPLETE'
  before={'status':'BOUNDED','hostMinusPageLowerMs':9,'hostMinusPageUpperMs':11,'hostAckReceiveEpochMs':90,'hostReceiveEpochMs':80}
  after=dict(before,hostAckReceiveEpochMs=150,hostReceiveEpochMs=140)
  assert phase_with_offset(110,120,95,125,[before,after])['phase']=='GENERATION_WITHIN_OBSERVED_CLOCK_BOUND'
  assert phase_with_offset(104,120,95,125,[before,after])['phase']=='MIXED_OR_UNKNOWN'
  assert phase_with_offset(110,120,95,125,[before])['phase']=='UNKNOWN'
  shifted=dict(after,hostMinusPageLowerMs=40,hostMinusPageUpperMs=42);assert phase_with_offset(110,120,95,125,[before,shifted])['phase']=='UNKNOWN'
  exchange=op('clock',pageSendEpochMs=100,pageSendMonoMs=10)
  bad=op('clock_ack',exchangeId=exchange['exchangeId'],pageReceiveEpochMs=200,pageReceiveMonoMs=11);assert bad['status'].startswith('UNAVAILABLE')
  server=ThreadingHTTPServer(('127.0.0.1',0),handler(p));worker=threading.Thread(target=server.serve_forever,daemon=True);worker.start()
  try:
   url=f'http://127.0.0.1:{server.server_port}/__memory002/state?sessionId={s}'
   with urllib.request.urlopen(url) as response:assert json.load(response)['idleAccepted']
   def post(operation,data):
    request=urllib.request.Request(f'http://127.0.0.1:{server.server_port}/__memory002/{operation}',data=json.dumps({'sessionId':s,**data}).encode(),headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(request) as response:return json.load(response)
   exchange=post('clock',{'pageSendEpochMs':time.time()*1000,'pageSendMonoMs':time.perf_counter()*1000})
   ack=post('clock_ack',{'exchangeId':exchange['exchangeId'],'pageReceiveEpochMs':time.time()*1000,'pageReceiveMonoMs':time.perf_counter()*1000})
   assert ack['status']=='BOUNDED' and ack['hostMinusPageLowerMs']<=ack['hostMinusPageUpperMs']
  finally:server.shutdown();server.server_close();worker.join()
 print('MEMORY002 protocol CPU PASS: missing/failed idle blocked, role-qualified ACK, mixed stage, clock uncertainty/step, loopback HTTP')
if __name__=='__main__':main()
