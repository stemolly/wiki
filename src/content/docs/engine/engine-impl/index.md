---
title: Engine Implementation
description: How the engine turns an append-only log of student observations into rebuildable belief state — event sourcing, the three belief projectors, node identity, and catalog lifecycle.
---

The engine's whole job is to turn raw, observed student behavior into a trustworthy picture of what a student believes — without ever losing the ability to change its mind about how it computes that picture. It does this with one big structural choice: record observations permanently, and treat everything the engine "knows" about a student as something computed fresh from those records, not something stored and edited directly.

That one choice shapes everything else here. This section walks through five parts of the story:

- **[Event Log and the Evidence Schema](/engine/engine-impl/event-sourcing-evidence/)** — why observations are append-only, what one evidence event actually contains, and the chain of integrity fixes that hardened it as real usage exposed gaps.
- **[The Three Belief Projectors](/engine/engine-impl/projectors/)** — how the engine derives fragility, misconceptions, and reasoning patterns from the same log, each behind its own kind of promotion gate.
- **[Node Identity and Alias-Merge](/engine/engine-impl/node-identity-alias-merge/)** — the three names one concept carries, what happens when two concepts turn out to be the same one, and the long-running effort to get that merge right everywhere.
- **[Catalog Entry Lifecycle](/engine/engine-impl/catalog-lifecycle/)** — how a misconception or reasoning-pattern entry moves between candidate, approved, and rejected, and why that status can flip with no rebuild.
- **[Hexagonal Structure: Engine-Specific Lessons](/engine/engine-impl/hexagonal-structure/)** — a few sharp, engine-specific lessons about where domain vocabulary is allowed to live and where the module's port boundaries went wrong.

At the center of all five is one split: a **write side** that only ever appends typed observations, and a **read side** that derives everything else by replaying them. The two never call each other directly.

```mermaid
flowchart LR
    Evidence["evidence<br/>(validate + append)"] -->|"appends"| Log[("Append-only<br/>evidence_events")]
    Log -->|"replay"| Projections["projections<br/>(one projector per belief layer)"]
    Catalog["catalog<br/>(misconception & pattern registry)"] -.->|"read-time trust join"| Projections
    Graph["graph<br/>(nodes, edges, traversal)"] -.->|"read-time alias & prerequisite resolution"| Projections
```

Because the write side knows nothing about how beliefs are computed, the derivation code can be rewritten and the whole log replayed to get a fresh, consistent belief state — which matters a lot for a system whose belief model is expected to be wrong early on and cheap to fix later.
