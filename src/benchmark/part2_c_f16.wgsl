enable f16;
struct Dims { M:u32,N:u32,K:u32,bRowVectors:u32 };
@group(0) @binding(0) var<storage,read> a:array<f16>;
// Same B16 values,padded per K row to a multiple of four N columns.
@group(0) @binding(1) var<storage,read> b4:array<vec4<f16>>;
@group(0) @binding(2) var<storage,read_write> c:array<f32>;
@group(0) @binding(3) var<uniform> dims:Dims;
var<workgroup> tileA:array<f16,128>;
var<workgroup> tileB:array<vec4<f16>,128>;
@compute @workgroup_size(8,8)
fn main(@builtin(local_invocation_id) local:vec3<u32>,
        @builtin(workgroup_id) group:vec3<u32>){
 let row=group.y*8u+local.y;
 let column=(group.x*8u+local.x)*4u;
 let linear=local.y*8u+local.x;
 var sums:vec4<f16>=vec4<f16>(0.0h);
 // All invocations,including invalid rows/columns,reach both barriers.
 for(var base:u32=0u;base<dims.K;base+=16u){
  for(var load:u32=linear;load<128u;load+=64u){
   let ar=group.y*8u+load/16u;let ak=base+load%16u;
   tileA[load]=0.0h;
   if(ar<dims.M && ak<dims.K){tileA[load]=a[ar*dims.K+ak];}
   let bk=base+load/8u;let bv=group.x*8u+load%8u;
   tileB[load]=vec4<f16>(0.0h);
   // Last partial vector is safe because host row padding is explicit and zero.
   if(bk<dims.K && bv<dims.bRowVectors){tileB[load]=b4[bk*dims.bRowVectors+bv];}
  }
  workgroupBarrier();
  for(var k:u32=0u;k<16u;k++){
   if(base+k<dims.K){
    let av=tileA[local.y*16u+k];
    // Component-wise f16 fma,increasing scalar K;no dot/reduction reassociation.
    sums=fma(vec4<f16>(av),tileB[k*8u+local.x],sums);
   }
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
