// Pass-scope only. Query commands append to existing encoders; no extra submit/wait per pass.
export function gcd(a, b) { while (b !== 0n) [a, b] = [b, a % b]; return a; }
export function timestampSummary(samples) {
  let grid = 0n, durationGrid = 0n; const values = [], origins = [];
  for (const row of samples) {
    if (row.gpuPassDurationNs === null) continue;
    const start = BigInt(row.startTimestampNs), end = BigInt(row.endTimestampNs);
    const delta = end - start;
    values.push(delta); origins.push(start, end); durationGrid = gcd(durationGrid, delta);
  }
  if (origins.length) for (const value of origins) grid = gcd(grid, value > origins[0] ? value - origins[0] : origins[0] - value);
  values.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  return { sampleCount: values.length, zeroDurationSamples: values.filter(x => x === 0n).length,
    minNs: values.length ? values[0].toString() : null, maxNs: values.length ? values.at(-1).toString() : null,
    observedTimestampDifferenceGcdNs: grid.toString(), observedDurationGcdNs: durationGrid.toString(),
    priorTiming001GridNs: '65536',
    allDurationsMultipleOfPriorGrid: values.length ? values.every(x => x % 65536n === 0n) : null,
    gridMeaning: 'Observed GCD only; finite samples/zero GCD do not establish hardware clock resolution',
    totalEndToEndGpuTime: 'NOT_MEASURED' };
}
export async function createTimestampDevice(gpu) {
  const adapter = await gpu.requestAdapter({ powerPreference: 'high-performance' });
  if (!adapter) throw new Error('INCOMPATIBLE: requestAdapter returned null');
  if (!adapter.features.has('timestamp-query')) throw new Error('UNSUPPORTED: timestamp-query');
  if (!adapter.features.has('shader-f16')) throw new Error('INCOMPATIBLE: stock helper requires shader-f16');
  const requiredFeatures = ['shader-f16'];
  if (adapter.features.has('subgroups')) requiredFeatures.push('subgroups');
  requiredFeatures.push('timestamp-query');
  const descriptor = { requiredFeatures, requiredLimits: {
    maxBufferSize: adapter.limits.maxBufferSize,
    maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
    maxStorageBuffersPerShaderStage: adapter.limits.maxStorageBuffersPerShaderStage,
  } };
  const device = await adapter.requestDevice(descriptor);
  if (!requiredFeatures.every(feature => device.features.has(feature))) {
    device.destroy(); throw new Error('INCOMPATIBLE: requested features not enabled');
  }
  return { device, adapter, descriptor };
}
export class PassTimestamps {
  constructor(device, observer, { capacity = 4096, chunkPasses = 256 } = {}) {
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 16384
        || !Number.isInteger(chunkPasses) || chunkPasses < 1 || chunkPasses > 2048)
      throw new Error('Invalid bounded timestamp capacity/chunk size');
    this.device = device; this.observer = observer; this.capacity = capacity; this.chunkPasses = chunkPasses;
    this.rows = []; this.chunks = []; this.restores = []; this.encoderRows = new WeakMap();
    this.commandRows = new WeakMap(); this.errors = []; this.coverageFailures = [];
    this.untimedPasses = 0; this.resources = []; this.commands = [];
    this.active = true; this.nativeCreateEncoder = device.createCommandEncoder;
    this.nativeCreateBuffer = device.createBuffer; this.nativeCreateQuerySet = device.createQuerySet;
  }
  async prepare() {
    this.device.pushErrorScope('validation');
    try {
      for (let first = 0; first < this.capacity; first += this.chunkPasses) {
        const passes = Math.min(this.chunkPasses, this.capacity - first), size = passes * 256;
        const label = `PROFILE003-profiler-${this.chunks.length}`;
        const query = Reflect.apply(this.nativeCreateQuerySet, this.device, [{ type: 'timestamp', count: passes * 2, label }]);
        const resolve = Reflect.apply(this.nativeCreateBuffer, this.device,
          [{ size, usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC, label: label + '-resolve' }]);
        const readback = Reflect.apply(this.nativeCreateBuffer, this.device,
          [{ size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ, label: label + '-readback' }]);
        this.chunks.push({ query, resolve, readback, first, passes, used: false });
        this.resources.push({ owner: 'PROFILER', label, queryCount: passes * 2, resolveBufferBytes: size,
          readbackBufferBytes: size, destroyed: false });
      }
    } finally {
      const error = await this.device.popErrorScope();
      if (error) { this.errors.push({ stage: 'QUERY_RESOURCE_VALIDATION', message: error.message }); throw new Error(error.message); }
    }
  }
  hook(target, name, intercept) {
    const original = target[name], descriptor = Object.getOwnPropertyDescriptor(target, name);
    if (typeof original !== 'function' || typeof WeakRef !== 'function') throw new Error(`Cannot wrap ${name}`);
    const wrapper = function (...args) { return intercept(original, this, args); };
    Object.defineProperty(target, name, { value: wrapper, configurable: true, writable: true });
    if (target[name] !== wrapper) throw new Error(`Cannot verify ${name} wrapper`);
    this.restores.push({ target: new WeakRef(target), name, descriptor, wrapper });
  }
  install() {
    const self = this;
    this.hook(this.device, 'createCommandEncoder', (original, receiver, args) => {
      const encoder = Reflect.apply(original, receiver, args);
      self.encoderRows.set(encoder, []);
      self.hook(encoder, 'beginComputePass', (begin, target, passArgs) => {
        if (!self.active || self.observer.phase !== 'GENERATION') return Reflect.apply(begin, target, passArgs);
        const descriptor = passArgs[0] ?? {};
        if (descriptor.timestampWrites !== undefined && descriptor.timestampWrites !== null) {
          self.coverageFailures.push('Runtime timestampWrites conflict: original descriptor left untouched; aborting pilot');
          throw new Error('PROFILE003 timestampWrites conflict; runtime query not overwritten');
        }
        if (self.rows.length >= self.capacity) {
          self.untimedPasses++;
          return Reflect.apply(begin, target, passArgs);
        }
        const slot = self.rows.length, chunk = self.chunks[Math.floor(slot / self.chunkPasses)];
        const local = slot - chunk.first;
        // Clone the descriptor; preserve all original fields. The input object is never mutated.
        const properties = Object.getOwnPropertyDescriptors(descriptor);
        properties.timestampWrites = { value: { querySet: chunk.query,
          beginningOfPassWriteIndex: local * 2, endOfPassWriteIndex: local * 2 + 1 },
          enumerable: true, configurable: true, writable: true };
        const augmented = Object.create(Object.getPrototypeOf(descriptor), properties);
        const pass = Reflect.apply(begin, target, [augmented, ...passArgs.slice(1)]);
        const passId = self.observer.ids.get(pass)?.id || null;
        if (!passId) self.coverageFailures.push('Timed pass identity unavailable');
        const row = { slot, passId, label: descriptor.label || '', originalDescriptorKeys: Object.keys(descriptor),
          originalTimestampWrites: descriptor.timestampWrites === undefined ? 'ABSENT' : null,
          queryChunk: Math.floor(slot / self.chunkPasses), queryIndices: [local * 2, local * 2 + 1],
          resolveOffset: local * 256, submissionCount: 0, submissions: [], startTimestampNs: null,
          endTimestampNs: null, gpuPassDurationNs: null, gpuPassDurationUs: null, resolved: false };
        self.rows.push(row); self.encoderRows.get(target).push(row); chunk.used = true;
        return pass;
      });
      self.hook(encoder, 'finish', (finish, target, finishArgs) => {
        const rows = self.encoderRows.get(target) || [];
        for (const row of rows) {
          const metadata = self.observer.byId.get(row.passId);
          if (!metadata?.ended) {
            self.coverageFailures.push(`Timed pass ${row.passId} not ended before finish`);
            throw new Error('PROFILE003 cannot resolve an open pass');
          }
          const chunk = self.chunks[row.queryChunk];
          target.resolveQuerySet(chunk.query, row.queryIndices[0], 2, chunk.resolve, row.resolveOffset);
          target.copyBufferToBuffer(chunk.resolve, row.resolveOffset, chunk.readback, row.resolveOffset, 16);
          row.resolved = true;
          self.commands.push({ owner: 'PROFILER', passId: row.passId, type: 'resolve/copy',
            queryChunk: row.queryChunk, offset: row.resolveOffset, copyBytes: 16 });
        }
        const command = Reflect.apply(finish, target, finishArgs);
        self.commandRows.set(command, rows);
        for (const row of rows) row.commandBufferId = self.observer.ids.get(command)?.id || null;
        return command;
      });
      return encoder;
    });
    this.hook(this.device.queue, 'submit', (submit, receiver, args) => {
      const result = Reflect.apply(submit, receiver, args);
      if (!Array.isArray(args[0])) { self.coverageFailures.push('Non-array submit sequence: timestamp association UNKNOWN'); return result; }
      const submitEvent = self.observer.events.at(-1);
      for (const command of args[0]) for (const row of self.commandRows.get(command) || []) {
        row.submissionCount++;
        row.submissions.push({ observerSubmitSequence: submitEvent?.type === 'queue.submit' ? submitEvent.sequence : null,
          phase: self.observer.phase, commandBufferId: row.commandBufferId });
        if (row.submissionCount > 1) self.coverageFailures.push(`Repeated submit overwrites timestamp slot for ${row.passId}`);
      }
      return result;
    });
  }
  async readAfterDrain() {
    const start = performance.now();
    for (const chunk of this.chunks.filter(c => c.used)) {
      const rows = this.rows.filter(row => row.queryChunk === this.chunks.indexOf(chunk) && row.submissionCount > 0);
      if (!rows.length) continue;
      try {
        await chunk.readback.mapAsync(GPUMapMode.READ);
        const values = new BigUint64Array(chunk.readback.getMappedRange());
        for (const row of rows) {
          if (row.submissionCount !== 1 || !row.resolved) continue;
          const a = values[row.resolveOffset / 8], b = values[row.resolveOffset / 8 + 1];
          row.startTimestampNs = a.toString(); row.endTimestampNs = b.toString();
          if (b < a) { selfError(this, `End before start: ${row.passId}`); continue; }
          const delta = b - a; row.gpuPassDurationNs = delta.toString();
          row.gpuPassDurationUs = delta <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(delta) / 1000 : null;
        }
      } catch (error) { this.errors.push({ stage: 'QUERY_MAP_READ', name: error.name, message: error.message }); }
      finally { if (chunk.readback.mapState === 'mapped') chunk.readback.unmap(); }
    }
    this.readbackWallMs = performance.now() - start;
  }
  stopAndRestore() {
    this.active = false;
    for (const item of [...this.restores].reverse()) {
      const target = item.target.deref(); if (!target) continue;
      try {
        if (target[item.name] !== item.wrapper) throw new Error('Method changed since installation');
        if (item.descriptor) Object.defineProperty(target, item.name, item.descriptor);
        else if (!delete target[item.name]) throw new Error('Delete failed');
      } catch (e) { this.coverageFailures.push(`Restore ${item.name}: ${e.message}`); }
    }
    this.restores = [];
  }
  destroy() {
    for (const chunk of this.chunks) { chunk.query.destroy(); chunk.resolve.destroy(); chunk.readback.destroy(); }
    for (const resource of this.resources) resource.destroyed = true;
  }
  export() {
    const samples = this.rows.map(row => {
      const pass = this.observer.byId.get(row.passId);
      return { ...row, encodedDirectDispatches: pass?.direct ?? null, encodedIndirectDispatches: pass?.indirect ?? null,
        pipelineIds: pass?.pipelineIds || [], attribution: 'Whole compute pass, including pass scheduling; never split across dispatches' };
    });
    const missing = samples.filter(s => s.submissionCount > 0 && s.gpuPassDurationNs === null).length;
    const submittedSamples = samples.filter(s => s.submissionCount > 0).length;
    return { status: this.errors.length ? 'ERROR' : this.untimedPasses || missing || !submittedSamples || this.coverageFailures.length ? 'INCOMPLETE' : 'COMPLETE',
      noSubmittedTimedPasses: !submittedSamples,
      capacityPasses: this.capacity, chunkPasses: this.chunkPasses, untimedPasses: this.untimedPasses,
      missingSubmittedSamples: missing, samples, summary: timestampSummary(samples),
      errors: this.errors, coverageFailures: this.coverageFailures, readbackAfterDrainWallMs: this.readbackWallMs ?? null,
      profilerResources: this.resources, profilerCommands: this.commands,
      allocatedLogicalProfilerBufferBytes: this.resources.reduce((n, r) => n + r.resolveBufferBytes + r.readbackBufferBytes, 0),
      limits: ['GENERATION compute passes on injected device only; runtime/CPU/other devices not covered',
        'Resolve/copy append outside pass but add overhead and affect later scheduling',
        'Repeated submit overwrites a slot: mark incomplete, do not fabricate per-submission times',
        'Finite observed grid must be checked; prior 65536 ns precision is a limitation, not a fabricated measurement',
        'Zero durations retained; pass durations neither per-kernel latency nor full end-to-end GPU time',
        'Not comparable as performance against stock PROFILE002; one short generation only'] };
  }
}
function selfError(observer, message) { observer.errors.push({ stage: 'QUERY_TIMESTAMPS', message }); }
