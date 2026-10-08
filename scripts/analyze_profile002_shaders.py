"""Reproducible conservative source classification, using submitted GENERATION calls."""
import collections
import csv
import hashlib
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
RAW = ROOT / 'results/raw/PROFILE002-2026-10-04T15-53-13-603Z.json'
d = json.loads(RAW.read_text(encoding='utf-8'))
o = d['observer']
assert o['status'] == 'COMPLETE' and o['droppedEvents'] == 0
identities = {x['id']: x for x in o['identities']}
passes, commands = {}, {}
encoded, submitted = collections.Counter(), collections.Counter()
submission_records = []
for e in o['events']:
    if e['type'] == 'create_pass': passes[e['id']] = []
    elif e['type'] in ('dispatchWorkgroups', 'dispatchWorkgroupsIndirect'):
        passes[e['passId']].append(e)
        if e['phase'] == 'GENERATION': encoded[e['pipelineId']] += 1
    elif e['type'] == 'create_commandBuffer': commands[e['id']] = e['passIds']
    elif e['type'] == 'queue.submit' and e['phase'] == 'GENERATION':
        for command_id in e['commandIds']:
            for pass_id in commands[command_id]:
                events = passes[pass_id]
                for dispatch in events: submitted[dispatch['pipelineId']] += 1
                submission_records.append({'submitSequence': e['sequence'], 'commandBufferId': command_id,
                    'passId': pass_id, 'dispatchCount': len(events),
                    'pipelineCounts': dict(collections.Counter(x['pipelineId'] for x in events))})
by_shader = collections.defaultdict(list)
for pipeline_id, count in submitted.items():
    p = identities[pipeline_id]
    by_shader[p['shaderId']].append({'pipelineId': pipeline_id, 'entryPoint': p['entryPoint'],
        'encodedDispatches': encoded[pipeline_id], 'submittedDispatches': count})
out = ROOT / 'results/analysis/profile002'
out.mkdir(parents=True, exist_ok=True)
(out / 'shaders').mkdir(exist_ok=True)

def classify(source):
    lines = source.splitlines()
    labels, proofs = [], []
    def add(label, pattern, confidence):
        matches = [(i + 1, l.strip()) for i, l in enumerate(lines) if re.search(pattern, l)]
        if matches:
            labels.append({'label': label, 'confidence': confidence})
            proofs.extend({'label': label, 'line': n, 'text': l} for n, l in matches[:3])
    # Semantic candidates are explicitly weaker than directly visible arithmetic facts.
    if 'weights' in source and (re.search(r'fma\(vec4<f16>\(v\d\.', source)
                               or re.search(r'r_w\w+\s*\+=\s*f\d+\s*\*', source)):
        add('MATMUL_OR_GEMV', r'fma\(vec4<f16>\(v\d\.|r_w\w+\s*\+=\s*f\d+\s*\*', 'HIGH arithmetic / UNKNOWN model M,N,K')
    if re.search(r'&\s*15u', source) and 'weights' in source:
        add('Q4_UNPACK', r'&\s*15u', 'HIGH')
        if re.search(r'weight_scale|weights_scale|zero_point|\bscale\b', source):
            add('DEQUANTIZATION', r'weight_bias\s*:|fma\(w\d, weight_scale|scale\s*=|zero_point\s*=', 'MEDIUM reconstruction / block format UNKNOWN')
    if 'inverseSqrt(mean_sq' in source and 't * stddev_inv' in source:
        add('RMS_NORMALIZATION', r'inverseSqrt\(mean_sq|t \* stddev_inv', 'HIGH arithmetic')
    if 'src_exp' in source and 'weights' in source and 'exp(' in source:
        add('ATTENTION_WEIGHTED_SUM_CANDIDATE', r'exp\(src_w|r_w\w+\s*\+=', 'MEDIUM semantic role')
    elif 'exp(' in source and 'maximum' in source and ('sum +=' in source or 'inv_sum' in source):
        add('SOFTMAX_REDUCTION_ATTENTION_CANDIDATE', r'exp\(src|inv_sum|sum \+= dot', 'HIGH softmax arithmetic / MEDIUM attention role')
    if 'cache_k_buffer.data[' in source or 'cache_v_buffer.data[' in source:
        add('KV_CACHE_WRITE_DATA_MOVEMENT', r'cache_[kv]_buffer\.data\[', 'HIGH writes / MEDIUM cache semantics')
    if not labels and re.search(r'(tanh|sin|cos)\(|result_final\s*=\s*result\s*[+*]', source):
        add('ELEMENTWISE', r'(tanh|sin|cos)\(|result_final\s*=\s*result\s*[+*]', 'MEDIUM; possible fused semantics UNKNOWN')
    if not labels:
        labels = [{'label': 'UNKNOWN', 'confidence': 'UNKNOWN'}]
        proofs = [{'label': 'UNKNOWN', 'line': next((i+1 for i,l in enumerate(lines) if 'fn main' in l), 1),
                   'text': 'No conservative rule established an operator class; manual review needed.'}]
    return labels, proofs

rows = []
for shader_id, pipelines in by_shader.items():
    s = identities[shader_id]; source = s['source']; digest = hashlib.sha256(source.encode()).hexdigest()
    assert digest == s['sha256']
    (out / 'shaders' / f'{digest}.wgsl').write_text(source, encoding='utf-8', newline='')
    labels, proof = classify(source)
    facts = {
        'workgroupSizeExpression': re.search(r'@workgroup_size\(([^)]+)\)', source).group(1),
        'actualOverrideConstants': 'UNKNOWN: PROFILE002 did not record pipeline.constants',
        'shapeMNK': 'UNKNOWN: uniform values, bind groups, texture extents and updates not captured',
        'uniformDimensionExpressions': sorted(set(re.findall(r'U\.[if]\d\.[xyzw]', source))),
        'declaredDtypes': sorted(set(re.findall(r'\b(?:f16|f32|i32|u32|rgba\w+)\b', source))),
        'layoutEvidence': [l.strip() for l in source.splitlines() if 'data: array<' in l or 'var<workgroup>' in l
            or re.search(r'linear_i4o4\s*:|textureStore\(dst|weights_buffer.data\[', l)][:8],
        'tilingEvidence': [l.strip() for l in source.splitlines() if re.search(r'var<workgroup>|src_s \+= \d+|DST_S \*= \d+|var s\d+ : vec4', l)][:12],
        'layoutCaveat': 'Only declarations/symbolic indexing; no inferred row-major global matrix layout or model dimensions',
    }
    rows.append({'shaderId': shader_id, 'sha256': digest, 'entryPoints': sorted(set(p['entryPoint'] or 'UNKNOWN' for p in pipelines)),
        'encodedDispatches': sum(p['encodedDispatches'] for p in pipelines),
        'submittedDispatches': sum(p['submittedDispatches'] for p in pipelines),
        'pipelineIdentities': pipelines, 'labels': labels, 'sourceEvidence': proof, 'facts': facts,
        'sourceFile': f'shaders/{digest}.wgsl'})
assert len(rows) == 180 and sum(r['submittedDispatches'] for r in rows) == 126402
rows.sort(key=lambda r: (-r['submittedDispatches'], r['shaderId']))
summary = {'sourceRaw': str(RAW.relative_to(ROOT)), 'sourceSha256': hashlib.file_digest(RAW.open('rb'),'sha256').hexdigest(),
    'shaderIdentities': len(rows), 'uniqueSourceHashes': len({r['sha256'] for r in rows}),
    'pipelineIdentities': len(submitted), 'encodedDispatches': sum(encoded.values()),
    'submittedDispatches': sum(submitted.values()), 'submittedPassOccurrences': len(submission_records),
    'passesWithMultipleDispatches': sum(p['dispatchCount'] > 1 for p in submission_records),
    'maximumDispatchesPerPass': max(p['dispatchCount'] for p in submission_records),
    'unknownShaderIdentities': sum(r['labels'][0]['label'] == 'UNKNOWN' for r in rows)}
(out / 'shader_classification.json').write_text(json.dumps({'summary': summary, 'shaders': rows,
    'submittedPasses': submission_records}, indent=2), encoding='utf-8')
with (out / 'shader_classification.csv').open('w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f); writer.writerow(['shaderId','sha256','entryPoint','encodedDispatches','submittedDispatches','labels','confidence','sourceEvidence','shape','workgroupSize'])
    for r in rows: writer.writerow([r['shaderId'], r['sha256'], ','.join(r['entryPoints']),r['encodedDispatches'],r['submittedDispatches'],
        ';'.join(x['label'] for x in r['labels']), ';'.join(x['confidence'] for x in r['labels']),
        ';'.join(f"L{x['line']}: {x['text']}" for x in r['sourceEvidence']), r['facts']['shapeMNK'],r['facts']['workgroupSizeExpression']])
doc = ['# PROFILE002 submitted-shader analysis', '',
    'Source: [complete raw phone record](../results/raw/PROFILE002-2026-10-04T15-53-13-603Z.json). '
    'Derived artifacts do not alter that file. Reproduce with `python scripts/verify_profile002_result.py results/raw/PROFILE002-2026-10-04T15-53-13-603Z.json` then `python scripts/analyze_profile002_shaders.py`.', '',
    '## Scope and reconstructed command associations', '',
    f"GENERATION has {summary['encodedDispatches']} encoded dispatches and {summary['submittedDispatches']} dispatch occurrences in submitted command buffers, "
    f"{len(submitted)} pipeline identities, 180 shader identities ({summary['uniqueSourceHashes']} unique source hashes), "
    f"{len(submission_records)} submitted pass occurrences; {summary['passesWithMultipleDispatches']} contain multiple dispatches, maximum {summary['maximumDispatchesPerPass']}.", '',
    'Reconstruction replays queue.submit -> command-buffer ID -> pass IDs -> ordered dispatch calls -> current pipeline -> shader ID. '
    'Each submission counts again even when a command buffer identity repeats. Encoding alone is not submission, and native submit is not independent proof of hardware execution. '
    'Identity count is distinct from invocation count. EntryPoint is the exported descriptor field; actual override constants were not captured.', '',
    '## Classification and evidence limits', '',
    'Rules conservatively inspect actual WGSL arithmetic, not hash names or dispatch frequency. HIGH applies to visible arithmetic, not inferred model-layer semantics. '
    'Attention labels are candidates unless graph semantics are separately demonstrated. Fused shaders retain multiple labels; these labels overlap and cannot be summed as independent time shares. '
    f"{summary['unknownShaderIdentities']} identities remain UNKNOWN. Generic Pack/Unpack4x16float helper definitions alone are not Q4 dequantization evidence.", '',
    '[Machine-readable table and all extracted facts](../results/analysis/profile002/shader_classification.json); '
    '[CSV table](../results/analysis/profile002/shader_classification.csv). Each source below is an exact hash-verified export; line numbers refer to it.', '',
    'Shape M/N/K and actual workgroup override values remain UNKNOWN: uniform contents, texture extents, bind-group offsets and pipeline.constants were not captured. '
    'The JSON records symbolic U expressions, declared storage/arithmetic types, workgroup array declarations, indexing and literal tiling evidence. '
    'vec4 or mat4x4 packing and fixed unrolled accumulator counts are local code facts, not proof of global model dimensions. '
    'enable f16 is capability use; explicit vec4<f16> accumulators/FMA provide stronger source-level arithmetic evidence, without proving compiler instruction choice.', '',
    '## Candidates for the next measurements', '',
    '- Weight product/reduction shaders: e.g. shader-2630 has mat4x4<f16> weights, vec4<f16> accumulators and FMA across src_s, plus workgroup reduction. Measure pass scope first; M=1 versus batched M requires runtime dimension evidence.',
    '- Fused Q4 unpack + weight products: shader-2658 / shader-2660 mask with 15u, shift packed u32 nibbles, apply weight scale/bias, then accumulate products. Compare fused pass behavior only after timestamps; no current evidence establishes dequantization cost or a bottleneck.',
    '- RMS normalization: shader-2644 / shader-3175 reduce squared values, inverseSqrt(mean_sq + epsilon), then scale normalized results; source shows fusion with elementwise scale.',
    '- Softmax/attention candidates: shader-2654 uses stable maximum/exp/sum reduction; shader-1227 combines exponent normalization and weighted accumulation. Semantic attention attribution needs graph/shape confirmation.',
    '- KV writes and UNKNOWN data transformations: shader-2734 writes cache_k/cache_v with symbolic packed indexing; inspect data-movement candidates and unresolved arithmetic before assigning a whole-pass category.', '',
    'Dispatch counts prioritize inspection only. There is no GPU time, top bottleneck ranking, peak bandwidth/compute claim or per-token denominator here. '
    'PROFILE003 will measure entire passes; a pass mixing classes remains mixed, without splitting or duplicating duration. '
    'Even a single-dispatch pass includes pass scheduling costs. The assignment still requires actual output token instrumentation, phase boundaries, dimensions, memory channels and >=5 controlled repetitions; this analysis/pilot is not the completed Part 1 report.', '',
    '## All 180 shader identities', '',
    '| Shader identity / SHA256 | EntryPoint | Encoded / submitted dispatches | Labels | Confidence | Source evidence |',
    '|---|---|---:|---|---|---|']
for r in rows:
    link = f"../results/analysis/profile002/{r['sourceFile']}"
    labels = '<br>'.join(x['label'] for x in r['labels'])
    confidence = '<br>'.join(x['confidence'] for x in r['labels'])
    evidence = '<br>'.join(f"L{x['line']}: `{x['text'].replace('|', '&#124;')[:150]}`" for x in r['sourceEvidence'])
    doc.append(f"| [{r['shaderId']}]({link})<br>`{r['sha256']}` | {','.join(r['entryPoints'])} | {r['encodedDispatches']} / {r['submittedDispatches']} | {labels} | {confidence} | {evidence} |")
# Publish bilingual presentation, preserving the legacy navigation page.
from render_bilingual_docs import main as render_documentation
render_documentation()
print(json.dumps(summary,indent=2))
