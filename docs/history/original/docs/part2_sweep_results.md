## PART2SWEEP phone evidence: 2026-10-06

Actual run: **COMPLETE_WITH_FAILURES**, not a completed sweep. Independent audit PASS: 43,856 exported small outputs and 1,280 timestamp samples (320 warm-up, 960 measured); seeded orders, nearest-rank p95, raw BigInt differences, grids and selections independently recomputed. All recorded correctness cases PASS; large outputs rely on online full checks. No zero-duration samples; observed grid 65,536 ns. Raw evidence retained byte-for-byte; SHA256 c21e9bbed332b54cead19ecb8ad8150ca636dc36e6b495f7e634b41deaa8b671.

D-4x8-K16 and D-8x16-K16 failed compilation for both formats: generated WGSL used reserved identifier `meta`. These are implementation failures, not device-limit UNSUPPORTED. Eight error entries record four failures. D-original ran, but D candidate selection remains incomplete. Identifier renamed to `quantIndex`; unchanged algorithm, contract and candidate budget. CPU checks do not establish phone compilation success. Corrected sweep READY_FOR_PHONE, rerun same frozen page once; no independent repeat campaign yet.

| Format | M | Candidate | median ms | p95 ms | Interpretation |
|---|---:|---|---:|---:|---|
| Q4 | 1 | A-original | 1.376256 | 2.621440 | PRELIMINARY |
| Q4 | 1 | B-16x16-K16 | 11.010048 | 11.796480 | PRELIMINARY |
| Q4 | 1 | B-8x8-K8 | 2.621440 | 6.160384 | PRELIMINARY |
| Q4 | 1 | B-32x8-K16 | 1.703936 | 4.718592 | PRELIMINARY |
| Q4 | 1 | C-8x8-K16 | 1.114112 | 1.376256 | PRELIMINARY |
| Q4 | 1 | C-4x8-K16 | 1.310720 | 1.441792 | PRELIMINARY |
| Q4 | 1 | C-8x16-K16 | 1.277952 | 1.900544 | PRELIMINARY |
| Q4 | 1 | D-8x8-K16 | 1.605632 | 1.966080 | PRELIMINARY |
| Q4 | 128 | A-original | 9.240576 | 11.599872 | PRELIMINARY |
| Q4 | 128 | B-16x16-K16 | 13.533184 | 16.777216 | PRELIMINARY |
| Q4 | 128 | B-8x8-K8 | 11.993088 | 16.842752 | PRELIMINARY |
| Q4 | 128 | B-32x8-K16 | 9.895936 | 11.599872 | PRELIMINARY |
| Q4 | 128 | C-8x8-K16 | 2.228224 | 2.949120 | PRELIMINARY |
| Q4 | 128 | C-4x8-K16 | 2.621440 | 3.276800 | PRELIMINARY |
| Q4 | 128 | C-8x16-K16 | 2.293760 | 2.752512 | PRELIMINARY |
| Q4 | 128 | D-8x8-K16 | 3.899392 | 5.505024 | PRELIMINARY |
| Q8 | 1 | A-original | 0.720896 | 0.720896 | PRELIMINARY |
| Q8 | 1 | B-16x16-K16 | 0.917504 | 0.983040 | PRELIMINARY |
| Q8 | 1 | B-8x8-K8 | 0.393216 | 0.458752 | RESOLUTION_LIMITED |
| Q8 | 1 | B-32x8-K16 | 0.393216 | 0.393216 | RESOLUTION_LIMITED |
| Q8 | 1 | C-8x8-K16 | 0.393216 | 0.393216 | RESOLUTION_LIMITED |
| Q8 | 1 | C-4x8-K16 | 0.393216 | 0.458752 | RESOLUTION_LIMITED |
| Q8 | 1 | C-8x16-K16 | 0.393216 | 0.458752 | RESOLUTION_LIMITED |
| Q8 | 1 | D-8x8-K16 | 0.393216 | 0.393216 | RESOLUTION_LIMITED |
| Q8 | 128 | A-original | 9.043968 | 12.058624 | PRELIMINARY |
| Q8 | 128 | B-16x16-K16 | 13.139968 | 16.384000 | PRELIMINARY |
| Q8 | 128 | B-8x8-K8 | 11.862016 | 15.335424 | PRELIMINARY |
| Q8 | 128 | B-32x8-K16 | 9.895936 | 13.565952 | PRELIMINARY |
| Q8 | 128 | C-8x8-K16 | 2.490368 | 3.145728 | PRELIMINARY |
| Q8 | 128 | C-4x8-K16 | 2.686976 | 3.407872 | PRELIMINARY |
| Q8 | 128 | C-8x16-K16 | 2.326528 | 3.014656 | PRELIMINARY |
| Q8 | 128 | D-8x8-K16 | 3.735552 | 4.718592 | PRELIMINARY |

Pilot candidates: Q4 B-32x8-K16 for both shapes; Q4 C-original retained (M128 C-8x16 differs by exactly one grid). Q8 M128 B-32x8-K16 and C-8x16-K16 warrant repetition. Q8 M1 alternative B and all C/D durations are RESOLUTION_LIMITED, so cannot establish fastest candidate; exported B-original selection excludes faster unresolved alternatives and must not be interpreted as globally best. No stable speedup, cross-format causal conclusion or model acceleration. Prepared-input kernel-only excludes preparation. D comparison must be completed after compilation fix.


## Second sweep record: 2026-10-06T06:02:22.899Z

COMPLETE_WITH_FAILURES; independent audit PASS, 43,856 small outputs and 1,280 timestamps. Four alternate D shader compilation failures still contain `meta`: exported sources demonstrate stale/unfixed code, not validation of the corrected implementation. Browser module caching is a plausible explanation, not proven from JSON. Raw SHA256: 8bbca5205c93b8ffb69a34ed978a3dd8917b23968cebed7c3343ff4fa6841a45. Both partial runs retained separately; no pooled statistics. New entry and shader imports have explicit quant-index-fix-1 version URLs, visible page badge. Corrected sweep still READY_FOR_PHONE.

| Format | M | Candidate | median ms | p95 ms |
|---|---:|---|---:|---:|
| Q4 | 1 | A-original | 1.277952 | 2.621440 |
| Q4 | 1 | B-16x16-K16 | 11.108352 | 11.730944 |
| Q4 | 1 | B-8x8-K8 | 2.129920 | 6.160384 |
| Q4 | 1 | B-32x8-K16 | 1.703936 | 4.653056 |
| Q4 | 1 | C-8x8-K16 | 1.114112 | 1.376256 |
| Q4 | 1 | C-4x8-K16 | 1.310720 | 1.441792 |
| Q4 | 1 | C-8x16-K16 | 1.146880 | 1.900544 |
| Q4 | 1 | D-8x8-K16 | 1.441792 | 1.966080 |
| Q4 | 128 | A-original | 9.699328 | 11.403264 |
| Q4 | 128 | B-16x16-K16 | 13.402112 | 17.039360 |
| Q4 | 128 | B-8x8-K8 | 11.960320 | 16.711680 |
| Q4 | 128 | B-32x8-K16 | 9.502720 | 11.796480 |
| Q4 | 128 | C-8x8-K16 | 2.260992 | 3.080192 |
| Q4 | 128 | C-4x8-K16 | 2.686976 | 3.276800 |
| Q4 | 128 | C-8x16-K16 | 2.359296 | 2.818048 |
| Q4 | 128 | D-8x8-K16 | 3.997696 | 5.505024 |
| Q8 | 1 | A-original | 1.376256 | 2.621440 |
| Q8 | 1 | B-16x16-K16 | 10.977280 | 11.665408 |
| Q8 | 1 | B-8x8-K8 | 2.064384 | 6.160384 |
| Q8 | 1 | B-32x8-K16 | 1.835008 | 4.653056 |
| Q8 | 1 | C-8x8-K16 | 1.146880 | 1.310720 |
| Q8 | 1 | C-4x8-K16 | 1.310720 | 1.376256 |
| Q8 | 1 | C-8x16-K16 | 1.146880 | 1.900544 |
| Q8 | 1 | D-8x8-K16 | 1.540096 | 2.031616 |
| Q8 | 128 | A-original | 8.617984 | 11.993088 |
| Q8 | 128 | B-16x16-K16 | 12.877824 | 17.104896 |
| Q8 | 128 | B-8x8-K8 | 11.599872 | 14.483456 |
| Q8 | 128 | B-32x8-K16 | 10.354688 | 12.779520 |
| Q8 | 128 | C-8x8-K16 | 2.424832 | 3.145728 |
| Q8 | 128 | C-4x8-K16 | 2.686976 | 3.145728 |
| Q8 | 128 | C-8x16-K16 | 2.359296 | 2.949120 |
| Q8 | 128 | D-8x8-K16 | 3.932160 | 4.587520 |

B-32x8-K16 is the pilot choice in all four groups. Original C retained; ties within a grid occur for Q4 M1 and Q8 both shapes. D-original is the only measured D candidate, so no complete D selection. Differences from the first run are not controlled causal effects or stable gains. No five-run repetition acceptance.


## Accepted complete limited sweep: 2026-10-06T06:07:34.319Z

Actual COMPLETE, independent verification PASS. All ten candidates compile and pass recorded correctness for Q4/Q8. Errors empty. Independently replayed 54,820 small outputs and 1,600 timestamp samples (400 warm-up, 1,200 measured). All four groups have 30 measured samples per candidate and balanced seeded orders; observed grid 65,536 ns, zero-duration count 0. Large full outputs checked online, not exported for independent full reconstruction. Raw SHA256 055b4ad76abbed961fddbd65445fee3c6f70d96566219599416a0701cd90bc66. Previous two failed records retained separately; no pooled statistics.

| Format | M | Candidate | median ms | p95 ms | A/candidate | original/candidate |
|---|---:|---|---:|---:|---:|---:|
| Q4 | 1 | A-original | 2.129920 | 2.359296 | 1.000000 | 1.000000 |
| Q4 | 1 | B-16x16-K16 | 11.075584 | 11.665408 | 0.192308 | 1.000000 |
| Q4 | 1 | B-8x8-K8 | 3.145728 | 6.160384 | 0.677083 | 3.520833 |
| Q4 | 1 | B-32x8-K16 | 3.571712 | 4.521984 | 0.596330 | 3.100917 |
| Q4 | 1 | C-8x8-K16 | 1.179648 | 1.310720 | 1.805556 | 1.000000 |
| Q4 | 1 | C-4x8-K16 | 1.310720 | 1.376256 | 1.625000 | 0.900000 |
| Q4 | 1 | C-8x16-K16 | 1.835008 | 1.900544 | 1.160714 | 0.642857 |
| Q4 | 1 | D-8x8-K16 | 1.572864 | 1.900544 | 1.354167 | 1.000000 |
| Q4 | 1 | D-4x8-K16 | 1.474560 | 1.966080 | 1.444444 | 1.066667 |
| Q4 | 1 | D-8x16-K16 | 2.555904 | 2.621440 | 0.833333 | 0.615385 |
| Q4 | 128 | A-original | 9.764864 | 16.121856 | 1.000000 | 1.000000 |
| Q4 | 128 | B-16x16-K16 | 14.417920 | 19.988480 | 0.677273 | 1.000000 |
| Q4 | 128 | B-8x8-K8 | 11.993088 | 15.073280 | 0.814208 | 1.202186 |
| Q4 | 128 | B-32x8-K16 | 10.223616 | 13.565952 | 0.955128 | 1.410256 |
| Q4 | 128 | C-8x8-K16 | 2.654208 | 3.342336 | 3.679012 | 1.000000 |
| Q4 | 128 | C-4x8-K16 | 2.818048 | 3.342336 | 3.465116 | 0.941860 |
| Q4 | 128 | C-8x16-K16 | 2.621440 | 3.866624 | 3.725000 | 1.012500 |
| Q4 | 128 | D-8x8-K16 | 3.801088 | 4.456448 | 2.568966 | 1.000000 |
| Q4 | 128 | D-4x8-K16 | 4.653056 | 9.043968 | 2.098592 | 0.816901 |
| Q4 | 128 | D-8x16-K16 | 2.949120 | 5.570560 | 3.311111 | 1.288889 |
| Q8 | 1 | A-original | 1.179648 | 2.555904 | 1.000000 | 1.000000 |
| Q8 | 1 | B-16x16-K16 | 10.911744 | 11.534336 | 0.108108 | 1.000000 |
| Q8 | 1 | B-8x8-K8 | 6.029312 | 6.160384 | 0.195652 | 1.809783 |
| Q8 | 1 | B-32x8-K16 | 2.293760 | 4.521984 | 0.514286 | 4.757143 |
| Q8 | 1 | C-8x8-K16 | 1.146880 | 1.310720 | 1.028571 | 1.000000 |
| Q8 | 1 | C-4x8-K16 | 1.310720 | 1.441792 | 0.900000 | 0.875000 |
| Q8 | 1 | C-8x16-K16 | 1.245184 | 1.900544 | 0.947368 | 0.921053 |
| Q8 | 1 | D-8x8-K16 | 1.638400 | 1.966080 | 0.720000 | 1.000000 |
| Q8 | 1 | D-4x8-K16 | 1.310720 | 2.031616 | 0.900000 | 1.250000 |
| Q8 | 1 | D-8x16-K16 | 1.310720 | 2.621440 | 0.900000 | 1.250000 |
| Q8 | 128 | A-original | 9.699328 | 12.058624 | 1.000000 | 1.000000 |
| Q8 | 128 | B-16x16-K16 | 13.107200 | 15.007744 | 0.740000 | 1.000000 |
| Q8 | 128 | B-8x8-K8 | 10.649600 | 19.857408 | 0.910769 | 1.230769 |
| Q8 | 128 | B-32x8-K16 | 13.205504 | 17.367040 | 0.734491 | 0.992556 |
| Q8 | 128 | C-8x8-K16 | 2.555904 | 7.340032 | 3.794872 | 1.000000 |
| Q8 | 128 | C-4x8-K16 | 3.538944 | 5.505024 | 2.740741 | 0.722222 |
| Q8 | 128 | C-8x16-K16 | 2.424832 | 4.128768 | 4.000000 | 1.054054 |
| Q8 | 128 | D-8x8-K16 | 4.554752 | 7.274496 | 2.129496 | 1.000000 |
| Q8 | 128 | D-4x8-K16 | 4.980736 | 8.912896 | 1.947368 | 0.914474 |
| Q8 | 128 | D-8x16-K16 | 2.654208 | 3.014656 | 3.654321 | 1.716049 |

### Candidates for subsequent independent repetition

| Format | M | B | C | D |
|---|---:|---|---|---|
| Q4 | 1 | B-8x8-K8 | C-8x8-K16 | D-4x8-K16 |
| Q4 | 128 | B-32x8-K16 | C-8x8-K16 (within-grid tie) | D-8x16-K16 |
| Q8 | 1 | B-32x8-K16 | C-8x8-K16 | D-4x8-K16 (within-grid tie) |
| Q8 | 128 | B-8x8-K8 | C-8x16-K16 | D-8x16-K16 |

Q4 M128 C retains original under frozen one-grid tie preference. Q8 M1 D alternatives tie within one grid; original is outside tie, so lowest-median candidate remains provisional. This completes one finite exploratory sweep, not five independent repetitions or stable benefit acceptance. Choices differ from previous partial runs; no causal thermal/format explanation established. Next minimal task: freeze selected candidates plus same-round originals/A, collect at least five independent runs under the same contract. Do not expand candidates, assert model acceleration, Adreno validation or true logical model shape completion.
