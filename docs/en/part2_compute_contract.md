# Part 2 compute contract

The frozen version is PART2-QROW-v1. Assignment page 2 requires Q4/Q8 → dequantization → GEMM → FP16 accumulation: A is naive, B shared-memory tiled, C vectorized loads, and D fused dequantization plus GEMM. Format details not specified by the assignment are project choices.

Compute C[m,n]=sum_k A[m,k]*B[k,n], with row-major A[M,K], Q[K,N], and C[M,N]. There is no transpose, bias, activation, or batch/head folding. Performance shapes M=1/128 and K=N=1024 are representative, not confirmed effective logical model layers. GEMM004 M=8,K=1536,N=2048 is only an execution/padded-shape supplement.

QROW is synthetic unsigned Q4 (0..15) or Q8 (0..255), not Gemma native storage. Each u32 holds 32/bits adjacent N codes, least significant first, with shift=bits*(n mod (32/bits)). The word index is k*ceil(N/(32/bits))+floor(n/(32/bits)). Rows are packed separately with zero-filled high tail bits. Codes are not sign-extended; negative weights arise from q-zeroPoint.

Group size is 32 along K, separately per output column. Scale and zero-point use index floor(k/32)*N+n and shape [ceil(K/32),N]. Scale is stored as binary16 and zero-point as u32. The final partial K group processes only valid elements. B16=RN16((int(q)-int(zp))*decodeHalf(scale)): integer subtraction, multiplication by the stored scale, then ties-to-even conversion to FP16.

Activations are stored as binary16. All variants use an f16 accumulator and explicit fma in increasing K order. C/D retain this order independently for each of four components; they do not use dot to change the reduction. The result is a binary16 numerical value written into an f32 carrier for readback. Permitted WGSL fusion and subnormal behavior may differ from the canonical CPU model. General bitwise equality is not promised, and shader-f16 support alone does not validate accumulation.

The fixed xorshift32 seed is 0x2ab00117. The exact family uses A=-1/0/1, scale=1, and codes near the zero-point. Fractional inputs use A in [-16,16]/64, Q4 scale=1/32, Q8 scale=1/512, and zero-points near the midpoint. Inputs are converted to their actual storage precision first. K is bounded at 1024 and is not reduced after failure. The FP16 discriminator produces 2048 while FP32/high references produce 2050.

Independent references include binary64 mathematical accumulation, canonical RN-even FP16 fma at each step, and sequential FP32 accumulation. Exact cases use atol=rtol=0. Fractional semantic tolerances are atol=0.02, rtol=0.01; high/FP32 tolerances are 0.04/0.04. The relative-error denominator floor is 1e-8. FP32 fallback uses 0.0002/0.0002 and is reported separately. The discriminator alone permits error 2, not general cases. Element acceptance uses abs(error)<=atol+rtol*abs(reference), with separate nonfinite checks.

A/B/C pre-dequantize the same packed input; C additionally pads B16 to a vec4 layout. D unpacks and dequantizes inside the shader without allocating the complete B16 intermediate. A/B use a 16-byte uniform [M,N,K,0]; C/D extended parameters follow their actual source. Buffers are checked against WebGPU alignment and device limits. Unsupported configurations are recorded rather than silently changing the tile.

## Read next

- [Implementation C: vectorized tiled GEMM](part2_vectorized_c.md)
- [Implementation D: fused dequantization and two timing scopes](part2_fused_d.md)
- [Q8 path and its relationship to Q4](part2_q8.md)
- [Measurement contract and statistical interpretation](measurement_contract.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/part2_compute_contract.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

|Candidate|Workgroup x×y|Invocations|Output tile rows×columns|K tile|Shared bytes|
|---|---|---|---|---|---|
|A-original|8×8|64|8×8|scalar|0|
|B-16x16-K16|16×16|256|16×16|16|1024|
|B-8x8-K8|8×8|64|8×8|8|256|
|B-32x8-K16|32×8|256|8×32|16|1280|
|C/D-8x8-K16|8×8|64|8×32|16|1280|
|C/D-4x8-K16|4×8|32|8×16|16|768|
|C/D-8x16-K16|8×16|128|16×32|16|1536|

|Resource|Type|Logical payload / index|
|---|---|---|
|activation|f16|2*M*K bytes; m*K+k|
|packed Q|u32|4*K*ceil(N/(32/bits)) bytes|
|scale|f16|2*ceil(K/32)*N bytes; floor(k/32)*N+n|
|zeroPoint|u32|4*ceil(K/32)*N bytes; floor(k/32)*N+n|
|prepared B16 (A/B)|f16|2*K*N bytes|
|prepared B16 (C)|vec4<f16>|8*K*ceil(N/4) bytes|
|output|f32 carrier|4*M*N bytes; m*N+n|

These are logical payloads; uploads add alignment padding where needed and record it separately without changing q/scales. D allocates no complete prepared B16. Current D uses the actual 16-byte uniform [M,N,K,rowWords]; the earlier 32-byte future schema is a historical proposal, not a current binding.
[WGSL floating evaluation](https://www.w3.org/TR/2026/CRD-WGSL-20260703/#floating-point-evaluation) · [fma](https://www.w3.org/TR/2026/CRD-WGSL-20260703/#fma-builtin)
