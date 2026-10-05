# Model shape evidence for GEMM003

This is an offline review of existing data. No new model phone run, profiler expansion or timestamp-overlap diagnosis is introduced. GEMM003 proceeds with representative M=1,K=N=1024. No complete real shape is established, so no extra real-shape benchmark is added.

## Reviewed real instance and submission chain

Source [complete PROFILE002 raw JSON](../results/raw/PROFILE002-2026-10-04T15-53-13-603Z.json),SHA256 `c6e10b219dbc280669ebdd716d08b374682369375dc69ec15caaf96a19efb840`. Candidate shader-2630,hash `ee9a0b2823d07f56fe2e9c50134dbc9c58f9f411dcfc11795869196870dd6036`,pipeline-2631,entryPoint main,SYNC created during MODEL_INIT. Exact [WGSL source](../results/analysis/profile002/shaders/ee9a0b2823d07f56fe2e9c50134dbc9c58f9f411dcfc11795869196870dd6036.wgsl). Reproduce `python scripts/recover_gemm_shape.py`; derived [submission evidence](../results/analysis/profile002/gemm003_shape_candidate.json) includes all three occurrences.

GENERATION has3 encoded and3 submitted dispatch occurrences for this pipeline. First chain: submitSequence6838 → commandBuffer-3372 → pass-3371 → dispatch sequence3460 → pipeline-2631 → shader-2630. Last: submit13694 → commandBuffer-3390 → pass-3389 → dispatch10316. Each recorded dispatch is(64,1,1). These are scheduling dimensions, not M/N/K; shader identity is one, calls are three. Native submit association is not an independent hardware execution counter.

## Evidence table

| Item | Source evidence | Proven role / value | Gap |
|---|---|---|---|
|Operator|L54–65: linear_i4o4=src_s*U.i0.x+dst_s; mat4x4<f16> weights; four FMA components per vec4|Packed weight products with reduction, high arithmetic confidence|GEMM/GEMV graph role and logical axes UNKNOWN|
|Output packed slices|L30–43 and L54: dst_s from invocation.x, bound U.i0.x; weights stride U.i0.x|U.i0.x is output-slice bound and weight-block row stride|Numeric U.i0.x and valid unpadded N UNKNOWN; do not assert N=4*U.i0.x without padding evidence|
|Reduction slices|L44: src_s=local.y; src_s<U.i0.z;src_s+=4;L45–52 textureLoad;L56 matrix block|U.i0.z bounds source slices; local.y partitions reduction|Numeric value, valid logical K, packing/padding UNKNOWN|
|Spatial/input lanes|L45–52 loads texture x0..7;L169–199 output x0..7 gated by U.i0.y comparisons|Eight local unrolled accumulators/lane locations; U.i0.y affects stores|Global M and U.i0.y semantics UNKNOWN; eight slots do not prove M=8 or M=1|
|Weights layout|L15–18 array<mat4x4<f16>>,L54–60 block index and matrix columns|Packed FP16 blocks, not dense row-major B[K,N]|Binding2 buffer offset/range, logical transpose and axis mapping UNKNOWN|
|Activation/output dtype|L13 rgba16float output;L14 texture_2d<f32>;L45 conversion to vec4<f16>;L33–40 f16 accumulators|FP16 arithmetic and output storage; textureLoad result converted to FP16|Actual input texture format/view and logical dtype metadata UNKNOWN|
|Workgroup/reduction|L2–4 override ids0/1/2;L23 temp array<vec4<f16>,32>;L44 stride4;L98 onwards reduction barriers|32 shared vec4 slots, reduction stride4, eight accumulators|pipeline.constants not recorded; workgroup values UNKNOWN|
|Quantization/fusion|Inspected executable main loads direct FP16 matrices and performs FMA/reduction/stores|No visible Q4 unpack/dequant or bias/activation in this main; Pack/Unpack helpers alone are not such evidence|Upstream transforms/graph fusion UNKNOWN|
|Complete logical shape|Uniform/binding payloads absent|M=UNKNOWN,N=UNKNOWN,K=UNKNOWN|Cannot justify an M=1 row-major-compatible real shape|

## GEMM003 historical parameter-capture proposal

Limit capture to shader hash/pipeline-2631 and a bounded number of submitted dispatch occurrences. Preserve pipeline constants (including ids0/1/2), bind-group entries and dynamic offsets at setBindGroup, and join them to pass/command-buffer/submit identities. Binding3 needs the16-byte Scalars payload as four signed i32 values, especially U.i0.x/y/z, with versioned queue.writeBuffer offsets/data and copy provenance; inspecting only createBuffer.size cannot recover it. Capture buffer binding2's offset/size and allocation metadata, and binding0/1 texture/view dimensions, formats, mip/subresource and creation/parent-view association. Capture only parameter metadata/targeted uniform bytes, not model weights or tokens.

If uniform updates originate from GPU copies rather than CPU uploads, mark bytes UNKNOWN until a permitted targeted readback with valid COPY_SRC is designed; do not silently add incompatible usages or stall every dispatch. Tensor axis/padding metadata from the runtime graph remains necessary even after byte capture. Reconstruct valid extents and packed-axis equations first, then map to logical M/N/K with explicit padding/transpose proof. A texture extent or allocated buffer byte count alone may include padding and cannot prove dimensions. This is a proposed bounded follow-up, not existing coverage.

Any future same-shape FP32 rewrite changes this FP16/packed/reduced implementation; shape equality is not operator-equivalence or model-acceleration evidence. Unknowns here do not gate GEMM003's standalone experiment.


## Current A/B round: SHAPE001 implemented — phone NOT_RUN

No earlier run established complete logical M/N/K. An alternate shader-2636/hash c2db25eba21be2b144db24441edf5581198bade43b6053f3b3914954d5dd0b3f likewise uses symbolic U.i0 and unrolled texture slots. Keep reviewed shader-2630 to avoid widening scope. Logical,padded,packed dimensions and batch/head roles remain UNKNOWN; no folding into M.

`src/profiling/shape001.html` uses the stock MediaPipe0.10.29 device/model/prompt/config,one initialization and one short generation,without timestamps or added GPU allocation/submit/wait/readback. Exact target-source SHA256 checked. Selected linkage,bind-group/texture metadata and small parameter paths wrapped before model init; native receivers/arguments/returns/exceptions and async pipeline promises preserved. Failures/caps are visible; existing pages/raw unchanged.

Snapshots record shader/pipeline/entryPoint/constants,pass/command/submission/encoding IDs,setBindGroup sequence,buffer usage/size/binding offset/size,dynamic-offset slices,texture/view dimensions/format/subresources. CPU shadows track zero initialization,mappedAtCreation/unmap,queue.writeBuffer and ordered copy/clear operations. TypedArray dataOffset/size are element units relative to the actual view including byteOffset/byteLength;DataView/ArrayBuffer use bytes. Binding3 exports16 actual bytes,four little-endian i32,known mask/version and preceding write/copy provenance. Snapshots follow queue-order updates at each submission occurrence,not final buffer content. Repeat submit is a distinct snapshot; encoded/submitted counts separate.

Historical v1: only uniform buffers<=65536 bytes and candidate CPU staging COPY_SRC buffers<=256 bytes are shadowed,up to8MiB payload backing; masks/version arrays add host storage. No whole weights/all intermediate activations read. Only selected parameter bytes/provenance exported. Bounds:30000 metadata objects,100000 update records,30000 relevant encoded operations,8 selected submission samples; dropped/wrapper/restoration failures INCOMPLETE. No full CountObserver trace added,only phase/lifecycle tracking and targeted observer. Collector callback CPU wall and limits/drops are exported; overhead prevents stock throughput comparison.

Known staging CPU bytes propagate through GPU copies with offsets/source update IDs. Unknown GPU-produced/copied data remains UNKNOWN. Render/uncovered writes mark failure; dual-use uniform/storage dispatches invalidate state conservatively. No usage mutation or final-content replacement. Inserting per-dispatch GPU readback inside an unchanged runtime pass is not safe; none added. If bytes remain unknown,report the gap and consider a separately audited before-pass snapshot or native parameter hook only,not large resource reads.

Observer COMPLETE is separate from parameterBytesStatus KNOWN/INCOMPLETE and logicalShapeStatus UNKNOWN_UNTIL_AXIS_PADDING_REVIEW. Numeric U.i0 and texture sizes may only establish padded storage extents; tensor axes,valid channels and batch/head mapping still need review.

## GEMM004 prepared but gated — NOT_RUN

`src/benchmark/gemm004.html` loads gemm004_shape.json,current WAITING_FOR_SHAPE_EVIDENCE with shape null. Run disabled,diagnostic JSON downloadable; no representative fallback or resizing. Only an evidence manifest with logical M/N/K,raw path/hash,review document and explicit M/N/K/padding/batchHead/rowMajorMapping proofs enables comparison. The gate checks required provenance fields,not the truth of assertions; review must establish them. No dimensions entered now.

M=1 uses original naive/tiled/specialized;M>1 naive/tiled through existing shared framework. Same synthetic FP32 inputs/reference/frozen tolerances,full small-case arrays,10 warm-ups/variant,30 balanced measured rounds (15/15 or six orders5 each),one dispatch/pass,serial readback/check,query-safe reuse,grid/resolution and same-run medians. Unsupported resource limits SKIPPED with reasons,not shrunk. This is a real-shape synthetic FP32 rewrite,not model weights/activations or an equivalent packed/quantized/fused operator. No kernel algorithms changed.


## SHAPE001 actual run 2026-10-05 — INCOMPLETE and bounded fix

Raw [SHAPE001-2026-10-05T11-16-33-534Z.json](../results/raw/SHAPE001-2026-10-05T11-16-33-534Z.json), SHA256 `a03f57a46422e957dc9174f1e570a5561d5cb0b16d8f6a125905fbf0f4c7d861`, preserved byte-for-byte. Initialization, generation, done/nonempty output and GPU drain all completed; runtime errors and selected shader compilation messages empty. Three selected encoded and three submitted occurrences were captured, dropped events zero. Parameter capture was INCOMPLETE: three `Uniform/staging shadow capacity unavailable` failures, and all three selected16-byte snapshots UNKNOWN. The64KiB per-buffer guard excluded three1MiB uniform arenas; payload shadows used16752 bytes, so this was not global8MiB exhaustion. Binding3 uses a1048576-byte UNIFORM|COPY_DST arena (usage72), offset722176,size16, no dynamic offsets. It lacks COPY_SRC; no GPU readback or usage change is introduced.

Captured pipeline `shape-pipeline-11990` / shader `shape-shader-11989`,main,override constants0=8,1=4,2=1 establish workgroup8×4×1. Selected dispatches64×1×1 remain scheduling dimensions. First submission51672 / commandBuffer17452 / pass17451 / encoding46613. Weight binding2 range6291456 bytes and rgba16float texture extents512×512 output /512×384 input are allocation metadata, not logical M/N/K proof. U.i0.x/y/z and axis/padding/batch-head mapping remain UNKNOWN; GEMM004 stays gated.

Collector revision `SHAPE001-uniform-arena-v2` supports uniform arenas up to2MiB with the existing8MiB total payload cap. It retains CPU upload/known staging-copy provenance before bindings are discovered and freezes only selected16-byte snapshots at submitted dispatches. No weights/activations or model GPU resources are read/allocated, no algorithms changed. Payload arrays plus known masks and Float64 version arrays occupy10×payload host bytes (up to80MiB), separately exported as shadowHostArrayBytes; metadata/wrapper/update objects add further unmeasured host overhead. This is instrumentation host storage, not GPU memory. Caps still fail visibly with size/usage-budget details. Current repaired revision is NOT_RUN on phone; repeat one short SHAPE001 generation and export a new file. The failed original remains evidence.


## SHAPE001 v2 actual run 2026-10-05 — COMPLETE

Raw [SHAPE001-2026-10-05T11-32-49-007Z.json](../results/raw/SHAPE001-2026-10-05T11-32-49-007Z.json), SHA256 `fcece04380902827c2db59597ba9b2e01687d431ff3273a3d72d75026218d721`, archived byte-for-byte. Revision SHAPE001-uniform-arena-v2: overall and collector COMPLETE,parameterBytesStatus KNOWN,three encoded/three submitted selected occurrences,missing snapshots0,dropped0,coverage failures/compilation messages/runtime errors empty. All lifecycle checks true. Full prompt sizeInTokens returned18; generated token count remains NOT_MEASURED.

Independent little-endian decoding of all three16-byte snapshots gives U.i0=[512,8,384,0]. Each uses binding3 effective offset722176 and provenance queue.writeBuffer sequence33496 in MODEL_INIT (actual Uint8Array view,size16,bufferOffset722176); snapshot-level latest arena version45183 is not the selected byte update ID. Pipeline overrides establish8×4×1 workgroup. Submit/pass/command links51672/17451/17452,56984/17462/17463,62296/17473/17474 are preserved separately.

WGSL evidence establishes512 packed output vec4 slices and384 reduction vec4 slices; four components give2048 output storage channels and1536 reduction storage channels. Eight explicit input texture x lanes and output stores are present; all store predicates0,-1,...,-7 < U.i0.y=8 hold. This proves an executed packed arithmetic view with eight lanes,1536 reduction components,2048 output components. It does **not** prove unpadded logical M=8,K=1536,N=2048, batch/head roles or model graph tensor semantics. Texture allocations512×384 and512×512 and weight bytes6291456 are cross-checks only. Row-major rewrite requires unpacking mat4x4<f16> weights and texture vec4 axes; it changes FP16 accumulation/storage. No full logical-shape manifest is enabled. GEMM004 remains WAITING_FOR_SHAPE_EVIDENCE. Remaining minimal evidence is selected operator tensor-axis/valid-channel/padding metadata from graph/runtime; no further identical SHAPE001 rerun requested.

Collector CPU callback wall691.0000029802322ms,shadow payload3162480 bytes,host shadow arrays31624800 bytes; latter excludes metadata/wrappers and is not GPU memory. No performance comparison with stock inferred. Original incomplete v1 and complete v2 records remain separate. TIMING002 is the independent next phone control; SHAPE001 completion does not resolve PROFILE003 timestamp overlap.


## Current offline review: GEMM004 execution-shape supplement

Supersedes historical gating only for execution/padded scope: [proof](../docs/gemm004_shape_proof.md),[direct original assignment audit](../docs/assignment_requirements_matrix.md). A:execution arithmetic M8,K1536,N2048 and packed-to-row-major mapping established;B:valid logical dimensions/padding unknown;C:layer/token/batch/head unknown. Two alternatives reviewed without improved parameters;no new capture. GEMM004 enabled as EXECUTION_PADDED_ONLY,phone NOT_RUN,original naive/tiled and same timing/reference framework. No claim of satisfying real decodeM1/prefillM>=128 or quantized FP16 A-D pipeline. TIMING002 decision unchanged:independent overlap reproduced,serial control changes conditions,cause UNKNOWN;PROFILE003 not used for exclusive costs/stacked breakdown. Next direct kernel task FP16 A/B contract/fallback then vectorized C;target Adreno and logical shape gaps remain. No commit/push.
