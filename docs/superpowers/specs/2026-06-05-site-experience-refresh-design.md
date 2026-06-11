# voyage.moe Site Experience Refresh Design

## Goal

Simplify the public site chrome so the header feels calmer, the About page carries low-frequency site information, and theme switching becomes compact enough for both desktop and mobile without losing the existing multi-theme identity.

## Scope

This design covers only public-facing experience changes for the current static portal:

- Reduce primary navigation to high-frequency destinations.
- Move low-frequency links into the footer.
- Merge version/update context into the About page as a short site-status section.
- Replace the always-expanded theme switcher with a small trigger that opens a compact selection panel.

This design does not add admin tools, accounts, comments, database storage, or any backend-only systems.

## Current Context

The site already has a stable static content structure with a shared header, footer, About page, and a four-theme system. The main friction is not capability; it is density:

- The header contains too many links for a calm first scan.
- The theme control is always visible and competes with navigation width.
- Versions and updates are split into separate top-level ideas even though they are support information rather than primary reading destinations.

## Recommended Approach

Use a "lightweight consolidation" pass:

1. Keep only the most-used reading and browsing destinations in the header.
2. Treat the footer as the home for secondary links and utility destinations.
3. Turn About into the single public summary of what the site is, where it is heading, and how version/update history is exposed.
4. Preserve the current theme system, but present it through a button-triggered popup panel instead of an inline row.

This approach keeps the site visibly simpler right away while preserving the current content routes and leaving room for a later admin phase.

## Information Architecture

### Header

The primary header should keep four links:

- `Blog`
- `Projects`
- `Gallery`
- `About`

`Archive`, `Friends`, `Updates`, and `Versions` should leave the top nav. `Archive` can remain discoverable from the home page and search results without competing for constant header space. `Updates` and `Versions` become support information. `Friends` becomes a footer-level destination.

The header should continue to show the site brand and should add a compact theme trigger on the right.

### Footer

The footer should become the low-frequency navigation area and include:

- `Archive`
- `Friends`
- `Updates`
- `RSS`
- contact email

If source/release links are already available elsewhere, they should stay out of the footer for now to avoid reintroducing density.

### About

The About page should stay editorial and short. Add a concise section such as `Version & updates` that explains:

- the site is under active long-term iteration,
- major changes are reflected in the updates stream,
- downloadable tagged releases remain available through the versions route.

The versions route may continue to exist for direct linking and downloads, but it should no longer be emphasized as a top-level navigation item.

## Theme Picker

Replace the current always-open row of theme buttons with a compact disclosure component:

- Closed state: one small button in the header with a clear accessible label.
- Open state: a small popup panel anchored to the trigger.
- Panel content: existing theme swatches, names, and short descriptions.
- Selection behavior: keep the current persistence logic and immediate theme application.
- Dismiss behavior: allow closing via trigger toggle, selecting a theme, and clicking outside or pressing Escape if the current local patterns make that practical without overbuilding.

The visual goal is quiet utility, not a large modal. The component should feel like a small control surface that can later grow to include options such as `System`.

## Component Boundaries

Keep the refactor surgical:

- Content structure in `src/content/site.ts` should separate primary and secondary navigation data.
- Header composition stays in the existing header component.
- Footer composition stays in the existing footer component.
- Theme UI can evolve from the existing switcher into a compact picker component or a small set of closely related components.

No broad layout rewrite is needed.

## Accessibility And Behavior

- The new theme trigger must have an explicit accessible name.
- The popup panel should expose enough semantics for keyboard use and current selection state.
- Navigation changes must not reduce access to existing pages; they only change prominence.
- Mobile layouts should avoid horizontal pressure in the header.

## Testing

Add focused coverage for:

- header and footer link rendering after the navigation split,
- theme picker open/close and theme selection behavior,
- About page content rendering for the new version/update summary.

Existing typecheck, tests, and production build should still pass after the refactor.

## Success Criteria

- The top navigation is visibly shorter and easier to scan on desktop and mobile.
- Theme switching no longer occupies a full inline strip in the header.
- About explains version/update status without making versions a primary destination.
- No existing public route is removed.
