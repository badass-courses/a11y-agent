# Clean rewrite of build system inspired by impeccable

- Status: accepted
- Date: 2026-03-17
- Deciders: Vojta

## Context

We need a build system to transform `source/skills/` into provider-specific output for 8 AI agent platforms. The impeccable project (Apache 2.0) has a working build system, but it includes ~400 lines of unrelated logic (Tailwind compilation, Cloudflare Pages API, motion/playwright deps, prefixed skill versions, pattern extraction).

We have 3 skills and 6 reference files. The build logic we actually need is straightforward.

## Decision

Write a clean build script from scratch, using impeccable's output format and provider transformation patterns as reference. Same output structure (`dist/{provider}/.{config}/skills/`), same frontmatter transformations per provider, but a single focused script without impeccable's website/bundling concerns.

Non-goals: Cloudflare Pages API, Tailwind, prefixed skill versions, pattern extraction.

## Consequences

- **Positive:** Small, readable codebase (~150-200 lines). Zero external deps. Easy to maintain and extend.
- **Negative:** Must manually track if impeccable changes its output format or adds providers. No automatic sync.
- **Follow-up:** No attribution needed — we're writing from scratch, not copying code.

## Alternatives Considered

- **Vendor and trim:** Copy impeccable's transformers, strip unused parts. More code, tighter coupling to upstream structure.
- **Depend on impeccable:** Import as dev dependency. Tightest coupling, but we'd inherit all the unneeded complexity.

## Links

- Related ADRs: [0002 - Use Bun as build runtime](0002-use-bun-as-build-runtime.md)
- Upstream: [pbakaus/impeccable](https://github.com/pbakaus/impeccable)
