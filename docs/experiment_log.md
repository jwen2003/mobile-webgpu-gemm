# Experiment log

## ENV001 Environment check on 2026 10 03

Question: Does the development phone expose WebGPU and run the timestamp sample?

Evidence: Device and Chrome screenshots confirm the environment in environment.md. Chrome reports WebGPU hardware acceleration and Vulkan enabled. User opened https://webgpu.github.io/webgpu-samples/?sample=timestampQuery and observed animation and a changing, nonzero render-pass duration.

Interpretation: Basic WebGPU sample execution is supported by observation. Timestamp capability is preliminarily supported by the sample output; actual adapter feature export and compute timing remain to be verified. No LLM or GEMM result exists. Performance variation has not been attributed to a cause.

Next: establish local development/debugging, export adapter features and limits, execute vector addition and compare every output against a CPU reference.

## COMPUTE001 Android FP32 vector addition smoke test

Question: Can Android Chrome execute this project's WGSL compute shader and return all 1025 exact FP32 sums, including the final partial workgroup, while exporting environment evidence?

Setup: Windows Python HTTP server on 127.0.0.1:8000, USB debugging, and `C:\Tools\platform-tools\platform-tools\adb.exe reverse tcp:8000 tcp:8000`. On the phone, open `http://localhost:8000/src/benchmark/` in Chrome. Use the detection, vector-add and JSON-download buttons in order. Source: `src/benchmark/index.html`, `smoke.js`, and independent `vector_add.wgsl`.

Configuration: FP32, N=1025, workgroup_size(64), 17 workgroups; guard `i >= 1025`. A[i]=(i%31)-15; B[i]=((i*7)%23)-11. These small integers and sums are exactly representable. Output is initialized to NaN to detect unwritten elements. Request no optional device features; use core default limits. Compare GPU copy/readback to every CPU-reference element with zero tolerance. This experiment does not measure performance or verify FP16/timestamp operation.

Acceptance: secureContext true; non-null adapter and successful requestDevice; no shader compilation errors, GPU validation/internal/out-of-memory errors or device loss; 1025 elements checked, zero non-finite values, max absolute error 0, zero erroneous elements, PASS. Inspect index 1024 and preserve downloaded JSON under `results/raw/`. Empty adapter info stays empty and must not be used to infer a GPU model.

Computer preparation: Python 3.14.6 and the specified adb executable were verified; one authorized USB device was listed. Local code/static and HTTP checks are preparation evidence only.

Result: PASS on the actual phone. Evidence: [original COMPUTE001 JSON](../results/raw/COMPUTE001-2026-10-04T10-53-11-629Z.json). Environment capture: `2026-10-04T10:53:07.372Z`; run start: `2026-10-04T10:53:08.599Z`; completion record: `2026-10-04T10:53:08.633Z`. These ISO timestamps identify events; their difference is not a GPU kernel duration.

Independent verification: recomputed A[i]=(i%31)-15 and B[i]=((i*7)%23)-11 for i=0..1024 using Python, without relying on the JSON's expected array or PASS label. All 1025 actual outputs matched the recomputed reference exactly; the exported expected array also matched. Max absolute error 0, erroneous elements 0, non-finite outputs 0. At index 1024, expected and actual were both -10. The recorded FP32 shader uses workgroup_size(64), dispatches 17 workgroups, and guards the final partial workgroup. Compilation messages and GPU error records were both empty; no device loss was recorded during this export.

Environment evidence: secureContext true; phone page `http://localhost:8000/src/benchmark/`; adapter vendor `arm`, architecture `gen-5`, device and description empty. These fields do not establish a specific GPU model. Adapter features include `timestamp-query` and `shader-f16`; both remain NOT_TESTED in this experiment. Required features were empty; the actual device reported only `core-features-and-limits`. See [environment record](environment.md#compute001-exported-adapter-and-device-evidence) for the complete buffer/compute limit comparison.

Interpretation: the actual phone successfully executed this project's FP32 vector-add pipeline and copy/readback with exact CPU-reference agreement, including the last valid element of the partial workgroup. This is compute correctness evidence only; performance remains NOT_MEASURED. No kernel duration is inferred from ISO timestamps. It is not LLM/GEMM, FP16, timestamp-query, or final Adreno validation.

Raw evidence integrity: SHA256 `b5729f9b46ad0d087e15b8fa5ffa837d9a2732ca8a053183506efa50c5993bc1`. The original JSON is preserved without editing.

## Open decisions

- Final Adreno access and whether Mali interim development is accepted.
- What baseline GEMM the requested speedup must beat: naive A, runtime kernel, or both.
- Deadline and preferred update cadence.
- Supported Gemma E2B stack; closest Gemma fallback if required, with evidence.
- Exact Q4/Q8 formats and FP16 accumulation interpretation/fallback.
- Per-dispatch instrumentation feasibility in the selected runtime.
