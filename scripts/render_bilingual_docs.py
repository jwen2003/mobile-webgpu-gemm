"""Documentation-only renderer. Reads shared evidence; never writes results/analysis.

Prose lives in documentation_content.py. All generated Markdown can be rebuilt.
Archives and migration hashes are initialized once, from tracked files only.
"""
from pathlib import Path
import hashlib, json, re, subprocess
from documentation_content import PAGES, SCOPES_EN, NEXT

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'docs/documentation_manifest.json'
LANGS = ('zh-CN', 'en')

def read_json(path):
    return json.loads((ROOT/path).read_text(encoding='utf-8'))

def write(path, text):
    p = ROOT/path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text.rstrip()+'\n', encoding='utf-8', newline='\n')

def rel(target, current):
    import os
    return Path(os.path.relpath(ROOT/target, (ROOT/current).parent)).as_posix()

def link(target, current, label=None):
    return f'[{label or Path(target).name}]({rel(target,current)})'

def target(name, lang):
    return f'docs/{lang}/{name}.md'

def table(headers, rows):
    def cell(x):
        return str(x).replace('|','&#124;').replace('\n','<br>')
    return '\n'.join(['|'+'|'.join(headers)+'|','|'+'|'.join(['---']*len(headers))+'|']+
                     ['|'+'|'.join(cell(x) for x in row)+'|' for row in rows])+'\n'

def bootstrap():
    if MANIFEST.exists():
        m=read_json('docs/documentation_manifest.json')
        # This manifest describes documentation, not a historical experiment verification.
        for r in m['documents']:
            name=Path(r['original']).stem
            if r['original']=='README.md' or name in {'environment','requirements','assignment_requirements_matrix'}:
                r['category']='current-explanation'
            elif r['original'].startswith('report/') or name.endswith('_results') and name!='memory002_pilot_results':
                r['category']='current-report'
            elif 'contract' in name:r['category']='contract'
        m['externalOriginals']=[dict(path='assignment/webgpu_adreno_assignment.pdf',category='external-original',
            sha256=hashlib.sha256((ROOT/'assignment/webgpu_adreno_assignment.pdf').read_bytes()).hexdigest(),
            handling='Unmodified original; bilingual matrix is a project summary,not an authoritative translation')]
        write('docs/documentation_manifest.json',json.dumps(m,ensure_ascii=False,indent=2))
        return m
    output = subprocess.check_output(['git','-c','safe.directory=C:/Projects/mobile-webgpu-gemm','ls-files','-z'], cwd=ROOT)
    tracked = output.decode('utf-8').split('\0')
    tracked = [p for p in tracked if p]
    docs = []
    for p in tracked:
        if not p.endswith('.md') or p.startswith('updates/'):
            continue
        raw = (ROOT/p).read_bytes()
        archive = 'docs/history/original/'+p
        ap = ROOT/archive; ap.parent.mkdir(parents=True,exist_ok=True); ap.write_bytes(raw)
        name = 'model_preparation' if p=='assets/models/README.md' else Path(p).stem
        if p=='report/performance_report.md':
            localized = {l:f'report/{l}/performance_report.md' for l in LANGS}
            category='current-report'
        else:
            localized = {l:target(name,l) for l in LANGS}
            category=('historical-record' if name in {'experiment_log','archive_validation','baseline002_work_summary','memory002_pilot_results'}
                      else 'contract' if 'contract' in name else 'method-or-results')
        docs.append(dict(original=p,category=category,archive=archive,sha256=hashlib.sha256(raw).hexdigest(),localized=localized))
    # Preserve all tracked evidence, verification, data, figures, assignment, and compute source.
    protected = {p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in tracked
                 if p.startswith(('results/','assignment/','src/','assets/','report/figures/')) and not p.endswith('.md')}
    m=dict(version=1,sourceCommit=subprocess.check_output(['git','-c','safe.directory=C:/Projects/mobile-webgpu-gemm','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),
           documents=docs,protectedFiles=protected,
           exclusions=['Immutable assignment/third-party originals','Original JSON and existing verification records',
                       'Byte-preserved historical Markdown snapshots (not current prose; original links intentionally retained)',
                       'Ignored updates,model weights,vendor,private system originals,temporary integrity snapshots'])
    write('docs/documentation_manifest.json',json.dumps(m,ensure_ascii=False,indent=2))
    return m

def archive_for(name,m):
    original='assets/models/README.md' if name=='model_preparation' else ('README.md' if name=='README' else 'docs/'+name+'.md')
    return next((r['archive'] for r in m['documents'] if r['original']==original),None)

def append_common(name, lang, m):
    i=LANGS.index(lang); p=target(name,lang); spec=PAGES[name]
    s=f"# {spec['title'][i]}\n\n{spec['purpose'][i]}\n\n"
    s+= '\n\n'.join(pair[i] for pair in spec['paragraphs'])+'\n\n'
    if spec['links']:
        s+=('## 接下来读什么\n\n' if i==0 else '## Read next\n\n')
        s+='\n'.join('- '+link(target(n,lang),p,PAGES[n]['title'][i]) for n in spec['links'])+'\n\n'
    s+=('## 来源与维护\n\n' if i==0 else '## Sources and maintenance\n\n')
    a=archive_for(name,m)
    if a:
        s+=link(a,p,'整理前历史原文（当时状态）' if i==0 else 'Pre-reorganization original (historical state)')+'。\n\n' if i==0 else link(a,p,'Pre-reorganization original (historical state)')+'.\n\n'
    s+=link('scripts/documentation_content.py',p,'人工维护的双语正文' if i==0 else 'Manually maintained bilingual prose')+' · '+link('scripts/render_bilingual_docs.py',p,'展示生成器' if i==0 else 'Presentation renderer')+'\n'
    return s

def configuration_table(lang):
    h=(['候选','工作组 x×y','invocation 数','输出 tile 行×列','K tile','共享 bytes'] if lang=='zh-CN'
       else ['Candidate','Workgroup x×y','Invocations','Output tile rows×columns','K tile','Shared bytes'])
    rows=[['A-original','8×8',64,'8×8','scalar',0],['B-16x16-K16','16×16',256,'16×16',16,1024],
          ['B-8x8-K8','8×8',64,'8×8',8,256],['B-32x8-K16','32×8',256,'8×32',16,1280],
          ['C/D-8x8-K16','8×8',64,'8×32',16,1280],['C/D-4x8-K16','4×8',32,'8×16',16,768],
          ['C/D-8x16-K16','8×16',128,'16×32',16,1536]]
    return table(h,rows)

def selected_table(lang):
    return table(['Q','M','B','C','D'],[
      ['Q4',1,'B-8x8-K8','C-8x8-K16','D-4x8-K16'],
      ['Q4',128,'B-32x8-K16','C-8x8-K16','D-8x16-K16'],
      ['Q8',1,'B-32x8-K16','C-8x8-K16','D-4x8-K16'],
      ['Q8',128,'B-8x8-K8','C-8x16-K16','D-8x16-K16']])

def annexes(data,lang):
    cn=lang=='zh-CN'
    p=target('results_appendix',lang)
    s=('# 数据附录：共享证据的完整逐轮表\n\n' if cn else '# Data appendix: complete per-session tables from shared evidence\n\n')
    s+=('本页自动展示原有数字，不重新计算或改写证据。单位见表头；n=30 指每会话每候选 measured 样本，五次会话分开列。\n\n' if cn else 'This page renders established values without recomputing or rewriting evidence. Units are in headers. n=30 means measured samples per candidate per session; five sessions remain separate.\n\n')
    s+=link('results/analysis/stage_delivery_data.json',p)+'\n\n'
    s+=('## 模型逐轮墙钟（ms）\n\n' if cn else '## Model wall times per session (ms)\n\n')
    bh=['tokens','round','runtimePreparationMs','modelInitializationMs','tokenPreparationMs','tokenPreparationDrainMs','generationCallToCompletionMs','firstCallbackMs','postGenerationDrainMs']
    s+=table(bh,[[r.get(k) for k in bh] for r in data['baseline']])+'\n'
    s+=('## Kernel 每会话统计及同轮比值\n\nGPU 时间单位 ns；两个比值的分母范围不同。保留所有 125 行，不只显示最好一轮。\n\n' if cn else '## Kernel per-session statistics and same-session ratios\n\nGPU times are in ns. The two ratios have different baselines. All 125 rows are retained, not only the best session.\n\n')
    kh=['session','bits','M','candidate','selected','count','median','p95','min','max','zeroCount','AoverCandidate','ratioStatus','originalOverCandidate','maxAbsErrorVsFp32','nominalGflops']
    s+=table(kh,[[r.get(k) for k in kh] for r in data['kernelRows']])+'\n'
    repeat=read_json('results/analysis/part2_repeat_summary.json')
    s+=('## 五会话范围（ns）与方向\n\n范围来自会话统计，不合并样本。\n\n' if cn else '## Five-session ranges (ns) and directions\n\nRanges describe session statistics, not pooled samples.\n\n')
    s+=table(['group','candidate','median min ns','median max ns','p95 min ns','p95 max ns'],[[r['group'],r['candidateId'],*r['medianRangeNs'],*r['p95RangeNs']] for r in repeat['perCandidateRanges']])+'\n'
    s+=table(['group','variant','original / selected min','original / selected max','S1','S2','S3','S4','S5','uncertain'],[[r['group'],r['variant'],*r['ratioRange'],*[x['direction'] for x in r['perSession']],r['uncertain']] for r in repeat['directions']])+'\n'
    s+=('## 分口径内存快照（bytes）\n\nUNAVAILABLE 不等于 0；不把各列相加称物理 GPU 内存。\n\n' if cn else '## Separate memory snapshots (bytes)\n\nUNAVAILABLE is not zero. Do not sum columns as physical GPU memory.\n\n')
    mh=['tokens','round','stage','jsHeapUsedBytes','bufferLiveLogicalBytes','textureLivePayloadBytes','textureStatus']
    s+=table(mh,[[r.get(k) if r.get(k) is not None else 'UNAVAILABLE' for k in mh] for r in data['memoryRows']])+'\n'
    s+=('## 直接引用的公开原始文件\n\n' if cn else '## Directly cited public raw files\n\n')
    s+=table(['JSON','SHA256'],[[link(r['file'],p),r['sha256']] for r in data['evidence']])
    write(p,s)

def shader_annex(lang):
    data=read_json('results/analysis/profile002/shader_classification.json')
    p=target('shader_classification_appendix',lang)
    s=('# 180 个 shader 身份分类附录\n\n源码表达式保留代码原文，标签与置信度保留机器标识符；次数不是时间。\n\n' if lang=='zh-CN' else '# Classification appendix: 180 shader identities\n\nSource expressions remain verbatim code; labels and confidence retain machine identifiers. Counts are not times.\n\n')
    rows=[]
    for r in data['shaders']:
        evidence='; '.join(f"L{x['line']}: {x['text']}" for x in r['sourceEvidence'])
        if lang=='zh-CN':
            evidence=evidence.replace('No conservative rule established an operator class; manual review needed.','现有保守规则未确定类别，需人工审查。')
        rows.append([r['shaderId'],link('results/analysis/profile002/'+r['sourceFile'],p,r['sha256']),','.join(r['entryPoints']),r['encodedDispatches'],r['submittedDispatches'],','.join(x['label'] for x in r['labels']),','.join(x['confidence'] for x in r['labels']),evidence])
    s+=table(['ID','SHA256 / WGSL','entryPoint','encoded','submitted','labels','confidence','source evidence'],rows)
    write(p,s)

def history(lang,m):
    cn=lang=='zh-CN';p=target('experiment_log',lang)
    source=(ROOT/archive_for('experiment_log',m)).read_text(encoding='utf-8')
    sections=re.split(r'^## ',source,flags=re.M)[1:]
    rows=[]
    for n,part in enumerate(sections,1):
        heading,_,body=part.partition('\n')
        ids=list(dict.fromkeys(re.findall(r'\b(?:[A-Z]+\d{3}|PART2[A-Z0-9_-]+|MEMORY002|BASELINE002)\b',heading)))
        dates='; '.join(dict.fromkeys(re.findall(r'20\d\d[- /]\d\d[- /]\d\d',heading))) or '—'
        states=', '.join(dict.fromkeys(re.findall(r'\b(?:NOT_RUN|INCOMPLETE|COMPLETE_WITH_FAILURES|COMPLETE|PARTIAL|PASS|FAIL|UNSUPPORTED|BLOCKED|UNKNOWN|PROTOCOL_PASS_WITH_CONDITION_WARNING)\b',body))) or ('原文叙述' if cn else 'Narrative in original')
        rows.append([n,', '.join(ids) or ('阶段记录' if cn else 'Stage record'),dates,states,link(archive_for('experiment_log',m),p,f'L{source[:source.find(part)].count(chr(10))+1}')])
    return ('\n## 按原文顺序的历史索引\n\n状态列是该历史段出现的标记，可能同时含运行前和运行后状态，不是当前总状态；逐段完整内容以原文为准。\n\n' if cn else '\n## Historical index in original order\n\nStates are markers present in each historical section, potentially including both preparation and execution states, not current overall status. The original preserves every paragraph and table.\n\n')+table(['#','Experiment','Date','Historical markers','Original section'],rows)

def matrix(lang):
    rows=read_json('results/analysis/stage_requirements.json');cn=lang=='zh-CN';p=target('assignment_requirements_matrix',lang)
    assert len(rows)==len(SCOPES_EN)==len(NEXT)
    headers=['Part / PDF页','原文摘要','性质','状态','证据范围与缺口','最小下一步','证据'] if cn else ['Part / PDF page','Original excerpt','Type','Status','Evidence scope and gap','Minimal next step','Evidence']
    return '\n'+table(headers,[[r['part'],r['original'],r['type'],r['status'],r['scope'] if cn else SCOPES_EN[n],NEXT[n][0 if cn else 1],link(r['evidence'],p)] for n,r in enumerate(rows)])

def report(data,lang):
    cn=lang=='zh-CN';p=f'report/{lang}/performance_report.md'
    s=('# 阶段交付报告：部分完成\n\n' if cn else '# Stage delivery report: partially complete\n\n')
    s+=('整体 assignment 与两个 Part 均为 PARTIAL。已在 Mali 完成 stock 模型的三种完整输入长度各五次会话，以及合成 QROW FP16 A–D 的有限 sweep 和五次独立复验。Adreno 未测，真实有效逻辑模型层 shape 未确认；不宣称模型加速。\n\n' if cn else 'The assignment and both Parts remain PARTIAL. On Mali, evidence covers five stock-model sessions at each of three full-input lengths and a bounded sweep plus five independent repeats of synthetic QROW FP16 A–D. Adreno is untested and effective logical model-layer shapes are unconfirmed. No model acceleration is claimed.\n\n')
    s+=link('assignment/webgpu_adreno_assignment.pdf',p,'原始题目' if cn else 'Original assignment')+' · '+link(target('assignment_requirements_matrix',lang),p,'逐项验收范围' if cn else 'Requirement-by-requirement scope')+'\n\n'
    s+=('## Part 1：能测到什么\n\n' if cn else '## Part 1: what is observable\n\n')
    s+=('128/512/1024 都由 sizeInTokens(fullPrompt) 核对，模板计入，每长度五个独立新任务。maxTokens=2048 是总容量；生成 warm-up=0。初始化、生成调用至完成、首次 callback 和 GPU drain 分开。首次 callback 不是纯 prefill，callback 不等于 token。\n\n' if cn else 'sizeInTokens(fullPrompt) verified 128/512/1024 including the template, with five independent fresh tasks per length. maxTokens=2048 is total capacity and generation warm-up is zero. Initialization, generation call-to-completion, first callback, and GPU drain are separate. First callback is not pure prefill, and a callback is not a token.\n\n')
    bs=read_json('results/analysis/baseline002_summary.json')
    rows=[]
    for g in bs['groups']:
        row=[g['inputTokens']]
        for key in ['modelInitializationMs','generationCallToCompletionMs','firstCallbackMs','postGenerationDrainMs']:
            x=g['wallStatisticsMs'][key]; row +=[f"{x['median']:.3f}",f"{x['p95']:.3f}"]
        rows.append(row)
    s+=table(['tokens','init median ms','init p95 ms','generation median ms','generation p95 ms','first callback median ms','first callback p95 ms','drain median ms','drain p95 ms'],rows)+'\n'
    s+=('主表仅展示至 0.001 ms，完整数值保留于共享数据及逐轮附录；显示位数不是测量精度声明。\n\n' if cn else 'The main table displays 0.001 ms precision; complete values remain in shared data and the appendix. Display digits are not a claim of measurement accuracy.\n\n')
    s+=f"![BASELINE002]({rel('report/figures/model_combined_wall.svg',p)})\n\n"
    s+=('这是可观测组合墙钟图，不是可加和 GPU stacked breakdown。真实输出 token、tokens/s、纯 prefill/decode、dispatch/token 与可信 kernel 时间表仍受接口或证据限制。PROFILE002 保留结构；PROFILE003/TIMING002 重叠不能生成独占排名。TRACE001 未找到本机可用执行时间线源。\n\n' if cn else 'This plots observable combined wall time, not an additive GPU stacked breakdown. Actual output tokens, tokens/s, pure prefill/decode, dispatch/token, and trustworthy kernel times remain interface/evidence-limited. PROFILE002 preserves structure; PROFILE003/TIMING002 overlap cannot support exclusive rankings. TRACE001 found no usable execution-timeline source on this phone.\n\n')
    s+=('## 内存：不同口径不相加\n\n' if cn else '## Memory: keep accounting scopes separate\n\n')
    s+=('十五会话分别记录 JS heap、逻辑 buffer 和 texture。MEMORY001 覆盖 7500 个已记录 texture，累计创建 1,707,579,096 bytes、活跃账面峰值 1,707,566,808 bytes（MODEL_INIT）。初始化前 observer 未安装的资源写 UNAVAILABLE，不写零。JS used=10,000,000 bytes 的重复读数不证明没有增长。\n\n' if cn else 'Fifteen sessions separately record JS heap, logical buffers, and textures. MEMORY001 covers 7500 recorded textures, with cumulative creation of 1,707,579,096 bytes and live ledger peak of 1,707,566,808 bytes in MODEL_INIT. Pre-observer resources are UNAVAILABLE, not zero. Repeated JS used=10,000,000-byte readings do not prove absence of growth.\n\n')
    s+=('MEMORY002 v2 是一次 PROTOCOL_PASS_WITH_CONDITION_WARNING，初始化后台切换 5606.1 ms；browser/GPU 进程观察与页面 renderer 映射分开，后者 UNKNOWN。RSS/PSS 不能称为模型独占或物理 GPU 内存，五次进程重复未完成。私有系统原文留在本地忽略目录。\n\n' if cn else 'MEMORY002 v2 is one PROTOCOL_PASS_WITH_CONDITION_WARNING, with 5606.1 ms of background switching during initialization. Browser/GPU observations are distinct from target-renderer mapping, which remains UNKNOWN. RSS/PSS are not model-exclusive or physical GPU memory. Five process repetitions are incomplete; private system originals remain ignored locally.\n\n')
    s+=link(target('memory001_texture_accounting',lang),p)+' · '+link(target('memory002_v2_pilot_results',lang),p)+'\n\n'
    s+=('## Part 2：实现与解释\n\n' if cn else '## Part 2: implementation and interpretation\n\n')
    s+=('矩阵 A/B/C 是输入输出，版本 A/B/C/D 是实现：naive、shared tiled、vec4 tiled、fused QROW dequant。合成 unsigned Q4/Q8 不是 Gemma 原生格式。FP16 accumulator 与 f32 输出 carrier 分开；区分用例得到 2048 而 FP32 为 2050。代表性 M=1/128,K=N=1024 不是真实有效模型层；GEMM004 是执行/padded M=8,K=1536,N=2048 的 FP32 补充。\n\n' if cn else 'Matrices A/B/C are operands/results; implementations A/B/C/D are naive, shared tiled, vec4 tiled, and fused QROW dequantization. Synthetic unsigned Q4/Q8 is not Gemma-native. The FP16 accumulator is distinct from the f32 output carrier; the discriminator produces 2048 versus FP32 2050. Representative M=1/128,K=N=1024 are not effective model layers; GEMM004 is a supplemental FP32 experiment for execution/padded M=8,K=1536,N=2048.\n\n')
    s+=configuration_table(lang)+'\n'+selected_table(lang)+'\n'
    s+=('五会话各候选 10 warm-up、30 measured；共核验 5000 个时间戳和 232985 个导出小输出。大矩阵依据在线全量检查，离线仅独立复算已导出的小输出及记录。绝对时间和同轮比值的完整 125 行见附录，不合并五轮样本成一个 median。\n\n' if cn else 'Each candidate has 10 warm-up and 30 measured passes per session. Verification covers 5000 timestamps and 232985 exported small outputs. Large matrices rely on full online checks; offline recomputation covers exported small outputs and records only. The appendix retains all 125 absolute-time and same-session-ratio rows, without pooling five sessions into one median.\n\n')
    s+=('B 选定相对原配置在四组五轮均改善，却不保证快于 A。M=128 D 两种格式选定配置五轮改善；M=1 D 有负向与反转。Q8 M=128 C 全在一个 65.536 µs 网格内，暂不能区分。Q4 pilot M=1 A/C median 差恰为一个网格，不声称稳定小幅收益。\n\n' if cn else 'Selected B improves over its original configuration in all four groups across five sessions, but need not beat A. Selected M=128 D improves in both formats across five sessions; M=1 D includes regressions and reversals. Q8 M=128 C remains within one 65.536 µs grid and is unresolved. The Q4 pilot M=1 A/C median difference was exactly one grid, not a stable small improvement.\n\n')
    for f in ['kernel_session_medians.svg','kernel_variation.svg']:
        s+=f'![Part 2]({rel("report/figures/"+f,p)})\n\n'
    s+=('五轮只测 prepared-input kernel-only。此前完整路径 pilot 每次 CPU 反量化/布局转换/必要上传：D kernel-only 慢于 C，但完整路径明显更快；不能用于权重一次准备后复用，也不等于模型加速。不能把准备 median 加 kernel median 变成完整路径 median。\n\n' if cn else 'The five repeats measure prepared-input kernel-only. Earlier full-path pilots repeat CPU dequantization/layout conversion/required uploads: D is slower than C kernel-only but substantially faster in full-path wall time. This does not apply to once-prepared reusable weights or demonstrate model acceleration. Preparation and kernel medians cannot be added to obtain the full-path median.\n\n')
    s+=('源码证明共享存储、barrier、vec4 和解包结构；缓存、DRAM 流量、并行度或调度原因仍是假设。名义 2MNK/pass GFLOP/s 不是峰值利用率，有效 GB/s 口径未完成，不填物理流量。\n\n' if cn else 'Source establishes shared storage, barriers, vec4, and unpacking structure; cache, DRAM traffic, parallelism, or scheduling causes remain hypotheses. Nominal 2MNK/pass GFLOP/s is not peak utilization. An effective-GB/s convention is incomplete and physical traffic is not invented.\n\n')
    s+=('## 审阅与复现入口\n\n' if cn else '## Review and reproduction\n\n')
    s+='\n'.join('- '+link(target(n,lang),p,PAGES[n]['title'][0 if cn else 1]) for n in ['reading_guide','part2_compute_contract','measurement_contract','part2_repeat_results','evidence_index','reproduction'])+'\n\n'
    s+=link(target('results_appendix',lang),p,'完整逐轮附录' if cn else 'Complete per-session appendix')+'\n\n'
    s+=('本报告正文模板人工维护，数值表自动读取共享 stage_delivery_data.json；脚本只负责展示。本轮不运行手机、模型或 benchmark。\n' if cn else 'Report prose is manually maintained in the presentation template; numerical tables read shared stage_delivery_data.json automatically. This round runs no phone, model, or benchmark.\n')
    write(p,s)

def render_reports(data=None):
    data=data or read_json('results/analysis/stage_delivery_data.json')
    for lang in LANGS:
        annexes(data,lang);report(data,lang)
    write('report/performance_report.md','# Report / 报告\n\n[中文](zh-CN/performance_report.md) · [English](en/performance_report.md)\n\nOverall assignment: **PARTIAL**. Current report lives in the language directories.\n')

def main():
    m=bootstrap()
    for lang in LANGS:
        for name in PAGES:
            text=append_common(name,lang,m);p=target(name,lang);cn=lang=='zh-CN'
            if name=='assignment_requirements_matrix':text+=matrix(lang)
            if name=='experiment_log':text+=history(lang,m)
            if name in {'part2_sweep_plan','part2_vectorized_c','part2_compute_contract'}:text+='\n'+configuration_table(lang)
            if name in {'part2_sweep_results','part2_repeat_plan'}:text+='\n'+selected_table(lang)
            if name in {'baseline_sessions_results','part2_repeat_results','memory001_texture_accounting'}:
                text+='\n'+link(target('results_appendix',lang),p,'完整逐会话数据附录' if cn else 'Complete session-data appendix')+'\n'
            if name=='profile002_shader_analysis':
                text+='\n'+link(target('shader_classification_appendix',lang),p,'180 项完整分类附录' if cn else 'Complete 180-entry classification appendix')+'\n'
            if name=='reading_guide':
                text+='\n## '+('四个有效 invocation 的映射示例' if cn else 'Mapping example: four valid invocations')+'\n\n'
                text+=table(['id.x','id.y','C index','K=3 expression','result'],[[0,0,0,'1*7+2*9+3*11',58],[1,0,1,'1*8+2*10+3*12',64],[0,1,2,'4*7+5*9+6*11',139],[1,1,3,'4*8+5*10+6*12',154]])+'\n'
                text+='## '+('可点击的两条路线' if cn else 'Two linked routes')+'\n\n'
                text+=('初学：' if cn else 'Beginner: ')+ ' → '.join(link(target(n,lang),p,PAGES[n]['title'][0 if cn else 1]) for n in ['README','glossary','part2_compute_contract','part2_vectorized_c','part2_fused_d','measurement_contract','part2_repeat_results','baseline_sessions_results'])+'\n\n'
                text+=('审阅：' if cn else 'Reviewer: ')+link(f'report/{lang}/performance_report.md',p,'当前报告' if cn else 'Current report')+' → '+' → '.join(link(target(n,lang),p,PAGES[n]['title'][0 if cn else 1]) for n in ['assignment_requirements_matrix','part2_compute_contract','measurement_contract','part2_repeat_results','evidence_index','reproduction'])+'\n'
                text+='\n## '+('实际源码入口' if cn else 'Actual source entry points')+'\n\n'
                for f,entry in [('src/benchmark/gemm_naive.wgsl','main'),('src/benchmark/gemm_math.mjs','inputs / cpuReference / compare'),('src/benchmark/part2_a_f16.wgsl','main — A'),('src/benchmark/part2_b_f16.wgsl','main — B'),('src/benchmark/part2_c_f16.wgsl','main — C'),('src/benchmark/part2_d_f16.wgsl','main — D/Q4'),('src/benchmark/part2_d_q8_f16.wgsl','main — D/Q8'),('src/benchmark/part2_math.mjs','verify / toHalf / fromHalf / pack / unpack'),('src/benchmark/part2_sweep_shader.mjs','generateShader'),('src/baseline/sessions.js','runSession')]:
                    text+='- '+link(f,p,entry+' — '+Path(f).name)+'\n'
            if name=='glossary':
                text+='\n'+table(['Term','解释' if cn else 'Definition'],[
                    ['M / K / N','输出行 / 归约长度 / 输出列' if cn else 'Output rows / reduction length / output columns'],
                    ['row-major','行内连续，索引 row*stride+column' if cn else 'Contiguous rows, indexed row*stride+column'],
                    ['invocation','一次 shader 调用' if cn else 'One shader execution'],
                    ['workgroup','共享组内存储并同步的 invocation 集合' if cn else 'Invocations sharing workgroup storage and synchronization'],
                    ['dispatch','启动工作组网格，不是一次 invocation' if cn else 'Launches a grid of workgroups, not one invocation'],
                    ['tile / barrier','分块 / 组内同步点' if cn else 'Block / workgroup synchronization point'],
                    ['packed / dequant','多个 code 装进 word / 由 code 与元数据恢复近似值' if cn else 'Codes packed into words / reconstruction using codes and metadata'],
                    ['FP16 accumulation','每步累加采用 f16 语义，不只是存储 f16' if cn else 'f16 accumulation semantics at every step, not merely f16 storage']])
            if name=='measurement_contract':
                text+='\n'+table(['Scope','起点' if cn else 'Start','终点' if cn else 'End','不包含' if cn else 'Excluded'],[
                    ['kernel-only','compute pass 开始' if cn else 'Compute pass beginning','compute pass 结束' if cn else 'Compute pass end','创建/上传/reference/输出检查' if cn else 'Creation/upload/reference/output validation'],
                    ['submit-to-completion','queue.submit 前' if cn else 'Before queue.submit','onSubmittedWorkDone 完成' if cn else 'onSubmittedWorkDone completion','时间戳 map 与 CPU 检查' if cn else 'Timestamp map and CPU validation'],
                    ['full-path pilot','必要转换前' if cn else 'Before required conversion','最终 GPU 完成' if cn else 'Final GPU completion','共同初始上传/reference/输出检查' if cn else 'Common initial upload/reference/output validation']])
            if name=='part2_compute_contract':
                text+='\n'+table(['Resource','Type','Logical payload / index'],[
                    ['activation','f16','2*M*K bytes; m*K+k'],['packed Q','u32','4*K*ceil(N/(32/bits)) bytes'],
                    ['scale','f16','2*ceil(K/32)*N bytes; floor(k/32)*N+n'],['zeroPoint','u32','4*ceil(K/32)*N bytes; floor(k/32)*N+n'],
                    ['prepared B16 (A/B)','f16','2*K*N bytes'],['prepared B16 (C)','vec4<f16>','8*K*ceil(N/4) bytes'],
                    ['output','f32 carrier','4*M*N bytes; m*N+n']])+'\n'
                text+=('表内是有效逻辑 payload；GPU 上传按需要补齐对齐字节，额外 padding 单独记录，不改变 q/scale 数值。D 不创建完整 prepared B16。当前 D uniform 实际为 [M,N,K,rowWords] 共 16 bytes；早期 32-byte future schema 是历史草案，不是当前运行绑定。\n' if cn else 'These are logical payloads; uploads add alignment padding where needed and record it separately without changing q/scales. D allocates no complete prepared B16. Current D uses the actual 16-byte uniform [M,N,K,rowWords]; the earlier 32-byte future schema is a historical proposal, not a current binding.')
            if name=='model_preparation':
                text+='\n'+link('assets/models/model_manifest.json',p)+'\n\n[Hugging Face](https://huggingface.co/google/gemma-3n-E2B-it-litert-lm/blob/main/gemma-3n-E2B-it-int4-Web.litertlm)\n'
            if name=='memory001_texture_accounting':
                text+='\n'+table(['format','bytes / texel','creations / session'],[['rgba8uint',4,6],['rgba16uint',8,91],['rgba16float',8,165],['rgba32uint',16,227],['rgba32sint',16,9],['rgba32float',16,2]])+'\n'
                text+=('实际手机记录全部是 2D、单层、单 mip、单 sample；array/3D/multisample 规则仅由离线合成测试核验，不冒充手机观察。生命周期按 sequence 重建，snapshot 时间相同时用已有计数约束；候选前缀 payload 不唯一才写 UNAVAILABLE。\n\n' if cn else 'Actual phone records are all 2D, one layer, one mip, and one sample. Array/3D/multisample rules were checked with offline synthetic tests, not observed on the phone. Lifecycle reconstruction uses sequence order, constraining snapshot ties with existing counters. Ambiguous candidate-prefix payloads would be UNAVAILABLE.\n\n')
                text+='\n[WebGPU texture format definitions](https://www.w3.org/TR/webgpu/#texture-formats)\n\n'+link('results/analysis/memory001_texture_payload.json',p)+' · '+link('scripts/verify_memory001.py',p)+'\n'
            if name=='profiling_capabilities':
                text+='\n## '+('可复查的固定版本入口' if cn else 'Auditable fixed-version entry points')+'\n\n'
                text+=link('src/baseline/runtime_manifest.json',p)+'\n\n'
                text+=table(['Entry','Locator in 0.10.29','测量范围' if cn else 'Measurement scope'],[
                    ['sizeInTokens','genai.d.ts L291–300; bundle offsets57573/43195','完整输入计数，不是输出序列' if cn else 'Full-input count,not generated sequence'],
                    ['generateResponse','genai.d.ts L200–289; JsProgressListener loader L8400','文本/done callback，不是 token 事件' if cn else 'Text/done callbacks,not token events'],
                    ['DECODED_IDS','bundle offset49316','内部线索，未验证公开 hook' if cn else 'Internal lead,no validated public hook'],
                    ['gpuOptions.device','genai.d.ts L535–550; bundle offset45445','公开注入 device，不改变算法' if cn else 'Public device injection,not an algorithm change'],
                    ['createWebGpuDevice','bundle offset46081','stock helper 请求 f16/可用 subgroups 和三项 buffer limits，不请求 timestamp-query' if cn else 'Stock helper requests f16/supported subgroups and three buffer limits,not timestamp-query']])+'\n'
                text+=('bundle offset 是固定 UTF-8 解码文本的字符偏移，不是 byte offset。官方辅助源码 commit 04a9f7634b2800046a477fe60e26edceaa8a8849 不是已证明的 npm 构建 commit；native backend 仍未知。\n\n' if cn else 'Bundle offsets are character offsets in the fixed UTF-8-decoded text,not byte offsets. Auxiliary official commit 04a9f7634b2800046a477fe60e26edceaa8a8849 is not a proven npm build commit; the native backend remains unknown.\n\n')
                text+='[Official auxiliary llm_inference.ts](https://github.com/google-ai-edge/mediapipe/blob/04a9f7634b2800046a477fe60e26edceaa8a8849/mediapipe/tasks/web/genai/llm_inference/llm_inference.ts)\n'
            if name=='part2_compute_contract':
                text+='\n[WGSL floating evaluation](https://www.w3.org/TR/2026/CRD-WGSL-20260703/#floating-point-evaluation) · [fma](https://www.w3.org/TR/2026/CRD-WGSL-20260703/#fma-builtin)\n'
            if name=='documentation_inventory':
                text+='\n'+table(['Category','Original','Chinese','English','Historical SHA256'],[[r['category'],link(r['original'],p),link(r['localized']['zh-CN'],p),link(r['localized']['en'],p),r['sha256']] for r in m['documents']])
            if name=='gemm004_shape_proof':
                digest='ee9a0b2823d07f56fe2e9c50134dbc9c58f9f411dcfc11795869196870dd6036'
                text+='\n## '+('具体实例关联' if cn else 'Concrete instance association')+'\n\n'
                text+=link('results/analysis/profile002/shaders/'+digest+'.wgsl',p,digest)+'\n\n'
                text+=('entryPoint=main；pipeline=shape-pipeline-11990，module=shape-shader-11989。实际关联 submit51672 → command17452 → pass17451 → encode46613。binding3 offset722176、size16 使用 CPU update33496，不取生成结束时 arena 的最终版本45183。\n\n' if cn else 'entryPoint=main; pipeline=shape-pipeline-11990, module=shape-shader-11989. Actual association: submit51672 → command17452 → pass17451 → encode46613. Binding3 offset722176, size16 uses CPU update33496, not final arena version45183 after generation.\n\n')
                text+=('WGSL matrix 索引先取列再取分量；源码 w[0] 等作为输出分量向量，与输入 v.x 等相乘。row-major B scalar 索引为 (4*s+t)*2048+(4*d+c)，packed source scalar 索引为 (s*512+d)*16+t*4+c，byte offset 为其两倍。tid.y 分四路处理 s，组内归约后写各 lane 输出；这不是原 naive 的累加顺序。有效逻辑轴仍未知。\n' if cn else 'WGSL matrix indexing selects a column then a component. Source w[0] and related columns are output-component vectors multiplied by input v.x and related components. Row-major B scalar index is (4*s+t)*2048+(4*d+c); packed source scalar index is (s*512+d)*16+t*4+c, with twice that byte offset. tid.y partitions s four ways before workgroup reduction and lane stores; this is not the naive accumulation order. Effective logical axes remain unknown.\n')
            if name=='memory002_v2_pilot_results':
                v=read_json('results/analysis/memory002_v2_pilot_verification.json')
                text+='\n'+table(['stage','role','PID','PSS KiB','RSS KiB','delta PSS KiB','delta RSS KiB','window ms'],[[r['stage'],x['role'],x['pid'],x['pssKiB'],x['rssKiB'],x['deltaPssKiB'],x['deltaRssKiB'],r['collectionDurationMs']] for r in v['rows'] for x in r['browserGpu']])
                text+='\n'+link('results/analysis/memory002_v2_pilot_verification.json',p)+'\n'
            if name=='evidence_index':
                text+='\n'+link('results/analysis/raw_sha256_manifest.json',p)+' · '+link('results/analysis/stage_delivery_data.json',p)+' · '+link('results/analysis/part2_repeat_summary.json',p)+'\n'
            write(p,text)
        shader_annex(lang)
        write(target('index',lang),'# '+('文档目录' if lang=='zh-CN' else 'Documentation index')+'\n\n'+'\n'.join('- '+link(target(n,lang),target('index',lang),PAGES[n]['title'][LANGS.index(lang)]) for n in PAGES))
    for r in m['documents']:
        if r['original'] in {'README.md','report/performance_report.md'}:continue
        write(r['original'],'# 中文 / English\n\n'+link(r['localized']['zh-CN'],r['original'],'中文')+' · '+link(r['localized']['en'],r['original'],'English')+'\n\n'+link(r['archive'],r['original'],'Historical original / 历史原文')+'\n')
    write('README.md','# mobile-webgpu-gemm\n\nAssignment status: **PARTIAL** · 实测设备 / tested device: **Mali** · Adreno: **NOT_RUN**\n\n[中文项目入口](docs/zh-CN/README.md) · [English project entry](docs/en/README.md)\n\n[中文阅读指南](docs/zh-CN/reading_guide.md) · [English reading guide](docs/en/reading_guide.md)\n\n[中文报告](report/zh-CN/performance_report.md) · [English report](report/en/performance_report.md)\n\nSynthetic QROW experiments do not establish model acceleration.\n')
    write('docs/history/README.md','# Historical originals / 历史原文\n\nThese byte-preserved pre-reorganization snapshots retain all historical paragraphs, failures, states, tables, and original links. They are archival evidence, not current navigation or authoritative translations.\n\n这些整理前快照按字节保留历史段落、失败、状态、表格和旧链接；它们是历史证据，不是当前导航或权威译文。\n\n[中文时间线](../zh-CN/experiment_log.md) · [English timeline](../en/experiment_log.md)\n')
    render_reports()
    print(f'Rendered {len(PAGES)} paired authored pages, shared-data appendices, and bilingual reports; preserved {len(m["documents"])} originals.')

if __name__=='__main__':main()
