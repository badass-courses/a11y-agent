#!/usr/bin/env bun
import { existsSync, mkdirSync } from "node:fs"
import path from "node:path"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Criterion {
  name: string
  description: string
  weight: number
}

interface TestCase {
  skill: string
  fixture: string | null
  prompt: string
  knownIssues: string[]
  rubric: Criterion[]
}

interface Score {
  name: string
  score: number
  maxScore: number
  reasoning: string
}

interface TestResult {
  test: TestCase
  output: string
  scores: Score[]
  total: number
  max: number
  pct: number
  pass: boolean
  durationMs: number
}

// ─── Paths ───────────────────────────────────────────────────────────────────

const PROJECT = path.resolve(import.meta.dir, "..")
const SKILLS = path.join(PROJECT, ".claude", "skills")
const FIXTURES = path.join(import.meta.dir, "fixtures")
const RESULTS = path.join(import.meta.dir, "results")

// ─── Config ──────────────────────────────────────────────────────────────────

const PASS_THRESHOLD = 70
const JUDGE_MODEL = "haiku"
const SKILL_MODEL = "sonnet" // cheaper than opus for bulk eval

// ─── CLI flags ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const flagSkill = args.find((a) => a.startsWith("--skill="))?.split("=")[1]
const flagFixture = args.find((a) => a.startsWith("--fixture="))?.split("=")[1]
const flagVerbose = args.includes("--verbose") || args.includes("-v")
const flagOffset = Number(args.find((a) => a.startsWith("--offset="))?.split("=")[1] || "0")
const flagDryRun = args.includes("--dry-run")
const flagHelp = args.includes("--help") || args.includes("-h")

if (flagHelp) {
  console.log(`
  a11y skill evaluator — LLM-as-judge scoring

  Usage:
    bun run tests/run.ts [flags]

  Flags:
    --skill=NAME      run only tests for this skill
    --fixture=NAME    run only tests using this fixture
    --verbose, -v     show per-criterion score breakdown
    --offset=N        skip first N tests
    --dry-run         show test plan without running
    --help, -h        show this help

  Examples:
    bun run test:skills
    bun run test:skills -- --skill=a11y-audit
    bun run test:skills -- --fixture=bad-form.tsx --verbose
`)
  process.exit(0)
}

// ─── Known issues per fixture ────────────────────────────────────────────────

const FORM_ISSUES = [
  "div used instead of form element",
  "inputs rely on placeholder instead of label elements",
  "radio group not wrapped in fieldset/legend",
  "error message not in aria-live region",
  "error indicated by color only",
  "icon-only button with no accessible name",
  "no form semantics or submit behavior",
]

const MODAL_ISSUES = [
  "missing dialog element or role=dialog",
  "missing aria-modal=true",
  "missing aria-labelledby on dialog",
  "no focus trap",
  "no escape key handler",
  "close button is a span, not a real button",
  "no focus return to trigger element on close",
  "background content not inert",
]

const IMAGE_ISSUES = [
  "image completely missing alt text",
  "decorative image has verbose alt (should be empty)",
  "image link has no text alternative",
  "interactive SVG missing role=button and accessible name",
  "image and caption not using figure/figcaption",
  "alt text is vague/non-descriptive (just 'team')",
]

const NAV_ISSUES = [
  "wildcard CSS resets outline to 0 (no visible focus indicators)",
  "nav items are divs instead of buttons (not focusable or operable)",
  "submenus hidden with opacity:0 but still tabbable (should use display:none)",
  "no aria-expanded on menu toggle buttons",
  "no aria-haspopup on buttons with associated menus",
  "multiple nav landmarks without distinguishing aria-label",
  "no skip link to bypass repeated navigation",
  "no aria-current=page on active link",
  "no Escape key handler to close open submenu",
]

const DATE_PICKER_ISSUES = [
  "every date is individually tabbable (needs roving tabindex)",
  "calendar is div grid instead of table structure",
  "prev/next buttons use < > text read as less-than/greater-than",
  "SVG in button causes screen reader navigation issues",
  "prev/next buttons lack descriptive aria-label with month context",
  "no table headers for days of week (no programmatic calendar structure)",
  "selected date has no aria-selected or aria-pressed state",
  "no arrow key navigation between dates",
]

const HEADING_ISSUES = [
  "no h1 anywhere on the page",
  "heading levels skip from h2 to h6 (h3-h5 missing)",
  "h6 used as a form label instead of label element",
  "heading level chosen for visual size not semantic structure (h3 as page title)",
  "section elements without accessible names (aria-label or aria-labelledby)",
  "no main landmark wrapping primary content",
  "span class=label used instead of real label elements for form inputs",
]

const SPA_ISSUES = [
  "document title never updates on route change",
  "focus not managed after client-side navigation",
  "no aria-current=page on active nav link",
  "no live region to announce route changes to screen readers",
  "no skip link to bypass repeated navigation",
  "using a onClick preventDefault instead of proper routing",
  "missing html lang attribute",
]

// ─── Rubric builders ─────────────────────────────────────────────────────────

function auditRubric(issues: string[]): Criterion[] {
  return [
    ...issues.map((issue) => ({
      name: `Identifies: ${issue}`,
      description: `Output correctly identifies that ${issue}`,
      weight: 10,
    })),
    {
      name: "WCAG references",
      description: "References specific WCAG success criteria (e.g. 1.1.1, 4.1.2) correctly",
      weight: 8,
    },
    {
      name: "Actionable fixes",
      description: "Provides clear, specific code-level fix suggestions",
      weight: 8,
    },
    {
      name: "Severity/priority",
      description: "Indicates relative severity or priority of issues",
      weight: 6,
    },
  ]
}

function fixRubric(issues: string[]): Criterion[] {
  return [
    ...issues.map((issue) => ({
      name: `Fixes: ${issue}`,
      description: `Output code correctly addresses: ${issue}`,
      weight: 10,
    })),
    {
      name: "Valid JSX/TSX",
      description: "Output code is syntactically valid and would compile",
      weight: 10,
    },
    {
      name: "No regressions",
      description: "Fixes don't break existing functionality or introduce new a11y issues",
      weight: 8,
    },
    {
      name: "Explains changes",
      description: "Includes brief explanation of what changed and why",
      weight: 6,
    },
  ]
}

function reviewRubric(issues: string[]): Criterion[] {
  return [
    ...issues.map((issue) => ({
      name: `Flags: ${issue}`,
      description: `Review flags that ${issue}`,
      weight: 10,
    })),
    {
      name: "WCAG references",
      description: "References specific WCAG success criteria correctly",
      weight: 8,
    },
    {
      name: "Review tone",
      description: "Formatted as code review feedback, not an audit report",
      weight: 6,
    },
    {
      name: "Actionable suggestions",
      description: "Each issue has a concrete suggestion for how to fix it",
      weight: 6,
    },
  ]
}

// ─── Test suites ─────────────────────────────────────────────────────────────

const suites: TestCase[] = [
  // ── a11y-audit ──────────────────────────
  {
    skill: "a11y-audit",
    fixture: "bad-form.tsx",
    prompt: "Quick audit this component for accessibility. Skip context gathering, check everything.",
    knownIssues: FORM_ISSUES,
    rubric: auditRubric(FORM_ISSUES),
  },
  {
    skill: "a11y-audit",
    fixture: "bad-modal.tsx",
    prompt: "Quick audit this modal component for accessibility. Skip context gathering.",
    knownIssues: MODAL_ISSUES,
    rubric: auditRubric(MODAL_ISSUES),
  },
  {
    skill: "a11y-audit",
    fixture: "bad-images.tsx",
    prompt: "Quick audit this image gallery for accessibility. Skip context gathering.",
    knownIssues: IMAGE_ISSUES,
    rubric: auditRubric(IMAGE_ISSUES),
  },

  // ── a11y-fix ────────────────────────────
  {
    skill: "a11y-fix",
    fixture: "bad-form.tsx",
    prompt: "Fix all accessibility issues in this form component. Output the corrected code.",
    knownIssues: FORM_ISSUES,
    rubric: fixRubric(FORM_ISSUES),
  },
  {
    skill: "a11y-fix",
    fixture: "bad-modal.tsx",
    prompt: "Fix all accessibility issues in this modal. Output the corrected code.",
    knownIssues: MODAL_ISSUES,
    rubric: fixRubric(MODAL_ISSUES),
  },
  {
    skill: "a11y-fix",
    fixture: "bad-images.tsx",
    prompt: "Fix all accessibility issues in this gallery. Output the corrected code.",
    knownIssues: IMAGE_ISSUES,
    rubric: fixRubric(IMAGE_ISSUES),
  },

  // ── a11y-review ─────────────────────────
  {
    skill: "a11y-review",
    fixture: "bad-form.tsx",
    prompt: "Code review this component for accessibility issues, as if reviewing a PR.",
    knownIssues: FORM_ISSUES,
    rubric: reviewRubric(FORM_ISSUES),
  },
  {
    skill: "a11y-review",
    fixture: "bad-modal.tsx",
    prompt: "Code review this modal for accessibility, as if reviewing a PR.",
    knownIssues: MODAL_ISSUES,
    rubric: reviewRubric(MODAL_ISSUES),
  },
  {
    skill: "a11y-review",
    fixture: "bad-images.tsx",
    prompt: "Code review this gallery for accessibility, as if reviewing a PR.",
    knownIssues: IMAGE_ISSUES,
    rubric: reviewRubric(IMAGE_ISSUES),
  },

  // ── a11y-audit: new fixtures ─────────────
  {
    skill: "a11y-audit",
    fixture: "bad-nav.tsx",
    prompt: "Quick audit this mega navigation component for accessibility. Skip context gathering.",
    knownIssues: NAV_ISSUES,
    rubric: auditRubric(NAV_ISSUES),
  },
  {
    skill: "a11y-audit",
    fixture: "bad-date-picker.tsx",
    prompt: "Quick audit this date picker component for accessibility. Skip context gathering.",
    knownIssues: DATE_PICKER_ISSUES,
    rubric: auditRubric(DATE_PICKER_ISSUES),
  },
  {
    skill: "a11y-audit",
    fixture: "bad-heading-page.tsx",
    prompt: "Quick audit this page for accessibility, paying attention to semantic structure. Skip context gathering.",
    knownIssues: HEADING_ISSUES,
    rubric: auditRubric(HEADING_ISSUES),
  },
  {
    skill: "a11y-audit",
    fixture: "bad-spa.tsx",
    prompt: "Quick audit this single-page application for accessibility, especially routing and navigation. Skip context gathering.",
    knownIssues: SPA_ISSUES,
    rubric: auditRubric(SPA_ISSUES),
  },

  // ── a11y-fix: new fixtures ──────────────
  {
    skill: "a11y-fix",
    fixture: "bad-nav.tsx",
    prompt: "Fix all accessibility issues in this mega navigation. Output the corrected code.",
    knownIssues: NAV_ISSUES,
    rubric: fixRubric(NAV_ISSUES),
  },
  {
    skill: "a11y-fix",
    fixture: "bad-date-picker.tsx",
    prompt: "Fix all accessibility issues in this date picker. Output the corrected code.",
    knownIssues: DATE_PICKER_ISSUES,
    rubric: fixRubric(DATE_PICKER_ISSUES),
  },
  {
    skill: "a11y-fix",
    fixture: "bad-heading-page.tsx",
    prompt: "Fix all accessibility issues in this page layout. Output the corrected code.",
    knownIssues: HEADING_ISSUES,
    rubric: fixRubric(HEADING_ISSUES),
  },
  {
    skill: "a11y-fix",
    fixture: "bad-spa.tsx",
    prompt: "Fix all accessibility issues in this SPA routing setup. Output the corrected code.",
    knownIssues: SPA_ISSUES,
    rubric: fixRubric(SPA_ISSUES),
  },

  // ── a11y-review: new fixtures ───────────
  {
    skill: "a11y-review",
    fixture: "bad-nav.tsx",
    prompt: "Code review this mega navigation for accessibility, as if reviewing a PR.",
    knownIssues: NAV_ISSUES,
    rubric: reviewRubric(NAV_ISSUES),
  },
  {
    skill: "a11y-review",
    fixture: "bad-date-picker.tsx",
    prompt: "Code review this date picker for accessibility, as if reviewing a PR.",
    knownIssues: DATE_PICKER_ISSUES,
    rubric: reviewRubric(DATE_PICKER_ISSUES),
  },
  {
    skill: "a11y-review",
    fixture: "bad-heading-page.tsx",
    prompt: "Code review this page layout for accessibility, as if reviewing a PR.",
    knownIssues: HEADING_ISSUES,
    rubric: reviewRubric(HEADING_ISSUES),
  },
  {
    skill: "a11y-review",
    fixture: "bad-spa.tsx",
    prompt: "Code review this SPA for accessibility, as if reviewing a PR.",
    knownIssues: SPA_ISSUES,
    rubric: reviewRubric(SPA_ISSUES),
  },

  // ── a11y-component (no fixture, scaffold from scratch) ──
  {
    skill: "a11y-component",
    fixture: null,
    prompt: "Scaffold an accessible modal dialog component in React with TypeScript. Don't ask clarifying questions — just generate the component. Use a button trigger, no animation, plain CSS, no external dependencies.",
    knownIssues: [],
    rubric: [
      { name: "Uses <dialog> or role=dialog", description: "Component uses native dialog element or explicit role", weight: 10 },
      { name: "Has aria-modal", description: "Includes aria-modal=true", weight: 8 },
      { name: "Has aria-labelledby", description: "Dialog is labelled by its heading", weight: 8 },
      { name: "Focus trap", description: "Implements focus trapping within the dialog", weight: 10 },
      { name: "ESC to close", description: "Handles Escape key to close the dialog", weight: 10 },
      { name: "Focus return", description: "Returns focus to trigger element on close", weight: 10 },
      { name: "Inert background", description: "Makes background content inert or hidden from AT", weight: 8 },
      { name: "Keyboard navigable", description: "All interactive elements are keyboard accessible", weight: 8 },
      { name: "Valid TypeScript", description: "Output is valid TSX that would compile", weight: 8 },
    ],
  },

  // ── a11y-advocate (no fixture, generate statement) ──
  {
    skill: "a11y-advocate",
    fixture: null,
    prompt: "Generate an accessibility statement for a SaaS web application targeting WCAG 2.2 AA. Don't ask clarifying questions — generate the statement now. Use these details: organization 'Acme Corp' at acme.com, partial AA conformance, feedback via accessibility@acme.com within 2 business days, assessed via automated tools + manual review on 2025-01-15, known limitation: legacy charts not yet accessible.",
    knownIssues: [],
    rubric: [
      { name: "WCAG version", description: "References WCAG 2.2 specifically", weight: 8 },
      { name: "Conformance level", description: "States the target conformance level (AA)", weight: 8 },
      { name: "Standards body", description: "References W3C/WAI", weight: 6 },
      { name: "Contact info section", description: "Includes section for accessibility contact/feedback", weight: 10 },
      { name: "Known limitations", description: "Has section for documenting known limitations", weight: 8 },
      { name: "Testing methods", description: "Describes testing approaches used", weight: 8 },
      { name: "Review date", description: "Includes date or review schedule", weight: 6 },
      { name: "Professional tone", description: "Appropriate tone for a public-facing document", weight: 6 },
    ],
  },
]

// ─── Runner ──────────────────────────────────────────────────────────────────

async function readSkill(name: string): Promise<string> {
  const p = path.join(SKILLS, name, "SKILL.md")
  if (!existsSync(p)) throw new Error(`Skill not found: ${p}`)
  return Bun.file(p).text()
}

async function readFixture(name: string): Promise<string> {
  const p = path.join(FIXTURES, name)
  if (!existsSync(p)) throw new Error(`Fixture not found: ${p}`)
  return Bun.file(p).text()
}

async function invokeSkill(test: TestCase): Promise<string> {
  const skill = await readSkill(test.skill)

  let fixture = ""
  if (test.fixture) {
    const content = await readFixture(test.fixture)
    fixture = `\n\nHere is the file to work on:\n<file path="${test.fixture}">\n${content}\n</file>`
  }

  const prompt = [
    "You are an expert accessibility engineer. Follow these skill instructions exactly:",
    "",
    "<skill-instructions>",
    skill,
    "</skill-instructions>",
    fixture,
    "",
    test.prompt,
  ].join("\n")

  const proc = Bun.spawn(["claude", "-p", prompt, "--model", SKILL_MODEL], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const output = await new Response(proc.stdout).text()
  const code = await proc.exited
  if (code !== 0) {
    const err = await new Response(proc.stderr).text()
    throw new Error(`claude exited ${code}: ${err}`)
  }
  return output.trim()
}

async function judge(test: TestCase, output: string): Promise<Score[]> {
  const rubricLines = test.rubric
    .map((c, i) => `${i + 1}. "${c.name}" (max ${c.weight} pts): ${c.description}`)
    .join("\n")

  const issuesBlock =
    test.knownIssues.length > 0
      ? `\n## Known issues in the fixture\n${test.knownIssues.map((i) => `- ${i}`).join("\n")}\n`
      : ""

  const prompt = [
    "You are a strict evaluator scoring an accessibility skill's output.",
    "Be precise: full marks only if the criterion is clearly and completely met.",
    "Partial credit for partial coverage. Zero if not addressed at all.",
    issuesBlock,
    "## Skill output to evaluate",
    "<output>",
    output.slice(0, 12000), // cap to avoid token explosion
    "</output>",
    "",
    "## Rubric",
    rubricLines,
    "",
    "Respond with ONLY a JSON array. No markdown fences. No explanation outside the array.",
    'Format: [{"name":"criterion name","score":N,"maxScore":N,"reasoning":"1 sentence"}]',
  ].join("\n")

  const proc = Bun.spawn(["claude", "-p", prompt, "--model", JUDGE_MODEL], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const raw = await new Response(proc.stdout).text()
  await proc.exited

  return parseJudgeResponse(raw, test.rubric)
}

function extractJson(raw: string): string | null {
  // Strip markdown fences: ```json ... ``` or ``` ... ```
  const fenced = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
  const text = fenced ? fenced[1].trim() : raw.trim()

  // Find the outermost [ ... ] (greedy to capture nested structures)
  const bracketMatch = text.match(/\[[\s\S]*\]/)
  return bracketMatch ? bracketMatch[0] : null
}

function parseJudgeResponse(raw: string, rubric: Criterion[]): Score[] {
  const json = extractJson(raw)
  if (json) {
    try {
      const parsed = JSON.parse(json) as Score[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((s, i) => ({
          name: s.name || rubric[i]?.name || `criterion-${i}`,
          score: Math.min(Math.max(0, s.score), s.maxScore),
          maxScore: rubric[i]?.weight ?? s.maxScore,
          reasoning: s.reasoning || "",
        }))
      }
    } catch {
      // fall through to fallback
    }
  }

  // Fallback: return zeros so the test still reports
  console.error("    ⚠ Judge returned unparseable response, scoring as 0")
  return rubric.map((c) => ({
    name: c.name,
    score: 0,
    maxScore: c.weight,
    reasoning: "Judge response could not be parsed",
  }))
}

// ─── Reporter ────────────────────────────────────────────────────────────────

function printReport(results: TestResult[]) {
  const bySkill = new Map<string, TestResult[]>()
  for (const r of results) {
    const arr = bySkill.get(r.test.skill) || []
    arr.push(r)
    bySkill.set(r.test.skill, arr)
  }

  const W = 62
  console.log()
  console.log("╔" + "═".repeat(W) + "╗")
  console.log("║" + "  A11Y SKILLS EVAL REPORT".padEnd(W) + "║")
  console.log("╠" + "═".repeat(W) + "╣")

  let overallTotal = 0
  let overallMax = 0

  for (const [skill, tests] of bySkill) {
    console.log("║" + "".padEnd(W) + "║")
    console.log("║" + `  ${skill}`.padEnd(W) + "║")
    console.log("║" + `  ${"─".repeat(W - 4)}`.padEnd(W) + "║")

    for (const r of tests) {
      const icon = r.pass ? "✓" : "✗"
      const label = (r.test.fixture || "scaffold").padEnd(22)
      const score = `${String(r.pct).padStart(3)}%`
      const time = `${(r.durationMs / 1000).toFixed(1)}s`
      console.log("║" + `    ${label} ${score}  ${icon}  ${time}`.padEnd(W) + "║")

      if (flagVerbose) {
        for (const s of r.scores) {
          const flag = s.score >= s.maxScore ? "✓" : s.score >= s.maxScore * 0.5 ? "~" : "✗"
          const line = `      ${flag} ${s.name}: ${s.score}/${s.maxScore}`
          // Truncate long lines
          const truncated = line.length > W - 2 ? line.slice(0, W - 5) + "..." : line
          console.log("║" + truncated.padEnd(W) + "║")
        }
      }

      overallTotal += r.total
      overallMax += r.max
    }

    const avg = Math.round(tests.reduce((s, t) => s + t.pct, 0) / tests.length)
    console.log("║" + `${"Skill avg:".padStart(30)} ${avg}%`.padEnd(W) + "║")
  }

  const overallPct = Math.round((overallTotal / overallMax) * 100)
  const status = overallPct >= PASS_THRESHOLD ? "PASS" : "FAIL"

  console.log("║" + "".padEnd(W) + "║")
  console.log("╠" + "═".repeat(W) + "╣")
  console.log("║" + `  OVERALL: ${overallPct}%  ${status}`.padEnd(W) + "║")
  console.log("╚" + "═".repeat(W) + "╝")
  console.log()
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Verify claude CLI exists
  const check = Bun.spawnSync(["which", "claude"])
  if (check.exitCode !== 0) {
    console.error("Error: 'claude' CLI not found in PATH")
    process.exit(1)
  }

  // Filter tests
  let tests = suites
  if (flagSkill) tests = tests.filter((t) => t.skill === flagSkill)
  if (flagFixture) tests = tests.filter((t) => t.fixture === flagFixture)
  if (flagOffset > 0) tests = tests.slice(flagOffset)

  if (tests.length === 0) {
    console.error("No tests match filters")
    process.exit(1)
  }

  // Dry run
  if (flagDryRun) {
    console.log(`\n  Test plan: ${tests.length} evaluations\n`)
    for (const t of tests) {
      const criteria = t.rubric.length
      const maxPts = t.rubric.reduce((s, c) => s + c.weight, 0)
      console.log(`    ${t.skill} × ${t.fixture || "scaffold"}  (${criteria} criteria, ${maxPts} pts)`)
    }
    console.log()
    return
  }

  // Ensure output dirs
  mkdirSync(RESULTS, { recursive: true })
  mkdirSync(path.join(RESULTS, "outputs"), { recursive: true })

  console.log(`\n  Running ${tests.length} skill evaluations`)
  console.log(`  Skill model: ${SKILL_MODEL || "default"}  |  Judge model: ${JUDGE_MODEL}\n`)

  const results: TestResult[] = []

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i]
    const label = `[${i + 1}/${tests.length}] ${test.skill} × ${test.fixture || "scaffold"}`
    process.stdout.write(`  ${label} ... `)

    const t0 = performance.now()

    try {
      // Invoke skill
      const output = await invokeSkill(test)

      // Save raw output
      const outFile = `${test.skill}_${(test.fixture || "scaffold").replace(/\.[^.]+$/, "")}.md`
      await Bun.write(path.join(RESULTS, "outputs", outFile), output)

      // Judge
      const scores = await judge(test, output)
      const total = scores.reduce((s, c) => s + c.score, 0)
      const max = scores.reduce((s, c) => s + c.maxScore, 0)
      const pct = max > 0 ? Math.round((total / max) * 100) : 0
      const durationMs = performance.now() - t0

      results.push({ test, output, scores, total, max, pct, pass: pct >= PASS_THRESHOLD, durationMs })
      console.log(`${pct}%  (${(durationMs / 1000).toFixed(1)}s)`)
    } catch (err) {
      const durationMs = performance.now() - t0
      const max = test.rubric.reduce((s, c) => s + c.weight, 0)
      results.push({ test, output: "", scores: [], total: 0, max, pct: 0, pass: false, durationMs })
      console.log(`ERROR (${(durationMs / 1000).toFixed(1)}s)`)
      console.error(`    ${err}`)
    }
  }

  // Report
  printReport(results)

  // Save structured results (strip raw output to keep file small)
  const summary = results.map((r) => ({
    skill: r.test.skill,
    fixture: r.test.fixture,
    pct: r.pct,
    pass: r.pass,
    durationMs: r.durationMs,
    scores: r.scores,
  }))
  await Bun.write(path.join(RESULTS, "latest.json"), JSON.stringify(summary, null, 2))
  console.log(`  Results → tests/results/latest.json`)
  console.log(`  Outputs → tests/results/outputs/\n`)

  // Exit code
  const failed = results.filter((r) => !r.pass)
  if (failed.length > 0) {
    console.log(`  ${failed.length} test(s) below ${PASS_THRESHOLD}% threshold\n`)
    process.exit(1)
  }
}

main()
