# a11y-agent

Accessibility expertise for AI coding agents.

Your agent makes beautiful UIs. This makes them usable by everyone.

## Install

```bash
npx skills add badass-courses/a11y-agent
```

## What's Inside

**`a11y-agent`** — Core skill, loads automatically. Deep web accessibility knowledge for every code review and implementation. 6 reference files covering semantic HTML, keyboard patterns, ARIA, forms, focus management, and testing.

**`/a11y-audit [area]`** — Audit current component or page. Produces a prioritized report with WCAG references and fix suggestions.

**`/a11y-fix [area]`** — Fix accessibility issues in current code. Explains rationale, flags what to test manually.

Areas: `keyboard` `aria` `contrast` `forms` `structure` `motion` or `all`

## License

Apache-2.0

```

             o
            /|\         "You can't shove chocolate chips
            / \          into an already baked muffin."

         can they
        ┌─────────┐
        │ Tab?    │  keyboard
        │ See?    │  contrast, zoom
        │ Hear?   │  screen reader
        │ Pause?  │  motion safety
        └─────────┘

                        badass.dev
```
