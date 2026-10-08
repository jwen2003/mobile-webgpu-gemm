# Observability of the fixed runtime

This review examines genai.d.ts, the bundle, loader, and official source for fixed version 0.10.29, separating public APIs from internal leads.

sizeInTokens counts input, not actual generated IDs/counts. Text callbacks from generateResponse are not per-token events. Retokenizing output does not recover the generation-time token sequence. The public interface does not expose trustworthy separate prefill/decode timing boundaries. The earlier maxTokens=512 capacity could not cover 1024 input tokens; BASELINE002 uses total capacity 2048.

PROFILE002 installs restorable count instrumentation before initialization, preserving native this, arguments, returns, and exceptions. Records are partitioned into MODEL_INIT, TOKEN_COUNT, GENERATION, and POST_GENERATION. Encoded dispatches are distinct from dispatches in submitted command buffers. Buffer lifecycle accounting tracks logical allocation; destroy does not prove physical release.

PROFILE003 injects a compatible device with timestamp-query without overwriting existing timestampWrites. Successful readback does not establish additive pass intervals. After TIMING002 independently reproduced overlap, model kernel-time attribution was classified as unavailable. Source identities and historical review references remain in the original snapshots and analysis files.

## Read next

- [PROFILE002 shader structure analysis](profile002_shader_analysis.md)
- [Remaining-metric feasibility review](remaining_metrics_feasibility.md)
- [Timestamp validity and bounded conclusion](timestamp_validity.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/profiling_capabilities.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

## Auditable fixed-version entry points

[runtime_manifest.json](../../src/baseline/runtime_manifest.json)

|Entry|Locator in 0.10.29|Measurement scope|
|---|---|---|
|sizeInTokens|genai.d.ts L291–300; bundle offsets57573/43195|Full-input count,not generated sequence|
|generateResponse|genai.d.ts L200–289; JsProgressListener loader L8400|Text/done callbacks,not token events|
|DECODED_IDS|bundle offset49316|Internal lead,no validated public hook|
|gpuOptions.device|genai.d.ts L535–550; bundle offset45445|Public device injection,not an algorithm change|
|createWebGpuDevice|bundle offset46081|Stock helper requests f16/supported subgroups and three buffer limits,not timestamp-query|

Bundle offsets are character offsets in the fixed UTF-8-decoded text,not byte offsets. Auxiliary official commit 04a9f7634b2800046a477fe60e26edceaa8a8849 is not a proven npm build commit; the native backend remains unknown.

[Official auxiliary llm_inference.ts](https://github.com/google-ai-edge/mediapipe/blob/04a9f7634b2800046a477fe60e26edceaa8a8849/mediapipe/tasks/web/genai/llm_inference/llm_inference.ts)
