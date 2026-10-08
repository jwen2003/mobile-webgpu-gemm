# Reproduction and offline verification

This round only reorganizes documentation. The following steps support later reproduction; they do not mean a phone or model was run in this round.

From the repository root run python -m http.server 8000 --bind 127.0.0.1. After authorizing USB debugging, run & "C:\Tools\platform-tools\platform-tools\adb.exe" reverse tcp:8000 tcp:8000. Phone Chrome accesses http://localhost:8000/; do not use the PC LAN address.

Model entry: /src/baseline/sessions.html?v=baseline-session-v1. Part 2 repeat entry: /src/benchmark/part2_repeat.html?v=repeat-v1. Reload for each session, select the correct ordinal, record conditions, then download independent JSON. MEMORY002 uses serve_memory002.py and its handshake protocol; a plain HTTP server does not replace the control endpoint.

Documentation-only rebuild: python scripts/render_bilingual_docs.py. Checks: python scripts/check_bilingual_docs.py and python scripts/check_stage_delivery.py. Existing verify_baseline_sessions.py, verify_part2_repeat_result.py, and verify_memory001.py support offline checks, but their default CLIs write derived records. To preserve existing verification bytes this round uses read-only audit/verify interfaces. Figures remain shared in report/figures, read from stage data by plot_stage_report.py.

A clean clone lacks model weights, local vendor resources, and private adb/DevTools originals; prepare authorized resources from their sources. Public derivatives remain readable directly. Missing private evidence is not the same as a failed verification, and private captures cannot be reproduced from a clean clone alone.

## Read next

- [Local model and runtime preparation](model_preparation.md)
- [Evidence and publication-scope index](evidence_index.md)
- [MEMORY002 v2 frozen capture protocol](memory002_capture_protocol.md)

## Sources and maintenance

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)
