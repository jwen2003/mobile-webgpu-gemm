# Assignment evidence checklist

Source: supplied webgpu_adreno_assignment.pdf. This checklist tracks evidence, not an estimated completion percentage.

| Requirement | Evidence destination | Status |
|---|---|---|
| Gemma E2B on existing stack or documented closest Gemma | report section 2, model revision and support evidence | Partial: BASELINE001 Gemma 3n E2B Web text runnability accepted on development device; final Adreno validation pending |
| Target Snapdragon Adreno | environment.md, final device export | Pending |
| No Part 1 optimization | pinned baseline code/config | Pending |
| Decode tokens/s, median and p95, at least 5 runs | inference_runs.csv | Pending |
| Prefill 128/512/1024 actual tokens | inference_runs.csv, prompt hashes | Pending |
| Decode per-token distribution | token_latencies.csv | Pending |
| GPU buffers, JS heap, device RSS | memory.csv with sources and scope | Pending |
| Dispatch count per token from command stream | dispatch_samples.csv | Pending |
| Individual kernel timings grouped by op | dispatch_samples.csv, kernel_timings.csv | Pending |
| Stacked breakdown with declared denominator | time_breakdown.csv, figures | Pending |
| Top 2-3 bottlenecks with evidence | bottlenecks.csv, report section 5 | Pending |
| Device, driver, Chrome, thermal methodology | environment.md, sessions.csv | Partial: device screenshots only |
| A naive, B tiled, C vectorized, D fused | variant config, code commits | Pending |
| Real layer shapes, decode M=1 and prefill M>=128 | layer-shape provenance, kernel_comparison.csv | Pending |
| Tile and workgroup sweep | variant config, kernel_samples.csv | Pending |
| GFLOPS, effective GB/s, max absolute error vs FP32 | kernel_comparison.csv, measurement_contract.md | Pending |
| shader-f16 support and fallback | feature JSON, precision-specific results | Pending |
| Warm-up, many iterations, GPU timestamps | raw samples and methodology | Pending |
| Demonstrable target Adreno speedup | matched baseline comparison | Pending |
| Why each variant is faster or slower | experiment records and report section 6 | Pending |
| Reproducible harness, instructions, raw results | code, README, results/raw | Pending |


## Current A/B round: requirement / evidence / remaining gap

| Original requirement | Current evidence | This round / remaining gap |
|---|---|---|
|Part2 real Gemma layer shapes (decode M1,prefill M>=128)|GEMM001–003 are representative; selected real shader chain verified|SHAPE001 NOT_RUN; logical/padded/packed axes still UNKNOWN. GEMM004 gated until reviewed logical shape; one real instance pending|
|Part2 matched custom-kernel comparison,correctness,timestamps|GEMM002/003 actual controlled same-run FP32 results|GEMM004 ready after shape proof,not equivalent original FP16/quantized/fused runtime operator|
|Part2 A/B/C/D,tile sweep,FP16,target Adreno speedup|A naive/B shared-memory and fixed M1 structure implementation|C vectorization/D fused,FP16,sweep and final Adreno remain pending; not added this round|
|Part1 individual kernel/op time table|PROFILE002 structure; PROFILE003 readable2005 pass timestamps|1898 overlaps/cause UNKNOWN; no exclusive op time table. TIMING002 NOT_RUN; multi-dispatch per-kernel attribution gap persists|
|Part1 stacked breakdown/top2–3 bottlenecks and evidence|Valid request wall scopes; no exclusive runtime GPU shares|No additive/ranked timing chart fabricated. Structure table and validity diagnosis delivered; missing copy/CPU/native waits/phase correlation|
|Part1>=5 runs,decode tokens/s/per-token,prefill128/512/1024|Input tokenizer count18; text generation succeeds|True output IDs/count and phase boundaries missing; maxTokens512 inadequate for long inputs; no full benchmark launched|
|Part1 GPU buffers/JS heap/device RSS|PROFILE002 logical allocation trace|Logical bytes not residency;JS heap/RSS/process roles still unmeasured|
|Reproducible methods/raw evidence|Existing immutable JSON,static tests,source hashes|Bounded SHAPE001 then TIMING002 phone steps; all new results NOT_RUN,failed exports supported|

Current B decision3: cause UNKNOWN,model pass intervals do not support cost attribution. A and B proceed independently. No commit/push or historical raw JSON edits.


## TIMING002 actual controlled observation — 2026-10-05 COMPLETE

Raw [TIMING002-2026-10-05T11-36-40-431Z.json](../results/raw/TIMING002-2026-10-05T11-36-40-431Z.json),SHA256 `83ea2722f7f60f08059ab9b5fdad9f6be5f105f532e129038f1f35a1a857f6c4`,preserved byte-for-byte. Reproduce independent Python integer timestamp/statistics/association/hash checks with `python scripts/verify_timing002.py`; derived results in results/analysis/timing002_verified.json. All24 exported online full-output correctness summaries PASS,zero error/nonfinite/max absolute error; raw does not include actual arrays,so offline full-output verification is unavailable. Errors/compilation messages/visibility events empty; all resource ledger entries destroyed. User states no obvious heat (temperature unmeasured),not charging100%,DevTools not open,flag disabled. Independent device enables timestamp-query; adapter arm/gen-5 with empty device/description fields,no inferred GPU model.

|Mode|Positive adjacent overlaps|Overlap min / median / p95 / max (ms)|Pass duration median / p95 (ms)|Classification|
|---|---:|---|---|---|
|one_command_buffer|7/7|13.631488 /31.784960 /50.069504 /50.069504|34.799616 /56.295424|same command buffer,one submit|
|continuous_submits|7/7|9.895936 /25.690112 /40.173568 /40.173568|29.196288 /46.268416|cross submit|
|serial_wait|0/7|N/A|8.519680 /9.633792|cross submit with completion waits|

Every positive overlap exceeds65536ns; none is<=one observed grid. All modes have monotonic nondecreasing starts/ends,no zero-duration samples and independently observed endpoint-difference GCD65536ns. One-command mode has exactly one distinct start timestamp for all eight passes while ends advance; continuous-submit starts cluster while ends advance. Serial-wait gaps range1.179648–5.439488ms. Raw associations and signed gaps retained; do not reorder/clip/delete intervals. Median uses midpoint of sorted central values,p95 nearest-rank ceil(.95*n);these eight dependent sequential passes are not independent benchmark repeats or throughput/speedup evidence.

Source review src/benchmark/timestamp_control.js: mode-local querySet16,indices2*j/2*j+1; each measured pass32 ping-pong dispatches with real buffer dependencies,post-pass output copy outside interval; unique command buffers submitted once; final resolve/copy is a separate last submission after all timestamp writes (lines63–74). Maps only after final completion,serial mode additionally waits each pass. No model instrumentation involved. Native-mock control checks and actual query IDs support no reuse; hardware/platform reason remains UNKNOWN.

**Bounded conclusion:** overlap is independently reproduced outside MediaPipe with unique slots and dependent arithmetic,including one command buffer. It cannot be explained solely by a<=65.536us rounding overlap,and it is not specific to the PROFILE003 model observer. This does not prove actual dependent arithmetic ran concurrently or identify the phone backend/driver timestamp-stage cause. Serial waiting removes observed overlap here but changes scheduling/execution conditions; it cannot replace stock model timing. Prior Dawn timestamp-stage evidence remains a hypothesis,not confirmed platform causality. Decision3 remains: current model pass intervals do not support exclusive per-kernel ranking or an additive breakdown. Report submitted structure/classification plus NOT_MEASURED costs; mixed passes stay MIXED. No pass-duration sum as end-to-end GPU time,no difference-of-endpoints attribution,no batch/32 kernel latency,no physical busy-time claim. TIMING002 acceptance completed; no further identical phone rerun or expanded profiler required for this bounded diagnostic. Standalone serial GEMM measurements retain their distinct stated boundaries and resolution checks.
