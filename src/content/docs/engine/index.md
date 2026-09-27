---
title: Mental Model Engine
description: The three-layer belief graph, how it is implemented with append-only event sourcing, and how its accuracy is validated.
---

The belief graph is Stemolly's core USP. This section covers what it is, how it is built, and how its accuracy is validated.

## Topics

**[Mental Model Design](./mental-model.md)** — The three-layer model (misconceptions, fragility, reasoning patterns), how beliefs are structured as event-sourced evidence streams, and the storage design (one unified graph per student, hybrid identity for misconceptions and patterns).

**[Engine Implementation](./engine-impl/)** — How the graph is technically realised: append-only event logs, CQRS split between write and derive sides, the three projectors (fragility FSM, misconception FSM, pattern accumulator), the three-identifier node model (uuid/slug/display) with alias-merge resolution, catalog trust and lifecycle with operator approval gates, engine-owned study anchors and assignment-brief answer contracts (including answer-key custody), the checkpoint-stamp decoupling of when evidence is written from when it happened, and hexagonal-structure lessons specific to this module. Split into six focused sub-pages.

**[Engine Validation](./engine-validation.md)** — How Stemolly proves the model is actually true: groundedness precision and predictive validity as the two metrics, the LLM-as-judge automation strategy, and the discipline required to keep those metrics trustworthy.
