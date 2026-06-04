# voyage.moe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish the first `voyage.moe` static landing page as a clear healing moe-style placeholder site.

**Architecture:** Use a small Vite + React static app with one focused React component and one stylesheet. The page is a single landing experience with visible future-entry placeholders, no router, and no backend.

**Tech Stack:** Vite, React, TypeScript, CSS, Vercel.

---

## File Structure

- Create `package.json`: project metadata and scripts for `dev`, `build`, and `preview`.
- Create `index.html`: Vite HTML shell and document metadata.
- Create `src/main.tsx`: React entry point.
- Create `src/App.tsx`: single page content, navigation, hero, future placeholders, and footer.
- Create `src/styles.css`: global styles, responsive layout, ambient visuals, focus states, and reduced-motion handling.
- Create `tsconfig.json`: TypeScript compiler settings for the app.
- Create `tsconfig.node.json`: TypeScript settings for Vite config.
- Create `vite.config.ts`: Vite React plugin config.

No `vercel.json` is planned because Vercel can auto-detect and deploy the Vite static build.

## Task 1: Scaffold The Static App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "voyage-moe",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 127.0.0.1"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.3",
    "vite": "^6.0.5",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {}
}
```

- [ ] **Step 2: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="voyage.moe is a clear, healing moe-style doorway for future notes, profile, gallery, and links."
    />
    <title>voyage.moe</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create TypeScript and Vite config files**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 4: Create `src/main.tsx`**

```tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and npm exits successfully.

## Task 2: Build The Landing Page Content

**Files:**
- Create: `src/App.tsx`

- [ ] **Step 1: Create `src/App.tsx`**

```tsx
const futureEntries = [
  {
    label: "Profile",
    title: "traveler profile",
    description: "A quiet place for who I am, what I make, and where to find me.",
  },
  {
    label: "Notes",
    title: "soft logbook",
    description: "Small observations, dev notes, and gentle records from the road.",
  },
  {
    label: "Gallery",
    title: "sky archive",
    description: "Images, moods, screenshots, and collected fragments of light.",
  },
  {
    label: "Links",
    title: "signal ports",
    description: "Social links, projects, and doorways to future corners.",
  },
];

export default function App() {
  return (
    <main className="site-shell" id="top">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="skyline" aria-hidden="true" />

      <header className="site-header" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="voyage.moe home">
          voyage.moe
        </a>
        <nav className="nav-links">
          <a href="#profile">Profile</a>
          <a href="#notes">Notes</a>
          <a href="#links">Links</a>
        </nav>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">clear skies, soft signals</p>
        <h1 id="hero-title">voyage.moe</h1>
        <p className="hero-copy">
          A quiet little harbor for future notes, pictures, projects, and the
          gentle weather between worlds.
        </p>
        <div className="hero-actions" aria-label="Primary links">
          <a className="primary-link" href="#future">
            See the map
          </a>
          <a className="secondary-link" href="mailto:hello@voyage.moe">
            hello@voyage.moe
          </a>
        </div>
      </section>

      <section className="future-panel" id="future" aria-label="Future sections">
        {futureEntries.map((entry) => (
          <article className="future-card" id={entry.label.toLowerCase()} key={entry.label}>
            <p>{entry.label}</p>
            <h2>{entry.title}</h2>
            <span>{entry.description}</span>
          </article>
        ))}
      </section>

      <footer className="site-footer">
        <span>currently drifting into shape</span>
        <span>v0.1</span>
      </footer>
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript can resolve component imports**

Run: `npm run build`

Expected before styling exists: FAIL with a missing `./styles.css` error if Task 1 imported it and Task 3 has not created it yet. This confirms the React entry point is wired.

## Task 3: Add Visual Design And Responsive Styles

**Files:**
- Create: `src/styles.css`

- [ ] **Step 1: Create `src/styles.css`**

```css
:root {
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  color: #24435f;
  background: #eaf8ff;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  --sky: #8bd2ff;
  --mint: #9de8d8;
  --ink: #24435f;
  --soft-ink: #5d7f98;
  --petal: #ffb8cf;
  --paper: rgba(255, 255, 255, 0.72);
  --line: rgba(79, 142, 176, 0.22);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  overflow-x: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

a:focus-visible {
  outline: 3px solid rgba(255, 184, 207, 0.8);
  outline-offset: 5px;
}

.site-shell {
  position: relative;
  min-height: 100vh;
  padding: 28px clamp(18px, 4vw, 52px) 24px;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.95) 0 11%, transparent 12%),
    radial-gradient(circle at 74% 20%, rgba(157, 232, 216, 0.4) 0 13%, transparent 14%),
    linear-gradient(160deg, #f8fdff 0%, #dff5ff 44%, #f8fbff 100%);
}

.ambient {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(2px);
}

.ambient-one {
  width: 36vw;
  height: 36vw;
  right: -12vw;
  top: 10vh;
  background: rgba(139, 210, 255, 0.26);
}

.ambient-two {
  width: 24vw;
  height: 24vw;
  left: -8vw;
  bottom: 12vh;
  background: rgba(255, 184, 207, 0.2);
}

.skyline {
  position: absolute;
  inset: auto -8vw 0;
  height: 28vh;
  min-height: 180px;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 20% 78%, rgba(255, 255, 255, 0.9) 0 14%, transparent 15%),
    radial-gradient(ellipse at 38% 88%, rgba(255, 255, 255, 0.8) 0 18%, transparent 19%),
    radial-gradient(ellipse at 62% 82%, rgba(255, 255, 255, 0.86) 0 16%, transparent 17%),
    radial-gradient(ellipse at 82% 90%, rgba(255, 255, 255, 0.72) 0 18%, transparent 19%);
  opacity: 0.82;
}

.site-header,
.hero,
.future-panel,
.site-footer {
  position: relative;
  z-index: 1;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 1120px;
  margin: 0 auto;
}

.brand {
  font-weight: 750;
  letter-spacing: 0;
  color: var(--ink);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: clamp(12px, 3vw, 28px);
  color: var(--soft-ink);
  font-size: 0.94rem;
}

.nav-links a,
.secondary-link {
  border-bottom: 1px solid transparent;
  transition: border-color 180ms ease, color 180ms ease;
}

.nav-links a:hover,
.secondary-link:hover {
  color: var(--ink);
  border-color: rgba(36, 67, 95, 0.35);
}

.hero {
  display: grid;
  align-content: center;
  min-height: 68vh;
  max-width: 780px;
  margin: 0 auto;
  padding: clamp(80px, 15vh, 150px) 0 clamp(42px, 8vh, 72px);
  text-align: center;
}

.eyebrow {
  margin: 0 0 14px;
  color: #4f91a9;
  font-size: clamp(0.82rem, 2vw, 0.95rem);
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--ink);
  font-size: clamp(3.2rem, 12vw, 7.8rem);
  line-height: 0.95;
  letter-spacing: 0;
}

.hero-copy {
  max-width: 620px;
  margin: 26px auto 0;
  color: var(--soft-ink);
  font-size: clamp(1rem, 2.2vw, 1.22rem);
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 34px;
}

.primary-link,
.secondary-link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-link {
  padding: 0 22px;
  border: 1px solid rgba(36, 67, 95, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 16px 40px rgba(72, 143, 184, 0.18);
  color: var(--ink);
  font-weight: 700;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.primary-link:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 48px rgba(72, 143, 184, 0.24);
}

.secondary-link {
  color: var(--soft-ink);
}

.future-panel {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  max-width: 1120px;
  margin: 0 auto;
}

.future-card {
  min-height: 180px;
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--paper);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 44px rgba(85, 148, 176, 0.12);
}

.future-card p {
  margin: 0 0 28px;
  color: #549cb2;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.future-card h2 {
  margin: 0 0 12px;
  color: var(--ink);
  font-size: 1.05rem;
  letter-spacing: 0;
}

.future-card span {
  display: block;
  color: var(--soft-ink);
  font-size: 0.94rem;
  line-height: 1.65;
}

.site-footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  max-width: 1120px;
  margin: 34px auto 0;
  color: rgba(93, 127, 152, 0.78);
  font-size: 0.88rem;
}

@media (max-width: 820px) {
  .site-header {
    align-items: flex-start;
  }

  .nav-links {
    gap: 12px;
    font-size: 0.88rem;
  }

  .hero {
    min-height: 62vh;
    padding-top: 72px;
  }

  .future-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .site-shell {
    padding: 22px 16px 20px;
  }

  .site-header {
    flex-direction: column;
    gap: 14px;
  }

  .nav-links {
    width: 100%;
    justify-content: space-between;
  }

  .hero {
    min-height: 58vh;
    padding: 58px 0 34px;
    text-align: left;
  }

  .hero-actions {
    justify-content: flex-start;
  }

  .future-panel {
    grid-template-columns: 1fr;
  }

  .site-footer {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: PASS. Vite writes the static build to `dist/`.

## Task 4: Local Visual Verification

**Files:**
- Modify only if verification finds a concrete bug in `src/App.tsx` or `src/styles.css`.

- [ ] **Step 1: Start local dev server**

Run: `npm run dev`

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 2: Check desktop viewport**

Open the local URL in the browser at about `1440x900`.

Expected:
- The brand and navigation are visible.
- The hero reads clearly.
- The future-entry band is visible below the hero.
- No text overlaps decorative backgrounds.

- [ ] **Step 3: Check mobile viewport**

Use a browser viewport around `390x844`.

Expected:
- Navigation wraps into a clean compact layout.
- Hero text fits without horizontal scrolling.
- Future cards stack in one column.
- Buttons/links remain readable and tappable.

- [ ] **Step 4: Fix any visual issue surgically**

If the hero consumes the whole first screen on mobile, reduce `.hero` `min-height` or padding in `src/styles.css`. If cards crowd on tablet, adjust the breakpoint in the `@media (max-width: 820px)` block.

- [ ] **Step 5: Re-run build after fixes**

Run: `npm run build`

Expected: PASS.

## Task 5: Commit The Website

**Files:**
- Stage only files created for the static app and dependency lockfile.

- [ ] **Step 1: Inspect worktree**

Run: `git status -sb`

Expected: Newly created app files are listed. `.superpowers/` remains ignored.

- [ ] **Step 2: Stage intended files**

Run:

```bash
git add package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts src/main.tsx src/App.tsx src/styles.css
```

Expected: only app files are staged.

- [ ] **Step 3: Commit**

Run:

```bash
git commit -m "Build voyage.moe landing page"
```

Expected: commit succeeds.

## Task 6: Deploy To Vercel And Attach Domain

**Files:**
- Modify no source files unless Vercel requires a config change.

- [ ] **Step 1: Check Vercel CLI availability**

Run: `vercel --version`

Expected: a Vercel CLI version prints. If not installed, install or use `npx vercel`.

- [ ] **Step 2: Deploy production build**

Run: `npx vercel --prod --yes`

Expected: Vercel returns a production deployment URL with READY status or a build URL to inspect.

- [ ] **Step 3: Add custom domain**

Run: `npx vercel domains add voyage.moe`

Expected: either the domain is already configured, or Vercel prints the DNS records needed for `voyage.moe`.

- [ ] **Step 4: Verify deployment**

Run: `npx vercel inspect <deployment-url>`

Expected: status is READY.

- [ ] **Step 5: Verify domain**

Open or query `https://voyage.moe`.

Expected: the deployed page is served. If DNS has not propagated, report the exact Vercel DNS instructions and the production deployment URL.
