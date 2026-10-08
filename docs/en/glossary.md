# Glossary

These terms describe the repository implementation, not inferred hardware instructions or internal model structure.

GEMM is matrix multiplication: A[M,K]×B[K,N]→C[M,N]. M is the output row count, N the output column count, and K the reduction length. Row-major means consecutive elements of a row are adjacent. An invocation is one shader execution. A workgroup is a set of invocations that can share workgroup storage and synchronize. A dispatch launches a grid of workgroups.

A tile is a block; an output tile differs from a K-reduction tile. A barrier synchronizes a workgroup. Here, vectorized means vec4 loads and operations on four neighboring outputs; it does not prove a hardware vector instruction. Packed means multiple low-bit-width codes stored in one u32. Quantization represents values with integer codes and metadata; dequantization reconstructs an approximation using (q-zeroPoint)*scale.

FP16 storage is a binary16 representation. FP16 multiplication concerns the arithmetic type and precision. FP16 accumulation maintains FP16 semantics at each accumulation step. These are distinct. This project stores the final FP16 numerical value in an f32 readback carrier.

Median is the middle sorted value, averaging the two middle values for an even sample count. Nearest-rank p95 selects rank ceil(0.95*n): rank 29 for 30 samples, and the maximum for five sessions. The observed timestamp grid is 65.536 µs, not a fixed kernel cost. Median differences within one grid are treated as unresolved.

Logical bytes are an API-resource accounting quantity. RSS measures process resident pages and can double-count shared pages across processes. PSS apportions shared pages, but is not model-exclusive memory. UNKNOWN means unknown; UNAVAILABLE means the evidence cannot support accounting; NOT_MEASURED means not measured.

## Read next

- [Measurement contract and statistical interpretation](measurement_contract.md)
- [MEMORY001: logical texture payload](memory001_texture_accounting.md)

## Sources and maintenance

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

|Term|Definition|
|---|---|
|M / K / N|Output rows / reduction length / output columns|
|row-major|Contiguous rows, indexed row*stride+column|
|invocation|One shader execution|
|workgroup|Invocations sharing workgroup storage and synchronization|
|dispatch|Launches a grid of workgroups, not one invocation|
|tile / barrier|Block / workgroup synchronization point|
|packed / dequant|Codes packed into words / reconstruction using codes and metadata|
|FP16 accumulation|f16 accumulation semantics at every step, not merely f16 storage|
