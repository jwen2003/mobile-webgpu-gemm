"""Read-only source/evidence validation plus separate documentation QA output.

No existing verification record, original JSON, model, or phone is touched.
"""
from pathlib import Path
import ast, hashlib, json, re, subprocess
from urllib.parse import unquote
from documentation_content import PAGES

ROOT=Path(__file__).resolve().parents[1]

def anchors(text):
    # GitHub-style heading slugs; no authored current links depend on duplicate slugs.
    out=set()
    for h in re.findall(r'^#{1,6}\s+(.+)$',text,re.M):
        h=re.sub(r'[`*_]','',h).lower()
        h=re.sub(r'[^\w\-\s]','',h).replace(' ','-')
        out.add(h)
    out.update(re.findall(r'<a\s+(?:id|name)=["\']([^"\']+)',text))
    return out

def main():
    m=json.loads((ROOT/'docs/documentation_manifest.json').read_text(encoding='utf-8'))
    # Keep checking the recorded pre-migration baseline after this documentation is committed.
    subprocess.check_call(['git','-c','safe.directory=C:/Projects/mobile-webgpu-gemm','merge-base','--is-ancestor',m['sourceCommit'],'HEAD'],cwd=ROOT)
    for r in m['documents']:
        assert hashlib.sha256((ROOT/r['archive']).read_bytes()).hexdigest()==r['sha256'],r['archive']
        for lang in ['zh-CN','en']:assert (ROOT/r['localized'][lang]).exists(),r
    for p,h in m['protectedFiles'].items():
        assert hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==h,p
    for name in PAGES:
        for lang in ['zh-CN','en']:
            p=ROOT/f'docs/{lang}/{name}.md';s=p.read_text(encoding='utf-8')
            assert len(s)>450,(name,lang)
            if lang=='en':assert not re.search(r'[\u4e00-\u9fff]',s),(name,'Chinese in English prose')
    docs=list((ROOT/'docs/zh-CN').glob('*.md'))+list((ROOT/'docs/en').glob('*.md'))+list((ROOT/'report/zh-CN').glob('*.md'))+list((ROOT/'report/en').glob('*.md'))
    docs += [ROOT/r['original'] for r in m['documents']]
    count=0
    for p in docs:
        text=p.read_text(encoding='utf-8')
        for raw in re.findall(r'\]\(([^)]+)\)',text):
            if re.match(r'\w+://',raw):continue
            raw=raw.strip('<>');path,sep,fragment=raw.partition('#')
            path=unquote(path.split('?')[0]);dest=(p.parent/path).resolve() if path else p
            assert dest.exists(),(p.relative_to(ROOT),raw)
            if fragment and dest.suffix=='.md':assert unquote(fragment) in anchors(dest.read_text(encoding='utf-8')),(p,raw)
            count+=1
    # Numeric tables in paired reports/appendices are literally shared, not translated computations.
    for folder,name in [('report','performance_report'),('docs','results_appendix'),('docs','shader_classification_appendix'),('docs','part2_compute_contract'),('docs','memory002_v2_pilot_results')]:
        texts=[(ROOT/f'{folder}/{lang}/{name}.md').read_text(encoding='utf-8') for lang in ['zh-CN','en']]
        rows=[]
        for s in texts:
            numeric=[]
            for line in s.splitlines():
                if line.startswith('|') and re.search(r'\d',line):
                    # Table URLs differ by language only for localized navigation, not data.
                    numeric.append(re.findall(r'(?<![\w])[-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?',line))
            rows.append(numeric)
        assert rows[0]==rows[1],('paired table numeric mismatch',name)
    # Confirm the numerical report pipeline and shader classification algorithm stayed unchanged.
    for filename,stop in [('scripts/build_stage_report.py','def build_report('),('scripts/analyze_profile002_shaders.py',"(ROOT / 'docs/profile002_shader_analysis.md').write_text")]:
        old=subprocess.check_output(['git','-c','safe.directory=C:/Projects/mobile-webgpu-gemm','show',m['sourceCommit']+':'+filename],cwd=ROOT).decode('utf-8')
        new=(ROOT/filename).read_text(encoding='utf-8')
        oldprefix=old[:old.index(stop)]
        newstop=stop if stop in new else '# Publish bilingual presentation'
        newprefix=new[:new.index(newstop)]
        assert ast.dump(ast.parse(oldprefix))==ast.dump(ast.parse(newprefix)),filename
    # No tracked compute/evidence change is allowed; only Markdown and three presentation scripts.
    changed=subprocess.check_output(['git','-c','safe.directory=C:/Projects/mobile-webgpu-gemm','diff','--name-only'],cwd=ROOT,text=True).splitlines()
    allowed={'scripts/build_stage_report.py','scripts/analyze_profile002_shaders.py','scripts/check_stage_delivery.py'}
    assert all(p.endswith('.md') or p in allowed for p in changed),changed
    result=dict(status='PASS',originalDocuments=len(m['documents']),pairedAuthoredPages=len(PAGES),
                protectedFilesChecked=len(m['protectedFiles']),currentMarkdownFilesChecked=len(docs),relativeLinksChecked=count,
                pairedNumericalTables='IDENTICAL',computeAndVerificationAlgorithms='UNCHANGED',
                archivePolicy='Historical Markdown retains original bytes/links and is excluded from current navigation checks',
                humanReview='Edited prose and reviewed source boundaries; no claim of manual line-by-line review of every historical archive',
                noPhoneModelBenchmark=True,noCommitPush=True)
    out=ROOT/'results/documentation';out.mkdir(parents=True,exist_ok=True)
    (out/'bilingual_checks.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result,indent=2))

if __name__=='__main__':main()
