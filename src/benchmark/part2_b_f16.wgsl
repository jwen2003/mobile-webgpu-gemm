enable f16;
struct Dims { M:u32,N:u32,K:u32,pad:u32 };
@group(0) @binding(0) var<storage,read> a:array<f16>;
@group(0) @binding(1) var<storage,read> b:array<f16>;
@group(0) @binding(2) var<storage,read_write> c:array<f32>;
@group(0) @binding(3) var<uniform> dims:Dims;
var<workgroup> ta:array<f16,256>;
var<workgroup> tb:array<f16,256>;
@compute @workgroup_size(16,16)
fn main(@builtin(global_invocation_id) id:vec3<u32>,@builtin(local_invocation_id) local:vec3<u32>){
 let slot=local.y*16u+local.x;var sum:f16=0.0h;
 for(var base:u32=0u;base<dims.K;base+=16u){
  ta[slot]=0.0h;tb[slot]=0.0h;
  if(id.y<dims.M && base+local.x<dims.K){ta[slot]=a[id.y*dims.K+base+local.x];}
  if(base+local.y<dims.K && id.x<dims.N){tb[slot]=b[(base+local.y)*dims.N+id.x];}
  workgroupBarrier();
  for(var k:u32=0u;k<16u;k++){if(base+k<dims.K){sum=fma(ta[local.y*16u+k],tb[k*16u+local.x],sum);}}
  workgroupBarrier();
 }
 if(id.y<dims.M && id.x<dims.N){c[id.y*dims.N+id.x]=f32(sum);}
}
