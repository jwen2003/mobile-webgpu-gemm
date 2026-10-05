enable f16;
@id(0) override WORKGROUP_SIZE_X: i32;
@id(1) override WORKGROUP_SIZE_Y: i32;
@id(2) override WORKGROUP_SIZE_Z: i32;
@group(0) @binding(0) var dst_tensor_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(1) var src_tensor_1_link1_image2d : texture_2d<f32>;
@group(0) @binding(2) var src_tensor_image2d : texture_2d<f32>;
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
  var src : vec4<f16>= vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((X), ((Y) * U.i1.x + (S))), 0));
  {

   var src_final : vec4<f16>;
  {  
  
   var interm_value_link1 : vec4<f16>;
  {  var erf_in : vec4<f16>= src * vec4<f16>(0.707106781186548);
    var erf_out : vec4<f16>;
  
    { 
      var sign_val : vec4<f16>= sign(erf_in);
      var abs_val : vec4<f16>= abs(erf_in);
      var a1 : f16= f16(0.254829592);
      var a2 : f16= f16(-0.284496736);
      var a3 : f16= f16(1.421413741);
      var a4 : f16= f16(-1.453152027);
      var a5 : f16= f16(1.061405429);
      var p : f16= f16(0.3275911);
      var t : vec4<f16>= f16(1.0) / (f16(1.0) + p * abs_val);
      var y : vec4<f16>= f16(1.0) - ((((a5*t + a4)*t + a3)*t + a2)*t + a1)*t*exp(-abs_val*abs_val);
      erf_out = y * sign_val;
    }
    interm_value_link1 = vec4<f16>(0.5) * src * (vec4<f16>(1.0) + erf_out);
  }
  {var second_value : vec4<f16>= vec4<f16>(textureLoad(src_tensor_1_link1_image2d, vec2<i32>(((X)), (((Y)) * U.i0.w + ((S)))), 0));
  src_final = interm_value_link1 * second_value;}
  }
  textureStore(dst_tensor_image2d, vec2<i32>((X), ((Y) * U.i0.y + (S))), vec4<f32>(src_final));
};
} 
