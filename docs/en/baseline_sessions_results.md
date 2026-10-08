# BASELINE002: fifteen model-session results

All fifteen independent sessions are COMPLETE, with nonempty output, normal completion, and empty error records. These are observable wall-clock results, not numerical verification or completion of the entire assignment.

The tokenizer verified complete input lengths of 128/512/1024, with five sessions each. Initialization is separate from generation. Generation wall time combines work inside the public API, including prefill and decode, and cannot be split into pure phases. First-callback delay is named only by its event boundary.

The public API does not expose actual generated token IDs/counts. Characters, callback counts, or retokenized output are not used for tokens/s. Per-session tables appear in the appendix. JS heap, buffers, textures, and process observations are reported separately, never summed as physical GPU memory.

## Read next

- [MEMORY001: logical texture payload](memory001_texture_accounting.md)
- [MEMORY002 v2: conditional protocol pass](memory002_v2_pilot_results.md)
- [Remaining-metric feasibility review](remaining_metrics_feasibility.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/baseline_sessions_results.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

[Complete session-data appendix](results_appendix.md)
