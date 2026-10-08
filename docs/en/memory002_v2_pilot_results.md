# MEMORY002 v2: conditional protocol pass

Status is PROTOCOL_PASS_WITH_CONDITION_WARNING. This accepts one capture protocol pilot, not the full memory requirement.

One 128-token pilot covers IDLE, AFTER_INIT, GENERATION, and AFTER_DRAIN, plus BEFORE_GENERATION: five snapshots and ten browser/GPU readings. The 5606.1 ms background interval during initialization remains recorded. Browser PID 14567 and GPU PID 11306 have current role evidence; page ownership for renderer 11292 remains UNKNOWN.

GPU-process PSS/RSS (KiB) goes from idle 162986/304373 to 2163859/2446557 after initialization, 2693656/2976429 in the generation window, and 2167082/2449841 after drain. These are process observations within sample windows, not model-exclusive memory, physical GPU memory, or continuous peaks. Browser figures are separate in the appendix.

Private system originals and the v2 page JSON remain ignored locally. Public derivatives and hashes support local verification, but a clean clone lacks the private originals. Ten temporary-forwarding cleanup checks passed. Five process-memory repetitions remain incomplete, with no additional experiment scheduled.

## Read next

- [MEMORY002 v2 frozen capture protocol](memory002_capture_protocol.md)
- [Assignment requirement matrix](assignment_requirements_matrix.md)

## Sources and maintenance

[Pre-reorganization original (historical state)](../history/original/docs/memory002_v2_pilot_results.md).

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

|stage|role|PID|PSS KiB|RSS KiB|delta PSS KiB|delta RSS KiB|window ms|
|---|---|---|---|---|---|---|---|
|PAGE_IDLE|BROWSER_MAIN|14567|249919|429182|0|0|8471.38680005446|
|PAGE_IDLE|GPU|11306|162986|304373|0|0|8471.38680005446|
|AFTER_INIT|BROWSER_MAIN|14567|239975|423966|-9944|-5216|8380.46359992586|
|AFTER_INIT|GPU|11306|2163859|2446557|2000873|2142184|8380.46359992586|
|BEFORE_GENERATION|BROWSER_MAIN|14567|230188|414202|-19731|-14980|8554.392999969423|
|BEFORE_GENERATION|GPU|11306|2158928|2441669|1995942|2137296|8554.392999969423|
|GENERATION|BROWSER_MAIN|14567|229729|413946|-20190|-15236|10649.233000003733|
|GENERATION|GPU|11306|2693656|2976429|2530670|2672056|10649.233000003733|
|AFTER_DRAIN|BROWSER_MAIN|14567|229605|413822|-20314|-15360|8588.826499995776|
|AFTER_DRAIN|GPU|11306|2167082|2449841|2004096|2145468|8588.826499995776|

[memory002_v2_pilot_verification.json](../../results/analysis/memory002_v2_pilot_verification.json)
