"""Independent replay; client full-output checks cannot be replayed without actual arrays."""
import array, hashlib, json, math, pathlib, statistics, struct, sys
p=pathlib.Path(sys.argv[1]);raw=p.read_bytes();d=json.loads(raw)
assert d['experimentId']=='GEMM003' and d['status']=='COMPLETE' and not d['errors']
def rng(x):
    while True:
        x=(x^(x<<13))&0xffffffff;x=(x^(x>>17))&0xffffffff;x=(x^(x<<5))&0xffffffff;yield x
def shuffle(a,seed):
    r=rng(seed)
    for i in range(len(a)-1,0,-1):
        j=int(next(r)/4294967296*(i+1));a[i],a[j]=a[j],a[i]
    return a
def stats(a):
    s=sorted(a);return dict(count=len(s),median=statistics.median(s),p95=s[math.ceil(.95*len(s))-1],min=s[0],max=s[-1],zeroCount=s.count(0))
def check(c):
    assert c['status']=='PASS' and c['errorElementCount']==0 and c['nonFiniteCount']==0
assert d['reference']['tolerances']==dict(integer=dict(atol=0,rtol=0),fractional=dict(atol=.002,rtol=.0002),relativeDenominatorFloor=1e-8)
for v,shader in d['shaders'].items():
    assert hashlib.sha256(shader['source'].encode()).hexdigest()==shader['sha256']
    assert not shader['compilationMessages'] and shader['status']=='READY'
    local=pathlib.Path(shader['path']).read_text(encoding='utf-8')
    assert local==shader['source']
assert len(d['correctness'])==10 and all(r['destroyed'] for r in d['resources'])
cache={}
def worst_reference(shape,kind,c):
    check(c);key=(shape['M'],shape['K'],shape['N'],kind)
    if key not in cache:
        r=rng(d['input']['seed'])
        def value():
            if kind=='integer':return next(r)%7-3
            return struct.unpack('<f',struct.pack('<f',(next(r)%2001-1000)/1000))[0]
        cache[key]=(array.array('f',(value() for _ in range(shape['M']*shape['K']))),array.array('f',(value() for _ in range(shape['K']*shape['N']))))
    a,b=cache[key];index=c['worst']['index'];row,col=divmod(index,shape['N'])
    ref=0.
    for k in range(shape['K']):ref+=a[row*shape['K']+k]*b[k*shape['N']+col]
    assert ref==c['worst']['expected']
    tol=d['reference']['tolerances'][kind]
    assert abs(c['worst']['actual']-ref)<=tol['atol']+tol['rtol']*abs(ref)

small_elements=0
for c in d['correctness']:
    assert c['status']=='PASS'
    for pair in c['pairComparison']['comparisons']:check(pair['correctness'])
    for v in c['variants'].values():worst_reference(c['shape'],c['kind'],v['sample']['correctness'])
    if not c['shape']['performance']:
        f=c['fullArrays'];a,b=cache[(c['shape']['M'],c['shape']['K'],c['shape']['N'],c['kind'])]
        assert list(a)==f['A'] and list(b)==f['B']
        K,N=c['shape']['K'],c['shape']['N'];reference=[]
        for n in range(N):
            total=0.
            for k in range(K):total+=a[k]*b[k*N+n]
            reference.append(total)
        assert reference==f['cpuReference'];tol=d['reference']['tolerances'][c['kind']]
        for variant,output in f['outputs'].items():
            assert len(output)==N
            errors=[abs(x-y) for x,y in zip(output,reference)]
            assert all(math.isfinite(x) for x in output)
            assert all(e<=tol['atol']+tol['rtol']*abs(y) for e,y in zip(errors,reference))
            summary=c['variants'][variant]['sample']['correctness']
            assert max(errors)==summary['maxAbsoluteError']
            assert max(e/max(abs(y),1e-8) for e,y in zip(errors,reference))==summary['maxRelativeError']
            small_elements+=N
permutations=[['naive','tiled','specialized'],['naive','specialized','tiled'],['tiled','naive','specialized'],['tiled','specialized','naive'],['specialized','naive','tiled'],['specialized','tiled','naive']]
planned=shuffle([list(p) for p in permutations for _ in range(5)],0x6e6d0032^1)
assert len(d['performance'])==1
config=d['performance'][0];assert config['status']=='COMPLETE' and len(config['samples'])==120
assert [r['order'] for r in config['plannedRounds']]==planned
for p in permutations:assert planned.count(p)==5
for i,sample in enumerate(config['samples']):
    phase='warmup' if i<30 else 'measured';r=i//3 if i<30 else (i-30)//3
    order=permutations[r%6] if phase=='warmup' else planned[r]
    assert sample['phase']==phase and sample['roundId']==r and sample['orderInRound']==i%3 and sample['executionOrder']==i
    assert sample['variant']==order[i%3] and sample['roundOrder']==order
    assert int(sample['endTimestamp'])-int(sample['startTimestamp'])==sample['gpuPassDurationNs']>=0
    worst_reference(config['shape'],'fractional',sample['correctness'])
assert len(config['pairComparisons'])==40
for p in config['pairComparisons']:
    assert p['correctness']['status']=='PASS' and len(p['comparisons'])==3
    for pair in p['comparisons']:check(pair['correctness'])
summary={}
for variant in ['naive','tiled','specialized']:
    samples=[s for s in config['samples'] if s['phase']=='measured' and s['variant']==variant]
    actual=stats([s['gpuPassDurationNs'] for s in samples]);saved=config['statistics']['byVariant'][variant]
    assert saved['gpuPassNs']==actual and saved['submitToCompletionWallMs']==stats([s['submitToCompletionWallMs'] for s in samples])
    ts=[int(s[k]) for s in samples for k in ['startTimestamp','endTimestamp']];g=0
    for t in ts:g=math.gcd(g,abs(t-ts[0]))
    assert str(g)==saved['observedTimestampDifferenceGcdNs']
    limited=actual['zeroCount']>0 or actual['median']<10*max(65536,g)
    assert saved['status']==('RESOLUTION_LIMITED' if limited else 'PRELIMINARY')
    assert math.isclose(saved['effectiveGflops'],2*1024*1024/actual['median'])
    summary[variant]={**actual,'gridNs':g}
for key,record in config['statistics']['ratios'].items():
    a,b=key.split('/');assert record['value']==summary[a]['median']/summary[b]['median']
print(json.dumps(dict(verification='PASS',rawSha256=hashlib.sha256(raw).hexdigest(),bytes=len(raw),smallOutputElementsIndependentlyChecked=small_elements,statistics=summary,ratios=config['statistics']['ratios'],scope='Small outputs independently checked in full; performance outputs absent, client all-output checks plus independently verified worst reference.'),indent=2))
