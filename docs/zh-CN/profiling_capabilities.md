# 固定 runtime 的可观测性

审查固定 0.10.29 的 genai.d.ts、bundle、loader 和官方源码，区分公开接口与内部潜在线索。

sizeInTokens 提供输入计数，不提供真实生成 IDs/count。generateResponse 的文本 callback 不是 per-token 事件。输出重新分词不恢复生成时 token 序列。公开接口没有可信的独立 prefill/decode 计时边界。maxTokens 原 512 容量不足 1024 输入，BASELINE002 后来使用 2048 总容量。

PROFILE002 在初始化前安装可恢复的计数包装，保持 native this/参数/返回/异常。按 MODEL_INIT、TOKEN_COUNT、GENERATION、POST_GENERATION 分类；编码 dispatch 与已提交 command buffer 的 dispatch 分开。buffer 生命周期只记逻辑分配，destroy 不是物理释放证据。

PROFILE003 注入兼容 device 并增加 timestamp-query，不覆盖原 timestampWrites。读回成功不保证多个 pass 区间可加和；TIMING002 独立复现重叠后，模型 kernel 耗时归因被界定为不可用。具体源码身份和历史审查链接保存在原文快照及分析文件。

## 接下来读什么

- [PROFILE002 shader 结构分析](profile002_shader_analysis.md)
- [剩余指标可行性审查](remaining_metrics_feasibility.md)
- [时间戳有效性与收敛结论](timestamp_validity.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/profiling_capabilities.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

## 可复查的固定版本入口

[runtime_manifest.json](../../src/baseline/runtime_manifest.json)

|Entry|Locator in 0.10.29|测量范围|
|---|---|---|
|sizeInTokens|genai.d.ts L291–300; bundle offsets57573/43195|完整输入计数，不是输出序列|
|generateResponse|genai.d.ts L200–289; JsProgressListener loader L8400|文本/done callback，不是 token 事件|
|DECODED_IDS|bundle offset49316|内部线索，未验证公开 hook|
|gpuOptions.device|genai.d.ts L535–550; bundle offset45445|公开注入 device，不改变算法|
|createWebGpuDevice|bundle offset46081|stock helper 请求 f16/可用 subgroups 和三项 buffer limits，不请求 timestamp-query|

bundle offset 是固定 UTF-8 解码文本的字符偏移，不是 byte offset。官方辅助源码 commit 04a9f7634b2800046a477fe60e26edceaa8a8849 不是已证明的 npm 构建 commit；native backend 仍未知。

[Official auxiliary llm_inference.ts](https://github.com/google-ai-edge/mediapipe/blob/04a9f7634b2800046a477fe60e26edceaa8a8849/mediapipe/tasks/web/genai/llm_inference/llm_inference.ts)
