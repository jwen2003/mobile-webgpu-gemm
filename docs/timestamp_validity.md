# Model pass timestamp validity and bounded control

## Offline conclusion

Current decision is **3: cause UNKNOWN; PROFILE003 intervals do not support exclusive kernel/op cost ranking or additive breakdown**. No clear collector bug was established, so this round does not change the model timestamp collector or rerun a model timing pilot. The independent TIMING002 control is implemented but **NOT_RUN** on phone. Parameter capture SHAPE001 proceeds independently.

Sources: [unchanged raw PROFILE003](../results/raw/PROFILE003-2026-10-05T03-20-03-974Z.json),SHA256 `040c5c4b667789b5ced7b5c7dd02d8abc85e3f085588b4e85f9ee9fa82e3af3d`; [earlier review](profile003_overlap_review.md); [extended reproducible diagnostics](../results/analysis/profile003/overlap_diagnostics.json). Run `python scripts/review_profile003_overlap.py` and `python scripts/verify_profile003_result.py results/raw/PROFILE003-2026-10-05T03-20-03-974Z.json`. Extended diagnostics preserve sample order; they do not sort/repair intervals or rewrite historical JSON.

|Adjacent positive overlaps|count|min ns|median ns|nearest-rank p95 ns|max ns|
|---|---:|---:|---:|---:|---:|
|All / cross submit|1898|327680|27459584|56360960|100073472|
|Same command buffer|0|—|—|—|—|
|Same submit, different command buffers|0|—|—|—|—|

There are2004 adjacent pairs,106 with no positive overlap. Positive overlap<=65536ns:0; greater:1898. Start inversions0,end inversions0 (nondecreasing, not necessarily strictly increasing); submission order inversions0. Signed previous-end-minus-next-start over all2004 pairs has min−60293120,median25952256,p9556164352,max100073472ns; negative values are gaps, not overlaps. Positive-only counts/table above are used for overlap thresholds, not negative gaps.

Example1: pass-3362 / commandBuffer-3363 / submit3365 / chunk0 indices[0,1] reports [265466362462208,265466362789888]ns; next pass-3365 / commandBuffer-3366 / submit3411 / chunk0 indices[2,3] starts265466362462208ns and ends265466365476864ns,overlap327680ns. Example2: pass-3371 / commandBuffer-3372 / submit6838 indices[6,7] overlaps pass-3374 / commandBuffer-3375 / submit6839 indices[8,9] by54460416ns. More raw associations are in the derived diagnostics.

## Implementation audit and limits of evidence

|Check|Evidence|Finding|
|---|---|---|
|Slot uniqueness/reuse|pass_timestamps.mjs L96 onwards: slot=rows.length,chunk/local*2|2005 unique query pairs,no slot reuse during run,4096 capacity|
|Resolve/copy ordering|L124 resolve,L125 copy,L130 native finish; finished-pass check before append|Outside ended pass,resolve before copy before finish; raw end<finish<submit for all samples. Raw observer does not independently log native resolve/copy execution timestamps|
|Repeated submit|L145 submissionCount>1 marks failure|0 repeated timed submissions; a repeat would overwrite its pair and be INCOMPLETE,not separate valid times|
|Submitted association|observer submit→command→pass,verifier replay|126402 submitted direct dispatches equals126402 sample-associated encoded dispatches;0 indirect;2005 timed passes|
|Conflict|install rejects existing timestampWrites rather than overwrite|No conflict/coverage/query error in actual record|
|Readback/stale data|profile003.js L167 readAfterDrain; timer maps used chunks after completion,unique aligned slots|No source-level stale-read mechanism established; all samples resolved and mapped. This does not independently prove the browser/backend's timestamp semantics|
|Units|readAfterDrain BigUint64Array,BigInt subtraction,decimal ns strings then safe conversion|All end>=start and exported differences exact; no CPU Number subtraction or unit bug found|

The audit excludes identified collector mechanisms; it does not prove the cause is a driver/browser defect. Neither small overlap nor size above one grid proves a quantization cause. Original PROFILE003 had29 zero pass samples and observed65536ns grid; retain them.

## Official evidence versus platform hypothesis

The [WebGPU timestamp specification](https://gpuweb.github.io/gpuweb/#timestamp) defines nanosecond results with implementation-defined determination and reduced precision. This does not justify treating these observed intervals as exclusive arithmetic time or silently repairing them.

The reviewed official [Dawn Vulkan branch chromium/7954 CommandBufferVk.cpp](https://dawn.googlesource.com/dawn/+/refs/heads/chromium/7954/src/dawn/native/vulkan/CommandBufferVk.cpp) RecordComputePass writes beginning at TOP_OF_PIPE (source L1569–1574),end at BOTTOM_OF_PIPE (L1588–1594),and prepares per-dispatch resource synchronization afterwards (L1604–1609). This is a concrete backend-source observation suggesting stage/synchronization placement as a hypothesis. It is **not** a normative WebGPU guarantee, not a verified match to this phone's Chrome154 binary/backend/revision, and not a diagnosis of this run. Do not claim overlap is proven expected behavior on the actual device.

## TIMING002 independent control — NOT_RUN

Page `http://localhost:8000/src/benchmark/timestamp_control.html`. Reuse existing FP32 vector-add shader,workgroup64,N1048576,8 dependent passes,32 dispatches/pass. Ping-pong A/C between dispatches,constant B=1; next pass consumes previous output. All values are exact small integers: initial(i%31)-15,after pass j expected initial+32*(j+1). No model/runtime/kernel optimization added.

Three fixed modes: eight passes in one command buffer/one submit; one pass/command buffer with eight continuous submits and no per-pass completion wait; same separate-buffer sequence with per-pass onSubmittedWorkDone waits. Each mode gets a new16-query set with unique2*j/2*j+1 slots; no repeated command buffer submit or query reuse. All output snapshots occur after their passes,outside timestamp interval; final separate encoder resolves/copies all queries once,then completion and all maps/unmaps occur together. No per-pass maps. Every pass's full N outputs are checked. Snapshot copies/explicit dependencies and serial waits change conditions; serial control is not stock performance.

Pipeline/buffer/group creation and input uploads are outside compute intervals. Fixed workload is intended to exceed the prior grid; actual resolution is checked,never assumed or repaired. Export raw decimal endpoints,BigInt differences,pass/command/submit/query identities,monotonicity,overlap signed/positive statistics and categories,all correctness summaries,environment/manual conditions,visibility,compilation/validation/lost/map errors and cleanup. Whole enqueue-to-final-completion wall includes CPU encoding/serial waits/final resolve/copies; not kernel time. No divide-by32, speedup or sum-of-passes-as-end-to-end result. All zero/long intervals preserved.

Acceptance: all24 full-output checks PASS,unique used slots,final resolve/readback complete,no errors/loss,all intervals exportable; review grid and overlaps in each mode. After one phone run,choose decision2 only if control observations and semantics evidence justify it; otherwise remain decision3. No unbounded profiler follow-up: one model parameter run plus this one bounded control is the next scope.

## Allowed Part 1 deliverable now

[Pass structure table](../results/analysis/profile002/pass_structure.json) uses real submitted PROFILE002 GENERATION associations:2005 pass occurrences/126402 dispatches. Categories are109 UNKNOWN passes/113 dispatches,1895 MIXED passes/126269 dispatches,and1 KV_CACHE_WRITE_DATA_MOVEMENT pass/20 dispatches. Fused multi-label sources and passes with differing categories stay MIXED rather than double counted. This is a structure table,not timing or bottleneck ranking. Valid time is NOT_MEASURED. It is separate from PROFILE003's different observation trace; do not join pass IDs across runs.

Until interval validity is established,do not publish cost rankings or stacked time breakdown. Afterwards,single-category passes may support labeled whole-pass measurements; MIXED remains whole-pass mixed cost. Multi-dispatch intervals never split/average into per-kernel latency. Coverage is GENERATION observed compute passes only; copy,CPU,native waits,initialization and other streams are not exclusive shares. Pass-duration sum is not end-to-end GPU time. If a union is examined later,label only observed timestamp-interval union,never physical busy time or recovered op attribution.

The per-kernel assignment gap remains: general multi-dispatch runtime passes lack isolated dispatch boundaries,and reliable token/phase boundaries are missing. Minimal alternatives are (a) validated single-dispatch/single-category pass subset with explicit exclusions; (b) existing kernel replay at reviewed real logical shape with synthetic inputs,clearly separate from runtime cost; (c) a bounded Chrome/Dawn/Perfetto GPU trace with documented backend/kernel correlation if available. Splitting runtime passes changes conditions and is not a transparent fix. No complete per-kernel or >=5-run chart is fabricated.


## TIMING002 actual controlled observation — 2026-10-05 COMPLETE

Raw [TIMING002-2026-10-05T11-36-40-431Z.json](../results/raw/TIMING002-2026-10-05T11-36-40-431Z.json),SHA256 `83ea2722f7f60f08059ab9b5fdad9f6be5f105f532e129038f1f35a1a857f6c4`,preserved byte-for-byte. Reproduce independent Python integer timestamp/statistics/association/hash checks with `python scripts/verify_timing002.py`; derived results in results/analysis/timing002_verified.json. All24 exported online full-output correctness summaries PASS,zero error/nonfinite/max absolute error; raw does not include actual arrays,so offline full-output verification is unavailable. Errors/compilation messages/visibility events empty; all resource ledger entries destroyed. User states no obvious heat (temperature unmeasured),not charging100%,DevTools not open,flag disabled. Independent device enables timestamp-query; adapter arm/gen-5 with empty device/description fields,no inferred GPU model.

|Mode|Positive adjacent overlaps|Overlap min / median / p95 / max (ms)|Pass duration median / p95 (ms)|Classification|
|---|---:|---|---|---|
|one_command_buffer|7/7|13.631488 /31.784960 /50.069504 /50.069504|34.799616 /56.295424|same command buffer,one submit|
|continuous_submits|7/7|9.895936 /25.690112 /40.173568 /40.173568|29.196288 /46.268416|cross submit|
|serial_wait|0/7|N/A|8.519680 /9.633792|cross submit with completion waits|

Every positive overlap exceeds65536ns; none is<=one observed grid. All modes have monotonic nondecreasing starts/ends,no zero-duration samples and independently observed endpoint-difference GCD65536ns. One-command mode has exactly one distinct start timestamp for all eight passes while ends advance; continuous-submit starts cluster while ends advance. Serial-wait gaps range1.179648–5.439488ms. Raw associations and signed gaps retained; do not reorder/clip/delete intervals. Median uses midpoint of sorted central values,p95 nearest-rank ceil(.95*n);these eight dependent sequential passes are not independent benchmark repeats or throughput/speedup evidence.

Source review src/benchmark/timestamp_control.js: mode-local querySet16,indices2*j/2*j+1; each measured pass32 ping-pong dispatches with real buffer dependencies,post-pass output copy outside interval; unique command buffers submitted once; final resolve/copy is a separate last submission after all timestamp writes (lines63–74). Maps only after final completion,serial mode additionally waits each pass. No model instrumentation involved. Native-mock control checks and actual query IDs support no reuse; hardware/platform reason remains UNKNOWN.

**Bounded conclusion:** overlap is independently reproduced outside MediaPipe with unique slots and dependent arithmetic,including one command buffer. It cannot be explained solely by a<=65.536us rounding overlap,and it is not specific to the PROFILE003 model observer. This does not prove actual dependent arithmetic ran concurrently or identify the phone backend/driver timestamp-stage cause. Serial waiting removes observed overlap here but changes scheduling/execution conditions; it cannot replace stock model timing. Prior Dawn timestamp-stage evidence remains a hypothesis,not confirmed platform causality. Decision3 remains: current model pass intervals do not support exclusive per-kernel ranking or an additive breakdown. Report submitted structure/classification plus NOT_MEASURED costs; mixed passes stay MIXED. No pass-duration sum as end-to-end GPU time,no difference-of-endpoints attribution,no batch/32 kernel latency,no physical busy-time claim. TIMING002 acceptance completed; no further identical phone rerun or expanded profiler required for this bounded diagnostic. Standalone serial GEMM measurements retain their distinct stated boundaries and resolution checks.
