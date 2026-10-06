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


## Finite sweep QROW-SWEEP-v1 — READY_FOR_PHONE / result NOT_RUN

Q8 accepted implementation/results were independently committed and pushed before this work: a5a0cedc78725d0dcc34a9d0ba7e9342123544e0. The three local integrity snapshots remain excluded;updates/ ignored and locally preserved. Sweep is a separate uncommitted implementation pending phone acceptance.

Frozen candidates in docs/part2_sweep_plan.md:Q4/Q8,M1/M128,K=N1024;A8x8 fixed;B16x16/K16(original),8x8/K8,32x8/K16;C/D8x8/K16(original),4x8/K16,8x16/K16. Actual workgroup differs from vectorized output tile;resource counts in table. Illegal candidates UNSUPPORTED,failed candidates retained/excluded. All candidates full preflight incl precision2048/non-square/packing/group/vector/tile tails and both performance shapes before timing. Same frozen precision/input/reference/thresholds;no new quantization/kernel family or silent shape change.

Only prepared-input kernel GPU pass;setup/CPU convert/layout/upload/reference outside sampling. Single dispatch,serial completion/query/readback/full check.10warmups+30measured/candidate,position-balanced rounds,seeds/actual order/raw timestamps/hashes/results. Full budget1600sampling passes+420correctness passes;unsupported/failures reduce it. Median/p95/zero/grid/ratios to same-round A and own original. Select lowest resolved median only as pilot candidate;within one grid indistinguishable,prefer original. Not stable/model/Adreno speedup;>=five independent repeats next.

Phone http://localhost:8000/src/benchmark/part2_sweep.html ;fill environment,run once frozen sweep in foreground,download PART2SWEEP JSON even on failure. No controllable phone Chrome interface available in this session;no phone execution or COMPLETE claim. Computer checks:all-candidate CPU collective interpreter/stock source identity/limits/order/tie policy;page mock1600serial samples and independent Python small-output/timestamp/statistical/seed audit,unsupported/failure/no-query/cleanup. `python scripts/verify_part2_sweep_result.py PATH` will archive real JSON unchanged and verify when supplied. Real logical shapes,Adreno and Part1 remain gaps.


Sweep delivery connectivity:server HTTP200 for page/modules;final adb check has no connected devices/emulators. Reconnect USB/authorize debugging and redo reverse before phone execution. READY_FOR_PHONE,not COMPLETE;no phone benchmark automatically executed.


## PART2SWEEP phone evidence: 2026-10-06

Actual run: **COMPLETE_WITH_FAILURES**, not a completed sweep. Independent audit PASS: 43,856 exported small outputs and 1,280 timestamp samples (320 warm-up, 960 measured); seeded orders, nearest-rank p95, raw BigInt differences, grids and selections independently recomputed. All recorded correctness cases PASS; large outputs rely on online full checks. No zero-duration samples; observed grid 65,536 ns. Raw evidence retained byte-for-byte; SHA256 c21e9bbed332b54cead19ecb8ad8150ca636dc36e6b495f7e634b41deaa8b671.

D-4x8-K16 and D-8x16-K16 failed compilation for both formats: generated WGSL used reserved identifier `meta`. These are implementation failures, not device-limit UNSUPPORTED. Eight error entries record four failures. D-original ran, but D candidate selection remains incomplete. Identifier renamed to `quantIndex`; unchanged algorithm, contract and candidate budget. CPU checks do not establish phone compilation success. Corrected sweep READY_FOR_PHONE, rerun same frozen page once; no independent repeat campaign yet.

| Format | M | Candidate | median ms | p95 ms | Interpretation |
|---|---:|---|---:|---:|---|
| Q4 | 1 | A-original | 1.376256 | 2.621440 | PRELIMINARY |
| Q4 | 1 | B-16x16-K16 | 11.010048 | 11.796480 | PRELIMINARY |
| Q4 | 1 | B-8x8-K8 | 2.621440 | 6.160384 | PRELIMINARY |
| Q4 | 1 | B-32x8-K16 | 1.703936 | 4.718592 | PRELIMINARY |
| Q4 | 1 | C-8x8-K16 | 1.114112 | 1.376256 | PRELIMINARY |
| Q4 | 1 | C-4x8-K16 | 1.310720 | 1.441792 | PRELIMINARY |
| Q4 | 1 | C-8x16-K16 | 1.277952 | 1.900544 | PRELIMINARY |
| Q4 | 1 | D-8x8-K16 | 1.605632 | 1.966080 | PRELIMINARY |
| Q4 | 128 | A-original | 9.240576 | 11.599872 | PRELIMINARY |
| Q4 | 128 | B-16x16-K16 | 13.533184 | 16.777216 | PRELIMINARY |
| Q4 | 128 | B-8x8-K8 | 11.993088 | 16.842752 | PRELIMINARY |
| Q4 | 128 | B-32x8-K16 | 9.895936 | 11.599872 | PRELIMINARY |
| Q4 | 128 | C-8x8-K16 | 2.228224 | 2.949120 | PRELIMINARY |
| Q4 | 128 | C-4x8-K16 | 2.621440 | 3.276800 | PRELIMINARY |
| Q4 | 128 | C-8x16-K16 | 2.293760 | 2.752512 | PRELIMINARY |
| Q4 | 128 | D-8x8-K16 | 3.899392 | 5.505024 | PRELIMINARY |
| Q8 | 1 | A-original | 0.720896 | 0.720896 | PRELIMINARY |
| Q8 | 1 | B-16x16-K16 | 0.917504 | 0.983040 | PRELIMINARY |
| Q8 | 1 | B-8x8-K8 | 0.393216 | 0.458752 | RESOLUTION_LIMITED |
| Q8 | 1 | B-32x8-K16 | 0.393216 | 0.393216 | RESOLUTION_LIMITED |
| Q8 | 1 | C-8x8-K16 | 0.393216 | 0.393216 | RESOLUTION_LIMITED |
| Q8 | 1 | C-4x8-K16 | 0.393216 | 0.458752 | RESOLUTION_LIMITED |
| Q8 | 1 | C-8x16-K16 | 0.393216 | 0.458752 | RESOLUTION_LIMITED |
| Q8 | 1 | D-8x8-K16 | 0.393216 | 0.393216 | RESOLUTION_LIMITED |
| Q8 | 128 | A-original | 9.043968 | 12.058624 | PRELIMINARY |
| Q8 | 128 | B-16x16-K16 | 13.139968 | 16.384000 | PRELIMINARY |
| Q8 | 128 | B-8x8-K8 | 11.862016 | 15.335424 | PRELIMINARY |
| Q8 | 128 | B-32x8-K16 | 9.895936 | 13.565952 | PRELIMINARY |
| Q8 | 128 | C-8x8-K16 | 2.490368 | 3.145728 | PRELIMINARY |
| Q8 | 128 | C-4x8-K16 | 2.686976 | 3.407872 | PRELIMINARY |
| Q8 | 128 | C-8x16-K16 | 2.326528 | 3.014656 | PRELIMINARY |
| Q8 | 128 | D-8x8-K16 | 3.735552 | 4.718592 | PRELIMINARY |

Pilot candidates: Q4 B-32x8-K16 for both shapes; Q4 C-original retained (M128 C-8x16 differs by exactly one grid). Q8 M128 B-32x8-K16 and C-8x16-K16 warrant repetition. Q8 M1 alternative B and all C/D durations are RESOLUTION_LIMITED, so cannot establish fastest candidate; exported B-original selection excludes faster unresolved alternatives and must not be interpreted as globally best. No stable speedup, cross-format causal conclusion or model acceleration. Prepared-input kernel-only excludes preparation. D comparison must be completed after compilation fix.


## Second sweep record: 2026-10-06T06:02:22.899Z

COMPLETE_WITH_FAILURES; independent audit PASS, 43,856 small outputs and 1,280 timestamps. Four alternate D shader compilation failures still contain `meta`: exported sources demonstrate stale/unfixed code, not validation of the corrected implementation. Browser module caching is a plausible explanation, not proven from JSON. Raw SHA256: 8bbca5205c93b8ffb69a34ed978a3dd8917b23968cebed7c3343ff4fa6841a45. Both partial runs retained separately; no pooled statistics. New entry and shader imports have explicit quant-index-fix-1 version URLs, visible page badge. Corrected sweep still READY_FOR_PHONE.

| Format | M | Candidate | median ms | p95 ms |
|---|---:|---|---:|---:|
| Q4 | 1 | A-original | 1.277952 | 2.621440 |
| Q4 | 1 | B-16x16-K16 | 11.108352 | 11.730944 |
| Q4 | 1 | B-8x8-K8 | 2.129920 | 6.160384 |
| Q4 | 1 | B-32x8-K16 | 1.703936 | 4.653056 |
| Q4 | 1 | C-8x8-K16 | 1.114112 | 1.376256 |
| Q4 | 1 | C-4x8-K16 | 1.310720 | 1.441792 |
| Q4 | 1 | C-8x16-K16 | 1.146880 | 1.900544 |
| Q4 | 1 | D-8x8-K16 | 1.441792 | 1.966080 |
| Q4 | 128 | A-original | 9.699328 | 11.403264 |
| Q4 | 128 | B-16x16-K16 | 13.402112 | 17.039360 |
| Q4 | 128 | B-8x8-K8 | 11.960320 | 16.711680 |
| Q4 | 128 | B-32x8-K16 | 9.502720 | 11.796480 |
| Q4 | 128 | C-8x8-K16 | 2.260992 | 3.080192 |
| Q4 | 128 | C-4x8-K16 | 2.686976 | 3.276800 |
| Q4 | 128 | C-8x16-K16 | 2.359296 | 2.818048 |
| Q4 | 128 | D-8x8-K16 | 3.997696 | 5.505024 |
| Q8 | 1 | A-original | 1.376256 | 2.621440 |
| Q8 | 1 | B-16x16-K16 | 10.977280 | 11.665408 |
| Q8 | 1 | B-8x8-K8 | 2.064384 | 6.160384 |
| Q8 | 1 | B-32x8-K16 | 1.835008 | 4.653056 |
| Q8 | 1 | C-8x8-K16 | 1.146880 | 1.310720 |
| Q8 | 1 | C-4x8-K16 | 1.310720 | 1.376256 |
| Q8 | 1 | C-8x16-K16 | 1.146880 | 1.900544 |
| Q8 | 1 | D-8x8-K16 | 1.540096 | 2.031616 |
| Q8 | 128 | A-original | 8.617984 | 11.993088 |
| Q8 | 128 | B-16x16-K16 | 12.877824 | 17.104896 |
| Q8 | 128 | B-8x8-K8 | 11.599872 | 14.483456 |
| Q8 | 128 | B-32x8-K16 | 10.354688 | 12.779520 |
| Q8 | 128 | C-8x8-K16 | 2.424832 | 3.145728 |
| Q8 | 128 | C-4x8-K16 | 2.686976 | 3.145728 |
| Q8 | 128 | C-8x16-K16 | 2.359296 | 2.949120 |
| Q8 | 128 | D-8x8-K16 | 3.932160 | 4.587520 |

B-32x8-K16 is the pilot choice in all four groups. Original C retained; ties within a grid occur for Q4 M1 and Q8 both shapes. D-original is the only measured D candidate, so no complete D selection. Differences from the first run are not controlled causal effects or stable gains. No five-run repetition acceptance.


## Accepted complete limited sweep: 2026-10-06T06:07:34.319Z

Actual COMPLETE, independent verification PASS. All ten candidates compile and pass recorded correctness for Q4/Q8. Errors empty. Independently replayed 54,820 small outputs and 1,600 timestamp samples (400 warm-up, 1,200 measured). All four groups have 30 measured samples per candidate and balanced seeded orders; observed grid 65,536 ns, zero-duration count 0. Large full outputs checked online, not exported for independent full reconstruction. Raw SHA256 055b4ad76abbed961fddbd65445fee3c6f70d96566219599416a0701cd90bc66. Previous two failed records retained separately; no pooled statistics.

| Format | M | Candidate | median ms | p95 ms | A/candidate | original/candidate |
|---|---:|---|---:|---:|---:|---:|
| Q4 | 1 | A-original | 2.129920 | 2.359296 | 1.000000 | 1.000000 |
| Q4 | 1 | B-16x16-K16 | 11.075584 | 11.665408 | 0.192308 | 1.000000 |
| Q4 | 1 | B-8x8-K8 | 3.145728 | 6.160384 | 0.677083 | 3.520833 |
| Q4 | 1 | B-32x8-K16 | 3.571712 | 4.521984 | 0.596330 | 3.100917 |
| Q4 | 1 | C-8x8-K16 | 1.179648 | 1.310720 | 1.805556 | 1.000000 |
| Q4 | 1 | C-4x8-K16 | 1.310720 | 1.376256 | 1.625000 | 0.900000 |
| Q4 | 1 | C-8x16-K16 | 1.835008 | 1.900544 | 1.160714 | 0.642857 |
| Q4 | 1 | D-8x8-K16 | 1.572864 | 1.900544 | 1.354167 | 1.000000 |
| Q4 | 1 | D-4x8-K16 | 1.474560 | 1.966080 | 1.444444 | 1.066667 |
| Q4 | 1 | D-8x16-K16 | 2.555904 | 2.621440 | 0.833333 | 0.615385 |
| Q4 | 128 | A-original | 9.764864 | 16.121856 | 1.000000 | 1.000000 |
| Q4 | 128 | B-16x16-K16 | 14.417920 | 19.988480 | 0.677273 | 1.000000 |
| Q4 | 128 | B-8x8-K8 | 11.993088 | 15.073280 | 0.814208 | 1.202186 |
| Q4 | 128 | B-32x8-K16 | 10.223616 | 13.565952 | 0.955128 | 1.410256 |
| Q4 | 128 | C-8x8-K16 | 2.654208 | 3.342336 | 3.679012 | 1.000000 |
| Q4 | 128 | C-4x8-K16 | 2.818048 | 3.342336 | 3.465116 | 0.941860 |
| Q4 | 128 | C-8x16-K16 | 2.621440 | 3.866624 | 3.725000 | 1.012500 |
| Q4 | 128 | D-8x8-K16 | 3.801088 | 4.456448 | 2.568966 | 1.000000 |
| Q4 | 128 | D-4x8-K16 | 4.653056 | 9.043968 | 2.098592 | 0.816901 |
| Q4 | 128 | D-8x16-K16 | 2.949120 | 5.570560 | 3.311111 | 1.288889 |
| Q8 | 1 | A-original | 1.179648 | 2.555904 | 1.000000 | 1.000000 |
| Q8 | 1 | B-16x16-K16 | 10.911744 | 11.534336 | 0.108108 | 1.000000 |
| Q8 | 1 | B-8x8-K8 | 6.029312 | 6.160384 | 0.195652 | 1.809783 |
| Q8 | 1 | B-32x8-K16 | 2.293760 | 4.521984 | 0.514286 | 4.757143 |
| Q8 | 1 | C-8x8-K16 | 1.146880 | 1.310720 | 1.028571 | 1.000000 |
| Q8 | 1 | C-4x8-K16 | 1.310720 | 1.441792 | 0.900000 | 0.875000 |
| Q8 | 1 | C-8x16-K16 | 1.245184 | 1.900544 | 0.947368 | 0.921053 |
| Q8 | 1 | D-8x8-K16 | 1.638400 | 1.966080 | 0.720000 | 1.000000 |
| Q8 | 1 | D-4x8-K16 | 1.310720 | 2.031616 | 0.900000 | 1.250000 |
| Q8 | 1 | D-8x16-K16 | 1.310720 | 2.621440 | 0.900000 | 1.250000 |
| Q8 | 128 | A-original | 9.699328 | 12.058624 | 1.000000 | 1.000000 |
| Q8 | 128 | B-16x16-K16 | 13.107200 | 15.007744 | 0.740000 | 1.000000 |
| Q8 | 128 | B-8x8-K8 | 10.649600 | 19.857408 | 0.910769 | 1.230769 |
| Q8 | 128 | B-32x8-K16 | 13.205504 | 17.367040 | 0.734491 | 0.992556 |
| Q8 | 128 | C-8x8-K16 | 2.555904 | 7.340032 | 3.794872 | 1.000000 |
| Q8 | 128 | C-4x8-K16 | 3.538944 | 5.505024 | 2.740741 | 0.722222 |
| Q8 | 128 | C-8x16-K16 | 2.424832 | 4.128768 | 4.000000 | 1.054054 |
| Q8 | 128 | D-8x8-K16 | 4.554752 | 7.274496 | 2.129496 | 1.000000 |
| Q8 | 128 | D-4x8-K16 | 4.980736 | 8.912896 | 1.947368 | 0.914474 |
| Q8 | 128 | D-8x16-K16 | 2.654208 | 3.014656 | 3.654321 | 1.716049 |

### Candidates for subsequent independent repetition

| Format | M | B | C | D |
|---|---:|---|---|---|
| Q4 | 1 | B-8x8-K8 | C-8x8-K16 | D-4x8-K16 |
| Q4 | 128 | B-32x8-K16 | C-8x8-K16 (within-grid tie) | D-8x16-K16 |
| Q8 | 1 | B-32x8-K16 | C-8x8-K16 | D-4x8-K16 (within-grid tie) |
| Q8 | 128 | B-8x8-K8 | C-8x16-K16 | D-8x16-K16 |

Q4 M128 C retains original under frozen one-grid tie preference. Q8 M1 D alternatives tie within one grid; original is outside tie, so lowest-median candidate remains provisional. This completes one finite exploratory sweep, not five independent repetitions or stable benefit acceptance. Choices differ from previous partial runs; no causal thermal/format explanation established. Next minimal task: freeze selected candidates plus same-round originals/A, collect at least five independent runs under the same contract. Do not expand candidates, assert model acceleration, Adreno validation or true logical model shape completion.


## Part 2 five independent sessions — READY_FOR_PHONE

Frozen QROW-REPEAT-v1 compares A and deduplicated original/selected B/C/D from the COMPLETE sweep. New entry: http://localhost:8000/src/benchmark/part2_repeat.html?v=repeat-v1 . Reload for each ordinal 1–5; one UUID/new device per page run, fresh preparation and warm-up. Per session 1,000 sampling passes (250 warm-up,750 measured), plus up to 357 correctness passes if all pass. Details: docs/part2_repeat_plan.md. Results NOT_RUN; no fabricated numbers, no pooled median or reselection. Independent auditor prepared; five verified sessions required before separate result commit/push. This does not satisfy Part 1 model repeats, logical model shape or Adreno requirements.


## PART2REPEAT S1 actual evidence

Session 1 COMPLETE, independent verification PASS; UUID 11932e1a-80cc-48ee-9233-d822f09e9ba2. Raw SHA256 c8b7c03fee89a8ee97225dcbc5a733188870ebb4d16700e4df277fd382f37dde. Independently checked 46597 small outputs and 1000 timestamps. Errors: 0. Visibility: {"initialState": "visible", "enteredBackground": false, "samplingEnteredBackground": false, "events": []}. Environment: {"thermal": "\u672a\u660e\u663e\u53d1\u70ed\uff0c\u6e29\u5ea6\u672a\u6d4b\u91cf", "charging": "\u6b63\u5728\u5145\u7535\uff0c\u7535\u91cf81%", "devtools": "\u672a\u5f00\u542f", "flag": "\u5df2\u505c\u7528"}. Frozen configurations/shader hashes and balanced order verified;large full outputs remain online verification evidence. Campaign 1/5, INCOMPLETE;no reselection or stable benefit claim.

| Format | M | Candidate | median ms | p95 ms | A/candidate |
|---|---:|---|---:|---:|---:|
| Q4 | 1 | A-original | 1.179648 | 2.424832 | 1 |
| Q4 | 1 | B-16x16-K16 | 7.700480 | 11.665408 | 0.15319148936170213 |
| Q4 | 1 | B-8x8-K8 | 2.129920 | 6.160384 | 0.5538461538461539 |
| Q4 | 1 | C-8x8-K16 | 1.114112 | 1.310720 | 1.0588235294117647 |
| Q4 | 1 | D-8x8-K16 | 1.441792 | 1.900544 | 0.8181818181818182 |
| Q4 | 1 | D-4x8-K16 | 1.474560 | 1.966080 | 0.8 |

Original/selected comparisons: {"B": {"value": 3.6153846153846154, "status": "PILOT_ONLY", "differenceNs": 5570560, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 0.9777777777777777, "status": "WITHIN_ONE_GRID", "differenceNs": -32768, "gridNs": 65536}}

| Q4 | 128 | A-original | 3.604480 | 11.993088 | 1 |
| Q4 | 128 | B-16x16-K16 | 5.242880 | 14.024704 | 0.6875 |
| Q4 | 128 | B-32x8-K16 | 3.932160 | 11.665408 | 0.9166666666666666 |
| Q4 | 128 | C-8x8-K16 | 1.179648 | 2.621440 | 3.0555555555555554 |
| Q4 | 128 | D-8x8-K16 | 1.572864 | 4.521984 | 2.2916666666666665 |
| Q4 | 128 | D-8x16-K16 | 1.245184 | 3.014656 | 2.8947368421052633 |

Original/selected comparisons: {"B": {"value": 1.3333333333333333, "status": "PILOT_ONLY", "differenceNs": 1310720, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.263157894736842, "status": "PILOT_ONLY", "differenceNs": 327680, "gridNs": 65536}}

| Q8 | 1 | A-original | 1.245184 | 2.621440 | 1 |
| Q8 | 1 | B-16x16-K16 | 7.438336 | 11.665408 | 0.16740088105726872 |
| Q8 | 1 | B-32x8-K16 | 1.835008 | 4.718592 | 0.6785714285714286 |
| Q8 | 1 | C-8x8-K16 | 1.179648 | 1.310720 | 1.0555555555555556 |
| Q8 | 1 | D-8x8-K16 | 1.507328 | 1.966080 | 0.8260869565217391 |
| Q8 | 1 | D-4x8-K16 | 1.376256 | 2.031616 | 0.9047619047619048 |

Original/selected comparisons: {"B": {"value": 4.053571428571429, "status": "PILOT_ONLY", "differenceNs": 5603328, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.0952380952380953, "status": "PILOT_ONLY", "differenceNs": 131072, "gridNs": 65536}}

| Q8 | 128 | A-original | 8.814592 | 12.779520 | 1 |
| Q8 | 128 | B-16x16-K16 | 14.385152 | 19.791872 | 0.6127562642369021 |
| Q8 | 128 | B-8x8-K8 | 11.239424 | 16.842752 | 0.7842565597667639 |
| Q8 | 128 | C-8x8-K16 | 2.424832 | 3.735552 | 3.635135135135135 |
| Q8 | 128 | C-8x16-K16 | 2.392064 | 3.604480 | 3.684931506849315 |
| Q8 | 128 | D-8x8-K16 | 3.735552 | 5.898240 | 2.3596491228070176 |
| Q8 | 128 | D-8x16-K16 | 3.080192 | 4.128768 | 2.8617021276595747 |

Original/selected comparisons: {"B": {"value": 1.2798833819241981, "status": "PILOT_ONLY", "differenceNs": 3145728, "gridNs": 65536}, "C": {"value": 1.0136986301369864, "status": "WITHIN_ONE_GRID", "differenceNs": 32768, "gridNs": 65536}, "D": {"value": 1.2127659574468086, "status": "PILOT_ONLY", "differenceNs": 655360, "gridNs": 65536}}


## PART2REPEAT S2 actual evidence

Session 2 COMPLETE, independent verification PASS; UUID 92fad02a-17c7-4883-9987-2682e8b02890. Raw SHA256 e877780636014b958117d278a6dd38b2643667302f01df0509a59f1dba0cf8aa. Independently checked 46597 small outputs and 1000 timestamp samples. Errors 0; visibility {"initialState": "visible", "enteredBackground": false, "samplingEnteredBackground": false, "events": []}; manual environment {"thermal": "\u672a\u660e\u663e\u53d1\u70ed\uff0c\u6e29\u5ea6\u672a\u6d4b\u91cf", "charging": "\u6b63\u5728\u5145\u7535\uff0c\u7535\u91cf82%", "devtools": "\u672a\u5f00\u542f", "flag": "\u5df2\u505c\u7528"}. Distinct UUID from S1. Campaign 2/5, INCOMPLETE; fixed configurations retained, no pooled median or stable benefit claim. Large full outputs remain online verification evidence.

| Format | M | Candidate | median ms | p95 ms | A/candidate |
|---|---:|---|---:|---:|---:|
| Q4 | 1 | A-original | 1.245184 | 2.621440 | 1 |
| Q4 | 1 | B-16x16-K16 | 9.601024 | 11.665408 | 0.1296928327645051 |
| Q4 | 1 | B-8x8-K8 | 2.588672 | 6.094848 | 0.4810126582278481 |
| Q4 | 1 | C-8x8-K16 | 1.146880 | 1.376256 | 1.0857142857142856 |
| Q4 | 1 | D-8x8-K16 | 1.441792 | 1.900544 | 0.8636363636363636 |
| Q4 | 1 | D-4x8-K16 | 1.474560 | 2.031616 | 0.8444444444444444 |

Original/selected comparisons: {"B": {"value": 3.7088607594936707, "status": "PILOT_ONLY", "differenceNs": 7012352, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 0.9777777777777777, "status": "WITHIN_ONE_GRID", "differenceNs": -32768, "gridNs": 65536}}

| Q4 | 128 | A-original | 8.388608 | 10.289152 | 1 |
| Q4 | 128 | B-16x16-K16 | 12.779520 | 16.318464 | 0.6564102564102564 |
| Q4 | 128 | B-32x8-K16 | 9.142272 | 12.320768 | 0.9175627240143369 |
| Q4 | 128 | C-8x8-K16 | 2.162688 | 2.752512 | 3.878787878787879 |
| Q4 | 128 | D-8x8-K16 | 3.407872 | 4.325376 | 2.4615384615384617 |
| Q4 | 128 | D-8x16-K16 | 2.719744 | 3.538944 | 3.0843373493975905 |

Original/selected comparisons: {"B": {"value": 1.3978494623655915, "status": "PILOT_ONLY", "differenceNs": 3637248, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.2530120481927711, "status": "PILOT_ONLY", "differenceNs": 688128, "gridNs": 65536}}

| Q8 | 1 | A-original | 1.376256 | 2.621440 | 1 |
| Q8 | 1 | B-16x16-K16 | 7.340032 | 11.730944 | 0.1875 |
| Q8 | 1 | B-32x8-K16 | 1.671168 | 4.587520 | 0.8235294117647058 |
| Q8 | 1 | C-8x8-K16 | 1.212416 | 1.310720 | 1.135135135135135 |
| Q8 | 1 | D-8x8-K16 | 1.277952 | 1.900544 | 1.0769230769230769 |
| Q8 | 1 | D-4x8-K16 | 1.310720 | 2.031616 | 1.05 |

Original/selected comparisons: {"B": {"value": 4.392156862745098, "status": "PILOT_ONLY", "differenceNs": 5668864, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 0.975, "status": "WITHIN_ONE_GRID", "differenceNs": -32768, "gridNs": 65536}}

| Q8 | 128 | A-original | 9.011200 | 12.451840 | 1 |
| Q8 | 128 | B-16x16-K16 | 13.926400 | 19.791872 | 0.6470588235294118 |
| Q8 | 128 | B-8x8-K8 | 11.468800 | 17.760256 | 0.7857142857142857 |
| Q8 | 128 | C-8x8-K16 | 2.424832 | 4.063232 | 3.7162162162162162 |
| Q8 | 128 | C-8x16-K16 | 2.359296 | 3.080192 | 3.8194444444444446 |
| Q8 | 128 | D-8x8-K16 | 3.997696 | 5.963776 | 2.2540983606557377 |
| Q8 | 128 | D-8x16-K16 | 3.112960 | 4.194304 | 2.8947368421052633 |

Original/selected comparisons: {"B": {"value": 1.2142857142857142, "status": "PILOT_ONLY", "differenceNs": 2457600, "gridNs": 65536}, "C": {"value": 1.0277777777777777, "status": "WITHIN_ONE_GRID", "differenceNs": 65536, "gridNs": 65536}, "D": {"value": 1.2842105263157895, "status": "PILOT_ONLY", "differenceNs": 884736, "gridNs": 65536}}

### S1/S2 provisional direction check

4:1 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER; ratio range [3.6153846153846154, 3.7088607594936707].

4:1 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE; ratio range [1, 1].

4:1 D: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE; ratio range [0.9777777777777777, 0.9777777777777777].

4:128 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER; ratio range [1.3333333333333333, 1.3978494623655915].

4:128 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE; ratio range [1, 1].

4:128 D: S1 SELECTED_FASTER, S2 SELECTED_FASTER; ratio range [1.2530120481927711, 1.263157894736842].

8:1 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER; ratio range [4.053571428571429, 4.392156862745098].

8:1 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE; ratio range [1, 1].

8:1 D: S1 SELECTED_FASTER, S2 INDISTINGUISHABLE; ratio range [0.975, 1.0952380952380953].

8:128 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER; ratio range [1.2142857142857142, 1.2798833819241981].

8:128 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE; ratio range [1.0136986301369864, 1.0277777777777777].

8:128 D: S1 SELECTED_FASTER, S2 SELECTED_FASTER; ratio range [1.2127659574468086, 1.2842105263157895].


## PART2REPEAT S3 actual evidence

Session 3 COMPLETE, independent verification PASS; UUID 18a3332f-7cb9-414a-92de-967e92cb0f30. Raw SHA256 cacfc8f4574b2a73cb87eefec2a757504cbaea42f0a08213117ca674c0d70142. Independently checked 46597 small outputs and 1000 timestamp samples. Errors 0; visibility {"initialState": "visible", "enteredBackground": false, "samplingEnteredBackground": false, "events": []}; manual environment {"thermal": "\u672a\u660e\u663e\u53d1\u70ed\uff0c\u6e29\u5ea6\u672a\u6d4b\u91cf", "charging": "\u6b63\u5728\u5145\u7535\uff0c\u7535\u91cf82%", "devtools": "\u672a\u5f00\u542f", "flag": "\u5df2\u505c\u7528"}. UUID distinct from S1/S2. Campaign 3/5, INCOMPLETE; no reselection, pooled median or stable benefit claim. Large outputs remain online full-check evidence.

| Format | M | Candidate | median ms | p95 ms | A/candidate |
|---|---:|---|---:|---:|---:|
| Q4 | 1 | A-original | 1.310720 | 2.621440 | 1 |
| Q4 | 1 | B-16x16-K16 | 7.372800 | 11.468800 | 0.17777777777777778 |
| Q4 | 1 | B-8x8-K8 | 3.080192 | 6.094848 | 0.425531914893617 |
| Q4 | 1 | C-8x8-K16 | 1.146880 | 1.310720 | 1.1428571428571428 |
| Q4 | 1 | D-8x8-K16 | 1.540096 | 1.900544 | 0.851063829787234 |
| Q4 | 1 | D-4x8-K16 | 1.605632 | 1.966080 | 0.8163265306122449 |

Original/selected comparisons: {"B": {"value": 2.393617021276596, "status": "PILOT_ONLY", "differenceNs": 4292608, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 0.9591836734693877, "status": "WITHIN_ONE_GRID", "differenceNs": -65536, "gridNs": 65536}}

| Q4 | 128 | A-original | 3.670016 | 9.961472 | 1 |
| Q4 | 128 | B-16x16-K16 | 5.210112 | 16.908288 | 0.7044025157232704 |
| Q4 | 128 | B-32x8-K16 | 3.833856 | 11.534336 | 0.9572649572649573 |
| Q4 | 128 | C-8x8-K16 | 1.179648 | 4.063232 | 3.111111111111111 |
| Q4 | 128 | D-8x8-K16 | 1.605632 | 4.194304 | 2.2857142857142856 |
| Q4 | 128 | D-8x16-K16 | 1.245184 | 3.276800 | 2.9473684210526314 |

Original/selected comparisons: {"B": {"value": 1.358974358974359, "status": "PILOT_ONLY", "differenceNs": 1376256, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.2894736842105263, "status": "PILOT_ONLY", "differenceNs": 360448, "gridNs": 65536}}

| Q8 | 1 | A-original | 1.212416 | 2.490368 | 1 |
| Q8 | 1 | B-16x16-K16 | 9.142272 | 11.599872 | 0.13261648745519714 |
| Q8 | 1 | B-32x8-K16 | 1.736704 | 4.653056 | 0.6981132075471698 |
| Q8 | 1 | C-8x8-K16 | 1.245184 | 1.310720 | 0.9736842105263158 |
| Q8 | 1 | D-8x8-K16 | 1.376256 | 1.966080 | 0.8809523809523809 |
| Q8 | 1 | D-4x8-K16 | 1.474560 | 2.031616 | 0.8222222222222222 |

Original/selected comparisons: {"B": {"value": 5.264150943396227, "status": "PILOT_ONLY", "differenceNs": 7405568, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 0.9333333333333333, "status": "PILOT_ONLY", "differenceNs": -98304, "gridNs": 65536}}

| Q8 | 128 | A-original | 8.716288 | 12.648448 | 1 |
| Q8 | 128 | B-16x16-K16 | 14.221312 | 19.202048 | 0.6129032258064516 |
| Q8 | 128 | B-8x8-K8 | 11.403264 | 15.073280 | 0.764367816091954 |
| Q8 | 128 | C-8x8-K16 | 2.424832 | 3.407872 | 3.5945945945945947 |
| Q8 | 128 | C-8x16-K16 | 2.424832 | 3.538944 | 3.5945945945945947 |
| Q8 | 128 | D-8x8-K16 | 3.964928 | 6.356992 | 2.1983471074380163 |
| Q8 | 128 | D-8x16-K16 | 3.145728 | 4.194304 | 2.7708333333333335 |

Original/selected comparisons: {"B": {"value": 1.2471264367816093, "status": "PILOT_ONLY", "differenceNs": 2818048, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.2604166666666667, "status": "PILOT_ONLY", "differenceNs": 819200, "gridNs": 65536}}

### S1–S3 provisional direction check

4:1 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER; ratio range [2.393617021276596, 3.7088607594936707]; uncertain False.

4:1 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE; ratio range [1, 1]; uncertain True.

4:1 D: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE; ratio range [0.9591836734693877, 0.9777777777777777]; uncertain True.

4:128 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER; ratio range [1.3333333333333333, 1.3978494623655915]; uncertain False.

4:128 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE; ratio range [1, 1]; uncertain True.

4:128 D: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER; ratio range [1.2530120481927711, 1.2894736842105263]; uncertain False.

8:1 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER; ratio range [4.053571428571429, 5.264150943396227]; uncertain False.

8:1 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE; ratio range [1, 1]; uncertain True.

8:1 D: S1 SELECTED_FASTER, S2 INDISTINGUISHABLE, S3 SELECTED_SLOWER; ratio range [0.9333333333333333, 1.0952380952380953]; uncertain True.

8:128 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER; ratio range [1.2142857142857142, 1.2798833819241981]; uncertain False.

8:128 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE; ratio range [1, 1.0277777777777777]; uncertain True.

8:128 D: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER; ratio range [1.2127659574468086, 1.2842105263157895]; uncertain False.


## PART2REPEAT S4 actual evidence

Session 4 COMPLETE, independent verification PASS; UUID 7e48c6d2-236c-448d-a4eb-c441a7564942. Raw SHA256 7dd86a1b7f2f5a784c8605acdcd605b3193dc0e107ba36f69fa111353e2fcb7f. Independently checked 46597 small outputs and 1000 timestamp samples. Errors 0; visibility {"initialState": "visible", "enteredBackground": false, "samplingEnteredBackground": false, "events": []}; manual environment {"thermal": "\u672a\u660e\u663e\u53d1\u70ed\uff0c\u6e29\u5ea6\u672a\u6d4b\u91cf", "charging": "\u6b63\u5728\u5145\u7535\uff0c\u7535\u91cf82%", "devtools": "\u672a\u5f00\u542f", "flag": "\u5df2\u505c\u7528"}. UUID distinct from S1–S3. Campaign 4/5, INCOMPLETE; no reselection, pooled median or stable benefit claim. Large outputs remain online full-check evidence.

| Format | M | Candidate | median ms | p95 ms | A/candidate |
|---|---:|---|---:|---:|---:|
| Q4 | 1 | A-original | 1.212416 | 2.555904 | 1 |
| Q4 | 1 | B-16x16-K16 | 7.438336 | 11.665408 | 0.16299559471365638 |
| Q4 | 1 | B-8x8-K8 | 2.162688 | 6.160384 | 0.5606060606060606 |
| Q4 | 1 | C-8x8-K16 | 1.146880 | 1.310720 | 1.0571428571428572 |
| Q4 | 1 | D-8x8-K16 | 1.409024 | 1.900544 | 0.8604651162790697 |
| Q4 | 1 | D-4x8-K16 | 1.572864 | 1.966080 | 0.7708333333333334 |

Original/selected comparisons: {"B": {"value": 3.4393939393939394, "status": "PILOT_ONLY", "differenceNs": 5275648, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 0.8958333333333334, "status": "PILOT_ONLY", "differenceNs": -163840, "gridNs": 65536}}

| Q4 | 128 | A-original | 9.961472 | 11.468800 | 1 |
| Q4 | 128 | B-16x16-K16 | 14.286848 | 17.498112 | 0.6972477064220184 |
| Q4 | 128 | B-32x8-K16 | 9.961472 | 12.124160 | 1 |
| Q4 | 128 | C-8x8-K16 | 2.457600 | 3.080192 | 4.053333333333334 |
| Q4 | 128 | D-8x8-K16 | 3.932160 | 4.456448 | 2.533333333333333 |
| Q4 | 128 | D-8x16-K16 | 2.883584 | 3.604480 | 3.4545454545454546 |

Original/selected comparisons: {"B": {"value": 1.4342105263157894, "status": "PILOT_ONLY", "differenceNs": 4325376, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.3636363636363635, "status": "PILOT_ONLY", "differenceNs": 1048576, "gridNs": 65536}}

| Q8 | 1 | A-original | 1.146880 | 2.424832 | 1 |
| Q8 | 1 | B-16x16-K16 | 9.043968 | 11.599872 | 0.12681159420289856 |
| Q8 | 1 | B-32x8-K16 | 1.736704 | 4.587520 | 0.660377358490566 |
| Q8 | 1 | C-8x8-K16 | 1.245184 | 1.376256 | 0.9210526315789473 |
| Q8 | 1 | D-8x8-K16 | 1.441792 | 1.966080 | 0.7954545454545454 |
| Q8 | 1 | D-4x8-K16 | 1.507328 | 2.031616 | 0.7608695652173914 |

Original/selected comparisons: {"B": {"value": 5.2075471698113205, "status": "PILOT_ONLY", "differenceNs": 7307264, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 0.9565217391304348, "status": "WITHIN_ONE_GRID", "differenceNs": -65536, "gridNs": 65536}}

| Q8 | 128 | A-original | 3.571712 | 9.502720 | 1 |
| Q8 | 128 | B-16x16-K16 | 5.111808 | 17.629184 | 0.6987179487179487 |
| Q8 | 128 | B-8x8-K8 | 4.456448 | 11.862016 | 0.8014705882352942 |
| Q8 | 128 | C-8x8-K16 | 1.114112 | 3.145728 | 3.2058823529411766 |
| Q8 | 128 | C-8x16-K16 | 1.048576 | 2.752512 | 3.40625 |
| Q8 | 128 | D-8x8-K16 | 1.572864 | 4.521984 | 2.2708333333333335 |
| Q8 | 128 | D-8x16-K16 | 1.310720 | 3.997696 | 2.725 |

Original/selected comparisons: {"B": {"value": 1.1470588235294117, "status": "PILOT_ONLY", "differenceNs": 655360, "gridNs": 65536}, "C": {"value": 1.0625, "status": "WITHIN_ONE_GRID", "differenceNs": 65536, "gridNs": 65536}, "D": {"value": 1.2, "status": "PILOT_ONLY", "differenceNs": 262144, "gridNs": 65536}}

### S1–S4 provisional direction check

4:1 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER, S4 SELECTED_FASTER; ratio range [2.393617021276596, 3.7088607594936707]; uncertain False.

4:1 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE, S4 INDISTINGUISHABLE; ratio range [1, 1]; uncertain True.

4:1 D: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE, S4 SELECTED_SLOWER; ratio range [0.8958333333333334, 0.9777777777777777]; uncertain True.

4:128 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER, S4 SELECTED_FASTER; ratio range [1.3333333333333333, 1.4342105263157894]; uncertain False.

4:128 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE, S4 INDISTINGUISHABLE; ratio range [1, 1]; uncertain True.

4:128 D: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER, S4 SELECTED_FASTER; ratio range [1.2530120481927711, 1.3636363636363635]; uncertain False.

8:1 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER, S4 SELECTED_FASTER; ratio range [4.053571428571429, 5.264150943396227]; uncertain False.

8:1 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE, S4 INDISTINGUISHABLE; ratio range [1, 1]; uncertain True.

8:1 D: S1 SELECTED_FASTER, S2 INDISTINGUISHABLE, S3 SELECTED_SLOWER, S4 INDISTINGUISHABLE; ratio range [0.9333333333333333, 1.0952380952380953]; uncertain True.

8:128 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER, S4 SELECTED_FASTER; ratio range [1.1470588235294117, 1.2798833819241981]; uncertain False.

8:128 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE, S4 INDISTINGUISHABLE; ratio range [1, 1.0625]; uncertain True.

8:128 D: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER, S4 SELECTED_FASTER; ratio range [1.2, 1.2842105263157895]; uncertain False.


## Final five-session acceptance — S5

Campaign FIVE_SESSIONS_VERIFIED: five unique page/session UUIDs, all COMPLETE with independent PASS. 232,985 exported small outputs and 5,000 timestamp samples independently checked (1,250 warm-up,3,750 measured). Large outputs rely on online full checking. No pooled sample median. S5 raw SHA256 54b2d510b59100f648694111c3226989f233c1660d4c9f41d39060cfd53b144c. Historical evidence preserved.

| Session | UUID | Errors | Background | Manual conditions |
|---|---|---:|---|---|
| S1 | 11932e1a-80cc-48ee-9233-d822f09e9ba2 | 0 | False | {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量81%", "devtools": "未开启", "flag": "已停用"} |
| S2 | 92fad02a-17c7-4883-9987-2682e8b02890 | 0 | False | {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量82%", "devtools": "未开启", "flag": "已停用"} |
| S3 | 18a3332f-7cb9-414a-92de-967e92cb0f30 | 0 | False | {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量82%", "devtools": "未开启", "flag": "已停用"} |
| S4 | 7e48c6d2-236c-448d-a4eb-c441a7564942 | 0 | False | {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量82%", "devtools": "未开启", "flag": "已停用"} |
| S5 | ca229f89-9acc-46a4-ae3c-9ed9c5fce93f | 0 | False | {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量82%", "devtools": "未开启", "flag": "已停用"} |

Manual descriptions are self-reported, not instrumented thermal measurements or proof of identical GPU state. All runs used frozen configuration and shader hashes.

### S5 per-configuration statistics

| Format | M | Candidate | median ms | p95 ms | A/candidate |
|---|---:|---|---:|---:|---:|
| Q4 | 1 | A-original | 1.212416 | 2.490368 | 1 |
| Q4 | 1 | B-16x16-K16 | 7.929856 | 11.665408 | 0.15289256198347106 |
| Q4 | 1 | B-8x8-K8 | 2.129920 | 6.094848 | 0.5692307692307692 |
| Q4 | 1 | C-8x8-K16 | 1.146880 | 1.310720 | 1.0571428571428572 |
| Q4 | 1 | D-8x8-K16 | 1.507328 | 1.900544 | 0.8043478260869565 |
| Q4 | 1 | D-4x8-K16 | 1.441792 | 2.031616 | 0.8409090909090909 |

S5 original/selected: {"B": {"value": 3.723076923076923, "status": "PILOT_ONLY", "differenceNs": 5799936, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.0454545454545454, "status": "WITHIN_ONE_GRID", "differenceNs": 65536, "gridNs": 65536}}

| Q4 | 128 | A-original | 9.306112 | 12.845056 | 1 |
| Q4 | 128 | B-16x16-K16 | 14.123008 | 17.367040 | 0.6589327146171694 |
| Q4 | 128 | B-32x8-K16 | 9.928704 | 12.189696 | 0.9372937293729373 |
| Q4 | 128 | C-8x8-K16 | 2.490368 | 3.080192 | 3.736842105263158 |
| Q4 | 128 | D-8x8-K16 | 3.932160 | 4.980736 | 2.3666666666666667 |
| Q4 | 128 | D-8x16-K16 | 2.883584 | 3.407872 | 3.227272727272727 |

S5 original/selected: {"B": {"value": 1.4224422442244224, "status": "PILOT_ONLY", "differenceNs": 4194304, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.3636363636363635, "status": "PILOT_ONLY", "differenceNs": 1048576, "gridNs": 65536}}

| Q8 | 1 | A-original | 1.179648 | 2.293760 | 1 |
| Q8 | 1 | B-16x16-K16 | 8.552448 | 11.599872 | 0.13793103448275862 |
| Q8 | 1 | B-32x8-K16 | 1.835008 | 4.521984 | 0.6428571428571429 |
| Q8 | 1 | C-8x8-K16 | 1.245184 | 1.376256 | 0.9473684210526315 |
| Q8 | 1 | D-8x8-K16 | 1.441792 | 1.966080 | 0.8181818181818182 |
| Q8 | 1 | D-4x8-K16 | 1.376256 | 2.031616 | 0.8571428571428571 |

S5 original/selected: {"B": {"value": 4.660714285714286, "status": "PILOT_ONLY", "differenceNs": 6717440, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.0476190476190477, "status": "WITHIN_ONE_GRID", "differenceNs": 65536, "gridNs": 65536}}

| Q8 | 128 | A-original | 9.338880 | 12.713984 | 1 |
| Q8 | 128 | B-16x16-K16 | 13.402112 | 19.267584 | 0.6968215158924206 |
| Q8 | 128 | B-8x8-K8 | 11.436032 | 17.956864 | 0.8166189111747851 |
| Q8 | 128 | C-8x8-K16 | 2.359296 | 4.325376 | 3.9583333333333335 |
| Q8 | 128 | C-8x16-K16 | 2.392064 | 3.014656 | 3.904109589041096 |
| Q8 | 128 | D-8x8-K16 | 3.866624 | 5.308416 | 2.4152542372881354 |
| Q8 | 128 | D-8x16-K16 | 3.112960 | 4.390912 | 3 |

S5 original/selected: {"B": {"value": 1.171919770773639, "status": "PILOT_ONLY", "differenceNs": 1966080, "gridNs": 65536}, "C": {"value": 0.9863013698630136, "status": "WITHIN_ONE_GRID", "differenceNs": -32768, "gridNs": 65536}, "D": {"value": 1.2421052631578948, "status": "PILOT_ONLY", "differenceNs": 753664, "gridNs": 65536}}

### Ranges of five session statistics (not pooled samples)

| Format:M | Candidate | median range ms | p95 range ms | A/candidate range |
|---|---|---|---|---|
| 4:1 | A-original | 1.179648–1.310720 | 2.424832–2.621440 | [1, 1] |
| 4:1 | B-16x16-K16 | 7.372800–9.601024 | 11.468800–11.665408 | [0.1296928327645051, 0.17777777777777778] |
| 4:1 | B-8x8-K8 | 2.129920–3.080192 | 6.094848–6.160384 | [0.425531914893617, 0.5692307692307692] |
| 4:1 | C-8x8-K16 | 1.114112–1.146880 | 1.310720–1.376256 | [1.0571428571428572, 1.1428571428571428] |
| 4:1 | D-8x8-K16 | 1.409024–1.540096 | 1.900544–1.900544 | [0.8043478260869565, 0.8636363636363636] |
| 4:1 | D-4x8-K16 | 1.441792–1.605632 | 1.966080–2.031616 | [0.7708333333333334, 0.8444444444444444] |
| 4:128 | A-original | 3.604480–9.961472 | 9.961472–12.845056 | [1, 1] |
| 4:128 | B-16x16-K16 | 5.210112–14.286848 | 14.024704–17.498112 | [0.6564102564102564, 0.7044025157232704] |
| 4:128 | B-32x8-K16 | 3.833856–9.961472 | 11.534336–12.320768 | [0.9166666666666666, 1] |
| 4:128 | C-8x8-K16 | 1.179648–2.490368 | 2.621440–4.063232 | [3.0555555555555554, 4.053333333333334] |
| 4:128 | D-8x8-K16 | 1.572864–3.932160 | 4.194304–4.980736 | [2.2857142857142856, 2.533333333333333] |
| 4:128 | D-8x16-K16 | 1.245184–2.883584 | 3.014656–3.604480 | [2.8947368421052633, 3.4545454545454546] |
| 8:1 | A-original | 1.146880–1.376256 | 2.293760–2.621440 | [1, 1] |
| 8:1 | B-16x16-K16 | 7.340032–9.142272 | 11.599872–11.730944 | [0.12681159420289856, 0.1875] |
| 8:1 | B-32x8-K16 | 1.671168–1.835008 | 4.521984–4.718592 | [0.6428571428571429, 0.8235294117647058] |
| 8:1 | C-8x8-K16 | 1.179648–1.245184 | 1.310720–1.376256 | [0.9210526315789473, 1.135135135135135] |
| 8:1 | D-8x8-K16 | 1.277952–1.507328 | 1.900544–1.966080 | [0.7954545454545454, 1.0769230769230769] |
| 8:1 | D-4x8-K16 | 1.310720–1.507328 | 2.031616–2.031616 | [0.7608695652173914, 1.05] |
| 8:128 | A-original | 3.571712–9.338880 | 9.502720–12.779520 | [1, 1] |
| 8:128 | B-16x16-K16 | 5.111808–14.385152 | 17.629184–19.791872 | [0.6127562642369021, 0.6987179487179487] |
| 8:128 | B-8x8-K8 | 4.456448–11.468800 | 11.862016–17.956864 | [0.764367816091954, 0.8166189111747851] |
| 8:128 | C-8x8-K16 | 1.114112–2.424832 | 3.145728–4.325376 | [3.2058823529411766, 3.9583333333333335] |
| 8:128 | C-8x16-K16 | 1.048576–2.424832 | 2.752512–3.604480 | [3.40625, 3.904109589041096] |
| 8:128 | D-8x8-K16 | 1.572864–3.997696 | 4.521984–6.356992 | [2.1983471074380163, 2.4152542372881354] |
| 8:128 | D-8x16-K16 | 1.310720–3.145728 | 3.997696–4.390912 | [2.725, 3] |

| Format:M | Variant | original/selected ratio range | Directions S1–S5 |
|---|---|---|---|
| 4:1 | B | [2.393617021276596, 3.723076923076923] | SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER |
| 4:1 | C | [1, 1] | INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE |
| 4:1 | D | [0.8958333333333334, 1.0454545454545454] | INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, SELECTED_SLOWER, INDISTINGUISHABLE |
| 4:128 | B | [1.3333333333333333, 1.4342105263157894] | SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER |
| 4:128 | C | [1, 1] | INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE |
| 4:128 | D | [1.2530120481927711, 1.3636363636363635] | SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER |
| 8:1 | B | [4.053571428571429, 5.264150943396227] | SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER |
| 8:1 | C | [1, 1] | INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE |
| 8:1 | D | [0.9333333333333333, 1.0952380952380953] | SELECTED_FASTER, INDISTINGUISHABLE, SELECTED_SLOWER, INDISTINGUISHABLE, INDISTINGUISHABLE |
| 8:128 | B | [1.1470588235294117, 1.2798833819241981] | SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER |
| 8:128 | C | [0.9863013698630136, 1.0625] | INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE |
| 8:128 | D | [1.2, 1.2842105263157895] | SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER |

All B selections have lower median than original in all five sessions. M128 D selection likewise has lower median in both formats in all five. These are observed consistent directions under this synthetic prepared-input protocol, not proof of model acceleration or universal stable benefit. M1 D is uncertain: Q4 ratios 0.896–1.045, with S4 slower and others within-grid; Q8 ratios 0.933–1.095 with faster/slower reversals and within-grid observations. Q8 M128 C ratios 0.986–1.063 are all within one grid: no distinguishable improvement. Q4 C and Q8 M1 C selected/original are identical configurations, not an optimization comparison. Retain all data;do not reselect after unfavorable results.

The five repetitions address Part 2 repetition evidence only. Part 1 model repetitions, trustworthy per-kernel/breakdown and actual generated-token/phase metrics, physical GPU memory, true logical model shape and Adreno remain unresolved. No additional phone repetitions automatically started.

## BASELINE002 exact-length model sessions — READY_FOR_PHONE

Original assignment page 1 directly re-read:full prompts 128/512/1024 tokens,each metric >=5 runs with median/p95. New entry http://localhost:8000/src/baseline/sessions.html?v=baseline-session-v1 ;15 independent page/task/device attempts,one generation each,0 generation warm-up,requested combined capacity2048. Actual sizeInTokens(fullPrompt) must exactly match the target with template included;body/template counts and full text/hash exported. Stock runtime0.10.29 and existing Web model preserved. No profiler command/pass extensions or timestamp diagnosis. Only resource lifecycle wrappers reused plus directly available JS heap snapshots.

Question:How do observable initialization/combined generation/first callback/drain walls and scoped reported heap/logical allocations vary at prescribed input lengths? Setup and acceptance:docs/baseline_sessions_plan.md. Results NOT_RUN;CPU mock checks are not mobile/model evidence. Generation is first-use after separate tokenizer setup/drain;no output-token or pure prefill claim. Prompt/long-capacity compatibility awaits phone ordinal1 and longer configurations.

Coverage matrix:exact full-prompt length and five independent combined-wall/available-memory sessions READY_FOR_PHONE,not closed. Pure prefill/decode,real generated-token throughput/per-token or dispatch-token metrics remain UNAVAILABLE;physical GPU memory/deviceRSS not collected. Resource logical bytes and JS heap never replace residency/RSS. Current device remains Mali;Adreno and true logical layer shape gaps remain. After actual evidence arrives preserve originals,independently audit per-session boundaries/resource lifecycles and grouped median/nearest-rankp95/min/max;five-samplep95=max with weak tail evidence. Separate commit/push only after mobile acceptance.


## BASELINE002 ordinal 1 — L128 R1 actual evidence

COMPLETE, independent audit PASS. UUID a9637239-e0e3-4476-bb77-3e1dd0158fb7;raw SHA256 8fd3d0c51534493d6da61a1de78d0e91efcdf4c9ba2ce49de4afdfd916c50d4d. Runtime tokenizer returned exactly128 for the full templated string,body 120,template-only 8. Difference is observed,not a BOS/prefill tensor inference. Offline audit reconstructs exact string/hash and recorded counts;does not retokenize the model independently. Requested capacity2048 initialized successfully for this input,not yet evidence for longer configurations.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 259.800000 |
| modelInitializationMs | 91773.400000 |
| tokenPreparationMs | 74.600000 |
| tokenPreparationDrainMs | 116.300000 |
| generationCallToCompletionMs | 7963.100000 |
| firstCallbackMs | 2321.100000 |
| postGenerationDrainMs | 107.400000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量84%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of a row of the first matrix with each column of the second matrix.  The resulting matrix has dimensions equal to the product of the dimensions of the two input matrices.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16501424, "peakLogicalBytes": 83509264, "createdBytes": 83509264, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffers bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |

Campaign1/15:128 length1/5,512 and1024 length0/5. No multi-run median/p95 conclusion;one-sample summary is descriptive only. First callback is not pure prefill,callbacks not output-token counts,logical bytes/heap not physical GPU residency. Pure phases,true output tokens,deviceRSS and Adreno remain open. No repeat result commit/push yet.


## BASELINE002 ordinal 2 — L512 R1 actual evidence

COMPLETE, independent audit PASS. UUID a95374da-d3d9-4f95-a08a-f6059eb27367; raw SHA256 a9d1cc3dadc043a67db3319574f88d514f956340494bb8c2c84bfb6a3e459d79. Exact full-prompt tokenizer count 512, body 504, template-only 8. Offline audit verifies string/hash/recorded counts,not independent model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 48.700000 |
| modelInitializationMs | 88034.600000 |
| tokenPreparationMs | 144.800000 |
| tokenPreparationDrainMs | 49.600000 |
| generationCallToCompletionMs | 13661.900000 |
| firstCallbackMs | 7640.900000 |
| postGenerationDrainMs | 98.000000 |

Errors 0; visibility {"initialState": "visible", "enteredBackground": false, "events": []}; manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量84%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of each row of the first matrix with the corresponding column of the second matrix. The resulting matrix has the same dimensions as the product matrices, and each element is a scalar value.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16528400, "peakLogicalBytes": 83536240, "createdBytes": 83536240, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |

Campaign2/15:128 length1/5,512 length1/5,1024 length0/5. No multi-run conclusion for either length. First callback not pure prefill,logical payload/heap not physical residency;unknown texture formats retained. No output-token/phase/RSS/Adreno closure or result commit/push.


## BASELINE002 ordinal 3 — L1024 R1 actual evidence

COMPLETE, independent audit PASS. UUID 92f2cdf4-7ce5-4c98-a5b1-4ea1ae9eb9a5; raw SHA256 4ae4001e7eed0f6e1b865e4a481d466eceb8a1855ec6493eea97d8e9e95654bb. Exact full-prompt tokenizer count 1024, body 1016, template-only 8. Offline audit verifies string/hash/recorded counts,not independent model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 30.400000 |
| modelInitializationMs | 93478.200000 |
| tokenPreparationMs | 166.400000 |
| tokenPreparationDrainMs | 37.900000 |
| generationCallToCompletionMs | 19538.600000 |
| firstCallbackMs | 14603.400000 |
| postGenerationDrainMs | 101.600000 |

Errors 0; visibility {"initialState": "visible", "enteredBackground": false, "events": []}; manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量84%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication calculates the dot product of two vectors, but for matrices. It results in a new matrix where each element is the dot product of the corresponding rows of the first matrix and the columns of the second matrix.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16474448, "peakLogicalBytes": 83482288, "createdBytes": 83482288, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |

Campaign3/15:each prescribed length1/5. All three exact full-prompt lengths have now run with requestedcapacity2048;not five-session repeat acceptance. No multi-run conclusion. First callback not pure prefill,logical payload/heap not physical residency;unknown formats retained. True outputtoken/phase,RSS andAdreno gaps remain.


## BASELINE002 ordinal 4 — L512 R2 actual evidence

COMPLETE, independent audit PASS. UUID be1b1efe-0832-4ea9-95c3-606a60dc2d7f;raw SHA256 ceb8941645c61ee21cd2666add29f968cac6e895813c5d5300f4bb9fb8e8daa3. Exact full tokenizer count512;full prompt hash matches L512R1. Count evidence checked offline,not independent model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 33.500000 |
| modelInitializationMs | 84031.800000 |
| tokenPreparationMs | 71.800000 |
| tokenPreparationDrainMs | 128.100000 |
| generationCallToCompletionMs | 13639.900000 |
| firstCallbackMs | 7606.600000 |
| postGenerationDrainMs | 106.800000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of each row of the first matrix with the corresponding column of the second matrix. The resulting matrix has the same dimensions as the product matrices, and each element is a scalar value.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16528400, "peakLogicalBytes": 83536240, "createdBytes": 83536240, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |

L512 two-session descriptive wall statistics: {"runtimePreparationMs": {"count": 2, "median": 41.099999994039536, "p95": 48.69999998807907, "min": 33.5, "max": 48.69999998807907, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 2, "median": 86033.20000001788, "p95": 88034.60000002384, "min": 84031.80000001192, "max": 88034.60000002384, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 2, "median": 108.29999995231628, "p95": 144.79999995231628, "min": 71.79999995231628, "max": 144.79999995231628, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 2, "median": 88.84999996423721, "p95": 128.0999999642372, "min": 49.59999996423721, "max": 128.0999999642372, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 2, "median": 13650.899999976158, "p95": 13661.899999976158, "min": 13639.899999976158, "max": 13661.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 2, "median": 7623.749999970198, "p95": 7640.899999976158, "min": 7606.599999964237, "max": 7640.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 2, "median": 102.40000000596046, "p95": 106.80000001192093, "min": 98, "max": 106.80000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Small count,not five-repeat acceptance. Campaign4/15:128 1/5,512 2/5,1024 1/5. First callback not pure prefill,callback count not outputtokens,logical payload/heap not physical residency;unknown textures retained. No reselection/replacement or result commit/push.


## BASELINE002 ordinal 5 — L1024 R2 actual evidence

COMPLETE, independent audit PASS. UUID e4996762-0c31-4d2e-8de0-5a3a06222c7d;raw SHA256 0fc14e964873b71d385ce62c1ba3010a2fb7c9b7fdb97339eaa4aa620a3c54b8. Exact full tokenizer count1024;full prompt/hash unchanged from L1024R1. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 33.100000 |
| modelInitializationMs | 83766.400000 |
| tokenPreparationMs | 156.400000 |
| tokenPreparationDrainMs | 56.000000 |
| generationCallToCompletionMs | 20245.900000 |
| firstCallbackMs | 14928.300000 |
| postGenerationDrainMs | 93.400000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication calculates the dot product of two vectors, but for matrices. It results in a new matrix where each element is the dot product of the corresponding rows of the first matrix and the columns of the second matrix.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16474448, "peakLogicalBytes": 83482288, "createdBytes": 83482288, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |

L1024 two-session descriptive wall statistics: {"runtimePreparationMs": {"count": 2, "median": 31.75, "p95": 33.10000002384186, "min": 30.399999976158142, "max": 33.10000002384186, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 2, "median": 88622.29999998212, "p95": 93478.19999998808, "min": 83766.39999997616, "max": 93478.19999998808, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 2, "median": 161.40000000596046, "p95": 166.39999997615814, "min": 156.4000000357628, "max": 166.39999997615814, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 2, "median": 46.95000001788139, "p95": 56, "min": 37.90000003576279, "max": 56, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 2, "median": 19892.25, "p95": 20245.899999976158, "min": 19538.600000023842, "max": 20245.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 2, "median": 14765.84999999404, "p95": 14928.299999952316, "min": 14603.400000035763, "max": 14928.299999952316, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 2, "median": 97.5, "p95": 101.59999996423721, "min": 93.40000003576279, "max": 101.59999996423721, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Small count,not five-repeat acceptance. Campaign5/15:128 1/5,512 2/5,1024 2/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown texture formats remain recorded. No replacement or result commit/push.


## BASELINE002 ordinal 6 — L128 R2 actual evidence

COMPLETE, independent audit PASS. UUID a337c79c-4964-4f70-9608-4ffe5d83456d;raw SHA256 0fcc12110e79482ad6a0fbef3e7a77084c16484ca7cef2a612e238d9e62657f8. Exact full tokenizer count128;full prompt/hash unchanged from L128R1. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 36.700000 |
| modelInitializationMs | 82590.500000 |
| tokenPreparationMs | 101.300000 |
| tokenPreparationDrainMs | 106.500000 |
| generationCallToCompletionMs | 7997.600000 |
| firstCallbackMs | 2289.500000 |
| postGenerationDrainMs | 100.900000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of a row of the first matrix with each column of the second matrix.  The resulting matrix has dimensions equal to the product of the dimensions of the two input matrices.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16501424, "peakLogicalBytes": 83509264, "createdBytes": 83509264, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |

L128 two-session descriptive wall statistics: {"runtimePreparationMs": {"count": 2, "median": 148.25, "p95": 259.80000001192093, "min": 36.69999998807907, "max": 259.80000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 2, "median": 87181.95000001788, "p95": 91773.40000003576, "min": 82590.5, "max": 91773.40000003576, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 2, "median": 87.9500000178814, "p95": 101.30000001192093, "min": 74.60000002384186, "max": 101.30000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 2, "median": 111.40000000596046, "p95": 116.30000001192093, "min": 106.5, "max": 116.30000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 2, "median": 7980.349999964237, "p95": 7997.599999964237, "min": 7963.099999964237, "max": 7997.599999964237, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 2, "median": 2305.2999999821186, "p95": 2321.099999964237, "min": 2289.5, "max": 2321.099999964237, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 2, "median": 104.14999997615814, "p95": 107.39999997615814, "min": 100.89999997615814, "max": 107.39999997615814, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Small count,not five-repeat acceptance. Campaign6/15:each length2/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown texture formats retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 7 — L1024 R3 actual evidence

COMPLETE, independent audit PASS. UUID 77926bd1-9cf2-4bb6-a7e2-1408fb2bb8dd;raw SHA256 e7407b47357d1ea4c5d43cb279cc2edfad6631f1fe3efd171b5c023856584abd. Exact full tokenizer count1024;full prompt/hash unchanged from prior L1024 sessions. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 39.000000 |
| modelInitializationMs | 92673.300000 |
| tokenPreparationMs | 193.300000 |
| tokenPreparationDrainMs | 1.700000 |
| generationCallToCompletionMs | 20166.600000 |
| firstCallbackMs | 14898.400000 |
| postGenerationDrainMs | 94.800000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication calculates the dot product of two vectors, but for matrices. It results in a new matrix where each element is the dot product of the corresponding rows of the first matrix and the columns of the second matrix.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16474448, "peakLogicalBytes": 83482288, "createdBytes": 83482288, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |

L1024 three-session descriptive wall statistics: {"runtimePreparationMs": {"count": 3, "median": 33.10000002384186, "p95": 39, "min": 30.399999976158142, "max": 39, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 3, "median": 92673.30000001192, "p95": 93478.19999998808, "min": 83766.39999997616, "max": 93478.19999998808, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 3, "median": 166.39999997615814, "p95": 193.30000001192093, "min": 156.4000000357628, "max": 193.30000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 3, "median": 37.90000003576279, "p95": 56, "min": 1.699999988079071, "max": 56, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 3, "median": 20166.599999964237, "p95": 20245.899999976158, "min": 19538.600000023842, "max": 20245.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 3, "median": 14898.399999976158, "p95": 14928.299999952316, "min": 14603.400000035763, "max": 14928.299999952316, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 3, "median": 94.80000001192093, "p95": 101.59999996423721, "min": 93.40000003576279, "max": 101.59999996423721, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Small count,not five-repeat acceptance. Campaign7/15:128 2/5,512 2/5,1024 3/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 8 — L128 R3 actual evidence

COMPLETE, independent audit PASS. UUID 83f9aa2d-8707-4ce6-86e9-1dc2d72aadf4;raw SHA256 a715dd71687bcf87b688a8068d39381d8085713645f1537640be59747509022c. Exact full tokenizer count128;full prompt/hash unchanged from prior L128 sessions. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 40.900000 |
| modelInitializationMs | 91162.500000 |
| tokenPreparationMs | 52.500000 |
| tokenPreparationDrainMs | 155.400000 |
| generationCallToCompletionMs | 7862.400000 |
| firstCallbackMs | 2253.400000 |
| postGenerationDrainMs | 97.200000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of a row of the first matrix with each column of the second matrix.  The resulting matrix has dimensions equal to the product of the dimensions of the two input matrices.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16501424, "peakLogicalBytes": 83509264, "createdBytes": 83509264, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |

L128 three-session descriptive wall statistics: {"runtimePreparationMs": {"count": 3, "median": 40.89999997615814, "p95": 259.80000001192093, "min": 36.69999998807907, "max": 259.80000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 3, "median": 91162.5, "p95": 91773.40000003576, "min": 82590.5, "max": 91773.40000003576, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 3, "median": 74.60000002384186, "p95": 101.30000001192093, "min": 52.5, "max": 101.30000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 3, "median": 116.30000001192093, "p95": 155.4000000357628, "min": 106.5, "max": 155.4000000357628, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 3, "median": 7963.099999964237, "p95": 7997.599999964237, "min": 7862.400000035763, "max": 7997.599999964237, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 3, "median": 2289.5, "p95": 2321.099999964237, "min": 2253.400000035763, "max": 2321.099999964237, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 3, "median": 100.89999997615814, "p95": 107.39999997615814, "min": 97.19999998807907, "max": 107.39999997615814, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Small count,not five-repeat acceptance. Campaign8/15:128 3/5,512 2/5,1024 3/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 9 — L512 R3 actual evidence

COMPLETE, independent audit PASS. UUID f2275b6f-25e2-4cb6-8ef5-66d08bafcb82;raw SHA256 90e58dbceced3be81051c2f7000f00be86543746af90691222cc52b117a13edb. Exact full tokenizer count512;full prompt/hash unchanged from prior L512 sessions. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 38.300000 |
| modelInitializationMs | 92280.600000 |
| tokenPreparationMs | 79.900000 |
| tokenPreparationDrainMs | 121.500000 |
| generationCallToCompletionMs | 13479.700000 |
| firstCallbackMs | 7675.700000 |
| postGenerationDrainMs | 98.300000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of each row of the first matrix with the corresponding column of the second matrix. The resulting matrix has the same dimensions as the product matrices, and each element is a scalar value.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16528400, "peakLogicalBytes": 83536240, "createdBytes": 83536240, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |

L512 three-session descriptive wall statistics: {"runtimePreparationMs": {"count": 3, "median": 38.30000001192093, "p95": 48.69999998807907, "min": 33.5, "max": 48.69999998807907, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 3, "median": 88034.60000002384, "p95": 92280.60000002384, "min": 84031.80000001192, "max": 92280.60000002384, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 3, "median": 79.89999997615814, "p95": 144.79999995231628, "min": 71.79999995231628, "max": 144.79999995231628, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 3, "median": 121.5, "p95": 128.0999999642372, "min": 49.59999996423721, "max": 128.0999999642372, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 3, "median": 13639.899999976158, "p95": 13661.899999976158, "min": 13479.700000047684, "max": 13661.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 3, "median": 7640.899999976158, "p95": 7675.700000047684, "min": 7606.599999964237, "max": 7675.700000047684, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 3, "median": 98.30000001192093, "p95": 106.80000001192093, "min": 98, "max": 106.80000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Small count,not five-repeat acceptance. Campaign9/15:each length3/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 10 — L128 R4 actual evidence

COMPLETE, independent audit PASS. UUID f031db34-1b9a-4abf-b964-bcd1a83c80d6;raw SHA256 41533244d4132115b0d0667422680816bb2cb9b57f4ba17be9c29579caea983b. Exact full tokenizer count128;full prompt/hash unchanged from prior L128 sessions. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 43.200000 |
| modelInitializationMs | 88482.000000 |
| tokenPreparationMs | 92.700000 |
| tokenPreparationDrainMs | 105.800000 |
| generationCallToCompletionMs | 7957.600000 |
| firstCallbackMs | 2290.500000 |
| postGenerationDrainMs | 103.700000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of a row of the first matrix with each column of the second matrix.  The resulting matrix has dimensions equal to the product of the dimensions of the two input matrices.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16501424, "peakLogicalBytes": 83509264, "createdBytes": 83509264, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |

L128 four-session descriptive wall statistics: {"runtimePreparationMs": {"count": 4, "median": 42.04999998211861, "p95": 259.80000001192093, "min": 36.69999998807907, "max": 259.80000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 4, "median": 89822.25, "p95": 91773.40000003576, "min": 82590.5, "max": 91773.40000003576, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 4, "median": 83.65000000596046, "p95": 101.30000001192093, "min": 52.5, "max": 101.30000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 4, "median": 111.40000000596046, "p95": 155.4000000357628, "min": 105.79999995231628, "max": 155.4000000357628, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 4, "median": 7960.3499999940395, "p95": 7997.599999964237, "min": 7862.400000035763, "max": 7997.599999964237, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 4, "median": 2290.0, "p95": 2321.099999964237, "min": 2253.400000035763, "max": 2321.099999964237, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 4, "median": 102.2999999821186, "p95": 107.39999997615814, "min": 97.19999998807907, "max": 107.39999997615814, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Not five-repeat acceptance. Campaign10/15:128 4/5,512 3/5,1024 3/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 11 — L1024 R4 actual evidence

COMPLETE, independent audit PASS. UUID b5cd483f-70e0-4536-8340-09fc1b9dd1aa;raw SHA256 95825df69b6b464c20c9b06d0d38958884f02143a8fc4e3575d0b8a517e61a03. Exact full tokenizer count1024;full prompt/hash unchanged from prior L1024 sessions. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 36.600000 |
| modelInitializationMs | 93432.600000 |
| tokenPreparationMs | 111.600000 |
| tokenPreparationDrainMs | 67.000000 |
| generationCallToCompletionMs | 20185.800000 |
| firstCallbackMs | 14788.200000 |
| postGenerationDrainMs | 93.500000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication calculates the dot product of two vectors, but for matrices. It results in a new matrix where each element is the dot product of the corresponding rows of the first matrix and the columns of the second matrix.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16474448, "peakLogicalBytes": 83482288, "createdBytes": 83482288, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |

L1024 four-session descriptive wall statistics: {"runtimePreparationMs": {"count": 4, "median": 34.85000002384186, "p95": 39, "min": 30.399999976158142, "max": 39, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 4, "median": 93052.94999998808, "p95": 93478.19999998808, "min": 83766.39999997616, "max": 93478.19999998808, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 4, "median": 161.40000000596046, "p95": 193.30000001192093, "min": 111.60000002384186, "max": 193.30000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 4, "median": 46.95000001788139, "p95": 67, "min": 1.699999988079071, "max": 67, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 4, "median": 20176.19999998808, "p95": 20245.899999976158, "min": 19538.600000023842, "max": 20245.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 4, "median": 14843.299999982119, "p95": 14928.299999952316, "min": 14603.400000035763, "max": 14928.299999952316, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 4, "median": 94.15000000596046, "p95": 101.59999996423721, "min": 93.40000003576279, "max": 101.59999996423721, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Not five-repeat acceptance. Campaign11/15:128 4/5,512 3/5,1024 4/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 12 — L512 R4 actual evidence

COMPLETE, independent audit PASS. UUID 220645a9-e55b-4c99-bf46-4361bf63f358;raw SHA256 567c70ff31635f0b26c04cf5cd73244aedba570694307c2f82e300100ab16475. Exact full tokenizer count512;full prompt/hash unchanged from prior L512 sessions. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 50.000000 |
| modelInitializationMs | 91549.000000 |
| tokenPreparationMs | 104.600000 |
| tokenPreparationDrainMs | 100.600000 |
| generationCallToCompletionMs | 13581.000000 |
| firstCallbackMs | 7706.900000 |
| postGenerationDrainMs | 106.200000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of each row of the first matrix with the corresponding column of the second matrix. The resulting matrix has the same dimensions as the product matrices, and each element is a scalar value.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16528400, "peakLogicalBytes": 83536240, "createdBytes": 83536240, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |

L512 four-session descriptive wall statistics: {"runtimePreparationMs": {"count": 4, "median": 43.5, "p95": 50, "min": 33.5, "max": 50, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 4, "median": 89791.80000001192, "p95": 92280.60000002384, "min": 84031.80000001192, "max": 92280.60000002384, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 4, "median": 92.25, "p95": 144.79999995231628, "min": 71.79999995231628, "max": 144.79999995231628, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 4, "median": 111.0499999821186, "p95": 128.0999999642372, "min": 49.59999996423721, "max": 128.0999999642372, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 4, "median": 13610.449999988079, "p95": 13661.899999976158, "min": 13479.700000047684, "max": 13661.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 4, "median": 7658.300000011921, "p95": 7706.899999976158, "min": 7606.599999964237, "max": 7706.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 4, "median": 102.25, "p95": 106.80000001192093, "min": 98, "max": 106.80000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Not five-repeat acceptance. Campaign12/15:each length4/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 13 — L512 R5 actual evidence

COMPLETE, independent audit PASS. UUID 417e9106-9fbf-443c-8f2a-ce6ff878f737;raw SHA256 dbd70a81a93b8122e10955f417345d50864cf902fec463c920142a4d68891ae6. Exact full tokenizer count512;full prompt/hash unchanged across all five L512 sessions. Recorded counts checked,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 43.300000 |
| modelInitializationMs | 92103.100000 |
| tokenPreparationMs | 95.100000 |
| tokenPreparationDrainMs | 94.400000 |
| generationCallToCompletionMs | 13411.500000 |
| firstCallbackMs | 7721.300000 |
| postGenerationDrainMs | 96.800000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of each row of the first matrix with the corresponding column of the second matrix. The resulting matrix has the same dimensions as the product matrices, and each element is a scalar value.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16528400, "peakLogicalBytes": 83536240, "createdBytes": 83536240, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |

### L512 five-session wall statistics

| Metric | median ms | nearest-rank p95 ms | min ms | max ms |
|---|---:|---:|---:|---:|
| runtimePreparationMs | 43.300000 | 50.000000 | 33.500000 | 50.000000 |
| modelInitializationMs | 91549.000000 | 92280.600000 | 84031.800000 | 92280.600000 |
| tokenPreparationMs | 95.100000 | 144.800000 | 71.800000 | 144.800000 |
| tokenPreparationDrainMs | 100.600000 | 128.100000 | 49.600000 | 128.100000 |
| generationCallToCompletionMs | 13581.000000 | 13661.900000 | 13411.500000 | 13661.900000 |
| firstCallbackMs | 7675.700000 | 7721.300000 | 7606.600000 | 7721.300000 |
| postGenerationDrainMs | 98.300000 | 106.800000 | 96.800000 | 106.800000 |

Five samples p95 equals maximum,weak tail evidence. L512 combined-wall/observable memory repeats verified,not purephase acceptance. Campaign13/15:128 4/5,512 5/5,1024 4/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 14 — L128 R5 actual evidence

COMPLETE, independent audit PASS. UUID ab93338f-401c-48b4-b3e7-c0a2e5cab251;raw SHA256 557a8868824f653262c0c2153fb2591907fa426402d1a969359cb966d43c5cae. Exact full tokenizer count128;full prompt/hash unchanged across all five L128 sessions. Recorded counts checked,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 49.100000 |
| modelInitializationMs | 83152.100000 |
| tokenPreparationMs | 99.500000 |
| tokenPreparationDrainMs | 106.000000 |
| generationCallToCompletionMs | 8096.300000 |
| firstCallbackMs | 2293.000000 |
| postGenerationDrainMs | 100.600000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of a row of the first matrix with each column of the second matrix.  The resulting matrix has dimensions equal to the product of the dimensions of the two input matrices.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16501424, "peakLogicalBytes": 83509264, "createdBytes": 83509264, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |

### L128 five-session wall statistics

| Metric | median ms | nearest-rank p95 ms | min ms | max ms |
|---|---:|---:|---:|---:|
| runtimePreparationMs | 43.200000 | 259.800000 | 36.700000 | 259.800000 |
| modelInitializationMs | 88482.000000 | 91773.400000 | 82590.500000 | 91773.400000 |
| tokenPreparationMs | 92.700000 | 101.300000 | 52.500000 | 101.300000 |
| tokenPreparationDrainMs | 106.500000 | 155.400000 | 105.800000 | 155.400000 |
| generationCallToCompletionMs | 7963.100000 | 8096.300000 | 7862.400000 | 8096.300000 |
| firstCallbackMs | 2290.500000 | 2321.100000 | 2253.400000 | 2321.100000 |
| postGenerationDrainMs | 100.900000 | 107.400000 | 97.200000 | 107.400000 |

Five samples p95 equals maximum,weak tail evidence. L128 combined-wall/observable memory repeats verified,not purephase acceptance. Campaign14/15:128 5/5,512 5/5,1024 4/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 15 — L1024 R5 and final acceptance

COMPLETE / independent PASS. UUID 72c11448-3bfb-4742-b0a2-d0fb8c74d57a;raw SHA256 f9de79fb4c6d416b159cc42ad075a7ac91d1de94b4bd6cfb0cd827e7b0531236. Exact full token count1024 with fixed prompt hash. Errors0,background false. S15 walls {"runtimePreparationMs": 31.899999976158142, "modelInitializationMs": 83471.30000001192, "tokenPreparationMs": 102.59999996423721, "tokenPreparationDrainMs": 88.89999997615814, "generationCallToCompletionMs": 20111, "firstCallbackMs": 14834.199999988079, "postGenerationDrainMs": 99.89999997615814}. Output "Matrix multiplication calculates the dot product of two vectors, but for matrices. It results in a new matrix where each element is the dot product of the corresponding rows of the first matrix and the columns of the second matrix.\n\n\n\n". Logical resource audit {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16474448, "peakLogicalBytes": 83482288, "createdBytes": 83482288, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

Campaign FIFTEEN_SESSIONS_VERIFIED:each128/512/1024 input5 independent COMPLETE/audited sessions. All errors0,no recorded background transition,no metadata/diagnostic loss. Original raw bytes retained. Token counts are actual pinned-runtime returns,not independent offline tokenizer reruns.

### Final per-session walls

| Ordinal | Length | Rep | Init s | Generation s | First callback s | Drain ms |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 128 | 1 | 91.773400 | 7.963100 | 2.321100 | 107.400000 |
| 2 | 512 | 1 | 88.034600 | 13.661900 | 7.640900 | 98.000000 |
| 3 | 1024 | 1 | 93.478200 | 19.538600 | 14.603400 | 101.600000 |
| 4 | 512 | 2 | 84.031800 | 13.639900 | 7.606600 | 106.800000 |
| 5 | 1024 | 2 | 83.766400 | 20.245900 | 14.928300 | 93.400000 |
| 6 | 128 | 2 | 82.590500 | 7.997600 | 2.289500 | 100.900000 |
| 7 | 1024 | 3 | 92.673300 | 20.166600 | 14.898400 | 94.800000 |
| 8 | 128 | 3 | 91.162500 | 7.862400 | 2.253400 | 97.200000 |
| 9 | 512 | 3 | 92.280600 | 13.479700 | 7.675700 | 98.300000 |
| 10 | 128 | 4 | 88.482000 | 7.957600 | 2.290500 | 103.700000 |
| 11 | 1024 | 4 | 93.432600 | 20.185800 | 14.788200 | 93.500000 |
| 12 | 512 | 4 | 91.549000 | 13.581000 | 7.706900 | 106.200000 |
| 13 | 512 | 5 | 92.103100 | 13.411500 | 7.721300 | 96.800000 |
| 14 | 128 | 5 | 83.152100 | 8.096300 | 2.293000 | 100.600000 |
| 15 | 1024 | 5 | 83.471300 | 20.111000 | 14.834200 | 99.900000 |

### Final summary (grouped by full prompt count,not pooled)

| Tokens | Metric | median ms | nearest-rank p95 ms | min ms | max ms |
|---:|---|---:|---:|---:|---:|
| 128 | runtimePreparationMs | 43.200000 | 259.800000 | 36.700000 | 259.800000 |
| 128 | modelInitializationMs | 88482.000000 | 91773.400000 | 82590.500000 | 91773.400000 |
| 128 | tokenPreparationMs | 92.700000 | 101.300000 | 52.500000 | 101.300000 |
| 128 | tokenPreparationDrainMs | 106.500000 | 155.400000 | 105.800000 | 155.400000 |
| 128 | generationCallToCompletionMs | 7963.100000 | 8096.300000 | 7862.400000 | 8096.300000 |
| 128 | firstCallbackMs | 2290.500000 | 2321.100000 | 2253.400000 | 2321.100000 |
| 128 | postGenerationDrainMs | 100.900000 | 107.400000 | 97.200000 | 107.400000 |
| 512 | runtimePreparationMs | 43.300000 | 50.000000 | 33.500000 | 50.000000 |
| 512 | modelInitializationMs | 91549.000000 | 92280.600000 | 84031.800000 | 92280.600000 |
| 512 | tokenPreparationMs | 95.100000 | 144.800000 | 71.800000 | 144.800000 |
| 512 | tokenPreparationDrainMs | 100.600000 | 128.100000 | 49.600000 | 128.100000 |
| 512 | generationCallToCompletionMs | 13581.000000 | 13661.900000 | 13411.500000 | 13661.900000 |
| 512 | firstCallbackMs | 7675.700000 | 7721.300000 | 7606.600000 | 7721.300000 |
| 512 | postGenerationDrainMs | 98.300000 | 106.800000 | 96.800000 | 106.800000 |
| 1024 | runtimePreparationMs | 33.100000 | 39.000000 | 30.400000 | 39.000000 |
| 1024 | modelInitializationMs | 92673.300000 | 93478.200000 | 83471.300000 | 93478.200000 |
| 1024 | tokenPreparationMs | 156.400000 | 193.300000 | 102.600000 | 193.300000 |
| 1024 | tokenPreparationDrainMs | 56.000000 | 88.900000 | 1.700000 | 88.900000 |
| 1024 | generationCallToCompletionMs | 20166.600000 | 20245.900000 | 19538.600000 | 20245.900000 |
| 1024 | firstCallbackMs | 14834.200000 | 14928.300000 | 14603.400000 | 14928.300000 |
| 1024 | postGenerationDrainMs | 94.800000 | 101.600000 | 93.400000 | 101.600000 |

### Final memory channels by stage (no sums across channels)

| Tokens | Stage | Channel | Metric | count | median bytes | p95 bytes | range bytes |
|---:|---|---|---|---:|---|---|---|
| 128 | AFTER_CLEANUP | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_CLEANUP | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_CLEANUP | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | AFTER_CLEANUP | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16501424 | 16501424 | 16501424–16501424 |
| 128 | AFTER_CLEANUP | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83509264 | 83509264 | 83509264–83509264 |
| 128 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 128 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 128 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | AFTER_DEVICE_DESTROY | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16501424 | 16501424 | 16501424–16501424 |
| 128 | AFTER_DEVICE_DESTROY | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83509264 | 83509264 | 83509264–83509264 |
| 128 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 128 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 128 | AFTER_DRAIN | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_DRAIN | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_DRAIN | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | AFTER_DRAIN | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83509264 | 83509264 | 83509264–83509264 |
| 128 | AFTER_DRAIN | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83509264 | 83509264 | 83509264–83509264 |
| 128 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | AFTER_GENERATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_GENERATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_GENERATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | AFTER_GENERATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83509264 | 83509264 | 83509264–83509264 |
| 128 | AFTER_GENERATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83509264 | 83509264 | 83509264–83509264 |
| 128 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | AFTER_INIT | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_INIT | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_INIT | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | AFTER_INIT | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 128 | AFTER_INIT | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 128 | AFTER_INIT | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_INIT | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_INIT | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | AFTER_TASK_CLOSE | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_TASK_CLOSE | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_TASK_CLOSE | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | AFTER_TASK_CLOSE | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16501424 | 16501424 | 16501424–16501424 |
| 128 | AFTER_TASK_CLOSE | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83509264 | 83509264 | 83509264–83509264 |
| 128 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 128 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 128 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | AFTER_TOKEN_PREPARATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 128 | AFTER_TOKEN_PREPARATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 128 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_GENERATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | BEFORE_GENERATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | BEFORE_GENERATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | BEFORE_GENERATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 128 | BEFORE_GENERATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 128 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_INIT | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | BEFORE_INIT | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | BEFORE_INIT | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | BEFORE_INIT | trackedBufferLogicalBytes | currentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_INIT | trackedBufferLogicalBytes | peakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_RUNTIME | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | BEFORE_RUNTIME | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | BEFORE_RUNTIME | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | BEFORE_RUNTIME | trackedBufferLogicalBytes | currentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_RUNTIME | trackedBufferLogicalBytes | peakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | FIRST_CALLBACK | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | FIRST_CALLBACK | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | FIRST_CALLBACK | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | FIRST_CALLBACK | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83104624 | 83104624 | 83104624–83104624 |
| 128 | FIRST_CALLBACK | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83104624 | 83104624 | 83104624–83104624 |
| 128 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | AFTER_CLEANUP | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_CLEANUP | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_CLEANUP | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | AFTER_CLEANUP | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16528400 | 16528400 | 16528400–16528400 |
| 512 | AFTER_CLEANUP | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83536240 | 83536240 | 83536240–83536240 |
| 512 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 512 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 512 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | AFTER_DEVICE_DESTROY | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16528400 | 16528400 | 16528400–16528400 |
| 512 | AFTER_DEVICE_DESTROY | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83536240 | 83536240 | 83536240–83536240 |
| 512 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 512 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 512 | AFTER_DRAIN | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_DRAIN | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_DRAIN | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | AFTER_DRAIN | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83536240 | 83536240 | 83536240–83536240 |
| 512 | AFTER_DRAIN | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83536240 | 83536240 | 83536240–83536240 |
| 512 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | AFTER_GENERATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_GENERATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_GENERATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | AFTER_GENERATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83536240 | 83536240 | 83536240–83536240 |
| 512 | AFTER_GENERATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83536240 | 83536240 | 83536240–83536240 |
| 512 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | AFTER_INIT | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_INIT | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_INIT | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | AFTER_INIT | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 512 | AFTER_INIT | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 512 | AFTER_INIT | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_INIT | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_INIT | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | AFTER_TASK_CLOSE | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_TASK_CLOSE | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_TASK_CLOSE | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | AFTER_TASK_CLOSE | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16528400 | 16528400 | 16528400–16528400 |
| 512 | AFTER_TASK_CLOSE | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83536240 | 83536240 | 83536240–83536240 |
| 512 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 512 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 512 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | AFTER_TOKEN_PREPARATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 512 | AFTER_TOKEN_PREPARATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 512 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_GENERATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | BEFORE_GENERATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | BEFORE_GENERATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | BEFORE_GENERATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 512 | BEFORE_GENERATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 512 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_INIT | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | BEFORE_INIT | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | BEFORE_INIT | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | BEFORE_INIT | trackedBufferLogicalBytes | currentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_INIT | trackedBufferLogicalBytes | peakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_RUNTIME | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | BEFORE_RUNTIME | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | BEFORE_RUNTIME | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | BEFORE_RUNTIME | trackedBufferLogicalBytes | currentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_RUNTIME | trackedBufferLogicalBytes | peakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | FIRST_CALLBACK | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | FIRST_CALLBACK | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | FIRST_CALLBACK | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | FIRST_CALLBACK | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83104624 | 83104624 | 83104624–83104624 |
| 512 | FIRST_CALLBACK | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83104624 | 83104624 | 83104624–83104624 |
| 512 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | AFTER_CLEANUP | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_CLEANUP | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_CLEANUP | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | AFTER_CLEANUP | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16474448 | 16474448 | 16474448–16474448 |
| 1024 | AFTER_CLEANUP | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83482288 | 83482288 | 83482288–83482288 |
| 1024 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 1024 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 1024 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | AFTER_DEVICE_DESTROY | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16474448 | 16474448 | 16474448–16474448 |
| 1024 | AFTER_DEVICE_DESTROY | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83482288 | 83482288 | 83482288–83482288 |
| 1024 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 1024 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 1024 | AFTER_DRAIN | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_DRAIN | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_DRAIN | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | AFTER_DRAIN | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83482288 | 83482288 | 83482288–83482288 |
| 1024 | AFTER_DRAIN | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83482288 | 83482288 | 83482288–83482288 |
| 1024 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | AFTER_GENERATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_GENERATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_GENERATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | AFTER_GENERATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83482288 | 83482288 | 83482288–83482288 |
| 1024 | AFTER_GENERATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83482288 | 83482288 | 83482288–83482288 |
| 1024 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | AFTER_INIT | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_INIT | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_INIT | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | AFTER_INIT | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 1024 | AFTER_INIT | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 1024 | AFTER_INIT | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_INIT | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_INIT | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | AFTER_TASK_CLOSE | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_TASK_CLOSE | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_TASK_CLOSE | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | AFTER_TASK_CLOSE | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16474448 | 16474448 | 16474448–16474448 |
| 1024 | AFTER_TASK_CLOSE | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83482288 | 83482288 | 83482288–83482288 |
| 1024 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 1024 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 1024 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | AFTER_TOKEN_PREPARATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 1024 | AFTER_TOKEN_PREPARATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 1024 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_GENERATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | BEFORE_GENERATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | BEFORE_GENERATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | BEFORE_GENERATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 1024 | BEFORE_GENERATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 1024 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_INIT | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | BEFORE_INIT | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | BEFORE_INIT | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | BEFORE_INIT | trackedBufferLogicalBytes | currentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_INIT | trackedBufferLogicalBytes | peakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_RUNTIME | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | BEFORE_RUNTIME | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | BEFORE_RUNTIME | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | BEFORE_RUNTIME | trackedBufferLogicalBytes | currentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_RUNTIME | trackedBufferLogicalBytes | peakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | FIRST_CALLBACK | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | FIRST_CALLBACK | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | FIRST_CALLBACK | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | FIRST_CALLBACK | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83104624 | 83104624 | 83104624–83104624 |
| 1024 | FIRST_CALLBACK | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83104624 | 83104624 | 83104624–83104624 |
| 1024 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |

JS used/total heap returned10,000,000 bytes in all captured snapshots;limit3,760,000,000. This coarse/repeated API return is not proof of no growth or actual total engine/WASM memory. Known texture peak308,026,776 bytes is a partial texel-payload subtotal:333 texture creations/run had unsupported formats rgba32uint227,rgba16uint91,rgba32sint9,rgba8uint6. Unknown descriptors retained;not unknown hardware formats,just not supported by this observer table. During active runtime their total payload is UNAVAILABLE. No physical residency/RSS claim. Buffer after-init83,077,648 bytes;post-drain perlength values in summary;explicit-destroy bookkeeping after device close cannot prove leaks/reclamation.

First callback is not pure prefill;generation-to-promise is combined request wall;callback count not actual output tokens. Initializations include local fetch/WASM/device/observation and are not cold-cache or GPU-only. Model disk size not memory. Fifteen results close exact input-length and five-repeat evidence for these observable scopes only;pure phases,true outputtoken throughput/per-token/kernel attribution,deviceRSS andAdreno remain open. No timestamps/profiler command expansion or runtime/model optimization.


## MEMORY001: offline texture accounting (2026-10-06)

All 15 BASELINE002 sessions independently audited: 7,500 recorded texture creations, all six formats now accounted for in derived files. See [texture payload accounting](../docs/memory001_texture_accounting.md) for per-session cumulative creation, active explicit-lifecycle peak and every stage snapshot. Original partial-map counters and all 41 historical raw hashes retained unchanged. This closes the recorded-format payload gap, not physical GPU residency, native/WASM heap or Chrome RSS/PSS. JS heap, buffer logical bytes and texture logical payload remain separate. No phone/model rerun, adb or trace collection; assignment memory remains PARTIAL.


## MEMORY002 archived partial pilot

One128-token page session COMPLETE and independently audited; initialization86.527s, generation7.997s, first callback2.318s, drain103ms. Five process snapshots retained with separate PSS/RSS and JS/buffer/texture scopes. Held-stage browser/GPU roles verified; target renderer UNKNOWN. Armed generation role metadata failed locally, phase/clock alignment not independently proven; PAGE_IDLE process baseline missing. See [pilot results](../docs/memory002_pilot_results.md). Memory requirement remains PARTIAL, not physical/model-exclusive memory or continuous peak. No replacement run or fabricated role/phase.


## MEMORY002 protocol v2 — offline correction

Historical pilot remains PARTIAL. Latest authoritative method: [mandatory idle/handshake/clock protocol](../docs/memory002_capture_protocol.md). Old operator-only v1 instructions are historical and do not grant formal capture. Run serve_memory002.py on loopback8000; phone entry /src/baseline/sessions.html?memory002=1&v=memory002-v2. Initialization blocked until role-qualified idle receipt. Scope narrowed to browser/GPU process PSS/RSS; target renderer UNKNOWN. Generation windows require bracketing offset/uncertainty audit; no model-exclusive/physical GPU memory or continuous peak. CPU checks completed, v2 phone check NOT_RUN; assignment memory remains PARTIAL.


## MEMORY002 v2 observed protocol pilot

[One128-token v2 result](../docs/memory002_v2_pilot_results.md): PROTOCOL_PASS_WITH_CONDITION_WARNING. Required4/4 stage coverage, five snapshots, fresh browser/GPU readings and idle deltas, bounded generation timing (~28.975ms uncertainty), all10 debug-forward cleanups verified. Initialization background5.606s retained; target renderer UNKNOWN, zygote strict meminfo unavailable. One protocol pilot only: not five-repeat memory acceptance, model-exclusive/physical GPU memory or continuous peak. Historical PARTIAL pilot unchanged; no extra trial scheduled.
