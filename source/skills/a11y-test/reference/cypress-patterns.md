# Cypress Patterns

Integration and E2E a11y tests. Requires `cypress-axe` and (for real Tab key) `cypress-real-events`.

```bash
npm install -D cypress-axe cypress-real-events axe-core
```

```js
// cypress/support/e2e.js
import 'cypress-axe'
import 'cypress-real-events'
```

---

## Page-Level axe Scan

Run on every critical route. Fails the test if axe finds any violations.

```js
it('home page has no axe violations', () => {
  cy.visit('/')
  cy.injectAxe()
  cy.checkA11y()
})
```

Run this pattern against every route in your app. Wire it into CI to block regressions.

---

## Scoped Scan with runOnly

Limit the scan to specific rules or standards. Useful when mounting a component without full page context (missing landmark rules would fire otherwise).

```js
it('nav component has no ARIA violations', () => {
  cy.visit('/about')
  cy.injectAxe()

  cy.checkA11y(
    '[data-testid="main-nav"]',  // scope to element
    {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    }
  )
})
```

For component-level Cypress tests with `cy.mount()`, add a wrapper with `<html lang>`, `<main>`, and other landmark context to suppress false positives — or use `runOnly` to exclude landmark rules.

---

## Modal Focus Management

Open → focus lands inside. Escape → focus returns to trigger. Full keyboard round-trip.

```js
it('modal traps and returns focus correctly', () => {
  cy.visit('/dashboard')

  cy.get('[data-testid="open-dialog-btn"]').focus().click()

  // Focus must move into the dialog after open
  cy.get('[role="dialog"]').should('be.visible')
  cy.focused().should('be.within', '[role="dialog"]')

  // Escape closes and returns focus to trigger
  cy.realPress('Escape')
  cy.get('[role="dialog"]').should('not.exist')
  cy.focused().should('have.attr', 'data-testid', 'open-dialog-btn')
})
```

---

## aria-current="page" on Navigation

Active nav link must have `aria-current="page"` for screen reader users to know where they are.

```js
it('active nav link has aria-current="page"', () => {
  cy.visit('/about')

  cy.get('nav a[href="/about"]')
    .should('have.attr', 'aria-current', 'page')

  // Other links must NOT have it
  cy.get('nav a[href="/"]')
    .should('not.have.attr', 'aria-current')
})
```

---

## Client-Side Routing — Title Update

Screen readers announce the page title on load. After client-side navigation, `document.title` must change.

```js
it('page title updates after client-side navigation', () => {
  cy.visit('/')
  cy.title().should('eq', 'Home | My Site')

  cy.get('nav a[href="/about"]').click()
  cy.title().should('eq', 'About | My Site')

  cy.get('nav a[href="/contact"]').click()
  cy.title().should('eq', 'Contact | My Site')
})
```

---

## Component Testing with cy.mount()

Cypress component tests run in a real browser but mount a single component. Scope axe rules to avoid landmark false positives.

```js
import { mount } from 'cypress/react'
import { SearchField } from './SearchField'

it('SearchField has no a11y violations', () => {
  // Wrap in minimal page context to satisfy landmark rules
  mount(
    <main>
      <SearchField label="Search products" />
    </main>
  )

  cy.injectAxe()
  cy.checkA11y('main', {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
  })
})

it('SearchField label is associated with input', () => {
  mount(<main><SearchField label="Search products" /></main>)

  cy.get('label').should('contain.text', 'Search products')
  cy.get('label').invoke('attr', 'for').then((forAttr) => {
    cy.get(`#${forAttr}`).should('exist')
  })
})
```

---

## Real Tab Key with cypress-real-events

Cypress's built-in `.type('{tab}')` is not a real browser Tab event. Use `cy.realPress('Tab')` from `cypress-real-events` for accurate focus management testing.

```js
it('Tab moves focus through nav links in order', () => {
  cy.visit('/')

  // Start focus from the skip link (first focusable element)
  cy.get('.skip-link').focus()
  cy.realPress('Tab') // moves to first nav link

  cy.focused().should('contain.text', 'Home')

  cy.realPress('Tab')
  cy.focused().should('contain.text', 'About')

  cy.realPress('Tab')
  cy.focused().should('contain.text', 'Contact')
})

it('Tab sequence skips hidden menu items', () => {
  cy.visit('/')

  // Menu is closed — items must not be in tab order
  cy.get('[aria-label="Products"]').focus()
  cy.realPress('Tab')

  // Focus should jump past closed submenu to next top-level item
  cy.focused().should('not.be.within', '[data-testid="products-submenu"]')
})
```

---

## Axe Violation Logging

Log detailed violation info instead of just failing. Useful for CI debugging.

```js
function terminalLog(violations) {
  cy.task('log', `${violations.length} accessibility violation(s) detected`)
  const messages = violations.map(({ id, impact, description, nodes }) =>
    `[${impact}] ${id}: ${description}\n` +
    nodes.map(n => `  - ${n.target}`).join('\n')
  )
  cy.task('log', messages.join('\n\n'))
}

it('page has no axe violations', () => {
  cy.visit('/checkout')
  cy.injectAxe()
  cy.checkA11y(null, null, terminalLog)
})
```
