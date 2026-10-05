export const VERSION = '0.10.29';
export const RUNTIME_ROOT = `/assets/vendor/tasks-genai/${VERSION}`;
export const MODEL_FILENAME = 'gemma-3n-E2B-it-int4-Web.litertlm';
export const MODEL_PATH = `/assets/models/${MODEL_FILENAME}`;
export const QUESTION = 'Explain in two short sentences what matrix multiplication computes.';
export const PROMPT = `<start_of_turn>user\n${QUESTION}<end_of_turn>\n<start_of_turn>model\n`;
export const GENERATION_OPTIONS = Object.freeze({
  maxTokens: 512, topK: 40, temperature: 0.8, randomSeed: 101,
  numResponses: 1, maxNumImages: 0, supportAudio: false,
});
export function validateModelManifest(manifest) {
  if (manifest.filename !== MODEL_FILENAME || manifest.localPath !== MODEL_PATH) {
    throw new Error('Only the specified gemma-3n-E2B-it-int4-Web.litertlm is allowed');
  }
  if (manifest.status !== 'LOCAL_FILE_HASHED' || !Number.isSafeInteger(manifest.actualBytes)
      || manifest.actualBytes <= 0 || !/^[a-f0-9]{64}$/.test(manifest.sha256 || '')) {
    throw new Error('Model not ready: download the authorized Web file and run python scripts/verify_baseline_model.py');
  }
}
