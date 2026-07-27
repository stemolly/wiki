---
title: Mental Model Design
description: The three-layer student belief graph — misconceptions, fragility, and reasoning patterns — what each layer means, how beliefs are structured, and why the model is the core USP.
---

# Mental Model Design

Stemolly's core claim is that it can see *how a student thinks*, not just what answers they produce. That claim lives entirely in the **belief graph** — a persistent, per-student model built up over many sessions. The graph has three layers: **misconceptions** (specific wrong beliefs), **fragility** (how shallow correct answers actually are), and **reasoning patterns** (deep habits that cut across subjects). Together they let the Socratic AI ask the right question at the right moment, and they let the team observe exactly how a student's thinking evolves. Without persistence across sessions, none of this is possible — resetting the model each session would destroy the product's core value.

```mermaid
flowchart TD
    subgraph "Per-student Belief Graph"
        A["Misconceptions<br/>named wrong beliefs, per concept node"]
        B["Fragility<br/>grip on a concept: unprobed / fragile / robust"]
        C["Reasoning Patterns<br/>cross-concept habits: emerging / established / fading"]
    end
    B -->|"a fragile spot can crystallize into"| A
    C -->|"causes misconceptions and fragility<br/>across many nodes"| A
    C -->|"causes misconceptions and fragility<br/>across many nodes"| B
```

## Layer 1 — Misconceptions

A **misconception** is a specific, named wrong belief held by one student about one concept. Example: *believes (a+b)² = a²+b²*. It is linked to the session where it was first observed. Resolving a misconception requires more than a correct answer — the student must demonstrate correct unprompted reasoning in a *novel* context, because a student can produce the right answer by memorization without understanding.

### How beliefs are stored — event sourcing

Each misconception is stored as a statement plus an **append-only list of evidence events**. The current status is *derived* from those events; it is never written directly. Each event records:

- the session it came from
- a stable pointer into the transcript
- a short frozen excerpt (for audit)
- a polarity — does this event *support* or *contradict* the belief?

This design means beliefs are always auditable, always evidence-backed, and always reopenable. If a student resolves a misconception but later shows the wrong belief again, a new supporting event un-resolves it automatically. Nothing is deleted. The lifecycle runs: **candidate → confirmed → resolved → reopened**.

### Misconception identity — a hybrid model

Identifying "the same misconception" across different students is harder than it sounds. Two students can hold the exact same wrong belief but describe it in completely different words. There are two extreme options — pure free text (flexible but impossible to aggregate) and a fixed pre-built catalog (easy to count but blind to new misconceptions). Stemolly uses a **hybrid**:

1. The engine always writes the wrong belief as **free text** first. Nothing is ever lost.
2. Each belief also carries a nullable `canonical_id` that links it to a **shared catalog** entry when one exists.
3. The MVP starts with an **empty catalog**. Canonical entries are created later, from patterns seen in real student data.

The catalog grows through two distinct steps:

- **Auto-match** — when a new belief is recorded and a matching catalog entry already exists, the engine attempts a semantic match. On high confidence it assigns `canonical_id` immediately; otherwise it leaves it null.
- **Promote** — unmatched free-text beliefs accumulate. Once several beliefs cluster around the same wrong idea, a human on the team reviews and approves creating a new catalog entry, then back-fills existing beliefs with its id.

Auto-match runs from day one because matching against a human-approved entry is safe. Promotion is manual in MVP — the team is already reading transcripts, volume is small, and a bad merge would corrupt every downstream count. Later, an LLM can propose clusters, but a human in the Console always approves. The Console needs an **"unmatched misconceptions" review queue** for this workflow.

## Layer 2 — Fragility

**Fragility** answers a different question from misconceptions: not *is the belief wrong?* but *is the correct belief deep or shallow?*

A student who always answers correctly might still be pattern-matching — applying a memorized surface rule without understanding why it works. Fragility is separate from the mastery score precisely because a high-score student can still be fragile.

Fragility is a **property of one student's grip on one concept node**. It has three derived states:

| State | Meaning |
|---|---|
| **Unprobed** | Correct on familiar work, but never stress-tested — understanding is unknown |
| **Fragile** | Stress-tested and it broke — fails on transfer tasks or cannot explain why |
| **Robust** | Stress-tested and it held — transfers to new contexts and explains why unprompted |

The load-bearing rule: **unprobed must never be treated as robust.** A pattern-matcher and a true understander look identical until one of them is probed. Absence of probe evidence means *unprobed*, not *robust*. The AI must provoke fragility actively — by applying concepts in unexpected contexts, or by asking "why does this work?" — before the engine can call anything robust.

Fragility and misconceptions feed each other. A fragile spot that is probed and breaks can crystallize into a named misconception. So the two layers are not independent.

## Layer 3 — Reasoning Patterns

A **reasoning pattern** sits *below* misconceptions and fragility in the diagnosis hierarchy. A single pattern — for example, *reverts to guess-and-check when stuck* or *gives up when the surface form changes* — causes wrong beliefs and shallow understanding across many concept nodes at once. Fixing one pattern can therefore help across many topics simultaneously, which is why this layer exists separately.

Reasoning patterns are **domain-general**: the same habit looks identical whether the student is doing algebra or reading comprehension. They belong to the student as a whole, not to any one concept.

### Tendency, not a switch

Unlike a misconception (which resolves like a switch turning off), a reasoning pattern is a *habit* — something the student does more or less often over time. It is therefore modeled as a **tendency**:

- a recency-weighted **strength** (how consistently the student exhibits the behavior)
- a derived **status**: *emerging*, *established*, or *fading* — never *resolved*, only weaker

A single observed instance is not a pattern. A pattern only reaches *established* after multiple observations across different concepts. This honesty rule is the cousin of fragility's "unprobed is not robust" — one data point proves nothing.

Each pattern also carries a **valence**: *productive* or *unproductive*. Good habits (spontaneously checking an answer, asking why before applying a rule) are patterns worth capturing and reinforcing, not just weaknesses to fix.

### Identity — catalog-leaning hybrid

Because the set of possible reasoning patterns is small and stable — unlike the endless variety of content-specific misconceptions — identity for patterns leans heavily on a **pre-made canonical catalog**. Free text is used only occasionally, to catch a rare novel pattern. This contrasts with the misconception case, where free text is the primary form and catalog matching is secondary.

### Predictions across subjects

Fragility predicts a break on *one specific concept*. A reasoning pattern predicts a break by *type of situation*, regardless of topic. For example, a student with an *established* pattern of giving up when the surface form changes will likely struggle on any unfamiliar-looking problem — even in a subject they have not yet started. This cross-subject prediction is one of the strongest demos of the belief graph's value over a simple completion tracker.

Although a pattern is stored at the student level, each evidence event records which concept it came from. This means the pattern's scope — global versus localized to one subject area — emerges from the accumulated evidence rather than being declared up front.

## How the Graph Is Stored

### One graph per student, across all subjects

Each student has a single unified belief graph covering every domain — Mathematics, Language, and so on — not a separate graph per subject. This is required because reasoning patterns are domain-general and already live at the student level. A shallow habit that surfaces in both algebra and reading is one pattern on one model. A per-subject graph would silo that signal.

### Shared concept structure vs. per-student belief state

Two things are both called "graph" but they are distinct:

```mermaid
graph LR
    subgraph "Shared (authored, reused across all students)"
        SG["Concept Graph<br/>nodes, edges, canonical labels,<br/>seeded misconceptions"]
    end
    subgraph "Per-student (one per student)"
        PS["Belief State<br/>held misconceptions, fragility per node"]
        RP["Reasoning Patterns"]
        PL["Prediction Log"]
    end
    PS -->|"references nodes by ID"| SG
    RP -->|"evidence events point to nodes"| SG
    PL -->|"references nodes by ID"| SG
```

- The **concept graph** is shared authored structure: nodes with prerequisite edges, canonical labels, and seeded misconceptions. It is lean and reusable across every student.
- The **per-student belief state** (which misconceptions *this* student holds, fragility per node) references concept nodes by ID. It is not stored on the graph node itself.
- Everything cross-cutting — reasoning patterns and the prediction log — is stored on the student, not in the graph. A reasoning pattern has no single node to live on; storing it in the graph would force duplication across every concept it touches.

Within the one store, domains are partitioned by a `domain/subject` tag on each node. Curricula (K11, SAT-Math, IELTS) are **overlays** — they map curriculum concepts onto shared nodes, many-to-one where granularity differs, matched by a human via AI proposal.

### Language-neutral concept identity

A concept node's identity is a **language-neutral ID**, not a name in any language. The canonical label is English; display names are localized for the Console. This keeps one node per concept regardless of the language it is taught in. The mathematical concept "factoring a quadratic" is the same node whether taught in a Vietnamese K11 class or an English SAT course. Storing separate nodes per language for the same concept would silo the student's understanding and destroy the cross-curriculum transfer signal the belief graph exists to capture.

## In MVP — Backend Only

In the MVP, the belief graph runs entirely in the background. There is no screen shown to students. Students experience the engine through the quality of the Socratic conversation itself — the feeling of being well-understood, of solving the right problems at the right time — not by looking at their own graph.

The graph is visible only in the **Console's Observe area**. In MVP-1, the primary audience is the Stemolly team, who use it to confirm the engine is working correctly. Showing the graph to students is deferred and treated as a later UX concern, not a technical constraint.

For details on how the engine updates the graph during a session, see [Engine Implementation](./engine-impl.md). For how the graph's accuracy is checked, see [Engine Validation](./engine-validation.md).
