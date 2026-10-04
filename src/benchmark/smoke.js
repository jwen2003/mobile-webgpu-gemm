const N = 1025;
const BYTES = N * 4;
const limitNames = [
  'maxBufferSize', 'maxStorageBufferBindingSize', 'maxStorageBuffersPerShaderStage',
  'maxBindGroups', 'maxBindingsPerBindGroup', 'minStorageBufferOffsetAlignment',
  'maxComputeWorkgroupStorageSize', 'maxComputeInvocationsPerWorkgroup',
  'maxComputeWorkgroupSizeX', 'maxComputeWorkgroupSizeY', 'maxComputeWorkgroupSizeZ',
  'maxComputeWorkgroupsPerDimension',
];
const ui = Object.fromEntries(['detect', 'run', 'download', 'status', 'evidence']
  .map(id => [id, document.getElementById(id)]));
let device = null;
let report = null;
let busy = false;
let lost = false;
const limits = source => Object.fromEntries(limitNames.map(name => [name, source[name]]));
const message = error => `${error?.name || 'Error'}: ${error?.message || String(error)}`;

function render(status) {
  if (status) ui.status.textContent = status;
  ui.evidence.textContent = report ? JSON.stringify(report, null, 2) : '';
  ui.detect.disabled = busy;
  ui.run.disabled = busy || !device || lost;
  ui.download.disabled = busy || !report;
}
function recordError(stage, error) {
  report.errors.push({ isoTime: new Date().toISOString(), stage, message: message(error) });
  if (report.result) report.result.status = 'ERROR';
  render(`${stage}: ${message(error)}`);
}

async function detect() {
  busy = true;
  // Destroy the old device before replacing its evidence; ignore its later events.
  device?.destroy();
  device = null;
  lost = false;
  report = {
    schemaVersion: 1, experimentId: 'COMPUTE001',
    environment: { isoTime: new Date().toISOString(), userAgent: navigator.userAgent,
      secureContext: window.isSecureContext, pageUrl: location.href,
      webgpuExposed: Boolean(navigator.gpu), adapter: null, device: null },
    config: { operation: 'C[i] = A[i] + B[i]', dtype: 'FP32', n: N,
      workgroupSize: [64, 1, 1], workgroupCount: [17, 1, 1], bufferBytes: BYTES,
      inputA: '(i % 31) - 15', inputB: '((i * 7) % 23) - 11',
      absoluteTolerance: 0, outputInitialization: 'NaN sentinel', requiredFeatures: [],
      timing: 'NOT_MEASURED', shaderPath: 'vector_add.wgsl' },
    compilationMessages: [], errors: [], result: null,
  };
  render('正在检测 WebGPU…');
  let stage = 'requestAdapter';
  try {
    if (!window.isSecureContext) throw new Error('需要 secure context，请通过手机 http://localhost:8000 访问');
    if (!navigator.gpu) throw new Error('navigator.gpu 不可用');
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('requestAdapter 返回 null');
    const info = adapter.info;
    report.environment.adapter = {
      info: info ? Object.fromEntries(['vendor', 'architecture', 'device', 'description']
        .map(key => [key, info[key]])) : null,
      features: Array.from(adapter.features).sort(), limits: limits(adapter.limits),
      optionalFeatureSupport: { 'timestamp-query': adapter.features.has('timestamp-query'),
        'shader-f16': adapter.features.has('shader-f16') },
      optionalFeatureVerification: { 'timestamp-query': 'NOT_TESTED', 'shader-f16': 'NOT_TESTED' },
    };
    stage = 'requestDevice';
    // Default core limits suffice; no optional features are requested.
    const currentDevice = await adapter.requestDevice({ requiredFeatures: [] });
    device = currentDevice;
    report.environment.device = { features: Array.from(device.features).sort(), limits: limits(device.limits) };
    device.addEventListener('uncapturederror', event => {
      if (device === currentDevice) recordError('GPU uncaptured error', event.error);
    });
    device.lost.then(info => {
      if (device !== currentDevice) return;
      lost = true;
      report.environment.device.lost = { reason: info.reason, message: info.message, isoTime: new Date().toISOString() };
      recordError('device lost', new Error(`${info.reason}: ${info.message}`));
    }).catch(error => {
      if (device === currentDevice) recordError('device lost promise', error);
    });
    render('检测成功；可选 feature 仅记录支持情况，尚未验证。');
  } catch (error) { recordError(stage, error); }
  finally { busy = false; render(); }
}

async function run() {
  if (!device || lost || busy) return;
  busy = true;
  report.result = { status: 'RUNNING', isoTime: new Date().toISOString() };
  report.compilationMessages = [];
  const errorStart = report.errors.length;
  const buffers = [];
  let stage = 'fetch shader';
  let scopes = 0;
  let correctness = null;
  render('正在运行向量加法…');
  try {
    const response = await fetch('./vector_add.wgsl', { cache: 'no-store' });
    if (!response.ok) throw new Error(`shader HTTP ${response.status}`);
    const code = await response.text();
    report.config.shaderSource = code;
    for (const filter of ['internal', 'out-of-memory', 'validation']) {
      device.pushErrorScope(filter);
      scopes++;
    }
    stage = 'shader compilation';
    const module = device.createShaderModule({ label: 'vector add FP32', code });
    const compilation = await module.getCompilationInfo();
    report.compilationMessages = Array.from(compilation.messages, item => ({
      type: item.type, message: item.message, lineNum: item.lineNum, linePos: item.linePos,
      offset: item.offset, length: item.length,
    }));
    if (compilation.messages.some(item => item.type === 'error')) {
      throw new Error(JSON.stringify(report.compilationMessages));
    }
    stage = 'pipeline creation';
    const pipeline = await device.createComputePipelineAsync({ layout: 'auto', compute: { module, entryPoint: 'main' } });
    stage = 'buffer creation and upload';
    const a = Float32Array.from({ length: N }, (_, i) => (i % 31) - 15);
    const b = Float32Array.from({ length: N }, (_, i) => ((i * 7) % 23) - 11);
    const expected = Float32Array.from(a, (value, i) => value + b[i]);
    const makeBuffer = (label, usage) => {
      const buffer = device.createBuffer({ label, size: BYTES, usage });
      buffers.push(buffer);
      return buffer;
    };
    const inputUsage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;
    const aBuffer = makeBuffer('A', inputUsage);
    const bBuffer = makeBuffer('B', inputUsage);
    const cBuffer = makeBuffer('C', inputUsage | GPUBufferUsage.COPY_SRC);
    const readback = makeBuffer('readback', GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ);
    device.queue.writeBuffer(aBuffer, 0, a);
    device.queue.writeBuffer(bBuffer, 0, b);
    device.queue.writeBuffer(cBuffer, 0, new Float32Array(N).fill(NaN));
    const group = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0),
      entries: [aBuffer, bBuffer, cBuffer].map((buffer, binding) => ({ binding, resource: { buffer } })) });
    stage = 'dispatch and copy';
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, group);
    pass.dispatchWorkgroups(Math.ceil(N / 64));
    pass.end();
    encoder.copyBufferToBuffer(cBuffer, 0, readback, 0, BYTES);
    device.queue.submit([encoder.finish()]);
    stage = 'readback';
    await readback.mapAsync(GPUMapMode.READ);
    const actual = new Float32Array(readback.getMappedRange()).slice();
    readback.unmap();
    let maxAbsoluteError = 0;
    let errorElementCount = 0;
    let nonFiniteCount = 0;
    for (let i = 0; i < N; i++) {
      if (!Number.isFinite(actual[i])) { nonFiniteCount++; errorElementCount++; continue; }
      const error = Math.abs(actual[i] - expected[i]);
      maxAbsoluteError = Math.max(maxAbsoluteError, error);
      if (error !== 0) errorElementCount++;
    }
    correctness = { elementCount: N, maxAbsoluteError: nonFiniteCount ? null : maxAbsoluteError,
      errorElementCount, nonFiniteCount,
      lastElement: { index: N - 1, expected: expected[N - 1], actual: Number.isFinite(actual[N - 1]) ? actual[N - 1] : null },
      expected: Array.from(expected), actual: Array.from(actual, value => Number.isFinite(value) ? value : null) };
  } catch (error) { recordError(stage, error); }
  finally {
    while (scopes > 0) {
      scopes--;
      try { const error = await device.popErrorScope(); if (error) recordError('GPU error scope', error); }
      catch (error) { recordError('popErrorScope', error); }
    }
    for (const buffer of buffers) buffer.destroy();
    report.result = { isoTime: report.result.isoTime, completedIsoTime: new Date().toISOString(),
      status: lost || report.errors.length > errorStart || !correctness ? 'ERROR'
        : correctness.errorElementCount === 0 ? 'PASS' : 'FAIL', correctness };
    busy = false;
    const r = report.result;
    render(correctness ? `${r.status} · 元素数量 ${N} · max absolute error ${correctness.maxAbsoluteError ?? '非有限输出'} · 错误元素 ${correctness.errorElementCount}`
      : `ERROR · ${report.errors.at(-1)?.message || '未获得正确性结果'}`);
  }
}

ui.detect.addEventListener('click', detect);
ui.run.addEventListener('click', run);
ui.download.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `COMPUTE001-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
