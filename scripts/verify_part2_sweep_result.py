"""Independent QROW sweep audit. Real input archived unchanged; --stdin is mock-only."""
from pathlib import Path
import json,struct,math,statistics,hashlib,sys,itertools
def half(x):return struct.unpack('<e',struct.pack('<e',x))[0]
def fp32(x):return struct.unpack('<f',struct.pack('<f',x))[0]
def decode(h):return struct.unpack('<e',struct.pack('<H',h))[0]
def stats(values):
 s=sorted(values);return dict(count=len(s),median=statistics.median(s),p95=s[math.ceil(.95*len(s))-1],min=s[0],max=s[-1],zeroCount=s.count(0))
def rng(seed):
 while True:
  seed=(seed^(seed<<13))&0xffffffff;seed=(seed^(seed>>17))&0xffffffff;seed=(seed^(seed<<5))&0xffffffff;yield seed
def orders(ids,count,seed):
 if not ids:return []
 it=rng(seed);out=[];base=[];block=0
 def shuffle(a):
  a=list(a)
  for i in range(len(a)-1,0,-1):j=int(next(it)/4294967296*(i+1));a[i],a[j]=a[j],a[i]
  return a
 while len(out)<count:
  base=list(reversed(base)) if block%2 else shuffle(ids)
  out.extend(shuffle([base[r:]+base[:r] for r in range(len(base))])[:count-len(out)]);block+=1
 return out
def audit(r,mock=False):
 assert r['experimentId']=='PART2SWEEP' and r['plan']['version']=='QROW-SWEEP-v1'
 assert r['path']=='FP16' and r['contract']['version']=='PART2-QROW-v1'
 assert len(r['candidates'])==10 and r['plan']['warmup']==10 and r['plan']['measured']==30 and r['plan']['maxSamplingPasses']==1600
 assert r['plan']['seed']==0x53575001 and r['plan']['bits']==[4,8]
 if not mock:assert [(s['M'],s['K'],s['N']) for s in r['plan']['shapes']]==[(1,1024,1024),(128,1024,1024)]
 expected={'A-original':('A',8,8,0,True),'B-16x16-K16':('B',16,16,16,True),'B-8x8-K8':('B',8,8,8,False),'B-32x8-K16':('B',32,8,16,False),**{f'{v}-{x}x{y}-K16':(v,x,y,16,x==8 and y==8) for v in 'CD' for x,y in [(8,8),(4,8),(8,16)]}}
 assert {c['id'] for c in r['candidates']}==set(expected)
 for c in r['candidates']:
  v,x,y,k,originalFlag=expected[c['id']];assert (c['variant'],c['wx'],c['wy'],c['tk'],bool(c.get('original')))==(v,x,y,k,originalFlag)
  assert c['sharedBytes']==(0 if v=='A' else 2*k*(y+x*(1 if v=='B' else 4)))
  assert c['workgroup']==[x,y,1] and c['outputWorkgroupShape']==[x*(4 if v in 'CD' else 1),y,1]
 candidates={c['id']:c for c in r['candidates']};original={c['variant']:c['id'] for c in candidates.values() if c.get('original')}
 count=0;samplesChecked=0;execution=0;tables=[]
 for f in r['formats']:
  bits=f['bits'];assert bits in [4,8];per=32//bits
  for id,s in f['shaders'].items():assert hashlib.sha256(s['source'].encode()).hexdigest()==s['sha256']
  for rec in f['correctness']:
   if 'fullArrays' not in rec:continue
   a=rec['fullArrays'];M,K,N=(rec['shape'][k] for k in ['M','K','N']);probe=rec['shape']['id']=='accumulation-discriminator'
   assert len(a['actual'])==M*N and len(a['A'])==M*K
   for i,v in enumerate(a['A']):assert decode(a['aHalf'][i])==v
   for k in range(K):
    for n in range(N):
     q=(a['words'][k*math.ceil(N/per)+n//per]>>((n%per)*bits))&((1<<bits)-1);assert q==a['q'][k*N+n]
     group=(k//32)*N+n;b=half((q-a['zeros'][group])*decode(a['scales'][group]));assert decode(a['bHalf'][k*N+n])==a['B'][k*N+n]==b
   it=rng(r['contract']['seed']);kind=rec['kind'];expectedA=[next(it)%3-1 if kind=='exact' else (next(it)%33-16)/64 for _ in range(M*K)];groups=math.ceil(K/32)
   expectedScale=[1 if kind=='exact' else 1/32 if bits==4 else 1/512]*(groups*N);mid=1<<(bits-1);expectedZp=[mid+next(it)%3-1 for _ in range(groups*N)]
   expectedQ=[expectedZp[(k//32)*N+n]+next(it)%3-1 if kind=='exact' else next(it)%(1<<bits) for k in range(K) for n in range(N)]
   if rec['shape'].get('extremeCodes'):expectedQ=[([0,255,expectedZp[(i//N//32)*N+i%N],1,254][i%5] if bits==8 else 15 if i%2 else 0) for i in range(K*N)]
   if probe:expectedA=[2048,1,1];expectedScale=[1]*(groups*N);expectedZp=[mid]*(groups*N);expectedQ=[mid+1]*(K*N)
   assert a['A']==expectedA and a['zeros']==expectedZp and a['q']==expectedQ and [decode(x) for x in a['scales']]==expectedScale
   refs={name:[] for name in ['high','semantic','fp32']}
   for m in range(M):
    for n in range(N):
     high=sem=fp=0.
     for k in range(K):
      idx=k*N+n;group=(k//32)*N+n;b=(a['q'][idx]-a['zeros'][group])*decode(a['scales'][group]);product=a['A'][m*K+k]*half(b);high+=a['A'][m*K+k]*b;sem=half(product+sem);fp=fp32(product+fp)
     refs['high'].append(high);refs['semantic'].append(sem);refs['fp32'].append(fp)
   for name,values in refs.items():assert values==a['references'][name],(bits,rec['candidateId'],rec['shape'],name)
   for name,check in rec['result'].items():
    if name not in refs:continue
    tol=check['tolerance'];errors=nonfinite=0;maxabs=maxrel=0.
    for actual,expected in zip(a['actual'],refs[name]):
     if not isinstance(actual,(float,int)) or not math.isfinite(actual):errors+=1;nonfinite+=1;continue
     diff=abs(actual-expected);maxabs=max(maxabs,diff);maxrel=max(maxrel,diff/max(abs(expected),1e-8));errors+=diff>tol['atol']+tol['rtol']*abs(expected)
    assert (errors,nonfinite,maxabs,maxrel)==(check['errorElementCount'],check['nonFiniteCount'],check['maxAbsoluteError'],check['maxRelativeError'])
   if probe and rec['status']=='PASS':assert a['actual']==[2048]
   count+=len(a['actual'])
  for p in f['performance']:
   ids=p['eligibleCandidateIds'];seed=r['plan']['seed']^bits^p['shape']['M'];expected=orders(ids,30,seed);warm=orders(ids,10,seed^0x5741524d)
   assert p['seed']==seed and p['plannedRounds']==expected and p['warmupRounds']==warm
   position={id:[sum(o[pos]==id for o in expected) for pos in range(len(ids))] for id in ids};assert position==p['positionCounts']
   for counts in position.values():assert max(counts)-min(counts)<=1
   sequence=[(phase,roundId,pos,id,o) for phase,oo in [('warmup',warm),('measured',expected)] for roundId,o in enumerate(oo) for pos,id in enumerate(o)]
   if p['status']=='COMPLETE':assert len(p['samples'])==len(sequence)
   cursor=0
   for s in p['samples']:
    while cursor<len(sequence) and sequence[cursor][3]!=s['candidateId']:cursor+=1
    phase,rid,pos,id,o=sequence[cursor];cursor+=1;assert (s['phase'],s['roundId'],s['orderInRound'],s['roundOrder'])==(phase,rid,pos,o)
    assert s['executionOrder']==execution;execution+=1
    if s['endTimestamp'] is not None:
     diff=int(s['endTimestamp'])-int(s['startTimestamp']);assert diff>=0 and diff==s['gpuPassDurationNs'];samplesChecked+=1
    if p['status']=='COMPLETE':assert s['correctness']['status']=='PASS'
   summaries={}
   for id in ids:
    rows=[s for s in p['samples'] if s['phase']=='measured' and s['candidateId']==id];saved=p.get('statistics',{}).get(id,{})
    if saved.get('status') not in ['PRELIMINARY','RESOLUTION_LIMITED']:continue
    assert len(rows)==30
    stat=stats([s['gpuPassDurationNs'] for s in rows]);assert stat==saved['gpuPassNs']
    assert stats([s['submitToCompletionWallMs'] for s in rows])==saved['submitToCompletionWallMs']
    ts=[int(s[k]) for s in rows for k in ['startTimestamp','endTimestamp']];grid=math.gcd(*(abs(x-ts[0]) for x in ts));assert str(grid)==saved['observedGridNs']
    assert saved['status']==('RESOLUTION_LIMITED' if stat['zeroCount'] or stat['median']<10*max(65536,grid) else 'PRELIMINARY');summaries[id]=saved
   for variant,selection in p.get('selection',{}).items():
    valid=[id for id,s in summaries.items() if candidates[id]['variant']==variant and s['status']=='PRELIMINARY'];valid.sort(key=lambda id:summaries[id]['gpuPassNs']['median'])
    if valid:
     grid=max(65536,*(int(summaries[id]['observedGridNs']) for id in valid));minimum=summaries[valid[0]]['gpuPassNs']['median'];ties=[id for id in valid if summaries[id]['gpuPassNs']['median']-minimum<=grid]
     selected=original[variant] if original[variant] in ties else valid[0];assert selection['selected']==selected and selection['indistinguishable']==ties and selection['selectionGridNs']==grid;assert selection['status']==('INDISTINGUISHABLE_WITHIN_ONE_GRID' if len(ties)>1 else 'PILOT_SELECTION')
    else:assert selection['selected'] is None
    for id,ratios in selection['ratios'].items():
     for key,base in [('AoverCandidate','A-original'),('originalOverCandidate',original[variant])]:
      lhs=summaries.get(base);rhs=summaries.get(id);value=lhs['gpuPassNs']['median']/rhs['gpuPassNs']['median'] if lhs and rhs and lhs['status']==rhs['status']=='PRELIMINARY' and rhs['gpuPassNs']['median']>0 else None;assert ratios[key]==value
   tables.append({'bits':bits,'shape':p['shape'],'statistics':p.get('statistics'),'selection':p.get('selection')})
 assert execution<=1600 and all(x['destroyed'] for x in r['resources'])
 return dict(verification='PASS',runStatus=r['status'],smallOutputsIndependentlyChecked=count,timestampSamplesChecked=samplesChecked,tables=tables,scope='Exported small inputs/reference/actual metrics independently replayed;large full actual arrays absent,online evidence only;no stable speedup claim')
if __name__=='__main__':
 if len(sys.argv)!=2:raise SystemExit('Usage: python scripts/verify_part2_sweep_result.py PATH | --stdin (mock-only,never archives)')
 if sys.argv[1]=='--stdin':r=json.load(sys.stdin);assert r['environment']['userAgent']=='CPU MOCK';print(json.dumps(audit(r,mock=True)));raise SystemExit()
 p=Path(sys.argv[1]);raw=p.read_bytes();dest=Path('results/raw')/p.name
 if dest.exists():assert dest.read_bytes()==raw
 else:dest.write_bytes(raw)
 result=audit(json.loads(raw));result['rawSha256']=hashlib.sha256(raw).hexdigest()
 Path('results/analysis').joinpath(p.stem+'-verified.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(json.dumps(result,indent=2))
