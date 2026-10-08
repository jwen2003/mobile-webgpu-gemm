"""Document/figure consistency and immutability checks. No phone access."""
from pathlib import Path
import hashlib,json,re,xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
def check():
    manifest=json.loads((ROOT/'results/analysis/raw_sha256_manifest.json').read_text(encoding='utf-8'))
    for p,h in manifest['files'].items():
        assert hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==h,p
    data=json.loads((ROOT/'results/analysis/stage_delivery_data.json').read_text(encoding='utf-8'))
    for e in data['evidence']:
        assert hashlib.sha256((ROOT/e['file']).read_bytes()).hexdigest()==e['sha256']
    assert data['status']=='PARTIAL' and data['verification']['baselineSessions']==15
    assert len(data['baseline'])==15 and len(data['kernelRows'])==125
    assert len(set(r['session'] for r in data['kernelRows']))==5
    assert all(r['count']==30 and r['zeroCount']==0 for r in data['kernelRows'])
    requirements=json.loads((ROOT/'results/analysis/stage_requirements.json').read_text(encoding='utf-8'))
    assert set(r['status'] for r in requirements)=={'COMPLETE','PARTIAL','BLOCKED','NOT_RUN'}
    for r in requirements:assert (ROOT/r['evidence']).exists(),r['evidence']
    docs=['report/performance_report.md','docs/assignment_requirements_matrix.md',
          'report/zh-CN/performance_report.md','report/en/performance_report.md',
          'docs/zh-CN/assignment_requirements_matrix.md','docs/en/assignment_requirements_matrix.md']
    links=0
    for name in docs:
        p=ROOT/name;s=p.read_text(encoding='utf-8')
        for link in re.findall(r'\]\(([^)]+)\)',s):
            if '://' in link or link.startswith('#'):continue
            link=link.split('#')[0]
            assert (p.parent/link).exists(),(name,link)
            links+=1
    figures=[]
    for name in ['model_combined_wall.svg','kernel_session_medians.svg','kernel_variation.svg']:
        p=ROOT/'report/figures'/name;tree=ET.parse(p);r=tree.getroot()
        assert r.tag.endswith('svg')
        text=' '.join(t.text or '' for t in r.iter() if t.tag.endswith('text'))
        assert ('BASELINE002' in text if name.startswith('model') else 'Part 2' in text)
        assert 'Source:' in text
        figures.append(dict(file=p.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
    result=dict(status='PASS',historicalRawHashesChecked=len(manifest['files']),relativeLinksChecked=links,
                baselineSessions=15,part2Sessions=5,candidateSessionRows=125,figures=figures,
                figureQA='SVG parse,labels,data provenance and layout bounds reviewed;browser visual preview unavailable (tool initialization failed)',
                noNewExperiment=True,limits='No physical GPU memory,real generated-token/phase or additive GPU breakdown claim')
    output=ROOT/'results/documentation'
    output.mkdir(parents=True,exist_ok=True)
    (output/'stage_delivery_checks.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print('PASS: raw hashes,125 candidate-session rows,requirement statuses,document links and3 SVG figures')
if __name__=='__main__':check()
