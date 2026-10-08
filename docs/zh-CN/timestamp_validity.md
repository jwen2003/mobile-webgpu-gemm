# 时间戳有效性与收敛结论

成功读回时间戳与可以归因耗时是不同验收项。串行单 pass 对照与连续模型 pass 也不是同一执行条件。

TIMING002 同 command buffer 连续 pass 有 7/7 重叠，overlap min/median/p95/max 为 13.631488/31.784960/50.069504/50.069504 ms；连续 submit 为 7/7，9.895936/25.690112/40.173568/40.173568 ms；串行等待为 0/7。所有正重叠超过 65,536 ns。

独立实验复现说明不能只归咎于模型 instrumentation；没有证据确定具体平台原因，保持 UNKNOWN。串行等待改变了执行条件，支持受控 GEMM 单 pass 方法的观察，不能代替 stock 模型性能。

保留原始时间戳、关联和零值，不重排、裁剪或平均分摊。当前只交付结构表和有效性诊断；模型 pass 不支持可加和 GPU stacked breakdown。

## 接下来读什么

- [测量契约与统计解释](measurement_contract.md)
- [剩余指标可行性审查](remaining_metrics_feasibility.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/timestamp_validity.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)
