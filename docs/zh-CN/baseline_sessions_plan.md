# 模型会话采集方法

BASELINE002 为原题 128/512/1024 输入长度各提供五次独立会话。长度是完整模板后的实际 tokenizer 计数。

使用 stock @mediapipe/tasks-genai@0.10.29 和已授权 Web 模型。sizeInTokens(fullPrompt) 检查完整输入；模板与正文的计数差为 8，但这不能证明内部 BOS 或 prefill tensor 长度。正文对应 120/504/1016。准备输入与 TOKEN_COUNT drain 不并入生成统计。

maxTokens=2048 是输入加输出总容量，不是输出 token 数。topK=40、temperature=0.8、randomSeed=101、numResponses=1，文本输入，无图像/音频。每新任务一次生成，生成 warm-up=0；不清空系统/浏览器/驱动缓存，初始化与 token 准备分别记录。disableRewinding 保持未覆盖的 runtime 默认，不推断 native KV/prefix cache 的隔离；新 task 是操作策略，不是内部缓存状态证明。

会话顺序固定为 128,512,1024,512,1024,128,1024,128,512,128,1024,512,512,128,1024。记录 runtime 准备、初始化、token 准备及 drain、生成调用至完成、首次 callback、生成后 drain。callback 可能含多个 token，首次 callback 不是纯 prefill。

## 接下来读什么

- [BASELINE002：十五次模型会话结果](baseline_sessions_results.md)
- [本地模型与 runtime 准备](model_preparation.md)
- [复现与离线核验](reproduction.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/baseline_sessions_plan.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)
