# Frozen bounded sweep plan

The sweep selects candidates for repetition; it is not an open-ended tuning loop.

The scope is fixed at Q4/Q8, M=1/128, K=N=1024. A retains its original configuration; B/C/D have at most three candidates each, including the original. Candidates pass small-matrix, boundary, and FP16 discriminator checks, then device-limit checks for invocations, shared storage, and buffers. Failures and UNSUPPORTED records remain; tolerances are not relaxed.

Each candidate has 10 warm-up and 30 measured passes, prepared-input kernel-only. Orders derive from fixed seed 0x53575001 with cyclic position balancing. Actual orders are exported; exact pairwise precedence balance is not assumed. The budget is 1600 sampling passes plus 420 correctness passes.

Selection uses the lowest passing median. Candidates within 65,536 ns of the minimum are unresolved, preferring the original configuration. Sweep results do not establish stable gains. Selections were frozen before the five repeat sessions and not changed afterward.

## Read next

- [Bounded sweep results and frozen selections](part2_sweep_results.md)
- [Five independent repeat sessions](part2_repeat_plan.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/part2_sweep_plan.md).

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
