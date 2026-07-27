---
title: All Topics
description: Comprehensive index of every topic in the Stemolly wiki, grouped by section.
---

Comprehensive index of every topic in this wiki, grouped by section.

| Section | Topic | Page | Summary |
|---------|-------|------|---------|
| Product | Stemolly Overview | [overview](./product/overview.md) | What Stemolly is, its belief-graph USP, pluggable pedagogy, two-app structure, and evolvability as the primary NFR. |
| Product | MVP Scope & PoC | [mvp-poc](./product/mvp-poc.md) | MVP-1 scope (Student app + Console, Lesson mode, Math K11 + Language IELTS) and the Engine-Validation PoC with Claude as Guide and Analyst over an append-only MCP. |
| Mental Model Engine | Mental Model Design | [mental-model](./engine/mental-model.md) | Three-layer belief graph (misconceptions, fragility, reasoning patterns), event-sourced belief storage, hybrid identity, one unified graph per student. |
| Mental Model Engine | Engine Implementation | [engine-impl](./engine/engine-impl.md) | Append-only event sourcing with CQRS, evidence schema (envelope + JSONB), three projectors with distinct promotion gates, and open problems (ordering, alias merge, edge validation). |
| Mental Model Engine | Engine Validation | [engine-validation](./engine/engine-validation.md) | Two validation levels, groundedness precision and predictive validity as metrics, LLM-as-judge automation with calibration, pinning, and offline-only execution. |
| Pedagogy & Sessions | Teaching & Sessions | [teaching](./pedagogy/teaching.md) | Socratic as one pluggable pedagogy, lesson briefs as authored direction, probing policy, graduated scaffolding ladder, and AI-assisted human-approved authoring. |
| Pedagogy & Sessions | Conversation & Internationalisation | [conversation](./pedagogy/conversation.md) | Open plugin mechanism for message types, Markdown+KaTeX render pipeline, envelope-before-interface ordering, and three independent language axes. |
| System Architecture | Core Architecture | [core-arch](./architecture/core-arch.md) | Evolvability as primary NFR, monorepo+single-deployable topology, modular monolith, TypeScript end-to-end, four-pillar governance. |
| System Architecture | LLM & Agent Layer | [llm-agents](./architecture/llm-agents.md) | Vendor-agnostic tiered LLM orchestration, @noetaris/harness substrate, Guide/Analyst two-agent tutor, versioned persisted Report as sole communication channel. |
| System Architecture | Module Structure | [module-structure](./architecture/module-structure.md) | Hexagonal layering (domain/ports/adapters), leaf-adapter rule, barrel-only index.ts, dependency-cruiser as machine-readable architecture, explicit factory wiring. |
| System Architecture | Auth & Security | [auth-security](./architecture/auth-security.md) | Invite-only server-side sessions, surface-aware cookie invariant, subdomain isolation, CI-guarded /api/auth/* namespace, atomic single-use invite tokens. |
| System Architecture | API & Transport | [api](./architecture/api.md) | Flat POST tutor-turn route, no streaming in MVP, ajv coercion disabled, Fastify validation errors mapped to the error envelope. |
| Engineering Practices | Backend & Persistence | [backend](./engineering/backend.md) | PostgreSQL sole datastore, in-process job runner, node-pg-migrate conventions, STEMOLLY_ env-var config, tsx subprocess and pool teardown hazards. |
| Engineering Practices | Testing & Fitness Functions | [testing](./engineering/testing.md) | Fitness functions co-ship with governed code, mock-LLM-only CI, testcontainers patterns, and three "green but wrong" failure modes only review catches. |
| Engineering Practices | Observability & Resilience | [observability](./engineering/observability.md) | Schema-checked Pino logging, explicit RequestContext tracing, single error envelope with LLM escalation tiers, in-process worker fault-tolerance strategy. |
