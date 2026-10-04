# Mobile WebGPU LLM inference and GEMM performance report

Status: evidence scaffold. No performance conclusions yet. Development device is Mali; required final target is Adreno.

The first actual Android FP32 compute smoke test (COMPUTE001) passed: 1025 vector-add outputs matched an independently recomputed CPU reference exactly, with max absolute error 0. This validates the project's basic compute/readback path; it provides no performance or target Adreno result.

## 1 Executive summary

Complete after measurements: workload, dominant observed cost, strongest validated intervention, matched speedup and material limitations. Do not report hoped-for outcomes.

## 2 Experimental setup

Device and driver evidence from docs/environment.md. Add final target, runtime commit, model/revision, quantization, layer-shape provenance, browser flags and thermal conditions.

COMPUTE001 ran on phone Chrome at `http://localhost:8000/src/benchmark/` through Windows HTTP serving and USB adb reverse. Its export reports secureContext true, adapter vendor `arm`, architecture `gen-5`, and empty device/description fields. No specific GPU model is inferred from those fields. See [environment limits table](../docs/environment.md#compute001-exported-adapter-and-device-evidence): adapter/device buffer limits were 4294967292/268435456 bytes and storage binding limits 2147483644/134217728 bytes; workgroup invocation limits were 1024/256. The complete comparison includes storage bindings, workgroup storage and per-axis limits. Actual device features contained only `core-features-and-limits`; optional requested features were empty.

## 3 Methodology

Use docs/measurement_contract.md. State timing boundaries, instrumentation, warm-up, independent runs, sample counts, median/p95 method, correctness reference, precision and memory scope. Include instrumentation limitations.

COMPUTE001 correctness method: FP32 C[i]=A[i]+B[i], A[i]=(i%31)-15, B[i]=((i*7)%23)-11, N=1025, workgroup_size(64), 17 workgroups and an explicit bounds guard. Small integer inputs and sums are exactly representable. Independently recomputing all inputs and sums from these formulas verified every actual readback value and the exported expected array, without relying on its PASS label. All 1025 elements were correct, max absolute error 0, erroneous elements 0, non-finite count 0; index 1024 was -10. Compilation messages and GPU error records were empty. The [original JSON](../results/raw/COMPUTE001-2026-10-04T10-53-11-629Z.json) is preserved unchanged.

No performance measurement was made. The ISO timestamps identify capture/run events and are not GPU kernel timing evidence; no duration, throughput or speedup is derived from them. Adapter support for `timestamp-query` and `shader-f16` was reported, but neither was enabled or actually verified in this run. No device loss was recorded before export; loss recovery was not tested.

## 4 Baseline profiling

Table: prompt tokens, prefill median/p95, decode tokens/s median/p95, token-latency distribution, memory, dispatch count. Include grouped per-kernel table and stacked decode breakdown. State whether denominator is GPU sum or token wall time; label residual separately.

## 5 Bottleneck analysis

For each top 2-3 kernels: observation, hypothesis, competing explanation, evidence, classification and confidence. Unsupported counter claims remain unresolved. Include roofline only with defensible traffic model and ceilings.

## 6 Kernel optimization experiments

A naive; B workgroup-memory tiling; C vectorized loads; D fused dequantization. Each variant: motivation, exact configuration, correctness, measured result and explanation. Include tile/WG sweep, matched comparisons, negative results and fusion pipeline scope. Distinguish custom naive baseline from existing runtime baseline.

## 7 Decode GEMV and prefill GEMM

Contrast real-layer M=1 and M>=128 results. Test reuse, synchronization, memory access and parallelism hypotheses. Do not transfer a GEMM explanation to GEMV without evidence.

## 8 Limitations and next experiments

Device mismatch, unsupported features, missing counters, precision fallback, memory visibility, timing granularity, thermal drift and generalization. State what each limitation prevents concluding. Separate Mali development findings from Adreno final findings.

## Appendix Reproduction

Exact code/runtime/model revisions, execution instructions, prompt/seed/config files and raw data paths. Tables link run IDs to raw samples. Final PDF target approximately 8-12 pages once evidence exists; do not pad the scaffold into a PDF now.
