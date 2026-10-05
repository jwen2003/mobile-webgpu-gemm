enable f16;
@id(0) override WORKGROUP_SIZE_X: i32;
@id(1) override WORKGROUP_SIZE_Y: i32;
@id(2) override WORKGROUP_SIZE_Z: i32;
@group(0) @binding(0) var dst_tensor_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(1) var indices_image2d : texture_2d<i32>;
@group(0) @binding(2) var src_tensor_image2d : texture_2d<f32>;
struct Scalars {
  i0 : vec4<i32>,
  i1 : vec4<i32>,
};
@group(0) @binding(3) var<uniform> U: Scalars;
@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y, WORKGROUP_SIZE_Z)
fn main(@builtin(global_invocation_id) reserved_gid : vec3<u32>) {
  var linear_id : i32= i32(reserved_gid.x);
  var X : i32= linear_id / 1;
  var B : i32= linear_id % 1;
  var Y : i32= i32(reserved_gid.y);
  var S : i32= i32(reserved_gid.z);
  if (X >= U.i0.z || Y >= U.i0.x || S >= U.i0.y) { 
    return; 
  } 
  var gather_index : i32;
    {
  var slice_coord_TMP : i32= (X) / 4;
  var sub_ch_coord_TMP : i32= (X) % 4;
  gather_index = textureLoad(indices_image2d, vec2<i32>((0), ((0) * U.i0.w + (slice_coord_TMP))), 0)[sub_ch_coord_TMP];
  };
  var result : vec4<f16>= vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((gather_index), ((Y) * U.i1.x + (S))), 0));
  textureStore(dst_tensor_image2d, vec2<i32>((X), ((Y) * U.i0.y + (S))), vec4<f32>(result));
}
