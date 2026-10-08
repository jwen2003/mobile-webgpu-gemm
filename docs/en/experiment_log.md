# Historical experiment timeline and current conclusions

The log preserves original order and does not overwrite NOT_RUN, INCOMPLETE, or failures. This is a bilingual reading timeline; original detailed narratives and all tables remain in byte-preserved historical snapshots.

Separate contemporaneous status from current conclusions: COMPUTE/TIMING capability validation, supplemental FP32 GEMM, QROW Part 2, stock-model sessions, and memory observations each have distinct acceptance scopes. Earlier “not yet run” text is not the status of current entry points.

Failures include incomplete PROFILE002 capture, initial incomplete SHAPE001, two sweep compilation failures, and MEMORY002 v1 PARTIAL. Fixes or later acceptance do not delete them. Overall status remains PARTIAL; later unrelated experiments do not fill unmeasured metrics.

## Read next

- [Scope of historical archive verification](archive_validation.md)
- [Evidence and publication-scope index](evidence_index.md)
- [Assignment requirement matrix](assignment_requirements_matrix.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/experiment_log.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

## Historical index in original order

States are markers present in each historical section, potentially including both preparation and execution states, not current overall status. The original preserves every paragraph and table.

|#|Experiment|Date|Historical markers|Original section|
|---|---|---|---|---|
|1|ENV001|2026 10 03|Narrative in original|[L3](../history/original/docs/experiment_log.md)|
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
|15|Stage record|—|Narrative in original|[L285](../history/original/docs/experiment_log.md)|
|16|SHAPE001|2026-10-05|INCOMPLETE, UNKNOWN, NOT_RUN|[L295](../history/original/docs/experiment_log.md)|
|17|SHAPE001|2026-10-05|COMPLETE|[L304](../history/original/docs/experiment_log.md)|
|18|TIMING002|2026-10-05|PASS, UNKNOWN|[L315](../history/original/docs/experiment_log.md)|
|19|GEMM004|—|NOT_RUN, UNKNOWN|[L332](../history/original/docs/experiment_log.md)|
|20|GEMM004|2026-10-05|PASS|[L337](../history/original/docs/experiment_log.md)|
|21|PART2AB, PART2-QROW-|—|Narrative in original|[L355](../history/original/docs/experiment_log.md)|
|22|PART2AB|2026-10-05|PASS, NOT_RUN|[L360](../history/original/docs/experiment_log.md)|
|23|PART2ABC|—|Narrative in original|[L378](../history/original/docs/experiment_log.md)|
|24|PART2ABC|2026-10-05|COMPLETE, NOT_RUN, PASS|[L383](../history/original/docs/experiment_log.md)|
|25|PART2ABCD|—|NOT_RUN|[L401](../history/original/docs/experiment_log.md)|
|26|PART2ABCD|2026-10-05|NOT_RUN, PASS|[L412](../history/original/docs/experiment_log.md)|
|27|Stage record|—|PASS, NOT_RUN|[L438](../history/original/docs/experiment_log.md)|
|28|PART2Q8ABCD|2026-10-05|COMPLETE, PASS|[L449](../history/original/docs/experiment_log.md)|
|29|Stage record|—|UNSUPPORTED, COMPLETE|[L474](../history/original/docs/experiment_log.md)|
|30|PART2SWEEP|2026-10-06|COMPLETE_WITH_FAILURES, PASS, UNSUPPORTED|[L488](../history/original/docs/experiment_log.md)|
|31|Stage record|2026-10-06|COMPLETE_WITH_FAILURES, PASS|[L532](../history/original/docs/experiment_log.md)|
|32|Stage record|2026-10-06|COMPLETE, PASS|[L574](../history/original/docs/experiment_log.md)|
|33|Stage record|—|COMPLETE, NOT_RUN|[L633](../history/original/docs/experiment_log.md)|
|34|PART2REPEAT|—|COMPLETE, PASS, INCOMPLETE|[L638](../history/original/docs/experiment_log.md)|
|35|PART2REPEAT|—|COMPLETE, PASS, INCOMPLETE|[L682](../history/original/docs/experiment_log.md)|
|36|PART2REPEAT|—|COMPLETE, PASS, INCOMPLETE|[L752](../history/original/docs/experiment_log.md)|
|37|PART2REPEAT|—|COMPLETE, PASS, INCOMPLETE|[L822](../history/original/docs/experiment_log.md)|
|38|Stage record|—|COMPLETE, PASS|[L892](../history/original/docs/experiment_log.md)|
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
|59|Stage record|2026-10-06|PARTIAL, BLOCKED, NOT_RUN|[L1893](../history/original/docs/experiment_log.md)|
