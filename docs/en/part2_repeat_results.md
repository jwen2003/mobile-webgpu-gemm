# Five-session results: gains, regressions, and uncertainty

This document includes the per-session absolute-time and ratio appendix. Read the directional summary first; do not treat the single lowest observation as the conclusion.

All five sessions passed the synthetic contract. Offline verification checked 5000 sampling timestamps and 232985 exported small outputs. Large performance matrices were checked online in full. Complete large actual arrays were not exported, so offline verification cannot claim to reconstruct every large output.

Selected B improved over its own original configuration in all five sessions for all four groups, but did not necessarily beat A, especially at M=1. Selected D improved at M=128 in both formats across all five sessions. M=1 D shows reversals and grid-scale differences. Q8 M=128 C differences are all within one grid and do not establish a stable improvement.

Retained original/selected ratio ranges include Q4 M=1 D 0.895833..1.04545, Q8 M=1 D 0.933333..1.095238, and Q8 M=128 C 0.986301..1.0625. Shared tables retain precise values. Configurations were not changed in response, and variation does not establish cache, bandwidth, or scheduling bottlenecks.

## Read next

- [Bounded sweep results and frozen selections](part2_sweep_results.md)
- [Measurement contract and statistical interpretation](measurement_contract.md)
- [Reproduction and offline verification](reproduction.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/part2_repeat_results.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

[Complete session-data appendix](results_appendix.md)
