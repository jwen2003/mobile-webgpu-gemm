import { statistics } from './timing_math.mjs';
export const INPUT_SEED = 0x6e6d0001, ORDER_SEED = 0x6e6d0017;
export const WORKGROUP = [8, 8, 1], PRIOR_GRID_NS = 65536;
export const SHAPES = [
  { id: 'scalar', M: 1, K: 1, N: 1, source: 'CORRECTNESS_SYNTHETIC', performance: false },
  { id: 'rectangular', M: 3, K: 5, N: 7, source: 'CORRECTNESS_SYNTHETIC', performance: false },
  { id: 'boundary', M: 17, K: 19, N: 23, source: 'CORRECTNESS_SYNTHETIC', performance: false },
  { id: 'representative-gemv', M: 1, K: 1024, N: 1024, source: 'REPRESENTATIVE_NOT_RECOVERED_RUNTIME_SHAPE', performance: true },
  { id: 'representative-gemm', M: 128, K: 1024, N: 1024, source: 'REPRESENTATIVE_NOT_RECOVERED_RUNTIME_SHAPE', performance: true },
];
export const TOLERANCES = Object.freeze({ integer: Object.freeze({ atol: 0, rtol: 0 }),
  fractional: Object.freeze({ atol: 0.002, rtol: 0.0002 }), relativeDenominatorFloor: 1e-8 });
export const REAL_SHADER = Object.freeze({ shaderId: 'shader-2630',
  sha256: 'ee9a0b2823d07f56fe2e9c50134dbc9c58f9f411dcfc11795869196870dd6036',
  sourcePath: 'results/analysis/profile002/shaders/ee9a0b2823d07f56fe2e9c50134dbc9c58f9f411dcfc11795869196870dd6036.wgsl',
  evidence: 'mat4x4<f16> weights; src_s reduction loop; vec4<f16> accumulators with fma; workgroup reduction',
  M: 'UNKNOWN', N: 'UNKNOWN', K: 'UNKNOWN', dtype: 'FP16 vector weights/accumulators; FP32 texture load/store conversion',
  layout: 'Packed mat4x4<f16> buffer, texture coordinates and symbolic U.i0 strides; global row-major M/N/K UNKNOWN',
  parameters: 'Eight unrolled vec4<f16> accumulators, src_s += 4, workgroup temp[32]; actual WG override constants UNKNOWN',
  equivalence: 'This FP32 dense non-fused GEMM is not an equivalent runtime replacement; no model speedup claim' });
export function rng(seed) {
  let state = seed >>> 0;
  if (state === 0) throw new Error('xorshift32 seed must be nonzero');
  return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return state >>> 0; };
}
export function inputs(shape, kind, seed = INPUT_SEED) {
  const next = rng(seed), value = kind === 'integer' ? () => (next() % 7) - 3
    : () => Math.fround(((next() % 2001) - 1000) / 1000);
  return { A: Float32Array.from({ length: shape.M * shape.K }, value),
    B: Float32Array.from({ length: shape.K * shape.N }, value) };
}
export function cpuReference({ M, N, K }, A, B) {
  // Independent i-k-j CPU traversal; binary64 accumulation from the stored FP32 inputs.
  const C = new Float64Array(M * N);
  for (let row = 0; row < M; row++) for (let k = 0; k < K; k++) {
    const a = A[row * K + k];
    for (let column = 0; column < N; column++) C[row * N + column] += a * B[k * N + column];
  }
  return C;
}
export function compare(actual, expected, kind) {
  if (actual.length !== expected.length) throw new Error('Readback element count mismatch');
  const { atol, rtol } = TOLERANCES[kind];
  let maxAbsoluteError = 0, maxRelativeError = 0, errorElementCount = 0, nonFiniteCount = 0;
  let worst = { index: 0, expected: expected[0] ?? null, actual: actual[0] ?? null };
  for (let i = 0; i < expected.length; i++) {
    if (!Number.isFinite(actual[i]) || !Number.isFinite(expected[i])) {
      nonFiniteCount++; errorElementCount++;
      if (nonFiniteCount === 1) worst = { index: i, expected: Number.isFinite(expected[i]) ? expected[i] : null,
        actual: Number.isFinite(actual[i]) ? actual[i] : null, actualRepresentation: String(actual[i]) };
      continue;
    }
    const absolute = Math.abs(actual[i] - expected[i]);
    const relative = absolute / Math.max(Math.abs(expected[i]), TOLERANCES.relativeDenominatorFloor);
    if (absolute > maxAbsoluteError) {
      maxAbsoluteError = absolute;
      if (!nonFiniteCount) worst = { index: i, expected: expected[i], actual: actual[i] };
    }
    maxRelativeError = Math.max(maxRelativeError, relative);
    if (absolute > atol + rtol * Math.abs(expected[i])) errorElementCount++;
  }
  return { status: errorElementCount ? 'FAIL' : 'PASS', elementCount: expected.length, atol, rtol,
    maxAbsoluteError: nonFiniteCount ? null : maxAbsoluteError, maxRelativeError: nonFiniteCount ? null : maxRelativeError,
    finiteMaxAbsoluteError: maxAbsoluteError, finiteMaxRelativeError: maxRelativeError,
    errorElementCount, nonFiniteCount, worst,
    relativeDenominator: 'max(abs(expected), 1e-8); acceptance uses absError <= atol + rtol*abs(expected), no denominator floor in acceptance' };
}
export function configurationOrder(seed = ORDER_SEED) {
  const result = SHAPES.filter(s => s.performance).map(s => ({ ...s })), next = rng(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() / 4294967296 * (i + 1)); [result[i], result[j]] = [result[j], result[i]];
  }
  return result.map((shape, configurationIndex) => ({ ...shape, configurationIndex }));
}
export function unsupported(shape, limits) {
  const { M, N, K } = shape, reasons = [];
  if (![M, N, K].every(v => Number.isSafeInteger(v) && v > 0 && v <= 0xffffffff)) return ['Invalid u32 shape'];
  for (const count of [M*K, K*N, M*N]) {
    if (!Number.isSafeInteger(count) || count > 0xffffffff) reasons.push('u32 index range exceeded');
    if (count*4 > limits.maxBufferSize || count*4 > limits.maxStorageBufferBindingSize) reasons.push('Buffer/binding byte limit exceeded');
  }
  if (limits.maxComputeWorkgroupSizeX < 8 || limits.maxComputeWorkgroupSizeY < 8 || limits.maxComputeWorkgroupSizeZ < 1
      || limits.maxComputeInvocationsPerWorkgroup < 64) reasons.push('8x8x1 workgroup unsupported');
  if (Math.ceil(N/8) > limits.maxComputeWorkgroupsPerDimension || Math.ceil(M/8) > limits.maxComputeWorkgroupsPerDimension)
    reasons.push('Dispatch dimension limit exceeded');
  if (limits.maxStorageBuffersPerShaderStage < 3 || limits.maxUniformBuffersPerShaderStage < 1
      || limits.maxUniformBufferBindingSize < 16 || limits.maxBindGroups < 1 || limits.maxBindingsPerBindGroup < 4)
    reasons.push('Binding/uniform limit exceeded');
  return [...new Set(reasons)];
}
export function timingStatistics(samples, shape) {
  const measured = samples.filter(s => s.phase === 'measured');
  const durations = measured.filter(s => s.gpuPassDurationNs !== null).map(s => s.gpuPassDurationNs);
  const gpu = statistics(durations), wall = statistics(measured.map(s => s.submitToCompletionWallMs));
  let grid = 0n;
  const gcd = (a,b) => { while (b) [a,b] = [b,a%b]; return a; };
  const origin = measured.find(s => s.startTimestamp !== null)?.startTimestamp;
  for (const s of measured) if (s.startTimestamp !== null) for (const timestamp of [s.startTimestamp,s.endTimestamp]) {
    let delta = BigInt(timestamp) - BigInt(origin); if (delta < 0n) delta = -delta; grid = gcd(grid,delta);
  }
  const prior = PRIOR_GRID_NS, observed = Number(grid);
  const conservativeGrid = Math.max(prior, observed);
  const resolutionLimited = Boolean(gpu && (gpu.zeroCount > 0 || gpu.median < 10 * conservativeGrid));
  const correctnessPassed = measured.every(s => s.correctness?.status === 'PASS');
  const complete = measured.length === 30 && durations.length === 30 && correctnessPassed;
  const nominalFlops = 2*shape.M*shape.N*shape.K;
  return { gpuPassNs: gpu, submitToCompletionWallMs: wall, observedTimestampDifferenceGcdNs: grid.toString(),
    priorGridNs: prior, resolutionPolicy: 'RESOLUTION_LIMITED if any measured zero or median < 10*max(priorGrid, observedGCD); GCD is finite-sample evidence, not hardware resolution',
    status: !gpu ? 'NOT_MEASURED' : resolutionLimited ? 'RESOLUTION_LIMITED' : 'PRELIMINARY',
    completeMeasuredSet: complete, nominalFlops, flopConvention: '2*M*N*K counts one multiply + one add per K, including conventional initial addition',
    effectiveGflops: complete && !resolutionLimited && gpu.median > 0 ? nominalFlops / gpu.median : null,
    effectiveGflopsMeaning: 'Nominal FLOPs divided by compute-pass median ns; not pure arithmetic time, hardware peak utilization or bottleneck proof',
    measuredCorrectnessPassed: correctnessPassed, medianMethod: 'even count midpoint', p95Method: 'nearest-rank sorted[ceil(0.95*n)-1]' };
}
