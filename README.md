# Mobile WebGPU GEMM investigation

Documentation scaffold for the IN2PETA assignment. No LLM profiling, custom kernel benchmark, or speedup has been measured yet.

Development device: OnePlus Ace 6 Supreme Edition, Dimensity 9500, ARM Mali-G1-Ultra MC12. Final target: Snapdragon Adreno; access and acceptance of development-device results remain unresolved.

## Working documents

- `docs/environment.md`: device evidence and capability checks.
- `docs/measurement_contract.md`: definitions and measurement rules.
- `docs/experiment_template.md`: copy once per experiment.
- `docs/experiment_log.md`: completed observations and next steps.
- `docs/requirements.md`: assignment-to-evidence checklist.
- `report/performance_report.md`: English final-report skeleton.
- `results/*.csv`: schemas for raw samples and summary tables; header-only until measured.

## Daily workflow

1. Choose one question and write a hypothesis before running.
2. Record run ID, exact code commit, environment, setup and raw samples.
3. Validate correctness before interpreting speed.
4. Update the experiment log with observation, evidence, interpretation and uncertainty.
5. Update the relevant report section; prepare a short email with evidence and next step.

Keep raw samples unchanged. Use `NOT_MEASURED`, `UNAVAILABLE`, or `NOT_APPLICABLE` in prose; missing numeric CSV fields stay blank, never zero. Do not send a full changing report every day: send a compact update and the relevant evidence when available.

## Current next step

COMPUTE001 passed on the Android phone: all 1025 FP32 sums matched an independently recomputed reference, with max absolute error 0. See [the experiment record](docs/experiment_log.md) and [original JSON](results/raw/COMPUTE001-2026-10-04T10-53-11-629Z.json). TIMING001 subsequently validated compute-pass timestamp enable/readback in two runs, with granularity and tail limitations documented below. FP16 remains unverified; no formal GEMM benchmark has been measured. Next, define a separate capability or baseline experiment using these measurement limitations.

## Android compute smoke test (Windows, USB)

Python 3.14.6 was verified on the development computer. No framework, packages, or build step is required.

1. Enable Android USB debugging, connect the phone by USB, and accept its debugging authorization prompt.
2. In PowerShell, start the server from the repository root and leave this terminal running:

   ```powershell
   Set-Location C:\Projects\mobile-webgpu-gemm
   python -m http.server 8000 --bind 127.0.0.1
   ```

3. In another PowerShell terminal, check the device and forward the phone's localhost port to the computer:

   ```powershell
   & 'C:\Tools\platform-tools\platform-tools\adb.exe' devices
   & 'C:\Tools\platform-tools\platform-tools\adb.exe' reverse tcp:8000 tcp:8000
   & 'C:\Tools\platform-tools\platform-tools\adb.exe' reverse --list
   ```

   The device must show `device`, not `unauthorized` or `offline`. If several devices are attached, add `-s SERIAL` before `reverse`.
4. In **the phone's Chrome**, open [http://localhost:8000/src/benchmark/](http://localhost:8000/src/benchmark/). Keep using localhost; do not substitute the computer's LAN IP. This origin must report `secureContext: true`.
5. Tap **检测 WebGPU**, then **运行向量加法**. Acceptance: `PASS`, 1025 elements, max absolute error 0, error elements 0, no shader/GPU/device errors. The 17th workgroup has only one valid element; inspect the exported last-element result too.
6. Tap **下载结果 JSON**. Preserve the downloaded original JSON in `results/raw/` after copying it from the phone. Record its path and the actual result in the experiment log. Detection-only downloads have `result: null`; errors are evidence, not a successful run.

The JSON records browser/environment data, adapter info (including empty strings), supported adapter features, actual device features/limits, shader source and diagnostics, deterministic input definitions, CPU reference and GPU readback. `timestamp-query` and `shader-f16` support are recorded only; neither feature is enabled or verified. No GPU or wall-clock duration is measured.

If detection or execution fails, keep the specific error shown on the page and download the JSON. If localhost cannot load, check the running server, USB authorization and `adb reverse --list`. After USB reconnection, run `adb reverse` again. Stop the server with Ctrl+C when finished.

## TIMING001 Android compute timestamp validation

Status: **two actual phone runs completed**; timestamp-query was enabled and read back, and both runs' correctness summaries passed. See [per-run statistics and limitations](docs/experiment_log.md#timing001-android-webgpu-compute-timestamp-validation). The observed grid was 65.536 microseconds; the smallest single-dispatch configuration had 6/30 measured zeros in each run. This separate experiment validates the timestamp chain, not a formal GEMM benchmark. COMPUTE001 and its original JSON remain unchanged.

Question: Can `timestamp-query` be explicitly enabled and read back, and do different compute-pass workloads yield interpretable timestamp samples?

Use the same Windows HTTP server and USB `adb reverse` commands above. In **phone Chrome**, open [http://localhost:8000/src/benchmark/timing.html](http://localhost:8000/src/benchmark/timing.html). Fill in observed thermal/charging status and WebGPU Developer Features flag status (defaults are UNKNOWN); the page does not change flags. Keep the page in the foreground, tap **运行 TIMING001**, wait for completion, then **下载结果 JSON**. Preserve every original download under `results/raw/` for separate per-run review, without pooling samples. If unsupported or an error occurs, download that evidence too. DevTools state was not recorded in the two existing exports; no DevTools effect can be inferred from their timing difference.

Configuration: FP32 uniform N = 1025, 65536, 1048576; workgroup_size(64), bounds guard; 1 or 32 identical dispatches per compute pass. Six configuration blocks are shuffled using fixed seed `0x0017a001` (xorshift32/Fisher-Yates) and the actual order is exported. Each block uses 10 warm-up passes excluded from statistics, followed by 30 measured passes: 240 raw pass records total, 180 measured. Every pass finishes timestamp readback and a full zero-tolerance CPU-reference check of the output before the next submission. Pipeline creation is once per run; buffer allocation and input/uniform uploads are once per block before sampling.

GPU timing uses compute-pass `timestampWrites`, followed by query resolve/copy/map/unmap. Raw unsigned 64-bit timestamps are exported as decimal strings; subtraction is done using BigInt before converting nanoseconds to milliseconds. GPU pass duration may include pass scheduling costs. Query resolve and correctness output copy are after the timed compute pass. `submitToCompletionWallMs` starts immediately before `queue.submit` and ends after `onSubmittedWorkDone`; it includes the submitted resolve/copies, but excludes timestamp mapping, output mapping and CPU correctness checks. It is a separate wall-clock metric, not GPU kernel time.

Repeated dispatches overwrite the same output, so caching and resource dependencies may matter. Do not divide the 32-dispatch pass time and label it independent kernel latency. Statistics retain zeros and use measured passes only: median (midpoint for even counts), nearest-rank p95 (`ceil(0.95*n)`), min/max and zero-duration count. No strict monotonicity with N, bottleneck classification or peak-bandwidth claim is required or inferred.

Acceptance: actual device enables `timestamp-query`, all six blocks complete with 30 measured passes each, every output check passes, and no compilation/GPU/device-loss errors occur. Raw start/end strings and nonnegative deltas must be inspectable, including zero values. Review zero counts and distributions: all-zero results show an unresolved timing-resolution/availability issue and do not establish useful workload discrimination. Background transitions are exported for the whole run, separately flagged during sampling; preserve affected samples and assess their limitations. Partial/error runs retain recorded samples and mark summaries incomplete. shader-f16 is not requested or verified.

## BASELINE001 Gemma 3n E2B text inference

Status: **actual phone runnability accepted**; [BASELINE001 original JSON](results/raw/BASELINE001-2026-10-04T14-11-39-378Z.json) records initialization success, one normally completed generation, nonempty output and no errors. The initialization background transition and measurement boundaries are preserved in [the experiment log](docs/experiment_log.md). Question: can the existing MediaPipe Web LLM runtime initialize the specified Gemma 3n E2B Web model and finish one text-generation request on Android Chrome without runtime/model optimization?

Runtime: `@mediapipe/tasks-genai@0.10.29`, pinned from the official npm registry and inspected through the actual package's `genai.d.ts` and JS exports. JS and all WASM variants come from the same integrity-verified package and are staged unchanged under ignored `assets/vendor/tasks-genai/0.10.29/`. No framework, build tool or npm install is required. Prepare/reprepare them on Windows with:

```powershell
Set-Location C:\Projects\mobile-webgpu-gemm
python scripts\prepare_baseline_runtime.py
```

The script records package integrity and per-file bytes/SHA256 in `src/baseline/runtime_manifest.json`. Phone runtime/model requests use only the local HTTP origin, with no external CDN fallback. The stock `LlmInference.createWebGpuDevice()` helper creates the device passed to `createFromOptions`; no custom device configuration or runtime algorithms are introduced. Independent environment-probe adapter info and this runtime device's features/limits are recorded separately. Internal runtime backend remains UNKNOWN without independent evidence.

Model: `assets/models/gemma-3n-E2B-it-int4-Web.litertlm`, from [the exact specified file](https://huggingface.co/google/gemma-3n-E2B-it-litert-lm/blob/main/gemma-3n-E2B-it-int4-Web.litertlm). Anonymous access returned 401 during preparation; the subsequent authorized local download was hashed at 3038117888 bytes, SHA256 `b6c8e1081ec80730f14473a5ece941b48da5d8e2a80c97c2963da153f3eff3d2`. This is file identity, not runtime memory. For reproduction, follow [authorized download and verification steps](assets/models/README.md); log into Hugging Face in the desktop browser and accept the required license/access conditions if prompted. Do not substitute the Android file or switch models. Weights, node_modules and caches are ignored by Git.

After downloading to that exact path, run `python scripts\verify_baseline_model.py`. Leave the existing Python localhost:8000 server running and use the same USB `adb reverse tcp:8000 tcp:8000` command above. On **phone Chrome**, open [http://localhost:8000/src/baseline/](http://localhost:8000/src/baseline/), tap **加载模型**, wait for READY, then **运行固定 prompt**. Keep the page foreground. One generation is allowed per initialized model; reload the model for a new run. Download BASELINE001 JSON after completion or failure; snapshots can also be downloaded while loading/generation is pending. Preserve actual downloaded evidence under `results/raw/`.

Text only: maxNumImages=0, supportAudio=false. Fixed question: `Explain in two short sentences what matrix multiplication computes.` Sent prompt uses the [official Gemma template](https://ai.google.dev/gemma/docs/core/prompt-structure):

```text
<start_of_turn>user
Explain in two short sentences what matrix multiplication computes.<end_of_turn>
<start_of_turn>model
```

The actual string includes the final newline and is exported verbatim. Options: maxTokens=512 (combined input + output capacity, not output token count), topK=40, temperature=0.8, randomSeed=101, numResponses=1, maxNumImages=0, supportAudio=false. Other runtime options retain defaults; no LoRA or precision/rewinding overrides. Exact counts, tokens/s, pure prefill latency, per-token latency, GPU kernel time and GPU memory are NOT_MEASURED; none are estimated from character counts.

Events separately identify resource preparation, model initialization, request start, every streaming callback and generation promise completion. WASM fileset resolution/HEAD checks are preparation; actual WASM/device initialization and model loading belong to model initialization. Loading is excluded from request-to-completion wall time. Callback records include text fragment, done and relative wall milliseconds; they are not single-token samples and the first callback is not pure prefill latency. All recorded durations are page wall-clock observations, not GPU execution time.

Acceptance: model initialization succeeds; one generateResponse promise resolves normally with done=true and nonempty output; no runtime/GPU errors. This checks runnability, not numerical correctness, Adreno acceptance or formal profiling. Pending/failed states remain exportable, and environment probe data does not prove the runtime backend. Official sources: [MediaPipe Web guide](https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference/web_js), [sample](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/llm_inference/js). The guide is now maintenance-only; this experiment deliberately keeps the requested MediaPipe runtime rather than switching stacks.

## PROFILE001 profiling capability audit

Read [docs/profiling_capabilities.md](docs/profiling_capabilities.md) for the fixed-version API/source evidence, assignment coverage table and proposed minimal instrumentation. The audit finds public input tokenization counting but no public generated-token IDs/count or pure prefill/decode boundary. A compatible injected device can request timestamps; native method observation is proposed for pass/dispatch and logical buffer metadata. No instrumentation or full benchmark is run here, and existing pages remain unchanged. The smallest next pilot is complete-prompt sizeInTokens plus count-only observation on the stock runtime device; timestamp instrumentation follows only after coverage/compatibility checks.

## PROFILE002 count-only pilot (verified complete phone record)

Open [the independent PROFILE002 page](http://localhost:8000/src/profiling/profile002.html) in Android Chrome. Existing COMPUTE001, TIMING001 and BASELINE001 pages remain available. This pilot imports the identical BASELINE001 prompt/config and pinned local 0.10.29 runtime, uses the stock runtime-created device, and does not enable timestamp-query or modify model/runtime algorithms.

In Windows PowerShell:

```powershell
Set-Location C:\Projects\mobile-webgpu-gemm
python -m http.server 8000 --bind 127.0.0.1
```

If the existing localhost:8000 server is already running, keep it. In a second PowerShell window:

```powershell
& 'C:\Tools\platform-tools\platform-tools\adb.exe' devices
& 'C:\Tools\platform-tools\platform-tools\adb.exe' reverse tcp:8000 tcp:8000
& 'C:\Tools\platform-tools\platform-tools\adb.exe' reverse --list
```

Authorize USB debugging if needed. Use phone URL `http://localhost:8000/src/profiling/profile002.html`, never the computer's LAN address. Tap **加载并运行一次 pilot**, keep the page foreground through model initialization and one generation, then **下载 PROFILE002 JSON**. A fresh initialization is used on each click; do not run other model pages concurrently. Runtime assets and the already verified Web model must remain in their existing local paths. On error, download the failed record after cleanup; no model substitution is attempted.

The observer is installed before model initialization and restored after the post-generation GPU drain. Phases are MODEL_INIT, TOKEN_COUNT, GENERATION and POST_GENERATION. `sizeInTokens(fullPrompt)` is measured separately while idle; TOKEN_COUNT also drains submitted work before generation. Generation wall time ends when its promise resolves; the subsequent GPU drain has its own wall interval. No per-call UI/console updates occur during generation. Shader compilation-info requests and all instrumentation add overhead.

JSON includes phase call counts, raw calls, stable shader/pipeline/encoder/pass/command-buffer/buffer IDs, post-collection SHA256 hashes, and full sources for shaders linked to generation submissions. Encoded dispatch counts and submitted-command-buffer dispatch counts are distinct; repeated submissions count each time. Native submit returning does not prove error-free GPU execution. Indirect dispatch dimensions remain UNKNOWN. Logical buffer live/peak bytes count observed allocations minus explicit destroy, excluding pre-install allocations; they are not physical GPU memory. Profiler GPU allocations are zero.

Caps: 500000 raw events, 50000 object identities, 32 MiB shader source (UTF-8), 1000 visibility events. Any dropped data or wrapping/restoration failure marks coverage INCOMPLETE; early install failure aborts initialization. Coverage excludes other devices/workers/render commands and runtime-owned validation scopes. Full output tokens, dispatch/token, tokens/s, pure prefill, per-token latency and GPU timing remain NOT_MEASURED. This is an instrumentation compatibility pilot, not a benchmark.

The first supplied [phone record](results/raw/PROFILE002-2026-10-04T15-23-33-186Z.json) completed generation and drain, returned input count 18, and recorded no errors/coverage failures. Its original 200000-event cap dropped 68467 of 268467 calls, so it remains INCOMPLETE. Revision `PROFILE002-count-v2-cap500k` raises only the bounded event cap and exposes explicit incomplete reasons in the summary. The subsequent [complete phone record](results/raw/PROFILE002-2026-10-04T15-53-13-603Z.json) retained all 268465 events, with zero losses/errors/coverage failures and all lifecycle flags true. Independent replay verified 126402 generation direct dispatches both encoded and contained in submissions, 2005 compute passes, 2056 submits, and 180 generation-linked shader source hashes. Full-prompt input count returned 18; generated-token count remains unavailable. `python scripts/verify_profile002_result.py results/raw/PROFILE002-2026-10-04T15-53-13-603Z.json` reproduces the checks. Keep the earlier incomplete record separately. For reproduction use `http://localhost:8000/src/profiling/profile002.html?collector=v2` and confirm the 500000 cap.

Desktop checks: `node scripts/check_profile002.mjs` exercises fake-native semantics and accounting; `node --check src/profiling/profile002.js` checks syntax. These are not Android runtime evidence. Phone acceptance requires successful initialization, valid full-prompt input count, one completed nonempty generation with done=true, completed drain, no runtime/GPU errors and COMPLETE observer coverage. Preserve the downloaded raw JSON before reviewing actual results.

## Part 1 shader analysis and PROFILE003 (timestamp acquisition verified)

[PROFILE002 shader analysis](docs/profile002_shader_analysis.md) reconstructs actual GENERATION submissions and provides all 180 shader-identity rows, 132 unique source hashes, source evidence/confidence, submitted dispatch counts and extracted dtype/layout/tiling facts. Sources and machine-readable CSV/JSON are under `results/analysis/profile002/`. The conservative classifications leave 122 identities UNKNOWN. Runtime-dependent M/N/K and unrecorded workgroup override constants remain UNKNOWN. Reproduce with `python scripts/analyze_profile002_shaders.py`; dispatch frequency is not GPU duration or a bottleneck ranking.

PROFILE003 is an independent single-generation **pass timestamp integration pilot**, not the full Part 1 benchmark. Same model, fixed complete prompt and BASELINE001 options, including maxTokens=512 and seed=101. The public `baseOptions.gpuOptions.device` accepts an injected device reproducing fixed stock helper's high-performance adapter, shader-f16, supported subgroups and adapter maxima for maxBufferSize/maxStorageBufferBindingSize/maxStorageBuffersPerShaderStage, plus timestamp-query. Unsupported features or incompatible device/model initialization produce an explicit failed record; there is no wall-time fallback. The runtime bundle/model algorithms and existing pages remain unchanged.

Use the existing local server, verified model/runtime and USB reverse. If needed, in separate Windows PowerShell windows:

```powershell
Set-Location C:\Projects\mobile-webgpu-gemm
python -m http.server 8000 --bind 127.0.0.1
```

```powershell
& 'C:\Tools\platform-tools\platform-tools\adb.exe' devices
& 'C:\Tools\platform-tools\platform-tools\adb.exe' reverse tcp:8000 tcp:8000
```

Phone Chrome: [http://localhost:8000/src/profiling/profile003.html](http://localhost:8000/src/profiling/profile003.html). Close other active model pages, tap **加载并运行一次 pilot**, keep foreground through initialization and one short fixed-prompt generation, then **下载 PROFILE003 JSON**. Do not change Chrome flags automatically or run a repetition benchmark in this round. Failed/unsupported runs are also exportable after cleanup. Preserve actual JSON under results/raw for review.

The [actual PROFILE003 record](results/raw/PROFILE003-2026-10-05T03-20-03-974Z.json) has COMPLETE acquisition/coverage, all lifecycle flags true, input count 18, no errors/losses and 2005 submitted timestamp pairs. Independent replay verifies all associations/differences, including 29 zero samples and 65536 ns observed timestamp/duration grids. However, 1898 adjacent reported intervals overlap across distinct command buffers even though submission sequence order has no inversions. Preserve this observation with cause UNKNOWN; these intervals are not yet a validated isolated-pass cost model for bottleneck ranking. Do not sum them as end-to-end GPU time or directly compare performance against stock. Reproduce with `python scripts/verify_profile003_result.py results/raw/PROFILE003-2026-10-05T03-20-03-974Z.json`. See experiment_log for exact provenance, distribution and boundaries; complete collection does not complete Part 1 profiling.

Generation passes receive beginning/end timestampWrites without mutating original descriptor objects or dropping their other fields. Existing non-null timestampWrites aborts with an explicit conflict instead of overwriting runtime queries. Query capacity is 4096 pass pairs, chunked into 256-pass/512-query sets, with 256-byte resolve slots. Dedicated profiler resolve/readback buffers total 2097152 logical bytes, allocated before count-only installation and destroyed after readback. Model logical buffer statistics exclude them; profiler resources and appended resolve/copy commands are exported separately. Capacity loss, repeated command-buffer submission overwriting query slots, missing samples and wrapper gaps are INCOMPLETE.

Resolve/copy commands append outside compute passes to existing command encoders before finish. They add no per-pass submit, completion wait or mapping; mapping happens by used chunk after generation promise completion and GPU drain. This still adds query/command/memory/CPU overhead and can affect later scheduling, so the run cannot be directly compared with stock PROFILE002 as a performance result. Generation wall time keeps its original request-to-promise boundary; post-generation drain and subsequent query readback each have separate scopes/events. Samples join submitted command buffer/pass IDs to observer dispatch/pipeline/shader identities. An encoded but unsubmitted pass has no usable submitted timestamp sample.

Raw start/end timestamps and exact duration ns are decimal strings; subtract BigInt before optional safe conversion to microseconds. Zero durations are retained. Export includes observed timestamp-difference and duration GCD grids, checking the prior TIMING001 65536 ns (65.536 microsecond) limitation without asserting that this new run already measured it. Whole-pass intervals can include scheduling; multi-dispatch passes are never divided or attributed as isolated kernels. A sum of pass durations is not reported as full end-to-end GPU time. No tokens/s, generated-token count or per-token latency is calculated.

Desktop checks: `node scripts/check_profile003.mjs`, `node --check src/profiling/profile003.js`, and `node --check src/profiling/pass_timestamps.mjs`. Fake-native tests cover feature/limit injection, descriptor preservation, conflict/cap/repeat handling, multi-dispatch associations, alignment, BigInt/zero/grid values, restoration and profiler resource cleanup; they are not phone evidence. Phone acceptance: valid complete input count, nonempty successful generation/done/drain, timestamp-enabled runtime device, at least one actual submitted timestamp pair, no runtime/validation/query/device errors, and COMPLETE count/timestamp coverage. Grid/zero/mixed-pass limitations remain even after acceptance. Timestamp semantics and alignment follow the [WebGPU specification](https://gpuweb.github.io/gpuweb/#timestamp-query).

## GEMM001 naive FP32 baseline (first phone run complete)

GEMM001 begins independent dense GEMM experiments; PROFILE003 overlap diagnosis is not a prerequisite. Existing pages and raw records remain unchanged. The [offline overlap audit](docs/profile003_overlap_review.md) is separate from GEMM results. The selected real shader is PROFILE002 shader-2630, SHA256 `ee9a0b2823d07f56fe2e9c50134dbc9c58f9f411dcfc11795869196870dd6036`, [exact source](results/analysis/profile002/shaders/ee9a0b2823d07f56fe2e9c50134dbc9c58f9f411dcfc11795869196870dd6036.wgsl). It performs weight products/FMA over src_s using mat4x4<f16> weights, vec4<f16> accumulators and workgroup reduction. Global M/N/K, row-major layout and override values cannot be recovered from the available uniforms/bindings; remain UNKNOWN. Packed local indexing and eight accumulators do not establish global matrix dimensions.

Proceed immediately with representative shapes `(M,K,N)=(1,1024,1024)` and `(128,1024,1024)`, plus correctness shapes `(1,1,1)`, `(3,5,7)` and `(17,19,23)`. No recovered real shape is added. This dense FP32 non-fused baseline is not an equivalent replacement for the runtime's FP16/packed/fused operators and cannot demonstrate model speedup. Tiling/vectorization/quantization are deferred.

Phone Chrome URL: [http://localhost:8000/src/benchmark/gemm.html](http://localhost:8000/src/benchmark/gemm.html). With the existing server running and phone connected/authorized, re-establish USB reverse if needed:

```powershell
& 'C:\Tools\platform-tools\platform-tools\adb.exe' devices
& 'C:\Tools\platform-tools\platform-tools\adb.exe' reverse tcp:8000 tcp:8000
```

If the server is not running, use a separate PowerShell window:

```powershell
Set-Location C:\Projects\mobile-webgpu-gemm
python -m http.server 8000 --bind 127.0.0.1
```

Close other GPU/model pages. Fill thermal/charging/DevTools/Developer Features flag conditions (or leave UNKNOWN), tap **运行 GEMM001**, keep foreground and wait through CPU references and all passes; then **下载结果 JSON**. No per-sample UI/console output occurs. A failed run remains downloadable after cleanup. Store the original downloaded JSON under results/raw.

The [first actual phone run](results/raw/GEMM001-2026-10-05T04-20-24-462Z.json) is COMPLETE, with all ten initial checks and 80 warm-up/measured checks reporting PASS, zero nonfinite values and no errors/compilation messages. Strict integer checks have zero absolute error; largest fractional absolute error is 5.648095819665855e-5. Independent replay verifies timestamp differences, measured statistics, fixed order, shader hash and seeded CPU reference for every exported worst element. Full GPU output arrays are not included, so an offline reconstruction of all-output maxima/counts is unavailable. Reproduce with `python scripts/verify_gemm001_result.py results/raw/GEMM001-2026-10-05T04-20-24-462Z.json`.

Measured pass median/p95: representative M=128,K=N=1024 is 10.518528/11.665408 ms; M=1,K=N=1024 is 2.359296/2.424832 ms. Both have 30 measured samples, zero measured zero durations, 65536 ns observed grid and PRELIMINARY status under the frozen resolution rule. Effective nominal GFLOP/s is 25.520249 / 0.888889 respectively; these are single-run representative pass observations, not model speedups or hardware peak utilization. Environment reports charging at 99%, no noticeable heating but temperature unmeasured, DevTools off and flag disabled; these are manual statements, not independent thermal/flag measurements. Full details and limitations are in experiment_log.

Contract: row-major A[M,K], B[K,N], C[M,N], C=A×B; all storage and accumulation FP32, no bias/activation/quantization. Each 8×8×1 invocation computes one output, loops K, and checks row/column bounds. Uniform M/N/K/padding occupies 16 bytes with binding offset zero. Buffer/binding size, u32 addressing, storage/uniform bindings, workgroup limits and dispatch dimensions are checked; unsupported configurations are SKIPPED with reasons.

Inputs use fixed xorshift32 seed `0x6e6d0001`, A followed by B independently per shape/family. Integer values [-3,3] produce exactly representable products/partial sums (`9*K <= 9216` for these shapes), checked strictly with atol=rtol=0. Fractional inputs are fround(((nextU32 % 2001)-1000)/1000) in [-1,1]; predeclared atol=0.002, rtol=0.0002. CPU reference independently traverses i-k-j and accumulates stored FP32 products in JS binary64/Float64Array; GPU FP32/FMA can differ. Every output is checked, including NaN/Inf, worst flat/row/column index, expected/actual, max absolute/relative errors and violation count. Relative reporting uses max(abs(expected),1e-8); acceptance uses absError <= atol+rtol*abs(expected), so the denominator floor cannot hide zero-near errors. Thresholds never adapt after failure.

Both input families must pass initial correctness for each performance shape. Fractional buffers/reference are then reused without setup in sampling loops. Feature detection explicitly requests timestamp-query if supported; otherwise all correctness tests still run, performance GPU time is NOT_MEASURED (CORRECTNESS_ONLY if all pass). No requestDevice feature failure is silently bypassed. Reuse TIMING001 BigInt timestamp subtraction and statistics. Each configuration has 10 warm-up and 30 measured single-dispatch passes, in xorshift32/Fisher-Yates fixed order seed `0x6e6d0017`. Warm-ups are exported but excluded from statistics. After each submission completes, all C outputs and timestamps map/unmap and correctness is checked before submitting the next sample. Allocation/upload/reference/pipeline are outside these loops. Serial waits/readbacks affect run state; this is preliminary controlled timing.

GPU boundary is beginning/end of compute pass; query resolve and C copy occur afterwards in the submitted encoder. Queue wall time spans immediately before submit to onSubmittedWorkDone and includes query/copy commands, excluding mapping and CPU validation, which have separate wall records. Zeros and tails are retained; measured statistics use midpoint median, nearest-rank p95, min/max/zero count. Recheck timestamp-difference GCD against the previous 65536 ns grid. Conservative frozen policy: any zero measured duration or median below 10×max(prior grid, observed GCD) marks RESOLUTION_LIMITED. This finite-sample GCD is not a hardware-clock measurement. Resolution-limited configurations publish no effective GFLOP/s or precise speedups. Otherwise nominal 2*M*N*K / median-ns gives effective GFLOP/s only for a complete passing measured set; not hardware peak utilization or bottleneck proof. No speedup is computed in this round.

Desktop checks: `node scripts/check_gemm001.mjs`, `node --check src/benchmark/gemm.js`, `node --check src/benchmark/gemm_math.mjs`. CPU checks exercise signed non-square reference values, boundary indexing, fixed seeds, NaN/Inf and zero-near acceptance, limits, BigInt/statistics and resolution gating; they are separate from phone evidence. The first phone record meets initial acceptance: all ten shape/family tests and all sampling checks PASS with zero nonfinite outputs; each timestamp performance configuration exports 10+30 complete records; resolution status is explicit. More controlled runs and matched implementations are needed before formal comparisons.

## GEMM002 same-run naive / tiled FP32 comparison

Status: **first phone run COMPLETE**. [Actual JSON](results/raw/GEMM002-2026-10-05T04-58-16-647Z.json) preserves all samples:24 initial variant and12 cross checks PASS,160 sampling output and80 paired checks PASS, no errors/nonfinite outputs. Same-run median speedup: M1281.646× (12.189696→7.405568ms); M1 0.442× (2.359296→5.341184ms), so tiled is slower for M1. All four measured blocks have30 samples,no zeros,65536ns observed grid and PRELIMINARY status. Independent replay verifies timestamps/statistics/order/hash/seeded worst-element reference, not absent full actual arrays. See experiment_log for limits and conditions. No commit/push.

Open [http://localhost:8000/src/benchmark/gemm002.html](http://localhost:8000/src/benchmark/gemm002.html). Keep the existing localhost server, reconnect USB reverse after reconnecting the phone:

```powershell
Set-Location C:\Projects\mobile-webgpu-gemm
python -m http.server 8000 --bind 127.0.0.1
```

Run the server command only if port8000 is not already served; in another PowerShell window:

```powershell
& 'C:\Tools\platform-tools\platform-tools\adb.exe' devices
& 'C:\Tools\platform-tools\platform-tools\adb.exe' reverse tcp:8000 tcp:8000
```

Close other GPU/model pages, fill thermal/charging/DevTools/flag conditions (UNKNOWN is valid), tap **运行 GEMM002**, keep Chrome foreground until completion, then **下载结果 JSON**. Preserve the downloaded file under results/raw. Failure and unsupported records remain downloadable. No flags are changed automatically.

Question: for the representative shapes (M,K,N)=(1,1024,1024) and (128,1024,1024), does a fixed16×16 shared-memory FP32 kernel pass the same correctness contract, and how does its pass time compare with naive8×8 in the same run? Both run on the same device and share A/B/uniform/CPU reference, with independent C and readback buffers of identical usage. Both use the GEMM001 seeded input families, binary64 reference and frozen tolerances. Six shapes include scalar, rectangular,17×19×23 and1×17×19 tails plus the two performance shapes:12 shape/family comparisons,24 individual variant checks. All outputs and nonfinite values are checked, including naive/tiled comparisons; fractional results need not be bitwise identical.

Tiled uses256 invocations and2048 workgroup bytes. It zero-pads A/B loads, reaches both barriers for every K tile with every lane, and checks only final output stores. Unsupported fixed tiles are SKIPPED without fallback. Both families and variants must pass before a shape is timed. The shared executor `gemm_gpu.mjs` is also used by GEMM001; its shader and original JSON are preserved.

Each shape has10 warm-up passes per variant and30 measured pairs. Seeded order has exactly15 naive-first and15 tiled-first measured rounds; shape order is separately seeded and exported. One dispatch per pass, serial completion and full output/timestamp map/unmap/check before the next submission; setup is outside loops. The160 warm-up/measured passes across both shapes are retained. GPU boundaries exclude resolve/copy/readback/CPU checks; queue wall spans submit to completion and includes appended copies. Full output validation and paired comparison have separate outside-timing wall records. Query slots0/1 are reused only after completed readback/unmap.

Measured-only median, nearest-rank p95, min/max, zero counts and observed timestamp grid reuse GEMM001. Primary speedup is same-run naive median / tiled median; paired-ratio statistics are a different estimator. Any measured zero, incomplete/failing set, or median below10×max(65536ns,observed grid) suppresses ratios. Historical GEMM001 is background only. Keep zeros/tails; M=1 slowdown is valid. Shared loads/barriers are source facts; reuse, occupancy, cache and scheduling explanations remain hypotheses. No nominal-access-to-DRAM inference, hardware bottleneck, model speedup or Adreno generalization follows. No FP16/vectorization/autotuning is added.

Desktop checks: `node scripts/check_gemm002.mjs` and existing `node scripts/check_gemm001.mjs`; syntax checks cover both pages' modules. CPU tiled-tail simulation and fake-native pass tests validate addressing/order/limits/statistics/map/error boundaries, not WGSL compilation or phone GPU correctness. Phone acceptance requires all24 variant and12 cross checks PASS, nonfinite zero, both complete80-sample configurations when timestamps are supported, explicit resolution classification and exportable raw records/errors/resources. The supplied first run meets these preliminary criteria. Without timestamps only correctness runs, GPU time stays NOT_MEASURED. Replay actual evidence with `python scripts/verify_gemm002_result.py results/raw/GEMM002-2026-10-05T04-58-16-647Z.json`.

## GEMM003 M=1 specialized FP32 comparison — first actual run COMPLETE

Actual first phone record **COMPLETE**, preliminary acceptance met. [Original JSON](results/raw/GEMM003-2026-10-05T10-00-55-452Z.json),781873 bytes,SHA256 `95cb1119984fe39993a405767719bad83b51e5dce1c5e2d7462e086721ac38e2`. All30 initial variant and30 initial pair checks PASS,120 sampling output checks and120 round pair checks PASS; nonfinite/threshold violations zero, errors and shader compilation messages empty; tracked resources recorded destroyed. Independent `scripts/verify_gemm003_result.py` regenerates seeded inputs and checks all564 small-case output elements against independent CPU reference, verifies exported absolute/relative maxima, shader hashes, all timestamps/statistics and six permutations5 each. Performance full output arrays are not exported: those all-output summaries remain client evidence, supplemented by independent seeded worst-reference checks.

|M=1,K=N=1024 variant|GPU pass median ms|nearest-rank p95 ms|min / max ms|zeros / measured|
|---|---:|---:|---|---|
|naive|2.719744|2.818048|2.162688 / 2.818048|0 / 30|
|tiled16×16|5.341184|5.373952|5.308416 / 5.439488|0 / 30|
|specialized64×1|1.638400|1.769472|1.310720 / 1.769472|0 / 30|

Same-run median ratios: naive/specialized **1.66×**, tiled/specialized **3.26×**, naive/tiled **0.509202454×**. Historical GEMM001/002 medians are excluded. All three measured sets have observed timestamp-difference GCD65536ns and meet the predefined PRELIMINARY resolution rule; zeros/tails retained. This one-run structure comparison changes workgroup shape,A loading and invalid-row work jointly; it does not isolate barrier/reuse/parallelism costs, measure DRAM traffic, establish model acceleration or predict Adreno benefit. Real model M/N/K remain UNKNOWN.

Manual conditions: 未明显发热，温度未测量; 未充电：电量100%; DevTools未开启; flag已停用. Initially visible,no transitions/background. Full environment/limits retained in raw JSON; manual fields are not independent thermal/flag measurements. No commit/push.


Phone URL: [http://localhost:8000/src/benchmark/gemm003.html](http://localhost:8000/src/benchmark/gemm003.html). Reuse the Python server and USB reverse commands above; use localhost, not the computer LAN address. Close other GPU/model pages, fill thermal/charging/DevTools/flag (UNKNOWN allowed), tap **运行 GEMM003 同轮对比**, stay foreground, then download GEMM003 JSON. Failure records remain exportable. No automatic flags, commit or push.

Same-run variants: original naive8×8, original tiled16×16, specialized64×1. Specialized accepts only M=1, one adjacent N column per lane, cooperatively loads64 A elements into256 workgroup bytes. Each K block has a load barrier and use barrier; every lane participates, including n>=N. Explicit branches prevent OOB A/B/C access; invalid columns skip arithmetic, K tails load zero and avoid out-of-range B. For K=N=1024,16 K blocks/32 barriers per workgroup and16 dispatched workgroups. No B transpose, precision/subgroup/quantization/split-K/autotuning changes.

Five M=1 shapes (K,N)=(1,1),(5,7),(17,19),(65,67),(1024,1024), both original input families/seeds/reference/tolerances. All30 variant and30 initial pair checks must pass with nonfinite zero. Small correctness cases export full A/B/CPU reference/all three outputs; performance shape uses full online validation summaries. Every version has its own output/readback, sharing A/B/uniform/reference. Unsupported fixed resources never fall back to a different kernel.

Only the representative1024×1024 case is timed:10 warm-ups per variant,30 measured rounds containing all three variants once. Six permutations each occur5 times, shuffled with seed0x6e6d0032 XOR M; actual orders exported. One dispatch/pass, serial completed timestamp/output map/unmap/full check before next. Setup outside sampling; compute timestamp and submit-wall boundaries are unchanged from GEMM002. Retain120 samples plus all cross-comparisons. Statistics/grid/resolution use existing modules; primary median ratios naive/specialized,tiled/specialized,naive/tiled use this run only. Missing/failing data or resolution-limited/zero times suppress affected ratios; no historical denominator or negative-result tuning.

This changes workgroup shape, A loading and invalid-row work together, so it does not isolate one hardware cost. Reuse/barrier/parallelism/cache explanations remain hypotheses; no real DRAM, model speedup or Adreno benefit inferred. [Real shape review](docs/model_shape_recovery.md) verifies a submitted FP16/packed candidate but leaves global M/N/K UNKNOWN, with exact missing parameters and a bounded future capture proposal. No new model run/profiler expansion or real shape is added.

Computer checks: `node scripts/check_gemm003.mjs`, existing GEMM001/002 checks, JS syntax and localhost dependencies. CPU collective64-tail simulation, permutation/statistics/limits tests and complete fake-device120-pass controller tests cover full small-array export and resource cleanup; synthetic outputs are not phone evidence. Actual first run is **COMPLETE**; more controlled repetitions remain. Preserve the phone JSON under results/raw for review.


## Current A/B evidence round — new phone results NOT_RUN

Existing records are preserved. [Assignment/evidence/gap matrix](docs/requirements.md),[real shape review](docs/model_shape_recovery.md),[timestamp validity decision](docs/timestamp_validity.md). No prior complete logical model M/N/K is established. PROFILE003 overlap cause UNKNOWN: current model data cannot support exclusive op ranking or additive breakdown. Source/backend hypotheses are separate from phone observations. No new kernel/model/runtime optimization.

Run these once,in this order (A/B are independent):

1. **SHAPE001**: [http://localhost:8000/src/profiling/shape001.html](http://localhost:8000/src/profiling/shape001.html). Fill manual conditions,close other model/GPU pages,run one initialization/short fixed-prompt generation,stay foreground,download SHAPE001 JSON even if INCOMPLETE/error. Selected shader only; metadata/small-uniform queue-order versions,no whole-weight/activation readback,no timestamp. Observer COMPLETE is not shape proof; inspect parameterBytesStatus and submit-associated16-byte U.i0 payloads/texture/binding/constants,then review logical/padded/batch/head axes. Runtime/task device are closed after capture. This fills A's parameter-evidence gap,not GEMM performance or token metrics.
2. Close that page. **TIMING002**: [http://localhost:8000/src/benchmark/timestamp_control.html](http://localhost:8000/src/benchmark/timestamp_control.html). Fill conditions,run three independent vector-add dependency controls,download JSON. New unique queries,one-command-buffer/continuous-submit/serial-wait modes,final resolve/maps only. It tests whether observed overlap reproduces and how submission/wait conditions differ; it is not a model benchmark or automatic attribution fix. Actual state remains NOT_RUN.
3. **GEMM004 after shape review**,not yet runnable: [http://localhost:8000/src/benchmark/gemm004.html](http://localhost:8000/src/benchmark/gemm004.html). Current manifest is WAITING_FOR_SHAPE_EVIDENCE,shape null. Do not manually guess dimensions. Once documented proof activates the manifest,it uses original kernels at one reviewed logical shape,synthetic FP32 inputs,same thresholds/balanced10+30 protocol,independent outputs/full online checks and same-run ratios. Hardware-exceeding shape SKIPPED without shrinking. Small boundaries export full arrays. NOT_RUN until evidence and phone comparison.

Windows server/USB reverse (server only if port8000 is not already served):

```powershell
Set-Location C:\Projects\mobile-webgpu-gemm
python -m http.server 8000 --bind 127.0.0.1
```

In another PowerShell window:

```powershell
& 'C:\Tools\platform-tools\platform-tools\adb.exe' devices
& 'C:\Tools\platform-tools\platform-tools\adb.exe' reverse tcp:8000 tcp:8000
```

Use phone localhost URLs,not LAN IP. No Chrome flags changed automatically. Preserve downloaded original files in results/raw; no commit/push this round. Computer-only checks: `node scripts/check_shape_capture.mjs`, `node scripts/check_timestamp_control.mjs`,existing GEMM checks,syntax,offline replay and HTTP200. Fake-native values are in memory only and not phone results. Rebuild offline evidence with `python scripts/review_profile003_overlap.py` and `python scripts/build_part1_structure.py`.

## Original assignment

[Original problem statement](assignment/webgpu_adreno_assignment.pdf)

The supplied assignment is the source of requirements.
See [the evidence checklist](docs/requirements.md) for progress.


SHAPE001 first phone run was INCOMPLETE despite successful generation: the64KiB uniform guard missed a1MiB parameter arena. The bounded v2 collector fixes that coverage (no model/resource-usage change), remains NOT_RUN on phone. Reload http://localhost:8000/src/profiling/shape001.html with cache bypass, run one short generation and download the new JSON. Confirm shapeCapture.collectorRevision is SHAPE001-uniform-arena-v2. Original run archived unchanged; logical shape still UNKNOWN. See docs/model_shape_recovery.md.


SHAPE001 v2 phone result COMPLETE: three known U.i0 snapshots [512,8,384,0],zero loss/errors. No further identical rerun needed. Packed channel extents are established; unpadded logical axes remain UNKNOWN,so GEMM004 stays gated. Next independent phone control: http://localhost:8000/src/benchmark/timestamp_control.html (TIMING002); download the actual JSON. See docs/model_shape_recovery.md for evidence.


TIMING002 actual phone control COMPLETE (2026-10-05): same-command and continuous-submit each7/7 adjacent overlaps above65.536us; serial-wait0/7. All24 online output summaries PASS. Independent recomputation: python scripts/verify_timing002.py. Model timing causality remains UNKNOWN and additive per-kernel breakdown unsupported; see docs/timestamp_validity.md. No further identical TIMING002 rerun needed.


## Current GEMM004 execution-shape supplement (NOT_RUN)

Offline mathematical proof now enables M=8,K=1536,N=2048 as **EXECUTION_PADDED_ONLY**. Valid logical model shape and layer/batch/head semantics remain unknown;this does not satisfy original decodeM1/prefillM>=128 requirement. See [shape proof](docs/gemm004_shape_proof.md) and [original requirement audit/next tasks](docs/assignment_requirements_matrix.md). No new kernel algorithm.

From project root run `python -m http.server 8000 --bind 127.0.0.1`;in another PowerShell run `& "C:\Tools\platform-tools\platform-tools\adb.exe" reverse tcp:8000 tcp:8000`. Open http://localhost:8000/src/benchmark/gemm004.html?review=execution-v1 on phone Chrome. Confirm heading says execution/padded shape and M8/K1536/N2048;fill actual thermal/charging/DevTools/flag,run once in foreground,download JSON even if failure. Expected two variants naive/tiled,10 warmups and30 measured each,balanced15/15 order,full online checks and preserved timestamps. Device-limit rejection SKIPPED,no size shrink. No SHAPE001/TIMING002 rerun. Computer checks do not establish phone correctness/timing.


GEMM004 phone result COMPLETE:execution/paddedM8,K1536,N2048 syntheticFP32;naive/tiled medians3.604480/5.210112ms,same-run ratio0.691824,tiled slower. All correctness summaries PASS;small exported outputs independently replayed. See docs/experiment_log.md. This does not fulfill required quantizedFP16 A-D or real logical decode/prefill shapes. No repeat requested now.


## PART2AB — PART2-QROW-v1 (phone NOT_RUN)

Frozen contract: docs/part2_compute_contract.md. Original p2 A/B definitions and quantized→dequant→GEMM→FP16 accumulation distinguish this from historic FP32 supplements. Project synthetic unsignedQ4/Q8,row-packed u32,group32 along K,half scales/u32 zero points;CPU predecode B16 shared across naive A/shared-memory B,f16 inputs/accumulator,f32 carrier of half-valued output. Canonical half,high-precision and FP32 references;precision discriminator2048 vs2050 and frozen ordinary tolerances. C/D format defined only,NOT_IMPLEMENTED. RepresentativeM1/M128 K/N1024,not real logical layer shape. Separate explicit FP32 fallback does not validate required path. Kernel-only excludes CPU pack/unpack/dequant and all setup/readback/check;host full-run scope separately recorded,not a GPU unfused-D comparison.10warm/30measured paired15/15,serial single dispatch/query-safe readback,raw zeros/tails/grid retained. Part1 and Adreno/real-shape gaps unchanged. No commit/push.


Run Windows server from C:\Projects\mobile-webgpu-gemm: `python -m http.server 8000 --bind 127.0.0.1`;then `& "C:\Tools\platform-tools\platform-tools\adb.exe" reverse tcp:8000 tcp:8000`. Phone: http://localhost:8000/src/benchmark/part2_ab.html . Choose Q4 first,fill actual environment,click 运行规定 FP16 A/B,keep foreground and wait (CPU full reference may take tens of seconds or longer). Download PART2AB-FP16 JSON even if ERROR/UNSUPPORTED. Only use separate 运行独立 FP32 fallback deliberately;its export is labeled FP32_FALLBACK,not FP16 success. No GEMM004 rerun.


PART2AB Q4 FP16 actual result COMPLETE,2026-10-05:precision probe2048 on A/B,all correctness PASS;M1 A/B medians.983040/4.620288ms,M1287.667712/12.255232ms,B slower. Frozen contract unchanged. Reproduce python scripts/verify_part2_ab_result.py. Q8 phone NOT_RUN,C/D NOT_IMPLEMENTED;representative shapes/Mali are not final original-assignment completion. See docs/experiment_log.md.


## PART2ABC fixed vectorized C — phone NOT_RUN

Current addition supersedes earlier C NOT_IMPLEMENTED only at implementation status: [vectorized C method](docs/part2_vectorized_c.md). Original p2 tiled/vectorized C implemented with vec4<f16> B loads and four adjacent output columns/lane,WG8x8/output8x32/Ktile16/shared1280 bytes,two barriers and unchanged increasing scalar K component fma. Same Q4/FP16 PART2-QROW-v1 seeds/references/tolerances. C B16 is copied into padded N-to4 rows;CPU copy/time/host+GPU bytes exported,not hidden in kernel-only ratios. A/B source preserved;one shared controller/execute helper for prior AB/newABC.30 rounds with six permutations5 each,10warmups per variant,serial full output checks;negative result allowed. ExtraM9,K17,N35 edge case. D,Q8 phone experiments,sweep/independent repeats/real logical shapes/Adreno remain gaps;no model-profiler expansion. Page http://localhost:8000/src/benchmark/part2_abc.html ;run once Q4FP16 in foreground,download JSON. No commit/push.


PART2ABC Q4 FP16 actual run COMPLETE (2026-10-05),superseding NOT_RUN: all correctness summaries PASS;independent4425small outputs and timestamp/statistics/order verification PASS. Same-run A/C median ratios1.15625(M1),3.8125(M128);B/C4.59375,5.984375. See docs/experiment_log.md and results/analysis/part2_abc_verified.json. Q8,D,sweep/five independent repeats and real logical shapes/Adreno remain gaps.


## PART2ABCD Q4 fused D pilot — NOT_RUN

Original assignment p2 D is “Fused dequant + GEMM”. See docs/part2_fused_d.md (relative from repository root). New independent page src/benchmark/part2_abcd.html,stock Q4 FP16 A/B/C plus D using same C mapping/WG8x8/output8x32/Ktile16/shared1280bytes. D reads row-packed unsigned Q4,group32 scales/zp and performs signed-difference→f32 scale multiply→f16 conversion before increasing-K half fma. No full B16 input/intermediate for D;not packed FP16 unpack. Historical pages/shaders/raw preserved.

Question:compare prepared-input GPU pass and separately sampled resident-packed-to-completion wall. Setup:representative M1/M128,K=N1024,shared mathematical input/reference/thresholds;extremes and tails/probe included. Each scope10warmups/30measured per variant,24permutations plus six additions,position7/8 and pair precedence15/15. Kernel-only excludes ABC CPU decode/layout;complete-path samples actually redo ABC decode/C layout/upload each time;D uses resident packed inputs. Preallocated GPU resources/common A+packed+metadata uploads/reference/map/check excluded from complete wall;encoding,variant upload,outside-pass copies included. CPU+GPU times not added as GPU time;complete median not derived by adding medians. Static weights can prepare once/reuse;one-time costs separately exported.

Acceptance:all versions correct/nonfinite0/probe2048,raw samples/orders/limits/errors/metadata/source/hash and two scopes present;zero/tails retained;D has no B16 resource input;phone NOT_RUN. No claims about physical GPU residency,DRAM traffic,hardware vector instructions,model acceleration or Adreno performance. Q8,sweep,independent repeats,real valid model shapes and Part1 profiling gaps remain. No commit/push.

Phone: http://localhost:8000/src/benchmark/part2_abcd.html ;fill environment,run Q4FP16 A/B/C/D once in foreground,wait for both scopes,download PART2ABCD-FP16 JSON even on failure. Existing server/adb reverse instructions apply;no old experiment rerun.


PART2ABCD Q4 FP16 actual phone run COMPLETE,2026-10-05,superseding NOT_RUN:all correctness PASS,6116 small outputs independently checked,640 sampling records verified. D slower than C kernel-only atboth shapes;complete-path wall benefit includes avoiding repeated CPU dequant/layout/upload,not model/GPU speedup. See experiment_log and results/analysis/part2_abcd_verified.json. Q8,sweep,independent repeats,real logical shape and Adreno/Part1 gaps remain.


Archive interpretation: latest Q4 A-D M1 A/C median difference exactly65536ns=65.536us,one observed timestamp grid;no stable small benefit claimed. Large full outputs verified online;offline replay limited to small exported outputs and exported sample records. D complete-path advantage assumes repeating ABC CPU preprocessing/upload,not preprocessed-weight reuse or model acceleration. Assignment incomplete.


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


Sweep delivery connectivity:server HTTP200 for page/modules;final adb check has no connected devices/emulators. Reconnect USB/authorize debugging and redo reverse before phone execution. READY_FOR_PHONE,not COMPLETE;no phone benchmark automatically executed.


Latest actual sweep: COMPLETE_WITH_FAILURES (four generated D shader compilation failures); archived and independently verified. See docs/part2_sweep_results.md. Reserved WGSL identifier fixed; corrected frozen sweep awaits phone rerun at http://localhost:8000/src/benchmark/part2_sweep.html . No stable configuration selection or five-run acceptance yet.

Phone rerun must show visible implementation version quant-index-fix-1. Open http://localhost:8000/src/benchmark/part2_sweep.html?v=quant-index-fix-1 ; previous second record still compiled old `meta` source.

Latest evidence: PART2SWEEP-2026-10-06T06-07-34-319Z.json is COMPLETE and independently verified. Finite exploration accepted; five independent repetitions remain NOT_RUN. Earlier READY_FOR_PHONE and failed entries are historical states. See part2_sweep_results.md (in docs/) for full tables.
