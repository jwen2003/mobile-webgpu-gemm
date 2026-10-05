enable f16;
@id(0) override WORKGROUP_SIZE_X: i32;
@id(1) override WORKGROUP_SIZE_Y: i32;
@id(2) override WORKGROUP_SIZE_Z: i32;
@group(0) @binding(0) var dst_tensor_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(1) var src_tensor_image2d : texture_2d<f32>;
@group(0) @binding(2) var weights0_image2d : texture_2d<f32>;
@group(0) @binding(3) var weights1_image2d : texture_2d<f32>;
@group(0) @binding(4) var weights2_image2d : texture_2d<f32>;
@group(0) @binding(5) var weights3_image2d : texture_2d<f32>;
struct Scalars {
  i0 : vec4<i32>,
};
@group(0) @binding(6) var<uniform> U: Scalars;
@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y, WORKGROUP_SIZE_Z)
fn main(@builtin(local_invocation_id) reserved_lid : vec3<u32>,
@builtin(workgroup_id) reserved_group_id : vec3<u32>) {
  var DST_X : i32= i32(reserved_group_id.y) * WORKGROUP_SIZE_X + i32(reserved_lid.x);
  var DST_Y : i32= i32(reserved_group_id.z) * WORKGROUP_SIZE_Y + i32(reserved_lid.y);
  var DST_S : i32= i32(reserved_group_id.x);
  DST_S *= 2;
  if (DST_S >= U.i0.y) {return;}
  var w_batch_id : i32= DST_Y;
  if (DST_X >= U.i0.z || DST_Y >= U.i0.x || DST_S >= U.i0.y) {
    return;
  }
  var r_w0_h0_s0 : vec4<f16>= vec4<f16>(0.);
  var r_w0_h0_s1 : vec4<f16>= vec4<f16>(0.);
  var xc0 : i32= DST_X + 0;
  var yc0 : i32= DST_Y + 0;
  var s : i32= 0;
  loop {
      var f0 : vec4<f16>= vec4<f16>(textureLoad(weights0_image2d, vec2<i32>((DST_S + 0), (w_batch_id * U.i0.w + s)), 0));
      var f1 : vec4<f16>= vec4<f16>(textureLoad(weights1_image2d, vec2<i32>((DST_S + 0), (w_batch_id * U.i0.w + s)), 0));
      var f2 : vec4<f16>= vec4<f16>(textureLoad(weights2_image2d, vec2<i32>((DST_S + 0), (w_batch_id * U.i0.w + s)), 0));
      var f3 : vec4<f16>= vec4<f16>(textureLoad(weights3_image2d, vec2<i32>((DST_S + 0), (w_batch_id * U.i0.w + s)), 0));
        var f4 : vec4<f16>= vec4<f16>(textureLoad(weights0_image2d, vec2<i32>((DST_S + 1), (w_batch_id * U.i0.w + s)), 0));
      var f5 : vec4<f16>= vec4<f16>(textureLoad(weights1_image2d, vec2<i32>((DST_S + 1), (w_batch_id * U.i0.w + s)), 0));
      var f6 : vec4<f16>= vec4<f16>(textureLoad(weights2_image2d, vec2<i32>((DST_S + 1), (w_batch_id * U.i0.w + s)), 0));
      var f7 : vec4<f16>= vec4<f16>(textureLoad(weights3_image2d, vec2<i32>((DST_S + 1), (w_batch_id * U.i0.w + s)), 0));
      var src_w0_h0 : vec4<f16>;
    src_w0_h0 = vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((xc0), ((yc0) * U.i0.w + (s))), 0));
    s += 1;
    r_w0_h0_s0 += f0 * src_w0_h0.x;
    r_w0_h0_s0 += f1 * src_w0_h0.y;
    r_w0_h0_s0 += f2 * src_w0_h0.z;
    r_w0_h0_s0 += f3 * src_w0_h0.w;
    r_w0_h0_s1 += f4 * src_w0_h0.x;
    r_w0_h0_s1 += f5 * src_w0_h0.y;
    r_w0_h0_s1 += f6 * src_w0_h0.z;
    r_w0_h0_s1 += f7 * src_w0_h0.w;
  if(! (s < U.i0.w)){break;}
} ;
  if (DST_S + 0 >= U.i0.y) {return;}
  {
    var bias_val : vec4<f16>= vec4<f16>(0.0);
    if (DST_S < 0) {
      bias_val = vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((0), ((0) * U.i0.w + (0))), 0));
    }
  {
    var res : vec4<f16>= vec4<f16>(r_w0_h0_s0);
    res += bias_val;
    textureStore(dst_tensor_image2d, vec2<i32>((DST_X + 0), ((DST_Y + 0) * U.i0.y + (DST_S + 0))), vec4<f32>(res));
  }
  }
  if (DST_S + 1 >= U.i0.y) {return;}
  {
    var bias_val : vec4<f16>= vec4<f16>(0.0);
    if (DST_S < 0) {
      bias_val = vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((0), ((0) * U.i0.w + (0))), 0));
    }
  {
    var res : vec4<f16>= vec4<f16>(r_w0_h0_s1);
    res += bias_val;
    textureStore(dst_tensor_image2d, vec2<i32>((DST_X + 0), ((DST_Y + 0) * U.i0.y + (DST_S + 1))), vec4<f32>(res));
  }
  }
}
