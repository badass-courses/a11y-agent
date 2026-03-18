# a11y-agent

Accessibility expertise for AI coding agents.

Your agent makes beautiful UIs. This makes them usable by everyone.

## Install

```bash
npx skills add badass-courses/a11y-agent
```

## What's Inside

### Foundation

**`a11y-agent`** — Loads automatically. Deep web accessibility knowledge for every code review and implementation. 10 reference files covering semantic HTML, keyboard patterns, ARIA, forms, focus management, testing, screen readers, client-side routing, widget patterns, and common gotchas.

### Commands

**`/a11y-audit [area]`** — Structured accessibility assessment. Walks through keyboard → tools → contrast → zoom → screen readers. Asks context questions, stores results for tracking progress.

**`/a11y-fix [area]`** — Fix accessibility issues from audit, scan, or review findings. Mega menus, routing, forms, modals, and more. Verifies each fix.

**`/a11y-scan [url] [scope]`** — Run automated axe-core scan via Playwright. Captures WCAG violations, compares with previous runs, tracks remediation.

**`/a11y-test [component] [type]`** — TDD for accessibility. Write tests that fail when a11y breaks. Jest + Testing Library, Cypress + cypress-axe, Puppeteer snapshots, CI setup.

**`/a11y-component [pattern]`** — Scaffold accessible components with correct ARIA, keyboard, and focus management. Patterns: `modal` `menu` `tabs` `accordion`

**`/a11y-review [scope]`** — Lightweight code review for accessibility. Checks markup, ARIA, keyboard handling, test coverage. For PRs and pre-merge checks.

**`/a11y-advocate [action]`** — Build accessibility culture. Actions: `statement` `prioritize` `ticket` `checklist` `risk`

## License

Apache-2.0

```

             o
            /|\         "You can't shove chocolate chips
            / \          into an already baked muffin."

        ┌─────────────────────────────────┐
        │  a11y-agent    foundation       │
        ├─────────────────────────────────┤
        │  /a11y-audit   assess           │
        │  /a11y-scan    automate         │
        │  /a11y-review  review           │
        ├─────────────────────────────────┤
        │  /a11y-fix       fix            │
        │  /a11y-test      test           │
        │  /a11y-component scaffold       │
        ├─────────────────────────────────┤
        │  /a11y-advocate  advocate       │
        └─────────────────────────────────┘

                        badass.dev
```
