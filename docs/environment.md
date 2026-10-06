# Experimental environment

## GEMM003 actual run 2026-10-05T10:00:53.482Z–2026-10-05T10:00:55.452Z

[Raw JSON](../results/raw/GEMM003-2026-10-05T10-00-55-452Z.json),SHA256 `95cb1119984fe39993a405767719bad83b51e5dce1c5e2d7462e086721ac38e2`. Manual thermal/charging/DevTools/flag: {"thermal": "未明显发热，温度未测量", "charging": "未充电：电量100%", "devtools": "未开启", "flag": "已停用"}. Visible throughout,no background events. Adapter info {"vendor": "arm", "architecture": "gen-5", "device": "", "description": ""},empty fields preserved; actual device features ['core-features-and-limits', 'timestamp-query']. Three measured sets:65536ns observed grid,zero count0/30 each. Shared256-byte/64-invocation specialized configuration fits actual device limits; full limits in raw JSON. Do not guess exact GPU or treat manual conditions as instrumented temperature/flag measurements.


## GEMM002 actual run 2026-10-05T04:58:12.908Z–04:58:16.647Z

Source: [byte-preserved JSON](../results/raw/GEMM002-2026-10-05T04-58-16-647Z.json),SHA256 `26bd3dc90351f2499627ddcb93bd8cb46ebf7851e47edf3dd59e56d11a2f5a90`. Secure localhost, Chrome154 reported UA Android10/K; do not infer exact Android/model from the reduced UA. Adapter arm/gen-5, device/description empty. Actual device features core-features-and-limits,timestamp-query; shader-f16 is adapter-supported but unused by this FP32 experiment. Adapter/device maxInvocations1024/256 and workgroup storage32768/16384 bytes; tiled needs256 invocations/2048 bytes. maxBufferSize4294967292/268435456 and maxStorageBufferBindingSize2147483644/134217728 bytes. Full snapshots retained in JSON.

Manual states: thermal「未明显发热，温度未测量」; charging「未充电：电量100%」; DevTools「未开启」; Developer Features flag「已停用」. These are user-entered statements, not independently instrumented measurements. Initial visibility visible, no transitions/background. Observed timestamp-difference grid65536ns in all four measured shape/variant sets, each zero count0/30. All120 tracked resources recorded destroyed; allocation bytes are logical resources, not physical GPU memory. No exact GPU/Adreno identification, hardware counters or measured temperature added.

## Development device evidence

| Field | Value | Evidence and scope |
|---|---|---|
| Device | OnePlus Ace 6 Supreme Edition, PMB110 | User screenshots |
| SoC | MediaTek Dimensity 9500 | About-device screenshot |
| GPU | ARM Mali-G1-Ultra MC12 | chrome://gpu GPU0 string |
| Physical RAM | 16 GB | Device screen shows 16 GB plus 12 GB expansion; expansion excluded |
| Storage | 512 GB | Device screenshot; not available RAM |
| Android | 16 | Device and Chrome screenshots |
| ColorOS | 16.0.10 | Device screenshot |
| OEM build | PMB110_16.0.10.500(CN01B110P02) | Device screenshot |
| Android build | BP2A.250605.015 | Chrome screenshot |
| Security patch | 2026-08-01 | Device screenshot |
| Chrome | 154.0.8037.92 stable, 64-bit | chrome://version |
| Driver vendor | ARM | chrome://gpu GPU0 |
| Reported driver version | 2.1.28733 | GPU0/ANGLE metadata; not independently identified as the WebGPU Vulkan driver |
| WebGPU status | Hardware accelerated | chrome://gpu; not a compute correctness test |
| Vulkan status | Enabled | chrome://gpu |
| Skia backend | GaneshVulkan | Browser drawing backend; does not establish WebGPU backend |
| Timestamp sample | Animated output and changing nonzero render-pass duration | User observation on 2026-10-03; raw queries not captured |

## COMPUTE001 exported adapter and device evidence

Source: [original phone JSON](../results/raw/COMPUTE001-2026-10-04T10-53-11-629Z.json), environment ISO time `2026-10-04T10:53:07.372Z`. Page: `http://localhost:8000/src/benchmark/`; secureContext and webgpuExposed both true. Exported userAgent: `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36`. Preserve this browser-reported string separately from the earlier device/version screenshots; it does not replace their OS/build evidence.

Adapter info: vendor `arm`, architecture `gen-5`, device `""`, description `""`. Empty values are retained; no specific GPU model, backend or driver is inferred from this export. The full adapter feature list is preserved in the JSON. Adapter support for `timestamp-query` and `shader-f16` is true, but both are NOT_TESTED here. `requiredFeatures: []`; actual device features: `["core-features-and-limits"]`. Neither optional feature was enabled.

The default device limits below differ from the adapter limits in seven recorded fields. Values are copied from the export; byte units apply to buffer sizes, storage sizes and alignment. These are exposed limits, not measured allocation capacity or performance.

| Limit | Adapter | Actual device |
|---|---:|---:|
| maxBufferSize | 4294967292 | 268435456 |
| maxStorageBufferBindingSize | 2147483644 | 134217728 |
| maxStorageBuffersPerShaderStage | 16 | 8 |
| maxBindGroups | 4 | 4 |
| maxBindingsPerBindGroup | 1000 | 1000 |
| minStorageBufferOffsetAlignment | 256 | 256 |
| maxComputeWorkgroupStorageSize | 32768 | 16384 |
| maxComputeInvocationsPerWorkgroup | 1024 | 256 |
| maxComputeWorkgroupSizeX | 1024 | 256 |
| maxComputeWorkgroupSizeY | 1024 | 256 |
| maxComputeWorkgroupSizeZ | 64 | 64 |
| maxComputeWorkgroupsPerDimension | 65535 | 65535 |

COMPUTE001 used 4100-byte buffers, three storage bindings, workgroup_size(64) and 17 workgroups, within actual device limits. requestDevice succeeded and all 1025 FP32 sums were independently verified exactly (max absolute error 0). Compilation messages and GPU error records were empty; no device loss was recorded before export. Device-loss recovery has not been deliberately tested. This run contains no performance measurement; ISO timestamp differences must not be reported as GPU kernel time. FP16 and timestamp-query execution still require separate tests.

The sample displayed roughly millisecond-scale values with visible variation. Exact statistic, units and sample distribution were not captured. Do not use these observations in a performance table or infer timing precision from them.

## TIMING001 actual timestamp environment

Evidence: [run 1](../results/raw/TIMING001-2026-10-04T11-25-41-874Z.json) and [run 2](../results/raw/TIMING001-2026-10-04T11-39-21-730Z.json). Both ran at `http://localhost:8000/src/benchmark/timing.html` with secureContext true and the same exported userAgent as COMPUTE001. Adapter info remained vendor `arm`, architecture `gen-5`, device/description empty. No specific model is inferred from empty fields. Both runs exported identical adapter/device feature lists and limits; complete limit records remain in each JSON. Relevant buffer/compute limits match the COMPUTE001 table above.

Both devices reported `["core-features-and-limits", "timestamp-query"]` with `requiredFeatures: ["timestamp-query"]`. Compute-pass timestampWrites, query resolve and mapped 64-bit timestamp readback actually succeeded. Unlike COMPUTE001, timestamp-query is now execution-validated. shader-f16 is adapter-supported but was not enabled or tested. Both runs completed 240 passes, their correctness summaries all PASS, with empty compilation messages/GPU error records and no recorded device loss.

| Recorded condition | Run 1 | Run 2 |
|---|---|---|
| Start ISO time | 2026-10-04T11:25:38.441Z | 2026-10-04T11:39:17.730Z |
| End ISO time | 2026-10-04T11:25:40.884Z | 2026-10-04T11:39:20.220Z |
| Thermal (manual text) | 手感无明显发热；未测量温度 | 手感无明显发热；未测量温度 |
| Charging (manual text) | 未充电：电量100% | 未充电：电量100% |
| WebGPU Developer Features flag (manual text) | 已停用 | 已停用 |
| Initial page visibility | visible | visible |
| Background entry during run / sampling | false / false | false / false |
| Visibility events | empty | empty |
| DevTools state | Not recorded in original JSON | Not recorded in original JSON |

Manual flag/charging/thermal values are self-reported, not independently probed; temperature was not measured and thermal stability is not established. Each run independently exhibits a 65536 ns (65.536 microseconds) timestamp grid, established from integer GCDs of raw timestamps, unique timestamp spacings and durations. The smallest single-dispatch configuration has 6/30 measured zeros in both runs. Preserve those zeros and the tails; the grid limits interpretation of short intervals. It does not establish an intrinsic hardware resolution or a general browser quantization rule. See [the per-run comparison](experiment_log.md#timing001-android-webgpu-compute-timestamp-validation). Lower run-2 p95 values cannot be causally attributed to DevTools because its state is absent from both files.

## BASELINE001 actual inference environment

Evidence: [unchanged original JSON](../results/raw/BASELINE001-2026-10-04T14-11-39-378Z.json). @mediapipe/tasks-genai 0.10.29 initialized the specified Gemma 3n E2B Web model and completed one text request with nonempty output and no recorded errors. secureContext true; crossOriginIsolated false; phone page `http://localhost:8000/src/baseline/`. The exported userAgent matches the earlier reduced browser string. Probe adapter reports arm/gen-5, empty device/description, independently from the device supplied to the runtime.

The actual supplied runtime device was created by the stock helper and enabled `["core-features-and-limits", "shader-f16", "subgroups"]`, without timestamp-query. Adapter support does not imply this device enabled timestamps. Runtime maxBufferSize was 4294967292 bytes, maxStorageBufferBindingSize 2147483644 bytes, maxStorageBuffersPerShaderStage 16; compute invocation/workgroup-X/Y limits remained 256. These differ from the default COMPUTE001/TIMING001 devices. Actual native execution backend and per-kernel precision remain UNKNOWN; enabled features do not prove which operations used them.

The model was desktop-hashed at 3038117888 bytes, SHA256 `b6c8e1081ec80730f14473a5ece941b48da5d8e2a80c97c2963da153f3eff3d2`; browser served size matched. Publisher SHA256 comparison was not performed; browser rehash was NOT_MEASURED. File size identifies disk storage, not GPU memory, JS heap or process RSS/PSS.

During initialization, hidden/visible events occurred at `2026-10-04T14:09:52.312Z` / `2026-10-04T14:09:59.498Z`; initialization wall time 91756.59999999404 ms includes that approximately 7.186-second background interval. Do not subtract it to invent foreground-only timing. No visibility events were recorded during generation. Thermal/charging/DevTools conditions were not recorded in this BASELINE001 JSON and are UNKNOWN for this run; do not inherit TIMING001 conditions. Tokens/s, pure prefill/per-token latency, GPU kernel time and memory channels remain NOT_MEASURED. See [PROFILE001 audit](profiling_capabilities.md) for device instrumentation and process-memory plans, not existing measured values.

## PROFILE003 actual timestamp injection evidence

[Raw phone record](../results/raw/PROFILE003-2026-10-05T03-20-03-974Z.json), start/end 2026-10-05T03:18:32.537Z / 03:20:03.974Z, is byte-preserved. Runtime device features include shader-f16, subgroups and timestamp-query (plus core-features-and-limits). Request retains adapter maxima maxBufferSize=4294967292, maxStorageBufferBindingSize=2147483644, maxStorageBuffersPerShaderStage=16. Adapter probe and injected runtime adapter/device are independently described in the JSON; internal model backend is still not independently classified.

No visibility transitions, errors or capture losses are recorded. 2005 pass timestamp pairs read back; 29 zeros retained; observed timestamp/duration GCD grids are 65536 ns. 1898 adjacent cross-command-buffer reported intervals overlap with no submit-order inversions; cause UNKNOWN, preserving the limitation on isolated-cost interpretation. Profiler logical buffers 2097152 bytes are separate from observed model logical live/peak 51661168 bytes; neither represents physical residency. This instrumented single-generation run is not a stock throughput benchmark. Thermal/charging/Chrome flags/DevTools are not recorded as session condition fields in this JSON; do not infer them from earlier sessions.

## GEMM001 first actual naive FP32 run

[Byte-preserved JSON](../results/raw/GEMM001-2026-10-05T04-20-24-462Z.json): 2026-10-05T04:20:22.435Z to 04:20:24.462Z. Adapter vendor arm, architecture gen-5, device/description empty; exact GPU name remains unreported. Device enables core-features-and-limits and timestamp-query, with FP32 GEMM requiring no shader-f16. Full adapter/device limits are in JSON.

Manual run statements: thermal “未明显发热，温度未测量”; charging “正在充电，电量99%”; DevTools “未开启”; Developer Features flag “已停用”. Preserve these as self-reported, not measured temperature or independently checked settings. No visibility transitions/background are recorded. Both measured blocks observe a65536 ns grid with zero zero-duration samples. Serial readback/validation changes run state; one-run representative FP32 pass timings cannot be used as model-equivalent/peak comparisons or attribute charging-related changes. See experiment_log for correctness, boundaries and verifier scope.

## Per-session conditions

Session ID / local date and timezone / start and end time / battery percent / charging state / power mode / screen brightness / background activity / case and cooling / ambient temperature if measured / exposed device temperatures and their source / idle interval / Chrome flags / browser restart / OS or browser changes.

Unknown temperatures stay unknown. Never label a session thermally stable solely because the phone feels cool.

## Final Adreno device

NOT_ACQUIRED. Repeat the environment record and all final benchmarks on the target device. Mali observations are development evidence only unless the founder explicitly accepts a changed scope.


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


PART2ABC 2026-10-05 phone evidence: {"thermal": "未明显发热，温度未测量", "charging": "未充电：电量100%", "devtools": "未开启", "flag": "已停用"}; no recorded background transition. Device enabled features: ["core-features-and-limits", "shader-f16", "timestamp-query"]. Observed timestamp grid65536ns;not hardware instruction or memory-residency evidence. Original JSON preserved.


PART2ABCD 2026-10-05 actual evidence: {"thermal": "未明显发热，温度未测量", "charging": "未充电：电量100%", "devtools": "未开启", "flag": "已停用"};visibility={"initialState": "visible", "enteredBackground": false, "samplingEnteredBackground": false, "events": []};device features=["core-features-and-limits", "timestamp-query", "shader-f16"]. Observed grid65536ns;physical GPU memory NOT_MEASURED. Raw remains unchanged.


PART2Q8ABCD actual2026-10-05: {"thermal": "未明显发热，温度未测量", "charging": "未充电：电量100%", "devtools": "未开启", "flag": "已停用"};visibility={"initialState": "visible", "enteredBackground": false, "samplingEnteredBackground": false, "events": []};device features=["core-features-and-limits", "shader-f16", "timestamp-query"];grid65536ns. Logical bytes only;physical GPU memory NOT_MEASURED. Original JSON unchanged.

## BASELINE002 exact-length model sessions — READY_FOR_PHONE

Original assignment page 1 directly re-read:full prompts 128/512/1024 tokens,each metric >=5 runs with median/p95. New entry http://localhost:8000/src/baseline/sessions.html?v=baseline-session-v1 ;15 independent page/task/device attempts,one generation each,0 generation warm-up,requested combined capacity2048. Actual sizeInTokens(fullPrompt) must exactly match the target with template included;body/template counts and full text/hash exported. Stock runtime0.10.29 and existing Web model preserved. No profiler command/pass extensions or timestamp diagnosis. Only resource lifecycle wrappers reused plus directly available JS heap snapshots.

Question:How do observable initialization/combined generation/first callback/drain walls and scoped reported heap/logical allocations vary at prescribed input lengths? Setup and acceptance:docs/baseline_sessions_plan.md. Results NOT_RUN;CPU mock checks are not mobile/model evidence. Generation is first-use after separate tokenizer setup/drain;no output-token or pure prefill claim. Prompt/long-capacity compatibility awaits phone ordinal1 and longer configurations.

Coverage matrix:exact full-prompt length and five independent combined-wall/available-memory sessions READY_FOR_PHONE,not closed. Pure prefill/decode,real generated-token throughput/per-token or dispatch-token metrics remain UNAVAILABLE;physical GPU memory/deviceRSS not collected. Resource logical bytes and JS heap never replace residency/RSS. Current device remains Mali;Adreno and true logical layer shape gaps remain. After actual evidence arrives preserve originals,independently audit per-session boundaries/resource lifecycles and grouped median/nearest-rankp95/min/max;five-samplep95=max with weak tail evidence. Separate commit/push only after mobile acceptance.

BASELINE002 L128R1 COMPLETE/audited;full runtime-tokenizer count128,capacity2048 initialized on this input. Campaign1/15,not full repetition/phase/memory requirement closure. Actual scoped memory and walls:baseline_sessions_results.md.

Latest BASELINE002 acceptance:FIFTEEN_SESSIONS_VERIFIED,exact128/512/1024 full prompts and5 independent COMPLETE/audited sessions each. Earlier NOT_RUN/partial states are historical. Observable walls/scoped memory repeats accepted;purephase/true outputtokens/deviceRSS/physical GPU memory/Adreno remain unavailable. Final results:docs/baseline_sessions_results.md;Work summary:docs/baseline002_work_summary.md (root-relative).
