"""Reconstruct one real submitted arithmetic candidate without guessing tensor shapes."""
import hashlib,json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
p=root/'results/raw/PROFILE002-2026-10-04T15-53-13-603Z.json'
raw=p.read_bytes();d=json.loads(raw);o=d['observer']
assert o['status']=='COMPLETE' and not o['droppedEvents']
ids={x['id']:x for x in o['identities']};shader=ids['shader-2630']
assert hashlib.sha256(shader['source'].encode()).hexdigest()==shader['sha256']
pipelines=[x for x in o['identities'] if x.get('shaderId')==shader['id']];pipeline_ids={x['id'] for x in pipelines}
passes={};commands={};selected=[];encoded=0
for e in o['events']:
    if e['type']=='create_pass':passes[e['id']]=[]
    elif e['type'] in ('dispatchWorkgroups','dispatchWorkgroupsIndirect'):
        passes[e['passId']].append(e)
        if e['phase']=='GENERATION' and e.get('pipelineId') in pipeline_ids:encoded+=1
    elif e['type']=='create_commandBuffer':commands[e['id']]=e['passIds']
    elif e['type']=='queue.submit' and e['phase']=='GENERATION':
        for cb in e['commandIds']:
            for pass_id in commands[cb]:
                for dispatch in passes[pass_id]:
                    if dispatch.get('pipelineId') in pipeline_ids:
                        selected.append(dict(submitSequence=e['sequence'],commandBufferId=cb,passId=pass_id,dispatch=dispatch))
out=dict(rawPath=p.relative_to(root).as_posix(),rawSha256=hashlib.sha256(raw).hexdigest(),shader=shader,pipelines=pipelines,
    encodedDispatches=encoded,submittedDispatches=len(selected),submittedOccurrences=selected,
    shape=dict(M='UNKNOWN',N='UNKNOWN',K='UNKNOWN'),
    missing=['U.i0.x/y/z values and update history','texture extents/format/views','weights binding range/offset',
             'pipeline.constants','logical tensor padding/axis mapping'])
dest=root/'results/analysis/profile002/gemm003_shape_candidate.json'
dest.write_text(json.dumps(out,indent=2),encoding='utf-8')
print('Verified source/hash and submitted associations; encoded=%d, submitted=%d; complete M/N/K UNKNOWN.'%(encoded,len(selected)))
