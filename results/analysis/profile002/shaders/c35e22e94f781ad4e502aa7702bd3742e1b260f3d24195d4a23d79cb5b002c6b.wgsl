enable f16;
@id(0) override WORKGROUP_SIZE_X: i32;
@id(1) override WORKGROUP_SIZE_Y: i32;
@id(2) override WORKGROUP_SIZE_Z: i32;
@group(0) @binding(0) var dst_tensor_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(1) var position_image2d : texture_2d<i32>;
@group(0) @binding(2) var src_tensor_image2d : texture_2d<f32>;
struct Scalars {
  f0 : vec4<f32>,
  i1 : vec4<i32>,
  i2 : vec4<i32>,
};
@group(0) @binding(3) var<uniform> U: Scalars;
@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y, WORKGROUP_SIZE_Z)
fn main(@builtin(global_invocation_id) reserved_gid : vec3<u32>) {
  var X : i32= i32(reserved_gid.x);

  var Y : i32= i32(reserved_gid.y);
  var S : i32= i32(reserved_gid.z);
  var half_slices_count : i32= U.i1.z / 2;
  if (X >= U.i1.w || Y >= U.i1.y || S >= half_slices_count) {
    return;
  }
  var slice0 : i32= S;
  var slice1 : i32= S + half_slices_count;
  var fraction : vec4<f32>;
  var inv_dst_ch : f32= 1.0 / f32(U.i1.x);
  fraction.x = 2.0 * f32(S * 4 + 0) * inv_dst_ch;
  fraction.y = 2.0 * f32(S * 4 + 1) * inv_dst_ch;
  fraction.z = 2.0 * f32(S * 4 + 2) * inv_dst_ch;
  fraction.w = 2.0 * f32(S * 4 + 3) * inv_dst_ch;
  var min_timescale : vec4<f32>= vec4<f32>(U.f0.y);
  var max_timescale : vec4<f32>= vec4<f32>(U.f0.x);
  var timescale : vec4<f32>= min_timescale * pow(max_timescale / min_timescale, fraction);
  var pos_x : i32= X % U.i2.y;
  var pos_val : vec4<f32>= vec4<f32>(vec4<f32>(textureLoad(position_image2d, vec2<i32>((pos_x), ((0) * U.i2.x + (0))), 0)).x);
  var sinusoid_inp : vec4<f32>= pos_val / timescale;
  var sin_val : vec4<f16>= vec4<f16>(sin(sinusoid_inp));
  var cos_val : vec4<f16>= vec4<f16>(cos(sinusoid_inp));
  var val0 : vec4<f16>= vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((X), ((Y) * U.i2.z + (slice0))), 0));
  var val1 : vec4<f16>= vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((X), ((Y) * U.i2.z + (slice1))), 0));
  var out0 : vec4<f16>;
  var out1 : vec4<f16>;
  if (fraction.w < f32(U.f0.z)) {
    out0 = val0 * cos_val - val1 * sin_val;
    out1 = val1 * cos_val + val0 * sin_val;
  } else {
    out0 = val0;
    out1 = val1;
  }
  {

   var out0_final : vec4<f16>;
  {  
  {var second_val : vec4<f16>= vec4<f16>(f16(U.f0.w));
  out0_final = out0 * second_val;}
  }
  textureStore(dst_tensor_image2d, vec2<i32>((X), ((Y) * U.i1.z + (slice0))), vec4<f32>(out0_final));
};
  {

   var out1_final : vec4<f16>;
  {  
  {var second_val : vec4<f16>= vec4<f16>(f16(U.f0.w));
  out1_final = out1 * second_val;}
  }
  textureStore(dst_tensor_image2d, vec2<i32>((X), ((Y) * U.i1.z + (slice1))), vec4<f32>(out1_final));
};
}