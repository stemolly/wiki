---
title: System Architecture
description: Topology, module structure, the LLM and agent layer, auth and security, and the API contract.
---

This section covers the structural decisions that shape the entire codebase.

## Topics

**[Core Architecture](./core-arch.md)** — Evolvability as the primary NFR, the monorepo+single-deployable topology, the modular monolith rationale, the TypeScript stack, and the four-pillar governance model.

**[LLM & Agent Layer](./llm-agents.md)** — The vendor-agnostic tiered-by-task LLM strategy, the @noetaris/harness substrate, the Guide/Analyst two-agent tutor split, and how they communicate only through a versioned persisted Report.

**[Module Structure](./module-structure.md)** — Hexagonal layering inside each module, the leaf-adapter rule, re-export-only barrel files, dependency-cruiser as the machine-readable architecture, and explicit composition-root factory wiring.

**[Auth & Security](./auth-security.md)** — Invite-only email+password with server-side sessions, the surface-aware cookie invariant, subdomain isolation, the governed /api/auth/* namespace, and invite token security.

**[API & Transport](./api.md)** — The flat POST route for tutor turns, no token streaming in MVP, ajv coercion disabled app-wide, and the uniform error-envelope contract.
