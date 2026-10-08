# MEMORY001 — offline texture logical payload accounting

Status: VERIFIED_OFFLINE. No model, benchmark, phone, adb or trace was run. Original JSON bytes unchanged.

## Official format definitions

Source accessed 2026-10-06: [WebGPU plain color format table](https://www.w3.org/TR/webgpu/#plain-color-formats), [logical mip extent algorithm](https://www.w3.org/TR/webgpu/#logical-miplevel-specific-texture-extent), [official GPUWeb specification source](https://raw.githubusercontent.com/gpuweb/gpuweb/main/spec/index.bs) (format enum bit-width groups and plain-color copy footprint table). All observed formats are uncompressed, 1×1 texel blocks.

| Format | Channels × bits | Bytes/texel | Creations/session |
|---|---:|---:|---:|
| rgba8uint | 4 × 8 | 4 | 6 |
| rgba16uint | 4 × 16 | 8 | 91 |
| rgba16float | 4 × 16 | 8 | 165 |
| rgba32uint | 4 × 32 | 16 | 227 |
| rgba32sint | 4 × 32 | 16 | 9 |
| rgba32float | 4 × 32 | 16 | 2 |

Payload = sum over mip levels of width × height × depth/layers × bytes/texel × sampleCount. Spatial mip extents floor-divide by 2 and clamp to 1. In 2D arrays, layer count stays constant; in 3D, depth also shrinks. 1D height/depth are 1. No upload bytesPerRow alignment, row padding, driver tiling, compression allocation overhead or texture views are counted. Missing fields are not filled with API descriptor defaults.

## Coverage and reconstruction

15/15 sessions; 500/500 recorded textures per session, 7,500/7,500 overall. Six observed formats covered. Each session had 333 formats previously absent from the observer map; this derived calculation closes that format-table gap without rewriting the original PARTIAL_UNKNOWN_FORMAT record. All recorded extents, dimensions, mip counts, sample counts and explicit lifecycle fields were present; no metadata drops or coverage errors. All actual textures are 2D, one layer, one mip, one sample. Array/3D mip and multisample rules were validated with offline synthetic tests, not claimed as phone observations.

Events ordered by globally unique recorded sequence; rounded wall-clock ties at snapshots constrained by original known-format current/created/destroyed counters and unknown-format counts. A snapshot is AVAILABLE only when candidate prefixes give one payload. No ambiguous sampled boundary occurred. Peak is the maximum active explicit-lifecycle ledger, not cumulative creations. Destroy changes the ledger only; it does not prove physical release, leaks or residency. Other devices/workers, resources before observation, implicit release, physical GPU memory and process RSS/PSS remain UNAVAILABLE. BEFORE_RUNTIME/BEFORE_INIT have no installed resource observer. Post-close figures are explicit-event ledger values, not physical allocation observations.

## Per-session results (bytes)

| Length / repeat | Cumulative created | Active ledger peak | Peak phase | After init | Before generation | After generation | After drain |
|---|---:|---:|---|---:|---:|---:|---:|
| 128 / R1 | 1707579096 | 1707566808 | MODEL_INIT | 1707566808 | 1707566808 | 1707566808 | 1707566808 |
| 512 / R1 | 1707579096 | 1707566808 | MODEL_INIT | 1707566808 | 1707566808 | 1707566808 | 1707566808 |
| 1024 / R1 | 1707579096 | 1707566808 | MODEL_INIT | 1707566808 | 1707566808 | 1707566808 | 1707566808 |
| 512 / R2 | 1707579096 | 1707566808 | MODEL_INIT | 1707566808 | 1707566808 | 1707566808 | 1707566808 |
| 1024 / R2 | 1707579096 | 1707566808 | MODEL_INIT | 1707566808 | 1707566808 | 1707566808 | 1707566808 |
| 128 / R2 | 1707579096 | 1707566808 | MODEL_INIT | 1707566808 | 1707566808 | 1707566808 | 1707566808 |
| 1024 / R3 | 1707579096 | 1707566808 | MODEL_INIT | 1707566808 | 1707566808 | 1707566808 | 1707566808 |
| 128 / R3 | 1707579096 | 1707566808 | MODEL_INIT | 1707566808 | 1707566808 | 1707566808 | 1707566808 |
| 512 / R3 | 1707579096 | 1707566808 | MODEL_INIT | 1707566808 | 1707566808 | 1707566808 | 1707566808 |
| 128 / R4 | 1707579096 | 1707566808 | MODEL_INIT | 1707566808 | 1707566808 | 1707566808 | 1707566808 |
| 1024 / R4 | 1707579096 | 1707566808 | MODEL_INIT | 1707566808 | 1707566808 | 1707566808 | 1707566808 |
| 512 / R4 | 1707579096 | 1707566808 | MODEL_INIT | 1707566808 | 1707566808 | 1707566808 | 1707566808 |
| 512 / R5 | 1707579096 | 1707566808 | MODEL_INIT | 1707566808 | 1707566808 | 1707566808 | 1707566808 |
| 128 / R5 | 1707579096 | 1707566808 | MODEL_INIT | 1707566808 | 1707566808 | 1707566808 | 1707566808 |
| 1024 / R5 | 1707579096 | 1707566808 | MODEL_INIT | 1707566808 | 1707566808 | 1707566808 | 1707566808 |

## Every recorded stage (texture ledger bytes)

| Stage | Observed value range across 15 sessions |
|---|---:|
| BEFORE_RUNTIME | UNAVAILABLE: observer not installed |
| BEFORE_INIT | UNAVAILABLE: observer not installed |
| AFTER_INIT | 1707566808–1707566808 |
| AFTER_TOKEN_PREPARATION | 1707566808–1707566808 |
| BEFORE_GENERATION | 1707566808–1707566808 |
| FIRST_CALLBACK | 1707566808–1707566808 |
| AFTER_GENERATION | 1707566808–1707566808 |
| AFTER_DRAIN | 1707566808–1707566808 |
| AFTER_TASK_CLOSE | 0–0 |
| AFTER_DEVICE_DESTROY | 0–0 |
| AFTER_CLEANUP | 0–0 |

## Separate memory scopes and verification

JS heap remains the original performance.memory report: used/total 10,000,000 bytes and limit 3,760,000,000 bytes, rounded/shared API scope. Buffers remain original buffer.size lifecycle accounting (after init 83,077,648 bytes); per-session/stage figures in the BASELINE002 report remain unchanged. Texture results above are additional derived logical texel payload only. Do not sum these into physical GPU memory or treat model file size as memory. No new RSS/PSS, native/WASM heap or residency evidence; assignment memory is still partially satisfied.

Reproduce: `python scripts/analyze_memory001.py` then `python scripts/verify_memory001.py`. Independent verification uses channel bit widths, bit-shift mip extents, live-ID-set peak reconstruction and conservative snapshot time bounds. Tests cover array vs 3D, 1D, non-power-of-two extents, multisampling, all six formats, missing fields, unknown formats and incomplete lifecycle. Fifteen session audits PASS; all 41 historical raw evidence SHA256 entries unchanged. Per-resource mip breakdown and raw SHA256 are in [derived payload JSON](../results/analysis/memory001_texture_payload.json); [verification](../results/analysis/memory001_verification.json). No runtime implementation changed.
