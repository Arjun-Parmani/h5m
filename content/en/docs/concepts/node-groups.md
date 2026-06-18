---
title: NodeGroups
weight: 40
description: How NodeGroups organize Nodes within a Folder and control their shared data source.
draft: false
---

A **NodeGroup** is a collection of nodes that share the same data source within a Folder. It is the container that holds the actual node graph for a given computation context.

## Relationship to Folders and Nodes

```
Folder
└── NodeGroup (one or more)
    ├── Node A
    ├── Node B
    └── Node C (depends on A and B)
```

- A **Folder** can contain one or more NodeGroups
- A **NodeGroup** contains one or more Nodes
- Nodes within the same NodeGroup share access to the same uploaded JSON and can reference each other's outputs

## Purpose

NodeGroups exist to support different computation contexts within the same folder. For example, a folder could have:

- A NodeGroup for **summary metrics** (throughput, latency, error rate)
- A NodeGroup for **change detection** nodes (fixed threshold, relative difference)
- A NodeGroup for **fingerprinting** (grouping runs by environment or build)

Each group is independent — nodes in one group cannot directly reference outputs from nodes in a different group.

## Automatic Creation

When you add the first node to a folder via the CLI, h5m automatically creates a default NodeGroup. You typically do not need to manage NodeGroups explicitly unless you are building multiple independent computation graphs within the same folder.

```bash
# This creates a NodeGroup implicitly if none exists
h5m add jq to my-benchmarks throughput .metrics.throughput
```

## REST API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/group/{name}` | Get a NodeGroup by name |
| `GET` | `/api/group/id/{id}` | Get a NodeGroup by ID |
| `DELETE` | `/api/group/{id}` | Delete a NodeGroup (and its nodes) |

## NodeGroup vs NodeGroup

If you are coming from Horreum, there is no direct equivalent. The closest analogy is a **Schema** combined with its associated **Extractors** and **Labels** — the NodeGroup defines which transformations are applied to data in that folder, and the nodes within it define the individual steps.

## Listing NodeGroups

Inspect the folder structure to see its NodeGroups:

```bash
curl http://localhost:8080/api/folder/my-benchmarks/structure
```

Or retrieve a specific group:

```bash
curl http://localhost:8080/api/group/my-benchmarks
```
