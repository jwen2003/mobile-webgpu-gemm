# Part 2 independent repetition results

> 当前状态：FIVE_SESSIONS_VERIFIED。下文1/5–4/5等进度是历史，不是当前campaign状态；当前五轮合成kernel证据不等同原题全部完成。最新绝对表与图见report/performance_report.md。


## PART2REPEAT S1 actual evidence

Session 1 COMPLETE, independent verification PASS; UUID 11932e1a-80cc-48ee-9233-d822f09e9ba2. Raw SHA256 c8b7c03fee89a8ee97225dcbc5a733188870ebb4d16700e4df277fd382f37dde. Independently checked 46597 small outputs and 1000 timestamps. Errors: 0. Visibility: {"initialState": "visible", "enteredBackground": false, "samplingEnteredBackground": false, "events": []}. Environment: {"thermal": "\u672a\u660e\u663e\u53d1\u70ed\uff0c\u6e29\u5ea6\u672a\u6d4b\u91cf", "charging": "\u6b63\u5728\u5145\u7535\uff0c\u7535\u91cf81%", "devtools": "\u672a\u5f00\u542f", "flag": "\u5df2\u505c\u7528"}. Frozen configurations/shader hashes and balanced order verified;large full outputs remain online verification evidence. Campaign 1/5, INCOMPLETE;no reselection or stable benefit claim.

| Format | M | Candidate | median ms | p95 ms | A/candidate |
|---|---:|---|---:|---:|---:|
| Q4 | 1 | A-original | 1.179648 | 2.424832 | 1 |
| Q4 | 1 | B-16x16-K16 | 7.700480 | 11.665408 | 0.15319148936170213 |
| Q4 | 1 | B-8x8-K8 | 2.129920 | 6.160384 | 0.5538461538461539 |
| Q4 | 1 | C-8x8-K16 | 1.114112 | 1.310720 | 1.0588235294117647 |
| Q4 | 1 | D-8x8-K16 | 1.441792 | 1.900544 | 0.8181818181818182 |
| Q4 | 1 | D-4x8-K16 | 1.474560 | 1.966080 | 0.8 |

Original/selected comparisons: {"B": {"value": 3.6153846153846154, "status": "PILOT_ONLY", "differenceNs": 5570560, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 0.9777777777777777, "status": "WITHIN_ONE_GRID", "differenceNs": -32768, "gridNs": 65536}}

| Q4 | 128 | A-original | 3.604480 | 11.993088 | 1 |
| Q4 | 128 | B-16x16-K16 | 5.242880 | 14.024704 | 0.6875 |
| Q4 | 128 | B-32x8-K16 | 3.932160 | 11.665408 | 0.9166666666666666 |
| Q4 | 128 | C-8x8-K16 | 1.179648 | 2.621440 | 3.0555555555555554 |
| Q4 | 128 | D-8x8-K16 | 1.572864 | 4.521984 | 2.2916666666666665 |
| Q4 | 128 | D-8x16-K16 | 1.245184 | 3.014656 | 2.8947368421052633 |

Original/selected comparisons: {"B": {"value": 1.3333333333333333, "status": "PILOT_ONLY", "differenceNs": 1310720, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.263157894736842, "status": "PILOT_ONLY", "differenceNs": 327680, "gridNs": 65536}}

| Q8 | 1 | A-original | 1.245184 | 2.621440 | 1 |
| Q8 | 1 | B-16x16-K16 | 7.438336 | 11.665408 | 0.16740088105726872 |
| Q8 | 1 | B-32x8-K16 | 1.835008 | 4.718592 | 0.6785714285714286 |
| Q8 | 1 | C-8x8-K16 | 1.179648 | 1.310720 | 1.0555555555555556 |
| Q8 | 1 | D-8x8-K16 | 1.507328 | 1.966080 | 0.8260869565217391 |
| Q8 | 1 | D-4x8-K16 | 1.376256 | 2.031616 | 0.9047619047619048 |

Original/selected comparisons: {"B": {"value": 4.053571428571429, "status": "PILOT_ONLY", "differenceNs": 5603328, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.0952380952380953, "status": "PILOT_ONLY", "differenceNs": 131072, "gridNs": 65536}}

| Q8 | 128 | A-original | 8.814592 | 12.779520 | 1 |
| Q8 | 128 | B-16x16-K16 | 14.385152 | 19.791872 | 0.6127562642369021 |
| Q8 | 128 | B-8x8-K8 | 11.239424 | 16.842752 | 0.7842565597667639 |
| Q8 | 128 | C-8x8-K16 | 2.424832 | 3.735552 | 3.635135135135135 |
| Q8 | 128 | C-8x16-K16 | 2.392064 | 3.604480 | 3.684931506849315 |
| Q8 | 128 | D-8x8-K16 | 3.735552 | 5.898240 | 2.3596491228070176 |
| Q8 | 128 | D-8x16-K16 | 3.080192 | 4.128768 | 2.8617021276595747 |

Original/selected comparisons: {"B": {"value": 1.2798833819241981, "status": "PILOT_ONLY", "differenceNs": 3145728, "gridNs": 65536}, "C": {"value": 1.0136986301369864, "status": "WITHIN_ONE_GRID", "differenceNs": 32768, "gridNs": 65536}, "D": {"value": 1.2127659574468086, "status": "PILOT_ONLY", "differenceNs": 655360, "gridNs": 65536}}


## PART2REPEAT S2 actual evidence

Session 2 COMPLETE, independent verification PASS; UUID 92fad02a-17c7-4883-9987-2682e8b02890. Raw SHA256 e877780636014b958117d278a6dd38b2643667302f01df0509a59f1dba0cf8aa. Independently checked 46597 small outputs and 1000 timestamp samples. Errors 0; visibility {"initialState": "visible", "enteredBackground": false, "samplingEnteredBackground": false, "events": []}; manual environment {"thermal": "\u672a\u660e\u663e\u53d1\u70ed\uff0c\u6e29\u5ea6\u672a\u6d4b\u91cf", "charging": "\u6b63\u5728\u5145\u7535\uff0c\u7535\u91cf82%", "devtools": "\u672a\u5f00\u542f", "flag": "\u5df2\u505c\u7528"}. Distinct UUID from S1. Campaign 2/5, INCOMPLETE; fixed configurations retained, no pooled median or stable benefit claim. Large full outputs remain online verification evidence.

| Format | M | Candidate | median ms | p95 ms | A/candidate |
|---|---:|---|---:|---:|---:|
| Q4 | 1 | A-original | 1.245184 | 2.621440 | 1 |
| Q4 | 1 | B-16x16-K16 | 9.601024 | 11.665408 | 0.1296928327645051 |
| Q4 | 1 | B-8x8-K8 | 2.588672 | 6.094848 | 0.4810126582278481 |
| Q4 | 1 | C-8x8-K16 | 1.146880 | 1.376256 | 1.0857142857142856 |
| Q4 | 1 | D-8x8-K16 | 1.441792 | 1.900544 | 0.8636363636363636 |
| Q4 | 1 | D-4x8-K16 | 1.474560 | 2.031616 | 0.8444444444444444 |

Original/selected comparisons: {"B": {"value": 3.7088607594936707, "status": "PILOT_ONLY", "differenceNs": 7012352, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 0.9777777777777777, "status": "WITHIN_ONE_GRID", "differenceNs": -32768, "gridNs": 65536}}

| Q4 | 128 | A-original | 8.388608 | 10.289152 | 1 |
| Q4 | 128 | B-16x16-K16 | 12.779520 | 16.318464 | 0.6564102564102564 |
| Q4 | 128 | B-32x8-K16 | 9.142272 | 12.320768 | 0.9175627240143369 |
| Q4 | 128 | C-8x8-K16 | 2.162688 | 2.752512 | 3.878787878787879 |
| Q4 | 128 | D-8x8-K16 | 3.407872 | 4.325376 | 2.4615384615384617 |
| Q4 | 128 | D-8x16-K16 | 2.719744 | 3.538944 | 3.0843373493975905 |

Original/selected comparisons: {"B": {"value": 1.3978494623655915, "status": "PILOT_ONLY", "differenceNs": 3637248, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.2530120481927711, "status": "PILOT_ONLY", "differenceNs": 688128, "gridNs": 65536}}

| Q8 | 1 | A-original | 1.376256 | 2.621440 | 1 |
| Q8 | 1 | B-16x16-K16 | 7.340032 | 11.730944 | 0.1875 |
| Q8 | 1 | B-32x8-K16 | 1.671168 | 4.587520 | 0.8235294117647058 |
| Q8 | 1 | C-8x8-K16 | 1.212416 | 1.310720 | 1.135135135135135 |
| Q8 | 1 | D-8x8-K16 | 1.277952 | 1.900544 | 1.0769230769230769 |
| Q8 | 1 | D-4x8-K16 | 1.310720 | 2.031616 | 1.05 |

Original/selected comparisons: {"B": {"value": 4.392156862745098, "status": "PILOT_ONLY", "differenceNs": 5668864, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 0.975, "status": "WITHIN_ONE_GRID", "differenceNs": -32768, "gridNs": 65536}}

| Q8 | 128 | A-original | 9.011200 | 12.451840 | 1 |
| Q8 | 128 | B-16x16-K16 | 13.926400 | 19.791872 | 0.6470588235294118 |
| Q8 | 128 | B-8x8-K8 | 11.468800 | 17.760256 | 0.7857142857142857 |
| Q8 | 128 | C-8x8-K16 | 2.424832 | 4.063232 | 3.7162162162162162 |
| Q8 | 128 | C-8x16-K16 | 2.359296 | 3.080192 | 3.8194444444444446 |
| Q8 | 128 | D-8x8-K16 | 3.997696 | 5.963776 | 2.2540983606557377 |
| Q8 | 128 | D-8x16-K16 | 3.112960 | 4.194304 | 2.8947368421052633 |

Original/selected comparisons: {"B": {"value": 1.2142857142857142, "status": "PILOT_ONLY", "differenceNs": 2457600, "gridNs": 65536}, "C": {"value": 1.0277777777777777, "status": "WITHIN_ONE_GRID", "differenceNs": 65536, "gridNs": 65536}, "D": {"value": 1.2842105263157895, "status": "PILOT_ONLY", "differenceNs": 884736, "gridNs": 65536}}

### S1/S2 provisional direction check

4:1 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER; ratio range [3.6153846153846154, 3.7088607594936707].

4:1 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE; ratio range [1, 1].

4:1 D: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE; ratio range [0.9777777777777777, 0.9777777777777777].

4:128 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER; ratio range [1.3333333333333333, 1.3978494623655915].

4:128 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE; ratio range [1, 1].

4:128 D: S1 SELECTED_FASTER, S2 SELECTED_FASTER; ratio range [1.2530120481927711, 1.263157894736842].

8:1 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER; ratio range [4.053571428571429, 4.392156862745098].

8:1 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE; ratio range [1, 1].

8:1 D: S1 SELECTED_FASTER, S2 INDISTINGUISHABLE; ratio range [0.975, 1.0952380952380953].

8:128 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER; ratio range [1.2142857142857142, 1.2798833819241981].

8:128 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE; ratio range [1.0136986301369864, 1.0277777777777777].

8:128 D: S1 SELECTED_FASTER, S2 SELECTED_FASTER; ratio range [1.2127659574468086, 1.2842105263157895].


## PART2REPEAT S3 actual evidence

Session 3 COMPLETE, independent verification PASS; UUID 18a3332f-7cb9-414a-92de-967e92cb0f30. Raw SHA256 cacfc8f4574b2a73cb87eefec2a757504cbaea42f0a08213117ca674c0d70142. Independently checked 46597 small outputs and 1000 timestamp samples. Errors 0; visibility {"initialState": "visible", "enteredBackground": false, "samplingEnteredBackground": false, "events": []}; manual environment {"thermal": "\u672a\u660e\u663e\u53d1\u70ed\uff0c\u6e29\u5ea6\u672a\u6d4b\u91cf", "charging": "\u6b63\u5728\u5145\u7535\uff0c\u7535\u91cf82%", "devtools": "\u672a\u5f00\u542f", "flag": "\u5df2\u505c\u7528"}. UUID distinct from S1/S2. Campaign 3/5, INCOMPLETE; no reselection, pooled median or stable benefit claim. Large outputs remain online full-check evidence.

| Format | M | Candidate | median ms | p95 ms | A/candidate |
|---|---:|---|---:|---:|---:|
| Q4 | 1 | A-original | 1.310720 | 2.621440 | 1 |
| Q4 | 1 | B-16x16-K16 | 7.372800 | 11.468800 | 0.17777777777777778 |
| Q4 | 1 | B-8x8-K8 | 3.080192 | 6.094848 | 0.425531914893617 |
| Q4 | 1 | C-8x8-K16 | 1.146880 | 1.310720 | 1.1428571428571428 |
| Q4 | 1 | D-8x8-K16 | 1.540096 | 1.900544 | 0.851063829787234 |
| Q4 | 1 | D-4x8-K16 | 1.605632 | 1.966080 | 0.8163265306122449 |

Original/selected comparisons: {"B": {"value": 2.393617021276596, "status": "PILOT_ONLY", "differenceNs": 4292608, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 0.9591836734693877, "status": "WITHIN_ONE_GRID", "differenceNs": -65536, "gridNs": 65536}}

| Q4 | 128 | A-original | 3.670016 | 9.961472 | 1 |
| Q4 | 128 | B-16x16-K16 | 5.210112 | 16.908288 | 0.7044025157232704 |
| Q4 | 128 | B-32x8-K16 | 3.833856 | 11.534336 | 0.9572649572649573 |
| Q4 | 128 | C-8x8-K16 | 1.179648 | 4.063232 | 3.111111111111111 |
| Q4 | 128 | D-8x8-K16 | 1.605632 | 4.194304 | 2.2857142857142856 |
| Q4 | 128 | D-8x16-K16 | 1.245184 | 3.276800 | 2.9473684210526314 |

Original/selected comparisons: {"B": {"value": 1.358974358974359, "status": "PILOT_ONLY", "differenceNs": 1376256, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.2894736842105263, "status": "PILOT_ONLY", "differenceNs": 360448, "gridNs": 65536}}

| Q8 | 1 | A-original | 1.212416 | 2.490368 | 1 |
| Q8 | 1 | B-16x16-K16 | 9.142272 | 11.599872 | 0.13261648745519714 |
| Q8 | 1 | B-32x8-K16 | 1.736704 | 4.653056 | 0.6981132075471698 |
| Q8 | 1 | C-8x8-K16 | 1.245184 | 1.310720 | 0.9736842105263158 |
| Q8 | 1 | D-8x8-K16 | 1.376256 | 1.966080 | 0.8809523809523809 |
| Q8 | 1 | D-4x8-K16 | 1.474560 | 2.031616 | 0.8222222222222222 |

Original/selected comparisons: {"B": {"value": 5.264150943396227, "status": "PILOT_ONLY", "differenceNs": 7405568, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 0.9333333333333333, "status": "PILOT_ONLY", "differenceNs": -98304, "gridNs": 65536}}

| Q8 | 128 | A-original | 8.716288 | 12.648448 | 1 |
| Q8 | 128 | B-16x16-K16 | 14.221312 | 19.202048 | 0.6129032258064516 |
| Q8 | 128 | B-8x8-K8 | 11.403264 | 15.073280 | 0.764367816091954 |
| Q8 | 128 | C-8x8-K16 | 2.424832 | 3.407872 | 3.5945945945945947 |
| Q8 | 128 | C-8x16-K16 | 2.424832 | 3.538944 | 3.5945945945945947 |
| Q8 | 128 | D-8x8-K16 | 3.964928 | 6.356992 | 2.1983471074380163 |
| Q8 | 128 | D-8x16-K16 | 3.145728 | 4.194304 | 2.7708333333333335 |

Original/selected comparisons: {"B": {"value": 1.2471264367816093, "status": "PILOT_ONLY", "differenceNs": 2818048, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.2604166666666667, "status": "PILOT_ONLY", "differenceNs": 819200, "gridNs": 65536}}

### S1–S3 provisional direction check

4:1 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER; ratio range [2.393617021276596, 3.7088607594936707]; uncertain False.

4:1 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE; ratio range [1, 1]; uncertain True.

4:1 D: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE; ratio range [0.9591836734693877, 0.9777777777777777]; uncertain True.

4:128 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER; ratio range [1.3333333333333333, 1.3978494623655915]; uncertain False.

4:128 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE; ratio range [1, 1]; uncertain True.

4:128 D: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER; ratio range [1.2530120481927711, 1.2894736842105263]; uncertain False.

8:1 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER; ratio range [4.053571428571429, 5.264150943396227]; uncertain False.

8:1 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE; ratio range [1, 1]; uncertain True.

8:1 D: S1 SELECTED_FASTER, S2 INDISTINGUISHABLE, S3 SELECTED_SLOWER; ratio range [0.9333333333333333, 1.0952380952380953]; uncertain True.

8:128 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER; ratio range [1.2142857142857142, 1.2798833819241981]; uncertain False.

8:128 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE; ratio range [1, 1.0277777777777777]; uncertain True.

8:128 D: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER; ratio range [1.2127659574468086, 1.2842105263157895]; uncertain False.


## PART2REPEAT S4 actual evidence

Session 4 COMPLETE, independent verification PASS; UUID 7e48c6d2-236c-448d-a4eb-c441a7564942. Raw SHA256 7dd86a1b7f2f5a784c8605acdcd605b3193dc0e107ba36f69fa111353e2fcb7f. Independently checked 46597 small outputs and 1000 timestamp samples. Errors 0; visibility {"initialState": "visible", "enteredBackground": false, "samplingEnteredBackground": false, "events": []}; manual environment {"thermal": "\u672a\u660e\u663e\u53d1\u70ed\uff0c\u6e29\u5ea6\u672a\u6d4b\u91cf", "charging": "\u6b63\u5728\u5145\u7535\uff0c\u7535\u91cf82%", "devtools": "\u672a\u5f00\u542f", "flag": "\u5df2\u505c\u7528"}. UUID distinct from S1–S3. Campaign 4/5, INCOMPLETE; no reselection, pooled median or stable benefit claim. Large outputs remain online full-check evidence.

| Format | M | Candidate | median ms | p95 ms | A/candidate |
|---|---:|---|---:|---:|---:|
| Q4 | 1 | A-original | 1.212416 | 2.555904 | 1 |
| Q4 | 1 | B-16x16-K16 | 7.438336 | 11.665408 | 0.16299559471365638 |
| Q4 | 1 | B-8x8-K8 | 2.162688 | 6.160384 | 0.5606060606060606 |
| Q4 | 1 | C-8x8-K16 | 1.146880 | 1.310720 | 1.0571428571428572 |
| Q4 | 1 | D-8x8-K16 | 1.409024 | 1.900544 | 0.8604651162790697 |
| Q4 | 1 | D-4x8-K16 | 1.572864 | 1.966080 | 0.7708333333333334 |

Original/selected comparisons: {"B": {"value": 3.4393939393939394, "status": "PILOT_ONLY", "differenceNs": 5275648, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 0.8958333333333334, "status": "PILOT_ONLY", "differenceNs": -163840, "gridNs": 65536}}

| Q4 | 128 | A-original | 9.961472 | 11.468800 | 1 |
| Q4 | 128 | B-16x16-K16 | 14.286848 | 17.498112 | 0.6972477064220184 |
| Q4 | 128 | B-32x8-K16 | 9.961472 | 12.124160 | 1 |
| Q4 | 128 | C-8x8-K16 | 2.457600 | 3.080192 | 4.053333333333334 |
| Q4 | 128 | D-8x8-K16 | 3.932160 | 4.456448 | 2.533333333333333 |
| Q4 | 128 | D-8x16-K16 | 2.883584 | 3.604480 | 3.4545454545454546 |

Original/selected comparisons: {"B": {"value": 1.4342105263157894, "status": "PILOT_ONLY", "differenceNs": 4325376, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.3636363636363635, "status": "PILOT_ONLY", "differenceNs": 1048576, "gridNs": 65536}}

| Q8 | 1 | A-original | 1.146880 | 2.424832 | 1 |
| Q8 | 1 | B-16x16-K16 | 9.043968 | 11.599872 | 0.12681159420289856 |
| Q8 | 1 | B-32x8-K16 | 1.736704 | 4.587520 | 0.660377358490566 |
| Q8 | 1 | C-8x8-K16 | 1.245184 | 1.376256 | 0.9210526315789473 |
| Q8 | 1 | D-8x8-K16 | 1.441792 | 1.966080 | 0.7954545454545454 |
| Q8 | 1 | D-4x8-K16 | 1.507328 | 2.031616 | 0.7608695652173914 |

Original/selected comparisons: {"B": {"value": 5.2075471698113205, "status": "PILOT_ONLY", "differenceNs": 7307264, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 0.9565217391304348, "status": "WITHIN_ONE_GRID", "differenceNs": -65536, "gridNs": 65536}}

| Q8 | 128 | A-original | 3.571712 | 9.502720 | 1 |
| Q8 | 128 | B-16x16-K16 | 5.111808 | 17.629184 | 0.6987179487179487 |
| Q8 | 128 | B-8x8-K8 | 4.456448 | 11.862016 | 0.8014705882352942 |
| Q8 | 128 | C-8x8-K16 | 1.114112 | 3.145728 | 3.2058823529411766 |
| Q8 | 128 | C-8x16-K16 | 1.048576 | 2.752512 | 3.40625 |
| Q8 | 128 | D-8x8-K16 | 1.572864 | 4.521984 | 2.2708333333333335 |
| Q8 | 128 | D-8x16-K16 | 1.310720 | 3.997696 | 2.725 |

Original/selected comparisons: {"B": {"value": 1.1470588235294117, "status": "PILOT_ONLY", "differenceNs": 655360, "gridNs": 65536}, "C": {"value": 1.0625, "status": "WITHIN_ONE_GRID", "differenceNs": 65536, "gridNs": 65536}, "D": {"value": 1.2, "status": "PILOT_ONLY", "differenceNs": 262144, "gridNs": 65536}}

### S1–S4 provisional direction check

4:1 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER, S4 SELECTED_FASTER; ratio range [2.393617021276596, 3.7088607594936707]; uncertain False.

4:1 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE, S4 INDISTINGUISHABLE; ratio range [1, 1]; uncertain True.

4:1 D: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE, S4 SELECTED_SLOWER; ratio range [0.8958333333333334, 0.9777777777777777]; uncertain True.

4:128 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER, S4 SELECTED_FASTER; ratio range [1.3333333333333333, 1.4342105263157894]; uncertain False.

4:128 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE, S4 INDISTINGUISHABLE; ratio range [1, 1]; uncertain True.

4:128 D: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER, S4 SELECTED_FASTER; ratio range [1.2530120481927711, 1.3636363636363635]; uncertain False.

8:1 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER, S4 SELECTED_FASTER; ratio range [4.053571428571429, 5.264150943396227]; uncertain False.

8:1 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE, S4 INDISTINGUISHABLE; ratio range [1, 1]; uncertain True.

8:1 D: S1 SELECTED_FASTER, S2 INDISTINGUISHABLE, S3 SELECTED_SLOWER, S4 INDISTINGUISHABLE; ratio range [0.9333333333333333, 1.0952380952380953]; uncertain True.

8:128 B: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER, S4 SELECTED_FASTER; ratio range [1.1470588235294117, 1.2798833819241981]; uncertain False.

8:128 C: S1 INDISTINGUISHABLE, S2 INDISTINGUISHABLE, S3 INDISTINGUISHABLE, S4 INDISTINGUISHABLE; ratio range [1, 1.0625]; uncertain True.

8:128 D: S1 SELECTED_FASTER, S2 SELECTED_FASTER, S3 SELECTED_FASTER, S4 SELECTED_FASTER; ratio range [1.2, 1.2842105263157895]; uncertain False.


## Final five-session acceptance — S5

Campaign FIVE_SESSIONS_VERIFIED: five unique page/session UUIDs, all COMPLETE with independent PASS. 232,985 exported small outputs and 5,000 timestamp samples independently checked (1,250 warm-up,3,750 measured). Large outputs rely on online full checking. No pooled sample median. S5 raw SHA256 54b2d510b59100f648694111c3226989f233c1660d4c9f41d39060cfd53b144c. Historical evidence preserved.

| Session | UUID | Errors | Background | Manual conditions |
|---|---|---:|---|---|
| S1 | 11932e1a-80cc-48ee-9233-d822f09e9ba2 | 0 | False | {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量81%", "devtools": "未开启", "flag": "已停用"} |
| S2 | 92fad02a-17c7-4883-9987-2682e8b02890 | 0 | False | {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量82%", "devtools": "未开启", "flag": "已停用"} |
| S3 | 18a3332f-7cb9-414a-92de-967e92cb0f30 | 0 | False | {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量82%", "devtools": "未开启", "flag": "已停用"} |
| S4 | 7e48c6d2-236c-448d-a4eb-c441a7564942 | 0 | False | {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量82%", "devtools": "未开启", "flag": "已停用"} |
| S5 | ca229f89-9acc-46a4-ae3c-9ed9c5fce93f | 0 | False | {"thermal": "未明显发热，温度未测量", "charging": "正在充电，电量82%", "devtools": "未开启", "flag": "已停用"} |

Manual descriptions are self-reported, not instrumented thermal measurements or proof of identical GPU state. All runs used frozen configuration and shader hashes.

### S5 per-configuration statistics

| Format | M | Candidate | median ms | p95 ms | A/candidate |
|---|---:|---|---:|---:|---:|
| Q4 | 1 | A-original | 1.212416 | 2.490368 | 1 |
| Q4 | 1 | B-16x16-K16 | 7.929856 | 11.665408 | 0.15289256198347106 |
| Q4 | 1 | B-8x8-K8 | 2.129920 | 6.094848 | 0.5692307692307692 |
| Q4 | 1 | C-8x8-K16 | 1.146880 | 1.310720 | 1.0571428571428572 |
| Q4 | 1 | D-8x8-K16 | 1.507328 | 1.900544 | 0.8043478260869565 |
| Q4 | 1 | D-4x8-K16 | 1.441792 | 2.031616 | 0.8409090909090909 |

S5 original/selected: {"B": {"value": 3.723076923076923, "status": "PILOT_ONLY", "differenceNs": 5799936, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.0454545454545454, "status": "WITHIN_ONE_GRID", "differenceNs": 65536, "gridNs": 65536}}

| Q4 | 128 | A-original | 9.306112 | 12.845056 | 1 |
| Q4 | 128 | B-16x16-K16 | 14.123008 | 17.367040 | 0.6589327146171694 |
| Q4 | 128 | B-32x8-K16 | 9.928704 | 12.189696 | 0.9372937293729373 |
| Q4 | 128 | C-8x8-K16 | 2.490368 | 3.080192 | 3.736842105263158 |
| Q4 | 128 | D-8x8-K16 | 3.932160 | 4.980736 | 2.3666666666666667 |
| Q4 | 128 | D-8x16-K16 | 2.883584 | 3.407872 | 3.227272727272727 |

S5 original/selected: {"B": {"value": 1.4224422442244224, "status": "PILOT_ONLY", "differenceNs": 4194304, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.3636363636363635, "status": "PILOT_ONLY", "differenceNs": 1048576, "gridNs": 65536}}

| Q8 | 1 | A-original | 1.179648 | 2.293760 | 1 |
| Q8 | 1 | B-16x16-K16 | 8.552448 | 11.599872 | 0.13793103448275862 |
| Q8 | 1 | B-32x8-K16 | 1.835008 | 4.521984 | 0.6428571428571429 |
| Q8 | 1 | C-8x8-K16 | 1.245184 | 1.376256 | 0.9473684210526315 |
| Q8 | 1 | D-8x8-K16 | 1.441792 | 1.966080 | 0.8181818181818182 |
| Q8 | 1 | D-4x8-K16 | 1.376256 | 2.031616 | 0.8571428571428571 |

S5 original/selected: {"B": {"value": 4.660714285714286, "status": "PILOT_ONLY", "differenceNs": 6717440, "gridNs": 65536}, "C": {"value": 1, "status": "WITHIN_ONE_GRID", "differenceNs": 0, "gridNs": 65536}, "D": {"value": 1.0476190476190477, "status": "WITHIN_ONE_GRID", "differenceNs": 65536, "gridNs": 65536}}

| Q8 | 128 | A-original | 9.338880 | 12.713984 | 1 |
| Q8 | 128 | B-16x16-K16 | 13.402112 | 19.267584 | 0.6968215158924206 |
| Q8 | 128 | B-8x8-K8 | 11.436032 | 17.956864 | 0.8166189111747851 |
| Q8 | 128 | C-8x8-K16 | 2.359296 | 4.325376 | 3.9583333333333335 |
| Q8 | 128 | C-8x16-K16 | 2.392064 | 3.014656 | 3.904109589041096 |
| Q8 | 128 | D-8x8-K16 | 3.866624 | 5.308416 | 2.4152542372881354 |
| Q8 | 128 | D-8x16-K16 | 3.112960 | 4.390912 | 3 |

S5 original/selected: {"B": {"value": 1.171919770773639, "status": "PILOT_ONLY", "differenceNs": 1966080, "gridNs": 65536}, "C": {"value": 0.9863013698630136, "status": "WITHIN_ONE_GRID", "differenceNs": -32768, "gridNs": 65536}, "D": {"value": 1.2421052631578948, "status": "PILOT_ONLY", "differenceNs": 753664, "gridNs": 65536}}

### Ranges of five session statistics (not pooled samples)

| Format:M | Candidate | median range ms | p95 range ms | A/candidate range |
|---|---|---|---|---|
| 4:1 | A-original | 1.179648–1.310720 | 2.424832–2.621440 | [1, 1] |
| 4:1 | B-16x16-K16 | 7.372800–9.601024 | 11.468800–11.665408 | [0.1296928327645051, 0.17777777777777778] |
| 4:1 | B-8x8-K8 | 2.129920–3.080192 | 6.094848–6.160384 | [0.425531914893617, 0.5692307692307692] |
| 4:1 | C-8x8-K16 | 1.114112–1.146880 | 1.310720–1.376256 | [1.0571428571428572, 1.1428571428571428] |
| 4:1 | D-8x8-K16 | 1.409024–1.540096 | 1.900544–1.900544 | [0.8043478260869565, 0.8636363636363636] |
| 4:1 | D-4x8-K16 | 1.441792–1.605632 | 1.966080–2.031616 | [0.7708333333333334, 0.8444444444444444] |
| 4:128 | A-original | 3.604480–9.961472 | 9.961472–12.845056 | [1, 1] |
| 4:128 | B-16x16-K16 | 5.210112–14.286848 | 14.024704–17.498112 | [0.6564102564102564, 0.7044025157232704] |
| 4:128 | B-32x8-K16 | 3.833856–9.961472 | 11.534336–12.320768 | [0.9166666666666666, 1] |
| 4:128 | C-8x8-K16 | 1.179648–2.490368 | 2.621440–4.063232 | [3.0555555555555554, 4.053333333333334] |
| 4:128 | D-8x8-K16 | 1.572864–3.932160 | 4.194304–4.980736 | [2.2857142857142856, 2.533333333333333] |
| 4:128 | D-8x16-K16 | 1.245184–2.883584 | 3.014656–3.604480 | [2.8947368421052633, 3.4545454545454546] |
| 8:1 | A-original | 1.146880–1.376256 | 2.293760–2.621440 | [1, 1] |
| 8:1 | B-16x16-K16 | 7.340032–9.142272 | 11.599872–11.730944 | [0.12681159420289856, 0.1875] |
| 8:1 | B-32x8-K16 | 1.671168–1.835008 | 4.521984–4.718592 | [0.6428571428571429, 0.8235294117647058] |
| 8:1 | C-8x8-K16 | 1.179648–1.245184 | 1.310720–1.376256 | [0.9210526315789473, 1.135135135135135] |
| 8:1 | D-8x8-K16 | 1.277952–1.507328 | 1.900544–1.966080 | [0.7954545454545454, 1.0769230769230769] |
| 8:1 | D-4x8-K16 | 1.310720–1.507328 | 2.031616–2.031616 | [0.7608695652173914, 1.05] |
| 8:128 | A-original | 3.571712–9.338880 | 9.502720–12.779520 | [1, 1] |
| 8:128 | B-16x16-K16 | 5.111808–14.385152 | 17.629184–19.791872 | [0.6127562642369021, 0.6987179487179487] |
| 8:128 | B-8x8-K8 | 4.456448–11.468800 | 11.862016–17.956864 | [0.764367816091954, 0.8166189111747851] |
| 8:128 | C-8x8-K16 | 1.114112–2.424832 | 3.145728–4.325376 | [3.2058823529411766, 3.9583333333333335] |
| 8:128 | C-8x16-K16 | 1.048576–2.424832 | 2.752512–3.604480 | [3.40625, 3.904109589041096] |
| 8:128 | D-8x8-K16 | 1.572864–3.997696 | 4.521984–6.356992 | [2.1983471074380163, 2.4152542372881354] |
| 8:128 | D-8x16-K16 | 1.310720–3.145728 | 3.997696–4.390912 | [2.725, 3] |

| Format:M | Variant | original/selected ratio range | Directions S1–S5 |
|---|---|---|---|
| 4:1 | B | [2.393617021276596, 3.723076923076923] | SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER |
| 4:1 | C | [1, 1] | INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE |
| 4:1 | D | [0.8958333333333334, 1.0454545454545454] | INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, SELECTED_SLOWER, INDISTINGUISHABLE |
| 4:128 | B | [1.3333333333333333, 1.4342105263157894] | SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER |
| 4:128 | C | [1, 1] | INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE |
| 4:128 | D | [1.2530120481927711, 1.3636363636363635] | SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER |
| 8:1 | B | [4.053571428571429, 5.264150943396227] | SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER |
| 8:1 | C | [1, 1] | INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE |
| 8:1 | D | [0.9333333333333333, 1.0952380952380953] | SELECTED_FASTER, INDISTINGUISHABLE, SELECTED_SLOWER, INDISTINGUISHABLE, INDISTINGUISHABLE |
| 8:128 | B | [1.1470588235294117, 1.2798833819241981] | SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER |
| 8:128 | C | [0.9863013698630136, 1.0625] | INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE, INDISTINGUISHABLE |
| 8:128 | D | [1.2, 1.2842105263157895] | SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER, SELECTED_FASTER |

All B selections have lower median than original in all five sessions. M128 D selection likewise has lower median in both formats in all five. These are observed consistent directions under this synthetic prepared-input protocol, not proof of model acceleration or universal stable benefit. M1 D is uncertain: Q4 ratios 0.896–1.045, with S4 slower and others within-grid; Q8 ratios 0.933–1.095 with faster/slower reversals and within-grid observations. Q8 M128 C ratios 0.986–1.063 are all within one grid: no distinguishable improvement. Q4 C and Q8 M1 C selected/original are identical configurations, not an optimization comparison. Retain all data;do not reselect after unfavorable results.

The five repetitions address Part 2 repetition evidence only. Part 1 pure-phase/true-output-token repetitions, trustworthy per-kernel/breakdown, complete process-memory repetitions, physical GPU memory, true logical model shape and Adreno remain unresolved. BASELINE002 subsequently verified five combined-wall sessions per input length; those walls do not close pure phase/token requirements. No additional phone repetitions automatically started.
