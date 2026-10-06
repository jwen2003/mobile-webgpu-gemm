# MEMORY002 v2 — offline correction, not formal memory acceptance

Historical pilot stays PARTIAL_PILOT_VERIFIED. Page COMPLETE does not mean memory acceptance. Original page/system snapshots and metadata errors remain unchanged; no phone experiment, adb query, model, benchmark or trace ran during this correction.

## Evidence inventory

| Data | Usable evidence | Not established |
|---|---|---|
| Page model session | 128 full prompt tokens; done/nonempty output; no runtime errors; original initialization/generation/drain wall boundaries | Pure prefill/decode, true output tokens, GPU kernel timing |
| Held AFTER_INIT / BEFORE_GENERATION / AFTER_DRAIN | Raw per-PID PSS/RSS, stable OS start ticks, fresh browser/GPU role evidence; operator wait confirmation | Independently calibrated page/host phase linkage; target renderer PID |
| Additional BEFORE_GENERATION calibration | Separate fast-mode snapshot; never replaces first snapshot | Independent repetition or better-result substitution |
| Armed generation | Raw per-PID memory, timestamps, PID lifetime and user arm receipt | Fresh roles: both metadata helpers failed WinError2; all roles remain UNKNOWN |
| Page texture/buffer/JS | Derived logical texture payload, explicit buffer lifecycle, reported JS heap separately | Physical residency, native/WASM/process exclusivity or continuous peak |
| PAGE_IDLE | None | Initial process-memory baseline and initialization increase |
| Cleanup | Ten owned forwards removed, no listener; raw command hashes checked | Physical memory-release/leak conclusion |

See [unchanged pilot values and limitations](memory002_pilot_results.md). Original calibrated phase claims are not retroactively created from v2 code. Raw system output stays private under ignored results/local/adb_memory; only experiment-page evidence and sanitized derivatives are versioned.

## One bounded renderer feasibility check — closed UNKNOWN

Budget: one offline official protocol-schema review, maximum120seconds, no device connection. Completed once in this correction. [Official Chrome DevTools protocol JSON](https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json), checked2026-10-06: SystemInfo.ProcessInfo has type/id/cpuTime, while Target.TargetInfo has target/frame/context identity and metadata but no direct OS PID. The experimental embedderData object has no portable documented renderer-PID guarantee. Target ID, same URL or unique renderer cannot prove association. Existing runtime JS reads timed out; no further device mapping investigation is scheduled. This is a limit of the chosen public metadata route, not proof that every Chromium tracing/debugging technique lacks such information.

Next scope: browser and GPU **process-level** memory only. Renderer processes remain separately labeled RENDERER_TARGET_UNKNOWN or UNKNOWN. No renderer payload is assigned to the model, no claim of model-exclusive memory or physical GPU memory. No new profiler/trace/platform investigation.

## Transport and hard prerequisite

The normal static server cannot accept control POSTs. For a future explicitly authorized capture, stop the old8000 server in its own terminal, then from project root run:

```powershell
python scripts/serve_memory002.py
```

This serves the same project/model files plus /__memory002 control on **127.0.0.1:8000 only**. Keep the existing adb reverse tcp8000 route. New phone URL:

`http://localhost:8000/src/baseline/sessions.html?memory002=1&v=memory002-v2`

Opening does not start the model. Session UUID appears in the page summary. Page sends PAGE_IDLE marker with fresh marker UUID, page UTC epoch and performance.now; host persists receive epoch/monotonic timestamps in private protocol_v2/SESSION_UUID.json. Initialization Run is disabled until a successful idle capture receipt is read using “核对电脑采样回执”. Programmatic run also checks the prerequisite before runtime/device/model creation. Missing server/marker/session, incomplete idle sample, failed metadata or missing browser/GPU memory cannot unlock initialization. Capture receipts are protocol evidence, not formal memory acceptance.

```powershell
python scripts/capture_adb_memory.py --protocol --memory002 --roles-only --phase PAGE_IDLE --session SESSION_UUID
```

Each capture records page marker reference → host receipt → capture start/end → command start/end → outcome. Finish requires fresh before/after CDP browser/GPU roles, readable memory and stable PID lifetime. Only accepted PAGE_IDLE grants idleAccepted. Formal MEMORY002 CLI requires --protocol, --roles-only and actual UUID. --legacy-pilot is an explicit UNQUALIFIED diagnostic escape hatch, never creates a page receipt or formal acceptance. No silent fallback to historical roles or operator labels.

After successful idle receipt, page can initialize when the user explicitly clicks Run. At AFTER_INIT, BEFORE_GENERATION, AFTER_DRAIN: page serializes stage marker delivery, performs clock exchange, and waits. Host capture must reference the current session/stage/marker; UI Continue stays disabled until an accepted receipt for that exact marker is refreshed. Failure/cancellation/interruption records stay preserved; Cancel may release a gate to clean up, but does not fabricate acceptance. The receipt is pending final page-history audit (e.g. cancellation or lost marker delivery), not an instantaneous physical-memory proof.

## Offset, uncertainty and phase handling

Clock exchange records phone send/receive epoch+monotonic, host receive/send epoch and host monotonic. With nonnegative transport delay, host-minus-phone offset interval is:

`[host_send - phone_receive - 2ms, host_receive - phone_send + 2ms]`.

Two milliseconds is an explicit timestamp-resolution guard, not measured hardware precision. Epoch-vs-monotonic discrepancy greater than5ms invalidates the exchange as a possible clock step. Marker/calibration traffic and waiting are outside original generation/drain wall metrics; sampling still changes execution conditions.

Calibration occurs at held-stage entry and again after release (before generation), then at AFTER_DRAIN. No per-callback UI/console or clock traffic is introduced into generation. For every measured command, audit requires a bounded exchange before AND after its host window. Use the conservative envelope of those bounds; inconsistent offset intervals mean UNKNOWN. Convert the entire command interval into possible page-time bounds. Only if all possible times fit inside generation with2ms boundary guard may it be labeled GENERATION_WITHIN_OBSERVED_CLOCK_BOUND. Otherwise MIXED_OR_UNKNOWN/UNKNOWN. Explicit assumption: no unobserved clock step/drift outside the bracketing measured envelope; the procedure is an observed uncertainty bound, not a guarantee of perfect synchronization. With unbounded drift or insufficient timing evidence, keep unknown. No midpoint-only alignment or default zero offset.

For future generation sampling:

```powershell
python scripts/capture_adb_memory.py --protocol --memory002 --roles-only --arm-generation --phase GENERATION --session SESSION_UUID
```

Arm while phone waits BEFORE_GENERATION; preflight role metadata happens first. Once ARMED, refresh the accepted BEFORE_GENERATION receipt, continue the phone, confirm generation started, then immediately press Enter on PC. If /start sees the old marker, it rejects rather than assuming generation. After completion/AFTER_DRAIN, preserve the page JSON and run:

```powershell
python scripts/audit_memory002_protocol.py results/local/adb_memory/protocol_v2/SESSION_UUID.json results/local/adb_memory/CAPTURE_DIRECTORY/snapshot.json --output results/local/adb_memory/CAPTURE_DIRECTORY/timing_audit.json
```

Generation captures ending after a phase transition remain INCOMPLETE/NEEDS_CLOCK_AUDIT and are retained; timing audit may classify individual memory commands, never silently turn the whole capture into a pure-phase sample. Marker/session mismatch, UI/host receipt disagreement, missing/failed clock exchanges remain visible.

## Identity, privacy and resources

Per capture re-enumerate Chrome processes, record PID/name/PPID and /proc stat start ticks before/after. Fresh CDP process type must agree before/after; stale historical PIDs are not consulted. Record additions/removals/renames and PID lifetime changes. Renderer process role and experiment-page affiliation are separate: no code sets TARGET_RENDERER without direct evidence. Node resolution now uses PATH or existing bundled runtime; failures remain UNKNOWN and prevent qualified idle/held receipts. Every temporary debug forward is verified loopback-only and removed/checked in finally.

RSS across processes may count shared pages multiple times. PSS apportions shared pages but includes browser/runtime/other tabs/allocator state. Neither is model-exclusive or physical GPU residency; never sum with JS heap or GPUBuffer/texture logical bytes. Static weights, logical bytes and process memory remain distinct. Sparse serial dumps do not provide a continuous peak. Raw app inventories, serials and unrelated page data are not committed.

## Next bounded questions and checks

Next pilot can ask: under recorded conditions, how do separately reported browser/GPU process PSS/RSS change from verified PAGE_IDLE to initialization and drain holds? Which individual memory commands fit fully inside generation under measured clock uncertainty? Are PID lifetimes stable, or are comparisons invalidated by replacement? It cannot answer model-exclusive memory, physical GPU residency, target renderer memory, continuous peak, five-repeat stability or stock latency without further evidence.

CPU-only checks cover no-idle initialization block, failed role receipt, marker changes, uncertainty-bound crossing, missing/inconsistent clock exchange, clock steps, Cancel cleanup, loopback HTTP and old BASELINE002 mock regression. v2 is READY_FOR_PROTOCOL_PHONE_CHECK; no phone acceptance this round. Historical pilot remains PARTIAL and assignment memory remains PARTIAL.


## MEMORY002 v2 observed protocol pilot

[One128-token v2 result](../docs/memory002_v2_pilot_results.md): PROTOCOL_PASS_WITH_CONDITION_WARNING. Required4/4 stage coverage, five snapshots, fresh browser/GPU readings and idle deltas, bounded generation timing (~28.975ms uncertainty), all10 debug-forward cleanups verified. Initialization background5.606s retained; target renderer UNKNOWN, zygote strict meminfo unavailable. One protocol pilot only: not five-repeat memory acceptance, model-exclusive/physical GPU memory or continuous peak. Historical PARTIAL pilot unchanged; no extra trial scheduled.
