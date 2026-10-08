# GEMM004 执行 shape 证明

证明 shader 实际执行的矩阵数学与布局；这与模型有效张量维度、层用途是三个不同问题。

已采集 U.i0=[512,8,384,0]、workgroup=8×4×1、dispatch=64×1×1。结论不是从 dispatch 大小猜出，而是由源码归约和地址表达式联合实际 uniform 推导。

布局映射为 A[r,4s+t]=texture(r,s)[t]，B[4s+t,4d+c]=weights[s*512+d][t][c]，C[r,4d+c]=texture(r,d)[c]。r=0..7、s=0..383、t/c=0..3、d=0..511，故执行矩阵为 M=8、K=1536、N=2048。packed FP16 mat4 的 stride 为 32 bytes；这不是 Q4/INT4 反量化。

这些表达式证明数学执行轴与重排关系，但不能证明 8 lanes 是有效 token、batch 或 head，也不能证明 padding 后维度等于有效逻辑维度，层用途仍 UNKNOWN。GEMM004 使用合成 FP32 输入测试该执行 shape；不是原 FP16 算子的数值等价复现，不用于模型加速结论。

## 接下来读什么

- [真实实例恢复：已知与未知](model_shape_recovery.md)
- [原题逐项要求矩阵](assignment_requirements_matrix.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/gemm004_shape_proof.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

## 具体实例关联

[ee9a0b2823d07f56fe2e9c50134dbc9c58f9f411dcfc11795869196870dd6036](../../results/analysis/profile002/shaders/ee9a0b2823d07f56fe2e9c50134dbc9c58f9f411dcfc11795869196870dd6036.wgsl)

entryPoint=main；pipeline=shape-pipeline-11990，module=shape-shader-11989。实际关联 submit51672 → command17452 → pass17451 → encode46613。binding3 offset722176、size16 使用 CPU update33496，不取生成结束时 arena 的最终版本45183。

WGSL matrix 索引先取列再取分量；源码 w[0] 等作为输出分量向量，与输入 v.x 等相乘。row-major B scalar 索引为 (4*s+t)*2048+(4*d+c)，packed source scalar 索引为 (s*512+d)*16+t*4+c，byte offset 为其两倍。tid.y 分四路处理 s，组内归约后写各 lane 输出；这不是原 naive 的累加顺序。有效逻辑轴仍未知。
