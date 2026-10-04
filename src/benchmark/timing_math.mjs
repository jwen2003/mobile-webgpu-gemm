export const SEED = 0x0017a001;
export function configurationOrder(seed = SEED) {
  const configs = [1025, 65536, 1048576].flatMap(n => [1, 32].map(dispatchesPerPass => ({ n, dispatchesPerPass })));
  let state = seed >>> 0;
  const random = () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  for (let i = configs.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [configs[i], configs[j]] = [configs[j], configs[i]];
  }
  return configs.map((config, configurationIndex) => ({ ...config, configurationIndex }));
}
export function statistics(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  return { count, median: count % 2 ? sorted[(count - 1) / 2]
    : (sorted[count / 2 - 1] + sorted[count / 2]) / 2,
  p95: sorted[Math.ceil(0.95 * count) - 1], min: sorted[0], max: sorted[count - 1],
  zeroCount: values.filter(value => value === 0).length };
}
export function timestampInterval(begin, end) {
  const delta = end - begin;
  if (delta > BigInt(Number.MAX_SAFE_INTEGER) || delta < -BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Timestamp delta cannot be represented exactly as a JS integer');
  }
  return { startTimestamp: begin.toString(), endTimestamp: end.toString(),
    gpuPassDurationNs: Number(delta), gpuPassDurationMs: Number(delta) / 1e6 };
}
export function reference(i) { return (i % 31) - 15 + ((i * 7) % 23) - 11; }
export function checkOutput(actual, n) {
  let maxAbsoluteError = 0, errorElementCount = 0, nonFiniteCount = 0;
  for (let i = 0; i < n; i++) {
    if (!Number.isFinite(actual[i])) { nonFiniteCount++; errorElementCount++; continue; }
    const error = Math.abs(actual[i] - reference(i));
    maxAbsoluteError = Math.max(maxAbsoluteError, error);
    if (error !== 0) errorElementCount++;
  }
  return { status: errorElementCount ? 'FAIL' : 'PASS', elementCount: n,
    maxAbsoluteError: nonFiniteCount ? null : maxAbsoluteError, errorElementCount, nonFiniteCount,
    lastElement: { index: n - 1, expected: reference(n - 1), actual: Number.isFinite(actual[n - 1]) ? actual[n - 1] : null } };
}
