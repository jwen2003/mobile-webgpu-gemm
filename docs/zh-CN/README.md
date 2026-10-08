# 项目概览

这个项目研究 Android Chrome 上的 WebGPU 模型观察与矩阵乘法实现。阅读时请先分清原题目标、补充实验和实际完成范围。

整体状态是 PARTIAL。Part 1 使用固定 MediaPipe runtime 运行 Gemma 3n E2B Web 模型；Part 2 使用自写 WGSL 比较合成 Q4/Q8 权重的 FP16 A–D 实现。二者不是同一个运行管线，独立 kernel 收益不证明模型加速。

已取得三种完整 prompt 长度各五次模型会话，以及 Part 2 五次独立复验。实测设备为 Mali；原题目标 Adreno 未测。真实输出 token、纯 prefill/decode、可信 kernel breakdown 和五次进程内存重复仍缺失。

## 接下来读什么

- [项目阅读指南](reading_guide.md)
- [原题逐项要求矩阵](assignment_requirements_matrix.md)
- [复现与离线核验](reproduction.md)
- [环境与证据来源](environment.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/README.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)
