# 剩余指标可行性审查

限时审查现有接口与证据，不运行模型、不增加 profiler。UNKNOWN 不用估计值填补。

真实输出 token：公开接口无 IDs/count；内部 DECODED_IDS 是未验证线索，不是可用测量入口。重新 tokenize 文本不等于真实生成序列。prefill/decode：公开生成调用没有可靠独立边界，首次 callback 不作纯 prefill，callback 数不作 token 数。

Chrome/Dawn CPU 提交事件可能说明主机结构，但不能当 GPU 执行时间或与 shader 自动归因。TRACE001 本机没有已证实执行时间线源；当前不能补可信 stacked breakdown。最小验证必须先证明真实 token/phase hook 或时间线到目标 dispatch 的关联，而不是继续收集更多同口径墙钟。

## 接下来读什么

- [TRACE001 数据源可用性结论](trace001_availability.md)
- [原题逐项要求矩阵](assignment_requirements_matrix.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/remaining_metrics_feasibility.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)
