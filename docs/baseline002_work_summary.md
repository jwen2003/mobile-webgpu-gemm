# BASELINE002：给 Work 的十五次独立会话总结

验收：128、512、1024 完整 prompt tokens 各五次，15/15 COMPLETE，独立核验 PASS。原始JSON字节不变，历史哈希核对通过。每份有独立UUID、task/device/page；错误为空，无后台切换或采集丢失。实际 tokenizer `sizeInTokens(fullPrompt)` 精确匹配，正文分别120/504/1016，模板单独8；模板计入，差值不用于推断隐式BOS/实际prefill tensor。每种长度完整prompt/hash跨轮一致。

固定runtime @mediapipe/tasks-genai@0.10.29和已有Gemma3n E2B Web模型；maxTokens2048（总容量），topK40/temperature0.8/seed101/numResponses1，纯文本。每会话只一次生成，0额外生成warm-up；tokenizer准备与drain独立记录。Stock cache/rewinding默认不改；OS/browser/driver缓存未清除，初始化不是冷缓存指标。资源生命周期观察有开销，不能当无观察stock控制。

| 完整tokens | 初始化median/p95 s | 生成median/p95 s | 首callback median/p95 s | drain median/p95 ms |
|---:|---:|---:|---:|---:|
| 128 | 88.482/91.773 | 7.963/8.096 | 2.291/2.321 | 100.900/107.400 |
| 512 | 91.549/92.281 | 13.581/13.662 | 7.676/7.721 | 98.300/106.800 |
| 1024 | 92.673/93.478 | 20.167/20.246 | 14.834/14.928 | 94.800/101.600 |

五样本 nearest-rank p95=max，尾部证据有限。生成范围：128为7.862–8.096s，512为13.412–13.662s，1024为19.539–20.246s。这是固定人工重复上下文下的组合请求墙钟；不据此归因prefill、GPU瓶颈或模型吞吐。首次callback不称纯prefill，callback数不称生成token数，不计算tokens/s/per-token latency。

内存：JS heap API全部快照used/total=10,000,000bytes、limit=3,760,000,000bytes，粗粒度/重复值不能证明没有增长，不能代表WASM/native/GPU总内存。Buffer逻辑after-init=83,077,648bytes；known-format texture峰值载荷=308,026,776bytes，分开报告、不相加。每轮333个texture创建未被当前格式表计量，已保留几何/lifecycle信息：rgba32uint227、rgba16uint91、rgba32sint9、rgba8uint6。活跃期总texture载荷UNAVAILABLE；不是物理GPU内存。Device destroy不伪造逐buffer显式销毁，剩余账面bytes不能认定泄漏。RSS/PSS本轮未测。

关闭：指定完整输入长度实际验证；每长度五次独立组合墙钟、首callback/drain及可观测逻辑资源/JS heap采集，逐轮数据、median/p95/min/max齐备。部分满足内存指标；完整Part1仍未完成。保留缺口：纯prefill/decode、真实输出token与per-token/dispatch-token、可信per-kernel表/可加和breakdown/瓶颈、deviceRSS、物理GPU驻留、Adreno。真实有效逻辑layer shape也未由这些结果解决。

建议下一步按原题最终缺口排序，优先低成本离线核对已保留的integer texture格式以补逻辑payload（不改原始JSON、不扩建profiler、不新增手机轮次），以及规划有明确进程范围的adb RSS/PSS采集。真实token/phase入口和可信Chrome trace只做有预算的可行性判断，不能反复同样timestamp重叠诊断或无限扩建。已有Part2 A–D/sweep/五轮复验不可替代这些Part1缺口。请Work据此决定下一项最小任务，不启动额外benchmark。

详细证据：docs/baseline_sessions_results.md；results/analysis/baseline002_summary.json及15份原始JSON/独立核验文件；方案docs/baseline_sessions_plan.md。全部输出/环境/失败策略保留；Git提交信息将在交接消息中提供。
