# 项目阅读指南

本指南面向懂基本编程和计算机体系结构、但没做过此项目的读者。先用小矩阵理解映射，再读精度和测量契约。

初学路线：项目概览 → 下方小矩阵示例 → CPU/JavaScript 与 GPU/WGSL 分工 → naive → QROW 与 FP16 契约 → B/C/D → 测量契约 → 五轮结果 → Part 1 模型观察。审阅路线：当前报告 → 原题要求矩阵 → 两份契约 → 结果文档 → 原始证据及核验 → 复现说明。

设矩阵 A=[[1,2,3],[4,5,6]]，B=[[7,8],[9,10],[11,12]]，则 M=2、K=3、N=2，C=[[58,64],[139,154]]。这是帮助读代码的示例，不是新增手机实验。row-major 将一行连续存放，因此 A[row*K+k] 与 B[k*N+column] 相乘，结果写 C[row*N+column]。

gemm_naive.wgsl 的 main 使用 global_invocation_id.x 作为列、y 作为行。一个 8×8 工作组包含 64 个 invocation（一次 shader 调用）；本示例仅 (列,行)=(0,0),(1,0),(0,1),(1,1) 写四个结果，其余由边界分支返回。这个 naive shader 没有 barrier，因此提前返回合法。带共享存储和 barrier 的 B/C/D 必须让所有 invocation 参与同步，越界输出也不能跳过 barrier。

JavaScript 负责生成输入、独立 CPU reference、创建 buffer/pipeline、编码并提交 GPU 命令、读回和验证。WGSL 负责 GPU 上的数值运算。gemm_math.mjs 是 FP32 工具；part2_math.mjs 的 verify 检查冻结的精度标准；sessions.js 的 runSession 是模型会话入口。这些入口的源码链接见下方。

不要混淆矩阵 A/B/C 与版本 A/B/C/D：矩阵是输入及输出，版本是四种实现。版本 C 每个 invocation 处理四个相邻输出列；其原配置工作组为 8×8，共 64 个 invocation，输出 tile 却是 8 行×32 列。名称 C-8x8-K16 中 8×8 指工作组，K16 指归约分块。

## 接下来读什么

- [术语表](glossary.md)
- [Part 2 计算契约](part2_compute_contract.md)
- [版本 C：向量化 tiled GEMM](part2_vectorized_c.md)
- [测量契约与统计解释](measurement_contract.md)
- [五轮结果：收益、负向和不确定性](part2_repeat_results.md)
- [BASELINE002：十五次模型会话结果](baseline_sessions_results.md)
- [复现与离线核验](reproduction.md)

## 来源与维护

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

## 四个有效 invocation 的映射示例

|id.x|id.y|C index|K=3 expression|result|
|---|---|---|---|---|
|0|0|0|1*7+2*9+3*11|58|
|1|0|1|1*8+2*10+3*12|64|
|0|1|2|4*7+5*9+6*11|139|
|1|1|3|4*8+5*10+6*12|154|

## 可点击的两条路线

初学：[项目概览](README.md) → [术语表](glossary.md) → [Part 2 计算契约](part2_compute_contract.md) → [版本 C：向量化 tiled GEMM](part2_vectorized_c.md) → [版本 D：融合反量化及两种计时口径](part2_fused_d.md) → [测量契约与统计解释](measurement_contract.md) → [五轮结果：收益、负向和不确定性](part2_repeat_results.md) → [BASELINE002：十五次模型会话结果](baseline_sessions_results.md)

审阅：[当前报告](../../report/zh-CN/performance_report.md) → [原题逐项要求矩阵](assignment_requirements_matrix.md) → [Part 2 计算契约](part2_compute_contract.md) → [测量契约与统计解释](measurement_contract.md) → [五轮结果：收益、负向和不确定性](part2_repeat_results.md) → [证据与公开范围索引](evidence_index.md) → [复现与离线核验](reproduction.md)

## 实际源码入口

- [main — gemm_naive.wgsl](../../src/benchmark/gemm_naive.wgsl)
- [inputs / cpuReference / compare — gemm_math.mjs](../../src/benchmark/gemm_math.mjs)
- [main — A — part2_a_f16.wgsl](../../src/benchmark/part2_a_f16.wgsl)
- [main — B — part2_b_f16.wgsl](../../src/benchmark/part2_b_f16.wgsl)
- [main — C — part2_c_f16.wgsl](../../src/benchmark/part2_c_f16.wgsl)
- [main — D/Q4 — part2_d_f16.wgsl](../../src/benchmark/part2_d_f16.wgsl)
- [main — D/Q8 — part2_d_q8_f16.wgsl](../../src/benchmark/part2_d_q8_f16.wgsl)
- [verify / toHalf / fromHalf / pack / unpack — part2_math.mjs](../../src/benchmark/part2_math.mjs)
- [generateShader — part2_sweep_shader.mjs](../../src/benchmark/part2_sweep_shader.mjs)
- [runSession — sessions.js](../../src/baseline/sessions.js)
