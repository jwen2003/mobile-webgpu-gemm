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

Connect the phone to the development computer and establish local-page execution and debugging. Then probe adapter features and run vector addition with CPU-reference verification. This scaffold contains no runnable benchmark code yet.

## Original assignment

[Original problem statement](assignment/webgpu_adreno_assignment.pdf)

The supplied assignment is the source of requirements.
See [the evidence checklist](docs/requirements.md) for progress.