# Mobile WebGPU LLM inference and GEMM performance report

## Current verified archive — 2026-10-05

Q4 FP16 A-D representative-shape comparison is verified;the assignment as a whole is not complete. Later dated actual-result sections supersede earlier chronological NOT_RUN/planning entries,which are retained as experiment history.

D kernel-only GPU pass is slower than C at both M1 and M128(K=N1024). In the separately sampled complete path,ABC repeat CPU dequantization,C layout conversion and necessary converted-weight uploads each sample;D is clearly faster in that explicitly single-use scenario. Those ratios do not apply to already preprocessed/reused weights and do not demonstrate model acceleration. No CPU/GPU time sum is labeled GPU time.

In the latest A-D run,M1 A median1114112ns minus C1048576ns equals65536ns (one observed65.536us grid). Do not claim a stable small A-to-C benefit from this single run;the median comparison alone is insufficient,despite each duration passing the existing absolute-duration resolution criterion.

Large configurations rely on online full-output checks;independent offline output replay covers exported small cases (6116 A-D values),plus timestamp/order/statistics and exported worst-reference records. Large complete actual arrays were not exported. Preserve that scope distinction. Q8 phone measurements,tile/WG sweep,independent repeats,valid logical Gemma shapes,target Adreno and Part1 token/phase/memory/credible kernel breakdown requirements remain unmet or partial;see the requirement matrix.


Current review (2026-10-05): GEMM004 is ready as an execution/padded-shape supplement M8,K1536,N2048,phone NOT_RUN;valid logical layer shape remains unproved. See [proof](../docs/gemm004_shape_proof.md) and [assignment audit](../docs/assignment_requirements_matrix.md). Part1 has a verified timestamp-validity limitation and structure evidence,not an exclusive per-kernel time table/stacked breakdown. Prior dated entries below retain historical statuses.

Status: evidence scaffold. No performance conclusions yet. Development device is Mali; required final target is Adreno.

The first actual Android FP32 compute smoke test (COMPUTE001) passed: 1025 vector-add outputs matched an independently recomputed CPU reference exactly, with max absolute error 0. This validates the project's basic compute/readback path; it provides no performance or target Adreno result.

## 1 Executive summary

Complete after measurements: workload, dominant observed cost, strongest validated intervention, matched speedup and material limitations. Do not report hoped-for outcomes.

## 2 Experimental setup

Device and driver evidence from docs/environment.md. Add final target, runtime commit, model/revision, quantization, layer-shape provenance, browser flags and thermal conditions.

COMPUTE001 ran on phone Chrome at `http://localhost:8000/src/benchmark/` through Windows HTTP serving and USB adb reverse. Its export reports secureContext true, adapter vendor `arm`, architecture `gen-5`, and empty device/description fields. No specific GPU model is inferred from those fields. See [environment limits table](../docs/environment.md#compute001-exported-adapter-and-device-evidence): adapter/device buffer limits were 4294967292/268435456 bytes and storage binding limits 2147483644/134217728 bytes; workgroup invocation limits were 1024/256. The complete comparison includes storage bindings, workgroup storage and per-axis limits. Actual device features contained only `core-features-and-limits`; optional requested features were empty.

## 3 Methodology

Use docs/measurement_contract.md. State timing boundaries, instrumentation, warm-up, independent runs, sample counts, median/p95 method, correctness reference, precision and memory scope. Include instrumentation limitations.

COMPUTE001 correctness method: FP32 C[i]=A[i]+B[i], A[i]=(i%31)-15, B[i]=((i*7)%23)-11, N=1025, workgroup_size(64), 17 workgroups and an explicit bounds guard. Small integer inputs and sums are exactly representable. Independently recomputing all inputs and sums from these formulas verified every actual readback value and the exported expected array, without relying on its PASS label. All 1025 elements were correct, max absolute error 0, erroneous elements 0, non-finite count 0; index 1024 was -10. Compilation messages and GPU error records were empty. The [original JSON](../results/raw/COMPUTE001-2026-10-04T10-53-11-629Z.json) is preserved unchanged.

No performance measurement was made. The ISO timestamps identify capture/run events and are not GPU kernel timing evidence; no duration, throughput or speedup is derived from them. Adapter support for `timestamp-query` and `shader-f16` was reported, but neither was enabled or actually verified in this run. No device loss was recorded before export; loss recovery was not tested.

### TIMING001 compute timestamp validation

Two actual Android runs explicitly requested and enabled timestamp-query, wrote timestamps at compute-pass begin/end, and resolved/copied/mapped the results. Both device feature lists contain timestamp-query. Each run covers N=1025/65536/1048576 with 1/32 dispatches per pass, fixed-seed shuffled configuration blocks, 10 excluded warm-up passes and 30 measured passes per block. All correctness summaries report PASS with zero errors/non-finite values; compilation and GPU error arrays are empty. The exports contain correctness summaries, not full output arrays for an independent offline element-by-element check. See [run 1](../results/raw/TIMING001-2026-10-04T11-25-41-874Z.json) and [run 2](../results/raw/TIMING001-2026-10-04T11-39-21-730Z.json).

All 240 timestamp deltas per run were independently recomputed from decimal endpoint strings using integer subtraction. Measured-only median, nearest-rank p95 (29th of 30), min/max and zero counts matched the exported summaries. GPU pass intervals exclude resolve/copy/readback but may include pass scheduling. The separate submit-to-completion wall interval includes the submitted resolve/copies and excludes mapping/CPU checking. ISO timestamps are event identifiers, not kernel durations.

GPU compute-pass duration (milliseconds; runs kept separate):

| N | Dispatches/pass | Run 1 median | Run 1 p95 | Run 2 median | Run 2 p95 | Zero count R1 / R2 |
|---:|---:|---:|---:|---:|---:|---:|
| 1025 | 1 | 0.065536 | 3.145728 | 0.065536 | 0.655360 | 6 / 6 |
| 1025 | 32 | 0.327680 | 3.211264 | 0.327680 | 0.393216 | 0 / 0 |
| 65536 | 1 | 0.065536 | 2.490368 | 0.065536 | 0.196608 | 0 / 0 |
| 65536 | 32 | 2.523136 | 6.160384 | 2.457600 | 3.670016 | 0 / 0 |
| 1048576 | 1 | 1.114112 | 4.259840 | 1.114112 | 1.900544 | 0 / 0 |
| 1048576 | 32 | 9.404416 | 12.320768 | 10.125312 | 11.206656 | 0 / 0 |

Separately in each run, raw timestamps, consecutive unique timestamp spacings and pass-duration deltas have GCD 65536 ns: an observed 65.536 microsecond grid. All endpoints/deltas are multiples of this grid; even-count median averaging can yield half-grid values. This is empirical granularity of these records, not an established physical timer resolution or a universal browser rule. The smallest single-dispatch configuration has 6/30 measured zeros in both runs; zeros do not mean no GPU work.

Every run-2 GPU-pass p95 is lower, but not every median falls. DevTools state was not recorded in either original JSON; no controlled comparison or causal attribution to DevTools is possible. Manual conditions in both files report no noticeable warmth (temperature unmeasured), not charging at 100%, and the developer flag disabled; neither file records background entry. Preserve all zero and long-tail samples and the two original files; do not combine them into one statistical population. Repeated 32-dispatch passes overwrite the same output and may involve cache and resource dependencies. Their pass duration is not converted into independent single-kernel latency. No strict workload-time monotonicity, bottleneck, peak bandwidth or GEMM benchmark conclusion is claimed. shader-f16 remains unverified.

### BASELINE001 runnability and PROFILE001 observability

The [actual BASELINE001 export](../results/raw/BASELINE001-2026-10-04T14-11-39-378Z.json) passed runnability acceptance: initialization succeeded; one generateResponse completed with done=true and nonempty text; errors were empty. It used unmodified @mediapipe/tasks-genai 0.10.29 and the exact Gemma 3n E2B Web model. This does not establish numerical correctness, formal Part 1 metric completion or target Adreno acceptance.

Resource preparation wall time was 58.200 ms, initialization 91756.600 ms, request-to-generation-completion 6037.900 ms, and request-to-first-callback 634.400 ms (rounded display of raw values). Initialization contained a recorded hidden/visible interval from 14:09:52.312Z to 14:09:59.498Z on 2026-10-04, approximately 7.186 seconds; it is preserved, not subtracted. Generation had no recorded visibility transitions. Loading is outside request timing. The 18 streaming callbacks are text-delivery events, not 18 generated tokens; first callback is not pure prefill and these wall metrics are not GPU kernel durations.

Desktop model size 3038117888 bytes and SHA256 `b6c8e1081ec80730f14473a5ece941b48da5d8e2a80c97c2963da153f3eff3d2` are storage/identity evidence, not memory usage. Served size matched the desktop manifest; publisher hash comparison and browser rehash were not performed. Actual input/output token counts, tokens/s, pure prefill/per-token timing, GPU kernel time and GPU memory remain NOT_MEASURED. Backend remains UNKNOWN. The actual supplied runtime device enabled shader-f16/subgroups but not timestamp-query; this is distinct from independent adapter probing and TIMING001's device.

[PROFILE001 source audit](../docs/profiling_capabilities.md) finds an idle-only public sizeInTokens input-count API but no original generated-token IDs/count, per-token decode step, pure prefill boundary or public KV-reset API. Current text graph cache reuse needs verification. Public compatible-device injection can add timestamp-query while retaining stock features/limits; loader-level native-call observation could log shader/pipeline/pass/dispatch/submit and logical buffer lifecycle metadata. No such instrumentation was executed here. Multi-dispatch pass time cannot be assigned to individual kernels, and logical buffer sizes do not establish physical GPU residency. Input-plus-output maxTokens=512 is insufficient for a 1024-token complete prompt; a separately validated larger capacity and true phase/token evidence are required before full profiling.

## 4 Baseline profiling

Table: prompt tokens, prefill median/p95, decode tokens/s median/p95, token-latency distribution, memory, dispatch count. Include grouped per-kernel table and stacked decode breakdown. State whether denominator is GPU sum or token wall time; label residual separately.

## 5 Bottleneck analysis

For each top 2-3 kernels: observation, hypothesis, competing explanation, evidence, classification and confidence. Unsupported counter claims remain unresolved. Include roofline only with defensible traffic model and ceilings.

## 6 Kernel optimization experiments

### GEMM001 naive FP32 starting baseline (one actual run)

[Actual JSON](../results/raw/GEMM001-2026-10-05T04-20-24-462Z.json) reports all ten initial shape/family tests and 80 subsequent warm-up/measured checks PASS, zero nonfinite outputs and no runtime/compilation errors. Integer outputs are exact; maximum fractional absolute error5.648095819665855e-5, under fixed atol0.002/rtol0.0002. CPU binary64 reference, signed seeded inputs, 8x8 workgroup and row-major FP32 contract are documented in experiment_log. Independent replay verifies timings/statistics/order/hash and every exported worst-element reference; full GPU output arrays are not exported, limiting offline reconstruction of all-output error metrics.

| Representative M,K,N | pass median ms | p95 ms | zeros / measured | effective nominal GFLOP/s |
|---|---:|---:|---|---:|
| 128,1024,1024 | 10.518528 | 11.665408 | 0 / 30 | 25.520249 |
| 1,1024,1024 | 2.359296 | 2.424832 | 0 / 30 | 0.888889 |

Each block has10 warm-ups plus30 measured one-dispatch passes; setup/reference outside loops, full output readback/CPU validation outside GPU interval, serial completion between submissions. Prior/observed grid65.536 microseconds persists. Both blocks are PRELIMINARY rather than RESOLUTION_LIMITED under the predefined rule; median midpoint arithmetic can yield fractions of a grid step without improving physical resolution. All raw samples remain retained. Effective GFLOP/s uses nominal2*M*N*K divided by compute-pass median, which includes pass costs; no pure arithmetic/peak utilization claim. Conditions include charging99%, subjective no noticeable heat with no temperature measurement, DevTools/flag manually off, and no background events.

These are representative shapes because actual runtime M/N/K remain UNKNOWN. The runtime example uses packed FP16 vector products/reduction; this dense FP32 standalone baseline is not its equivalent replacement. No model speedup, bottleneck diagnosis, matched optimization comparison or five-run confidence follows. Original target Adreno requirements remain distinct from this Arm-adapter development record.

A naive; B workgroup-memory tiling; C vectorized loads; D fused dequantization. Each variant: motivation, exact configuration, correctness, measured result and explanation. Include tile/WG sweep, matched comparisons, negative results and fusion pipeline scope. Distinguish custom naive baseline from existing runtime baseline.

### GEMM002 matched naive/shared-memory methodology — first actual run

GEMM002 compares fixed naive8×8 with shared-memory16×16 on representative M=1 and M=128,K=N=1024 in one page/device. Both have the same row-major FP32 contract, signed seeded inputs, binary64 independent reference and unchanged acceptance thresholds; no fused operators or precision changes. Shared A/B/uniform, independent outputs/readbacks with identical usage, pipeline/reference/allocation/upload outside sampling loops. Tiled source uses256 invocations,2048 shared bytes, zero-padded tile loads and two uniform barriers per K tile; no out-of-range lane returns before barriers. Required limits are checked with no alternative tile. Initial scalar/rectangular/MNK-tail cases plus performance shapes verify both input families, both variants and their full-array cross-comparison before timing.

Each shape:10 warm-ups per variant, then30 paired single-dispatch rounds, exactly15 naive-first and15 tiled-first under fixed shuffled seeds; shape order seeded separately. Export every sample/order, GPU timestamp pair/difference, submit-to-completion wall and outside-timing full-output validation. Serial completion/readback occurs before the next submission. GPU timestamps enclose only compute pass; queue wall additionally includes resolve/copy but excludes map/CPU validation. Query reuse waits for completed map/unmap. Prior65.536us grid is rechecked, preserving all zeros and tails. Measured median/nearest-rank p95/min/max/zeros use the shared GEMM001 statistics.

Primary speedup is same-run naive median divided by tiled median, never the historical GEMM001 baseline. Paired-duration ratios are a different estimator and explicitly labeled. Incomplete/failing sets, measured zeros or median<10×max(prior grid,observed GCD) suppress ratios. A M1 slowdown is valid; source facts about shared tiles/barriers are separate from hypotheses about unused lanes, cache, reuse or scheduling. No nominal-memory-access-to-DRAM inference, hardware bottleneck, model acceleration or Adreno benefit follows. This fixed-tile pilot introduces no vectorization/register tiling/FP16/autotuning; runtime timestamp-overlap diagnostics are outside this experiment.

Acceptance and reproduction are in README/experiment_log. Export includes shader sources/hashes, adapter/device limits/features, input/threshold definitions, planned/actual orders, resource cleanup, errors and manual thermal/charging/DevTools/flag/visibility conditions. Computer static/CPU/fake-native checks are separate from phone evidence.

First [actual run](../results/raw/GEMM002-2026-10-05T04-58-16-647Z.json) COMPLETE: all24 initial variant,12 cross,160 sample and80 paired checks PASS, zero nonfinite/violations/errors, empty compilation messages and recorded resource cleanup. Independent replay verifies timestamps/statistics/order/hash and seeded worst-reference values; absent full output arrays prevent offline replay of all-output error maxima/counts.

|Representative M,K,N|naive median / p95 ms|tiled median / p95 ms|same-run median speedup|
|---|---|---|---:|
|128,1024,1024|12.189696 / 13.828096|7.405568 / 8.323072|1.646018×|
|1,1024,1024|2.359296 / 2.359296|5.341184 / 5.373952|0.441718×|

All four measured sets retain30 samples, zero zero-duration samples and65536ns observed grid, satisfying the predefined PRELIMINARY rule. M1 tiled time is2.264× naive. Paired-ratio median/p95 are respectively1.669995/1.859649 and0.439024/0.444444, a distinct statistic. M128 improvement and M1 regression are measured observations in one controlled run; unused tile rows, cooperative loading/barriers and reuse/cache/scheduling are unverified explanations. Conditions: manual no noticeable heat/temperature unmeasured, not charging at100%, DevTools off/flag disabled, no background transitions. Adapter arm/gen-5, empty exact-device fields; do not infer Adreno/model benefit or repeated-run confidence.

### GEMM003 M=1 structure pilot — first actual run COMPLETE

Actual first phone record **COMPLETE**, preliminary acceptance met. [Original JSON](../results/raw/GEMM003-2026-10-05T10-00-55-452Z.json),781873 bytes,SHA256 `95cb1119984fe39993a405767719bad83b51e5dce1c5e2d7462e086721ac38e2`. All30 initial variant and30 initial pair checks PASS,120 sampling output checks and120 round pair checks PASS; nonfinite/threshold violations zero, errors and shader compilation messages empty; tracked resources recorded destroyed. Independent `scripts/verify_gemm003_result.py` regenerates seeded inputs and checks all564 small-case output elements against independent CPU reference, verifies exported absolute/relative maxima, shader hashes, all timestamps/statistics and six permutations5 each. Performance full output arrays are not exported: those all-output summaries remain client evidence, supplemented by independent seeded worst-reference checks.

|M=1,K=N=1024 variant|GPU pass median ms|nearest-rank p95 ms|min / max ms|zeros / measured|
|---|---:|---:|---|---|
|naive|2.719744|2.818048|2.162688 / 2.818048|0 / 30|
|tiled16×16|5.341184|5.373952|5.308416 / 5.439488|0 / 30|
|specialized64×1|1.638400|1.769472|1.310720 / 1.769472|0 / 30|

Same-run median ratios: naive/specialized **1.66×**, tiled/specialized **3.26×**, naive/tiled **0.509202454×**. Historical GEMM001/002 medians are excluded. All three measured sets have observed timestamp-difference GCD65536ns and meet the predefined PRELIMINARY resolution rule; zeros/tails retained. This one-run structure comparison changes workgroup shape,A loading and invalid-row work jointly; it does not isolate barrier/reuse/parallelism costs, measure DRAM traffic, establish model acceleration or predict Adreno benefit. Real model M/N/K remain UNKNOWN.

Manual conditions: 未明显发热，温度未测量; 未充电：电量100%; DevTools未开启; flag已停用. Initially visible,no transitions/background. Full environment/limits retained in raw JSON; manual fields are not independent thermal/flag measurements. No commit/push.


GEMM002's M1 tiled regression motivates a fixed64×1 specialized kernel versus original naive and tiled in one run. It shares64 A elements/256 bytes per workgroup,one adjacent output column per lane,two uniform barriers per K block. Invalid columns still load/synchronize but skip B reads/arithmetic/stores; explicit K/N guards handle64 tails. Only M=1 supported. Primary M=1,K=N=1024; correctness also covers1/1,5/7,17/19,65/67 with both fixed seeded input families and unchanged CPU reference/tolerances. Small cases export complete inputs/outputs for offline reconstruction. These are representative configurations, not recovered model dimensions.

Same device/shared A/B/independent C,setup outside loops;10 warm-ups/version and30 rounds of three single-dispatch passes. Six order permutations5 each,fixed seeded shuffle. Serial completion/full validation and readback boundaries match GEMM002 through a common controller/executor. Preserve120 samples,zeros/tails,raw timestamps and measured-only median/nearest-rank p95/min/max/grid. Same-run median ratios naive/specialized,tiled/specialized,naive/tiled exclude historical denominators and suppress invalid/resolution-limited ratios. This is a structure comparison changing workgroup shape,A loading and invalid rows together,not isolation of barrier/reuse/parallelism costs. No hardware bottleneck,DRAM traffic,model or Adreno benefit claimed before evidence. Phone result **COMPLETE** in the supplied first run.

The [real shape evidence table](../docs/model_shape_recovery.md) reviews shader-2630/pipeline-2631/main and three actual submitted occurrences,source hash and FMA/packed-layout expressions. U.i0.x bounds output slices and weight-block stride;U.i0.z bounds source slices;U.i0.y gates stores;numeric values and valid tensor axes/padding are absent. Global M/N/K UNKNOWN,no real shape added. Uniform bytes/update provenance,bind-group/dynamic offsets,texture extents/views and pipeline constants are proposed for bounded follow-up; no profiler expansion/model phone experiment this round. Shape-identical FP32 rewriting would still differ from runtime FP16/packed arithmetic.

## 7 Decode GEMV and prefill GEMM

Contrast real-layer M=1 and M>=128 results. Test reuse, synchronization, memory access and parallelism hypotheses. Do not transfer a GEMM explanation to GEMV without evidence.

## 8 Limitations and next experiments

Device mismatch, unsupported features, missing counters, precision fallback, memory visibility, timing granularity, thermal drift and generalization. State what each limitation prevents concluding. Separate Mali development findings from Adreno final findings.

## Appendix Reproduction

Exact code/runtime/model revisions, execution instructions, prompt/seed/config files and raw data paths. Tables link run IDs to raw samples. Final PDF target approximately 8-12 pages once evidence exists; do not pad the scaffold into a PDF now.


## Current A/B evidence update — no new phone results

Part2 real-shape comparison is not yet fulfilled: prior GEMM001–003 shapes are representative. [Model shape evidence table](../docs/model_shape_recovery.md) retains logical/padded/packed M/N/K and batch/head UNKNOWN,with actual source/pipeline/submit chain. SHAPE001 now captures bounded selected parameter versions and texture/binding/override metadata in one stock-model generation; NOT_RUN. GEMM004 is prepared/gated until reviewed logical axes,padding and row-major conversion are established. It will compare existing kernels at one real shape with synthetic FP32 inputs,not original quantized/fused tensors. No new algorithms or performance claims.

Part1 timing decision3: PROFILE003 overlap cause UNKNOWN;valid exclusive op ranking/additive breakdown unavailable. [Timestamp audit/control](../docs/timestamp_validity.md) documents1898 cross-submit positive overlaps,min0.327680ms,median27.459584ms,p9556.360960ms,max100.073472ms,zero overlaps<=65.536us,start/end monotonic,unique query pairs,no repeated timed submits and consistent126402 dispatch associations. Units and resolve/read ordering audit found no explicit collector bug;backend-stage placement is an official-source hypothesis,not verified phone cause. TIMING002 independent dependency control NOT_RUN,comparing one-buffer/continuous-submits/serial-waits without per-pass maps or query reuse.

Only a submitted pass **structure** table is currently defensible:2005 passes/126402 dispatches,109 UNKNOWN,1895 MIXED,1 KV_CACHE_WRITE_DATA_MOVEMENT. Fused labels not split or double counted. Whole-pass mixed intervals cannot become per-kernel timings by averaging;time remains NOT_MEASURED_VALID. Copy/CPU/native wait/other phases lack exclusive coverage. No sum/union labeled physical busy time or end-to-end GPU time,or fabricated stacked chart. Minimal alternatives are a validated single-dispatch/single-category subset,clearly scoped real-shape replay,or bounded backend-correlated Chrome/Dawn/Perfetto trace if available. Actual generated-token and pure phase metrics,>=5 runs,memory channels and final Adreno validation remain missing;see [requirement/evidence/gap matrix](../docs/requirements.md).


## SHAPE001 actual run 2026-10-05 — INCOMPLETE and bounded fix

Raw [SHAPE001-2026-10-05T11-16-33-534Z.json](../results/raw/SHAPE001-2026-10-05T11-16-33-534Z.json), SHA256 `a03f57a46422e957dc9174f1e570a5561d5cb0b16d8f6a125905fbf0f4c7d861`, preserved byte-for-byte. Initialization, generation, done/nonempty output and GPU drain all completed; runtime errors and selected shader compilation messages empty. Three selected encoded and three submitted occurrences were captured, dropped events zero. Parameter capture was INCOMPLETE: three `Uniform/staging shadow capacity unavailable` failures, and all three selected16-byte snapshots UNKNOWN. The64KiB per-buffer guard excluded three1MiB uniform arenas; payload shadows used16752 bytes, so this was not global8MiB exhaustion. Binding3 uses a1048576-byte UNIFORM|COPY_DST arena (usage72), offset722176,size16, no dynamic offsets. It lacks COPY_SRC; no GPU readback or usage change is introduced.

Captured pipeline `shape-pipeline-11990` / shader `shape-shader-11989`,main,override constants0=8,1=4,2=1 establish workgroup8×4×1. Selected dispatches64×1×1 remain scheduling dimensions. First submission51672 / commandBuffer17452 / pass17451 / encoding46613. Weight binding2 range6291456 bytes and rgba16float texture extents512×512 output /512×384 input are allocation metadata, not logical M/N/K proof. U.i0.x/y/z and axis/padding/batch-head mapping remain UNKNOWN; GEMM004 stays gated.

Collector revision `SHAPE001-uniform-arena-v2` supports uniform arenas up to2MiB with the existing8MiB total payload cap. It retains CPU upload/known staging-copy provenance before bindings are discovered and freezes only selected16-byte snapshots at submitted dispatches. No weights/activations or model GPU resources are read/allocated, no algorithms changed. Payload arrays plus known masks and Float64 version arrays occupy10×payload host bytes (up to80MiB), separately exported as shadowHostArrayBytes; metadata/wrapper/update objects add further unmeasured host overhead. This is instrumentation host storage, not GPU memory. Caps still fail visibly with size/usage-budget details. Current repaired revision is NOT_RUN on phone; repeat one short SHAPE001 generation and export a new file. The failed original remains evidence.


## SHAPE001 v2 actual run 2026-10-05 — COMPLETE

Raw [SHAPE001-2026-10-05T11-32-49-007Z.json](../results/raw/SHAPE001-2026-10-05T11-32-49-007Z.json), SHA256 `fcece04380902827c2db59597ba9b2e01687d431ff3273a3d72d75026218d721`, archived byte-for-byte. Revision SHAPE001-uniform-arena-v2: overall and collector COMPLETE,parameterBytesStatus KNOWN,three encoded/three submitted selected occurrences,missing snapshots0,dropped0,coverage failures/compilation messages/runtime errors empty. All lifecycle checks true. Full prompt sizeInTokens returned18; generated token count remains NOT_MEASURED.

Independent little-endian decoding of all three16-byte snapshots gives U.i0=[512,8,384,0]. Each uses binding3 effective offset722176 and provenance queue.writeBuffer sequence33496 in MODEL_INIT (actual Uint8Array view,size16,bufferOffset722176); snapshot-level latest arena version45183 is not the selected byte update ID. Pipeline overrides establish8×4×1 workgroup. Submit/pass/command links51672/17451/17452,56984/17462/17463,62296/17473/17474 are preserved separately.

WGSL evidence establishes512 packed output vec4 slices and384 reduction vec4 slices; four components give2048 output storage channels and1536 reduction storage channels. Eight explicit input texture x lanes and output stores are present; all store predicates0,-1,...,-7 < U.i0.y=8 hold. This proves an executed packed arithmetic view with eight lanes,1536 reduction components,2048 output components. It does **not** prove unpadded logical M=8,K=1536,N=2048, batch/head roles or model graph tensor semantics. Texture allocations512×384 and512×512 and weight bytes6291456 are cross-checks only. Row-major rewrite requires unpacking mat4x4<f16> weights and texture vec4 axes; it changes FP16 accumulation/storage. No full logical-shape manifest is enabled. GEMM004 remains WAITING_FOR_SHAPE_EVIDENCE. Remaining minimal evidence is selected operator tensor-axis/valid-channel/padding metadata from graph/runtime; no further identical SHAPE001 rerun requested.

Collector CPU callback wall691.0000029802322ms,shadow payload3162480 bytes,host shadow arrays31624800 bytes; latter excludes metadata/wrappers and is not GPU memory. No performance comparison with stock inferred. Original incomplete v1 and complete v2 records remain separate. TIMING002 is the independent next phone control; SHAPE001 completion does not resolve PROFILE003 timestamp overlap.


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


## Current offline review: GEMM004 execution-shape supplement

Supersedes historical gating only for execution/padded scope: [proof](../docs/gemm004_shape_proof.md),[direct original assignment audit](../docs/assignment_requirements_matrix.md). A:execution arithmetic M8,K1536,N2048 and packed-to-row-major mapping established;B:valid logical dimensions/padding unknown;C:layer/token/batch/head unknown. Two alternatives reviewed without improved parameters;no new capture. GEMM004 enabled as EXECUTION_PADDED_ONLY,phone NOT_RUN,original naive/tiled and same timing/reference framework. No claim of satisfying real decodeM1/prefillM>=128 or quantized FP16 A-D pipeline. TIMING002 decision unchanged:independent overlap reproduced,serial control changes conditions,cause UNKNOWN;PROFILE003 not used for exclusive costs/stacked breakdown. Next direct kernel task FP16 A/B contract/fallback then vectorized C;target Adreno and logical shape gaps remain. No commit/push.


## GEMM004 actual run 2026-10-05 — COMPLETE

Raw [GEMM004-2026-10-05T12-00-58-417Z.json](../results/raw/GEMM004-2026-10-05T12-00-58-417Z.json),SHA256 `766adfe6e87f679375a0a937b8f73f8e6d7ac733ecfbd11bec2ae7ecafa5e11a`,archived byte-for-byte. Execution/padded shape M8,K1536,N2048,synthetic FP32 only;valid logical model shape/layer/batch/head remains unknown. Original naive/tiled unchanged. Reproduce `python scripts/verify_gemm004_result.py results/raw/GEMM004-2026-10-05T12-00-58-417Z.json`;derived results/analysis/gemm004_verified.json.

All10 shape/input-kind checks and variant pair comparisons PASS,all80 sampling checks PASS,40 warmup/measured pair checks PASS;nonfinite/errors0. Independent CPU replay verifies every1728 exported small-case output value,seeded inputs and binary64 reference values. Large shape actual arrays are not exported;large full-output correctness is online evidence,with independently recomputed recorded worst-reference values,not independent replay of every large output. Largest initial-check max absolute error6.252310865306754e-05. Frozen tolerances unchanged. Python reference uses explicit sequential binary64 += (not Python3.14 compensated sum),matching documented reference arithmetic.

|Variant|Measured count|Median(ms)|Nearest-rank p95(ms)|Min/max(ms)|Zeros|Nominal effective GFLOP/s|
|---|---:|---:|---:|---|---:|---:|
|naive|30|3.604480|12.124160|2.359296/12.189696|0|13.963636|
|tiled|30|5.210112|13.303808|3.080192/13.762560|0|9.660377|

Independent integer differences,statistics,endpoint GCD65536ns for each variant,10 warmups/30 measured per variant,fixed-seed balanced15/15 order,execution order,paired ratios,shader hashes/compilation records and resource cleanup match export. Neither median is resolution-limited under predeclared policy. Main same-run naive median/tiled median=0.6918238993710691;tiled median duration is44.54545% longer. Paired-ratio median0.7123015873 is a different estimator;all tails/zeros retained,no historical median used. Nominal FLOPs50331648=2*M*N*K,divided by pass median;not hardware peak utilization or pure arithmetic time.

Source facts:tiled uses16×16 outputs,shared A/B tiles and barriers;M8 leaves8 invalid output rows per workgroup that still participate in cooperative loads/barriers. Possible reuse/barrier/scheduling/parallelism causes are hypotheses,not measured bottlenecks. One controlled Mali run does not establish repeatability,Adreno benefit,model speedup or required real decodeM1/prefillM>=128 layer-shape completion. No added optimized variant or threshold adjustment.

Manual state:no obvious heat(temperature unmeasured),not charging100%,DevTools closed,flag disabled;visible throughout,no background transitions. Errors empty,all tracked resources destroyed. GPU interval excludes output readback/CPU reference/check;serial full readback changes execution conditions. Next concrete implementation task remains freeze quantized/FP16 A-D computation contract,adapt A/B with verified FP16 accumulation and separately labeled FP32 fallback,then fixed vectorized C,then fused D. Part1 metrics and target/logical-shape gaps stay in assignment_requirements_matrix.md. No commit/push.


## PART2AB — PART2-QROW-v1 (phone NOT_RUN)

Frozen contract: docs/part2_compute_contract.md. Original p2 A/B definitions and quantized→dequant→GEMM→FP16 accumulation distinguish this from historic FP32 supplements. Project synthetic unsignedQ4/Q8,row-packed u32,group32 along K,half scales/u32 zero points;CPU predecode B16 shared across naive A/shared-memory B,f16 inputs/accumulator,f32 carrier of half-valued output. Canonical half,high-precision and FP32 references;precision discriminator2048 vs2050 and frozen ordinary tolerances. C/D format defined only,NOT_IMPLEMENTED. RepresentativeM1/M128 K/N1024,not real logical layer shape. Separate explicit FP32 fallback does not validate required path. Kernel-only excludes CPU pack/unpack/dequant and all setup/readback/check;host full-run scope separately recorded,not a GPU unfused-D comparison.10warm/30measured paired15/15,serial single dispatch/query-safe readback,raw zeros/tails/grid retained. Part1 and Adreno/real-shape gaps unchanged. No commit/push.


## PART2AB Q4 FP16 actual run — 2026-10-05 COMPLETE

Raw [PART2AB-FP16-2026-10-05T14-50-01-368Z.json](../results/raw/PART2AB-FP16-2026-10-05T14-50-01-368Z.json),SHA25676da3dda1c721cb055ea8a6ce7bf7fb793e163761286c1f6b748be2cbcebae5a,archived byte-for-byte. pathFP16,requiredPathStatusCOMPLETE,selectedQ4,PART2-QROW-v1;not fallback. Actual device enables shader-f16/timestamp-query. All13 initial correctness records and160 warmup/measured samples PASS,errors/compilation messages empty,nonfinite/error counts0,tracked resources destroyed. No visibility/background events. Manual state no obvious heat/temperature unmeasured,not charging100%,DevTools closed,flag disabled.

A/B precision discriminator both2048 versus FP32/high2050 (intentional high-reference difference2). This supports the selected typed-f16 sequential path,not machine-instruction proof. All exported online semantic-reference max errors0;ordinary high/FP32 maximum absolute error .03076171875 (exclude intentional probe error2),within frozen bounds. Exact family error0. No tolerance change. Large max relative error near expected zero is preserved;absolute+relative PASS criterion handles that separately.

Independent audit `python scripts/verify_part2_ab_result.py` checks all1690 exported small output values using Python struct binary16,packing bits/seeds/saved half activation,recorded worst CPU reference values,timestamps/median/nearest-rank p95/zeros/GCD/fixed15/15 order/shader hashes/cleanup. Derived results/analysis/part2_ab_verified.json. Large actual arrays absent;large full-output maxima/counts remain online evidence,not independently reconstructed offline. Each variant/shape has10warmup+30measured,single dispatch/pass,serial completion/readback/check.

|Representative shape M,K,N|A median/p95(ms)|B median/p95(ms)|Same-run A/B median ratio|
|---|---|---|---|
|1,1024,1024|.983040 /2.162688|4.620288 /11.272192|.2127659574|
|128,1024,1024|7.667712 /8.781824|12.255232 /13.828096|.6256684492|

All four measured sets have0 zero samples,endpoint GCD65536ns and medians above frozen resolution threshold. B median is4.7× A atM1 and1.59829× atM128;negative result retained,not fixed by changing tile/input/precision. No history denominator,no per-kernel divided batch time. Shared-memory/barriers/source structure are known;occupancy/cache/DRAM/scheduling explanations remain hypotheses. No Adreno/model speedup claim.

A/B kernel-only excludes CPU pack/unpack/dequant and setup/reference/upload/readback/check. CPU preprocessing and host overall wall in raw are separately scoped;GPU preprocessing/end-to-end pipeline remain NOT_MEASURED. Do not compare future fused D against only A/B GEMM time or call this a full quantized GPU pipeline benchmark. Q8 is NOT_RUN on phone;C/D NOT_IMPLEMENTED;real valid layer shape and targetAdreno,limited sweeps/independent repeats remain gaps. Next implementation can proceed to fixed vectorized C under this contract,with A/B retained as same-run controls. No automatic Q8/fallback rerun or commit/push.


## PART2ABC fixed vectorized C — phone NOT_RUN

Current addition supersedes earlier C NOT_IMPLEMENTED only at implementation status: [vectorized C method](../docs/part2_vectorized_c.md). Original p2 tiled/vectorized C implemented with vec4<f16> B loads and four adjacent output columns/lane,WG8x8/output8x32/Ktile16/shared1280 bytes,two barriers and unchanged increasing scalar K component fma. Same Q4/FP16 PART2-QROW-v1 seeds/references/tolerances. C B16 is copied into padded N-to4 rows;CPU copy/time/host+GPU bytes exported,not hidden in kernel-only ratios. A/B source preserved;one shared controller/execute helper for prior AB/newABC.30 rounds with six permutations5 each,10warmups per variant,serial full output checks;negative result allowed. ExtraM9,K17,N35 edge case. D,Q8 phone experiments,sweep/independent repeats/real logical shapes/Adreno remain gaps;no model-profiler expansion. Page http://localhost:8000/src/benchmark/part2_abc.html ;run once Q4FP16 in foreground,download JSON. No commit/push.


## PART2ABC Q4 FP16 actual phone result — 2026-10-05

COMPLETE; required FP16 path COMPLETE. Original raw: results/raw/PART2ABC-FP16-2026-10-05T15-31-54-819Z.json; SHA256 a19773b430c71922308f2f938e8dd037d34b8d72c041e8c461d535265c563a30. Supersedes this page's prior NOT_RUN status. Independent verification: `python scripts/verify_part2_abc_result.py`, output results/analysis/part2_abc_verified.json.

15 initial correctness records and 240 warm-up/measured samples PASS; errors empty, compilation messages empty, non-finite/error counts zero. All three precision probes output2048 versus high/FP32 reference2050. Ordinary semantic max absolute error0; high/FP32 maximum0.03076171875 under frozen tolerances. Independent CPU verification covered4425 exported small outputs, packing, seeded recorded worst references and all timestamp/statistics/order records. Large full actual arrays were not exported: their full correctness remains online evidence, not independently replayed output.

K=N=1024; GPU pass median / nearest-rank p95 in ms:

| M | A | B | C | A/C median ratio | B/C median ratio |
|---|---|---|---|---|---|
|1|1.212416 / 2.555904|4.816896 / 11.468800|1.048576 / 1.310720|1.15625|4.59375|
|128|7.995392 / 9.109504|12.550144 / 14.680064|2.097152 / 2.555904|3.8125|5.984375|

Each variant/shape has10warmups and30measured samples;six permutations occur5 times each. Zero counts0 throughout;observed endpoint grid65536ns;all summaries PRELIMINARY rather than RESOLUTION_LIMITED under the predefined criterion. Raw tails retained. No background transition recorded.

C layout-copy host times1.2ms(M1)/0.8ms(M128),additional logical GPU buffer2097152bytes each,excluded from kernel-only ratios along with common CPU dequantization,setup,reference and readback/check. Ratios use this run only. One phone run is not five independent repeats;multiple structural changes prevent attributing benefit solely to vector instructions. Representative shapes are not verified logical model shapes;no model acceleration or Adreno portability claim. Q8,fusedD,sweep/repeats remain pending. No commit/push.


## PART2ABCD Q4 fused D pilot — NOT_RUN

Original assignment p2 D is “Fused dequant + GEMM”. See docs/part2_fused_d.md (relative from repository root). New independent page src/benchmark/part2_abcd.html,stock Q4 FP16 A/B/C plus D using same C mapping/WG8x8/output8x32/Ktile16/shared1280bytes. D reads row-packed unsigned Q4,group32 scales/zp and performs signed-difference→f32 scale multiply→f16 conversion before increasing-K half fma. No full B16 input/intermediate for D;not packed FP16 unpack. Historical pages/shaders/raw preserved.

Question:compare prepared-input GPU pass and separately sampled resident-packed-to-completion wall. Setup:representative M1/M128,K=N1024,shared mathematical input/reference/thresholds;extremes and tails/probe included. Each scope10warmups/30measured per variant,24permutations plus six additions,position7/8 and pair precedence15/15. Kernel-only excludes ABC CPU decode/layout;complete-path samples actually redo ABC decode/C layout/upload each time;D uses resident packed inputs. Preallocated GPU resources/common A+packed+metadata uploads/reference/map/check excluded from complete wall;encoding,variant upload,outside-pass copies included. CPU+GPU times not added as GPU time;complete median not derived by adding medians. Static weights can prepare once/reuse;one-time costs separately exported.

Acceptance:all versions correct/nonfinite0/probe2048,raw samples/orders/limits/errors/metadata/source/hash and two scopes present;zero/tails retained;D has no B16 resource input;phone NOT_RUN. No claims about physical GPU residency,DRAM traffic,hardware vector instructions,model acceleration or Adreno performance. Q8,sweep,independent repeats,real valid model shapes and Part1 profiling gaps remain. No commit/push.

Phone: http://localhost:8000/src/benchmark/part2_abcd.html ;fill environment,run Q4FP16 A/B/C/D once in foreground,wait for both scopes,download PART2ABCD-FP16 JSON even on failure. Existing server/adb reverse instructions apply;no old experiment rerun.


## PART2ABCD Q4 FP16 actual phone result — 2026-10-05 COMPLETE

Raw PART2ABCD-FP16-2026-10-05T15-57-38-287Z.json archived byte-for-byte,SHA256 55d593b93a5703180ebc20b1469aa12167a39f88595d9bd2317b3752bec61a68. Supersedes NOT_RUN for this run. Independent audit `python scripts/verify_part2_abcd_result.py`;results/analysis/part2_abcd_verified.json.17 initial correctness records and640 sampling pass records(all warmup/measured,both scopes,two shapes) PASS;errors/compilation messages empty,semantic max absolute error0,nonfinite/error counts0. All four precision probes2048 vs FP32/high2050. Independently checked6116 exported small output values,packed bits,seeds/overridden extreme codes,worst references,timestamps/statistics/order,shader hashes and cleanup. Large complete output arrays absent:large full online summaries are not independent offline replay.

Kernel-only GPU pass median / p95(ms),K=N1024:

|M|A|B|C|D|
|---|---|---|---|---|
|1|1.114112 / 2.555904|5.505024 / 11.534336|1.048576 / 1.310720|1.277952 / 1.900544|
|128|8.781824 / 12.255232|13.500416 / 15.466496|2.359296 / 2.949120|3.604480 / 4.456448|

Separately sampled complete-path wall median / p95(ms):

|M|A|B|C|D|
|---|---|---|---|---|
|1|68.200 / 102.500|77.850 / 106.500|71.450 / 98.500|3.800 / 5.600|
|128|90.800 / 111.500|86.000 / 113.300|79.450 / 97.600|7.450 / 9.200|

Each scope/shape/variant10warmups+30measured;all24permutations present,position7/8,pair precedence15/15,seeded orders independently reproduced. All zero counts0;kernel endpoint GCD65536ns,PRELIMINARY under frozen resolution rule. Warmups cycle first6permutations (corrected previous first10 wording;measured balance unchanged). No raw samples changed.

D/C kernel median ratios1.21875(M1),1.527778(M128):D slower than C. D faster than B in both shapes,and faster than A only atM128 (A/D2.436364 vsM1 .871795). Complete-path A/D17.9474(M1),12.1879(M128) is a resident-packed single-use CPU-preprocessing scenario,not GPU speedup or model speedup. ABC actually redo CPU decode/C layout/upload per sample;D fused decode is already in its pass. Static weights can prepare once/reuse,so kernel-only and one-time costs remain relevant. Do not add CPU ms to timestamps or add independent medians. Logical D B16 intermediate0 does not establish physical GPU memory savings;combined harness allocates ABC matrices. One run does not fulfill independent repetition/sweep/Q8/real logical shape/Adreno or Part1 breakdown gaps. No commit/push.


## Q8 FP16 A-D pilot — phone NOT_RUN

Original p2 does not specify Q8 packing/signedness:PART2-QROW-v1 project format unsigned0..255,four low-byte-first codes/u32,K rows word-aligned,group32 K per column,half scale1/512 for fractional inputs,u32 zero point around128;negative dequant comes from signed q-zp,not INT8 sign extension. FP16 activation/increasing-K fma/output contract unchanged. Same A/B/C WGSL;new fused D byte decode with same C mapping. Shared controller/decoder parameterized,Q4 entry/shaders preserved.

Full CPU-domain Q8 numerical preflight PASS:canonical vs high/FP32 max fractional absolute error0.017425537109375(M1),0.03326416015625(M128),exact0. Explicitly reviewed existing thresholds retained before phone run:semantic.02/.01,high/FP32.04/.04,exact0/0;engineering policy for bounded inputs,not universal GPU guarantee. See docs/part2_q8.md and results/analysis/q8_cpu_reference_validation.json.

Question/setup/acceptance:Q8 same-run A-D on representative M1/M128 K=N1024,all full outputs/probe2048 required,tails/extreme unsigned bytes/zero dequant checked. Both prepared-input GPU pass and separately sampled actual complete-path conversion/upload wall;10warmups/30measured,24permutations plus balanced six,all raw timestamps/wall/zeros/tails/order exported. Static preparation reuse caveat unchanged. Ratios use this Q8 run only;history Q4 is no denominator/cause proof. Phone result NOT_RUN;computer preflight is CPU_ONLY. Independent FP32 fallback is manual Q8 A/B on existing page,not required A-D acceptance.

Phone http://localhost:8000/src/benchmark/part2_q8_abcd.html ;confirm Q8FP16,fill actual environment,run once foreground,download PART2Q8ABCD-FP16 JSON even on failure. No old Q4 performance rerun. Q8 phone acceptance,real logical model shape,targetAdreno,Part1 metrics remain gaps;sweep and>=five independent repeats next after acceptance,not implemented now. Temporary integrity snapshots stay local;no commit/push.


## PART2Q8ABCD FP16 actual phone result — 2026-10-05 COMPLETE

Original PART2Q8ABCD-FP16-2026-10-05T16-36-52-920Z.json preserved byte-for-byte,SHA256 2b90dcaefe5777ff780ab85e947d05b62d8619dc8cbdc3f60e44c28b86877a4d. Quantization8-bit unsigned0..255,not INT8/Gemma-native format;required FP16 path COMPLETE. Independent audit `python scripts/verify_part2_q8_result.py`;results/analysis/part2_q8_abcd_verified.json.19 initial correctness records and640 sampling records all PASS;errors/compilation messages empty. Canonical semantic maximum absolute error0;ordinary high/FP32 max absolute error0.03326416015625 under frozen preflight-reviewed thresholds. All four precision probes2048 vs FP32/high2050.

Independently replayed6476 exported small output values,full small saved references,unsigned byte packing,seeds/explicit extreme override,recorded worst references,timestamps,orders/statistics,hashes and cleanup. Large complete actual arrays absent:large full-output correctness remains online evidence,not independent offline replay.

GPU pass median / nearest-rank p95(ms),representative K=N1024:

|M|A|B|C|D|
|---|---|---|---|---|
|1|1.081344 / 2.359296|4.849664 / 11.468800|1.015808 / 1.245184|1.245184 / 1.966080|
|128|8.749056 / 12.058624|13.303808 / 16.646144|2.490368 / 3.145728|3.735552 / 4.521984|

Separately sampled complete-path wall median / p95(ms):

|M|A|B|C|D|
|---|---|---|---|---|
|1|69.650 / 86.500|76.600 / 82.800|69.900 / 74.600|3.900 / 4.700|
|128|77.250 / 85.800|81.200 / 88.500|70.900 / 83.500|6.450 / 8.500|

Each scope/shape/variant10warmup+30measured;24permutations+six balanced additions,position7/8,pair precedence15/15 verified. All zero counts0;observed endpoint grid65536ns,PRELIMINARY under the predefined duration criterion. M1 A/C median difference1081344-1015808=65536ns;no stable small benefit claimed. D/C kernel ratios1.225806(M1),1.5(M128),D slower than C. A/D .868421(M1),2.342105(M128). Complete path favors D because ABC repeatedly perform CPU decode/C layout/weight upload;not applicable to preprocessed-weight reuse,not GPU/model acceleration. CPU+GPU times not summed. All ratios use this run/scope;separate Q4/Q8 runs are descriptive only,not controlled format causality.

Phone pilot acceptance complete;finite sweep and>=five independent repeats remain next,not performed. Real logical Gemma shape,targetAdreno and Part1 token/phase/memory/credible kernel breakdown gaps remain. No commit/push.
