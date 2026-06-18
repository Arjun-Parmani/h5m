---
title: Comparison to Horreum
weight: 20
description: How h5m differs from Horreum in architecture, deployment, and features.
draft: false
---

h5m is a deliberate simplification of [Horreum](https://horreum.hyperfoil.io). This page compares the two systems to help you understand what h5m changes, what it keeps, and what it currently does not cover.

## Conceptual Model

The biggest difference is how data processing is modeled.

### Horreum

Horreum uses several interrelated entity types to describe how raw JSON benchmark data is processed into meaningful metrics:

- **Schema** — describes the shape of uploaded JSON
- **Extractor** — pulls a value from JSON using JSONPath
- **Label** — combines extractors with optional JS transformations
- **Transformer** — maps uploaded data into a canonical schema
- **Variable** — links labels to change detection
- **Fingerprint** — groups runs for comparison

These entities are configured through a UI and stored relationally. The relationships between them require careful setup.

### h5m

h5m replaces all of the above with a single abstraction: the **Node**. A node is a computation unit that reads inputs (from raw JSON or from other nodes' outputs) and produces values. Nodes are wired into a **directed acyclic graph (DAG)** by declaring dependencies inline using `{nodeName}:expression` syntax.

| Horreum Entity | h5m Equivalent |
|----------------|----------------|
| Schema | Implicit (any JSON is accepted) |
| Extractor | `jq` or `jsonata` Node |
| Label (with JS) | `js` Node |
| Transformer | Node chain (DAG) |
| Variable | Node (output is the variable) |
| Fingerprint | Planned (fingerprint redesign in design docs) |

## Technology Choices

| Concern | Horreum | h5m | Reason for Change |
|---------|---------|-----|-------------------|
| **Query language** | PostgreSQL `jsonpath` | `jq` (jackson-jq) | Turing-complete; in-process; better tooling and AI support |
| **Message broker** | ActiveMQ (AMQ) | In-process WorkQueue | Eliminates external dependency; adds inter-task deps and deduplication |
| **Primary database** | PostgreSQL | SQLite (default) | Enables single-JAR mode; DuckDB and PostgreSQL also supported |
| **Scripting** | Nashorn (JS) | GraalVM Polyglot JS | Modern, supported, compatible with current Java versions |
| **Framework** | Quarkus | Quarkus | Same |
| **Language** | Java 21 | Java 21 | Same |

## Deployment

| | Horreum | h5m |
|-|---------|-----|
| **External services required** | PostgreSQL, ActiveMQ, Keycloak | None (single-JAR default) |
| **Deployment modes** | Kubernetes / OpenShift, bare-metal | Single JAR, Docker |
| **Auth** | Keycloak (OIDC) | OIDC (optional), API keys planned |
| **Database location** | PostgreSQL (external) | `~/h5m.db` by default (`H5M_PATH` env var) |

## Feature Coverage

h5m is an early proof-of-concept. Some Horreum features are not yet implemented:

| Feature | Horreum | h5m |
|---------|---------|-----|
| Benchmark data upload | ✓ | ✓ |
| DAG computation | ✓ (via Label/Extractor chain) | ✓ (explicit DAG) |
| jq / JSONata queries | Partial | ✓ |
| Change detection (fixed threshold) | ✓ | Planned (phase 1 design) |
| Change detection (eDivisive/Hunter) | ✓ | Planned (phase 3 design) |
| Notifications (Slack, email, webhook) | ✓ | Planned (design complete) |
| Views / column configuration | ✓ | Planned (design complete) |
| Grafana integration | ✓ | Not planned |
| Elasticsearch integration | ✓ | Not planned |
| Web UI | ✓ | ✓ (Quarkus + Quinoa) |
| REST API | ✓ | ✓ |
| CLI | Partial | ✓ |

## When to Use h5m vs Horreum

**Use h5m if:**
- You want a simple, self-contained benchmark data store with no infrastructure dependencies
- You prefer `jq` or JavaScript for data extraction over Horreum's UI-driven schema model
- You are experimenting with the DAG computation model
- You want a single-JAR deployment

**Use Horreum if:**
- You need production-grade change detection and notifications today
- You rely on Grafana or Elasticsearch integrations
- You need multi-team access control and a mature web UI
- You are operating at scale with PostgreSQL-backed persistence
