# Part2 A–D compute contract — PART2-QROW-v1

Frozen before phone execution. Required FP16 A/B implementation NOT_RUN;C/D data interface defined,not implemented. Original PDF preserved at assignment/webgpu_adreno_assignment.pdf,SHA256 dc02d42a5fdf521b75794ac641478cfe91ec7d9e165fa93a1c2e43b3ec63e9c3. Extracted original pages in results/analysis/assignment_original_text.txt. Earlier GEMM001–004 FP32 pages/results are supplemental,not counted as these A/B implementations.

## Original requirements versus project choices

Original p2 Part2 Pipeline: “Q4/Q8 weights, then dequantization, then matrix multiplication, then FP16 accumulation.” Kernel table p2: A “Baseline naive WGSL”;B “Tiled GEMM using workgroup shared memory”;C “Tiled with vectorized loads (vec4, packed u32)”;D “Fused dequant + GEMM”. Requirements p2 include “decode GEMV (M=1) and prefill (M>=128)”,tile/workgroup sweep,GFLOPS/effective GB/s/correctness against FP32 reference,shader-f16 support/fallback,warmup/many iterations/timestamp-query. Five runs is explicit in Part1 metrics;the project also plans>=five independent final Part2 repeats following current user direction,not a claimed exact Part2 sentence.

The original does not define bit signedness,packing,group size,scales/zeros,activation/output storage precision,rounding/order,bias,tile,or fallback precision. Those below are PROJECT CHOICES. Q4/Q8 slash is ambiguous about requiring both;we support both synthetic formats and separate selectable runs without claiming one completes both. No contradictory precision requirement was found. FP32 reference is a numerical oracle,not permission to use FP32 accumulation for the required path. Current device Mali/representative shapes leave target Adreno/real logical-shape requirements unmet.

## Mathematics and storage

C[m,n]=sum(k=0..K-1) A[m,k]*B[k,n]. A row-major[M,K],quantized codes Q row-major[K,N],output row-major[M,N]. No transpose,bias,activation,split-K or additional fused operations. One ordinary matrix,not a batch/head folding. Current shapes representative M1/M128,K=N1024;valid model logical shape UNKNOWN. GEMM004 executionM8/K1536/N2048 remains separate and is not rerun here. Frozen current maxK1024;no silent reduction if resources fail.

Activation storage binary16 bits Uint16Array,decoded before CPU reference. Unsigned quantized codes q in0..15 forQ4,0..255 forQ8. Signed dequantized weights come from q-zeroPoint;not signed/two's-complement packed codes. Synthetic seed0x2ab00117,xorshift32 in gemm_math.mjs:activation first,then group zero points,then q in increasing row-major index. Scales are deterministic exact powers of two (see families),not model scales. Raw weights do not originate from Gemma model. Manifest records selected bit width and algorithm/version.

Packing:32/bits adjacent N codes per u32;bits for n occupy shift(bits*(n mod(32/bits))) in word k*ceil(N/(32/bits))+floor(n/(32/bits)). Least-significant code first,little-endian CPU typed words. Each K row starts a new word;never pack across row tails. Unused high code bits at row end zero. No K padding in packed payload;short final K group consumes only valid elements. CPU exact unpack→q audit mandatory. Group size32 along K,independently per output column. Number groups=ceil(K/32). Scale and zeroPoint indexed floor(k/32)*N+n,shape[groups,N]. Scale binary16;zeroPoint u32 in the code range. Values at all group entries are defined,including final partial group.

Dequant formula B16[k,n]=RN16((int(q)-int(zp))*decodeHalf(scale)). CPU multiplies in binary64 then rounds ties-to-even to binary16;small integers/scales are exactly representable and selected scale powers make all current dequant values half-representable. No extra asymmetric bias beyond zero-point subtraction. C/D must use the identical integer q,zp,stored scale,A and B16 numerical values. GPU D will need explicitly type-convert integer difference/scale then convert to f16 in the same order;matching mathematics does not prove instruction identity. Payload schema for future D:packedWords Uint32Array[K*rowWordStride],scaleHalf Uint16Array[groups*N] with pad-to4 bytes for upload,zeroPoint Uint32Array[groups*N];32-byte future packed uniform[M,N,K,rowWordStride,bits,groupSize,groups,0]. A/B currently need16-byte uniform[M,N,K,0] and only predecoded A/B buffers.

## FP16 operations,output and reference

A uses @workgroup_size8×8,one output/invocation,increasing k. B uses16×16,256 invocations,ta/tb arrays each256 f16 (1024 shared bytes total),collective loads and two uniform barriers/tile. Every invocation reaches barriers;out-of-range loads zero,stores guarded,final K tile excludes k>=K from accumulation. No early return. Both use `var sum:f16`,explicit `sum=fma(f16A,f16B,sum)` in increasing global K,final sum widened to f32. All inputs,shared values,accumulator are typed f16. Intended operation is FP16-typed multiply/add;fma avoids a source-level explicit separately rounded product,but implementation may implement it non-fused. **Output numerical precision is binary16,actual storage/readback is f32 carrier**,lossless widening,not a claim of two-byte output storage or reduced carrier bandwidth. This convention is identical for future C/D. Future C vectorized load design must retain the declared arithmetic order or explicitly version the contract.

WGSL basis:[CRD2026-07-03 §15.7 floating evaluation](https://www.w3.org/TR/2026/CRD-WGSL-20260703/#floating-point-evaluation),[fma](https://www.w3.org/TR/2026/CRD-WGSL-20260703/#fma-builtin). fma need not be a single fused hardware instruction;floating rules permit behavior affecting rounding/subnormal results. Typed f16 and enabled feature alone do not validate observed accumulation semantics. We do not promise CPU/GPU bitwise equality for general noninteger data or infer physical compiler instructions. CPU canonical RN-even is an operational test model,not a complete model of all permitted implementations. Source and precision-discriminator output are evidence for the selected path;unexpected probe behavior marks it unvalidated/ERROR without claiming the browser violates WGSL.

References independently implemented in part2_math.mjs:
1. High precision binary64 sequential sum from actual decoded A half,q,zp,stored scale (unrounded dequant value). No shader oracle.
2. Canonical FP16 semantics:RN-even16 of each A*B16+sum in increasing K,models fused evaluation. f16 encoding/decoding validated on all65536 codes,known midpoint/overflow/subnormal boundaries. General implementation tolerances below allow variation;not a guarantee of every legal reassociation.
3. Explicit FP32 sequential accumulation on the same decoded A/B16,supplementary original-required FP32 numerical reference. Export comparison separately. For selected scales B16 equals exact dequant,so reference input differences are absent.

Precision probe,not benchmark:M1,K3,N1,A=[2048,1,1],B=[1,1,1] obtained fromq=zp+1,scale1. Canonical sequential FP16 yields2048,FP32/high2050. Required path must match2048 exactly and output a half-representable value. The intentional high-reference error2 is exported with probe-specific atol2 and is not a widened ordinary tolerance. This is a discriminating operational acceptance check,not hardware instruction proof. Probe failure stops scoring;does not trigger a fallback automatically. Fallback probe expects2050.

## Fixed families and thresholds

Ordinary exact family:A=-1,0,1;scale1,q=zp+(-1,0,1),zp around unsigned midpoint. MaxK1024 keeps all integer partial sums exactly half-representable. Both ordinary reference checks atol=rtol=0,nonfinite0. This family checks indexing,word/row/group/tile boundaries.

Fractional:A=(next%33-16)/64 (max magnitude.25),Q4 scale1/32 orQ8 scale1/512,zp=midpoint+(next%3)-1,q covers full unsigned code range. Stored A/scale powers are exact,weights signed. These are bounded noninteger inputs chosen before phone measurements,not reduced on failure. Subnormal product/cancellation behavior may differ,especiallyQ8;not used to claim universal accuracy. FP16 vs canonical semantic atol.02/rtol.01;vs high and FP32 atol.04/rtol.04. FP32 fallback comparisons atol.0002/rtol.0002. Denominator for relative error=max(abs(expected),1e-8);PASS still uses absolute+relative threshold,so near-zero failures are not hidden by relative error. Reject any NaN/Inf,report max absolute/relative errors,error counts,nonfinite,worst expected/actual/index for each oracle;required output values must be half-representable. Semantic failure and high-reference approximation failure have separate fields. Thresholds are deliberately preliminary engineering acceptance bounds for this specified family/K range,not a claim of application accuracy or an exhaustive WGSL allowance. Do not relax/change amplitude,K or shader after failed phone results within this version.

Cases:scalar1/1/1,rectangularM3/K5/N7,tile/group tailM17/K35/N23,packing/group tailM1/K33/N9,and performanceM1/M128 K/N1024. Q4/Q8 CPU tests cover0/max codes,negative dequant,word edge,row-tail zero bits,group tails,known words0xf6543210 and0xff800100. Small records export actual A half/decoded,q,packed words,scales/zeros,B half/decoded,all references and A/B output;no fabricated phone values.

## A–D data paths and timing boundaries

|Variant|Data/preprocessing|Kernel arithmetic|Status|
|---|---|---|---|
|A|CPU packed→exact unpack→dequant B16;upload A16/B16|Naive f16 fma increasing K|Implemented,phone NOT_RUN|
|B|Same exact packed data and predecoded buffers,shared A/B per shape|Shared-memory16×16 f16 fma increasing K|Implemented,phone NOT_RUN|
|C|Same q/scales/A;predecoded B16 as A/B|Future tiled vectorized loads,precision/order frozen|NOT_IMPLEMENTED;specialized does not substitute|
|D|Same q/scales/zp/A;packed inputs resident|Future fused dequant to B16 plus same accumulation|NOT_IMPLEMENTED;not plain packed FP16 unpack|

A/B share A/B/uniform buffer,independent C/readback. CPU pack/unpack/dequant wall and intermediate host/GPU buffer bytes recorded. Kernel-only excludes preprocessing,input generation,CPU references,pipeline allocation/upload/readback/check. No GPU dequant pass implemented. Per-run host wall begins preparation through final cleanup and explicitly includes CPU preprocessing/reference,etc.;**not** a fair GPU unfused pipeline measure for D. Future GPU dequant baseline must be separately timed one serial pass plus GEMM,with same residency/end-to-end scope as D,before any fused speedup comparison. CPU preprocessing wall cannot be added to GPU pass ns and labeled GPU pipeline time. Current packUnpackDequantWallMs includes packing/unpacking/audit/B conversion;not narrowly dequant-only.

requestDevice explicitly requires shader-f16 on required path and timestamp-query if supported;checks enabled features. No f16 support→required UNSUPPORTED,manual independent FP32 fallback remains runnable,reported NOT_VALIDATED_FALLBACK_ONLY even if fallback COMPLETE. FP32 fallback uses same saved A/B16 decoded into f32,FP32 fma/output with own shaders and results;never count as required FP16 A/B passed. Missing timestamps allows correctness only,GPU NOT_MEASURED. Request/compilation/validation/out-of-memory/internal/device-loss/map errors logged and download remains available.

After exact+fractional+probe checks PASS,10 warmups/variant,30 paired measured rounds with15 A-first/15 B-first,fixed seed0x2ab00118 xor M. Same device/path/input/output usages,each pass one dispatch. Serial submit→onSubmittedWorkDone→map/unmap/full check then next pass. Unique-to-in-flight query indices0/1 reused only after readback. All setups outside sampling. Begin/end timestamps decimal strings,BigInt difference first. Wall boundary immediately before submit to completion includes outside-pass copies/resolve;maps/CPU checks excluded. Raw samples preserve zeros/tails;midpoint median,nearest-rank p95,min/max,zeros and endpoint GCD;resolution limited if any zero or median<10*max65536ns/observedGCD. Ratio is same-run A median/B median only,suppress when unresolved/zero/no timestamps;never use historical FP32 median. Run is preliminary controlled timing,not physical GPU busy time,pure arithmetic throughput or final Adreno result. Full per-shape preprocessing record and resource ledger separate host/GPU logical bytes from physical memory.

## Reproducibility and acceptance

Phone page src/benchmark/part2_ab.html,experimentId PART2AB. Run Q4 first,record selected format/manual state,stay foreground;Q8 is separate optional next pilot until requested,not silently pooled. Download failure/unsupported records. C/D and sweeps not added this round. Current status NOT_RUN. Computer checks are numerical/structural/fake-native,no claim of real phone compilation/FP16/timing. Preserve all historical raw files;no commit/push.


Computer verification completed: `node scripts/check_part2_ab.mjs`, `node scripts/check_part2_page.mjs`, and full-domain `node scripts/check_part2_full_references.mjs`. Initial full CPU domain check before phone:both bit widths and M1/M128/exact+fractional canonical outputs within frozen high-reference bounds;max observed CPU canonical vs binary64 fractional absolute error Q4 M128 .03076171875,Q8 M128 .03326416015625. These are CPU simulator differences,not GPU results. Page/native mock includes unsupported feature,requestDevice failure,map failure,timestamps absent,precision probe,full paired loops and cleanup. Historical GEMM002/003 regression checks pass. Actual WGSL compilation/phone outputs remain NOT_RUN.


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
