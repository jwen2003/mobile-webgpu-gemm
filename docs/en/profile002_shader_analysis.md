# PROFILE002 shader structure analysis

Analysis links passes, dispatches, pipelines, and shaders through command buffers actually submitted during GENERATION. Counts describe structural coverage, not execution time.

There are 180 generation-associated shader identities and 132 source hashes. Identity and identical source are different concepts. The generation structure records 2005 passes and 126402 submitted dispatches. Repeated submissions are counted per submission; unsubmitted encoding is not counted as execution.

Classification uses source multiply-add, indexing, unpacking, normalization, and related patterns. Fused shaders can have multiple labels, and UNKNOWN remains unknown. Labels are not duplicated into separate time totals. The complete 180-entry classification, entry points, hashes, sources, and confidence live in shared analysis and shader files rather than copied evidence per language.

The most useful shape candidates have explicit matrix indexing. The established case has mathematical execution dimensions M=8,K=1536,N=2048, not confirmed effective model-layer or token/head semantics. The shape documents contain the evidence chain.

## Read next

- [GEMM004 execution-shape proof](gemm004_shape_proof.md)
- [Model-instance recovery: known and unknown](model_shape_recovery.md)
- [Timestamp validity and bounded conclusion](timestamp_validity.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/profile002_shader_analysis.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

[Complete 180-entry classification appendix](shader_classification_appendix.md)
