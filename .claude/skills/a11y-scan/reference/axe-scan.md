# axe-scan Reference

> Claude generates this script to a temp file (e.g. `/tmp/axe-scan.mjs`) and executes it at runtime with `node /tmp/axe-scan.mjs [url] [scope]`. Do not commit the generated temp file.

## Prerequisites

```bash
npm install -D @axe-core/playwright playwright
npx playwright install chromium
```

## Script

```js
// axe-scan.mjs
// Usage: node axe-scan.mjs [url] [cssSelector]
// Example: node axe-scan.mjs http://localhost:3000 "main"

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const url = process.argv[2] || "http://localhost:3000";
const scope = process.argv[3] || null;

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(url, { waitUntil: "networkidle" });

  let builder = new AxeBuilder({ page });

  if (scope) {
    builder = builder.include(scope);
  }

  const results = await builder.analyze();

  const output = {
    url,
    timestamp: new Date().toISOString(),
    scope: scope || null,
    summary: {
      violations: results.violations.length,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length,
    },
    violations: results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      helpUrl: v.helpUrl,
      wcagTags: v.tags.filter((t) => t.startsWith("wcag") || t.startsWith("best-practice")),
      nodeCount: v.nodes.length,
      nodes: v.nodes.map((n) => ({
        html: n.html,
        failureSummary: n.failureSummary,
        target: n.target,
      })),
    })),
  };

  process.stdout.write(JSON.stringify(output, null, 2));

  await browser.close();
})();
```

## Output Shape

```json
{
  "url": "http://localhost:3000",
  "timestamp": "2026-03-18T10:00:00.000Z",
  "scope": "main",
  "summary": {
    "violations": 4,
    "passes": 38,
    "incomplete": 2,
    "inapplicable": 61
  },
  "violations": [
    {
      "id": "color-contrast",
      "impact": "serious",
      "description": "Elements must meet minimum color contrast ratio thresholds",
      "helpUrl": "https://dequeuniversity.com/rules/axe/4.x/color-contrast",
      "wcagTags": ["wcag2aa", "wcag143"],
      "nodeCount": 3,
      "nodes": [
        {
          "html": "<span class=\"label\">Submit</span>",
          "failureSummary": "Fix any of the following: Element has insufficient color contrast of 2.5 (foreground color: #999999, background color: #ffffff, font size: 12.0pt)",
          "target": [".label"]
        }
      ]
    }
  ]
}
```

## Usage Examples

```bash
# Scan localhost:3000 (default)
node /tmp/axe-scan.mjs

# Scan a specific URL
node /tmp/axe-scan.mjs https://example.com

# Scan scoped to main content only
node /tmp/axe-scan.mjs http://localhost:3000 "main"

# Scan a specific component region
node /tmp/axe-scan.mjs http://localhost:3000/dashboard "#nav-primary"

# Save results to file
node /tmp/axe-scan.mjs http://localhost:3000 > a11y-scan-results/2026-03-18.json
```

## Impact Severity Reference

| Impact     | Meaning                                           |
|------------|---------------------------------------------------|
| `critical` | Blocks access entirely for some users             |
| `serious`  | Very likely to cause severe difficulties          |
| `moderate` | Causes some difficulty, workaround may exist      |
| `minor`    | Low severity, best-practice issue                 |

## Notes

- `networkidle` wait ensures SPAs and lazy-loaded content are fully rendered before scanning
- Axe only analyzes what is currently rendered in the DOM — open modals, menus, or expanded states before scanning to capture their accessibility
- The `include(scope)` selector scopes violations to a subtree; useful for isolating third-party widget noise
- Passes and inapplicable counts are included in summary for trend tracking but omitted from detail output to keep files small
- For CI usage, prefer `@axe-core/playwright` directly in your Playwright test suite rather than this script
