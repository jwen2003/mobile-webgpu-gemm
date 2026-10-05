// Fake-native integration test; synthetic timestamps are never phone evidence.
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { CountObserver } from '../src/profiling/count_observer.mjs';
import { PassTimestamps, createTimestampDevice, timestampSummary } from '../src/profiling/pass_timestamps.mjs';
globalThis.crypto ??= webcrypto;
globalThis.GPUBufferUsage = { QUERY_RESOLVE: 1, COPY_SRC: 2, COPY_DST: 4, MAP_READ: 8 };
globalThis.GPUMapMode = { READ: 1 };
const base = 9007199254740993n;
class Buffer {
  constructor(d) { Object.assign(this, d); this.bytes = new ArrayBuffer(d.size); this.mapState = 'unmapped'; }
  destroy() { this.destroyed = true; }
  async mapAsync() { this.mapState = 'mapped'; }
  getMappedRange() { return this.bytes; }
  unmap() { this.mapState = 'unmapped'; }
}
class Pass {
  constructor(encoder, d) { this.encoder = encoder; this.descriptor = d; }
  setPipeline(p) { this.pipeline = p; }
  dispatchWorkgroups() { this.encoder.dispatches++; }
  dispatchWorkgroupsIndirect() { this.encoder.dispatches++; }
  end() {
    const t = this.descriptor.timestampWrites;
    if (t) this.encoder.operations.push(() => {
      t.querySet.values[t.beginningOfPassWriteIndex] = base + BigInt(t.beginningOfPassWriteIndex) * 65536n;
      t.querySet.values[t.endOfPassWriteIndex] = base + BigInt(t.beginningOfPassWriteIndex) * 65536n
        + (t.beginningOfPassWriteIndex === 0 ? 0n : 131072n);
    });
  }
}
class Encoder {
  constructor() { this.operations = []; this.dispatches = 0; }
  beginComputePass(d = {}) { return new Pass(this, d); }
  resolveQuerySet(q, first, count, dst, offset) {
    assert.equal(offset % 256, 0);
    this.operations.push(() => new BigUint64Array(dst.bytes, offset, count).set(q.values.slice(first, first + count)));
  }
  copyBufferToBuffer(src, a, dst, b, size) {
    this.operations.push(() => new Uint8Array(dst.bytes, b, size).set(new Uint8Array(src.bytes, a, size)));
  }
  finish() { return { operations: this.operations }; }
}
class Device {
  constructor() {
    this.features = new Set(['shader-f16', 'subgroups', 'timestamp-query']); this.scopes = 0;
    this.queue = { submits: 0, submit(commands) { this.submits++; for (const c of commands) for (const op of c.operations) op(); },
      async onSubmittedWorkDone() {} };
  }
  createQuerySet(d) { return { ...d, values: Array(d.count).fill(0n), destroy() { this.destroyed = true; } }; }
  createBuffer(d) { return new Buffer(d); }
  createShaderModule(d) { return { ...d, async getCompilationInfo() { return { messages: [] }; } }; }
  createComputePipeline(d) { return { label: d.label }; }
  createComputePipelineAsync(d) { return Promise.resolve(this.createComputePipeline(d)); }
  createCommandEncoder() { return new Encoder(); }
  pushErrorScope() { this.scopes++; }
  async popErrorScope() { this.scopes--; return null; }
}
const requested = [];
const adapter = { features: new Set(['shader-f16', 'subgroups', 'timestamp-query']),
  limits: { maxBufferSize: 2**30, maxStorageBufferBindingSize: 2**29, maxStorageBuffersPerShaderStage: 16 },
  async requestDevice(d) { requested.push(d); return new Device(); } };
const injected = await createTimestampDevice({ async requestAdapter(options) {
  assert.equal(options.powerPreference, 'high-performance'); return adapter;
} });
assert.deepEqual(requested[0].requiredFeatures, ['shader-f16', 'subgroups', 'timestamp-query']);
assert.deepEqual(requested[0].requiredLimits, adapter.limits);
await assert.rejects(createTimestampDevice({ async requestAdapter() { return { features: new Set() }; } }), /UNSUPPORTED/);
const device = injected.device, observer = new CountObserver();
const originalEncoder = device.createCommandEncoder;
const timer = new PassTimestamps(device, observer, { capacity: 3, chunkPasses: 2 });
await timer.prepare(); assert.equal(device.scopes, 0);
observer.install(device); timer.install();
assert.equal(observer.objects.filter(x => x.kind === 'buffer').length, 0, 'Profiler buffers excluded');
const shader = device.createShaderModule({ code: '@compute @workgroup_size(1) fn main() {}' });
const pipeline = device.createComputePipeline({ compute: { module: shader, entryPoint: 'main' } });
observer.setPhase('GENERATION');
const encoder = device.createCommandEncoder();
const descriptor = Object.freeze(Object.create({ label: 'runtime-label' }, {
  customField: { value: { keep: true }, enumerable: false, configurable: false },
}));
for (let i = 0; i < 2; i++) {
  const pass = encoder.beginComputePass(descriptor);
  assert.equal(pass.descriptor.customField, descriptor.customField); assert.equal(pass.descriptor.label, descriptor.label);
  assert.equal(Object.getOwnPropertyDescriptor(pass.descriptor, 'customField').enumerable, false);
  assert.equal(Object.hasOwn(descriptor, 'timestampWrites'), false, 'Original descriptor immutable');
  pass.setPipeline(pipeline); pass.dispatchWorkgroups(1); pass.dispatchWorkgroups(2); pass.end();
}
const cb = encoder.finish(); device.queue.submit([cb]);
assert.equal(device.queue.submits, 1, 'No extra profiler submission');
observer.setPhase('POST_GENERATION'); await device.queue.onSubmittedWorkDone(); timer.stopAndRestore();
await timer.readAfterDrain(); await Promise.all(observer.compilationTasks); observer.stopAndRestore(); timer.destroy();
const result = timer.export(); assert.equal(result.status, 'COMPLETE');
assert.equal(result.samples[0].startTimestampNs, base.toString(), 'No precision loss beyond 2^53');
assert.equal(result.samples[0].gpuPassDurationNs, '0'); assert.equal(result.samples[1].gpuPassDurationNs, '131072');
assert.equal(result.samples[1].gpuPassDurationUs, 131.072);
assert.equal(result.summary.zeroDurationSamples, 1); assert.equal(result.summary.observedTimestampDifferenceGcdNs, '131072');
assert.equal(result.samples[0].encodedDirectDispatches, 2);
assert.ok(result.profilerResources.every(r => r.destroyed));
assert.equal(device.createCommandEncoder, originalEncoder);
assert.equal(observer.phases.GENERATION.submittedDirect, 4);

// Conflict, finite capacity and repeated submission must not be silently accepted.
const d2 = new Device(), o2 = new CountObserver(), t2 = new PassTimestamps(d2, o2, { capacity: 1, chunkPasses: 1 });
await t2.prepare(); o2.install(d2); t2.install(); o2.setPhase('GENERATION');
const s2 = d2.createShaderModule({ code: '@compute @workgroup_size(1) fn main() {}' });
const p2 = d2.createComputePipeline({ compute: { module: s2 } });
const e2 = d2.createCommandEncoder(), conflict = { timestampWrites: { querySet: {} } };
assert.throws(() => e2.beginComputePass(conflict), /conflict/); assert.ok(conflict.timestampWrites.querySet);
for (let i = 0; i < 2; i++) { const p = e2.beginComputePass(); p.setPipeline(p2); p.dispatchWorkgroups(1); p.end(); }
const c2 = e2.finish(); d2.queue.submit([c2]); d2.queue.submit([c2]);
o2.setPhase('POST_GENERATION'); await d2.queue.onSubmittedWorkDone(); t2.stopAndRestore(); await t2.readAfterDrain();
await Promise.all(o2.compilationTasks); o2.stopAndRestore(); t2.destroy(); const r2 = t2.export();
assert.equal(r2.status, 'INCOMPLETE'); assert.equal(r2.untimedPasses, 1);
assert.equal(r2.samples[0].submissionCount, 2); assert.equal(r2.samples[0].gpuPassDurationNs, null);
assert.ok(r2.coverageFailures.some(x => x.includes('Repeated submit')));
assert.equal(timestampSummary([]).observedTimestampDifferenceGcdNs, '0');
console.log('PROFILE003 fake-native checks PASS: compatible feature/limit injection, unchanged descriptor, BigInt/zeros/grid, multi-dispatch pass, resolve alignment, no extra submit, post-drain read/unmap, resource exclusion/cleanup, conflict/cap/repeat/restore. NOT phone evidence.');
