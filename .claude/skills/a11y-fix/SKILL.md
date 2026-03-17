---
name: a11y-fix
description: "Fix accessibility issues in current code. Works through audit findings or targets specific areas. Makes changes, explains rationale, and notes what to test manually."
user-invokable: true
args:
  - name: area
    description: "Optional: specific issue or area to fix (e.g., 'keyboard', 'headings', 'forms', 'contrast', 'modal focus')"
---

Fix accessibility issues in the current code. Target {{area}} if specified, otherwise work through all identified issues from most critical to least.

→ *Consult the accessible-web skill and its reference files for correct patterns.*

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

## After Fixing

Remind the developer to manually test:
- Tab through the component with keyboard only
- Test with VoiceOver (Mac/Safari) or NVDA (Windows/Chrome)
- Check contrast with CCA or DevTools
- Zoom to 200% and verify reflow
- Run axe DevTools scan

Automated tests can verify regressions but can't replace manual testing with assistive technology.
