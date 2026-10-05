# Part 2 Q4 fused D pilot — phone NOT_RUN

## Question and original definition

Original assignment p2 Part 2 kernel table defines D as “Fused dequant + GEMM”. The pipeline on the same page requires quantized weights, dequantization, GEMM and FP16 accumulation. Original: [assignment](../assignment/webgpu_adreno_assignment.pdf). Frozen project choices remain [PART2-QROW-v1](part2_compute_contract.md); this synthetic Q4 format is not a claim to reproduce Gemma quantization. Q8/sweep/independent repeats are outside this pilot.

Does fusing Q4 decode/dequant into C's fixed structure improve prepared-input pass time or a separately measured single-use complete path? Negative results are retained. Representative M1/M128,K=N1024 are not confirmed real logical layer shapes.

## D source and numerical contract

New `src/benchmark/part2_d_f16.wgsl`. Same C workgroup8×8, output tile8×32,Ktile16,64 invocations/four output columns per invocation,workgroup arrays128 half A +128 vec4 half B=1280bytes. Same two barriers per Ktile and component-wise increasing-K `fma` with half accumulator;guarded tails,no early return,dot,subgroup,split-K or changed reduction order. Source-level vec4 does not prove hardware vector instructions. D replaces C global B16 vector reads with scalar Q4 decode into the same shared vec4 tile;extra shifts,masks,metadata reads/conversions are source facts,not measured bottlenecks.

Unsigned q0..15,eight adjacent N codes per u32,low nibble first,each K row word-aligned,unused row high bits zero. Address `k*ceil(N/8)+floor(n/8)`,shift4*(n%8). Group32 along K per column;metadata `floor(k/32)*N+n`. Signed integer difference `i32(q)-i32(zp)` → f32 multiply by widened stored f16 scale → explicit f16 conversion before the fma. Frozen scales1 or1/32 and small code differences make this intermediate exactly representable in f32,matching CPU binary64-then-RN16 B16. General model scales or a changed quantization contract would require fresh numerical review. This is Q4 dequantization,not packed-FP16 unpacking.

Storage bindings A half,packed u32,output f32 carrier,scale half,zp u32:five storage bindings,plus16-byte uniform M/N/K/rowWords. Output numerical value is half widened losslessly to f32,as A/B/C. Limits checked;unsupported configurations SKIPPED,no tile/shape changes. Required shader-f16 requested;no automatic fallback. Missing timestamps permits correctness plus complete-path wall sampling,GPU time NOT_MEASURED.

## Correctness and references

Same seed,xorshift32,stored A/q/scale/zp,canonical half/high precision/FP32 references and frozen thresholds. A/B/C share mathematical weights with D. Precision probe must output2048 for all versions versus high/FP32 2050. Original cases,vector/workgroup M9,K17,N35 and an explicit M3,K5,N9 quantization-extreme case cover0/15;the latter overrides q with alternating0/15 while other seeded inputs stay unchanged and records the override. Both exact and fractional families run. All outputs checked,nonfinite rejected;small inputs,packed words,metadata,references and four outputs exported. Only shapes passing all versions and both families enter sampling. No failure-dependent threshold changes.

## Two independently sampled scopes

**Prepared-input kernel-only:** A/B receive shared predecoded B16;C receives separately padded B16 rows;D receives resident packed Q4 plus scales/zp. A16 shared,outputs/readback independent. Pass timestamp interval includes D decode/dequant;ABC preparation excluded. Pipelines,allocations,one preparation/uploads/references outside sampling. GPU pass is not pure arithmetic execution. Submit wall includes output/query copies outside the timestamp interval;map/check excluded.

**Complete-path wall:** separately execute10warmups+30measured per variant. Every ABC sample decodes the common packed words anew to B16;C also allocates/copies padded row layout anew. Converted weights are uploaded each sample into preallocated GPU buffers;never reuse conversion while claiming it occurred. D requires no repack/full B16 conversion and executes its fused pass directly. Start is immediately before conversion (or D encode path);end is final `onSubmittedWorkDone`,before timestamp/output map and CPU check. Includes CPU array allocation/conversion,variant weight upload,encode,submit,query/output copies and completion. Excludes pipeline/GPU buffer allocation,common initial A/packed/metadata uploads,input generation,reference and output checking. Report per-sample conversion/upload-encoding wall and actual complete wall;GPU timestamp remains only that sample's pass. No CPU+GPU sum labeled GPU time;no sum of independent medians. Zero wall samples suppress ratios.

This is an explicit resident-input,preallocated-resource,single-use preparation scenario. Static weights may be prepared once and reused:one-time shared ABC pack/unpack/dequant time,C copy time/bytes and D zero full-matrix conversion are separately exported in preprocessing. Kernel-only then represents reuse. The two scenarios do not assert that every runtime repeats dequantization per request. Overall host-run wall additionally includes reference/check/idle and is not the complete-path sample.

## Order,statistics and resources

For each scope,30rounds with all24permutations once plus ABCD/DCBA,BCDA/ADCB,CDAB/BADC. Each version occupies every position7or8 times;each directed pair precedes the other15times. Seed CONTRACT.orderSeed XOR M;complete path adds XOR0x50415448. Both actual orders and position/precedence counts exported;10warmup rounds cycle the first6permutations. Each pass single dispatch,serial completion,map/unmap/full check before next;two query slots reused only after readback. No multi-pass timestamp sum.

Each shape exports160kernel-only and160complete-path samples,including40warmups per scope. Median,nearest-rank p95,min/max,zeros. Timestamp decimal strings,BigInt subtraction;grid65536ns rechecked using endpoint GCD. GPU ratios A/D,B/D,C/D only for resolved positive medians under existing criterion;complete-wall ratios use independently sampled wall medians. Preserve tails/zeros.

Logical allocations per variant exported:packed,scales/zp,B16 or padded intermediate,output/readback. D binds no full B16 matrix;the combined comparison harness still allocates ABC intermediates. Absence of a D intermediate is a logical allocation comparison,not actual physical GPU residency or a whole-harness memory reduction. Profiler memory,DRAM traffic/cache/occupancy and model acceleration NOT_MEASURED.

## Phone steps and acceptance

From project root: `python -m http.server 8000 --bind 127.0.0.1`.
In another PowerShell: `& "C:\Tools\platform-tools\platform-tools\adb.exe" reverse tcp:8000 tcp:8000`.
Phone Chrome: http://localhost:8000/src/benchmark/part2_abcd.html . Fill actual thermal/charging/DevTools/flag,click **运行 Q4 FP16 A/B/C/D**,stay foreground and wait for both scopes (longer than ABC),download JSON even on failure. No need to rerun historical pages. No Chrome flag changes.

Acceptance:all four versions/pass probe/all outputs PASS,no nonfinite/errors;full orders/raw samples and independent complete paths;D uses packed storage and no B16 intermediate;measurement/precision/resource boundaries preserved. Phone result NOT_RUN. CPU/static/native-mock checks are not phone WGSL compilation or timing evidence. No commit/push.


PART2ABCD Q4 FP16 actual phone run COMPLETE,2026-10-05,superseding NOT_RUN:all correctness PASS,6116 small outputs independently checked,640 sampling records verified. D slower than C kernel-only atboth shapes;complete-path wall benefit includes avoiding repeated CPU dequant/layout/upload,not model/GPU speedup. See experiment_log and results/analysis/part2_abcd_verified.json. Q8,sweep,independent repeats,real logical shape and Adreno/Part1 gaps remain.


Archive interpretation: latest Q4 A-D M1 A/C median difference exactly65536ns=65.536us,one observed timestamp grid;no stable small benefit claimed. Large full outputs verified online;offline replay limited to small exported outputs and exported sample records. D complete-path advantage assumes repeating ABC CPU preprocessing/upload,not preprocessed-weight reuse or model acceleration. Assignment incomplete.
