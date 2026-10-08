# MEMORY002 v2 phone pilot — PROTOCOL_PASS_WITH_CONDITION_WARNING

One128-token session, page COMPLETE, errors empty. Required protocol stages4/4 covered (PAGE_IDLE, AFTER_INIT, GENERATION commands, AFTER_DRAIN); additional BEFORE_GENERATION snapshot retained. Five snapshots, ten valid browser/GPU per-process readings, ten owned debug forwards cleaned. This validates the observed capture protocol for one pilot, not model-exclusive/physical GPU memory, continuous peak, or five independent memory repetitions. Old MEMORY002 pilot remains PARTIAL unchanged.

## Separate process values and idle differences

All values KiB (Android reported KB, multiply1024 for bytes). Differences computed only for same PID AND OS start-tick identity as idle. No cross-process sum.

| Stage | Process | PID | PSS | ΔPSS vs idle | RSS | ΔRSS vs idle |
|---|---|---:|---:|---:|---:|---:|
| PAGE_IDLE | BROWSER_MAIN | 14567 | 249919 | +0 | 429182 | +0 |
| PAGE_IDLE | GPU | 11306 | 162986 | +0 | 304373 | +0 |
| AFTER_INIT | BROWSER_MAIN | 14567 | 239975 | -9944 | 423966 | -5216 |
| AFTER_INIT | GPU | 11306 | 2163859 | +2000873 | 2446557 | +2142184 |
| BEFORE_GENERATION | BROWSER_MAIN | 14567 | 230188 | -19731 | 414202 | -14980 |
| BEFORE_GENERATION | GPU | 11306 | 2158928 | +1995942 | 2441669 | +2137296 |
| GENERATION | BROWSER_MAIN | 14567 | 229729 | -20190 | 413946 | -15236 |
| GENERATION | GPU | 11306 | 2693656 | +2530670 | 2976429 | +2672056 |
| AFTER_DRAIN | BROWSER_MAIN | 14567 | 229605 | -20314 | 413822 | -15360 |
| AFTER_DRAIN | GPU | 11306 | 2167082 | +2004096 | 2449841 | +2145468 |

These differences are process-memory observations under recorded conditions, not a isolated causal estimate of model allocations. PSS includes apportioned shared pages; RSS cross-process addition can duplicate shared pages. JS heap, logical GPUBuffer bytes and texture payload are separate channels and are not added to these readings. Browser decreases must not be interpreted as model freeing memory. GPU increases are not physical GPU residency.

## Stage and timing evidence

Page session03292c53-e0e3-4fac-919f-7e4dd3e06e82 and final page history match every host-received stage marker. Qualified idle receipt preceded MODEL_INIT. Held-stage marker identity remained unchanged during each capture, and final page history confirms sequence. Every required phase has its own independent commands/receipts; snapshots are sequential, not atomic.

| Stage | Total collector time ms |
|---|---:|
| PAGE_IDLE | 8471.387 |
| AFTER_INIT | 8380.464 |
| BEFORE_GENERATION | 8554.393 |
| GENERATION | 10649.233 |
| AFTER_DRAIN | 8588.826 |

Collector duration includes metadata checks and operator arm wait where applicable; do not call it phase/kernel latency. Individual command UTC windows are preserved in derived audit. Generation page window10:10:58.499Z–10:11:06.200Z (UTC evidence times). Browser/GPU commands fit entirely within generation under bracketing observed clock bounds and2ms boundary guard:

| Process | Host UTC command start | Host UTC command end | Host−phone offset envelope ms | Uncertainty width ms |
|---|---|---|---|---:|
| BROWSER_MAIN | 2026-10-06T10:10:59.715450+00:00 | 2026-10-06T10:10:59.902208+00:00 | -444.461 to -415.486 | 28.975 |
| GPU | 2026-10-06T10:10:59.406133+00:00 | 2026-10-06T10:10:59.567928+00:00 | -444.461 to -415.486 | 28.975 |

Classification is GENERATION_WITHIN_OBSERVED_CLOCK_BOUND, conditional on the frozen no-unobserved-clock-step/drift assumption and causal nonnegative transfer. No exact clock synchronization or default zero offset claimed. Other/mixed/failed records would remain unknown; none of these two required generation command windows crossed the bounded stage interval. This is sparse point-window coverage, not continuous peak sampling.

## Conditions, role limits and completeness

Initialization entered background for5,606.1ms (10:04:26.739Z–10:04:32.345Z UTC). Preserve this condition warning; do not present fixed-foreground stock performance or silently rerun/replace the trial. Manual DevTools field “未开启” is the user-reported UI state; automated bounded CDP metadata connections did occur and are recorded separately. Thermal “未明显发热，温度未测量”; charging93%; WebGPU developer flag “已停用”; VPN active, no other deliberately running background apps reported.

Fresh browser14567 and GPU11306 role checks succeeded before/after all five snapshots, no PID set or start-tick changes observed. Renderer11292 has known renderer process role but target association UNKNOWN. Zygote11256 strict meminfo attribution UNAVAILABLE (missing identity header), preserved raw status/meminfo rather than zero-filled. No resource role inferred from a single renderer or historical PID.

## Page walls (instrumented context only)

| Metric | ms |
|---|---:|
| runtimePreparationMs | 50.900 |
| modelInitializationMs | 92847.100 |
| tokenPreparationMs | 62.500 |
| tokenPreparationDrainMs | 3.100 |
| generationCallToCompletionMs | 7701.000 |
| firstCallbackMs | 2250.800 |
| postGenerationDrainMs | 58.900 |

Holds and handshake excluded from the existing initialization/generation/drain boundaries, but instrumentation and the background transition affect conditions. First callback is not pure prefill; callback counts are not output tokens. Model file size and logical payload are not process residency.

## Preservation and remaining requirements

Raw page byte hash `c7b4e48005cd0c335da3d1d770dd38beed6c0297f6252860462947adaa82ef9a`. [Derived verification](../results/analysis/memory002_v2_pilot_verification.json) and [evidence hashes](../results/analysis/memory002_v2_evidence_sha256.json) preserve private input provenance. System/protocol originals stay under ignored results/local/adb_memory, not published. Each raw command hash and all10 cleanup records verified; historical42 page/raw files and158 old private pilot artifacts unchanged before adding this new page. No extra phone experiment/replacement run was started.

Remaining: protocol observation is one pilot only, with a foreground-condition warning. Five independent memory repetitions remain open; direct target renderer mapping, model-exclusive memory, physical GPU residency and continuous peak unavailable. Part1 kernel/phase/token/Adreno gaps remain unaffected. No further experiment scheduled or auto-commit/push in this result processing. Reproduce locally with preserved private inputs: python scripts/verify_memory002_v2_pilot.py.

Publication: the original v2 page JSON remains local and ignored. Only this report, derived verification and evidence hashes are published. Verification requires the preserved private inputs; no raw page/device payload is included in this commit.
