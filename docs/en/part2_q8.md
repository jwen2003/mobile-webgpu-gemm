# Q8 path and its relationship to Q4

Q8 reuses the Q4 A–D framework with explicit format, stride, and input-range differences.

Q8 uses unsigned 0..255 codes, four per u32, row stride ceil(N/4), mask 255, and shift=8*(n mod 4). Q4 holds eight codes per word. Both use least-significant-first row packing and K groups of 32. Negative weights arise by subtracting the zero-point, not by two’s-complement sign extension.

Q8 fractional scales are 1/512 to bound values despite the wider code range. Activations, f16 fma order, output carrier, references, and frozen criteria retain the contract. CPU checks cover extremes, zero, word/row/group tails. Q4 regression checks correctness without repeating its entire performance experiment.

Q8 A–D passed phone validation, followed by the sweep and five repeat sessions. Differences between historical Q4/Q8 sessions are descriptive, not controlled causal evidence about formats. Every speedup denominator comes from the same session. Neither format is Gemma-native quantization.

## Read next

- [Part 2 compute contract](part2_compute_contract.md)
- [Bounded sweep results and frozen selections](part2_sweep_results.md)
- [Five-session results: gains, regressions, and uncertainty](part2_repeat_results.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/part2_q8.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)
