---
title: Hexagonal Module Structure
description: How the engine separates its domain core from infrastructure adapters — orchestration in module.ts, the leaf-adapter invariant in practice, and near-identical twin types at the port boundary.
---

The engine follows a hexagonal module shape: a domain core surrounded by ports that separate it from callers on one side and infrastructure on the other. Three specific decisions from building this module are worth carrying forward, because each turned into a lesson about where a rule needs to live.

## Orchestration lives in `module.ts`, adapters are leaves

The leaf-adapter invariant says an adapter may contain no decision that can be expressed without doing I/O. The corollary is that all orchestration — slug resolution, envelope validation, occurrence-key assignment, belief fold coordination — belongs in `core/module.ts` and only there.

Before issue #114, `PgEvidenceRepository.appendCheckpointBatch` did its own slug resolution, envelope validation, and occurrence-key assignment internally. Moving this orchestration into `module.ts` means the repository now expects `KeyedObservation[]` — pre-resolved, pre-keyed observations — rather than the raw, slug-based shape it used to receive.

The practical consequence: any code calling the repository's `appendCheckpointBatch` directly with the old raw-observation shape no longer type-checks. The correct call site is `EngineModuleApi.appendCheckpointBatch` (the module's driving API method, which still takes the original slug-based `EvidenceObservationInput[]` and handles the validate+key step internally). The production path — `mcp/src/tools/student.ts` → `append_evidence` tool → module API — was always correct; only code that bypassed the module (typically test scripts copied from an earlier prototype) needed updating.

## The leaf-adapter invariant in practice: the re-propose guard

The rejected-slug guard provides the clearest example of the invariant in action. The rule "a rejected catalog slug may not be re-proposed" is expressed in two places:

- **Module core**: an explicit check-and-throw. This is where the *rule* lives — readable from TypeScript without touching any SQL.
- **Adapter SQL**: `ON CONFLICT ... WHERE status <> 'rejected'`. This closes a time-of-check-to-time-of-use window in which a rejection landing between the core's check and the write could otherwise slip through.

Deleting the core-side check was considered. It is the smaller change, and with only the SQL guard, every case would be handled correctly. It was rejected because it would leave the rule stated nowhere a reader could find it except inside a piece of adapter SQL — against the invariant that adapters hold no decision expressible without I/O, and against the principle that engine rules are readable from TypeScript alone.

The two copies do different jobs. The core check states **the rule** and produces the caller-facing error. The SQL clause closes **the race**. Neither is redundant; both should be clearly labelled as to which role they play.

## Near-identical twin types the anti-duplication rule cannot see

The engine's driving contract and driven contracts hold four pairs of types that are structurally field-for-field identical except for one field — the model-facing shape names a concept by `homeNodeSlug`, the repository-facing twin by `homeNodeId`. `ProposeCandidateInput` / `ResolvedProposeCandidate` and `CandidateRef` / `ResolvedCandidateRef` are the clearest examples.

These are not a duplication violation: the slug-versus-uuid boundary makes the two sides genuinely different shapes, and the resolved variants are deliberately placed on the driven side. But the CI rule enforcing "a shape both sides need lives in the domain layer, never duplicated across the two" checks imports, not structural identity. Two type definitions that are field-identical but import nothing from each other pass the check cleanly — it cannot distinguish a legitimate twin pair from an accidental copy-paste, and never will.

This is worth recording because the engine is the reference implementation other modules copy. A newcomer who finds four near-clone pairs in the exemplar may reasonably read them as license to clone rather than share. The rule's positive half — put a genuinely shared shape in the domain layer, once — is review-enforced only here. There is no automated check standing in for that judgment.
