# Assignment audit and direct next steps — 2026-10-05

Source is project original assignment/webgpu_adreno_assignment.pdf,three pages,SHA256 dc02d42a5fdf521b75794ac641478cfe91ec7d9e165fa93a1c2e43b3ec63e9c3. Read directly with bundled pypdf;verbatim requirements below are local document text,not prior chat reconstruction. REQUIRED denotes Task/Metrics/Requirements/Deliverable wording. Methods are listed techniques;optional is explicit only for “if available”;classification examples/results table/rubric are labeled Example/Suggested in original. Q4/Q8 wording does not clearly specify whether both formats are mandatory—retain ambiguity for clarification,do not silently choose completion criteria.

|Part/page|Original requirement|Type|Existing evidence/status|Concrete gap|Minimum next work|
|---|---|---|---|---|---|
|Target1|Gemma E2B (Gemma 3n);Snapdragon device with Adreno GPU;Chrome for Android,WebGPU|REQUIRED|Gemma3n E2B Web/MediaPipe.10.29 runs;current device Mali|Final Adreno measurements absent|Obtain target Adreno access before scored results;Mali stays interim|
|1,p1|Run Gemma E2B on an existing WebGPU stack…Do not optimize anything in this part|REQUIRED;named stacks examples|BASELINE001 successful,stock runtime/model preserved|Not completed scored profiling|Keep uninstrumented stock control|
|1,p1|Run each metric at least 5 times and report the median and p95|REQUIRED|Pilots,not5 independent scored runs|Independent repeated metric datasets|Freeze accepted metrics/protocol then>=5 runs,do not pool unrelated pilots|
|1,p1|Tokens/sec — Decode throughput|REQUIRED|NOT_MEASURED|Actual generated IDs/count and decode boundary|One bounded public/native hook feasibility review;no text retokenization denominator|
|1,p1|Prefill latency — Fixed prompts of128,512,and1024 tokens|REQUIRED|Full pilot prompt tokenizer18;maxTokens512|Exact three prompt lengths,pure prefill boundary,capacity|Prepare full-templated prompts with runtime sizeInTokens;validate larger total capacity,then phase observability|
|1,p1|Decode latency per token — Report distribution,not just mean|REQUIRED|Stream callbacks wall only|True token events/phase boundary|Same token hook review;otherwise UNAVAILABLE with evidence|
|1,p1|Memory usage — GPU buffers,JS heap,device RSS|REQUIRED|PROFILE002 logical buffers;no physical residency claim|JS heap,RSS controlled snapshots and coverage|Read-only adb PID/RSS/PSS + JS feature probe,model-init/gen/postclose scope;keep channels separate|
|1,p1|Kernel(dispatch) count per token — Count from command stream|REQUIRED|126402 submitted generation dispatches|True token denominator/association|Token event evidence first;dispatch count remains request-level|
|1,p1–2|Individual kernel execution time — Per-kernel table,grouped by op type;stacked time-breakdown chart|REQUIRED|Structure table180 identities/132 hashes/2005 passes;TIMING002 reproduces overlap|Exclusive per-kernel duration,valid additive shares unavailable|One bounded Chrome trace feasibility pilot checking attributable GPU slices;do not keep investigating same timestamps|
|1,p1|WebGPU timestamp-query…Chrome tracing and chrome://gpu…adb shell dumpsys meminfo|Listed profiling methods|Timestamp controls and chrome GPU evidence done;trace/meminfo dataset absent|Pipeline tracing + measured memory|Capture inspectable trace/memory with precise scope;not replace metrics by counts|
|1,p1|Snapdragon Profiler for hardware counters,if available|Explicit availability condition|No Adreno/counters|Tool/device support|Check only once target available;report unavailable honestly|
|1,p1–2|Identify top2–3 bottleneck kernels…classify dominant bottleneck…justify with evidence|REQUIRED;bandwidth/compute/sync/launch/dequant/occupancy evidence rows are examples|Shader arithmetic classified;no valid cost ranking|Timed attribution/counters/matched comparisons|Do not infer ranking from dispatch count;mark pending validated trace or isolated op evidence|
|1,p2|Methodology including device,driver,Chrome version,and thermal state|REQUIRED|Environment/manual states and measured boundaries documented|Target Adreno driver and>=5 run controls|Repeat on target,temperature recorded with method or unmeasured|
|2,p2|Pipeline.Q4/Q8 weights,then dequantization,then matrix multiplication,then FP16 accumulation|REQUIRED pipeline;Q4 vs Q8 exact coverage ambiguous|Current custom kernels FP32 only|Explicit quantization format/scales/zeros/packing and FP16 accumulation|First FP16 dense baseline/fallback;then freeze one format with reference,clarify both formats expectation|
|2,p2|A.Baseline naive WGSL;B.Tiled GEMM using workgroup shared memory|REQUIRED variants|GEMM001/002 correctness/timing on representative FP32 shapes|Required pipeline precision/real layer shapes/Adreno|Adapt existing implementations to controlled FP16 contract,next rounds|
|2,p2|C.Tiled with vectorized loads(vec4,packed u32)|REQUIRED variant|NOT_IMPLEMENTED;M1 specialized is supplementary|Vectorized loads kernel|Implement one fixed C after matching precision/shape contract;specialized does not replace C|
|2,p2|D.Fused dequant + GEMM|REQUIRED variant|NOT_IMPLEMENTED;runtime Q4 shaders classified|Custom fused quantized path and matched unfused comparison|After format proof implement D;FP16 mat4 unpack is not INT4 dequant|
|2,p2|Benchmark each kernel in isolation on Gemma's real layer shapes:decode GEMV(M=1) and prefill(M>=128)|REQUIRED|Representative M1/M128;GEMM004 proven executionM8 only,NOT_RUN|Valid real layer M1/M>=128 shape evidence|Offline model/operator metadata review;executionM8 does not fulfill either shape|
|2,p2|Sweep tile sizes and workgroup sizes|REQUIRED|One fixed tile16,WG64 specialized|Controlled sweep|After A-D correctness,small predeclared legal tile/WG sweep;not auto-tune now|
|2,p2|Report GFLOPS,effective GB/s,and correctness(max absolute error against FP32 reference)|REQUIRED|FP32/Binary64 online errors,preliminary nominal GFLOPS where resolved|Required FP32 reference for quantized/FP16 contract,modeled GB/s and final tables|Separate FP32 accumulation reference from binary64 audit;define bytes including scales/zeros,no DRAM claim|
|2,p2|Check shader-f16 support and provide fallback if absent|REQUIRED|Adapter support/device runtime f16 known;custom FP32 unchanged|Explicit custom FP16/fallback dispatching/results labels|Capability gate + separately labeled FP32 fallback,no silent equivalence|
|2,p2|Proper timing:warm-up,many iterations,timestamp-query rather than CPU timers|REQUIRED;no exact Part2 iteration count specified|10 warm/30 measured per variant,serial timestamps/full-check boundaries|Final repeatability/Adreno and resolution|Keep raw/zero/tails,repeat declared independent rounds;5-run statement belongs Part1 metrics|
|2,p2|Custom GEMM demonstrably beats baseline on target Adreno;comparison table A-D;explanation faster/slower;reproducible harness|REQUIRED|Mali FP32 naive/tiled/specialized results;harness/raw/docs preserved|Adreno scored speedup,A-D table,matched pipeline/shape,explanation evidence|Target rerun after C/D/contract;retain negative results|
|2,p2|Suggested results table:Shape(M,N,K),Tile/WG,Time,GFLOPS,GB/s,Max abs err|Suggested table presentation;metrics separately required above|Partial experiment tables|Final A-D consolidated tables/plots|Generate only from accepted actual results|
|p2–3|Grading Rubric(suggested),weights30/20/15/25/10|Suggested grading,not new experiment tasks|No claims of grade|None|Use as report emphasis only|

## Part1 bounded validity decision

TIMING002:unique-slot independent dependent vector-add repeats overlap7/7 in same-command and continuous-submit,all>65536ns;serial waiting0/7. Platform cause UNKNOWN. PROFILE003 durations are not exclusive costs;no sum,clip,average allocation or dispatch-count surrogate. Existing deliverable is execution structure/source classification + timestamp validity diagnosis + raw intervals + NOT_MEASURED cost fields. Observed interval union,if ever shown,is only timestamp interval union,not physical busy time. No valid stacked chart or top bottleneck claim is currently available. One bounded Chrome tracing feasibility pilot is a possible alternative,not assurance:verify GPU timing scope and shader/dispatch correspondence;CPU trace events alone do not fulfill GPU kernel time. If no attributable GPU slices,document unavailable and request acceptance of the partial evidence instead of widening profiler indefinitely.

## Implementation order directly tied to gaps

1. Run GEMM004 now:actual execution/padded shape synthetic FP32 naive/tiled comparison,supplemental only;no new kernels/no token/memory benchmark. This closes the execution-shape experiment but not required M1/M>=128 logical layer shapes.
2. Offline valid tensor metadata/operator mapping and target Adreno access:select one verified dense layer K/N with decodeM1/prefillM>=128 relation;do not attach names by equal sizes. If unavailable,retain explicit target/shape gaps.
3. Next kernel task:freeze FP16 input/output/accumulation semantics + FP32 reference and absent-feature FP32 fallback;adapt A/B before C/D so comparisons match original pipeline. Then one fixed vectorized C (not specialized).
4. Freeze Q4/Q8 format choice/coverage,scale/zero/block layout with official reference;implement matched unfused dequant baseline then fused D. This directly fills D/pipeline/comparison requirements;packed FP16 mapping is unrelated to nibble unpack.
5. Small controlled tile/workgroup sweep,repeat target-device timing,modeled bytes/GFLOPS/GB/s and A-D actual table. Preserve raw and speedup limits;do not advertise hardware utilization or model speedup.
6. In parallel as a separately scoped Part1 next task:input128/512/1024 prompt preparation/capacity validation + read-only JS/RSS memory collection and one bounded true-token/phase-hook feasibility decision. Proceed to>=5 runs only for valid metrics.
7. One bounded Chrome trace GPU-attribution feasibility experiment if tool support exists;no repeat TIMING002/SHAPE001,no unbounded platform diagnosis. If unavailable,finalize honest structure/limitations and seek agreement on incomplete per-kernel/breakdown deliverables.

The next implementation recommendation is item3 (FP16 contract plus A/B capability/fallback),after this execution-shape phone result/review. Vectorized C follows directly;do not implement all variants in this round. No commit/push.


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


PART2ABC Q4 FP16 actual run COMPLETE (2026-10-05),superseding NOT_RUN: all correctness summaries PASS;independent4425small outputs and timestamp/statistics/order verification PASS. Same-run A/C median ratios1.15625(M1),3.8125(M128);B/C4.59375,5.984375. See docs/experiment_log.md and results/analysis/part2_abc_verified.json. Q8,D,sweep/five independent repeats and real logical shapes/Adreno remain gaps.


## PART2ABCD Q4 fused D pilot — NOT_RUN

Original assignment p2 D is “Fused dequant + GEMM”. See docs/part2_fused_d.md (relative from repository root). New independent page src/benchmark/part2_abcd.html,stock Q4 FP16 A/B/C plus D using same C mapping/WG8x8/output8x32/Ktile16/shared1280bytes. D reads row-packed unsigned Q4,group32 scales/zp and performs signed-difference→f32 scale multiply→f16 conversion before increasing-K half fma. No full B16 input/intermediate for D;not packed FP16 unpack. Historical pages/shaders/raw preserved.

Question:compare prepared-input GPU pass and separately sampled resident-packed-to-completion wall. Setup:representative M1/M128,K=N1024,shared mathematical input/reference/thresholds;extremes and tails/probe included. Each scope10warmups/30measured per variant,24permutations plus six additions,position7/8 and pair precedence15/15. Kernel-only excludes ABC CPU decode/layout;complete-path samples actually redo ABC decode/C layout/upload each time;D uses resident packed inputs. Preallocated GPU resources/common A+packed+metadata uploads/reference/map/check excluded from complete wall;encoding,variant upload,outside-pass copies included. CPU+GPU times not added as GPU time;complete median not derived by adding medians. Static weights can prepare once/reuse;one-time costs separately exported.

Acceptance:all versions correct/nonfinite0/probe2048,raw samples/orders/limits/errors/metadata/source/hash and two scopes present;zero/tails retained;D has no B16 resource input;phone NOT_RUN. No claims about physical GPU residency,DRAM traffic,hardware vector instructions,model acceleration or Adreno performance. Q8,sweep,independent repeats,real valid model shapes and Part1 profiling gaps remain. No commit/push.

Phone: http://localhost:8000/src/benchmark/part2_abcd.html ;fill environment,run Q4FP16 A/B/C/D once in foreground,wait for both scopes,download PART2ABCD-FP16 JSON even on failure. Existing server/adb reverse instructions apply;no old experiment rerun.


PART2ABCD Q4 FP16 actual phone run COMPLETE,2026-10-05,superseding NOT_RUN:all correctness PASS,6116 small outputs independently checked,640 sampling records verified. D slower than C kernel-only atboth shapes;complete-path wall benefit includes avoiding repeated CPU dequant/layout/upload,not model/GPU speedup. See experiment_log and results/analysis/part2_abcd_verified.json. Q8,sweep,independent repeats,real logical shape and Adreno/Part1 gaps remain.
