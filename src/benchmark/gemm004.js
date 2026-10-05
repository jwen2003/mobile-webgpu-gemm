import { realShapeConfiguration } from './real_shape_config.mjs?review=execution-v1';
import { mountGemmComparison } from './gemm_compare_page.mjs?review=execution-v1';
let blocked={experimentId:'GEMM004',status:'NOT_RUN',errors:[],shape:null};
try{
  const response=await fetch('./gemm004_shape.json',{cache:'no-store'});
  if(!response.ok)throw new Error(`Shape manifest HTTP ${response.status}`);
  const evidence=await response.json();blocked.evidence=evidence;
  mountGemmComparison(realShapeConfiguration(evidence));
}catch(e){
  blocked.status='NOT_RUN';blocked.readiness='WAITING_FOR_SHAPE_EVIDENCE';blocked.errors.push({message:e.message});
  document.getElementById('run').disabled=true;document.getElementById('status').textContent=e.message;
  document.getElementById('summary').textContent=JSON.stringify(blocked,null,2);
  document.getElementById('download').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify(blocked,null,2)],{type:'application/json'}));const a=document.createElement('a');
    a.href=url;a.download='GEMM004-WAITING_FOR_SHAPE_EVIDENCE.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
}
