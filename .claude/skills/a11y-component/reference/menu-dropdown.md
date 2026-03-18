# Menu / Dropdown Reference

Two distinct patterns exist. Use the right one:

| Use case | Pattern |
|----------|---------|
| App actions (Save, Delete, Copy) | ARIA `role="menu"` + `role="menuitem"` |
| Navigation links | Plain `<ul>` with `<a>` — no menu role needed |

Never put links inside `role="menu"`. That pattern is for application-like action menus only.

## Required HTML Structure — Action Menu

```html
<button
  id="actions-trigger"
  type="button"
  aria-haspopup="menu"
  aria-expanded="false"
  aria-controls="actions-menu"
>
  Actions
</button>

<ul
  id="actions-menu"
  role="menu"
  aria-labelledby="actions-trigger"
  hidden
>
  <li role="none">
    <button role="menuitem" type="button">Edit</button>
  </li>
  <li role="none">
    <button role="menuitem" type="button">Duplicate</button>
  </li>
  <li role="none">
    <button role="menuitem" type="button" aria-disabled="true">Delete</button>
  </li>
</ul>
```

## Required HTML Structure — Navigation Dropdown

```html
<button
  id="nav-trigger"
  type="button"
  aria-haspopup="true"
  aria-expanded="false"
  aria-controls="nav-menu"
>
  Products
</button>

<ul id="nav-menu" hidden>
  <li><a href="/products/overview">Overview</a></li>
  <li><a href="/products/pricing">Pricing</a></li>
</ul>
```

## ARIA Attributes

| Attribute | Value | Why |
|-----------|-------|-----|
| `aria-haspopup` | `"menu"` or `"true"` | Tells AT a popup is attached |
| `aria-expanded` | `"false"` / `"true"` | Current open/closed state |
| `aria-controls` | Menu element ID | Links trigger to menu |
| `role="menu"` | — | Only for action menus, not nav |
| `role="none"` on `<li>` | — | Strips list item semantics inside menu |
| `role="menuitem"` on items | — | Names each item as a menu item |

## Focus Management

**On open:**
- Move focus to the first `menuitem`

**On close (Escape or Tab):**
- Return focus to the trigger button
- Set `aria-expanded="false"` on trigger
- Add `hidden` to menu

**On item activation:**
- Perform action
- Close menu
- Return focus to trigger (or move to a new context if the action navigates)

## Keyboard Spec

| Key | Action |
|-----|--------|
| `Enter` / `Space` on trigger | Open menu, focus first item |
| `Arrow Down` | Move to next item (wraps to first) |
| `Arrow Up` | Move to previous item (wraps to last) |
| `Home` | Move to first item |
| `End` | Move to last item |
| `Escape` | Close menu, return focus to trigger |
| `Tab` | Close menu, move focus naturally (do NOT trap) |
| Type a character | Jump to next item starting with that character |

## React Implementation

```tsx
import { useEffect, useRef, useState } from 'react'

interface MenuItem {
  label: string
  onSelect: () => void
  disabled?: boolean
}

interface MenuProps {
  label: string
  items: MenuItem[]
}

export function Menu({ label, items }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const enabledItems = items.map((item, i) => ({ ...item, index: i })).filter(item => !item.disabled)

  function open() {
    setIsOpen(true)
    setActiveIndex(0)
  }

  function close() {
    setIsOpen(false)
    setActiveIndex(-1)
    triggerRef.current?.focus()
  }

  // Focus active item
  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      itemRefs.current[activeIndex]?.focus()
    }
  }, [isOpen, activeIndex])

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      open()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIsOpen(true)
      setActiveIndex(items.length - 1)
    }
  }

  function handleMenuKeyDown(e: React.KeyboardEvent) {
    const enabled = enabledItems.map(i => i.index)

    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'Tab') {
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = enabled[(enabled.indexOf(activeIndex) + 1) % enabled.length]
      setActiveIndex(next)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = enabled[(enabled.indexOf(activeIndex) - 1 + enabled.length) % enabled.length]
      setActiveIndex(prev)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(enabled[0])
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(enabled[enabled.length - 1])
    }
  }

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="actions-menu"
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleTriggerKeyDown}
      >
        {label}
      </button>

      <ul
        ref={menuRef}
        id="actions-menu"
        role="menu"
        aria-labelledby="actions-trigger"
        hidden={!isOpen}
        onKeyDown={handleMenuKeyDown}
      >
        {items.map((item, i) => (
          <li key={i} role="none">
            <button
              ref={el => { itemRefs.current[i] = el }}
              role="menuitem"
              type="button"
              tabIndex={-1}
              aria-disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  item.onSelect()
                  close()
                }
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Vanilla JS Implementation

```js
class DropdownMenu {
  constructor(triggerEl, menuEl) {
    this.trigger = triggerEl
    this.menu = menuEl
    this.items = Array.from(menuEl.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])'))
    this.currentIndex = -1

    this.trigger.addEventListener('click', () => this.isOpen() ? this.close() : this.open())
    this.trigger.addEventListener('keydown', e => this.handleTriggerKey(e))
    this.menu.addEventListener('keydown', e => this.handleMenuKey(e))

    document.addEventListener('mousedown', e => {
      if (!this.trigger.contains(e.target) && !this.menu.contains(e.target)) this.close()
    })
  }

  isOpen() { return !this.menu.hidden }

  open(focusLast = false) {
    this.menu.removeAttribute('hidden')
    this.trigger.setAttribute('aria-expanded', 'true')
    this.currentIndex = focusLast ? this.items.length - 1 : 0
    this.items[this.currentIndex]?.focus()
  }

  close() {
    this.menu.setAttribute('hidden', '')
    this.trigger.setAttribute('aria-expanded', 'false')
    this.currentIndex = -1
    this.trigger.focus()
  }

  handleTriggerKey(e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      this.open()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      this.open(true)
    }
  }

  handleMenuKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); this.close() }
    else if (e.key === 'Tab') { this.close() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); this.moveFocus(1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.moveFocus(-1) }
    else if (e.key === 'Home') { e.preventDefault(); this.currentIndex = 0; this.items[0]?.focus() }
    else if (e.key === 'End') { e.preventDefault(); this.currentIndex = this.items.length - 1; this.items[this.currentIndex]?.focus() }
  }

  moveFocus(dir) {
    this.currentIndex = (this.currentIndex + dir + this.items.length) % this.items.length
    this.items[this.currentIndex]?.focus()
  }
}
```

## Gotchas

1. **Using `opacity: 0` to hide the menu** — Element stays in tab order. Always use `hidden` attribute or `display: none`.
2. **Missing Escape handler** — Every dropdown must close on Escape and return focus to trigger.
3. **Tab trapping inside the menu** — Do NOT trap Tab in menus. Tab should close the menu and let focus move naturally.
4. **Navigation links inside `role="menu"`** — Links go in plain `<ul>` lists. `role="menu"` is for app actions only.
5. **`aria-disabled` vs `disabled`** — Use `aria-disabled="true"` on `role="menuitem"` elements (not the `disabled` attribute, which removes them from keyboard navigation). Handle the disabled check manually.
6. **Not updating `aria-expanded`** — Must toggle between `"true"` and `"false"` on every open/close.
7. **Forgetting outside-click handler** — Menu should close when clicking outside. Bind at `document` and check `.contains()`.
