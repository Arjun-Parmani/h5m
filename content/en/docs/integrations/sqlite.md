---
title: SQLite
weight: 10
description: Using SQLite as the h5m storage backend — zero-config, single-file persistence.
draft: false
---

SQLite is the simplest h5m backend: no server to install, no credentials to configure, and no network required. Data is stored in a single file on disk. It is the recommended backend for local development, CLI usage, and single-JAR deployments.

## Configuration

Override the datasource kind and JDBC URL at startup:

```bash
export QUARKUS_DATASOURCE_DB_KIND=sqlite
export QUARKUS_DATASOURCE_JDBC_URL=jdbc:sqlite:/home/user/h5m.db
java -jar target/h5m.jar
```

Or add to `application.properties`:

```properties
quarkus.datasource.db-kind=sqlite
quarkus.datasource.jdbc.url=jdbc:sqlite:/home/user/h5m.db
```

## File Location

The database file can be placed anywhere on the filesystem. Common conventions:

| Path | When to use |
|------|-------------|
| `~/h5m.db` | Personal / developer use |
| `/var/lib/h5m/h5m.db` | System service deployment |
| `/data/h5m.db` | Docker volume mount |

## In-Memory Mode

For testing or ephemeral use, run SQLite entirely in memory — data is lost when the process exits:

```bash
export QUARKUS_DATASOURCE_DB_KIND=sqlite
export QUARKUS_DATASOURCE_JDBC_URL=jdbc:sqlite::memory:
java -jar target/h5m.jar
```

## Connection Pool

SQLite is a file-based database and handles concurrency differently from server databases. Keep the pool small:

```properties
quarkus.datasource.jdbc.initial-size=1
quarkus.datasource.jdbc.min-size=1
quarkus.datasource.jdbc.max-size=2
```

Running more than a few concurrent writers against SQLite will cause contention. For high-concurrency workloads, use PostgreSQL instead.

## Backup

Because all data lives in a single file, backup is simple:

```bash
# Copy while h5m is stopped
cp ~/h5m.db ~/h5m.db.bak

# Online backup using the SQLite CLI
sqlite3 ~/h5m.db ".backup ~/h5m.db.bak"
```

## When to Use SQLite

- Local development and experimentation
- CLI-driven workflows with no concurrent writers
- Single-user deployments without infrastructure overhead
- CI pipelines where data does not need to persist between runs (use in-memory mode)

For multi-user or production deployments, see [PostgreSQL](../postgresql/).
