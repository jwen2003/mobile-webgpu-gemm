# TRACE001 — bounded device data-source availability

Status: CHECK_COMPLETE_NO_VALIDATED_GPU_TIMELINE. Budget15min from2026-10-06T10:34:32Z; last device operation10:39:01.945Z (~4.5min). No model, benchmark, trace recording, profiler, system permission change, root, runtime change, device file or forwarding was created. One authorized connected phone selected; identity/serial and all inventories stay in ignored results/local/adb_memory/trace001. Public derived evidence contains only relevant availability/scopes and hashes, not inventories or unrelated apps.

## Actual device evidence versus documentation

| Question | Observed on phone | Status / interpretation |
|---|---|---|
| Perfetto service query | --query, --query --long and --query-raw succeeded; service Perfetto v49.0 | AVAILABLE for metadata query, not proof recording permission |
| GPU memory source | android.gpu.memory registered | AVAILABLE registration only; not GPU execution timing, model-only memory or validated capture |
| GPU render-stage/compute timeline | No gpu.renderstages or vendor-suffixed variant registered | UNAVAILABLE through the currently registered route; future/on-demand/other interfaces UNKNOWN |
| GPU counters | No gpu.counters or vendor-suffixed variant registered | UNAVAILABLE in this service snapshot; counters would not automatically provide per-dispatch time anyway |
| Vulkan memory tracker | No vulkan-prefixed source registered | UNAVAILABLE in this service snapshot; no implication about actual GPU residency |
| Ftrace | linux.ftrace registered; ordinary shell UID2000 cannot read /sys/kernel/tracing/available_events; debug tracing path absent | GPU-specific events/config UNKNOWN; privileged daemon access is not equivalent to shell access and was not tested by recording |
| Chrome target shader/dispatch mapping | No track_event registered by the target Chrome producer in this snapshot; CDP categories not queried | UNKNOWN; other applications' Chromium sources excluded from public results. No proof of shader IDs, actual dispatch duration or op linkage |
| Configuration and payload permissions | CLI advertises config/query/conversion; conversion attempts failed on file-input arguments | Parser/capture acceptance UNKNOWN. No successful capture or driver GPU timeline config established |

[Official GPU documentation](https://perfetto.dev/docs/data-sources/gpu) describes render-stage/counter producers and vendor-specific names. Those listed capabilities are not the phone inventory. [Service-state schema](https://raw.githubusercontent.com/google/perfetto/main/protos/perfetto/common/tracing_service_state.proto) exposes registration metadata; [descriptor schema](https://raw.githubusercontent.com/google/perfetto/main/protos/perfetto/common/data_source_descriptor.proto) defines data-source names/descriptors. Registration is not successful emission, capture coverage or operator attribution.

[Existing trace source review](remaining_metrics_feasibility.md) establishes that CPU Dawn processing scopes are not GPU execution durations. GPU event schema correlation fields are optional and do not show that this phone emits them. A JS pipeline/shader ID cannot be equated to an opaque backend handle, and submit proximity cannot establish a dispatch-to-driver-event mapping.

## Verification and failures

[Derived results](../results/analysis/trace001_availability.json) are reproducible with python scripts/verify_trace001.py using the preserved private inputs. A bounded protobuf wire decoder extracts only descriptor names and target-producer presence. Binary/text source inventories agree independently. The adb shell binary transport added CR before LF; only the derived parser reverses CRLF, while original bytes and hash remain unchanged. Synthetic nested protobuf and truncation checks validate decoder framing. All raw command hashes are checked.

Retained failures: --help returns1 but provides usage; first tracefs shell loop had a syntax error, replaced by explicit read checks; tracefs permission/path failures; two conversion attempts returned255 because file inputs could not be opened. They never entered tracing. No repeated permission escalation, push of configs to device, root or workaround was attempted. No active tracing session was reported in the initial query; no sessions were created by this check. No forwarding cleanup was needed because none was created.

## Stop decision

No currently validated GPU execution/dispatch attribution entry exists. **Do not proceed to a model trace on this evidence.** Keep trustworthy per-kernel ranking and additive stacked breakdown unmet, and proceed to report consolidation. This is a bounded negative feasibility result, not proof every possible platform trace route is impossible.

Preserve existing accepted tokenizer counts and independent combined-wall sessions; actual generated token sequence/count and pure prefill/decode remain UNAVAILABLE through the supported fixed API. Structural shader/dispatch tables can be delivered with their scope. Memory remains logical/process-scoped and repeated memory acceptance is still open. No new phone run is proposed or automatically scheduled by TRACE001.
