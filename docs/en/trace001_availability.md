# TRACE001 data-source availability

Separate documented capabilities from sources actually registered and accessible on this phone. No model trace was captured.

Actual Perfetto v49 queries found android.gpu.memory, but not gpu.renderstages, gpu.counters, or relevant vendor execution sources. Ordinary shell access to tracefs is restricted and the debug path is unavailable. Configuration-conversion failures remain recorded; no permission changes or root were used.

A GPU-memory source does not establish an execution timeline, much less WebGPU dispatch/shader mapping. The current execution timeline is unavailable and operator attribution UNKNOWN. This bounds the phone’s current permission path, not all platforms. The kernel-breakdown gap remains and work proceeds to reporting.

## Read next

- [Remaining-metric feasibility review](remaining_metrics_feasibility.md)
- [Timestamp validity and bounded conclusion](timestamp_validity.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/trace001_availability.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)
