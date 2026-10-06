"""Independent mip volume and live-set audit of MEMORY001 derivatives."""
import json, hashlib
from pathlib import Path
from analyze_memory001 import payload, analyze

def independent_bytes(r):
    # Component-width definition, independently of analyzer's bytes table.
    bits={'rgba8uint':8,'rgba16uint':16,'rgba16float':16,'rgba32uint':32,'rgba32sint':32,'rgba32float':32}[r['format']]
    volume=0
    for level in range(r['mipLevelCount']):
        extent=[max(1,r['width']>>level),1,1]
        if r['dimension']!='1d': extent[1]=max(1,r['height']>>level)
        if r['dimension']=='2d': extent[2]=r['depthOrArrayLayers']
        if r['dimension']=='3d': extent[2]=max(1,r['depthOrArrayLayers']>>level)
        volume+=extent[0]*extent[1]*extent[2]
    return volume*4*bits//8*r['sampleCount']

def main():
    base=dict(format='rgba8uint',dimension='2d',width=8,height=4,depthOrArrayLayers=3,mipLevelCount=3,sampleCount=1)
    assert payload(base)['bytes']==504  # (32+8+2)*3*4
    assert payload(dict(base,dimension='3d'))['bytes']==424 # (96+8+2)*4
    assert payload(dict(base,sampleCount=4))['bytes']==2016
    assert payload(dict(base,dimension='1d',height=1,depthOrArrayLayers=1))['bytes']==56
    assert payload(dict(base,width=7,height=5))['bytes']==(35+6+1)*3*4
    assert payload(dict(base,format='UNKNOWN'))['status']=='UNAVAILABLE'
    for field in base:
        missing=base.copy();del missing[field];assert payload(missing)['status']=='UNAVAILABLE'
    for fmt,bpp in [('rgba32uint',16),('rgba32sint',16),('rgba16uint',8),('rgba16float',8),('rgba8uint',4),('rgba32float',16)]:
        assert payload(dict(base,format=fmt,width=1,height=1,depthOrArrayLayers=1,mipLevelCount=1))['bytes']==bpp
    out=json.loads(Path('results/analysis/memory001_texture_payload.json').read_text(encoding='utf-8'))
    checks=[]
    for session in out['sessions']:
        path=Path(session['rawFile']);assert hashlib.sha256(path.read_bytes()).hexdigest()==session['rawSha256']
        raw=json.loads(path.read_text(encoding='utf-8'));textures=[r for r in raw['memory']['logicalResources']['resources'] if r['kind']=='texture']
        sizes={r['id']:independent_bytes(r) for r in textures}
        assert all(sizes[x['id']]==x['payload']['bytes'] for x in session['resources'])
        assert sum(sizes.values())==session['cumulativeCreatedPayloadBytes']
        events=[]
        for r in textures:
            events.append((r['createdSequence'],True,r))
            if r['destroyed']: events.append((r['destroyedSequence'],False,r))
        live={};peak=0;phase=None
        for seq,create,r in sorted(events):
            if create: live[r['id']]=sizes[r['id']]
            else: del live[r['id']]
            current=sum(live.values())
            if current>peak:peak=current;phase=r['createdPhase']
        assert peak==session['activeLedgerPeakPayloadBytes'] and phase==session['peakPhase']
        assert session['status']=='AVAILABLE' and not session['uncovered']
        for snap in session['snapshots']:
            if snap['stage'] in ['BEFORE_RUNTIME','BEFORE_INIT']:assert snap['status']=='UNAVAILABLE';continue
            assert snap['status']=='AVAILABLE',snap
            wall=next(s['wallMs'] for s in raw['memory']['snapshots'] if s['stage']==snap['stage'])
            # Conservative timing bounds independent of analyzer's prefix selection.
            lo=sum(sizes[r['id']] for r in textures if r['createdWallMs']<wall and (not r['destroyed'] or r['destroyedWallMs']>wall))
            hi=sum(sizes[r['id']] for r in textures if r['createdWallMs']<=wall and (not r['destroyed'] or r['destroyedWallMs']>=wall))
            assert lo<=snap['payloadBytes']<=hi
        broken=json.loads(json.dumps(raw));del next(r for r in broken['memory']['logicalResources']['resources'] if r['kind']=='texture')['destroyed']
        assert analyze(broken)['status']=='UNAVAILABLE'
        checks.append({'rawFile':session['rawFile'],'status':'PASS','textures':len(textures),'cumulativeBytes':sum(sizes.values()),'peakBytes':peak})
    manifest=json.loads(Path('results/analysis/raw_sha256_manifest.json').read_text(encoding='utf-8'))
    for path,digest in manifest['files'].items():assert hashlib.sha256(Path(path).read_bytes()).hexdigest()==digest
    result={'experimentId':'MEMORY001','status':'PASS','checks':checks,'tests':'Independent channel-bit widths, right-shift mip volume, live-ID-set peak, snapshot timing bounds; array/3d/nonpower/multisample/1d/missing fields/unknown format/missing lifecycle tests','historicalHashesVerified':len(manifest['files'])}
    Path('results/analysis/memory001_verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print('PASS',len(checks),'sessions;',len(manifest['files']),'historical hashes')
if __name__=='__main__': main()
