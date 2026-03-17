---
name: a11y-audit
description: Audit current component or page for accessibility issues. Produces a prioritized report with WCAG references and fix suggestions.
user-invokable: true
args:
  - name: area
    description: "Optional focus area: keyboard, aria, contrast, forms, structure, motion, or all"
---

Audit the current file, component, or page for accessibility issues. Focus on {{area}} if specified, otherwise check everything.

→ *Consult the accessible-web skill and its reference files for standards and patterns.*

## Audit Process

1. **Read the code** — examine rendered markup, event handlers, styles, and ARIA usage
2. **Check against each category** (or just {{area}} if specified)
3. **Classify issues by severity** using WCAG conformance levels
4. **Produce a structured audit report**

## Categories to Check

### Structure
- Missing or skipped heading levels
- Content not wrapped in landmarks
- Non-semantic elements used for interactive controls (div/span instead of button/a)
- Missing `<html lang>`
- Missing viewport meta tag

### Keyboard
- Interactive elements not focusable (div with onClick, a without href)
- Focus outlines removed or invisible
- No Escape key support for modals/menus
- Hidden content still in tab order
- Missing skip link
- Composite widgets without roving tabindex

### ARIA
- ARIA roles on wrong elements
- Missing accessible names on interactive elements
- `aria-hidden="true"` on focusable elements without `tabindex="-1"`
- Missing `aria-expanded` on toggles
- Missing `aria-current` in navigation
- Live regions appended dynamically instead of present at load

### Forms
- Inputs without associated labels
- Placeholder used as only label
- Missing `aria-required` on required fields
- No `aria-invalid` or `aria-describedby` for errors
- Form errors not announced via live region

### Images & Media
- Images missing alt text
- Decorative images with non-empty alt
- SVGs without role="img" and aria-label
- Video with autoplay
- Missing captions/transcripts

### Contrast & Color
- Text colors that likely fail 4.5:1 ratio
- Color used as sole indicator (errors, status, required)
- Low contrast on interactive element borders

### Motion
- Animations without `prefers-reduced-motion` support
- Auto-playing content without pause controls
- Flashing content

### Responsive
- Fixed widths that prevent reflow
- Missing viewport meta tag
- Content that would require horizontal scroll at 320px

## Report Format

Produce a structured report:

**Critical (WCAG A violations)** — blocks access for some users
- [Issue] → [Fix] → [WCAG criterion]

**Serious (WCAG AA violations)** — significant barriers
- [Issue] → [Fix] → [WCAG criterion]

**Moderate (WCAG AAA / Best practices)** — quality improvements
- [Issue] → [Fix]

CRITICAL: This is an audit, not a fix. Document issues with clear explanations. Use `/a11y-fix` to implement fixes.
