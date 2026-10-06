"""Offline TRACE001 audit. Never invokes adb or starts tracing/model work."""
import hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PRIVATE=ROOT/'results/local/adb_memory/trace001'
def varint(b,i):
 v=0
 for shift in range(0,70,7):
  if i>=len(b):raise ValueError('truncated varint')
  x=b[i];i+=1;v|=(x&127)<<shift
  if not x&128:return v,i
 raise ValueError('oversized varint')
def fields(b):
 i=0;out=[]
 while i<len(b):
  key,i=varint(b,i);number=key>>3;wire=key&7
  if number==0:raise ValueError('zero field')
  if wire==0:value,i=varint(b,i)
  elif wire in (1,5):
   n=8 if wire==1 else 4
   if i+n>len(b):raise ValueError('truncated fixed field')
   value=b[i:i+n];i+=n
  elif wire==2:
   n,i=varint(b,i)
   if i+n>len(b):raise ValueError('truncated bytes')
   value=b[i:i+n];i+=n
  else:raise ValueError('unsupported wire type')
  out.append((number,wire,value))
 return out
def one(b,n):
 a=[v for f,w,v in fields(b) if f==n];assert len(a)==1,(n,len(a));return a[0]
def audit():
 # Independently known nested synthetic service/data-source/descriptor message.
 assert one(one(one(bytes.fromhex('12090a070a056770752e78'),2),1),1)==b'gpu.x'
 try:fields(b'\x0a\x02\x01')
 except ValueError:pass
 else:raise AssertionError('bounds check failed')
 rows=json.loads((PRIVATE/'commands.json').read_text())
 for r in rows:
  for stream in ['stdout','stderr']:
   assert hashlib.sha256((PRIVATE/(r['name']+'.'+stream)).read_bytes()).hexdigest()==r[stream+'Sha256']
 raw=(PRIVATE/'perfetto_query_raw.stdout').read_bytes()
 # adb shell transport inserted CR before LF; inverse only in derived parsing.
 service=raw.replace(b'\r\n',b'\n');parsed=fields(service)
 producers={one(v,1):one(v,2).decode() for f,w,v in parsed if f==1}
 sources=[(one(one(v,1),1).decode(),one(v,2)) for f,w,v in parsed if f==2]
 text=re.sub(r'\x1b\[[0-9;]*m','',(PRIVATE/'perfetto_query_long.stdout').read_text())
 section=text.split('DATA SOURCES REGISTERED:')[1].split('TRACING SESSIONS:')[0]
 textnames=[line.split()[0] for line in section.splitlines() if line.strip() and not line.startswith(('NAME','==='))]
 assert sorted(textnames)==sorted(n for n,pid in sources),'text/proto source inventories disagree'
 assert next(r for r in rows if r['name']=='perfetto_query_raw')['exitCode']==0
 assert 'uid=2000(shell)' in (PRIVATE/'identity.stdout').read_text()
 assert 'Permission denied' in (PRIVATE/'tracefs_gpu_events.stderr').read_text()
 assert 'No such file or directory' in (PRIVATE/'debug_tracefs_gpu_events.stderr').read_text()
 names=sorted(set(n for n,pid in sources));gpu=[n for n in names if n.startswith(('gpu.','vulkan.','android.gpu.'))]
 target=[n for n,pid in sources if producers[pid]=='com.android.chrome' or producers[pid].startswith('org.chromium-com.android.chrome-')]
 result={'experimentId':'TRACE001','status':'CHECK_COMPLETE_NO_VALIDATED_GPU_TIMELINE','scope':'One service-registration snapshot,ordinary authorized adb shell;no trace/model run',
 'startedUtc':'2026-10-06T10:34:32Z','budgetSeconds':900,'deviceCheckEndedUtc':rows[-1]['endUtc'],'serviceVersion':one(service,5).decode(),
 'serviceQuery':'AVAILABLE','registeredGpuRelatedSources':gpu,'registeredLinuxFtrace':'linux.ftrace' in names,
 'gpuExecutionTimeline':{'status':'UNAVAILABLE_CURRENT_REGISTERED_ROUTE','gpuRenderstagesRegistered':any(n.startswith('gpu.renderstages') for n in names),'gpuCountersRegistered':any(n.startswith('gpu.counters') for n in names),'otherUnregisteredOrOnDemandRoutes':'UNKNOWN'},
 'targetWebGpuDispatchShaderAssociation':{'status':'UNKNOWN_NO_VALIDATED_ENTRY','targetChromeRegisteredTrackEvent':'track_event' in target,'targetChromeCdpCategories':'NOT_QUERIED','optionalProtoFieldsAreNotProducerEvidence':True},
 'permissions':{'shellUid':2000,'serviceQueryExitCode':0,'tracefsAvailableEvents':'PERMISSION_DENIED','debugTracefsAvailableEvents':'NO_SUCH_FILE','privilegedFtraceProducerCapture':'UNKNOWN_NOT_CAPTURED'},
 'configuration':{'memoryDataSource':'android.gpu.memory','registration':'AVAILABLE','recordingPermissionAndPayload':'UNKNOWN_NOT_CAPTURED','configConversion':'UNAVAILABLE_ATTEMPTS_FAILED_FILE_INPUT','gpuTimelineConfig':'NO_REGISTERED_GPU_RENDERSTAGE_SOURCE'},
 'preservedFailures':[{'name':r['name'],'exitCode':r['exitCode']} for r in rows if r['exitCode']!=0],
 'cleanup':{'createdForwardCount':0,'startedTraceSessionCount':0,'deviceFilesCreated':0,'systemPermissionChanges':0},
 'privateEvidence':{'commandsSha256':hashlib.sha256((PRIVATE/'commands.json').read_bytes()).hexdigest(),'queryRawSha256':hashlib.sha256(raw).hexdigest(),'queryDecodedSha256':hashlib.sha256(service).hexdigest(),'transportNormalization':'CRLF-to-LF inversion;validated by independent text inventory','fileHashes':{f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in PRIVATE.iterdir() if f.is_file()}},
 'limitations':['Registration is not successful capture or operator attribution','Memory source is not GPU execution time','CPU Dawn events are not hardware GPU intervals','Source absence is this observed service state,not proof all future driver routes impossible','No model trace proposal justified;retain breakdown gap and consolidate report']}
 assert not result['gpuExecutionTimeline']['gpuRenderstagesRegistered']
 end=__import__('datetime').datetime.fromisoformat(result['deviceCheckEndedUtc']);start=__import__('datetime').datetime.fromisoformat(result['startedUtc'].replace('Z','+00:00'));assert (end-start).total_seconds()<900
 (ROOT/'results/analysis/trace001_availability.json').write_text(json.dumps(result,indent=2)+'\n')
 print('PASS: binary/text inventories agree;private raw hashes verified;GPU sources:',gpu)
if __name__=='__main__':audit()
