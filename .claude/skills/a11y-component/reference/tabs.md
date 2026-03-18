# Tabs Reference

## Required HTML Structure

```html
<div class="tabs">
  <div role="tablist" aria-label="Content sections">
    <button
      id="tab-overview"
      role="tab"
      aria-selected="true"
      aria-controls="panel-overview"
      tabindex="0"
    >
      Overview
    </button>
    <button
      id="tab-details"
      role="tab"
      aria-selected="false"
      aria-controls="panel-details"
      tabindex="-1"
    >
      Details
    </button>
    <button
      id="tab-reviews"
      role="tab"
      aria-selected="false"
      aria-controls="panel-reviews"
      tabindex="-1"
    >
      Reviews
    </button>
  </div>

  <div
    id="panel-overview"
    role="tabpanel"
    aria-labelledby="tab-overview"
  >
    <p>Overview content</p>
  </div>

  <div
    id="panel-details"
    role="tabpanel"
    aria-labelledby="tab-details"
    hidden
  >
    <p>Details content</p>
  </div>

  <div
    id="panel-reviews"
    role="tabpanel"
    aria-labelledby="tab-reviews"
    hidden
  >
    <p>Reviews content</p>
  </div>
</div>
```

## ARIA Attributes

| Element | Attribute | Value | Why |
|---------|-----------|-------|-----|
| Tab list | `role="tablist"` | — | Groups tabs as a widget |
| Tab list | `aria-label` | Descriptive label | Names the group for AT |
| Tab button | `role="tab"` | — | Identifies as a tab |
| Tab button | `aria-selected` | `"true"` / `"false"` | Current selection state |
| Tab button | `aria-controls` | Panel ID | Links tab to its panel |
| Tab button | `tabindex` | `"0"` (selected) / `"-1"` (others) | Roving tabindex |
| Panel | `role="tabpanel"` | — | Identifies as panel |
| Panel | `aria-labelledby` | Tab ID | Names panel via its tab |

## Roving Tabindex

Only one tab in the tablist is in the natural tab order at a time (`tabindex="0"`). All others get `tabindex="-1"`. Arrow keys move focus between tabs and update which one has `tabindex="0"`.

This means: pressing `Tab` from outside moves focus to the selected tab. Arrow keys then move between tabs. `Tab` from a tab moves focus to the active panel content.

## Keyboard Spec

| Key | Action |
|-----|--------|
| `Tab` | Move focus into tablist (lands on selected tab) |
| `Arrow Right` / `Arrow Down` | Focus next tab (wraps) — does NOT auto-activate |
| `Arrow Left` / `Arrow Up` | Focus previous tab (wraps) |
| `Home` | Focus first tab |
| `End` | Focus last tab |
| `Enter` / `Space` | Activate focused tab (if using manual activation) |
| `Tab` from a tab | Move focus to active panel |

**Activation modes:**
- **Automatic** (simpler) — selecting a tab also activates it immediately on arrow key press
- **Manual** (WCAG preferred for slow content) — arrow moves focus only; Enter/Space activates

Default to automatic activation unless the tab content loads async or is expensive to render.

## React Implementation

```tsx
import { useRef, useState } from 'react'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  label: string
}

export function Tabs({ tabs, label }: TabsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function selectTab(index: number) {
    setSelectedIndex(index)
    tabRefs.current[index]?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    let next: number | null = null

    if (e.key === 'ArrowRight') {
      next = (index + 1) % tabs.length
    } else if (e.key === 'ArrowLeft') {
      next = (index - 1 + tabs.length) % tabs.length
    } else if (e.key === 'Home') {
      next = 0
    } else if (e.key === 'End') {
      next = tabs.length - 1
    }

    if (next !== null) {
      e.preventDefault()
      selectTab(next)  // automatic activation
    }
  }

  return (
    <div>
      <div role="tablist" aria-label={label}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={el => { tabRefs.current[i] = el }}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={i === selectedIndex}
            aria-controls={`panel-${tab.id}`}
            tabIndex={i === selectedIndex ? 0 : -1}
            onClick={() => selectTab(i)}
            onKeyDown={e => handleKeyDown(e, i)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={i !== selectedIndex}
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
```

## Vanilla JS Implementation

```js
class TabInterface {
  constructor(containerEl) {
    this.container = containerEl
    this.tabs = Array.from(containerEl.querySelectorAll('[role="tab"]'))
    this.panels = Array.from(containerEl.querySelectorAll('[role="tabpanel"]'))

    this.tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => this.select(i))
      tab.addEventListener('keydown', e => this.handleKeyDown(e, i))
    })
  }

  select(index) {
    this.tabs.forEach((tab, i) => {
      const active = i === index
      tab.setAttribute('aria-selected', String(active))
      tab.setAttribute('tabindex', active ? '0' : '-1')
    })
    this.panels.forEach((panel, i) => {
      panel.hidden = i !== index
    })
    this.tabs[index].focus()
  }

  handleKeyDown(e, index) {
    const map = {
      ArrowRight: (index + 1) % this.tabs.length,
      ArrowLeft: (index - 1 + this.tabs.length) % this.tabs.length,
      Home: 0,
      End: this.tabs.length - 1,
    }
    if (e.key in map) {
      e.preventDefault()
      this.select(map[e.key])
    }
  }
}
```

## Gotchas

1. **Missing `aria-controls` connection** — Every tab MUST reference its panel via `aria-controls`. Every panel MUST reference its tab via `aria-labelledby`.
2. **`Tab` key should go to panel, not next tab** — Arrow keys move between tabs. `Tab` exits the tablist entirely and moves into the panel. Never intercept `Tab` inside the tablist.
3. **All tabs having `tabindex="0"`** — Only the selected tab gets `tabindex="0"`. Others must be `-1`. Otherwise, tabbing into the list means tabbing through all tabs.
4. **Using `display: none` inconsistently** — Hidden panels should use the `hidden` attribute. Don't mix `hidden` and `display: none`; they're equivalent but be consistent.
5. **Vertical tabs** — If tabs are arranged vertically, Arrow Up/Down should navigate, not Left/Right.
6. **Dynamic tab content** — If panels load async, consider adding `aria-busy="true"` on the panel while loading and removing it when content is ready.
7. **Forgetting `aria-label` on tablist** — The `role="tablist"` element needs a label if there are multiple tablists on the page.
