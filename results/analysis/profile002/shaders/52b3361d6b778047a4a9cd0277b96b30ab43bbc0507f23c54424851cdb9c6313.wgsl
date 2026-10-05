enable f16;
@id(0) override WORKGROUP_SIZE_X: i32;
@id(1) override WORKGROUP_SIZE_Y: i32;
@id(2) override WORKGROUP_SIZE_Z: i32;
@group(0) @binding(0) var dst_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(1) var src_tensor_1_link2_image2d : texture_2d<f32>;
struct scale_buffer_vector {
  data: array<f32>,
};
@group(0) @binding(2) var<storage, read> scale_buffer : scale_buffer_vector;
struct weights_buffer_vector {
  data: array<vec2<u32>>,
};
@group(0) @binding(3) var<storage, read> weights_buffer : weights_buffer_vector;
struct Scalars {
  f0 : vec4<f32>,
  i1 : vec4<i32>,
};
@group(0) @binding(4) var<uniform> U: Scalars;

@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y, WORKGROUP_SIZE_Z)
fn main(@builtin(global_invocation_id) reserved_gid : vec3<u32>) {
  var X : i32= i32(reserved_gid.x);
  var Y : i32= i32(reserved_gid.y);
  var w0 : vec4<f16>= vec4<f16>(0.0);
  var w1 : vec4<f16>= vec4<f16>(0.0);
  var w2 : vec4<f16>= vec4<f16>(0.0);
  var w3 : vec4<f16>= vec4<f16>(0.0);
  var weight_scale : f16= f16(scale_buffer.data[X]);
  var w : vec2<u32>= weights_buffer.data[X * U.i1.x / 4 + Y];
  w = w ^ vec2<u32>(0x88888888);
  
  w0.x = f16((w.x) & 15u);
  w0.y = f16((w.x >>  4u) & 15u);
  w0.z = f16((w.x >>  8u) & 15u);
  w0.w = f16((w.x >> 12u) & 15u);
  w1.x = f16((w.x >> 16u) & 15u);
  w1.y = f16((w.x >> 20u) & 15u);
  w1.z = f16((w.x >> 24u) & 15u);
  w1.w = f16((w.x >> 28u) & 15u);
  w2.x = f16((w.y) & 15u);
  w2.y = f16((w.y >>  4u) & 15u);
  w2.z = f16((w.y >>  8u) & 15u);
  w2.w = f16((w.y >> 12u) & 15u);
  w3.x = f16((w.y >> 16u) & 15u);
  w3.y = f16((w.y >> 20u) & 15u);
  w3.z = f16((w.y >> 24u) & 15u);
  w3.w = f16((w.y >> 28u) & 15u);
;
  var bias : f16= -weight_scale * 8.0;
  w0 = w0 * weight_scale + bias;
  w1 = w1 * weight_scale + bias;
  w2 = w2 * weight_scale + bias;
  w3 = w3 * weight_scale + bias;
  {

   var w0_final : vec4<f16>;
  {  
  
   var interm_value_link2 : vec4<f16>;
  {var second_val : vec4<f16>= vec4<f16>(f16(U.f0.x));
  interm_value_link2 = w0 * second_val;}
  
   var interm_value_link3 : vec4<f16>;
  {var second_value : vec4<f16>= vec4<f16>(textureLoad(src_tensor_1_link2_image2d, vec2<i32>(((X)), (((0)) * U.i1.y + ((Y * 4 + 0)))), 0));
  interm_value_link3 = interm_value_link2 + second_value;}
  {var second_val : vec4<f16>= vec4<f16>(f16(U.f0.y));
  w0_final = interm_value_link3 * second_val;}
  }
  textureStore(dst_image2d, vec2<i32>((X), ((0) * U.i1.x + (Y * 4 + 0))), vec4<f32>(w0_final));
};
  {

   var w1_final : vec4<f16>;
  {  
  
   var interm_value_link2 : vec4<f16>;
  {var second_val : vec4<f16>= vec4<f16>(f16(U.f0.x));
  interm_value_link2 = w1 * second_val;}
  
   var interm_value_link3 : vec4<f16>;
  {var second_value : vec4<f16>= vec4<f16>(textureLoad(src_tensor_1_link2_image2d, vec2<i32>(((X)), (((0)) * U.i1.y + ((Y * 4 + 1)))), 0));
  interm_value_link3 = interm_value_link2 + second_value;}
  {var second_val : vec4<f16>= vec4<f16>(f16(U.f0.y));
  w1_final = interm_value_link3 * second_val;}
  }
  textureStore(dst_image2d, vec2<i32>((X), ((0) * U.i1.x + (Y * 4 + 1))), vec4<f32>(w1_final));
};
  {

   var w2_final : vec4<f16>;
  {  
  
   var interm_value_link2 : vec4<f16>;
  {var second_val : vec4<f16>= vec4<f16>(f16(U.f0.x));
  interm_value_link2 = w2 * second_val;}
  
   var interm_value_link3 : vec4<f16>;
  {var second_value : vec4<f16>= vec4<f16>(textureLoad(src_tensor_1_link2_image2d, vec2<i32>(((X)), (((0)) * U.i1.y + ((Y * 4 + 2)))), 0));
  interm_value_link3 = interm_value_link2 + second_value;}
  {var second_val : vec4<f16>= vec4<f16>(f16(U.f0.y));
  w2_final = interm_value_link3 * second_val;}
  }
  textureStore(dst_image2d, vec2<i32>((X), ((0) * U.i1.x + (Y * 4 + 2))), vec4<f32>(w2_final));
};
  {

   var w3_final : vec4<f16>;
  {  
  
   var interm_value_link2 : vec4<f16>;
  {var second_val : vec4<f16>= vec4<f16>(f16(U.f0.x));
  interm_value_link2 = w3 * second_val;}
  
   var interm_value_link3 : vec4<f16>;
  {var second_value : vec4<f16>= vec4<f16>(textureLoad(src_tensor_1_link2_image2d, vec2<i32>(((X)), (((0)) * U.i1.y + ((Y * 4 + 3)))), 0));
  interm_value_link3 = interm_value_link2 + second_value;}
  {var second_val : vec4<f16>= vec4<f16>(f16(U.f0.y));
  w3_final = interm_value_link3 * second_val;}
  }
  textureStore(dst_image2d, vec2<i32>((X), ((0) * U.i1.x + (Y * 4 + 3))), vec4<f32>(w3_final));
};
}