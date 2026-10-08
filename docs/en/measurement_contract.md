# Measurement contract and statistical interpretation

This document explains the frozen measurement boundaries. Early proposed budgets are distinct from the budgets actually executed; a plan does not replace raw evidence.

Kernel-only measures timestamps at compute-pass beginning and end. Pipeline creation, allocation, upload, references, output readback, and CPU checks are outside the interval. Submit-to-completion wall time starts immediately before queue.submit and ends at onSubmittedWorkDone, including host-visible queue delays; it is not GPU arithmetic time.

The full-path pilot starts from common packed inputs and actually repeats CPU dequantization, layout conversion, and required upload through final GPU completion. It is sampled independently, not constructed by adding preparation and kernel medians. Common initial uploads may be excluded if documented. Preparing static weights once for reuse is a different scenario.

Current controlled GEMM, sweep, and repeat experiments use 10 warm-up and 30 measured passes per configuration, one dispatch per pass, serial completion, and full output validation. The earlier proposed 20/100 budget remains a historical plan. A TIMING001 32-dispatch pass is not divided by 32 and called independent latency.

Timestamps are read with BigUint64Array, subtracted as BigInt, then converted to units. JSON preserves decimal strings. Zeros and tails are retained. Median, nearest-rank p95, min/max, and zero counts are reported separately. Five independent sessions each create a fresh page/device; they are neither partitions of one session nor summarized solely by a pooled median.

Ratios use the same session and scope: A median/candidate median compares against A; original median/selected median compares a variant against itself. Improving over itself does not guarantee beating A. Grid-scale differences remain uncertain. Serial waits and readback affect execution conditions, so these are controlled kernel experiments, not stock model throughput.

PROFILE003 and TIMING002 show overlapping neighboring timestamp intervals. The evidence does not support exclusive kernel rankings or additive breakdowns. Intervals are not clipped or equally divided, and their union is not physical GPU busy time.

## Read next

- [Timestamp validity and bounded conclusion](timestamp_validity.md)
- [Five independent repeat sessions](part2_repeat_plan.md)
- [Reproduction and offline verification](reproduction.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/measurement_contract.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

|Scope|Start|End|Excluded|
|---|---|---|---|
|kernel-only|Compute pass beginning|Compute pass end|Creation/upload/reference/output validation|
|submit-to-completion|Before queue.submit|onSubmittedWorkDone completion|Timestamp map and CPU validation|
|full-path pilot|Before required conversion|Final GPU completion|Common initial upload/reference/output validation|
