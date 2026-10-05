enable f16;
@id(0) override WORKGROUP_SIZE_X: i32;
@id(1) override WORKGROUP_SIZE_Y: i32;
@id(2) override WORKGROUP_SIZE_Z: i32;
@group(0) @binding(0) var dst_tensor_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(1) var src_tensor_image2d : texture_2d<f32>;
struct Scalars {
  f0 : vec4<f32>,
  i1 : vec4<i32>,
  i2 : vec4<i32>,
};
@group(0) @binding(2) var<uniform> U: Scalars;
@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y, WORKGROUP_SIZE_Z)
fn main(@builtin(global_invocation_id) reserved_gid : vec3<u32>) {
  var X : i32= i32(reserved_gid.x);
  var Y : i32= i32(reserved_gid.y);
  var S : i32= i32(reserved_gid.z);
  if (X >= U.i1.z || Y >= U.i1.x || S >= U.i1.y) {return;} 
  var value : vec4<f16>;
  var src_x : i32;var src_y : i32;var src_s : i32;
  var out_linear : i32= 0;

  out_linear = ((out_linear * U.i1.x + Y) * U.i1.z + X) * U.i1.y + S;
  src_s = out_linear % U.i2.x;
  out_linear = out_linear / U.i2.x;
  src_x = out_linear % U.i2.y;
  out_linear = out_linear / U.i2.y;
  src_y = out_linear % U.i1.w;
  value = vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((src_x), ((src_y) * U.i2.x + (src_s))), 0));
  {

   var value_final : vec4<f16>;
  {  
  {var second_val : vec4<f16>= vec4<f16>(f16(U.f0.x));
  value_final = value + second_val;}
  }
  textureStore(dst_tensor_image2d, vec2<i32>((X), ((Y) * U.i1.y + (S))), vec4<f32>(value_final));
};
} 
