# 环境与证据来源

区分用户截图、页面探测 adapter、runtime 实际 device 与原始 JSON。空值保留，不能由名称推断型号或 backend。

截图记录 OnePlus PMB110、Dimensity 9500、Mali-G1-Ultra MC12、Android 16、Chrome 154.0.8037.92。reduced userAgent 的 Android 10/K 不是实际系统版本证据。adapter vendor=arm、architecture=gen-5；device/description 空时不填猜测型号。

chrome://gpu/ANGLE 的 driver 2.1.28733 是该来源的元数据，不是已确认的 runtime WebGPU driver。环境探测 device 与 stock runtime device 分开；无法验证 runtime backend 时保持 UNKNOWN。adapter 支持 feature 不等于 device 已启用或实验已验证。

COMPUTE001 只验证 FP32，TIMING001 验证 timestamp-query；Part 2 的 FP16 路径还使用实际累加区分用例。adapter/device limits 分别记录，device 默认限制可能低于 adapter。thermal 是人工状态，不是温度传感器；charging、DevTools、flag、VPN/后台应用按每会话原始记录解释，不追补未知状态。

## 接下来读什么

- [本地模型与 runtime 准备](model_preparation.md)
- [BASELINE002：十五次模型会话结果](baseline_sessions_results.md)
- [测量契约与统计解释](measurement_contract.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/environment.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)
