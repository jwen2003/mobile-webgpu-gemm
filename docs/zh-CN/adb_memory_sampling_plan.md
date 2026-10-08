# 进程内存采集方法与角色证据

RSS/PSS 是进程范围观察；先证明角色，再讨论页面归属。方法准备不等于正式重复验收。

browser/GPU 角色由本轮进程命令行与 start ticks 证据核验；renderer 角色与目标页面映射分开。仅 target ID、唯一 renderer 或旧 PID 不足以证明归属。元数据失败保持 UNKNOWN，不复用历史身份。

原始系统清单和 DevTools 输出在本地忽略目录保存；公开仅派生数字、方法和哈希。临时调试隧道仅绑定 127.0.0.1，限定元数据，不读其它页面或会话内容，成功失败都撤销并核对。

RSS 跨进程相加会重复计入共享页；PSS 也不是模型独占或物理 GPU 内存。命令有耗时，生成期间样本是窗口，不是瞬时点或连续峰值。窗口跨阶段或无法关联时标 MIXED/UNKNOWN。

## 接下来读什么

- [MEMORY002 v2 冻结采集协议](memory002_capture_protocol.md)
- [MEMORY002 v1：PARTIAL 记录](memory002_pilot_results.md)
- [MEMORY002 v2：有条件协议通过](memory002_v2_pilot_results.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/adb_memory_sampling_plan.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)
