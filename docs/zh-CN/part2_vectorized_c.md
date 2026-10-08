# 版本 C：向量化 tiled GEMM

本文件解释 C 相对 A/B 的具体源码变化，而不是宣称 vec4 一定更快。

原配置 C-8x8-K16 使用 8×8 invocation，每个计算四个相邻输出列，输出 tile 为 8×32，K tile 为 16。共享 A 为 8×16 个 f16，共享 B 为 16×8 个 vec4<f16>，合计 1280 bytes。加载后和使用后各一次 barrier；尾部补零，最终按列逐分量检查 store。

CPU 准备 C 的 vec4 B16 布局，row stride 为 ceil(N/4)，额外 padding 和转换资源单独记录。各分量仍按递增 K 执行 f16 fma；没有改变归约顺序。源码同时改变输出映射、加载和每线程工作量，不能把观察归因为单一硬件向量指令。

手机 A/B/C pilot 已通过当前合成契约，五轮复验见结果文档。Q8、fused D 后来分别接入；历史 NOT_RUN 是实现准备时的状态。M=1 A/C 的网格内差异和跨轮方向变化保留，不认定稳定小幅收益。

## 接下来读什么

- [Part 2 计算契约](part2_compute_contract.md)
- [五轮结果：收益、负向和不确定性](part2_repeat_results.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/part2_vectorized_c.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

|候选|工作组 x×y|invocation 数|输出 tile 行×列|K tile|共享 bytes|
|---|---|---|---|---|---|
|A-original|8×8|64|8×8|scalar|0|
|B-16x16-K16|16×16|256|16×16|16|1024|
|B-8x8-K8|8×8|64|8×8|8|256|
|B-32x8-K16|32×8|256|8×32|16|1280|
|C/D-8x8-K16|8×8|64|8×32|16|1280|
|C/D-4x8-K16|4×8|32|8×16|16|768|
|C/D-8x16-K16|8×16|128|16×32|16|1536|
