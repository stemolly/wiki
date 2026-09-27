---
title: Product
description: What Stemolly is, its core USP, and what MVP-1 delivers including the Engine-Validation PoC.
---

This section covers what Stemolly is, why it is built the way it is, and what MVP-1 delivers.

## Topics

**[Stemolly Overview](./overview.md)** — The product's identity, core USP (belief-graph knowledge model vs topic completion), the two-app structure (Student app + Console), and the pluggable-pedagogy architecture that defines the platform.

**[MVP Scope & PoC](./mvp-poc/)** — What ships in MVP-1 (Lesson mode, Math K11 deep, Language IELTS thin), and the Engine-Validation PoC: Claude as Guide and Analyst over an append-only MCP built on the real engine schema, deployed on a VPS. Sprint 13 archived engine-poc and moved the engine and MCP adapter wholesale into app/ unchanged. Split into product scope, PoC design/boundaries, and PoC operations.

**[Student Board & App](./student-board.md)** — The Student app's freehand board as the primary interaction surface: the server-sequenced append-only event log, closed board-kind vocabulary enforced across three registries, Guide annotation via computed stroke-chunk anchors, session lifecycle and turn-loop, and the React rendering layer (`TurnProvider`, exhaustive per-kind renderers).
