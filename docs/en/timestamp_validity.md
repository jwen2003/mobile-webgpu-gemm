# Timestamp validity and bounded conclusion

Reading timestamps successfully and attributing execution time are distinct acceptance criteria. Serial single-pass controls and consecutive model passes also have different execution conditions.

TIMING002 consecutive passes in one command buffer show 7/7 overlaps, with overlap min/median/p95/max of 13.631488/31.784960/50.069504/50.069504 ms. Consecutive submissions show 7/7, at 9.895936/25.690112/40.173568/40.173568 ms. Serial waits show 0/7. Every positive overlap exceeds 65,536 ns.

Independent reproduction means the issue cannot simply be blamed on model instrumentation. The specific platform cause remains UNKNOWN. Serial waits change execution conditions and support observations under the controlled single-pass GEMM method, not stock model performance.

Raw timestamps, links, and zeros remain intact, without reordering, clipping, or equal allocation. Current deliverables are structural tables and validity diagnostics; model passes do not support an additive GPU stacked breakdown.

## Read next

- [Measurement contract and statistical interpretation](measurement_contract.md)
- [Remaining-metric feasibility review](remaining_metrics_feasibility.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/timestamp_validity.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)
