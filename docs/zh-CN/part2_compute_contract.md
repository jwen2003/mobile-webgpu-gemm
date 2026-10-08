# Part 2 计算契约

冻结版本为 PART2-QROW-v1。原题第 2 页要求 Q4/Q8 → 反量化 → GEMM → FP16 accumulation；A 为 naive，B 为共享存储 tiled，C 为 vectorized loads，D 为 fused dequant + GEMM。下面未由原题指定的格式是项目实验选择。

计算 C[m,n]=sum_k A[m,k]*B[k,n]，A[M,K]、Q[K,N]、C[M,N] 均行优先。不转置、不含 bias/activation、不折叠 batch/head。性能 shape 为代表性 M=1/128、K=N=1024；不是已确认的真实有效模型层。GEMM004 的 M=8,K=1536,N=2048 仅是执行/padded shape 补充。

QROW 是合成 unsigned Q4（0..15）或 Q8（0..255），不是 Gemma 原生格式。每 u32 装 32/bits 个相邻 N 元素，低位先放，shift=bits*(n mod (32/bits))；word 索引 k*ceil(N/(32/bits))+floor(n/(32/bits))。每行独立，尾部高位补零，不跨行 packing。整数 q 本身不做符号扩展；负权重来自 q-zeroPoint。

group size=32，沿 K 分组、每输出列独立。scale 和 zeroPoint 索引 floor(k/32)*N+n，形状 [ceil(K/32),N]；scale 保存 binary16，zeroPoint 保存 u32。短 K 尾组只处理有效元素。B16=RN16((int(q)-int(zp))*decodeHalf(scale))；先整数相减，再乘实际存储 scale，再按 ties-to-even 转 FP16。

activation 保存 binary16。所有版本按递增 K 使用 f16 accumulator 和显式 fma；C/D 四个分量各自保持同样顺序，不用 dot 改变归约。输出数值为 binary16，写入 f32 carrier 后读回。WGSL 允许的融合和 subnormal 行为可能与 canonical CPU 模拟不同；不承诺一般输入逐位一致，也不把 shader-f16 feature 等同于实测累加路径。

固定 xorshift32 种子 0x2ab00117。精确族 A=-1/0/1、scale=1、q 在 zeroPoint 附近；非整数族 A 为 [-16,16]/64，Q4 scale=1/32，Q8 scale=1/512，zeroPoint 为中点附近。输入先转实际存储精度。K 上限 1024，不在失败后缩小范围。FP16 区分用例输出 2048，而 FP32/high reference 为 2050。

独立 reference 包含 binary64 数学累加、canonical RN-even FP16 每步 fma，以及逐步 FP32 oracle。精确用例 atol=rtol=0；非整数语义 atol=0.02、rtol=0.01；high/FP32 atol=rtol=0.04；relative 分母下限 1e-8。FP32 fallback 为 0.0002/0.0002，另报不算规定路径。区分 probe 单独允许误差 2；不用于一般用例。逐元素条件为 abs(error)<=atol+rtol*abs(reference)，另查非有限值。

A/B/C 从同一 packed 输入预反量化；C 还将 B16 补齐为 vec4 布局。D 在 shader 内解包、反量化，不创建完整 B16 中间矩阵。A/B 使用 16-byte uniform [M,N,K,0]；C/D 的扩展参数以实际源码为准。所有 buffer 按 WebGPU 对齐与 device limits 检查；不支持时明确记录，不静默改 tile。

## 接下来读什么

- [版本 C：向量化 tiled GEMM](part2_vectorized_c.md)
- [版本 D：融合反量化及两种计时口径](part2_fused_d.md)
- [Q8 路径与 Q4 的关系](part2_q8.md)
- [测量契约与统计解释](measurement_contract.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/part2_compute_contract.md)。

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

|Resource|Type|Logical payload / index|
|---|---|---|
|activation|f16|2*M*K bytes; m*K+k|
|packed Q|u32|4*K*ceil(N/(32/bits)) bytes|
|scale|f16|2*ceil(K/32)*N bytes; floor(k/32)*N+n|
|zeroPoint|u32|4*ceil(K/32)*N bytes; floor(k/32)*N+n|
|prepared B16 (A/B)|f16|2*K*N bytes|
|prepared B16 (C)|vec4<f16>|8*K*ceil(N/4) bytes|
|output|f32 carrier|4*M*N bytes; m*N+n|

表内是有效逻辑 payload；GPU 上传按需要补齐对齐字节，额外 padding 单独记录，不改变 q/scale 数值。D 不创建完整 prepared B16。当前 D uniform 实际为 [M,N,K,rowWords] 共 16 bytes；早期 32-byte future schema 是历史草案，不是当前运行绑定。

[WGSL floating evaluation](https://www.w3.org/TR/2026/CRD-WGSL-20260703/#floating-point-evaluation) · [fma](https://www.w3.org/TR/2026/CRD-WGSL-20260703/#fma-builtin)
