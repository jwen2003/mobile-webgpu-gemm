# Bounded sweep results and frozen selections

Start with the selected configurations, then inspect raw samples and failures. Complete data remain in shared results.

The first two sweeps remain COMPLETE_WITH_FAILURES: use of the WGSL reserved identifier meta caused compilation failures. Renaming it to quantIndex allowed the third run to complete. Failed runs were not deleted and their JSON was not modified. The successful file is dated 2026-10-06T06-07-34-319Z.

Frozen choices appear below. The two configuration numbers denote workgroup x/y, not necessarily the output tile: B computes one column per invocation, C/D four. The choices were for subsequent repetition; current performance interpretation uses the five individual sessions.

## Read next

- [Five-session results: gains, regressions, and uncertainty](part2_repeat_results.md)
- [Frozen bounded sweep plan](part2_sweep_plan.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/part2_sweep_results.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

|Q|M|B|C|D|
|---|---|---|---|---|
|Q4|1|B-8x8-K8|C-8x8-K16|D-4x8-K16|
|Q4|128|B-32x8-K16|C-8x8-K16|D-8x16-K16|
|Q8|1|B-32x8-K16|C-8x8-K16|D-4x8-K16|
|Q8|128|B-8x8-K8|C-8x16-K16|D-8x16-K16|
