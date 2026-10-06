"""Immutable BASELINE002 archive; independent wall-boundary/resource/statistic audit.
Tokenizer return evidence is validated, not falsely retokenized without the actual model.
"""
from pathlib import Path
import json,hashlib,math,statistics,sys
SCHEDULE=[128,512,1024,512,1024,128,1024,128,512,128,1024,512,512,128,1024]
OPTIONS={'maxTokens':2048,'topK':40,'temperature':.8,'randomSeed':101,'numResponses':1,'maxNumImages':0,'supportAudio':False}
def stat(values):
 if not values:return {'status':'UNAVAILABLE','count':0}
 s=sorted(values);return {'count':len(s),'median':statistics.median(s),'p95':s[math.ceil(.95*len(s))-1],'min':s[0],'max':s[-1],'method':'nearest-rank p95;with five p95 is maximum,weak tail evidence'}
def texbytes(r):
 bpp={'r8unorm':1,'r16float':2,'r32float':4,'rgba8unorm':4,'rgba8unorm-srgb':4,'rgba16float':8,'rgba32float':16}.get(r['format'])
 if bpp is None:return None
 total=0
 for level in range(r['mipLevelCount']):
  total+=max(1,r['width']//2**level)*max(1,r['height']//2**level)*(max(1,r['depthOrArrayLayers']//2**level) if r['dimension']=='3d' else r['depthOrArrayLayers'])
 return total*bpp*r['sampleCount']
def audit(r,mock=False):
 assert r['experimentId']=='BASELINE002' and r['plan']['version']=='BASELINE002-v1'
 assert r['plan']['schedule']==SCHEDULE and r['plan']['lengths']==[128,512,1024] and r['plan']['repetitions']==5
 assert r['plan']['warmupGenerations']==0 and r['plan']['generationsPerSession']==1
 index=r['session']['ordinal'];assert 1<=index<=15 and r['session']['id'];target=SCHEDULE[index-1]
 assert r['session']['targetTokens']==target and r['session']['repetition']==SCHEDULE[:index].count(target)
 assert {k:r['config'][k] for k in OPTIONS}==OPTIONS and r['runtime']['version']=='0.10.29' and not r['runtime']['modified']
 assert all(v=='UNAVAILABLE' for v in r['unavailable'].values())
 if not mock and r['model']['manifest']:
  model=json.loads(Path('assets/models/model_manifest.json').read_text(encoding='utf-8'));assert all(r['model']['manifest'][k]==model[k] for k in ['sha256','actualBytes','filename'])
 if r['prompt']:
  p=r['prompt'];assert p['verifiedFullTokens']==p['targetTokens']==target and p['templateIncluded']
  assert p['fullPrompt']==p['prefix']+p['body']+p['suffix'] and p['prefix']=='<start_of_turn>user\n' and p['suffix']=='<end_of_turn>\n<start_of_turn>model\n'
  assert p['sha256']==hashlib.sha256(p['fullPrompt'].encode()).hexdigest()
  from_body='The following repeated context is filler; ignore it when answering. Context:'+' data'*p['padding']['n']+p['padding']['tail']+'\nQuestion: Explain in two short sentences what matrix multiplication computes.'
  assert p['body']==from_body and p['fullMinusBodyTokens']==target-p['bodyTokens']
  assert len(p['searchCalls'])<=220 and p['totalTokenizerCalls']==len(p['searchCalls'])+3
  assert any(c['n']==p['padding']['n'] and c['tail']==p['padding']['tail'] and c['value']==target for c in p['searchCalls'])
  assert all(c['endWallMs']>=c['startWallMs'] and isinstance(c['value'],int) for c in p['searchCalls'])
 events=r['events'];starts={}
 pairs={'runtimePreparationMs':('runtime_preparation_start','runtime_preparation_end'),'modelInitializationMs':('initialization_start','initialization_end'),'tokenPreparationMs':('token_preparation_start','token_preparation_end'),'tokenPreparationDrainMs':('token_drain_start','token_drain_end'),'generationCallToCompletionMs':('generation_start','generation_end'),'postGenerationDrainMs':('gpu_drain_start','gpu_drain_end')}
 for metric,(start,end) in pairs.items():
  a=[e for e in events if e['type']==start];b=[e for e in events if e['type']==end]
  assert len(a)<=1 and len(b)<=1
  value=r['wallMetrics'][metric]
  if value is not None:assert len(a)==len(b)==1 and value==b[0]['wallMs']-a[0]['wallMs'] and value>=0
 callbacks=[e for e in events if e['type']=='callback'];gen=next((e for e in events if e['type']=='generation_start'),None)
 if callbacks:
  assert gen and r['wallMetrics']['firstCallbackMs']==callbacks[0]['wallMs']-gen['wallMs']
  assert all(c['relativeWallMs']==c['wallMs']-gen['wallMs'] and c['relativeWallMs']>=0 for c in callbacks)
  assert all(a['wallMs']<=b['wallMs'] for a,b in zip(callbacks,callbacks[1:]))
  assert ''.join(c['fragment'] for c in callbacks)==r['output']['streamedText'] if not r['droppedCallbacks'] else True
 if r['status']=='COMPLETE':
  assert not r['errors'] and not r['droppedCallbacks'] and all(r['lifecycle'].values()) and callbacks and r['output']['finalText'].strip()
  assert any(c['done'] for c in callbacks) and r['prompt']
  assert all(r['wallMetrics'][k] is not None for k in pairs)
  ge=next(e for e in events if e['type']=='generation_end');ds=next(e for e in events if e['type']=='gpu_drain_start');assert ds['wallMs']>=ge['wallMs']
 logical=r['memory']['logicalResources'];memoryAudit='UNAVAILABLE'
 if logical:
  resources=logical['resources'];transactions=[]
  for x in resources:
   if x['kind']=='texture':assert x['logicalBytes']==texbytes(x)
   transactions.append((x['createdSequence'],x['kind'],x['logicalBytes'],1))
   if x['destroyed']:transactions.append((x['destroyedSequence'],x['kind'],x['logicalBytes'],-1))
  assert len({x[0] for x in transactions})==len(transactions)
  totals={k:{'live':0,'peak':0,'created':0,'destroyed':0} for k in ['buffer','texture']};unknown=0
  for _,kind,size,sign in sorted(transactions):
   if size is None:unknown+=sign;continue
   t=totals[kind];t['live']+=sign*size;assert t['live']>=0;t['peak']=max(t['peak'],t['live']);t['created' if sign==1 else 'destroyed']+=size
  snap=logical['snapshot'];b=totals['buffer'];t=totals['texture']
  assert snap['buffers']=={'currentLogicalBytes':b['live'],'peakLogicalBytes':b['peak'],'createdBytes':b['created'],'explicitDestroyedBytes':b['destroyed']}
  assert snap['textures']['knownFormatCurrentLogicalBytes']==t['live'] and snap['textures']['knownFormatPeakLogicalBytes']==t['peak'] and snap['textures']['unknownFormatLiveCount']==unknown
  memoryAudit='PASS' if snap['status']=='OBSERVED' else 'INCOMPLETE_COVERAGE'
 return {'verification':'PASS','status':r['status'],'session':r['session'],'wallMetrics':r['wallMetrics'],'promptHash':r['prompt']['sha256'] if r['prompt'] else None,'inputCountScope':'Recorded actual runtime tokenizer returns checked;offline audit does not independently retokenize actual model','resourceAudit':memoryAudit,'memorySnapshots':r['memory']['snapshots'],'environment':r['environment'],'visibility':r['visibility']}
def summarize(records):
 assert len({x['session']['id'] for x in records})==len(records),'Duplicate UUID;preserve evidence,do not silently replace'
 assert len({x['session']['ordinal'] for x in records})==len(records),'Duplicate attempt ordinal;do not select a favorable replacement'
 groups=[]
 for length in [128,512,1024]:
  rows=[r for r in records if r['session']['targetTokens']==length];hashes={r['promptHash'] for r in rows if r['promptHash']}
  if len(hashes)>1:raise AssertionError('Different full prompts for same frozen target length')
  complete=[r for r in rows if r['status']=='COMPLETE']
  metrics={k:stat([r['wallMetrics'][k] for r in complete if r['wallMetrics'][k] is not None]) for k in ['runtimePreparationMs','modelInitializationMs','tokenPreparationMs','tokenPreparationDrainMs','generationCallToCompletionMs','firstCallbackMs','postGenerationDrainMs']}
  memoryStats=[]
  stages=sorted({s['stage'] for r in complete for s in r['memorySnapshots']})
  for stage in stages:
   snapshots=[next(s for s in r['memorySnapshots'] if s['stage']==stage) for r in complete if any(s['stage']==stage for s in r['memorySnapshots'])]
   heap={k:stat([s['jsHeap'][k] for s in snapshots if isinstance(s['jsHeap'].get(k),(int,float))]) for k in ['usedJSHeapSize','totalJSHeapSize','jsHeapSizeLimit']}
   buffers={k:stat([s['logical']['buffers'][k] for s in snapshots if s['logical'].get('status')=='OBSERVED']) for k in ['currentLogicalBytes','peakLogicalBytes']}
   textures={k:stat([s['logical']['textures'][k] for s in snapshots if s['logical'].get('status')=='OBSERVED' and isinstance(s['logical']['textures'].get(k),(int,float))]) for k in ['knownFormatCurrentLogicalBytes','knownFormatPeakLogicalBytes','totalLogicalBytes']}
   memoryStats.append({'stage':stage,'reportedJsHeapBytes':heap,'trackedBufferLogicalBytes':buffers,'trackedTextureLogicalPayloadBytes':textures,'scope':'Independent channels,never sum;unknown-format payload omitted,see each session counts;heap snapshots not true peak'})
  groups.append({'inputTokens':length,'attempts':len(rows),'completeSessions':len(complete),'status':'FIVE_VERIFIED' if len(complete)==5 else 'INCOMPLETE','perSession':rows,'wallStatisticsMs':metrics,'memoryStatisticsBytes':memoryStats,'memoryScope':'Per-stage snapshots and tracked logical bytes,not physical GPU memory;no additive aggregate across channels'})
 return {'status':'FIFTEEN_SESSIONS_VERIFIED' if len(records)==15 and all(g['status']=='FIVE_VERIFIED' for g in groups) else 'INCOMPLETE','groups':groups,'limitations':'First callback is not pure prefill. No true output token count or phase metrics. No GPU kernel times,physical memory,RSS or Adreno completion. Five-sample p95 equals max.'}
if __name__=='__main__':
 if len(sys.argv)==2 and sys.argv[1]=='--stdin':
  r=json.load(sys.stdin);assert r['environment']['userAgent']=='CPU MOCK';print(json.dumps(audit(r,mock=True)));raise SystemExit()
 if len(sys.argv)<2:raise SystemExit('Usage: python scripts/verify_baseline_sessions.py SESSION.json [...]')
 records=[]
 for arg in sys.argv[1:]:
  path=Path(arg);raw=path.read_bytes();dest=Path('results/raw')/path.name
  if dest.exists():assert dest.read_bytes()==raw
  else:dest.write_bytes(raw)
  result=audit(json.loads(raw));result['rawSha256']=hashlib.sha256(raw).hexdigest();records.append(result)
  Path('results/analysis',path.stem+'-verified.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
 summary=summarize(records);Path('results/analysis/baseline002_summary.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8');print(json.dumps({'status':summary['status'],'groups':[{'inputTokens':g['inputTokens'],'attempts':g['attempts'],'completeSessions':g['completeSessions'],'wallStatisticsMs':g['wallStatisticsMs']} for g in summary['groups']]},indent=2))
