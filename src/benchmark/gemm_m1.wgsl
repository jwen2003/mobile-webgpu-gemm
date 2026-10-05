struct Dimensions { M: u32, N: u32, K: u32, padding: u32 };
@group(0) @binding(0) var<storage, read> A: array<f32>;
@group(0) @binding(1) var<storage, read> B: array<f32>;
@group(0) @binding(2) var<storage, read_write> C: array<f32>;
@group(0) @binding(3) var<uniform> dims: Dimensions;
var<workgroup> aTile: array<f32, 64>;
@compute @workgroup_size(64, 1, 1)
fn main(@builtin(global_invocation_id) id: vec3<u32>,
        @builtin(local_invocation_id) local: vec3<u32>) {
  let n = id.x;
  var sum: f32 = 0.0;
  // Host accepts only M=1. Every lane loads A and reaches both barriers.
  for (var baseK: u32 = 0u; baseK < dims.K; baseK = baseK + 64u) {
    let loadK = baseK + local.x;
    aTile[local.x] = 0.0;
    if (loadK < dims.K) { aTile[local.x] = A[loadK]; }
    workgroupBarrier();
    if (n < dims.N) {
      for (var k: u32 = 0u; k < 64u; k = k + 1u) {
        let globalK = baseK + k;
        if (globalK < dims.K) {
          sum = sum + aTile[k] * B[globalK * dims.N + n];
        }
      }
    }
    workgroupBarrier();
  }
  if (n < dims.N) { C[n] = sum; }
}
