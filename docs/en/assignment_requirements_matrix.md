# Assignment requirement matrix

The table preserves requirement excerpts, PDF page references, and established statuses. An experiment marked COMPLETE does not make the assignment COMPLETE. The original PDF, not a project translation, is authoritative.

COMPLETE means evidence exists within that row’s limited scope; PARTIAL means only part is covered; BLOCKED means current interfaces or valid evidence prevent coverage; NOT_RUN means not executed. Overall and both Parts remain PARTIAL. Gaps and minimal next steps are separate table columns.

## Read next

- [Task scope and requirements navigation](requirements.md)
- [Remaining-metric feasibility review](remaining_metrics_feasibility.md)
- [Evidence and publication-scope index](evidence_index.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/assignment_requirements_matrix.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

|Part / PDF page|Original excerpt|Type|Status|Evidence scope and gap|Minimal next step|Evidence|
|---|---|---|---|---|---|---|
|Target,p1|Gemma E2B (Gemma 3n)|REQUIRED|COMPLETE|Web model initialized and generated with stock 0.10.29; model usability only.|None; retain scope|[baseline_sessions_results.md](../baseline_sessions_results.md)|
|Target,p1|Snapdragon device with Adreno GPU|REQUIRED|NOT_RUN|Mali was tested, not the required Adreno.|Validate separately on Adreno|[environment.md](../environment.md)|
|1,p1|Run…existing WebGPU stack…Do not optimize anything|REQUIRED|COMPLETE|Stock model/runtime algorithms were not optimized; instrumentation overhead is separate.|None; retain stock algorithms|[baseline_sessions_plan.md](../baseline_sessions_plan.md)|
|1,p1|Run each metric at least 5 times…median and p95|REQUIRED|PARTIAL|Five sessions per length for combined walls and logical resources; process memory is one pilot, with other metrics missing.|Repeat only missing metrics|[performance_report.md](../../report/performance_report.md)|
|1,p1|Tokens/sec — Decode throughput|REQUIRED|BLOCKED|No actual generated-token count or isolated decode interval; no character/callback surrogate.|Validate a real token/phase entry first|[remaining_metrics_feasibility.md](../remaining_metrics_feasibility.md)|
|1,p1|Prefill latency — Fixed prompts of 128,512,1024 tokens|REQUIRED|PARTIAL|Full input counts and five sessions are available; pure prefill boundaries are not.|Validate a pure-phase entry first|[baseline_sessions_results.md](../baseline_sessions_results.md)|
|1,p1|Decode latency per token…distribution|REQUIRED|BLOCKED|Text callbacks are not actual token or pure decode events.|Validate actual token events first|[remaining_metrics_feasibility.md](../remaining_metrics_feasibility.md)|
|1,p1|Memory usage — GPU buffers,JS heap,device RSS|REQUIRED|PARTIAL|Fifteen JS/buffer/texture sessions and one browser/GPU RSS/PSS pilot; not physical or model-exclusive memory.|Independent protocol-compliant memory repeats|[memory002_v2_pilot_results.md](../memory002_v2_pilot_results.md)|
|1,p1|Kernel(dispatch) count per token…command stream|REQUIRED|PARTIAL|Submitted dispatch structure is available; token denominator and association are unavailable.|Obtain actual token denominator first|[profile002_shader_analysis.md](../profile002_shader_analysis.md)|
|1,p1–2|Individual kernel execution time…per-kernel table…op type|REQUIRED|BLOCKED|Model-pass overlaps and multiple dispatches prevent exclusive per-kernel timing.|Establish trustworthy GPU execution association|[profile003_overlap_review.md](../profile003_overlap_review.md)|
|1,p2|A stacked time-breakdown chart|REQUIRED|BLOCKED|No trustworthy exclusive intervals; a combined wall chart is supplementary, not a stacked GPU breakdown.|Wait for trustworthy exclusive intervals|[trace001_availability.md](../trace001_availability.md)|
|1,p1–2|Identify top2–3 bottleneck kernels…classify…evidence|REQUIRED|BLOCKED|Source structure is available but no trustworthy time/counter evidence supports bottleneck ranking.|Wait for trustworthy time/hardware evidence|[remaining_metrics_feasibility.md](../remaining_metrics_feasibility.md)|
|1,p2|Methodology…device,driver,Chrome version,thermal state|REQUIRED|PARTIAL|Device/Chrome/manual conditions are recorded; runtime driver and Adreno remain unresolved.|Verify target environment and driver|[environment.md](../environment.md)|
|1,p1|timestamp-query;Chrome tracing;chrome://gpu;adb meminfo|LISTED METHODS|PARTIAL|Timestamp and meminfo used; bounded TRACE001 found no execution source. CPU Dawn events are not GPU time.|Current path is bounded|[trace001_availability.md](../trace001_availability.md)|
|1,p1|Snapdragon Profiler…if available|CONDITIONAL|NOT_RUN|Qualified by if available; no Adreno/tool access.|Reassess if tools become available|[environment.md](../environment.md)|
|1,p1–2|Classification Example evidence…roofline/peak/stalls/waves|EXAMPLE|NOT_RUN|Examples are not additional mandatory experiments; corresponding hardware evidence is absent.|Do not add example-driven experiments|[assignment_requirements_matrix.md](../assignment_requirements_matrix.md)|
|2,p2|Q4/Q8…dequantization…matrix multiplication…FP16 accumulation|REQUIRED|COMPLETE|Synthetic QROW Q4/Q8 FP16 paths and references passed; not Gemma native quantization.|None; retain synthetic-format scope|[part2_compute_contract.md](../part2_compute_contract.md)|
|2,p2|A naive WGSL;B shared memory;C vectorized loads;D fused dequant+GEMM|REQUIRED|COMPLETE|Four structural implementations tested under this contract; specialized does not substitute for C.|None; retain structural scope|[part2_repeat_results.md](../part2_repeat_results.md)|
|2,p2|Gemma real layer shapes…decode M1,prefill M>=128|REQUIRED|PARTIAL|Representative M1/M128 only; GEMM004 proves padded execution mathematics, not effective logical layer dimensions.|Obtain effective logical-axis metadata|[gemm004_shape_proof.md](../gemm004_shape_proof.md)|
|2,p2|Sweep tile sizes and workgroup sizes|REQUIRED|COMPLETE|Bounded three-candidate B/C/D sweep and five repeats on Mali; no unbounded tuning.|None; do not reselect|[part2_sweep_results.md](../part2_sweep_results.md)|
|2,p2|GFLOPS,effective GB/s,correctness(max abs error vs FP32)|REQUIRED|PARTIAL|Online full FP32 comparisons and offline small arrays checked; nominal 2MNK/pass GFLOPS is not peak utilization. Effective GB/s is incomplete.|Freeze an effective-GB/s convention before accounting|[performance_report.md](../../report/performance_report.md)|
|2,p2|shader-f16…fallback if absent|REQUIRED|PARTIAL|FP16 path verified; no-FP16 phone fallback has not been tested.|Validate fallback on a device without f16|[part2_compute_contract.md](../part2_compute_contract.md)|
|2,p2|warm-up,many iterations,timestamp-query rather than CPU timers|REQUIRED|COMPLETE|10 warm-up plus 30 measured, serial single-dispatch passes; grids/zeros/tails retained. Full-path walls are separate.|None; retain timing scope|[part2_repeat_plan.md](../part2_repeat_plan.md)|
|2,p2|GEMM…beats baseline…target Adreno|REQUIRED|NOT_RUN|Mali synthetic speed does not satisfy target Adreno or prove model acceleration.|Validate on Adreno|[performance_report.md](../../report/performance_report.md)|
|2,p2|Comparison table A-D;why faster/slower;reproducible harness|REQUIRED|PARTIAL|Five-session times/ratios/source/raw evidence available; hardware causes, effective shapes, and Adreno remain limited.|Add hardware/effective-shape evidence|[performance_report.md](../../report/performance_report.md)|
|2,p2|Suggested results table…Tile/WG/Time/GFLOPS/GB/s/error|SUGGESTED PRESENTATION|PARTIAL|Time/config/error tables available; mandatory GFLOPS/GB/s gaps are tracked separately.|Retain unmeasured columns|[performance_report.md](../../report/performance_report.md)|
|p2–3|Grading Rubric(suggested)|SUGGESTED RUBRIC|NOT_RUN|Suggested grading is not an additional experiment and no grade is predicted.|Do not predict grades|[webgpu_adreno_assignment.pdf](../../assignment/webgpu_adreno_assignment.pdf)|
