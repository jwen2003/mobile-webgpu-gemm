# MEMORY002 v2 冻结采集协议

协议解决空闲基线缺失、阶段握手和跨设备时间关联问题。这里记录已实施的门禁，不安排新的手机实验。

初始化前必须取得合格 IDLE 回执，否则状态 BLOCKED_UNTIL_IDLE_CAPTURE，不能进入正式采集。等待点为 AFTER_INIT、BEFORE_GENERATION、AFTER_DRAIN；记录页面阶段标记、电脑接收、命令开始/结束和回执后继续。

时间偏移区间由双向请求包络约束，计入 2 ms guard；epoch 与 monotonic 差异超过 5 ms 的校准无效。生成样本须前后校准包围，并确认整个采样窗口落在生成区间；否则 MIXED/UNKNOWN。v2 观察的不确定范围宽 28.975 ms 是条件性界限，不是绝对同步精度。

每次重新查询 PID、角色、start ticks；页面归属保持单独 UNKNOWN。服务用 serve_memory002.py 的回环控制接口，不由普通 http.server 替代。每次转发清理都保存检查；失败原文留本地，公开派生限制不删除失败。

## 接下来读什么

- [MEMORY002 v2：有条件协议通过](memory002_v2_pilot_results.md)
- [复现与离线核验](reproduction.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/memory002_capture_protocol.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)
