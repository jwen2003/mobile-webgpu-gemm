enable f16;
@id(0) override WORKGROUP_SIZE_X: i32;
@id(1) override WORKGROUP_SIZE_Y: i32;
@id(2) override WORKGROUP_SIZE_Z: i32;
@group(0) @binding(0) var dst_tensor_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(1) var src_tensor_image2d : texture_2d<f32>;
struct Scalars {
  i0 : vec4<i32>,
  i1 : vec4<i32>,
};
@group(0) @binding(2) var<uniform> U: Scalars;
@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y, WORKGROUP_SIZE_Z)
fn main(@builtin(global_invocation_id) reserved_gid : vec3<u32>) {
  var X : i32= i32(reserved_gid.x);
  var Y : i32= i32(reserved_gid.y);
  var S : i32= i32(reserved_gid.z);
  if (X >= U.i0.z || Y >= U.i0.x || S >= U.i0.y) {return;} 
  var value : vec4<f16>;
  var src_x : i32;var src_y : i32;var src_s : i32;
  var xc_link2 : i32;var yc_link2 : i32;var sc_link2 : i32;
  {
  var out_linear : i32= 0;

  out_linear = ((out_linear * U.i0.x + Y) * U.i0.z + X) * U.i0.y + S;
  sc_link2 = out_linear % 64;
  out_linear = out_linear / 64;
  xc_link2 = out_linear % 1;
  out_linear = out_linear / 1;
  yc_link2 = out_linear % 8;
  }
  var xc_link1 : i32;var yc_link1 : i32;var sc_link1 : i32;
  {
  sc_link1 = sc_link2;
  xc_link1 = yc_link2;
  yc_link1 = xc_link2;
  }
  var out_linear : i32= 0;

  out_linear = ((out_linear * 1 + yc_link1) * 8 + xc_link1) * 64 + sc_link1;
  src_s = out_linear % U.i1.x;
  out_linear = out_linear / U.i1.x;
  src_x = out_linear % U.i1.y;
  out_linear = out_linear / U.i1.y;
  src_y = out_linear % U.i0.w;
  value = vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((src_x), ((src_y) * U.i1.x + (src_s))), 0));
  textureStore(dst_tensor_image2d, vec2<i32>((X), ((Y) * U.i0.y + (S))), vec4<f32>(value));
} 
