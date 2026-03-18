# Jest + Testing Library Patterns

Unit-level a11y tests. Each pattern tests one contract. Tests should fail if you break the behavior.

Setup assumed: `@testing-library/react`, `@testing-library/user-event` v14+, `@testing-library/jest-dom`.

```js
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
```

---

## Keyboard Reachability

Is the element reachable by Tab?

```js
it('button is reachable by keyboard', async () => {
  const user = userEvent.setup()
  render(<SubmitButton />)

  await user.tab()

  expect(screen.getByRole('button', { name: /submit/i })).toHaveFocus()
})
```

Fails if: element is a `<div>` without `tabindex`, or `tabindex="-1"` is set.

---

## Keyboard Operability — Enter Key

Does Enter activate the action?

```js
it('button activates on Enter', async () => {
  const user = userEvent.setup()
  const handleClick = jest.fn()
  render(<button onClick={handleClick}>Save</button>)

  screen.getByRole('button', { name: /save/i }).focus()
  await user.keyboard('[Enter]')

  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

Fails if: element is a `<div>` with `onClick` but no keyboard handler.

---

## Keyboard Operability — Space Key

Space must activate buttons (not links).

```js
it('button activates on Space', async () => {
  const user = userEvent.setup()
  const handleClick = jest.fn()
  render(<button onClick={handleClick}>Toggle</button>)

  screen.getByRole('button', { name: /toggle/i }).focus()
  await user.keyboard('[Space]')

  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

---

## div vs button Regression Test

Proves why `<button>` beats `<div role="button">`. Both pass `getByRole` — only `<button>` passes all three.

```js
describe('interactive control must be a native button', () => {
  it('is reachable by Tab', async () => {
    const user = userEvent.setup()
    render(<ActionControl />)
    await user.tab()
    expect(screen.getByRole('button', { name: /action/i })).toHaveFocus()
  })

  it('activates on Enter', async () => {
    const user = userEvent.setup()
    const onActivate = jest.fn()
    render(<ActionControl onActivate={onActivate} />)
    screen.getByRole('button', { name: /action/i }).focus()
    await user.keyboard('[Enter]')
    expect(onActivate).toHaveBeenCalled()
  })

  it('activates on Space', async () => {
    const user = userEvent.setup()
    const onActivate = jest.fn()
    render(<ActionControl onActivate={onActivate} />)
    screen.getByRole('button', { name: /action/i }).focus()
    await user.keyboard('[Space]')
    expect(onActivate).toHaveBeenCalled()
  })
})
```

---

## Accessible Name via getByRole

`getByRole` with `name` option tests that assistive technology can identify the element by its label.

```js
it('icon button has an accessible name', () => {
  render(<CloseButton />)
  // Fails if aria-label or visually-hidden text is missing
  expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
})

it('input is findable by its label text', () => {
  render(<EmailField />)
  // Fails if <label> is missing or not associated via for/id
  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
})

it('image has meaningful alt text', () => {
  render(<Avatar src="/photo.jpg" name="Ada Lovelace" />)
  // Fails if alt is missing or empty on an informative image
  expect(screen.getByAltText(/ada lovelace/i)).toBeInTheDocument()
})
```

---

## ARIA State — aria-expanded

Does the toggle update `aria-expanded` when open/closed?

```js
it('disclosure button reflects open/closed state', async () => {
  const user = userEvent.setup()
  render(<Accordion title="Details">Content</Accordion>)

  const trigger = screen.getByRole('button', { name: /details/i })
  expect(trigger).toHaveAttribute('aria-expanded', 'false')

  await user.click(trigger)
  expect(trigger).toHaveAttribute('aria-expanded', 'true')

  await user.click(trigger)
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
})
```

---

## ARIA State — aria-pressed

Toggle buttons must communicate pressed state.

```js
it('mute button reflects pressed state', async () => {
  const user = userEvent.setup()
  render(<MuteButton />)

  const btn = screen.getByRole('button', { name: /mute/i })
  expect(btn).toHaveAttribute('aria-pressed', 'false')

  await user.click(btn)
  expect(btn).toHaveAttribute('aria-pressed', 'true')
})
```

---

## ARIA State — aria-invalid

Form field must communicate invalid state after failed validation.

```js
it('email field becomes invalid after empty submit', async () => {
  const user = userEvent.setup()
  render(<ContactForm />)

  await user.click(screen.getByRole('button', { name: /send/i }))

  const emailInput = screen.getByLabelText(/email/i)
  expect(emailInput).toHaveAttribute('aria-invalid', 'true')
  // Error message must be present too
  expect(screen.getByRole('alert')).toHaveTextContent(/required/i)
})
```

---

## Form Field Labels

Every input must have an associated visible label.

```js
it('all form inputs have associated labels', () => {
  render(<SignupForm />)

  // These queries fail if label association is missing
  expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
})

it('placeholder is not the only label', () => {
  render(<SearchField />)
  const input = screen.getByRole('searchbox')
  // If label exists only as placeholder, getByLabelText fails
  expect(screen.getByLabelText(/search/i)).toBe(input)
})
```

---

## Radio Group as Single Tab Stop

A radio group must behave as one tab stop. First Tab lands on the checked (or first) option; Arrow keys move within the group.

```js
it('radio group is a single tab stop', async () => {
  const user = userEvent.setup()
  render(
    <fieldset>
      <legend>Notification preference</legend>
      <label><input type="radio" name="notify" value="email" /> Email</label>
      <label><input type="radio" name="notify" value="sms" /> SMS</label>
      <label><input type="radio" name="notify" value="none" defaultChecked /> None</label>
    </fieldset>
  )

  await user.tab()
  // Focus should land on the checked radio, not Tab through all three
  expect(screen.getByDisplayValue('none')).toHaveFocus()

  await user.keyboard('[ArrowUp]')
  expect(screen.getByDisplayValue('sms')).toHaveFocus()
})
```

---

## Form Validation — Error Announced via Live Region

The live region element must exist before content is injected (not appended dynamically).

```js
it('form error is announced via alert role', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)

  // Submit without filling in fields
  await user.click(screen.getByRole('button', { name: /log in/i }))

  // role="alert" must already be in the DOM at render time
  const alert = screen.getByRole('alert')
  expect(alert).toHaveTextContent(/please enter your email/i)
})
```
