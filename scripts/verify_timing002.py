"""Independent integer recomputation; does not alter raw or reconstruct absent outputs."""
import json,hashlib,math,statistics
from pathlib import Path
p=Path('results/raw/TIMING002-2026-10-05T11-36-40-431Z.json');raw=p.read_bytes();r=json.loads(raw)
def stats(v):
 if not v:return None
 a=sorted(v);return dict(count=len(a),median=statistics.median(a),p95=a[math.ceil(.95*len(a))-1],min=a[0],max=a[-1],zeroCount=a.count(0))
result={'rawPath':str(p),'rawSha256':hashlib.sha256(raw).hexdigest(),'modes':[],'outputVerification':'24 online summaries checked; actual arrays absent, no independent full-output recomputation claimed'}
assert not r['errors'] and hashlib.sha256(r['shader']['source'].encode()).hexdigest()==r['shader']['sha256']
for mode in r['modes']:
 s=mode['samples'];assert len(s)==8
 starts=[int(x['startTimestamp']) for x in s];ends=[int(x['endTimestamp']) for x in s]
 durations=[b-a for a,b in zip(starts,ends)];assert all(x['gpuPassDurationNs']==d and x['gpuPassDurationMs']==d/1000000 for x,d in zip(s,durations))
 grid=math.gcd(*(abs(x-starts[0]) for x in starts+ends))
 pairs=[]
 for i in range(7):
  a,b=s[i:i+2];signed=ends[i]-starts[i+1];category='same_command_buffer' if a['commandBufferId']==b['commandBufferId'] else 'same_submit' if a['submitId']==b['submitId'] else 'cross_submit'
  pairs.append(dict(previousPass=a['passId'],nextPass=b['passId'],signedNs=str(signed),overlapNs=str(max(0,signed)),category=category))
  exported=mode['diagnostics']['adjacent'][i];assert int(exported['signedEndMinusNextStartNs'])==signed and int(exported['overlapNs'])==max(0,signed) and exported['category']==category
 positive=[int(x['overlapNs']) for x in pairs if int(x['overlapNs'])>0]
 slots=[(x['querySetId'],q) for x in s for q in x['queryIndices']];assert len(set(slots))==16
 assert stats(durations)==mode['diagnostics']['passDurationNs'] and stats(positive)==mode['diagnostics']['positiveOverlapNs']
 assert str(grid)==mode['diagnostics']['observedTimestampDifferenceGcdNs']
 assert len(mode['correctness'])==8 and all(c['status']=='PASS' and c['elementCount']==1048576 and c['errorElementCount']==c['nonFiniteCount']==c['maxAbsoluteError']==0 for c in mode['correctness'])
 result['modes'].append(dict(mode=mode['mode'],durationNs=stats(durations),positiveOverlapNs=stats(positive),positiveCount=len(positive),atMost65536=sum(0<v<=65536 for v in positive),greaterThan65536=sum(v>65536 for v in positive),gridNs=str(grid),startInversions=sum(b<a for a,b in zip(starts,starts[1:])),endInversions=sum(b<a for a,b in zip(ends,ends[1:])),distinctStartCount=len(set(starts)),adjacent=pairs))
assert all(x['destroyed'] for x in r['resources'])
out=Path('results/analysis/timing002_verified.json');out.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(json.dumps(result,indent=2))
