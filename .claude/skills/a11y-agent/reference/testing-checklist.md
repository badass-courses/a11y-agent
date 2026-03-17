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
