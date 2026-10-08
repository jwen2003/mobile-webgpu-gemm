# PROFILE002 shader 结构分析

分析按 GENERATION 实际提交的 command buffer 关联 pass、dispatch、pipeline 和 shader。次数用于结构覆盖，不是耗时证据。

180 个生成关联 shader 身份对应 132 个源码 hash；身份与相同源码不能混为一个概念。生成结构记录有 2005 个 pass、126402 次已提交 dispatch。重复提交按提交次数记录，未提交编码不算已执行。

分类依据源码乘加、索引、unpack、归一化等模式；可有多个融合标签，UNKNOWN 保留，不能将多个标签重复累计耗时。完整 180 项分类、entryPoint、hash、源码与置信度在共享分析表及 shader 文件中，不在两种语言下复制证据。

最适合后续 shape 推导的是索引明确的矩阵实例。最终确认的是 M=8,K=1536,N=2048 数学执行维度，而不是有效模型层或 token/head 的语义。证据链见 shape 文档。

## 接下来读什么

- [GEMM004 执行 shape 证明](gemm004_shape_proof.md)
- [真实实例恢复：已知与未知](model_shape_recovery.md)
- [时间戳有效性与收敛结论](timestamp_validity.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/profile002_shader_analysis.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

[180 项完整分类附录](shader_classification_appendix.md)
