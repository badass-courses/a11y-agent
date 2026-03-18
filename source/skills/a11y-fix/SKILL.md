---
name: a11y-fix
description: Fix accessibility issues in current code. Works through findings from a11y-audit, a11y-scan, or a11y-review. Makes changes, explains rationale, notes what to test manually. Use when asked to "fix accessibility", "make this accessible", or after any a11y assessment.
user-invokable: true
args:
  - name: area
    description: "Optional: specific issue or area to fix (e.g., 'keyboard', 'headings', 'forms', 'contrast', 'modal focus')"
---

Fix accessibility issues in the current code. Target {{area}} if specified, otherwise work through all identified issues from most critical to least.

→ *Consult the a11y-agent skill and its reference files for correct patterns.*

## Fix Process

For each issue:

1. **Identify the problem** — what fails and which WCAG criterion applies
2. **Implement the fix** — use the correct semantic pattern
3. **Explain why** — brief rationale for the change
4. **Flag what to test** — note keyboard and screen reader testing needed

## Fix Priority Order

1. **Keyboard access** — divs→buttons, add focus management, skip links
2. **Accessible names** — labels on inputs, aria-labels on icon buttons, alt on images
3. **Semantic structure** — heading hierarchy, landmarks, lists
4. **ARIA states** — expanded, pressed, selected, invalid, current
5. **Focus management** — modal trapping, return focus, roving tabindex
6. **Screen reader announcements** — live regions for dynamic content
7. **Visual** — contrast, focus indicators, reflow, motion

## Common Fixes

### div → button
Replace `<div onClick>` with `<button>`. Update CSS to reset button styles:
```css
.your-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
}
```

### Add form labels
```html
<!-- Before -->
<input placeholder="Email">

<!-- After -->
<label for="email">Email</label>
<input id="email" type="email" placeholder="user@example.com">
```

### Fix heading hierarchy
Don't change visual appearance — add CSS utility classes instead:
```html
<!-- Before: skipped h2 -->
<h1>Site Name</h1>
<h3>Section Title</h3>

<!-- After: correct hierarchy with style class -->
<h1>Site Name</h1>
<h2 class="heading-sm">Section Title</h2>
```

### Add focus indicator
```css
/* Remove the bad wildcard reset if present */
/* * { outline: none; } ← DELETE THIS */

/* Add visible focus styles */
:focus-visible {
  outline: 2px solid var(--focus-color, #005fcc);
  outline-offset: 2px;
}
```

### Restore focus outline that was removed
Look for `* { outline: 0 }` or `* { outline: none }` in stylesheets and remove it.

### prefers-reduced-motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Mega menu — hidden items still tabbable

```css
/* Before: items invisible but tabbable */
.submenu { display: flex; opacity: 0; }
.submenu.active { opacity: 1; }

/* After: items fully hidden when inactive */
.submenu { display: none; }
.submenu.active { display: flex; }
```

Add `aria-expanded` on the trigger button. Bind Escape to close and return focus to trigger.

### Client-side routing — missing focus management

After route change, update `document.title` and move focus to new content:

```javascript
useEffect(() => {
  document.title = `${pageTitle} | Site Name`;
  mainRef.current?.focus();
}, [location.pathname]);
```

Add `tabindex="-1"` to the focus target if it's not natively focusable.

### Form validation — errors not announced

The live region element MUST exist at page load. Inject error text into it:

```html
<!-- Present at page load, starts empty -->
<p role="alert" aria-atomic="true">{errorMessage}</p>
```

On submit failure: set error message text, mark fields with `aria-invalid="true"`, link errors via `aria-describedby`, focus the first invalid field.

### Modal — background not inert

```javascript
function openModal() {
  document.querySelector('main').inert = true;
  dialogRef.current.focus();
}
function closeModal() {
  document.querySelector('main').inert = false;
  triggerRef.current.focus(); // Return focus to trigger
}
```

## After Each Fix

1. Tab through the component — does keyboard access work?
2. Run axe DevTools or a11y-scan — did violations decrease?
3. Test with a screen reader if the fix involves ARIA or announcements
4. Check contrast if the fix involves visual changes
5. Zoom to 200% if the fix involves layout

## After Fixing

Remind the developer to manually test:
- Tab through the component with keyboard only
- Test with VoiceOver (Mac/Safari) or NVDA (Windows/Chrome)
- Check contrast with CCA or DevTools
- Zoom to 200% and verify reflow
- Run axe DevTools scan

Automated tests can verify regressions but can't replace manual testing with assistive technology.
