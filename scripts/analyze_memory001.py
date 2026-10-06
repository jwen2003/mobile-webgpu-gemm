"""MEMORY001: offline explicit-lifecycle texture ledger; never physical residency."""
import json, hashlib, math
from pathlib import Path
from collections import Counter

FORMATS = {'rgba8uint': 4, 'rgba16uint': 8, 'rgba16float': 8,
           'rgba32uint': 16, 'rgba32sint': 16, 'rgba32float': 16}
SOURCES = ['https://www.w3.org/TR/webgpu/#plain-color-formats',
           'https://www.w3.org/TR/webgpu/#logical-miplevel-specific-texture-extent',
           'https://raw.githubusercontent.com/gpuweb/gpuweb/main/spec/index.bs']

def payload(r):
    required = ['format', 'dimension', 'width', 'height', 'depthOrArrayLayers', 'mipLevelCount', 'sampleCount']
    if any(k not in r for k in required): return {'status': 'UNAVAILABLE', 'reason': 'Missing descriptor field'}
    if r['format'] not in FORMATS: return {'status': 'UNAVAILABLE', 'reason': 'Unmapped format'}
    if r['dimension'] not in ['1d', '2d', '3d']: return {'status': 'UNAVAILABLE', 'reason': 'Invalid dimension'}
    if any(type(r[k]) is not int or r[k] <= 0 for k in required[2:]): return {'status': 'UNAVAILABLE', 'reason': 'Invalid extent/count'}
    if r['dimension']=='1d' and (r['height']!=1 or r['depthOrArrayLayers']!=1): return {'status':'UNAVAILABLE','reason':'Invalid 1d extent'}
    levels=[]
    for i in range(r['mipLevelCount']):
        w=max(1,r['width']//(2**i))
        h=1 if r['dimension']=='1d' else max(1,r['height']//(2**i))
        d=max(1,r['depthOrArrayLayers']//(2**i)) if r['dimension']=='3d' else r['depthOrArrayLayers']
        levels.append({'level':i,'extent':[w,h,d],'payloadBytes':w*h*d*FORMATS[r['format']]*r['sampleCount']})
    return {'status':'AVAILABLE','bytes':sum(x['payloadBytes'] for x in levels),'levels':levels}

def analyze(raw):
    resources=raw['memory']['logicalResources']['resources']
    textures=[r for r in resources if r['kind']=='texture']
    derived=[dict(id=r['id'],format=r.get('format'),payload=payload(r)) for r in textures]
    byid={x['id']:x['payload'] for x in derived}
    failures=[]; events=[]
    for r in resources:
        for k in ['createdSequence','createdWallMs','createdPhase','destroyed']:
            if k not in r: failures.append(r['id']+': missing '+k)
        if any(k not in r for k in ['createdSequence','createdWallMs','createdPhase','destroyed']): continue
        events.append((r['createdSequence'],r['createdWallMs'],r['createdPhase'],1,r))
        if r['destroyed'] is True:
            if not all(k in r for k in ['destroyedSequence','destroyedWallMs','destroyedPhase']): failures.append(r['id']+': incomplete destroy');continue
            events.append((r['destroyedSequence'],r['destroyedWallMs'],r['destroyedPhase'],-1,r))
        elif r['destroyed'] is not False: failures.append(r['id']+': invalid destroyed flag')
    events.sort(key=lambda e:e[0])
    if len({e[0] for e in events})!=len(events): failures.append('Duplicate event sequence')
    if any(a[1]>b[1] for a,b in zip(events,events[1:])): failures.append('Nonmonotonic event time')
    observer=raw['memory']['logicalResources']['snapshot']
    if observer['droppedMetadata'] or observer['coverageFailures']: failures.append('Observer missing coverage')
    # Prefix states include original partial-map counters, used to disambiguate rounded wall clocks.
    states=[]; active=set(); full=0; known=0; unknown=0; created=0; destroyed=0; unknowncreated=0; peak=0; peakphase=None
    def state(): return dict(full=full,known=known,unknown=unknown,created=created,destroyed=destroyed,unknowncreated=unknowncreated)
    states.append(state())
    for seq,wall,phase,sign,r in events:
        if sign==1:
            if r['id'] in active: failures.append('Duplicate live resource')
            active.add(r['id'])
        else:
            if r['id'] not in active: failures.append('Destroy without live resource')
            active.discard(r['id'])
        if r['kind']=='texture':
            p=byid[r['id']]
            if p['status']=='AVAILABLE': full+=sign*p['bytes']
            old=r.get('logicalBytes')
            if old is None:
                unknown+=sign
                if sign==1: unknowncreated+=1
            else:
                known+=sign*old
                if sign==1: created+=old
                else: destroyed+=old
            if full>peak: peak=full;peakphase=phase
        states.append(state())
    uncovered=[x for x in derived if x['payload']['status']!='AVAILABLE']
    snapshots=[]
    for snap in raw['memory']['snapshots']:
        old=snap.get('logical',{}).get('textures')
        if old is None:
            snapshots.append({'stage':snap['stage'],'status':'UNAVAILABLE','reason':'Observer not installed / no resource snapshot'});continue
        candidates=[]
        for i,st in enumerate(states):
            lower=events[i-1][1] if i else -math.inf
            upper=events[i][1] if i<len(events) else math.inf
            if lower<=snap['wallMs']<=upper and all(st[k]==old[v] for k,v in [('known','knownFormatCurrentLogicalBytes'),('unknown','unknownFormatLiveCount'),('created','createdKnownFormatBytes'),('destroyed','explicitDestroyedKnownFormatBytes'),('unknowncreated','unknownFormatCreatedCount')]): candidates.append(st['full'])
        unique=set(candidates)
        valid=len(unique)==1 and not failures and not uncovered
        snapshots.append({'stage':snap['stage'],'status':'AVAILABLE' if valid else 'UNAVAILABLE','knownSubtotalBytes':min(unique) if unique else None,'payloadBytes':next(iter(unique)) if valid else None,'candidatePayloads':sorted(unique),'reason':None if valid else 'Missing coverage or ambiguous snapshot boundary','scope':'Explicit destroy ledger; device-close/implicit release not represented'})
    valid=not uncovered and not failures
    return {'session':raw['session'],'formatCounts':dict(Counter(r['format'] for r in textures)),
      'textureCount':len(textures),'coveredTextureCount':len(textures)-len(uncovered),'resources':derived,
      'uncovered':uncovered,'lifecycleErrors':failures,'status':'AVAILABLE' if valid else 'UNAVAILABLE',
      'cumulativeCreatedKnownSubtotalBytes':sum(x['payload'].get('bytes',0) for x in derived),
      'cumulativeCreatedPayloadBytes':sum(x['payload']['bytes'] for x in derived) if valid else None,
      'activeLedgerPeakKnownSubtotalBytes':peak,'activeLedgerPeakPayloadBytes':peak if valid else None,'peakPhase':peakphase,'snapshots':snapshots}

def main():
    manifest=json.loads(Path('results/analysis/raw_sha256_manifest.json').read_text(encoding='utf-8'))
    for path,digest in manifest['files'].items(): assert hashlib.sha256(Path(path).read_bytes()).hexdigest()==digest,path
    sessions=[]
    for path in sorted(Path('results/raw').glob('BASELINE002-*.json')):
        result=analyze(json.loads(path.read_text(encoding='utf-8')));result['rawFile']=path.as_posix();result['rawSha256']=hashlib.sha256(path.read_bytes()).hexdigest();sessions.append(result)
    out={'experimentId':'MEMORY001','sourceAccessDate':'2026-10-06','sources':SOURCES,'bytesPerTexel':FORMATS,'scope':'Observed stock device explicit resource lifecycle only; no physical residency, upload row padding, driver allocation, worker/other-device coverage or implicit release accounting','historicalHashCount':len(manifest['files']),'sessions':sessions}
    Path('results/analysis/memory001_texture_payload.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('MEMORY001:',len(sessions),'sessions;',sum(x['coveredTextureCount'] for x in sessions),'covered textures; history hashes',len(manifest['files']))
if __name__=='__main__': main()
