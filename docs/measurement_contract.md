# Measurement contract

This is a proposed protocol, to be frozen after the first small benchmark. Assignment requirements are distinct from proposed initial choices.

## Run identity and timing scopes

Each run links session ID, experiment ID, code commit, runtime version, model revision, weight format and raw-file path. Record prompt text/hash, tokenizer revision and actual token count; 128/512/1024 refer to tokens, not characters. Record generated-token count, EOS policy, seed and sampling configuration.

- GPU pass time: timestamp interval within a pass. If a pass contains several dispatches, call it pass time; do not label it per-kernel time.
- Isolated kernel time: a timestamp interval isolating one dispatch, with instrumentation overhead assessed separately.
- Decode token wall time: explicitly defined start/end around a token step; report whether sampling, CPU work and readback are included.
- Prefill: define boundaries and separate loading, compilation and first-token sampling.
- Decode tokens/s: measured generated decode tokens divided by their defined decode interval; do not include prompt tokens or model download.
- Readback and setup: report separately from resident GPU kernel execution.

## Repetition and thermal control

Assignment: each Part 1 metric at least five runs, median and p95. Proposed starting point: five independent inference runs, capture every decode token latency. Report both across-run summaries and pooled token distribution with sample counts. For five samples p95 is weak tail evidence; state this limitation rather than overinterpreting it.

Part 2 proposed starting point: 20 warm-up dispatches, 100 measured dispatches per configuration, repeated across at least five batches. Adjust after checking total duration and thermal drift; freeze the chosen values. Record first-use compilation separately. Interleave or randomize A-D order, bracket variants with baseline repeats, and record drift. Save rejected samples with a reason; no silent trimming.

Use timestamp-query for scored GPU timing. If absent, CPU completion timing may support debugging but must be labeled as end-to-end and a requirement gap. Query resolution, quantization, readback overhead and dispatch batching must be documented. A batch interval divided by dispatch count is amortized batch timing, not individual-dispatch timing.

## Correctness and precision

Freeze row-major layout, C=A[M,K]B[K,N], transpose flags, dtypes, accumulation precision, output conversion, quantization block size, scales, zero points and packing. Assignment requests FP16 accumulation; distinguish this from FP16 inputs with FP32 accumulation. Record the actual implementation and label an FP32 fallback as a changed precision path.

For quantized kernels, compare to FP32 multiplication of the SAME dequantized weights to isolate kernel numerical error. Separately report quantization error against original weights if available. Use deterministic seeds, nontrivial signed inputs, zeros and boundary/non-tile-multiple shapes. Reject NaN/Inf and report max absolute error; supplement with relative error and a predeclared tolerance. Do not choose tolerance after observing a failure.

## FLOPs, bytes and comparison scope

Conventional GEMM FLOPs = 2*M*N*K. GFLOPS = FLOPs/(GPU seconds*1e9); dequantization operations are not included in this convention.

For dense standalone GEMM a minimum logical byte model is input A plus input B plus output C, using actual storage widths. For fused quantized GEMM count packed weights AND scale/zero-point metadata. Effective GB/s = declared logical bytes/(seconds*1e9). This is modeled effective bandwidth, not measured DRAM traffic; caches and reuse can invalidate direct peak-bandwidth comparisons.

Report A-D isolated kernel comparisons and, separately, unfused dequant+GEMM versus fused end-to-end GPU pipeline. Charging only GEMM time to the unfused path would hide the fusion benefit/cost. Keep input quantization, output semantics, shapes and correctness contract comparable. Compute speedup only for matched scope, precision and device. Report runtime-baseline and self-written-naive-baseline speedups separately if both are available.

## Memory and bottleneck evidence

GPU buffers: tracked live allocations, distinguishing model-owned and runtime workspace allocations. JS heap: measured API/tool and scope. RSS: target process IDs and adb command; record process aggregation to avoid double-counting shared memory. Unavailable channels stay unavailable; these measures are not interchangeable or blindly additive.

CPU wall time minus summed GPU intervals is an unaccounted residual, not proof of launch overhead. Classification requires a discriminating experiment or counters. Occupancy/barrier claims need counters or remain hypotheses. Peak throughput/bandwidth sources must be device-specific and sourced; alternatively use a measured calibration ceiling with its method and scope disclosed.
