# 原题逐项要求矩阵

下方按原始 PDF 页码保留要求摘要与已有状态，不把某实验 COMPLETE 扩大为整体 COMPLETE。英文原文片段不是项目译文的权威来源。

COMPLETE 表示该行限定范围已具备证据；PARTIAL 表示只满足部分；BLOCKED 表示当前入口或有效证据受限；NOT_RUN 表示未执行。整体和两个 Part 都是 PARTIAL。具体缺口与最小下一步在表中分列。

## 接下来读什么

- [任务范围与要求导航](requirements.md)
- [剩余指标可行性审查](remaining_metrics_feasibility.md)
- [证据与公开范围索引](evidence_index.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/assignment_requirements_matrix.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

|Part / PDF页|原文摘要|性质|状态|证据范围与缺口|最小下一步|证据|
|---|---|---|---|---|---|---|
|Target,p1|Gemma E2B (Gemma 3n)|REQUIRED|COMPLETE|指定Web模型在stock0.10.29初始化/生成成功；仅此模型可运行性子项|无，保留范围|[baseline_sessions_results.md](../baseline_sessions_results.md)|
|Target,p1|Snapdragon device with Adreno GPU|REQUIRED|NOT_RUN|当前为Mali；所有速度结论仅适用于当前设备，不满足目标硬件验收|取得 Adreno 后单独验证|[environment.md](../environment.md)|
|1,p1|Run…existing WebGPU stack…Do not optimize anything|REQUIRED|COMPLETE|stock模型/runtime算法未优化；instrumentation开销单列。整个Part1仍PARTIAL|无，保留 stock 算法|[baseline_sessions_plan.md](../baseline_sessions_plan.md)|
|1,p1|Run each metric at least 5 times…median and p95|REQUIRED|PARTIAL|组合墙钟/JS与逻辑资源各长度五次；RSS/PSS仅pilot，真实token/phase/kernel指标缺失|仅补未完成指标的重复|[performance_report.md](../../report/performance_report.md)|
|1,p1|Tokens/sec — Decode throughput|REQUIRED|BLOCKED|公开API不提供真实生成token数与decode区间；不使用字符数/重新分词/回调数|先验证真实 token/phase 入口|[remaining_metrics_feasibility.md](../remaining_metrics_feasibility.md)|
|1,p1|Prefill latency — Fixed prompts of 128,512,1024 tokens|REQUIRED|PARTIAL|完整prompt实际tokenizer计数和五会话COMPLETE；纯prefill边界BLOCKED|先验证纯 phase 入口|[baseline_sessions_results.md](../baseline_sessions_results.md)|
|1,p1|Decode latency per token…distribution|REQUIRED|BLOCKED|文本callback墙钟不等于真实token/纯decode事件|先验证真实 token 事件|[remaining_metrics_feasibility.md](../remaining_metrics_feasibility.md)|
|1,p1|Memory usage — GPU buffers,JS heap,device RSS|REQUIRED|PARTIAL|15会话分口径逻辑buffer/texture/JS；browser/GPU RSS/PSS一次v2pilot。非模型独占或物理GPU驻留|补协议内的独立内存重复|[memory002_v2_pilot_results.md](../memory002_v2_pilot_results.md)|
|1,p1|Kernel(dispatch) count per token…command stream|REQUIRED|PARTIAL|真实提交dispatch结构已采集；每request计数可用，token分母与关联BLOCKED|先取得真实 token 分母|[profile002_shader_analysis.md](../profile002_shader_analysis.md)|
|1,p1–2|Individual kernel execution time…per-kernel table…op type|REQUIRED|BLOCKED|模型pass重叠与多dispatch归因限制；不能以计数排名代替耗时|先证明可信 GPU 执行关联|[profile003_overlap_review.md](../profile003_overlap_review.md)|
|1,p2|A stacked time-breakdown chart|REQUIRED|BLOCKED|无可信独占GPU算子区间；不制作可加和stacked chart。组合墙钟图为补充|等待可信独占区间|[trace001_availability.md](../trace001_availability.md)|
|1,p1–2|Identify top2–3 bottleneck kernels…classify…evidence|REQUIRED|BLOCKED|仅源码结构与可能成本解释，无可支持瓶颈排名的GPU时间/硬件counter|等待可信时间/硬件证据|[remaining_metrics_feasibility.md](../remaining_metrics_feasibility.md)|
|1,p2|Methodology…device,driver,Chrome version,thermal state|REQUIRED|PARTIAL|当前设备/Chrome/人工状态与边界已记；真实WebGPU driver及目标Adreno缺口。触感不是测温|核实目标环境和 driver|[environment.md](../environment.md)|
|1,p1|timestamp-query;Chrome tracing;chrome://gpu;adb meminfo|LISTED METHODS|PARTIAL|timestamp与meminfo已使用，TRACE001有界查询无执行源；CPU Dawn不是GPU时间|当前路径已收敛|[trace001_availability.md](../trace001_availability.md)|
|1,p1|Snapdragon Profiler…if available|CONDITIONAL|NOT_RUN|原题明确if available；暂无Adreno/工具访问，不把counter缺失编为测量|有工具时再评估|[environment.md](../environment.md)|
|1,p1–2|Classification Example evidence…roofline/peak/stalls/waves|EXAMPLE|NOT_RUN|例证不是每一项新增mandatory实验；当前无对应硬件依据|不新增示例实验|[assignment_requirements_matrix.md](../assignment_requirements_matrix.md)|
|2,p2|Q4/Q8…dequantization…matrix multiplication…FP16 accumulation|REQUIRED|COMPLETE|合成QROW Q4/Q8精度路径、FP16 probe与reference通过；并非Gemma原生量化|无，保留合成格式声明|[part2_compute_contract.md](../part2_compute_contract.md)|
|2,p2|A naive WGSL;B shared memory;C vectorized loads;D fused dequant+GEMM|REQUIRED|COMPLETE|四个规定结构版本已实测；specialized不代替C。只关闭实现结构/当前契约子项|无，保留结构验收范围|[part2_repeat_results.md](../part2_repeat_results.md)|
|2,p2|Gemma real layer shapes…decode M1,prefill M>=128|REQUIRED|PARTIAL|仅代表性M1/M128；GEMM004仅执行/padded M8,K1536,N2048。有数学映射不等于有效逻辑层shape|补有效逻辑轴元数据|[gemm004_shape_proof.md](../gemm004_shape_proof.md)|
|2,p2|Sweep tile sizes and workgroup sizes|REQUIRED|COMPLETE|冻结预算Q4/Q8两shape，B/C/D至多三候选，有限sweep及选定/原配置五会话复验；当前Mali范围|无，不重新选参数|[part2_sweep_results.md](../part2_sweep_results.md)|
|2,p2|GFLOPS,effective GB/s,correctness(max abs error vs FP32)|REQUIRED|PARTIAL|全量在线FP32 oracle误差+离线小数组已核验；派生2MNK/pass GFLOP/s非峰值。有效GB/s统一口径未完成，实际DRAM流量未测|冻结有效 GB/s 定义后核算|[performance_report.md](../../report/performance_report.md)|
|2,p2|shader-f16…fallback if absent|REQUIRED|PARTIAL|f16路径实际通过，fallback代码/电脑检查具备；无f16手机硬件路径尚未实测，不算fallback验收|需无 f16 设备验收 fallback|[part2_compute_contract.md](../part2_compute_contract.md)|
|2,p2|warm-up,many iterations,timestamp-query rather than CPU timers|REQUIRED|COMPLETE|10warm+30measured/候选，串行单dispatch pass；网格、零值、尾部保存。完整路径CPU墙钟另口径|无，保留采样边界|[part2_repeat_plan.md](../part2_repeat_plan.md)|
|2,p2|GEMM…beats baseline…target Adreno|REQUIRED|NOT_RUN|当前Mali合成shape速度不能代替Adreno验收，更不能称模型加速|取得 Adreno 后验证|[performance_report.md](../../report/performance_report.md)|
|2,p2|Comparison table A-D;why faster/slower;reproducible harness|REQUIRED|PARTIAL|五轮绝对时间/同轮比值/源码与raw齐备；硬件解释仅假设，真实shape/Adreno结论缺失|补硬件/有效 shape 证据|[performance_report.md](../../report/performance_report.md)|
|2,p2|Suggested results table…Tile/WG/Time/GFLOPS/GB/s/error|SUGGESTED PRESENTATION|PARTIAL|绝对时间/配置/误差完整表；mandatory GFLOPS/GB/s项独立保留缺口|保留未测列|[performance_report.md](../../report/performance_report.md)|
|p2–3|Grading Rubric(suggested)|SUGGESTED RUBRIC|NOT_RUN|非新增实验要求，不预测成绩|不预测评分|[webgpu_adreno_assignment.pdf](../../assignment/webgpu_adreno_assignment.pdf)|
