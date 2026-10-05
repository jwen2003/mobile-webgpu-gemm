"""Independent replay; client full-output checks cannot be replayed without actual arrays."""
import array, hashlib, json, math, pathlib, statistics, struct, sys
p=pathlib.Path(sys.argv[1]);raw=p.read_bytes();d=json.loads(raw)
assert d['experimentId']=='GEMM002' and d['status']=='COMPLETE' and not d['errors']
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
assert len(d['correctness'])==12 and all(r['destroyed'] for r in d['resources'])
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
for c in d['correctness']:
    assert c['status']=='PASS';check(c['pairComparison']['correctness'])
    for v in c['variants'].values():
        assert v['status']=='PASS';worst_reference(c['shape'],c['kind'],v['sample']['correctness'])
order=shuffle([1,128],0x6e6d0021);assert [c['shape']['M'] for c in d['performance']]==order
out=[];execution=0
for config in d['performance']:
    shape=config['shape'];assert config['status']=='COMPLETE' and len(config['samples'])==80
    planned=shuffle([['naive','tiled'] for _ in range(15)]+[['tiled','naive'] for _ in range(15)],0x6e6d0022^shape['M'])
    assert [r['order'] for r in config['plannedRounds']]==planned
    assert len(config['pairComparisons'])==40
    for c in config['pairComparisons']:check(c['correctness'])
    for i,s in enumerate(config['samples']):
        phase='warmup' if i<20 else 'measured';round_id=i//2 if i<20 else (i-20)//2
        expected_order=(['naive','tiled'] if round_id%2==0 else ['tiled','naive']) if phase=='warmup' else planned[round_id]
        assert s['phase']==phase and s['roundId']==round_id and s['orderInRound']==i%2 and s['variant']==expected_order[i%2]
        assert s['roundOrder']==expected_order and s['executionOrder']==execution;execution+=1
        start,end=int(s['startTimestamp']),int(s['endTimestamp']);assert end>=start and end-start==s['gpuPassDurationNs']
        worst_reference(shape,'fractional',s['correctness'])
    summary={}
    for variant in ['naive','tiled']:
        samples=[s for s in config['samples'] if s['phase']=='measured' and s['variant']==variant]
        computed=stats([int(s['endTimestamp'])-int(s['startTimestamp']) for s in samples]);saved=config['statistics']['byVariant'][variant]
        assert saved['gpuPassNs']==computed and saved['submitToCompletionWallMs']==stats([s['submitToCompletionWallMs'] for s in samples])
        ts=[int(s[k]) for s in samples for k in ['startTimestamp','endTimestamp']];g=0
        for t in ts:g=math.gcd(g,abs(t-ts[0]))
        assert str(g)==saved['observedTimestampDifferenceGcdNs']
        limited=computed['zeroCount']>0 or computed['median']<10*max(65536,g)
        assert saved['status']==('RESOLUTION_LIMITED' if limited else 'PRELIMINARY')
        assert math.isclose(saved['effectiveGflops'],2*shape['M']*shape['N']*shape['K']/computed['median'])
        summary[variant]={**computed,'gridNs':g}
    ratio=summary['naive']['median']/summary['tiled']['median'];assert ratio==config['statistics']['speedup']
    pairs=[]
    for r in range(30):
        ss={s['variant']:s for s in config['samples'] if s['phase']=='measured' and s['roundId']==r}
        pairs.append(ss['naive']['gpuPassDurationNs']/ss['tiled']['gpuPassDurationNs'])
    assert pairs==config['statistics']['pairedRawRatios'] and stats(pairs)==config['statistics']['pairedDurationRatios']
    out.append(dict(shape=shape,variants=summary,speedup=ratio,pairedRatioStatistics=stats(pairs)))
print(json.dumps(dict(verification='PASS',rawSha256=hashlib.sha256(raw).hexdigest(),bytes=len(raw),performance=out,
    correctnessScope='Client checks all outputs; independent replay verifies seeded worst-reference values, not all-output maxima/counts because full actual arrays are absent.'),indent=2))
