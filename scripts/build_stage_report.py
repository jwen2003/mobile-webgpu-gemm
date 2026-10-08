"""Offline stage report from immutable evidence. No device/model/benchmark calls."""
from pathlib import Path
import hashlib, json, math, statistics, sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from verify_baseline_sessions import audit as audit_baseline
from verify_part2_repeat_result import verify as audit_repeat, SELECTED

def load(p):
    return json.loads((ROOT / p).read_text(encoding='utf-8'))

def stat(xs):
    s = sorted(xs)
    return dict(count=len(s), median=statistics.median(s), p95=s[math.ceil(.95*len(s))-1],
                min=s[0], max=s[-1], zeroCount=s.count(0))

def table(headers, rows):
    return '\n'.join(['|'+'|'.join(headers)+'|', '|'+'|'.join(['---']*len(headers))+'|'] +
                     ['|'+'|'.join(map(str,r))+'|' for r in rows]) + '\n'

def main():
    hashes = load('results/analysis/raw_sha256_manifest.json')['files']
    for f,h in hashes.items():
        assert hashlib.sha256((ROOT/f).read_bytes()).hexdigest() == h, f
    assignment = ROOT/'assignment/webgpu_adreno_assignment.pdf'
    assert hashlib.sha256(assignment.read_bytes()).hexdigest() == 'dc02d42a5fdf521b75794ac641478cfe91ec7d9e165fa93a1c2e43b3ec63e9c3'
    bs = load('results/analysis/baseline002_summary.json')
    rs = load('results/analysis/part2_repeat_summary.json')
    tx = load('results/analysis/memory001_texture_payload.json')
    assert bs['status'] == 'FIFTEEN_SESSIONS_VERIFIED' and rs['status'] == 'FIVE_SESSIONS_VERIFIED'
    datasets = dict(status='PARTIAL', assignmentSha256=hashlib.sha256(assignment.read_bytes()).hexdigest(),
                    historicalRawHashesChecked=len(hashes), baseline=[], kernelRows=[], memoryRows=[], evidence=[])
    baseline_files = list((ROOT/'results/raw').glob('BASELINE002-L*-R*.json'))
    repeat_files = list((ROOT/'results/raw').glob('PART2REPEAT-S*.json'))
    assert len(baseline_files)==15 and len(repeat_files)==5
    all_ids=set()
    for p in baseline_files:
        raw=json.loads(p.read_text(encoding='utf-8')); v=audit_baseline(raw)
        assert v['verification']=='PASS' and raw['status']=='COMPLETE'
        assert raw['session']['id'] not in all_ids; all_ids.add(raw['session']['id'])
        datasets['evidence'].append(dict(file=p.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),scope='full prompt/recorded walls/resource ledger;not native token sequence'))
        t=raw['session']['targetTokens']; repetition=raw['session']['repetition']
        old=next(g for g in bs['groups'] if g['inputTokens']==t)
        oldv=next(s for s in old['perSession'] if s['session']['repetition']==repetition)
        assert oldv['rawSha256']==hashlib.sha256(p.read_bytes()).hexdigest()
        assert oldv['wallMetrics']==raw['wallMetrics']
        datasets['baseline'].append(dict(tokens=t,round=repetition,**raw['wallMetrics']))
        texture=next(s for s in tx['sessions'] if s['session']['id']==raw['session']['id'])
        assert texture['status']=='AVAILABLE' and not texture['uncovered'] and not texture['lifecycleErrors']
        for snap in raw['memory']['snapshots']:
            ts=next(s for s in texture['snapshots'] if s['stage']==snap['stage'])
            logical=snap['logical']
            datasets['memoryRows'].append(dict(tokens=t,round=repetition,stage=snap['stage'],
                jsHeapUsedBytes=snap['jsHeap'].get('usedJSHeapSize'),
                bufferLiveLogicalBytes=logical.get('buffers',{}).get('currentLogicalBytes'),
                textureLivePayloadBytes=ts.get('payloadBytes'),textureStatus=ts['status']))
    for g in bs['groups']:
        sessions=[r for r in datasets['baseline'] if r['tokens']==g['inputTokens']]
        assert len(sessions)==5
        for k,expected in g['wallStatisticsMs'].items():
            got=stat([s[k] for s in sessions])
            for field in ['count','median','p95','min','max']:assert got[field]==expected[field]
    sample_count=0; small_count=0
    for p in sorted(repeat_files):
        raw=json.loads(p.read_text(encoding='utf-8')); v=audit_repeat(raw)
        assert v['verification']=='PASS' and raw['status']=='COMPLETE'
        ordinal=raw['session']['ordinal']; old=next(s for s in rs['sessions'] if s['session']['ordinal']==ordinal)
        assert old['rawSha256']==hashlib.sha256(p.read_bytes()).hexdigest()
        assert old['tables']==v['tables'] and old['comparisons']==v['comparisons']
        small_count+=v['smallOutputsIndependentlyChecked']
        datasets['evidence'].append(dict(file=p.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),scope='full exported small outputs/timestamps/orders;large all-output checks online only'))
        for f in raw['formats']:
            for group in f['performance']:
                m=group['shape']['M']; bits=f['bits']; key=f'{bits}:{m}'
                for cid in group['eligibleCandidateIds']:
                    samples=[s for s in group['samples'] if s['candidateId']==cid]
                    assert len([s for s in samples if s['phase']=='warmup'])==10
                    measured=[s for s in samples if s['phase']=='measured']; assert len(measured)==30
                    for s in samples:
                        assert int(s['endTimestamp'])-int(s['startTimestamp'])==s['gpuPassDurationNs']
                        assert s['correctness']['status']=='PASS'
                    sample_count+=len(samples)
                    stats=stat([s['gpuPassDurationNs'] for s in measured])
                    assert stats==group['statistics'][cid]['gpuPassNs']
                    a=group['statistics']['A-original']['gpuPassNs']['median']
                    original='A-original' if cid.startswith('A') else dict(B='B-16x16-K16',C='C-8x8-K16',D='D-8x8-K16')[cid[0]]
                    original_median=group['statistics'][original]['gpuPassNs']['median']
                    delta=a-stats['median']; selected=cid=='A-original' or SELECTED[key].get(cid[0])==cid
                    errors=[s['correctness']['fp32']['maxAbsoluteError'] for s in samples]
                    datasets['kernelRows'].append(dict(session=ordinal,bits=bits,M=m,K=1024,N=1024,candidate=cid,
                        selected=selected,**stats,AoverCandidate=a/stats['median'],
                        ratioStatus='WITHIN_ONE_GRID' if abs(delta)<=65536 else 'RESOLVED_IN_THIS_SESSION',
                        originalOverCandidate=original_median/stats['median'],maxAbsErrorVsFp32=max(errors),
                        nominalGflops=(2*m*1024*1024)/stats['median']))
    assert sample_count==5000 and small_count==232985
    datasets['verification']=dict(status='PASS',baselineSessions=15,repeatSessions=5,
        timestampSamplesChecked=sample_count,smallOutputsIndependentlyChecked=small_count,
        limitation='Large matrices checked online in full;offline verification covers exported small arrays and recorded references,not unavailable large actual arrays')
    datasets['baseline'].sort(key=lambda r:(r['tokens'],r['round']))
    datasets['kernelRows'].sort(key=lambda r:(r['bits'],r['M'],r['candidate'],r['session']))
    (ROOT/'results/analysis/stage_delivery_data.json').write_text(json.dumps(datasets,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    build_report(datasets,bs,rs,tx)
    print('PASS:15 baseline/5 Part2 sessions;5000 timestamps;232985 exported small outputs;42 historical hashes')

def build_report(d,bs,rs,tx):
    # Presentation only: both languages read the same validated data.
    from render_bilingual_docs import render_reports
    render_reports(d)

if __name__=='__main__':
    if '--docs-only' in sys.argv:
        from render_bilingual_docs import main as render_documentation
        render_documentation()
    else:
        main()
