---
title: Testing & Fitness Functions
description: How Stemolly tests its code, enforces its own architecture rules with fitness functions, and the specific ways a green test suite has still shipped a real bug.
---

Tests here do two jobs. Ordinary tests check that code does what it should. **Fitness functions** are a second kind of test — code that checks the *architecture* itself still holds, like "no module imports a real LLM vendor" or "no adapter code lives inside a domain folder." Most of this page is not general testing advice; it is a catalog of specific ways a fully green suite still let a real defect through, each one found by a human reading code, not by CI. That pattern repeats enough to be the actual shape of this topic: green is necessary, but it has never once been sufficient here.

## Fitness functions ship with the code they check

A fitness function is written in the same task that builds the thing it governs, never as a separate "governance phase" done upfront. The reasoning is simple: a check is meaningless before its subject exists. When the project's foundational sprint was planned, only the very first task — the folder scaffold — got its fitness function first, because that task's whole job *was* the structure the check verifies. Every other rule shipped alongside its subject instead: the error-envelope check landed with the contracts package, the append-only-database check landed with Postgres, the logging-discipline check landed with the logger, and so on.

Some checks are deliberately shipped "half-built," covering only the part of a rule whose subject already exists, with the other half explicitly left to land later once its subject is built too. This is normal, not a gap — as long as the missing half is tracked and not silently forgotten (see [Where reviewers have blind spots](#where-reviewers-have-blind-spots) for what happens when it is).

## No automated test ever calls a real LLM

:::caution
CI must never resolve a real LLM provider. This is enforced by a test, not just a convention.
:::

A test living alongside the LLM module's own suite resolves whichever provider is configured under `NODE_ENV=test` and asserts it is never `anthropic`, `openai`, or `google` — only `mock` or `ollama` are allowed. CI sets `STEMOLLY_LLM_PROVIDER=mock` explicitly, never as a silent default, so which provider is active is always visible in the environment instead of inferred. The point of making this a test, rather than a written rule someone is trusted to follow, is that a misconfigured environment variable now fails the build instead of quietly spending real API calls in CI.

## Testcontainers patterns, and the CI mechanics around them

Most integration tests run against a real Postgres started by [testcontainers](https://testcontainers.com/), not a mock database. That buys realism, but real Postgres comes with real transaction rules, and several of them have bitten this project in non-obvious ways.

### A test that expects a failure needs its own SAVEPOINT

The normal isolation pattern wraps each test in `BEGIN` before the test and `ROLLBACK` after, so migrations only run once and tests stay fast. The problem: Postgres aborts the *entire* surrounding transaction the moment any statement fails — a trigger rejection, a unique-constraint violation — so if a test deliberately provokes that failure and then runs a follow-up query (to check the row is unchanged, say), that follow-up query itself fails with "current transaction is aborted."

The fix is a shared `expectRejected(client, fn)` helper that wraps the expected failure in its own `SAVEPOINT` / `ROLLBACK TO SAVEPOINT` pair, so the outer test transaction survives it. One extra rule applies here: a `SAVEPOINT` is scoped to a single physical database connection, and a connection pool can hand out a *different* pooled connection per query. So `expectRejected` must take one checked-out `PoolClient`, never the `Pool` itself — otherwise the `SAVEPOINT` and its `ROLLBACK TO SAVEPOINT` can land on different connections and fail outright. This class of bug is timing-dependent: a test can get lucky, land on the same connection by chance, and pass — so it's caught by the type distinction between `Pool` and `PoolClient`, and by code review, not reliably by a green run.

```mermaid
sequenceDiagram
    participant Test
    participant Client as PoolClient
    participant PG as Postgres
    Test->>Client: pool.connect()
    Test->>PG: BEGIN
    Test->>PG: SAVEPOINT before_fail
    Test->>PG: INSERT expected to fail
    PG-->>Test: ERROR, trigger raises
    Test->>PG: ROLLBACK TO SAVEPOINT before_fail
    Test->>PG: SELECT to confirm row unchanged
    PG-->>Test: OK
    Test->>PG: ROLLBACK
```

### A metering row can't be rolled back or deleted, so it's scoped by the clock

Metering writes are fire-and-forget: the code that records an LLM call does not wait for it, and the write lands on whatever pooled connection is free — not the per-test transaction the test is holding. So rolling back the test's transaction doesn't remove it. Worse, the metering table is append-only, so even the fallback of a `DELETE` in cleanup is rejected by the database.

The working pattern captures `SELECT NOW()` right before each request and later counts only rows created after that timestamp. Because tests in that file run sequentially, no other write can land in a given test's time window. The count also has to be *polled*, not read once, since the row can land slightly after the HTTP response returns.

### `globalTeardown` still runs even when `globalSetup` throws

The end-to-end harness boots several resources in `globalSetup` — a testcontainers Postgres, a pooled connection, a listening server. If setup throws partway through (a bad config, a port already in use), anything acquired but not yet recorded as a handle is invisible to teardown and leaks. The fix is to publish each handle to the shared teardown object the moment it's created, not batched at the end of setup.

This works because of a Playwright behavior worth stating plainly, since nothing in the harness code says it: Playwright genuinely does run `globalTeardown` even when `globalSetup` throws, and it does so *after* the failed setup — verified directly against Playwright's own source. Testcontainers' own reaper (Ryuk) is a real backstop that eventually cleans up orphaned containers, but it's slow and nondeterministic, so it's not a substitute for the explicit teardown path.

### `docker-compose.yml` env vars are not automatic

A docker-compose service only receives an environment variable at runtime if that service's own `environment:` or `env_file:` key names it — `${VAR}` interpolation only substitutes text *inside* the compose file, it does not inject anything into a container's process. A testcontainers test that starts a service's image standalone and hands it env vars directly bypasses the compose file's own wiring entirely, so the compose file's real correctness is never actually exercised, however green the suite looks.

This shipped a real bug: a VPS deploy's edge (Caddy) service had no `environment:` block at all, so on a real deploy Caddy would never get its hostname or bearer-token variables — but the service's own integration test supplied those same variables directly to a standalone container, so it stayed green regardless. A reviewer reading the compose file directly caught it, not any test. The fix was a dedicated regression test that parses the real compose file and asserts every variable a downstream config references is actually declared in that service's own `environment`/`env_file`.

### A CI job with a cross-package import needs its own build step

Each job in a CI workflow starts from a clean checkout, regardless of what a sibling job in the same workflow already did. One integration test imports another package by its bare module name, which resolves through that package's compiled output — a gitignored `dist/` folder that only exists locally once someone has built it. Running that test right after `pnpm install`, with no build step, works by accident on a developer's machine (a stale local `dist/` is still lying around) and fails on a genuinely clean CI checkout with a module-resolution error that looks nothing like a real test failure. Every job that runs code depending on a cross-package runtime import needs its own build step — a sibling job's build does not carry over.

## Test harnesses that quietly diverge from production

Two Fastify-specific traps share the same root cause: a test that isolates a route from the full application can accidentally isolate it from the settings that route depends on to behave correctly.

**A hand-built test app inherits framework defaults, not production settings.** Settings configured once where the real application is built — request-body coercion rules, request-scoped decorations the shared error handler relies on — are properties of *that instance*, not of the routes mounted on it. A test that spins up its own bare Fastify instance to test one route in isolation gets framework defaults instead. The dangerous version of this: without re-applying the production setting that disables automatic type coercion, a malformed request body like the number `123` gets silently coerced to the string `"123"` before validation runs — so a test asserting "a bad body returns 400" instead observes 200, and passes for the wrong reason. It doesn't fail loudly; it just stops guarding anything. The rule that follows: when building an isolated test harness, read the real application's construction code and deliberately copy the settings it applies, and confirm any "this should fail validation" assertion still fails when the real code is broken.

**A guard added at plugin scope silently breaks every existing test on that path.** If a fail-closed guard is hooked at the namespace level, every request into that namespace goes through it — including test requests that build the real app and inject against a route inside it. Those tests start receiving the guard's denial instead of the route's real response, and report a regression in a route that is actually untouched and correct. The fix is not to update the tests' expectations to the denial — that silently deletes their original coverage — but to test the route and the guard separately: the route alone, on a bare instance with no guard in the chain, and the guard's own behavior in its own dedicated test. This kind of collision is easy to under-count because affected tests are spread across unit, integration, and end-to-end tiers, and a local check command that only runs some of those tiers can stay green while CI would fail on the rest.

## Four ways a green suite lies to you

A unit test only proves an artifact honors *its own contract*. It cannot notice that nothing in the running system ever calls that artifact, or that the real caller feeds it something different from what the test built by hand. Four distinct shapes of this have shipped in this codebase, each one invisible to a fully green suite and caught only by a human reading the real code:

```mermaid
flowchart TD
    A["Green, but unused:<br/>verified only against fixtures the artifact's own tests built"] --> B["Green, but partly unreachable:<br/>the function is called, but some of its branches can't be"]
    A --> C["Green, but for the wrong reason:<br/>a missing guarantee that happens to produce correct output today"]
    A --> D["Green, but tautological:<br/>a hand-written fake supplies the very behaviour being asserted"]
```

**Green but unused.** A resolver was implemented, tested, and green — with no production code calling it at all, so it never actually selected anything in the running system. Separately, a schema validated only objects its own tests built by hand, and could not have validated a single real line the production logger ever emitted. Neither gap was visible to unit tests (they only prove the artifact works, not that anything uses it), a dependency check (it only checks edges that exist, not edges that should exist and don't), or a diff review (a module plus its own passing tests reads as complete). The defense is to ask whether an acceptance criterion traces to a real production call path, not merely whether it's test-backed — and a cheap automated check can catch the "nothing imports this" half of that (an exported symbol whose only importers are test files), though it can't catch the wrong-fixture half.

**Green but partly unreachable.** Even a function that *is* reached by a validated production path can still have branches nothing in production can ever hit. One redemption path called an atomic claim first and only fell back to a classification helper on failure — by which point one of that helper's four branches had already become logically impossible, along with its declared return value. The function's signature promised a return value; in the running system it always throws. The cheap check: when a traced call path ends in a function that returns something, read that function's guards against what its caller has already guaranteed. If every path in leads to a throw, the declared contract and the real behavior have quietly diverged.

**Green but for the wrong reason.** A test that only asserts on output is structurally blind to a promise that was never actually made. A SQL query with no `ORDER BY` is the clean example: on a small table, Postgres happens to return rows in insertion order almost every time, so every "is the order correct" test passes honestly — right up until a bigger table, a parallel scan, or a changed query plan breaks it in production, once. This kind of defect is found by reading code and asking what the system *promises*, not by running it. The test for it deliberately inverts the usual advice and asserts on the mechanism (the actual SQL sent must contain an ordering clause) rather than the behavior — which is brittle on purpose, since that's the only way to pin a guarantee that has no visible symptom until it breaks.

**Green but tautological.** When a unit test replaces a real dependency with a hand-written fake, and the thing under test is really *that dependency's own correctness*, the test becomes circular. In one case, a fix required that a lookup be scoped correctly by category — but the test's fake repository already answered per-category correctly, by hand, so the test passed whether or not the real production lookup was scoped at all. Such a test isn't worthless; it proves the caller passes the right argument through, and nothing more. It cannot fail for the reason it looks like it's testing, because the fake and the real implementation would have to actively disagree for it to go red. The real behavioral claim can only be verified against the real implementation — real Postgres, the module's own entry point — with the pre-fix code confirmed to produce a genuine failure first. And the wrong repair is teaching the fake to reproduce the bug: that pins the shape of one historical failure instead of the actual rule, and goes stale the moment the bug is fixed.

## MCP: coverage that decays by default

The MCP adapter's shared result wrapper sits underneath every registered tool, which makes it a single point of failure — and for a while, it sat on no test's real path at all. One test suite drove a real client over a real wire transport, but against a fake engine. The other suite reached real Postgres, but by calling the tool-handler functions directly, skipping the wrapper entirely. So the one piece every tool depends on was never exercised by both a real transport *and* a real database at once, and a defect there stayed invisible to a fully green suite and to a criterion-by-criterion trace, because that trace only confirms a call path exists — it says nothing about a malformed reply coming back out.

```mermaid
flowchart TD
    Client["Real SDK client"] -->|"over InMemoryTransport"| Wrapper["Shared result wrapper<br/>(mcp-server.ts)"]
    Wrapper --> FakeEngine["Fake engine"]
    IntegrationTest["Integration test"] -->|"calls factory directly"| Handlers["Tool-handler factories"]
    Handlers --> RealPG["Real Postgres"]
```

The deeper problem is structural, not a one-off gap: coverage of that wrapper has only ever been added one tool at a time, by whoever happened to be looking when a defect surfaced. Nothing gates the count, so each newly registered tool arrives uncovered by default — the gap doesn't just persist, it widens with ordinary feature work. After each individual fix the wrapper looks "covered" again, because it's genuinely on *some* test's path, while the property that actually matters — every declared tool driven at least once over a real transport against a real database — stays unmeasured. Closing this properly means a fitness function over the *declared tool surface*, counted in tools, not lines: a wrapper handling ten tools in one code path reads as 100% line-covered after a single test while nine other return shapes stay unproven.

One more layer of the same caution applies even once a tool has been driven over a real transport: a successful `tools/call` response with `isError: false` only proves the handler didn't throw. It says nothing about whether the write it claims to have made actually reached the database. Independent proof means querying the store directly and checking for the row — the store itself is the only real witness, for any adapter that sits in front of persistent state.

## Where reviewers have blind spots

Automated gates and human review passes each check something specific — and each one can be fully satisfied while a real defect walks straight through the gap between what it checks and what the rule actually meant.

**A check scoped to one mechanism misses anything that avoids that mechanism.** A rule can state a broad intent while its enforcing check only looks for one narrow shape of violation. One config-discipline rule flags stray environment-variable reads outside two designated files — but says nothing about a policy value hardcoded directly into a layer that should never contain policy at all, because that hardcoded value contains no environment-variable read to flag. Another dependency rule only examines files under a `domain/` folder, so a violation sitting in a module's own top-level file, outside that folder, passes cleanly. The general lesson: when pairing a rule with an automated check, name what that check *cannot* see and write that gap down next to the rule — a check that fires on one shape of violation can make a reviewer less likely to look for the others.

**A wrong acceptance criterion is invisible to every gate downstream of it.** Every gate after a task is written — tests, review passes, a trace from criterion to code — treats the written criterion as ground truth. That's what makes them gates. It also means a criterion that's ambiguous or simply wrong produces a perfectly clean run: the code satisfies what was written, the tests pin what was written, the trace confirms it's reachable, and nothing in that sequence is positioned to ask whether the criterion specified the *right* thing. One criterion never settled whether a lookup should be scoped by category; the implementation picked a reading, the tests encoded that same reading, and both review passes correctly verified the questions their own rubric asks — while the actual scope mismatch sat entirely outside those questions. The practical upshot: a clean gate record measures how hard a task was, not how likely it is to be wrong, and a criterion is worth re-reading as a suspect at review time, not trusted as settled.

**An ADR's own "future work" note is not a tracked commitment.** An accepted decision named a specific file's improper import and ordered it removed. Twelve days later, the import was still there — found only by a human reading the code tree during an unrelated review. The decision had described the boundary it was protecting as a list of individual files, which turned enforcement into a per-file obligation, and the check for one of those files was named in the decision's own text as something a future rule "can" do — and was simply never written. One sibling codebase had the equivalent check; this one didn't, and nothing made that asymmetry visible. Nothing fails when an ADR's stated future work goes unfulfilled, so the record reads as enforced while it is not.

**A review finding can fall through a real gap between two agents' contracts.** An automated design reviewer explicitly excludes judgments about coupling and structural placement, on the grounds that those belong to the human designer at design time — and the designer's own critique checklist, covering seven separate criteria, has no line item for coupling or placement either. Both reviewers behaved correctly under their own rules; the finding simply fell into the space between them, and it had already recurred once before without being fixed. The exclusion is only sound while someone actually catches what it hands off — which is a standing risk, not a closed one.

**An ESLint config rule can silently disable a coverage check it never meant to touch.** In ESLint's flat-config format, when two separate config blocks both set the same rule for overlapping files, the later-registered block's setting for that rule *replaces* the earlier one rather than merging with it. Adding a new rule that reused an existing rule id, over a file pattern that happened to overlap an existing config-discipline block, silently switched off that block's protection for every file the new rule's pattern touched — and no automated check caught it, because both rule blocks were individually well-formed. It took a second, deliberately adversarial review pass to notice. The fix: when two restrictions must apply to the same files under the same rule id, combine them into one config block with multiple selectors, never as separate blocks that both claim the same rule over the same files.

**Reading an ADR's own words matters more than trusting a summary of it — twice, in the same review.** A retrieval note paraphrasing a rejected design option dropped the one clause that actually made the rejection decisive, leaving the note's summary reading as two roughly equal costs where the source ADR names one of them as the reason the whole decision rests on it. A reviewer who read only the note proposed the rejected design again, and had to withdraw it once the ADR itself was read directly.

:::caution
A note is a pointer for retrieval, never a substitute for the record. Before proposing anything an ADR lists as a rejected option, open the ADR and read that section directly.
:::

The same review session repeated the mistake in a second form immediately after fixing the first. The ADR's invariant named a uuid as forbidden in a prompt, an argument, *and* a model-visible result. A follow-up proposal fixed only the argument case, reasoning that an argument lets a model *write* a uuid while a result only lets it *read* one — a real difference in risk, but not a distinction the ADR itself draws, and the result is in fact where a uuid actually enters a model's context in the first place. Neither misreading was carelessness; both were the same kind of compression — reconstructing a rule from the part that felt most important and quietly dropping the rest. The working rule that follows from both: when a proposal touches an accepted ADR, read its invariant sentence and honor every clause in it as written. If a clause genuinely doesn't seem worth keeping, that's an argument to bring to a new decision that supersedes the old one — not a detail to quietly skip.
