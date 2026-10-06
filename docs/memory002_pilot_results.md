# MEMORY002 process-memory pilot — PARTIAL_PILOT_VERIFIED

Page status COMPLETE; one instrumented 128-token session. Independent page lifecycle/resource audit PASS; errors empty, done and nonempty output confirmed. Raw page JSON archived byte-for-byte; SHA256 `a19b5871c2d4124a7c8e15382af82dd6baa0ef2e02f7076185bbf6107f4c4de3`. Five local process snapshots audited (AFTER_INIT, BEFORE_GENERATION, extra role-only calibration, armed GENERATION, AFTER_DRAIN); ten owned tunnel removals verified. No PAGE_IDLE process snapshot collected. No new phone/model run during this offline analysis.

## Page wall boundaries

| Metric | Actual |
|---|---:|
| runtimePreparationMs | 265.600 ms |
| modelInitializationMs | 86527.400 ms |
| tokenPreparationMs | 76.700 ms |
| tokenPreparationDrainMs | 2.000 ms |
| generationCallToCompletionMs | 7997.200 ms |
| firstCallbackMs | 2318.200 ms |
| postGenerationDrainMs | 103.000 ms |

Stage holds are outside original initialization/generation/drain metrics. Actual holds: AFTER_INIT 220.478 s, BEFORE_GENERATION 512.82 s, AFTER_DRAIN 127.761 s. Long holds and process sampling alter execution state; these walls are not uninstrumented stock performance. First callback is not pure prefill and is not a single-token event.

## Separate process values

Values in KiB (reported Android KB, ×1024 bytes). No cross-process sums. All UNKNOWN roles are retained.

| Capture | PID | Role evidence at this capture | PSS KiB | RSS KiB |
|---|---:|---|---:|---:|
| AFTER_INIT | 11256 | UNKNOWN | UNAVAILABLE | UNAVAILABLE |
| AFTER_INIT | 11292 | RENDERER_TARGET_UNKNOWN | 1502592 | 1782916 |
| AFTER_INIT | 11306 | GPU | 2168943 | 2469162 |
| AFTER_INIT | 14567 | BROWSER_MAIN | 255329 | 466618 |
| BEFORE_GENERATION | 11256 | UNKNOWN | UNAVAILABLE | UNAVAILABLE |
| BEFORE_GENERATION | 11292 | RENDERER_TARGET_UNKNOWN | 1507668 | 1797508 |
| BEFORE_GENERATION | 11306 | GPU | 2143031 | 2452014 |
| BEFORE_GENERATION | 14567 | BROWSER_MAIN | 231371 | 449698 |
| BEFORE_GENERATION calibration | 11256 | UNKNOWN | UNAVAILABLE | UNAVAILABLE |
| BEFORE_GENERATION calibration | 11292 | RENDERER_TARGET_UNKNOWN | 1506931 | 1796888 |
| BEFORE_GENERATION calibration | 11306 | GPU | 2146972 | 2455974 |
| BEFORE_GENERATION calibration | 14567 | BROWSER_MAIN | 226119 | 444562 |
| GENERATION | 11256 | UNKNOWN | UNAVAILABLE | UNAVAILABLE |
| GENERATION | 11292 | UNKNOWN | 1509685 | 1799736 |
| GENERATION | 11306 | UNKNOWN | 2667624 | 2976818 |
| GENERATION | 14567 | UNKNOWN | 225735 | 444226 |
| AFTER_DRAIN | 11256 | UNKNOWN | UNAVAILABLE | UNAVAILABLE |
| AFTER_DRAIN | 11292 | RENDERER_TARGET_UNKNOWN | 1510083 | 1800188 |
| AFTER_DRAIN | 11306 | GPU | 2157214 | 2466438 |
| AFTER_DRAIN | 14567 | BROWSER_MAIN | 225054 | 443634 |

Per-capture PID inventory unchanged and OS start ticks stable. Fresh before/after CDP evidence establishes browser/GPU roles in held-stage samples. No direct target-to-renderer mapping; renderer11292 target association UNKNOWN. During armed generation both metadata checks failed with WinError2 (local executable unavailable): all roles UNKNOWN for that capture despite adjacent samples identifying the same PID. Never replace missing contemporaneous role evidence with neighbor assumptions. The large PID11306 value in this sample is a process value with UNKNOWN role at capture, not a validated model/GPU memory peak. Local helper now resolves Node from PATH or the existing Codex bundled node.exe; no rerun/replacement of this evidence.

## Phase timing audit

Held stages are operator-confirmed. The page JSON records matching AFTER_INIT/BEFORE_GENERATION/AFTER_DRAIN waits, but CDP stage reads timed out and phone/host UTC offset was not independently calibrated. Role-only samples intentionally skip page JS. verifiedPhase stays UNAVAILABLE. Page session UUID is 095d0acd-448f-4108-b04e-0b4fd04e9b65; computer labels were UNKNOWN, so pairing relies on operator sequence and matching project URL/nominal timing, not an independently sampled session-ID handshake.

Generation page interval: 2026-10-06T09:26:04.127Z–09:26:12.124Z. Host operator arm release: 09:26:04.057Z. Nominal UTC comparison only:

| Command | Host UTC start | Host UTC end | Nominal classification |
|---|---|---|---|
| meminfo_11256 | 2026-10-06T09:26:04.112070+00:00 | 2026-10-06T09:26:04.246299+00:00 | MIXED_BOUNDARY |
| meminfo_11292 | 2026-10-06T09:26:04.390443+00:00 | 2026-10-06T09:26:04.524178+00:00 | WITHIN |
| meminfo_11306 | 2026-10-06T09:26:04.676323+00:00 | 2026-10-06T09:26:04.848124+00:00 | WITHIN |
| meminfo_14567 | 2026-10-06T09:26:05.006585+00:00 | 2026-10-06T09:26:05.152947+00:00 | WITHIN |

Zygote command nominally straddles generation start by ~15 ms; preserve as MIXED_BOUNDARY in uncalibrated UTC comparison. Other three commands nominally fall within generation. These are conditional timing classifications, not independently proven generation-only samples. Derived JSON stores each command window and the allowable host-minus-phone offset range for fully-inside classification. No unknown offset is set to zero. If future clock/marker evidence contradicts alignment, retain mixed/outside samples.

## Other memory channels remain separate

| Page stage | JS used heap bytes | Buffer current logical bytes | Derived texture payload bytes |
|---|---:|---:|---:|
| AFTER_INIT | 10000000 | 83077648 | 1707566808 |
| BEFORE_GENERATION | 10000000 | 83077648 | 1707566808 |
| AFTER_GENERATION | 10000000 | 83509264 | 1707566808 |
| AFTER_DRAIN | 10000000 | 83509264 | 1707566808 |

JS heap is rounded/shared performance.memory scope. Buffers are explicit buffer.size lifecycle; textures use MEMORY001 official-format texel payload math, not physical allocation. RSS may double-count shared pages across processes; PSS apportions pages but is not model-exclusive or physical GPU memory. Do not add any channels into a physical-memory total. Sparse sequential process snapshots do not provide continuous peak, and explicit destroy/device cleanup does not prove physical release or leaks.

## Remaining gaps and next minimum work

PAGE_IDLE baseline missing; direct target renderer mapping unavailable; generation fresh role checks failed; phase handshake/clock bound unavailable. Only one instrumented pilot, not five independent model-memory repeats. Physical GPU residency and model-exclusive memory remain unavailable. Do not close assignment memory requirements or claim Adreno/throughput/kernel attribution from this pilot. Next bounded preparation: verify local Node resolution without running model; establish a reliable stage/host marker and PAGE_IDLE capture before considering one further explicitly authorized pilot. No duplicate timestamp diagnostics or profiler expansion.

Reproduce offline: `python scripts/verify_memory002.py`. [Derived audit](../results/analysis/memory002_pilot_verification.json), [sampling plan](adb_memory_sampling_plan.md). Raw system outputs stay in ignored results/local/adb_memory; no unrelated app inventories or device serials published. Page evidence preserved in results/raw.


## Offline protocol correction

Pilot stays PARTIAL_PILOT_VERIFIED with all missing/failed evidence unchanged. [Protocol v2](memory002_capture_protocol.md) adds mandatory PAGE_IDLE receipt before initialization, marker/host/sample handshake, bounded clock exchange and uncertain-window classification, fresh process identity and browser/GPU-only scope. One bounded offline CDP-schema feasibility review completed; target renderer remains UNKNOWN, no further mapping expansion. v2 CPU checks passed; phone protocol validation NOT_RUN. Raw local evidence file hashes are separately recorded in results/analysis/memory002_local_evidence_sha256.json. No phone replay this correction.
