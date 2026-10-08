# 版本 D：融合反量化及两种计时口径

D 直接使用 packed QROW、scale 和 zeroPoint。需要先了解 C 的 vec4 输出映射及冻结反量化顺序。

D 沿用 C 的工作组和四列输出映射，在加载 B tile 时读取 u32 code、移位掩码、整数减 zeroPoint、乘 scale、转 f16，然后进入同样的递增 K fma。没有完整预反量化 B16 矩阵。packed FP16 解包不是 Q4 反量化；D 这里处理的是真实整数 QROW code。

kernel-only 中 A/B/C 已准备好 B16，而 D 包含解包和反量化。Q4 pilot 的 D GPU pass 慢于 C。完整路径 pilot 每次重新做 CPU 反量化、布局转换、必要上传，D 在这个口径明显更快。这不是矛盾：两个口径测的工作不同，且不能用于权重已准备并复用的情形。

每个完整路径样本真正执行准备，独立记录墙钟；不将 CPU ms 与 GPU timestamp ms 相加称 GPU 时间，不由两个 median 相加推导总路径。一次准备成本和中间矩阵 bytes 单列。D 少分配的逻辑资源不等于物理 GPU 驻留节省，也不证明 Gemma 加速。

A–D pilot 每版本 10 warm-up、30 measured，四版本的 24 种排列先各一次，再补六种，位置次数为 7/8、每对先后为 15/15，固定种子打乱并导出。kernel-only 与完整路径分别采样。后续 repeat 使用冻结的多候选循环交错方案，而不是假设所有采集沿用这 24+6 排列。

## 接下来读什么

- [测量契约与统计解释](measurement_contract.md)
- [五轮结果：收益、负向和不确定性](part2_repeat_results.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/part2_fused_d.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)
