"""Offline audit of page lifecycle and local process snapshots. No device calls."""
from pathlib import Path
import json,hashlib,datetime
from verify_baseline_sessions import audit
from analyze_memory001 import analyze

PAGE='MEMORY002-BASELINE002-L128-R1-2026-10-06T09-28-20-120Z.json'
SNAPSHOTS=['20261006T091541534903Z','20261006T091837000441Z','20261006T092257173854Z','20261006T092552415914Z','20261006T092657598991Z']
def ms(s):return datetime.datetime.fromisoformat(s.replace('Z','+00:00')).timestamp()*1000
def main():
 p=Path('results/raw')/PAGE;r=json.loads(p.read_text(encoding='utf-8'));baseline=audit(r)
 assert baseline['verification']=='PASS' and r['status']=='COMPLETE' and not r['errors']
 assert r['memoryCapture']['enabled'] and r['memoryCapture']['stageMetadata']['sessionId']==r['session']['id']
 events=r['events'];starts=[e for e in events if e['type']=='memory_capture_wait_start'];ends=[e for e in events if e['type']=='memory_capture_wait_end']
 assert [e['stage'] for e in starts]==[e['stage'] for e in ends]==['AFTER_INIT','BEFORE_GENERATION','AFTER_DRAIN']
 holds=[];windows={}
 for a,b in zip(starts,ends):
  assert b['wallMs']>=a['wallMs'];holds.append({'stage':a['stage'],'durationMs':b['wallMs']-a['wallMs']});windows[a['stage']]=(a['isoTime'],b['isoTime'])
 gen=[next(e for e in events if e['type']==name) for name in ['generation_start','generation_end']];windows['GENERATION']=(gen[0]['isoTime'],gen[1]['isoTime'])
 rows=[];cleanups=0
 for directory in SNAPSHOTS:
  folder=Path('results/local/adb_memory')/directory;s=json.loads((folder/'snapshot.json').read_text(encoding='utf-8'))
  for c in s['commands']:assert hashlib.sha256((folder/(c['name']+'.txt')).read_bytes()).hexdigest()==c['sha256']
  for name in ['metadata_before','metadata_after']:
   c=json.loads((folder/(name+'.json.cleanup.json')).read_text(encoding='utf-8'));assert c['removeExitCode']==0 and not c['forwardPresent'] and c['listenerPresent'] is False;cleanups+=1
  phase=s['phase'];a,b=map(ms,windows[phase]);commands=[]
  for c in s['commands']:
   if not c['name'].startswith('meminfo_'):continue
   begin,end=ms(c['utcStart']),ms(c['utcEnd']);nominal='WITHIN' if a<=begin and end<=b else 'MIXED_BOUNDARY' if begin<b and end>a else 'OUTSIDE'
   # delta = host UTC minus phone UTC. Entire sample stays inside for delta in [end-b, begin-a].
   commands.append({'command':c['name'],'utcStart':c['utcStart'],'utcEnd':c['utcEnd'],'durationMs':c['durationMs'],'nominalUtcClassification':nominal,'allowableHostMinusPhoneOffsetMs':[end-b,begin-a],'verifiedClassification':'UNAVAILABLE: host/phone clock offset not independently bounded'})
  rows.append({'archive':directory,'requestedPhase':phase,'operatorConfirmed':True,'verifiedPhase':s['verifiedPhase'],'durationMs':s['collectionDurationMs'],'generationArm':s.get('generationArm'),'processes':s['processes'],'pidChanges':s['pidChanges'],'metadataErrors':s['metadataErrors'],'commandWindows':commands})
 logical=analyze(r);assert logical['status']=='AVAILABLE'
 manifest=json.loads(Path('results/analysis/raw_sha256_manifest.json').read_text(encoding='utf-8'))
 for path,digest in manifest['files'].items():assert hashlib.sha256(Path(path).read_bytes()).hexdigest()==digest
 result={'experimentId':'MEMORY002','status':'PARTIAL_PILOT_VERIFIED','pageStatus':'COMPLETE','pageRawFile':p.as_posix(),'pageSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'session':r['session'],'wallMetrics':r['wallMetrics'],'holdDurations':holds,'snapshots':rows,'pageLogicalTexture':{k:v for k,v in logical.items() if k not in ['resources']},'pageMemorySnapshots':r['memory']['snapshots'],'missing':['PAGE_IDLE process snapshot','Direct target-to-renderer OS PID mapping','Generation fresh roles (local metadata helper executable not found)','Independent phone/host clock-offset bound','Continuous memory peak,model-exclusive memory,physical GPU residency'],'cleanupCount':cleanups,'historicalHashesVerified':len(manifest['files']),'scope':'Separate process PSS/RSS, JS heap and logical buffer/texture channels; no sum as GPU/model memory. One instrumented session,not stock repeated performance.'}
 Path('results/analysis/memory002_pilot_verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print('MEMORY002 PARTIAL pilot audit PASS; page COMPLETE;',cleanups,'cleanups;',len(manifest['files']),'historical hashes; generation',r['wallMetrics']['generationCallToCompletionMs'])
if __name__=='__main__':main()
