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
var<workgroup> accum : array<vec4<f32>, 256>;
@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y, WORKGROUP_SIZE_Z)
fn main(@builtin(local_invocation_id) reserved_lid : vec3<u32>,
@builtin(workgroup_id) reserved_group_id : vec3<u32>) {
  var local_x : i32= i32(reserved_lid.x);
  var local_id : i32= local_x;
  var DST_X : i32= i32(reserved_group_id.x);
  var DST_Y : i32= i32(reserved_group_id.y);
  if (DST_Y >= U.i1.x || DST_X >= U.i1.z) {return;}
  var reducer : vec4<f32>= vec4<f32>(0.);
  var mask : vec4<f32>;
  mask.x =  select( f32(0.),  f32(1.) , (U.i2.x - 1) * 4 + 0 < U.i1.w );
  mask.y =  select( f32(0.),  f32(1.) , (U.i2.x - 1) * 4 + 1 < U.i1.w );
  mask.z =  select( f32(0.),  f32(1.) , (U.i2.x - 1) * 4 + 2 < U.i1.w );
  mask.w =  select( f32(0.),  f32(1.) , (U.i2.x - 1) * 4 + 3 < U.i1.w );
  for (var SRC_S : i32= local_x; SRC_S < U.i2.x; SRC_S += 256) {
    var last : bool= SRC_S == U.i2.x - 1;
    var mask_a : vec4<f32>=  select( vec4<f32>(1.),  mask , last );
    var src_val : vec4<f32>= textureLoad(src_tensor_image2d, vec2<i32>((DST_X), ((DST_Y) * U.i2.x + (SRC_S))), 0);
    src_val = src_val * src_val * mask_a;
    reducer += (src_val);;
  }
  reducer *= U.f0.x;
  accum[local_id] = reducer;
  workgroupBarrier();
  if (local_id < 64) {
    var t : i32= local_id * 4;
    var reduced : vec4<f32>= accum[t];
    reduced += (accum[t + 1]);;
    reduced += (accum[t + 2]);;
    reduced += (accum[t + 3]);;
    accum[t] = reduced;
  }
  workgroupBarrier();
  if (local_id < 16) {
    var t : i32= local_id * 16;
    var reduced : vec4<f32>= accum[t];
    reduced += (accum[t + 4]);;
    reduced += (accum[t + 8]);;
    reduced += (accum[t + 12]);;
    accum[t] = reduced;
  }
  workgroupBarrier();
  if (local_id != 0) { return; }
  reducer = accum[0];
  reducer += (accum[16]);;
  reducer += (accum[32]);;
  reducer += (accum[48]);;
  reducer += (accum[64]);;
  reducer += (accum[80]);;
  reducer += (accum[96]);;
  reducer += (accum[112]);;
  reducer += (accum[128]);;
  reducer += (accum[144]);;
  reducer += (accum[160]);;
  reducer += (accum[176]);;
  reducer += (accum[192]);;
  reducer += (accum[208]);;
  reducer += (accum[224]);;
  reducer += (accum[240]);;
  reducer *= U.f0.y;
  reducer.x += (reducer.y);;
  reducer.x += (reducer.z);;
  reducer.x += (reducer.w);;
  var result : vec4<f16>= vec4<f16>(reducer);
  {

   var result_final : vec4<f16>;
  {  
  
   var interm_value_link2_link1 : vec4<f16>;
  {interm_value_link2_link1 = sqrt(result);}
  {var second_val : vec4<f16>= vec4<f16>(f16(U.f0.z));
  result_final = max(interm_value_link2_link1, second_val);}
  }
  textureStore(dst_tensor_image2d, vec2<i32>((DST_X), ((DST_Y) * U.i1.y + (0))), vec4<f32>(result_final));
};
}
