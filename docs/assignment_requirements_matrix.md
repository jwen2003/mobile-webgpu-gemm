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


## Q8 FP16 A-D pilot — phone NOT_RUN

Original p2 does not specify Q8 packing/signedness:PART2-QROW-v1 project format unsigned0..255,four low-byte-first codes/u32,K rows word-aligned,group32 K per column,half scale1/512 for fractional inputs,u32 zero point around128;negative dequant comes from signed q-zp,not INT8 sign extension. FP16 activation/increasing-K fma/output contract unchanged. Same A/B/C WGSL;new fused D byte decode with same C mapping. Shared controller/decoder parameterized,Q4 entry/shaders preserved.

Full CPU-domain Q8 numerical preflight PASS:canonical vs high/FP32 max fractional absolute error0.017425537109375(M1),0.03326416015625(M128),exact0. Explicitly reviewed existing thresholds retained before phone run:semantic.02/.01,high/FP32.04/.04,exact0/0;engineering policy for bounded inputs,not universal GPU guarantee. See docs/part2_q8.md and results/analysis/q8_cpu_reference_validation.json.

Question/setup/acceptance:Q8 same-run A-D on representative M1/M128 K=N1024,all full outputs/probe2048 required,tails/extreme unsigned bytes/zero dequant checked. Both prepared-input GPU pass and separately sampled actual complete-path conversion/upload wall;10warmups/30measured,24permutations plus balanced six,all raw timestamps/wall/zeros/tails/order exported. Static preparation reuse caveat unchanged. Ratios use this Q8 run only;history Q4 is no denominator/cause proof. Phone result NOT_RUN;computer preflight is CPU_ONLY. Independent FP32 fallback is manual Q8 A/B on existing page,not required A-D acceptance.

Phone http://localhost:8000/src/benchmark/part2_q8_abcd.html ;confirm Q8FP16,fill actual environment,run once foreground,download PART2Q8ABCD-FP16 JSON even on failure. No old Q4 performance rerun. Q8 phone acceptance,real logical model shape,targetAdreno,Part1 metrics remain gaps;sweep and>=five independent repeats next after acceptance,not implemented now. Temporary integrity snapshots stay local;no commit/push.


Q8 FP16 A-D phone pilot COMPLETE (2026-10-05),superseding NOT_RUN. All correctness PASS;6476small outputs and640sampling records independently verified. Semantic max error0,ordinary high/FP32 max abs0.03326416015625. D kernel-only slower than C;complete wall benefit assumes repeated ABC preparation/upload,not weight reuse/model acceleration. M1 A/C differsone65536ns grid,no stable small benefit claim. See experiment_log and results/analysis/part2_q8_abcd_verified.json. Sweep/independent repeats and real logical shape/Adreno/Part1 remain pending. No commit/push.


## Finite sweep QROW-SWEEP-v1 — READY_FOR_PHONE / result NOT_RUN

Q8 accepted implementation/results were independently committed and pushed before this work: a5a0cedc78725d0dcc34a9d0ba7e9342123544e0. The three local integrity snapshots remain excluded;updates/ ignored and locally preserved. Sweep is a separate uncommitted implementation pending phone acceptance.

Frozen candidates in docs/part2_sweep_plan.md:Q4/Q8,M1/M128,K=N1024;A8x8 fixed;B16x16/K16(original),8x8/K8,32x8/K16;C/D8x8/K16(original),4x8/K16,8x16/K16. Actual workgroup differs from vectorized output tile;resource counts in table. Illegal candidates UNSUPPORTED,failed candidates retained/excluded. All candidates full preflight incl precision2048/non-square/packing/group/vector/tile tails and both performance shapes before timing. Same frozen precision/input/reference/thresholds;no new quantization/kernel family or silent shape change.

Only prepared-input kernel GPU pass;setup/CPU convert/layout/upload/reference outside sampling. Single dispatch,serial completion/query/readback/full check.10warmups+30measured/candidate,position-balanced rounds,seeds/actual order/raw timestamps/hashes/results. Full budget1600sampling passes+420correctness passes;unsupported/failures reduce it. Median/p95/zero/grid/ratios to same-round A and own original. Select lowest resolved median only as pilot candidate;within one grid indistinguishable,prefer original. Not stable/model/Adreno speedup;>=five independent repeats next.

Phone http://localhost:8000/src/benchmark/part2_sweep.html ;fill environment,run once frozen sweep in foreground,download PART2SWEEP JSON even on failure. No controllable phone Chrome interface available in this session;no phone execution or COMPLETE claim. Computer checks:all-candidate CPU collective interpreter/stock source identity/limits/order/tie policy;page mock1600serial samples and independent Python small-output/timestamp/statistical/seed audit,unsupported/failure/no-query/cleanup. `python scripts/verify_part2_sweep_result.py PATH` will archive real JSON unchanged and verify when supplied. Real logical shapes,Adreno and Part1 remain gaps.


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


Part 2 independent repetitions: S1 COMPLETE/verified, 1/5. Four sessions outstanding; Part 1 model repeats, logical shape and Adreno remain open.

Part 2 independent repetitions: S1/S2 COMPLETE and independently verified, 2/5. Three sessions outstanding; no reselection or stable gain claim. Part 1 model repeats, logical shape and Adreno remain open.

Part 2 independent repetitions: S1–S3 COMPLETE and independently verified, 3/5. Two sessions outstanding; no reselection or stable benefit acceptance. Part 1 model repeats, logical shape and Adreno remain open.

Part 2 independent repetitions: S1–S4 COMPLETE and independently verified, 4/5. One session outstanding; no reselection or stable benefit acceptance. Part 1 model repeats, logical shape and Adreno remain open.

Latest acceptance: five independent PART2REPEAT sessions COMPLETE and verified; earlier NOT_RUN/partial progress entries are historical. Frozen configs retained, no pooled median. See docs/part2_repeat_results.md (project root relative) for per-session values, ranges and reversals. Part 1, logical shapes and Adreno gaps remain open.

## BASELINE002 exact-length model sessions — READY_FOR_PHONE

Original assignment page 1 directly re-read:full prompts 128/512/1024 tokens,each metric >=5 runs with median/p95. New entry http://localhost:8000/src/baseline/sessions.html?v=baseline-session-v1 ;15 independent page/task/device attempts,one generation each,0 generation warm-up,requested combined capacity2048. Actual sizeInTokens(fullPrompt) must exactly match the target with template included;body/template counts and full text/hash exported. Stock runtime0.10.29 and existing Web model preserved. No profiler command/pass extensions or timestamp diagnosis. Only resource lifecycle wrappers reused plus directly available JS heap snapshots.

Question:How do observable initialization/combined generation/first callback/drain walls and scoped reported heap/logical allocations vary at prescribed input lengths? Setup and acceptance:docs/baseline_sessions_plan.md. Results NOT_RUN;CPU mock checks are not mobile/model evidence. Generation is first-use after separate tokenizer setup/drain;no output-token or pure prefill claim. Prompt/long-capacity compatibility awaits phone ordinal1 and longer configurations.

Coverage matrix:exact full-prompt length and five independent combined-wall/available-memory sessions READY_FOR_PHONE,not closed. Pure prefill/decode,real generated-token throughput/per-token or dispatch-token metrics remain UNAVAILABLE;physical GPU memory/deviceRSS not collected. Resource logical bytes and JS heap never replace residency/RSS. Current device remains Mali;Adreno and true logical layer shape gaps remain. After actual evidence arrives preserve originals,independently audit per-session boundaries/resource lifecycles and grouped median/nearest-rankp95/min/max;five-samplep95=max with weak tail evidence. Separate commit/push only after mobile acceptance.

BASELINE002 L128R1 COMPLETE/audited;full runtime-tokenizer count128,capacity2048 initialized on this input. Campaign1/15,not full repetition/phase/memory requirement closure. Actual scoped memory and walls:baseline_sessions_results.md.

BASELINE002 progress2/15:128R1 and512R1 COMPLETE/verified. 1024 input andfive independent sessions perlength outstanding;phase,outputtoken,RSS,Adreno gaps unchanged.

BASELINE002 progress3/15:all prescribed full-prompt lengths128/512/1024 have first independent COMPLETE/audited attempt with requestedcapacity2048. Four more sessions perlength remain;purephase/outputtoken,RSS andAdreno not closed.

BASELINE002 progress4/15:128 1/5,512 2/5,1024 1/5 COMPLETE/audited;L512 full prompt/hash unchanged. Five-repeat requirement remains pending;phase/outputtoken,RSS andAdreno gaps unchanged.

BASELINE002 progress5/15:128 1/5,512 2/5,1024 2/5 COMPLETE/audited;fixed perlength prompts unchanged. Five-repeat requirements pending;purephase/outputtoken,RSS andAdreno gaps retained.

BASELINE002 progress6/15:each prescribed length2/5 COMPLETE/audited;perlength exact prompts unchanged. Three further sessions perlength required;phase/outputtoken,RSS andAdreno gaps retained.

BASELINE002 progress7/15:128 2/5,512 2/5,1024 3/5 COMPLETE/audited;perlength exact prompts unchanged. Repetition requirements pending;phase/outputtoken,RSS andAdreno gaps retained.

BASELINE002 progress8/15:128 3/5,512 2/5,1024 3/5 COMPLETE/audited;perlength exact prompts unchanged. Repetition requirements pending;phase/outputtoken,RSS andAdreno gaps retained.

BASELINE002 progress9/15:each prescribed length3/5 COMPLETE/audited;perlength exact prompts unchanged. Two further sessions perlength required;phase/outputtoken,RSS andAdreno gaps retained.

BASELINE002 progress10/15:128 4/5,512 3/5,1024 3/5 COMPLETE/audited;perlength exact prompts unchanged. Repetition acceptance pending;phase/outputtoken,RSS andAdreno gaps retained.

BASELINE002 progress11/15:128 4/5,512 3/5,1024 4/5 COMPLETE/audited;perlength exact prompts unchanged. Repetition acceptance pending;phase/outputtoken,RSS andAdreno gaps retained.

BASELINE002 progress12/15:each prescribed length4/5 COMPLETE/audited;perlength exact prompts unchanged. One further session perlength required;phase/outputtoken,RSS andAdreno gaps retained.

BASELINE002 progress13/15:128 4/5,512 5/5,1024 4/5 COMPLETE/audited. L512 five combined-wall/available-memory repeats done;purephase/outputtoken,RSS andAdreno not closed.

BASELINE002 progress14/15:128 5/5,512 5/5,1024 4/5 COMPLETE/audited. L128/L512 five combined-wall/available-memory repeats done;purephase/outputtoken,RSS andAdreno not closed.

Latest BASELINE002 acceptance:FIFTEEN_SESSIONS_VERIFIED,exact128/512/1024 full prompts and5 independent COMPLETE/audited sessions each. Earlier NOT_RUN/partial states are historical. Observable walls/scoped memory repeats accepted;purephase/true outputtokens/deviceRSS/physical GPU memory/Adreno remain unavailable. Final results:docs/baseline_sessions_results.md;Work summary:docs/baseline002_work_summary.md (root-relative).


## MEMORY001: offline texture accounting (2026-10-06)

All 15 BASELINE002 sessions independently audited: 7,500 recorded texture creations, all six formats now accounted for in derived files. See [texture payload accounting](../docs/memory001_texture_accounting.md) for per-session cumulative creation, active explicit-lifecycle peak and every stage snapshot. Original partial-map counters and all 41 historical raw hashes retained unchanged. This closes the recorded-format payload gap, not physical GPU residency, native/WASM heap or Chrome RSS/PSS. JS heap, buffer logical bytes and texture logical payload remain separate. No phone/model rerun, adb or trace collection; assignment memory remains PARTIAL.


## MEMORY002 archived partial pilot

One128-token page session COMPLETE and independently audited; initialization86.527s, generation7.997s, first callback2.318s, drain103ms. Five process snapshots retained with separate PSS/RSS and JS/buffer/texture scopes. Held-stage browser/GPU roles verified; target renderer UNKNOWN. Armed generation role metadata failed locally, phase/clock alignment not independently proven; PAGE_IDLE process baseline missing. See [pilot results](../docs/memory002_pilot_results.md). Memory requirement remains PARTIAL, not physical/model-exclusive memory or continuous peak. No replacement run or fabricated role/phase.


## MEMORY002 protocol v2 — offline correction

Historical pilot remains PARTIAL. Latest authoritative method: [mandatory idle/handshake/clock protocol](../docs/memory002_capture_protocol.md). Old operator-only v1 instructions are historical and do not grant formal capture. Run serve_memory002.py on loopback8000; phone entry /src/baseline/sessions.html?memory002=1&v=memory002-v2. Initialization blocked until role-qualified idle receipt. Scope narrowed to browser/GPU process PSS/RSS; target renderer UNKNOWN. Generation windows require bracketing offset/uncertainty audit; no model-exclusive/physical GPU memory or continuous peak. CPU checks completed, v2 phone check NOT_RUN; assignment memory remains PARTIAL.


## MEMORY002 v2 observed protocol pilot

[One128-token v2 result](../docs/memory002_v2_pilot_results.md): PROTOCOL_PASS_WITH_CONDITION_WARNING. Required4/4 stage coverage, five snapshots, fresh browser/GPU readings and idle deltas, bounded generation timing (~28.975ms uncertainty), all10 debug-forward cleanups verified. Initialization background5.606s retained; target renderer UNKNOWN, zygote strict meminfo unavailable. One protocol pilot only: not five-repeat memory acceptance, model-exclusive/physical GPU memory or continuous peak. Historical PARTIAL pilot unchanged; no extra trial scheduled.


## Bounded remaining-metric feasibility review (2026-10-06)

See [token/phase/trace feasibility](../docs/remaining_metrics_feasibility.md). Fixed 0.10.29 public API does not expose actual generated IDs or pure phase boundaries. Existing exact full-prompt counts and combined-wall repeats remain accepted. Chrome CPU Dawn events are not GPU execution; optional driver GPU timelines/operator mapping remain UNKNOWN on this build. No model/trace/phone run or profiler expansion performed. Minimum next gate is metadata-only driver trace capability discovery with a15min cap; no automatic follow-up. MEMORY002 v2 is one protocol observation with background warning, not five-repeat memory acceptance.


## TRACE001 availability conclusion (2026-10-06)

[Bounded device check](../docs/trace001_availability.md): Perfetto metadata query available; only android.gpu.memory registered among GPU-related sources, no registered gpu.renderstages/gpu.counters variants. Ordinary shell tracefs access denied/path absent. GPU execution timeline unavailable through current registered route; WebGPU shader/dispatch attribution UNKNOWN. Configuration conversion failures retained; registration is not successful capture. No model/trace recording, profiler or permission changes. Keep per-kernel/breakdown gap and proceed to report consolidation. [Fixed-runtime metric review](../docs/remaining_metrics_feasibility.md) retains true output tokens and pure phase boundaries as unavailable through public API.
