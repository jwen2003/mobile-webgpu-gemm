# Model-instance recovery: known and unknown

Recover shapes at three levels: shader mathematics, runtime parameters, and model semantics. Buffer size or model familiarity is not proof.

The initial INCOMPLETE SHAPE001 remains preserved. Later parameter collection captured the selected uniform and its version at use. Offline proof established execution M=8,K=1536,N=2048 and a row-major conversion. The essential evidence is submitted-command association and indexing, not how many elements fit in a buffer.

Effective logical dimensions, valid padding boundaries, token/batch/head lane identity, and layer name lack complete metadata proof and remain UNKNOWN. GEMM004 was enabled and tested because mathematical-shape evidence sufficed for a supplement, without needing a layer name. It does not close the assignment’s effective layer-shape requirement.

## Read next

- [GEMM004 execution-shape proof](gemm004_shape_proof.md)
- [PROFILE002 shader structure analysis](profile002_shader_analysis.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/model_shape_recovery.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)
