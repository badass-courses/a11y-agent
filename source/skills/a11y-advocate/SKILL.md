---
name: a11y-advocate
description: "Build accessibility culture and communicate with stakeholders. Generate statements, prioritize issues, write tickets, create team checklists, produce risk assessments. Use when asked to \"prioritize a11y\", \"accessibility statement\", \"convince PM about a11y\", or \"create testing process\"."
user-invokable: true
args:
  - name: action
    description: "Optional action: statement, prioritize, ticket, checklist, risk"
---

Build accessibility culture, communicate value to stakeholders, and produce the artifacts teams need to move forward. Run {{action}} if specified, otherwise ask what the user needs.

→ *Consult the a11y-agent skill for technical standards and patterns.*

## Actions

### statement — Accessibility Statement

Generate a public-facing accessibility statement using the W3C template.

Ask the user:
1. Organization name and website URL
2. Current conformance level (partial AA, full AA, etc.)
3. Known limitations (if any)
4. Preferred feedback contact method (email, form URL, phone)
5. Response timeframe commitment
6. How the site was assessed (self-evaluation, third-party audit, automated tools)
7. Assessment date

Fill the template at `reference/accessibility-statement.md`. Keep tone honest — overstating conformance creates legal exposure. Known limitations should be specific and paired with alternatives.

---

### prioritize — Issue Prioritization

Given a list of accessibility issues (from audit, backlog, or ad hoc), produce a prioritized remediation plan.

**Step 1 — Group by WCAG level:**
- **Level A** — Fundamental barriers (missing alt, keyboard traps, no labels). Must fix first.
- **Level AA** — Legal minimum in most jurisdictions. Fix next.
- **Level AAA** — Enhancements. Nice to have.

**Step 2 — T-shirt size effort:**
- S: < 1 hour, single file, no design needed
- M: 1 day, may need design review
- L: 1+ sprint, architecture or design change required
- XL: Multiple sprints, third-party dependency or full component rewrite

**Step 3 — User impact score:**
Who is blocked? How many users? Can they complete the task at all?
- 🔴 Blocked — user cannot complete the task
- 🟡 Degraded — user can complete it, but with significant friction
- 🟢 Minor — edge case or cosmetic

**Output format:**

```
Priority 1 — Quick wins (S/M effort, A or AA, 🔴 blocked)
Priority 2 — High impact (L effort, A or AA, 🔴/🟡)
Priority 3 — AA compliance (any effort, AA, 🟢)
Priority 4 — Enhancements (AAA, best practice)
```

List each issue with: WCAG criterion, level, effort, impact, and one-line fix summary.

---

### ticket — Write a Ticket

Produce a structured accessibility issue ticket ready to paste into GitHub, Linear, or Jira.

Ask the user:
1. What's the component or page?
2. What's the issue? (describe or paste raw audit finding)
3. Who is affected? (keyboard, screen reader, low vision, etc.)
4. Is there a suggested fix, or should Claude generate one?

Fill the template at `reference/issue-ticket.md`. Always include a WCAG reference. Effort estimates should reflect real implementation complexity — don't undersell or oversell.

---

### checklist — Manual Testing Checklist

Produce a non-developer-friendly 7-step manual testing checklist for QA, designers, or PMs who want to participate in accessibility testing.

**The 7 Steps:**

1. **Unplug the mouse** — Navigate the entire page using only Tab, Shift+Tab, Enter, Space, and arrow keys. Can you reach and use everything?

2. **Check focus visibility** — As you tab, is there always a visible highlight showing where you are? If focus ever disappears, that's a failure.

3. **Zoom to 200%** — In your browser (Cmd/Ctrl +), zoom to 200%. Does the page still work? Can you read everything without scrolling sideways?

4. **Check heading structure** — Install the Headings Map browser extension (or use axe DevTools). Is there one H1? Do headings flow logically without skipping levels?

5. **Run axe DevTools** — Install the free axe DevTools browser extension. Open it in DevTools and click "Scan". Review every issue flagged as Critical or Serious.

6. **Check color contrast** — Use the free Colour Contrast Analyser desktop app (or browser DevTools). Does body text hit 4.5:1? Large text and UI elements 3:1?

7. **Turn on a screen reader** — Mac: Cmd+F5 for VoiceOver. Windows: Ctrl+Win+Enter for Narrator. Navigate using headings (H key in VoiceOver) and landmarks (W key). Are page sections labeled? Are forms announced correctly?

Tailor the checklist for the user's stack if they provide it. Add component-specific steps when relevant (e.g., a date picker needs arrow key testing).

---

### risk — Risk Assessment

Produce a stakeholder-facing risk assessment document.

Ask the user:
1. What's the product? (name, type, audience)
2. What jurisdiction? (US, EU, UK, Canada, or global)
3. Do you have audit results or a list of known issues?
4. Is there any existing legal pressure (complaints, inquiries)?

Fill the template at `reference/risk-assessment.md`. Translate technical findings into business risk language. Do not exaggerate — but do not minimize legal exposure either.

---

## Persuasion Strategies

Different stakeholders respond to different framings. Use these strategies when helping the user make the case for accessibility investment.

### Lead with Quick Wins

Pick 3-5 issues that are S-effort, high-impact, and demonstrable. Fix those first. Visible progress builds momentum and earns trust for the larger work.

### Bring Solutions, Not Problems

Don't walk in with a list of failures. Walk in with: "Here's what's broken, here's the fix, here's how long it takes." Stakeholders disengage when presented with problems without paths forward.

### Adjust for Your Audience

| Audience | Framing that works |
|----------|-------------------|
| Legal / Compliance | ADA, Section 508, EN 301 549, EAA — litigation risk, DOJ settlements, consent decrees |
| Engineering | Tech debt, semantic correctness, test coverage, browser standards |
| Product / PM | User retention, task completion rates, SEO, expanded market reach |
| Design | Inclusive design principles, better UX for everyone, contrast as visual polish |
| Executive | Revenue opportunity (1 in 4 US adults has a disability), reputational risk, brand trust |

### Carrot vs. Stick

Lead with the carrot: expanded audience, better UX, SEO benefits, reduced support load. Keep the stick (legal risk) in reserve for when the carrot isn't moving people.

### Surface User Feedback

Real user stories cut through abstract arguments. If users with disabilities have submitted feedback or support tickets, surface them. Anonymize appropriately. One specific story outweighs a dozen statistics.

### Celebrate Wins

When issues get fixed, call it out. Tie it to metrics where possible (e.g., "We fixed keyboard navigation on checkout — 3 fewer support contacts this month"). Build a culture where accessibility work is visible and valued.

### Frame WCAG Correctly

WCAG is a floor, not a ceiling. Framing it as "we're compliant" can create complacency. Better frame: "We use WCAG AA as our minimum baseline, and we aim beyond it where it meaningfully helps users." Compliance is a byproduct of genuinely caring about users, not the goal itself.
