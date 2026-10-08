# 历史实验时间线与当前结论

历史日志按原记录顺序保留，不覆盖 NOT_RUN、INCOMPLETE 或失败。这里是双语阅读版时间线，原始详细叙述和所有表格保存在字节不变的历史快照。

先区分当时状态与当前结论：COMPUTE/TIMING 的 capability 验证、FP32 GEMM 补充、QROW Part 2、stock 模型及内存观察各自有验收范围。早期“尚未运行”不会作为当前入口的状态。

失败记录包括 PROFILE002 的采集不完整、SHAPE001 初次不完整、两次 sweep 编译失败、MEMORY002 v1 PARTIAL；修复或后续验收不删除这些记录。当前整体仍 PARTIAL，未实测指标不由后来的其它实验补齐。

## 接下来读什么

- [历史归档核验的范围](archive_validation.md)
- [证据与公开范围索引](evidence_index.md)
- [原题逐项要求矩阵](assignment_requirements_matrix.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/experiment_log.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

## 按原文顺序的历史索引

状态列是该历史段出现的标记，可能同时含运行前和运行后状态，不是当前总状态；逐段完整内容以原文为准。

|#|Experiment|Date|Historical markers|Original section|
|---|---|---|---|---|
|1|ENV001|2026 10 03|原文叙述|[L3](../history/original/docs/experiment_log.md)|
|2|COMPUTE001|—|PASS|[L13](../history/original/docs/experiment_log.md)|
|3|TIMING001|—|UNKNOWN, PASS, UNSUPPORTED|[L35](../history/original/docs/experiment_log.md)|
|4|BASELINE001|—|UNKNOWN, COMPLETE|[L71](../history/original/docs/experiment_log.md)|
|5|PROFILE001|—|UNKNOWN|[L93](../history/original/docs/experiment_log.md)|
|6|PROFILE002|—|INCOMPLETE, COMPLETE|[L103](../history/original/docs/experiment_log.md)|
|7|PROFILE002|—|UNKNOWN|[L131](../history/original/docs/experiment_log.md)|
|8|PROFILE003|—|COMPLETE, UNKNOWN, INCOMPLETE|[L139](../history/original/docs/experiment_log.md)|
|9|GEMM001|—|COMPLETE, PASS, UNKNOWN, INCOMPLETE|[L163](../history/original/docs/experiment_log.md)|
|10|GEMM002|—|COMPLETE, PASS, UNKNOWN|[L198](../history/original/docs/experiment_log.md)|
|11|GEMM003|—|COMPLETE, PASS, UNKNOWN, UNSUPPORTED|[L233](../history/original/docs/experiment_log.md)|
|12|SHAPE001|—|NOT_RUN, UNKNOWN, COMPLETE|[L265](../history/original/docs/experiment_log.md)|
|13|TIMING002|—|NOT_RUN, UNKNOWN, PASS|[L271](../history/original/docs/experiment_log.md)|
|14|GEMM004|—|NOT_RUN, UNKNOWN|[L279](../history/original/docs/experiment_log.md)|
|15|阶段记录|—|原文叙述|[L285](../history/original/docs/experiment_log.md)|
|16|SHAPE001|2026-10-05|INCOMPLETE, UNKNOWN, NOT_RUN|[L295](../history/original/docs/experiment_log.md)|
|17|SHAPE001|2026-10-05|COMPLETE|[L304](../history/original/docs/experiment_log.md)|
|18|TIMING002|2026-10-05|PASS, UNKNOWN|[L315](../history/original/docs/experiment_log.md)|
|19|GEMM004|—|NOT_RUN, UNKNOWN|[L332](../history/original/docs/experiment_log.md)|
|20|GEMM004|2026-10-05|PASS|[L337](../history/original/docs/experiment_log.md)|
|21|PART2AB, PART2-QROW-|—|原文叙述|[L355](../history/original/docs/experiment_log.md)|
|22|PART2AB|2026-10-05|PASS, NOT_RUN|[L360](../history/original/docs/experiment_log.md)|
|23|PART2ABC|—|原文叙述|[L378](../history/original/docs/experiment_log.md)|
|24|PART2ABC|2026-10-05|COMPLETE, NOT_RUN, PASS|[L383](../history/original/docs/experiment_log.md)|
|25|PART2ABCD|—|NOT_RUN|[L401](../history/original/docs/experiment_log.md)|
|26|PART2ABCD|2026-10-05|NOT_RUN, PASS|[L412](../history/original/docs/experiment_log.md)|
|27|阶段记录|—|PASS, NOT_RUN|[L438](../history/original/docs/experiment_log.md)|
|28|PART2Q8ABCD|2026-10-05|COMPLETE, PASS|[L449](../history/original/docs/experiment_log.md)|
|29|阶段记录|—|UNSUPPORTED, COMPLETE|[L474](../history/original/docs/experiment_log.md)|
|30|PART2SWEEP|2026-10-06|COMPLETE_WITH_FAILURES, PASS, UNSUPPORTED|[L488](../history/original/docs/experiment_log.md)|
|31|阶段记录|2026-10-06|COMPLETE_WITH_FAILURES, PASS|[L532](../history/original/docs/experiment_log.md)|
|32|阶段记录|2026-10-06|COMPLETE, PASS|[L574](../history/original/docs/experiment_log.md)|
|33|阶段记录|—|COMPLETE, NOT_RUN|[L633](../history/original/docs/experiment_log.md)|
|34|PART2REPEAT|—|COMPLETE, PASS, INCOMPLETE|[L638](../history/original/docs/experiment_log.md)|
|35|PART2REPEAT|—|COMPLETE, PASS, INCOMPLETE|[L682](../history/original/docs/experiment_log.md)|
|36|PART2REPEAT|—|COMPLETE, PASS, INCOMPLETE|[L752](../history/original/docs/experiment_log.md)|
|37|PART2REPEAT|—|COMPLETE, PASS, INCOMPLETE|[L822](../history/original/docs/experiment_log.md)|
|38|阶段记录|—|COMPLETE, PASS|[L892](../history/original/docs/experiment_log.md)|
|39|BASELINE002|—|NOT_RUN|[L996](../history/original/docs/experiment_log.md)|
|40|BASELINE002, L128|—|COMPLETE, PASS|[L1005](../history/original/docs/experiment_log.md)|
|41|BASELINE002, L512|—|COMPLETE, PASS|[L1042](../history/original/docs/experiment_log.md)|
|42|BASELINE002|—|COMPLETE, PASS|[L1079](../history/original/docs/experiment_log.md)|
|43|BASELINE002, L512|—|COMPLETE, PASS|[L1116](../history/original/docs/experiment_log.md)|
|44|BASELINE002|—|COMPLETE, PASS|[L1153](../history/original/docs/experiment_log.md)|
|45|BASELINE002, L128|—|COMPLETE, PASS|[L1190](../history/original/docs/experiment_log.md)|
|46|BASELINE002|—|COMPLETE, PASS|[L1227](../history/original/docs/experiment_log.md)|
|47|BASELINE002, L128|—|COMPLETE, PASS|[L1264](../history/original/docs/experiment_log.md)|
|48|BASELINE002, L512|—|COMPLETE, PASS|[L1301](../history/original/docs/experiment_log.md)|
|49|BASELINE002, L128|—|COMPLETE, PASS|[L1338](../history/original/docs/experiment_log.md)|
|50|BASELINE002|—|COMPLETE, PASS|[L1375](../history/original/docs/experiment_log.md)|
|51|BASELINE002, L512|—|COMPLETE, PASS|[L1412](../history/original/docs/experiment_log.md)|
|52|BASELINE002, L512|—|COMPLETE, PASS|[L1449](../history/original/docs/experiment_log.md)|
|53|BASELINE002, L128|—|COMPLETE, PASS|[L1498](../history/original/docs/experiment_log.md)|
|54|BASELINE002|—|COMPLETE, PASS|[L1547](../history/original/docs/experiment_log.md)|
|55|MEMORY001|2026-10-06|PARTIAL|[L1873](../history/original/docs/experiment_log.md)|
|56|MEMORY002|—|COMPLETE, UNKNOWN, PARTIAL|[L1878](../history/original/docs/experiment_log.md)|
|57|MEMORY002|—|PARTIAL, UNKNOWN, NOT_RUN|[L1883](../history/original/docs/experiment_log.md)|
|58|MEMORY002|—|PROTOCOL_PASS_WITH_CONDITION_WARNING, UNKNOWN, PARTIAL|[L1888](../history/original/docs/experiment_log.md)|
|59|阶段记录|2026-10-06|PARTIAL, BLOCKED, NOT_RUN|[L1893](../history/original/docs/experiment_log.md)|
