# Use Bun as build runtime

- Status: accepted
- Deciders: Vojta
- Date: 2026-03-17

## Context and Problem Statement

The accessible-web skill pack needs a build system to transform `source/skills/` into provider-specific output for 8+ AI coding agents. We need a JS runtime to execute the build scripts.

The upstream project (impeccable by Paul Bakaus) uses Bun. We're vendoring/adapting those build scripts.

## Decision Drivers

- Upstream compatibility — impeccable uses Bun, less friction adapting scripts
- Developer experience — fast startup, built-in TS support, native file APIs
- Distribution — skill pack authors who fork this should have a smooth setup

## Considered Options

- **Bun** — upstream's choice, fast, modern APIs
- **Node.js** — universal, zero-install on most systems, the next-steps doc's original suggestion

## Decision Outcome

Chosen option: **Bun**

Impeccable uses Bun. Matching the upstream runtime means less adaptation work and easier future syncs. Bun's built-in glob, fast file I/O, and native TS support simplify the build scripts. Contributors already need a modern JS toolchain.

### Positive Consequences

- Direct compatibility with impeccable's build patterns
- Faster builds (Bun's file I/O and startup)
- Can use `Bun.glob`, `Bun.file`, `Bun.write` directly

### Negative Consequences

- Contributors must install Bun (not pre-installed like Node)
- Slightly smaller ecosystem for edge cases

## Links

- Upstream: [pbakaus/impeccable](https://github.com/pbakaus/impeccable)
- Related: [next-steps-build-system.md](../next-steps-build-system.md)
