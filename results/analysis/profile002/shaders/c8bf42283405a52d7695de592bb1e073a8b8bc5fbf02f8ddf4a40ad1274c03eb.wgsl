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
@group(0) @binding(1) var src_tensor_1_link1_image2d : texture_2d<u32>;
@group(0) @binding(2) var src_tensor_image2d : texture_2d<f32>;
struct params_buffer_vector {
  data: array<i32>,
};
@group(0) @binding(3) var<storage, read> params_buffer : params_buffer_vector;
struct weights_buffer_vector {
  data: array<vec4<u32>>,
};
@group(0) @binding(4) var<storage, read> weights_buffer : weights_buffer_vector;
struct weights_scale_buffer_vector {
  data: array<vec4<f16>>,
};
@group(0) @binding(5) var<storage, read> weights_scale_buffer : weights_scale_buffer_vector;
struct Scalars {
  f0 : vec4<f32>,
  i1 : vec4<i32>,
  i2 : vec4<i32>,
};
@group(0) @binding(6) var<uniform> U: Scalars;
var<workgroup> temp : array<vec4<f16>, 32>;
@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y, WORKGROUP_SIZE_Z)
fn main(@builtin(global_invocation_id) reserved_gid : vec3<u32>,
@builtin(local_invocation_id) reserved_lid : vec3<u32>,
@builtin(workgroup_id) reserved_group_id : vec3<u32>) {
  var dst_s : i32= i32(reserved_gid.x);
  var dst_end_slice : i32= min((((params_buffer.data[U.i1.x] + 32 - 1) / 32) * 32) / 4, U.i1.y);
  var dst_s_wg_offset : i32= i32(reserved_group_id.x) * WORKGROUP_SIZE_X;
  if (dst_s_wg_offset >= dst_end_slice) {return;}
  var weights_batch_id : i32= i32(reserved_group_id.z);
  var s0 : vec4<f16>= vec4<f16>(0.0);
  var s1 : vec4<f16>= vec4<f16>(0.0);
  var s2 : vec4<f16>= vec4<f16>(0.0);
  var s3 : vec4<f16>= vec4<f16>(0.0);
  var tid : vec2<i32>;
  tid.x = i32(reserved_lid.x);
  tid.y = i32(reserved_lid.y);
  if (dst_s < U.i1.y) {
  var weight_scale : vec4<f16>= weights_scale_buffer.data[(dst_s)];
  var weight_zero_point : vec4<f16>= vec4<f16>(0.0);
  var weight_bias : vec4<f16>= -weight_scale * (vec4<f16>(128) + weight_zero_point);
  for (var src_s : i32= tid.y; src_s < U.i2.x; src_s += 16) {
    var v0 : vec4<f16>= vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((0), ((weights_batch_id) * U.i2.x + (src_s))), 0));
    var v1 : vec4<f16>= vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((1), ((weights_batch_id) * U.i2.x + (src_s))), 0));
    var v2 : vec4<f16>= vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((2), ((weights_batch_id) * U.i2.x + (src_s))), 0));
    var v3 : vec4<f16>= vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((3), ((weights_batch_id) * U.i2.x + (src_s))), 0));
    var w0 : vec4<f16>;var w1 : vec4<f16>;var w2 : vec4<f16>;var w3 : vec4<f16>;
    var linear_i4o4 : i32= src_s * U.i1.y + dst_s;
    linear_i4o4 += weights_batch_id * U.i2.x * U.i1.y;
    var w : vec4<u32>= weights_buffer.data[linear_i4o4];
    
  w0.x = f16((w.x) & 255u);
  w0.y = f16((w.x >>  8u) & 255u);
  w0.z = f16((w.x >> 16u) & 255u);
  w0.w = f16((w.x >> 24u) & 255u);
  w1.x = f16((w.y) & 255u);
  w1.y = f16((w.y >>  8u) & 255u);
  w1.z = f16((w.y >> 16u) & 255u);
  w1.w = f16((w.y >> 24u) & 255u);
  w2.x = f16((w.z) & 255u);
  w2.y = f16((w.z >>  8u) & 255u);
  w2.z = f16((w.z >> 16u) & 255u);
  w2.w = f16((w.z >> 24u) & 255u);
  w3.x = f16((w.w) & 255u);
  w3.y = f16((w.w >>  8u) & 255u);
  w3.z = f16((w.w >> 16u) & 255u);
  w3.w = f16((w.w >> 24u) & 255u);
;
    w0 = w0 * weight_scale.x + weight_bias.x;
    w1 = w1 * weight_scale.y + weight_bias.y;
    w2 = w2 * weight_scale.z + weight_bias.z;
    w3 = w3 * weight_scale.w + weight_bias.w;
    s0.x += dot(v0, w0);
    s0.y += dot(v0, w1);
    s0.z += dot(v0, w2);
    s0.w += dot(v0, w3);
    s1.x += dot(v1, w0);
    s1.y += dot(v1, w1);
    s1.z += dot(v1, w2);
    s1.w += dot(v1, w3);
    s2.x += dot(v2, w0);
    s2.y += dot(v2, w1);
    s2.z += dot(v2, w2);
    s2.w += dot(v2, w3);
    s3.x += dot(v3, w0);
    s3.y += dot(v3, w1);
    s3.z += dot(v3, w2);
    s3.w += dot(v3, w3);
  } 
  } 
  temp[tid.x * 16 + tid.y] = s0;
  for (var ystride : i32= 16 / 2; ystride > 0; ystride /= 2) {
    workgroupBarrier();
    if (tid.y < ystride) {
      s0 += temp[tid.x * 16 + tid.y + ystride];
      temp[tid.x * 16 + tid.y] = s0;
    }
  }
  workgroupBarrier();
  temp[tid.x * 16 + tid.y] = s1;
  for (var ystride : i32= 16 / 2; ystride > 0; ystride /= 2) {
    workgroupBarrier();
    if (tid.y < ystride) {
      s1 += temp[tid.x * 16 + tid.y + ystride];
      temp[tid.x * 16 + tid.y] = s1;
    }
  }
  workgroupBarrier();
  temp[tid.x * 16 + tid.y] = s2;
  for (var ystride : i32= 16 / 2; ystride > 0; ystride /= 2) {
    workgroupBarrier();
    if (tid.y < ystride) {
      s2 += temp[tid.x * 16 + tid.y + ystride];
      temp[tid.x * 16 + tid.y] = s2;
    }
  }
  workgroupBarrier();
  temp[tid.x * 16 + tid.y] = s3;
  for (var ystride : i32= 16 / 2; ystride > 0; ystride /= 2) {
    workgroupBarrier();
    if (tid.y < ystride) {
      s3 += temp[tid.x * 16 + tid.y + ystride];
      temp[tid.x * 16 + tid.y] = s3;
    }
  }
  if (dst_s >= U.i1.y) {return;}
  if (tid.y != 0) {return;}
  if (0 < U.i1.z) {
  var res_value : vec4<f16>= vec4<f16>(s0);
  {

   var res_value_final : vec4<f16>;
  {  
  {var second_value : vec4<bool>= vec4<bool>(textureLoad(src_tensor_1_link1_image2d, vec2<i32>((0), ((0) * U.i1.w + ((dst_s)))), 0));
  
        res_value_final.x =  select( res_value.x,  f16(U.f0.x) , second_value.x );
        res_value_final.y =  select( res_value.y,  f16(U.f0.x) , second_value.y );
        res_value_final.z =  select( res_value.z,  f16(U.f0.x) , second_value.z );
        res_value_final.w =  select( res_value.w,  f16(U.f0.x) , second_value.w );
    }
  }
  textureStore(dst_tensor_image2d, vec2<i32>((0), ((weights_batch_id) * U.i1.y + (dst_s))), vec4<f32>(res_value_final));
};
  }
  if (-1 < U.i1.z) {
  var res_value : vec4<f16>= vec4<f16>(s1);
  {

   var res_value_final : vec4<f16>;
  {  
  {var second_value : vec4<bool>= vec4<bool>(textureLoad(src_tensor_1_link1_image2d, vec2<i32>((0), ((0) * U.i1.w + ((dst_s)))), 0));
  
        res_value_final.x =  select( res_value.x,  f16(U.f0.x) , second_value.x );
        res_value_final.y =  select( res_value.y,  f16(U.f0.x) , second_value.y );
        res_value_final.z =  select( res_value.z,  f16(U.f0.x) , second_value.z );
        res_value_final.w =  select( res_value.w,  f16(U.f0.x) , second_value.w );
    }
  }
  textureStore(dst_tensor_image2d, vec2<i32>((1), ((weights_batch_id) * U.i1.y + (dst_s))), vec4<f32>(res_value_final));
};
  }
  if (-2 < U.i1.z) {
  var res_value : vec4<f16>= vec4<f16>(s2);
  {

   var res_value_final : vec4<f16>;
  {  
  {var second_value : vec4<bool>= vec4<bool>(textureLoad(src_tensor_1_link1_image2d, vec2<i32>((0), ((0) * U.i1.w + ((dst_s)))), 0));
  
        res_value_final.x =  select( res_value.x,  f16(U.f0.x) , second_value.x );
        res_value_final.y =  select( res_value.y,  f16(U.f0.x) , second_value.y );
        res_value_final.z =  select( res_value.z,  f16(U.f0.x) , second_value.z );
        res_value_final.w =  select( res_value.w,  f16(U.f0.x) , second_value.w );
    }
  }
  textureStore(dst_tensor_image2d, vec2<i32>((2), ((weights_batch_id) * U.i1.y + (dst_s))), vec4<f32>(res_value_final));
};
  }
  if (-3 < U.i1.z) {
  var res_value : vec4<f16>= vec4<f16>(s3);
  {

   var res_value_final : vec4<f16>;
  {  
  {var second_value : vec4<bool>= vec4<bool>(textureLoad(src_tensor_1_link1_image2d, vec2<i32>((0), ((0) * U.i1.w + ((dst_s)))), 0));
  
        res_value_final.x =  select( res_value.x,  f16(U.f0.x) , second_value.x );
        res_value_final.y =  select( res_value.y,  f16(U.f0.x) , second_value.y );
        res_value_final.z =  select( res_value.z,  f16(U.f0.x) , second_value.z );
        res_value_final.w =  select( res_value.w,  f16(U.f0.x) , second_value.w );
    }
  }
  textureStore(dst_tensor_image2d, vec2<i32>((3), ((weights_batch_id) * U.i1.y + (dst_s))), vec4<f32>(res_value_final));
};
  }
}
