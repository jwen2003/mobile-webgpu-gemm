# Android process memory: interface probe and stage sampling plan

Status: INTERFACE_PROBE completed 2026-10-06; four model-stage measurements NOT_RUN. No model, benchmark, phone rerun, root, trace or Chrome flag change was performed.

## Actual interfaces and preserved evidence

One authorized USB device; adb shell UID 2000, no root. Raw full process inventory, per-PID dumpsys meminfo, proc status, denied smaps_rollup responses, system meminfo and before/after device uptime saved locally under `results/local/adb_memory/20261006T083827775727Z/`. Every command includes host UTC start, wall duration, return code and raw SHA256 in `snapshot.json`; `derived_interface_audit.json` checks the preserved hashes and extracts proc-status RSS. Raw inventories contain device identifiers/unrelated app names, are ignored by Git and are not published. No original experiment evidence changed.

Collection duration 2005.791 ms. Individual meminfo calls took 136.9–217.9 ms; ps before/after 115.9/89.1 ms. This is sequential, not an atomic process-memory snapshot. These costs are observed once, not guaranteed future latency. Added/removed/renamed Chrome PIDs: none during this snapshot.

| Interface | Actual availability | Scope / fields |
|---|---|---|
| adb devices, shell id, ps -A | AVAILABLE | Authorization and OS PID/name/parent inventory |
| dumpsys meminfo PID | AVAILABLE for four identified app/service PID reports | TOTAL PSS, TOTAL RSS and TOTAL SWAP PSS; output says Kilobytes / Pss(KB), Rss(KB), convert to bytes ×1024 |
| /proc/PID/status | AVAILABLE for all five Chrome-prefixed PIDs | VmRSS in kB; separate measurement instant, not interchangeable with dumpsys RSS |
| /proc/PID/smaps_rollup | UNAVAILABLE | Permission denied for all five; no permission bypass |
| /proc/meminfo | AVAILABLE | Device/system scope; cannot assign values to Chrome/model |
| DevTools process/target mapping | NOT_COLLECTED | Temporary forwarding rejected by automatic approval; no tunnel created |

Source: [Android dumpsys memory documentation](https://developer.android.com/tools/dumpsys#meminfo) describes process memory in kilobytes and shared-page PSS accounting. [Chrome SystemInfo.getProcessInfo](https://chromedevtools.github.io/devtools-protocol/tot/SystemInfo/#method-getProcessInfo) provides process types/IDs, but was not called; its API alone does not establish a target-page-to-renderer PID mapping. Sources checked 2026-10-06.

## Current process attribution and actual snapshot

| PID | Observed name evidence | Role | TOTAL PSS KiB | TOTAL RSS KiB |
|---:|---|---|---:|---:|
| 755 | exact `com.android.chrome` | Chrome browser main | 199934 | 331428 |
| 600 | sandboxed service suffix `:47` | UNKNOWN; target renderer not established | 114316 | 174532 |
| 17361 | sandboxed service suffix `:0` | UNKNOWN; target renderer not established | 245175 | 240912 |
| 17381 | `com.android.chrome:privileged_process0` | UNKNOWN; GPU role not established | 162395 | 287032 |
| 17314 | `com.android.chrome_zygote` | Chrome-named zygote; renderer/GPU role UNKNOWN | UNAVAILABLE under strict PID/header validation | UNAVAILABLE under strict PID/header validation |

The zygote command produced memory tables without the required PID/name MEMINFO identity header. Raw values are retained, but not attributed as validated TOTAL PSS/RSS. Its /proc status VmRSS is separately available in the derived audit. Service suffix or privileged status is not proof of GPU/renderer role. No inspected page URL or browser tab-to-PID link was obtained; current target renderer and GPU PID remain UNKNOWN. PID alone can be reused; future snapshots check names and inventories, retain departures/newcomers and never join across a role change merely by PID number.

RSS summed across processes may count shared pages repeatedly. PSS apportions shared-page cost but is still process scope, including browser/runtime/other pages and allocations. Neither is model-exclusive memory or physical GPU residency. SwapPSS remains separate. A Graphics row of zero does not establish absence of GPU allocations. Do not combine RSS/PSS with JS heap, GPUBuffer logical bytes or texture payload into a physical-memory total.

## Frozen minimum stage plan (not yet executed)

Keep one model session foreground, fixed prompt/config, supply/background conditions recorded. Preserve independent sessions and the original model wall boundaries. Tag snapshots with session ID, stage, page event UTC/performance time and host collection start/end. Track the same observed Chrome family before and after each sample, retaining UNKNOWN roles. Sample commands must not overlap each other.

| Stage | Required evidence / control | Planned sampling |
|---|---|---|
| PAGE_IDLE | Page loaded, before initialization request | One snapshot; page stays idle until collection ends |
| AFTER_INIT | `initialization_end` / AFTER_INIT, before generation | One snapshot at an explicit operator-controlled wait point; tokenizer/preparation status separately recorded |
| GENERATION | `generation_start` to original generation promise completion | One immediate snapshot after request starts; if request remains active, maximum two further snapshots at ≥5 s start spacing. Label crossing-boundary samples MIXED_PHASE, not generation-only |
| AFTER_DRAIN | original `gpu_drain_end`, before task/device close | One snapshot at an explicit wait point before cleanup |

Budget: 4–6 snapshots/session, sequential. Probe suggests ~2 s each (~8–12 s sampling work), but record actual durations; process sampling can perturb execution and these instrumented walls cannot be treated as stock latency. Do not claim an instantaneous peak from sparse samples. Start spacing must exceed previous collection duration; slow or timed-out samples remain in evidence.

Current `src/baseline/sessions.js` records initialization_end at line 39, generation_start at line 46 and gpu_drain_end/AFTER_DRAIN at line 56, then proceeds to cleanup. Manual capture cannot reliably establish the short AFTER_INIT/AFTER_DRAIN windows. Before executing the plan, add explicit holds or an acknowledged host/page stage handshake at those boundaries, without changing generation-completion/drain timestamps. This plan does not implement those page changes or launch the model. Host/page UTC clocks are not assumed synchronized; bracket markers and retain timing uncertainty. Phase labels supplied to the collector alone are not proof of phase coverage.

Collector commands from project root:

```powershell
python scripts/capture_adb_memory.py --phase PAGE_IDLE --session SESSION_ID
python scripts/capture_adb_memory.py --phase AFTER_INIT --session SESSION_ID
python scripts/capture_adb_memory.py --phase GENERATION --session SESSION_ID
python scripts/capture_adb_memory.py --phase AFTER_DRAIN --session SESSION_ID
```

Run stage commands only after the matching controlled boundary exists. The script automatically selects exactly one authorized device (otherwise require `--serial`), saves raw output and measures each command, re-enumerates PIDs after sampling, and records unavailable fields rather than using zero. No adb permission escalation, memory-interface bypass or DevTools forwarding is built into it. Model-exclusive attribution and physical GPU memory remain open requirements; this probe only establishes usable process-level interfaces.


## MEMORY002 constrained role-identification attempt

After explicit human authorization, automatic approval accepted temporary adb Chrome DevTools forwarding. Listener verified at 127.0.0.1:52246 only. Metadata HTTP request timed out (5 s request timeout); no usable process-role response or target renderer association was obtained. GPU and target renderer remain UNKNOWN; previous browser-main attribution remains historical snapshot evidence, not newly verified roles. No page content/storage/cookie/model execution or unrelated target logging. The finally block removed this forward; an independent check confirmed no matching forward and no listener. Local ignored attempt metadata: results/local/adb_memory/memory002_role_probe/attempt.json. No further tunnel or broader inspection attempted.


## MEMORY002 foreground retry — metadata connected

2026-10-06T08:53:33Z: after the user unlocked the phone and foregrounded Chrome, one explicitly authorized attempt succeeded. Each request timeout was 10 seconds; no loop/retry. The temporary listener was verified exclusively at 127.0.0.1:63893. /json/version returned HTTP 200 in 11.738 ms; /json/list returned HTTP 200 in 5.611 ms; CDP SystemInfo.getProcessInfo completed in 9.057 ms. Chrome reported version 154.0.8037.92. No model or page JavaScript executed. No page content, cookies or storage read.

| PID | Confirmed process role | Mapping evidence / limitation |
|---:|---|---|
| 755 | browser main | SystemInfo.getProcessInfo directly reports type=browser and id=755 |
| 17361 | renderer (process role only) | SystemInfo.getProcessInfo reports type=renderer and id=17361; target-page association UNKNOWN |
| 17381 | GPU process | SystemInfo.getProcessInfo directly reports type=GPU and id=17381; shared browser process, not model-exclusive |

Target metadata was filtered in memory to localhost/127.0.0.1 port 8000, exact /src/baseline/sessions.html path (query/fragment/title discarded). No target matched this exact selection; unrelated targets were neither logged nor saved. This does not prove the page was closed or absent under another URL. It leaves target identity and target-renderer association UNKNOWN. Even one reported renderer is insufficient mapping evidence. Do not retroactively relabel historical PID 600 or assign historical memory solely to the model. No further metadata request was made after this single attempt.

Cleanup executed in finally, removed only the newly created tcp:63893 forward. Checks confirmed ForwardPresent=false and ListenerPresent=false. Local ignored evidence: results/local/adb_memory/memory002_role_probe/foreground_attempt.json and foreground_cleanup.json. Process role identification is PARTIAL: browser/GPU role established; target renderer association still unavailable. No memory-stage sampling, model execution or trace collection in this attempt.


## MEMORY002 preparation — READY_FOR_CAPTURE (current)

User-reported current URL: `http://localhost:8000/src/baseline/sessions.html?v=baseline-session-v1`. It matches the expected localhost/8000/path filter; query was not a rejection criterion. One bounded connection on 2026-10-06T08:59:00Z broadened candidate matching to the same known project path on any host/port/query (including LAN addresses); still no matching page target returned. Actual phone URL is therefore user-reported, not independently target-verified. No other page URL/title/content was logged. Reason remains UNKNOWN; no additional connection/retry in this round. Fresh SystemInfo.getProcessInfo identified browser755, renderer17361 and GPU17381. Renderer17361 is not assigned to BASELINE002. TargetInfo identity and unique renderer alone are insufficient evidence. The owned tcp:61684 forward was removed, remove exit0, no matching forward or listener. Private evidence: url_mapping_attempt.json and its cleanup JSON.

Prepared phone entry (explicit opt-in):

`http://localhost:8000/src/baseline/sessions.html?memory002=1&v=memory002-v1`

Original entry without memory002=1 retains normal BASELINE002 execution. Local server is the existing root server on localhost:8000; reverse tcp:8000 was observed present. Use Chrome, keep the page foreground; do not use LAN HTTP for WebGPU. JS/WASM/model/config unchanged. Reload creates a new page/session ID; report shows READY_FOR_CAPTURE before execution. Opening the page does not initialize runtime/model.

### Controlled execution instructions (future model capture, not performed)

1. Open opt-in URL and fill environment fields. Page is PAGE_IDLE before Run. Record session UUID shown in summary; capture PAGE_IDLE.
2. Only when authorized to perform model sampling, click Run once. After original initialization_end, page waits at AFTER_INIT. Capture, then click “采样完成，继续下一阶段”.
3. Tokenizer preparation/drain finishes; page waits at BEFORE_GENERATION. Capture, then continue. This starts the single generation.
4. During GENERATION execute one capture. No per-callback UI or console refresh is added. A sample crossing generation/drain is MIXED_PHASE; do not delete or relabel it. Additional spaced samples are bounded by the earlier 4–6-snapshot budget, with no overlap.
5. After generation promise completion and onSubmittedWorkDone, page waits at AFTER_DRAIN. Capture before continuing to task/device cleanup. Download page JSON after completion; opt-in filename has MEMORY002 prefix, never replace historical BASELINE002 evidence. Interrupted/failed JSON remains downloadable. Cancel releases a waiting gate; runtime failures may proceed directly to cleanup and retain failure evidence.

Commands from project root:

```powershell
python scripts/capture_adb_memory.py --memory002 --phase PAGE_IDLE --session SESSION_UUID
python scripts/capture_adb_memory.py --memory002 --phase AFTER_INIT --session SESSION_UUID
python scripts/capture_adb_memory.py --memory002 --phase BEFORE_GENERATION --session SESSION_UUID
python scripts/capture_adb_memory.py --memory002 --phase GENERATION --session SESSION_UUID
python scripts/capture_adb_memory.py --memory002 --phase AFTER_DRAIN --session SESSION_UUID
```

Each future capture performs fresh before/after process metadata checks; each check uses one bounded connection, no retries and 10s requests. It owns/removes its dynamic loopback-only forward. No old roles.json PID is loaded as current truth. Process names, current CDP roles and /proc/PID/stat start-time ticks before/after must agree; unavailable or changing identity stays UNKNOWN/UNAVAILABLE. Raw command output, start/end UTC, host monotonic times, elapsed times, return codes and hashes remain in ignored local directories. Errors and metadata cleanup evidence retained; uncertain cleanup aborts collection. Browser, GPU, target-confirmed renderer (currently none), renderer with unknown target and other unknown processes are reported separately, never automatically summed.

Project page publishes only experiment/session/stage/history metadata as globalThis.__memory002State. CDP evaluation is limited to this explicitly published metadata on one matching project target. No output, prompt, DOM content, cookies, credentials or storage are read. Stage classification brackets the collection with same target/session/history: unchanged stage gives verifiedPhase; a transition gives MIXED_PHASE, session change MIXED_SESSION, absent/ambiguous/disabled metadata gives UNAVAILABLE. Operator --phase remains a requested label, not proof. Host/page clocks are not assumed synchronized. A future sample with missing target metadata can still preserve process memory, but cannot claim a model phase.

Metadata overhead is additional to the initial 2.006s adb probe; measure actual collection cost each time, do not assume 2s sampling. Sparse, sequential dumps are not continuous peaks. These holds and collection alter execution state; initial/gen/drain original wall boundaries exclude hold durations, yet cannot be presented as uninstrumented stock timing. JS heap, logical buffers/textures and process RSS/PSS remain separate; shared browser/GPU scope is not model-exclusive or physical GPU memory.

Computer checks: node syntax, BASELINE002 CPU mock regression plus opt-in holds, independent Python parsing/phase/PID tests, diff check and 41 historical evidence hashes PASS. Phone-stage and target mapping validation still pending. Reproduce checks: node scripts/check_baseline_sessions.mjs; python scripts/check_memory002.py. No model/benchmark run, no trace, no commit/push this round.


## First AFTER_INIT process capture (operator-confirmed)

Local archive results/local/adb_memory/20261006T091541534903Z; duration28,394.880ms. Operator confirmed AFTER_INIT hold. Target33 matched localhost:8000/src/baseline/sessions.html?memory002=1&v=memory002-v1 before/after, but no published stage metadata was obtained; verifiedPhase=UNAVAILABLE, do not present as independently phase-verified. Fresh CDP/lifetime evidence: browser14567 PSS255329/RSS466618 KiB; GPU11306 PSS2168943/RSS2469162 KiB; renderer11292 PSS1502592/RSS1782916 KiB with target association UNKNOWN. PID set unchanged. Zygote11256 strict meminfo identity unvalidated; raw retained. All raw command hashes PASS; owned ports57238 and50062 removed, neither forward nor listener remained. These process values are not model-exclusive or physical GPU memory and are not summed.


## BEFORE_GENERATION operator-confirmed capture

Local archive results/local/adb_memory/20261006T091837000441Z; duration28,598.224ms. Operator confirmed BEFORE_GENERATION hold, PID set/lifetimes unchanged. Fresh CDP browser14567 PSS231371/RSS449698 KiB; GPU11306 PSS2143031/RSS2452014 KiB; renderer11292 PSS1507668/RSS1797508 KiB, target association UNKNOWN. Project target found, but Runtime.evaluate timed out before/after; independently verifiedPhase remains UNAVAILABLE. No claim of GPU/model-exclusive memory. Raw hashes PASS and both owned forwards removed; no listeners. Current metadata evaluation timeouts make this ~28s collector unsuitable for capturing a ~8s generation window without a separately coordinated faster collection plan; do not treat a delayed sample as generation-only.


## Fast role-only mode and operator arming

At the unchanged BEFORE_GENERATION hold, role-only calibration took8,651.167ms (archive20261006T092257173854Z). Both fresh CDP checks and cleanup passed; stage JavaScript intentionally not queried, verifiedPhase stays UNAVAILABLE. Preserve this additional calibration separately. For short generation, run `python scripts/capture_adb_memory.py --memory002 --roles-only --arm-generation --phase GENERATION --session UNKNOWN` in a local PowerShell terminal. It prepares process metadata BEFORE phone action, prints ARMED, then waits. Operator clicks phone Continue then immediately presses Enter in PC terminal; memory commands begin without the initial metadata setup delay. This is operator-coordinated, not automatic phase verification; retain release time, wait duration and command windows. Generation/drain-boundary scope requires checking exported page events later; otherwise keep phase UNAVAILABLE/MIXED and never infer a continuous peak. Phone model must not be restarted merely to replace a poor capture.


## AFTER_DRAIN operator-confirmed capture

Archive20261006T092657598991Z; collection8,166.718ms, PID set/lifetimes unchanged. Browser14567 PSS225054/RSS443634 KiB; GPU11306 PSS2157214/RSS2466438 KiB; renderer11292 PSS1510083/RSS1800188 KiB with target association UNKNOWN. Role-only mode intentionally skips stage JS: operator-confirmed AFTER_DRAIN, verifiedPhase UNAVAILABLE pending page JSON. Raw hashes and both owned-tunnel cleanup PASS. Armed generation archive20261006T092552415914Z retained separately; final page lifecycle JSON needed for phase-window audit. No physical/model-exclusive memory or continuous peak claim.


## MEMORY002 archived partial pilot

One128-token page session COMPLETE and independently audited; initialization86.527s, generation7.997s, first callback2.318s, drain103ms. Five process snapshots retained with separate PSS/RSS and JS/buffer/texture scopes. Held-stage browser/GPU roles verified; target renderer UNKNOWN. Armed generation role metadata failed locally, phase/clock alignment not independently proven; PAGE_IDLE process baseline missing. See [pilot results](../docs/memory002_pilot_results.md). Memory requirement remains PARTIAL, not physical/model-exclusive memory or continuous peak. No replacement run or fabricated role/phase.


## MEMORY002 protocol v2 — offline correction

Historical pilot remains PARTIAL. Latest authoritative method: [mandatory idle/handshake/clock protocol](../docs/memory002_capture_protocol.md). Old operator-only v1 instructions are historical and do not grant formal capture. Run serve_memory002.py on loopback8000; phone entry /src/baseline/sessions.html?memory002=1&v=memory002-v2. Initialization blocked until role-qualified idle receipt. Scope narrowed to browser/GPU process PSS/RSS; target renderer UNKNOWN. Generation windows require bracketing offset/uncertainty audit; no model-exclusive/physical GPU memory or continuous peak. CPU checks completed, v2 phone check NOT_RUN; assignment memory remains PARTIAL.
