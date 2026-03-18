# Accordion Reference

## Required HTML Structure

```html
<div class="accordion">

  <h3>
    <button
      id="acc-trigger-1"
      type="button"
      aria-expanded="true"
      aria-controls="acc-panel-1"
    >
      Section 1
    </button>
  </h3>
  <div
    id="acc-panel-1"
    role="region"
    aria-labelledby="acc-trigger-1"
  >
    <p>Panel 1 content</p>
  </div>

  <h3>
    <button
      id="acc-trigger-2"
      type="button"
      aria-expanded="false"
      aria-controls="acc-panel-2"
    >
      Section 2
    </button>
  </h3>
  <div
    id="acc-panel-2"
    role="region"
    aria-labelledby="acc-trigger-2"
    hidden
  >
    <p>Panel 2 content</p>
  </div>

</div>
```

Notes on structure:
- Wrap each trigger in a heading (`<h2>`–`<h6>`) — the heading level should fit the page outline
- `role="region"` + `aria-labelledby` makes each panel a navigable landmark; omit `role="region"` if there are more than 6 accordion items (landmark clutter)
- Use `hidden` attribute on collapsed panels

## ARIA Attributes

| Element | Attribute | Value | Why |
|---------|-----------|-------|-----|
| Trigger button | `aria-expanded` | `"true"` / `"false"` | Communicates open/closed state |
| Trigger button | `aria-controls` | Panel ID | Links trigger to its panel |
| Panel | `role="region"` | — | Landmark for screen reader navigation (omit if > 6 items) |
| Panel | `aria-labelledby` | Trigger ID | Names the region via its trigger |

## Keyboard Spec

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Toggle panel open/closed |
| `Tab` | Move to next focusable element (natural flow) |
| `Shift+Tab` | Move to previous focusable element |
| `Arrow Down` (optional) | Move focus to next trigger |
| `Arrow Up` (optional) | Move focus to previous trigger |
| `Home` (optional) | Focus first trigger |
| `End` (optional) | Focus last trigger |

Arrow key navigation is optional per APG. Only add it if you're building an application-style accordion, not a content-disclosure pattern. Most content accordions just use Tab.

## Open/Close Behavior

**Multi-open (default):** Each panel toggles independently. No other panels are affected.

**Single-open:** When one panel opens, close all others. Set `aria-expanded="false"` and `hidden` on all other panels.

```tsx
// Single-open: close siblings before opening
function openPanel(index: number) {
  items.forEach((_, i) => {
    if (i !== index) closePanel(i)
  })
  togglePanel(index)
}
```

## React Implementation

```tsx
import { useState } from 'react'

interface AccordionItem {
  id: string
  heading: string
  content: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  headingLevel?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  allowMultiple?: boolean
  useLandmarks?: boolean  // set false if > 6 items
}

export function Accordion({
  items,
  headingLevel: Heading = 'h3',
  allowMultiple = true,
  useLandmarks = true,
}: AccordionProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (!allowMultiple) next.clear()
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="accordion">
      {items.map(item => {
        const isOpen = expanded.has(item.id)
        return (
          <div key={item.id}>
            <Heading>
              <button
                id={`acc-trigger-${item.id}`}
                type="button"
                aria-expanded={isOpen}
                aria-controls={`acc-panel-${item.id}`}
                onClick={() => toggle(item.id)}
              >
                {item.heading}
              </button>
            </Heading>
            <div
              id={`acc-panel-${item.id}`}
              role={useLandmarks ? 'region' : undefined}
              aria-labelledby={useLandmarks ? `acc-trigger-${item.id}` : undefined}
              hidden={!isOpen}
            >
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

## Animated Height Transition

CSS `height: 0` / `height: auto` transitions require care. Use `grid` trick for smooth animation without JS height measurement:

```css
.accordion-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 200ms ease;
}

.accordion-panel[aria-hidden="false"],
.accordion-panel:not([hidden]) {
  grid-template-rows: 1fr;
}

.accordion-panel > div {
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .accordion-panel {
    transition: none;
  }
}
```

If animating, **do not use the `hidden` attribute** — it instantly removes the element and prevents animation. Instead use `aria-hidden` + CSS, then set `display: none` after the transition ends:

```tsx
function handleTransitionEnd(e: React.TransitionEvent, id: string) {
  if (!expanded.has(id)) {
    e.currentTarget.setAttribute('hidden', '')
  }
}
```

Or use the CSS `display` property animation (Chrome 116+, Firefox 129+) instead.

## Vanilla JS Implementation

```js
class Accordion {
  constructor(containerEl, { allowMultiple = true } = {}) {
    this.container = containerEl
    this.allowMultiple = allowMultiple
    this.triggers = Array.from(containerEl.querySelectorAll('[aria-expanded]'))

    this.triggers.forEach(trigger => {
      trigger.addEventListener('click', () => this.toggle(trigger))
    })
  }

  toggle(trigger) {
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true'

    if (!this.allowMultiple) {
      this.triggers.forEach(t => {
        if (t !== trigger) this.collapse(t)
      })
    }

    if (isExpanded) {
      this.collapse(trigger)
    } else {
      this.expand(trigger)
    }
  }

  expand(trigger) {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'))
    trigger.setAttribute('aria-expanded', 'true')
    panel.removeAttribute('hidden')
  }

  collapse(trigger) {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'))
    trigger.setAttribute('aria-expanded', 'false')
    panel.setAttribute('hidden', '')
  }
}
```

## Gotchas

1. **`<div>` as trigger instead of `<button>`** — Divs are not focusable, not in tab order, don't respond to Enter/Space. Always use `<button>`.
2. **Missing heading wrapper** — Triggers must be inside headings to appear in screen reader document outline.
3. **Animated height + `hidden` conflict** — `hidden` immediately removes the element, so transition never plays. If animating, manage visibility separately; apply `hidden` only after the closing transition ends.
4. **`prefers-reduced-motion` not respected** — Wrap all transitions in `@media (prefers-reduced-motion: no-preference)` or explicitly disable with `transition: none` in the `reduce` query.
5. **Landmark clutter with `role="region"`** — If you have more than 6 accordion items, `role="region"` on each panel floods the screen reader landmarks list. Omit it for large accordions.
6. **Forgetting `aria-controls` / `aria-expanded`** — These are required. AT announces "collapsed/expanded" based on `aria-expanded`. `aria-controls` lets users jump from trigger to panel in some AT.
7. **Not removing `hidden` on initial open** — If an accordion item starts expanded, ensure the panel does NOT have the `hidden` attribute in the initial HTML.
