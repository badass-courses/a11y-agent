# ARIA Patterns Reference

## Rules of ARIA (from W3C)
1. Don't use ARIA if native HTML provides the semantics
2. Don't change native semantics unless you really have to
3. All interactive ARIA controls must be keyboard operable
4. Don't use `role="presentation"` or `aria-hidden="true"` on focusable elements
5. All interactive elements must have an accessible name

## Modal Dialog

```html
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Selection</h2>
  <p>Are you sure you want to proceed?</p>
  <button>Confirm</button>
  <button aria-label="Close dialog">×</button>
</div>
```

**Requirements:**
- Send focus into the dialog on open (to heading or first focusable element)
- Background content must be inert (`inert` attribute or `aria-hidden="true"` + `tabindex="-1"` on header/main/footer)
- `Escape` closes dialog
- On close, return focus to the element that triggered it
- Optionally trap focus (Tab cycles within dialog)

```javascript
// Focus management for modal
function openDialog() {
  setIsOpen(true);
  // Use inert on background
  document.querySelector('header').setAttribute('inert', '');
  document.querySelector('main').setAttribute('inert', '');
  document.querySelector('footer').setAttribute('inert', '');
  // Focus the dialog
  dialogRef.current.focus();
}

function closeDialog() {
  setIsOpen(false);
  document.querySelector('header').removeAttribute('inert');
  document.querySelector('main').removeAttribute('inert');
  document.querySelector('footer').removeAttribute('inert');
  triggerRef.current.focus();
}
```

## Toggle Button

```html
<button aria-pressed="false" onclick="toggle()">
  Dark mode
</button>
```

State changes: `aria-pressed` flips between `"true"` and `"false"`.

## Expandable Section / Accordion

```html
<button aria-expanded="false" aria-controls="panel-1">
  Section Title
</button>
<div id="panel-1" role="region" hidden>
  Content here...
</div>
```

Toggle `aria-expanded` and `hidden` attribute together.

## Tab Interface

```html
<div role="tablist" aria-label="Settings">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">General</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" tabindex="-1">Privacy</button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  General content...
</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
  Privacy content...
</div>
```

Use roving tabindex on tabs. Arrow keys move between tabs.

## Live Regions

```html
<!-- Assertive (interrupts) -->
<div role="alert">Critical error: payment failed</div>

<!-- Polite (waits for pause) -->
<div role="status">Your changes have been saved</div>

<!-- Manual control -->
<div aria-live="polite" aria-atomic="true">
  <!-- inject text content here dynamically -->
</div>
```

**Critical rule:** The element with `role="alert"`, `role="status"`, or `aria-live` MUST be present in the DOM at page load. Then inject text content into it. If you append the live region element itself on demand, screen readers may miss it.

## Date Picker (Table-Based)

```html
<table aria-labelledby="month-heading">
  <thead>
    <tr>
      <th scope="col">
        <span aria-hidden="true">S</span>
        <span class="visually-hidden">Sunday</span>
      </th>
      <!-- repeat for each day -->
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <button
          aria-label="August 7"
          aria-pressed="false"
          tabindex="-1"
          data-date="2024-08-07"
        >7</button>
      </td>
      <!-- ... -->
    </tr>
  </tbody>
</table>
```

Use roving tabindex. Arrow keys navigate days (±1) and weeks (±7).

## Accessible Names Priority

The browser computes accessible names in this order:
1. `aria-labelledby` (references another element's text)
2. `aria-label` (explicit string)
3. Native label mechanism (`<label for>`, `<caption>`, `<legend>`, `<figcaption>`)
4. Text content of the element
5. `title` attribute (fallback, tooltip-only for mouse users)
6. `placeholder` (last resort, not recommended)

## aria-current for Navigation

```html
<nav>
  <a href="/" aria-current="page">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>
```

Set `aria-current="page"` on the link matching the current URL. Screen readers announce "current page".

## Common ARIA Mistakes

- Adding `role="button"` to a `<div>` instead of using `<button>` — you still need `tabindex="0"`, Enter/Space handling, and a click handler
- Using `aria-hidden="true"` on an element that contains focusable children — creates ghost controls
- Using `aria-label` on non-interactive `<div>` or `<span>` — most screen readers ignore it on generic elements
- Overusing live regions — too many announcements is worse than none
- Setting `aria-expanded` without actually hiding/showing content
