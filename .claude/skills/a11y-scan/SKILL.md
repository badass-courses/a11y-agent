---
name: a11y-scan
description: "Run automated accessibility scan using axe-core via Playwright. Captures WCAG violations, tracks progress over time. Use when asked to "scan for accessibility", "run axe", or "check a11y automatically"."
user-invokable: true
args:
  - name: url
    description: "Optional URL or localhost route to scan"
  - name: scope
    description: "Optional CSS selector to scope the scan"
---

Run an automated accessibility scan on {{url}} scoped to {{scope}} if specified.

→ *Consult the a11y-agent skill for accessibility standards and patterns.*

## Process

1. Check if Playwright and @axe-core/playwright are available (`npx playwright --version`)
2. If not installed, suggest: `npm install -D @axe-core/playwright playwright && npx playwright install chromium`
3. Generate the scan script from reference/axe-scan.md and write to a temp file
4. Execute the scan against the target URL
5. Parse results into severity categories (critical, serious, moderate, minor)
6. If previous scan results exist in `a11y-scan-results/`, compare and note changes
7. Store results in `a11y-scan-results/YYYY-MM-DD.json`
8. Present human-readable report with fix suggestions per violation

## What Automated Scans Catch (30-50% of issues)

**Can detect:**
- Missing alt text, labels, ARIA attributes
- Color contrast violations (computed styles)
- Duplicate IDs, missing lang, landmark issues
- Invalid ARIA roles and attributes
- Missing form labels

**Cannot detect:**
- Keyboard operability (use a11y-test or manual testing)
- Focus management logic (does focus return on close?)
- Screen reader UX quality (is the reading order logical?)
- Whether heading hierarchy is logical (only structural validity)
- Whether alt text is meaningful (only that it exists)
- Dynamic state issues (only tests what's rendered at scan time)

Always pair with manual testing via a11y-audit.

## Scan Tips

- Scan with menus/modals open — axe only tests what's rendered on screen
- Scope rules with {{scope}} to reduce noise from known third-party widget issues
- Run scans at multiple viewport sizes to catch responsive accessibility issues
- For CI integration, use `cy.checkA11y()` at the integration test level — see a11y-test
- Compare scan results over time to track remediation progress
