# Focus Management Reference

## Core Principle
When content appears or changes dynamically, you must decide: where should the user's focus go?

## Modal Dialog Focus Management

```
Open → Focus moves INTO dialog (heading or first control)
       → Background becomes inert
       → Tab cycles within dialog only
Close → Focus returns to TRIGGER element
       → Background restored
```

### Modern Approach: `inert`

The `inert` attribute is the recommended way to make background content non-interactive. It disables focus, click events, and removes from the accessibility tree in one attribute:

```javascript
document.querySelector('main').inert = true;   // background locked
document.querySelector('main').inert = false;  // background restored
```

Prefer `inert` over manually managing `aria-hidden="true"` + `tabindex="-1"` on every background element.

### Implementation with `inert`
```javascript
function openModal() {
  // Make background inert
  document.querySelector('header').inert = true;
  document.querySelector('main').inert = true;
  document.querySelector('footer').inert = true;

  setIsOpen(true);

  // Focus the dialog (use tabindex="-1" on the dialog container)
  requestAnimationFrame(() => {
    dialogRef.current.focus();
  });
}

function closeModal() {
  document.querySelector('header').inert = false;
  document.querySelector('main').inert = false;
  document.querySelector('footer').inert = false;

  setIsOpen(false);
  triggerRef.current.focus(); // Return to trigger
}
```

### Escape Key Handler
```javascript
function handleKeyUp(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
}
```

## Menu Focus Management

```
Click/Enter trigger → Open menu, focus first item
Arrow Down/Up       → Move between items
Escape              → Close menu, focus trigger
Tab                 → Close menu, focus next element
```

When menu is CLOSED, all items inside must be removed from tab order. Use `display: none` or `hidden` attribute.

## Client-Side Routing

When navigating between "pages" with JavaScript:
1. Update `document.title` to reflect new page
2. Move focus to the new page's main content or heading
3. Announce the page change to screen readers

```javascript
// Using React Helmet for title
<Helmet>
  <title>{`${pageName} | CampSpots`}</title>
</Helmet>

// Or announce via live region
setAnnouncement(`Navigated to ${pageName}`);
```

### Menu State Reset

When navigating between routes, reset any open menus/dropdowns. Client-side routing doesn't trigger a page refresh, so menu state persists across "pages" unless explicitly cleared.

```javascript
// Reset on route change
useEffect(() => {
  setMenuOpen(false);
  setActiveSubmenu(null);
}, [location.pathname]);
```

## Skip Links Focus

```html
<a href="#main" class="skip-link">Skip to main content</a>
```

The target element (`#main`) receives focus when the skip link is activated. If the target isn't natively focusable, add `tabindex="-1"`.

## Form Error Focus

On form submission failure:
1. Announce error count via live region (without moving focus)
2. Focus the first invalid field
3. Per-field errors linked via `aria-describedby`

## Dynamic Content Appearing

When new content appears (toast, notification, inline expansion):
- **If actionable (modal, menu):** Move focus to it
- **If informational (toast, save confirmation):** Use ARIA live region (don't move focus)
- **If inline expansion (accordion):** Focus the expanded content or leave focus on trigger

## React Focus Patterns

### Single ref
```jsx
const buttonRef = useRef(null);
// Later: buttonRef.current.focus();

<button ref={buttonRef}>Click me</button>
```

### Array of refs (for dynamic lists)
```jsx
const itemRefs = useRef([]);

{items.map((item, i) => (
  <button ref={el => itemRefs.current[i] = el}>
    {item.name}
  </button>
))}

// Focus specific item:
itemRefs.current[targetIndex]?.focus();
```

### Timing with requestAnimationFrame
Sometimes focus calls need to wait for React's render cycle:
```javascript
requestAnimationFrame(() => {
  targetRef.current?.focus();
});
```

## Fullscreen / Overlay Focus

When entering fullscreen mode:
1. Set `tabindex="-1"` on the fullscreen container
2. Focus the container via ref
3. Support Escape to exit
4. On exit, return focus to the trigger button

```jsx
function enterFullscreen() {
  setIsFullscreen(true);
  slideshowRef.current.focus();
}

function exitFullscreen() {
  setIsFullscreen(false);
  fullscreenBtnRef.current.focus();
}
```
