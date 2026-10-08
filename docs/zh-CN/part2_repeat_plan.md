# 五次独立复验方法

复验用冻结配置检验波动与方向，不重新选择优化参数。

每次重新加载页面，创建新的 session/device，重新准备和 warm-up。四组 Q4/Q8×M=1/128 比较固定 A、B/C/D 原配置及选定配置，相同配置去重，共 25 个候选组。每次会话 250 warm-up、750 measured，共 1000 个采样 pass。

每候选 30 个 measured，固定种子循环交错顺序导出。只测 kernel-only；准备、上传、reference、读回校验在 GPU 区间外。五次会话维持可记录的前台、供电和后台应用条件，未知仍写 UNKNOWN；保留警告、零值、长尾和失败。

五次 Part 2 会话不能代替 Part 1 模型或进程内存重复。每会话 median/p95 和同轮比值分别报告；五轮范围是会话统计的范围，不是把 150 个样本合并后的指标。

## 接下来读什么

- [五轮结果：收益、负向和不确定性](part2_repeat_results.md)
- [复现与离线核验](reproduction.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/part2_repeat_plan.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

|Q|M|B|C|D|
|---|---|---|---|---|
|Q4|1|B-8x8-K8|C-8x8-K16|D-4x8-K16|
|Q4|128|B-32x8-K16|C-8x8-K16|D-8x16-K16|
|Q8|1|B-32x8-K16|C-8x8-K16|D-4x8-K16|
|Q8|128|B-8x8-K8|C-8x16-K16|D-8x16-K16|
