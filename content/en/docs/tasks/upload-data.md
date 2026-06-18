---
title: Upload Data
weight: 30
description: Pushing JSON benchmark results into h5m via the CLI or REST API.
draft: false
---

Data is uploaded to h5m as JSON files — one file per benchmark run or data point. After upload, h5m processes the file through the folder's node graph and stores the computed values.

## Prerequisites

- A folder must exist: `h5m add folder <name>`
- At least one node must be defined so there is something to compute

## Upload via CLI

```bash
h5m upload <directory> to <folder>
```

h5m reads every `.json` file in the given directory and uploads each one:

```bash
h5m upload ./results/ to my-benchmarks
```

The command returns immediately. Processing is **asynchronous** — wait a moment before querying values.

## Upload via REST API

The REST API accepts one JSON document per request:

```bash
curl -X POST \
  "http://localhost:8080/api/folder/my-benchmarks/upload?path=run-001.json" \
  -H "Content-Type: application/json" \
  -d @run-001.json
```

| Parameter | Location | Description |
|-----------|----------|-------------|
| `name` | Path | Folder name |
| `path` | Query (optional) | Label for this upload — stored with each computed value for traceability |

### Upload a Directory via Script

```bash
for file in ./results/*.json; do
  filename=$(basename "$file")
  curl -s -X POST \
    "http://localhost:8080/api/folder/my-benchmarks/upload?path=${filename}" \
    -H "Content-Type: application/json" \
    -d @"$file"
  echo "Uploaded $filename"
done
```

## JSON Format Requirements

h5m imposes no schema on uploaded JSON. Any valid JSON object is accepted. The structure only matters in that your node expressions must be able to read it.

A minimal example:

```json
{
  "metrics": {
    "throughput": 52428800
  }
}
```

A richer example with metadata:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "build": "main-abc123",
  "environment": "ci-runner-1",
  "metrics": {
    "throughput": 52428800,
    "latency": {
      "p50_ms": 4.2,
      "p95_ms": 8.7,
      "p99_ms": 12.4
    },
    "errors": 3,
    "total_requests": 10000
  }
}
```

## Recalculate

If you add or change nodes after uploading data, reprocess existing uploads:

```bash
# CLI
h5m recalculate my-benchmarks

# REST API
curl -X POST http://localhost:8080/api/folder/my-benchmarks/recalculate
```

This re-runs the full node graph against every previously uploaded file and replaces the stored values.

## Checking What Was Uploaded

Inspect the folder structure to see its uploaded data and node graph:

```bash
curl http://localhost:8080/api/folder/my-benchmarks/structure
```

## Tips

- **Use the `path` parameter** — tagging uploads with a meaningful `path` (e.g. the filename, git SHA, or CI run ID) makes it easy to trace a value back to its source later.
- **Asynchronous processing** — uploads queue work internally. For large batches, add a brief pause or poll the value API to confirm processing has completed before querying.
- **JSON arrays** — if your benchmark tool outputs a JSON array of runs, either split it into separate files or use a jq node with `.[]` to iterate over elements.
