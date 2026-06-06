# Site Experience Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the public site chrome by shortening the header navigation, moving secondary links into the footer, folding version/update context into About, and replacing the inline theme strip with a compact popup picker.

**Architecture:** Keep the refactor inside the existing static portal structure. Split navigation data into primary and secondary arrays in content config, update shared header/footer composition, evolve the current theme switcher into a compact disclosure control, and add focused tests around the new rendering and interaction behavior.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Testing Library, global CSS

---

## File Structure

- Modify: `src/content/site.ts`
  - Separate primary navigation, footer navigation, and theme metadata.
- Modify: `src/components/SiteHeader.tsx`
  - Render the reduced primary navigation and compact theme picker trigger.
- Modify: `src/components/SiteFooter.tsx`
  - Render the new secondary navigation set.
- Modify: `src/components/ThemeSwitcher.tsx`
  - Convert inline theme strip into trigger + popup panel behavior.
- Modify: `src/components/ThemeSwitcher.test.tsx`
  - Cover popup interaction and theme selection.
- Create: `src/components/SiteChrome.test.tsx`
  - Cover header/footer link rendering after the navigation split.
- Modify: `src/app/about/page.tsx`
  - Add the short `Version & updates` section.
- Create: `src/app/about/page.test.tsx`
  - Cover the new About content.
- Modify: `src/app/globals.css`
  - Style the shorter header, footer secondary links, and compact theme picker panel.

### Task 1: Split Navigation Into Primary And Secondary Sets

**Files:**
- Modify: `src/content/site.ts`
- Modify: `src/components/SiteHeader.tsx`
- Modify: `src/components/SiteFooter.tsx`
- Test: `src/components/SiteChrome.test.tsx`

- [ ] **Step 1: Write the failing chrome rendering test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

vi.mock("./ThemeProvider", () => ({
  useTheme: () => ({
    theme: "clear",
    setTheme: () => undefined,
  }),
}));

describe("site chrome", () => {
  test("keeps only primary links in the header and moves secondary links to the footer", () => {
    render(
      <>
        <SiteHeader />
        <SiteFooter />
      </>,
    );

    const headerNav = screen.getByRole("navigation", { name: /primary navigation/i });
    const footerNav = screen.getByRole("navigation", { name: /footer links/i });

    expect(within(headerNav).getByRole("link", { name: "Blog" })).toBeInTheDocument();
    expect(within(headerNav).getByRole("link", { name: "Projects" })).toBeInTheDocument();
    expect(within(headerNav).queryByRole("link", { name: "Updates" })).not.toBeInTheDocument();

    expect(within(footerNav).getByRole("link", { name: "Updates" })).toBeInTheDocument();
    expect(within(footerNav).getByRole("link", { name: "Archive" })).toBeInTheDocument();
    expect(within(footerNav).getByRole("link", { name: "Friends" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the targeted test to confirm the current header/footer fail**

Run: `npx vitest run src/components/SiteChrome.test.tsx`

Expected: FAIL because the new test file exists but the current shared components still render the old navigation structure.

- [ ] **Step 3: Update the navigation data model**

```ts
export const primaryNavigationItems = [
  { label: "Blog", href: "/blog" },
  { label: "Projects", href: "/projects" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
];

export const secondaryNavigationItems = [
  { label: "Archive", href: "/archive" },
  { label: "Friends", href: "/friends" },
  { label: "Updates", href: "/updates" },
];
```

- [ ] **Step 4: Point header and footer at the new navigation sets**

```tsx
import { primaryNavigationItems, site } from "@/content/site";

{primaryNavigationItems.map((item) => (
  <Link href={item.href} key={item.href}>
    {item.label}
  </Link>
))}
```

```tsx
import { secondaryNavigationItems, site } from "@/content/site";

<nav aria-label="Footer links">
  {secondaryNavigationItems.map((item) => (
    <Link href={item.href} key={item.href}>
      {item.label}
    </Link>
  ))}
  <Link href="/rss.xml">RSS</Link>
  <a href={`mailto:${site.email}`}>{site.email}</a>
</nav>
```

- [ ] **Step 5: Re-run the targeted chrome test**

Run: `npx vitest run src/components/SiteChrome.test.tsx`

Expected: PASS with the header showing only primary links and the footer carrying the secondary set.

- [ ] **Step 6: Commit the navigation split**

```bash
git add src/content/site.ts src/components/SiteHeader.tsx src/components/SiteFooter.tsx src/components/SiteChrome.test.tsx
git commit -m "refactor: simplify site navigation"
```

### Task 2: Replace The Inline Theme Strip With A Compact Popup Picker

**Files:**
- Modify: `src/components/ThemeSwitcher.tsx`
- Modify: `src/components/ThemeSwitcher.test.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write failing theme picker interaction tests**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ThemeSwitcher } from "./ThemeSwitcher";

describe("ThemeSwitcher", () => {
  test("opens the theme panel from a compact trigger", () => {
    render(<ThemeSwitcher theme="clear" onThemeChange={() => undefined} />);

    expect(screen.queryByRole("button", { name: /voyage/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /choose theme/i }));

    expect(screen.getByRole("button", { name: /voyage/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /archive/i })).toBeInTheDocument();
  });

  test("applies the chosen theme and closes the panel", () => {
    const onThemeChange = vi.fn();
    render(<ThemeSwitcher theme="clear" onThemeChange={onThemeChange} />);

    fireEvent.click(screen.getByRole("button", { name: /choose theme/i }));
    fireEvent.click(screen.getByRole("button", { name: /night/i }));

    expect(onThemeChange).toHaveBeenCalledWith("night");
    expect(screen.queryByRole("button", { name: /archive/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the targeted theme test to verify the current inline switcher fails**

Run: `npx vitest run src/components/ThemeSwitcher.test.tsx`

Expected: FAIL because the current component renders the full theme row immediately and does not expose an open/close trigger.

- [ ] **Step 3: Implement the compact disclosure behavior**

```tsx
const [isOpen, setIsOpen] = useState(false);

return (
  <div className="theme-picker">
    <button
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-label="Choose theme"
      className="theme-trigger"
      onClick={() => setIsOpen((open) => !open)}
      type="button"
    >
      <span className={`theme-swatch theme-swatch-${theme}`} aria-hidden="true" />
      <span className="sr-only">Choose theme</span>
    </button>
    {isOpen ? (
      <div className="theme-panel" role="dialog" aria-label="Theme options">
        {themeOptions.map((option) => (
          <button
            className="theme-button"
            data-active={theme === option.id}
            key={option.id}
            onClick={() => {
              onThemeChange(option.id);
              setIsOpen(false);
            }}
            type="button"
          >
            <span className={`theme-swatch theme-swatch-${option.id}`} aria-hidden="true" />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    ) : null}
  </div>
);
```

- [ ] **Step 4: Update the shared styles for the compact picker**

```css
.theme-picker {
  position: relative;
  justify-self: end;
}

.theme-trigger {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
}

.theme-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 220px;
  display: grid;
  gap: 6px;
  padding: 8px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface-strong);
  box-shadow: var(--shadow);
  z-index: 20;
}
```

- [ ] **Step 5: Re-run the theme picker tests**

Run: `npx vitest run src/components/ThemeSwitcher.test.tsx`

Expected: PASS with the compact trigger rendering first and theme choice closing the popup.

- [ ] **Step 6: Commit the theme picker refactor**

```bash
git add src/components/ThemeSwitcher.tsx src/components/ThemeSwitcher.test.tsx src/app/globals.css
git commit -m "feat: add compact theme picker"
```

### Task 3: Fold Version And Update Context Into About

**Files:**
- Modify: `src/app/about/page.tsx`
- Create: `src/app/about/page.test.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write the failing About page content test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import AboutPage from "./page";

describe("AboutPage", () => {
  test("explains version and update history without making versions a top-level nav item", () => {
    render(<AboutPage />);

    expect(screen.getByRole("heading", { name: /version & updates/i })).toBeInTheDocument();
    expect(screen.getByText(/downloadable tagged releases remain available/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /versions/i })).toHaveAttribute("href", "/versions");
    expect(screen.getByRole("link", { name: /updates/i })).toHaveAttribute("href", "/updates");
  });
});
```

- [ ] **Step 2: Run the targeted About test to confirm it fails**

Run: `npx vitest run src/app/about/page.test.tsx`

Expected: FAIL because the current About page does not render the new version/update summary section.

- [ ] **Step 3: Add the short site-status section to About**

```tsx
<section className="about-section">
  <h2>Version & updates</h2>
  <p>
    voyage.moe is being iterated as a long-term home for writing, projects, and future community features.
    Major site changes are summarized in <Link href="/updates">Updates</Link>, while downloadable tagged
    releases remain available on the <Link href="/versions">Versions</Link> page.
  </p>
</section>
```

- [ ] **Step 4: Add minimal styling for the new section**

```css
.about-section {
  display: grid;
  gap: 10px;
  padding-top: 6px;
}

.about-section h2 {
  margin: 0;
  font-size: 1.2rem;
}
```

- [ ] **Step 5: Run About, typecheck, test, and build verification**

Run: `npx vitest run src/app/about/page.test.tsx`
Expected: PASS

Run: `npm test`
Expected: PASS

Run: `npm run typecheck`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit the About refresh**

```bash
git add src/app/about/page.tsx src/app/about/page.test.tsx src/app/globals.css
git commit -m "feat: refresh site experience about page"
```

## Self-Review

- Spec coverage: header simplification, footer migration, About summary, and compact theme picker each have a dedicated task.
- Placeholder scan: no `TODO`, `TBD`, or abstract "add tests later" language remains.
- Type consistency: navigation items stay `{ label, href }`, theme IDs stay aligned with the existing `ThemeId` union, and About links still target the existing `/updates` and `/versions` routes.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-05-site-experience-refresh.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
