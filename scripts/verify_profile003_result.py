"""Verify raw timestamp differences and submission associations without splitting pass time."""
import collections
import hashlib
import json
import math
import pathlib
import subprocess
import sys

path = pathlib.Path(sys.argv[1])
subprocess.run([sys.executable, str(pathlib.Path(__file__).with_name('verify_profile002_result.py')), str(path)], check=True)
d = json.loads(path.read_text(encoding='utf-8'))
assert d['experimentId'] == 'PROFILE003'
t, o = d['passTimestamps'], d['observer']
requested = d['runtime']['requestDeviceDescriptor']
assert requested['requiredFeatures'] == ['shader-f16', 'subgroups', 'timestamp-query']
assert all(f in d['environment']['runtimeDevice']['features'] for f in requested['requiredFeatures'])
for name, value in requested['requiredLimits'].items():
    assert value == d['environment']['runtimeAdapter']['limits'][name]
    assert d['environment']['runtimeDevice']['limits'][name] >= value
assert t['status'] == 'COMPLETE' and not t['errors'] and not t['coverageFailures']
assert t['untimedPasses'] == t['missingSubmittedSamples'] == 0
events = {e['sequence']: e for e in o['events']}
identities = {i['id']: i for i in o['identities']}
dispatches = collections.defaultdict(list)
for e in o['events']:
    if e['type'] in ('dispatchWorkgroups', 'dispatchWorkgroupsIndirect'):
        dispatches[e['passId']].append(e)
timed_passes, values, times, ranges = set(), [], [], set()
for slot, row in enumerate(t['samples']):
    assert row['slot'] == slot and row['passId'] not in timed_passes
    timed_passes.add(row['passId'])
    assert row['submissionCount'] == 1 and row['resolved']
    assert len(row['submissions']) == 1
    link = row['submissions'][0]
    event = events[link['observerSubmitSequence']]
    assert event['type'] == 'queue.submit' and event['phase'] == link['phase'] == 'GENERATION'
    assert row['commandBufferId'] == link['commandBufferId']
    assert row['commandBufferId'] in event['commandIds'] and row['passId'] in event['passIds']
    assert row['passId'] in identities[row['commandBufferId']]['passIds']
    calls = dispatches[row['passId']]
    assert row['encodedDirectDispatches'] == sum(e['type'] == 'dispatchWorkgroups' for e in calls)
    assert row['encodedIndirectDispatches'] == sum(e['type'] == 'dispatchWorkgroupsIndirect' for e in calls)
    assert set(row['pipelineIds']) == {e['pipelineId'] for e in calls}
    assert row['queryChunk'] == slot // t['chunkPasses']
    assert row['queryIndices'] == [(slot % t['chunkPasses']) * 2, (slot % t['chunkPasses']) * 2 + 1]
    assert row['resolveOffset'] == (slot % t['chunkPasses']) * 256
    key = (row['queryChunk'], row['resolveOffset'])
    assert key not in ranges; ranges.add(key)
    for field in ('startTimestampNs','endTimestampNs','gpuPassDurationNs'):
        assert isinstance(row[field], str) and row[field].isdigit()
    a, b = int(row['startTimestampNs']), int(row['endTimestampNs'])
    assert b >= a and b - a == int(row['gpuPassDurationNs'])
    assert row['gpuPassDurationUs'] == (b - a) / 1000
    values.append(b - a); times.extend([a, b])
expected_passes = {p for e in o['events'] if e['type'] == 'queue.submit' and e['phase'] == 'GENERATION' for p in e['passIds']}
assert timed_passes == expected_passes
grid = math.gcd(*(abs(v - times[0]) for v in times))
duration_grid = math.gcd(*values)
s = t['summary']
assert s['sampleCount'] == len(values)
assert s['zeroDurationSamples'] == values.count(0)
assert s['minNs'] == str(min(values)) and s['maxNs'] == str(max(values))
assert s['observedTimestampDifferenceGcdNs'] == str(grid)
assert s['observedDurationGcdNs'] == str(duration_grid)
assert s['allDurationsMultipleOfPriorGrid'] == all(v % 65536 == 0 for v in values)
assert len(t['profilerCommands']) == len(values)
assert all(c['owner'] == 'PROFILER' and c['copyBytes'] == 16 for c in t['profilerCommands'])
assert all(r['owner'] == 'PROFILER' and r['destroyed'] for r in t['profilerResources'])
assert sum(r['resolveBufferBytes'] + r['readbackBufferBytes'] for r in t['profilerResources']) == t['allocatedLogicalProfilerBufferBytes']
sorted_values = sorted(values)
n = len(values)
median = sorted_values[n//2] if n % 2 else (sorted_values[n//2-1] + sorted_values[n//2])/2
adjacent_overlaps = sum(int(b['startTimestampNs']) < int(a['endTimestampNs']) for a,b in zip(t['samples'],t['samples'][1:]))
submit_sequences = [r['submissions'][0]['observerSubmitSequence'] for r in t['samples']]
submit_order_inversions = sum(b < a for a,b in zip(submit_sequences, submit_sequences[1:]))
print(json.dumps({'timestampVerification': 'PASS', 'rawSha256': hashlib.file_digest(path.open('rb'),'sha256').hexdigest(),
    'bytes': path.stat().st_size, 'sampleCount': n, 'zeroSamples': values.count(0), 'medianNs': median,
    'nearestRankP95Ns': sorted_values[math.ceil(.95*n)-1], 'minNs': min(values), 'maxNs': max(values),
    'timestampDifferenceGridNs': grid, 'durationGridNs': duration_grid,
    'multiDispatchPasses': sum(r['encodedDirectDispatches'] + r['encodedIndirectDispatches'] > 1 for r in t['samples']),
    'adjacentReportedIntervalOverlaps': adjacent_overlaps,
    'submitOrderInversions': submit_order_inversions,
    'crossCommandBufferAdjacentOverlaps': sum(b['commandBufferId'] != a['commandBufferId']
        and int(b['startTimestampNs']) < int(a['endTimestampNs']) for a,b in zip(t['samples'],t['samples'][1:])),
    'note': 'Pass sample distribution only, not repetitions or per-kernel/token latency. Overlaps retained; no sum as end-to-end GPU time.'}, indent=2))
