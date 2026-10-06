"""Read-only adb memory snapshot. Never launches a model/page or root command.
Raw inventories are private/local and ignored by Git. Phase is operator-supplied,
not inferred from process names. Optional MEMORY002 checks only project stage
metadata and process roles through owned, automatically removed loopback tunnels.
"""
import argparse, datetime, hashlib, json, re, subprocess, time
import urllib.request
from pathlib import Path
from memory002_parse import meminfo, start_ticks, classify_phase, role_for

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--phase',required=True,choices=['INTERFACE_PROBE','PAGE_IDLE','AFTER_INIT','BEFORE_GENERATION','GENERATION','AFTER_DRAIN'])
    parser.add_argument('--memory002',action='store_true',help='Fresh bounded metadata checks before/after capture; both tunnels automatically removed. No model launch.')
    parser.add_argument('--roles-only',action='store_true',help='Skip timed-out page JS stage query; retain fresh CDP process checks. Stage verification remains UNAVAILABLE.')
    parser.add_argument('--arm-generation',action='store_true',help='Prepare metadata first, then wait for ENTER after operator starts generation. No automatic phone action.')
    parser.add_argument('--protocol',action='store_true',help='Require v2 server/session handshake and mandatory idle receipt; no legacy operator-label acceptance.')
    parser.add_argument('--legacy-pilot',action='store_true',help='Explicitly unqualified diagnostic mode only; never formal capture or initialization receipt.')
    parser.add_argument('--serial',help='Optional explicit device; otherwise exactly one authorized device required')
    parser.add_argument('--session',default='UNKNOWN')
    parser.add_argument('--adb',default=r'C:\Tools\platform-tools\platform-tools\adb.exe')
    args=parser.parse_args(); start=time.perf_counter()
    if args.memory002 and not args.protocol and not args.legacy_pilot:parser.error('MEMORY002 formal capture requires --protocol; legacy diagnostics require explicit --legacy-pilot and remain UNQUALIFIED')
    if args.arm_generation and (not args.memory002 or not args.roles_only or args.phase!='GENERATION'):
        parser.error('--arm-generation requires --memory002 --roles-only --phase GENERATION')
    if args.protocol and (not args.memory002 or not args.roles_only or args.session=='UNKNOWN'):parser.error('--protocol requires --memory002 --roles-only and actual --session UUID')
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    directory=Path('results/local/adb_memory')/stamp;directory.mkdir(parents=True)
    commands=[]
    def control(op,data):
        request=urllib.request.Request('http://127.0.0.1:8000/__memory002/'+op,data=json.dumps({'sessionId':args.session,**data}).encode(),headers={'Content-Type':'application/json'},method='POST')
        with urllib.request.urlopen(request,timeout=5) as response:return json.loads(response.read())
    protocol_state=control('state',{}) if args.protocol else None
    if args.protocol:
        if not protocol_state['markers']:raise SystemExit('Page marker not received;formal capture blocked')
        if args.phase!='PAGE_IDLE' and not protocol_state['idleAccepted']:raise SystemExit('Mandatory PAGE_IDLE receipt missing;formal capture blocked')
    def run(name,argv,device=True):
        command=[args.adb]+(['-s',serial] if device else [])+argv
        utc=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.perf_counter()
        try:
            p=subprocess.run(command,capture_output=True,timeout=30)
            data=p.stdout+p.stderr;code=p.returncode
        except subprocess.TimeoutExpired as e: data=(e.stdout or b'')+(e.stderr or b'')+b'\nTIMEOUT';code=None
        (directory/(name+'.txt')).write_bytes(data)
        commands.append({'name':name,'arguments':argv,'utcStart':utc,'utcEnd':datetime.datetime.now(datetime.timezone.utc).isoformat(),'hostMonotonicStart':t,'hostMonotonicEnd':time.perf_counter(),'durationMs':(time.perf_counter()-t)*1000,'exitCode':code,'sha256':hashlib.sha256(data).hexdigest()})
        return data.decode('utf-8',errors='replace')
    serial=None
    devices=run('devices',['devices','-l'],False)
    authorized=[line.split()[0] for line in devices.splitlines() if re.match(r'^\S+\s+device(?:\s|$)',line)]
    if args.serial:
        if args.serial not in authorized:raise SystemExit('Requested device not authorized/connected')
        serial=args.serial
    elif len(authorized)==1:serial=authorized[0]
    else:raise SystemExit('Need exactly one authorized device or --serial')
    run('identity',['shell','id'])
    run('device_uptime_before',['shell','cat','/proc/uptime'])
    before=run('ps_before',['shell','ps','-A','-o','PID,PPID,USER,NAME,ARGS'])
    def chrome(text):
        found={}
        for line in text.splitlines()[1:]:
            parts=line.split(None,4)
            if len(parts)>=4 and parts[0].isdigit() and parts[3].startswith('com.android.chrome'):
                found[int(parts[0])]=dict(pid=int(parts[0]),ppid=int(parts[1]),name=parts[3])
        return found
    processes=chrome(before);records=[];metadataErrors=[]
    def probe(label):
        if not args.memory002:return {}
        from memory002_connection import metadata
        try:
            result=metadata(args.adb,serial,directory/(label+'.json'),roles_only=args.roles_only)
            if result.get('status')!='CONNECTED':metadataErrors.append({'label':label,'errors':result.get('errors',[]),'status':result.get('status')})
            return result
        except Exception as e:
            metadataErrors.append({'label':label,'error':str(e)})
            # Cleanup failure must stop further collection, not silently continue.
            if 'cleanup not confirmed' in str(e):raise
            return {}
    roles_before=probe('metadata_before')
    arm=None
    if args.arm_generation:
        print('ARMED：现在点手机“继续”；随后立即在本窗口按 Enter 开始采样。手机保持前台。',flush=True)
        waiting=time.perf_counter();input()
        arm={'waitDurationMs':(time.perf_counter()-waiting)*1000,'releasedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'evidence':'Operator action only; no independently verified generation start'}
    capture_start=control('start',{'stage':args.phase}) if args.protocol else None
    for pid,info in processes.items():
        ticks=start_ticks(run(f'proc_stat_before_{pid}',['shell','cat',f'/proc/{pid}/stat']))
        text=run(f'meminfo_{pid}',['shell','dumpsys','meminfo',str(pid)])
        info.update(meminfo(text,pid,info['name']))
        info['startTicksBefore']=ticks
        info.update(role='BROWSER_MAIN' if info['name']=='com.android.chrome' else 'UNKNOWN',roleEvidence='Exact package main process name only; no CDP evidence')
        status=run(f'proc_status_{pid}',['shell','cat',f'/proc/{pid}/status'])
        rss=re.search(r'^VmRSS:\s*(\d+)\s+kB',status,re.M)
        info['procStatusVmRssKiB']=int(rss[1]) if rss else None
        run(f'smaps_rollup_{pid}',['shell','cat',f'/proc/{pid}/smaps_rollup'])
        records.append(info)
    run('system_meminfo',['shell','cat','/proc/meminfo'])
    after=chrome(run('ps_after',['shell','ps','-A','-o','PID,PPID,USER,NAME,ARGS']))
    for info in records:
        pid=info['pid'];ticks=start_ticks(run(f'proc_stat_after_{pid}',['shell','cat',f'/proc/{pid}/stat']))
        info['startTicksAfter']=ticks
        info['stablePidLifetime']=info['startTicksBefore'] is not None and ticks==info['startTicksBefore'] and pid in after and after[pid]['name']==info['name']
        if not info['stablePidLifetime']:
            info.update(status='UNAVAILABLE',pssKiB=None,rssKiB=None,role='UNKNOWN',roleEvidence='PID lifetime changed or unverified')
    roles_after=probe('metadata_after')
    if args.memory002:
        for info in records:info['role'],info['roleEvidence']=role_for(info['pid'],roles_before,roles_after,info['stablePidLifetime'])
    run('device_uptime_after',['shell','cat','/proc/uptime'])
    result={'experimentId':'MEMORY002' if args.memory002 else 'ADB_MEMORY_PROBE','phase':args.phase,'verifiedPhase':classify_phase(roles_before,roles_after) if args.memory002 else 'UNAVAILABLE','phaseEvidence':'Fresh project stage metadata brackets capture when available; otherwise operator label unverified. Transitions MIXED_PHASE; no host/page clock synchronization assumed.','session':args.session,'processes':records,'roleGroups':{role:[r for r in records if r['role']==role] for role in ['BROWSER_MAIN','GPU','TARGET_RENDERER','RENDERER_TARGET_UNKNOWN','UNKNOWN']},'metadataBefore':roles_before,'metadataAfter':roles_after,'metadataErrors':metadataErrors,'pidChanges':{'added':sorted(set(after)-set(processes)),'removed':sorted(set(processes)-set(after)),'renamed':[p for p in after if p in processes and after[p]['name']!=processes[p]['name']]},'commands':commands,'collectionDurationMs':(time.perf_counter()-start)*1000,'coverage':'Chrome-prefixed processes observed at ps_before; sequential, non-atomic, no guaranteed page/GPU attribution. No model execution. RSS/PSS is process scope, not model-exclusive or physical GPU memory. Raw full process inventory includes unrelated apps; kept local/ignored.'}
    result['generationArm']=arm
    result['captureQualification']='PROTOCOL_V2' if args.protocol else 'UNQUALIFIED_LEGACY_DIAGNOSTIC'
    if args.protocol:
        valid_roles=[r['role'] for r in records if r['status']=='AVAILABLE' and r['stablePidLifetime']]
        capture_end=control('end',{'captureId':capture_start['captureId'],'validatedRoles':valid_roles,'dataValid':not metadataErrors,'archive':directory.name})
        result['protocol']={'version':'memory002-v2','start':capture_start,'end':capture_end,'scope':'Browser/GPU process observation;target renderer attribution unavailable'}
        result['verifiedPhase']=capture_end['phase'] if capture_end['status']=='ACCEPTED' else 'UNAVAILABLE'
    (directory/'snapshot.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'directory':directory.as_posix(),'durationMs':result['collectionDurationMs'],'processes':records,'pidChanges':result['pidChanges']},indent=2))
if __name__=='__main__':main()
