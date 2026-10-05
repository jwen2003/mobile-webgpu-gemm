enable f16;
@id(0) override WORKGROUP_SIZE_X: i32;
@id(1) override WORKGROUP_SIZE_Y: i32;
@id(2) override WORKGROUP_SIZE_Z: i32;
@group(0) @binding(0) var dst_tensor_0_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(1) var dst_tensor_1_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(2) var dst_tensor_2_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(3) var dst_tensor_3_image2d : texture_storage_2d<rgba16float, write>;
@group(0) @binding(4) var src_tensor_image2d : texture_2d<f32>;
struct Scalars {
  i0 : vec4<i32>,
  i1 : vec4<i32>,
  i2 : vec4<i32>,
};
@group(0) @binding(5) var<uniform> U: Scalars;
@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y, WORKGROUP_SIZE_Z)
fn main(@builtin(global_invocation_id) reserved_gid : vec3<u32>) {
  var X : i32= i32(reserved_gid.x);
  if (X >= U.i2.y) {return;}
  var Y : i32= i32(reserved_gid.y);
  if (Y >= 1) {return;}
  var S : i32= i32(reserved_gid.z);
  if (S >= U.i2.x) {return;}
  var src_counter : i32= 0;
    {var i : i32= 0;
  loop {
    if (!( i < U.i0.x)) {break;}
    
    var result : vec4<f16>= vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((X), ((src_counter) * U.i2.x + (S))), 0));
    textureStore(dst_tensor_0_image2d, vec2<i32>((X), ((i) * U.i0.y + (S))), vec4<f32>(result));
  ;
    continuing {
       i=i+1;
       src_counter++;
    }
  }
}
    {var i : i32= 0;
  loop {
    if (!( i < U.i0.z)) {break;}
    
    var result : vec4<f16>= vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((X), ((src_counter) * U.i2.x + (S))), 0));
    textureStore(dst_tensor_1_image2d, vec2<i32>((X), ((i) * U.i0.w + (S))), vec4<f32>(result));
  ;
    continuing {
       i=i+1;
       src_counter++;
    }
  }
}
    {var i : i32= 0;
  loop {
    if (!( i < U.i1.x)) {break;}
    
    var result : vec4<f16>= vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((X), ((src_counter) * U.i2.x + (S))), 0));
    textureStore(dst_tensor_2_image2d, vec2<i32>((X), ((i) * U.i1.y + (S))), vec4<f32>(result));
  ;
    continuing {
       i=i+1;
       src_counter++;
    }
  }
}
    {var i : i32= 0;
  loop {
    if (!( i < U.i1.z)) {break;}
    
    var result : vec4<f16>= vec4<f16>(textureLoad(src_tensor_image2d, vec2<i32>((X), ((src_counter) * U.i2.x + (S))), 0));
    textureStore(dst_tensor_3_image2d, vec2<i32>((X), ((i) * U.i1.w + (S))), vec4<f32>(result));
  ;
    continuing {
       i=i+1;
       src_counter++;
    }
  }
}
}
