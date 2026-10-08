# GEMM004 execution-shape proof

This proves the shader’s executed matrix mathematics and layout. Effective model tensor dimensions and layer purpose are separate questions.

Captured values are U.i0=[512,8,384,0], workgroup=8×4×1, and dispatch=64×1×1. The conclusion follows source reductions and address expressions together with actual uniforms, not a guess from dispatch size.

The mapping is A[r,4s+t]=texture(r,s)[t], B[4s+t,4d+c]=weights[s*512+d][t][c], and C[r,4d+c]=texture(r,d)[c]. With r=0..7, s=0..383, t/c=0..3, d=0..511, the execution matrix is M=8, K=1536, N=2048. The packed FP16 mat4 stride is 32 bytes; this is not Q4/INT4 dequantization.

These expressions prove execution axes and a layout conversion, but do not prove that the eight lanes are effective tokens, batches, or heads, nor that padded dimensions equal effective logical dimensions. Layer purpose remains UNKNOWN. GEMM004 tests this execution shape with synthetic FP32 inputs; it is not a numerically equivalent reproduction of the FP16 operator and does not establish model acceleration.

## Read next

- [Model-instance recovery: known and unknown](model_shape_recovery.md)
- [Assignment requirement matrix](assignment_requirements_matrix.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/gemm004_shape_proof.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

## Concrete instance association

[ee9a0b2823d07f56fe2e9c50134dbc9c58f9f411dcfc11795869196870dd6036](../../results/analysis/profile002/shaders/ee9a0b2823d07f56fe2e9c50134dbc9c58f9f411dcfc11795869196870dd6036.wgsl)

entryPoint=main; pipeline=shape-pipeline-11990, module=shape-shader-11989. Actual association: submit51672 → command17452 → pass17451 → encode46613. Binding3 offset722176, size16 uses CPU update33496, not final arena version45183 after generation.

WGSL matrix indexing selects a column then a component. Source w[0] and related columns are output-component vectors multiplied by input v.x and related components. Row-major B scalar index is (4*s+t)*2048+(4*d+c); packed source scalar index is (s*512+d)*16+t*4+c, with twice that byte offset. tid.y partitions s four ways before workgroup reduction and lane stores; this is not the naive accumulation order. Effective logical axes remain unknown.
