# BASELINE002 — exact-length first-generation model sessions

Status: **READY_FOR_PHONE / NOT_RUN**. No phone results exist for this protocol. Preserve BASELINE001/PROFILE and all historical evidence; no runtime/model algorithm changes, no timestamp-query pilot.

## Original requirements directly re-read

Source: `assignment/webgpu_adreno_assignment.pdf`, page 1, SHA256 `dc02d42a5fdf521b75794ac641478cfe91ec7d9e165fa93a1c2e43b3ec63e9c3`.

- “Run each metric at least 5 times and report the median and p95.”
- Prefill latency notes: “Fixed prompts of 128, 512, and 1024 tokens”.
- Memory usage notes list GPU buffers, JS heap and device RSS.
- Target remains Snapdragon/Adreno and Chrome Android; model Gemma E2B. Current Mali evidence is interim.

The original asks for pure prefill, decode/token, true output-token throughput and kernel attribution. This round cannot replace those with combination request wall metrics. It prepares the prescribed prompt lengths and five independent sessions per length, reporting only observed boundaries and memory scope.

## Fixed protocol

Runtime: unchanged local `@mediapipe/tasks-genai@0.10.29`; JS/WASM same pinned version. Model: existing `gemma-3n-E2B-it-int4-Web.litertlm`, manifest SHA256 `b6c8e1081ec80730f14473a5ece941b48da5d8e2a80c97c2963da153f3eff3d2`; disk size is identity, not memory. Browser checks served length against manifest; does not rehash 3 GB. Model source revision remains only the recorded manifest, not newly invented.

Total capacity requested **maxTokens=2048**, replacing BASELINE001's 512 solely for these longer inputs; this is input+output capacity, not a requested generation-token count. No capacity fallback after a failure. Actual initialization compatibility on the target remains to be verified. Other options: topK=40, temperature=0.8, randomSeed=101, numResponses=1, maxNumImages=0, supportAudio=false; no LoRA, forceF32 or disableRewinding override. The local `genai.d.ts` lines 391–444 document these options; `sizeInTokens` at 290–300 runs synchronous tokenization and can return undefined. The stock default allows rewinding/shared-prefix reuse; we do not change it or claim cache disabled.

One freshly loaded page/task/device, one generation per session. **Zero generation warm-up**: intentionally capture the first generation after tokenizer setup, including first-use compilation/allocation/cache effects. No previous generation/KV reuse is requested. New task/device does not reset browser HTTP cache, OS file cache, GPU driver cache or thermal state; those remain uncontrolled/UNKNOWN. Tokenizer setup warms tokenization and may allocate resources, separately timed and drained before generation. No inherited conversation object is reused.

Template: `<start_of_turn>user\n` + deterministic context/body + `<end_of_turn>\n<start_of_turn>model\n`. Body asks the same BASELINE001 question: Explain in two short sentences what matrix multiplication computes. Repeated ` data` filler is deterministic and instructed to be ignored. Its artificial structure is documented, not presented as diverse natural prompts. The same exact string/hash per length is required across sessions; prompt construction and all counts are exported.

Use actual model `sizeInTokens(fullPrompt)` **after initialization and before generation**. A bounded search (at most 220 distinct candidates plus three final counts) selects a full string whose tokenizer return equals 128/512/1024 exactly. Binary-search guesses are only hints; local enumeration and final verification are mandatory. Undefined, mismatch or exhausted budget fails the attempt; do not count characters, infer length or silently round. Also count body and template-only strings. Template is included in the target; full-minus-body is an observed difference, not a fixed special-token contribution. Runtime-inserted BOS/EOS or actual internal prefill tensor length remain UNKNOWN. Do not tokenize output to invent generated count.

The selected model prompt/hash is exported, not pregenerated with a different tokenizer. Offline verification checks recorded counts and deterministic string construction but cannot independently rerun the model tokenizer without the model/runtime; this limitation is explicit.

## Frozen schedule and conditions

Fifteen pages/sessions in this order; each length appears five times:

| Ordinal | Full tokens | Repetition within length |
|---:|---:|---:|
| 1 | 128 | 1 |
| 2 | 512 | 1 |
| 3 | 1024 | 1 |
| 4 | 512 | 2 |
| 5 | 1024 | 2 |
| 6 | 128 | 2 |
| 7 | 1024 | 3 |
| 8 | 128 | 3 |
| 9 | 512 | 3 |
| 10 | 128 | 4 |
| 11 | 1024 | 4 |
| 12 | 512 | 4 |
| 13 | 512 | 5 |
| 14 | 128 | 5 |
| 15 | 1024 | 5 |

Page lifetime permits one attempt and has a new UUID. After download, reload for next ordinal; create a new task/device, do not partition a single generation into five datasets. Use a fixed practical pause, chosen before the campaign, between sessions; record it with actual thermal state. Keep foreground/charging/background-app/DevTools/flag conditions consistent, export self-reported changes and visibility transitions. UNKNOWN is valid; touch is not a temperature measurement. Background events remain in evidence, not silently rejected or replaced.

Retain all failed/interrupted attempts; no favorable-run selection, no automatic retries, no capacity/prompt substitutions. On failure export the record and review before continuing. Cancel only requests stock `cancelProcessing`; initialization/prefill may not stop immediately (`genai.d.ts` comment at 301). Progress JSON may be downloaded while stalled; abrupt browser termination can prevent export, report a missing attempt rather than invent data. No commit/push until actual evidence passes review.

## Measured wall boundaries

All wall boundaries use monotonic `performance.now()`; ISO times are session identity, not durations.

| Field | Start → end | Limit |
|---|---|---|
| runtimePreparationMs | local manifest/import/fileset → selected WASM HEAD checks | resolver checks only; actual WASM initialization belongs below |
| modelInitializationMs | before stock createWebGpuDevice → createFromOptions resolves | includes helper, resource observer install, WASM/model fetch/native init; not GPU kernel time |
| tokenPreparationMs | before prompt search → final tokenizer counts | search/three final counts/UI yields, not generation |
| tokenPreparationDrainMs | queue.onSubmittedWorkDone call → resolves after tokenizer prep | waits work on actual runtime queue only |
| generationCallToCompletionMs | immediately before generateResponse → promise resolution | combined request, not isolated prefill/decode/GPU time |
| firstCallbackMs | request start → first actual callback, even empty/done | not pure prefill or guaranteed first token |
| postGenerationDrainMs | after generation completion snapshot → onSubmittedWorkDone resolves | separate drain, not added to generation completion boundary |

All callback fragments, done flags and request-relative wall values are exported, capped at 10,000; drops mark failure/incomplete. Callbacks are text chunks, not per-token events; no per-callback UI refresh or console logging. Output returned string and stream reconstruction retained. Require nonempty output, promise resolved, done callback and successful queue drain for COMPLETE. Uncaptured validation/device-lost and public request/tokenizer failures are retained; runtime-owned validation scopes are not intercepted.

UNAVAILABLE: true generated-token IDs/count, tokens/s, phase-specific prefill/decode/per-token distribution, GPU kernel time, dispatch/token, physical GPU memory and device RSS this round. They are not closed by successful combined wall collection. WASM/native memory and backend execution identity are not guessed.

## Memory channels and observer scope

No new pass/shader/dispatch observer, no command-stream trace or timing diagnostic. `session_memory.mjs` reuses existing CountObserver's native wrapping/restoration utility for **only createBuffer/createTexture and explicit resource.destroy** on the actual stock device, installed before task initialization. Original native receivers, arguments, returns and exceptions are preserved. Metadata cap 100,000; wrapper/restore failures and drops are reported. CPU observer overhead is included in wall metrics; no profiler GPU resources are allocated. This is an observed baseline, not a proven zero-overhead stock control.

- Buffers: native buffer.size logical bytes; created, explicitly destroyed, outstanding and observed peak. GC, registry deletion and implicit device.destroy do not synthesize individual destroy events, so outstanding recorded bytes after cleanup are not physical retention claims.
- Textures: separately report known-format logical uncompressed texel payload, including mip levels, array/3D extent and sample count; limited explicit format table. Unknown formats retain descriptors/counts with total bytes unavailable. Format payload excludes driver alignment/tiling/metadata/compression; not actual allocation/residency. Report known subtotal as such, never claim an unknown-format total is zero.
- JS heap: feature-probe nonstandard `performance.memory`, usedJSHeapSize/totalJSHeapSize/jsHeapSizeLimit with stage snapshots. May be absent, rounded or shared; not all WASM/native backing memory, not GPU or RSS. Sparse snapshots are not a true continuous peak. No forced GC or DevTools flags/headers changed.
- Device RSS/PSS: unavailable this round, existing adb collection remains an explicit assignment gap. These channels are not added together or replaced by model file size.

Snapshot stages include before runtime, before/after initialization, after tokenizer prep, before/first-callback/after generation, after drain and cleanup. Resource lifecycle sequences support independent recomputation of recorded logical peaks. Unknown coverage remains incomplete; do not fill gaps with estimates.

## Desktop checks, phone entry and audit

Phone URL: `http://localhost:8000/src/baseline/sessions.html?v=baseline-session-v1` (visible baseline-session-v1).

From project root, if server stopped: `python -m http.server 8000 --bind 127.0.0.1`.

USB mapping: `& "C:\Tools\platform-tools\platform-tools\adb.exe" reverse tcp:8000 tcp:8000`.

Select ordinal, enter actual conditions, run, remain foreground, download independent JSON. Reload and select next ordinal. Each attempt is one model initialization, at most 223 tokenizer calls and one generation; no performance-pass loop. Fifteen large model initializations can take substantially longer than GEMM repeats; local caching/initialization times are observed rather than promised. Try ordinal 1 first and review any failure before proceeding; no automatic 15-run loop.

`node scripts/check_baseline_sessions.mjs` is CPU MOCK testing only (search gating, resource/native semantics, correct generation/drain boundaries, one attempt/page, error and heap-unavailable paths). It does not validate the model tokenizer, long capacity or mobile GPU.

After receiving evidence, run `python scripts/verify_baseline_sessions.py FILE1.json ... FILE15.json`. Raw bytes are retained including failures/progress records; hashes and per-session audits separate. Auditor reconstructs prompt text/hash, checks actual recorded count evidence, replays resource logical lifecycles, recomputes wall intervals from monotonic events and median/nearest-rank p95/min/max grouped by input length. It verifies unique UUIDs/ordinals and identical prompt hash per length; no favorable duplicate replacement or pooled unrelated metrics. With five samples, nearest-rank p95 equals maximum: weak tail evidence. Report all per-session values, changes, visibility/conditions and unavailable memory channels. Update report/requirements from actual results and commit/push this experiment separately only after review.

Official references: [MediaPipe Web guide](https://developers.google.com/edge/mediapipe/solutions/genai/llm_inference/web_js), [WebGPU texture-format specification](https://www.w3.org/TR/webgpu/#texture-formats). For this pinned runtime local d.ts/bundle and manifests take precedence over evolving guide examples; no migration or new runtime is introduced.

Latest BASELINE002 acceptance:FIFTEEN_SESSIONS_VERIFIED,exact128/512/1024 full prompts and5 independent COMPLETE/audited sessions each. Earlier NOT_RUN/partial states are historical. Observable walls/scoped memory repeats accepted;purephase/true outputtokens/deviceRSS/physical GPU memory/Adreno remain unavailable. Final results:docs/baseline_sessions_results.md;Work summary:docs/baseline002_work_summary.md (root-relative).
