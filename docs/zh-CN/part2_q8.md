# Q8 路径与 Q4 的关系

Q8 复用 Q4 A–D 框架，但格式、stride 和输入范围有明确区别。

Q8 是 unsigned 0..255，每 u32 四个 code，行 stride=ceil(N/4)，掩码 255、shift=8*(n mod 4)。Q4 每 word 八个 code。二者都是低位先放、按行 packing、K group=32；负权重由 unsigned code 减 zeroPoint 得到，不进行二补码符号扩展。

Q8 非整数 scale=1/512，以约束较宽 code 范围下的幅度；activation 和 f16 fma 顺序、输出 carrier、reference 与冻结阈值保持契约。CPU 验证覆盖极值、零、word/row/group 尾部；Q4 回归仅做必要正确性，不重新采全部性能。

Q8 手机 A–D 已通过，随后完成 sweep 和五轮同轮复验。Q4/Q8 不同历史会话之间的差异只能描述，不能作受控格式因果结论；每个 speedup 的分母来自同一轮。两种格式都不是 Gemma 原生量化。

## 接下来读什么

- [Part 2 计算契约](part2_compute_contract.md)
- [有限 sweep 结果与冻结选择](part2_sweep_results.md)
- [五轮结果：收益、负向和不确定性](part2_repeat_results.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/part2_q8.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)
