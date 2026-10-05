import {VARIANTS as ABC,packBVec4} from './part2_abc_math.mjs';
import {CONTRACT,toHalf,fromHalf} from './part2_math.mjs';
import {rng} from './gemm_math.mjs';
export {packBVec4};
export const VARIANTS={...ABC,D:{...ABC.C,vectorization:'Same C mapping;packed Q4 decode into vec4<f16> workgroup tile',layout:'row-packed u32 Q4;group32 K,scale f16,zp u32',storageBindings:5,fused:true}};
function permutations(a){return a.length?a.flatMap((x,i)=>permutations(a.filter((_,j)=>j!==i)).map(p=>[x,...p])):[[]];}
export const PERMUTATIONS=permutations(['A','B','C','D']);
// Three reversal pairs balance directed pair precedence as well as positions.
export const EXTRA=['ABCD','DCBA','BCDA','ADCB','CDAB','BADC'].map(x=>[...x]);
export function quadOrder(M,salt=0){const a=[...PERMUTATIONS,...EXTRA].map(p=>[...p]),next=rng(CONTRACT.orderSeed^M^salt);for(let i=a.length-1;i>0;i--){const j=Math.floor(next()/4294967296*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function balance(a){return {positions:Object.fromEntries(['A','B','C','D'].map(v=>[v,[0,1,2,3].map(i=>a.filter(p=>p[i]===v).length)])),precedence:Object.fromEntries(['A','B','C','D'].flatMap(x=>['A','B','C','D'].filter(y=>y!==x).map(y=>[x+'before'+y,a.filter(p=>p.indexOf(x)<p.indexOf(y)).length]))) };}
export function decodePacked(data,shape){
 const bits=data.bits,per=32/bits,mask=2**bits-1;
 if(![4,8].includes(bits)||data.rowWordStride!==Math.ceil(shape.N/per))throw new Error('QROW decode bits/stride mismatch');
 const out=new Uint16Array(shape.K*shape.N);
 for(let k=0;k<shape.K;k++)for(let n=0;n<shape.N;n++){
  const q=(data.words[k*data.rowWordStride+Math.floor(n/per)]>>>((n%per)*bits))&mask,idx=Math.floor(k/32)*shape.N+n;
  out[k*shape.N+n]=toHalf((q-data.zeros[idx])*fromHalf(data.scales[idx]));
 }return out;
}
export function ratios(by){return Object.fromEntries(['A','B','C'].map(v=>[v+'overD',by[v]?.status==='PRELIMINARY'&&by.D?.status==='PRELIMINARY'&&by.D.gpuPassNs.median>0?by[v].gpuPassNs.median/by.D.gpuPassNs.median:null]));}
