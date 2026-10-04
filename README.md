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

COMPUTE001 passed on the Android phone: all 1025 FP32 sums matched an independently recomputed reference, with max absolute error 0. See [the experiment record](docs/experiment_log.md) and [original JSON](results/raw/COMPUTE001-2026-10-04T10-53-11-629Z.json). Optional FP16 and timestamp functionality remains unverified; no performance benchmark is implemented or measured. Next, choose and document a separate capability or baseline experiment before collecting further evidence.

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

## Original assignment

[Original problem statement](assignment/webgpu_adreno_assignment.pdf)

The supplied assignment is the source of requirements.
See [the evidence checklist](docs/requirements.md) for progress.
