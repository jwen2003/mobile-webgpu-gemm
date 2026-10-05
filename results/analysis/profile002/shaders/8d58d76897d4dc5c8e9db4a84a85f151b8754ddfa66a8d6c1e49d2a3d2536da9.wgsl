enable f16;
@id(0) override WORKGROUP_SIZE_X: i32;
@id(1) override WORKGROUP_SIZE_Y: i32;
@id(2) override WORKGROUP_SIZE_Z: i32;
@group(0) @binding(0) var dst_tensor_image2d : texture_storage_2d<rgba32sint, write>;
@group(0) @binding(1) var src_tensor_1_image2d : texture_2d<u32>;
@group(0) @binding(2) var src_tensor_image2d : texture_2d<u32>;
struct Scalars {
  i0 : vec4<i32>,
  i1 : vec4<i32>,
};
@group(0) @binding(3) var<uniform> U: Scalars;
@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y, WORKGROUP_SIZE_Z)
fn main(@builtin(global_invocation_id) reserved_gid : vec3<u32>) {
  var X : i32= i32(reserved_gid.x);
  var Y : i32= i32(reserved_gid.y);
  var S : i32= i32(reserved_gid.z);
  if (X >= U.i0.z || Y >= U.i0.x || S >= U.i0.y) { 
    return; 
  } 
  var src : vec4<bool>= vec4<bool>(textureLoad(src_tensor_image2d, vec2<i32>((X), ((Y) * U.i1.x + (S))), 0));
  {

   var src_final : vec4<i32>;
  {  
  
   var interm_value_link1 : vec4<bool>;
  {var second_value : vec4<bool>= vec4<bool>(textureLoad(src_tensor_1_image2d, vec2<i32>(((X)), (((Y)) * U.i0.w + ((S)))), 0));
  interm_value_link1.x = src.x && second_value.x;
  interm_value_link1.y = src.y && second_value.y;
  interm_value_link1.z = src.z && second_value.z;
  interm_value_link1.w = src.w && second_value.w;
  }
  {src_final = vec4<i32>(interm_value_link1);
  }
  }
  textureStore(dst_tensor_image2d, vec2<i32>((X), ((Y) * U.i0.y + (S))), src_final);
};
} 
