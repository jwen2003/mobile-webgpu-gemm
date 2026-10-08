# MEMORY001：texture 逻辑 payload

仅从 BASELINE002 已归档资源描述与生命周期核算，不重跑模型。payload 是逻辑 texel 数据量，不是物理分配或上传 row padding。

每 texel：rgba8uint=4 bytes；rgba16uint/rgba16float=8；rgba32uint/rgba32sint/rgba32float=16。依据 WebGPU 格式定义，逐 mip 累加宽×高×层/深度×sampleCount×每 texel bytes。2D array 的层数不随 mip 缩小；3D depth 随 mip 缩小。缺 dimension、extent、层数、mip 或 sample 字段时 UNAVAILABLE，不用默认猜测。

十五次会话各 500 个 texture，共 7500 个，已记录资源覆盖 100%。累计创建 payload 为 1,707,579,096 bytes；可重建活跃峰值为 1,707,566,808 bytes，发生在 MODEL_INIT。累计创建不等于峰值。初始化前 observer 未安装，texture/buffer 不可得而不是 0。

JS heap API 在记录中反复给出 used=10,000,000 bytes，这不是没有内存增长的证明。buffer、texture 逻辑快照分别报告；显式 destroy 后账面下降不证明物理释放或泄漏。未观测 native/WASM 整体、物理 GPU 驻留和其它未捕获资源。

## 接下来读什么

- [BASELINE002：十五次模型会话结果](baseline_sessions_results.md)
- [MEMORY002 v2：有条件协议通过](memory002_v2_pilot_results.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/memory001_texture_accounting.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

[完整逐会话数据附录](results_appendix.md)

|format|bytes / texel|creations / session|
|---|---|---|
|rgba8uint|4|6|
|rgba16uint|8|91|
|rgba16float|8|165|
|rgba32uint|16|227|
|rgba32sint|16|9|
|rgba32float|16|2|

实际手机记录全部是 2D、单层、单 mip、单 sample；array/3D/multisample 规则仅由离线合成测试核验，不冒充手机观察。生命周期按 sequence 重建，snapshot 时间相同时用已有计数约束；候选前缀 payload 不唯一才写 UNAVAILABLE。


[WebGPU texture format definitions](https://www.w3.org/TR/webgpu/#texture-formats)

[memory001_texture_payload.json](../../results/analysis/memory001_texture_payload.json) · [verify_memory001.py](../../scripts/verify_memory001.py)
