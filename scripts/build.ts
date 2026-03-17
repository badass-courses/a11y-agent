import { rmSync, mkdirSync, cpSync, existsSync } from "node:fs"
import path from "node:path"

// --- Types ---

interface Arg {
  name: string
  description: string
}

interface Skill {
  name: string
  description: string
  userInvokable: boolean
  args: Arg[]
  license: string | null
  body: string
  sourceDir: string
}

type Tier = "full" | "moderate" | "basic"
type ArgFormat = "angle" | "dollar" | "generic"

interface ProviderConfig {
  configDir: string
  tier: Tier
  argFormat?: ArgFormat
}

// --- Provider Config ---

const PROVIDERS: Record<string, ProviderConfig> = {
  "claude-code": { configDir: ".claude", tier: "full" },
  opencode: { configDir: ".opencode", tier: "full" },
  agents: { configDir: ".agents", tier: "moderate", argFormat: "angle" },
  codex: { configDir: ".codex", tier: "moderate", argFormat: "dollar" },
  cursor: { configDir: ".cursor", tier: "basic" },
  gemini: { configDir: ".gemini", tier: "basic", argFormat: "generic" },
  kiro: { configDir: ".kiro", tier: "basic" },
  pi: { configDir: ".pi", tier: "basic" },
}

// --- Frontmatter Parser ---

function parseFrontmatter(content: string): Skill {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!fmMatch) throw new Error("No frontmatter found")

  const yaml = fmMatch[1]
  const body = fmMatch[2]

  let name = ""
  let description = ""
  let userInvokable = false
  let license: string | null = null
  const args: Arg[] = []

  let currentArg: Partial<Arg> | null = null

  for (const line of yaml.split("\n")) {
    // Arg list item
    if (line.match(/^\s+-\s+name:\s+/)) {
      if (currentArg?.name) args.push(currentArg as Arg)
      currentArg = { name: line.replace(/^\s+-\s+name:\s+/, "").trim() }
      continue
    }
    if (line.match(/^\s+description:\s+/) && currentArg) {
      currentArg.description = line.replace(/^\s+description:\s+/, "").replace(/^["']|["']$/g, "").trim()
      continue
    }

    // Top-level fields
    const match = line.match(/^(\S+):\s*(.*)$/)
    if (!match) continue

    // Flush any pending arg when we hit a top-level key
    if (currentArg?.name) { args.push(currentArg as Arg); currentArg = null }

    const [, key, rawValue] = match
    const value = rawValue.replace(/^["']|["']$/g, "").trim()

    switch (key) {
      case "name": name = value; break
      case "description": description = value; break
      case "user-invokable": userInvokable = value === "true"; break
      case "license": license = value || null; break
      case "args": break // handled by list items above
    }
  }

  if (currentArg?.name) args.push(currentArg as Arg)

  return { name, description, userInvokable, args, license, body, sourceDir: "" }
}

// --- Frontmatter Serializer ---

function serializeFrontmatter(skill: Skill, tier: Tier): string {
  const lines: string[] = ["---"]

  lines.push(`name: ${skill.name}`)
  lines.push(`description: "${skill.description}"`)

  if (tier === "full" || tier === "moderate") {
    lines.push(`user-invokable: ${skill.userInvokable}`)
  }

  if (tier === "full" && skill.args.length > 0) {
    lines.push("args:")
    for (const arg of skill.args) {
      lines.push(`  - name: ${arg.name}`)
      lines.push(`    description: "${arg.description}"`)
    }
  }

  if (skill.license) {
    lines.push(`license: "${skill.license}"`)
  }

  lines.push("---")
  return lines.join("\n")
}

// --- Placeholder Replacement ---

function replacePlaceholders(
  body: string,
  skill: Skill,
  provider: ProviderConfig,
  availableCommands: string,
): string {
  let result = body

  // Replace {{argName}} for each arg
  for (const arg of skill.args) {
    const pattern = `{{${arg.name}}}`

    switch (provider.argFormat) {
      case "angle":
        result = result.replaceAll(pattern, `<${arg.name}>`)
        break
      case "dollar":
        result = result.replaceAll(pattern, `$${arg.name.toUpperCase()}`)
        break
      case "generic":
        result = result.replaceAll(pattern, "{{args}}")
        break
      default:
        // full tier: keep as-is; basic without argFormat: use readable fallback
        if (provider.tier === "basic") {
          result = result.replaceAll(pattern, `the specified ${arg.name}`)
        }
        break
    }
  }

  // Replace {{available_commands}} if present
  result = result.replaceAll("{{available_commands}}", availableCommands)

  return result
}

// --- Main Build ---

const SOURCE_DIR = "source/skills"
const DIST_DIR = "dist"

async function build() {
  // Step 0: Clean dist
  rmSync(DIST_DIR, { recursive: true, force: true })

  // Step 1: Read all source skills
  const glob = new Bun.Glob(`${SOURCE_DIR}/*/SKILL.md`)
  const skills: Skill[] = []

  for await (const filePath of glob.scan(".")) {
    const content = await Bun.file(filePath).text()
    const skill = parseFrontmatter(content)
    skill.sourceDir = path.dirname(filePath)
    skills.push(skill)
  }

  // Step 2: Build available commands list
  const availableCommands = skills
    .filter(s => s.userInvokable)
    .map(s => `/${s.name}`)
    .join(", ")

  // Step 3: Transform and write for each provider
  let filesWritten = 0

  for (const [providerName, config] of Object.entries(PROVIDERS)) {
    for (const skill of skills) {
      const outDir = path.join(
        DIST_DIR,
        providerName,
        config.configDir,
        "skills",
        skill.name,
      )
      mkdirSync(outDir, { recursive: true })

      // Transform
      const frontmatter = serializeFrontmatter(skill, config.tier)
      const body = replacePlaceholders(skill.body, skill, config, availableCommands)
      const output = `${frontmatter}\n${body.endsWith("\n") ? body : body + "\n"}`

      // Write SKILL.md
      await Bun.write(path.join(outDir, "SKILL.md"), output)
      filesWritten++

      // Copy reference files
      const refDir = path.join(skill.sourceDir, "reference")
      if (existsSync(refDir)) {
        const refOutDir = path.join(outDir, "reference")
        mkdirSync(refOutDir, { recursive: true })
        const refGlob = new Bun.Glob("*.md")
        for await (const refFile of refGlob.scan(refDir)) {
          const src = path.join(refDir, refFile)
          const dest = path.join(refOutDir, refFile)
          cpSync(src, dest)
          filesWritten++
        }
      }
    }
  }

  console.log(`✓ Built ${skills.length} skills × ${Object.keys(PROVIDERS).length} providers = ${filesWritten} files`)
  console.log(`  Commands: ${availableCommands}`)

  // Sync Claude Code output to repo .claude/skills/ (checked into git)
  const claudeSrc = path.join(DIST_DIR, "claude-code", ".claude", "skills")
  const claudeDest = path.join(".claude", "skills")
  if (existsSync(claudeDest)) rmSync(claudeDest, { recursive: true, force: true })
  mkdirSync(claudeDest, { recursive: true })

  // Copy each skill directory
  const claudeGlob = new Bun.Glob("*")
  for await (const entry of claudeGlob.scan({ cwd: claudeSrc, onlyFiles: false })) {
    const src = path.join(claudeSrc, entry)
    const dest = path.join(claudeDest, entry)
    cpSync(src, dest, { recursive: true })
  }

  console.log(`  Synced to .claude/skills/`)
}

build().catch(err => {
  console.error(err)
  process.exit(1)
})
