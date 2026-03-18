# a11y Skills Improvement Design

**Date:** 2026-03-18
**Status:** Approved (spec review v2 — issues resolved)
**Source material:** Testing Accessibility articles (21) + workshops (6 modules, 102 lessons)

## Overview

Evolve the a11y-agent skill set from 3 skills (foundation + audit + fix) into 8 skills covering 5 of Anthropic's 9 skill types. Enrich all existing content with Testing Accessibility material. Add scripts, context gathering, gotchas, memory, and progressive disclosure.

## Architecture

```
source/skills/
├── a11y-agent/          # Library & API Reference (foundation, NOT user-invokable)
│   ├── SKILL.md         # Core knowledge base — enriched
│   └── reference/
│       ├── aria-patterns.md        # enhanced
│       ├── client-side-routing.md  # NEW
│       ├── focus-management.md     # enhanced
│       ├── forms-validation.md     # keep
│       ├── gotchas.md              # NEW — highest-signal content
│       ├── keyboard-patterns.md    # enhanced
│       ├── screen-readers.md       # NEW
│       ├── semantic-html.md        # enhanced
│       ├── testing-checklist.md    # enhanced
│       └── widget-patterns.md      # NEW
├── a11y-audit/          # Code Quality (manual audit process)
│   └── SKILL.md         # enhanced with context gathering + result logging
├── a11y-fix/            # Code Quality (fix issues)
│   └── SKILL.md         # enhanced with more fix patterns
├── a11y-scan/           # Product Verification — NEW
│   ├── SKILL.md
│   └── reference/
│       └── axe-scan.md  # axe-core runner instructions + inline script
├── a11y-test/           # Code Quality (testing) — NEW
│   ├── SKILL.md
│   └── reference/
│       ├── jest-patterns.md
│       ├── cypress-patterns.md
│       └── puppeteer-snapshots.md  # a11y tree snapshot testing
├── a11y-component/      # Code Scaffolding — NEW
│   ├── SKILL.md
│   └── reference/       # templates live in reference/ for build compat
│       ├── modal.md
│       ├── menu-dropdown.md
│       ├── tabs.md
│       └── accordion.md  # v1: 4 patterns. date-picker, combobox, slideshow in v2
├── a11y-review/         # Code Quality (review) — NEW
│   └── SKILL.md
└── a11y-advocate/       # Business Process — NEW
    ├── SKILL.md
    └── reference/       # templates live in reference/ for build compat
        ├── accessibility-statement.md
        ├── issue-ticket.md
        └── risk-assessment.md
```

---

## Skill Specifications

### 1. `a11y-agent` (Enhanced Foundation)

**Type:** Library & API Reference
**User-invokable:** No (referenced by all other skills)
**Description:** `Accessibility expertise for building inclusive web interfaces. Covers semantic HTML, ARIA, keyboard, screen readers, focus management, contrast, zoom, motion, testing, and culture. Referenced by a11y-audit, a11y-fix, a11y-scan, a11y-test, a11y-component, a11y-review, a11y-advocate.`

**Changes to SKILL.md:**

Add **Gotchas** section (new, top of file after Core Principles). Top 5 inline, rest in `reference/gotchas.md`:

```markdown
## Gotchas — What Claude Gets Wrong

These are Claude's most frequent accessibility mistakes. Check every time.

1. **Using `role="button"` on a `<div>` instead of `<button>`** — `<button>` gives focusability, Enter/Space, and role for free. Just use it.
2. **Adding ARIA where native HTML suffices** — First rule of ARIA: don't use it if a native element works. `<nav>` > `<div role="navigation">`.
3. **Using `opacity: 0` to hide content** — Element stays in tab order and Accessibility Tree. Use `display: none` or `hidden` attribute instead.
4. **Forgetting focus return on close** — When modal/menu/popup closes, focus MUST return to trigger element.
5. **Missing Escape key support** — Every overlay must close on Escape. Not optional.
6. **Not using `inert` on modal backgrounds** — Use `inert` attribute on background content instead of manually managing `aria-hidden` + `tabindex="-1"` on every element.

→ *Consult reference/gotchas.md for the complete list with code examples.*
```

Add **Client-Side Routing** section (new, after Focus Management):

```markdown
## Client-Side Routing

JavaScript routing breaks the browser's native page-refresh behavior. Screen readers and keyboards lose critical signals.

**What breaks:**
- Screen readers don't announce new "page" (no title change event)
- Focus stays on the clicked link instead of resetting to new content
- Keyboard users don't get the fresh tab-order reset of a page load

**What to do:**
1. Update `document.title` on every route change (React Helmet, Next.js Head, etc.)
2. Move focus to the new page's `<main>` or `<h1>` after navigation
3. Announce the page change via ARIA live region
4. Reset any open menus/dropdowns state on navigation

**Recommendation from Marcy Sutton:** Let pages refresh when you can. `<a href>` beats `<Link>` when full SPA behavior isn't needed. The browser handles focus reset, title changes, and screen reader announcements for free.

**Testing client-side routing:**
- Cypress: assert `document.title` updated, assert `cy.focused()` is in new content
- Screen reader: navigate, confirm new page announced, confirm focus is logical
```

**New reference files:**

#### `reference/gotchas.md`
Full list of Claude's common a11y mistakes with before/after code examples:
- Top 6 from SKILL.md (with code)
- Plus: `aria-label` on non-interactive elements, dynamic live region appending, `aria-expanded` without hiding content, placeholder-only labels, missing `lang` attribute, VoiceOver+SVG bug, VoiceOver `role="list"` stripping, `aria-roledescription` misuse, dark mode contrast regressions

#### `reference/screen-readers.md`
Content from TA articles + workshops:
- **Who uses screen readers** — 80% blind/low vision, 14% other disabilities (cognitive, motor). Not only blind users.
- **Market share** (WebAIM 2021 survey): JAWS 53.7% primary, NVDA 30.7% primary, VoiceOver 6.5% primary (but 41.3% commonly used). Mobile: VoiceOver iOS 71.5%.
- **Which to test with:** NVDA + Chrome (free, largest desktop share), VoiceOver + Safari (Mac dev, dominant mobile). JAWS for production verification.
- **Browse mode vs Focus mode** (NVDA/JAWS): Browse mode = arrow keys navigate headings/links/landmarks. Focus mode = arrow keys go to the page's JavaScript. `Insert+Space` toggles. This is why `role="application"` is dangerous.
- **How users navigate:** 67% use headings as primary navigation. Landmarks usage declining but still a best practice. Tab key only reaches interactive elements.
- **Common myths:** "VoiceOver is enough" (no — 6.5% primary), "screen readers read everything top-to-bottom" (no — users jump by headings/landmarks), "you need to make everything focusable" (no — only interactive elements).

#### `reference/client-side-routing.md`
Expanded with code patterns for React, Next.js, and vanilla JS. Focus management strategies. Testing patterns.

#### `reference/widget-patterns.md`
Patterns from TA workshops not already in aria-patterns.md:
- **Mega menu** — `<button>` triggers, `display: none` when closed (not opacity), toggle `active` class, Escape to close, focus first link on open, `aria-expanded` on trigger
- **Date picker** — table-based with `<th scope="col">`, roving tabindex on day buttons, ArrowLeft/Right ±1 day, ArrowUp/Down ±7 days, `aria-label="August 7"` on each button, `aria-pressed` for selected
- **Slideshow/Carousel** — prev/next buttons, live region for slide announcements, Escape to exit fullscreen, `role="application"` only in fullscreen mode, `aria-roledescription="Image Slideshow"`, keyboard arrow navigation
- **Combobox** — text input + listbox, `aria-expanded`, `aria-activedescendant`, `aria-autocomplete`, filter-as-you-type

**Enhanced existing reference files:**

- `aria-patterns.md` — Add `role="application"` section (danger, use cases, NVDA/JAWS implications). Add AOM note (Accessibility Object Model — experimental, `element.role = "button"` instead of `setAttribute`).
- `keyboard-patterns.md` — Add mega menu pattern. Add note about `preventDefault()` on ArrowUp/Down to suppress page scrolling.
- `semantic-html.md` — Add CSS Grid/Flexbox caveat: visual structure ≠ semantic structure. A calendar grid of `<div>` buttons should be `<table>`. Add `role="list"` VoiceOver workaround.
- `testing-checklist.md` — Add Windows High Contrast Mode testing. Add Storybook as pre-automation step. Add Accessibility Tree snapshot testing via Puppeteer.

---

### 2. `a11y-audit` (Enhanced)

**Type:** Code Quality & Review (Runbook)
**User-invokable:** Yes
**Args:** `area` (optional focus area)
**Description:** `Structured accessibility assessment following Marcy Sutton's testing order. Asks targeted questions, walks through keyboard → tools → contrast → zoom → screen readers, produces prioritized report. Use when asked to "check accessibility", "audit a11y", "test accessibility", or before shipping UI.`

**How it differs from a11y-review:** Audit is a comprehensive, structured assessment that follows a full testing workflow and produces a formal report. Review is a lightweight code-level pass for PRs or quick checks.

**Changes:**

Add **Context Gathering** section (before audit process):

```markdown
## Context Gathering (ask before auditing)

Before starting, ask the user:
1. **What's the user flow?** — Which pages/routes are involved? What's the critical path?
2. **What's the tech stack?** — React/Vue/vanilla? Client-side routing? SSR/SSG?
3. **What's been tested before?** — Any prior audit results? Known issues?
4. **Screen reader availability?** — Mac (VoiceOver)? Windows (NVDA)?
5. **What's the target conformance level?** — AA (default) or AAA?

Store answers for the session. Reference throughout the audit.

If the user asks for a quick audit, skip context gathering and note assumptions in the report.
```

Add **Result Logging** section (after report format):

```markdown
## Storing Results

After producing the report, save it to `a11y-audit-results/YYYY-MM-DD-<area>.md` in the project.
If previous results exist, note what improved and what regressed.
```

Enhance testing order to match Marcy's exact sequence from the TA workshops:

```
1. Identify user flow
2. Keyboard testing (Tab through everything)
3. Check heading + landmark structure
4. Scan with automated tools (axe DevTools)
5. Check color contrast
6. Test zoom/reflow at different viewports
7. Test with screen readers
```

---

### 3. `a11y-fix` (Enhanced)

**Type:** Code Quality
**User-invokable:** Yes
**Args:** `area` (optional)
**Description:** `Fix accessibility issues in current code. Works through findings from a11y-audit, a11y-scan, or a11y-review. Makes changes, explains rationale, notes what to test manually. Use when asked to "fix accessibility", "make this accessible", or after any a11y assessment.`

**Changes:**

Add more fix patterns from TA workshops:

- **Mega menu fix** — div→button, `display: none` on closed submenu, toggle `active` class, Escape handler, focus management
- **Client-side routing fix** — Add title updates, focus management on route change, reset menu state
- **Date picker fix** — Semantic table structure, roving tabindex, arrow key navigation, proper labels
- **Slideshow fix** — Add prev/next buttons, live region, keyboard controls, fullscreen focus management
- **Form fix** — Live region for error summary (exists at page load), `aria-invalid`, `aria-describedby`, focus first invalid field

Add **Verify After Fixing** — remind to run axe scan and keyboard test after each fix.

---

### 4. `a11y-scan` (NEW — Product Verification)

**Type:** Product Verification
**User-invokable:** Yes
**Args:** `url` (optional — URL or route to scan), `scope` (optional — CSS selector to scope)
**Description:** `Run automated accessibility scan using axe-core. Checks rendered page for WCAG violations, captures results, tracks progress over time. Use when asked to "scan for accessibility", "run axe", or "check a11y automatically".`

**SKILL.md structure:**

```markdown
## Process

1. Check if Playwright is available (suggest install if not)
2. Run axe-core scan via scripts/axe-scan.js
3. Parse results into severity categories
4. Compare with previous scan if results exist
5. Store results in a11y-scan-results/YYYY-MM-DD.json
6. Present human-readable report with fix suggestions

## What It Catches vs Doesn't

Automated scans catch 30-50% of issues:
✓ Missing alt text, labels, ARIA attributes
✓ Color contrast violations (computed)
✓ Duplicate IDs, missing lang, landmark issues
✗ Keyboard operability (needs manual or a11y-test)
✗ Focus management logic
✗ Screen reader UX quality
✗ Logical heading hierarchy (partially)

Always pair with manual testing (a11y-audit).
```

**`reference/axe-scan.md`:**

Contains an inline Playwright + axe-core script that Claude can write to a temp file and execute. The script:
1. Launches browser, navigates to URL
2. Injects axe-core
3. Runs `axe.run()` with optional scope selector
4. Outputs JSON results
5. Optionally takes screenshots of violating elements

Kept as `.md` in `reference/` for build system compatibility. Claude generates the actual `.js` file at runtime.

---

### 5. `a11y-test` (NEW — Testing)

**Type:** Code Quality (Testing)
**User-invokable:** Yes
**Args:** `component` (optional — component or file to test), `type` (optional — unit, integration, e2e)
**Description:** `Write accessibility-focused automated tests. Uses TDD: write failing test for inaccessible behavior, then fix. Covers Jest + Testing Library, Cypress + cypress-axe, and CI setup. Use when asked to "write a11y tests", "test accessibility", or "TDD for accessibility".`

**SKILL.md structure:**

```markdown
## The A11y TDD Cycle

1. Identify the component to test
2. Write tests describing behavior that fails accessibility requirements
3. Make tests pass by fixing the accessibility problems
4. Cross-check in a browser (and screen reader where applicable)

## What to Test

### Per Interactive Element (unit level)
- Has an accessible label (`getByRole`, `getByLabelText`)
- Is keyboard-reachable (`user.tab()` + `toHaveFocus()`)
- Is keyboard-operable (`user.keyboard('[Enter]')` triggers handler)
- ARIA states update correctly (`aria-expanded`, `aria-pressed`, `aria-invalid`)

### Per Component (component level)
- Hidden items not reachable when closed
- Focus management on open/close
- Escape key closes overlays
- Roving tabindex works within composite widgets

### Per Page (integration level)
- `cy.checkA11y()` passes (axe-core page scan)
- `aria-current="page"` set on current nav link
- Client-side route changes update title and move focus
- Modal focus trap and restore works end-to-end

### Per Project (CI level)
- All of the above run on every push via GitHub Actions
```

**`reference/jest-patterns.md`:**
Code patterns for Testing Library queries, userEvent, keyboard testing, ARIA state assertions. From TA Automated Testing module.

**`reference/cypress-patterns.md`:**
Code patterns for cypress-axe, cypress-real-events, modal testing, routing testing, component testing. From TA Automated Testing module.

**`reference/puppeteer-snapshots.md`:**
Accessibility Tree snapshot testing with Puppeteer. `page.accessibility.snapshot()` captures the full a11y tree as JSON for regression testing. Scope to subtrees (e.g. header only) to reduce brittleness. Use `interestingOnly: false` for detailed output. Not a replacement for screen reader testing. From TA Automated Testing module.

---

### 6. `a11y-component` (NEW — Code Scaffolding)

**Type:** Code Scaffolding
**User-invokable:** Yes
**Args:** `pattern` (required — modal, menu, tabs, accordion, datepicker, combobox, slideshow)
**Description:** `Scaffold an accessible component with correct ARIA, keyboard handling, and focus management baked in. Use when building a modal, menu, tabs, accordion, date picker, combobox, or slideshow from scratch.`

**SKILL.md structure:**

```markdown
## Process

1. Ask: Which component pattern? (modal, menu, tabs, accordion, datepicker, combobox, slideshow)
2. Ask: What framework? (React, Vue, vanilla JS, other)
3. Read the matching template from reference/
4. Adapt to the user's framework and design system
5. Include keyboard handling, ARIA states, focus management
6. Generate matching test file using a11y-test patterns

## Context Gathering

Before scaffolding, ask:
- What triggers this component? (button, link, route)
- Does it need animation? (respect prefers-reduced-motion)
- Existing design system tokens/classes to use?
```

**`reference/`** — Each template file (in `reference/` for build compat) contains:
- Required HTML/ARIA structure
- Keyboard interaction spec (which keys do what)
- Focus management rules (where focus goes on open/close)
- Required ARIA attributes and their state changes
- Gotchas specific to this pattern
- Adapted from TA Interactions module workshop exercises

---

### 7. `a11y-review` (NEW — Code Review)

**Type:** Code Quality & Review
**User-invokable:** Yes
**Args:** `scope` (optional — file, component, or PR)
**Description:** `Lightweight code review pass for accessibility. Checks markup, event handlers, ARIA, test coverage in changed files. Use for PR reviews, pre-merge checks, or when asked to "review for accessibility". For comprehensive assessment, use a11y-audit instead.`

**How it differs from a11y-audit:** Review is a quick, focused pass on specific files or a PR diff. Audit is a comprehensive structured assessment following the full testing workflow.

**SKILL.md structure:**

```markdown
## Review Process

1. Read the code (markup, styles, event handlers, tests)
2. Check against review criteria
3. Classify findings by severity
4. Produce actionable review with fix suggestions

## Review Criteria

### Markup
- Semantic elements used correctly (buttons, links, headings, landmarks)
- No div/span with click handlers
- Heading hierarchy maintained
- Images have appropriate alt text
- Forms have visible labels
- `<html lang>` present

### ARIA
- No ARIA where native HTML suffices
- Interactive elements have accessible names
- States tracked correctly (expanded, pressed, selected, invalid)
- Live regions present at page load
- No aria-hidden on focusable elements

### Keyboard & Focus
- All interactive elements focusable
- Escape closes overlays
- Focus managed on open/close
- Tab order logical
- No ghost tab stops (opacity:0, offscreen positioned)
- Skip link present

### Styles
- Focus indicators visible (:focus-visible)
- No * { outline: none }
- prefers-reduced-motion respected
- Contrast likely adequate (flag suspect combinations)
- Hidden content uses correct technique

### Tests
- A11y tests exist for interactive components
- Keyboard reachability tested
- ARIA states tested
- axe integration test exists

## Output Format

For each finding:
- **File:line** — what's wrong
- **Impact** — who is affected and how
- **Fix** — specific code change
- **WCAG** — relevant criterion
```

---

### 8. `a11y-advocate` (NEW — Business Process)

**Type:** Business Process & Team Automation
**User-invokable:** Yes
**Args:** `action` (optional — statement, prioritize, ticket, checklist, risk)
**Description:** `Help build accessibility culture and communicate with stakeholders. Generate accessibility statements, prioritize issues, write descriptive tickets, create team checklists, and produce risk assessments. Use when asked to "prioritize a11y issues", "write an accessibility statement", "convince my PM about accessibility", or "create a testing process for my team".`

**SKILL.md structure:**

```markdown
## Actions

### `statement` — Write an Accessibility Statement
Generate an accessibility statement for the project. Ask:
- What conformance level are you targeting? (AA default)
- Known limitations?
- Contact method for reporting issues?

Output: Markdown accessibility statement following W3C template.

### `prioritize` — Scope & Prioritize Issues
Given a list of accessibility issues (from a11y-audit or a11y-scan):
1. Group by WCAG level (A first, then AA, then AAA)
2. T-shirt size effort (S/M/L)
3. Order by user impact × effort ratio
4. Suggest which to tackle first for momentum (quick wins)

### `ticket` — Write an Accessibility Issue Ticket
Generate a well-structured ticket with:
- Expected outcome vs actual outcome
- User impact (which disability, how severe)
- WCAG success criteria reference
- Reproduction steps
- Screenshots/recordings if available

### `checklist` — Create Team Testing Checklist
Generate a non-developer-friendly manual testing checklist for the team.
Adapted from Marcy Sutton's testing order:
1. Tab through the page
2. Check for visible focus indicators
3. Run axe DevTools scan
4. Check color contrast with CCA
5. Zoom to 200%
6. Test with a screen reader

### `risk` — Produce Risk Assessment
For stakeholder communication:
- Current state summary (issues found, severity breakdown)
- Legal context (ADA, EAA, Section 508 as applicable)
- User impact (estimated users affected)
- Remediation cost estimate (S/M/L per issue group)
- Recommended priority and timeline

## Persuasion Strategies (from Marcy Sutton)

- Highlight quick wins first to build momentum
- Come with estimates, not just problems
- Adjust approach per audience: legal/compliance team → risk; engineering → tech debt; product → user impact
- "Carrot vs stick": kindness first, legal team backup when needed
- Surface user feedback as leverage
- Celebrate wins — collect positive feedback from disabled users
```

**`reference/accessibility-statement.md`** — W3C-based template with placeholders.
**`reference/issue-ticket.md`** — Structured ticket template.
**`reference/risk-assessment.md`** — Stakeholder-facing risk assessment template.

---

## Description Field Updates

All description fields rewritten as trigger conditions (per Anthropic's guidance):

| Skill | Description (trigger condition) |
|-------|-------------------------------|
| a11y-agent | Accessibility expertise for building inclusive web interfaces. Covers semantic HTML, ARIA, keyboard interaction, screen reader support, color contrast, focus management, responsive zoom, motion safety, automated testing, and organizational culture. Use when building or reviewing any web UI to ensure it works for everyone. |
| a11y-audit | Structured accessibility assessment following Marcy Sutton's testing order. Asks targeted questions, walks through keyboard → tools → contrast → zoom → screen readers, produces prioritized report. Use when asked to "check accessibility", "audit a11y", "test accessibility", or before shipping UI. |
| a11y-fix | Fix accessibility issues in current code. Works through findings from a11y-audit, a11y-scan, or a11y-review. Makes changes, explains rationale, notes what to test manually. Use when asked to "fix accessibility", "make this accessible", or after any a11y assessment. |
| a11y-scan | Run automated accessibility scan using axe-core via Playwright. Captures WCAG violations, tracks progress over time. Use when asked to "scan for accessibility", "run axe", or "check a11y automatically". |
| a11y-test | Write accessibility-focused automated tests using TDD. Covers Jest + Testing Library, Cypress + cypress-axe, Puppeteer snapshots, CI setup. Use when asked to "write a11y tests", "test accessibility", or "TDD for accessibility". |
| a11y-component | Scaffold accessible interactive components with correct ARIA, keyboard handling, and focus management. Supports modal, menu, tabs, accordion (v1), plus date picker, combobox, slideshow (v2). |
| a11y-review | Lightweight code review pass for accessibility. Checks markup, event handlers, ARIA, test coverage in changed files. Use for PR reviews, pre-merge checks, or "review for accessibility". For comprehensive assessment, use a11y-audit. |
| a11y-advocate | Build accessibility culture and communicate with stakeholders. Generate statements, prioritize issues, write tickets, create team checklists, produce risk assessments. Use when asked to "prioritize a11y", "accessibility statement", "convince PM about a11y", or "create testing process". |

---

## Implementation Notes

### Progressive Disclosure
All skills point to `a11y-agent` reference files rather than duplicating knowledge. Example: "Consult a11y-agent/reference/widget-patterns.md for the full modal pattern."

### Memory / State
- `a11y-scan` stores results in `a11y-scan-results/` for trend tracking
- `a11y-audit` stores reports in `a11y-audit-results/` for comparison
- `a11y-advocate` could track remediation progress over time

### Scripts
- `a11y-scan/reference/axe-scan.md` — Contains inline Playwright + axe-core script (Claude generates `.js` at runtime)
- Future: screenshot tool for tab order visualization

### Build System
All skills in `source/skills/` get built by the existing build system (`bun run build`) into `dist/` and synced to `.claude/skills/`. The build system copies `reference/*.md` files — all templates and scripts use `reference/` directories (not `templates/` or `scripts/`) for build compatibility.

### Stale Reference Fix
Both `a11y-audit/SKILL.md` and `a11y-fix/SKILL.md` currently reference "the accessible-web skill" — this must be updated to "the a11y-agent skill" during implementation.

### Phasing
- **v1:** All 8 skills, 4 component templates (modal, menu, tabs, accordion), all reference files
- **v2:** 3 additional component templates (date picker, combobox, slideshow), Storybook integration guide, AOM reference section

### What NOT to Do
- Don't railroad: give knowledge and patterns, let Claude adapt to context
- Don't duplicate: reference files are the single source of truth
- Don't state the obvious: focus on what pushes Claude out of its defaults (hence the Gotchas section)
- Don't forget `inert`: prefer it over manual `aria-hidden` + `tabindex="-1"` on background content
