"""Pure parsing/attribution helpers: uncertainty stays explicit."""
import re

def meminfo(text,pid,name):
    totals=re.search(r'TOTAL PSS:\s*(\d+)\s+TOTAL RSS:\s*(\d+)',text)
    header=re.search(r'\*\* MEMINFO in pid (\d+) \[(.*?)\]',text)
    valid=bool(totals and header and int(header[1])==pid and header[2]==name)
    return {'status':'AVAILABLE' if valid else 'UNAVAILABLE','pssKiB':int(totals[1]) if valid else None,'rssKiB':int(totals[2]) if valid else None,'identityConsistent':valid,'reportedUnit':'KB (1024 bytes)','meminfoUnavailableReason':None if valid else 'Missing totals or PID/name identity mismatch'}

def start_ticks(text):
    # /proc/PID/stat field 22; comm may contain spaces or parentheses.
    try:return int(text[text.rindex(')')+1:].split()[19])
    except (ValueError,IndexError):return None

def classify_phase(before,after):
    def state(metadata):
        targets=metadata.get('targets',[])
        return targets[0].get('stageMetadata') if len(targets)==1 else None
    a,b=state(before),state(after)
    if not a or not b or not a.get('enabled') or not b.get('enabled'):return 'UNAVAILABLE'
    if a['sessionId']!=b['sessionId']:return 'MIXED_SESSION'
    if a['history']!=b['history'] or a['stage']!=b['stage']:return 'MIXED_PHASE'
    return a['stage']

def role_for(pid,before,after,stable_identity):
    if not stable_identity:return ('UNKNOWN','PID lifetime not verified')
    if before.get('status','CONNECTED')!='CONNECTED' or after.get('status','CONNECTED')!='CONNECTED':return ('UNKNOWN','Contemporaneous metadata check failed')
    a=[p['type'].lower() for p in before.get('processes',[]) if p['pid']==pid]
    b=[p['type'].lower() for p in after.get('processes',[]) if p['pid']==pid]
    if len(a)!=1 or a!=b:return ('UNKNOWN','No consistent fresh before/after CDP process evidence')
    if a[0]=='browser':return ('BROWSER_MAIN','Fresh before/after SystemInfo.getProcessInfo')
    if a[0]=='gpu':return ('GPU','Fresh before/after SystemInfo.getProcessInfo')
    if a[0]=='renderer':return ('RENDERER_TARGET_UNKNOWN','CDP renderer role known; target-to-OS-PID mapping unproven')
    return ('UNKNOWN','CDP type '+a[0])
