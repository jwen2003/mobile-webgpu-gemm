# GEMM004 execution-shape proof and limits

Decision: REVIEWED_EXECUTION_SHAPE, **EXECUTION_PADDED_ONLY**. Phone NOT_RUN. A proved mathematical execution shape is sufficient for this supplementary experiment per the current user instruction; valid logical Gemma layer shape is not proved. Earlier WAITING statements are historical and superseded only for this category.

## Evidence identities

Stock @mediapipe/tasks-genai0.10.29/model unchanged. SHAPE001 v2 raw SHA256 fcece04380902827c2db59597ba9b2e01687d431ff3273a3d72d75026218d721. Exact shader SHA256 ee9a0b2823d07f56fe2e9c50134dbc9c58f9f411dcfc11795869196870dd6036 at results/analysis/profile002/shaders/<hash>.wgsl,main. Pipeline shape-pipeline-11990/module shape-shader-11989;submit51672→command17452→pass17451→encode46613 (and56984/17463/17462/51925,62296/17474/17473/57237). Three actual native submission occurrences,not a guess from dispatch dimensions. Workgroup overrides8×4×1;U.i0=[512,8,384,0],CPU upload33496,binding3 offset722176,size16. Latest arena version45183 is not the selected byte update33496.

## Derivation

Let r=texture x lane0..7,s=source slice0..383,d=output slice0..511,t=input component0..3,c=output component0..3. Define mathematical arrays:

- A[r,4*s+t] = inputTexture(r,s)[t].
- B[4*s+t,4*d+c] = weights_buffer.data[s*512+d][t][c].
- C[r,4*d+c] = outputTexture(r,d)[c].

WGSL matrix indexing first selects a column,then its component. Source w0=w[0] etc uses that column as output-component vector and multiplies it by v.x etc. Thus B's first scalar index is reduction,input component t;second is output component c. CPU row-major B index is (4*s+t)*2048+(4*d+c),while FP16 packed source scalar index is (s*512+d)*16+t*4+c;byte offset is twice that. No transpose of the mathematical B is needed after this explicit scatter/unpack. mat4x4<f16> stride32 bytes follows four aligned vec4<f16> columns. All weight bytes are direct FP16,not nibble INT4 unpack. Generic Pack/Unpack helper definitions are unused in main.

Each tid.y enumerates src_s=tid.y+4*j,covering all384 slices exactly once across four partitions. Four fma calls add four source components into each s_r vec4. Shared temp[tid.x*4+tid.y] reduces those partitions at ystride2 then1,independently for each r. All eight accumulators use the same B block. Output x=r,y=d provides separate rows,not eight separate K fragments. Stores guarded by0,-1,...,-7 < U.i0.y=8 all execute. The arithmetic relation is C=A*B over execution extents M8,K1536,N2048;FP16 FMA and partition/tree reduction differ numerically from sequential FP32 GEMM and binary64 CPU reference. FP32 synthetic rewrite changes data and precision/order;not operator-equivalent replay.

|Conclusion|Source/index evidence|Runtime cross-check|Remaining unknown|
|---|---|---|---|
|A: eight independent input vectors/rows|L45–52 x0..7;independent s0..s7;L169–199 stores x0..7|All store predicates true;input/output texture x extents512 cover those lanes|Whether vectors correspond to token,batch,head,spatial or padded lanes|
|A: execution K1536|L44 src_s<384,stride4;L61–92 four components per slice|Captured U.i0.z384;input height384|Valid model reduction channels/padding values|
|A: execution N2048|L30–44 bound512;each s_r vec4;stores|Captured U.i0.x512;output height512|Valid logical output channels vs padding|
|A: dense product mapping|L54 s*512+d;L56–65 matrix columns;reduction L96–166|Binding2 offset0/range6291456 =384*512*32,auxiliary consistency only|Graph producer meaning of weight transpose/axes|
|A: all accesses within views|r<8<512,s<384,d<512,block<196608|rgba16float views,baseMip0,layer0,2d|Allocation extents outside x0..7 are not extra GEMM rows|
|A: no bias/activation/INT4 fusion|main only fma,shared reductions,stores|Exact source hash matched|Graph upstream/downstream operations|
|B: effective logical M/K/N|No graph tensor mapping in captured bindings|U.i0 is execution metadata,not tensor schema|All three valid logical dimensions and padding interpretation unproved|
|C: layer/name/token/batch/head|No names/graph-op ID association exported|Actual generation submission proves use|Layer/use UNKNOWN;not required for A but cannot infer B/C|

Official language semantics: [WGSL CRD2026-07-03 matrix types/indexing](https://www.w3.org/TR/2026/CRD-WGSL-20260703/#matrix-types) and [alignment/size](https://www.w3.org/TR/2026/CRD-WGSL-20260703/#alignment-and-size). These define column storage and indexing,not model dimensions. Fixed runtime auxiliary source evidence remains at commit04a9f7634b2800046a477fe60e26edceaa8a8849 in profiling_capabilities.md;not claimed exact npm native build revision. Parameter generation observed at native queue.writeBuffer33496 in MODEL_INIT;its compiled-WASM caller/operator-axis mapping was not captured. No additional phone capture added.

Local Web model identity:3038117888 bytes,SHA256 b6c8e1081ec80730f14473a5ece941b48da5d8e2a80c97c2963da153f3eff3d2. First256 bytes contain TFL3;that header alone does not associate tensor names/metadata with this pipeline. No model weights loaded/exported for this review. Subsequent bounded metadata traversal (`python scripts/review_model_metadata.py`) used the official TensorFlow v2.20.0 schema,read237665 bytes of metadata via seeks (not Model.Buffers/weights),and found one GEMMA3N_2B subgraph with2356 tensors. No tensor shape simultaneously contains1536 and2048 in this parsed graph. This does not disprove the executed arithmetic shape (runtime lowering/transforms/padding may differ);no native shader-to-graph tensor/operator IDs exist,so no logical association is established. Derived review:results/analysis/model_metadata_review.json. [Official schema](https://github.com/tensorflow/tensorflow/blob/v2.20.0/tensorflow/compiler/mlir/lite/schema/schema.fbs) is an auxiliary compatible field reference,not exact npm native schema/build provenance.

## Two bounded alternative reviews

1. shader-2636/hash c2db25eba21be2b144db24441edf5581198bade43b6053f3b3914954d5dd0b3f:direct packed mat4x4<f16>,eight accumulators,but src_s+=8 and U.i0 symbolic. PROFILE002 establishes actual generation submissions,not uniform bytes/overrides/bindings for it. Cannot transfer current shader's U/overrides to this different source. No improved logical shape proof.
2. shader-2722/hash cbbfaa6c74436dac9056f5a41e673096c1ab1bcf695701c23be7975bc4171678:four FP16 weight textures,explicit w_batch_id=DST_Y;source y=yc0*U.i0.w+s,weights y=w_batch_id*U.i0.w+s;source x=xc0. Arithmetic is batched/vector products,not safe flattening of DST_Y into M. All numerical U.i0/texture ranges absent in PROFILE002.1620 submitted occurrences support use,not dimensions. No simpler full-shape candidate is established. Stop at two;no profiler expansion.

## GEMM004 protocol

One actual execution-shape supplementary configuration M8,K1536,N2048;two original naive/tiled variants only. Synthetic signed deterministic FP32 input;existing integer atol/rtol0/0,fractional.002/.0002,relative floor1e-8;binary64 CPU reference. Existing small boundary cases export complete inputs/outputs;performance shape full online checks. Shared A/B,independent C;10 warmups/variant,30 measured balanced rounds15/15 using fixed seeds;single dispatch/pass,serial completion/full readback/check. Same-run medians only;all zeros/tails preserved;65536ns observed precision rechecked;resolution-limited ratios suppressed. No sizing fallback. Shape exceeds neither current default storage binding limit (B12MiB) nor dispatch caps;device checks remain authoritative. NOT_RUN until actual phone result.

This does not satisfy original decode GEMV M1/prefill M>=128 real logical-layer-shape requirement. Valid logical proof remains a separate gap;no further identical SHAPE001/TIMING002 run requested.


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
