---
name: a11y-agent
description: Accessibility expertise for building inclusive web interfaces. Covers semantic HTML, ARIA, keyboard interaction, screen reader support, color contrast, focus management, responsive zoom, motion safety, automated testing, and organizational culture. Use when building or reviewing any web UI to ensure it works for everyone.
---

This skill encodes deep accessibility knowledge for building web interfaces that work for everyone — keyboard users, screen reader users, people with low vision, cognitive disabilities, motor impairments, and more.

Your agent makes beautiful UIs. This skill makes them usable by everyone.

## Core Principles

Accessibility is a civil right, not a feature. Inaccessibility is discrimination in practice, whether intentional or not. When your application doesn't support keyboards or screen readers, someone with a disability is excluded.

You can't shove chocolate chips into an already baked muffin. Accessibility belongs in design, architecture, and development from the start — not bolted on after.

WCAG 2.2 Level AA is the minimum target. Aim higher when you can.

## The POUR Framework (WCAG Categories)

All accessibility work maps to four principles:

- **Perceivable** — Can users perceive the content? (text alternatives, contrast, adaptable layout)
- **Operable** — Can users operate the interface? (keyboard, timing, seizure safety, navigation)
- **Understandable** — Can users understand content and UI? (readable, predictable, input assistance)
- **Robust** — Does it work with assistive tech? (parsing, name/role/value, status messages)

## Semantic HTML First — Always

The first rule of ARIA is: don't use ARIA. Use native HTML elements that already include the semantics and behavior you need.

**Heading structure matters.** Use a single `h1` per page. Don't skip levels. Headings create a navigable outline for screen readers. Never choose heading levels for text size — that's CSS's job.

**Landmark elements create navigation signposts.** Wrap all page content in landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>` (with aria-label), `<article>`, `<aside>`. Screen reader users jump between landmarks to navigate.

**Use semantic elements for their behavior, not their appearance:**
- `<button>` for actions (not `<div onclick>`)
- `<a href>` for navigation (href is required)
- `<label>` paired with form inputs via `for`/`id`
- `<ul>`/`<ol>` for lists (screen readers announce count)
- `<table>` for tabular data (provides row/column relationships)
- `<figure>`/`<figcaption>` for images with captions

**Buttons vs. Links:** If it navigates → `<a>`. If it performs an action → `<button>`. Never use `<a>` without `href`. Never use `<div>` for either.

→ *Consult reference/semantic-html.md for complete element guidance and common anti-patterns.*

## Keyboard Accessibility

Anything a mouse user can do, a keyboard user must also be able to do.

**Test by hitting Tab.** Every interactive element must be reachable and operable. Watch for: invisible focus (outline removed), unreachable controls (divs instead of buttons), trapped focus, hidden content still in tab order.

**Essential keyboard patterns:**
- `Tab` / `Shift+Tab` — move between interactive elements
- `Enter` / `Space` — activate buttons and links
- `Arrow keys` — navigate within composite widgets (tabs, menus, date pickers)
- `Escape` — close modals, menus, popups

**Focus indicators must be visible.** Never use `* { outline: none; }`. Use `:focus-visible` for keyboard-only outlines. WCAG 2.4.7 requires visible focus indicators.

**Skip links** are required (WCAG 2.4.1). Add "Skip to main content" as the first focusable element, pointing to `<main id="main">`.

→ *Consult reference/keyboard-patterns.md for roving tabindex, focus traps, and composite widget patterns.*

## ARIA — When Native HTML Isn't Enough

ARIA provides roles, states, and properties that communicate accessibility information to assistive technology. Use it only when semantic HTML alone can't express the interaction.

**Accessible names** — Every interactive element needs a name. Priority order: `aria-labelledby` > `aria-label` > `<label>` > text content > `title`. Never rely solely on `placeholder` for input labeling.

**Key ARIA attributes:**
- `aria-expanded` — toggles (menus, accordions)
- `aria-pressed` — toggle buttons
- `aria-selected` — tabs, gridcells
- `aria-current="page"` — current page in navigation
- `aria-hidden="true"` — hide from screen readers (pair with `tabindex="-1"` on interactive elements)
- `aria-live="polite"` / `role="alert"` — dynamic announcements
- `aria-invalid="true"` — form validation errors
- `aria-required="true"` — required form fields
- `aria-haspopup` — indicates a popup menu
- `aria-describedby` — supplemental descriptions

**ARIA live regions** for dynamic content: The element with `aria-live` or `role="alert"` MUST exist in the DOM at page load. Inject text content into it — don't append the live region element itself.

→ *Consult reference/aria-patterns.md for modal dialogs, menus, date pickers, and widget patterns.*

## Color & Contrast

**Text contrast minimum (WCAG 1.4.3 AA):**
- Regular text (< 24px): 4.5:1 ratio
- Large text (≥ 24px or ≥ 18.66px bold): 3:1 ratio

**Non-text contrast (WCAG 1.4.11 AA):**
- UI components and graphical objects: 3:1 ratio against adjacent colors

Don't rely on color alone to convey information. Use text labels, patterns, or icons alongside color.

**Tools:** Colour Contrast Analyser (CCA desktop app), Chrome DevTools color picker, WebAIM Contrast Checker.

## Images & Text Alternatives

Every purposeful image needs meaningful `alt` text. Use the W3C alt decision tree:
- **Decorative images:** `alt=""` (empty string, not missing)
- **Informative images:** Describe what the image conveys
- **Functional images (in links/buttons):** Describe the action
- **Complex images:** Brief alt + longer description via `aria-describedby` or adjacent text

SVG accessibility: Add `role="img"` and `aria-label` or use `<title>` inside the SVG.

## Forms

- Every input MUST have a visible `<label>` paired via `for`/`id`
- Placeholders are NOT labels — they disappear on input
- Group related controls with `<fieldset>` and `<legend>`
- Error messages must be programmatically associated (via `aria-describedby` or `aria-invalid`)
- Use `aria-required="true"` for required fields
- Focus the first invalid field on failed submission
- Use ARIA live regions for form-level error summaries

→ *Consult reference/forms-validation.md for complete form patterns.*

## Focus Management

- **Modals:** Send focus into the dialog on open. Trap focus inside (or use `inert` on background). Return focus to trigger on close.
- **Client-side routing:** Manage focus and page title on route change. Announce the new page.
- **Dynamic content:** When content appears (menus, toasts), manage where focus goes.
- **Roving tabindex:** For composite widgets (date pickers, tab lists), make the group a single tab stop. Use arrow keys internally. Set `tabindex="0"` on the active item, `tabindex="-1"` on all others.

→ *Consult reference/focus-management.md for implementation patterns.*

## Responsive Design & Zoom

Content must reflow at 200%+ zoom (WCAG 1.4.10 Reflow). Test with:
- Browser zoom (Cmd/Ctrl +) to 200% minimum
- Chrome DevTools device emulator
- Real devices when possible

Always include the viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`

Use CSS media queries for reflow. Avoid horizontal scrolling. Touch targets: minimum 24×24px (WCAG 2.5.8 AA).

## Motion & Animation Safety

- Never autoplay video/animation by default
- Respect `prefers-reduced-motion` in CSS and JS
- No content flashing more than 3 times per second (WCAG 2.3.1)
- Provide pause/stop/hide controls for any moving content (WCAG 2.2.2)
- Make motion opt-in, not opt-out

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## CSS Visibility & Screen Readers

Different hiding techniques have different accessibility implications:
- `display: none` — hidden from everyone (no tab, no screen reader)
- `visibility: hidden` — preserves space, hidden from screen readers and keyboard
- `opacity: 0` — invisible but still in tab order and accessible tree
- `.visually-hidden` class — not visible but readable by screen readers
- `aria-hidden="true"` — hidden from screen readers but still visible and focusable (add `tabindex="-1"` to interactive elements)

```css
.visually-hidden {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
```

## Automated Testing

Automated tools catch ~30-50% of accessibility issues. Always combine with manual testing.

**Linting:** axe-linter for VS Code catches issues at write-time.
**Browser extensions:** axe DevTools, Accessibility Insights, Web Developer Toolbar.
**Unit tests:** Jest + Testing Library — test keyboard reachability, operability, ARIA states.
**Integration tests:** Cypress + cypress-axe — page-level scans, user flow testing, focus management.
**CI:** Run automated a11y tests in GitHub Actions to prevent regressions.

Key Testing Library queries for accessibility: `getByRole`, `getByLabelText`, `getByAltText`.

→ *Consult reference/testing-checklist.md for the manual + automated testing workflow.*

## Anti-Patterns — DO NOT

- ❌ Remove all focus outlines (`* { outline: none }`)
- ❌ Use `<div>` or `<span>` for interactive controls
- ❌ Use `<a>` without `href`
- ❌ Use only placeholder text as form labels
- ❌ Skip heading levels or use headings for text sizing
- ❌ Use `aria-hidden="true"` on focusable elements without `tabindex="-1"`
- ❌ Autoplay video or animation
- ❌ Rely on color alone to convey meaning
- ❌ Use accessibility overlays — they don't fix problems and don't hold up legally
- ❌ Use `tabindex` > 0 (breaks natural tab order)
- ❌ Add `role="button"` to a `<div>` instead of using `<button>`
- ❌ Embed third-party content without checking its accessibility

## When Reviewing Code

For every component, ask:
1. Can I reach and operate every control with only the keyboard?
2. Does every interactive element have an accessible name?
3. Is there a logical heading structure?
4. Are dynamic state changes communicated to screen readers?
5. Is focus managed when content appears/disappears?
6. Does the color contrast meet AA minimums?
7. Does it reflow properly when zoomed to 200%?
8. Is motion respecting `prefers-reduced-motion`?

Remember: tools can't catch everything. Test with a keyboard. Test with a screen reader. Test with real users.

---
