# Project overview

This project studies model observation and matrix multiplication in Android Chrome with WebGPU. Separate the assignment target, supplemental experiments, and the scope actually demonstrated.

Overall status is PARTIAL. Part 1 runs the Gemma 3n E2B Web model with a fixed MediaPipe runtime. Part 2 compares custom WGSL FP16 implementations A–D using synthetic Q4/Q8 weights. These are separate execution paths; an isolated kernel improvement does not demonstrate model acceleration.

There are five model sessions at each of three full-prompt lengths and five independent Part 2 repeat sessions. Measurements used Mali; the assignment target Adreno has not been tested. Actual generated tokens, isolated prefill/decode, a trustworthy kernel breakdown, and five process-memory repetitions remain missing.

## Read next

- [Reading guide](reading_guide.md)
- [Assignment requirement matrix](assignment_requirements_matrix.md)
- [Reproduction and offline verification](reproduction.md)
- [Environment and provenance](environment.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/README.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)
