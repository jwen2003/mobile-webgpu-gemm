# Model-session collection method

BASELINE002 provides five independent sessions for each assignment input length, 128/512/1024. Length means the actual tokenizer count after including the full template.

Use stock @mediapipe/tasks-genai@0.10.29 and the authorized Web model. sizeInTokens(fullPrompt) checks the complete input. The template/body count difference is 8, but does not prove internal BOS or prefill tensor length. Body counts are 120/504/1016. Prompt preparation and TOKEN_COUNT drain are separate from generation.

maxTokens=2048 is total input-plus-output capacity, not output token count. Settings are topK=40, temperature=0.8, randomSeed=101, numResponses=1, text only, no images/audio. Each fresh task generates once, with zero generation warm-ups. System/browser/driver caches are not reset. Initialization and token preparation are recorded separately. disableRewinding retains the unoverridden runtime default. Fresh tasks are an operational policy, not proof of native KV/prefix-cache isolation.

The frozen session order is 128,512,1024,512,1024,128,1024,128,512,128,1024,512,512,128,1024. Record runtime preparation, initialization, token preparation and drain, generation call-to-completion, first callback, and post-generation drain. A callback can contain multiple tokens; the first callback is not pure prefill.

## Read next

- [BASELINE002: fifteen model-session results](baseline_sessions_results.md)
- [Local model and runtime preparation](model_preparation.md)
- [Reproduction and offline verification](reproduction.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/baseline_sessions_plan.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)
