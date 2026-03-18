# Accessibility Risk Assessment Template

> Fill in all `[PLACEHOLDER]` values. This document is intended for stakeholder communication — use plain language, not WCAG jargon.

---

# Accessibility Risk Assessment: [PRODUCT NAME]

**Prepared for:** [AUDIENCE — e.g., Product Leadership, Legal, Board]
**Prepared by:** [NAME / TEAM]
**Assessment date:** [DATE]
**Based on:** [AUDIT METHOD — e.g., automated scan, manual audit, third-party review]

---

## Executive Summary

[2-4 sentences. What is the product? What is the overall accessibility posture? What is the headline risk? What is the recommendation?]

> Example: "[Product] has [N] confirmed accessibility barriers, including [X] critical issues that prevent users with disabilities from completing [KEY TASK]. Under current US and EU regulations, this exposure is [LOW / MODERATE / HIGH]. We recommend a [TIMEFRAME] remediation plan estimated at [EFFORT] to reach WCAG 2.2 Level AA conformance."

---

## Current State

### Issue Summary by Severity

| Severity | Count | Example Issue |
|----------|-------|---------------|
| Critical (WCAG A — blocked) | [N] | [e.g., Keyboard trap on checkout modal] |
| Serious (WCAG AA — degraded) | [N] | [e.g., Form error messages not announced to screen readers] |
| Moderate (WCAG AA — minor friction) | [N] | [e.g., Focus indicator too low contrast] |
| Low (AAA / best practice) | [N] | [e.g., No page language declaration] |
| **Total** | **[N]** | |

### Top Issues by User Impact

> List the 3-5 issues with the highest user impact. Use plain language — no WCAG codes here.

1. **[ISSUE NAME]** — [Plain-language description of what users experience and who is affected.]
2. **[ISSUE NAME]** — [Plain-language description.]
3. **[ISSUE NAME]** — [Plain-language description.]
4. **[ISSUE NAME]** — [Plain-language description.]
5. **[ISSUE NAME]** — [Plain-language description.]

---

## Legal Context

### Applicable Regulations

| Regulation | Jurisdiction | Applies to [PRODUCT]? | Standard Required |
|------------|--------------|-----------------------|-------------------|
| ADA Title III | United States | [Yes / Likely / No] | WCAG 2.1 AA (DOJ rule effective 2026) |
| Section 508 | United States (federal) | [Yes / No] | WCAG 2.0 AA |
| EN 301 549 / EAA | European Union | [Yes / No] | WCAG 2.1 AA |
| AODA | Canada (Ontario) | [Yes / No] | WCAG 2.0 AA |
| Equality Act 2010 | United Kingdom | [Yes / No] | WCAG 2.1 AA |
| [OTHER] | [JURISDICTION] | [Yes / No] | [STANDARD] |

### Current Legal Risk Level

**[LOW / MODERATE / HIGH / CRITICAL]**

[2-3 sentences explaining the risk level. Reference specific regulations that apply. If there are active complaints or inquiries, note them here. If none, state that.]

> Example framing by risk level:
> - **Low** — No public-facing barriers, AA conformant, no complaints on record.
> - **Moderate** — Known barriers exist but no active complaints. Remediation in progress reduces exposure.
> - **High** — Critical barriers on key user flows. Regulatory deadlines approaching or passed. Recommend immediate action.
> - **Critical** — Active complaint or litigation. Immediate legal counsel and remediation required.

---

## User Impact

An estimated **[X]% of [PRODUCT]'s users** may be directly affected by current accessibility barriers.

Context:
- Approximately 1 in 4 adults in the US has a disability (CDC, 2023).
- [X]% of the global population uses a screen reader or other assistive technology.
- Many accessibility improvements benefit all users: keyboard navigation, clear error messages, readable contrast, and logical structure improve usability across the board.

**User groups affected by current barriers:**

| User Group | Current Experience |
|------------|--------------------|
| Keyboard-only users | [Describe barriers] |
| Screen reader users | [Describe barriers] |
| Low vision users | [Describe barriers] |
| Cognitive / attention | [Describe barriers] |
| Motor impairments | [Describe barriers] |

---

## Remediation Plan

### Tier 1 — Quick Wins (1–2 sprints)

Low effort, high impact. Address critical A violations and any S/M-effort AA issues. These should be in the next sprint.

| Issue | Fix | Effort | Impact |
|-------|-----|--------|--------|
| [ISSUE] | [FIX SUMMARY] | S / M | 🔴 Blocked |
| [ISSUE] | [FIX SUMMARY] | S / M | 🔴 Blocked |
| [ISSUE] | [FIX SUMMARY] | S / M | 🟡 Degraded |

**Estimated total effort:** [N] days / [N] sprint points
**Expected outcome:** Resolves [N] critical barriers. Significantly reduces legal exposure.

---

### Tier 2 — Structural Fixes (3–6 sprints)

Medium effort. AA violations requiring design or architecture changes.

| Issue | Fix | Effort | Impact |
|-------|-----|--------|--------|
| [ISSUE] | [FIX SUMMARY] | L | 🔴 / 🟡 |
| [ISSUE] | [FIX SUMMARY] | L | 🟡 Degraded |
| [ISSUE] | [FIX SUMMARY] | L | 🟡 Degraded |

**Estimated total effort:** [N] sprints
**Expected outcome:** Achieves WCAG 2.2 Level AA conformance for core user flows.

---

### Tier 3 — Long-Term Improvements (6+ sprints / ongoing)

Architectural changes, third-party dependencies, design system updates, AAA targets.

| Issue | Fix | Effort | Notes |
|-------|-----|--------|-------|
| [ISSUE] | [FIX SUMMARY] | XL | [Dependency / blocker] |
| [ISSUE] | [FIX SUMMARY] | XL | [Dependency / blocker] |

**Expected outcome:** Full AA conformance across all content. Foundation for AAA improvements.

---

## Recommendation

[2-4 sentences. Specific, actionable. What should leadership approve or prioritize?]

> Example: "We recommend approving Tier 1 remediation immediately — [N] issues, estimated [X] days of engineering time, and it eliminates our highest-risk barriers before [DEADLINE / EVENT]. Tier 2 should be scoped into the [QUARTER] roadmap. We do not recommend waiting: the DOJ rule effective [DATE] makes current gaps a measurable legal liability."

---

> **Note for Claude:** When generating a risk assessment, ask for: product name, jurisdiction, current known issues (or audit results), and any existing legal pressure. Translate all WCAG references into plain language in the executive summary and user impact sections. Legal risk levels should be honest — do not minimize to avoid alarming stakeholders, but do not exaggerate either. If the user has no audit results, note that the assessment is based on a preliminary review and recommend a full audit.
