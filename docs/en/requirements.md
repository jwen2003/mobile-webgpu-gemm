# Task scope and requirements navigation

The assignment separates stock-model observation from custom quantized GEMM. Supplemental experiments do not replace requirements. The requirement matrix maintains individual statuses.

Part 1 calls for Gemma E2B, target Adreno, 128/512/1024 inputs with at least five runs per metric, actual throughput/phases, memory, dispatch/token, kernel times, and breakdown. Complete inputs and combined wall times are available; other requirements remain PARTIAL/BLOCKED/NOT_RUN as supported.

Part 2 calls for Q4/Q8 dequantization GEMM with FP16 accumulation, A–D, tile/workgroup exploration, correctness, GFLOPS/effective GB/s, and comparison. Implementation and Mali synthetic-contract acceptance do not satisfy target hardware or effective real-layer shapes. Five Part 2 repeats are an added repeat requirement, not falsely attributed to an explicit Part 2 sentence.

Tools qualified by if available and example classification evidence are distinct from mandatory requirements. Old planned CSV/nonexistent-page links are not current delivery entry points; navigation uses actual JSON, source, and accepted pages. Original plans remain in historical snapshots.

## Read next

- [Assignment requirement matrix](assignment_requirements_matrix.md)
- [Evidence and publication-scope index](evidence_index.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/requirements.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)
