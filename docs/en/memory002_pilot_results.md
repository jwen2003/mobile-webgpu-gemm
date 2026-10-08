# MEMORY002 v1: PARTIAL record

This historical report retains failures and usable data; the v2 protocol pass does not overwrite it.

v1 lacks a qualified pre-initialization idle snapshot, process-role queries encountered WinError 2, and generation-window/page-clock association was insufficient. Snapshots, failures, and raw logs are retained with PARTIAL status. Trustworthy idle deltas and complete phase coverage cannot be claimed.

Existing system numbers are usable only within successfully queried scope; unknown roles are not filled using old PIDs. v2 tightened gates and handshakes without retroactively turning this run into a pass or removing background-switch warnings.

## Read next

- [MEMORY002 v2 frozen capture protocol](memory002_capture_protocol.md)
- [MEMORY002 v2: conditional protocol pass](memory002_v2_pilot_results.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/memory002_pilot_results.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)
