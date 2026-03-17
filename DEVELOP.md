# Contributor Guide

## Architecture

```
source/skills/
  {name}/
    SKILL.md          # Frontmatter + body with {{placeholders}}
    reference/        # Optional reference files (copied as-is)

scripts/build.ts      # Build script (~250 lines, zero external deps)

dist/
  {provider}/
    .{configDir}/
      skills/
        {name}/
          SKILL.md    # Transformed for provider tier
          reference/  # Copied reference files

.claude/skills/       # Synced from dist/claude-code — checked into git
```

Build: `source/` → transform per provider → `dist/` + sync → `.claude/skills/`

## Source Format

Each `SKILL.md` starts with YAML frontmatter:

```yaml
---
name: my-skill
description: What this skill does
user-invokable: true          # false = loads automatically, not a /command
args:
  - name: area
    description: "Optional focus area"
license: "Attribution string"  # Optional
---

Skill body. Use {{area}} placeholders matching arg names.
```

## Provider Tiers

The build system outputs 8 providers across 3 tiers:

| Tier     | Providers                        | Frontmatter         | Args        |
|----------|----------------------------------|---------------------|-------------|
| full     | claude-code, opencode            | All fields          | `{{name}}`  |
| moderate | agents, codex                    | name/desc/invokable | `<name>` or `$NAME` |
| basic    | cursor, gemini, kiro, pi         | name/desc only      | readable fallback |

Arg placeholder format varies: `{{area}}` (full), `<area>` (agents), `$AREA` (codex), `{{args}}` (gemini), `the specified area` (basic).

## Build Commands

```bash
bun run build    # Clean dist/, transform all skills, sync .claude/skills/
bun run clean    # Remove dist/ only
```

Output: `{N} skills × 8 providers = {N} files` plus sync confirmation.

## Adding a New Skill

1. Create `source/skills/{name}/SKILL.md` with frontmatter
2. Add `reference/*.md` files if needed (optional)
3. Run `bun run build`
4. Verify `dist/` output looks correct across providers
5. Commit `source/skills/{name}/` + updated `.claude/skills/`

## Repository Structure

```
source/skills/
  a11y-agent/       # Core skill — loads automatically, not a /command
  a11y-audit/       # /a11y-audit [area] — audit and report
  a11y-fix/         # /a11y-fix [area] — implement fixes
scripts/
  build.ts          # Single build script
adr/                # Architecture Decision Records
  0001-adopt-architecture-decision-records.md
  0002-use-bun-as-build-runtime.md
  0003-clean-rewrite-of-build-system-inspired-by-impeccable.md
dist/               # Generated — not committed
.claude/skills/     # Synced from dist/claude-code — committed
```

## ADRs

- [ADR 0001](adr/0001-adopt-architecture-decision-records.md) — why ADRs
- [ADR 0002](adr/0002-use-bun-as-build-runtime.md) — Bun as build runtime
- [ADR 0003](adr/0003-clean-rewrite-of-build-system-inspired-by-impeccable.md) — build system design
