# 术语表

术语用于说明本仓库实际实现，不用于推断底层硬件指令或模型内部结构。

GEMM 是矩阵乘法：A[M,K]×B[K,N]→C[M,N]。M 为输出行数，N 为输出列数，K 为归约长度。row-major（行优先）表示同一行的元素连续。invocation 是一次 shader 调用；工作组（workgroup）是一组可共享组内存储并同步的 invocation；dispatch 是向 GPU 提交一组工作组的命令。

tile 是分块；输出 tile 与 K 归约 tile 不同。barrier 是工作组内同步点。vectorized 指此处用 vec4 加载和处理四个相邻输出，并不证明硬件执行 vec4 指令。packed 指多个低位宽整数装入一个 u32。量化将数值表示为整数和元数据；反量化按 (q-zeroPoint)*scale 恢复近似值。

FP16 storage 表示二进制16位存储；FP16 multiplication 表示乘法的类型/精度；FP16 accumulation 表示每步累加保持 FP16 语义。这三件事不能互相替代。本项目输出数值为 FP16，但读回容器是 f32。

median 是排序后的中位数；偶数样本取中间两值的平均。nearest-rank p95 取排序后第 ceil(0.95*n) 个值，30 样本取第 29 个，五次会话取最大值。65.536 µs 是观察到的时间戳网格，不是 kernel 固定成本。两个 median 相差不超过一个网格时暂不能区分。

logical bytes 是 API 资源的账面大小；RSS 是进程驻留页，跨进程相加可重复计算共享页；PSS 按共享比例分摊，但也不是模型独占内存。UNKNOWN 是未知；UNAVAILABLE 是当前证据不能核算；NOT_MEASURED 是没有测量。

## 接下来读什么

- [测量契约与统计解释](measurement_contract.md)
- [MEMORY001：texture 逻辑 payload](memory001_texture_accounting.md)

## 来源与维护

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

|Term|解释|
|---|---|
|M / K / N|输出行 / 归约长度 / 输出列|
|row-major|行内连续，索引 row*stride+column|
|invocation|一次 shader 调用|
|workgroup|共享组内存储并同步的 invocation 集合|
|dispatch|启动工作组网格，不是一次 invocation|
|tile / barrier|分块 / 组内同步点|
|packed / dequant|多个 code 装进 word / 由 code 与元数据恢复近似值|
|FP16 accumulation|每步累加采用 f16 语义，不只是存储 f16|
