export function stockFile(c,bits){return `part2_${c.variant.toLowerCase()}${c.variant==='D'&&bits===8?'_q8':''}_f16.wgsl`;}
export function generateShader(c,bits,stock){if(c.original)return stock;const {wx,wy,tk,variant}=c,lanes=wx*wy,vector=variant!=='B';
const declarations=`enable f16;
struct Dims { M:u32,N:u32,K:u32,stride:u32 };
@group(0) @binding(0) var<storage,read> a:array<f16>;
@group(0) @binding(1) var<storage,read> b:array<${variant==='D'?'u32':vector?'vec4<f16>':'f16'}>;
@group(0) @binding(2) var<storage,read_write> c:array<f32>;
@group(0) @binding(3) var<uniform> dims:Dims;
${variant==='D'?'@group(0) @binding(4) var<storage,read> scales:array<f16>;\n@group(0) @binding(5) var<storage,read> zeros:array<u32>;':''}
var<workgroup> ta:array<f16,${wy*tk}>;
var<workgroup> tb:array<${vector?'vec4<f16>':'f16'},${tk*wx}>;
@compute @workgroup_size(${wx},${wy})
fn main(@builtin(local_invocation_id) local:vec3<u32>,@builtin(workgroup_id) group:vec3<u32>){
 let row=group.y*${wy}u+local.y;let column=(group.x*${wx}u+local.x)*${vector?4:1}u;
 let linear=local.y*${wx}u+local.x;
 var sum:${vector?'vec4<f16>':'f16'}=${vector?'vec4<f16>(0.0h)':'0.0h'};
 for(var base:u32=0u;base<dims.K;base+=${tk}u){
  for(var slot:u32=linear;slot<${wy*tk}u;slot+=${lanes}u){
   let ar=group.y*${wy}u+slot/${tk}u;let ak=base+slot%${tk}u;ta[slot]=0.0h;
   if(ar<dims.M && ak<dims.K){ta[slot]=a[ar*dims.K+ak];}
  }
  for(var slot:u32=linear;slot<${tk*wx}u;slot+=${lanes}u){
   let bk=base+slot/${wx}u;let bn=group.x*${wx}u+slot%${wx}u;
   tb[slot]=${vector?'vec4<f16>(0.0h)':'0.0h'};
`;
const load=variant==='D'?`   if(bk<dims.K){var value=vec4<f16>(0.0h);
    for(var component:u32=0u;component<4u;component++){
     let n=bn*4u+component;if(n<dims.N){
      let q=(b[bk*dims.stride+n/${32/bits}u]>>((n%${32/bits}u)*${bits}u))&${2**bits-1}u;
      let quantIndex=(bk/32u)*dims.N+n;
      value[component]=f16(f32(i32(q)-i32(zeros[quantIndex]))*f32(scales[quantIndex]));
     }
    }tb[slot]=value;
   }
`:variant==='C'?`   if(bk<dims.K && bn<dims.stride){tb[slot]=b[bk*dims.stride+bn];}
`:`   if(bk<dims.K && bn<dims.N){tb[slot]=b[bk*dims.N+bn];}
`;
const compute=`  }
  workgroupBarrier();
  for(var k:u32=0u;k<${tk}u;k++){if(base+k<dims.K){sum=fma(${vector?'vec4<f16>(':''}ta[local.y*${tk}u+k]${vector?')':''},tb[k*${wx}u+local.x],sum);}}
  workgroupBarrier();
 }
 if(row<dims.M){
${vector?[0,1,2,3].map(i=>`  if(column+${i}u<dims.N){c[row*dims.N+column+${i}u]=f32(sum[${i}]);}`).join('\n'):'  if(column<dims.N){c[row*dims.N+column]=f32(sum);}'}
 }
}
`;
return declarations+load+compute;
}
