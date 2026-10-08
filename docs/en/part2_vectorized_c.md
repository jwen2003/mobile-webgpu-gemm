# Implementation C: vectorized tiled GEMM

This document explains the source changes in C relative to A/B, rather than assuming vec4 must be faster.

Original C-8x8-K16 uses 8×8 invocations, four neighboring output columns per invocation, an 8×32 output tile, and K chunks of 16. Shared A contains 8×16 f16 values; shared B contains 16×8 vec4<f16> values, totaling 1280 bytes. Barriers occur after loading and after use. Tail loads are zero-filled and final stores check each output component.

CPU preparation forms a vec4 B16 layout with row stride ceil(N/4). Padding and conversion resources are recorded separately. Each component still performs f16 fma in increasing K order. The source changes output mapping, loads, and per-thread work together, so observations cannot be attributed solely to hardware vector instructions.

The phone A/B/C pilot passed the synthetic contract; repeat results are documented separately. Q8 and fused D were added later. Historical NOT_RUN labels describe preparation time. Grid-scale M=1 A/C differences and cross-session reversals are retained, not described as stable small gains.

## Read next

- [Part 2 compute contract](part2_compute_contract.md)
- [Five-session results: gains, regressions, and uncertainty](part2_repeat_results.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/part2_vectorized_c.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

|Candidate|Workgroup x×y|Invocations|Output tile rows×columns|K tile|Shared bytes|
|---|---|---|---|---|---|
|A-original|8×8|64|8×8|scalar|0|
|B-16x16-K16|16×16|256|16×16|16|1024|
|B-8x8-K8|8×8|64|8×8|8|256|
|B-32x8-K16|32×8|256|8×32|16|1280|
|C/D-8x8-K16|8×8|64|8×32|16|1280|
|C/D-4x8-K16|4×8|32|8×16|16|768|
|C/D-8x16-K16|8×16|128|16×32|16|1536|
