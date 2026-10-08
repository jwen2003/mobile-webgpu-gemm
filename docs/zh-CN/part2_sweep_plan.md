# 有限 sweep 的冻结方案

sweep 只选择待复验候选，不是在中途无限调参。

范围固定 Q4/Q8、M=1/128、K=N=1024。A 保持原配置；B/C/D 各最多三个候选，包含原配置。候选先过小矩阵、边界和 FP16 区分检查，再按 device limits 验证 invocation、共享存储和 buffer 要求。失败及 UNSUPPORTED 保留，不放宽阈值。

每候选 10 warm-up、30 measured，仅 prepared-input kernel-only。按固定 seed 0x53575001 派生顺序，循环位置平衡；实际顺序导出，不假设每一对候选先后完全一致。预算 1600 个采样 pass，加 420 个正确性 pass。

预设选择正确性通过后的最低 median；与最低值相差不超过 65,536 ns 时暂不能区分，优先原配置。sweep 结果不能当稳定收益；选定结果在五轮复验前冻结，不依据复验再换候选。

## 接下来读什么

- [有限 sweep 结果与冻结选择](part2_sweep_results.md)
- [五次独立复验方法](part2_repeat_plan.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/part2_sweep_plan.md)。

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
