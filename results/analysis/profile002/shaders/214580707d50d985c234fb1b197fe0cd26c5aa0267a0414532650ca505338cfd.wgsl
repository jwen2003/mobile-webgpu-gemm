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
var<workgroup> shared_mem : array<vec2<f32>, 64>;
@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y, WORKGROUP_SIZE_Z)
fn main(@builtin(global_invocation_id) reserved_gid : vec3<u32>,
@builtin(local_invocation_id) reserved_lid : vec3<u32>) {
var X : i32= i32(reserved_gid.x);
  var Y : i32= i32(reserved_gid.y);
  var private_sum4_sq : vec4<f32>= vec4<f32>(0.0);
  var local_id : i32= i32(reserved_lid.z);
  var reduction_group_size : i32= WORKGROUP_SIZE_Z;

  var private_sum4 : vec4<f32>= vec4<f32>(0.0);
  for (var S : i32= local_id; S < U.i2.x; S += reduction_group_size) {
    var x_clamped : i32= min(X, U.i2.y - 1);
    var y_clamped : i32= min(Y, U.i1.w - 1);
    var t : vec4<f32>= textureLoad(src_tensor_image2d, vec2<i32>((x_clamped), ((y_clamped) * U.i2.x + (S))), 0);
    private_sum4 += t;
    private_sum4_sq += t * t;
  }
  var sum : vec2<f32>;
  sum.x = dot(private_sum4, vec4<f32>(1.0));
  sum.y = dot(private_sum4_sq, vec4<f32>(1.0));

  {  
    shared_mem[local_id] = sum;
    workgroupBarrier();
    
    var reduction_size : i32= 64;
    while (reduction_size > 1) {
      var active_thread_limit : i32= reduction_size / 2;
      var offset : i32= (reduction_size + 1) / 2;
      if (local_id < active_thread_limit) {
        sum += shared_mem[local_id + offset];
        shared_mem[local_id] = sum;
      }
      workgroupBarrier();
      reduction_size = offset;
    }
    sum = shared_mem[0];
  }
  var mean : f32= sum.x * U.f0.x;
  var mean_sq : f32= sum.y * U.f0.x;
  var variance : f32= max(0.0, mean_sq - mean * mean);
  
  if (X >= U.i1.z) { return; }
  if (Y >= U.i1.x) { return; }

  var cutoff : f32= mean + U.f0.y * sqrt(variance);
  for (var S : i32= local_id; S < U.i2.x; S += reduction_group_size) {
    var t : vec4<f32>= textureLoad(src_tensor_image2d, vec2<i32>((X), ((Y) * U.i2.x + (S))), 0);

    var t_cut : vec4<f32>= max(t, vec4<f32>(cutoff)) - vec4<f32>(cutoff);
    var result : vec4<f16>= vec4<f16>(t_cut);
    {

   var result_final : vec4<f16>;
  {  
  {  var erf_in : vec4<f16>= result * vec4<f16>(0.707106781186548);
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
    result_final = vec4<f16>(0.5) * result * (vec4<f16>(1.0) + erf_out);
  }
  }
  textureStore(dst_tensor_image2d, vec2<i32>((X), ((Y) * U.i1.y + (S))), vec4<f32>(result_final));
};

  }
}