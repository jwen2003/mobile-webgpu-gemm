struct Dimensions { M: u32, N: u32, K: u32, padding: u32 };
@group(0) @binding(0) var<storage, read> A: array<f32>;
@group(0) @binding(1) var<storage, read> B: array<f32>;
@group(0) @binding(2) var<storage, read_write> C: array<f32>;
@group(0) @binding(3) var<uniform> dims: Dimensions;
var<workgroup> tileA: array<f32, 256>;
var<workgroup> tileB: array<f32, 256>;
@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) id: vec3<u32>,
        @builtin(local_invocation_id) local: vec3<u32>) {
  let row = id.y;
  let column = id.x;
  let slot = local.y * 16u + local.x;
  var sum: f32 = 0.0;
  // Uniform K loop. Out-of-output-range invocations still load and reach BOTH barriers.
  for (var baseK: u32 = 0u; baseK < dims.K; baseK = baseK + 16u) {
    let aK = baseK + local.x;
    let bK = baseK + local.y;
    tileA[slot] = 0.0;
    tileB[slot] = 0.0;
    if (row < dims.M && aK < dims.K) { tileA[slot] = A[row * dims.K + aK]; }
    if (bK < dims.K && column < dims.N) { tileB[slot] = B[bK * dims.N + column]; }
    workgroupBarrier();
    for (var k: u32 = 0u; k < 16u; k = k + 1u) {
      sum = sum + tileA[local.y * 16u + k] * tileB[k * 16u + local.x];
    }
    workgroupBarrier();
  }
  if (row < dims.M && column < dims.N) { C[row * dims.N + column] = sum; }
}
