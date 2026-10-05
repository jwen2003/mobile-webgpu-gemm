enable f16;
@id(0) override WORKGROUP_SIZE_X: i32;
@id(1) override WORKGROUP_SIZE_Y: i32;
@id(2) override WORKGROUP_SIZE_Z: i32;
@group(0) @binding(0) var dst_tensor0_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(1) var dst_tensor1_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(2) var dst_tensor2_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(3) var dst_tensor3_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(4) var src_image2d : texture_2d<f32>;
struct Scalars {
  i0 : vec4<i32>,
  i1 : vec4<i32>,
};
@group(0) @binding(5) var<uniform> U: Scalars;
@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y, WORKGROUP_SIZE_Z)
fn main(@builtin(global_invocation_id) reserved_gid : vec3<u32>) {
  var dst_o_ogroup : i32= i32(reserved_gid.x);
  if (dst_o_ogroup >= U.i0.y) {return;}
  var dst_sp_i : i32= i32(reserved_gid.y);
  if (dst_sp_i >= U.i0.z) {return;}
  if (i32(reserved_gid.z) != 0) {return;}
  var dst_ogroup : i32= dst_o_ogroup % U.i0.x;
  var dst_o : i32= dst_o_ogroup / U.i0.x;
  var dst_i : i32= dst_sp_i % U.i0.w;
  var dst_sp : i32= dst_sp_i / U.i0.w;
  var i_slice : i32= dst_i;
  var o_slice : i32= dst_o * U.i0.x + dst_ogroup;
  var spatial_linear : i32= dst_sp;
  var W : i32= spatial_linear % U.i1.w;
  var H : i32= spatial_linear / U.i1.w;
  var w0 : vec4<f16>= vec4<f16>(0);
  var w1 : vec4<f16>= vec4<f16>(0);
  var w2 : vec4<f16>= vec4<f16>(0);
  var w3 : vec4<f16>= vec4<f16>(0);
  if (o_slice < U.i1.x && i_slice < U.i0.w) {
  if (i_slice * 4 + 0 < U.i1.z) {
    w0 = vec4<f16>(textureLoad(src_image2d, vec2<i32>((i_slice * 4 + 0), ((W) * U.i1.y + (o_slice))), 0));
  }
  if (i_slice * 4 + 1 < U.i1.z) {
    w1 = vec4<f16>(textureLoad(src_image2d, vec2<i32>((i_slice * 4 + 1), ((W) * U.i1.y + (o_slice))), 0));
  }
  if (i_slice * 4 + 2 < U.i1.z) {
    w2 = vec4<f16>(textureLoad(src_image2d, vec2<i32>((i_slice * 4 + 2), ((W) * U.i1.y + (o_slice))), 0));
  }
  if (i_slice * 4 + 3 < U.i1.z) {
    w3 = vec4<f16>(textureLoad(src_image2d, vec2<i32>((i_slice * 4 + 3), ((W) * U.i1.y + (o_slice))), 0));
  }
  }  
  var r0 : vec4<f16>= w0;
  var r1 : vec4<f16>= w1;
  var r2 : vec4<f16>= w2;
  var r3 : vec4<f16>= w3;
  textureStore(dst_tensor0_image2d, vec2<i32>(dst_o_ogroup, dst_sp_i), vec4<f32>(r0));
  textureStore(dst_tensor1_image2d, vec2<i32>(dst_o_ogroup, dst_sp_i), vec4<f32>(r1));
  textureStore(dst_tensor2_image2d, vec2<i32>(dst_o_ogroup, dst_sp_i), vec4<f32>(r2));
  textureStore(dst_tensor3_image2d, vec2<i32>(dst_o_ogroup, dst_sp_i), vec4<f32>(r3));
}
