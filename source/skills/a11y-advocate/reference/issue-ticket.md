# Accessibility Issue Ticket Template

> Fill in all `[PLACEHOLDER]` values. Remove sections that don't apply.

---

## [COMPONENT NAME] — [ISSUE SUMMARY]

> Title format: `[Component] — [Issue]`
> Example: `Checkout Form — Error messages not associated with inputs`

**Labels:** `accessibility` `[wcag-level-a|wcag-level-aa|wcag-level-aaa]` `[priority]`

---

### Summary

[One sentence describing what's broken and why it matters to affected users.]

---

### Expected Behavior

[Describe what a correctly implemented, accessible experience looks like. Be specific — reference WCAG success criteria or ARIA authoring practices if relevant.]

---

### Actual Behavior

[Describe what currently happens. Be precise: what does the screen reader announce? What happens with keyboard only? What does the axe DevTools error say?]

---

### User Impact

| Field | Value |
|-------|-------|
| Who is affected | [keyboard users / screen reader users / low vision / cognitive / all] |
| Severity | [Blocked — cannot complete task \| Degraded — significant friction \| Minor — cosmetic] |
| Estimated affected users | [% or description, e.g., "all keyboard-only users", "~15% of users who rely on error messages"] |
| Business impact | [e.g., "blocks checkout completion", "prevents form submission", "causes confusion in navigation"] |

---

### WCAG Reference

| Field | Value |
|-------|-------|
| Success Criterion | [e.g., 1.3.1 Info and Relationships] |
| Level | [A / AA / AAA] |
| Understanding doc | [URL to WCAG understanding page, e.g., https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships] |

---

### Steps to Reproduce

1. [Navigate to / open / focus on...]
2. [Do X...]
3. [Observe Y...]

**Test environment:**
- Browser: [e.g., Chrome 122, Firefox 123]
- OS: [e.g., macOS 14, Windows 11]
- Assistive technology: [e.g., NVDA 2024.1 + Chrome, VoiceOver + Safari, keyboard only]

---

### Suggested Fix

[Describe the technical fix. Include code snippets if helpful. Reference the a11y-agent skill or ARIA Authoring Practices Guide for patterns.]

```html
<!-- Before -->
[BROKEN CODE]

<!-- After -->
[FIXED CODE]
```

If no fix is known, write: "Fix approach TBD — assign to [TEAM/PERSON] for investigation."

---

### Effort Estimate

| Field | Value |
|-------|-------|
| Size | [S: <1hr / M: ~1 day / L: 1 sprint / XL: multiple sprints] |
| Requires design | [Yes / No] |
| Requires QA | [Yes / No] |
| Dependencies | [List any blockers, e.g., "requires design system update", "blocked by third-party library"] |

---

### Screenshots / Recordings

> Attach screenshots, screen recordings, or axe DevTools exports here.

- [ ] Screenshot of the issue
- [ ] axe DevTools report (if automated)
- [ ] Screen recording with assistive technology (if available)

---

### Acceptance Criteria

- [ ] [Specific, testable criterion 1 — e.g., "Error message is programmatically associated with the input via aria-describedby"]
- [ ] [Specific, testable criterion 2]
- [ ] Passes axe DevTools scan with no new violations
- [ ] Tested with keyboard only
- [ ] Tested with [screen reader + browser combo]

---

> **Note for Claude:** When generating a ticket for a user, ask for the component, the issue description, and who is affected. Generate the WCAG reference from the issue description — don't ask the user to look it up. Effort estimates should be honest; don't undersell complex fixes to make them easier to approve.
