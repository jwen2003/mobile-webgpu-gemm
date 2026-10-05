"""Offline evidence audit; no new phone diagnostics and no inference of root cause."""
import collections
import hashlib
import json
import math
import pathlib
import statistics

root = pathlib.Path(__file__).resolve().parents[1]
path = root / 'results/raw/PROFILE003-2026-10-05T03-20-03-974Z.json'
d = json.loads(path.read_text(encoding='utf-8'))
rows = d['passTimestamps']['samples']
groups = collections.defaultdict(list)
for a,b in zip(rows,rows[1:]):
    overlap = int(a['endTimestampNs']) - int(b['startTimestampNs'])
    if overlap <= 0: continue
    category = 'same_command_buffer' if a['commandBufferId'] == b['commandBufferId'] else (
        'same_submit_distinct_command_buffers' if a['submissions'][0]['observerSubmitSequence'] == b['submissions'][0]['observerSubmitSequence'] else 'cross_submit')
    groups[category].append(overlap)
def summary(values):
    if not values: return {'count':0}
    x=sorted(values)
    return {'count':len(x),'minNs':x[0],'medianNs':statistics.median(x),
        'nearestRankP95Ns':x[math.ceil(.95*len(x))-1],'maxNs':x[-1],
        'atMost65536Ns':sum(v<=65536 for v in x),'greaterThan65536Ns':sum(v>65536 for v in x)}
all_values=[v for x in groups.values() for v in x]
identities={x['id']:x for x in d['observer']['identities']}
events=d['observer']['events']
first_submit={}
for e in events:
    if e['type']=='queue.submit':
        for command in e['commandIds']:first_submit.setdefault(command,e['sequence'])
query_slots=[(r['queryChunk'],tuple(r['queryIndices'])) for r in rows]
resolve_commands=d['passTimestamps']['profilerCommands']
order_checks=[]
ends={e['passId']:e['sequence'] for e in events if e['type']=='pass.end'}
finishes={e['commandBufferId']:e['sequence'] for e in events if e['type']=='encoder.finish'}
for row in rows:
    end=ends.get(row['passId'])
    finish=finishes.get(row['commandBufferId'])
    order_checks.append(end is not None and finish is not None and end<finish<first_submit[row['commandBufferId']])
result={'sourceSha256':hashlib.file_digest(path.open('rb'),'sha256').hexdigest(),
    'adjacentPairs':len(rows)-1,'overlap':summary(all_values),
    'groups':{k:summary(groups[k]) for k in ['same_command_buffer','same_submit_distinct_command_buffers','cross_submit']},
    'querySlotDuplicates':len(query_slots)-len(set(query_slots)),
    'repeatedTimedSubmissions':sum(r['submissionCount']!=1 for r in rows),
    'endFinishSubmitOrderChecksPass':all(order_checks),'resolveCopyMetadataCount':len(resolve_commands),
    'resolveCopyOrderEvidence':'pass_timestamps.mjs finish wrapper checks ended, appends resolve then copy, then native finish; raw observer records end/finish/submit but not individual native resolve/copy call timestamps',
    'rootCause':'UNKNOWN'}
timer_lines=(root/'src/profiling/pass_timestamps.mjs').read_text(encoding='utf-8').splitlines()
page_lines=(root/'src/profiling/profile003.js').read_text(encoding='utf-8').splitlines()
result['sourceLocations']={name:next(i+1 for i,line in enumerate(timer_lines) if marker in line)
    for name,marker in {'uniqueQuerySlot':'const slot = self.rows.length', 'resolveOutsidePass':'target.resolveQuerySet(',
        'copyAfterResolve':'target.copyBufferToBuffer(', 'finishAfterCopies':'const command = Reflect.apply(finish',
        'repeatSubmitDetection':'if (row.submissionCount > 1)'}.items()}
result['sourceLocations']['pageReadAfterDrain']=next(i+1 for i,line in enumerate(page_lines) if 'await timestamps.readAfterDrain()' in line)
# Extended offline validity diagnostics without editing historical JSON or sorting samples.
starts=[int(r['startTimestampNs']) for r in rows];ends_ns=[int(r['endTimestampNs']) for r in rows]
result['startInversions']=sum(b<a for a,b in zip(starts,starts[1:]));result['endInversions']=sum(b<a for a,b in zip(ends_ns,ends_ns[1:]))
result['signedAdjacentEndMinusNextStart']=summary([a-b for a,b in zip(ends_ns,starts[1:])])
result['examples']=[]
for a,b in zip(rows,rows[1:]):
    overlap=int(a['endTimestampNs'])-int(b['startTimestampNs'])
    if overlap>0 and len(result['examples'])<3:
        result['examples'].append({'overlapNs':overlap,'previous':{k:a[k] for k in ['passId','commandBufferId','queryChunk','queryIndices','startTimestampNs','endTimestampNs','submissions']},'next':{k:b[k] for k in ['passId','commandBufferId','queryChunk','queryIndices','startTimestampNs','endTimestampNs','submissions']}})
result['cpuSubmittedDispatchCount']=d['observer']['phases']['GENERATION']['submittedDirect']
result['sampleAssociatedDispatchCount']=sum(r['encodedDirectDispatches'] for r in rows)
result['dataUse']='Conclusion3: cause UNKNOWN; model intervals do not support exclusive kernel time ranking or stacked time breakdown'
(root/'results/analysis/profile003').mkdir(parents=True,exist_ok=True)
(root/'results/analysis/profile003/overlap_diagnostics.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
