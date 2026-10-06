import {GENERATION_OPTIONS,QUESTION} from './config.mjs';
export const SESSION_PLAN=Object.freeze({version:'BASELINE002-v1',lengths:[128,512,1024],repetitions:5,
  maxTokenizerCalls:220,warmupGenerations:0,generationsPerSession:1,
  schedule:[128,512,1024,512,1024,128,1024,128,512,128,1024,512,512,128,1024],
  scope:'First generation in fresh task/device after tokenizer preparation;resource-only observation overhead'});
export const SESSION_OPTIONS=Object.freeze({...GENERATION_OPTIONS,maxTokens:2048});
export const PREFIX='<start_of_turn>user\n',SUFFIX='<end_of_turn>\n<start_of_turn>model\n';
export function bodyFor(n,tail=''){return 'The following repeated context is filler; ignore it when answering. Context:'+(' data'.repeat(n))+tail+'\nQuestion: '+QUESTION;}
export function fullFor(n,tail=''){return PREFIX+bodyFor(n,tail)+SUFFIX;}
export function sessionTarget(index){if(!Number.isInteger(index)||index<1||index>15)throw new Error('Session ordinal must be 1..15');const target=SESSION_PLAN.schedule[index-1];return {targetTokens:target,repetition:SESSION_PLAN.schedule.slice(0,index).filter(x=>x===target).length};}
// Search guesses do not establish token lengths: only exact runtime returns are accepted.
export async function buildExactPrompt(count,target,yieldToUi=()=>Promise.resolve()){
 const calls=[],cache=new Map();let selected=null;
 async function query(n,tail=''){
  const text=fullFor(n,tail);if(cache.has(text))return cache.get(text);
  if(calls.length>=SESSION_PLAN.maxTokenizerCalls)throw new Error('Exact-prompt tokenizer search budget exhausted;no guessed length accepted');
  await yieldToUi();const start=performance.now();const value=count(text);
  if(!Number.isSafeInteger(value)||value<0)throw new Error('sizeInTokens returned invalid/undefined count');
  const record={n,tail,value,startWallMs:start,endWallMs:performance.now()};calls.push(record);cache.set(text,record);
  if(value===target)selected=record;return record;
 }
 let lo=0,hi=1;const base=await query(0);if(base.value>target)throw new Error('Base full prompt exceeds requested length');
 while(!selected&&hi<=2048){const x=await query(hi);if(x.value>=target)break;lo=hi;hi*=2;}
 hi=Math.min(hi,2048);
 while(!selected&&hi-lo>1){const mid=Math.floor((lo+hi)/2),x=await query(mid);if(x.value<target)lo=mid;else hi=mid;}
 // Counts may be non-monotonic; bounded local enumeration and final verification are mandatory.
 for(let n=Math.max(0,lo-16);!selected&&n<=Math.min(2048,hi+16);n++)for(const tail of ['', ' a',' b',' 1','\n']){await query(n,tail);if(selected)break;}
 if(!selected)throw new Error('Exact target not found within frozen search;do not round or reinterpret body count');
 const body=bodyFor(selected.n,selected.tail),full=PREFIX+body+SUFFIX;
 const bodyTokens=count(body),templateOnlyTokens=count(PREFIX+SUFFIX),verifiedFullTokens=count(full);
 if(verifiedFullTokens!==target||!Number.isSafeInteger(bodyTokens)||!Number.isSafeInteger(templateOnlyTokens))throw new Error('Final tokenizer verification failed');
 return {fullPrompt:full,body,prefix:PREFIX,suffix:SUFFIX,targetTokens:target,verifiedFullTokens,bodyTokens,templateOnlyTokens,
   templateIncluded:true,fullMinusBodyTokens:verifiedFullTokens-bodyTokens,
   countingScope:'Pinned LlmInference.sizeInTokens on exact full string;template included. Difference is observed,not additive special-token/BOS claim;internal prefill tensor length UNKNOWN',
   tokenizerIdentity:'Model tokenizer exposed by @mediapipe/tasks-genai@0.10.29;no independent tokenizer revision in model manifest',
   padding:{n:selected.n,tail:selected.tail},searchCalls:calls,totalTokenizerCalls:calls.length+3};
}
