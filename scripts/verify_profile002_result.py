"""Independently replay exported calls; no inference about hardware execution."""
import collections
import hashlib
import json
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
d = json.loads(path.read_text(encoding='utf-8'))
o = d['observer']
assert d['experimentId'] in ('PROFILE002', 'PROFILE003')
assert d['status'] == o['status'] == 'COMPLETE'
assert all(d['lifecycle'].values()) and not d['errors'] and not o['errors']
assert not o['coverageFailures']
assert all(o[k] == 0 for k in ['droppedEvents', 'droppedMetadata', 'droppedDiagnostics'])
assert d['environment']['visibility']['droppedEvents'] == 0
question = 'Explain in two short sentences what matrix multiplication computes.'
prompt = f'<start_of_turn>user\n{question}<end_of_turn>\n<start_of_turn>model\n'
assert d['prompt']['fullPrompt'] == d['prompt']['sentPrompt'] == d['inputTokenCount']['fullPrompt'] == prompt
assert d['inputTokenCount']['error'] is None
assert isinstance(d['inputTokenCount']['value'], int) and d['inputTokenCount']['value'] >= 0
assert ('timestamp-query' in d['environment']['runtimeDevice']['features']) == (d['experimentId'] == 'PROFILE003')
identities = {x['id']: x for x in o['identities']}
assert len(identities) == len(o['identities'])
calls = collections.defaultdict(collections.Counter)
encoded = collections.defaultdict(collections.Counter)
submitted = collections.defaultdict(collections.Counter)
passes, encoders, commands, buffers = {}, {}, {}, {}
current, peak = 0, 0
created = collections.Counter()
destroyed = collections.Counter()
used_shaders = set()
fragments, done = [], False
for i, e in enumerate(o['events']):
    assert e['sequence'] == i
    phase, kind = e['phase'], e['type']
    calls[phase][kind] += 1
    if kind == 'create_buffer':
        assert e['id'] not in buffers
        buffers[e['id']] = {'size': e['size'], 'destroyed': False}
        current += e['size']; peak = max(peak, current); created[phase] += e['size']
    elif kind == 'buffer_destroy':
        b = buffers[e['id']]
        if not b['destroyed']:
            current -= b['size']; destroyed[phase] += b['size']; b['destroyed'] = True
        assert e['liveBytes'] == current
    elif kind == 'create_encoder':
        encoders[e['id']] = []
    elif kind == 'create_pass':
        passes[e['id']] = {'pipeline': None, 'direct': 0, 'indirect': 0, 'shaders': set()}
        encoders[e['encoderId']].append(e['id'])
    elif kind == 'setPipeline':
        assert identities[e['pipelineId']]['kind'] == 'pipeline'
        passes[e['passId']]['pipeline'] = e['pipelineId']
    elif kind in ('dispatchWorkgroups', 'dispatchWorkgroupsIndirect'):
        p = passes[e['passId']]
        assert p['pipeline'] == e['pipelineId']
        key = 'direct' if kind == 'dispatchWorkgroups' else 'indirect'
        p[key] += 1; encoded[phase][key] += 1
        shader = identities[p['pipeline']]['shaderId']
        assert identities[shader]['kind'] == 'shader'; p['shaders'].add(shader)
        if key == 'indirect':
            assert e['workgroupCounts'] == 'UNKNOWN'
    elif kind == 'create_commandBuffer':
        assert e['passIds'] == encoders[e['encoderId']]
        commands[e['id']] = list(e['passIds'])
    elif kind == 'encoder.finish':
        assert e['commandBufferId'] in commands
    elif kind == 'queue.submit':
        ids = [p for c in e['commandIds'] for p in commands[c]]
        assert ids == e['passIds']
        for key in ('direct', 'indirect'):
            count = sum(passes[p][key] for p in ids)
            assert e[key] == count; submitted[phase][key] += count
        if phase == 'GENERATION':
            for p in ids: used_shaders.update(passes[p]['shaders'])
    elif kind == 'stream_callback':
        fragments.append(e['fragment']); done |= e['done']
for phase, stats in o['phases'].items():
    assert dict(calls[phase]) == stats['calls']
    for key, suffix in [('direct', 'Direct'), ('indirect', 'Indirect')]:
        assert encoded[phase][key] == stats['encoded' + suffix]
        assert submitted[phase][key] == stats['submitted' + suffix]
    assert calls[phase]['queue.submit'] == stats['submissions']
    assert created[phase] == stats['createdBufferBytes']
    assert destroyed[phase] == stats['destroyedBufferBytes']
assert current == o['logicalBuffers']['currentLiveBytes']
assert peak == o['logicalBuffers']['peakBytes']
assert done and ''.join(fragments) == d['output']['streamedText'] == d['output']['returnedText'] == d['output']['finalText']
assert d['output']['finalText'].strip()
for shader_id in used_shaders:
    s = identities[shader_id]
    assert s['usedInGenerationSubmission'] and isinstance(s['source'], str)
    assert hashlib.sha256(s['source'].encode()).hexdigest() == s['sha256']
    assert not [m for m in s['compilationMessages'] if m['type'] == 'error']
assert used_shaders == {x['id'] for x in identities.values() if x['kind'] == 'shader' and x.get('usedInGenerationSubmission')}
print(json.dumps({'verification': 'PASS', 'sha256': hashlib.file_digest(path.open('rb'), 'sha256').hexdigest(),
    'bytes': path.stat().st_size, 'rawEvents': len(o['events']), 'identities': len(identities),
    'generationEncoded': dict(encoded['GENERATION']), 'generationSubmitted': dict(submitted['GENERATION']),
    'submissions': calls['GENERATION']['queue.submit'], 'passes': calls['GENERATION']['create_pass'],
    'generationShaderSourcesHashVerified': len(used_shaders),
    'buffersCreated': len(buffers), 'explicitDestroys': sum(b['destroyed'] for b in buffers.values()),
    'logicalLiveBytes': current, 'logicalPeakBytes': peak}, indent=2))
