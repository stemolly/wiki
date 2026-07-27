---
title: Mental Model Engine
description: The three-layer belief graph, how it is implemented with append-only event sourcing, and how its accuracy is validated.
---

The belief graph is Stemolly's core USP. This section covers what it is, how it is built, and how its accuracy is validated.

## Topics

**[Mental Model Design](./mental-model.md)** — The three-layer model (misconceptions, fragility, reasoning patterns), how beliefs are structured as event-sourced evidence streams, and the storage design (one unified graph per student, hybrid identity for misconceptions and patterns).

**[Engine Implementation](./engine-impl.md)** — How the graph is technically realised: append-only event logs, CQRS split between write and derive sides, the three projectors (fragility FSM, misconception FSM, pattern accumulator), and the known open problems (ordering, alias merge, edge validation, pattern valence).

**[Engine Validation](./engine-validation.md)** — How Stemolly proves the model is actually true: groundedness precision and predictive validity as the two metrics, the LLM-as-judge automation strategy, and the discipline required to keep those metrics trustworthy.
