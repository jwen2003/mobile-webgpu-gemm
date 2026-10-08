# Environment and provenance

Separate user screenshots, the page’s adapter probe, the runtime’s actual device, and raw JSON. Preserve empty values; names do not establish a model or backend.

Screenshots record OnePlus PMB110, Dimensity 9500, Mali-G1-Ultra MC12, Android 16, and Chrome 154.0.8037.92. Android 10/K in the reduced user agent is not evidence of the actual OS. Adapter vendor is arm and architecture gen-5; empty device/description fields are not filled with guessed models.

Driver 2.1.28733 from chrome://gpu/ANGLE is metadata from that source, not a confirmed runtime WebGPU driver. The probe device and stock runtime device are distinct; an unverified backend remains UNKNOWN. Adapter feature support does not mean a device enabled it or an experiment validated it.

COMPUTE001 validates FP32 only; TIMING001 validates timestamp-query. Part 2 additionally checks the FP16 accumulation discriminator. Adapter/device limits are recorded separately, and device defaults may be lower. Thermal state is a manual observation, not a temperature sensor. Charging, DevTools, flags, VPN/background apps follow each session’s record; unknown history is not filled in afterward.

## Read next

- [Local model and runtime preparation](model_preparation.md)
- [BASELINE002: fifteen model-session results](baseline_sessions_results.md)
- [Measurement contract and statistical interpretation](measurement_contract.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/environment.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)
