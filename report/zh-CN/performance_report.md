# 阶段交付报告：部分完成

整体 assignment 与两个 Part 均为 PARTIAL。已在 Mali 完成 stock 模型的三种完整输入长度各五次会话，以及合成 QROW FP16 A–D 的有限 sweep 和五次独立复验。Adreno 未测，真实有效逻辑模型层 shape 未确认；不宣称模型加速。

[原始题目](../../assignment/webgpu_adreno_assignment.pdf) · [逐项验收范围](../../docs/zh-CN/assignment_requirements_matrix.md)

## Part 1：能测到什么

128/512/1024 都由 sizeInTokens(fullPrompt) 核对，模板计入，每长度五个独立新任务。maxTokens=2048 是总容量；生成 warm-up=0。初始化、生成调用至完成、首次 callback 和 GPU drain 分开。首次 callback 不是纯 prefill，callback 不等于 token。

|tokens|init median ms|init p95 ms|generation median ms|generation p95 ms|first callback median ms|first callback p95 ms|drain median ms|drain p95 ms|
|---|---|---|---|---|---|---|---|---|
|128|88482.000|91773.400|7963.100|8096.300|2290.500|2321.100|100.900|107.400|
|512|91549.000|92280.600|13581.000|13661.900|7675.700|7721.300|98.300|106.800|
|1024|92673.300|93478.200|20166.600|20245.900|14834.200|14928.300|94.800|101.600|

主表仅展示至 0.001 ms，完整数值保留于共享数据及逐轮附录；显示位数不是测量精度声明。

![BASELINE002](../figures/model_combined_wall.svg)

这是可观测组合墙钟图，不是可加和 GPU stacked breakdown。真实输出 token、tokens/s、纯 prefill/decode、dispatch/token 与可信 kernel 时间表仍受接口或证据限制。PROFILE002 保留结构；PROFILE003/TIMING002 重叠不能生成独占排名。TRACE001 未找到本机可用执行时间线源。

## 内存：不同口径不相加

十五会话分别记录 JS heap、逻辑 buffer 和 texture。MEMORY001 覆盖 7500 个已记录 texture，累计创建 1,707,579,096 bytes、活跃账面峰值 1,707,566,808 bytes（MODEL_INIT）。初始化前 observer 未安装的资源写 UNAVAILABLE，不写零。JS used=10,000,000 bytes 的重复读数不证明没有增长。

MEMORY002 v2 是一次 PROTOCOL_PASS_WITH_CONDITION_WARNING，初始化后台切换 5606.1 ms；browser/GPU 进程观察与页面 renderer 映射分开，后者 UNKNOWN。RSS/PSS 不能称为模型独占或物理 GPU 内存，五次进程重复未完成。私有系统原文留在本地忽略目录。

[memory001_texture_accounting.md](../../docs/zh-CN/memory001_texture_accounting.md) · [memory002_v2_pilot_results.md](../../docs/zh-CN/memory002_v2_pilot_results.md)

## Part 2：实现与解释

矩阵 A/B/C 是输入输出，版本 A/B/C/D 是实现：naive、shared tiled、vec4 tiled、fused QROW dequant。合成 unsigned Q4/Q8 不是 Gemma 原生格式。FP16 accumulator 与 f32 输出 carrier 分开；区分用例得到 2048 而 FP32 为 2050。代表性 M=1/128,K=N=1024 不是真实有效模型层；GEMM004 是执行/padded M=8,K=1536,N=2048 的 FP32 补充。

|候选|工作组 x×y|invocation 数|输出 tile 行×列|K tile|共享 bytes|
|---|---|---|---|---|---|
|A-original|8×8|64|8×8|scalar|0|
|B-16x16-K16|16×16|256|16×16|16|1024|
|B-8x8-K8|8×8|64|8×8|8|256|
|B-32x8-K16|32×8|256|8×32|16|1280|
|C/D-8x8-K16|8×8|64|8×32|16|1280|
|C/D-4x8-K16|4×8|32|8×16|16|768|
|C/D-8x16-K16|8×16|128|16×32|16|1536|

|Q|M|B|C|D|
|---|---|---|---|---|
|Q4|1|B-8x8-K8|C-8x8-K16|D-4x8-K16|
|Q4|128|B-32x8-K16|C-8x8-K16|D-8x16-K16|
|Q8|1|B-32x8-K16|C-8x8-K16|D-4x8-K16|
|Q8|128|B-8x8-K8|C-8x16-K16|D-8x16-K16|

五会话各候选 10 warm-up、30 measured；共核验 5000 个时间戳和 232985 个导出小输出。大矩阵依据在线全量检查，离线仅独立复算已导出的小输出及记录。绝对时间和同轮比值的完整 125 行见附录，不合并五轮样本成一个 median。

B 选定相对原配置在四组五轮均改善，却不保证快于 A。M=128 D 两种格式选定配置五轮改善；M=1 D 有负向与反转。Q8 M=128 C 全在一个 65.536 µs 网格内，暂不能区分。Q4 pilot M=1 A/C median 差恰为一个网格，不声称稳定小幅收益。

![Part 2](../figures/kernel_session_medians.svg)

![Part 2](../figures/kernel_variation.svg)

五轮只测 prepared-input kernel-only。此前完整路径 pilot 每次 CPU 反量化/布局转换/必要上传：D kernel-only 慢于 C，但完整路径明显更快；不能用于权重一次准备后复用，也不等于模型加速。不能把准备 median 加 kernel median 变成完整路径 median。

源码证明共享存储、barrier、vec4 和解包结构；缓存、DRAM 流量、并行度或调度原因仍是假设。名义 2MNK/pass GFLOP/s 不是峰值利用率，有效 GB/s 口径未完成，不填物理流量。

## 审阅与复现入口

- [项目阅读指南](../../docs/zh-CN/reading_guide.md)
- [Part 2 计算契约](../../docs/zh-CN/part2_compute_contract.md)
- [测量契约与统计解释](../../docs/zh-CN/measurement_contract.md)
- [五轮结果：收益、负向和不确定性](../../docs/zh-CN/part2_repeat_results.md)
- [证据与公开范围索引](../../docs/zh-CN/evidence_index.md)
- [复现与离线核验](../../docs/zh-CN/reproduction.md)

[完整逐轮附录](../../docs/zh-CN/results_appendix.md)

本报告正文模板人工维护，数值表自动读取共享 stage_delivery_data.json；脚本只负责展示。本轮不运行手机、模型或 benchmark。
