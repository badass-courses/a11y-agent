# Semantic HTML Reference

## Element Selection Guide

### Interactive Elements
| Need | Use | NOT |
|------|-----|-----|
| Action/toggle | `<button>` | `<div onclick>`, `<a>` without href |
| Navigation | `<a href="...">` | `<div onclick>`, `<span onclick>` |
| Form input | `<input>`, `<select>`, `<textarea>` | `<div contenteditable>` |
| Submit form | `<button type="submit">` or `<input type="submit">` | `<div class="submit">` |

### Structural Elements
| Content | Use | Notes |
|---------|-----|-------|
| Page header | `<header>` | Top-level = banner landmark |
| Navigation | `<nav>` | Add aria-label if multiple navs |
| Main content | `<main>` | One per page, receives skip link target |
| Footer | `<footer>` | Top-level = contentinfo landmark |
| Sidebar | `<aside>` | Keep at top-level (sibling of main) |
| Content section | `<section>` | Must have accessible name (aria-label/aria-labelledby) to appear in landmark navigation |
| Standalone content | `<article>` | Self-contained, redistributable content |
| Paragraphs | `<p>` | Not `<div>` for text blocks |
| Lists | `<ul>`, `<ol>` | Screen readers announce count |
| Data | `<table>` with `<th scope>` | Not CSS Grid for tabular relationships |

### Heading Rules
- One `h1` per page — describes the primary content
- Never skip levels (h1 → h3 is wrong, h1 → h2 → h3 is right)
- Never choose heading level for text size — use CSS classes
- Heading structure should read like a document outline
- In component-based apps, pay attention to the composed heading hierarchy across components
- Use visually-hidden headings as a last resort when design lacks a visible heading for a section

### Form Markup
```html
<!-- Correct: label paired with input -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" aria-required="true">

<!-- Correct: fieldset for related controls -->
<fieldset>
  <legend>Shipping address</legend>
  <label for="street">Street</label>
  <input type="text" id="street" name="street">
  <!-- more fields -->
</fieldset>

<!-- Wrong: placeholder as only label -->
<input type="email" placeholder="Enter email">

<!-- Wrong: span pretending to be label -->
<span class="label">Email</span>
<input type="email">
```

### Image Patterns
```html
<!-- Informative image -->
<img src="tents.jpg" alt="A festival of tents at sunset">

<!-- Decorative image (screen reader skips it) -->
<img src="divider.png" alt="">

<!-- Image in a link (alt describes action) -->
<a href="/"><img src="logo.png" alt="CampSpots home"></a>

<!-- SVG with accessibility -->
<svg role="img" aria-label="Search"><use href="#icon-search"/></svg>

<!-- Figure with caption -->
<figure>
  <img src="chart.png" alt="Sales increased 40% in Q3">
  <figcaption>Q3 2024 sales performance</figcaption>
</figure>
```

### Common Anti-Patterns Found in the Wild
- `* { outline: none; }` — kills all focus indicators
- `<div class="button" onclick="...">` — not focusable, no role
- `<a onclick="..." href="#">` — click handler on fake link
- `<h6>Message</h6>` used as a form label — wrong element, skipped heading levels
- Mega menus with `display: flex` when closed — items still in tab order
- Form with only placeholder text — no persistent label
- Missing `<html lang="en">` — screen readers can't determine language
- Missing viewport meta tag — breaks zoom/responsive
- CSS Grid/Flexbox ≠ semantic structure — a calendar grid of `<div>` buttons should be a `<table>` with `<th scope="col">` for proper row/column relationships in screen readers
- `<ul>` without bullet styles: VoiceOver in Safari strips `role="list"` semantics. Add explicit `role="list"` as a workaround even though it seems redundant — prefer working screen reader output over passing lint rules
