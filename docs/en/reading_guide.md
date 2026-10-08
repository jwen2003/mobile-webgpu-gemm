# Reading guide

This guide assumes basic programming and computer architecture knowledge, but no prior familiarity with this project. Start with a small matrix mapping, then read the precision and measurement contracts.

Beginner route: overview → the small matrix below → CPU/JavaScript versus GPU/WGSL responsibilities → naive → QROW and FP16 contract → B/C/D → measurement contract → repeat results → Part 1 model observations. Reviewer route: current report → assignment matrix → both contracts → results → raw evidence and verification → reproduction.

Let matrix A=[[1,2,3],[4,5,6]] and B=[[7,8],[9,10],[11,12]]. Then M=2, K=3, N=2, and C=[[58,64],[139,154]]. This is a code-reading example, not a new phone experiment. Row-major storage places each row contiguously: multiply A[row*K+k] by B[k*N+column] and store C[row*N+column].

The main function in gemm_naive.wgsl uses global_invocation_id.x as the column and y as the row. An 8×8 workgroup contains 64 invocations (shader executions). In this example, only (column,row)=(0,0),(1,0),(0,1),(1,1) write the four outputs; the remaining invocations return at the bounds check. This naive shader has no barrier, so returning early is safe. B/C/D use shared storage and barriers; all invocations must participate in synchronization, including those outside the output bounds.

JavaScript generates inputs and independent CPU references, creates buffers and pipelines, encodes and submits GPU commands, and reads back and validates results. WGSL performs GPU arithmetic. gemm_math.mjs provides FP32 tools; verify in part2_math.mjs checks the frozen precision criteria; runSession in sessions.js is the model-session entry point. Source links appear below.

Do not confuse matrices A/B/C with implementations A/B/C/D. Matrices are operands and the result; implementations are four algorithms. Implementation C computes four neighboring output columns per invocation. Its original workgroup is 8×8 (64 invocations), while its output tile is 8 rows by 32 columns. In C-8x8-K16, 8×8 names the workgroup and K16 names the reduction chunk.

## Read next

- [Glossary](glossary.md)
- [Part 2 compute contract](part2_compute_contract.md)
- [Implementation C: vectorized tiled GEMM](part2_vectorized_c.md)
- [Measurement contract and statistical interpretation](measurement_contract.md)
- [Five-session results: gains, regressions, and uncertainty](part2_repeat_results.md)
- [BASELINE002: fifteen model-session results](baseline_sessions_results.md)
- [Reproduction and offline verification](reproduction.md)

## Sources and maintenance

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

## Mapping example: four valid invocations

|id.x|id.y|C index|K=3 expression|result|
|---|---|---|---|---|
|0|0|0|1*7+2*9+3*11|58|
|1|0|1|1*8+2*10+3*12|64|
|0|1|2|4*7+5*9+6*11|139|
|1|1|3|4*8+5*10+6*12|154|

## Two linked routes

Beginner: [Project overview](README.md) → [Glossary](glossary.md) → [Part 2 compute contract](part2_compute_contract.md) → [Implementation C: vectorized tiled GEMM](part2_vectorized_c.md) → [Implementation D: fused dequantization and two timing scopes](part2_fused_d.md) → [Measurement contract and statistical interpretation](measurement_contract.md) → [Five-session results: gains, regressions, and uncertainty](part2_repeat_results.md) → [BASELINE002: fifteen model-session results](baseline_sessions_results.md)

Reviewer: [Current report](../../report/en/performance_report.md) → [Assignment requirement matrix](assignment_requirements_matrix.md) → [Part 2 compute contract](part2_compute_contract.md) → [Measurement contract and statistical interpretation](measurement_contract.md) → [Five-session results: gains, regressions, and uncertainty](part2_repeat_results.md) → [Evidence and publication-scope index](evidence_index.md) → [Reproduction and offline verification](reproduction.md)

## Actual source entry points

- [main — gemm_naive.wgsl](../../src/benchmark/gemm_naive.wgsl)
- [inputs / cpuReference / compare — gemm_math.mjs](../../src/benchmark/gemm_math.mjs)
- [main — A — part2_a_f16.wgsl](../../src/benchmark/part2_a_f16.wgsl)
- [main — B — part2_b_f16.wgsl](../../src/benchmark/part2_b_f16.wgsl)
- [main — C — part2_c_f16.wgsl](../../src/benchmark/part2_c_f16.wgsl)
- [main — D/Q4 — part2_d_f16.wgsl](../../src/benchmark/part2_d_f16.wgsl)
- [main — D/Q8 — part2_d_q8_f16.wgsl](../../src/benchmark/part2_d_q8_f16.wgsl)
- [verify / toHalf / fromHalf / pack / unpack — part2_math.mjs](../../src/benchmark/part2_math.mjs)
- [generateShader — part2_sweep_shader.mjs](../../src/benchmark/part2_sweep_shader.mjs)
- [runSession — sessions.js](../../src/baseline/sessions.js)
