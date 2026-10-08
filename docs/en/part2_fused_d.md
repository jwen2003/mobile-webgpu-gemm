# Implementation D: fused dequantization and two timing scopes

D directly consumes packed QROW, scales, and zero-points. Read the C vec4 output mapping and frozen dequantization order first.

D retains the C workgroup and four-column mapping. Loading a B tile reads the u32 code, shifts and masks it, subtracts the zero-point as integers, multiplies by scale, and converts to f16 before the same increasing-K fma. There is no complete pre-dequantized B16 matrix. Packed FP16 unpacking is not Q4 dequantization; D operates on integer QROW codes.

In kernel-only measurements A/B/C already have B16, while D includes unpacking and dequantization. D was slower than C in the Q4 GPU-pass pilot. The full-path pilot repeats CPU dequantization, layout conversion, and required uploads each time, and D was substantially faster in that scope. These findings measure different work and do not apply to weights prepared once and reused.

Every full-path sample actually repeats preparation and records wall time independently. CPU milliseconds are not added to GPU timestamp milliseconds and called GPU time; medians are not added to reconstruct a full-path median. One-time preparation and intermediate bytes are separate. Reduced logical allocations do not demonstrate physical GPU residency savings or Gemma acceleration.

The A–D pilot uses 10 warm-up and 30 measured passes per variant. Each of the 24 four-variant permutations appears once, followed by six balanced additions: positions have 7/8 occurrences and pairwise precedence is 15/15. A fixed seed shuffles and exports the order. Kernel-only and full-path are sampled separately. Later repeats use frozen multi-candidate cyclic interleaving, not this 24+6 scheme.

## Read next

- [Measurement contract and statistical interpretation](measurement_contract.md)
- [Five-session results: gains, regressions, and uncertainty](part2_repeat_results.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/part2_fused_d.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)
