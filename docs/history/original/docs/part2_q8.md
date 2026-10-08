# Q8 FP16 A–D pilot — phone NOT_RUN

## Original requirement and explicit experiment choices

Original assignment p2 Part2 says “Q4/Q8 weights” followed by dequantization,GEMM and FP16 accumulation;A naive,B workgroup-tiled,C vectorized,D fused dequant+GEMM. The original does not specify signedness,group,packing,scales/zp or rounding. These are project choices under PART2-QROW-v1,not Gemma's native quantization format.

|Item|Q4 verified path|Q8 pilot|
|---|---|---|
|Stored code|unsigned0..15|unsigned0..255|
|Packing per u32|8 nibbles,low nibble first|4 bytes,low byte first|
|Row stride words|ceil(N/8)|ceil(N/4)|
|Fractional scale|half1/32|half1/512|
|Seeded zero points|8+(-1/0/1)|128+(-1/0/1)|
|Group|32 along K per column|same|
|Metadata|half scale/u32 zp,[ceil(K/32),N]|same|
|A/output|half activation;half numerical output in f32 carrier|same|
|Accumulation|component-wise increasing-K f16 fma|same|

K rows independently word-aligned;unused high row-tail bits zero;no K padding or cross-row packing. CPU words use little-endian typed arrays. For Q8 `q=(words[k*ceil(N/4)+floor(n/4)] >>> (8*(n%4))) &255`. Byte values128..255 stay positive unsigned codes:do **not** sign-extend them as INT8. Signed real weights arise from `i32(q)-i32(zp)`,including negative/zero/positive values. Group-tail metadata is indexed floor(k/32)*N+n with only valid K values consumed.

Dequant `B16=RN16((q-zp)*decodeHalf(scale))`. CPU multiplies in binary64 then converts half;D performs exact signed-integer subtraction→f32 scale multiply→explicit f16 conversion. Selected integer differences and scales1/512 or1 are exactly representable before conversion,so D matches saved B16 semantics. Scale arithmetic is not half multiplication/accumulation;the GEMM fma accumulator remains f16. No bias/activation/transpose/INT4 or INT8 native-format claim.

## Implementation and preserved paths

New page `src/benchmark/part2_q8_abcd.html`,entry `part2_q8_abcd.js`,new D shader `part2_d_q8_f16.wgsl`. Shared `part2_ad_page.mjs` and `part2_abcd_math.mjs` now parameterize format,decode mask/code positions,row stride,extreme-code override and D shader filename. Historical Q4 shaders and entry remain unchanged;Q4 default format is4. Q8 reuses exact A/B/C shader files and all query/submit/readback/statistics logic. No duplicated benchmark controller,no sweep/subgroup/split-K/new layout or reduction order.

D same C WG8×8,output8×32,Ktile16,64invocations/four columns each,1280shared bytes,two barriers per tile. Scalar packed-byte decode creates the shared vec4<f16> B tile. Invalid rows/columns reach barriers,invalid K/N loads zero,stores guarded. Storage bindings A/packed/output/scale/zp require5 slots;16byte uniform M/N/K/rowWordStride;buffers/dispatch/shared limits checked,unsupported shapes SKIPPED. D has no full B16 matrix input. Combined ABCD harness still allocates ABC intermediate matrices;logical allocation differences do not establish physical GPU residency.

## Pre-run numerical policy

Same fixed seed0x2ab00117,xorshift32 and independent CPU references:binary64 from actual stored A/q/scale/zp,canonical RN-even half sequential fma,and supplementary FP32 accumulation. Frozen maxK1024,A fractional integer[-16,16]/64,full Q8 code range,scale1/512. Exact family remains A=-1/0/1,q=zp±1,scale1. Explicit extreme case cycles q0/255/zp/1/254 with other seeded values unchanged;records override. This checks raw code zero/extremes and dequantized negative/zero/positive values. It is not a change to historical Q4 alternating0/15 case.

Actual desktop CPU-only full-domain preflight `node scripts/check_q8_reference_domain.mjs` writes `results/analysis/q8_cpu_reference_validation.json`,not results/raw and not fabricated phone evidence. Canonical-vs-high/FP32 max absolute error0 exact;fractional0.017425537109375(M1) and0.03326416015625(M128),under predetermined high bound. CPU packing/unpacking exact across byte/word/row/group tails;unsigned high-bit codes preserved;D collective interpreter matches canonical reference on small tail cases.

After this independent preflight,the existing numeric bounds are explicitly adopted for Q8:exact atol=rtol0;semantic atol0.02/rtol0.01;high/FP32 atol0.04/rtol0.04;relative denominator max(abs(expected),1e-8);nonfinite rejected. These are engineering thresholds for these bounded inputs/K,not universal WGSL error bounds. The semantic allowance is unchanged to keep the same declared arithmetic acceptance;zero error in the interpreter establishes no different reduction order,not all hardware behavior. Some Q8 products/cancellation can be subnormal;compiler rounding/flush behavior may differ. Phone failure triggers diagnosis,not automatic threshold/amplitude/precision relaxation. JSON includes policy,active format and audit path.

Precision diagnostic A=[2048,1,1],q=zp+1,scale1 must produce2048 for every required variant versus FP32/high2050. Feature enabled alone is insufficient. Small non-square,packing/group/vector/tile tails,explicit extrema and extraM9,K65,N5 case export all input/metadata/packed words/reference and four actual outputs. Large representative M1/M128,K=N1024 are checked online for every output/nonfinite/error;no claimed independent offline replay unless actual arrays exported.

## Two measurement scopes

Unchanged Q4 methodology:prepared-input single-dispatch GPU pass versus independently sampled resident-packed complete-path wall. ABC CPU-decode each complete-path sample anew;C also pads/copies rows anew;converted weight upload included. D consumes resident packed Q8/scales/zp,no full decoded matrix. GPU buffer/pipeline allocation,common initial A/packed/metadata upload,reference,map and correctness are excluded from complete wall;encoding,variant upload,query/output copies and queue completion included. Complete-wall boundary ends before map/check. Kernel-only excludes ABC preparation while D includes decode/dequant inside pass. CPU ms are never added to GPU timestamp ms;no sum of medians.

One-time setup/preparation/resource records distinguish static-weight reuse from repeated preparation. Q8 main packed payload1024×1024/4 words=1048576bytes;B16=2097152bytes;scales65536bytes,zp131072bytes. C padded matrix same size for N1024;tail padding is recorded on small shapes. These are logical bytes,not physical GPU memory. D does not require a weight reorder. No per-token throughput/model acceleration inference.

Each scope/shape:10warmups and30measured per variant,all24four-version permutations once plus six balanced additions,positions7/8 and pair precedence15/15. Fixed seeds and actual order exported;each sample serial queue completion,map/unmap/full check before next. Query0/1 reused safely after readback.120measured+40warmup per scope,640sampling passes across two shapes/two scopes. BigInt timestamp differences,raw decimal endpoints,zeros/tails preserved;median,nearest-rank p95,min/max/zero/grid/resolution flags. Ratios only same-run/same-scope Q8,not historical Q4. Cross-format differences are descriptive until controlled shared repeats.

## Run and acceptance

Phone NOT_RUN. Windows project-root server: `python -m http.server 8000 --bind 127.0.0.1`.
PowerShell USB reverse: `& "C:\Tools\platform-tools\platform-tools\adb.exe" reverse tcp:8000 tcp:8000`.
Phone Chrome: http://localhost:8000/src/benchmark/part2_q8_abcd.html . Confirm Q8 FP16 heading,unsigned format,fill actual thermal/charging/DevTools/flag,click **运行 Q8 FP16 A/B/C/D**,keep foreground through both scopes,download PART2Q8ABCD-FP16 JSON even ERROR/UNSUPPORTED. No Q4 performance rerun needed.

shader-f16 required and timestamp-query explicitly requested if supported. Missing f16→UNSUPPORTED required path,downloadable;no automatic precision switch. Separate historical `part2_ab.html` supports **manual Q8 selection → 运行独立 FP32 fallback**,labeled FP32_FALLBACK;it covers A/B only and never counts as FP16 A-D success. Missing timestamps allows correctness and complete-wall experiment,GPU NOT_MEASURED. Compilation/requestDevice/validation/loss/map errors remain visible/exportable.

Acceptance:required precision probe/all outputs pass,nonfinite0,no errors,format/packing/source hashes/input/ref/threshold metadata correct,full balanced orders/raw records for both scopes,logical preparation boundaries explicit. Desktop CPU/static/mock checks are not phone GPU compilation/correctness/performance. Q8 phone validation,real logical shapes,Adreno and Part1 gaps remain;finite sweep and at least five independent repeats follow only after this pilot. Three temporary integrity snapshots remain local,not formal results. No commit/push.


Q8 FP16 A-D phone pilot COMPLETE (2026-10-05),superseding NOT_RUN. All correctness PASS;6476small outputs and640sampling records independently verified. Semantic max error0,ordinary high/FP32 max abs0.03326416015625. D kernel-only slower than C;complete wall benefit assumes repeated ABC preparation/upload,not weight reuse/model acceleration. M1 A/C differsone65536ns grid,no stable small benefit claim. See experiment_log and results/analysis/part2_q8_abcd_verified.json. Sweep/independent repeats and real logical shape/Adreno/Part1 remain pending. No commit/push.
