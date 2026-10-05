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
  var DST_X : i32= i32(reserved_gid.x);
  var DST_Y : i32= i32(reserved_gid.y);
  var DST_S : i32= i32(reserved_gid.z);
  if (DST_S >= U.i1.y || DST_Y >= U.i1.x || DST_X >= U.i1.z) {return;}
  var reducer : vec4<f32>= vec4<f32>(0.);
  for (var SRC_B : i32= 0; SRC_B < U.i1.w; SRC_B += 1) {
    var src_val : vec4<f32>= textureLoad(src_tensor_image2d, vec2<i32>(((DST_X) * U.i1.w + (SRC_B)), ((DST_Y) * U.i2.x + (DST_S))), 0);
    reducer += (src_val);;
  }
  reducer *= U.f0.x;
  var result : vec4<f16>= vec4<f16>(reducer);
  textureStore(dst_tensor_image2d, vec2<i32>((DST_X), ((DST_Y) * U.i1.y + (DST_S))), vec4<f32>(result));
}
