# Mobile WebGPU GEMM investigation

Documentation scaffold for the IN2PETA assignment. No LLM profiling, custom kernel benchmark, or speedup has been measured yet.

Development device: OnePlus Ace 6 Supreme Edition, Dimensity 9500, ARM Mali-G1-Ultra MC12. Final target: Snapdragon Adreno; access and acceptance of development-device results remain unresolved.

## Working documents

- `docs/environment.md`: device evidence and capability checks.
- `docs/measurement_contract.md`: definitions and measurement rules.
- `docs/experiment_template.md`: copy once per experiment.
- `docs/experiment_log.md`: completed observations and next steps.
- `docs/requirements.md`: assignment-to-evidence checklist.
- `report/performance_report.md`: English final-report skeleton.
- `results/*.csv`: schemas for raw samples and summary tables; header-only until measured.
- `updates/daily_update_template.md`: founder email template.
- `updates/environment_update_draft.md`: first factual update, ready for review.

## Daily workflow

1. Choose one question and write a hypothesis before running.
2. Record run ID, exact code commit, environment, setup and raw samples.
3. Validate correctness before interpreting speed.
4. Update the experiment log with observation, evidence, interpretation and uncertainty.
5. Update the relevant report section; prepare a short email with evidence and next step.

Keep raw samples unchanged. Use `NOT_MEASURED`, `UNAVAILABLE`, or `NOT_APPLICABLE` in prose; missing numeric CSV fields stay blank, never zero. Do not send a full changing report every day: send a compact update and the relevant evidence when available.

## Current next step

COMPUTE001 passed on the Android phone: all 1025 FP32 sums matched an independently recomputed reference, with max absolute error 0. See [the experiment record](docs/experiment_log.md) and [original JSON](results/raw/COMPUTE001-2026-10-04T10-53-11-629Z.json). TIMING001 subsequently validated compute-pass timestamp enable/readback in two runs, with granularity and tail limitations documented below. FP16 remains unverified; no formal GEMM benchmark has been measured. Next, define a separate capability or baseline experiment using these measurement limitations.

## Android compute smoke test (Windows, USB)

Python 3.14.6 was verified on the development computer. No framework, packages, or build step is required.

1. Enable Android USB debugging, connect the phone by USB, and accept its debugging authorization prompt.
2. In PowerShell, start the server from the repository root and leave this terminal running:

   ```powershell
   Set-Location C:\Projects\mobile-webgpu-gemm
   python -m http.server 8000 --bind 127.0.0.1
   ```

3. In another PowerShell terminal, check the device and forward the phone's localhost port to the computer:

   ```powershell
   & 'C:\Tools\platform-tools\platform-tools\adb.exe' devices
   & 'C:\Tools\platform-tools\platform-tools\adb.exe' reverse tcp:8000 tcp:8000
   & 'C:\Tools\platform-tools\platform-tools\adb.exe' reverse --list
   ```

   The device must show `device`, not `unauthorized` or `offline`. If several devices are attached, add `-s SERIAL` before `reverse`.
4. In **the phone's Chrome**, open [http://localhost:8000/src/benchmark/](http://localhost:8000/src/benchmark/). Keep using localhost; do not substitute the computer's LAN IP. This origin must report `secureContext: true`.
5. Tap **检测 WebGPU**, then **运行向量加法**. Acceptance: `PASS`, 1025 elements, max absolute error 0, error elements 0, no shader/GPU/device errors. The 17th workgroup has only one valid element; inspect the exported last-element result too.
6. Tap **下载结果 JSON**. Preserve the downloaded original JSON in `results/raw/` after copying it from the phone. Record its path and the actual result in the experiment log. Detection-only downloads have `result: null`; errors are evidence, not a successful run.

The JSON records browser/environment data, adapter info (including empty strings), supported adapter features, actual device features/limits, shader source and diagnostics, deterministic input definitions, CPU reference and GPU readback. `timestamp-query` and `shader-f16` support are recorded only; neither feature is enabled or verified. No GPU or wall-clock duration is measured.

If detection or execution fails, keep the specific error shown on the page and download the JSON. If localhost cannot load, check the running server, USB authorization and `adb reverse --list`. After USB reconnection, run `adb reverse` again. Stop the server with Ctrl+C when finished.

## TIMING001 Android compute timestamp validation

Status: **two actual phone runs completed**; timestamp-query was enabled and read back, and both runs' correctness summaries passed. See [per-run statistics and limitations](docs/experiment_log.md#timing001-android-webgpu-compute-timestamp-validation). The observed grid was 65.536 microseconds; the smallest single-dispatch configuration had 6/30 measured zeros in each run. This separate experiment validates the timestamp chain, not a formal GEMM benchmark. COMPUTE001 and its original JSON remain unchanged.

Question: Can `timestamp-query` be explicitly enabled and read back, and do different compute-pass workloads yield interpretable timestamp samples?

Use the same Windows HTTP server and USB `adb reverse` commands above. In **phone Chrome**, open [http://localhost:8000/src/benchmark/timing.html](http://localhost:8000/src/benchmark/timing.html). Fill in observed thermal/charging status and WebGPU Developer Features flag status (defaults are UNKNOWN); the page does not change flags. Keep the page in the foreground, tap **运行 TIMING001**, wait for completion, then **下载结果 JSON**. Preserve every original download under `results/raw/` for separate per-run review, without pooling samples. If unsupported or an error occurs, download that evidence too. DevTools state was not recorded in the two existing exports; no DevTools effect can be inferred from their timing difference.

Configuration: FP32 uniform N = 1025, 65536, 1048576; workgroup_size(64), bounds guard; 1 or 32 identical dispatches per compute pass. Six configuration blocks are shuffled using fixed seed `0x0017a001` (xorshift32/Fisher-Yates) and the actual order is exported. Each block uses 10 warm-up passes excluded from statistics, followed by 30 measured passes: 240 raw pass records total, 180 measured. Every pass finishes timestamp readback and a full zero-tolerance CPU-reference check of the output before the next submission. Pipeline creation is once per run; buffer allocation and input/uniform uploads are once per block before sampling.

GPU timing uses compute-pass `timestampWrites`, followed by query resolve/copy/map/unmap. Raw unsigned 64-bit timestamps are exported as decimal strings; subtraction is done using BigInt before converting nanoseconds to milliseconds. GPU pass duration may include pass scheduling costs. Query resolve and correctness output copy are after the timed compute pass. `submitToCompletionWallMs` starts immediately before `queue.submit` and ends after `onSubmittedWorkDone`; it includes the submitted resolve/copies, but excludes timestamp mapping, output mapping and CPU correctness checks. It is a separate wall-clock metric, not GPU kernel time.

Repeated dispatches overwrite the same output, so caching and resource dependencies may matter. Do not divide the 32-dispatch pass time and label it independent kernel latency. Statistics retain zeros and use measured passes only: median (midpoint for even counts), nearest-rank p95 (`ceil(0.95*n)`), min/max and zero-duration count. No strict monotonicity with N, bottleneck classification or peak-bandwidth claim is required or inferred.

Acceptance: actual device enables `timestamp-query`, all six blocks complete with 30 measured passes each, every output check passes, and no compilation/GPU/device-loss errors occur. Raw start/end strings and nonnegative deltas must be inspectable, including zero values. Review zero counts and distributions: all-zero results show an unresolved timing-resolution/availability issue and do not establish useful workload discrimination. Background transitions are exported for the whole run, separately flagged during sampling; preserve affected samples and assess their limitations. Partial/error runs retain recorded samples and mark summaries incomplete. shader-f16 is not requested or verified.

## Original assignment

[Original problem statement](assignment/webgpu_adreno_assignment.pdf)

The supplied assignment is the source of requirements.
See [the evidence checklist](docs/requirements.md) for progress.
