# 复现与离线核验

本轮只整理文档。以下运行步骤供以后使用，不表示本轮执行了手机或模型。

在项目根目录运行 python -m http.server 8000 --bind 127.0.0.1。USB 调试授权后执行 & "C:\Tools\platform-tools\platform-tools\adb.exe" reverse tcp:8000 tcp:8000。手机 Chrome 使用 http://localhost:8000/；不要使用电脑局域网 IP。

模型入口 /src/baseline/sessions.html?v=baseline-session-v1；Part 2 五轮入口 /src/benchmark/part2_repeat.html?v=repeat-v1。每轮重新加载并选择正确编号、记录环境、运行后下载独立 JSON。MEMORY002 另用 serve_memory002.py 及握手协议，不能用普通 HTTP server 代替控制接口。

仅重建文档：python scripts/render_bilingual_docs.py；检查：python scripts/check_bilingual_docs.py 与 python scripts/check_stage_delivery.py。已有核验脚本 verify_baseline_sessions.py、verify_part2_repeat_result.py、verify_memory001.py 支持离线核验，但其默认 CLI 会写派生记录；本轮为保持已有核验字节不变只调用只读 audit/verify 接口。图表仍共享 report/figures，由 plot_stage_report.py 读取共享阶段数据。

干净 clone 没有模型、local vendor 和私有 adb/DevTools 原文，须按来源准备；仅公开派生数据可直接阅读。不能将私有证据缺失误称核验失败，也不能声称干净 clone 可复现私有采样。

## 接下来读什么

- [本地模型与 runtime 准备](model_preparation.md)
- [证据与公开范围索引](evidence_index.md)
- [MEMORY002 v2 冻结采集协议](memory002_capture_protocol.md)

## 来源与维护

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)
