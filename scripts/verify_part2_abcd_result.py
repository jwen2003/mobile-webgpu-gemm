"""Independent PART2ABC integer timestamps and binary16 reference audit."""
from pathlib import Path
import json,hashlib,math,statistics,struct,array
p=Path('results/raw/PART2ABCD-FP16-2026-10-05T15-57-38-287Z.json');raw=p.read_bytes();r=json.loads(raw)
assert r['status']==r['requiredPathStatus']=='COMPLETE' and r['path']=='FP16' and r['quantizationBits']==4 and not r['errors']
assert {'shader-f16','timestamp-query'}<=set(r['environment']['device']['features'])
assert r['contract']['version']=='PART2-QROW-v1'
def h(x):return struct.unpack('<e',struct.pack('<e',x))[0]
def f(x):return struct.unpack('<f',struct.pack('<f',x))[0]
def rng(seed):
 while True:
  seed=(seed^(seed<<13))&0xffffffff;seed=(seed^(seed>>17))&0xffffffff;seed=(seed^(seed<<5))&0xffffffff;yield seed
cache={}
def data(shape,kind):
 key=(shape['M'],shape['K'],shape['N'],kind)
 if key in cache:return cache[key]
 M,K,N=key[:3];it=rng(r['contract']['seed']);A=array.array('f',(next(it)%3-1 if kind=='exact' else (next(it)%33-16)/64 for _ in range(M*K)))
 scales=[1 if kind=='exact' else 1/32]*((K+31)//32*N);zero=array.array('I',(8+next(it)%3-1 for _ in scales))
 q=array.array('H',(zero[(k//32)*N+n]+next(it)%3-1 if kind=='exact' else next(it)%16 for k in range(K) for n in range(N)))
 if shape.get('extremeCodes'):q=array.array('H',(15 if i%2 else 0 for i in range(K*N)))
 cache[key]=(A,q,scales,zero);return cache[key]
def dot(shape,kind,index):
 A,q,scale,zp=data(shape,kind);K,N=shape['K'],shape['N'];m,n=divmod(index,N);hi=sem=fp=0.
 for k in range(K):
  b=(q[k*N+n]-zp[(k//32)*N+n])*scale[(k//32)*N+n];product=A[m*K+k]*h(b);hi+=A[m*K+k]*b;sem=h(product+sem);fp=f(product+fp)
 return dict(high=hi,semantic=sem,fp32=fp)
def check(c):assert c['status']=='PASS' and c['nonFiniteCount']==c['errorElementCount']==0
count=0
for rec in r['correctness']:
 assert rec['status']=='PASS'
 for v,c in rec['variants'].items():
  for ref in ['semantic','high','fp32']:
   if ref not in c:continue
   check(c[ref]);w=c[ref]['worst'];expected=(2048 if ref=='semantic' else 2050) if rec['shape']['id']=='accumulation-discriminator' else dot(rec['shape'],rec['kind'],w['index'])[ref]
   assert expected==w['expected']
 if 'fullArrays' in rec:
  full=rec['fullArrays'];M,K,N=(rec['shape'][x] for x in ['M','K','N'])
  for k in range(K):
   for n in range(N):assert (full['words'][k*((N+7)//8)+n//8]>>((n%8)*4))&15==full['q'][k*N+n]
  for i,a in enumerate(full['A']):assert h(a)==a and struct.unpack('<H',struct.pack('<e',a))[0]==full['aHalf'][i]
  if rec['shape']['id']!='accumulation-discriminator':
   A,q,sc,zp=data(rec['shape'],rec['kind']);assert list(A)==full['A'] and list(q)==full['q'] and list(zp)==full['zeros']
  for i in range(M*N):
   for v,actual in full['outputs'].items():
    expected=2048 if rec['shape']['id']=='accumulation-discriminator' else dot(rec['shape'],rec['kind'],i)['semantic'];assert actual[i]==expected;count+=1
out=[];execution=0
for config in r['performance']:
 assert config['status']=='COMPLETE' and len(config['samples'])==160
 shape=config['shape'];import itertools
 perms=[list(x) for x in itertools.permutations('ABCD')];planned=[x.copy() for x in perms]+[list(x) for x in ['ABCD','DCBA','BCDA','ADCB','CDAB','BADC']];it=rng(r['contract']['orderSeed']^shape['M'])
 for i in range(29,0,-1):j=int(next(it)/4294967296*(i+1));planned[i],planned[j]=planned[j],planned[i]
 assert config['plannedRounds']==planned
 for i,s in enumerate(config['samples']):
  phase='warmup' if i<40 else 'measured';roundId=i//4 if i<40 else (i-40)//4;order=perms[roundId%6] if phase=='warmup' else planned[roundId]
  assert s['phase']==phase and s['roundId']==roundId and s['variant']==order[i%4] and s['executionOrder']==execution;execution+=1
  assert int(s['endTimestamp'])-int(s['startTimestamp'])==s['gpuPassDurationNs'];assert s['correctness']['status']=='PASS'
  for ref in ['high','semantic','fp32']:
   c=s['correctness'][ref];check(c);assert dot(shape,'fractional',c['worst']['index'])[ref]==c['worst']['expected']
 def stats(a):
  s=sorted(a);return dict(count=len(s),median=statistics.median(s),p95=s[math.ceil(.95*len(s))-1],min=s[0],max=s[-1],zeroCount=s.count(0))
 summary={}
 for v in ['A','B','C','D']:
  samples=[s for s in config['samples'] if s['phase']=='measured' and s['variant']==v];a=stats([s['gpuPassDurationNs'] for s in samples]);saved=config['statistics']['byVariant'][v]
  assert a==saved['gpuPassNs'];assert stats([s['submitToCompletionWallMs'] for s in samples])==saved['submitToCompletionWallMs']
  times=[int(s[k]) for s in samples for k in ['startTimestamp','endTimestamp']];grid=math.gcd(*(abs(t-times[0]) for t in times));assert str(grid)==saved['observedGridNs']
  limited=a['zeroCount']>0 or a['median']<10*max(65536,grid);assert saved['status']==('RESOLUTION_LIMITED' if limited else 'PRELIMINARY')
  summary[v]={**a,'gridNs':grid}
 ratio=summary['A']['median']/summary['B']['median'];assert ratio==config['statistics']['speedupAoverB'];ratios={x+'over'+y:summary[x]['median']/summary[y]['median'] for x,y in [('A','D'),('B','D'),('C','D')]};assert ratios==config['statistics']['speedups'];out.append(dict(shape=shape,variants=summary,speedups=ratios))
for config in r['performance']:
 full=config['completePath'];assert full['status']=='COMPLETE' and len(full['samples'])==160
 shape=config['shape'];planned=[list(x) for x in itertools.permutations('ABCD')]+[list(x) for x in ['ABCD','DCBA','BCDA','ADCB','CDAB','BADC']];it=rng(r['contract']['orderSeed']^shape['M']^0x50415448)
 for i in range(29,0,-1):j=int(next(it)/4294967296*(i+1));planned[i],planned[j]=planned[j],planned[i]
 assert full['plannedRounds']==planned
 for i,sample in enumerate(full['samples']):
  phase='warmup' if i<40 else 'measured';rid=i//4 if i<40 else (i-40)//4;order=perms[rid%6] if phase=='warmup' else planned[rid]
  assert sample['phase']==phase and sample['roundId']==rid and sample['variant']==order[i%4] and sample['roundOrder']==order
  assert int(sample['endTimestamp'])-int(sample['startTimestamp'])==sample['gpuPassDurationNs']
  assert sample['completePathWallMs']>=sample['submitToCompletionWallMs'] and sample['completePathWallMs']>=sample['conversionWallMs']
  if sample['variant']=='D':assert sample['conversionWallMs']==sample['weightUploadEncodingWallMs']==0
  for ref in ['semantic','high','fp32']:
   c=sample['correctness'][ref];check(c);assert dot(shape,'fractional',c['worst']['index'])[ref]==c['worst']['expected']
 for v in 'ABCD':
  values=[s['completePathWallMs'] for s in full['samples'] if s['phase']=='measured' and s['variant']==v];assert stats(values)==full['statistics'][v]
  assert all(planned.count(p)>=1 for p in perms)
  assert all(sum(p.index(v)==pos for p in planned) in [7,8] for pos in range(4))
  for other in 'ABCD':
   if other!=v:assert sum(p.index(v)<p.index(other) for p in planned)==15
 for v in 'ABC':assert full['ratiosToD'][v+'overD']==full['statistics'][v]['median']/full['statistics']['D']['median']
 for entry in out:
  if entry['shape']['id']==shape['id']:entry['completePathWallMs']=full['statistics'];entry['completePathRatiosToD']=full['ratiosToD']

assert all(x['destroyed'] for x in r['resources'])
for v,s in r['shaders'].items():assert hashlib.sha256(s['source'].encode()).hexdigest()==s['sha256'] and not s['compilationMessages']
result=dict(verification='PASS',rawSha256=hashlib.sha256(raw).hexdigest(),smallOutputsIndependentlyChecked=count,performance=out,scope='Full exported small outputs and seeded recorded worst references independently checked;large full actual arrays absent,online maxima/counts not independently reconstructed')
Path('results/analysis/part2_abcd_verified.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(json.dumps(result,indent=2))
