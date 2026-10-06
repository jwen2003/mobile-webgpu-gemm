"""Future v2 offline timing audit, never treats a receipt as memory acceptance."""
import argparse,json,datetime,hashlib
from pathlib import Path
from memory002_protocol import phase_with_offset

def epoch(text):return datetime.datetime.fromisoformat(text.replace('Z','+00:00')).timestamp()*1000
def audit(ledger,snapshot):
 if ledger['sessionId']!=snapshot['session']:raise ValueError('Session mismatch')
 markers=ledger['markers'];starts=[m for m in markers if m['stage']=='GENERATION'];ends=[m for m in markers if m['stage']=='AFTER_GENERATION']
 rows=[]
 for command in snapshot['commands']:
  if not command['name'].startswith('meminfo_'):continue
  timing={'phase':'UNKNOWN','reason':'No complete generation boundary markers'}
  if len(starts)==len(ends)==1:
   timing=phase_with_offset(epoch(command['utcStart']),epoch(command['utcEnd']),starts[0]['pageEpochMs'],ends[0]['pageEpochMs'],ledger['clockExchanges'])
  rows.append({'command':command['name'],'utcStart':command['utcStart'],'utcEnd':command['utcEnd'],'timing':timing})
 return {'protocol':'memory002-v2','sessionId':ledger['sessionId'],'idlePrerequisite':ledger['idleAccepted'],'generationCommandWindows':rows,'status':'TIMING_AUDIT_ONLY_NOT_FORMAL_MEMORY_ACCEPTANCE','scope':'Browser/GPU process scope;renderer target UNKNOWN;no model-exclusive/physical GPU memory'}

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('ledger');p.add_argument('snapshot');p.add_argument('--output',required=True);a=p.parse_args()
 folder=Path(a.snapshot).parent;s=json.loads(Path(a.snapshot).read_text(encoding='utf-8'))
 for c in s['commands']:assert hashlib.sha256((folder/(c['name']+'.txt')).read_bytes()).hexdigest()==c['sha256']
 result=audit(json.loads(Path(a.ledger).read_text(encoding='utf-8')),s);Path(a.output).write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(result['status'])
