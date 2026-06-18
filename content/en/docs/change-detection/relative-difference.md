---
title: Relative Difference
weight: 20
description: Flag values that deviate from a historical baseline by more than a configured percentage.
draft: false
---

The **Relative Difference** detection node compares the most recent uploaded value against a historical baseline and flags it if the change exceeds a configured percentage threshold. Unlike Fixed Threshold — which checks against a static bound — Relative Difference adapts to the natural level of your metric over time.

It is well-suited for catching regressions like "throughput dropped by more than 20% compared to last week" without requiring you to know the exact absolute numbers in advance.

## How It Works

![Relative Difference Sliding Window](/images/change-detection/relative-difference-timeseries.png)

1. For each new upload, the node identifies the relevant historical baseline value (the previous result for the same fingerprint group)
2. It computes the ratio: `(last - previous) / previous × 100`
3. If the absolute ratio exceeds the configured threshold, a violation `Value` is recorded
4. Positive ratios indicate improvement; negative ratios indicate regression

A violation `Value` contains:

```json
{
  "previous": 1000.0,
  "last": 750.0,
  "value": 750.0,
  "ratio": -25.0,
  "fingerprint": { "platform": "x86", "config": "default" }
}
```

| Field | Description |
|-------|-------------|
| `previous` | The baseline value from the prior upload |
| `last` | The current value from the latest upload |
| `value` | Same as `last` — the current value |
| `ratio` | Percentage change: `(last - previous) / previous × 100` |
| `fingerprint` | The fingerprint group this comparison belongs to |

A `ratio` of `-25.0` means a 25% drop — the value decreased from 1000 to 750.

## Configuration

| Config Field | Type | Description |
|---|---|---|
| `threshold` | `Double` | Minimum percentage change to trigger a violation (e.g. `20.0` = 20%) |
| `direction` | `String` | `"DECREASE"`, `"INCREASE"`, or `"BOTH"` (default) |

Setting `direction = "DECREASE"` only flags regressions (drops below the baseline). Setting it to `"BOTH"` flags unexpected improvements as well.

## Adding a Relative Difference Node

### CLI

```bash
h5m add relativedifference <name> to <folder> range <metric-node> by root fingerprint <fingerprint-node> threshold <value>
```

Example — flag if throughput drops more than 20%:

```bash
h5m add relativedifference throughput-rd to my-benchmarks \
  range throughput \
  by root fingerprint buildConfig \
  threshold 20
```

### REST API

```bash
curl -X POST \
  "http://localhost:8080/api/node/configured?name=throughput-rd&groupId=<groupId>&type=rd" \
  -H "Content-Type: application/json" \
  -d '{
    "threshold": 20.0,
    "direction": "DECREASE"
  }'
```

## Querying Detected Regressions

Relative Difference violations are stored as `Value` records with discriminator type `rd`. Query them using the standard Value API:

```bash
curl http://localhost:8080/api/value/node/<rdNodeId>
```

Example response showing a 25% throughput drop:

```json
[
  {
    "id": 103,
    "nodeId": 88,
    "path": "run-043.json",
    "data": {
      "previous": 1000.0,
      "last": 750.0,
      "value": 750.0,
      "ratio": -25.0,
      "fingerprint": { "buildConfig": "release" }
    }
  }
]
```

An empty array means no violations exceeded the threshold.

## Fingerprinting

Both Fixed Threshold and Relative Difference nodes use **fingerprints** to group comparable runs. A fingerprint is a set of key-value pairs that identify "same environment" comparisons — for example `{platform: "x86", config: "release"}`. The Relative Difference node only compares runs that share the same fingerprint, so a result from a `debug` build does not incorrectly flag against a `release` baseline.

See the Concepts section for details on how fingerprinting works within the DAG.

## DAG Position

A Relative Difference node sits downstream of both an extraction node and a fingerprint node:

```
[raw JSON upload]
      │
      ├──────────────────┐
      ▼                  ▼
[throughput]         [buildConfig]
jq: .throughput      jq: .build.config
      │                  │
      └────────┬──────────┘
               ▼
        [throughput-rd]
        relative difference
        threshold: 20%
```

## Comparison to Fixed Threshold

| | Fixed Threshold | Relative Difference |
|-|----------------|---------------------|
| **Bound type** | Static (you set the numbers) | Dynamic (relative to prior run) |
| **Best for** | Hard limits (SLAs, safety bounds) | Regression detection across releases |
| **Requires history** | No | Yes — needs at least one prior upload |
| **Output `ratio` field** | No | Yes |
| **Node discriminator** | `ft` | `rd` |
