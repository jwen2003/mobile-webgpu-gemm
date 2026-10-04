# Mobile WebGPU LLM inference and GEMM performance report

Status: evidence scaffold. No performance conclusions yet. Development device is Mali; required final target is Adreno.

## 1 Executive summary

Complete after measurements: workload, dominant observed cost, strongest validated intervention, matched speedup and material limitations. Do not report hoped-for outcomes.

## 2 Experimental setup

Device and driver evidence from docs/environment.md. Add final target, runtime commit, model/revision, quantization, layer-shape provenance, browser flags and thermal conditions.

## 3 Methodology

Use docs/measurement_contract.md. State timing boundaries, instrumentation, warm-up, independent runs, sample counts, median/p95 method, correctness reference, precision and memory scope. Include instrumentation limitations.

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
