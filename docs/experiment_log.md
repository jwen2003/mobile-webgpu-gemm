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

## TIMING001 Android WebGPU compute timestamp validation

Question: Can timestamp-query actually be enabled and read back on Android Chrome? Do different compute-pass workloads produce interpretable timestamp samples?

Setup: use the existing Windows localhost:8000 server and USB adb reverse; open `http://localhost:8000/src/benchmark/timing.html` in phone Chrome. Record manual thermal, charging and WebGPU Developer Features flag states (UNKNOWN until observed); do not automatically change flags. Export start/end ISO times, full adapter/device features and limits, adapter info without guessing empty fields, shader source and visibility events. Source: `timing.html`, `timing.js`, `timing_math.mjs`, `timing_vector_add.wgsl` under `src/benchmark/`.

Configuration: FP32 parameterized vector add, uniform u32 N, workgroup_size(64), explicit bounds guard. N=1025/65536/1048576; dispatchesPerPass=1/32. Same deterministic small integer inputs as COMPUTE001, exact CPU sums and zero tolerance. Each pass checks all final output elements. Repeated dispatches overwrite the same C; final-output correctness does not independently establish that every repeated dispatch executed. Six configuration blocks use fixed xorshift32/Fisher-Yates seed 0x0017a001, with shuffled block order exported. Per block: 10 warm-up passes excluded from statistics, then 30 measured passes. Preserve all 240 raw passes including zeros. Pipeline is created once per run; allocations, bindings, input and uniform uploads are outside each block's sampling loop. Passes are strictly serial: completion, query map/unmap, output map/unmap and CPU comparison finish before submitting the next.

Measurement boundaries: compute pass descriptor timestampWrites records pass begin/end; resolveQuerySet and copies occur after the pass. Read with BigUint64Array, subtract as BigInt, preserve decimal raw strings, then convert ns to ms. Pass time may contain scheduling costs. Wall metric is performance.now immediately before queue.submit to onSubmittedWorkDone completion; the submission includes the timed pass, query resolve and both timestamp/output copies. Mapping and CPU checking are outside the wall interval. No division of batch time into independent dispatch latency, no ISO-time-derived GPU duration.

Statistics: 30 measured pass values per block; median uses midpoint for even counts; nearest-rank p95 is sorted[ceil(0.95*n)-1] (29th of 30); min/max and zero count. Report GPU ns and wall ms separately. Keep zero durations without trimming or substitution. Do not require strict time monotonicity with N or infer bottlenecks/peak bandwidth. Incomplete runs preserve partial records and mark incomplete summaries.

Acceptance: device features actually contain timestamp-query; all six blocks complete; 30 measured samples per block; all output checks PASS with zero max absolute error/errors/non-finite values; empty compilation/GPU error records and no device loss; raw begin/end strings and nonnegative deltas available. Review timing distributions and zeros for interpretability; all-zero durations leave useful timestamp discrimination unresolved. Record any background entry during sampling and review its effect without discarding evidence. Unsupported adapters report UNSUPPORTED with no wall-clock substitution. shader-f16 remains unverified.

Result: timestamp-query was actually enabled on the device and read back from compute-pass timestampWrites in two completed phone runs. Evidence is preserved separately:

- Run 1: [TIMING001-2026-10-04T11-25-41-874Z.json](../results/raw/TIMING001-2026-10-04T11-25-41-874Z.json), start `2026-10-04T11:25:38.441Z`, end `2026-10-04T11:25:40.884Z`; SHA256 `a41cb1f4da74c2b75a409e69a41ed42d80e4cd33d11d63aef1835259cc786ec9`.
- Run 2: [TIMING001-2026-10-04T11-39-21-730Z.json](../results/raw/TIMING001-2026-10-04T11-39-21-730Z.json), start `2026-10-04T11:39:17.730Z`, end `2026-10-04T11:39:20.220Z`; SHA256 `cf91b1747ae2779ccbbe2812b8c295b00f736d585d3723c65736d92d7b6ed4f4`.

Independent verification: parsed decimal start/end timestamps as Python integers, recomputed all 240 differences per run, and verified every exported ns/ms duration. Recomputed each configuration's measured-pass median, nearest-rank p95 (29th sorted sample), min/max and zero count; each matched the exported summary. Ten warm-ups per block remain in raw evidence but are excluded from these statistics. Both runs have six complete blocks and 180 measured passes each. All per-pass correctness records and six correctness summaries per run are PASS, with zero reported absolute error/error elements/non-finite values. TIMING001 exports correctness summaries rather than full output arrays, so this offline review does not independently recompare GPU output elements. Compilation messages and GPU error arrays are empty in both files, with no recorded device loss.

GPU compute-pass duration comparison (milliseconds; 30 measured samples per row per run):

| N | Dispatches/pass | Run 1 median | Run 1 p95 | Run 2 median | Run 2 p95 | Zero count R1 / R2 |
|---:|---:|---:|---:|---:|---:|---:|
| 1025 | 1 | 0.065536 | 3.145728 | 0.065536 | 0.655360 | 6 / 6 |
| 1025 | 32 | 0.327680 | 3.211264 | 0.327680 | 0.393216 | 0 / 0 |
| 65536 | 1 | 0.065536 | 2.490368 | 0.065536 | 0.196608 | 0 / 0 |
| 65536 | 32 | 2.523136 | 6.160384 | 2.457600 | 3.670016 | 0 / 0 |
| 1048576 | 1 | 1.114112 | 4.259840 | 1.114112 | 1.900544 | 0 / 0 |
| 1048576 | 32 | 9.404416 | 12.320768 | 10.125312 | 11.206656 | 0 / 0 |

Observed grid: separately within each run, the GCD of raw timestamp values, consecutive unique timestamp spacings and all pass-duration deltas is 65536 ns (65.536 microseconds). All recorded timestamp endpoints and deltas are integer multiples of that value. This is an observed sample grid, not proof of physical timer resolution, general browser behavior or a specific quantization mechanism. Even-count median averaging can produce half-grid values. N=1025, 1 dispatch has 6/30 zero measured durations in each run; a zero is not evidence of zero GPU work.

Interpretation and limitations: the timestamp enable/resolve/copy/readback chain works, but small workload timing is limited by the observed grid and both files retain long tails. Run 2 has a lower GPU-pass p95 for every configuration, while medians do not all decrease (the largest 32-dispatch median increases). DevTools state was **not recorded in either original JSON**; these two runs are not a controlled DevTools comparison and cannot establish that DevTools caused the p95 change. No bottleneck or peak-bandwidth conclusion is inferred. Keep both raw files, every zero and every long-tail sample; do not pool the two runs into one statistical population. A 32-dispatch pass repeatedly overwrites the same output and may involve cache/resource dependencies; its duration is not divided into independent single-kernel latency. Wall metrics and ISO event times remain separate from GPU pass duration. This is timing-chain validation, not a formal GEMM benchmark; shader-f16 remains unverified.

## Open decisions

- Final Adreno access and whether Mali interim development is accepted.
- What baseline GEMM the requested speedup must beat: naive A, runtime kernel, or both.
- Deadline and preferred update cadence.
- Supported Gemma E2B stack; closest Gemma fallback if required, with evidence.
- Exact Q4/Q8 formats and FP16 accumulation interpretation/fallback.
- Per-dispatch instrumentation feasibility in the selected runtime.
