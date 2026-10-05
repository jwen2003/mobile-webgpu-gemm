"""Submitted pass structure only; no invalid timing attribution or label double count."""
import collections,json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
d=json.loads((root/'results/analysis/profile002/shader_classification.json').read_text(encoding='utf-8'))
pipelines={p['pipelineId']:tuple(sorted(x['label'] for x in s['labels'])) for s in d['shaders'] for p in s['pipelineIdentities']}
counts=collections.Counter();dispatches=collections.Counter();records=[]
for row in d['submittedPasses']:
    labels={label for pipeline in row['pipelineCounts'] for label in pipelines[pipeline]}
    category=next(iter(labels)) if len(labels)==1 else 'MIXED'
    counts[category]+=1;dispatches[category]+=row['dispatchCount']
    records.append({**row,'classification':category,'sourceLabels':sorted(labels),'timeNs':'NOT_MEASURED_VALID',
        'attribution':'Whole pass only; MIXED retained, labels not double counted'})
output={'source':'PROFILE002-2026-10-04T15-53-13-603Z.json','sourceSha256':d['summary']['sourceSha256'],
    'scope':'Submitted GENERATION pass occurrences; structure counts only, not cost ranking',
    'passCount':len(records),'dispatchCount':sum(dispatches.values()),
    'categories':[{'category':k,'passes':v,'dispatches':dispatches[k],'validTimeNs':'NOT_MEASURED'} for k,v in sorted(counts.items())],
    'passes':records}
assert output['passCount']==2005 and output['dispatchCount']==126402
(root/'results/analysis/profile002/pass_structure.json').write_text(json.dumps(output,indent=2),encoding='utf-8')
print(output['categories'])
