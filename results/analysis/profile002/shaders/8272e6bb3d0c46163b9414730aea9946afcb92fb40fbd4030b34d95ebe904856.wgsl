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
@group(0) @binding(1) var src_tensor_image2d : texture_2d<f32>;
struct weights_buffer_vector {
  data: array<mat4x4<f16>>,
};
@group(0) @binding(2) var<storage, read> weights_buffer : weights_buffer_vector;
struct Scalars {
  i0 : vec4<i32>,
};
@group(0) @binding(3) var<uniform> U: Scalars;
var<workgroup> temp : array<vec4<f16>, 32>;
@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y, WORKGROUP_SIZE_Z)
fn main(@builtin(global_invocation_id) reserved_gid : vec3<u32>,
@builtin(local_invocation_id) reserved_lid : vec3<u32>,
@builtin(workgroup_id) reserved_group_id : vec3<u32>) {
  var dst_s : i32= i32(reserved_gid.x);
  var dst_end_slice : i32= U.i0.x;
  var dst_s_wg_offset : i32= i32(reserved_group_id.x) * WORKGROUP_SIZE_X;
  if (dst_s_wg_offset >= dst_end_slice) {return;}
  var s0 : vec4<f16>= vec4<f16>(0.0);
  var tid : vec2<i32>;
  tid.x = i32(reserved_lid.x);
  tid.y = i32(reserved_lid.y);
  if (dst_s < U.i0.x) {
  for (var src_s : i32= tid.y; src_s < U.i0.y; src_s += 8) {
    var v0 : vec4<f16>= vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((0), ((0) * U.i0.y + (src_s))), 0));
    var w0 : vec4<f16>;var w1 : vec4<f16>;var w2 : vec4<f16>;var w3 : vec4<f16>;
    var linear_i4o4 : i32= src_s * U.i0.x + dst_s;
      {
  var w : mat4x4<f16>= weights_buffer.data[linear_i4o4];
  w0 = vec4<f16>(w[0]);
  w1 = vec4<f16>(w[1]);
  w2 = vec4<f16>(w[2]);
  w3 = vec4<f16>(w[3]);
  };
    s0 = fma(vec4<f16>(v0.x), w0, s0);
    s0 = fma(vec4<f16>(v0.y), w1, s0);
    s0 = fma(vec4<f16>(v0.z), w2, s0);
    s0 = fma(vec4<f16>(v0.w), w3, s0);
  } 
  } 
  temp[tid.x * 8 + tid.y] = s0;
  for (var ystride : i32= 8 / 2; ystride > 0; ystride /= 2) {
    workgroupBarrier();
    if (tid.y < ystride) {
      s0 += temp[tid.x * 8 + tid.y + ystride];
      temp[tid.x * 8 + tid.y] = s0;
    }
  }
  if (dst_s >= U.i0.x) {return;}
  if (tid.y != 0) {return;}
  var res_value : vec4<f16>= vec4<f16>(s0);
  textureStore(dst_tensor_image2d, vec2<i32>((0), ((0) * U.i0.x + (dst_s))), vec4<f32>(res_value));
}
