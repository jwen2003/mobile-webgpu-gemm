"""Independent raw timing replay and seeded worst-reference checks; full GPU arrays are not exported."""
import array
import hashlib
import json
import math
import pathlib
import statistics
import struct
import sys

path=pathlib.Path(sys.argv[1])
d=json.loads(path.read_text(encoding='utf-8'))
assert d['experimentId']=='GEMM001' and d['status']=='COMPLETE' and not d['errors']
assert hashlib.sha256(d['contract']['shaderSource'].encode()).hexdigest()==d['contract']['shaderSha256']
assert d['contract']['workgroup']==[8,8,1] and d['timing']['dispatchesPerPass']==1
assert 'timestamp-query' in d['environment']['device']['features']
assert len(d['correctness'])==10
assert d['reference']['tolerances']=={'integer':{'atol':0,'rtol':0},'fractional':{'atol':0.002,'rtol':0.0002},'relativeDenominatorFloor':1e-8}

def rng(seed):
    x=seed
    while True:
        x=(x^(x<<13))&0xffffffff;x=(x^(x>>17))&0xffffffff;x=(x^(x<<5))&0xffffffff
        yield x

def f32(x):return struct.unpack('<f',struct.pack('<f',x))[0]
reference_inputs={}
def worst_reference(shape,kind,index):
    key=(shape['M'],shape['K'],shape['N'],kind)
    if key not in reference_inputs:
        r=rng(d['input']['seed'])
        value=(lambda:next(r)%7-3) if kind=='integer' else (lambda:f32((next(r)%2001-1000)/1000))
        a=array.array('f',(value() for _ in range(shape['M']*shape['K'])))
        b=array.array('f',(value() for _ in range(shape['K']*shape['N'])))
        reference_inputs[key]=(a,b)
    a,b=reference_inputs[key];row,column=divmod(index,shape['N']);total=0.0
    for k in range(shape['K']):total+=a[row*shape['K']+k]*b[k*shape['N']+column]
    return total

def check_correctness(c,shape,kind):
    assert c['status']=='PASS' and c['errorElementCount']==c['nonFiniteCount']==0
    assert c['elementCount']==shape['M']*shape['N']
    expected_tolerance=d['reference']['tolerances'][kind]
    assert c['atol']==expected_tolerance['atol'] and c['rtol']==expected_tolerance['rtol']
    w=c['worst'];assert 0<=w['index']<c['elementCount']
    assert (w['row'],w['column'])==divmod(w['index'],shape['N'])
    expected=worst_reference(shape,kind,w['index'])
    assert expected==w['expected'] and math.isfinite(w['actual'])
    assert math.isclose(abs(w['actual']-expected),c['maxAbsoluteError'],rel_tol=0,abs_tol=1e-12)
    assert abs(w['actual']-expected)<=c['atol']+c['rtol']*abs(expected)
    if kind=='integer':assert c['maxAbsoluteError']==c['maxRelativeError']==0

for row in d['correctness']:
    assert row['status']=='PASS'
    check_correctness(row['sample']['correctness'],row['shape'],row['kind'])

def stats(values):
    x=sorted(values)
    return {'count':len(x),'median':statistics.median(x),'p95':x[math.ceil(.95*len(x))-1],
        'min':x[0],'max':x[-1],'zeroCount':x.count(0)}

expected_order=[s['id'] for s in d['shapes'] if s['performance']]
r=rng(d['timing']['orderSeed'])
for i in range(len(expected_order)-1,0,-1):
    j=int(next(r)/4294967296*(i+1));expected_order[i],expected_order[j]=expected_order[j],expected_order[i]
assert [c['shape']['id'] for c in d['performance']]==expected_order
assert [s['id'] for s in d['timing']['order']]==expected_order
result=[]
execution=0
for index,config in enumerate(d['performance']):
    assert config['status']=='COMPLETE' and len(config['samples'])==40
    shape=config['shape'];assert shape['source']=='REPRESENTATIVE_NOT_RECOVERED_RUNTIME_SHAPE'
    for i,sample in enumerate(config['samples']):
        assert sample['phase']==('warmup' if i<10 else 'measured')
        assert sample['index']==(i if i<10 else i-10)
        assert sample['executionOrder']==execution and sample['configurationIndex']==index;execution+=1
        a,b=int(sample['startTimestamp']),int(sample['endTimestamp'])
        assert b>=a and b-a==sample['gpuPassDurationNs']
        assert sample['gpuPassDurationMs']==(b-a)/1e6
        assert sample['submitToCompletionWallMs']>=0 and sample['mapReadbackWallMs']>=0 and sample['cpuCorrectnessWallMs']>=0
        check_correctness(sample['correctness'],shape,'fractional')
    measured=config['samples'][10:]
    gpu=stats([s['gpuPassDurationNs'] for s in measured])
    wall=stats([s['submitToCompletionWallMs'] for s in measured])
    recorded=config['statistics'];assert gpu==recorded['gpuPassNs'] and wall==recorded['submitToCompletionWallMs']
    timestamps=[int(s[k]) for s in measured for k in ['startTimestamp','endTimestamp']]
    grid=math.gcd(*(abs(t-timestamps[0]) for t in timestamps))
    assert str(grid)==recorded['observedTimestampDifferenceGcdNs']
    limited=gpu['zeroCount']>0 or gpu['median']<10*max(65536,grid)
    assert recorded['status']==('RESOLUTION_LIMITED' if limited else 'PRELIMINARY')
    flops=2*shape['M']*shape['N']*shape['K'];assert flops==recorded['nominalFlops']
    assert recorded['effectiveGflops']==(None if limited else flops/gpu['median'])
    result.append({'shape':shape,'gpuPassNs':gpu,'wallMs':wall,'gridNs':grid,'resolutionLimited':limited,
        'effectiveGflops':recorded['effectiveGflops']})
print(json.dumps({'verification':'PASS','rawSha256':hashlib.file_digest(path.open('rb'),'sha256').hexdigest(),
    'bytes':path.stat().st_size,'performance':result,
    'correctnessScope':'All exported summaries/thresholds and seeded worst-reference values verified. Full GPU actual arrays are absent; cannot independently recompute all-output maxima/counts from this JSON.'},indent=2))
