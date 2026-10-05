# BASELINE001 model preparation

Only use the specified **gemma-3n-E2B-it-int4-Web.litertlm**. Do not substitute the Android file, another Gemma variant, or rename an Android file to the Web filename.

Source: [exact Hugging Face file page](https://huggingface.co/google/gemma-3n-E2B-it-litert-lm/blob/main/gemma-3n-E2B-it-int4-Web.litertlm). The anonymous request returned HTTP 401 during initial preparation. The later authorized download was locally verified and used successfully in BASELINE001: 3038117888 bytes, SHA256 `b6c8e1081ec80730f14473a5ece941b48da5d8e2a80c97c2963da153f3eff3d2`. This is file identity/storage evidence, not runtime memory. Publisher-hash comparison was not performed. The steps below describe reproducing that preparation.

1. On the computer, open the exact source page in your browser and sign in to your own Hugging Face account.
2. If requested, read and accept the Gemma license/access conditions; wait for access to be granted. Do not bypass the gate.
3. Use the file page's download button for **gemma-3n-E2B-it-int4-Web.litertlm**. Download the actual binary, not the HTML page or a Git LFS pointer. If possible, record the revision and copy the publisher SHA256 from this exact Web file's details.
4. Place the downloaded file here (keep its exact name):

   ```text
   C:\Projects\mobile-webgpu-gemm\assets\models\gemma-3n-E2B-it-int4-Web.litertlm
   ```

5. In PowerShell, independently inspect actual bytes/hash and write the browser-readable verification manifest:

   ```powershell
   Set-Location C:\Projects\mobile-webgpu-gemm
   Get-Item '.\assets\models\gemma-3n-E2B-it-int4-Web.litertlm' | Select-Object Name,Length
   Get-FileHash '.\assets\models\gemma-3n-E2B-it-int4-Web.litertlm' -Algorithm SHA256
   python scripts\verify_baseline_model.py
   ```

   If you obtained the publisher SHA256, compare it too using the optional argument (replace the placeholder with that 64-character hash):

   ```powershell
   python scripts\verify_baseline_model.py --expected-sha256 PUBLISHER_SHA256
   ```

The verifier streams the desktop file, saves actual bytes/SHA256/source/filename to `model_manifest.json`, and rejects small placeholder files, obvious HTML and Git LFS pointers. It does not prove Web compatibility from the filename alone: the authorized exact source download and optional publisher-hash match establish stronger identity evidence. The runtime initialization remains the compatibility test. By default `publisherHashMatched` is false; do not claim it was checked if no publisher hash was supplied.

After replacing the weights, rerun verification. On the phone the page checks the HTTP Content-Length against the desktop manifest; it does not rehash multi-GB weights in browser memory. The exported hash is explicitly attributed to desktop verification. Keep the weights unchanged between verification and running.

Model weights and local runtime binaries are ignored by Git. Metadata can be committed later after review. No Hugging Face tokens are needed in source, manifests, scripts or logs; use the browser's authenticated download UI.
