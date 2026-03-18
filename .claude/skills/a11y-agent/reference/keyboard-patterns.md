# Keyboard Patterns Reference

## Skip Links
Must be the first focusable element on every page. Visible on focus.

```html
<a href="#main" class="skip-link">Skip to main content</a>
<!-- ... header/nav ... -->
<main id="main">
```

```css
.skip-link {
  position: absolute;
  opacity: 0;
  z-index: 100;
}
.skip-link:focus {
  opacity: 1;
  /* style visibly */
}
```

## Roving Tabindex Pattern

For composite widgets (date pickers, tab lists, toolbars, grids) where Arrow keys navigate internally while Tab moves to the next component.

**Principle:** One tab stop for the entire widget. `tabindex="0"` on the active item, `tabindex="-1"` on all others. Arrow keys move the active item.

```jsx
// React example for a date grid
const [focusedIndex, setFocusedIndex] = useState(0);
const buttonRefs = useRef([]);

function handleKeyUp(event) {
  const currentIndex = parseInt(event.target.dataset.index);
  let nextIndex;

  switch (event.key) {
    case 'ArrowRight':
      nextIndex = currentIndex + 1;
      break;
    case 'ArrowLeft':
      nextIndex = currentIndex - 1;
      break;
    case 'ArrowDown':
      nextIndex = currentIndex + 7; // week row
      break;
    case 'ArrowUp':
      nextIndex = currentIndex - 7;
      break;
    default:
      return;
  }

  if (nextIndex >= 0 && nextIndex < items.length) {
    setFocusedIndex(nextIndex);
    buttonRefs.current[nextIndex]?.focus();
  }
}

// Prevent Arrow keys from scrolling
function handleKeyDown(event) {
  if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
  }
}

// In JSX:
{items.map((item, i) => (
  <button
    key={i}
    ref={el => buttonRefs.current[i] = el}
    tabIndex={focusedIndex === i ? 0 : -1}
    data-index={i}
    onKeyUp={handleKeyUp}
    onKeyDown={handleKeyDown}
  >
    {item.label}
  </button>
))}
```

## Menu / Dropdown Pattern

```html
<button aria-expanded="false" aria-haspopup="true" id="menu-btn">
  Menu
</button>
<ul role="menu" aria-labelledby="menu-btn" hidden>
  <li role="menuitem"><a href="/about">About</a></li>
  <li role="menuitem"><a href="/contact">Contact</a></li>
</ul>
```

**Keyboard behavior:**
- `Enter`/`Space` on button → open menu, focus first item
- `Arrow Down`/`Arrow Up` → move between items
- `Escape` → close menu, return focus to button
- `Tab` → close menu, move to next focusable element

**Critical:** When menu is closed, items inside must not be in the tab order. Use `display: none` or `hidden` attribute — NOT `opacity: 0` or `visibility: hidden` (which may leave items focusable).

## Escape Key Convention

Always support `Escape` to close overlays, menus, modals, and popups. Return focus to the trigger element.

```javascript
function handleKeyUp(event) {
  if (event.key === 'Escape') {
    closeMenu();
    triggerButtonRef.current.focus();
  }
}
```

## Preventing Scroll on Arrow Keys

When overriding arrow keys for widget navigation (date pickers, tabs, menus), prevent default on `keydown` to stop page scrolling:

```javascript
function handleKeyDown(event) {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
  }
}
```

Handle the actual navigation logic on `keyup` to avoid key-repeat issues. Use `keydown` only for `preventDefault()`.

## Keyboard Testing Checklist

1. Tab through entire page — can you reach every control?
2. Can you see where focus is at all times?
3. Can you operate every control with Enter/Space?
4. Can you dismiss menus/modals with Escape?
5. Is tab order logical (follows visual layout)?
6. Are you ever trapped (can't Tab out)?
7. Are hidden elements properly removed from tab order?

## tabindex Values

- **Not set / `0`** — in natural tab order (default for interactive elements)
- **`-1`** — removed from tab order, but focusable via JavaScript (`.focus()`)
- **Positive values (1, 2, 3...)** — NEVER USE. Breaks natural order.
