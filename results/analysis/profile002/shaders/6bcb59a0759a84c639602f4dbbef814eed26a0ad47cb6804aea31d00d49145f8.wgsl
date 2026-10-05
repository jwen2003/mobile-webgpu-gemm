enable f16;
@id(0) override WORKGROUP_SIZE_X: i32;
@id(1) override WORKGROUP_SIZE_Y: i32;
@id(2) override WORKGROUP_SIZE_Z: i32;
@group(0) @binding(0) var cond_tensor_image2d : texture_2d<i32>;
@group(0) @binding(1) var dst_tensor_image2d : texture_storage_2d<rgba32sint, write>;
@group(0) @binding(2) var true_tensor_image2d : texture_2d<i32>;
struct false_tensor_buffer_vector {
  data: array<vec4<i32>>,
};
@group(0) @binding(3) var<storage, read> false_tensor_buffer : false_tensor_buffer_vector;
struct Scalars {
  i0 : vec4<i32>,
  i1 : vec4<i32>,
  i2 : vec4<i32>,
  i3 : vec4<i32>,
};
@group(0) @binding(4) var<uniform> U: Scalars;
@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y, WORKGROUP_SIZE_Z)
fn main(@builtin(global_invocation_id) reserved_gid : vec3<u32>) {
  var X : i32= i32(reserved_gid.x);

  var Y : i32= i32(reserved_gid.y);
  var Z : i32= i32(reserved_gid.z);
  if (X >= U.i1.z || Y >= U.i1.x || Z >= U.i1.y) {
    return;
  }

  
  var true_x : i32=  select( X,  0 , U.i3.z == 1 );
  var true_y : i32=  select( Y,  0 , U.i3.x == 1 );
  var true_z : i32=  select( Z,  0 , U.i2.w == 1 );
  var true_val : vec4<i32>= textureLoad(true_tensor_image2d, vec2<i32>((true_x), ((true_y) * U.i3.y + (true_z))), 0);
  if (U.i2.w == 1) {
    true_val.y = true_val.x;
    true_val.z = true_val.x;
    true_val.w = true_val.x;
  }

  
  var false_x : i32=  select( X,  0 , U.i2.y == 1 );
  var false_y : i32=  select( Y,  0 , U.i2.x == 1 );
  var false_z : i32=  select( Z,  0 , U.i1.w == 1 );
  var false_val : vec4<i32>= false_tensor_buffer.data[(((false_z) * U.i2.x + (false_y)) * U.i2.y + (false_x))];
  if (U.i1.w == 1) {
    false_val.y = false_val.x;
    false_val.z = false_val.x;
    false_val.w = false_val.x;
  }

  
  var cond_x : i32=  select( X,  0 , U.i0.w == 1 );
  var cond_y : i32=  select( Y,  0 , U.i0.y == 1 );
  var cond_z : i32=  select( Z,  0 , U.i0.x == 1 );
  var cond_val : vec4<bool>= vec4<bool>(textureLoad(cond_tensor_image2d, vec2<i32>((cond_x), ((cond_y) * U.i0.z + (cond_z))), 0));
  if (U.i0.x == 1) {
    cond_val.y = cond_val.x;
    cond_val.z = cond_val.x;
    cond_val.w = cond_val.x;
  }

  var res : vec4<i32>;
  res.x =  select( false_val.x,  true_val.x , cond_val.x );
  res.y =  select( false_val.y,  true_val.y , cond_val.y );
  res.z =  select( false_val.z,  true_val.z , cond_val.z );
  res.w =  select( false_val.w,  true_val.w , cond_val.w );
  {

   var res_final : vec4<i32>;
  {  
  {var second_val : vec4<i32>= vec4<i32>(U.i2.z);
  res_final = res * second_val;}
  }
  textureStore(dst_tensor_image2d, vec2<i32>((X), ((Y) * U.i1.y + (Z))), res_final);
};
}
