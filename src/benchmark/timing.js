import { SEED, configurationOrder, statistics, timestampInterval, checkOutput } from './timing_math.mjs';
const ui = Object.fromEntries(['run', 'download', 'status', 'summary', 'evidence', 'thermal', 'charging', 'flag']
  .map(id => [id, document.getElementById(id)]));
let report = null, device = null, busy = false, lost = false, sampling = false;
const iso = () => new Date().toISOString();
const text = error => `${error?.name || 'Error'}: ${error?.message || String(error)}`;
function allLimits(source) {
  // WebIDL attributes may live on the prototype rather than be own properties.
  const names = new Set();
  for (let object = source; object && object !== Object.prototype; object = Object.getPrototypeOf(object)) {
    for (const name of Object.getOwnPropertyNames(object)) if (typeof source[name] === 'number') names.add(name);
  }
  return Object.fromEntries([...names].sort().map(name => [name, source[name]]));
}
function render(status) {
  if (status) ui.status.textContent = status;
  ui.run.disabled = busy;
  ui.download.disabled = busy || !report;
  for (const key of ['thermal', 'charging', 'flag']) ui[key].disabled = busy;
  ui.summary.textContent = report ? JSON.stringify({ status: report.status,
    completedPasses: report.samples.length, configurationOrder: report.configurationOrder,
    summaries: report.summaries, errors: report.errors }, null, 2) : '';
  ui.evidence.textContent = report ? JSON.stringify(report, null, 2) : '';
}
function fail(stage, error) {
  report.errors.push({ isoTime: iso(), stage, message: text(error) });
  report.status = 'ERROR';
}
async function scoped(stage, action) {
  const before = report.errors.length;
  let value, exception, count = 0;
  try {
    for (const filter of ['internal', 'out-of-memory', 'validation']) { device.pushErrorScope(filter); count++; }
    value = await action();
  } catch (error) { exception = error; }
  finally {
    while (count > 0) {
      count--;
      try { const error = await device.popErrorScope(); if (error) fail(stage, error); }
      catch (error) { fail(`${stage}: popErrorScope`, error); }
    }
  }
  if (exception) throw exception;
  if (lost || report.errors.length > before) throw new Error(`${stage}: GPU error; see errors`);
  return value;
}
function updateSummaries() {
  report.summaries = report.configurationOrder.map(config => {
    const samples = report.samples.filter(s => s.configurationIndex === config.configurationIndex && s.phase === 'measured');
    const checked = report.samples.filter(s => s.configurationIndex === config.configurationIndex && s.correctness);
    return { ...config, measuredCount: samples.length, complete: samples.length === 30,
      gpuPassDurationNs: statistics(samples.filter(s => s.gpuPassDurationNs !== null).map(s => s.gpuPassDurationNs)),
      submitToCompletionWallMs: statistics(samples.filter(s => s.submitToCompletionWallMs !== null).map(s => s.submitToCompletionWallMs)),
      correctness: checked.length ? { status: checked.every(s => s.correctness.status === 'PASS') ? 'PASS' : 'FAIL',
        checkedPasses: checked.length, elementsPerPass: config.n,
        maxAbsoluteError: checked.some(s => s.correctness.maxAbsoluteError === null) ? null
          : Math.max(...checked.map(s => s.correctness.maxAbsoluteError)),
        totalErrorElements: checked.reduce((sum, s) => sum + s.correctness.errorElementCount, 0) } : null };
  });
}
document.addEventListener('visibilitychange', () => {
  if (!busy || !report) return;
  report.visibility.events.push({ isoTime: iso(), state: document.visibilityState, samplingActive: sampling });
  if (document.hidden) {
    report.visibility.enteredBackground = true;
    if (sampling) report.visibility.samplingEnteredBackground = true;
  }
});

async function run() {
  if (busy) return;
  const oldDevice = device;
  device = null;
  oldDevice?.destroy();
  busy = true; lost = false; sampling = false;
  report = {
    schemaVersion: 1, experimentId: 'TIMING001', status: 'RUNNING', startIsoTime: iso(), endIsoTime: null,
    environment: { isoTime: iso(), userAgent: navigator.userAgent, secureContext: window.isSecureContext,
      pageUrl: location.href, webgpuExposed: Boolean(navigator.gpu), adapter: null, device: null,
      manualState: { thermal: ui.thermal.value.trim() || 'UNKNOWN', charging: ui.charging.value.trim() || 'UNKNOWN',
        webgpuDeveloperFeaturesFlag: ui.flag.value.trim() || 'UNKNOWN' } },
    visibility: { initialState: document.visibilityState, enteredBackground: document.hidden,
      samplingEnteredBackground: false, events: [] },
    config: { nValues: [1025, 65536, 1048576], dispatchesPerPass: [1, 32], workgroupSize: [64, 1, 1],
      warmupPasses: 10, measuredPasses: 30, seed: SEED, randomization: 'xorshift32 + Fisher-Yates; configuration blocks',
      requiredFeatures: ['timestamp-query'], dtype: 'FP32', uniform: 'N as u32, padded to 16 bytes',
      inputA: '(i % 31) - 15', inputB: '((i * 7) % 23) - 11', absoluteTolerance: 0,
      outputInitialization: 'NaN once per configuration',
      shaderPath: 'timing_vector_add.wgsl', shaderSource: null,
      serialProtocol: 'Each pass completes query and correctness readback before the next submission; no overlapping samples',
      setup: 'Pipeline once per run; buffers, bindings, uniform and input upload once per configuration outside sampling loops',
      gpuBoundary: 'Compute pass timestampWrites beginningOfPassWriteIndex/endOfPassWriteIndex; nanoseconds; includes possible pass scheduling costs',
      wallBoundary: 'performance.now immediately before queue.submit to onSubmittedWorkDone completion; includes submitted pass, query resolve and buffer copies, excludes subsequent mapping and CPU correctness',
      batching: 'Repeated dispatches overwrite the same C; cache and resource dependencies may affect time; no division into independent kernel latency',
      statistics: 'Measured passes only; all zero values retained; median midpoint for even count; nearest-rank p95 = sorted[ceil(0.95*n)-1]; min/max; zero count',
      interpretation: 'No strict N monotonicity requirement; no bottleneck or peak bandwidth inference; not a formal GEMM benchmark' },
    configurationOrder: configurationOrder(), compilationMessages: [], errors: [], samples: [], summaries: [],
  };
  render('正在请求 timestamp-query device…');
  const resources = new Set();
  let stage = 'requestAdapter';
  try {
    if (!window.isSecureContext || !navigator.gpu) throw new Error('WebGPU unavailable: require secure localhost context and navigator.gpu');
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('requestAdapter returned null');
    const info = adapter.info;
    report.environment.adapter = { info: info ? Object.fromEntries(['vendor', 'architecture', 'device', 'description']
      .map(key => [key, info[key]])) : null, features: Array.from(adapter.features).sort(), limits: allLimits(adapter.limits),
      timestampQuerySupported: adapter.features.has('timestamp-query'), shaderF16Supported: adapter.features.has('shader-f16') };
    if (!adapter.features.has('timestamp-query')) { report.status = 'UNSUPPORTED'; return; }
    stage = 'requestDevice';
    const currentDevice = await adapter.requestDevice({ requiredFeatures: ['timestamp-query'] });
    device = currentDevice;
    report.environment.device = { features: Array.from(device.features).sort(), limits: allLimits(device.limits) };
    device.addEventListener('uncapturederror', event => { if (device === currentDevice) { fail('uncaptured GPU error', event.error); render(); } });
    device.lost.then(info => {
      if (device !== currentDevice) return;
      lost = true;
      report.environment.device.lost = { isoTime: iso(), reason: info.reason, message: info.message };
      fail('device lost', new Error(`${info.reason}: ${info.message}`)); render();
    }).catch(error => { if (device === currentDevice) fail('device lost promise', error); });
    if (!device.features.has('timestamp-query')) throw new Error('Requested timestamp-query was not enabled');
    stage = 'fetch shader';
    const response = await fetch('./timing_vector_add.wgsl', { cache: 'no-store' });
    if (!response.ok) throw new Error(`shader HTTP ${response.status}`);
    report.config.shaderSource = await response.text();
    stage = 'shader compilation and pipeline';
    const pipeline = await scoped(stage, async () => {
      const module = device.createShaderModule({ code: report.config.shaderSource });
      const info = await module.getCompilationInfo();
      report.compilationMessages = Array.from(info.messages, m => ({ type: m.type, message: m.message,
        lineNum: m.lineNum, linePos: m.linePos, offset: m.offset, length: m.length }));
      if (info.messages.some(m => m.type === 'error')) throw new Error(JSON.stringify(report.compilationMessages));
      return device.createComputePipelineAsync({ layout: 'auto', compute: { module, entryPoint: 'main' } });
    });
    for (const config of report.configurationOrder) {
      if (lost || report.errors.length) throw new Error('GPU error before next configuration');
      const { n, dispatchesPerPass, configurationIndex } = config;
      stage = `configuration ${configurationIndex} setup`;
      const local = [];
      const buffer = (label, size, usage) => {
        const value = device.createBuffer({ label, size, usage }); local.push(value); resources.add(value); return value;
      };
      const state = await scoped(stage, async () => {
        const bytes = n * 4;
        const a = buffer('A', bytes, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);
        const b = buffer('B', bytes, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);
        const c = buffer('C', bytes, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC);
        const uniform = buffer('N', 16, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
        const output = buffer('correctness readback', bytes, GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ);
        const resolve = buffer('timestamp resolve', 16, GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC);
        const timestamps = buffer('timestamp readback', 16, GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ);
        const queries = device.createQuerySet({ type: 'timestamp', count: 2 }); local.push(queries); resources.add(queries);
        const bindings = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0),
          entries: [a, b, c, uniform].map((buffer, binding) => ({ binding, resource: { buffer } })) });
        device.queue.writeBuffer(a, 0, Float32Array.from({ length: n }, (_, i) => (i % 31) - 15));
        device.queue.writeBuffer(b, 0, Float32Array.from({ length: n }, (_, i) => ((i * 7) % 23) - 11));
        device.queue.writeBuffer(c, 0, new Float32Array(n).fill(NaN));
        device.queue.writeBuffer(uniform, 0, new Uint32Array([n, 0, 0, 0]));
        await device.queue.onSubmittedWorkDone(); // Ensure setup uploads finish before sampling.
        return { c, output, resolve, timestamps, queries, bindings, bytes };
      });
      sampling = true;
      for (let passIndex = 0; passIndex < 40; passIndex++) {
        stage = `configuration ${configurationIndex} pass ${passIndex}`;
        if (lost || report.errors.length) throw new Error('GPU error before next pass');
        const sample = { n, dispatchesPerPass, configurationIndex, executionOrder: report.samples.length,
          passIndex, phase: passIndex < 10 ? 'warmup' : 'measured',
          phaseIndex: passIndex < 10 ? passIndex : passIndex - 10, workgroupCount: Math.ceil(n / 64),
          startTimestamp: null, endTimestamp: null, gpuPassDurationNs: null,
          submitToCompletionWallMs: null, correctness: null,
          visibilityStateBefore: document.visibilityState, visibilityStateAfter: null };
        if (document.hidden) report.visibility.samplingEnteredBackground = true;
        report.samples.push(sample);
        await scoped(stage, async () => {
          const encoder = device.createCommandEncoder();
          const pass = encoder.beginComputePass({ timestampWrites: { querySet: state.queries,
            beginningOfPassWriteIndex: 0, endOfPassWriteIndex: 1 } });
          pass.setPipeline(pipeline); pass.setBindGroup(0, state.bindings);
          for (let dispatch = 0; dispatch < dispatchesPerPass; dispatch++) pass.dispatchWorkgroups(Math.ceil(n / 64));
          pass.end();
          encoder.resolveQuerySet(state.queries, 0, 2, state.resolve, 0);
          encoder.copyBufferToBuffer(state.resolve, 0, state.timestamps, 0, 16);
          // Correctness copy is after the compute pass timestamp interval.
          encoder.copyBufferToBuffer(state.c, 0, state.output, 0, state.bytes);
          const commands = encoder.finish();
          const wallStart = performance.now();
          device.queue.submit([commands]);
          await device.queue.onSubmittedWorkDone();
          sample.submitToCompletionWallMs = performance.now() - wallStart;
          await state.timestamps.mapAsync(GPUMapMode.READ);
          try {
            const timestamps = new BigUint64Array(state.timestamps.getMappedRange());
            // Subtract as BigInt before any conversion; preserve raw decimal strings.
            sample.startTimestamp = timestamps[0].toString(); sample.endTimestamp = timestamps[1].toString();
            Object.assign(sample, timestampInterval(timestamps[0], timestamps[1]));
          } finally { state.timestamps.unmap(); }
          await state.output.mapAsync(GPUMapMode.READ);
          try { sample.correctness = checkOutput(new Float32Array(state.output.getMappedRange()), n); }
          finally { state.output.unmap(); }
          if (sample.gpuPassDurationNs < 0) throw new Error('Timestamp end precedes start; retained sample is invalid');
          if (sample.correctness.status !== 'PASS') throw new Error('CPU reference mismatch; see sample correctness');
        });
        sample.visibilityStateAfter = document.visibilityState;
        render(`配置 ${configurationIndex + 1}/6 · N=${n} · dispatch=${dispatchesPerPass} · ${sample.phase} ${sample.phaseIndex + 1}/${passIndex < 10 ? 10 : 30}`);
      }
      sampling = false;
      for (const resource of local) { resource.destroy(); resources.delete(resource); }
      updateSummaries();
    }
    report.status = report.errors.length || lost ? 'ERROR' : 'COMPLETE';
  } catch (error) { fail(stage, error); }
  finally {
    for (const resource of resources) resource.destroy();
    sampling = false;
    report.endIsoTime = iso();
    updateSummaries(); busy = false;
    render(`${report.status} · ${report.samples.length} pass 记录 · ${report.visibility.enteredBackground ? '曾进入后台，请记录并审查影响' : '未记录后台事件'}${report.errors.length ? ' · ' + report.errors.at(-1).message : ''}`);
  }
}
ui.run.addEventListener('click', run);
ui.download.addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url;
  link.download = `TIMING001-${iso().replace(/[:.]/g, '-')}.json`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
