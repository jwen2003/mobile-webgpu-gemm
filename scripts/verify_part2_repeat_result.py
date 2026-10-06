"""Archive each independent session; report session statistics, never pool samples."""
from pathlib import Path
import copy,json,hashlib,sys
from verify_part2_sweep_result import audit
GROUPS={'4:1':['A-original','B-16x16-K16','B-8x8-K8','C-8x8-K16','D-8x8-K16','D-4x8-K16'],'4:128':['A-original','B-16x16-K16','B-32x8-K16','C-8x8-K16','D-8x8-K16','D-8x16-K16'],'8:1':['A-original','B-16x16-K16','B-32x8-K16','C-8x8-K16','D-8x8-K16','D-4x8-K16'],'8:128':['A-original','B-16x16-K16','B-8x8-K8','C-8x8-K16','C-8x16-K16','D-8x8-K16','D-8x16-K16']}
SELECTED={'4:1':{'B':'B-8x8-K8','C':'C-8x8-K16','D':'D-4x8-K16'},'4:128':{'B':'B-32x8-K16','C':'C-8x8-K16','D':'D-8x16-K16'},'8:1':{'B':'B-32x8-K16','C':'C-8x8-K16','D':'D-4x8-K16'},'8:128':{'B':'B-8x8-K8','C':'C-8x16-K16','D':'D-8x16-K16'}}
def verify(r,mock=False):
 assert r['experimentId']=='PART2REPEAT' and 1<=r['session']['ordinal']<=5 and r['session']['id']
 assert r['repeatPlan']['version']=='QROW-REPEAT-v1' and r['repeatPlan']['groups']==GROUPS and r['repeatPlan']['selected']==SELECTED
 assert r['repeatPlan']['seed']==0x53575001 and r['repeatPlan']['scope']=='PREPARED_INPUT_KERNEL_ONLY' and r['repeatPlan']['warmup']==10 and r['repeatPlan']['measured']==30
 assert r['repeatPlan']['selectionFrozen'] and r['repeatPlan']['maxSamplingPasses']==1000
 if r['status']=='RUNNING':return {'verification':'INCOMPLETE','runStatus':r['status'],'session':r['session'],'reason':'In-progress snapshot,not accepted as completed session'}
 if not mock:
  evidence=json.loads(Path('results/raw/PART2SWEEP-2026-10-06T06-07-34-319Z.json').read_text(encoding='utf-8'))
  expectedHashes={f['bits']:{id:x['sha256'] for id,x in f['shaders'].items()} for f in evidence['formats']}
  for f in r['formats']:
   for id,x in f['shaders'].items():assert x['sha256']==expectedHashes[f['bits']][id], 'Frozen shader source changed'
 clone=copy.deepcopy(r);clone['experimentId']='PART2SWEEP';result=audit(clone,mock=mock)
 total=0
 for f in r['formats']:
  for p in f['performance']:
   key=f"{f['bits']}:{p['shape']['M']}";ids=p['eligibleCandidateIds'];assert set(ids)<=set(GROUPS[key])
   if r['status']=='COMPLETE':assert ids==GROUPS[key]
   assert not p['selection'];total+=len(p['samples'])
   if 'frozenComparison' not in p:continue
   comp=p['frozenComparison'];assert comp['selected']==SELECTED[key]
   def ratio(a,b):
    x=p['statistics'].get(a);y=p['statistics'].get(b)
    if not x or not y or x['status']!='PRELIMINARY' or y['status']!='PRELIMINARY' or not y['gpuPassNs']['median']:return {'value':None,'status':'NOT_RESOLVED'}
    grid=max(65536,int(x['observedGridNs']),int(y['observedGridNs']));diff=x['gpuPassNs']['median']-y['gpuPassNs']['median']
    return {'value':x['gpuPassNs']['median']/y['gpuPassNs']['median'],'status':'WITHIN_ONE_GRID' if abs(diff)<=grid else 'PILOT_ONLY','differenceNs':diff,'gridNs':grid}
   assert comp['AoverCandidate']=={id:ratio('A-original',id) for id in GROUPS[key]}
   assert comp['originalOverSelected']=={v:ratio({'B':'B-16x16-K16','C':'C-8x8-K16','D':'D-8x8-K16'}[v],SELECTED[key][v]) for v in 'BCD'}
 assert total<=1000
 result.update(session=r['session'],environment=r['environment'],visibility=r['visibility'],comparisons=[{'bits':f['bits'],'M':p['shape']['M'],'frozenComparison':p.get('frozenComparison')} for f in r['formats'] for p in f['performance']]);return result
def aggregate(records):
 ids=[x['session']['id'] for x in records];ordinals=[x['session']['ordinal'] for x in records]
 assert len(ids)==len(set(ids)) and len(ordinals)==len(set(ordinals)), 'Duplicate session or ordinal; preserve all evidence,do not substitute'
 accepted=len(records)==5 and sorted(ordinals)==[1,2,3,4,5] and all(x['verification']=='PASS' and x['runStatus']=='COMPLETE' for x in records)
 rows=[]
 for key,group in GROUPS.items():
  bits,M=map(int,key.split(':'))
  for id in group:
   values=[]
   for r in records:
    table=next((t for t in r.get('tables',[]) if t['bits']==bits and t['shape']['M']==M),None)
    if table and id in table['statistics']:
     stat=table['statistics'][id];values.append({'session':r['session']['ordinal'],'status':stat['status'],'median':stat.get('gpuPassNs',{}).get('median'),'p95':stat.get('gpuPassNs',{}).get('p95')})
   med=[x['median'] for x in values if x['median'] is not None];p95=[x['p95'] for x in values if x['p95'] is not None]
   rows.append({'group':key,'candidateId':id,'perSession':values,'medianRangeNs':[min(med),max(med)] if med else None,'p95RangeNs':[min(p95),max(p95)] if p95 else None})
 directions=[]
 for key in GROUPS:
  bits,M=map(int,key.split(':'))
  for v in 'BCD':
   values=[]
   for r in records:
    comp=next((c['frozenComparison'] for c in r.get('comparisons',[]) if c['bits']==bits and c['M']==M),None)
    if comp:
     pair=comp['originalOverSelected'][v];value=pair['value'];values.append({'session':r['session']['ordinal'],**pair,'direction':'UNKNOWN' if value is None else 'INDISTINGUISHABLE' if pair['status']=='WITHIN_ONE_GRID' else 'SELECTED_FASTER' if value>1 else 'SELECTED_SLOWER' if value<1 else 'SAME'})
   nums=[x['value'] for x in values if x['value'] is not None];dirs={x['direction'] for x in values}
   directions.append({'group':key,'variant':v,'perSession':values,'ratioRange':[min(nums),max(nums)] if nums else None,'uncertain':bool(dirs&{'UNKNOWN','INDISTINGUISHABLE'}) or {'SELECTED_FASTER','SELECTED_SLOWER'}<=dirs})
 aRanges=[]
 for key,group in GROUPS.items():
  bits,M=map(int,key.split(':'))
  for id in group:
   values=[]
   for r in records:
    comp=next((c['frozenComparison'] for c in r.get('comparisons',[]) if c['bits']==bits and c['M']==M),None)
    if comp:values.append({'session':r['session']['ordinal'],**comp['AoverCandidate'][id]})
   nums=[x['value'] for x in values if x['value'] is not None]
   aRanges.append({'group':key,'candidateId':id,'perSession':values,'ratioRange':[min(nums),max(nums)] if nums else None})
 return {'status':'FIVE_SESSIONS_VERIFIED' if accepted else 'INCOMPLETE','sessions':records,'perCandidateRanges':rows,'AoverCandidateRanges':aRanges,'directions':directions,'limitations':'No pooled median;five sessions do not alone prove stable benefit;inspect environmental/background differences. Part1,Adreno,logical shapes remain open.'}
if __name__=='__main__':
 if len(sys.argv)==2 and sys.argv[1]=='--stdin':
  r=json.load(sys.stdin);assert r['environment']['userAgent']=='CPU MOCK';print(json.dumps(verify(r,mock=True)));raise SystemExit()
 if len(sys.argv)<2:raise SystemExit('Usage: python scripts/verify_part2_repeat_result.py SESSION.json [SESSION2.json ...]')
 results=[]
 for path in sys.argv[1:]:
  p=Path(path);raw=p.read_bytes();dest=Path('results/raw')/p.name
  if dest.exists():assert dest.read_bytes()==raw
  else:dest.write_bytes(raw)
  result=verify(json.loads(raw));result['rawSha256']=hashlib.sha256(raw).hexdigest();results.append(result)
  Path('results/analysis',p.stem+'-verified.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
 summary=aggregate(results);Path('results/analysis/part2_repeat_summary.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8');print(json.dumps({'status':summary['status'],'sessions':[{k:r[k] for k in ['verification','runStatus','session','rawSha256']} for r in results]},indent=2))
