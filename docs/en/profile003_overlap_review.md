# PROFILE003 offline overlap review

This offline review checks neighboring timestamps, submission links, and query lifecycles without altering intervals to make them additive.

The review examines unique query indices, resolve/copy ordering after writes, repeated submissions, stale reads, and BigInt unit conversion. No proven implementation bug explaining all overlap was found. Neighboring intervals are grouped by command buffer, submit, and cross-submit relationship; shared diagnostics retain anomaly IDs.

Overlap is not attributed to quantization merely because it is within one grid; larger overlaps also exist. TIMING002 later reproduced the issue with independent vector-add controls. PROFILE003 is not used for exclusive kernel rankings, additive breakdowns, or bottleneck attribution.

## Read next

- [Timestamp validity and bounded conclusion](timestamp_validity.md)
- [TRACE001 data-source availability](trace001_availability.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/profile003_overlap_review.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)
