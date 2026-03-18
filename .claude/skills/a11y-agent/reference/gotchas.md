# Accessibility Gotchas — Common AI Agent Mistakes

## 1. Using `role="button"` on a `<div>` instead of `<button>`

**Wrong:**
```html
<div role="button" class="btn-primary" onclick="submitForm()">
  Submit
</div>
```

**Right:**
```html
<button type="button" class="btn-primary" onclick="submitForm()">
  Submit
</button>
```

**Why:** `<button>` is focusable by default, fires on both Enter and Space, and communicates the button role to assistive technology — all for free. A `<div role="button">` requires you to manually add `tabindex="0"`, keyboard event handlers, and still won't behave identically across all AT. Use the native element.

---

## 2. Adding ARIA where native HTML suffices

**Wrong:**
```html
<div role="navigation" aria-label="Main">
  <div role="list">
    <div role="listitem"><a href="/about">About</a></div>
    <div role="listitem"><a href="/work">Work</a></div>
  </div>
</div>
```

**Right:**
```html
<nav aria-label="Main">
  <ul>
    <li><a href="/about">About</a></li>
    <li><a href="/work">Work</a></li>
  </ul>
</nav>
```

**Why:** Native HTML elements carry implicit ARIA roles, states, and properties built into the browser's accessibility tree. Replicating them with `role` attributes on `<div>`s is fragile, verbose, and prone to partial implementation. Prefer semantic elements; reach for ARIA only when native HTML has no equivalent.

---

## 3. Using `opacity: 0` to hide content

**Wrong:**
```css
.tooltip {
  opacity: 0;
  transition: opacity 0.2s;
}
.tooltip.visible {
  opacity: 1;
}
```

**Right:**
```css
.tooltip {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}
.tooltip.visible {
  opacity: 1;
  pointer-events: auto;
}
```
```html
<!-- Or, control visibility semantically: -->
<div role="tooltip" id="tip" hidden>Saves your draft automatically</div>
<!-- Toggle with element.hidden = false when shown -->
```

**Why:** `opacity: 0` removes visual presence but leaves the element fully in the tab order and accessibility tree. Screen reader users and keyboard users will encounter invisible, confusing content. Use `display: none`, `visibility: hidden`, or the `hidden` attribute to remove content from both rendering and the accessibility tree when it is not meant to be perceivable.

---

## 4. Forgetting focus return on close

**Wrong:**
```js
function closeModal() {
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  // focus goes to <body> — user is lost
}
```

**Right:**
```js
let triggerElement;

function openModal(trigger) {
  triggerElement = trigger;
  modal.hidden = false;
  modal.removeAttribute('aria-hidden');
  firstFocusableInModal.focus();
}

function closeModal() {
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  triggerElement?.focus();
}
```

**Why:** When a modal, dropdown, or drawer closes, keyboard and AT users lose their position in the page unless focus is explicitly returned to the element that opened it. Without this, focus typically lands on `<body>` or an unpredictable element, forcing the user to re-navigate from the top.

---

## 5. Missing Escape key support

**Wrong:**
```js
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) closeDialog();
});
```

**Right:**
```js
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) closeDialog();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && dialog.open) {
    closeDialog();
  }
});
```

**Why:** Every overlay — modals, drawers, dropdowns, tooltips, combobox popups — must close on Escape. This is a universal keyboard convention users rely on to quickly dismiss UI without hunting for a close button. The native `<dialog>` element handles this automatically; custom implementations must not omit it.

---

## 6. Not using `inert` on modal backgrounds

**Wrong:**
```js
function openModal() {
  modal.removeAttribute('aria-hidden');
  // Manually walk the DOM to set aria-hidden + tabindex="-1" on everything else
  document.querySelectorAll('body > *:not(#modal)').forEach(el => {
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('tabindex', '-1');
  });
}
```

**Right:**
```js
function openModal() {
  modal.removeAttribute('aria-hidden');
  document.querySelectorAll('body > *:not(#modal)').forEach(el => {
    el.inert = true;
  });
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  document.querySelectorAll('body > *:not(#modal)').forEach(el => {
    el.inert = false;
  });
}
```

**Why:** The `inert` attribute removes all interactivity and AT visibility from a subtree in one declaration — no need to track and restore individual `tabindex` and `aria-hidden` values. Manual approaches are error-prone; nested interactive elements, iframes, and shadow DOM are easy to miss, leaving escape routes for keyboard and screen reader users.

---

## 7. `aria-label` on non-interactive elements

**Wrong:**
```html
<div class="card" aria-label="Product card for Wireless Headphones">
  <img src="headphones.jpg" alt="Wireless Headphones" />
  <h3>Wireless Headphones</h3>
  <p>$79.99</p>
</div>
```

**Right:**
```html
<article class="card">
  <img src="headphones.jpg" alt="Wireless Headphones" />
  <h3>Wireless Headphones</h3>
  <p>$79.99</p>
</article>
<!-- If the card itself must be interactive: -->
<article class="card">
  <img src="headphones.jpg" alt="" />
  <h3><a href="/products/headphones">Wireless Headphones</a></h3>
  <p>$79.99</p>
</article>
```

**Why:** `aria-label` is only reliably announced by screen readers on elements with an interactive or landmark role. On plain `<div>` or `<span>` elements with no role, the label is silently ignored. Use semantic elements, meaningful heading structure, and well-labeled links or buttons instead.

---

## 8. Appending live region elements dynamically

**Wrong:**
```js
function showToast(message) {
  // Creating the live region at announcement time — too late
  const region = document.createElement('div');
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  region.textContent = message;
  document.body.appendChild(region);
}
```

**Right:**
```html
<!-- In the initial HTML — present at page load -->
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only" id="toast-region"></div>
```
```js
function showToast(message) {
  // Inject content into the pre-existing live region
  const region = document.getElementById('toast-region');
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}
```

**Why:** Screen readers register `aria-live` regions when they first encounter them in the DOM. An element created dynamically at the moment of announcement is often added too late for the AT to observe the content change. The live region must exist in the DOM at page load; only its text content should change at announcement time.

---

## 9. `aria-expanded` without actually hiding content

**Wrong:**
```html
<button aria-expanded="false" aria-controls="submenu">
  Products
</button>
<ul id="submenu" class="submenu">
  <!-- Items visible in DOM but "hidden" via CSS transform/height -->
  <li><a href="/products/all">All Products</a></li>
</ul>
```

**Right:**
```html
<button aria-expanded="false" aria-controls="submenu">
  Products
</button>
<ul id="submenu" class="submenu" hidden>
  <li><a href="/products/all">All Products</a></li>
</ul>
```
```js
button.addEventListener('click', () => {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  submenu.hidden = expanded;
});
```

**Why:** `aria-expanded="false"` signals to screen readers that the controlled content is collapsed and unavailable. If the content is actually present in the accessibility tree (only visually hidden via transforms or height), screen readers will contradict themselves — announcing "collapsed" while still reading out the items. The controlled element's DOM visibility must match the `aria-expanded` state.

---

## 10. Placeholder as the only form label

**Wrong:**
```html
<input
  type="email"
  placeholder="you@example.com"
  name="email"
/>
```

**Right:**
```html
<label for="email">Email address</label>
<input
  type="email"
  id="email"
  name="email"
  placeholder="you@example.com"
  autocomplete="email"
/>
```

**Why:** Placeholder text disappears the moment a user begins typing, making it useless as a persistent label — especially for users with memory or cognitive differences. Screen reader support for placeholder as an accessible name is inconsistent across AT and browser combinations. Every input must have a visible, persistent `<label>` element associated via `for`/`id`.

---

## 11. Missing `lang` attribute

**Wrong:**
```html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
  </head>
```

**Right:**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>My App</title>
  </head>
```
```html
<!-- Mixed-language content: -->
<p>Press <span lang="fr">Démarrer</span> to begin.</p>
```

**Why:** Without a `lang` attribute, screen readers fall back to the user's default language profile, which may produce incorrect pronunciation, wrong voice selection, and garbled text-to-speech for every user whose default differs from the page language. The `lang` attribute is a single attribute with outsized impact across all AT users.

---

## 12. VoiceOver + SVG skips aria-labeled buttons during arrow navigation

**Wrong:**
```html
<button aria-label="Close dialog">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
</button>
```

**Right:**
```html
<button aria-label="Close dialog">
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
</button>
```

**Why:** VoiceOver on macOS/iOS has a known bug where buttons containing SVG elements can be skipped when navigating with arrow keys, even if they are reachable by Tab. Adding `role="img"` to the SVG and `focusable="false"` (to suppress IE/Edge legacy behavior) resolves the skip. This affects icon buttons throughout an application and is easy to miss in automated testing.

---

## 13. VoiceOver strips `role="list"` from unstyled `<ul>`

**Wrong:**
```css
.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
```
```html
<ul class="nav-list">
  <li><a href="/home">Home</a></li>
  <li><a href="/about">About</a></li>
</ul>
```

**Right:**
```html
<ul class="nav-list" role="list">
  <li><a href="/home">Home</a></li>
  <li><a href="/about">About</a></li>
</ul>
```

**Why:** Safari's VoiceOver removes the list semantics from `<ul>` and `<ol>` elements when `list-style: none` is applied, treating them as generic containers. This is intentional behavior to prevent decorative lists from polluting the AT output, but it breaks navigation lists and structured content. Adding `role="list"` explicitly restores the semantic without re-adding bullets.

---

## 14. `aria-roledescription` misuse

**Wrong:**
```html
<!-- On an element with no meaningful role -->
<div aria-roledescription="slide">
  <h2>Q1 Results</h2>
  <p>Revenue up 12% YoY</p>
</div>

<!-- Overly verbose description -->
<button aria-roledescription="Interactive clickable action trigger button">
  Save
</button>
```

**Right:**
```html
<!-- Applied to an element with a valid role -->
<section role="group" aria-roledescription="slide" aria-label="Slide 3 of 8: Q1 Results">
  <h2>Q1 Results</h2>
  <p>Revenue up 12% YoY</p>
</section>

<!-- Short, meaningful override only when the native role name is genuinely confusing -->
<div role="slider" aria-roledescription="rating" aria-valuenow="4" aria-valuemin="1" aria-valuemax="5">
```

**Why:** `aria-roledescription` overrides the role name announced by screen readers and should only be used on elements that already have a valid, meaningful ARIA or implicit role. Using it on a plain `<div>` with no role has no effect or produces unpredictable output. Descriptions must be concise (one or two words) — they replace "button" or "slider" in the announcement, not supplement it.

---

## 15. Dark mode contrast regressions

**Wrong:**
```css
.badge {
  background-color: #e8f4fd;
  color: #1a6fa8;
  border-radius: 4px;
  padding: 2px 8px;
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: #1a1a1a;
    color: #e5e5e5;
  }
  /* .badge never overridden — inherits dark body bg,
     but keeps light blue text: contrast ratio ~1.8:1 */
}
```

**Right:**
```css
.badge {
  background-color: #e8f4fd;
  color: #1a6fa8; /* 4.7:1 on light bg — passes AA */
  border-radius: 4px;
  padding: 2px 8px;
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: #1a1a1a;
    color: #e5e5e5;
  }
  .badge {
    background-color: #0d3a5c;
    color: #7ec8f0; /* 5.1:1 on dark badge bg — passes AA */
  }
}
```

**Why:** Components with hardcoded light-mode colors that are not overridden in dark mode frequently produce contrast ratios below the WCAG AA minimum of 4.5:1 for normal text. Automated contrast checks in CI typically run against a single color scheme. Audit every color pairing explicitly in both light and dark modes, and use design tokens or `color-scheme`-aware custom properties to keep pairings consistent.
