# Architecture Decision Records (ADR)

An Architecture Decision Record (ADR) captures an important architecture decision along with its context and consequences.

## Conventions

- Directory: `adr`
- Naming:
  - Prefer numbered files when starting fresh: `0001-choose-database.md`
  - If the repo already uses slug-only names, keep that: `choose-database.md`
- Status values: `proposed`, `accepted`, `rejected`, `deprecated`, `superseded`

## Workflow

- Create a new ADR as `proposed`.
- Discuss and iterate.
- When the team commits: mark it `accepted` (or `rejected`).
- If replaced later: create a new ADR and mark the old one `superseded` with a link.

## ADRs
- [Adopt architecture decision records](0001-adopt-architecture-decision-records.md) (accepted, 2026-03-17)
- [Use Bun as build runtime](0002-use-bun-as-build-runtime.md) (accepted, 2026-03-17)
- [Clean rewrite of build system](0003-clean-rewrite-of-build-system-inspired-by-impeccable.md) (accepted, 2026-03-17)

