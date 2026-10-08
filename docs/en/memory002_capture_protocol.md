# MEMORY002 v2 frozen capture protocol

This protocol addresses missing idle baselines, phase handshakes, and cross-device clock association. It documents implemented gates, without scheduling a new phone experiment.

A qualified IDLE receipt is required before initialization; otherwise status is BLOCKED_UNTIL_IDLE_CAPTURE and formal capture cannot begin. Waiting points are AFTER_INIT, BEFORE_GENERATION, and AFTER_DRAIN. Record the page marker, host receipt, command start/end, and continuation after receipt.

Clock-offset intervals are bounded by bidirectional request envelopes with a 2 ms guard. Calibration is invalid if epoch/monotonic disagreement exceeds 5 ms. Generation sampling needs bracketing calibrations and the entire window inside generation; otherwise it is MIXED/UNKNOWN. The observed v2 uncertainty width of 28.975 ms is a conditional bound, not guaranteed synchronization accuracy.

Each capture rechecks PID, role, and start ticks; page ownership can separately remain UNKNOWN. Use the loopback control endpoint in serve_memory002.py, not an ordinary http.server replacement. Every forwarding cleanup is checked. Failure originals stay local, while public derivatives retain their limitations.

## Read next

- [MEMORY002 v2: conditional protocol pass](memory002_v2_pilot_results.md)
- [Reproduction and offline verification](reproduction.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/memory002_capture_protocol.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)
