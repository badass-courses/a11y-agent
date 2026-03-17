# Forms & Validation Reference

## Label Requirements

Every form control MUST have a persistent, visible label.

```html
<!-- Best: visible <label> with for/id pairing -->
<label for="name">Full name</label>
<input type="text" id="name" name="name">

<!-- Acceptable: wrapping label -->
<label>
  Full name
  <input type="text" name="name">
</label>

<!-- For icon-only buttons: aria-label -->
<button aria-label="Search">
  <svg role="img" aria-hidden="true">...</svg>
</button>

<!-- Last resort (no visible label possible): visually-hidden label -->
<label for="search" class="visually-hidden">Search</label>
<input type="search" id="search" placeholder="Search...">
```

**Clicking a label focuses its paired input** — this increases hit area and is a key usability benefit lost when using non-label elements.

## Placeholder Problems

- Disappears when user types — cognitive burden ("what was this field for?")
- Low contrast in most browsers
- Not reliably announced by all screen readers
- NEVER use as the only label

Acceptable use: show format hints alongside a visible label (e.g., placeholder="(555) 123-4567" with label "Phone number").

## Validation Pattern

### On Submit — Error Summary + Focus

```jsx
function handleSubmit(event) {
  event.preventDefault();

  const errors = validateForm(formState);

  if (errors.length > 0) {
    // 1. Set global error announcement via live region
    setErrorMessage(`Please fix ${errors.length} errors before submitting.`);

    // 2. Mark individual fields invalid
    setFieldErrors(errors);

    // 3. Focus first invalid field
    const firstErrorField = inputRefs.current[errors[0].fieldIndex];
    firstErrorField?.focus();
  }
}
```

### In the Markup

```html
<!-- Global error: live region (MUST exist at page load) -->
<p role="alert" aria-relevant="all" class="error">
  {errorMessage}
</p>

<!-- Individual field with error -->
<label for="email">Email <span aria-hidden="true">*</span></label>
<input
  type="email"
  id="email"
  aria-required="true"
  aria-invalid={hasError ? "true" : null}
  aria-describedby={hasError ? "email-error" : null}
>
<span id="email-error" class="field-error">
  {hasError ? "Please enter a valid email address" : ""}
</span>
```

### Key Points
- `aria-invalid="true"` — programmatically marks field as having an error
- `aria-describedby` — associates error message text with the input
- `aria-required="true"` — announces field is required
- Error text should be specific ("Please enter a valid email" not just "Invalid")
- Use `role="alert"` for form-level summaries, `aria-describedby` for per-field errors
- Style errors based on ARIA: `[aria-invalid="true"] { border-color: red; }`

## Radio Button Group

Radio buttons with the same `name` form a single tab stop. Arrow keys move between options.

```html
<fieldset>
  <legend>Donation amount</legend>
  <label><input type="radio" name="amount" value="10" checked> $10</label>
  <label><input type="radio" name="amount" value="25"> $25</label>
  <label><input type="radio" name="amount" value="50"> $50</label>
  <label><input type="radio" name="amount" value="custom"> Custom</label>
</fieldset>
```

## Checkbox

```html
<label>
  <input type="checkbox" name="terms" aria-required="true">
  I agree to the terms and conditions
</label>
```

## Form Structure

```html
<form action="/submit" method="post" novalidate>
  <!-- novalidate = we handle validation ourselves -->

  <fieldset>
    <legend>Personal Information</legend>
    <!-- related fields -->
  </fieldset>

  <fieldset>
    <legend>Payment Details</legend>
    <!-- related fields -->
  </fieldset>

  <button type="submit">Submit</button>
</form>
```
