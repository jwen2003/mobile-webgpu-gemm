// Q8 unsigned byte codes;four N values/u32;each K row word-aligned.
enable f16;
struct Dims { M:u32,N:u32,K:u32,rowWords:u32 };
@group(0) @binding(0) var<storage,read> a:array<f16>;
@group(0) @binding(1) var<storage,read> packed:array<u32>;
@group(0) @binding(2) var<storage,read_write> c:array<f32>;
@group(0) @binding(3) var<uniform> dims:Dims;
@group(0) @binding(4) var<storage,read> scales:array<f16>;
@group(0) @binding(5) var<storage,read> zeros:array<u32>;
var<workgroup> tileA:array<f16,128>;
var<workgroup> tileB:array<vec4<f16>,128>;
@compute @workgroup_size(8,8)
fn main(@builtin(local_invocation_id) local:vec3<u32>,
        @builtin(workgroup_id) group:vec3<u32>){
 let row=group.y*8u+local.y;
 let column=(group.x*8u+local.x)*4u;
 let linear=local.y*8u+local.x;
 var sums=vec4<f16>(0.0h);
 for(var base:u32=0u;base<dims.K;base+=16u){
  for(var load:u32=linear;load<128u;load+=64u){
   let ar=group.y*8u+load/16u;let ak=base+load%16u;
   tileA[load]=0.0h;
   if(ar<dims.M && ak<dims.K){tileA[load]=a[ar*dims.K+ak];}
   let bk=base+load/8u;let bv=group.x*8u+load%8u;
   tileB[load]=vec4<f16>(0.0h);
   if(bk<dims.K){
    var weights=vec4<f16>(0.0h);
    for(var component:u32=0u;component<4u;component++){
     let n=bv*4u+component;
     if(n<dims.N){
      let q=(packed[bk*dims.rowWords+n/4u]>>((n%4u)*8u))&255u;
      let metadata=(bk/32u)*dims.N+n;
      // Exact signed integer difference,FP32 scale multiply,then FP16 rounding.
      weights[component]=f16(f32(i32(q)-i32(zeros[metadata]))*f32(scales[metadata]));
     }
    }
    tileB[load]=weights;
   }
  }
  workgroupBarrier();
  for(var k:u32=0u;k<16u;k++){
   if(base+k<dims.K){sums=fma(vec4<f16>(tileA[local.y*16u+k]),tileB[k*8u+local.x],sums);}
  }
  workgroupBarrier();
 }
 if(row<dims.M){
  if(column<dims.N){c[row*dims.N+column]=f32(sums.x);}
  if(column+1u<dims.N){c[row*dims.N+column+1u]=f32(sums.y);}
  if(column+2u<dims.N){c[row*dims.N+column+2u]=f32(sums.z);}
  if(column+3u<dims.N){c[row*dims.N+column+3u]=f32(sums.w);}
 }
}
