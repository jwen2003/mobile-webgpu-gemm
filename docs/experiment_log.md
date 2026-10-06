# Experiment log

## ENV001 Environment check on 2026 10 03

Question: Does the development phone expose WebGPU and run the timestamp sample?

Evidence: Device and Chrome screenshots confirm the environment in environment.md. Chrome reports WebGPU hardware acceleration and Vulkan enabled. User opened https://webgpu.github.io/webgpu-samples/?sample=timestampQuery and observed animation and a changing, nonzero render-pass duration.

Interpretation: Basic WebGPU sample execution is supported by observation. Timestamp capability is preliminarily supported by the sample output; actual adapter feature export and compute timing remain to be verified. No LLM or GEMM result exists. Performance variation has not been attributed to a cause.

Next: establish local development/debugging, export adapter features and limits, execute vector addition and compare every output against a CPU reference.

## COMPUTE001 Android FP32 vector addition smoke test

Question: Can Android Chrome execute this project's WGSL compute shader and return all 1025 exact FP32 sums, including the final partial workgroup, while exporting environment evidence?

Setup: Windows Python HTTP server on 127.0.0.1:8000, USB debugging, and `C:\Tools\platform-tools\platform-tools\adb.exe reverse tcp:8000 tcp:8000`. On the phone, open `http://localhost:8000/src/benchmark/` in Chrome. Use the detection, vector-add and JSON-download buttons in order. Source: `src/benchmark/index.html`, `smoke.js`, and independent `vector_add.wgsl`.

Configuration: FP32, N=1025, workgroup_size(64), 17 workgroups; guard `i >= 1025`. A[i]=(i%31)-15; B[i]=((i*7)%23)-11. These small integers and sums are exactly representable. Output is initialized to NaN to detect unwritten elements. Request no optional device features; use core default limits. Compare GPU copy/readback to every CPU-reference element with zero tolerance. This experiment does not measure performance or verify FP16/timestamp operation.

Acceptance: secureContext true; non-null adapter and successful requestDevice; no shader compilation errors, GPU validation/internal/out-of-memory errors or device loss; 1025 elements checked, zero non-finite values, max absolute error 0, zero erroneous elements, PASS. Inspect index 1024 and preserve downloaded JSON under `results/raw/`. Empty adapter info stays empty and must not be used to infer a GPU model.

Computer preparation: Python 3.14.6 and the specified adb executable were verified; one authorized USB device was listed. Local code/static and HTTP checks are preparation evidence only.

Result: PASS on the actual phone. Evidence: [original COMPUTE001 JSON](../results/raw/COMPUTE001-2026-10-04T10-53-11-629Z.json). Environment capture: `2026-10-04T10:53:07.372Z`; run start: `2026-10-04T10:53:08.599Z`; completion record: `2026-10-04T10:53:08.633Z`. These ISO timestamps identify events; their difference is not a GPU kernel duration.

Independent verification: recomputed A[i]=(i%31)-15 and B[i]=((i*7)%23)-11 for i=0..1024 using Python, without relying on the JSON's expected array or PASS label. All 1025 actual outputs matched the recomputed reference exactly; the exported expected array also matched. Max absolute error 0, erroneous elements 0, non-finite outputs 0. At index 1024, expected and actual were both -10. The recorded FP32 shader uses workgroup_size(64), dispatches 17 workgroups, and guards the final partial workgroup. Compilation messages and GPU error records were both empty; no device loss was recorded during this export.

Environment evidence: secureContext true; phone page `http://localhost:8000/src/benchmark/`; adapter vendor `arm`, architecture `gen-5`, device and description empty. These fields do not establish a specific GPU model. Adapter features include `timestamp-query` and `shader-f16`; both remain NOT_TESTED in this experiment. Required features were empty; the actual device reported only `core-features-and-limits`. See [environment record](environment.md#compute001-exported-adapter-and-device-evidence) for the complete buffer/compute limit comparison.

Interpretation: the actual phone successfully executed this project's FP32 vector-add pipeline and copy/readback with exact CPU-reference agreement, including the last valid element of the partial workgroup. This is compute correctness evidence only; performance remains NOT_MEASURED. No kernel duration is inferred from ISO timestamps. It is not LLM/GEMM, FP16, timestamp-query, or final Adreno validation.

Raw evidence integrity: SHA256 `b5729f9b46ad0d087e15b8fa5ffa837d9a2732ca8a053183506efa50c5993bc1`. The original JSON is preserved without editing.

## TIMING001 Android WebGPU compute timestamp validation

Question: Can timestamp-query actually be enabled and read back on Android Chrome? Do different compute-pass workloads produce interpretable timestamp samples?

Setup: use the existing Windows localhost:8000 server and USB adb reverse; open `http://localhost:8000/src/benchmark/timing.html` in phone Chrome. Record manual thermal, charging and WebGPU Developer Features flag states (UNKNOWN until observed); do not automatically change flags. Export start/end ISO times, full adapter/device features and limits, adapter info without guessing empty fields, shader source and visibility events. Source: `timing.html`, `timing.js`, `timing_math.mjs`, `timing_vector_add.wgsl` under `src/benchmark/`.

Configuration: FP32 parameterized vector add, uniform u32 N, workgroup_size(64), explicit bounds guard. N=1025/65536/1048576; dispatchesPerPass=1/32. Same deterministic small integer inputs as COMPUTE001, exact CPU sums and zero tolerance. Each pass checks all final output elements. Repeated dispatches overwrite the same C; final-output correctness does not independently establish that every repeated dispatch executed. Six configuration blocks use fixed xorshift32/Fisher-Yates seed 0x0017a001, with shuffled block order exported. Per block: 10 warm-up passes excluded from statistics, then 30 measured passes. Preserve all 240 raw passes including zeros. Pipeline is created once per run; allocations, bindings, input and uniform uploads are outside each block's sampling loop. Passes are strictly serial: completion, query map/unmap, output map/unmap and CPU comparison finish before submitting the next.

Measurement boundaries: compute pass descriptor timestampWrites records pass begin/end; resolveQuerySet and copies occur after the pass. Read with BigUint64Array, subtract as BigInt, preserve decimal raw strings, then convert ns to ms. Pass time may contain scheduling costs. Wall metric is performance.now immediately before queue.submit to onSubmittedWorkDone completion; the submission includes the timed pass, query resolve and both timestamp/output copies. Mapping and CPU checking are outside the wall interval. No division of batch time into independent dispatch latency, no ISO-time-derived GPU duration.

Statistics: 30 measured pass values per block; median uses midpoint for even counts; nearest-rank p95 is sorted[ceil(0.95*n)-1] (29th of 30); min/max and zero count. Report GPU ns and wall ms separately. Keep zero durations without trimming or substitution. Do not require strict time monotonicity with N or infer bottlenecks/peak bandwidth. Incomplete runs preserve partial records and mark incomplete summaries.

Acceptance: device features actually contain timestamp-query; all six blocks complete; 30 measured samples per block; all output checks PASS with zero max absolute error/errors/non-finite values; empty compilation/GPU error records and no device loss; raw begin/end strings and nonnegative deltas available. Review timing distributions and zeros for interpretability; all-zero durations leave useful timestamp discrimination unresolved. Record any background entry during sampling and review its effect without discarding evidence. Unsupported adapters report UNSUPPORTED with no wall-clock substitution. shader-f16 remains unverified.

Result: timestamp-query was actually enabled on the device and read back from compute-pass timestampWrites in two completed phone runs. Evidence is preserved separately:

- Run 1: [TIMING001-2026-10-04T11-25-41-874Z.json](../results/raw/TIMING001-2026-10-04T11-25-41-874Z.json), start `2026-10-04T11:25:38.441Z`, end `2026-10-04T11:25:40.884Z`; SHA256 `a41cb1f4da74c2b75a409e69a41ed42d80e4cd33d11d63aef1835259cc786ec9`.
- Run 2: [TIMING001-2026-10-04T11-39-21-730Z.json](../results/raw/TIMING001-2026-10-04T11-39-21-730Z.json), start `2026-10-04T11:39:17.730Z`, end `2026-10-04T11:39:20.220Z`; SHA256 `cf91b1747ae2779ccbbe2812b8c295b00f736d585d3723c65736d92d7b6ed4f4`.

Independent verification: parsed decimal start/end timestamps as Python integers, recomputed all 240 differences per run, and verified every exported ns/ms duration. Recomputed each configuration's measured-pass median, nearest-rank p95 (29th sorted sample), min/max and zero count; each matched the exported summary. Ten warm-ups per block remain in raw evidence but are excluded from these statistics. Both runs have six complete blocks and 180 measured passes each. All per-pass correctness records and six correctness summaries per run are PASS, with zero reported absolute error/error elements/non-finite values. TIMING001 exports correctness summaries rather than full output arrays, so this offline review does not independently recompare GPU output elements. Compilation messages and GPU error arrays are empty in both files, with no recorded device loss.

GPU compute-pass duration comparison (milliseconds; 30 measured samples per row per run):

| N | Dispatches/pass | Run 1 median | Run 1 p95 | Run 2 median | Run 2 p95 | Zero count R1 / R2 |
|---:|---:|---:|---:|---:|---:|---:|
| 1025 | 1 | 0.065536 | 3.145728 | 0.065536 | 0.655360 | 6 / 6 |
| 1025 | 32 | 0.327680 | 3.211264 | 0.327680 | 0.393216 | 0 / 0 |
| 65536 | 1 | 0.065536 | 2.490368 | 0.065536 | 0.196608 | 0 / 0 |
| 65536 | 32 | 2.523136 | 6.160384 | 2.457600 | 3.670016 | 0 / 0 |
| 1048576 | 1 | 1.114112 | 4.259840 | 1.114112 | 1.900544 | 0 / 0 |
| 1048576 | 32 | 9.404416 | 12.320768 | 10.125312 | 11.206656 | 0 / 0 |

Observed grid: separately within each run, the GCD of raw timestamp values, consecutive unique timestamp spacings and all pass-duration deltas is 65536 ns (65.536 microseconds). All recorded timestamp endpoints and deltas are integer multiples of that value. This is an observed sample grid, not proof of physical timer resolution, general browser behavior or a specific quantization mechanism. Even-count median averaging can produce half-grid values. N=1025, 1 dispatch has 6/30 zero measured durations in each run; a zero is not evidence of zero GPU work.

Interpretation and limitations: the timestamp enable/resolve/copy/readback chain works, but small workload timing is limited by the observed grid and both files retain long tails. Run 2 has a lower GPU-pass p95 for every configuration, while medians do not all decrease (the largest 32-dispatch median increases). DevTools state was **not recorded in either original JSON**; these two runs are not a controlled DevTools comparison and cannot establish that DevTools caused the p95 change. No bottleneck or peak-bandwidth conclusion is inferred. Keep both raw files, every zero and every long-tail sample; do not pool the two runs into one statistical population. A 32-dispatch pass repeatedly overwrites the same output and may involve cache/resource dependencies; its duration is not divided into independent single-kernel latency. Wall metrics and ISO event times remain separate from GPU pass duration. This is timing-chain validation, not a formal GEMM benchmark; shader-f16 remains unverified.

## BASELINE001 MediaPipe Gemma 3n E2B text runnability

Question: Can unmodified @mediapipe/tasks-genai initialize the specified Gemma 3n E2B Web model and normally complete one text-only response on Android Chrome?

Setup: same local Windows Python server and USB adb reverse, phone URL `http://localhost:8000/src/baseline/`. Pin @mediapipe/tasks-genai 0.10.29 (stable registry version available during preparation); actual package JS exports and genai.d.ts were inspected. JS and WASM are extracted unchanged from the same npm package with pinned SHA512 integrity verification; local per-file identity is in `src/baseline/runtime_manifest.json`. `python scripts/prepare_baseline_runtime.py` recreates ignored local assets/vendor resources without a framework/build step. The original stock createWebGpuDevice helper creates the supplied runtime device; no feature/limit overrides or internal algorithm changes. Record the independent probe adapter and supplied runtime device separately; backend stays UNKNOWN unless independently established.

Model: exact `gemma-3n-E2B-it-int4-Web.litertlm` from the specified Hugging Face file page, served as `/assets/models/gemma-3n-E2B-it-int4-Web.litertlm`. Anonymous file access returned 401; no restricted access was bypassed and no model substituted. See [manual preparation](../assets/models/README.md). Actual bytes/SHA256 are unavailable until authorized desktop download and `python scripts/verify_baseline_model.py`; missing metadata uses null, not invented values. The script hashes the actual local file and saves identity metadata; optional publisher-hash comparison is separately recorded. The phone checks served size against this manifest rather than rehashing weights. Model weights, node_modules, download cache and third-party runtime binaries stay out of Git.

Configuration: official Gemma user/model turn template with final newline, fixed question `Explain in two short sentences what matrix multiplication computes.` Export the entire actual sent prompt. maxTokens=512 is total input plus output capacity, not output length; topK=40, temperature=0.8, randomSeed=101, numResponses=1, maxNumImages=0, supportAudio=false. One generateResponse per initialization; other public options retain defaults. Only text is passed; no model/runtime optimization.

Observation protocol: separately record runtime-resource preparation (manifest/import/fileset/HEAD), model initialization (actual WASM/device and model loading), request start, every streaming callback with fragment/done/relative wall milliseconds, and promise completion. Export environment, exact runtime/model identity, options, output, events, errors and status even for failure/pending records. A callback need not correspond to one token. Loading time is outside generation time. First-callback wall time is not pure prefill latency; no wall duration is called GPU kernel time. Actual input/output token counts, tokens/s, per-token latency, GPU kernel time and GPU memory remain NOT_MEASURED.

Acceptance: initialization success; exactly one generation promise ends normally with done=true; nonempty output; no recorded runtime/GPU errors. This is a runnability check, not numerical correctness verification, formal baseline profiling or final Adreno validation.

Result: **runnability acceptance passed** on the actual phone. [Original BASELINE001 JSON](../results/raw/BASELINE001-2026-10-04T14-11-39-378Z.json) reports COMPLETE, successful model initialization, one normally resolved generation, done=true, nonempty output and no recorded errors. SHA256 of the unchanged raw JSON: `c66237e875591f2daa739ef4543ffa617775f151ba4e05471cceae227c588ca3`. The attachment was copied byte-for-byte into results/raw; no original fields were edited. Text output is an observed response, not numerical correctness validation.

Measured page wall-clock observations: resource preparation 58.19999998807907 ms; model initialization 91756.59999999404 ms; request-to-promise-completion 6037.9000000059605 ms; first callback from request 634.4000000059605 ms. Resource preparation covers manifest/JS/fileset/HEAD checks, while actual WASM/device/model initialization is in initialization. Loading is outside generation timing; the request wall interval includes JS/UI/callback work and is not GPU kernel time. There were 18 streaming callbacks, including terminal done=true; callback count is not token count and first callback is not pure prefill.

Visibility evidence: the page went hidden at `2026-10-04T14:09:52.312Z` and visible at `2026-10-04T14:09:59.498Z`, both during INITIALIZING. Preserve that approximately 7.186-second background interval as a condition of the 91.757-second initialization observation, without correcting/subtracting it or attributing a slowdown. Request start was `2026-10-04T14:11:27.752Z`; generation completion `2026-10-04T14:11:33.790Z`; no visibility transition was recorded during generation.

Model identity: exact `gemma-3n-E2B-it-int4-Web.litertlm`, desktop actual size 3038117888 bytes and SHA256 `b6c8e1081ec80730f14473a5ece941b48da5d8e2a80c97c2963da153f3eff3d2`; browser HEAD size matched the desktop manifest. Publisher hash was not compared and browser SHA256 was NOT_MEASURED. This disk file size is not runtime memory. Runtime 0.10.29 remained unmodified. The supplied runtime device reported core-features-and-limits, shader-f16 and subgroups; internal backend/actual kernel precision remains UNKNOWN. Actual input/output token counts, tokens/s, pure prefill, per-token latency, GPU kernel time and GPU memory remain NOT_MEASURED.

## PROFILE001 fixed-version profiling observability audit

Question: Which assignment metrics can be observed in @mediapipe/tasks-genai 0.10.29 without optimizing runtime/model algorithms, and what minimum instrumentation is needed?

Setup: read the local pinned genai.d.ts, bundle, selected SIMD WASM loader and package source map; consult immutable official TypeScript source as auxiliary evidence and cross-check against the installed bundle. Preserve the same successful model and existing pages. Results and evidence locations are in [profiling_capabilities.md](profiling_capabilities.md).

Finding: public sizeInTokens can count complete input-prompt tokenization while idle, but is not yet measured in BASELINE001. Public generation returns text rather than original IDs/counts; no pure prefill/decode-step or KV-reset API was found. The text graph has prefix-cache options, so reuse remains UNKNOWN without native evidence. Stock helper does not request timestamp-query; public compatible-device injection permits a separate opt-in plan. Loader forwards native buffer/shader/pipeline/pass/dispatch/submit operations, making count-only observation feasible in principle; phone compatibility and completeness remain untested. General multi-dispatch per-kernel attribution and actual physical GPU residency remain gaps.

Acceptance for this audit: every capability claim has a fixed-package API/symbol/file location; observed, proposed and UNKNOWN/NOT_MEASURED items are distinguished; an assignment metric table and bounded next-step plan exist. Static/source checks completed; no instrumentation or full 128/512/1024-token benchmark was launched. maxTokens=512 must change with an explicit input-plus-output reserve before the longest prompt configuration can run; the proposed future 2048 capacity is not applied here.

## PROFILE002 independent count-only pilot

Result: initial supplied phone pilot **INCOMPLETE due to event-cap loss**; subsequent revised collector **COMPLETE, independently verified within declared coverage**. [Initial raw evidence](../results/raw/PROFILE002-2026-10-04T15-23-33-186Z.json) was copied byte-for-byte from the user-supplied file; 55438589 bytes, SHA256 `1ddda0c9a7175daa9447ae2ee509c5c22d21a33698d06a015265f9b78e220b9e`. All six lifecycle flags are true, sizeInTokens(fullPrompt) returned 18, errors and coverageFailures are empty. droppedMetadata/droppedDiagnostics/visibility dropped counts are zero. The original raw JSON is unchanged.

Independent accounting check: phase call counters sum to 268467, equal to 200000 retained events + 68467 dropped events. The GENERATION aggregate reports 126402 encoded direct dispatches and 126402 dispatches in submitted command buffers, 2056 submit calls, and no indirect dispatches. Only 93835 direct dispatch events survive in the raw event array. Consequently the full aggregate cannot be independently reconstructed from the retained raw calls; do not certify complete call-by-call coverage or fabricate missing events. This record establishes generation runnability and the cap failure, not full profiling acceptance. Only one of the user's three runs was supplied; do not generalize this diagnosis to the other two unseen files.

Conditions: MODEL_INIT went hidden at 2026-10-04T15:22:35.867Z and visible at 15:23:08.591Z; preserve this 32.724-second background interval without subtracting it from initialization or asserting causation. Recorded wall observations: model initialization 118219.59999999404 ms, TOKEN_COUNT 4.700000017881393 ms, token-count drain 256.5 ms, request-to-generation-promise completion 6156.799999982119 ms, post-generation drain 85.69999998807907 ms. These include instrumentation overhead and are neither benchmark throughput nor GPU kernel durations. Logical observed buffer peak/live 51661168 bytes is not physical GPU residency or model memory.

Fix: collector revision `PROFILE002-count-v2-cap500k` changes the bounded raw-event cap from 200000 to 500000 and displays revision, limits, all drop categories and incomplete lifecycle/coverage reasons. A synthetic 268467-event regression retains all records; the small-cap regression still yields INCOMPLETE when records are lost. No runtime/model algorithm, feature, prompt, generation config or GPU timing change. Desktop checks pass; the subsequent phone evidence below confirms complete collection within the declared scope. Existing incomplete raw evidence remains unchanged.

Revised actual run: [PROFILE002-2026-10-04T15-53-13-603Z.json](../results/raw/PROFILE002-2026-10-04T15-53-13-603Z.json), 72499577 bytes, SHA256 `c6e10b219dbc280669ebdd716d08b374682369375dc69ec15caaf96a19efb840`. Archived byte-for-byte; status and observer coverage COMPLETE, all lifecycle flags true, errors/coverageFailures empty, all dropped counts zero. Full-prompt tokenizer return is 18; generation returned nonempty text, terminal done was observed, and concatenated callback fragments exactly match returned/final output. Initial visibility was visible and no transitions were recorded. No timestamp-query feature was enabled on the runtime device.

Independent raw-call replay (`scripts/verify_profile002_result.py`) checks every event sequence, phase call totals, pipeline/pass/encoder/command-buffer associations and each submission, counting a command buffer again on repeated submits. GENERATION has 126402 encoded direct dispatches and 126402 direct dispatches contained in submissions, zero indirect dispatches, 2005 compute passes and 2056 submit calls. All 180 shader sources linked to generation submissions match their SHA256; compilation error messages are absent. The whole run created 2783 observed buffers, with no explicit destroy observed before collection stopped; replayed logical live/peak bytes both equal 51661168. This does not establish physical GPU residency or imply that resources cannot subsequently be released. Profiler-created GPU bytes are zero.

Recorded wall observations (instrumented, not formal performance): initialization 91486.80000001192 ms, input-token counting 0.800000011920929 ms, token-count drain 189.2999999821186 ms, generation request-to-promise completion 6490.300000011921 ms, separate post-generation drain 107.19999998807907 ms. No subtraction, per-token conversion or GPU kernel attribution is applied. The complete run is not pooled with the prior incomplete run. This pilot meets its declared observability/runnability acceptance; algorithm correctness, actual hardware execution per call, real output token count, pure prefill/decode and physical GPU memory remain unverified/unmeasured as specified.

Question: Can the fixed stock MediaPipe device expose a complete count-only record of model initialization, full-prompt token counting, generation submissions and logical buffer lifetimes without changing the model/runtime algorithm?

Setup: independent `src/profiling/profile002.html`; same successful Web model, local @mediapipe/tasks-genai 0.10.29, BASELINE001 full prompt and all generation options (combined capacity maxTokens=512). No timestamp-query request, runtime bundle change, precision/cache override or optimization. Install reversible native-instance wrappers before createFromOptions; preserve native receiver/arguments/return values/promises/exceptions. Abort on initial wrapping failure; later observation/restoration failures mark INCOMPLETE. Shader compilation info and uncaptured GPU/public API failures are collected; runtime-owned error scopes and other devices/workers are outside coverage.

Boundaries: MODEL_INIT ends after initialization promise completion. TOKEN_COUNT calls sizeInTokens(fullPrompt) while idle, records return/error and separately drains prior work before GENERATION. GENERATION counts encoding and native submit calls; wall interval ends at generation promise resolution. POST_GENERATION waits onSubmittedWorkDone before disabling/restoring observation. This drain does not extend generation completion wall time. Phase labels describe API invocation scope, not proved GPU execution phases. Streaming callbacks are text events, not tokens. No per-call UI or console updates occur during generation.

Accounting: stable identities link shader/pipeline/encoder/pass/command buffer, including sync/async pipeline creation, setPipeline, direct/indirect dispatch, end, finish and submit. Each successful-return submit invocation counts its referenced command buffers again; unsubmitted encoding is separate. Indirect argument buffer/offset are recorded without guessed dimensions. Shader hashes are computed after collection; generation-submitted shader sources are exported. One pass can contain many dispatches and has no per-kernel attribution. Logical buffer allocation bytes minus explicit destroy are retained with live/peak totals and phase changes, not physical residency; registry deletion or GC is not interpreted as destroy. Observer creates no GPU buffers.

Collection caps (revised collector): 500000 events, 50000 identities, 32 MiB UTF-8 shader sources, 1000 visibility transitions. The original run used 200000 events. Dropped event/metadata/diagnostic/visibility counts are exported; any loss or coverage failure yields INCOMPLETE (runtime errors yield ERROR, with observer coverage status retained separately). All observations carry instrumentation overhead and are unsuitable as formal throughput results. Real output token IDs/count, dispatch/token, tokens/s, per-token latency, pure prefill, GPU kernel time, physical GPU memory, JS heap and process RSS/PSS stay NOT_MEASURED.

Acceptance: initialization succeeds; sizeInTokens returns a nonnegative safe integer for the exact full prompt; one generation promise resolves with done=true and nonempty output; post-generation drain completes; no errors; no wrapping/restoration/data-loss gaps and observer coverage COMPLETE. Download original PROFILE002 JSON and preserve it under results/raw before independently reviewing counts and shader classifications. Current run instructions are in README; phone URL is `http://localhost:8000/src/profiling/profile002.html` via the same USB adb reverse. This acceptance checks observability and runnability, not numerical correctness or performance. No commit/push in this round.

## Part 1 PROFILE002 submitted-shader analysis

Question: What arithmetic classes are visible in the actual submitted GENERATION command stream, and what further observations are required before attributing GPU time or identifying bottlenecks?

Result: [profile002_shader_analysis.md](profile002_shader_analysis.md) contains all 180 identities and hash-verified source evidence. Independent reconstruction yields 132 unique hashes, 180 pipelines, 126402 encoded/submitted direct dispatch occurrences and 2005 submitted pass occurrences. 1900 passes contain multiple dispatches, maximum 2295. 122 shader identities conservatively remain UNKNOWN. Fused Q4 unpack/scale/product, RMS normalization and softmax/attention arithmetic candidates are identified, with semantic uncertainty distinguished from visible arithmetic. Global M/N/K, uniform dimensions and workgroup override values are UNKNOWN where missing capture prevents recovery. Class labels overlap; no timing sum, per-token count or bottleneck follows from these dispatch frequencies.

Setup/provenance: use only the complete 15:53 PROFILE002 raw run, verified SHA256 unchanged. Derived exact WGSL files and CSV/JSON live under results/analysis/profile002; `scripts/analyze_profile002_shaders.py` reproduces the associations and classification rules. The supplied assignment(6) PDF has identical SHA256 to assignment/webgpu_adreno_assignment.pdf (`dc02d42a5fdf521b75794ac641478cfe91ec7d9e165fa93a1c2e43b3ec63e9c3`); no replacement is needed. This analysis is progress toward Part 1, not the completed >=5-run profiling/bottleneck deliverable.

## PROFILE003 compute pass timestamp pilot

Result: **COMPLETE timestamp acquisition and command association, independently verified; timing interpretation has unresolved overlap limits**. [Actual raw record](../results/raw/PROFILE003-2026-10-05T03-20-03-974Z.json) was archived byte-for-byte: 76584351 bytes, SHA256 `040c5c4b667789b5ced7b5c7dd02d8abc85e3f085588b4e85f9ee9fa82e3af3d`. All lifecycle flags true; full-prompt tokenizer return 18; generated output nonempty with done; runtime device actually enables core-features-and-limits/shader-f16/subgroups/timestamp-query. All runtime/observer/query error and coverage-failure arrays are empty, all loss/untimed/missing counters zero. No commit/push.

Independent replay via `scripts/verify_profile003_result.py`: 268465 observer events, 126402 encoded and submitted direct dispatches, 2056 submit calls, 2005 compute passes and exactly 2005 linked timestamp samples. Every sample has a unique query slot, one submission and matching command buffer/pass/pipeline associations; all decimal raw timestamps satisfy end >= start and exact integer subtraction. 1900 passes contain multiple dispatches. The 180 generation-associated shader source hashes and full output callback concatenation also verify. The required stock features/limits plus timestamp-query match the actual adapter/device request.

Raw pass-sample distribution (heterogeneous passes within ONE instrumented generation, not repeated benchmark runs): median 28049408 ns (28.049408 ms), nearest-rank p95 59113472 ns (59.113472 ms), minimum 0, maximum 105840640 ns (105.840640 ms), 29/2005 zero samples. Observed timestamp-difference GCD and duration GCD both 65536 ns (65.536 microseconds); every difference is a multiple of that grid. All zeros/long intervals remain untouched. No per-kernel/per-token conversion or formal run-to-run statistics are claimed.

Interpretation limit: 1898 adjacent reported intervals overlap across different command buffers in sample order. Recorded submission sequences have zero inversions, so simple encoding-versus-submit reordering does not explain this observation. Example: pass-3362 reports [265466362462208, 265466362789888] ns and pass-3365 reports [265466362462208, 265466365476864] ns, sharing their start timestamp. Cause is UNKNOWN; no attribution to driver, browser, scheduler or instrumentation defect is made without a discriminating follow-up. The pilot proves acquisition/associations, but these reported intervals alone are not validated isolated-pass cost estimates for ranking bottleneck kernels or assigning exclusive op time. Do not add the intervals as complete end-to-end GPU time, split mixed passes, subtract them from wall time as launch overhead, or compare this run with stock performance.

Conditions/boundaries: start 2026-10-05T03:18:32.537Z, end 03:20:03.974Z; visibility initially visible, no transitions or dropped visibility records. Initialization wall 84387.19999998808 ms, TOKEN_COUNT 3.5 ms, token-count drain 187.19999998807907 ms, generation request-to-promise completion 6491.200000017881 ms, separate post-generation drain 99 ms; query readback after drain 20.200000017881393 ms. Profiler resolve/readback buffers total 2097152 logical bytes and are all recorded destroyed; model logical live/peak bytes remain 51661168, not physical residency. Thermal/charging/flags/DevTools conditions are not added from previous runs. Real generated-token count, pure prefill/decode, physical GPU memory and full end-to-end GPU time remain unavailable/unmeasured. At least five controlled repetitions and unresolved assignment metrics remain outside this single pilot.

Question: Can the unchanged MediaPipe 0.10.29/model compute stream use a compatible publicly injected timestamp-enabled device, and yield readable beginning/end timestamps associated with actual submitted passes?

Setup: independent src/profiling/profile003.html, same successful Web Gemma model and BASELINE001 full prompt/config. High-performance adapter, stock shader-f16 + supported subgroups, original three adapter-max limits, plus timestamp-query. Actual adapter/device features/limits and request descriptor are exported. No custom algorithms, cache/precision options or runtime bundle edits; no silent wall-time fallback. Count-only collection stays bounded at 500000 events/50000 identities/32 MiB sources; timer capacity is 4096 pass pairs in 256-pass query chunks. Profiler query/resolve/readback resources are allocated before model observation; 2097152 logical buffer bytes are separately marked, never charged to model live/peak bytes, and explicitly destroyed after readback.

Boundaries: MODEL_INIT and idle full-prompt TOKEN_COUNT remain separate; only GENERATION compute passes get timer writes. Original pass descriptor fields are copied without mutating the input; an existing runtime timestampWrites object produces an explicit conflict/failed run and is never overwritten. Resolve/copy append to existing encoder outside the ended compute pass, before native finish. No extra submit, wait or map per pass. Generation promise completion keeps its wall endpoint; post-generation GPU drain is separate; used readback chunks map/unmap afterwards. Profiler commands/resources are exported with owner=PROFILER. One native validation scope surrounds the pilot (runtime-owned scopes remain outside observer coverage); compilation/public/uncaptured GPU/device-lost/query/coverage errors are preserved.

Attribution: timestamp samples reference observer pass ID, command buffer and submission sequence, with linked pipeline IDs and dispatch counts; observer raw calls retain ordered dispatch/pipeline/shader association. Encoded-only passes are not reported as submitted GPU samples. Repeating a timed command buffer overwrites its query slot, so that case explicitly marks INCOMPLETE and does not invent distinct times. Capacity exhaustion continues original model execution but counts untimed passes and marks INCOMPLETE. Missing submitted samples and restoration/coverage failures do likewise.

Timing interpretation: exact raw timestamps and BigInt differences are exported as decimal ns strings, with safe microsecond conversion afterwards. Zero durations are retained. Compute observed GCD of timestamp differences/durations and compare against previous TIMING001 65536 ns quantization; do not infer finer resolution from implementation defaults or force observations onto that grid. A zero GCD or coarser finite-sample GCD is not a hardware-resolution measurement. Intervals cover entire passes including possible scheduling; fused/multi-dispatch passes are mixed, never split or double counted as independent kernel costs. No full end-to-end GPU time from summed intervals; no tokens/s, output-token estimate or per-token latency. Query/command/readback and count collection introduce overhead and invalidate direct stock performance comparisons.

Acceptance: one fixed-prompt short generation completes with nonempty output/done, valid full input token count and completed drain; timestamp-query actually enabled on injected runtime device; at least one submitted pass pair is read; no runtime/compilation/validation/device/query errors; count and timestamp coverage COMPLETE with no loss. Review all zeros/grid/associations even on success. This pilot does not satisfy individual-kernel timing for mixed passes or the full assignment repetitions/phase/token/memory requirements. Phone steps and exact URL are in README; do not change flags automatically. Tests use synthetic values only and are not raw phone evidence.

## GEMM001 naive FP32 correctness and preliminary GPU timing

Result: **first actual phone run COMPLETE; preliminary acceptance met**. [Raw record](../results/raw/GEMM001-2026-10-05T04-20-24-462Z.json) is byte-preserved, 139224 bytes, SHA256 `21c89d477e3f05f8489ec4875e7df4b1f17e6421826fe120873f2931088e1f73`. CPU checks remain separate from actual GPU evidence. No commit/push. PROFILE003 overlap diagnosis did not gate this experiment.

Actual correctness: all ten initial shape/family checks and 80 sampling checks report PASS; all nonfinite and threshold violation counts are zero; errors and compilation messages empty. All integer maxima are zero. Fractional max absolute error by (M,K,N): (1,1,1) 1.1482239159477103e-8; (3,5,7) 6.64196022626129e-8; (17,19,23) 6.953842719426007e-7; (1,1024,1024) 2.9267351006723175e-5; (128,1024,1024) 5.648095819665855e-5. Fractional thresholds remain the predeclared atol0.002/rtol0.0002. Largest reported relative error is 0.09738289051326116 for M128; relative ratios are sensitive near zero, while acceptance still uses the absolute+relative rule. The max-relative element/index is not exported and must not be guessed.

Independent verifier scripts/verify_gemm001_result.py reconstructs xorshift32 order and inputs, verifies exported worst-element expected values using independent CPU dot products, checks shader hash and threshold invariants, and recomputes every timestamp difference and measured statistic. Full actual GPU arrays are absent from this JSON, so all-output error maxima/counts cannot be independently replayed offline; those are the client's full-array correctness results, supported by the implementation and worst-value checks, not fabricated independent rechecks.

Actual execution order: M128 representative block first, then M1; 10 warm-up and 30 measured single-dispatch samples each. Warm-ups are retained and excluded from statistics. Observed grid65536 ns in both measured blocks; zero count0 in each; both satisfy the frozen PRELIMINARY rule (no measured zero, median >=10 grid steps). Results below are one controlled run, not five-run benchmark summaries; exact displayed statistical digits do not imply a finer clock resolution.

| Representative (M,K,N) | GPU pass median ms | nearest-rank p95 ms | min / max ms | zero / measured | effective nominal GFLOP/s | queue wall median / p95 ms |
|---|---:|---:|---|---|---:|---|
| (128,1024,1024) | 10.518528 | 11.665408 | 9.175040 / 11.796480 | 0 / 30 | 25.520249 | 13.100000 / 17.400000 |
| (1,1024,1024) | 2.359296 | 2.424832 | 0.917504 / 2.424832 | 0 / 30 | 0.888889 | 4.900000 / 5.800000 |

Condition evidence: start2026-10-05T04:20:22.435Z, end04:20:24.462Z; initial visibility visible, no transitions/background. Adapter vendor arm / architecture gen-5 / device and description empty; do not guess exact GPU. Device features core-features-and-limits,timestamp-query (no FP16 needed/enabled). Manual fields: 未明显发热，温度未测量; 正在充电，电量99%; DevTools未开启; flag已停用. Temperature/flag state are not independently instrumented, and charging is a run condition, not a diagnosed performance cause. Input/reference/thresholds and representative provenance remain unchanged. Nominal 2*M*N*K pass-based GFLOP/s is neither pure arithmetic time, utilization, bottleneck evidence nor model speedup. No speedup is computed. Preserve warm-ups, zeros and shorter/longer samples without trimming.

Question: Does an independent naive FP32 row-major GEMM correctly compute signed dense products, including non-square and non-divisible boundaries, and do single-dispatch compute-pass timestamps resolve its representative workloads?

Shape evidence: selected real PROFILE002 shader-2630, hash `ee9a0b2823d07f56fe2e9c50134dbc9c58f9f411dcfc11795869196870dd6036`, [source](../results/analysis/profile002/shaders/ee9a0b2823d07f56fe2e9c50134dbc9c58f9f411dcfc11795869196870dd6036.wgsl). mat4x4<f16> weights, explicit vec4<f16> FMA accumulators, src_s loop and workgroup reduction support weight-product classification. Source proves packed local matrix layout and reduction parameters (eight vec4 accumulators, temp[32], src_s +=4); global M/N/K and runtime workgroup overrides stay UNKNOWN. Symbolic U.i0 strides do not recover global shapes, and dispatch counts are not shape evidence. No real shape is used. Representative (M,K,N)=(1,1024,1024),(128,1024,1024) proceed now. This FP32 non-fused dense rewrite is not runtime-equivalent or model acceleration evidence. Correctness-only shapes: (1,1,1),(3,5,7),(17,19,23).

Setup: independent src/benchmark/gemm.html / gemm.js / gemm_naive.wgsl / gemm_math.mjs. Row-major A[M,K], B[K,N], C[M,N]; C=A×B without bias, activation or quantization; FP32 storage/accumulation. 8×8×1 invocations each compute one C element along K, with row/column boundary checks. M/N/K/padding uniform is 16 bytes at aligned offset zero. Precheck device buffer/storage/uniform/binding/workgroup/dispatch and u32 indexing limits; SKIPPED configurations retain reasons.

Correctness contract frozen before run: seed 0x6e6d0001 xorshift32, signed integer [-3,3] and fround-based bounded fractional [-1,1], A then B. Integer products/partial sums remain exact within FP32 and require zero error. Fractional atol=0.002, rtol=0.0002 are fixed, never relaxed on failure. Independent CPU i-k-j reference uses stored Float32 inputs and binary64 accumulation, contrasting GPU FP32/possible FMA contraction. Compare all outputs/nonfinite values; report max absolute/relative errors, violations and worst expected/actual flat/row/column index. Relative reporting denominator is max(abs(expected),1e-8); actual acceptance uses atol+rtol*abs(expected) without that floor. All ten initial tests must pass for overall correctness acceptance; each performance shape individually requires both input families PASS before its sampling.

Timing: same TIMING001 timestamp/statistics method. Explicit timestamp-query request when available, otherwise correctness runs with GPU time NOT_MEASURED; no silent fallback after requestDevice failure. Two representative configurations use fractional inputs, fixed random block order seed 0x6e6d0017, 10 warm-up +30 measured records each. One dispatch per pass; no dispatch division. Pipeline, buffers, input upload and independent CPU reference are outside sampling loops. After each pass completes, map/unmap timestamps and the whole output, check correctness, then submit next; mapping/CPU wall costs are separate. GPU pass excludes resolve/copy/readback but includes possible pass scheduling. submit-to-completion wall includes the appended query resolve and C copy, excludes map/reference checks. Serial waiting/readback changes state and is an acknowledged preliminary-control condition.

Statistics: retain every warm-up/measured raw record, zero and tail. Measured-only midpoint median, nearest-rank p95, min/max/zero count; timestamp strings preserve raw integers and BigInt precedes conversion. Prior 65.536 microsecond grid is rechecked as a measurement limit. RESOLUTION_LIMITED if any measured zero or median <10×max(prior 65536 ns, observed timestamp-difference GCD). GCD is finite-sample evidence, not guaranteed physical resolution. Effective GFLOP/s uses conventional 2*M*N*K divided by pass-median ns only for 30 passing complete samples without this limit; no speedups, peak utilization or independent bottleneck inference. Warm-up correctness also must pass.

Environment/export: adapter/device feature and limit snapshots, empty adapter fields preserved; shader/source SHA256, representative/UNKNOWN provenance, seeds/reference/thresholds, full raw timing/correctness summaries, errors and status, start/end/visibility plus manually entered thermal/charging/DevTools/flag states (default UNKNOWN). Capture device request, compilation, GPU scope/uncaptured, lost, mapping/readback and CPU correctness errors; failure JSON remains exportable. No per-sample UI/console updates. Existing COMPUTE/TIMING/BASELINE/PROFILE pages and raw files are preserved.

Acceptance met in the supplied first record: all required correctness shapes/families pass with nonfinite count zero; full 10+30 raw records for each timestamp performance configuration and passing sample correctness; explicit resolution classification and honest representative/UNKNOWN provenance. If a future required shape is skipped, overall status is INCOMPLETE; without timestamps a passing run is CORRECTNESS_ONLY, not full timing acceptance. This does not complete formal repeated/model-equivalent comparisons or the target Adreno assignment. Tiled/vectorized GEMM is deferred. Phone URL `http://localhost:8000/src/benchmark/gemm.html`; Windows/USB/server steps in README.

Offline companion: [PROFILE003 overlap review](profile003_overlap_review.md), reproducible from raw JSON by scripts/review_profile003_overlap.py. All 1898 positive adjacent overlaps are cross-submit and >65536 ns; min327680 ns, median27459584 ns, nearest-rank p95 56360960 ns, max100073472 ns. Same-command-buffer and same-submit groups have no positive overlaps. No query-slot duplication or repeated timed submit; raw end<finish<submit order is consistent. Resolve/copy order is demonstrated by source rather than independently logged native command timing. Root cause UNKNOWN; no new phone diagnostic page or model algorithm change. GEMM proceeds independently.

## GEMM002 fixed shared-memory tile versus naive, same-run pilot

Result: **first actual phone run COMPLETE; preliminary acceptance met**. [Raw JSON](../results/raw/GEMM002-2026-10-05T04-58-16-647Z.json) archived byte-for-byte,514830 bytes,SHA256 `26bd3dc90351f2499627ddcb93bd8cb46ebf7851e47edf3dd59e56d11a2f5a90`. Existing raw files/pages preserved; no commit/push.

All24 initial variant checks and12 initial cross-variant checks report PASS, as do160 warm-up/measured output checks and80 round cross-comparisons. Nonfinite/threshold-violation counts zero; errors and both shader compilation-message arrays empty. All tracked resources recorded destroyed. Independent `scripts/verify_gemm002_result.py` verifies shader source/hash, predeclared tolerances, every raw timestamp difference, statistics, seeded shape and paired execution orders, and CPU reference for every exported worst element. Full actual arrays are absent: client all-output maxima/counts cannot be independently replayed offline.

| Representative M,K,N | variant | GPU median ms | nearest-rank p95 ms | min / max ms | zeros / measured |
|---|---|---:|---:|---|---|
|128,1024,1024|naive|12.189696|13.828096|9.633792 / 13.893632|0 / 30|
|128,1024,1024|tiled|7.405568|8.323072|5.898240 / 8.781824|0 / 30|
|1,1024,1024|naive|2.359296|2.359296|1.769472 / 2.424832|0 / 30|
|1,1024,1024|tiled|5.341184|5.373952|5.308416 / 5.373952|0 / 30|

Primary same-run ratio of medians: M128 **1.646017699×**; M1 **0.441717791×**, corresponding to tiled taking2.263888889× naive time. Distinct paired-ratio median/p95: M1281.669994504/1.859649123; M1 0.439024390/0.444444444. Historical GEMM001 is not used in either estimator. Observed timestamp-difference GCD65536ns for all four measured blocks, no zeros; all satisfy the frozen PRELIMINARY resolution rule. Preserve all samples and tails. One run is not a repeated-run confidence claim.

Actual shape order M128 then M1, with15 naive-first and15 tiled-first measured rounds per shape. Manual conditions: 未明显发热，温度未测量; 未充电：电量100%; DevTools未开启; flag已停用. Initially visible, no background transitions. Adapter arm/gen-5 with empty device/description; actual device enables core-features-and-limits,timestamp-query. Limits: adapter/device maxInvocations1024/256, shared storage32768/16384 bytes, maxBuffer4294967292/268435456, maxStorageBinding2147483644/134217728 bytes. Fixed256-invocation/2048-byte tile fits actual device limits. Manual thermal/flag conditions are not independently measured; do not guess exact GPU.

Measured observation: tiled improves pass median for M128 and regresses for M1. Source facts:16-row tile, cooperative loads and barriers even for output-OOB lanes. Unused rows, loading/barrier costs, data reuse, cache and scheduling are possible explanations only; no measured hardware bottleneck or DRAM-traffic evidence. No model/Adreno generalization.

Question: does fixed16×16 workgroup-memory tiling preserve dense FP32 GEMM correctness and change single-dispatch compute-pass duration versus naive8×8, for representative (M,K,N)=(1,1024,1024),(128,1024,1024)? These remain representative shapes: PROFILE002 global matrix dimensions are UNKNOWN. This is not a runtime-equivalent FP16/fused/quantized replacement or model acceleration experiment.

Setup/control: independent src/benchmark/gemm002.html, same device and shared A/B/uniform/reference, separate C and readback buffers with identical usage. Reuse GEMM001 input seed0x6e6d0001, xorshift32 A-then-B integer[-3,3] and stored FP32 fractional[-1,1] values, CPU i-k-j binary64 accumulation, integer atol=rtol=0 and fractional atol0.002/rtol0.0002. Report relative error with denominator max(abs(expected),1e-8), but accept via absError<=atol+rtol*abs(expected). Compare every element and nonfinite value against CPU and tiled-versus-naive with the same family thresholds; do not require fractional bitwise equality. No threshold relaxation.

Changing variable: naive8×8 one-output-per-invocation K loop versus tiled16×16 one-output-per-invocation with two shared arrays of256 FP32 values (2048 bytes). Cooperatively load padded A/B tiles, barrier after load and after use; all lanes reach barriers including output-OOB lanes, final store bounds checked, K tails zero padded. Device256-invocation/shared-storage/dispatch/buffer limits are checked, unsupported fixed tiles SKIPPED rather than changed. Scalar1×1×1, rectangular3×5×7,17×19×23 and1×17×19 cover boundaries, plus both performance shapes. Twelve shape/family comparisons contain24 variant checks and12 pair checks. Both families/variants/cross-checks must pass per shape before timing.

Protocol: setup/pipeline/allocation/upload/reference outside sampling loops. Fractional performance states retained from initial correctness. Shape order Fisher-Yates seed0x6e6d0021; each shape's measured-round seed=(0x6e6d0022 XOR M) unsigned. Shuffle15 naive-first and15 tiled-first rounds. Each variant has10 warm-ups (alternating first variant), then30 measured passes in paired rounds, yielding80 retained samples per shape. Each pass one dispatch, serial completion and full output/timestamp map/unmap/CPU check before next submission. Both variants use shared completed-readback-safe query indices0/1. Export planned orders and actual variant/roundId/orderInRound/global executionOrder, raw timestamps as decimal strings, BigInt subtraction and all correctness summaries.

Boundaries: beginning/end compute-pass timestamps include possible pass scheduling; query resolve and C copy are outside pass. Submit wall is immediately before queue.submit through onSubmittedWorkDone, including those appended commands but excluding mapping/CPU checks. Record readback and CPU/pair-check overhead separately. Serial waits/readbacks/order affect operating state; preliminary controlled comparison, not formal throughput. Explicitly request timestamp-query when available; unsupported devices still run correctness with NOT_MEASURED GPU time. Request/compilation/validation/lost/readback/correctness errors remain exportable.

Statistics: measured-only midpoint median, nearest-rank p95, min/max/zeros and finite-sample timestamp-difference GCD reuse GEMM001/TIMING001. Preserve zeros and long tails. Mark RESOLUTION_LIMITED for any measured zero or median<10×max(prior65536ns,observed grid); GCD does not establish physical resolution. Primary speedup=same-run naive median/tiled median only for complete passing sets without resolution limits. Thirty within-round ratios and their statistics are separately named; no zero division. GEMM001 historical times are never the denominator.

Interpretation: correctness/timing/speedup are now documented for the supplied first run. Source establishes shared memory, tile, barriers and padding. Data reuse, parallelism, caching and scheduling remain competing unmeasured explanations. M=1 can lose performance because of unused rows/loading/barriers, but those are hypotheses rather than diagnosed hardware costs. No inferred real DRAM bytes, model speedup or generalized Adreno benefit. No FP16/vectorization/register tiling/autotuning or M1-specific kernel.

Acceptance: all24 variant and12 initial pair checks PASS with no nonfinite values; every retained sampling output/pair PASS; when timestamp supported, each shape has10+30 samples per variant and30 balanced measured pairs; explicit resolution status and suppressed invalid ratios; shader source/hash, limits/features, orders/seeds, thresholds, manual UNKNOWN-capable conditions, visibility/errors and destroyed resource ledger exportable. Static/CPU/fake-native tests remain separate from phone WGSL compilation and GPU validation. Run URL and USB steps are in README.

## GEMM003 M=1 specialized FP32 structure comparison

Actual first phone record **COMPLETE**, preliminary acceptance met. [Original JSON](../results/raw/GEMM003-2026-10-05T10-00-55-452Z.json),781873 bytes,SHA256 `95cb1119984fe39993a405767719bad83b51e5dce1c5e2d7462e086721ac38e2`. All30 initial variant and30 initial pair checks PASS,120 sampling output checks and120 round pair checks PASS; nonfinite/threshold violations zero, errors and shader compilation messages empty; tracked resources recorded destroyed. Independent `scripts/verify_gemm003_result.py` regenerates seeded inputs and checks all564 small-case output elements against independent CPU reference, verifies exported absolute/relative maxima, shader hashes, all timestamps/statistics and six permutations5 each. Performance full output arrays are not exported: those all-output summaries remain client evidence, supplemented by independent seeded worst-reference checks.

|M=1,K=N=1024 variant|GPU pass median ms|nearest-rank p95 ms|min / max ms|zeros / measured|
|---|---:|---:|---|---|
|naive|2.719744|2.818048|2.162688 / 2.818048|0 / 30|
|tiled16×16|5.341184|5.373952|5.308416 / 5.439488|0 / 30|
|specialized64×1|1.638400|1.769472|1.310720 / 1.769472|0 / 30|

Same-run median ratios: naive/specialized **1.66×**, tiled/specialized **3.26×**, naive/tiled **0.509202454×**. Historical GEMM001/002 medians are excluded. All three measured sets have observed timestamp-difference GCD65536ns and meet the predefined PRELIMINARY resolution rule; zeros/tails retained. This one-run structure comparison changes workgroup shape,A loading and invalid-row work jointly; it does not isolate barrier/reuse/parallelism costs, measure DRAM traffic, establish model acceleration or predict Adreno benefit. Real model M/N/K remain UNKNOWN.

Manual conditions: 未明显发热，温度未测量; 未充电：电量100%; DevTools未开启; flag已停用. Initially visible,no transitions/background. Full environment/limits retained in raw JSON; manual fields are not independent thermal/flag measurements. No commit/push.


Result: **COMPLETE** in the supplied first phone record. Existing GEMM001/002 results and shaders remain preserved. No new model phone run or profiler/timestamp-overlap diagnosis; no commit/push.

Question: does an N-parallel M=1 kernel with cooperative A loading improve single-dispatch pass time over naive and generic16×16 tiled, after removing invalid output-row work? This is a structural comparison: workgroup shape, A-load scheme and invalid rows change together, not an isolated measurement of any one cost.

Setup: independent src/benchmark/gemm003.html uses the same `gemm_compare_page.mjs` controller as GEMM002 and the same `gemm_gpu.mjs` pass/error executor, `gemm_math.mjs` seeded inputs/binary64 CPU reference/frozen tolerances, and TIMING001 statistics. Original naive8×8 and tiled16×16 WGSL are untouched. Row-major FP32 A[M,K]*B[K,N],FP32 accumulation,no bias/activation/quantization. Specialized64×1 only supports M=1,one column/lane,64-element/256-byte shared A block; both barriers reached by all lanes. Explicit branches guard A K-tail,B K/N bounds and C stores; invalid columns perform no output arithmetic. For primary M=1,K=N=1024:16 workgroups,16 K blocks,32 barriers per workgroup. Check device workgroup/storage/dispatch/buffer/uniform16-byte/u32 bounds; M!=1 UNSUPPORTED,no alternative configuration.

Correctness shapes M=1 with(K,N)=(1,1),(5,7),(17,19),(65,67),(1024,1024). Both exact[-3,3] and original bounded fractional inputs,xorshift32 seed0x6e6d0001,A-then-B. Independent binary64 reference versus GPU FP32/possible FMA. Integer atol=rtol=0; fractional atol0.002/rtol0.0002 unchanged. All outputs,nonfinite/threshold counts,max absolute/relative error,worst index/expected/actual checked. Three variants and all three unordered pairs per case; no fractional bitwise-equality requirement. Small cases export complete A/B/reference/output arrays, including string representation of nonfinite values on failure; primary shape retains online full-array summaries. Both families/all variants/pairs must pass per shape before performance. Counts:30 variant and30 pair comparisons initially.

Measurement: shared A/B/uniform/reference,separate C/readback per variant with identical usage; pipelines/allocation/upload/reference outside loops. Ten warm-up passes per variant, then30 measured rounds of three single-dispatch passes. Six permutations repeated5 each,Fisher-Yates shuffle seed(0x6e6d0032 XOR M); warm-up order cycles permutations deterministically. Export planned and actual order,roundId,variant,orderInRound,global executionOrder,raw decimal timestamp strings/BigInt differences,wall and correctness. Each sample serially completes/readbacks/unmaps/checks before next,query indices0/1 reused only then. GPU interval excludes resolve/copy/readback/CPU checks; submit wall includes appended GPU commands but excludes map/CPU checks. CPU comparisons and serial waits affect state; this is preliminary timing.

Retain all120 raw warm-up/measured samples and40 rounds of three pair comparisons. Measured-only midpoint median,nearest-rank p95,min/max/zeros/grid use the existing method. Recheck prior65536ns grid; any measured zero or median<10×max(prior grid,observed GCD) limits resolution. Ratios naive/specialized,tiled/specialized,naive/tiled use this run's medians only. Incomplete/failing data suppress all ratios; resolution-limited or zero participants suppress affected comparisons. Preserve negative results/zeros/tails; no configuration change to obtain speedup. No DRAM/bottleneck/model/Adreno inference.

Shape evidence: [review and table](model_shape_recovery.md),[derived candidate](../results/analysis/profile002/gemm003_shape_candidate.json). Shader-2630/hash ee9a0b2823d07f56fe2e9c50134dbc9c58f9f411dcfc11795869196870dd6036,pipeline-2631/main,three encoded and three submitted GENERATION occurrences. Packed mat4x4<f16> weights and vec4<f16> FMA/reduction are proven; U.i0.x/y/z numeric values,binding ranges,texture sizes,pipeline overrides and padding/axis mapping absent. Global M/N/K remain UNKNOWN,including M=1; no real shape is added. Minimal targeted future parameter capture is proposed only, not implemented. Same-shape FP32 rewrite would not establish equivalence to packed FP16 runtime operators.

Acceptance: all30 variant and30 initial pair checks PASS with nonfinite zero; all120 sampling outputs and120 per-round pair checks PASS;10+30 samples per variant with six measured orders5 each; explicit timestamp/resolution/ratio status; full small-case inputs/outputs,shader source/hash,limits/features,seeds/orders,thresholds,manual environment/visibility/errors and destroyed-resource ledger exported. Without timestamps,correctness may pass but GPU time remains NOT_MEASURED. Static/CPU/fake-native checks are separate from actual phone evidence. Phone steps in README.


## SHAPE001 targeted real-shape parameter pilot

Result: **NOT_RUN**,logical M/N/K still UNKNOWN. Question: can the generation-submitted shader-2630 instance's uniform bytes/binding metadata and versions establish logical versus padded/packed dimensions? Setup: stock MediaPipe0.10.29,successful Gemma3n E2B Web model,same BASELINE prompt/config,one short generation; no timestamps,model algorithms or new kernels. Match exact source/hash,record selected pipeline/constants,setBindGroup/dynamic offsets/texture views and16-byte U.i0 snapshots in queue order at each submit,not final content. Caps/CPU-only shadow provenance/errors/collector overhead are explicit. No usage mutations or model GPU readbacks. phase TOKEN_COUNT remains outside generation; post-generation drain and cleanup separate from generation promise wall.

Acceptance: same model generation completes nonempty/done/no errors; selected encoded/submitted occurrences identified; uniform provenance available or gap stated,zero hidden loss/wrapping failures; full raw chain allows review of actual axes/padding/batch/head. Observer COMPLETE and parameter KNOWN do not automatically prove logical shape. See model_shape_recovery.md. Once review proves one acceptable logical shape,activate GEMM004 manifest with raw/hash/document/proof fields; otherwise keep gated. No rerun/full benchmark requested beyond this one model capture.

## TIMING002 bounded timestamp semantics control

Result: **NOT_RUN**. Question: do unique-query dependent vector-add passes overlap under single-buffer,continuous-submit and serial-wait conditions? Existing PROFILE003 offline decision3,cause UNKNOWN,no confirmed collector bug,no model timing rerun. Extended audit:1898 positive overlaps,all cross-submit and>65536ns;min327680,median27459584,p9556360960,max100073472ns;start/end inversions0,unique slots/no repeat submits,126402 associations agree. Original raw unchanged. See timestamp_validity.md for IDs,source audit and official-source hypotheses.

Setup: existing vector-add WGSL,N1048576,8 passes of32 ping-pong dependent dispatches,exact integer A/B/reference. Each mode new16-slot query set,no reuse. Snapshot every pass outside GPU interval;final separate resolve/copy then one completion and uniform query/output maps,no per-pass maps. Serial-wait control alone waits after each pass,changes conditions. Pipeline/allocation/upload outside intervals. Export all endpoints/BigInt differences,monotonicity/signed and positive overlaps/grid,categories,full-output online summaries,wall scopes/environment/errors/cleanup. No divide-by32,pass-time sum,busy-time claim,stock performance comparison or speedup.

Acceptance:24 full output checks PASS,unique association/completed final readback,no compilation/validation/lost/map errors and all samples preserved;actual workload resolution reviewed rather than assumed. This fills B's discriminating-control gap;does not alone recover mixed-pass per-kernel timing. One bounded control only. Failed records downloadable.

## GEMM004 reviewed real logical shape FP32 rewrite

Result: **NOT_RUN / WAITING_FOR_SHAPE_EVIDENCE**,no shape entered. Existing shared GEMM framework/kernels prepared for one reviewed real shape:three variants at M1,two at M>1;synthetic FP32 inputs,not actual model tensors/operator-equivalent execution. Full small boundary arrays and online performance correctness,frozen tolerances,shared A/B/separate C;10 warm-ups and30 balanced measured rounds,single dispatch/pass,serial readback,original timing boundaries,grid/zero/tail retention,same-run ratios. Shape proof/raw/hash/axis-padding conversion required;resource failures SKIPPED,no resizing. See README/model_shape_recovery.md for gating/steps.

Current Part1 deliverable is a **structure table and validity diagnosis**,not cost rankings or breakdown. PROFILE002 submitted pass structure:109 UNKNOWN,1895 MIXED,1 KV cache movement,2005 total/126402 dispatches. Label sets not duplicated as exclusive shares,validTime NOT_MEASURED. Other original token/phase/memory/repetition/Adreno gaps remain in requirements.md. A/B do not gate each other. No commit/push.

## Open decisions

- Final Adreno access and whether Mali interim development is accepted.
- What baseline GEMM the requested speedup must beat: naive A, runtime kernel, or both.
- Deadline and preferred update cadence.
- Supported Gemma E2B stack; closest Gemma fallback if required, with evidence.
- Exact Q4/Q8 formats and FP16 accumulation interpretation/fallback.
- Per-dispatch instrumentation feasibility in the selected runtime.


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


Archive interpretation: latest Q4 A-D M1 A/C median difference exactly65536ns=65.536us,one observed timestamp grid;no stable small benefit claimed. Large full outputs verified online;offline replay limited to small exported outputs and exported sample records. D complete-path advantage assumes repeating ABC CPU preprocessing/upload,not preprocessed-weight reuse or model acceleration. Assignment incomplete.


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
