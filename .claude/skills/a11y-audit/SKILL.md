---
name: a11y-audit
description: "Structured accessibility assessment following a structured testing order. Asks targeted questions, walks through keyboard → tools → contrast → zoom → screen readers, produces prioritized report with WCAG references. Use when asked to \"check accessibility\", \"audit a11y\", \"test accessibility\", or before shipping UI."
user-invokable: true
args:
  - name: area
    description: "Optional focus area: keyboard, aria, contrast, forms, structure, motion, or all"
---

Audit the current file, component, or page for accessibility issues. Focus on {{area}} if specified, otherwise check everything.

→ *Consult the a11y-agent skill and its reference files for standards and patterns.*

## Context Gathering

Before starting a comprehensive audit, ask the user:
1. **What's the user flow?** — Which pages/routes are involved? What's the critical path?
2. **What's the tech stack?** — React/Vue/vanilla? Client-side routing? SSR/SSG?
3. **What's been tested before?** — Any prior audit results? Known issues?
4. **Screen reader availability?** — Mac (VoiceOver)? Windows (NVDA)?
5. **What's the target conformance level?** — AA (default) or AAA?

Store answers for the session. Reference throughout the audit.

If the user asks for a quick audit, skip context gathering and note assumptions in the report.

## Audit Process

Follow this order — each step builds on the previous:

### 1. Identify User Flow
What flow are you testing? Which pages? What are the critical components?

### 2. Keyboard Testing
Tab through each page. Every mouse-operable control must also be keyboard focusable and operable. Check for visible focus indicators, trapped focus, ghost tab stops (focusable but invisible elements).

### 3. Check Heading & Landmark Structure
Verify: one h1 per page, no skipped levels, all content in landmarks. Use the document outline as a proxy for screen reader navigation.

### 4. Automated Scan
Run axe-core (or suggest the user run axe DevTools). Scan with menus/modals open — axe only tests rendered content. Note: automated tools catch only 30-50% of issues.

### 5. Color Contrast
Check suspect combinations. Regular text < 24px needs 4.5:1. Large text ≥ 24px (or ≥ 19px bold) needs 3:1. Non-text elements (borders, icons) need 3:1. Text inside UI components still needs text-level ratios.

### 6. Zoom & Reflow
Zoom to 200% minimum. Check responsive breakpoints. No horizontal scrolling at 320px CSS width. Test on actual devices if possible.

### 7. Screen Reader Testing
Test with VoiceOver + Safari (Mac) and NVDA + Chrome (Windows) if available. Check: headings announced, landmarks navigable, forms labeled, dynamic content announced, focus management works.

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

## Storing Results

After producing the report, offer to save it to `a11y-audit-results/YYYY-MM-DD-<area>.md` in the project.
If previous results exist, note what improved and what regressed.
