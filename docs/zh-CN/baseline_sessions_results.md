# BASELINE002：十五次模型会话结果

十五次独立会话均 COMPLETE，输出非空、完成正常、错误记录为空。这里报告可观测墙钟，不把可运行性验收等同于数值验证或原题全部完成。

128/512/1024 完整输入长度均由实际 tokenizer 核对，各五次。初始化与生成分开；生成墙钟混合了公开 API 内部 prefill、decode 等工作，不能拆分纯 phase。首次 callback 延迟仅按其事件边界命名。

当前公开 API 不提供真实生成 token IDs/count；不按字符数、callback 数或重新 tokenize 文本算 tokens/s。各长度逐轮表在附录，内存按 JS heap、buffer、texture 和进程观察分别展示，不相加成为物理 GPU 内存。

## 接下来读什么

- [MEMORY001：texture 逻辑 payload](memory001_texture_accounting.md)
- [MEMORY002 v2：有条件协议通过](memory002_v2_pilot_results.md)
- [剩余指标可行性审查](remaining_metrics_feasibility.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/baseline_sessions_results.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

[完整逐会话数据附录](results_appendix.md)
