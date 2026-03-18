---
name: a11y-review
description: "Lightweight code review pass for accessibility. Checks markup, event handlers, ARIA, test coverage in changed files. Use for PR reviews, pre-merge checks, or when asked to \"review for accessibility\". For comprehensive assessment, use a11y-audit instead."
user-invokable: true
args:
  - name: scope
    description: "Optional — file path, component name, or 'pr' for current PR diff"
---

Review the specified files, component, or PR diff for accessibility issues. Focus on {{scope}} if specified, otherwise review all changed or provided files.

→ *Consult the a11y-agent skill and its reference files for standards and patterns.*

## Review vs. Audit

| | a11y-review | a11y-audit |
|---|---|---|
| **Scope** | Changed files, specific component, or PR diff | Comprehensive — full page or user flow |
| **Depth** | Focused pass against a checklist | Structured testing: keyboard → tools → contrast → zoom → screen reader |
| **Context gathering** | None — read the code and go | Asks questions before starting |
| **Output** | Inline findings per file/line | Structured report by severity category |
| **Use when** | PR review, pre-merge check, quick code scan | Pre-launch audit, major feature, compliance review |

Use `/a11y-audit` when you need a full structured assessment with manual testing steps. Use this skill for fast, code-focused review.

## Review Process

### 1. Read the Code
Read all files in scope. For `pr`, get the diff. Identify interactive components, forms, overlays, and dynamic content — these carry the most risk.

### 2. Check Criteria
Run through all criteria below. Scan for violations. Note the file and line number for each finding.

### 3. Classify Severity
- **Critical** — WCAG A violation, blocks access (e.g., no keyboard access, missing label)
- **Serious** — WCAG AA violation, significant barrier (e.g., missing focus indicator, wrong ARIA state)
- **Moderate** — Best practice or WCAG AAA, quality improvement (e.g., missing skip link, no reduced-motion)
- **Advisory** — Minor or informational, no direct barrier

### 4. Produce the Review
List findings in the output format below. If no issues found in a category, omit it. End with a summary line.

## Review Criteria

### Markup
- Semantic elements used — `<button>` for actions, `<a href>` for navigation, `<nav>`, `<main>`, `<header>`, `<footer>`
- No `<div>` or `<span>` with click handlers — use `<button>` instead
- Heading hierarchy — single `<h1>`, no skipped levels, not used for text sizing
- Images have `alt` text; decorative images have `alt=""`
- Form inputs have associated visible `<label>` elements (not just `placeholder`)
- `<html>` element has `lang` attribute

### ARIA
- No ARIA where a native element works (first rule of ARIA)
- All interactive elements have an accessible name (`aria-label`, `aria-labelledby`, or visible label)
- State attributes present and correct: `aria-expanded`, `aria-pressed`, `aria-selected`, `aria-current`
- Live regions (`aria-live`, `role="alert"`) are present in the DOM at page load — not dynamically appended
- No `aria-hidden="true"` on elements with focusable children unless those children also have `tabindex="-1"`

### Keyboard & Focus
- Every interactive element is focusable and operable via keyboard
- Escape key closes modals, menus, and popups
- Focus is sent into overlays on open and returned to the trigger on close
- Tab order follows logical reading order — no `tabindex` > 0
- No ghost tab stops (elements focusable while visually hidden via `opacity: 0` or `visibility: hidden`)
- Skip link present as first focusable element on pages with navigation

### Styles
- Focus indicators use `:focus-visible`, not removed with `outline: none` on a wildcard selector
- No `* { outline: none }` or `*:focus { outline: none }`
- `prefers-reduced-motion` respected for animations and transitions
- Color contrast — flag any text/background combinations that look low-contrast; note for manual verification
- Content meant to be visually hidden but screen-reader accessible uses `.visually-hidden` / `clip` technique, not `opacity: 0` or `visibility: hidden`

### Tests
- Accessibility tests exist for interactive components (modals, menus, forms, tabs)
- Keyboard operability tested (open, navigate, close)
- ARIA state changes tested (expanded, selected, invalid)
- At least one integration-level axe scan exists for pages containing reviewed components

## Output Format

For each finding:

```
[Severity] path/to/file.tsx:42 — Description of the issue
  Impact: Who is affected and how
  Fix: Specific code change or approach
  WCAG: Criterion number and name (e.g., 1.3.1 Info and Relationships)
```

Group findings by file. Omit categories with no findings. Close with:

```
Summary: N critical, N serious, N moderate, N advisory — [one sentence overall assessment]
```

IMPORTANT: This is a review, not a fix. Document issues clearly. Use `/a11y-fix` to implement fixes.
