# Screen Reader Reference

## Who Uses Screen Readers

Not only blind users. Roughly 80% blind/low vision, ~14% other disabilities (cognitive, motor, learning). Also: temporary impairments (broken arm, eye surgery), situational disabilities (bright sunlight, noisy environment), and power users who prefer audio.

Don't build for an imagined "blind user" — build for a wide, varied audience.

## Market Share

Data from WebAIM Screen Reader Survey.

### Desktop (Primary Screen Reader)

| Reader | Share | OS | Cost |
|--------|-------|----|------|
| JAWS | 53.7% | Windows | Commercial (~$1,000/yr) |
| NVDA | 30.7% | Windows | Free/donation |
| VoiceOver | 6.5% | macOS | Built-in |
| Narrator | 2.7% | Windows | Built-in |
| ORCA | 1.0% | Linux | Free |

### "Commonly Used" (not just primary)

VoiceOver jumps to **41.3%** when counting regular use, not just primary. Most users use more than one reader across devices.

### Mobile

| Reader | Share | Platform |
|--------|-------|---------|
| VoiceOver | 71.5% | iOS |
| TalkBack | ~29% | Android |

Mobile is critical — many users with disabilities primarily use mobile devices.

## Which to Test With

| Priority | Combo | Why |
|----------|-------|-----|
| **1** | NVDA + Chrome | Free, Windows, largest combined desktop share — catches most real-world issues |
| **2** | VoiceOver + Safari | Built-in Mac, dominant on iOS/mobile — test if you have a Mac |
| **3** | JAWS + Chrome | Most popular primary reader — but expensive; rely on NVDA parity |
| **4** | TalkBack + Chrome | Android mobile — behaviors differ from desktop readers |

> Start with NVDA+Chrome. If it works there, it usually works in JAWS. VoiceOver behaves differently — test separately.

## Browse Mode vs Focus Mode

NVDA and JAWS have two distinct input modes. This is the most important behavior difference from keyboard-only navigation.

### Browse Mode (Virtual Cursor)
- Default when landing on a page
- Arrow keys move through content one element at a time
- Users can navigate by headings, links, landmarks, form fields without tabbing
- The screen reader intercepts keystrokes before they reach the page

### Focus Mode (Application Mode)
- Activated when entering a widget (input, `role="application"`, etc.)
- Arrow keys and most keys pass through to the page's JavaScript
- Used for rich widgets: grids, comboboxes, tree views, sliders
- NVDA: **Insert+Space** to toggle manually
- JAWS: **Enter** in a field, **Escape** to exit

### Why This Matters for Developers

```
role="application" forces Focus mode on the entire container.
This is almost always wrong — it breaks navigation for everything inside.
Only use it for widgets that genuinely need to capture all keyboard input.
```

Custom widgets must announce mode transitions (e.g., `aria-activedescendant` patterns instead of moving focus for listboxes).

## How Screen Reader Users Navigate

Most users don't read pages linearly. Navigation shortcuts are the primary way they explore content.

### Navigation Methods (% using "always" or "often" — WebAIM)

| Method | Usage |
|--------|-------|
| Headings | 67% primary navigation method |
| Links list | Common for page scanning |
| Search | Built-in browser |
| Landmarks/regions | Growing but still ~20% |
| Tab key | Interactive elements only |

### Keyboard Shortcuts (NVDA/JAWS in Browse Mode)

| Key | Jump to |
|-----|---------|
| `H` / `Shift+H` | Next / prev heading |
| `1`–`6` | Heading level 1–6 |
| `K` / `Shift+K` | Next / prev link |
| `T` / `Shift+T` | Next / prev table |
| `F` / `Shift+F` | Next / prev form field |
| `D` / `Shift+D` | Next / prev landmark |
| `L` / `Shift+L` | Next / prev list |
| `G` / `Shift+G` | Next / prev graphic |
| `B` / `Shift+B` | Next / prev button |
| `Tab` | Next interactive element |

This is why heading structure and landmark regions matter — they're primary navigation tools, not just visual styling.

## Common Myths

**1. "VoiceOver testing is enough"**
Only 6.5% primary desktop. Test NVDA+Chrome at minimum. VoiceOver also has different behavior patterns that may mask issues.

**2. "Screen readers read everything top-to-bottom"**
No. Users jump by headings, landmarks, links. A page with poor heading structure is nearly unusable regardless of its visual design.

**3. "You need to make everything focusable"**
No. Only interactive elements should receive focus. Static text, images, and decorative elements should not be in the tab order. Screen readers in browse mode can read non-focusable content.

**4. "Screen readers only work with perfect ARIA"**
Wrong. Semantic HTML alone provides most of what's needed. `<button>`, `<nav>`, `<h1>`, `<label>` are more reliable than ARIA equivalents. First rule of ARIA: don't use ARIA if you can use native HTML.

**5. "Testing with a screen reader is too hard"**
Start small. Turn on NVDA, close your eyes, navigate to your component with Tab, and just listen. Do the labels make sense? Can you activate things? That's 80% of what matters.

---

## VoiceOver (macOS) Cheat Sheet

**VO = Ctrl+Option**

### Basic Navigation

| Command | Action |
|---------|--------|
| `VO+A` | Read all from cursor |
| `VO+→` | Next item |
| `VO+←` | Previous item |
| `VO+↓` | Interact with item (enter group) |
| `VO+↑` | Stop interacting (exit group) |
| `VO+Space` | Activate / click |
| `Tab` | Next interactive element |
| `Shift+Tab` | Previous interactive element |

### Rotor (most powerful tool)

| Command | Action |
|---------|--------|
| `VO+U` | Open rotor (browse headings, links, landmarks, etc.) |
| `←` / `→` in rotor | Switch categories |
| `↑` / `↓` in rotor | Navigate items |
| `Enter` | Jump to item |
| `Escape` | Close rotor |

### Quick Navigation (enable in VoiceOver Utility)

| Command | Action |
|---------|--------|
| `VO+Cmd+H` | Next heading |
| `H` (quick nav on) | Next heading |
| `VO+Cmd+L` | Next link |
| `VO+Cmd+T` | Next table |

### Settings

- Enable: System Preferences → Accessibility → VoiceOver, or **Cmd+F5**
- Web: Works best with **Safari** — use Safari for VoiceOver testing

---

## NVDA (Windows) Cheat Sheet

**NVDA modifier key = Insert** (or Caps Lock)

### Modes

| Command | Action |
|---------|--------|
| `Insert+Space` | Toggle Browse / Focus mode |
| `Escape` | Exit Focus mode back to Browse |

### Browse Mode Navigation

| Command | Action |
|---------|--------|
| `↓` / `↑` | Next / prev item |
| `H` / `Shift+H` | Next / prev heading |
| `1`–`6` | Next heading level 1–6 |
| `K` / `Shift+K` | Next / prev link |
| `B` / `Shift+B` | Next / prev button |
| `F` / `Shift+F` | Next / prev form field |
| `T` / `Shift+T` | Next / prev table |
| `D` / `Shift+D` | Next / prev landmark |
| `L` / `Shift+L` | Next / prev list |
| `G` / `Shift+G` | Next / prev graphic |
| `Tab` / `Shift+Tab` | Next / prev interactive element |

### General

| Command | Action |
|---------|--------|
| `Insert+Down` | Read all from current position |
| `Insert+Tab` | Read current item |
| `Insert+F7` | Elements list (headings, links, landmarks) |
| `Insert+F1` | Help |
| `Insert+Q` | Quit NVDA |
| `Control` | Stop reading |

### Download

[nvaccess.org/download](https://www.nvaccess.org/download/) — Free, ~70MB, install takes 2 minutes.

---

## Quick Diagnostic: Test Your Component in 5 Minutes

1. **NVDA**: Install, open Chrome, navigate to your component
2. Press `H` several times — do headings make sense out of context?
3. Press `Tab` — does focus reach all interactive elements?
4. Activate a button/link with `Enter` or `Space` — does anything get announced?
5. Fill a form — do labels read before the field? Are errors announced?

If those 5 things work, you're ahead of 80% of implementations.
