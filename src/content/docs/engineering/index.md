---
title: Engineering Practices
description: Backend and persistence, testing and fitness functions, observability, and resilience.
---

This section covers how the Stemolly codebase is built, tested, and kept correct.

## Topics

**[Backend & Persistence](./backend.md)** — PostgreSQL as the sole datastore, the in-process Postgres-backed job runner, node-pg-migrate conventions, the STEMOLLY_ env-var config pattern, and runtime hazards (tsx loader, pool teardown).

**[Testing & Fitness Functions](./testing.md)** — Fitness functions that co-ship with the code they govern, mock-LLM-only CI, testcontainers patterns (SAVEPOINT, single PoolClient, clock-scoped metering), cross-package CI build requirements, and four "green but wrong" failure shapes — unreachable artifact, unreachable branch, missing ordering guarantee, and tautological fake — plus the structural decay problem with MCP transport coverage.

**[Observability & Resilience](./observability.md)** — Structured Pino logging with a schema-checked field set, explicit RequestContext for traceId propagation, the single error envelope with LLM failure escalation tiers, and the in-process worker's fault-tolerance strategy.
