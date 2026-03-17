# Project Instructions for Claude

## Build System

```bash
bun run build      # Build all provider formats + sync .claude/skills/
bun run clean      # Remove dist/
```

Source files use `{{argName}}` placeholders that get replaced per-provider.

## Source Format

Skills live in `source/skills/{name}/SKILL.md` with YAML frontmatter. The build system transforms them into 8 provider-specific formats in `dist/`.

After building, Claude Code output is synced to `.claude/skills/` (checked into git).

## Adding New Skills

1. Create `source/skills/myskill/SKILL.md` with frontmatter
2. Run `bun run build`
3. Commit source files + updated `.claude/skills/`
