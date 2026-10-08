# Stage delivery report: partially complete

The assignment and both Parts remain PARTIAL. On Mali, evidence covers five stock-model sessions at each of three full-input lengths and a bounded sweep plus five independent repeats of synthetic QROW FP16 A–D. Adreno is untested and effective logical model-layer shapes are unconfirmed. No model acceleration is claimed.

[Original assignment](../../assignment/webgpu_adreno_assignment.pdf) · [Requirement-by-requirement scope](../../docs/en/assignment_requirements_matrix.md)

## Part 1: what is observable

sizeInTokens(fullPrompt) verified 128/512/1024 including the template, with five independent fresh tasks per length. maxTokens=2048 is total capacity and generation warm-up is zero. Initialization, generation call-to-completion, first callback, and GPU drain are separate. First callback is not pure prefill, and a callback is not a token.

|tokens|init median ms|init p95 ms|generation median ms|generation p95 ms|first callback median ms|first callback p95 ms|drain median ms|drain p95 ms|
|---|---|---|---|---|---|---|---|---|
|128|88482.000|91773.400|7963.100|8096.300|2290.500|2321.100|100.900|107.400|
|512|91549.000|92280.600|13581.000|13661.900|7675.700|7721.300|98.300|106.800|
|1024|92673.300|93478.200|20166.600|20245.900|14834.200|14928.300|94.800|101.600|

The main table displays 0.001 ms precision; complete values remain in shared data and the appendix. Display digits are not a claim of measurement accuracy.

![BASELINE002](../figures/model_combined_wall.svg)

This plots observable combined wall time, not an additive GPU stacked breakdown. Actual output tokens, tokens/s, pure prefill/decode, dispatch/token, and trustworthy kernel times remain interface/evidence-limited. PROFILE002 preserves structure; PROFILE003/TIMING002 overlap cannot support exclusive rankings. TRACE001 found no usable execution-timeline source on this phone.

## Memory: keep accounting scopes separate

Fifteen sessions separately record JS heap, logical buffers, and textures. MEMORY001 covers 7500 recorded textures, with cumulative creation of 1,707,579,096 bytes and live ledger peak of 1,707,566,808 bytes in MODEL_INIT. Pre-observer resources are UNAVAILABLE, not zero. Repeated JS used=10,000,000-byte readings do not prove absence of growth.

MEMORY002 v2 is one PROTOCOL_PASS_WITH_CONDITION_WARNING, with 5606.1 ms of background switching during initialization. Browser/GPU observations are distinct from target-renderer mapping, which remains UNKNOWN. RSS/PSS are not model-exclusive or physical GPU memory. Five process repetitions are incomplete; private system originals remain ignored locally.

[memory001_texture_accounting.md](../../docs/en/memory001_texture_accounting.md) · [memory002_v2_pilot_results.md](../../docs/en/memory002_v2_pilot_results.md)

## Part 2: implementation and interpretation

Matrices A/B/C are operands/results; implementations A/B/C/D are naive, shared tiled, vec4 tiled, and fused QROW dequantization. Synthetic unsigned Q4/Q8 is not Gemma-native. The FP16 accumulator is distinct from the f32 output carrier; the discriminator produces 2048 versus FP32 2050. Representative M=1/128,K=N=1024 are not effective model layers; GEMM004 is a supplemental FP32 experiment for execution/padded M=8,K=1536,N=2048.

|Candidate|Workgroup x×y|Invocations|Output tile rows×columns|K tile|Shared bytes|
|---|---|---|---|---|---|
|A-original|8×8|64|8×8|scalar|0|
|B-16x16-K16|16×16|256|16×16|16|1024|
|B-8x8-K8|8×8|64|8×8|8|256|
|B-32x8-K16|32×8|256|8×32|16|1280|
|C/D-8x8-K16|8×8|64|8×32|16|1280|
|C/D-4x8-K16|4×8|32|8×16|16|768|
|C/D-8x16-K16|8×16|128|16×32|16|1536|

|Q|M|B|C|D|
|---|---|---|---|---|
|Q4|1|B-8x8-K8|C-8x8-K16|D-4x8-K16|
|Q4|128|B-32x8-K16|C-8x8-K16|D-8x16-K16|
|Q8|1|B-32x8-K16|C-8x8-K16|D-4x8-K16|
|Q8|128|B-8x8-K8|C-8x16-K16|D-8x16-K16|

Each candidate has 10 warm-up and 30 measured passes per session. Verification covers 5000 timestamps and 232985 exported small outputs. Large matrices rely on full online checks; offline recomputation covers exported small outputs and records only. The appendix retains all 125 absolute-time and same-session-ratio rows, without pooling five sessions into one median.

Selected B improves over its original configuration in all four groups across five sessions, but need not beat A. Selected M=128 D improves in both formats across five sessions; M=1 D includes regressions and reversals. Q8 M=128 C remains within one 65.536 µs grid and is unresolved. The Q4 pilot M=1 A/C median difference was exactly one grid, not a stable small improvement.

![Part 2](../figures/kernel_session_medians.svg)

![Part 2](../figures/kernel_variation.svg)

The five repeats measure prepared-input kernel-only. Earlier full-path pilots repeat CPU dequantization/layout conversion/required uploads: D is slower than C kernel-only but substantially faster in full-path wall time. This does not apply to once-prepared reusable weights or demonstrate model acceleration. Preparation and kernel medians cannot be added to obtain the full-path median.

Source establishes shared storage, barriers, vec4, and unpacking structure; cache, DRAM traffic, parallelism, or scheduling causes remain hypotheses. Nominal 2MNK/pass GFLOP/s is not peak utilization. An effective-GB/s convention is incomplete and physical traffic is not invented.

## Review and reproduction

- [Reading guide](../../docs/en/reading_guide.md)
- [Part 2 compute contract](../../docs/en/part2_compute_contract.md)
- [Measurement contract and statistical interpretation](../../docs/en/measurement_contract.md)
- [Five-session results: gains, regressions, and uncertainty](../../docs/en/part2_repeat_results.md)
- [Evidence and publication-scope index](../../docs/en/evidence_index.md)
- [Reproduction and offline verification](../../docs/en/reproduction.md)

[Complete per-session appendix](../../docs/en/results_appendix.md)

Report prose is manually maintained in the presentation template; numerical tables read shared stage_delivery_data.json automatically. This round runs no phone, model, or benchmark.
