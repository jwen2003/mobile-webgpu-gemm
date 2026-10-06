"""Offline stage report from immutable evidence. No device/model/benchmark calls."""
from pathlib import Path
import hashlib, json, math, statistics, sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from verify_baseline_sessions import audit as audit_baseline
from verify_part2_repeat_result import verify as audit_repeat, SELECTED

def load(p):
    return json.loads((ROOT / p).read_text(encoding='utf-8'))

def stat(xs):
    s = sorted(xs)
    return dict(count=len(s), median=statistics.median(s), p95=s[math.ceil(.95*len(s))-1],
                min=s[0], max=s[-1], zeroCount=s.count(0))

def table(headers, rows):
    return '\n'.join(['|'+'|'.join(headers)+'|', '|'+'|'.join(['---']*len(headers))+'|'] +
                     ['|'+'|'.join(map(str,r))+'|' for r in rows]) + '\n'

def main():
    hashes = load('results/analysis/raw_sha256_manifest.json')['files']
    for f,h in hashes.items():
        assert hashlib.sha256((ROOT/f).read_bytes()).hexdigest() == h, f
    assignment = ROOT/'assignment/webgpu_adreno_assignment.pdf'
    assert hashlib.sha256(assignment.read_bytes()).hexdigest() == 'dc02d42a5fdf521b75794ac641478cfe91ec7d9e165fa93a1c2e43b3ec63e9c3'
    bs = load('results/analysis/baseline002_summary.json')
    rs = load('results/analysis/part2_repeat_summary.json')
    tx = load('results/analysis/memory001_texture_payload.json')
    assert bs['status'] == 'FIFTEEN_SESSIONS_VERIFIED' and rs['status'] == 'FIVE_SESSIONS_VERIFIED'
    datasets = dict(status='PARTIAL', assignmentSha256=hashlib.sha256(assignment.read_bytes()).hexdigest(),
                    historicalRawHashesChecked=len(hashes), baseline=[], kernelRows=[], memoryRows=[], evidence=[])
    baseline_files = list((ROOT/'results/raw').glob('BASELINE002-L*-R*.json'))
    repeat_files = list((ROOT/'results/raw').glob('PART2REPEAT-S*.json'))
    assert len(baseline_files)==15 and len(repeat_files)==5
    all_ids=set()
    for p in baseline_files:
        raw=json.loads(p.read_text(encoding='utf-8')); v=audit_baseline(raw)
        assert v['verification']=='PASS' and raw['status']=='COMPLETE'
        assert raw['session']['id'] not in all_ids; all_ids.add(raw['session']['id'])
        datasets['evidence'].append(dict(file=p.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),scope='full prompt/recorded walls/resource ledger;not native token sequence'))
        t=raw['session']['targetTokens']; repetition=raw['session']['repetition']
        old=next(g for g in bs['groups'] if g['inputTokens']==t)
        oldv=next(s for s in old['perSession'] if s['session']['repetition']==repetition)
        assert oldv['rawSha256']==hashlib.sha256(p.read_bytes()).hexdigest()
        assert oldv['wallMetrics']==raw['wallMetrics']
        datasets['baseline'].append(dict(tokens=t,round=repetition,**raw['wallMetrics']))
        texture=next(s for s in tx['sessions'] if s['session']['id']==raw['session']['id'])
        assert texture['status']=='AVAILABLE' and not texture['uncovered'] and not texture['lifecycleErrors']
        for snap in raw['memory']['snapshots']:
            ts=next(s for s in texture['snapshots'] if s['stage']==snap['stage'])
            logical=snap['logical']
            datasets['memoryRows'].append(dict(tokens=t,round=repetition,stage=snap['stage'],
                jsHeapUsedBytes=snap['jsHeap'].get('usedJSHeapSize'),
                bufferLiveLogicalBytes=logical.get('buffers',{}).get('currentLogicalBytes'),
                textureLivePayloadBytes=ts.get('payloadBytes'),textureStatus=ts['status']))
    for g in bs['groups']:
        sessions=[r for r in datasets['baseline'] if r['tokens']==g['inputTokens']]
        assert len(sessions)==5
        for k,expected in g['wallStatisticsMs'].items():
            got=stat([s[k] for s in sessions])
            for field in ['count','median','p95','min','max']:assert got[field]==expected[field]
    sample_count=0; small_count=0
    for p in sorted(repeat_files):
        raw=json.loads(p.read_text(encoding='utf-8')); v=audit_repeat(raw)
        assert v['verification']=='PASS' and raw['status']=='COMPLETE'
        ordinal=raw['session']['ordinal']; old=next(s for s in rs['sessions'] if s['session']['ordinal']==ordinal)
        assert old['rawSha256']==hashlib.sha256(p.read_bytes()).hexdigest()
        assert old['tables']==v['tables'] and old['comparisons']==v['comparisons']
        small_count+=v['smallOutputsIndependentlyChecked']
        datasets['evidence'].append(dict(file=p.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),scope='full exported small outputs/timestamps/orders;large all-output checks online only'))
        for f in raw['formats']:
            for group in f['performance']:
                m=group['shape']['M']; bits=f['bits']; key=f'{bits}:{m}'
                for cid in group['eligibleCandidateIds']:
                    samples=[s for s in group['samples'] if s['candidateId']==cid]
                    assert len([s for s in samples if s['phase']=='warmup'])==10
                    measured=[s for s in samples if s['phase']=='measured']; assert len(measured)==30
                    for s in samples:
                        assert int(s['endTimestamp'])-int(s['startTimestamp'])==s['gpuPassDurationNs']
                        assert s['correctness']['status']=='PASS'
                    sample_count+=len(samples)
                    stats=stat([s['gpuPassDurationNs'] for s in measured])
                    assert stats==group['statistics'][cid]['gpuPassNs']
                    a=group['statistics']['A-original']['gpuPassNs']['median']
                    original='A-original' if cid.startswith('A') else dict(B='B-16x16-K16',C='C-8x8-K16',D='D-8x8-K16')[cid[0]]
                    original_median=group['statistics'][original]['gpuPassNs']['median']
                    delta=a-stats['median']; selected=cid=='A-original' or SELECTED[key].get(cid[0])==cid
                    errors=[s['correctness']['fp32']['maxAbsoluteError'] for s in samples]
                    datasets['kernelRows'].append(dict(session=ordinal,bits=bits,M=m,K=1024,N=1024,candidate=cid,
                        selected=selected,**stats,AoverCandidate=a/stats['median'],
                        ratioStatus='WITHIN_ONE_GRID' if abs(delta)<=65536 else 'RESOLVED_IN_THIS_SESSION',
                        originalOverCandidate=original_median/stats['median'],maxAbsErrorVsFp32=max(errors),
                        nominalGflops=(2*m*1024*1024)/stats['median']))
    assert sample_count==5000 and small_count==232985
    datasets['verification']=dict(status='PASS',baselineSessions=15,repeatSessions=5,
        timestampSamplesChecked=sample_count,smallOutputsIndependentlyChecked=small_count,
        limitation='Large matrices checked online in full;offline verification covers exported small arrays and recorded references,not unavailable large actual arrays')
    datasets['baseline'].sort(key=lambda r:(r['tokens'],r['round']))
    datasets['kernelRows'].sort(key=lambda r:(r['bits'],r['M'],r['candidate'],r['session']))
    (ROOT/'results/analysis/stage_delivery_data.json').write_text(json.dumps(datasets,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    build_report(datasets,bs,rs,tx)
    print('PASS:15 baseline/5 Part2 sessions;5000 timestamps;232985 exported small outputs;42 historical hashes')

def build_report(d,bs,rs,tx):
    out=['# 当前阶段交付报告：PARTIAL（部分完成）\n',
    '截至2026-10-06，仅整理已归档实测和离线核验；本轮无手机、模型或 benchmark 运行。实验 JSON 的 COMPLETE/PASS 仅表示该实验内部验收，不表示整个原题完成。当前设备为 Mali，真实有效 decode/prefill layer shape 未确认，未宣称模型加速。\n',
    '原题：[原始 assignment，3页](../assignment/webgpu_adreno_assignment.pdf)，SHA256 `'+d['assignmentSha256']+'`。逐项原文、页码、mandatory/optional/示例区分与状态见[要求矩阵](../docs/assignment_requirements_matrix.md)。COMPLETE=该行明确范围已具备证据；PARTIAL=部分证据；BLOCKED=当前接口/有效证据无法取得；NOT_RUN=尚未执行。整体与两个 Part 都为 PARTIAL。\n',
    '## 环境与范围\n',
    '环境依据[环境记录](../docs/environment.md)：OnePlus PMB110 / Dimensity9500 / Mali-G1-Ultra MC12、Android16、Chrome154.0.8037.92 来自用户截图；JSON 的 reduced UA 不足以识别真实 OS/GPU，adapter 的空 device/description 保留。driver2.1.28733 是 chrome://gpu/ANGLE 元数据，不能当成已确认的 runtime WebGPU driver。模型为已校验 Gemma3n E2B Web .litertlm，tasks-genai0.10.29 固定；未修改算法。正式目标 Snapdragon/Adreno 尚未测。\n',
    '[模型身份清单](../assets/models/model_manifest.json)：gemma-3n-E2B-it-int4-Web.litertlm，3,038,117,888 bytes，SHA256 `b6c8e1081ec80730f14473a5ece941b48da5d8e2a80c97c2963da153f3eff3d2`；这是本机文件身份，官方revision/publisher hash未独立确认，文件大小不是运行内存。runtime JS/WASM同为0.10.29，资源文件哈希见[runtime manifest](../src/baseline/runtime_manifest.json)。模型环境探测adapter与观察到的runtime device分别记录，runtime backend UNKNOWN；Part2自建device实际启用shader-f16与timestamp-query，完整limits见各raw，不以adapter支持代替device实际能力。\n',
    'BASELINE002：纯文本，maxTokens2048为输入+输出总容量，topK40、temperature0.8、seed101、numResponses1。一页/新task/device只生成一次，0次生成 warm-up；tokenizer准备单独计时。stock cache/rewinding默认不改，OS/browser/driver缓存未清空。15会话均前台、无错误；主观无明显发热≠测温，充电/电量、VPN与 DevTools/flag 为各文件人工记录，非严格硬件控温。Part2五轮充电状态与电量分别记录，同样未测温；以各 raw 手工字段为准。\n',
    '## Part 1：已测组合墙钟，不替代原题纯 phase/token 指标\n',
    '完整 prompt 用模型实际 sizeInTokens 核对128/512/1024，正文120/504/1016；模板差值8计入完整输入。不能据此确认隐藏 BOS 或实际 prefill tensor 长度。各长度5个独立会话，非一次会话拆样；每组 nearest-rank p95 在n=5时等于最大值，尾部证据有限。首次 callback 不是纯 prefill；callback不等于token；生成结束 promise 与 GPU drain 分别记录。\n']
    rows=[]
    for g in bs['groups']:
        vals=[g['inputTokens'],5]
        for k in ['modelInitializationMs','generationCallToCompletionMs','firstCallbackMs','postGenerationDrainMs']:
            s=g['wallStatisticsMs'][k]; scale=1 if k=='postGenerationDrainMs' else 1000
            vals.append(f"{s['median']/scale:.3f} / {s['p95']/scale:.3f}")
        rows.append(vals)
    out.append(table(['完整输入tokens','会话数','初始化median/p95(s)','生成调用至完成median/p95(s)','首callback median/p95(s)','drain median/p95(ms)'],rows))
    out.append('![模型组合墙钟：逐会话数据，非GPU时间](figures/model_combined_wall.svg)\n')
    out.append(table(['tokens','轮','初始化s','生成s','首callback s','drain ms'],
        [[r['tokens'],r['round'],f"{r['modelInitializationMs']/1000:.3f}",f"{r['generationCallToCompletionMs']/1000:.3f}",f"{r['firstCallbackMs']/1000:.3f}",f"{r['postGenerationDrainMs']:.3f}"] for r in d['baseline']]))
    out.append('限制：[固定runtime审查](../docs/remaining_metrics_feasibility.md)没有支持的真实生成IDs/count或独立prefill/decode入口。因此 tokens/s、真实 per-token latency、dispatch/token、纯phase继续 BLOCKED/UNAVAILABLE。[PROFILE002结构分析](../docs/profile002_shader_analysis.md)提供生成提交关联及算子源码分类，不以dispatch数推断耗时。PROFILE003/TIMING002重叠诊断不能产生独占kernel表或可加和breakdown；[TRACE001](../docs/trace001_availability.md)只发现已注册GPU内存源，未发现执行timeline源，算子关联UNKNOWN。瓶颈排名/硬件原因仍无充分依据。\n')
    out.extend(['## 分口径内存：不相加为物理GPU内存\n',
        '15个BASELINE002的JS heap、逻辑buffer和texture分别报告。JS heap API值重复且粗粒度，不覆盖所有native/WASM；buffer为观察到的显式生命周期账面bytes；MEMORY001离线补齐全部7500个texture（每会话500，六格式，覆盖100%），按mip/layer/sample核算payload，不含上传row padding或驱动开销。累计创建量不是活跃峰值；显式destroy账面变化不是物理释放/泄漏证明。\n'])
    memory=[]
    for tokens in [128,512,1024]:
        for stage in ['AFTER_INIT','BEFORE_GENERATION','AFTER_GENERATION','AFTER_DRAIN','AFTER_TASK_CLOSE']:
            rr=[r for r in d['memoryRows'] if r['tokens']==tokens and r['stage']==stage]
            def span(key):
                v=[r[key] for r in rr if r[key] is not None]
                return 'UNAVAILABLE' if len(v)!=5 else str(min(v)) if min(v)==max(v) else f'{min(v)}–{max(v)}'
            memory.append([tokens,stage,span('jsHeapUsedBytes'),span('bufferLiveLogicalBytes'),span('textureLivePayloadBytes')])
    out.append(table(['tokens(每组5会话)','快照','JS reported used bytes范围','buffer logical live bytes范围','texture live payload bytes范围'],memory))
    out.append(table(['tokens','texture累计创建bytes范围','显式事件活跃payload峰值bytes范围','峰值阶段','覆盖'],
      [[t,f"{min(s['cumulativeCreatedPayloadBytes'] for s in tx['sessions'] if s['session']['targetTokens']==t)}–{max(s['cumulativeCreatedPayloadBytes'] for s in tx['sessions'] if s['session']['targetTokens']==t)}",f"{min(s['activeLedgerPeakPayloadBytes'] for s in tx['sessions'] if s['session']['targetTokens']==t)}–{max(s['activeLedgerPeakPayloadBytes'] for s in tx['sessions'] if s['session']['targetTokens']==t)}",'MODEL_INIT','2500/2500'] for t in [128,512,1024]]))
    out.append('初始化前buffer/texture快照UNAVAILABLE：observer尚未安装，不猜为0。完整逐会话及未覆盖范围见[MEMORY001](../docs/memory001_texture_accounting.md)。物理GPU驻留、native/WASM整体内存未取得。\n')
    v=load('results/analysis/memory002_v2_pilot_verification.json')
    out.append('MEMORY002 v1保留PARTIAL；v2仅一次128-token协议pilot，四必需阶段覆盖、另保留生成前快照。初始化后台切换5.606s警告；renderer页面归属UNKNOWN，browser/GPU角色逐快照核验。下面单位KiB，同PID同start-tick的差值，非模型独占内存；PSS不是物理GPU内存，RSS跨进程相加会重复共享页。生成窗口归属仅在观测时钟不确定范围约28.975ms和协议假设下成立；稀疏快照不是连续峰值。\n')
    rows=[]
    for r in v['rows']:
        for x in r['browserGpu']:
            rows.append([r['stage'],x['role'],x['pssKiB'],x['deltaPssKiB'],x['rssKiB'],x['deltaRssKiB']])
    out.append(table(['阶段','进程范围','PSS KiB','ΔPSS vs idle','RSS KiB','ΔRSS vs idle'],rows))
    out.append('证据：[v2报告](../docs/memory002_v2_pilot_results.md)。系统原文与v2页面JSON仅本地忽略保存；公开派生表及哈希可审查。设备RSS/PSS五次独立重复 NOT_RUN，原题memory总体PARTIAL，未关闭重复要求。\n')
    out.extend(['## Part 2：合成QROW FP16 A–D与五轮复验\n',
        '契约[PART2-QROW-v1](../docs/part2_compute_contract.md)：row-major A[M,K]×B[K,N]，Q4/Q8无符号codes，逐K行packed u32、低位优先、沿K group32，FP16 scale、u32 zero-point；dequant=(q−zp)×scale，再按契约转换f16。这是合成QROW实验格式，不是Gemma原生格式/真实权重。FP16 activation、权重数值、递增K的显式f16 fma累加，f16结果以f32 carrier存储。FP16 accumulation probe2048（FP32为2050）通过；不是硬件逐位/指令证明。\n',
        'A naive；B shared-memory tiled；C tiled vec4/packed-u32加载；D fused Q4/Q8 unpack+dequant+GEMM。C不是M=1 specialized，packed FP16解包不是INT4反量化。实际数学性能shape是代表性M=1/128,K=N=1024；GEMM004的M8/K1536/N2048仅已证明执行/padded shape，不能充当真实有效decode/prefill layer shape。无任意batch/head折叠。\n',
        '每独立Part2会话重新页面与device、重编译pipeline及准备；固定A、原B/C/D与冻结选定配置，同配置去重。每候选10warm-up+30measured，seed与循环平衡顺序冻结，不根据复验改选；五会话总5000计时样本（含warm-up），逐轮保持原样，未pool为一个median。kernel-only：单pass单dispatch，timestampWrites/BigInt差值；串行GPU完成、全量读回/在线校验后下一样本。准备/上传/编译/分配/reference/readback/CPU校验在GPU timestamp外，submit-to-completion墙钟单独保存。串行读回会改变运行状态，GPU pass包含调度等成本。\n'])
    out.append(table(['Q格式','M','原B→选B','原C→选C','原D→选D'],[[f'Q{b}',m,'16×16-K16→'+SELECTED[f'{b}:{m}']['B'][2:],'8×8-K16→'+SELECTED[f'{b}:{m}']['C'][2:],'8×8-K16→'+SELECTED[f'{b}:{m}']['D'][2:]] for b in [4,8] for m in [1,128]]))
    out.append('![各独立会话kernel median：原与选定配置分别展示](figures/kernel_session_medians.svg)\n![各配置跨轮median与p95范围：非合并样本](figures/kernel_variation.svg)\n')
    for bits in [4,8]:
        for m in [1,128]:
            out.append(f'### Q{bits}, M={m}, K=N=1024：逐轮绝对耗时与同轮比值\n')
            rr=[r for r in d['kernelRows'] if r['bits']==bits and r['M']==m]
            out.append(table(['候选','轮','median ms','nearest-rank p95 ms','名义GFLOP/s','A/候选','比值分辨率标记','本版本原配置/候选','零值数','max abs err vs FP32'],
              [[r['candidate'],r['session'],f"{r['median']/1e6:.6f}",f"{r['p95']/1e6:.6f}",f"{r['nominalGflops']:.3f}",f"{r['AoverCandidate']:.4f}",r['ratioStatus'],f"{r['originalOverCandidate']:.4f}",r['zeroCount'],f"{r['maxAbsErrorVsFp32']:.8g}"] for r in rr]))
    out.append('各行比值只使用同一会话median；>1表示分母较快，<1表示较慢。误差列为该会话该候选采样记录（含warm-up）在线全量检查的max absolute error vs FP32，不是独立重建的大型actual。原始时间戳保留零值与长尾，30measured nearest-rank p95为排序第29个；已观测网格65.536µs，median中点可有半网格。WITHIN_ONE_GRID不支持精确小幅收益。图表为五会话的逐会话统计/范围，不是pool后统计或置信区间。名义2MNK FLOPs下有效GFLOP/s写入派生JSON，仅是pass级算术计数约定，D额外解包指令不计其中；非硬件峰值利用率。实际DRAM GB/s未测，原题effective GB/s统一计数口径未完整报告，不将nominal accesses冒充DRAM测量。\n')
    out.append(table(['组合','版本','原/选比值五轮范围','五轮方向（按网格）'],[[a['group'],a['variant'],f"{a['ratioRange'][0]:.4f}–{a['ratioRange'][1]:.4f}",', '.join(p['direction'] for p in a['perSession'])] for a in rs['directions']]))
    out.append('观察：选定B在四组合相对原B五轮均较快，但不是必然快于A；M=1的B仍较慢。选定D在M128相对原D五轮较快；M1的Q4 D出现较慢、Q8 D有方向反转，其余差异多在一个网格内，保留不确定性。Q8 M1 A/C也存在方向变化，不能声称稳定小幅收益。C配置变化的Q8 M128均为网格内无法区分。形状/加载/共享内存/barrier是源码事实；缓存、occupancy、带宽或调度只是待验证解释。vec4语法不证明硬件向量指令。\n')
    out.extend(['## 权重准备成本：两个口径不得混用\n',
        '五轮复验仅prepared-input kernel-only。ABC已完成CPU反量化与C布局准备，D在pass内反量化，实际输入资源不同。一次准备成本/逻辑资源记录在原始preprocessing中，不隐藏为kernel收益。先前独立Q4/Q8 A–D pilot另有完整路径墙钟：每样本确实从共同packed输入重做CPU反量化、布局转换、必要上传到最终GPU完成，排除reference/输出校验；不是两个median简单相加，也不是把CPU ms加到GPU ns称GPU时间。完整路径仅一次pilot，不是五轮复验结果。\n'])
    full=[]
    for filename,formatname in [('part2_abcd_verified.json','Q4'),('part2_q8_abcd_verified.json','Q8')]:
        for g in load('results/analysis/'+filename)['performance']:
            for variant in 'ABCD':
                s=g['completePathWallMs'][variant]
                full.append([formatname,g['shape']['M'],variant,f"{s['median']:.3f}",f"{s['p95']:.3f}"])
    out.append(table(['独立历史pilot','M','版本','完整路径墙钟median ms','p95 ms'],full))
    out.append('Q4 pilot中D的kernel-only慢于C，但在每次CPU准备+转换+必要上传完整路径更快；这不适用于静态权重预处理一次后反复复用，也不等于模型加速。减少反量化中间矩阵只是逻辑buffer分配减少，不是实测物理GPU内存节省。不得使用历史pilot median作为五轮同轮比值分母，跨Q4/Q8会话差异不作受控因果结论。\n')
    out.extend(['## 正确性、证据索引与复现\n',
        '运行前固定种子/两层reference/显式FP32 oracle与阈值；未因失败放宽。五轮全部候选通过在线全量输出和非有限值检查，小用例/FP16 probe保留完整数组；离线独立核验232985个导出小用例输出、5000时间戳与冻结顺序。大型actual数组未全量导出，离线不能声称重建所有大型actual；其正确性依据在线全量摘要及可复算的导出reference记录。\n',
        '[阶段派生数据与证据哈希](../results/analysis/stage_delivery_data.json)；[BASELINE002汇总](../results/analysis/baseline002_summary.json)；[Part2五轮汇总](../results/analysis/part2_repeat_summary.json)；[texture逐会话核算](../results/analysis/memory001_texture_payload.json)；[v2公开核验](../results/analysis/memory002_v2_pilot_verification.json)；[TRACE001核验](../results/analysis/trace001_availability.json)。全部历史raw链接可通过阶段数据evidence列表和[历史SHA256清单](../results/analysis/raw_sha256_manifest.json)定位。PROFILE原始与[真实执行shape证据](../docs/gemm004_shape_proof.md)在原有文档中保留；有效逻辑shape仍未知。\n',
        '公开仓库包含既有原始实验JSON与核验脚本；模型weights、本地固定runtime资源、node_modules、邮件updates、原始adb/DevTools/Perfetto清单与MEMORY002 v2原始页面JSON不发布。私有输入哈希公开，相关核验只能在保留原文的本机完整复现；不能声称干净clone拥有私有原文。模型需官方授权后手动准备，按model_manifest校验文件名/bytes/SHA256。\n',
        '电脑离线重建（本轮已执行，不访问手机）：`python scripts/build_stage_report.py`；完整texture核验：`python scripts/verify_memory001.py`；私有证据核验（需本地原文）：`python scripts/verify_memory002_v2_pilot.py`、`python scripts/verify_trace001.py`。图表：使用含ReportLab的Python环境运行`python scripts/plot_stage_report.py`（普通Python若缺该库，先`python -m pip install reportlab`；本轮使用已有bundled库）。图表只读取阶段派生JSON，SVG为可导出静态原图。正式文档/图表一致性检查：`python scripts/check_stage_delivery.py`。电脑检查不等于新的GPU验收。\n',
        '手机复现入口（说明用，本轮未运行）：从项目根目录`python -m http.server 8000 --bind 127.0.0.1`；USB授权后`& "C:\\Tools\\platform-tools\\platform-tools\\adb.exe" reverse tcp:8000 tcp:8000`。BASELINE002：`http://localhost:8000/src/baseline/sessions.html?v=baseline-session-v1`（每长度五新会话）；Part2：`http://localhost:8000/src/benchmark/part2_repeat.html?v=repeat-v1`（五新页面/device，固定候选）；[全部步骤与预算](../docs/part2_repeat_plan.md)。memory002协议另需`serve_memory002.py`和私有系统采样回执，不用普通server替代；不在此安排新采集。\n',
        '当前交付是可复现的部分成果与明确缺口。下一阶段是否取得Adreno、真实有效layer shape或可验证native token/phase入口须单独决定；不自动追加实验、不扩大profiler或重做相同时间戳诊断。\n'])
    out.append('## 本报告直接使用的公开原始证据索引\n')
    out.append(table(['原始文件（字节不变）','SHA256','核验范围'],
        [[f"[{Path(e['file']).name}](../{e['file']})",e['sha256'],e['scope']] for e in d['evidence']]))
    (ROOT/'report/performance_report.md').write_text('\n'.join(out),encoding='utf-8')

if __name__=='__main__':
    main()
