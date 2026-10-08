# PROFILE003 offline overlap audit (does not block GEMM001)

[Original raw JSON](../results/raw/PROFILE003-2026-10-05T03-20-03-974Z.json) remains unchanged. Reproduce with `python scripts/review_profile003_overlap.py`. Comparisons follow sample order; submission order has no inversions (previous verifier).

```json
{
  "sourceSha256": "040c5c4b667789b5ced7b5c7dd02d8abc85e3f085588b4e85f9ee9fa82e3af3d",
  "adjacentPairs": 2004,
  "overlap": {
    "count": 1898,
    "minNs": 327680,
    "medianNs": 27459584.0,
    "nearestRankP95Ns": 56360960,
    "maxNs": 100073472,
    "atMost65536Ns": 0,
    "greaterThan65536Ns": 1898
  },
  "groups": {
    "same_command_buffer": {
      "count": 0
    },
    "same_submit_distinct_command_buffers": {
      "count": 0
    },
    "cross_submit": {
      "count": 1898,
      "minNs": 327680,
      "medianNs": 27459584.0,
      "nearestRankP95Ns": 56360960,
      "maxNs": 100073472,
      "atMost65536Ns": 0,
      "greaterThan65536Ns": 1898
    }
  },
  "querySlotDuplicates": 0,
  "repeatedTimedSubmissions": 0,
  "endFinishSubmitOrderChecksPass": true,
  "resolveCopyMetadataCount": 2005,
  "resolveCopyOrderEvidence": "pass_timestamps.mjs finish wrapper checks ended, appends resolve then copy, then native finish; raw observer records end/finish/submit but not individual native resolve/copy call timestamps",
  "rootCause": "UNKNOWN",
  "sourceLocations": {
    "uniqueQuerySlot": 96,
    "resolveOutsidePass": 124,
    "copyAfterResolve": 125,
    "finishAfterCopies": 130,
    "repeatSubmitDetection": 145,
    "pageReadAfterDrain": 167
  }
}
```

Source evidence: [pass_timestamps.mjs](../src/profiling/pass_timestamps.mjs) assigns each slot once, uses a unique chunk/local*2 query pair, resolves/copies after ended passes in the encoder finish wrapper, and marks repeated submissions as incomplete. [profile003.js](../src/profiling/profile003.js) reads chunks only after generation/drain. No duplicate query slots or repeated timed submission is found in this record. Source ordering is consistent with raw end/finish/submit; the observer did not log individual resolve/copy execution timestamps, so that is source evidence rather than independent command-trace proof.

Most overlap is larger than one 65536 ns grid step; timestamp quantization alone is therefore not an established explanation. Driver timestamp stages, scheduling, browser/backend implementation and collection behavior remain unverified possibilities, not diagnosed causes. No pass-time sums, kernel ranking or model performance conclusions follow. No new phone diagnosis page/model change is added. GEMM001 uses a separate one-dispatch serial pass protocol and proceeds independently.
