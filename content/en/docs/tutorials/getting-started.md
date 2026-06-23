---
title: Getting Started
weight: 10
description: Install h5m and run it for the first time.
draft: false
---

This guide walks you through building h5m from source, running the server, and verifying everything works with a simple data upload.

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Java | 21+ |
| Maven | 3.9.0+ |
| Git | Any recent version |

## Clone the Repository

```bash
git clone https://github.com/hyperfoil/h5m.git
cd h5m
```

## Build Options

h5m supports multiple build profiles depending on how you want to run it.

### Web Server (default)

Builds h5m as a Quarkus web application with a REST API and browser UI:

```bash
mvn clean package
```

The output JAR is at `target/quarkus-app/quarkus-run.jar`.

### CLI Tool

Builds a command-line interface for interacting with a running h5m server (or the local database directly):

```bash
mvn clean package -Pcli
```

The CLI binary is at `target/cli/h5m`.

### Native Binary (GraalVM)

Produces a native executable with faster startup and lower memory usage:

```bash
mvn clean package -Pcli -Pnative
```

Requires GraalVM with native image support installed.

## Run the Server

```bash
java -jar target/quarkus-app/quarkus-run.jar
```

By default h5m:
- Listens on **http://localhost:8080**
- Stores data in **`~/h5m.db`** (SQLite)

To use a different database path, set the `H5M_PATH` environment variable:

```bash
H5M_PATH=/data/my-benchmarks.db java -jar target/quarkus-app/quarkus-run.jar
```

## Verify the Server is Running

```bash
curl http://localhost:8080/api/folder
```

Expected response:

```json
[]
```

An empty array means the server is up and no folders exist yet.

## Run in Dev Mode

For local development, Quarkus dev mode gives you live reload:

```bash
mvn quarkus:dev
```

The UI is available at `http://localhost:8080` and the API at `http://localhost:8080/api/`.

## Next Steps

- Follow the [CLI Quickstart](../cli-quickstart/) for a full end-to-end walkthrough
- Learn how to [upload data](../uploading-data/) from benchmark runs
- Read about [core concepts](../../concepts/) to understand Folders, Nodes, and Values
