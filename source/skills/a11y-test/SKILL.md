---
name: a11y-test
description: "TDD workflow for accessibility. Write tests that fail when a11y breaks, at unit, integration, and E2E levels. Use when asked to \"write accessibility tests\", \"add a11y tests\", or \"test this component for accessibility\"."
user-invokable: true
args:
  - name: component
    description: "Optional: specific component, file, or feature to write tests for"
  - name: type
    description: "Optional: unit, integration, or e2e — narrows scope to that test level"
---

Write accessibility tests for {{component}} at the {{type}} level, or across all levels if not specified.

→ *Consult the a11y-agent skill and its reference files for accessibility standards and patterns.*

## The A11y TDD Cycle

Accessibility regressions are silent. A sighted, mouse-using developer won't notice when keyboard access breaks or an ARIA state stops updating. Tests make the invisible visible.

Follow this cycle:

1. **Write a failing test** — pick the a11y behavior you want to guarantee (focus lands here, this role is announced, this key activates it)
2. **Watch it fail** — confirm the test actually catches the broken behavior, not a false positive
3. **Fix the code** — use the correct semantic pattern (see a11y-agent skill)
4. **Watch it pass** — and stay passing in CI

Never write tests that can only pass. A test that can't fail gives false confidence.

## What to Test at Each Level

### Unit — per element (Jest + Testing Library)

Test the contract of a single interactive element or small component:

- **Keyboard reachability** — is the element in the tab order?
- **Keyboard operability** — does Enter / Space / Arrow trigger the right action?
- **Accessible name** — does `getByRole` find it by its label?
- **ARIA state changes** — does `aria-expanded`, `aria-pressed`, `aria-invalid` update correctly?
- **Form field labels** — is every input paired with a visible `<label>`?
- **Radio group** — is the group a single tab stop with arrow key navigation?

Unit tests are fast and surgical. Write one test per a11y contract.

### Integration — per component + per page (Cypress)

Test how components work together in a real browser DOM:

- **Page-level axe scan** — run `cy.checkA11y()` on every route
- **Focus management** — does focus land in the modal on open? Return to trigger on close?
- **Keyboard flows** — can a user complete the full task without a mouse?
- **ARIA live region announcements** — do dynamic changes announce correctly?
- **Navigation landmarks** — is `aria-current="page"` set on the active nav item?
- **Client-side routing** — does `document.title` update on route change?

Integration tests catch issues that unit tests miss because the full DOM context matters (e.g., missing page landmarks, duplicate IDs, focus trapping across components).

### E2E / CI — per project

- Run `cy.checkA11y()` in CI against all critical routes
- Block merges on new axe violations
- Snapshot accessibility tree for key components (Puppeteer — see reference/puppeteer-snapshots.md)
- Alert on regressions, not just on first introduction

## Test Design Gotchas

These patterns produce false confidence. Avoid them.

**`div[role="button"]` passes `getByRole` but fails keyboard operability.**
A `<div>` with `role="button"` is found by `getByRole('button')` — so your accessible name test passes. But it has no `tabindex`, so keyboard reachability fails, and it has no native Enter/Space handling. Test reachability AND operability separately. Better: just use `<button>`.

**`cypress-axe` at component level complains about missing page landmarks.**
When mounting a single component with `cy.mount()`, axe will flag missing `<main>`, `<header>`, etc. Use `runOnly` to scope rules to what actually applies at component level, or wrap the mounted component in a minimal page shell.

**Tautological tests — tests that can only pass.**
`expect(screen.getByRole('button')).toBeInTheDocument()` — this just tests that React rendered. It tells you nothing about accessibility. Make sure your test would fail if you broke the a11y behavior: remove the label, change the element to a div, remove aria-expanded, etc.

**Use `cypress-real-events` for realistic Tab key behavior.**
Cypress's built-in `.type('{tab}')` doesn't simulate a real Tab key press in a real browser. Use `cy.realPress('Tab')` from `cypress-real-events` for focus management tests. See reference/cypress-patterns.md.

## Reference Files

→ *reference/jest-patterns.md — Testing Library + Jest code patterns for unit-level a11y tests*
→ *reference/cypress-patterns.md — Cypress patterns for integration and E2E a11y tests*
→ *reference/puppeteer-snapshots.md — Accessibility tree snapshot testing with Puppeteer*
