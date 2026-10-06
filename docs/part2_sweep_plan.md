# Frozen finite tile/workgroup sweep — QROW-SWEEP-v1

Status READY_FOR_PHONE;actual phone result NOT_RUN. Frozen before phone execution,2026-10-05. Original assignment p2 requires “Sweep tile sizes and workgroup sizes”;it specifies no candidate table. This bounded table is a project choice under the user's budget,not extra algorithms or model-shape recovery. Preserve PART2-QROW-v1 format,activation/dequant/f16 increasing-K fma/output/reference/threshold contracts.

## Frozen candidates and resources

WX×WY below is the actual workgroup,not output tile. Shared bytes are logical WGSL workgroup storage. Every configuration uses one dispatch/pass. Original configurations use unchanged original shader text;alternatives are generated from the same tiled/vectorized/fused families,not new optimization families.

|Variant|Candidate ID|WG|Output tile M×N|K tile|Invocations|Shared bytes|Original|
|---|---|---|---|---|---|---|---|
|A|A-original|8×8|8×8|scalar loop|64|0|yes,fixed|
|B|B-16x16-K16|16×16|16×16|16|256|1024|yes|
|B|B-8x8-K8|8×8|8×8|8|64|256|no|
|B|B-32x8-K16|32×8|8×32|16|256|1280|no|
|C|C-8x8-K16|8×8|8×32|16|64|1280|yes|
|C|C-4x8-K16|4×8|8×16|16|32|768|no|
|C|C-8x16-K16|8×16|16×32|16|128|1536|no|
|D|D-8x8-K16|8×8|8×32|16|64|1280|yes|
|D|D-4x8-K16|4×8|8×16|16|32|768|no|
|D|D-8x16-K16|8×16|16×32|16|128|1536|no|

Same10 candidates for Q4/Q8 and M1/M128,K=N1024. No substitute shape or precision if limits fail. shader-f16 required;timestamp-query requested if supported. Check workgroup dimensions/invocations,shared storage,storage binding count(3 ABC,5 D),uniform16bytes,storage/buffer byte sizes and dispatch dimension. Illegal candidates UNSUPPORTED with reasons,never silently modified. No f16→UNSUPPORTED path;no timestamps→correctness only/GPU NOT_MEASURED. Candidate compile/validation/correctness failures retained and excluded from ranking. No new FP32 fallback:previous independently labeled A/B fallback remains separate.

## Order and hard budget

Fixed format order Q4 thenQ8;shape order M1 thenM128. No controlled causal inference from these format/shape order differences. Candidate base order as table. PLAN seed0x53575001 XOR bits XOR M;warmup seed additionally XOR0x5741524d. No candidate addition based on interim performance.

Measured rounds use seeded shuffled cyclic rotations,alternating each full block's base order with its reversal. With10 valid candidates,30 rounds yield each candidate in every position exactly3 times. A full block uses every rotation;partial blocks for unsupported/failed preflight omissions produce floor/ceil position counts differing at most1. Export eligible IDs,seeds,all planned/warmup orders,actual sample round/order/global execution index and position counts. This balances positions;does not claim each candidate-pair precedence is exactly15/15. Actual failures during sampling can break coverage;mark failed/incomplete rather than fabricate missing samples or rebalance after observing performance.

Every eligible candidate10warmups+30measured. Full budget2formats×2shapes×10candidates×40=1600 sampling passes(400warmup,1200measured). Correctness:per format/candidate one precision probe plus both families on8 small cases and2 performance shapes =21passes;full420 correctness passes,total2020dispatches. Unsupported/failed candidates reduce actual counts. No retry or increased sample budget. At least5 independent repeats belong to next round,not this pilot.

## Correctness first and sampling boundary

For each format,all candidates are checked on scalar/non-square/packing-group tails,vector/workgroup tails M9/K17/N35,all-tile tail M17/K17/N33,three-group tail M9/K65/N5,explicit quant extremes M3/K5/N9,precision probe2048 versus FP322050,and both full performance shapes before any performance sampling for that format. Exact/fractional seeds,explicit extreme overrides and frozen thresholds identical to accepted pilots. All candidates increasing-K f16 fma;two barriers per K tile,no early return,explicit guarded loads/zero padding and stores. CPU reference independent. Small inputs,packed words/scales/zp,B16,references and actual arrays exported per candidate. Large all-output checks online,not offline replay without arrays.

Common A16/B16/C-padded-B16/packed/scales/zp resident inputs prepared outside sampling;outputs/readback independent per candidate. Both retained performance inputs/reference are prepared during preflight,not changed during sampling. No CPU conversion,layout copy,upload,compilation or allocation in sampling loop. Query pair0/1 reused only after previous completion/map/unmap. Same executeGemmPass helper as accepted pilots:one dispatch compute pass,timestampWrites;resolve/copy outside GPU interval;submit-before→onSubmittedWorkDone wall;map/CPU check afterward;next sample only afterward. No multi-pass interval sum. D pass includes actual decode/dequant;ABC pass excludes preparation—prepared inputs differ but mathematical input/precision contract is shared.

## Statistics and predeclared selection

Preserve every sample/zero/tail. Midpoint median,nearest-rank p95,min/max,zero count,endpoint GCD grid and existing absolute-duration resolution policy(zero or median<10×max65536/observedgrid→RESOLUTION_LIMITED). Ratios are same-run A median/candidate median and same-version original median/candidate median;only resolved positive medians,otherwise null. No historical Q4/Q8 median denominator.

For each bits/shape/version choose lowest valid resolved median. Candidates within one maximum observed/prior timestamp grid of the minimum are INDISTINGUISHABLE_WITHIN_ONE_GRID;prefer the original when it is in that set. Otherwise pick the minimum solely as a pilot candidate. No selectable resolved data→NOT_SELECTABLE. This conservative tie rule also applies when differing medians are individually above the resolution threshold. Show all candidate statistics and tie set. No stable benefit,hardware instruction/DRAM/occupancy bottleneck,physical GPU memory/model acceleration or Adreno claim. Changes in workgroup/tile/storage interact,so structural facts are distinct from hypotheses.

## Evidence,verification and phone steps

JSON PART2SWEEP includes frozen plan/table,format/config/source/hash,features/limits/manual environment,visibility,all correctness records,full small data,setup/logical resource ledger,raw samples/orders/coverage/statistics/selection,errors and completion status. Failure still downloadable. Preserve original JSON bytes;after phone delivery use `python scripts/verify_part2_sweep_result.py PATH` to archive and independently verify timestamps,statistics/order and small outputs. Large correctness remains online evidence;raw samples/claims are checked without inventing missing arrays.

Windows project root: `python -m http.server 8000 --bind 127.0.0.1`.
USB: `& "C:\Tools\platform-tools\platform-tools\adb.exe" reverse tcp:8000 tcp:8000`.
Phone Chrome: http://localhost:8000/src/benchmark/part2_sweep.html . Fill actual thermal/charging/DevTools/flag,run once frozen sweep,stay foreground and wait through both formats/shapes,download JSON even on failure. No Chrome flag changes. This run has more passes and CPU references than prior A-D;do not switch away while it runs. Stop adding runs after this pilot;next task reviews result then plans finite independent repetitions.

Current tool session cannot control the phone Chrome UI:browser-control initialization failed;final adb check reports no devices/emulators connected. No phone GPU run performed,READY_FOR_PHONE is not COMPLETE. Source/static/CPU/mock tests are computer checks only. Q8 accepted commit was pushed before this implementation;sweep changes remain separate and uncommitted pending phone acceptance. Real valid logical shapes,Adreno and Part1 metric/breakdown gaps remain.


Latest actual sweep: COMPLETE_WITH_FAILURES (four generated D shader compilation failures); archived and independently verified. See part2_sweep_results.md. Reserved WGSL identifier fixed; corrected frozen sweep awaits phone rerun at http://localhost:8000/src/benchmark/part2_sweep.html . No stable configuration selection or five-run acceptance yet.

Phone rerun must show visible implementation version quant-index-fix-1. Open http://localhost:8000/src/benchmark/part2_sweep.html?v=quant-index-fix-1 ; previous second record still compiled old `meta` source.

Latest evidence: PART2SWEEP-2026-10-06T06-07-34-319Z.json is COMPLETE and independently verified. Finite exploration accepted; five independent repetitions remain NOT_RUN. Earlier READY_FOR_PHONE and failed entries are historical states. See part2_sweep_results.md (in docs/) for full tables.
