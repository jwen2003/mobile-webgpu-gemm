"""Offline parser/phase/role tests. No adb/model invocation."""
from memory002_parse import meminfo,start_ticks,classify_phase,role_for

text='** MEMINFO in pid 12 [com.android.chrome] **\n TOTAL PSS: 20 TOTAL RSS: 30 TOTAL SWAP PSS: 4'
assert meminfo(text,12,'com.android.chrome')['pssKiB']==20
assert meminfo(text,13,'com.android.chrome')['status']=='UNAVAILABLE'
assert meminfo(text,12,'wrong')['rssKiB'] is None
assert meminfo('TOTAL PSS: 20 TOTAL RSS: 30',12,'com.android.chrome')['status']=='UNAVAILABLE'
assert start_ticks('12 (name (with space)) '+' '.join(['S']+['0']*18+['1234']))==1234
assert start_ticks('Permission denied') is None
a={'processes':[{'pid':12,'type':'GPU'}]}
assert role_for(12,a,a,True)[0]=='GPU'
assert role_for(12,a,a,False)[0]=='UNKNOWN'
assert role_for(12,a,{},True)[0]=='UNKNOWN'
assert role_for(12,dict(a,status='ERROR'),a,True)[0]=='UNKNOWN'
renderer={'processes':[{'pid':12,'type':'renderer'}]}
assert role_for(12,renderer,renderer,True)[0]=='RENDERER_TARGET_UNKNOWN'
def meta(stage='GENERATION',history=None,session='s'):
 return {'targets':[{'stageMetadata':{'enabled':True,'sessionId':session,'stage':stage,'history':history or [{'stage':stage}]}}]}
assert classify_phase(meta(),meta())=='GENERATION'
assert classify_phase(meta(),meta('AFTER_DRAIN'))=='MIXED_PHASE'
assert classify_phase(meta(),meta(history=[{'stage':'GENERATION'},{'stage':'DRAIN'},{'stage':'GENERATION'}]))=='MIXED_PHASE'
assert classify_phase(meta(),meta(session='different'))=='MIXED_SESSION'
assert classify_phase(meta(),{})=='UNAVAILABLE'
print('MEMORY002 offline parsing, PID lifetime, fresh role evidence and phase-transition checks PASS')
