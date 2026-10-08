# Remaining-metric feasibility review

This bounded review uses existing interfaces and evidence without running the model or expanding the profiler. UNKNOWN values are not replaced by estimates.

Actual output tokens: public APIs expose no IDs/count. Internal DECODED_IDS is an unvalidated lead, not an available measurement entry. Retokenizing text does not recover the actual generated sequence. Prefill/decode: the public generation call has no reliable separate boundaries. First callback is not pure prefill, and callback count is not token count.

Chrome/Dawn CPU submission events may reveal host structure, but are not GPU execution time or automatic shader attribution. TRACE001 found no proven execution timeline source on this phone, so a trustworthy stacked breakdown remains unavailable. A minimal next validation must establish a real token/phase hook or timeline-to-target-dispatch mapping, not gather more wall times of the same scope.

## Read next

- [TRACE001 data-source availability](trace001_availability.md)
- [Assignment requirement matrix](assignment_requirements_matrix.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/remaining_metrics_feasibility.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)
