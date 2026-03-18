# Modal / Dialog Reference

## Required HTML Structure

```html
<button id="open-modal-btn" type="button">Open Dialog</button>

<div
  id="my-dialog"
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc"
  hidden
>
  <h2 id="dialog-title">Dialog Title</h2>
  <p id="dialog-desc">Supporting description for screen readers.</p>

  <!-- Dialog content -->

  <button type="button" id="dialog-close">Close</button>
</div>
```

## ARIA Attributes

| Attribute | Value | Why |
|-----------|-------|-----|
| `role="dialog"` | — | Identifies region as a dialog to AT |
| `aria-modal="true"` | — | Tells AT to ignore background content (supplements `inert`) |
| `aria-labelledby` | ID of heading | Names the dialog |
| `aria-describedby` | ID of description | Optional; announces supporting text |

## Focus Management

**On open:**
1. Set `inert` on all background content (body children except the dialog)
2. Move focus to the first focusable element inside the dialog — usually the heading or first interactive element
3. Trap Tab/Shift+Tab within the dialog

**On close:**
1. Remove `inert` from background content
2. Set `hidden` on dialog
3. Return focus to the element that triggered the dialog open (`triggerRef.current.focus()`)

Never lose focus when closing. Dropping focus to `<body>` disorients keyboard and screen reader users.

## Keyboard Spec

| Key | Action |
|-----|--------|
| `Tab` | Move focus to next focusable element within dialog (wraps) |
| `Shift+Tab` | Move focus to previous focusable element within dialog (wraps) |
| `Escape` | Close dialog, return focus to trigger |

## React Implementation

```tsx
import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  triggerId: string
}

export function Modal({ isOpen, onClose, title, description, children, triggerId }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Focus trap + return focus on close
  useEffect(() => {
    if (!isOpen) return

    const dialog = dialogRef.current
    if (!dialog) return

    // Inert all siblings
    const siblings = Array.from(document.body.children).filter(el => el !== dialog)
    siblings.forEach(el => el.setAttribute('inert', ''))

    // Focus first focusable element
    const firstFocusable = dialog.querySelector<HTMLElement>(FOCUSABLE)
    firstFocusable?.focus()

    return () => {
      // Remove inert
      siblings.forEach(el => el.removeAttribute('inert'))
      // Return focus to trigger
      document.getElementById(triggerId)?.focus()
    }
  }, [isOpen, triggerId])

  // Tab trap
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      const dialog = dialogRef.current
      if (!dialog) return

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby={description ? 'dialog-desc' : undefined}
      className="modal"
    >
      <h2 id="dialog-title">{title}</h2>
      {description && <p id="dialog-desc">{description}</p>}
      {children}
      <button type="button" onClick={onClose}>Close</button>
    </div>
  )
}
```

## Vanilla JS Implementation

```js
class Modal {
  constructor(dialogEl, triggerEl) {
    this.dialog = dialogEl
    this.trigger = triggerEl
    this.siblings = []

    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  open() {
    // Hide background
    this.siblings = Array.from(document.body.children).filter(el => el !== this.dialog)
    this.siblings.forEach(el => el.setAttribute('inert', ''))

    this.dialog.removeAttribute('hidden')
    this.dialog.querySelector('[autofocus], button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus()

    document.addEventListener('keydown', this.handleKeyDown)
  }

  close() {
    this.siblings.forEach(el => el.removeAttribute('inert'))
    this.dialog.setAttribute('hidden', '')
    document.removeEventListener('keydown', this.handleKeyDown)
    this.trigger.focus()
  }

  handleKeyDown(e) {
    if (e.key === 'Escape') {
      this.close()
      return
    }
    if (e.key === 'Tab') {
      this.trapFocus(e)
    }
  }

  trapFocus(e) {
    const focusable = Array.from(this.dialog.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ))
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}
```

## Gotchas

1. **Forgetting focus return** — Focus MUST go back to the trigger on close. Dropping to `<body>` is broken.
2. **Not using `inert`** — Without `inert`, screen readers can reach background content even when `aria-modal="true"` is set. Some AT ignores `aria-modal`. Belt + suspenders: use both.
3. **Escape not bound** — Every dialog must close on Escape. Bind at `document`, not the dialog element.
4. **`display: none` vs `hidden`** — Either works to remove from tab order. Don't use `opacity: 0` or `visibility: hidden` alone.
5. **Multiple open modals** — If stacking is possible, track a stack. Only the top modal should receive keyboard events.
6. **Scrollable dialogs** — If dialog content scrolls, the dialog container needs `tabindex="0"` so keyboard users can scroll it.
7. **Animation** — Wrap transitions in `@media (prefers-reduced-motion: no-preference)`. Always render the `hidden` attribute change after animation completes.
