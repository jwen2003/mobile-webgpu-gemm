# MEMORY001: logical texture payload

Accounting uses archived BASELINE002 resource descriptors and lifecycle events only, without rerunning the model. Payload means logical texel data, not physical allocation or upload row padding.

Bytes per texel are rgba8uint=4, rgba16uint/rgba16float=8, and rgba32uint/rgba32sint/rgba32float=16. WebGPU format definitions support summing width×height×layers/depth×sampleCount×bytes per texel across mips. 2D array layers stay constant; 3D depth shrinks with mips. Missing dimension, extent, layers, mip, or sample fields produce UNAVAILABLE, not guessed defaults.

Each of fifteen sessions records 500 textures, totaling 7500, with 100% coverage of recorded resources. Cumulative created payload is 1,707,579,096 bytes; reconstructable live peak is 1,707,566,808 bytes in MODEL_INIT. Cumulative creation is not a peak. Before observer installation, texture/buffer accounting is unavailable, not zero.

JS heap API repeatedly reports used=10,000,000 bytes; this is not proof of no growth. Buffer and texture logical snapshots are separate. Ledger decreases after explicit destroy do not prove physical release or leaks. Overall native/WASM memory, physical GPU residency, and uncaptured resources remain unobserved.

## Read next

- [BASELINE002: fifteen model-session results](baseline_sessions_results.md)
- [MEMORY002 v2: conditional protocol pass](memory002_v2_pilot_results.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/memory001_texture_accounting.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

[Complete session-data appendix](results_appendix.md)

|format|bytes / texel|creations / session|
|---|---|---|
|rgba8uint|4|6|
|rgba16uint|8|91|
|rgba16float|8|165|
|rgba32uint|16|227|
|rgba32sint|16|9|
|rgba32float|16|2|

Actual phone records are all 2D, one layer, one mip, and one sample. Array/3D/multisample rules were checked with offline synthetic tests, not observed on the phone. Lifecycle reconstruction uses sequence order, constraining snapshot ties with existing counters. Ambiguous candidate-prefix payloads would be UNAVAILABLE.


[WebGPU texture format definitions](https://www.w3.org/TR/webgpu/#texture-formats)

[memory001_texture_payload.json](../../results/analysis/memory001_texture_payload.json) · [verify_memory001.py](../../scripts/verify_memory001.py)
