enable f16;
@id(0) override WORKGROUP_SIZE_X: i32;
@id(1) override WORKGROUP_SIZE_Y: i32;
@id(2) override WORKGROUP_SIZE_Z: i32;

fn Pack4x16float(v : vec4<f32>) -> vec2<u32> {
  return vec2<u32>(pack2x16float(v.xy), pack2x16float(v.zw));
}

fn Unpack4x16float(v : vec2<u32>) -> vec4<f32> {
  return vec4<f32>(unpack2x16float(v.x), unpack2x16float(v.y));
}
@group(0) @binding(0) var dst_tensor_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(1) var src_tensor_image2d : texture_2d<i32>;
struct weights_buffer_vector {
  data: array<mat4x4<f16>>,
};
@group(0) @binding(2) var<storage, read> weights_buffer : weights_buffer_vector;
struct Scalars {
  f0 : vec4<f32>,
  i1 : vec4<i32>,
  i2 : vec4<i32>,
};
@group(0) @binding(3) var<uniform> U: Scalars;
@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y, WORKGROUP_SIZE_Z)
fn main(@builtin(global_invocation_id) reserved_gid : vec3<u32>) {
  var linear_xb : i32= i32(reserved_gid.x);
  var X : i32= linear_xb / 1;
  var B : i32= linear_xb % 1;
  ;
  ;
  var Y : i32= i32(reserved_gid.y);
  var S : i32= i32(reserved_gid.z);
  if (X >= U.i1.z || Y >= U.i1.x || S >= U.i1.y) {
    return;
  }
  var index : i32= textureLoad(src_tensor_image2d, vec2<i32>((X), ((0) * U.i2.x + (0))), 0).x;

  
  index = max(index, 0);
  index = min(index, U.i1.w - 1);
  var weights_output_ch : i32= index;
  var weights_input_slice : i32= S;
  var weights_output_slice : i32= weights_output_ch / 4;
  var linear_i4o4 : i32= weights_input_slice * U.i2.y + weights_output_slice;
  var w0 : vec4<f32>;
  var w1 : vec4<f32>;
  var w2 : vec4<f32>;
  var w3 : vec4<f32>;
    {
  var w : mat4x4<f16>= weights_buffer.data[linear_i4o4];
  w0 = vec4<f32>(w[0]);
  w1 = vec4<f32>(w[1]);
  w2 = vec4<f32>(w[2]);
  w3 = vec4<f32>(w[3]);
  };

  var value : vec4<f32>;
  var output_sub_ch : i32= weights_output_ch % 4;
  if (output_sub_ch == 0) {
    value.x = w0.x;
    value.y = w1.x;
    value.z = w2.x;
    value.w = w3.x;
  } else if (output_sub_ch == 1) {
    value.x = w0.y;
    value.y = w1.y;
    value.z = w2.y;
    value.w = w3.y;
  } else if (output_sub_ch == 2) {
    value.x = w0.z;
    value.y = w1.z;
    value.z = w2.z;
    value.w = w3.z;
  } else if (output_sub_ch == 3) {
    value.x = w0.w;
    value.y = w1.w;
    value.z = w2.w;
    value.w = w3.w;
  }

  var dst_value : vec4<f16>= vec4<f16>(value);
  {

   var dst_value_final : vec4<f16>;
  {  
  {var second_val : vec4<f16>= vec4<f16>(f16(U.f0.x));
  dst_value_final = dst_value * second_val;}
  }
  textureStore(dst_tensor_image2d, vec2<i32>((X), ((Y) * U.i1.y + (S))), vec4<f32>(dst_value_final));
};
}