# PROFILE001: fixed MediaPipe runtime observability

> 当前状态2026-10-06：此PROFILE001为早期能力审查。输入sizeInTokens和结构采集已由后续实验验证；当前剩余token/phase/trace结论见remaining_metrics_feasibility.md和trace001_availability.md，不能把初始建议当作新的运行要求。

Status: source audit and proposed measurement plan; no PROFILE001 phone benchmark or instrumentation run. Keep the successful Gemma 3n E2B Web model and @mediapipe/tasks-genai 0.10.29. No model/runtime algorithm, shader, tiling, precision or cache option is changed in this round.

## Evidence and provenance

Primary evidence is the actual local npm package, integrity-verified by `scripts/prepare_baseline_runtime.py`. [Runtime manifest](../src/baseline/runtime_manifest.json) records all staged file identities. Local files are intentionally ignored but can be recreated with that script.

| Evidence ID | Fixed local file / locator | SHA256 |
|---|---|---|
| T | `assets/vendor/tasks-genai/0.10.29/genai.d.ts` | `224edd06387553d5e193c9e0ecbd914c399106d9e57fb2b118543c53c8ec0991` |
| J | `assets/vendor/tasks-genai/0.10.29/genai_bundle.mjs` | `73bae6514adb91eeeb03a92968f5e97dd0d690b54aed8fbf3cea1651cdc5f50d` |
| W | `assets/vendor/tasks-genai/0.10.29/wasm/genai_wasm_internal.js` | `dd02fb217a4aed569e504444eda9a1972a80c8017c96e4000687782690eed927` |
| B | `assets/vendor/tasks-genai/0.10.29/wasm/genai_wasm_internal.wasm` | `87a7324d0e26e1c1d880ba9a1c9864c8b17192c5d9db996cdf3bfaeb217f5483` |

J is minified: offsets below are zero-based character offsets in the UTF-8-decoded original, not byte offsets or generated prettified lines. Reproduce with Python `text.find(marker)`. Its npm source map contains one already-compiled `genai_js.js` source, not the original TypeScript; it does not establish a package-to-Git-commit mapping.

Auxiliary official source was retrieved at immutable commit `04a9f7634b2800046a477fe60e26edceaa8a8849`: [llm_inference.ts](https://github.com/google-ai-edge/mediapipe/blob/04a9f7634b2800046a477fe60e26edceaa8a8849/mediapipe/tasks/web/genai/llm_inference/llm_inference.ts), [graph_runner_llm_inference_lib.ts](https://github.com/google-ai-edge/mediapipe/blob/04a9f7634b2800046a477fe60e26edceaa8a8849/mediapipe/web/graph_runner/graph_runner_llm_inference_lib.ts), [model_loading_utils.ts](https://github.com/google-ai-edge/mediapipe/blob/04a9f7634b2800046a477fe60e26edceaa8a8849/mediapipe/tasks/web/genai/llm_inference/model_loading_utils.ts). This commit is auxiliary, not claimed to be the exact npm build commit. Conclusions about the installed runtime are cross-checked against J/T/W. Uninspected native WASM implementation details stay UNKNOWN.

## Token observability

- **Runtime tokenizer input count: public API available; not yet measured on the phone.** T lines 291-300 defines synchronous `sizeInTokens(query): number | undefined`, forbidden during active generation. Count the complete templated text string, including special turn markers, only after initialization and while idle; reject undefined/non-integer/error results. This is the runtime's tokenization count, not a character estimate. Whether additional internal BOS/control tokens alter actual prefill tensor length still needs validation.
- J's public `An.prototype.sizeInTokens=An.prototype.S` selects two paths. The text graph path (offset 57573) submits `token_cost_in` and reads the graph's `token_cost_out`; the alternate engine path calls `_GetSizeInTokens` (offset 43195), which W exports at line 8612. The model-associated tokenizer is available for counting; there is no public tokenizer object, vocabulary export, encode-to-IDs or decode-from-IDs API in T.
- **Actual generated token IDs/count: no public API.** T lines 200-289 returns strings/string arrays; the progress listener accepts only text and done. J's graph construction exposes the internal `DECODED_IDS:__stream_3` stream (offset 49316) before detokenization, but not through the public LlmInference interface. An internal stream name is not proof of a supported attachable per-token hook or a one-ID-per-event contract. Access would require a separately reviewed narrow graph/native hook, verified for this exact model path, recording IDs, EOS inclusion and event boundaries. This round does not add it.
- **Single-step decode/per-token events: absent from the public API.** `cancelProcessing()` is cancellation, not stepping. W's `JsProgressListener` at line 8400 forwards decoded text and done, without IDs or a token timestamp. Retokenizing the final string is only a new tokenization of that string; it is not the original generation sequence/count. Callback count is not generated-token count.

## Prefill, decode and cache boundaries

Public `generateResponse()` covers prompt processing and generation together. No public prefill-only call, decode-step call, GPU phase boundary or resetSession/resetKV API appears in T. First callback wall time includes processing, sampling, detokenization, runtime/JS scheduling and callback delivery; it cannot identify pure prefill. Generation-request wall time and callback event times are observable but are not the requested pure phase/per-token metrics.

Model-path distinction matters: J around offsets 53950-55590 recognizes LITERTLM (format 2), extracts its Web model offset, and sets `this.v` (engine path) only for converted format 1 or enabled image/audio modalities. With this experiment's non-converted `.litertlm`, maxNumImages=0 and supportAudio=false, static code indicates the **text calculator-graph path**. This is a code-path inference, not proof of every native backend/kernel used; actual internal backend remains UNKNOWN. The auxiliary model-loading source enum and `llm_inference.ts` lines 450-510 agree.

Do not transfer session conclusions from another path: J offset 41613 / auxiliary graph-runner lines 316-470 creates `MakeSessionForPredict`, calls `PredictSession`, then frees text-only sessions in the alternate engine path; image/audio keepalive differs. That does not prove the current text-graph run has no cross-request prefix reuse. In the text graph, T lines 439-444 describes `disableRewinding`; J handles it near offset 56642 and builds the graph with prefix-caching/ringbuffer options. Auxiliary `llm_inference.ts` around line 1372 explains those choices. Prefix-cache functionality exists, but how many tokens are actually reused across repeated calls in this model is UNKNOWN without native/graph evidence. `setOptions()` can rebuild/reinitialize internals and is not a documented lightweight KV reset.

For future independent uncached requests, the public conservative policy is `close()` and create a fresh task before each measured request, keeping model initialization outside generation metrics and documenting device/compiler/file caches separately. Do not flip disableRewinding to obtain a convenient baseline: it changes cache policy. Verify fresh-task cache isolation before interpreting prefill. Existing BASELINE001 already permitted one generation per initialization.

The next full-prompt sets must be validated by `sizeInTokens(fullPrompt)` as 128, 512 and 1024, with exact strings/hashes and tokenizer/model identity recorded. Input tensor/control-token accounting is still a gap. maxTokens=512 currently means input + output capacity: it cannot handle a 1024-token prompt and leaves no output headroom for a 512-token prompt. A proposed future capacity is 2048, subject to actual runtime/model/device acceptance and an explicitly chosen output reserve/EOS policy. Capacity is not an output-token limit. No configuration or benchmark has been changed/launched in this round. At least five independent runs and genuine phase/token boundaries are still needed for assignment metrics.

## WebGPU observability and minimal timestamp device

The successful BASELINE001 runtime device had shader-f16 and subgroups but not timestamp-query. Adapter support alone is insufficient; device features are fixed at creation. J's `async function wn()` (offset 46081; exported as createWebGpuDevice) requests a high-performance adapter, shader-f16 and supported subgroups, plus adapter maxima for maxBufferSize, maxStorageBufferBindingSize and maxStorageBuffersPerShaderStage. It does **not** request timestamp-query. T lines 535-550 allows a supplied device in `baseOptions.gpuOptions.device`; J forwards it into `preinitializedWebGPUDevice` (offset 45445), and W line 6578 imports that very native device.

Recommended next timestamp route: outside the bundle, reproduce the stock helper's adapter preference, supported original features and its three required limits, add only timestamp-query, request that compatible device, and pass it through the public gpuOptions.device entry. Record actual features/limits and adapter info; fail as UNSUPPORTED rather than silently dropping timestamps. Preserve stock shader-f16/subgroups behavior and all generation options; do not fall back to default WebGPU limits (BASELINE001 needed the larger buffer/binding limits). Probe correctness/output against the uninstrumented control. This alters observability/device capabilities, not model math; compatibility and instrumentation overhead remain to be tested on the phone.

Alternatives: a reviewed tiny helper change could add timestamp-query, but would produce a modified runtime artifact requiring new hashes/provenance; a narrowly scoped requestDevice wrapper could augment the stock descriptor, but affects platform APIs and is less explicit. Neither is necessary given public device injection. timestamp-query cannot be added to an existing device, and a separate timestamp-capable probe device cannot time work submitted on the runtime device. No helper/bundle/device behavior is modified here.

| Observation | Fixed-loader evidence | Proposed boundary and remaining gap |
|---|---|---|
| Shader identity | W `_emwgpuDeviceCreateShaderModule`, line 6709; native createShaderModule line 6727 | Record module ID, original label and WGSL source/hash. Shader identity is not yet an op/layer classification. |
| Pipeline identity | W async creation line 6691; `_wgpuDeviceCreateComputePipeline` line 8031; makeComputePipelineDesc line 6284 | Record sync/async creation, actual resolved native pipeline ID, module/entryPoint/constants; preserve Promise/error behavior. |
| Compute pass | W `_wgpuCommandEncoderBeginComputePass`, line 7793; makePassTimestampWrites line 6253 | Record encoder/pass IDs, begin/end, setPipeline/bindGroup transitions; optional pass-level timestampWrites later. |
| Direct dispatch | W `_wgpuComputePassEncoderDispatchWorkgroups`, line 7863; setPipeline line 7889 | Record pipeline/pass ID, x/y/z and encode order. Counts per request are accessible in principle; per-token attribution is not. |
| Indirect dispatch | No DispatchWorkgroupsIndirect bridge string found in this fixed SIMD loader | Include dispatchWorkgroupsIndirect in the observer capability check. If used, record argument buffer ID/offset; dimensions stay UNKNOWN unless separately read. Absence of this bridge does not prove every possible runtime path has zero indirect dispatches. |
| Encoder finish / submit | W finish line 7842; native queue.submit line 8134 | Map encoder to command-buffer IDs and submission order. Encoding time is not execution time. One submit may contain several command buffers/passes. |
| GPUBuffer lifetime | W createBuffer line 6657/6671; destroy line 6587/6597; `_emwgpuDelete` line 6652 | Record requested/actual logical size, usage, creation and explicit destroy. Native registry release/GC is not always an explicit destroy; physical reclamation time is UNKNOWN. |

Use an **opt-in separate PROFILE001 harness**, leaving existing run pages intact. Start with count-only metadata on the stock native device: wrap its methods and methods of returned encoders/passes/queue/buffers using saved originals with correct native receivers. Preserve native object identity, original arguments, return values and Promise semantics; avoid proxies that break WebGPU branding. Whether own-method shadowing is accepted by the actual Chrome/native path is UNKNOWN until a small smoke test. If wrapping fails or coverage is incomplete, export that fact, not synthetic counts. Use weak identity maps and do not retain native buffers merely for logging. Install before model initialization; label setup vs request work and observer allocations separately.

Only after count-only coverage succeeds, add compatible-device timestamps at pass boundaries. Preserve any original timestampWrites; never overwrite it silently. Associate query slots with encoder/pass IDs; append resolve/copy outside passes before native finish, preserve original dispatch/bind/pipeline order, and read queries asynchronously after their submission completes. Do not await/map between runtime dispatches or serialize its submissions. Preallocate a bounded query/readback pool, avoid reusing in-flight slots, and mark overflow/uncovered passes rather than dropping evidence. Record zero, negative/invalid, unresolved and overflow cases explicitly. Use BigUint64Array/BigInt and decimal endpoint strings as TIMING001 does. Instrumentation buffer bytes and resolve work must be separated from runtime buffers/work. A timestamp-enabled compatibility test is distinct from a scored baseline.

**Attribution limit:** a pass may contain several dispatches/pipelines. Its timestamp duration is pass time, potentially including scheduling/dependencies; it cannot be distributed among dispatches or divided into standalone kernel latency. Even a one-dispatch pass is an isolated pass interval, not a pure hardware-kernel duration. Standard pass-boundary timestampWrites provides no general per-dispatch timing inside a multi-dispatch pass. Splitting passes changes scheduling and measurement scope; do not do it silently. Actual dispatch count per token and per-kernel op timing remain UNKNOWN/NOT_MEASURED until genuine token boundaries and an appropriate isolation method are available. Shader/source provenance is also needed before attaching GEMM/dequant/layer labels. Do not infer launch overhead from wall time minus GPU sum.

## Memory channels

| Channel | What can be collected | What it cannot establish |
|---|---|---|
| Logical GPUBuffer bytes | Wrap actual runtime device createBuffer, read size/usage, track explicit destroy and allocation failures; separate observer buffers | buffer.size sum is not physical GPU resident memory. Native releases/GC and pending submissions make exact live/reclamation accounting incomplete unless instrumented. Report created bytes, explicit-destroy bytes and an outstanding logical estimate with coverage. |
| Actual GPU residency | UNKNOWN through these public WebGPU/MediaPipe APIs; driver/profiler evidence might add a channel | Neither allocation descriptors, model bytes nor process Graphics buckets prove model-only resident VRAM/DRAM. No fabricated GPU memory figure. |
| JS heap | Feature-probe performance.memory (non-standard reported JS heap) or Chrome remote DevTools heap tools; record method/scope and overhead | Not GPU residency, not RSS, and not necessarily all WASM/ArrayBuffer/native backing stores. |
| Page-specific memory | Feature-probe measureUserAgentSpecificMemory and permissions/isolation, catch failures | BASELINE001 recorded crossOriginIsolated=false; this does not provide an existing measured value. Even if available later, page memory is not GPU-only memory. No automatic server-header change this round. |
| Android Chrome processes | adb process inventory + dumpsys meminfo per PID for RSS/PSS, with command/time/roles and raw output | Chrome browser/renderer/GPU/utility processes must be distinguished. Shared pages make summed RSS double-count; do not sum RSS and PSS or add them to GPUBuffer/JS figures. Process GPU/Graphics fields are not clean model-only residency. |

Proposed read-only PowerShell commands (not executed as a memory experiment this round):

```powershell
& 'C:\Tools\platform-tools\platform-tools\adb.exe' shell ps -A -o PID,PPID,NAME,ARGS
& 'C:\Tools\platform-tools\platform-tools\adb.exe' shell dumpsys meminfo -d PID
```

Replace PID with each identified Chrome process, including child/isolated renderer and GPU roles; package name alone may not cover them all. Resolve role mapping with available Chrome/Perfetto process metadata and preserve UNKNOWN where ambiguous. Record pre-load, initialized-idle, generation and post-close snapshots with the same PID set or explain changes. Proc smaps access can be restricted; report UNAVAILABLE rather than bypass permissions. See [Android dumpsys memory documentation](https://developer.android.com/tools/dumpsys#meminfo) and [Chrome heap tooling](https://developer.chrome.com/docs/devtools/memory). The model's 3,038,117,888-byte disk file is an identity/storage fact, never runtime memory.

## Assignment metric coverage

“Available in principle” below means a plan/code-level capability, not a measured phone result. Existing NOT_MEASURED values remain unchanged.

| Assignment metric | Currently measurable? | Evidence | Gap | Minimum next step |
|---|---|---|---|---|
| Gemma E2B runs on existing stack | Yes, runnability accepted | BASELINE001 COMPLETE, no errors, nonempty response | Not numeric correctness or Adreno final acceptance | Preserve unmodified model/runtime control |
| Actual full-prompt input count | Public tokenizer count available; actual prefill tensor count UNKNOWN | T sizeInTokens; J token_cost_in/out | Phone API check, template/BOS accounting | Count complete prompt while idle; export exact prompt/hash/count |
| Decode tokens/s, median/p95, >=5 runs | No defensible value yet | T returns text, no generated IDs/count | True generated count + decode interval/EOS policy | Targeted graph/native boundary hook, then independent runs |
| Pure prefill at 128/512/1024 tokens | No public separated timer | generateResponse combined path | Phase boundaries, verified prompts, >1024 total capacity | First validate full-prompt count; propose maxTokens=2048; defer full benchmark |
| Per-token decode distribution | No public token event/step | Text progress listener; internal DECODED_IDS | True token IDs and timestamps | Narrow audited internal hook; never reuse callback intervals |
| GPU buffers / JS heap / RSS | Logical/device metadata plan; other channels conditional | W native buffer bridge, heap APIs, adb | Instrument coverage, GC/release, process roles | Count-only buffer trace + feature probes + per-PID snapshots |
| Actual GPU resident memory | UNKNOWN/not exposed by reviewed APIs | No residency API in T/WebGPU boundary | Driver/profiler visibility | Report unavailable unless independently sourced |
| Dispatch count per token | Per-request count feasible; per-token UNKNOWN | W direct dispatch bridge | Real token boundaries; indirect coverage | Native-device count-only observer before initialization |
| Individual kernel/op GPU timing | Pass-level feasible with new compatible timestamp device; general per-dispatch no | helper lacks timestamp; W pass/submit bridge | Multi-dispatch attribution, op labels, grid/overhead | First one instrumented pilot; label only pass intervals |
| Stacked time breakdown | Partial scopes only; not produced | Request wall events; proposed pass intervals | CPU/native phases, token link, overlap/denominator | Declare request-wall vs GPU denominator; leave residual unclassified |
| Top bottleneck classification | No | No isolated op timings/counters/calibration | Discriminating evidence | Defer; do not turn residuals into launch overhead or grid into bandwidth |
| Device/driver/thermal methodology | Partial evidence | BASELINE/TIMING exports, screenshots | Runtime backend, temperature, process/counter data | Record UNKNOWNs and session conditions; retain background events |

## Recommended smallest next experiment

1. Separate PROFILE001 pilot using the same pinned runtime/model/prompt/options; no bundle changes. After initialization and before generation, call sizeInTokens on the complete prompt and export its result/error. Keep generation tokens/s and per-token metrics NOT_MEASURED.
2. Count-only native-device observer on the stock device during one request: validate method coverage, shader/pipeline/pass/dispatch/submit association and logical buffer accounting. Compare completion/output/errors to the existing control; do not run a six-size/full prompt sweep.
3. If that pilot succeeds, use a second clearly labeled timestamp-enabled compatible device with only the timestamp feature added and bounded pass-level queries. Validate unchanged math/output and observer overhead against count-only/uninstrumented controls. Keep multi-dispatch, granularity, cache and attribution limitations explicit.

These are reviewable next actions, not implementations executed in PROFILE001. Full assignment profiling still requires native/token boundary evidence and suitable repeated-run protocols.
