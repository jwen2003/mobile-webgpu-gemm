struct Dimensions { M: u32, N: u32, K: u32, padding: u32 };
@group(0) @binding(0) var<storage, read> A: array<f32>;
@group(0) @binding(1) var<storage, read> B: array<f32>;
@group(0) @binding(2) var<storage, read_write> C: array<f32>;
@group(0) @binding(3) var<uniform> dims: Dimensions;
@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let column = id.x;
  let row = id.y;
  if (row >= dims.M || column >= dims.N) { return; }
  var sum: f32 = 0.0;
  for (var k: u32 = 0u; k < dims.K; k = k + 1u) {
    sum = sum + A[row * dims.K + k] * B[k * dims.N + column];
  }
  C[row * dims.N + column] = sum;
}
