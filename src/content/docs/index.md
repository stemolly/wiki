---
title: Stemolly Wiki
description: AI tutoring platform knowledge wiki — start here.
---

Stemolly is an AI tutoring platform whose core claim is that it can see *how a student thinks* — not just what answers they produce. That claim is realised in a persistent **belief graph** (misconceptions, fragility, and reasoning patterns), a pluggable-pedagogy engine, and a two-app product (Student app + Console) designed to be rewired as the team learns.

*Generated from durable knowledge notes on 25 September 2026 at 08:05 UTC.*

## How to read this wiki

The wiki is organised into five sections. Start with **Product** to understand what Stemolly is and what MVP-1 ships. Move to **Mental Model Engine** to understand the core technical thesis. **Pedagogy & Sessions** covers how teaching happens. **System Architecture** covers the key structural decisions. **Engineering Practices** covers how the codebase is built and kept correct.

For the full topic list, see [All Topics](./all-topics.md).

## Sections

**[Product](./product/index.md)** — What Stemolly is, its USP, the scope of MVP-1 including the Engine-Validation PoC, and the Student app's freehand board.

**[Mental Model Engine](./engine/index.md)** — The three-layer belief graph, how it is implemented with append-only event sourcing, and how its accuracy is validated.

**[Pedagogy & Sessions](./pedagogy/index.md)** — How the tutor teaches, what a lesson brief is, how probing and scaffolding work, and how dialogue is rendered and internationalised.

**[System Architecture](./architecture/index.md)** — Topology, module structure, the LLM and agent layer, auth and security, and the API contract.

**[Engineering Practices](./engineering/index.md)** — Backend and persistence, testing and fitness functions, observability, and resilience.
