# Client-Side Routing Accessibility

## What Breaks

When JavaScript handles navigation instead of the browser:
- Screen readers don't announce the new "page" (no page-load event)
- Focus stays on the clicked link instead of resetting to new content
- Keyboard users don't get the fresh tab-order reset of a page load
- Open menus/dropdowns persist across "pages"

```
Browser navigation:   URL change → full parse → focus resets → title updates → SR announces
SPA navigation:       URL change → JS swap → nothing happens automatically
```

## Fix Pattern — React (Next.js)

Next.js App Router: use `usePathname()` to detect route changes, update `document.title` in the root layout, move focus to the `<h1>` after navigation.

```tsx
// app/layout.tsx — root layout handles title + focus
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // h1 is rendered by the page — query it after the route renders
    const h1 = document.querySelector('h1') as HTMLElement | null;
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: false });
    }
  }, [pathname]);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// app/about/page.tsx — each page sets its own title
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — My App',
};

export default function AboutPage() {
  return (
    <main>
      <h1>About</h1>
      {/* page content */}
    </main>
  );
}
```

> Note: When using the App Router, `metadata` exports handle `document.title` automatically. The focus shift in `layout.tsx` is the manual piece.

## Fix Pattern — React (React Router)

Use `useLocation()` to watch route changes, update the title, and shift focus to the main content heading.

```tsx
// src/components/RouteChangeAnnouncer.tsx
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteChangeAnnouncerProps {
  title: string; // Pass the current page title as a prop
}

export function RouteChangeAnnouncer({ title }: RouteChangeAnnouncerProps) {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Update document title
    document.title = title;

    // Shift focus to h1
    const h1 = document.querySelector('h1') as HTMLElement | null;
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: false });
    }
  }, [location.pathname]);

  return null;
}
```

```tsx
// src/App.tsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { RouteChangeAnnouncer } from './components/RouteChangeAnnouncer';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home — My App',
  '/about': 'About — My App',
  '/contact': 'Contact — My App',
};

function App() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'My App';

  return (
    <>
      <RouteChangeAnnouncer title={title} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </>
  );
}
```

## Fix Pattern — Vue (Vue Router)

Use `router.afterEach` in the router config. Update the title and use `nextTick` to wait for the DOM before shifting focus.

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { nextTick } from 'vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/views/HomeView.vue'), meta: { title: 'Home — My App' } },
    { path: '/about', component: () => import('@/views/AboutView.vue'), meta: { title: 'About — My App' } },
  ],
});

let isFirstNavigation = true;

router.afterEach((to) => {
  // Update title
  const title = to.meta.title as string | undefined;
  if (title) document.title = title;

  // Skip focus management on first load — browser handles it
  if (isFirstNavigation) {
    isFirstNavigation = false;
    return;
  }

  // Wait for DOM update before focusing
  nextTick(() => {
    const h1 = document.querySelector('h1') as HTMLElement | null;
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: false });
    }
  });
});

export default router;
```

## Fix Pattern — Vanilla JS

Listen for `popstate` (back/forward) and intercept link clicks to handle `pushState` navigation.

```javascript
// router.js
function handleRouteChange(path) {
  // Update title (fetch or derive from route map)
  const titles = {
    '/': 'Home — My App',
    '/about': 'About — My App',
  };
  document.title = titles[path] ?? 'My App';

  // Render new content (your rendering logic here)
  renderPage(path);

  // After rendering, focus the h1
  requestAnimationFrame(() => {
    const h1 = document.querySelector('h1');
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: false });
    }
  });
}

// Back/forward navigation
window.addEventListener('popstate', () => {
  handleRouteChange(window.location.pathname);
});

// Intercept link clicks
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;

  const url = new URL(link.href);
  // Only intercept same-origin, non-download links
  if (url.origin !== location.origin || link.hasAttribute('download')) return;

  event.preventDefault();
  history.pushState(null, '', url.pathname);
  handleRouteChange(url.pathname);
});
```

## Focus Strategy Decision Table

| Strategy | When to Use | Code |
|----------|-------------|------|
| Focus page heading (h1) | Most common, good default | `h1.setAttribute('tabindex', '-1'); h1.focus()` |
| Focus main element | When no heading exists | `main.setAttribute('tabindex', '-1'); main.focus()` |
| Reset to top of page | When mimicking full page refresh | Focus the skip-link target `#main-content` |
| Live region announcement | When focus move would be disorienting | Inject text into an existing `aria-live="polite"` region |

> Always use `tabindex="-1"` on the target element. Without it, `focus()` on non-interactive elements is ignored by some browsers, and the element won't receive keyboard focus programmatically.

## Menu State Reset

Client-side routing doesn't trigger a page refresh, so open menus/dropdowns persist unless explicitly cleared. Reset menu state in the same hook that handles focus.

```tsx
// React + React Router example
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function useMenuReset(setMenuOpen: (open: boolean) => void) {
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
}

// Usage in your nav component
function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  useMenuReset(setMenuOpen);

  return (
    <nav>
      <button
        aria-expanded={menuOpen}
        aria-controls="nav-menu"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        Menu
      </button>
      <ul id="nav-menu" hidden={!menuOpen}>
        {/* nav links */}
      </ul>
    </nav>
  );
}
```

```typescript
// Vue Router version — reset in router.afterEach
import { useMenuStore } from '@/stores/menu';

router.afterEach(() => {
  const menu = useMenuStore();
  menu.closeAll();
});
```

## Testing Client-Side Routing

### With Cypress

```javascript
// cypress/e2e/routing.cy.ts
describe('Client-side routing', () => {
  it('updates document title on navigation', () => {
    cy.visit('/');
    cy.title().should('eq', 'Home — My App');

    cy.get('a[href="/about"]').click();
    cy.title().should('eq', 'About — My App');
  });

  it('moves focus to h1 after navigation', () => {
    cy.visit('/');
    cy.get('a[href="/about"]').click();

    // Focus should land on the h1 of the new page
    cy.focused().should('match', 'h1');
    cy.focused().should('contain', 'About');
  });

  it('handles back/forward navigation', () => {
    cy.visit('/');
    cy.get('a[href="/about"]').click();
    cy.go('back');

    cy.title().should('eq', 'Home — My App');
    cy.focused().should('match', 'h1');
  });

  it('closes open menus on navigation', () => {
    cy.visit('/');
    cy.get('[aria-controls="nav-menu"]').click();
    cy.get('#nav-menu').should('be.visible');

    cy.get('a[href="/about"]').click();
    cy.get('#nav-menu').should('not.be.visible');
  });
});
```

### With Screen Reader

Manual test checklist — run after implementing a fix:

1. Navigate to any page, note the SR announcement
2. Click a navigation link (don't use the keyboard yet — isolate the focus issue)
3. Confirm: SR announces the new page heading or page title
4. Confirm: Focus is on the `<h1>` of the new page (not the link you clicked)
5. Press Tab — confirm the tab order flows logically from the heading
6. Use SR's heading navigation (H key in NVDA/JAWS, VO+Command+H in VoiceOver)
7. Confirm the heading structure of the new page is correct
8. Use browser back button — confirm SR announces the previous page

Browsers + SR pairings to test: NVDA + Chrome, JAWS + Chrome, VoiceOver + Safari (macOS), TalkBack + Chrome (Android).

## Best Practice

Let pages refresh when you can. A plain `<a href>` beats a JS-handled `<Link>` when full SPA behavior isn't needed. The browser handles focus reset, title changes, and screen reader announcements automatically — no code required.

```
Use <a href>  →  browser navigation  →  everything works for free
Use <Link>    →  JS navigation       →  you own focus, title, and announcements
```

Only opt into client-side routing when the UX benefit (instant transitions, preserved state) is worth the accessibility work it creates.
