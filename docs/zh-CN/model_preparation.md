# 本地模型与 runtime 准备

模型和 runtime 资源本地提供，但不提交大权重、下载缓存或 node_modules。需要先取得官方模型授权。

指定文件 gemma-3n-E2B-it-int4-Web.litertlm 位于 assets/models/。实际大小 3,038,117,888 bytes，SHA256 为 b6c8e1081ec80730f14473a5ece941b48da5d8e2a80c97c2963da153f3eff3d2。文件名必须含 -Web，不能使用 Android 文件替代；这是本地身份校验，不是已与发布方 checksum 对比的声明。

在 Hugging Face 官方页面登录并接受许可后手动下载至该目录。不绕过授权，不将 token 写入代码或日志。genai JS/WASM 都固定 0.10.29，本地 vendor 资源按 manifest 准备，不用 latest；记录源码来源，但未保存模型 main 的不可变 revision。

PowerShell 校验：Get-Item assets/models/gemma-3n-E2B-it-int4-Web.litertlm | Select-Object Length；Get-FileHash assets/models/gemma-3n-E2B-it-int4-Web.litertlm -Algorithm SHA256。模型文件大小不是运行内存。

## 接下来读什么

- [复现与离线核验](reproduction.md)
- [环境与证据来源](environment.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/assets/models/README.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

[model_manifest.json](../../assets/models/model_manifest.json)

[Hugging Face](https://huggingface.co/google/gemma-3n-E2B-it-litert-lm/blob/main/gemma-3n-E2B-it-int4-Web.litertlm)
