# 测量契约与统计解释

本文件解释冻结的测量边界。早期计划的样本预算与后来实际执行的预算分开，不能用计划替代原始记录。

kernel-only 测量 compute pass 的开始与结束时间戳；pipeline 创建、分配、输入上传、reference、输出读回和 CPU 检查在区间外。submit-to-completion 墙钟从 queue.submit 前到 onSubmittedWorkDone 完成，包含队列等待等主机可见成本，不等于 GPU 算术时间。

完整路径 pilot 从共同 packed 输入开始，实际重新执行 CPU 反量化、布局转换、必要上传，到最终 GPU 完成；它独立采样，不由准备 median 与 kernel median 相加。共同初始上传可排除，但必须记录。静态权重只准备一次并复用是另一场景，不能套用每次准备的收益。

当前受控 GEMM、sweep 与 repeat 使用每配置 10 次 warm-up 和 30 次 measured，单 pass 单 dispatch，串行完成并全量读回校验。早期提出的 20/100 预算仅是历史计划。TIMING001 的 32-dispatch pass 不除以 32 后当独立 latency。

时间戳用 BigUint64Array 读回，先 BigInt 相减，再转换单位；JSON 保存十进制字符串。保留零值和长尾。median、nearest-rank p95、min/max、零值数分别报告。五次独立会话每次创建新的页面/device；不是把一次会话 150 样本切成五组，也不只合并后给一个 median。

比值必须来自同轮、同口径：A median/候选 median 表示相对 A；原配置 median/选定配置 median 表示相对自身。后者大于 1 不保证前者大于 1。网格内差异保留不确定状态，不能宣称稳定收益。串行等待和读回会改变运行状态，因此这些是受控 kernel 实验，而不是 stock 模型吞吐。

PROFILE003 和 TIMING002 存在相邻时间区间重叠。当前证据不能支持独占 kernel 排名或可加和 breakdown；不裁剪、不均分、不把区间 union 称为物理 GPU busy time。

## 接下来读什么

- [时间戳有效性与收敛结论](timestamp_validity.md)
- [五次独立复验方法](part2_repeat_plan.md)
- [复现与离线核验](reproduction.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/measurement_contract.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

|Scope|起点|终点|不包含|
|---|---|---|---|
|kernel-only|compute pass 开始|compute pass 结束|创建/上传/reference/输出检查|
|submit-to-completion|queue.submit 前|onSubmittedWorkDone 完成|时间戳 map 与 CPU 检查|
|full-path pilot|必要转换前|最终 GPU 完成|共同初始上传/reference/输出检查|
