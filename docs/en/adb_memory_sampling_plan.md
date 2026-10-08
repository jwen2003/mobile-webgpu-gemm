# Process-memory sampling and role evidence

RSS/PSS observations are process-scoped. Establish process roles before page ownership. Method readiness does not satisfy formal repetition requirements.

Browser/GPU roles are checked using current command lines and start ticks. Renderer role and target-page mapping are separate. A target ID, a single renderer, or an old PID does not prove ownership. Metadata failures remain UNKNOWN rather than reusing past identities.

Raw system lists and DevTools output remain in a local ignored directory. Only derived numbers, methods, and hashes are public. Temporary debugging tunnels bind only 127.0.0.1 and inspect limited metadata, not other pages or session contents; cleanup is checked after success or failure.

Summing RSS across processes can double-count shared pages. PSS is neither model-exclusive nor physical GPU memory. Commands take time, so generation samples are windows rather than instantaneous points or continuous peaks. Windows crossing phases or lacking association are MIXED/UNKNOWN.

## Read next

- [MEMORY002 v2 frozen capture protocol](memory002_capture_protocol.md)
- [MEMORY002 v1: PARTIAL record](memory002_pilot_results.md)
- [MEMORY002 v2: conditional protocol pass](memory002_v2_pilot_results.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/adb_memory_sampling_plan.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)
