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

## COMPUTE001 exported adapter and device evidence

Source: [original phone JSON](../results/raw/COMPUTE001-2026-10-04T10-53-11-629Z.json), environment ISO time `2026-10-04T10:53:07.372Z`. Page: `http://localhost:8000/src/benchmark/`; secureContext and webgpuExposed both true. Exported userAgent: `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36`. Preserve this browser-reported string separately from the earlier device/version screenshots; it does not replace their OS/build evidence.

Adapter info: vendor `arm`, architecture `gen-5`, device `""`, description `""`. Empty values are retained; no specific GPU model, backend or driver is inferred from this export. The full adapter feature list is preserved in the JSON. Adapter support for `timestamp-query` and `shader-f16` is true, but both are NOT_TESTED here. `requiredFeatures: []`; actual device features: `["core-features-and-limits"]`. Neither optional feature was enabled.

The default device limits below differ from the adapter limits in seven recorded fields. Values are copied from the export; byte units apply to buffer sizes, storage sizes and alignment. These are exposed limits, not measured allocation capacity or performance.

| Limit | Adapter | Actual device |
|---|---:|---:|
| maxBufferSize | 4294967292 | 268435456 |
| maxStorageBufferBindingSize | 2147483644 | 134217728 |
| maxStorageBuffersPerShaderStage | 16 | 8 |
| maxBindGroups | 4 | 4 |
| maxBindingsPerBindGroup | 1000 | 1000 |
| minStorageBufferOffsetAlignment | 256 | 256 |
| maxComputeWorkgroupStorageSize | 32768 | 16384 |
| maxComputeInvocationsPerWorkgroup | 1024 | 256 |
| maxComputeWorkgroupSizeX | 1024 | 256 |
| maxComputeWorkgroupSizeY | 1024 | 256 |
| maxComputeWorkgroupSizeZ | 64 | 64 |
| maxComputeWorkgroupsPerDimension | 65535 | 65535 |

COMPUTE001 used 4100-byte buffers, three storage bindings, workgroup_size(64) and 17 workgroups, within actual device limits. requestDevice succeeded and all 1025 FP32 sums were independently verified exactly (max absolute error 0). Compilation messages and GPU error records were empty; no device loss was recorded before export. Device-loss recovery has not been deliberately tested. This run contains no performance measurement; ISO timestamp differences must not be reported as GPU kernel time. FP16 and timestamp-query execution still require separate tests.

The sample displayed roughly millisecond-scale values with visible variation. Exact statistic, units and sample distribution were not captured. Do not use these observations in a performance table or infer timing precision from them.

## Per-session conditions

Session ID / local date and timezone / start and end time / battery percent / charging state / power mode / screen brightness / background activity / case and cooling / ambient temperature if measured / exposed device temperatures and their source / idle interval / Chrome flags / browser restart / OS or browser changes.

Unknown temperatures stay unknown. Never label a session thermally stable solely because the phone feels cool.

## Final Adreno device

NOT_ACQUIRED. Repeat the environment record and all final benchmarks on the target device. Mali observations are development evidence only unless the founder explicitly accepts a changed scope.
