# Experiment log

## ENV001 Environment check on 2026 10 03

Question: Does the development phone expose WebGPU and run the timestamp sample?

Evidence: Device and Chrome screenshots confirm the environment in environment.md. Chrome reports WebGPU hardware acceleration and Vulkan enabled. User opened https://webgpu.github.io/webgpu-samples/?sample=timestampQuery and observed animation and a changing, nonzero render-pass duration.

Interpretation: Basic WebGPU sample execution is supported by observation. Timestamp capability is preliminarily supported by the sample output; actual adapter feature export and compute timing remain to be verified. No LLM or GEMM result exists. Performance variation has not been attributed to a cause.

Next: establish local development/debugging, export adapter features and limits, execute vector addition and compare every output against a CPU reference.

## Open decisions

- Final Adreno access and whether Mali interim development is accepted.
- What baseline GEMM the requested speedup must beat: naive A, runtime kernel, or both.
- Deadline and preferred update cadence.
- Supported Gemma E2B stack; closest Gemma fallback if required, with evidence.
- Exact Q4/Q8 formats and FP16 accumulation interpretation/fallback.
- Per-dispatch instrumentation feasibility in the selected runtime.
