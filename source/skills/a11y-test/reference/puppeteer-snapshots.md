# Puppeteer Accessibility Tree Snapshots

`page.accessibility.snapshot()` captures the browser's computed accessibility tree as a JSON object. Use it to snapshot the structure assistive technology actually sees — catches regressions in role, name, and state that visual tests miss.

## Setup

```bash
npm install -D puppeteer
```

```js
const puppeteer = require('puppeteer')

let browser, page

beforeAll(async () => {
  browser = await puppeteer.launch()
  page = await browser.newPage()
})

afterAll(async () => {
  await browser.close()
})
```

---

## Full Page Snapshot

Captures the entire accessibility tree. Useful for first-pass exploration, but brittle as a snapshot test — any content change breaks it.

```js
it('captures full accessibility tree', async () => {
  await page.goto('http://localhost:3000/about')
  const snapshot = await page.accessibility.snapshot({ interestingOnly: false })
  expect(snapshot).toMatchSnapshot()
})
```

`interestingOnly: false` includes all nodes, even ones the browser considers non-semantic. Omit the option (defaults to `true`) to capture only nodes with roles, names, or states — less noise.

---

## Scoped Snapshot (Recommended)

Snapshot a single component by passing a DOM element handle. Far less brittle than full-page snapshots.

```js
it('nav accessibility tree matches snapshot', async () => {
  await page.goto('http://localhost:3000')

  const navHandle = await page.$('nav[aria-label="Main"]')
  const snapshot = await page.accessibility.snapshot({
    root: navHandle,
    interestingOnly: true,
  })

  expect(snapshot).toMatchSnapshot()
})

it('modal accessibility tree on open', async () => {
  await page.goto('http://localhost:3000/dashboard')
  await page.click('[data-testid="open-dialog-btn"]')

  const dialogHandle = await page.$('[role="dialog"]')
  const snapshot = await page.accessibility.snapshot({ root: dialogHandle })

  expect(snapshot).toMatchSnapshot()
})
```

---

## Asserting Specific Properties

Instead of full snapshot matching, assert the properties that matter. More maintainable.

```js
it('submit button has correct role and name', async () => {
  await page.goto('http://localhost:3000/contact')
  const snapshot = await page.accessibility.snapshot()

  const button = snapshot.children.find(
    node => node.role === 'button' && /submit/i.test(node.name)
  )
  expect(button).toBeDefined()
  expect(button.disabled).toBeFalsy()
})
```

---

## Limitations

- **Only reflects what the browser computes** — does not run axe rules, does not check contrast.
- **Snapshot drift** — any content change (copy, new elements) breaks snapshot tests. Prefer scoped snapshots or property assertions.
- **`page.accessibility.snapshot()` is deprecated in Puppeteer v22+** — migrate to Chrome DevTools Protocol directly or use `@axe-core/puppeteer` for rule-based testing.
- **Does not test keyboard behavior** — the tree shows roles and names, not whether Tab reaches an element.
- **SSR/hydration timing** — snapshot after the page is fully interactive, not just after navigation. Use `page.waitForSelector` to ensure dynamic content is rendered.

Use snapshots to catch unintentional tree changes. Pair with `@axe-core/puppeteer` for rule-based violation detection.
