// Fake native API semantic checks, not phone evidence or performance results.
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { CountObserver } from '../src/profiling/count_observer.mjs';
globalThis.crypto ??= webcrypto;
const sentinel = new Error('native failure');
class Pass {
  setPipeline(p) { this.pipeline = p; }
  dispatchWorkgroups(x) { if (x === -1) throw sentinel; return 73; }
  dispatchWorkgroupsIndirect(buffer, offset) { this.indirect = [buffer, offset]; }
  end() {}
}
class Encoder { beginComputePass() { return new Pass(); } finish() { return { label: 'cb' }; } }
class Device {
  constructor() { this.queue = { submit(commands) { this.last = commands; return 42; } }; }
  createShaderModule(d) { return { label: d.label, getCompilationInfo: async () => ({ messages: [] }) }; }
  createComputePipeline(d) { return { label: d.label }; }
  createComputePipelineAsync(d) { this.promise = Promise.resolve({ label: d.label }); return this.promise; }
  createBuffer(d) { return { size: d.size, usage: d.usage, destroy() {} }; }
  createCommandEncoder() { return new Encoder(); }
}
const device = new Device(), original = device.createBuffer, submit = device.queue.submit;
const o = new CountObserver(); o.install(device);
const shader = device.createShaderModule({ code: '@compute @workgroup_size(1) fn main() {}' });
const promise = device.createComputePipelineAsync({ compute: { module: shader, entryPoint: 'main' } });
assert.equal(promise, device.promise, 'Original async promise identity');
const pipeline = await promise;
const buffer = device.createBuffer({ size: 256, usage: 128, mappedAtCreation: false });
o.setPhase('TOKEN_COUNT'); o.record('token_count'); o.setPhase('GENERATION');
const encoder = device.createCommandEncoder(), pass = encoder.beginComputePass();
pass.setPipeline(pipeline); assert.equal(pass.pipeline, pipeline, 'Native this');
assert.equal(pass.dispatchWorkgroups(2), 73, 'Native return');
assert.throws(() => pass.dispatchWorkgroups(-1), e => e === sentinel, 'Exact exception');
pass.dispatchWorkgroupsIndirect(buffer, 16); pass.end(); const cb = encoder.finish();
assert.equal(device.queue.submit([cb]), 42); device.queue.submit([cb]);
const orphan = device.createCommandEncoder().beginComputePass(); orphan.setPipeline(pipeline); orphan.dispatchWorkgroups(7);
buffer.destroy(); buffer.destroy(); o.setPhase('POST_GENERATION');
await Promise.all(o.compilationTasks); o.stopAndRestore(); const result = await o.export();
assert.equal(device.createBuffer, original); assert.equal(device.queue.submit, submit);
assert.equal(Object.hasOwn(device, 'createBuffer'), false);
assert.equal(result.phases.GENERATION.encodedDirect, 2);
assert.equal(result.phases.GENERATION.submittedDirect, 2);
assert.equal(result.phases.GENERATION.encodedIndirect, 1);
assert.equal(result.phases.GENERATION.submittedIndirect, 2);
assert.equal(result.logicalBuffers.currentLiveBytes, 0);
assert.equal(result.logicalBuffers.peakBytes, 256);
assert.equal(result.identities.find(x => x.kind === 'shader').sha256.length, 64);
assert.equal(result.identities.find(x => x.kind === 'shader').usedInGenerationSubmission, true);
assert.equal(result.events.find(x => x.type === 'dispatchWorkgroupsIndirect').workgroupCounts, 'UNKNOWN');
const capped = new CountObserver({ maxEvents: 1 }); capped.record('one'); capped.record('two'); capped.stopAndRestore();
assert.equal((await capped.export()).status, 'INCOMPLETE'); assert.equal(capped.droppedEvents, 1);
// Actual first pilot reported 268467 calls: this synthetic regression tests capacity only.
const capacity = new CountObserver();
for (let i = 0; i < 268467; i++) capacity.record('synthetic_capacity_check');
assert.equal(capacity.limits.maxEvents, 500000);
assert.equal(capacity.events.length, 268467); assert.equal(capacity.droppedEvents, 0);
capacity.stopAndRestore(); assert.equal((await capacity.export()).status, 'COMPLETE');
const locked = new Device(); Object.defineProperty(locked, 'createBuffer', { value: original, configurable: false });
const failed = new CountObserver(); assert.throws(() => failed.install(locked), /Cannot wrap createBuffer/);
failed.stopAndRestore(); assert.ok(failed.coverageFailures.length);
console.log('PROFILE002 fake-native checks PASS: this/returns/exceptions/promise, encoding vs repeated submissions, indirect, buffers, caps, restore, wrapping failure. No phone test executed.');
