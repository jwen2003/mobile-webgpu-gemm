import { CountObserver } from './count_observer.mjs';
import { VERSION, RUNTIME_ROOT, MODEL_FILENAME, MODEL_PATH, QUESTION, PROMPT,
  GENERATION_OPTIONS, validateModelManifest } from '../baseline/config.mjs';
const ui = Object.fromEntries(['run', 'download', 'status', 'output', 'errors', 'summary']
  .map(id => [id, document.getElementById(id)]));
const iso = () => new Date().toISOString();
let busy = false, task = null, device = null, observer = null;
function fresh() {
  return { schemaVersion: 1, experimentId: 'PROFILE002', status: 'NOT_RUN', startedIsoTime: null,
    endedIsoTime: null, environment: { userAgent: navigator.userAgent, secureContext: isSecureContext,
      pageUrl: location.href, crossOriginIsolated, probeAdapter: null, runtimeDevice: null,
      runtimeBackend: 'UNKNOWN', probeScope: 'Independent adapter probe; not runtime device',
      visibility: { initialState: document.visibilityState, events: [], droppedEvents: 0 } },
    runtime: { package: '@mediapipe/tasks-genai', version: VERSION, modified: false,
      deviceCreation: 'Unmodified createWebGpuDevice stock helper; timestamp-query not requested', manifest: null, fileset: null },
    model: { filename: MODEL_FILENAME, localPath: MODEL_PATH, manifest: null,
      browserSha256: 'NOT_MEASURED', hashProvenance: 'Desktop verification manifest, browser HEAD size check only' },
    prompt: { question: QUESTION, fullPrompt: PROMPT, sentPrompt: null },
    config: { ...GENERATION_OPTIONS, textOnly: true,
      maxTokensMeaning: 'Combined input + output capacity; not output token count',
      gpuOptions: 'Stock runtime device; no forceF32/cache/algorithm overrides' },
    inputTokenCount: { phase: 'TOKEN_COUNT', fullPrompt: PROMPT, value: null, error: null,
      meaning: 'sizeInTokens(fullPrompt) runtime tokenizer return; not generated tokens or verified internal prefill tensor length' },
    lifecycle: { modelInitialized: false, generationStarted: false, generationPromiseResolved: false,
      streamDoneObserved: false, nonemptyOutput: false, gpuDrainCompleted: false },
    output: { streamedText: '', returnedText: null, finalText: '' },
    wallMetrics: { modelInitializationMs: null, tokenCountMs: null, tokenCountDrainMs: null,
      generationRequestToPromiseResolutionMs: null, postGenerationDrainMs: null },
    events: [], errors: [], observer: null, instrumentationOverhead: true,
    unmeasured: { outputTokens: 'NOT_MEASURED', tokensPerSecond: 'NOT_MEASURED', dispatchPerToken: 'NOT_MEASURED',
      perTokenLatency: 'NOT_MEASURED', purePrefillLatency: 'NOT_MEASURED', gpuKernelTime: 'NOT_MEASURED',
      physicalGpuResidentMemory: 'NOT_MEASURED', jsHeap: 'NOT_MEASURED', processRssPss: 'NOT_MEASURED' } };
}
let report = fresh();
function event(type, detail = {}) { report.events.push({ type, isoTime: iso(), ...detail }); }
function error(stage, e) { report.errors.push({ stage, isoTime: iso(), name: e?.name || 'Error', message: e?.message || String(e) }); }
function render(message = report.status) {
  ui.status.textContent = message; ui.run.disabled = busy; ui.download.disabled = busy;
  ui.output.textContent = report.output.finalText || report.output.streamedText;
  ui.errors.textContent = JSON.stringify(report.errors, null, 2);
  ui.summary.textContent = JSON.stringify({ status: report.status, lifecycle: report.lifecycle,
    inputTokenCount: report.inputTokenCount, wallMetrics: report.wallMetrics,
    coverage: report.observer?.status, observerRevision: report.observer?.revision,
    collectionLimits: report.observer?.limits, droppedEvents: report.observer?.droppedEvents,
    droppedMetadata: report.observer?.droppedMetadata, droppedDiagnostics: report.observer?.droppedDiagnostics,
    visibilityDroppedEvents: report.environment.visibility.droppedEvents,
    incompleteReasons: [
      ...(report.observer?.droppedEvents ? [`Raw event cap reached: ${report.observer.droppedEvents} dropped`] : []),
      ...(report.observer?.droppedMetadata ? [`Metadata cap reached: ${report.observer.droppedMetadata} dropped`] : []),
      ...(report.observer?.droppedDiagnostics ? [`Diagnostic cap reached: ${report.observer.droppedDiagnostics} dropped`] : []),
      ...(report.environment.visibility.droppedEvents ? ['Visibility events dropped'] : []),
      ...(report.observer?.coverageFailures || []),
      ...Object.entries(report.lifecycle).filter(([, value]) => !value).map(([key]) => `Lifecycle incomplete: ${key}`),
    ], phases: report.observer?.phases,
    logicalBuffers: report.observer?.logicalBuffers, coverageFailures: report.observer?.coverageFailures }, null, 2);
}
function limits(source) {
  const names = new Set();
  for (let o = source; o && o !== Object.prototype; o = Object.getPrototypeOf(o))
    for (const key of Object.getOwnPropertyNames(o)) if (typeof source[key] === 'number') names.add(key);
  return Object.fromEntries([...names].sort().map(key => [key, source[key]]));
}
async function json(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}
async function run() {
  if (busy) return;
  task?.close(); device?.destroy(); task = null; device = null;
  report = fresh(); report.startedIsoTime = iso(); report.status = 'RUNNING'; busy = true;
  let stage = 'PREPARATION'; render('准备本地 runtime / 模型…');
  try {
    if (!isSecureContext || !navigator.gpu) throw new Error('Require secure localhost and navigator.gpu');
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('Probe requestAdapter returned null');
    report.environment.probeAdapter = { info: adapter.info ? Object.fromEntries(
      ['vendor', 'architecture', 'device', 'description'].map(k => [k, adapter.info[k]])) : null,
      features: [...adapter.features].sort(), limits: limits(adapter.limits) };
    report.runtime.manifest = await json('../baseline/runtime_manifest.json');
    if (report.runtime.manifest.version !== VERSION || report.runtime.manifest.package !== '@mediapipe/tasks-genai'
        || report.runtime.manifest.localRoot !== RUNTIME_ROOT) throw new Error('Runtime manifest mismatch');
    report.model.manifest = await json('/assets/models/model_manifest.json'); validateModelManifest(report.model.manifest);
    const head = await fetch(MODEL_PATH, { method: 'HEAD', cache: 'no-store' });
    const bytes = Number(head.headers.get('content-length'));
    report.model.browserSizeCheck = { httpStatus: head.status, bytes };
    if (!head.ok || bytes !== report.model.manifest.actualBytes) throw new Error('Model HEAD size mismatch');
    const { FilesetResolver, LlmInference } = await import(`${RUNTIME_ROOT}/genai_bundle.mjs`);
    const fileset = await FilesetResolver.forGenAiTasks(`${RUNTIME_ROOT}/wasm`);
    report.runtime.fileset = { ...fileset };
    device = await LlmInference.createWebGpuDevice();
    report.environment.runtimeDevice = { features: [...device.features].sort(), limits: limits(device.limits) };
    if (device.features.has('timestamp-query')) throw new Error('Unexpected timestamp-enabled stock device; pilot aborted');
    device.addEventListener('uncapturederror', e => error('GPU_UNCAPTURED', e.error));
    device.lost.then(info => { if (info.reason !== 'destroyed') error('DEVICE_LOST', new Error(`${info.reason}: ${info.message}`)); });
    observer = new CountObserver(); stage = 'MODEL_INIT'; observer.install(device);
    event('instrumentation_installed'); render('MODEL_INIT：初始化模型…');
    let start = performance.now(); event('model_init_start');
    task = await LlmInference.createFromOptions(fileset, { ...GENERATION_OPTIONS,
      baseOptions: { modelAssetPath: MODEL_PATH, gpuOptions: { device } } });
    report.wallMetrics.modelInitializationMs = performance.now() - start;
    report.lifecycle.modelInitialized = true; event('model_init_complete');
    stage = 'TOKEN_COUNT'; observer.setPhase(stage); render('TOKEN_COUNT：计数完整 prompt…');
    start = performance.now(); event('token_count_start');
    try {
      const count = task.sizeInTokens(PROMPT);
      report.inputTokenCount.value = count ?? null;
      report.inputTokenCount.returnType = typeof count;
      if (!Number.isSafeInteger(count) || count < 0) throw new Error(`Invalid sizeInTokens return: ${String(count)}`);
    } catch (e) { report.inputTokenCount.error = { name: e.name, message: e.message }; throw e; }
    finally { report.wallMetrics.tokenCountMs = performance.now() - start; event('token_count_complete'); }
    start = performance.now(); await device.queue.onSubmittedWorkDone();
    report.wallMetrics.tokenCountDrainMs = performance.now() - start;
    event('token_count_gpu_drain_complete');
    stage = 'GENERATION'; observer.setPhase(stage); render('GENERATION：一次生成，结束后显示摘要…');
    report.prompt.sentPrompt = PROMPT; report.lifecycle.generationStarted = true;
    event('generation_request_start'); const requestStart = performance.now();
    const output = await task.generateResponse(PROMPT, (fragment, done) => {
      report.output.streamedText += fragment;
      if (done) report.lifecycle.streamDoneObserved = true;
      observer.record('stream_callback', { fromRequestWallMs: performance.now() - requestStart, fragment, done });
    });
    report.wallMetrics.generationRequestToPromiseResolutionMs = performance.now() - requestStart;
    report.lifecycle.generationPromiseResolved = true; report.output.returnedText = output;
    report.output.finalText = typeof output === 'string' ? output : String(output);
    report.lifecycle.nonemptyOutput = Boolean(report.output.finalText.trim()); event('generation_promise_resolved');
    stage = 'POST_GENERATION'; observer.setPhase(stage);
    event('gpu_drain_start'); start = performance.now(); await device.queue.onSubmittedWorkDone();
    report.wallMetrics.postGenerationDrainMs = performance.now() - start;
    report.lifecycle.gpuDrainCompleted = true; event('gpu_drain_complete');
    await Promise.all(observer.compilationTasks);
  } catch (e) { error(stage, e); }
  finally {
    if (observer) {
      // Even failed generation drains already submitted work before closing collection.
      if (device && !report.lifecycle.gpuDrainCompleted) {
        observer.setPhase('POST_GENERATION'); const start = performance.now();
        try { await device.queue.onSubmittedWorkDone(); report.lifecycle.gpuDrainCompleted = true; }
        catch (e) { error('FAILED_RUN_DRAIN', e); }
        report.wallMetrics.postGenerationDrainMs = performance.now() - start;
        event('failed_run_gpu_drain_finished');
      }
      await Promise.all(observer.compilationTasks);
      observer.stopAndRestore();
      try { report.observer = await observer.export(); }
      catch (e) { error('OBSERVER_EXPORT', e); report.observer = { status: 'INCOMPLETE',
        events: observer.events, identities: observer.objects, coverageFailures: observer.coverageFailures }; }
      report.errors.push(...observer.errors);
    }
    report.endedIsoTime = iso();
    report.status = report.errors.length ? 'ERROR' : report.observer?.status === 'INCOMPLETE'
      || report.environment.visibility.droppedEvents ? 'INCOMPLETE'
      : Object.values(report.lifecycle).every(Boolean) ? 'COMPLETE' : 'INCOMPLETE';
    busy = false; render();
  }
}
document.addEventListener('visibilitychange', () => {
  if (!busy) return;
  const detail = { isoTime: iso(), state: document.visibilityState, phase: observer?.phase || 'PREPARATION' };
  if (report.environment.visibility.events.length < 1000) report.environment.visibility.events.push(detail);
  else report.environment.visibility.droppedEvents++;
  observer?.record('visibilitychange', detail);
});
ui.run.addEventListener('click', () => { observer = null; run().catch(e => { error('PAGE', e); busy = false; render(); }); });
ui.download.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url;
  link.download = `PROFILE002-${(report.endedIsoTime || iso()).replace(/[:.]/g, '-')}.json`;
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
render();
