# 任务范围与要求导航

原题分为 stock 模型观察和自写量化 GEMM 两部分，不能用补充实验替代要求。逐项状态由要求矩阵维护。

Part 1 要求 Gemma E2B、目标 Adreno、128/512/1024 输入及各指标至少五次、真实吞吐/phase、内存、dispatch/token、kernel 时间与 breakdown。当前完整输入与组合墙钟已取得，其余按证据标 PARTIAL/BLOCKED/NOT_RUN。

Part 2 要求 Q4/Q8 反量化 GEMM 的 FP16 accumulation 和 A–D、tile/workgroup 探索、正确性、GFLOPS/有效 GB/s 与比较。实现及 Mali 合成契约验收不等于目标硬件和真实有效层 shape 验收。五轮 Part 2 是追加的复验要求，不伪称原题 Part 2 明确重复句。

原题的 if available 工具和示例分类证据与 mandatory 区分。旧计划 CSV/未建页面链接不再作为当前交付入口，改链实际 JSON、源码和已验收页面；原始计划保留在历史快照。

## 接下来读什么

- [原题逐项要求矩阵](assignment_requirements_matrix.md)
- [证据与公开范围索引](evidence_index.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/requirements.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)
