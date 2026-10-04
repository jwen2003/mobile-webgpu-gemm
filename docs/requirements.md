# Assignment evidence checklist

Source: supplied webgpu_adreno_assignment.pdf. This checklist tracks evidence, not an estimated completion percentage.

| Requirement | Evidence destination | Status |
|---|---|---|
| Gemma E2B on existing stack or documented closest Gemma | report section 2, model revision and support evidence | Pending |
| Target Snapdragon Adreno | environment.md, final device export | Pending |
| No Part 1 optimization | pinned baseline code/config | Pending |
| Decode tokens/s, median and p95, at least 5 runs | inference_runs.csv | Pending |
| Prefill 128/512/1024 actual tokens | inference_runs.csv, prompt hashes | Pending |
| Decode per-token distribution | token_latencies.csv | Pending |
| GPU buffers, JS heap, device RSS | memory.csv with sources and scope | Pending |
| Dispatch count per token from command stream | dispatch_samples.csv | Pending |
| Individual kernel timings grouped by op | dispatch_samples.csv, kernel_timings.csv | Pending |
| Stacked breakdown with declared denominator | time_breakdown.csv, figures | Pending |
| Top 2-3 bottlenecks with evidence | bottlenecks.csv, report section 5 | Pending |
| Device, driver, Chrome, thermal methodology | environment.md, sessions.csv | Partial: device screenshots only |
| A naive, B tiled, C vectorized, D fused | variant config, code commits | Pending |
| Real layer shapes, decode M=1 and prefill M>=128 | layer-shape provenance, kernel_comparison.csv | Pending |
| Tile and workgroup sweep | variant config, kernel_samples.csv | Pending |
| GFLOPS, effective GB/s, max absolute error vs FP32 | kernel_comparison.csv, measurement_contract.md | Pending |
| shader-f16 support and fallback | feature JSON, precision-specific results | Pending |
| Warm-up, many iterations, GPU timestamps | raw samples and methodology | Pending |
| Demonstrable target Adreno speedup | matched baseline comparison | Pending |
| Why each variant is faster or slower | experiment records and report section 6 | Pending |
| Reproducible harness, instructions, raw results | code, README, results/raw | Pending |
