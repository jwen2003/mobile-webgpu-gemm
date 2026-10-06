"""Offline v2 phone protocol audit; preserves old partial pilot and raw output."""
from pathlib import Path
import json,hashlib,datetime
from verify_baseline_sessions import audit
from memory002_protocol import phase_with_offset

PAGE='MEMORY002-BASELINE002-L128-R1-2026-10-06T10-13-48-016Z.json'
SESSION='03292c53-e0e3-4fac-919f-7e4dd3e06e82'
def epoch(text):return datetime.datetime.fromisoformat(text.replace('Z','+00:00')).timestamp()*1000
def main():
 p=Path('results/raw')/PAGE;r=json.loads(p.read_text(encoding='utf-8'));assert audit(r)['verification']=='PASS'
 assert r['status']=='COMPLETE' and not r['errors'] and r['session']['id']==SESSION and r['prompt']['verifiedFullTokens']==128
 lp=Path('results/local/adb_memory/protocol_v2')/(SESSION+'.json');ledger=json.loads(lp.read_text(encoding='utf-8'))
 history=r['memoryCapture']['stageMetadata']['history'];assert len(history)==len(ledger['markers'])
 for a,b in zip(history,ledger['markers']):assert a['stage']==b['stage'] and epoch(a['isoTime'])==b['pageEpochMs']
 assert ledger['idleAccepted'];captures=ledger['captures'];assert [c['stage'] for c in captures]==['PAGE_IDLE','AFTER_INIT','BEFORE_GENERATION','GENERATION','AFTER_DRAIN']
 assert captures[0]['hostEndEpochMs']<next(m['hostReceivedEpochMs'] for m in ledger['markers'] if m['stage']=='MODEL_INIT')
 gen=[next(e for e in r['events'] if e['type']==n) for n in ['generation_start','generation_end']]
 rows=[];baseline={};cleanup_count=0;hashes={p.as_posix():hashlib.sha256(p.read_bytes()).hexdigest(),lp.as_posix():hashlib.sha256(lp.read_bytes()).hexdigest()}
 for capture in captures:
  assert capture['status']=='ACCEPTED';folder=Path('results/local/adb_memory')/capture['archive'];s=json.loads((folder/'snapshot.json').read_text(encoding='utf-8'))
  assert s['session']==SESSION and not s['metadataErrors'] and s['protocol']['start']['captureId']==capture['captureId']
  for file in folder.iterdir():
   if file.is_file():hashes[file.as_posix()]=hashlib.sha256(file.read_bytes()).hexdigest()
  for c in s['commands']:assert hashlib.sha256((folder/(c['name']+'.txt')).read_bytes()).hexdigest()==c['sha256']
  for n in ['metadata_before','metadata_after']:
   c=json.loads((folder/(n+'.json.cleanup.json')).read_text(encoding='utf-8'));assert c['removeExitCode']==0 and not c['forwardPresent'] and c['listenerPresent'] is False;cleanup_count+=1
  assert not any(s['pidChanges'].values())
  data=[]
  for role in ['BROWSER_MAIN','GPU']:
   matches=[x for x in s['processes'] if x['role']==role];assert len(matches)==1;proc=matches[0]
   assert proc['status']=='AVAILABLE' and proc['stablePidLifetime']
   if capture['stage']=='PAGE_IDLE':baseline[role]=proc
   base=baseline[role];same=proc['pid']==base['pid'] and proc['startTicksBefore']==base['startTicksBefore']
   command=next(c for c in s['commands'] if c['name']==f'meminfo_{proc["pid"]}')
   timing={'phase':'HELD_HANDSHAKE_AND_FINAL_PAGE_HISTORY_CHECKED'}
   if capture['stage']=='GENERATION':
    timing=phase_with_offset(epoch(command['utcStart']),epoch(command['utcEnd']),epoch(gen[0]['isoTime']),epoch(gen[1]['isoTime']),ledger['clockExchanges'])
    assert timing['phase']=='GENERATION_WITHIN_OBSERVED_CLOCK_BOUND'
   data.append({'role':role,'pid':proc['pid'],'sameLifetimeAsIdle':same,'pssKiB':proc['pssKiB'],'rssKiB':proc['rssKiB'],'deltaPssKiB':proc['pssKiB']-base['pssKiB'] if same else None,'deltaRssKiB':proc['rssKiB']-base['rssKiB'] if same else None,'utcStart':command['utcStart'],'utcEnd':command['utcEnd'],'timing':timing})
  rows.append({'stage':capture['stage'],'archive':capture['archive'],'collectionDurationMs':s['collectionDurationMs'],'browserGpu':data,'otherProcesses':[x for x in s['processes'] if x['role'] not in ['BROWSER_MAIN','GPU']],'receipt':capture,'pidChanges':s['pidChanges']})
 hidden=r['visibility']['events'];background_ms=[]
 for i,e in enumerate(hidden):
  if e['state']=='hidden' and i+1<len(hidden) and hidden[i+1]['state']=='visible':background_ms.append(hidden[i+1]['wallMs']-e['wallMs'])
 result={'experimentId':'MEMORY002','protocolVersion':'memory002-v2','status':'PROTOCOL_PASS_WITH_CONDITION_WARNING','scope':'One phone protocol pilot only;browser/GPU process-level memory,not model-exclusive/physical GPU memory/continuous peak;not five-repeat memory acceptance','pageStatus':r['status'],'pageFile':p.as_posix(),'pageSha256':hashes[p.as_posix()],'session':r['session'],'coverage':{'requiredStages':4,'validRequiredStages':4,'totalSnapshots':5,'browserGpuValidValues':10,'targetRendererMapping':'UNKNOWN','zygoteMeminfo':'UNAVAILABLE_PID_HEADER'},'cleanupCount':cleanup_count,'rows':rows,'clockExchanges':ledger['clockExchanges'],'wallMetrics':r['wallMetrics'],'visibility':r['visibility'],'backgroundDurationMs':background_ms,'environmentManualState':r['environment']['manualState'],'limitations':['Initialization entered background;not constant-foreground performance evidence','Renderer target association UNKNOWN','Clock interval is observed bound with documented no-unobserved-clock-step/drift assumption','Sparse sequential process snapshots are not continuous peak','Only one protocol pilot,not five independent memory repetitions'],'oldPilot':'PARTIAL unchanged'}
 manifest=json.loads(Path('results/analysis/raw_sha256_manifest.json').read_text(encoding='utf-8'))
 for path,digest in manifest['files'].items():assert hashlib.sha256(Path(path).read_bytes()).hexdigest()==digest
 old=json.loads(Path('results/analysis/memory002_local_evidence_sha256.json').read_text(encoding='utf-8'))
 for path,digest in old['files'].items():assert hashlib.sha256(Path(path).read_bytes()).hexdigest()==digest
 Path('results/analysis/memory002_v2_pilot_verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 Path('results/analysis/memory002_v2_evidence_sha256.json').write_text(json.dumps({'algorithm':'SHA256','scope':'One v2 pilot;private system/protocol output retained locally;hashes only published','files':hashes},indent=2)+'\n',encoding='utf-8')
 print(result['status'],'5 snapshots,10 browser/GPU values,10 cleanup checks; background ms',background_ms)
if __name__=='__main__':main()
