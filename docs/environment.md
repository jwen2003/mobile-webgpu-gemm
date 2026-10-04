# Experimental environment

## Development device evidence

| Field | Value | Evidence and scope |
|---|---|---|
| Device | OnePlus Ace 6 Supreme Edition, PMB110 | User screenshots |
| SoC | MediaTek Dimensity 9500 | About-device screenshot |
| GPU | ARM Mali-G1-Ultra MC12 | chrome://gpu GPU0 string |
| Physical RAM | 16 GB | Device screen shows 16 GB plus 12 GB expansion; expansion excluded |
| Storage | 512 GB | Device screenshot; not available RAM |
| Android | 16 | Device and Chrome screenshots |
| ColorOS | 16.0.10 | Device screenshot |
| OEM build | PMB110_16.0.10.500(CN01B110P02) | Device screenshot |
| Android build | BP2A.250605.015 | Chrome screenshot |
| Security patch | 2026-08-01 | Device screenshot |
| Chrome | 154.0.8037.92 stable, 64-bit | chrome://version |
| Driver vendor | ARM | chrome://gpu GPU0 |
| Reported driver version | 2.1.28733 | GPU0/ANGLE metadata; not independently identified as the WebGPU Vulkan driver |
| WebGPU status | Hardware accelerated | chrome://gpu; not a compute correctness test |
| Vulkan status | Enabled | chrome://gpu |
| Skia backend | GaneshVulkan | Browser drawing backend; does not establish WebGPU backend |
| Timestamp sample | Animated output and changing nonzero render-pass duration | User observation on 2026-10-03; raw queries not captured |

## Capability probe still required

Record actual GPUAdapter info, adapter/device features and relevant limits as exported JSON. Explicitly test `timestamp-query`, `shader-f16`, requestDevice success and device loss. Record maxBufferSize, maxStorageBufferBindingSize, maxComputeWorkgroupStorageSize, maxComputeInvocationsPerWorkgroup and per-axis workgroup limits. Actual WebGPU backend and driver: pending if not exposed.

The sample displayed roughly millisecond-scale values with visible variation. Exact statistic, units and sample distribution were not captured. Do not use these observations in a performance table or infer timing precision from them.

## Per-session conditions

Session ID / local date and timezone / start and end time / battery percent / charging state / power mode / screen brightness / background activity / case and cooling / ambient temperature if measured / exposed device temperatures and their source / idle interval / Chrome flags / browser restart / OS or browser changes.

Unknown temperatures stay unknown. Never label a session thermally stable solely because the phone feels cool.

## Final Adreno device

NOT_ACQUIRED. Repeat the environment record and all final benchmarks on the target device. Mali observations are development evidence only unless the founder explicitly accepts a changed scope.
