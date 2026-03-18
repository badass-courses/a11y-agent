# Accessibility Testing Checklist

## Manual Testing Workflow (in order)

### 1. Identify User Flow
What flow are you testing? Which pages? What are the critical components?

### 2. Keyboard Testing
- Tab through each page in the flow
- Every mouse-operable control must also be keyboard focusable and operable
- Visible focus indicators must be present at all times
- Check for focus traps (can't Tab out) and ghost controls (focusable but invisible)
- Screenshot tab order using Accessibility Insights Tab Stops tool

### 3. Heading & Landmark Structure
- Check heading outline with Web Developer Toolbar > View Document Outline
- One h1 per page, no skipped levels
- All content wrapped in landmark elements
- Visualize with Accessibility Insights Headings and Landmarks tools

### 4. Automated Scan
- Run axe DevTools on every page in the flow
- Scan with menus/modals open (axe only tests rendered content)
- Note critical and serious violations with links to WCAG criteria
- Remember: automated tools catch only 30-50% of issues

### 5. Color Contrast
- Use Colour Contrast Analyser (CCA) for suspect combinations
- Regular text (< 24px): minimum 4.5:1
- Large text (≥ 24px): minimum 3:1
- Non-text elements (buttons, icons, borders): minimum 3:1
- Check both light and dark themes

### 6. Zoom & Reflow
- Zoom to 200% minimum (up to 500%)
- Check responsive breakpoints with DevTools device emulator
- No horizontal scrolling at 320px CSS width
- Content must reflow into single column
- Test on actual mobile devices if possible

### 7. Screen Reader Testing
- VoiceOver + Safari (Mac) for development
- NVDA + Chrome (Windows) for production verification
- Check: headings announced properly, landmarks navigable, forms labeled, dynamic content announced
- Remember: NVDA has Browse mode (Arrow keys = headings) and Focus mode (Arrow keys = interact). Insert+Space toggles.

### 8. Windows High Contrast Mode
- Enable: Settings → Accessibility → Contrast themes
- Check: custom focus rings still visible, CSS backgrounds don't disappear, icons remain distinguishable
- Use `forced-colors` media query to provide alternatives:

```css
@media (forced-colors: active) {
  .custom-focus { outline: 2px solid CanvasText; }
  .icon-button { border: 1px solid ButtonText; }
}
```

## Pre-Automation with Storybook

Storybook renders components in isolation — useful for keyboard and screen reader spot-checks before writing automated tests.

- Install the Storybook a11y addon (powered by axe-core) for automatic per-story checks
- Use full-screen canvas mode (`/iframe.html`) for reliable screen reader testing outside Storybook's wrapping iframe
- The a11y addon may report zero violations while a component is keyboard-inoperable (e.g., div instead of button). Always test beyond what the addon reports.
- Treat Storybook as a pre-automation step: identify issues visually, then codify as Jest/Cypress tests

## Accessibility Tree Snapshot Testing

Use Puppeteer to capture the Accessibility Tree as JSON for regression testing:

```javascript
const snapshot = await page.accessibility.snapshot({ interestingOnly: false });
expect(snapshot).toMatchSnapshot();
```

- Scope snapshots to specific subtrees (e.g., header only) to reduce brittleness — full-page snapshots break on any content change
- Not a replacement for actual screen reader testing — it's an approximation
- Use `interestingOnly: false` for detailed output including generic nodes

## Automated Testing Integration

### Linting (Write-time)
```
axe-linter for VS Code — catches issues as you code
```

### Unit Tests (Jest + Testing Library)
```javascript
// Test keyboard reachability
it('button is reachable by keyboard', async () => {
  render(<MyButton name="Submit" />);
  const user = userEvent.setup();
  const button = screen.getByRole('button');
  await user.tab();
  expect(button).toHaveFocus();
});

// Test keyboard operability
it('button is operable with Enter', async () => {
  const onClick = jest.fn();
  render(<MyButton onClick={onClick} />);
  const button = screen.getByRole('button');
  button.focus();
  await userEvent.keyboard('[Enter]');
  expect(onClick).toHaveBeenCalled();
});

// Test accessible name
it('button has accessible label', () => {
  render(<IconButton name="Search" />);
  expect(screen.getByLabelText('Search')).toBeInTheDocument();
});
```

### Component Tests (Cypress Component Testing)
```javascript
// cypress-real-events for real Tab key behavior
import 'cypress-real-events';

it('meganav opens with keyboard', () => {
  mount(<MegaNav />);
  cy.get('[data-testid="menu-btn"]').focus().click();
  cy.focused().should('have.attr', 'aria-expanded', 'true');
});
```

### Integration Tests (Cypress + cypress-axe)
```javascript
beforeEach(() => {
  cy.visit('/');
  cy.injectAxe();
});

it('has no accessibility violations', () => {
  cy.checkA11y();
});

// Test specific rules
it('passes color contrast', () => {
  cy.checkA11y(null, {
    runOnly: { type: 'rule', values: ['color-contrast'] }
  });
});
```

### CI (GitHub Actions)
Run all test suites on push. Configure Cypress with `cypress run` (headless). Disable screenshots for CI.

## Tools to Install
- **axe DevTools** — Chrome/Firefox extension for page scanning
- **Accessibility Insights** — Chrome extension for tab stops, headings, landmarks visualization + guided assessment
- **Web Developer Toolbar** — Chrome/Firefox for document outline
- **Colour Contrast Analyser** — Desktop app (Mac/Windows) for sampling colors anywhere
- **axe-linter** — VS Code extension for inline a11y linting
- **NVDA** — Free Windows screen reader (essential for testing)
