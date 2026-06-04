# voyage.moe Design Spec

## Goal

Build and publish the first version of `voyage.moe` as a polished static landing page.

The site should feel like a clear, healing moe-style entry point: light, quiet, slightly ACG, and mature rather than childish. This first release is a placeholder card for the domain, with structure that can later grow into a personal homepage, worldbuilding entrance, and content site.

## Assumptions

- Current release is a single-page site.
- No backend, CMS, login, comments, or admin interface are needed for v1.
- Future sections should be visible as intentional placeholders, not broken or empty pages.
- Deployment target is Vercel production, with `voyage.moe` bound as the custom domain.
- If GitHub, Vercel, or DNS authentication is unavailable locally, the implementation will pause at the smallest necessary authorization step.

## Page Structure

The first screen is the product, not a marketing prelude.

- Top navigation: compact `voyage.moe` wordmark and a small set of anchor links.
- Hero: site name, short poetic subtitle, and a small action/link area.
- Future-entry band: four lightweight placeholders for `Profile`, `Notes`, `Gallery`, and `Links`.
- Footer: minimal status line or copyright-style note.

The hero should leave a hint of the future-entry band visible on desktop and mobile so the page feels alive beyond the first viewport.

## Visual Direction

Use a clear healing palette: sky blue, soft mint, white, and tiny pink accents. The page may use soft cloud/light motifs, but should avoid heavy gradients, childish candy colors, busy stickers, and one-note purple or beige themes.

The mood should suggest an anime-inspired travel doorway: transparent air, quiet light, and gentle motion. Any decoration must support the content and should not cover text.

## Interaction

Keep interactions simple:

- Subtle hover/focus states for links and cards.
- Optional slow ambient motion for background elements.
- Respect reduced-motion preferences.
- No interaction should be required to understand the page.

## Technical Approach

Use a static frontend that deploys cleanly to Vercel. Preferred stack: Vite + React + CSS.

This gives enough structure for future pages while keeping v1 small. The implementation should avoid routing complexity until there are real pages to route to.

Expected files:

- `package.json` with build/dev scripts.
- Vite entry files under `src/`.
- A focused stylesheet for the single page.
- `vercel.json` only if needed for static routing or domain behavior.

## Accessibility And Responsive Requirements

- Layout must work on mobile and desktop.
- Text must not overlap or overflow its containers.
- Links and controls need visible focus states.
- Color contrast must stay readable over decorative backgrounds.
- Decorative images or effects must not be the only source of meaning.

## Verification

Before claiming completion:

- Install dependencies if needed.
- Run local build.
- Run local preview/dev server and visually check desktop and mobile.
- Deploy to Vercel production.
- Confirm the production deployment is ready.
- Confirm `voyage.moe` is attached or report the exact DNS/account action still required.

## Out Of Scope For V1

- Blog/content CMS.
- User accounts.
- Comments.
- Analytics dashboards.
- Full illustration asset pipeline.
- Multiple real pages beyond the first landing page.
