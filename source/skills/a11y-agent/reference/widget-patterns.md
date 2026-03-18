# Widget Patterns Reference

## Mega Menu / Navigation Menu

A navigation menu where a trigger button reveals a panel of links organized as a menu.

### Required HTML Structure

```html
<nav aria-label="Main navigation">
  <ul>
    <li>
      <button
        id="products-trigger"
        aria-haspopup="true"
        aria-expanded="false"
        aria-controls="products-menu"
      >
        Products
      </button>
      <ul
        id="products-menu"
        role="menu"
        aria-labelledby="products-trigger"
        hidden
      >
        <li role="none">
          <a role="menuitem" href="/products/overview">Overview</a>
        </li>
        <li role="none">
          <a role="menuitem" href="/products/pricing">Pricing</a>
        </li>
        <li role="none">
          <a role="menuitem" href="/products/enterprise">Enterprise</a>
        </li>
      </ul>
    </li>
    <li>
      <button
        id="company-trigger"
        aria-haspopup="true"
        aria-expanded="false"
        aria-controls="company-menu"
      >
        Company
      </button>
      <ul
        id="company-menu"
        role="menu"
        aria-labelledby="company-trigger"
        hidden
      >
        <li role="none">
          <a role="menuitem" href="/about">About</a>
        </li>
        <li role="none">
          <a role="menuitem" href="/careers">Careers</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
```

### ARIA Requirements

- `aria-haspopup="true"` on every trigger button — tells screen readers a popup will appear
- `aria-expanded="false"` on trigger, toggled to `"true"` when open
- `aria-controls` pointing to the menu `id`
- `aria-labelledby` on the `<ul role="menu">` pointing back to the trigger — gives the menu an accessible name
- `role="none"` on `<li>` elements — strips their list item semantics since `menuitem` children convey structure

### Critical: Hiding Closed Menus

**Use `hidden` attribute or `display: none` — never `opacity: 0` or `visibility: hidden` alone.**

`opacity: 0` leaves items in the tab order. Users tabbing through the page will land on invisible links.

```css
/* WRONG — items invisible but still tabbable */
.menu { display: flex; opacity: 0; pointer-events: none; }

/* CORRECT */
.menu[hidden] { display: none; }
/* or just rely on the browser default for `hidden` */
```

### Keyboard Behavior

| Key | Action |
|-----|--------|
| Enter / Space | Open menu, move focus to first item |
| Arrow Down | Move to next menu item (wraps to first) |
| Arrow Up | Move to previous menu item (wraps to last) |
| Escape | Close menu, return focus to trigger |
| Tab | Close menu (natural tab flow continues) |
| Home | Move to first menu item |
| End | Move to last menu item |

### JavaScript Example

```javascript
class MegaMenu {
  constructor(trigger) {
    this.trigger = trigger;
    this.menu = document.getElementById(trigger.getAttribute('aria-controls'));
    this.items = Array.from(this.menu.querySelectorAll('[role="menuitem"]'));
    this.currentIndex = -1;

    this.trigger.addEventListener('click', () => this.toggle());
    this.trigger.addEventListener('keydown', (e) => this.handleTriggerKeydown(e));
    this.menu.addEventListener('keydown', (e) => this.handleMenuKeydown(e));

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.trigger.contains(e.target) && !this.menu.contains(e.target)) {
        this.close();
      }
    });
  }

  open() {
    this.trigger.setAttribute('aria-expanded', 'true');
    this.menu.removeAttribute('hidden');
    this.currentIndex = 0;
    this.items[0].focus();
  }

  close() {
    this.trigger.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('hidden', '');
    this.currentIndex = -1;
  }

  toggle() {
    this.trigger.getAttribute('aria-expanded') === 'true' ? this.close() : this.open();
  }

  handleTriggerKeydown(e) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.open();
    }
  }

  handleMenuKeydown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        this.items[this.currentIndex].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.items[this.currentIndex].focus();
        break;
      case 'Home':
        e.preventDefault();
        this.currentIndex = 0;
        this.items[0].focus();
        break;
      case 'End':
        e.preventDefault();
        this.currentIndex = this.items.length - 1;
        this.items[this.currentIndex].focus();
        break;
      case 'Escape':
        this.close();
        this.trigger.focus();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }
}

document.querySelectorAll('[aria-haspopup="true"]').forEach(
  (trigger) => new MegaMenu(trigger)
);
```

### Common Mistake

Using `display: flex` with `opacity: 0` on inactive submenus. The items are invisible but still exist in the tab order — keyboard users tab through them without seeing them, and screen readers announce them at unexpected times.

---

## Date Picker (Table-Based)

A calendar grid where users navigate days with arrow keys and select a date.

### HTML Structure

```html
<div class="datepicker" role="dialog" aria-modal="true" aria-label="Choose date">
  <div class="datepicker-header">
    <button aria-label="Previous month" id="prev-month">&#8249;</button>
    <h2 id="calendar-heading" aria-live="polite">August 2024</h2>
    <button aria-label="Next month" id="next-month">&#8250;</button>
  </div>

  <table aria-labelledby="calendar-heading">
    <thead>
      <tr>
        <th scope="col" abbr="Sunday">
          <span aria-hidden="true">S</span>
          <span class="visually-hidden">Sunday</span>
        </th>
        <th scope="col" abbr="Monday">
          <span aria-hidden="true">M</span>
          <span class="visually-hidden">Monday</span>
        </th>
        <th scope="col" abbr="Tuesday">
          <span aria-hidden="true">T</span>
          <span class="visually-hidden">Tuesday</span>
        </th>
        <th scope="col" abbr="Wednesday">
          <span aria-hidden="true">W</span>
          <span class="visually-hidden">Wednesday</span>
        </th>
        <th scope="col" abbr="Thursday">
          <span aria-hidden="true">T</span>
          <span class="visually-hidden">Thursday</span>
        </th>
        <th scope="col" abbr="Friday">
          <span aria-hidden="true">F</span>
          <span class="visually-hidden">Friday</span>
        </th>
        <th scope="col" abbr="Saturday">
          <span aria-hidden="true">S</span>
          <span class="visually-hidden">Saturday</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>
          <button
            tabindex="0"
            aria-label="August 1, 2024"
            aria-pressed="false"
          >1</button>
        </td>
        <td>
          <button
            tabindex="-1"
            aria-label="August 2, 2024"
            aria-pressed="false"
          >2</button>
        </td>
        <td>
          <button
            tabindex="-1"
            aria-label="August 3, 2024"
            aria-pressed="false"
          >3</button>
        </td>
      </tr>
      <!-- ... more rows ... -->
    </tbody>
  </table>

  <div class="datepicker-footer">
    <button id="btn-cancel">Cancel</button>
    <button id="btn-ok">OK</button>
  </div>
</div>
```

### ARIA Requirements

- `aria-label` on every day button with full date: `"August 7, 2024"` — not just `"7"` (screen reader would announce "7" with no context)
- `aria-pressed="true"` on the currently selected date
- `aria-labelledby` on `<table>` pointing to the month/year heading
- `aria-live="polite"` on month heading so month changes are announced
- `<th scope="col">` for day-of-week headers
- Full day names visually hidden alongside abbreviated visible labels — `S` is ambiguous (Saturday or Sunday); the visually-hidden span provides the full name to screen readers

### Roving Tabindex

Only one date has `tabindex="0"` at a time. All others have `tabindex="-1"`. Arrow keys move the roving index.

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### React Example with Roving Tabindex

```tsx
import { useState, useRef, useCallback } from 'react';

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
}

function DatePicker({ onSelect }: { onSelect: (date: Date) => void }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [focusedDate, setFocusedDate] = useState(new Date());
  const tableRef = useRef<HTMLTableElement>(null);

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  const moveFocus = useCallback((date: Date, delta: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + delta);
    setFocusedDate(next);

    // Update viewDate if we moved to a different month
    if (next.getMonth() !== viewDate.getMonth()) {
      setViewDate(new Date(next.getFullYear(), next.getMonth(), 1));
    }

    // Focus the button after render
    requestAnimationFrame(() => {
      const btn = tableRef.current?.querySelector<HTMLButtonElement>(
        `[data-date="${next.toISOString().split('T')[0]}"]`
      );
      btn?.focus();
    });
  }, [viewDate]);

  const handleKeyDown = (e: React.KeyboardEvent, date: Date) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        moveFocus(date, -1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        moveFocus(date, 1);
        break;
      case 'ArrowUp':
        e.preventDefault(); // MUST prevent page scroll
        moveFocus(date, -7);
        break;
      case 'ArrowDown':
        e.preventDefault(); // MUST prevent page scroll
        moveFocus(date, 7);
        break;
      case 'Home':
        e.preventDefault();
        moveFocus(date, -(date.getDay()));
        break;
      case 'End':
        e.preventDefault();
        moveFocus(date, 6 - date.getDay());
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        setSelectedDate(date);
        onSelect(date);
        break;
    }
  };

  const monthLabel = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const isFocused = (date: Date) =>
    date.toDateString() === focusedDate.toDateString();

  const isSelected = (date: Date) =>
    selectedDate && date.toDateString() === selectedDate.toDateString();

  // Build calendar grid (simplified — fills a 6-row grid)
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const cells: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayAbbr = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div role="dialog" aria-modal="true" aria-label="Choose date">
      <div className="datepicker-header">
        <button
          aria-label="Previous month"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
        >
          ‹
        </button>
        <h2 id="calendar-heading" aria-live="polite">{monthLabel}</h2>
        <button
          aria-label="Next month"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
        >
          ›
        </button>
      </div>

      <table ref={tableRef} aria-labelledby="calendar-heading">
        <thead>
          <tr>
            {dayNames.map((name, i) => (
              <th key={name} scope="col" abbr={name}>
                <span aria-hidden="true">{dayAbbr[i]}</span>
                <span className="visually-hidden">{name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((date, di) => (
                <td key={di}>
                  {date && (
                    <button
                      data-date={date.toISOString().split('T')[0]}
                      tabIndex={isFocused(date) ? 0 : -1}
                      aria-label={date.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      aria-pressed={isSelected(date) ? 'true' : 'false'}
                      onClick={() => { setSelectedDate(date); onSelect(date); }}
                      onKeyDown={(e) => handleKeyDown(e, date)}
                    >
                      {date.getDate()}
                    </button>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Critical:** `e.preventDefault()` on `ArrowUp` and `ArrowDown` is mandatory. Without it, the page scrolls while focus moves through the calendar.

---

## Slideshow / Carousel

An image slideshow with previous/next navigation, optional fullscreen mode, and automatic slide announcements.

### HTML Structure

```html
<section
  aria-roledescription="Image Slideshow"
  aria-label="Featured work"
>
  <div class="slideshow-controls">
    <button id="btn-prev" aria-label="Previous slide">&#8592;</button>
    <button id="btn-next" aria-label="Next slide">&#8594;</button>
    <button id="btn-pause" aria-label="Pause slideshow">&#9646;&#9646;</button>
    <button id="btn-fullscreen" aria-label="View fullscreen">&#x26F6;</button>
  </div>

  <div class="slideshow-track" aria-live="off">
    <figure class="slide" aria-hidden="false">
      <img src="project-alpha.jpg" alt="Project Alpha: dashboard interface showing user analytics">
      <figcaption>Project Alpha</figcaption>
    </figure>
    <figure class="slide" aria-hidden="true">
      <img src="project-beta.jpg" alt="Project Beta: mobile onboarding flow with three screens">
      <figcaption>Project Beta</figcaption>
    </figure>
    <figure class="slide" aria-hidden="true">
      <img src="project-gamma.jpg" alt="Project Gamma: e-commerce checkout redesign">
      <figcaption>Project Gamma</figcaption>
    </figure>
  </div>

  <!--
    Live region MUST exist in the DOM at page load.
    Injecting it dynamically after a user action means the
    browser won't observe it in time for the first announcement.
  -->
  <div
    id="slide-status"
    aria-live="polite"
    aria-atomic="true"
    class="visually-hidden"
  ></div>
</section>
```

### Fullscreen Mode

Fullscreen is the only context where `role="application"` is appropriate. It overrides screen reader reading/browse mode and gives the component full keyboard control — which is exactly what a fullscreen photo viewer needs.

**Do not use `role="application"` on the standard slideshow container.** It disables screen reader shortcuts users rely on to navigate the rest of the page.

```html
<!-- Standard slideshow: no role="application" -->
<section aria-roledescription="Image Slideshow" aria-label="Featured work">
  <!-- ... -->
</section>

<!-- Fullscreen overlay: role="application" acceptable here -->
<div
  id="fullscreen-overlay"
  role="application"
  aria-label="Fullscreen slideshow — press Escape to exit"
  hidden
>
  <button id="btn-exit-fullscreen" aria-label="Exit fullscreen">&#x2715;</button>
  <!-- cloned slide content -->
</div>
```

### ARIA Requirements

- `aria-roledescription="Image Slideshow"` on the section — gives screen readers a human-readable role name instead of "region"
- Live region with `aria-live="polite"` and `aria-atomic="true"` for slide change announcements
- `aria-hidden="true"` on all non-active slides
- Meaningful `alt` text on every image — describe what's actually in the image, not just the title
- `aria-label` on prev/next buttons that describes the action, not just "left arrow"

### Keyboard Behavior

| Key | Action |
|-----|--------|
| Arrow Left | Previous slide |
| Arrow Right | Next slide |
| Space | Pause / resume auto-advance |
| Escape | Exit fullscreen (fullscreen mode only) |

### JavaScript Example

```javascript
class Slideshow {
  constructor(container) {
    this.container = container;
    this.slides = Array.from(container.querySelectorAll('.slide'));
    this.status = container.querySelector('#slide-status');
    this.current = 0;
    this.autoPlay = null;

    container.querySelector('#btn-prev').addEventListener('click', () => this.prev());
    container.querySelector('#btn-next').addEventListener('click', () => this.next());
    container.querySelector('#btn-pause').addEventListener('click', () => this.togglePause());
    container.querySelector('#btn-fullscreen').addEventListener('click', () => this.enterFullscreen());

    document.getElementById('btn-exit-fullscreen')
      .addEventListener('click', () => this.exitFullscreen());

    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
      if (e.key === ' ') { e.preventDefault(); this.togglePause(); }
    });

    document.getElementById('fullscreen-overlay').addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.exitFullscreen();
    });

    this.startAutoPlay();
  }

  goTo(index) {
    this.slides[this.current].setAttribute('aria-hidden', 'true');
    this.current = (index + this.slides.length) % this.slides.length;
    this.slides[this.current].setAttribute('aria-hidden', 'false');

    // Announce slide change — update text content triggers aria-live
    const caption = this.slides[this.current].querySelector('figcaption');
    this.status.textContent = `Slide ${this.current + 1} of ${this.slides.length}: ${caption?.textContent ?? ''}`;
  }

  prev() { this.goTo(this.current - 1); }
  next() { this.goTo(this.current + 1); }

  startAutoPlay() {
    this.autoPlay = setInterval(() => this.next(), 5000);
  }

  togglePause() {
    const btn = this.container.querySelector('#btn-pause');
    if (this.autoPlay) {
      clearInterval(this.autoPlay);
      this.autoPlay = null;
      btn.textContent = '▶';
      btn.setAttribute('aria-label', 'Resume slideshow');
    } else {
      this.startAutoPlay();
      btn.textContent = '⏸';
      btn.setAttribute('aria-label', 'Pause slideshow');
    }
  }

  enterFullscreen() {
    const overlay = document.getElementById('fullscreen-overlay');
    overlay.removeAttribute('hidden');
    // Save trigger for focus restoration
    this.fullscreenTrigger = document.activeElement;
    document.getElementById('btn-exit-fullscreen').focus();
  }

  exitFullscreen() {
    const overlay = document.getElementById('fullscreen-overlay');
    overlay.setAttribute('hidden', '');
    // Return focus to the button that opened fullscreen
    this.fullscreenTrigger?.focus();
  }
}

new Slideshow(document.querySelector('[aria-roledescription="Image Slideshow"]'));
```

**Live region rule:** The `aria-live` element must be present in the DOM when the page loads. Screen readers register live regions on page load. An element injected via JavaScript after a button click won't be observed, and the first announcement will be silent.

---

## Combobox / Autocomplete

An input that filters a list of options as the user types, with full keyboard support.

### HTML Structure

```html
<div class="combobox-wrapper">
  <label id="country-label" for="country-input">Country</label>

  <div class="combobox-container">
    <input
      id="country-input"
      type="text"
      role="combobox"
      aria-expanded="false"
      aria-autocomplete="list"
      aria-controls="country-listbox"
      aria-activedescendant=""
      autocomplete="off"
      spellcheck="false"
    />

    <ul
      id="country-listbox"
      role="listbox"
      aria-labelledby="country-label"
      hidden
    >
      <li id="opt-canada" role="option" aria-selected="false">Canada</li>
      <li id="opt-denmark" role="option" aria-selected="false">Denmark</li>
      <li id="opt-finland" role="option" aria-selected="false">Finland</li>
      <li id="opt-germany" role="option" aria-selected="false">Germany</li>
      <!-- populated dynamically -->
    </ul>
  </div>
</div>
```

### ARIA Requirements

- `role="combobox"` on the `<input>` — identifies it as a combobox
- `aria-expanded` toggles between `"false"` (closed) and `"true"` (list visible)
- `aria-autocomplete="list"` — tells assistive tech that the list filters as you type
- `aria-controls` pointing to the listbox `id`
- `aria-activedescendant` set to the `id` of the currently highlighted option — screen reader announces it without moving DOM focus away from the input
- `aria-selected="true"` on the chosen option
- `role="listbox"` on the `<ul>`, `role="option"` on each `<li>`
- `aria-labelledby` on the listbox pointing to the visible label

### Keyboard Behavior

| Key | Action |
|-----|--------|
| Type | Filter list, open if closed |
| Arrow Down | Open list (if closed), move highlight to next option |
| Arrow Up | Move highlight to previous option |
| Enter | Select highlighted option, close list |
| Escape | Clear input or close list |
| Tab | Select highlighted option (if any), move focus |

### JavaScript Example

```javascript
const countries = [
  'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada',
  'Chile', 'China', 'Colombia', 'Croatia', 'Czech Republic',
  'Denmark', 'Egypt', 'Finland', 'France', 'Germany',
  'Greece', 'Hungary', 'India', 'Indonesia', 'Ireland',
  'Israel', 'Italy', 'Japan', 'Kenya', 'Malaysia',
  'Mexico', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway',
  'Peru', 'Philippines', 'Poland', 'Portugal', 'Romania',
  'Russia', 'Saudi Arabia', 'South Africa', 'South Korea', 'Spain',
  'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom',
  'United States', 'Vietnam',
];

class Combobox {
  constructor(input, listbox) {
    this.input = input;
    this.listbox = listbox;
    this.options = [];
    this.activeIndex = -1;

    this.input.addEventListener('input', () => this.onInput());
    this.input.addEventListener('keydown', (e) => this.onKeydown(e));
    this.input.addEventListener('blur', (e) => {
      // Delay to allow click on option to register
      setTimeout(() => {
        if (!this.listbox.contains(document.activeElement)) {
          this.close();
        }
      }, 150);
    });
  }

  onInput() {
    const query = this.input.value.trim().toLowerCase();
    if (!query) {
      this.close();
      return;
    }

    const matches = countries.filter((c) =>
      c.toLowerCase().startsWith(query)
    );

    this.renderOptions(matches);

    if (matches.length > 0) {
      this.open();
    } else {
      this.close();
    }
  }

  renderOptions(items) {
    this.listbox.innerHTML = '';
    this.options = items.map((text, i) => {
      const li = document.createElement('li');
      li.id = `opt-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.textContent = text;
      li.addEventListener('click', () => this.select(i));
      li.addEventListener('mouseenter', () => this.highlight(i));
      this.listbox.appendChild(li);
      return li;
    });
    this.activeIndex = -1;
    this.input.setAttribute('aria-activedescendant', '');
  }

  open() {
    this.listbox.removeAttribute('hidden');
    this.input.setAttribute('aria-expanded', 'true');
  }

  close() {
    this.listbox.setAttribute('hidden', '');
    this.input.setAttribute('aria-expanded', 'false');
    this.input.setAttribute('aria-activedescendant', '');
    this.activeIndex = -1;
  }

  highlight(index) {
    if (this.activeIndex >= 0 && this.options[this.activeIndex]) {
      this.options[this.activeIndex].setAttribute('aria-selected', 'false');
      this.options[this.activeIndex].classList.remove('highlighted');
    }

    this.activeIndex = index;

    if (index >= 0 && this.options[index]) {
      this.options[index].setAttribute('aria-selected', 'true');
      this.options[index].classList.add('highlighted');
      // aria-activedescendant on input — focus stays on input
      this.input.setAttribute('aria-activedescendant', this.options[index].id);
      // Scroll option into view if listbox scrolls
      this.options[index].scrollIntoView({ block: 'nearest' });
    }
  }

  select(index) {
    if (this.options[index]) {
      this.input.value = this.options[index].textContent;
    }
    this.close();
    this.input.focus();
  }

  onKeydown(e) {
    if (!this.listbox.hidden) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.highlight(Math.min(this.activeIndex + 1, this.options.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.highlight(Math.max(this.activeIndex - 1, 0));
          break;
        case 'Enter':
          if (this.activeIndex >= 0) {
            e.preventDefault();
            this.select(this.activeIndex);
          }
          break;
        case 'Escape':
          if (this.input.value) {
            this.input.value = '';
            this.close();
          } else {
            this.close();
          }
          break;
        case 'Tab':
          if (this.activeIndex >= 0) {
            this.select(this.activeIndex);
          } else {
            this.close();
          }
          break;
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.onInput(); // open + populate if there's a query
    }
  }
}

const input = document.getElementById('country-input');
const listbox = document.getElementById('country-listbox');
new Combobox(input, listbox);
```

### Key Points

- **Focus never leaves the input.** `aria-activedescendant` communicates which option is highlighted to screen readers without moving DOM focus. Moving focus into the listbox on each arrow press creates an awkward experience — the user can no longer type to refine the filter.
- **`aria-selected` not `aria-checked`.** Use `aria-selected` for listbox options. `aria-checked` is for checkboxes and radio buttons.
- **`autocomplete="off"` on the input** prevents browser autocomplete from overlapping the custom listbox.
- Screen readers announce highlighted options via `aria-activedescendant` automatically — no need for an additional live region.
