---
title: Nodes
weight: 30
description: Computation nodes and the three supported expression languages — jq, JavaScript, and JSONata.
draft: false
---

A **Node** is the fundamental computation unit in h5m. It takes one or more inputs — either the raw uploaded JSON or the outputs of upstream nodes — applies an expression, and produces one or more **Values**.

Every node has:

- A **name** — unique within its NodeGroup
- A **type** — one of `jq`, `js`, or `jsonata`
- An **expression** — the filter or function to apply
- **Dependencies** (optional) — references to other nodes' outputs, declared inline in the expression

## Node Types

### jq

Uses [jq](https://jqlang.org/) syntax, evaluated in-process via [jackson-jq](https://github.com/eiiches/jackson-jq).

jq is a Turing-complete JSON filter language with strong community support and broad tooling (editors, playgrounds, AI assistants). It is the recommended default for most extraction and transformation tasks.

```bash
# Extract a nested value
h5m add jq to my-benchmarks throughput .metrics.throughput

# Compute a ratio
h5m add jq to my-benchmarks error_rate ".metrics.errors / .metrics.total_requests"

# Filter an array
h5m add jq to my-benchmarks slow_endpoints "[.endpoints[] | select(.p99_ms > 100)]"
```

**When to use:** Extracting fields, filtering arrays, arithmetic, string manipulation, most data transformation needs.

### js

Uses JavaScript (ECMAScript), executed via [GraalVM Polyglot](https://www.graalvm.org/reference-manual/js/).

The expression is a function body that receives the input as a variable and must return a value. Useful when you need full programmatic logic — loops, conditionals, complex aggregations — that jq syntax makes awkward.

```bash
# Compute a moving average (simplified example)
h5m add js to my-benchmarks avg_throughput \
  "const vals = input.runs.map(r => r.throughput); vals.reduce((a,b)=>a+b,0)/vals.length"
```

**When to use:** Complex logic, multi-step computations, when jq expressions become difficult to read.

### jsonata

Uses [JSONata](https://jsonata.org/), a declarative JSON query and transformation language with built-in aggregation functions.

```bash
# Sum all values in an array
h5m add jsonata to my-benchmarks total_ops "$sum(metrics.operations)"

# Average with a built-in function
h5m add jsonata to my-benchmarks avg_latency "$average(runs.latency_ms)"
```

**When to use:** Aggregations, when JSONata's built-in functions (`$sum`, `$average`, `$count`, etc.) match your need.

## Adding Nodes

### CLI

```bash
# jq node
h5m add jq to <folder> <name> <expression>

# js node
h5m add js to <folder> <name> <expression>

# jsonata node
h5m add jsonata to <folder> <name> <expression>
```

### REST API

```bash
curl -X POST \
  "http://localhost:8080/api/node?name=throughput&groupId=<groupId>&type=jq&operation=.metrics.throughput"
```

| Parameter | Description |
|-----------|-------------|
| `name` | Node name (unique within the group) |
| `groupId` | The NodeGroup this node belongs to |
| `type` | `jq`, `js`, or `jsonata` |
| `operation` | The expression string |

## Node Outputs

A node produces one **Value** per uploaded data file. If the expression returns a scalar (number, string, boolean), that is stored as the value. If it returns an array or object, the entire structure is stored.

A single node can produce multiple scalar outputs if the expression returns an array — each element becomes a separate value entry.

## Removing Nodes

```bash
# CLI (by ID shown in list node output)
h5m remove node <id>

# REST
curl -X DELETE http://localhost:8080/api/node/<id>
```

Removing a node does not automatically delete its computed values. Use `recalculate` after structural changes to keep values consistent.

## Node Dependencies

Nodes can reference other nodes' outputs using the `{nodeName}:expression` syntax. See [Dependencies](../dependencies/) for full details.
