---
title: Backend & Persistence
description: PostgreSQL as the sole datastore, in-process job runner design, migration conventions, configuration patterns, and local dev tooling notes.
---

Stemolly's backend keeps things deliberately simple: one PostgreSQL database holds every kind of data the app needs, and even asynchronous work runs through that same database instead of a separate queue. On top of that sits a small set of conventions — how migrations are written, how config is read, how the local dev stack is wired up — plus a few hard-won lessons about things that go wrong when a process runs for a long time. This page walks through all of it, from the top-level "why one database" decision down to the gotchas you'll actually hit running the stack on your machine.

## One Postgres instance holds (almost) everything

There is no separate graph database and no dedicated event store. PostgreSQL holds the concept graph (as nodes/edges tables, traversed with recursive CTEs), the append-only evidence and prediction logs, the belief projections built from them, catalogs, and ordinary relational data — with JSONB used for payloads that change shape often, like event bodies, report bodies, and translated display names.

```mermaid
graph TD
  PG["PostgreSQL<br/>(single instance)"]
  PG --> CG["Concept graph<br/>(nodes/edges + recursive CTEs)"]
  PG --> EV["Evidence & prediction logs<br/>(append-only, trigger-enforced)"]
  PG --> PROJ["Belief projections<br/>(rebuildable)"]
  PG --> JOBS["Jobs table<br/>(async work queue)"]
  PG --> CAT["Catalogs & relational data"]
  Neo["Neo4j graph database"] -.->|rejected| PG
  Broker["Redis / message broker"] -.->|rejected| PG
```

A dedicated graph database (Neo4j) was considered and rejected: the graph traversals this app needs are shallow — things like "what are this concept's prerequisites" or "what are its taxonomy children" — and the genuinely hard part of the system is student state, which is shaped like events and projections, not like a graph. A second store would only add operational burden and make it harder to change course later. A dedicated event store was rejected for a simpler reason: plain Postgres append-only tables, backed by triggers that block updates and deletes, already give the event semantics needed, with zero extra infrastructure.

Keeping everything in one store also means one backup story for the evidence log — which cannot be recreated if lost — and transactional integrity between appending an event and updating the projection that depends on it. Graph traversal itself is not scattered through the codebase; it's encapsulated in the engine's own graph repository, so if a graph-shaped need ever did justify a dedicated store, the swap would stay local to that one place.

## Async work runs inside the same database, not a separate queue

Background jobs — Expert checkpoints, judge batches, ingestion, invite emails — run on an in-process worker loop backed by a plain Postgres jobs table. A worker claims a row with, in essence:

```sql
SELECT ... FROM <jobs table>
FOR UPDATE SKIP LOCKED;
```

`FOR UPDATE SKIP LOCKED` is what makes this safe with multiple workers: it locks the row a worker claims and lets every other worker simply skip past rows that are already locked, instead of blocking on them. Think of the jobs table as a shared to-do list — each worker grabs the next unclaimed item and locks it, so nobody else can pick up the same task while it's in progress. Jobs get retries with attempt caps, and a job that exhausts its retries is surfaced as a reliability metric rather than silently dropped.

A message broker — Redis/BullMQ, RabbitMQ, SQS — was considered and rejected. At a queue depth of dozens of jobs per day, it would be infrastructure the project doesn't need yet; the jobs table is deliberately the seam a real broker would replace later, if volume ever demands it. Using the same database the jobs act on also has a bonus: because enqueueing a job and committing the data change that triggered it happen in the same transaction, the jobs table works as an outbox for free — no separate mechanism needed to avoid "the data changed but the job was never queued."

Delivery is at-least-once, not exactly-once, so any handler that writes evidence must be idempotent: a deterministic idempotency key plus a unique constraint makes a replayed checkpoint a safe no-op instead of a duplicate append. The single-process throughput ceiling this implies is accepted at the project's current (cohort) scale, with pulling the worker into its own process documented as the future scale-out path if it's ever needed.

## Migrations: node-pg-migrate, one file per schema

Schema migrations run through `node-pg-migrate`, a thin, programmatic migration runner — not Prisma or Knex. This makes concrete an already-decided principle: heavy ORMs are rejected here in favor of a thin, hand-written SQL layer, because the append-only triggers and recursive CTEs this project relies on need to stay legible, and a schema DSL would just be something to fight when a migration needs a raw trigger or an unusual constraint.

On top of that tool choice sits a file-layout convention. All migrations live in one shared, chronological timeline under `server/migrations/`, but each individual file touches exactly one module's own schema — starting with `CREATE SCHEMA IF NOT EXISTS <module>;` and then that module's tables. A migration file that creates tables outside its named module's schema is a review smell. For the handful of append-only tables (`evidence_events`, `predictions`, `llm_calls`, `guardrail_events`, `transcript_turns`), the same migration that creates the table also calls a shared `makeAppendOnly(pgm, schema, table)` helper, which installs the `BEFORE UPDATE OR DELETE` trigger that gives the append-only fitness function (G-5a) something concrete to check.

:::note
Migrations that touch the `engine.*` schema carry extra weight: they must be called out explicitly in the PR description against the G-4 schema-review checklist (no domain, pedagogy, or vendor leakage; node identity intact). Migrations for `metering` or any other schema get ordinary review — the engine alone carries the stakes of the "protect the engine's domain-agnostic core" principle, so it alone gets the stricter bar.
:::

### Two entry points, two configs

`node-pg-migrate` is driven two different ways in this project: the `migrate:up` CLI script (local dev and deploy) and the in-process `runner()` API (used by the testcontainers integration harness). These two entry points **share no configuration** — anything that matters has to be set on both, separately. Two settings matter in practice: an `ignorePattern` (`tsconfig\.json|.*\.test\.ts`), because the migration scanner otherwise treats every non-dotfile in the migrations directory — including its own `tsconfig.json` — as a migration and fails; and a TypeScript loader, since a migration imports an uncompiled `.ts` helper (`--tsx` for the CLI, a one-time `tsx/esm` `register()` call for the in-process runner). Forgetting a setting on one path only breaks that path — which is exactly how a misconfiguration can pass locally against the CLI and only fail once CI runs the in-process runner (or the reverse).

### A hand-written `down()` can orphan objects

When a migration exports no `down()`, `node-pg-migrate` auto-generates one by reversing each `up` operation in order. Exporting an explicit `down()` bypasses that inference completely — the hand-written version runs verbatim, however incomplete it is.

:::caution
This bit the project once already. A hand-written `down()` that only dropped a table left behind the standalone trigger function that `makeAppendOnly` had created — a trigger dies with its table, but a function is an independent schema object that doesn't. The next down-then-up cycle then failed with "function already exists." The fix was to delete the explicit `down()` and let auto-reverse handle it (which correctly drops trigger, function, table, extension, and schema in reverse order). The general guidance: migrations that create non-trivial objects — functions, triggers, extensions — should prefer auto-reverse and ship with a down-then-up regression test rather than a hand-rolled `down()`.
:::

### Naming the `evidence_events` uniqueness constraint

One specific constraint has its own naming convention worth knowing, because it looks odd at first glance. The `UNIQUE NULLS NOT DISTINCT` constraint on `engine.evidence_events` has been dropped and recreated under a new name every time a migration changed which columns it covers or what one of those columns means:

```mermaid
graph LR
  A["evidence_events_positional_key<br/>(R-19)"] --> B["evidence_events_occurrence_key<br/>(ADR-022)"]
  B --> C["evidence_events_student_scoped_key<br/>(ADR-026)"]
  C --> D["evidence_events_catalog_ref_key<br/>(ADR-033 / #91)"]
```

Each name describes only what *that* migration changed — never the full seven-column identity the constraint actually enforces. This is deliberate: it lets someone reading `\d evidence_events` infer which migration produced the constraint currently in place. It's also a workaround — `node-pg-migrate` v8.0.4 has no rename-preserving option that's compatible with `UNIQUE NULLS NOT DISTINCT`, so every rename is a raw-SQL drop-and-add rather than an `ALTER ... RENAME CONSTRAINT`. This is safe because nothing in the codebase reads the constraint by name; the `ON CONFLICT` insert path in the evidence repository infers its target from the column list, not the constraint's name. A future rename should follow this same fingerprint pattern rather than reverting to a single "descriptive" name for the whole key — the project has consistently chosen the fingerprint over the full description.

## Configuration: one STEMOLLY_ convention, one aggregator

Environment variables follow one naming pattern, `STEMOLLY_<AREA>_<NAME>` (for example `STEMOLLY_LLM_TIER_FAST_MODEL`), and are read in exactly one place — a `config.ts` aggregator — validated per-module against zod schemas, rather than read ad hoc via `process.env` scattered through the codebase. `.env` files are dev-only, and secrets are never committed to the repo. This closed a gap the architecture phase had deliberately left open: config and secrets were named as a seam early on, but no concrete rule was minted until this convention.

That still leaves one question per value: should it be required, or defaulted? For anything security-relevant, the answer settled on is **bounded and defaulted, plus a production-only presence check** — not a required variable with no default. The worked example is the invite-token TTL, previously a hardcoded constant deep in the pure domain layer:

```
STEMOLLY_INVITE_TTL_HOURS=168   # integer, 1-168, defaults to 168; presence checked only when NODE_ENV=production
```

A plain required variable was considered and rejected. Every other field in the config schema has a default, so one lone required field is inconsistent — and in practice it just gets the same value copy-pasted into dev, test, CI, and compose, which looks like a deliberate choice at each site while actually being one unreviewed value spread across four places. What actually needs protecting against is a *wrong* value, and a validated range does that directly: boot fails on zero, on negative, on non-numeric input, and on anything past the ceiling. The production-only presence check then supplies the forcing function exactly where stating the policy explicitly matters, and nowhere else.

Two smaller details worth keeping in mind for any similar case: the unit belongs in the variable name, and it should be the unit legible at the deploy site — hours, not milliseconds, so the value isn't a wall of zeros. And the value must be passed into the domain function as a parameter rather than read from config inside the domain layer itself, so "make it configurable" never quietly sinks an environment read into code that's supposed to stay pure.

## Running the stack locally

The tracked Docker Compose config is split into two files with different jobs. `docker-compose.yml` is the deployable: `docker compose up` on a clean checkout brings up the whole stack — web, server, and Postgres, all `restart: unless-stopped` — with no manual setup, and it publishes only the web host port. The server (3000) and Postgres (5432) are reachable only over the compose network, never published to the host. `compose.dev.yml` is a separate, opt-in file that stands up Postgres alone, for running the server locally with `pnpm --filter server dev`; it's used explicitly via `docker compose -f compose.dev.yml up -d`.

```mermaid
graph TD
  Host["Host machine"] -->|published port| Web
  subgraph Deployable["docker-compose.yml (deployable)"]
    Web["web<br/>(nginx)"]
    Server["server<br/>(port 3000, internal only)"]
    PGDep["postgres<br/>(port 5432, internal only)"]
  end
  Web --> Server
  Server --> PGDep

  subgraph DevFile["compose.dev.yml (opt-in)"]
    PGDev["postgres<br/>(dev volume only)"]
  end
```

The dev file deliberately isn't named `docker-compose.override.yml` — Compose auto-merges anything with that exact filename into every `docker compose up`, which would silently pull dev config into the deployable's clean-checkout bring-up and defeat the whole point of the split. The two files also use distinct volume names (`stemolly-postgres-data` vs `stemolly-dev-postgres-data`) so running both from the same directory doesn't collide on one Docker volume.

:::caution
Running a Postgres client (like Adminer) in its own container and pointing it at `localhost` will fail even when Postgres is running fine — inside that client's own container, `localhost` means the container itself, not the host, so you get a connection-refused error that looks exactly like the database isn't up. Fix it by running the client with `--network host` (Linux), or by addressing the host as `host.docker.internal` instead of `localhost`. Separately, a stray leading space in a copy-pasted host value produces a DNS lookup error that's easy to mistake for a real connectivity problem rather than a malformed string.
:::

:::tip
Adminer only shows one Postgres schema at a time, defaulting to `public`. If the tables you expect aren't there — and all you see is an unrelated bookkeeping table like a migration tool's own tracking table — you're very likely just looking at the wrong schema, not facing a connectivity problem. Switch schemas with Adminer's schema-selector dropdown, or add `&ns=<schema>` to its login URL. In engine-poc, for example, the application tables (`nodes`, `edges`, and so on) live in the `engine` schema; `public` holds only `pgmigrations`.
:::

## Two hazards in long-lived processes

Two problems below share a root cause: something written for a short-lived process turns out to break a long-lived one.

**`tsx`'s `register()` leaves a process-wide trap.** `register()` (from `tsx/esm/api`) installs ESM/CJS module-loader hooks for the whole process, and it never removes them. The test harness calls it so that `node-pg-migrate`'s in-process `runner()` can load `.ts` migration files — harmless in a one-shot Vitest worker, where nothing meaningful loads after the test finishes, but fatal in a process that keeps loading modules afterward.

```mermaid
sequenceDiagram
  participant GS as globalSetup
  participant PG as startPostgres
  participant Reg as "tsx register()"
  participant BS as buildServer

  GS->>PG: start container + migrate in-process
  PG->>Reg: register loader hooks
  Reg-->>PG: hooks stay installed process-wide
  GS->>BS: buildServer()
  BS->>BS: fastify requires logger-pino.js
  BS--xGS: TypeError - leftover load hook can't satisfy the require
```

That's exactly what happened when a Playwright `globalSetup` called `startPostgres()`: the container booted and migrated fine, but the very next step, `buildServer()`'s `fastify()` call, threw a `TypeError` from inside Fastify's plain CJS `require` of its logger module — the leftover `tsx` load hook was intercepting a require it couldn't satisfy. Removing the `startPostgres()` call and pointing config at a plain database URL made `buildServer()` succeed, confirming it was `tsx`'s residue, not Playwright or Fastify.

The resolution: run the migration step in a spawned **child process** — `node-pg-migrate`'s own CLI with `--tsx`, mirroring the `migrate:up` script — instead of in-process, so `tsx`'s registration is confined to that short-lived child. The Postgres container itself still starts in the caller's process, so its lifetime stays tied to the long-lived process that owns it.

:::caution
The general rule: a process-global loader hook is a side effect on the *whole process*, not just on the call that installed it. Any helper that registers one is only safe to use where nothing meaningful loads afterward.
:::

**`compose()` builds a connection pool that nobody closes for you.** `compose(config)` constructs the `pg.Pool` backing the persistence and metering modules, but nothing downstream takes ownership of it. `buildServer(ctx)` receives an already-built app context and never touches the pool; Fastify's `app.close()` shuts down the HTTP server and its plugins, but knows nothing about a pool it didn't create.

:::caution
Any code that calls `compose()` directly — an integration test, a Playwright `globalSetup`/`globalTeardown` pair, any future test harness — must end the pool explicitly:

```ts
await app.close();
await ctx.modules.persistence.pool.end();   // not implied by app.close()
await db.stop();
```

Skip that middle line and the pool's connections dangle past the database container's own shutdown, either holding the process open or throwing connection errors against a database that no longer exists. This is a direct consequence of how the app is wired together: whoever constructs a resource owns its lifetime, and `compose()`'s caller is what constructed the pool — `app.close()` just looks like a complete shutdown without being one.
:::
