"""Static SVG figures from verified stage data using ReportLab LinePlot."""
from pathlib import Path
import json
from reportlab.graphics.shapes import Drawing, String, Line, Rect
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics import renderSVG
from reportlab.lib.colors import HexColor

ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'results/analysis/stage_delivery_data.json').read_text(encoding='utf-8'))
OUT=ROOT/'report/figures'; OUT.mkdir(exist_ok=True)
COLORS=['#2563eb','#16a34a','#f97316','#dc2626','#0891b2','#9333ea','#64748b']

def panel(d,x,y,w,h,title,series,labels,ymax=None):
    d.add(String(x,y+h-12,title,fontName='Helvetica-Bold',fontSize=12))
    chart=LinePlot();chart.x=x+52;chart.y=y+45;chart.width=w-65;chart.height=h-108
    chart.data=series;chart.joinedLines=1
    chart.xValueAxis.valueMin=1;chart.xValueAxis.valueMax=5;chart.xValueAxis.valueSteps=[1,2,3,4,5]
    chart.yValueAxis.valueMin=0
    maximum=max(v for row in series for _,v in row) if ymax is None else ymax
    chart.yValueAxis.valueMax=maximum*1.12 if maximum else 1
    chart.yValueAxis.labels.fontSize=8;chart.xValueAxis.labels.fontSize=9
    for i in range(len(series)):
        chart.lines[i].strokeColor=HexColor(COLORS[i%len(COLORS)])
        chart.lines[i].strokeWidth=1.4
    d.add(chart)
    d.add(String(x+8,y+h-45,'ms',fontSize=9))
    d.add(String(x+w/2-45,y+22,'Independent session',fontSize=9))
    for i,name in enumerate(labels):
        xx=x+52+(i%3)*(w-70)/3; yy=y+h-30-(i//3)*13
        d.add(Line(xx,yy,xx+14,yy,strokeColor=HexColor(COLORS[i%len(COLORS)]),strokeWidth=2))
        d.add(String(xx+18,yy-3,name,fontSize=8))

def save(d,name):
    renderSVG.drawToFile(d,str(OUT/name))
    p=OUT/name
    p.write_bytes(p.read_bytes().replace(b'\r\n',b'\n'))

d=Drawing(1050,530)
d.add(Rect(0,0,1050,530,fillColor=HexColor('#ffffff'),strokeColor=None))
d.add(String(28,505,'BASELINE002: combined wall boundaries, five sessions per full prompt length',fontName='Helvetica-Bold',fontSize=15))
for j,(key,title) in enumerate([('modelInitializationMs','Model initialization'),('generationCallToCompletionMs','Generation call to completion'),('firstCallbackMs','First callback (not pure prefill)')]):
    series=[[(r['round'],r[key]) for r in data['baseline'] if r['tokens']==t] for t in [128,512,1024]]
    panel(d,20+j*340,80,330,390,title,series,['128 tokens','512 tokens','1024 tokens'])
d.add(String(28,48,'Wall time only; initialization excluded from generation. Lines show recorded sessions, not GPU time or token latency.',fontSize=10))
d.add(String(28,28,'Source: stage_delivery_data.json / 15 original BASELINE002 records. Five-sample p95 equals maximum; see report tables.',fontSize=9))
save(d,'model_combined_wall.svg')

d=Drawing(1150,880);d.add(Rect(0,0,1150,880,fillColor=HexColor('#ffffff'),strokeColor=None))
d.add(String(28,850,'Part 2: per-session kernel-only GPU pass medians (synthetic QROW)',fontName='Helvetica-Bold',fontSize=16))
for j,(bits,m) in enumerate([(4,1),(4,128),(8,1),(8,128)]):
    rows=[r for r in data['kernelRows'] if r['bits']==bits and r['M']==m]
    ids=sorted(set(r['candidate'] for r in rows))
    series=[[(r['session'],r['median']/1e6) for r in rows if r['candidate']==cid] for cid in ids]
    panel(d,20+(j%2)*565,100+(1-j//2)*350,550,335,f'Q{bits}; M={m}, K=N=1024',series,ids)
d.add(String(28,60,'Every trace is one fixed candidate across five independent sessions; original and selected configs are both retained.',fontSize=10))
d.add(String(28,40,'65.536 us timestamp grid; zero/tail samples retained. Prepared weights for ABC; fused dequant included in D.',fontSize=10))
d.add(String(28,20,'Mali evidence only. No real logical layer-shape / Adreno / model-speedup claim. Source: stage_delivery_data.json.',fontSize=9))
save(d,'kernel_session_medians.svg')

d=Drawing(1150,1120);d.add(Rect(0,0,1150,1120,fillColor=HexColor('#ffffff'),strokeColor=None))
d.add(String(28,1090,'Part 2 cross-session variation: individual medians and p95 (no sample pooling)',fontName='Helvetica-Bold',fontSize=16))
for j,(bits,m) in enumerate([(4,1),(4,128),(8,1),(8,128)]):
    x=25+(j%2)*565; y=100+(1-j//2)*455
    rows=[r for r in data['kernelRows'] if r['bits']==bits and r['M']==m];ids=sorted(set(r['candidate'] for r in rows))
    xmax=max(r['p95']/1e6 for r in rows)*1.07
    d.add(String(x,y+425,f'Q{bits}; M={m}, K=N=1024',fontName='Helvetica-Bold',fontSize=13))
    left=x+140;width=380
    for i,cid in enumerate(ids):
        yy=y+380-i*43;rr=[r for r in rows if r['candidate']==cid]
        d.add(String(x,yy-3,cid,fontSize=9))
        mm=[r['median']/1e6 for r in rr];pp=[r['p95']/1e6 for r in rr]
        d.add(Line(left+min(mm)/xmax*width,yy,left+max(mm)/xmax*width,yy,strokeColor=HexColor('#2563eb'),strokeWidth=3))
        d.add(Line(left+min(pp)/xmax*width,yy-10,left+max(pp)/xmax*width,yy-10,strokeColor=HexColor('#f97316'),strokeWidth=2))
        for v in mm:d.add(Rect(left+v/xmax*width-1.5,yy-2,3,4,fillColor=HexColor('#2563eb'),strokeColor=None))
        for v in pp:d.add(Rect(left+v/xmax*width-1.5,yy-12,3,4,fillColor=HexColor('#f97316'),strokeColor=None))
    d.add(Line(left,y+55,left+width,y+55,strokeColor=HexColor('#64748b')))
    for tick in range(6):
        xx=left+tick/5*width;d.add(Line(xx,y+51,xx,y+59,strokeColor=HexColor('#64748b')))
        d.add(String(xx-10,y+37,f'{tick/5*xmax:.1f}',fontSize=9))
    d.add(String(left+150,y+18,'GPU pass ms',fontSize=10))
d.add(String(28,65,'Blue: five session medians and their min-max range. Orange: five session p95 and their min-max range.',fontSize=11))
d.add(String(28,43,'These are observed ranges, not confidence intervals. Each p95 is nearest-rank of 30 measured passes in that session.',fontSize=10))
d.add(String(28,22,'Source: stage_delivery_data.json. Readback/CPU checks and input preparation excluded from GPU timestamps.',fontSize=9))
save(d,'kernel_variation.svg')
print('Created 3 SVG figures from verified data (ReportLab; no new measurements).')
