# MEMORY002 v2：有条件协议通过

状态为 PROTOCOL_PASS_WITH_CONDITION_WARNING，仅验收一次采集协议，不是正式内存要求全部通过。

一次 128-token pilot 取得 IDLE、AFTER_INIT、GENERATION、AFTER_DRAIN，另有 BEFORE_GENERATION；共五次快照、十个 browser/GPU 读数。初始化后台切换 5606.1 ms 保留。browser PID 14567、GPU PID 11306 本轮有角色证据；renderer 11292 的页面归属仍 UNKNOWN。

GPU 进程 PSS/RSS（KiB）从空闲 162986/304373 到初始化后 2163859/2446557、生成窗口 2693656/2976429、drain 后 2167082/2449841。这是观测窗口内进程数字，不是模型独占、物理 GPU 内存或连续峰值。browser 单列见附录。

私有系统原文与 v2 页面 JSON 仍留忽略目录；公开派生记录及哈希允许本机核验，干净 clone 不具备私有原文。十次临时转发检查已清理。五次进程内存重复未完成，不追加实验。

## 接下来读什么

- [MEMORY002 v2 冻结采集协议](memory002_capture_protocol.md)
- [原题逐项要求矩阵](assignment_requirements_matrix.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/memory002_v2_pilot_results.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

|stage|role|PID|PSS KiB|RSS KiB|delta PSS KiB|delta RSS KiB|window ms|
|---|---|---|---|---|---|---|---|
|PAGE_IDLE|BROWSER_MAIN|14567|249919|429182|0|0|8471.38680005446|
|PAGE_IDLE|GPU|11306|162986|304373|0|0|8471.38680005446|
|AFTER_INIT|BROWSER_MAIN|14567|239975|423966|-9944|-5216|8380.46359992586|
|AFTER_INIT|GPU|11306|2163859|2446557|2000873|2142184|8380.46359992586|
|BEFORE_GENERATION|BROWSER_MAIN|14567|230188|414202|-19731|-14980|8554.392999969423|
|BEFORE_GENERATION|GPU|11306|2158928|2441669|1995942|2137296|8554.392999969423|
|GENERATION|BROWSER_MAIN|14567|229729|413946|-20190|-15236|10649.233000003733|
|GENERATION|GPU|11306|2693656|2976429|2530670|2672056|10649.233000003733|
|AFTER_DRAIN|BROWSER_MAIN|14567|229605|413822|-20314|-15360|8588.826499995776|
|AFTER_DRAIN|GPU|11306|2167082|2449841|2004096|2145468|8588.826499995776|

[memory002_v2_pilot_verification.json](../../results/analysis/memory002_v2_pilot_verification.json)
