# 有限 sweep 结果与冻结选择

先看哪些配置被选中，再查看原始样本与失败记录。完整数据仍在共享结果中。

前两次 sweep 保留 COMPLETE_WITH_FAILURES，源码使用 WGSL 保留标识符 meta 导致编译失败；修正为 quantIndex 后第三次完成。没有删除失败运行，也没有修改其 JSON。第三次文件时间为 2026-10-06T06-07-34-319Z。

冻结选择见下方表。配置名的两个数字是工作组 x/y，不一定是输出 tile：B 每 invocation 一列；C/D 每 invocation 四列。选择结果仅用于后续复验，当前性能判断以五次会话各自统计为准。

## 接下来读什么

- [五轮结果：收益、负向和不确定性](part2_repeat_results.md)
- [有限 sweep 的冻结方案](part2_sweep_plan.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/part2_sweep_results.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

|Q|M|B|C|D|
|---|---|---|---|---|
|Q4|1|B-8x8-K8|C-8x8-K16|D-4x8-K16|
|Q4|128|B-32x8-K16|C-8x8-K16|D-8x16-K16|
|Q8|1|B-32x8-K16|C-8x8-K16|D-4x8-K16|
|Q8|128|B-8x8-K8|C-8x16-K16|D-8x16-K16|
