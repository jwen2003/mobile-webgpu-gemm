# TRACE001 数据源可用性结论

区分官方列出的功能和当前手机实际注册、可访问的源。没有采集模型 trace。

本机 Perfetto v49 实际查询到 android.gpu.memory；未查询到 gpu.renderstages、gpu.counters 或相关 vendor 执行源。普通 shell 的 tracefs 访问受限，debug 路径不可用。配置转换失败也保留，不修改权限、不 root。

GPU 内存数据源存在不证明有执行时间线，更不证明能关联 WebGPU dispatch/shader。当前执行时间线不可用，算子关联 UNKNOWN；这仅界定本机当前权限路径，不证明所有平台都不可能。保留 kernel breakdown 缺口并转入报告整理。

## 接下来读什么

- [剩余指标可行性审查](remaining_metrics_feasibility.md)
- [时间戳有效性与收敛结论](timestamp_validity.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/trace001_availability.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)
