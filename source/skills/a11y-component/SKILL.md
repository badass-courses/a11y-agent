---
name: a11y-component
description: Scaffold accessible interactive components with correct ARIA, keyboard handling, and focus management. Supports modal, menu, tabs, accordion (v1), plus date picker, combobox, slideshow (v2). Use when building these from scratch.
user-invokable: true
args:
  - name: pattern
    description: "Component pattern: modal, menu, tabs, accordion"
---

Scaffold an accessible {{pattern}} component.

→ *Consult the a11y-agent skill for foundational accessibility patterns.*

## Process

1. Confirm which pattern the user wants
2. Ask: What framework? (React, Vue, vanilla JS, other)
3. Read the matching template from reference/
4. Ask context questions:
   - What triggers this component? (button, link, route change)
   - Does it need animation? (will add prefers-reduced-motion support)
   - Existing design system tokens/classes to use?
5. Adapt template to user's framework and design system
6. Include keyboard handling, ARIA states, focus management
7. Generate matching test file using a11y-test patterns

## Available Patterns

| Pattern | Template | Keyboard | Focus Management |
|---------|----------|----------|-----------------|
| Modal/Dialog | reference/modal.md | Escape to close, Tab trap | Into dialog on open, back to trigger on close |
| Menu/Dropdown | reference/menu-dropdown.md | Arrows between items, Escape | First item on open, trigger on close |
| Tabs | reference/tabs.md | Arrows between tabs | Roving tabindex within tab list |
| Accordion | reference/accordion.md | Enter/Space toggle | Stays on trigger |

Each template includes: HTML structure, ARIA attributes, keyboard spec, focus rules, gotchas.
