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


## PART2AB — PART2-QROW-v1 (phone NOT_RUN)

Frozen contract: docs/part2_compute_contract.md. Original p2 A/B definitions and quantized→dequant→GEMM→FP16 accumulation distinguish this from historic FP32 supplements. Project synthetic unsignedQ4/Q8,row-packed u32,group32 along K,half scales/u32 zero points;CPU predecode B16 shared across naive A/shared-memory B,f16 inputs/accumulator,f32 carrier of half-valued output. Canonical half,high-precision and FP32 references;precision discriminator2048 vs2050 and frozen ordinary tolerances. C/D format defined only,NOT_IMPLEMENTED. RepresentativeM1/M128 K/N1024,not real logical layer shape. Separate explicit FP32 fallback does not validate required path. Kernel-only excludes CPU pack/unpack/dequant and all setup/readback/check;host full-run scope separately recorded,not a GPU unfused-D comparison.10warm/30measured paired15/15,serial single dispatch/query-safe readback,raw zeros/tails/grid retained. Part1 and Adreno/real-shape gaps unchanged. No commit/push.

## BASELINE002 exact-length model sessions — READY_FOR_PHONE

Original assignment page 1 directly re-read:full prompts 128/512/1024 tokens,each metric >=5 runs with median/p95. New entry http://localhost:8000/src/baseline/sessions.html?v=baseline-session-v1 ;15 independent page/task/device attempts,one generation each,0 generation warm-up,requested combined capacity2048. Actual sizeInTokens(fullPrompt) must exactly match the target with template included;body/template counts and full text/hash exported. Stock runtime0.10.29 and existing Web model preserved. No profiler command/pass extensions or timestamp diagnosis. Only resource lifecycle wrappers reused plus directly available JS heap snapshots.

Question:How do observable initialization/combined generation/first callback/drain walls and scoped reported heap/logical allocations vary at prescribed input lengths? Setup and acceptance:docs/baseline_sessions_plan.md. Results NOT_RUN;CPU mock checks are not mobile/model evidence. Generation is first-use after separate tokenizer setup/drain;no output-token or pure prefill claim. Prompt/long-capacity compatibility awaits phone ordinal1 and longer configurations.

Coverage matrix:exact full-prompt length and five independent combined-wall/available-memory sessions READY_FOR_PHONE,not closed. Pure prefill/decode,real generated-token throughput/per-token or dispatch-token metrics remain UNAVAILABLE;physical GPU memory/deviceRSS not collected. Resource logical bytes and JS heap never replace residency/RSS. Current device remains Mali;Adreno and true logical layer shape gaps remain. After actual evidence arrives preserve originals,independently audit per-session boundaries/resource lifecycles and grouped median/nearest-rankp95/min/max;five-samplep95=max with weak tail evidence. Separate commit/push only after mobile acceptance.

Latest BASELINE002 acceptance:FIFTEEN_SESSIONS_VERIFIED,exact128/512/1024 full prompts and5 independent COMPLETE/audited sessions each. Earlier NOT_RUN/partial states are historical. Observable walls/scoped memory repeats accepted;purephase/true outputtokens/deviceRSS/physical GPU memory/Adreno remain unavailable. Final results:docs/baseline_sessions_results.md;Work summary:docs/baseline002_work_summary.md (root-relative).
