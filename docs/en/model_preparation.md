# Local model and runtime preparation

Model and runtime resources are served locally, but large weights, download caches, and node_modules are not committed. Obtain official model access first.

The specified gemma-3n-E2B-it-int4-Web.litertlm resides in assets/models/. Its actual size is 3,038,117,888 bytes and SHA256 is b6c8e1081ec80730f14473a5ece941b48da5d8e2a80c97c2963da153f3eff3d2. The filename must contain -Web; do not substitute the Android artifact. This is local identity verification, not a claim of comparison with a publisher checksum.

Log into the official Hugging Face page, accept its license, and manually download to that directory. Do not bypass access restrictions or write tokens into code or logs. GenAI JS and WASM are both pinned to 0.10.29 and prepared locally according to the manifest, never latest. Source provenance is recorded, but an immutable model main revision was not saved.

PowerShell checks: Get-Item assets/models/gemma-3n-E2B-it-int4-Web.litertlm | Select-Object Length; Get-FileHash assets/models/gemma-3n-E2B-it-int4-Web.litertlm -Algorithm SHA256. Model file size is not runtime memory.

## Read next

- [Reproduction and offline verification](reproduction.md)
- [Environment and provenance](environment.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/assets/models/README.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

[model_manifest.json](../../assets/models/model_manifest.json)

[Hugging Face](https://huggingface.co/google/gemma-3n-E2B-it-litert-lm/blob/main/gemma-3n-E2B-it-int4-Web.litertlm)
