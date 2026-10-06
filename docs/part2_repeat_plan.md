# Part 2 independent repetition — frozen QROW-REPEAT-v1

Status: READY_FOR_PHONE / NOT_RUN. This is a new five-session campaign, not five partitions of the accepted sweep. Source selection: `results/raw/PART2SWEEP-2026-10-06T06-07-34-319Z.json`; choices in `part2_sweep_results.md` are frozen, including within-grid ties.

Every group compares fixed A, original B/C/D and selected B/C/D, deduplicated. All retain QROW unsigned Q4/Q8, group K=32, stored FP16 activation/scales, f32 dequantization then f16 weight, increasing-K f16 FMA accumulation and f32 output. Existing two CPU references and tolerances are unchanged. Representative K=N=1024; no new logical model shape evidence.

| Format | M | Selected B | Selected C | Selected D | Unique configs | Sampling passes |
|---|---:|---|---|---|---:|---:|
| Q4 | 1 | B-8x8-K8 | C-8x8-K16 | D-4x8-K16 | 6 | 240 |
| Q4 | 128 | B-32x8-K16 | C-8x8-K16 | D-8x16-K16 | 6 | 240 |
| Q8 | 1 | B-32x8-K16 | C-8x8-K16 | D-4x8-K16 | 6 | 240 |
| Q8 | 128 | B-8x8-K8 | C-8x16-K16 | D-8x16-K16 | 7 | 280 |

Originals: A-original, B-16x16-K16, C-8x8-K16, D-8x8-K16. Q4 M128 C keeps original under the one-grid tie rule. Q8 M1 D retains recorded D-4x8 selection; do not add the tied alternative.

Per session: 250 warm-up + 750 measured = **1,000 sampling passes**, plus **357 correctness passes** if all compiled candidates pass (Q4 union 8, Q8 union 9, 21 checks each). Safe upper bound 378 correctness passes. Five sessions: 5,000 sampling passes; do not automatically add attempts for failures or unfavorable performance.

## Independence and conditions

Open `http://localhost:8000/src/benchmark/part2_repeat.html?v=repeat-v1`. Visible implementation version must be repeat-v1. A page lifetime owns one random UUID and permits only one run. Each run requests a new device, recompiles pipelines, reconstructs inputs/resources/references, runs full correctness and fresh warm-up, and destroys the device/resources. Session ordinal 1–5 is exported with UUID, ISO boundaries, features/limits, manual conditions, shader source/hash and visibility events. Browser page reload alone does not reset physical GPU thermal/cache state; report this limitation.

Use the same foreground, charging, DevTools/flag and background-app conditions in all five attempts. Describe charging/battery and subjective thermal state accurately; UNKNOWN remains valid. Do not claim measured temperature from touch. Before starting, choose a fixed practical pause between sessions and record that policy in the Thermal field along with actual state; do not choose pauses from performance results. Do not automatically change flags. Keep every failure/interruption; a campaign with an unsuccessful attempt remains incomplete pending review, not silently replaced by a better run.

1. Connect USB and authorize debugging. From PowerShell:
   `& "C:\Tools\platform-tools\platform-tools\adb.exe" reverse tcp:8000 tcp:8000`
2. Existing project server serves localhost:8000. If stopped, from project root run `python -m http.server 8000 --bind 127.0.0.1`.
3. Load the repeat page, select ordinal 1, fill actual conditions, run once. Remain foreground. Download the independent JSON even on failure.
4. Reload the page for each subsequent ordinal 2, 3, 4, 5; re-enter actual conditions. New UUID and device/session are required. Do not click five runs in one page, split samples or reuse a device.
5. For deliberate interruption use “停止并保留本次记录”, wait for cleanup then download. During execution download can also preserve an IN_PROGRESS_SNAPSHOT; it is not accepted as a complete session. Abrupt browser/process termination may prevent export; record missing attempt explicitly, never fabricate it.

## Frozen order and boundaries

Use the accepted seeded cyclic-rotation ordering: base seed 0x53575001 XOR bits XOR M, identical per-group schedule across sessions, warm-up additionally XOR 0x5741524d. Candidate list order is frozen in `part2_repeat_plan.mjs`. Round position counts differ by at most one; this is position balance, not a claim of exact pairwise 15/15 balance for seven candidates. All valid candidates get 10 warm-up and 30 measured samples. Unsupported/failed candidates are recorded and excluded; a COMPLETE campaign must cover the full frozen lists.

Only prepared-input kernel-only GPU pass is sampled. CPU dequantization, C layout conversion, uploads, compilation, allocation and reference are outside sampling. Every pass has one dispatch; submit→onSubmittedWorkDone wall boundary is unchanged. Map/readback and all-output CPU checking are outside timestamp and submit-to-completion intervals. Samples are serial, query slots reused only after readback/unmap. D includes Q4/Q8 decode; ABC use preprocessed weights. This does not compare repeated CPU preprocessing or predict static-weight runtime/model speedup.

## Audit and analysis

Run `python scripts/verify_part2_repeat_result.py SESSION1.json ... SESSION5.json`. A single file can be audited immediately. Original bytes are archived even when incomplete, with hashes and separate analysis files. Auditor independently replays small exported actual/reference, packing, timestamps, nearest-rank p95, median/min/max/zeros, grid, seeded ordering/coverage and frozen same-session ratios. Shader hashes must match the accepted complete sweep. Large arrays are online full-check evidence only. Unique UUIDs and ordinals are required; duplicate attempts are not silently selected. `part2_repeat_summary.json` is a derived summary, not replacement raw evidence.

Report each session's median/p95 and A/candidate and original/selected ratios. Summarize ranges across session statistics and each direction; never pool all raw samples into one median. Retain zeros and tails. Resolution-limited ratios are null; median differences within max(65,536 ns, observed grids) are WITHIN_ONE_GRID. Reversals and within-grid differences explicitly retain uncertainty. No reselection before five verified sessions, and five repetitions alone do not prove stable benefit if results disagree or conditions differ.

Acceptance: five separately initialized, unique, complete sessions, frozen coverage/correctness, independent audits and per-session report. Until then READY_FOR_PHONE, no repetition result commit/push. After acceptance, implementation/results receive a separate commit and push. This addresses Part 2 repetition only: Part 1 model repeats, true generated-token/phase/kernel timing, actual physical GPU memory, logical model shapes and Adreno validation remain open.

Latest acceptance: five independent PART2REPEAT sessions COMPLETE and verified; earlier NOT_RUN/partial progress entries are historical. Frozen configs retained, no pooled median. See docs/part2_repeat_results.md (project root relative) for per-session values, ranges and reversals. Part 1, logical shapes and Adreno gaps remain open.
