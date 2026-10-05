// Count-only observer. Native objects are never proxied and original promises are returned.
export class CountObserver {
  constructor({ maxEvents = 500000, maxObjects = 50000, maxShaderBytes = 32 * 1024 * 1024 } = {}) {
    this.limits = { maxEvents, maxObjects, maxShaderBytes };
    this.phase = 'MODEL_INIT'; this.active = true; this.events = []; this.errors = [];
    this.objects = []; this.byId = new Map(); this.ids = new WeakMap(); this.restores = []; this.installed = new WeakMap();
    this.compilationTasks = [];
    this.droppedEvents = 0; this.droppedMetadata = 0; this.droppedDiagnostics = 0; this.shaderBytes = 0;
    this.liveBytes = 0; this.peakBytes = 0; this.phases = {}; this.coverageFailures = [];
    this.nextId = 0; this.setPhase('MODEL_INIT');
  }
  setPhase(phase) {
    this.phase = phase;
    this.phases[phase] ??= { encodedDirect: 0, encodedIndirect: 0, submittedDirect: 0,
      submittedIndirect: 0, submissions: 0, createdBufferBytes: 0, destroyedBufferBytes: 0,
      startLiveBytes: this.liveBytes, endLiveBytes: this.liveBytes, peakLiveBytes: this.liveBytes, calls: {} };
  }
  record(type, detail = {}, phase = this.phase) {
    if (!this.active) return;
    if (this.phases[phase]) this.phases[phase].calls[type] = (this.phases[phase].calls[type] || 0) + 1;
    if (this.events.length >= this.limits.maxEvents) { this.droppedEvents++; return; }
    this.events.push({ sequence: this.events.length + this.droppedEvents, phase, type,
      wallMs: performance.now(), ...detail });
  }
  failure(message) {
    if (this.coverageFailures.length < 1000) this.coverageFailures.push(String(message));
    else this.droppedDiagnostics++;
  }
  nativeError(detail) { if (this.errors.length < 1000) this.errors.push(detail); else this.droppedDiagnostics++; }
  safe(fn) { try { return fn(); } catch (error) { this.failure(`Observer: ${error.message}`); } }
  meta(object, kind) {
    if (!object || (typeof object !== 'object' && typeof object !== 'function')) return null;
    if (this.ids.has(object)) return this.ids.get(object);
    if (this.objects.length >= this.limits.maxObjects) { this.droppedMetadata++; return null; }
    const meta = { id: `${kind}-${++this.nextId}`, kind, label: object.label || '', createdPhase: this.phase };
    this.ids.set(object, meta); this.objects.push(meta); this.byId.set(meta.id, meta); return meta;
  }
  wrap(object, name, callback) {
    let names = this.installed.get(object);
    if (!names) { names = new Set(); this.installed.set(object, names); }
    if (names.has(name)) return;
    try {
      if (typeof WeakRef !== 'function') throw new Error('WeakRef unavailable');
      const original = object[name], descriptor = Object.getOwnPropertyDescriptor(object, name);
      if (typeof original !== 'function') throw new Error('Native method unavailable');
      const observer = this;
      const wrapper = function (...args) {
        const phase = observer.phase;
        let result;
        try { result = Reflect.apply(original, this, args); }
        catch (error) {
          if (observer.active) observer.safe(() => {
            observer.nativeError({ phase, method: name, name: error.name, message: error.message });
            observer.record('native_exception', { method: name, name: error.name, message: error.message }, phase);
          });
          throw error;
        }
        if (observer.active) observer.safe(() => callback(this, args, result, phase));
        return result;
      };
      Object.defineProperty(object, name, { value: wrapper, configurable: true, writable: true });
      if (object[name] !== wrapper) throw new Error('Replacement verification failed');
      this.restores.push({ target: new WeakRef(object), name, descriptor, wrapper }); names.add(name);
    } catch (error) { this.failure(`Cannot wrap ${name}: ${error.message}`); }
  }
  install(device) {
    this.meta(device, 'device'); const queue = this.meta(device.queue, 'queue');
    const created = (kind, object, detail, phase) => {
      const meta = this.meta(object, kind); if (!meta) return null;
      Object.assign(meta, detail, { createdPhase: phase });
      this.record(`create_${kind}`, { id: meta.id, ...detail }, phase); return meta;
    };
    this.wrap(device, 'createShaderModule', (_, [desc], result, phase) => {
      const code = String(desc.code); const bytes = new TextEncoder().encode(code).byteLength;
      const source = this.shaderBytes + bytes <= this.limits.maxShaderBytes ? code : null;
      if (source === null) this.droppedMetadata++; else this.shaderBytes += bytes;
      const meta = created('shader', result, { label: desc.label || '', source, sha256: null,
        compilationMessages: null }, phase);
      if (meta && typeof result.getCompilationInfo === 'function') {
        this.compilationTasks.push(result.getCompilationInfo().then(info => {
          meta.compilationMessages = Array.from(info.messages, m => ({ type: m.type, message: m.message,
            lineNum: m.lineNum, linePos: m.linePos, offset: m.offset, length: m.length }));
          for (const m of meta.compilationMessages.filter(m => m.type === 'error'))
            this.nativeError({ phase, method: 'shaderCompilation', shaderId: meta.id, ...m });
        }).catch(error => this.failure(`Shader compilation info: ${error.message}`)));
      } else if (meta) this.failure('Shader compilation info unavailable');
    });
    const pipeline = (desc, result, phase, creationMode, requestId = null) => created('pipeline', result, {
      creationMode, requestId,
      label: desc.label || '', shaderId: this.ids.get(desc.compute.module)?.id || null,
      entryPoint: desc.compute.entryPoint ?? null,
      entryPointMeaning: desc.compute.entryPoint === undefined ? 'Implicit runtime/WebGPU selection' : 'Explicit',
    }, phase);
    this.wrap(device, 'createComputePipeline', (_, [desc], result, phase) => pipeline(desc, result, phase, 'SYNC'));
    this.wrap(device, 'createComputePipelineAsync', (_, [desc], promise, phase) => {
      const requestId = `pipelineRequest-${++this.nextId}`;
      this.record('create_pipeline_async_requested', { requestId, shaderId: this.ids.get(desc.compute.module)?.id || null,
        entryPoint: desc.compute.entryPoint ?? null, label: desc.label || '' }, phase);
      // Side observer only: keep the exact native promise and its rejection semantics for the caller.
      promise.then(result => { if (this.active) this.safe(() => pipeline(desc, result, phase, 'ASYNC', requestId)); }, error => {
        if (this.active) this.safe(() => {
          this.nativeError({ phase, method: 'createComputePipelineAsync', requestId, name: error.name, message: error.message });
          this.record('pipeline_async_rejected', { requestId, message: error.message }, phase);
        });
      }).catch(error => this.failure(`Async observer: ${error.message}`));
    });
    this.wrap(device, 'createBuffer', (_, [desc], result, phase) => {
      const meta = created('buffer', result, { size: result.size, usage: result.usage,
        mappedAtCreation: Boolean(desc.mappedAtCreation), owner: 'RUNTIME', destroyed: false }, phase);
      if (!meta) return;
      this.liveBytes += meta.size; this.peakBytes = Math.max(this.peakBytes, this.liveBytes);
      const stats = this.phases[phase]; stats.createdBufferBytes += meta.size;
      stats.endLiveBytes = this.liveBytes; stats.peakLiveBytes = Math.max(stats.peakLiveBytes, this.liveBytes);
      this.wrap(result, 'destroy', (self, args, value, destructionPhase) => {
        const buffer = this.ids.get(self);
        if (!buffer) { this.failure('destroy receiver not tracked'); return; }
        if (!buffer.destroyed) {
          buffer.destroyed = true; buffer.destroyedPhase = destructionPhase;
          this.liveBytes -= buffer.size;
          this.phases[destructionPhase].destroyedBufferBytes += buffer.size;
          this.phases[destructionPhase].endLiveBytes = this.liveBytes;
        }
        this.record('buffer_destroy', { id: buffer.id, liveBytes: this.liveBytes }, destructionPhase);
      });
    });
    this.wrap(device, 'createCommandEncoder', (_, [desc = {}], encoder, phase) => {
      const em = created('encoder', encoder, { label: desc.label || '', passIds: [] }, phase);
      if (!em) return;
      this.wrap(encoder, 'beginComputePass', (self, [passDesc = {}], pass, passPhase) => {
        const parent = this.ids.get(self);
        const pm = created('pass', pass, { encoderId: parent?.id || null, label: passDesc.label || '',
          direct: 0, indirect: 0, pipelineIds: [], pipelineId: null, ended: false }, passPhase);
        if (!pm || !parent) { this.failure('Compute pass association unavailable'); return; }
        parent.passIds.push(pm.id);
        this.wrap(pass, 'setPipeline', (receiver, [nativePipeline], value, p) => {
          const m = this.ids.get(receiver), pi = this.ids.get(nativePipeline);
          if (!m || !pi) { this.failure('setPipeline association unavailable'); return; }
          m.pipelineId = pi.id;
          this.record('setPipeline', { passId: m.id, pipelineId: pi.id }, p);
        });
        const dispatch = (receiver, args, p, indirect) => {
          const m = this.ids.get(receiver); if (!m) { this.failure('Dispatch receiver unknown'); return; }
          m[indirect ? 'indirect' : 'direct']++;
          this.phases[p][indirect ? 'encodedIndirect' : 'encodedDirect']++;
          if (m.pipelineId && !m.pipelineIds.includes(m.pipelineId)) m.pipelineIds.push(m.pipelineId);
          if (!m.pipelineId) this.failure('Dispatch pipeline unknown');
          const detail = indirect ? { indirectBufferId: this.ids.get(args[0])?.id || null,
            indirectOffset: args[1], workgroupCounts: 'UNKNOWN' } : { x: args[0], y: args[1] ?? 1, z: args[2] ?? 1 };
          this.record(indirect ? 'dispatchWorkgroupsIndirect' : 'dispatchWorkgroups',
            { passId: m.id, pipelineId: m.pipelineId, ...detail }, p);
        };
        this.wrap(pass, 'dispatchWorkgroups', (receiver, args, value, p) => dispatch(receiver, args, p, false));
        this.wrap(pass, 'dispatchWorkgroupsIndirect', (receiver, args, value, p) => dispatch(receiver, args, p, true));
        this.wrap(pass, 'end', (receiver, args, value, p) => {
          const m = this.ids.get(receiver); m.ended = true; this.record('pass.end', { passId: m.id }, p);
        });
      });
      this.wrap(encoder, 'finish', (self, [finishDesc = {}], command, p) => {
        const parent = this.ids.get(self);
        const cm = created('commandBuffer', command, { encoderId: parent?.id || null,
          passIds: [...(parent?.passIds || [])], label: finishDesc.label || '' }, p);
        this.record('encoder.finish', { encoderId: parent?.id || null, commandBufferId: cm?.id || null }, p);
      });
    });
    this.wrap(device.queue, 'submit', (_, [commands], value, phase) => {
      // WebIDL sequence is normally an Array in this fixed loader. Never consume an iterator twice.
      if (!Array.isArray(commands)) { this.failure('Non-array submit sequence: association UNKNOWN'); return; }
      const commandIds = [], passIds = []; let direct = 0, indirect = 0;
      for (const command of commands) {
        const cm = this.ids.get(command);
        if (!cm) { this.failure('Submitted command buffer not tracked'); continue; }
        commandIds.push(cm.id);
        for (const id of cm.passIds) {
          const pass = this.byId.get(id); if (!pass) { this.failure('Submitted pass missing'); continue; }
          passIds.push(id); direct += pass.direct; indirect += pass.indirect;
          if (phase === 'GENERATION') for (const pipelineId of pass.pipelineIds) {
            const pi = this.byId.get(pipelineId);
            if (pi) { pi.usedInGenerationSubmission = true;
              const shader = this.byId.get(pi.shaderId);
              if (shader) shader.usedInGenerationSubmission = true; else this.failure('Submitted shader unknown');
            }
          }
        }
      }
      const stats = this.phases[phase]; stats.submissions++; stats.submittedDirect += direct;
      stats.submittedIndirect += indirect;
      this.record('queue.submit', { queueId: queue?.id, commandIds, passIds, direct, indirect,
        meaning: 'Native submit returned; GPU completion/validation recorded separately' }, phase);
    });
    if (this.coverageFailures.length) throw new Error(this.coverageFailures.join('\n'));
  }
  stopAndRestore() {
    this.phases[this.phase].endLiveBytes = this.liveBytes; this.active = false;
    for (const item of [...this.restores].reverse()) {
      const target = item.target.deref(); if (!target) continue;
      try {
        if (target[item.name] !== item.wrapper) throw new Error('Method changed since installation');
        if (item.descriptor) Object.defineProperty(target, item.name, item.descriptor);
        else if (!delete target[item.name]) throw new Error('Delete failed');
      } catch (error) { this.failure(`Restore ${item.name}: ${error.message}`); }
    }
    this.restores = [];
  }
  async export() {
    for (const shader of this.objects.filter(o => o.kind === 'shader' && o.source !== null)) {
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(shader.source));
      shader.sha256 = Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, '0')).join('');
    }
    return { status: this.droppedEvents || this.droppedMetadata || this.droppedDiagnostics || this.coverageFailures.length ? 'INCOMPLETE' : 'COMPLETE',
      revision: 'PROFILE002-count-v2-cap500k',
      limits: { ...this.limits, maxCoverageDiagnostics: 1000, maxNativeErrors: 1000 },
      droppedEvents: this.droppedEvents, droppedMetadata: this.droppedMetadata, droppedDiagnostics: this.droppedDiagnostics,
      coverageFailures: this.coverageFailures, errors: this.errors, phases: this.phases, events: this.events,
      identities: this.objects.map(o => o.kind === 'shader' && !o.usedInGenerationSubmission ? { ...o, source: undefined } : o),
      logicalBuffers: { currentLiveBytes: this.liveBytes, peakBytes: this.peakBytes, profilerAllocatedGpuBytes: 0,
        meaning: 'Observed createBuffer size minus explicit destroy only; NOT physical GPU residency. GC/registry deletion not treated as destroy.' },
      limitations: ['Only observed stock device instance and returned objects; pre-install allocations excluded',
        'API encoding/submission counts do not prove successful GPU execution',
        'No render/bundle/worker/other-device coverage; no physical memory, output tokens or GPU timing',
        'Runtime-owned validation error scopes are not intercepted; observe uncaptured errors, compilation info and public failures only',
        'One compute pass can contain multiple dispatches; no kernel timing attribution',
        'Prototype reflection/method identity changes and observer overhead are unavoidable',
        'Source hashes computed after collection; missing metadata/events makes coverage INCOMPLETE'] };
  }
}
