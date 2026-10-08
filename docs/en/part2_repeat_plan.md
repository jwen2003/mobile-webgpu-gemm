# Five independent repeat sessions

The repeat experiment tests variability and direction using frozen configurations; it does not reselect parameters.

Each session reloads the page, creates a fresh session/device, and repeats preparation and warm-up. Four Q4/Q8×M=1/128 groups compare fixed A, original B/C/D, and selected B/C/D, deduplicating identical configurations for 25 candidate groups. Each session has 250 warm-up and 750 measured passes, totaling 1000 sampling passes.

Each candidate has 30 measured samples with exported fixed-seed cyclic interleaving. Only kernel-only is measured; preparation, upload, references, and output checks are outside GPU timing. The five sessions record foreground, power, and background-app conditions where available; unknowns remain UNKNOWN. Warnings, zeros, tails, and failures are retained.

Five Part 2 sessions do not replace Part 1 model or process-memory repetitions. Each session reports median/p95 and same-session ratios. Five-session ranges describe session statistics, not pooled metrics from 150 samples.

## Read next

- [Five-session results: gains, regressions, and uncertainty](part2_repeat_results.md)
- [Reproduction and offline verification](reproduction.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/part2_repeat_plan.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

|Q|M|B|C|D|
|---|---|---|---|---|
|Q4|1|B-8x8-K8|C-8x8-K16|D-4x8-K16|
|Q4|128|B-32x8-K16|C-8x8-K16|D-8x16-K16|
|Q8|1|B-32x8-K16|C-8x8-K16|D-4x8-K16|
|Q8|128|B-8x8-K8|C-8x16-K16|D-8x16-K16|
