# BASELINE002 actual evidence


## BASELINE002 ordinal 1 — L128 R1 actual evidence

COMPLETE, independent audit PASS. UUID a9637239-e0e3-4476-bb77-3e1dd0158fb7;raw SHA256 8fd3d0c51534493d6da61a1de78d0e91efcdf4c9ba2ce49de4afdfd916c50d4d. Runtime tokenizer returned exactly128 for the full templated string,body 120,template-only 8. Difference is observed,not a BOS/prefill tensor inference. Offline audit reconstructs exact string/hash and recorded counts;does not retokenize the model independently. Requested capacity2048 initialized successfully for this input,not yet evidence for longer configurations.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 259.800000 |
| modelInitializationMs | 91773.400000 |
| tokenPreparationMs | 74.600000 |
| tokenPreparationDrainMs | 116.300000 |
| generationCallToCompletionMs | 7963.100000 |
| firstCallbackMs | 2321.100000 |
| postGenerationDrainMs | 107.400000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量84%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of a row of the first matrix with each column of the second matrix.  The resulting matrix has dimensions equal to the product of the dimensions of the two input matrices.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16501424, "peakLogicalBytes": 83509264, "createdBytes": 83509264, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffers bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |

Campaign1/15:128 length1/5,512 and1024 length0/5. No multi-run median/p95 conclusion;one-sample summary is descriptive only. First callback is not pure prefill,callbacks not output-token counts,logical bytes/heap not physical GPU residency. Pure phases,true output tokens,deviceRSS and Adreno remain open. No repeat result commit/push yet.


## BASELINE002 ordinal 2 — L512 R1 actual evidence

COMPLETE, independent audit PASS. UUID a95374da-d3d9-4f95-a08a-f6059eb27367; raw SHA256 a9d1cc3dadc043a67db3319574f88d514f956340494bb8c2c84bfb6a3e459d79. Exact full-prompt tokenizer count 512, body 504, template-only 8. Offline audit verifies string/hash/recorded counts,not independent model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 48.700000 |
| modelInitializationMs | 88034.600000 |
| tokenPreparationMs | 144.800000 |
| tokenPreparationDrainMs | 49.600000 |
| generationCallToCompletionMs | 13661.900000 |
| firstCallbackMs | 7640.900000 |
| postGenerationDrainMs | 98.000000 |

Errors 0; visibility {"initialState": "visible", "enteredBackground": false, "events": []}; manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量84%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of each row of the first matrix with the corresponding column of the second matrix. The resulting matrix has the same dimensions as the product matrices, and each element is a scalar value.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16528400, "peakLogicalBytes": 83536240, "createdBytes": 83536240, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |

Campaign2/15:128 length1/5,512 length1/5,1024 length0/5. No multi-run conclusion for either length. First callback not pure prefill,logical payload/heap not physical residency;unknown texture formats retained. No output-token/phase/RSS/Adreno closure or result commit/push.


## BASELINE002 ordinal 3 — L1024 R1 actual evidence

COMPLETE, independent audit PASS. UUID 92f2cdf4-7ce5-4c98-a5b1-4ea1ae9eb9a5; raw SHA256 4ae4001e7eed0f6e1b865e4a481d466eceb8a1855ec6493eea97d8e9e95654bb. Exact full-prompt tokenizer count 1024, body 1016, template-only 8. Offline audit verifies string/hash/recorded counts,not independent model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 30.400000 |
| modelInitializationMs | 93478.200000 |
| tokenPreparationMs | 166.400000 |
| tokenPreparationDrainMs | 37.900000 |
| generationCallToCompletionMs | 19538.600000 |
| firstCallbackMs | 14603.400000 |
| postGenerationDrainMs | 101.600000 |

Errors 0; visibility {"initialState": "visible", "enteredBackground": false, "events": []}; manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量84%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication calculates the dot product of two vectors, but for matrices. It results in a new matrix where each element is the dot product of the corresponding rows of the first matrix and the columns of the second matrix.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16474448, "peakLogicalBytes": 83482288, "createdBytes": 83482288, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |

Campaign3/15:each prescribed length1/5. All three exact full-prompt lengths have now run with requestedcapacity2048;not five-session repeat acceptance. No multi-run conclusion. First callback not pure prefill,logical payload/heap not physical residency;unknown formats retained. True outputtoken/phase,RSS andAdreno gaps remain.


## BASELINE002 ordinal 4 — L512 R2 actual evidence

COMPLETE, independent audit PASS. UUID be1b1efe-0832-4ea9-95c3-606a60dc2d7f;raw SHA256 ceb8941645c61ee21cd2666add29f968cac6e895813c5d5300f4bb9fb8e8daa3. Exact full tokenizer count512;full prompt hash matches L512R1. Count evidence checked offline,not independent model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 33.500000 |
| modelInitializationMs | 84031.800000 |
| tokenPreparationMs | 71.800000 |
| tokenPreparationDrainMs | 128.100000 |
| generationCallToCompletionMs | 13639.900000 |
| firstCallbackMs | 7606.600000 |
| postGenerationDrainMs | 106.800000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of each row of the first matrix with the corresponding column of the second matrix. The resulting matrix has the same dimensions as the product matrices, and each element is a scalar value.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16528400, "peakLogicalBytes": 83536240, "createdBytes": 83536240, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |

L512 two-session descriptive wall statistics: {"runtimePreparationMs": {"count": 2, "median": 41.099999994039536, "p95": 48.69999998807907, "min": 33.5, "max": 48.69999998807907, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 2, "median": 86033.20000001788, "p95": 88034.60000002384, "min": 84031.80000001192, "max": 88034.60000002384, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 2, "median": 108.29999995231628, "p95": 144.79999995231628, "min": 71.79999995231628, "max": 144.79999995231628, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 2, "median": 88.84999996423721, "p95": 128.0999999642372, "min": 49.59999996423721, "max": 128.0999999642372, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 2, "median": 13650.899999976158, "p95": 13661.899999976158, "min": 13639.899999976158, "max": 13661.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 2, "median": 7623.749999970198, "p95": 7640.899999976158, "min": 7606.599999964237, "max": 7640.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 2, "median": 102.40000000596046, "p95": 106.80000001192093, "min": 98, "max": 106.80000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Small count,not five-repeat acceptance. Campaign4/15:128 1/5,512 2/5,1024 1/5. First callback not pure prefill,callback count not outputtokens,logical payload/heap not physical residency;unknown textures retained. No reselection/replacement or result commit/push.


## BASELINE002 ordinal 5 — L1024 R2 actual evidence

COMPLETE, independent audit PASS. UUID e4996762-0c31-4d2e-8de0-5a3a06222c7d;raw SHA256 0fc14e964873b71d385ce62c1ba3010a2fb7c9b7fdb97339eaa4aa620a3c54b8. Exact full tokenizer count1024;full prompt/hash unchanged from L1024R1. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 33.100000 |
| modelInitializationMs | 83766.400000 |
| tokenPreparationMs | 156.400000 |
| tokenPreparationDrainMs | 56.000000 |
| generationCallToCompletionMs | 20245.900000 |
| firstCallbackMs | 14928.300000 |
| postGenerationDrainMs | 93.400000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication calculates the dot product of two vectors, but for matrices. It results in a new matrix where each element is the dot product of the corresponding rows of the first matrix and the columns of the second matrix.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16474448, "peakLogicalBytes": 83482288, "createdBytes": 83482288, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |

L1024 two-session descriptive wall statistics: {"runtimePreparationMs": {"count": 2, "median": 31.75, "p95": 33.10000002384186, "min": 30.399999976158142, "max": 33.10000002384186, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 2, "median": 88622.29999998212, "p95": 93478.19999998808, "min": 83766.39999997616, "max": 93478.19999998808, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 2, "median": 161.40000000596046, "p95": 166.39999997615814, "min": 156.4000000357628, "max": 166.39999997615814, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 2, "median": 46.95000001788139, "p95": 56, "min": 37.90000003576279, "max": 56, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 2, "median": 19892.25, "p95": 20245.899999976158, "min": 19538.600000023842, "max": 20245.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 2, "median": 14765.84999999404, "p95": 14928.299999952316, "min": 14603.400000035763, "max": 14928.299999952316, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 2, "median": 97.5, "p95": 101.59999996423721, "min": 93.40000003576279, "max": 101.59999996423721, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Small count,not five-repeat acceptance. Campaign5/15:128 1/5,512 2/5,1024 2/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown texture formats remain recorded. No replacement or result commit/push.


## BASELINE002 ordinal 6 — L128 R2 actual evidence

COMPLETE, independent audit PASS. UUID a337c79c-4964-4f70-9608-4ffe5d83456d;raw SHA256 0fcc12110e79482ad6a0fbef3e7a77084c16484ca7cef2a612e238d9e62657f8. Exact full tokenizer count128;full prompt/hash unchanged from L128R1. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 36.700000 |
| modelInitializationMs | 82590.500000 |
| tokenPreparationMs | 101.300000 |
| tokenPreparationDrainMs | 106.500000 |
| generationCallToCompletionMs | 7997.600000 |
| firstCallbackMs | 2289.500000 |
| postGenerationDrainMs | 100.900000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of a row of the first matrix with each column of the second matrix.  The resulting matrix has dimensions equal to the product of the dimensions of the two input matrices.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16501424, "peakLogicalBytes": 83509264, "createdBytes": 83509264, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |

L128 two-session descriptive wall statistics: {"runtimePreparationMs": {"count": 2, "median": 148.25, "p95": 259.80000001192093, "min": 36.69999998807907, "max": 259.80000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 2, "median": 87181.95000001788, "p95": 91773.40000003576, "min": 82590.5, "max": 91773.40000003576, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 2, "median": 87.9500000178814, "p95": 101.30000001192093, "min": 74.60000002384186, "max": 101.30000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 2, "median": 111.40000000596046, "p95": 116.30000001192093, "min": 106.5, "max": 116.30000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 2, "median": 7980.349999964237, "p95": 7997.599999964237, "min": 7963.099999964237, "max": 7997.599999964237, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 2, "median": 2305.2999999821186, "p95": 2321.099999964237, "min": 2289.5, "max": 2321.099999964237, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 2, "median": 104.14999997615814, "p95": 107.39999997615814, "min": 100.89999997615814, "max": 107.39999997615814, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Small count,not five-repeat acceptance. Campaign6/15:each length2/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown texture formats retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 7 — L1024 R3 actual evidence

COMPLETE, independent audit PASS. UUID 77926bd1-9cf2-4bb6-a7e2-1408fb2bb8dd;raw SHA256 e7407b47357d1ea4c5d43cb279cc2edfad6631f1fe3efd171b5c023856584abd. Exact full tokenizer count1024;full prompt/hash unchanged from prior L1024 sessions. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 39.000000 |
| modelInitializationMs | 92673.300000 |
| tokenPreparationMs | 193.300000 |
| tokenPreparationDrainMs | 1.700000 |
| generationCallToCompletionMs | 20166.600000 |
| firstCallbackMs | 14898.400000 |
| postGenerationDrainMs | 94.800000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication calculates the dot product of two vectors, but for matrices. It results in a new matrix where each element is the dot product of the corresponding rows of the first matrix and the columns of the second matrix.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16474448, "peakLogicalBytes": 83482288, "createdBytes": 83482288, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |

L1024 three-session descriptive wall statistics: {"runtimePreparationMs": {"count": 3, "median": 33.10000002384186, "p95": 39, "min": 30.399999976158142, "max": 39, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 3, "median": 92673.30000001192, "p95": 93478.19999998808, "min": 83766.39999997616, "max": 93478.19999998808, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 3, "median": 166.39999997615814, "p95": 193.30000001192093, "min": 156.4000000357628, "max": 193.30000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 3, "median": 37.90000003576279, "p95": 56, "min": 1.699999988079071, "max": 56, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 3, "median": 20166.599999964237, "p95": 20245.899999976158, "min": 19538.600000023842, "max": 20245.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 3, "median": 14898.399999976158, "p95": 14928.299999952316, "min": 14603.400000035763, "max": 14928.299999952316, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 3, "median": 94.80000001192093, "p95": 101.59999996423721, "min": 93.40000003576279, "max": 101.59999996423721, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Small count,not five-repeat acceptance. Campaign7/15:128 2/5,512 2/5,1024 3/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 8 — L128 R3 actual evidence

COMPLETE, independent audit PASS. UUID 83f9aa2d-8707-4ce6-86e9-1dc2d72aadf4;raw SHA256 a715dd71687bcf87b688a8068d39381d8085713645f1537640be59747509022c. Exact full tokenizer count128;full prompt/hash unchanged from prior L128 sessions. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 40.900000 |
| modelInitializationMs | 91162.500000 |
| tokenPreparationMs | 52.500000 |
| tokenPreparationDrainMs | 155.400000 |
| generationCallToCompletionMs | 7862.400000 |
| firstCallbackMs | 2253.400000 |
| postGenerationDrainMs | 97.200000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of a row of the first matrix with each column of the second matrix.  The resulting matrix has dimensions equal to the product of the dimensions of the two input matrices.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16501424, "peakLogicalBytes": 83509264, "createdBytes": 83509264, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |

L128 three-session descriptive wall statistics: {"runtimePreparationMs": {"count": 3, "median": 40.89999997615814, "p95": 259.80000001192093, "min": 36.69999998807907, "max": 259.80000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 3, "median": 91162.5, "p95": 91773.40000003576, "min": 82590.5, "max": 91773.40000003576, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 3, "median": 74.60000002384186, "p95": 101.30000001192093, "min": 52.5, "max": 101.30000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 3, "median": 116.30000001192093, "p95": 155.4000000357628, "min": 106.5, "max": 155.4000000357628, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 3, "median": 7963.099999964237, "p95": 7997.599999964237, "min": 7862.400000035763, "max": 7997.599999964237, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 3, "median": 2289.5, "p95": 2321.099999964237, "min": 2253.400000035763, "max": 2321.099999964237, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 3, "median": 100.89999997615814, "p95": 107.39999997615814, "min": 97.19999998807907, "max": 107.39999997615814, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Small count,not five-repeat acceptance. Campaign8/15:128 3/5,512 2/5,1024 3/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 9 — L512 R3 actual evidence

COMPLETE, independent audit PASS. UUID f2275b6f-25e2-4cb6-8ef5-66d08bafcb82;raw SHA256 90e58dbceced3be81051c2f7000f00be86543746af90691222cc52b117a13edb. Exact full tokenizer count512;full prompt/hash unchanged from prior L512 sessions. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 38.300000 |
| modelInitializationMs | 92280.600000 |
| tokenPreparationMs | 79.900000 |
| tokenPreparationDrainMs | 121.500000 |
| generationCallToCompletionMs | 13479.700000 |
| firstCallbackMs | 7675.700000 |
| postGenerationDrainMs | 98.300000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of each row of the first matrix with the corresponding column of the second matrix. The resulting matrix has the same dimensions as the product matrices, and each element is a scalar value.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16528400, "peakLogicalBytes": 83536240, "createdBytes": 83536240, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |

L512 three-session descriptive wall statistics: {"runtimePreparationMs": {"count": 3, "median": 38.30000001192093, "p95": 48.69999998807907, "min": 33.5, "max": 48.69999998807907, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 3, "median": 88034.60000002384, "p95": 92280.60000002384, "min": 84031.80000001192, "max": 92280.60000002384, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 3, "median": 79.89999997615814, "p95": 144.79999995231628, "min": 71.79999995231628, "max": 144.79999995231628, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 3, "median": 121.5, "p95": 128.0999999642372, "min": 49.59999996423721, "max": 128.0999999642372, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 3, "median": 13639.899999976158, "p95": 13661.899999976158, "min": 13479.700000047684, "max": 13661.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 3, "median": 7640.899999976158, "p95": 7675.700000047684, "min": 7606.599999964237, "max": 7675.700000047684, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 3, "median": 98.30000001192093, "p95": 106.80000001192093, "min": 98, "max": 106.80000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Small count,not five-repeat acceptance. Campaign9/15:each length3/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 10 — L128 R4 actual evidence

COMPLETE, independent audit PASS. UUID f031db34-1b9a-4abf-b964-bcd1a83c80d6;raw SHA256 41533244d4132115b0d0667422680816bb2cb9b57f4ba17be9c29579caea983b. Exact full tokenizer count128;full prompt/hash unchanged from prior L128 sessions. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 43.200000 |
| modelInitializationMs | 88482.000000 |
| tokenPreparationMs | 92.700000 |
| tokenPreparationDrainMs | 105.800000 |
| generationCallToCompletionMs | 7957.600000 |
| firstCallbackMs | 2290.500000 |
| postGenerationDrainMs | 103.700000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of a row of the first matrix with each column of the second matrix.  The resulting matrix has dimensions equal to the product of the dimensions of the two input matrices.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16501424, "peakLogicalBytes": 83509264, "createdBytes": 83509264, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |

L128 four-session descriptive wall statistics: {"runtimePreparationMs": {"count": 4, "median": 42.04999998211861, "p95": 259.80000001192093, "min": 36.69999998807907, "max": 259.80000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 4, "median": 89822.25, "p95": 91773.40000003576, "min": 82590.5, "max": 91773.40000003576, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 4, "median": 83.65000000596046, "p95": 101.30000001192093, "min": 52.5, "max": 101.30000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 4, "median": 111.40000000596046, "p95": 155.4000000357628, "min": 105.79999995231628, "max": 155.4000000357628, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 4, "median": 7960.3499999940395, "p95": 7997.599999964237, "min": 7862.400000035763, "max": 7997.599999964237, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 4, "median": 2290.0, "p95": 2321.099999964237, "min": 2253.400000035763, "max": 2321.099999964237, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 4, "median": 102.2999999821186, "p95": 107.39999997615814, "min": 97.19999998807907, "max": 107.39999997615814, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Not five-repeat acceptance. Campaign10/15:128 4/5,512 3/5,1024 3/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 11 — L1024 R4 actual evidence

COMPLETE, independent audit PASS. UUID b5cd483f-70e0-4536-8340-09fc1b9dd1aa;raw SHA256 95825df69b6b464c20c9b06d0d38958884f02143a8fc4e3575d0b8a517e61a03. Exact full tokenizer count1024;full prompt/hash unchanged from prior L1024 sessions. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 36.600000 |
| modelInitializationMs | 93432.600000 |
| tokenPreparationMs | 111.600000 |
| tokenPreparationDrainMs | 67.000000 |
| generationCallToCompletionMs | 20185.800000 |
| firstCallbackMs | 14788.200000 |
| postGenerationDrainMs | 93.500000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication calculates the dot product of two vectors, but for matrices. It results in a new matrix where each element is the dot product of the corresponding rows of the first matrix and the columns of the second matrix.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16474448, "peakLogicalBytes": 83482288, "createdBytes": 83482288, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83482288 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16474448 | 0 |

L1024 four-session descriptive wall statistics: {"runtimePreparationMs": {"count": 4, "median": 34.85000002384186, "p95": 39, "min": 30.399999976158142, "max": 39, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 4, "median": 93052.94999998808, "p95": 93478.19999998808, "min": 83766.39999997616, "max": 93478.19999998808, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 4, "median": 161.40000000596046, "p95": 193.30000001192093, "min": 111.60000002384186, "max": 193.30000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 4, "median": 46.95000001788139, "p95": 67, "min": 1.699999988079071, "max": 67, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 4, "median": 20176.19999998808, "p95": 20245.899999976158, "min": 19538.600000023842, "max": 20245.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 4, "median": 14843.299999982119, "p95": 14928.299999952316, "min": 14603.400000035763, "max": 14928.299999952316, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 4, "median": 94.15000000596046, "p95": 101.59999996423721, "min": 93.40000003576279, "max": 101.59999996423721, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Not five-repeat acceptance. Campaign11/15:128 4/5,512 3/5,1024 4/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 12 — L512 R4 actual evidence

COMPLETE, independent audit PASS. UUID 220645a9-e55b-4c99-bf46-4361bf63f358;raw SHA256 567c70ff31635f0b26c04cf5cd73244aedba570694307c2f82e300100ab16475. Exact full tokenizer count512;full prompt/hash unchanged from prior L512 sessions. Recorded counts verified,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 50.000000 |
| modelInitializationMs | 91549.000000 |
| tokenPreparationMs | 104.600000 |
| tokenPreparationDrainMs | 100.600000 |
| generationCallToCompletionMs | 13581.000000 |
| firstCallbackMs | 7706.900000 |
| postGenerationDrainMs | 106.200000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of each row of the first matrix with the corresponding column of the second matrix. The resulting matrix has the same dimensions as the product matrices, and each element is a scalar value.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16528400, "peakLogicalBytes": 83536240, "createdBytes": 83536240, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |

L512 four-session descriptive wall statistics: {"runtimePreparationMs": {"count": 4, "median": 43.5, "p95": 50, "min": 33.5, "max": 50, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "modelInitializationMs": {"count": 4, "median": 89791.80000001192, "p95": 92280.60000002384, "min": 84031.80000001192, "max": 92280.60000002384, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationMs": {"count": 4, "median": 92.25, "p95": 144.79999995231628, "min": 71.79999995231628, "max": 144.79999995231628, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "tokenPreparationDrainMs": {"count": 4, "median": 111.0499999821186, "p95": 128.0999999642372, "min": 49.59999996423721, "max": 128.0999999642372, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "generationCallToCompletionMs": {"count": 4, "median": 13610.449999988079, "p95": 13661.899999976158, "min": 13479.700000047684, "max": 13661.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "firstCallbackMs": {"count": 4, "median": 7658.300000011921, "p95": 7706.899999976158, "min": 7606.599999964237, "max": 7706.899999976158, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}, "postGenerationDrainMs": {"count": 4, "median": 102.25, "p95": 106.80000001192093, "min": 98, "max": 106.80000001192093, "method": "nearest-rank p95;with five p95 is maximum,weak tail evidence"}}. Not five-repeat acceptance. Campaign12/15:each length4/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 13 — L512 R5 actual evidence

COMPLETE, independent audit PASS. UUID 417e9106-9fbf-443c-8f2a-ce6ff878f737;raw SHA256 dbd70a81a93b8122e10955f417345d50864cf902fec463c920142a4d68891ae6. Exact full tokenizer count512;full prompt/hash unchanged across all five L512 sessions. Recorded counts checked,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 43.300000 |
| modelInitializationMs | 92103.100000 |
| tokenPreparationMs | 95.100000 |
| tokenPreparationDrainMs | 94.400000 |
| generationCallToCompletionMs | 13411.500000 |
| firstCallbackMs | 7721.300000 |
| postGenerationDrainMs | 96.800000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of each row of the first matrix with the corresponding column of the second matrix. The resulting matrix has the same dimensions as the product matrices, and each element is a scalar value.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16528400, "peakLogicalBytes": 83536240, "createdBytes": 83536240, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83536240 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16528400 | 0 |

### L512 five-session wall statistics

| Metric | median ms | nearest-rank p95 ms | min ms | max ms |
|---|---:|---:|---:|---:|
| runtimePreparationMs | 43.300000 | 50.000000 | 33.500000 | 50.000000 |
| modelInitializationMs | 91549.000000 | 92280.600000 | 84031.800000 | 92280.600000 |
| tokenPreparationMs | 95.100000 | 144.800000 | 71.800000 | 144.800000 |
| tokenPreparationDrainMs | 100.600000 | 128.100000 | 49.600000 | 128.100000 |
| generationCallToCompletionMs | 13581.000000 | 13661.900000 | 13411.500000 | 13661.900000 |
| firstCallbackMs | 7675.700000 | 7721.300000 | 7606.600000 | 7721.300000 |
| postGenerationDrainMs | 98.300000 | 106.800000 | 96.800000 | 106.800000 |

Five samples p95 equals maximum,weak tail evidence. L512 combined-wall/observable memory repeats verified,not purephase acceptance. Campaign13/15:128 4/5,512 5/5,1024 4/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 14 — L128 R5 actual evidence

COMPLETE, independent audit PASS. UUID ab93338f-401c-48b4-b3e7-c0a2e5cab251;raw SHA256 557a8868824f653262c0c2153fb2591907fa426402d1a969359cb966d43c5cae. Exact full tokenizer count128;full prompt/hash unchanged across all five L128 sessions. Recorded counts checked,not independent offline model retokenization.

| Metric | Actual wall ms |
|---|---:|
| runtimePreparationMs | 49.100000 |
| modelInitializationMs | 83152.100000 |
| tokenPreparationMs | 99.500000 |
| tokenPreparationDrainMs | 106.000000 |
| generationCallToCompletionMs | 8096.300000 |
| firstCallbackMs | 2293.000000 |
| postGenerationDrainMs | 100.600000 |

Errors 0;visibility {"initialState": "visible", "enteredBackground": false, "events": []};manual conditions {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量85%", "devtools": "未开启", "flag": "已停用", "backgroundApps": "无其它主动运行的后台应用；VPN开启"}.

Output: "Matrix multiplication computes a new matrix by taking the dot product of a row of the first matrix with each column of the second matrix.  The resulting matrix has dimensions equal to the product of the dimensions of the two input matrices.\n\n\n\n"

Logical resource audit PASS: {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16501424, "peakLogicalBytes": 83509264, "createdBytes": 83509264, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

| Stage | JS heap channel | Logical buffer bytes | Known texture payload bytes |
|---|---|---:|---:|
| BEFORE_RUNTIME | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| BEFORE_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | NOT_INSTALLED | NOT_INSTALLED |
| AFTER_INIT | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| AFTER_TOKEN_PREPARATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| BEFORE_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83077648 | 308026776 |
| FIRST_CALLBACK | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83104624 | 308026776 |
| AFTER_GENERATION | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_DRAIN | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 83509264 | 308026776 |
| AFTER_TASK_CLOSE | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_DEVICE_DESTROY | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |
| AFTER_CLEANUP | {"status": "AVAILABLE", "usedJSHeapSize": 10000000, "totalJSHeapSize": 10000000, "jsHeapSizeLimit": 3760000000, "scope": "performance.memory reported JS heap,may be rounded/shared;not all native/WASM allocations,not GPU memory or RSS"} | 16501424 | 0 |

### L128 five-session wall statistics

| Metric | median ms | nearest-rank p95 ms | min ms | max ms |
|---|---:|---:|---:|---:|
| runtimePreparationMs | 43.200000 | 259.800000 | 36.700000 | 259.800000 |
| modelInitializationMs | 88482.000000 | 91773.400000 | 82590.500000 | 91773.400000 |
| tokenPreparationMs | 92.700000 | 101.300000 | 52.500000 | 101.300000 |
| tokenPreparationDrainMs | 106.500000 | 155.400000 | 105.800000 | 155.400000 |
| generationCallToCompletionMs | 7963.100000 | 8096.300000 | 7862.400000 | 8096.300000 |
| firstCallbackMs | 2290.500000 | 2321.100000 | 2253.400000 | 2321.100000 |
| postGenerationDrainMs | 100.900000 | 107.400000 | 97.200000 | 107.400000 |

Five samples p95 equals maximum,weak tail evidence. L128 combined-wall/observable memory repeats verified,not purephase acceptance. Campaign14/15:128 5/5,512 5/5,1024 4/5. First callback not pure prefill,callbacks not outputtoken count;heap/logical payload not physical GPU memory. Unknown textures retained;phase/outputtoken,RSS,Adreno gaps remain. No replacement or result commit/push.


## BASELINE002 ordinal 15 — L1024 R5 and final acceptance

COMPLETE / independent PASS. UUID 72c11448-3bfb-4742-b0a2-d0fb8c74d57a;raw SHA256 f9de79fb4c6d416b159cc42ad075a7ac91d1de94b4bd6cfb0cd827e7b0531236. Exact full token count1024 with fixed prompt hash. Errors0,background false. S15 walls {"runtimePreparationMs": 31.899999976158142, "modelInitializationMs": 83471.30000001192, "tokenPreparationMs": 102.59999996423721, "tokenPreparationDrainMs": 88.89999997615814, "generationCallToCompletionMs": 20111, "firstCallbackMs": 14834.199999988079, "postGenerationDrainMs": 99.89999997615814}. Output "Matrix multiplication calculates the dot product of two vectors, but for matrices. It results in a new matrix where each element is the dot product of the corresponding rows of the first matrix and the columns of the second matrix.\n\n\n\n". Logical resource audit {"status": "OBSERVED", "buffers": {"currentLogicalBytes": 16474448, "peakLogicalBytes": 83482288, "createdBytes": 83482288, "explicitDestroyedBytes": 67007840}, "textures": {"knownFormatCurrentLogicalBytes": 0, "knownFormatPeakLogicalBytes": 308026776, "createdKnownFormatBytes": 308039064, "explicitDestroyedKnownFormatBytes": 308039064, "unknownFormatLiveCount": 0, "unknownFormatCreatedCount": 333, "totalLogicalBytes": 0, "status": "KNOWN_FORMAT_LOGICAL_PAYLOAD"}, "limits": {"maxObjects": 100000}, "droppedMetadata": 0, "droppedDiagnostics": 0, "coverageFailures": [], "scope": "Observed stock device after installation;buffer.size and known uncompressed texture texel payload incl mips/layers/samples,not driver allocation/residency. Unknown formats not guessed. GC/registry release not explicit destroy;no other-device/worker coverage. Profiler GPU allocations zero."}.

Campaign FIFTEEN_SESSIONS_VERIFIED:each128/512/1024 input5 independent COMPLETE/audited sessions. All errors0,no recorded background transition,no metadata/diagnostic loss. Original raw bytes retained. Token counts are actual pinned-runtime returns,not independent offline tokenizer reruns.

### Final per-session walls

| Ordinal | Length | Rep | Init s | Generation s | First callback s | Drain ms |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 128 | 1 | 91.773400 | 7.963100 | 2.321100 | 107.400000 |
| 2 | 512 | 1 | 88.034600 | 13.661900 | 7.640900 | 98.000000 |
| 3 | 1024 | 1 | 93.478200 | 19.538600 | 14.603400 | 101.600000 |
| 4 | 512 | 2 | 84.031800 | 13.639900 | 7.606600 | 106.800000 |
| 5 | 1024 | 2 | 83.766400 | 20.245900 | 14.928300 | 93.400000 |
| 6 | 128 | 2 | 82.590500 | 7.997600 | 2.289500 | 100.900000 |
| 7 | 1024 | 3 | 92.673300 | 20.166600 | 14.898400 | 94.800000 |
| 8 | 128 | 3 | 91.162500 | 7.862400 | 2.253400 | 97.200000 |
| 9 | 512 | 3 | 92.280600 | 13.479700 | 7.675700 | 98.300000 |
| 10 | 128 | 4 | 88.482000 | 7.957600 | 2.290500 | 103.700000 |
| 11 | 1024 | 4 | 93.432600 | 20.185800 | 14.788200 | 93.500000 |
| 12 | 512 | 4 | 91.549000 | 13.581000 | 7.706900 | 106.200000 |
| 13 | 512 | 5 | 92.103100 | 13.411500 | 7.721300 | 96.800000 |
| 14 | 128 | 5 | 83.152100 | 8.096300 | 2.293000 | 100.600000 |
| 15 | 1024 | 5 | 83.471300 | 20.111000 | 14.834200 | 99.900000 |

### Final summary (grouped by full prompt count,not pooled)

| Tokens | Metric | median ms | nearest-rank p95 ms | min ms | max ms |
|---:|---|---:|---:|---:|---:|
| 128 | runtimePreparationMs | 43.200000 | 259.800000 | 36.700000 | 259.800000 |
| 128 | modelInitializationMs | 88482.000000 | 91773.400000 | 82590.500000 | 91773.400000 |
| 128 | tokenPreparationMs | 92.700000 | 101.300000 | 52.500000 | 101.300000 |
| 128 | tokenPreparationDrainMs | 106.500000 | 155.400000 | 105.800000 | 155.400000 |
| 128 | generationCallToCompletionMs | 7963.100000 | 8096.300000 | 7862.400000 | 8096.300000 |
| 128 | firstCallbackMs | 2290.500000 | 2321.100000 | 2253.400000 | 2321.100000 |
| 128 | postGenerationDrainMs | 100.900000 | 107.400000 | 97.200000 | 107.400000 |
| 512 | runtimePreparationMs | 43.300000 | 50.000000 | 33.500000 | 50.000000 |
| 512 | modelInitializationMs | 91549.000000 | 92280.600000 | 84031.800000 | 92280.600000 |
| 512 | tokenPreparationMs | 95.100000 | 144.800000 | 71.800000 | 144.800000 |
| 512 | tokenPreparationDrainMs | 100.600000 | 128.100000 | 49.600000 | 128.100000 |
| 512 | generationCallToCompletionMs | 13581.000000 | 13661.900000 | 13411.500000 | 13661.900000 |
| 512 | firstCallbackMs | 7675.700000 | 7721.300000 | 7606.600000 | 7721.300000 |
| 512 | postGenerationDrainMs | 98.300000 | 106.800000 | 96.800000 | 106.800000 |
| 1024 | runtimePreparationMs | 33.100000 | 39.000000 | 30.400000 | 39.000000 |
| 1024 | modelInitializationMs | 92673.300000 | 93478.200000 | 83471.300000 | 93478.200000 |
| 1024 | tokenPreparationMs | 156.400000 | 193.300000 | 102.600000 | 193.300000 |
| 1024 | tokenPreparationDrainMs | 56.000000 | 88.900000 | 1.700000 | 88.900000 |
| 1024 | generationCallToCompletionMs | 20166.600000 | 20245.900000 | 19538.600000 | 20245.900000 |
| 1024 | firstCallbackMs | 14834.200000 | 14928.300000 | 14603.400000 | 14928.300000 |
| 1024 | postGenerationDrainMs | 94.800000 | 101.600000 | 93.400000 | 101.600000 |

### Final memory channels by stage (no sums across channels)

| Tokens | Stage | Channel | Metric | count | median bytes | p95 bytes | range bytes |
|---:|---|---|---|---:|---|---|---|
| 128 | AFTER_CLEANUP | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_CLEANUP | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_CLEANUP | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | AFTER_CLEANUP | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16501424 | 16501424 | 16501424–16501424 |
| 128 | AFTER_CLEANUP | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83509264 | 83509264 | 83509264–83509264 |
| 128 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 128 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 128 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | AFTER_DEVICE_DESTROY | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16501424 | 16501424 | 16501424–16501424 |
| 128 | AFTER_DEVICE_DESTROY | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83509264 | 83509264 | 83509264–83509264 |
| 128 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 128 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 128 | AFTER_DRAIN | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_DRAIN | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_DRAIN | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | AFTER_DRAIN | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83509264 | 83509264 | 83509264–83509264 |
| 128 | AFTER_DRAIN | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83509264 | 83509264 | 83509264–83509264 |
| 128 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | AFTER_GENERATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_GENERATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_GENERATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | AFTER_GENERATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83509264 | 83509264 | 83509264–83509264 |
| 128 | AFTER_GENERATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83509264 | 83509264 | 83509264–83509264 |
| 128 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | AFTER_INIT | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_INIT | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_INIT | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | AFTER_INIT | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 128 | AFTER_INIT | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 128 | AFTER_INIT | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_INIT | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_INIT | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | AFTER_TASK_CLOSE | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_TASK_CLOSE | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_TASK_CLOSE | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | AFTER_TASK_CLOSE | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16501424 | 16501424 | 16501424–16501424 |
| 128 | AFTER_TASK_CLOSE | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83509264 | 83509264 | 83509264–83509264 |
| 128 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 128 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 128 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | AFTER_TOKEN_PREPARATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 128 | AFTER_TOKEN_PREPARATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 128 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_GENERATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | BEFORE_GENERATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | BEFORE_GENERATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | BEFORE_GENERATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 128 | BEFORE_GENERATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 128 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_INIT | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | BEFORE_INIT | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | BEFORE_INIT | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | BEFORE_INIT | trackedBufferLogicalBytes | currentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_INIT | trackedBufferLogicalBytes | peakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_RUNTIME | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | BEFORE_RUNTIME | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | BEFORE_RUNTIME | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | BEFORE_RUNTIME | trackedBufferLogicalBytes | currentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_RUNTIME | trackedBufferLogicalBytes | peakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 128 | FIRST_CALLBACK | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | FIRST_CALLBACK | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 128 | FIRST_CALLBACK | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 128 | FIRST_CALLBACK | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83104624 | 83104624 | 83104624–83104624 |
| 128 | FIRST_CALLBACK | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83104624 | 83104624 | 83104624–83104624 |
| 128 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 128 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | AFTER_CLEANUP | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_CLEANUP | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_CLEANUP | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | AFTER_CLEANUP | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16528400 | 16528400 | 16528400–16528400 |
| 512 | AFTER_CLEANUP | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83536240 | 83536240 | 83536240–83536240 |
| 512 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 512 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 512 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | AFTER_DEVICE_DESTROY | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16528400 | 16528400 | 16528400–16528400 |
| 512 | AFTER_DEVICE_DESTROY | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83536240 | 83536240 | 83536240–83536240 |
| 512 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 512 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 512 | AFTER_DRAIN | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_DRAIN | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_DRAIN | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | AFTER_DRAIN | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83536240 | 83536240 | 83536240–83536240 |
| 512 | AFTER_DRAIN | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83536240 | 83536240 | 83536240–83536240 |
| 512 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | AFTER_GENERATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_GENERATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_GENERATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | AFTER_GENERATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83536240 | 83536240 | 83536240–83536240 |
| 512 | AFTER_GENERATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83536240 | 83536240 | 83536240–83536240 |
| 512 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | AFTER_INIT | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_INIT | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_INIT | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | AFTER_INIT | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 512 | AFTER_INIT | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 512 | AFTER_INIT | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_INIT | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_INIT | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | AFTER_TASK_CLOSE | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_TASK_CLOSE | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_TASK_CLOSE | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | AFTER_TASK_CLOSE | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16528400 | 16528400 | 16528400–16528400 |
| 512 | AFTER_TASK_CLOSE | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83536240 | 83536240 | 83536240–83536240 |
| 512 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 512 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 512 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | AFTER_TOKEN_PREPARATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 512 | AFTER_TOKEN_PREPARATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 512 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_GENERATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | BEFORE_GENERATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | BEFORE_GENERATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | BEFORE_GENERATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 512 | BEFORE_GENERATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 512 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_INIT | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | BEFORE_INIT | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | BEFORE_INIT | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | BEFORE_INIT | trackedBufferLogicalBytes | currentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_INIT | trackedBufferLogicalBytes | peakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_RUNTIME | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | BEFORE_RUNTIME | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | BEFORE_RUNTIME | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | BEFORE_RUNTIME | trackedBufferLogicalBytes | currentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_RUNTIME | trackedBufferLogicalBytes | peakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 512 | FIRST_CALLBACK | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | FIRST_CALLBACK | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 512 | FIRST_CALLBACK | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 512 | FIRST_CALLBACK | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83104624 | 83104624 | 83104624–83104624 |
| 512 | FIRST_CALLBACK | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83104624 | 83104624 | 83104624–83104624 |
| 512 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 512 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | AFTER_CLEANUP | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_CLEANUP | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_CLEANUP | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | AFTER_CLEANUP | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16474448 | 16474448 | 16474448–16474448 |
| 1024 | AFTER_CLEANUP | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83482288 | 83482288 | 83482288–83482288 |
| 1024 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 1024 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_CLEANUP | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 1024 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_DEVICE_DESTROY | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | AFTER_DEVICE_DESTROY | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16474448 | 16474448 | 16474448–16474448 |
| 1024 | AFTER_DEVICE_DESTROY | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83482288 | 83482288 | 83482288–83482288 |
| 1024 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 1024 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_DEVICE_DESTROY | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 1024 | AFTER_DRAIN | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_DRAIN | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_DRAIN | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | AFTER_DRAIN | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83482288 | 83482288 | 83482288–83482288 |
| 1024 | AFTER_DRAIN | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83482288 | 83482288 | 83482288–83482288 |
| 1024 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_DRAIN | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | AFTER_GENERATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_GENERATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_GENERATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | AFTER_GENERATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83482288 | 83482288 | 83482288–83482288 |
| 1024 | AFTER_GENERATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83482288 | 83482288 | 83482288–83482288 |
| 1024 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_GENERATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | AFTER_INIT | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_INIT | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_INIT | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | AFTER_INIT | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 1024 | AFTER_INIT | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 1024 | AFTER_INIT | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_INIT | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_INIT | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | AFTER_TASK_CLOSE | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_TASK_CLOSE | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_TASK_CLOSE | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | AFTER_TASK_CLOSE | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 16474448 | 16474448 | 16474448–16474448 |
| 1024 | AFTER_TASK_CLOSE | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83482288 | 83482288 | 83482288–83482288 |
| 1024 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 0 | 0 | 0–0 |
| 1024 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_TASK_CLOSE | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 5 | 0 | 0 | 0–0 |
| 1024 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | AFTER_TOKEN_PREPARATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | AFTER_TOKEN_PREPARATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 1024 | AFTER_TOKEN_PREPARATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 1024 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | AFTER_TOKEN_PREPARATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_GENERATION | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | BEFORE_GENERATION | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | BEFORE_GENERATION | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | BEFORE_GENERATION | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 1024 | BEFORE_GENERATION | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83077648 | 83077648 | 83077648–83077648 |
| 1024 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | BEFORE_GENERATION | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_INIT | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | BEFORE_INIT | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | BEFORE_INIT | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | BEFORE_INIT | trackedBufferLogicalBytes | currentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_INIT | trackedBufferLogicalBytes | peakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_INIT | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_RUNTIME | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | BEFORE_RUNTIME | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | BEFORE_RUNTIME | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | BEFORE_RUNTIME | trackedBufferLogicalBytes | currentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_RUNTIME | trackedBufferLogicalBytes | peakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | BEFORE_RUNTIME | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |
| 1024 | FIRST_CALLBACK | reportedJsHeapBytes | usedJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | FIRST_CALLBACK | reportedJsHeapBytes | totalJSHeapSize | 5 | 10000000 | 10000000 | 10000000–10000000 |
| 1024 | FIRST_CALLBACK | reportedJsHeapBytes | jsHeapSizeLimit | 5 | 3760000000 | 3760000000 | 3760000000–3760000000 |
| 1024 | FIRST_CALLBACK | trackedBufferLogicalBytes | currentLogicalBytes | 5 | 83104624 | 83104624 | 83104624–83104624 |
| 1024 | FIRST_CALLBACK | trackedBufferLogicalBytes | peakLogicalBytes | 5 | 83104624 | 83104624 | 83104624–83104624 |
| 1024 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | knownFormatCurrentLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | knownFormatPeakLogicalBytes | 5 | 308026776 | 308026776 | 308026776–308026776 |
| 1024 | FIRST_CALLBACK | trackedTextureLogicalPayloadBytes | totalLogicalBytes | 0 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE–UNAVAILABLE |

JS used/total heap returned10,000,000 bytes in all captured snapshots;limit3,760,000,000. This coarse/repeated API return is not proof of no growth or actual total engine/WASM memory. Known texture peak308,026,776 bytes is a partial texel-payload subtotal:333 texture creations/run had unsupported formats rgba32uint227,rgba16uint91,rgba32sint9,rgba8uint6. Unknown descriptors retained;not unknown hardware formats,just not supported by this observer table. During active runtime their total payload is UNAVAILABLE. No physical residency/RSS claim. Buffer after-init83,077,648 bytes;post-drain perlength values in summary;explicit-destroy bookkeeping after device close cannot prove leaks/reclamation.

First callback is not pure prefill;generation-to-promise is combined request wall;callback count not actual output tokens. Initializations include local fetch/WASM/device/observation and are not cold-cache or GPU-only. Model disk size not memory. Fifteen results close exact input-length and five-repeat evidence for these observable scopes only;pure phases,true outputtoken throughput/per-token/kernel attribution,deviceRSS andAdreno remain open. No timestamps/profiler command expansion or runtime/model optimization.


## MEMORY001: offline texture accounting (2026-10-06)

All 15 BASELINE002 sessions independently audited: 7,500 recorded texture creations, all six formats now accounted for in derived files. See [texture payload accounting](../docs/memory001_texture_accounting.md) for per-session cumulative creation, active explicit-lifecycle peak and every stage snapshot. Original partial-map counters and all 41 historical raw hashes retained unchanged. This closes the recorded-format payload gap, not physical GPU residency, native/WASM heap or Chrome RSS/PSS. JS heap, buffer logical bytes and texture logical payload remain separate. No phone/model rerun, adb or trace collection; assignment memory remains PARTIAL.
