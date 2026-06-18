---
title: Add Nodes
weight: 20
description: Adding jq, JavaScript, and JSONata computation nodes to a Folder.
draft: false
---

Nodes define the computation graph that h5m applies to every uploaded JSON file. This page covers adding, listing, and removing nodes via the CLI and REST API.

## Prerequisites

A folder must exist before you can add nodes to it:

```bash
h5m add folder my-benchmarks
```

## Add a jq Node

```bash
h5m add jq to <folder> <node-name> <expression>
```

Examples:

```bash
# Extract a scalar value
h5m add jq to my-benchmarks throughput .metrics.throughput

# Arithmetic on a field
h5m add jq to my-benchmarks throughput_mbs ".metrics.throughput / 1000000"

# Boolean check
h5m add jq to my-benchmarks has_errors ".metrics.errors > 0"

# Extract from a nested array
h5m add jq to my-benchmarks slow_ops "[.operations[] | select(.duration_ms > 100) | .name]"
```

## Add a JavaScript Node

```bash
h5m add js to <folder> <node-name> <expression>
```

The expression is evaluated as a JavaScript function body. The input JSON is available as `input`.

```bash
h5m add js to my-benchmarks avg_latency \
  "const vals = input.samples.map(s => s.latency_ms); vals.reduce((a,b)=>a+b,0)/vals.length"
```

## Add a JSONata Node

```bash
h5m add jsonata to <folder> <node-name> <expression>
```

```bash
# Built-in aggregation
h5m add jsonata to my-benchmarks total_requests "$sum(metrics.operations.count)"
h5m add jsonata to my-benchmarks avg_latency "$average(samples.latency_ms)"
```

## Add a Node with Dependencies

Reference upstream node outputs using `{nodeName}:expression` syntax:

```bash
# throughput_mbs depends on the "throughput" node
h5m add jq to my-benchmarks throughput_mbs "{throughput}:.value / 1000000"

# regression depends on throughput_mbs
h5m add jq to my-benchmarks regression "{throughput_mbs}:.value < 40.0"
```

h5m automatically resolves the execution order from the declared dependencies. See [Dependencies](../../concepts/dependencies/) for full syntax details.

## List Nodes

```bash
h5m list node <folder>
```

## Add via REST API

```bash
curl -X POST \
  "http://localhost:8080/api/node?name=throughput&groupId=<groupId>&type=jq&operation=.metrics.throughput"
```

| Query Parameter | Description |
|-----------------|-------------|
| `name` | Node name, unique within the group |
| `groupId` | ID of the NodeGroup (from folder structure response) |
| `type` | `jq`, `js`, or `jsonata` |
| `operation` | The expression string |

To get the `groupId`, inspect the folder:

```bash
curl http://localhost:8080/api/folder/my-benchmarks/structure
```

## Remove a Node

### CLI

```bash
h5m remove node <id>
```

The node ID is shown in `h5m list node <folder>` output.

### REST API

```bash
curl -X DELETE http://localhost:8080/api/node/<id>
```

## After Adding Nodes

If data was already uploaded before you added new nodes, run recalculate to apply the new nodes to existing uploads:

```bash
h5m recalculate my-benchmarks
# or
curl -X POST http://localhost:8080/api/folder/my-benchmarks/recalculate
```

## Tips

- **Test expressions first** — use [jq play](https://jqplay.org/) or the `jq` CLI to validate expressions against a sample JSON file before adding them as nodes.
- **Name clearly** — node names appear in query output and are referenced in dependency expressions. Use descriptive names like `throughput_bytes_per_sec` rather than `t1`.
- **Keep expressions focused** — prefer one node per metric. This makes individual values queryable and keeps the graph readable.
