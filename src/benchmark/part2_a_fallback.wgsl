struct Dims { M:u32,N:u32,K:u32,pad:u32 };
@group(0) @binding(0) var<storage,read> a:array<f32>;
@group(0) @binding(1) var<storage,read> b:array<f32>;
@group(0) @binding(2) var<storage,read_write> c:array<f32>;
@group(0) @binding(3) var<uniform> dims:Dims;
@compute @workgroup_size(8,8)
fn main(@builtin(global_invocation_id) id:vec3<u32>){
 if(id.y>=dims.M || id.x>=dims.N){return;}
 var sum:f32=0.0;
 for(var k:u32=0u;k<dims.K;k++){sum=fma(a[id.y*dims.K+k],b[k*dims.N+id.x],sum);}
 c[id.y*dims.N+id.x]=f32(sum);
}
