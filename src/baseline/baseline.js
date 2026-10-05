import { VERSION, RUNTIME_ROOT, MODEL_FILENAME, MODEL_PATH, QUESTION, PROMPT,
  GENERATION_OPTIONS, validateModelManifest } from './config.mjs';
const ui = Object.fromEntries(['load', 'generate', 'download', 'status', 'output', 'errors', 'evidence']
  .map(id => [id, document.getElementById(id)]));
let inference = null, runtimeDevice = null, busy = false, attempted = false;
let requestStart = null;
const iso = () => new Date().toISOString();
function newReport() {
  return { schemaVersion: 1, experimentId: 'BASELINE001', status: 'NOT_RUN', createdIsoTime: iso(),
    environment: { userAgent: navigator.userAgent, secureContext: window.isSecureContext,
      pageUrl: location.href, crossOriginIsolated: window.crossOriginIsolated,
      probeAdapter: null, probeScope: 'Independent requestAdapter only; not supplied to runtime',
      runtimeDevice: null, runtimeBackend: 'UNKNOWN',
      runtimeBackendVerification: 'Runtime internal execution backend not independently verified',
      visibility: { initialState: document.visibilityState, events: [] } },
    runtime: { package: '@mediapipe/tasks-genai', version: VERSION, localRoot: RUNTIME_ROOT,
      preparedManifest: null, fileset: null, modified: false,
      deviceCreation: 'Unmodified LlmInference.createWebGpuDevice() stock helper; no custom device limits/features' },
    model: { filename: MODEL_FILENAME, localPath: MODEL_PATH, manifest: null,
      browserSizeCheck: null, browserSha256: 'NOT_MEASURED' },
    prompt: { question: QUESTION, fullPrompt: PROMPT, sentPrompt: null,
      templateSource: 'https://ai.google.dev/gemma/docs/core/prompt-structure' },
    config: { ...GENERATION_OPTIONS, maxTokensMeaning: 'combined input + output token capacity; not output-token count',
      textOnly: true, baseOptions: { modelAssetPath: MODEL_PATH,
        gpuOptions: { device: 'Stock runtime-created GPUDevice (nonserializable object)' } },
      otherOptions: 'Unchanged runtime defaults; no forceF32, LoRA, or disableRewinding override' },
    lifecycle: { modelInitialized: false, requestStarted: false, generationPromiseResolved: false,
      streamDoneObserved: false, nonemptyOutput: false, completedIsoTime: null },
    wallMetrics: { runtimeResourcePreparationMs: null, modelInitializationMs: null,
      generationRequestToPromiseResolutionMs: null, firstCallbackFromRequestMs: null },
    unmeasured: { actualInputTokens: 'NOT_MEASURED', actualOutputTokens: 'NOT_MEASURED',
      tokensPerSecond: 'NOT_MEASURED', purePrefillLatency: 'NOT_MEASURED',
      perTokenLatency: 'NOT_MEASURED', gpuKernelTime: 'NOT_MEASURED', gpuMemory: 'NOT_MEASURED' },
    output: { streamedText: '', returnedText: null, finalText: '' }, events: [], errors: [] };
}
let report = newReport();
function event(type, detail = {}) { report.events.push({ type, isoTime: iso(), ...detail }); }
function render(status = report.status) {
  ui.status.textContent = status;
  ui.load.disabled = busy;
  ui.generate.disabled = busy || !inference || attempted || report.errors.length > 0;
  // Permit snapshots while loading or generating, including stalled/failed runs.
  ui.output.textContent = report.output.finalText || report.output.streamedText;
  ui.errors.textContent = JSON.stringify(report.errors, null, 2);
  ui.evidence.textContent = JSON.stringify(report, null, 2);
}
function fail(stage, error) {
  report.errors.push({ isoTime: iso(), stage, name: error?.name || 'Error', message: error?.message || String(error) });
  report.status = 'ERROR'; event('error', { stage }); render();
}
function limits(source) {
  const names = new Set();
  for (let object = source; object && object !== Object.prototype; object = Object.getPrototypeOf(object)) {
    for (const name of Object.getOwnPropertyNames(object)) if (typeof source[name] === 'number') names.add(name);
  }
  return Object.fromEntries([...names].sort().map(name => [name, source[name]]));
}
async function json(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}
async function load() {
  if (busy) return;
  const oldDevice = runtimeDevice;
  runtimeDevice = null;
  inference?.close(); inference = null; oldDevice?.destroy();
  report = newReport(); busy = true; attempted = false; requestStart = null;
  report.status = 'PREPARING';
  let stage = 'environment probe';
  try {
    if (!window.isSecureContext || !navigator.gpu) throw new Error('Require secure localhost origin and navigator.gpu');
    event('environment_probe_start');
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('Environment probe requestAdapter returned null');
    const info = adapter.info;
    report.environment.probeAdapter = { info: info ? Object.fromEntries(['vendor', 'architecture', 'device', 'description']
      .map(key => [key, info[key]])) : null, features: Array.from(adapter.features).sort(), limits: limits(adapter.limits) };
    event('environment_probe_complete');
    stage = 'runtime resource preparation';
    const preparationStart = performance.now(); event('runtime_resource_preparation_start'); render('准备本地 runtime…');
    const manifest = await json('./runtime_manifest.json');
    if (manifest.package !== '@mediapipe/tasks-genai' || manifest.version !== VERSION || manifest.localRoot !== RUNTIME_ROOT) {
      throw new Error('Runtime manifest version/path mismatch; rerun scripts/prepare_baseline_runtime.py');
    }
    report.runtime.preparedManifest = manifest;
    const { FilesetResolver, LlmInference } = await import(`${RUNTIME_ROOT}/genai_bundle.mjs`);
    if (typeof LlmInference.createFromOptions !== 'function' || typeof LlmInference.createWebGpuDevice !== 'function') {
      throw new Error('Pinned runtime does not expose expected APIs');
    }
    const fileset = await FilesetResolver.forGenAiTasks(`${RUNTIME_ROOT}/wasm`);
    report.runtime.fileset = { ...fileset };
    // Resolver selects paths; actual WASM loading happens during createFromOptions.
    for (const path of [fileset.wasmLoaderPath, fileset.wasmBinaryPath]) {
      const response = await fetch(path, { method: 'HEAD', cache: 'no-store' });
      if (!response.ok) throw new Error(`Local runtime asset missing: ${path} HTTP ${response.status}`);
    }
    report.wallMetrics.runtimeResourcePreparationMs = performance.now() - preparationStart;
    event('runtime_resource_preparation_complete', { scope: 'Manifest, JS import, fileset resolution and selected asset HEAD checks; actual WASM init belongs to model initialization' });
    stage = 'model identity check'; event('model_identity_check_start'); render('核对本地 Web 模型…');
    const model = await json('/assets/models/model_manifest.json');
    report.model.manifest = model; validateModelManifest(model);
    const head = await fetch(MODEL_PATH, { method: 'HEAD', cache: 'no-store' });
    if (!head.ok) throw new Error(`Model HTTP ${head.status}; download exact Web model into assets/models/`);
    const length = head.headers.get('content-length');
    if (length === null || Number(length) !== model.actualBytes) throw new Error('Served model size differs from desktop manifest; rerun model verification');
    report.model.browserSizeCheck = { actualServedBytes: Number(length), matchesDesktopManifest: true,
      sha256Scope: 'SHA256 from desktop verification manifest; browser checks length, does not rehash multi-GB weights' };
    event('model_identity_check_complete');
    stage = 'model initialization'; report.status = 'INITIALIZING'; render('模型初始化中，请等待…');
    const initializationStart = performance.now(); event('model_initialization_start');
    const currentDevice = await LlmInference.createWebGpuDevice(); runtimeDevice = currentDevice;
    report.environment.runtimeDevice = { providedBy: 'LlmInference.createWebGpuDevice()',
      features: Array.from(currentDevice.features).sort(), limits: limits(currentDevice.limits),
      scope: 'This stock runtime device is passed to createFromOptions; distinct from environment probe adapter' };
    currentDevice.addEventListener('uncapturederror', e => { if (runtimeDevice === currentDevice) fail('runtime GPU uncaptured error', e.error); });
    currentDevice.lost.then(info => {
      if (runtimeDevice !== currentDevice) return;
      report.environment.runtimeDevice.lost = { reason: info.reason, message: info.message, isoTime: iso() };
      fail('runtime device lost', new Error(`${info.reason}: ${info.message}`));
    }).catch(error => { if (runtimeDevice === currentDevice) fail('device lost promise', error); });
    // Use original public API and stock device configuration. No runtime mutation.
    inference = await LlmInference.createFromOptions(fileset, { ...GENERATION_OPTIONS,
      baseOptions: { modelAssetPath: MODEL_PATH, gpuOptions: { device: currentDevice } } });
    report.wallMetrics.modelInitializationMs = performance.now() - initializationStart;
    report.lifecycle.modelInitialized = true; event('model_initialization_complete');
    report.status = report.errors.length ? 'ERROR' : 'READY';
  } catch (error) { fail(stage, error); }
  finally { busy = false; render(); }
}
async function generate() {
  if (busy || !inference || attempted || report.errors.length) return;
  busy = true; attempted = true;
  report.status = 'GENERATING'; report.prompt.sentPrompt = PROMPT;
  report.lifecycle.requestStarted = true;
  requestStart = performance.now(); event('request_start', { fullPrompt: PROMPT }); render();
  try {
    const returned = await inference.generateResponse(PROMPT, (fragment, done) => {
      const relativeWallMs = performance.now() - requestStart;
      if (report.wallMetrics.firstCallbackFromRequestMs === null) report.wallMetrics.firstCallbackFromRequestMs = relativeWallMs;
      event('stream_callback', { relativeWallMs, fragment, done });
      report.output.streamedText += fragment;
      if (done) report.lifecycle.streamDoneObserved = true;
      render();
    });
    report.wallMetrics.generationRequestToPromiseResolutionMs = performance.now() - requestStart;
    report.lifecycle.generationPromiseResolved = true;
    report.output.returnedText = returned;
    report.output.finalText = typeof returned === 'string' ? returned : report.output.streamedText;
    report.lifecycle.nonemptyOutput = Boolean(report.output.finalText.trim());
    event('generation_complete', { relativeWallMs: report.wallMetrics.generationRequestToPromiseResolutionMs,
      completionSource: 'generateResponse promise resolved' });
    if (!report.lifecycle.streamDoneObserved) throw new Error('Promise resolved but no done=true streaming callback recorded');
    if (!report.lifecycle.nonemptyOutput) throw new Error('Generation completed with empty output');
    report.status = report.errors.length ? 'ERROR' : 'COMPLETE';
  } catch (error) { fail('generation', error); }
  finally { report.lifecycle.completedIsoTime = iso(); busy = false; render(); }
}
window.addEventListener('error', e => fail('window error', e.error || new Error(e.message)));
window.addEventListener('unhandledrejection', e => fail('unhandled promise rejection', e.reason));
document.addEventListener('visibilitychange', () => {
  report.environment.visibility.events.push({ isoTime: iso(), state: document.visibilityState, status: report.status });
});
ui.load.addEventListener('click', load); ui.generate.addEventListener('click', generate);
ui.download.addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ ...report, exportedIsoTime: iso() }, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url;
  link.download = `BASELINE001-${iso().replace(/[:.]/g, '-')}.json`;
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
render();
