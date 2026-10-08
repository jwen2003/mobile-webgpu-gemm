# 真实实例恢复：已知与未知

从 shader 数学、运行参数和模型语义三个层次恢复 shape，避免把 buffer 大小或模型常识当证明。

SHAPE001 第一次 INCOMPLETE 保留；后续参数采集补齐选定实例 uniform 和使用版本。离线证明得到执行 M=8,K=1536,N=2048 与 row-major 重排关系。关键证据是实际提交关联及索引，不是 buffer payload 可容纳的元素数。

有效逻辑维度、padding 的有效边界、lane 的 token/batch/head 身份、层名未得到完整元数据证实，保留 UNKNOWN。GEMM004 因数学 shape 证据充分已解锁并实测，不要求知道层名才能做补充实验；但不能关闭原题真实有效 layer shape 缺口。

## 接下来读什么

- [GEMM004 执行 shape 证明](gemm004_shape_proof.md)
- [PROFILE002 shader 结构分析](profile002_shader_analysis.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/model_shape_recovery.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)
