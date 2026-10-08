# 原始 assignment 当前要求矩阵 — PARTIAL

更新2026-10-06。直接核对原始3页PDF；SHA256 `dc02d42a5fdf521b75794ac641478cfe91ec7d9e165fa93a1c2e43b3ec63e9c3`。这是当前权威状态；早期实验日志的NOT_RUN/进行中为历史记录，不能代替此矩阵。整体/Part1/Part2均PARTIAL。

COMPLETE仅指该行明确范围已成立；PARTIAL有子项但未完整满足；BLOCKED当前入口/证据不足；NOT_RUN未执行。Target硬件缺口适用于所有测量行。REQUIRED为原文Task/Metrics/Requirements/Deliverable；LISTED METHODS是方法列表；CONDITIONAL保留if available；EXAMPLE与SUGGESTED不升格成mandatory。Q4/Q8斜线未明确是否两者必做，本项目两者都实现，但格式是实验约定。Part1的at least5原文不自动作为Part2条款；Part2五会话是项目用户要求的附加复验证据。

|Part/页|原文短句|原文性质|当前状态|证据范围与未解决限制|证据|
|---|---|---|---|---|---|
|Target,p1|Gemma E2B (Gemma 3n)|REQUIRED|COMPLETE|指定Web模型在stock0.10.29初始化/生成成功；仅此模型可运行性子项|[材料](../docs/baseline_sessions_results.md)|
|Target,p1|Snapdragon device with Adreno GPU|REQUIRED|NOT_RUN|当前为Mali；所有速度结论仅适用于当前设备，不满足目标硬件验收|[材料](../docs/environment.md)|
|1,p1|Run…existing WebGPU stack…Do not optimize anything|REQUIRED|COMPLETE|stock模型/runtime算法未优化；instrumentation开销单列。整个Part1仍PARTIAL|[材料](../docs/baseline_sessions_plan.md)|
|1,p1|Run each metric at least 5 times…median and p95|REQUIRED|PARTIAL|组合墙钟/JS与逻辑资源各长度五次；RSS/PSS仅pilot，真实token/phase/kernel指标缺失|[材料](../report/performance_report.md)|
|1,p1|Tokens/sec — Decode throughput|REQUIRED|BLOCKED|公开API不提供真实生成token数与decode区间；不使用字符数/重新分词/回调数|[材料](../docs/remaining_metrics_feasibility.md)|
|1,p1|Prefill latency — Fixed prompts of 128,512,1024 tokens|REQUIRED|PARTIAL|完整prompt实际tokenizer计数和五会话COMPLETE；纯prefill边界BLOCKED|[材料](../docs/baseline_sessions_results.md)|
|1,p1|Decode latency per token…distribution|REQUIRED|BLOCKED|文本callback墙钟不等于真实token/纯decode事件|[材料](../docs/remaining_metrics_feasibility.md)|
|1,p1|Memory usage — GPU buffers,JS heap,device RSS|REQUIRED|PARTIAL|15会话分口径逻辑buffer/texture/JS；browser/GPU RSS/PSS一次v2pilot。非模型独占或物理GPU驻留|[材料](../docs/memory002_v2_pilot_results.md)|
|1,p1|Kernel(dispatch) count per token…command stream|REQUIRED|PARTIAL|真实提交dispatch结构已采集；每request计数可用，token分母与关联BLOCKED|[材料](../docs/profile002_shader_analysis.md)|
|1,p1–2|Individual kernel execution time…per-kernel table…op type|REQUIRED|BLOCKED|模型pass重叠与多dispatch归因限制；不能以计数排名代替耗时|[材料](../docs/profile003_overlap_review.md)|
|1,p2|A stacked time-breakdown chart|REQUIRED|BLOCKED|无可信独占GPU算子区间；不制作可加和stacked chart。组合墙钟图为补充|[材料](../docs/trace001_availability.md)|
|1,p1–2|Identify top2–3 bottleneck kernels…classify…evidence|REQUIRED|BLOCKED|仅源码结构与可能成本解释，无可支持瓶颈排名的GPU时间/硬件counter|[材料](../docs/remaining_metrics_feasibility.md)|
|1,p2|Methodology…device,driver,Chrome version,thermal state|REQUIRED|PARTIAL|当前设备/Chrome/人工状态与边界已记；真实WebGPU driver及目标Adreno缺口。触感不是测温|[材料](../docs/environment.md)|
|1,p1|timestamp-query;Chrome tracing;chrome://gpu;adb meminfo|LISTED METHODS|PARTIAL|timestamp与meminfo已使用，TRACE001有界查询无执行源；CPU Dawn不是GPU时间|[材料](../docs/trace001_availability.md)|
|1,p1|Snapdragon Profiler…if available|CONDITIONAL|NOT_RUN|原题明确if available；暂无Adreno/工具访问，不把counter缺失编为测量|[材料](../docs/environment.md)|
|1,p1–2|Classification Example evidence…roofline/peak/stalls/waves|EXAMPLE|NOT_RUN|例证不是每一项新增mandatory实验；当前无对应硬件依据|[材料](../docs/assignment_requirements_matrix.md)|
|2,p2|Q4/Q8…dequantization…matrix multiplication…FP16 accumulation|REQUIRED|COMPLETE|合成QROW Q4/Q8精度路径、FP16 probe与reference通过；并非Gemma原生量化|[材料](../docs/part2_compute_contract.md)|
|2,p2|A naive WGSL;B shared memory;C vectorized loads;D fused dequant+GEMM|REQUIRED|COMPLETE|四个规定结构版本已实测；specialized不代替C。只关闭实现结构/当前契约子项|[材料](../docs/part2_repeat_results.md)|
|2,p2|Gemma real layer shapes…decode M1,prefill M>=128|REQUIRED|PARTIAL|仅代表性M1/M128；GEMM004仅执行/padded M8,K1536,N2048。有数学映射不等于有效逻辑层shape|[材料](../docs/gemm004_shape_proof.md)|
|2,p2|Sweep tile sizes and workgroup sizes|REQUIRED|COMPLETE|冻结预算Q4/Q8两shape，B/C/D至多三候选，有限sweep及选定/原配置五会话复验；当前Mali范围|[材料](../docs/part2_sweep_results.md)|
|2,p2|GFLOPS,effective GB/s,correctness(max abs error vs FP32)|REQUIRED|PARTIAL|全量在线FP32 oracle误差+离线小数组已核验；派生2MNK/pass GFLOP/s非峰值。有效GB/s统一口径未完成，实际DRAM流量未测|[材料](../report/performance_report.md)|
|2,p2|shader-f16…fallback if absent|REQUIRED|PARTIAL|f16路径实际通过，fallback代码/电脑检查具备；无f16手机硬件路径尚未实测，不算fallback验收|[材料](../docs/part2_compute_contract.md)|
|2,p2|warm-up,many iterations,timestamp-query rather than CPU timers|REQUIRED|COMPLETE|10warm+30measured/候选，串行单dispatch pass；网格、零值、尾部保存。完整路径CPU墙钟另口径|[材料](../docs/part2_repeat_plan.md)|
|2,p2|GEMM…beats baseline…target Adreno|REQUIRED|NOT_RUN|当前Mali合成shape速度不能代替Adreno验收，更不能称模型加速|[材料](../report/performance_report.md)|
|2,p2|Comparison table A-D;why faster/slower;reproducible harness|REQUIRED|PARTIAL|五轮绝对时间/同轮比值/源码与raw齐备；硬件解释仅假设，真实shape/Adreno结论缺失|[材料](../report/performance_report.md)|
|2,p2|Suggested results table…Tile/WG/Time/GFLOPS/GB/s/error|SUGGESTED PRESENTATION|PARTIAL|绝对时间/配置/误差完整表；mandatory GFLOPS/GB/s项独立保留缺口|[材料](../report/performance_report.md)|
|p2–3|Grading Rubric(suggested)|SUGGESTED RUBRIC|NOT_RUN|非新增实验要求，不预测成绩|[材料](../assignment/webgpu_adreno_assignment.pdf)|

## 当前最小后续顺序（未执行）

1. 先整理现有部分交付，而非重复无验证入口的时间戳/trace调查；当前报告/图表和逐轮证据已交付。
2. 若继续最终硬件验收，先取得指定Adreno并明确实际有效decode/prefill layer shape；这两项直接补Part2目标要求，不以执行M8替代。
3. 真实输出token/phase需要固定native graph/build可信入口；当前公开runtime无入口，保持BLOCKED，不自动扩建profiler。TRACE001未发现注册的GPU执行源，停止当前trace路径，不安排模型trace。
4. deviceRSS/PSS至少五次独立内存复验、统一effective GB/s计数口径与fallback硬件验收是独立缺口，须另冻结方案与授权，当前NOT_RUN。

[当前报告](../report/performance_report.md)只支持Mali合成QROW/组合墙钟与分范围内存，不宣称整个assignment完成或模型加速。