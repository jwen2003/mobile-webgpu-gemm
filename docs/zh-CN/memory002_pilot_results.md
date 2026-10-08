# MEMORY002 v1：PARTIAL 记录

这是失败及可用数据的历史报告，不被 v2 的协议通过覆盖。

v1 缺初始化前合格空闲快照，进程角色查询出现 WinError 2，生成采样窗口与页面时钟关联不足。保留快照、失败和原始日志，状态 PARTIAL；不能计算可信空闲差值或声称完整阶段覆盖。

已有系统数字只能按成功查询的范围阅读；未知角色不沿用旧 PID。v2 修正了门禁和握手，但不将本次记录补造为通过，也不删除初始化期间后台切换警告。

## 接下来读什么

- [MEMORY002 v2 冻结采集协议](memory002_capture_protocol.md)
- [MEMORY002 v2：有条件协议通过](memory002_v2_pilot_results.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/memory002_pilot_results.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)
