# voyage.moe Next.js Content Portal Design Spec

## Goal

Migrate `voyage.moe` from the current Vite single-page landing site into a long-term Next.js content portal.

Phase 1 builds a static, responsive front-facing site with Markdown-managed content, four layout-level themes, search, RSS, archive pages, and content sections. It must not include backend management, user registration, login, comments, database storage, or upload features yet.

## Assumptions

- The long-term project direction is Next.js.
- Phase 1 remains static-first and deploys from GitHub to Vercel.
- Content is maintained in the repository through Markdown or typed config files.
- The current `voyage.moe` identity should become cleaner, calmer, and more spacious while preserving a natural, clear feeling.
- Future backend, auth, and database work should be possible without redesigning the front-end information architecture.
- GitHub is the source of truth for deployment: update GitHub first, then let Vercel publish from the repository.

## Phase 1 Scope

Build these user-facing sections:

- Home portal
- Blog index
- Blog article detail
- Archive
- Gallery
- Projects
- Friends
- Updates
- About
- RSS feed
- Site search
- Theme switcher

Do not build:

- Admin dashboard
- Registration or login
- Comments, likes, bookmarks, or notifications
- Database-backed content
- Media upload workflows
- User profile pages

## Information Architecture

The home page should act as a content portal, not a marketing landing page. It should surface the newest and most important parts of the site in a scan-friendly layout:

- Hero identity block
- Featured article
- Latest posts
- Recent updates
- Gallery preview
- Project preview
- Friends preview

Primary routes:

- `/`
- `/blog`
- `/blog/[slug]`
- `/archive`
- `/gallery`
- `/projects`
- `/friends`
- `/updates`
- `/about`
- `/rss.xml`

Optional filtered views may be added if they stay static:

- `/tags/[tag]`
- `/categories/[category]`

## Content Model

Blog posts should be stored under `content/blog/` as Markdown or MDX. Each post should support frontmatter fields:

- `title`
- `description`
- `date`
- `updated`
- `tags`
- `category`
- `cover`
- `featured`
- `draft`

Gallery, projects, friends, and updates may start as typed config files under `src/content/` or `content/`. Their shape should be explicit and easy to migrate later.

Suggested models:

- Gallery item: title, description, date, image, tags.
- Project item: title, description, status, url, repo, tags.
- Friend item: name, description, url, avatar.
- Update item: date, title, body, type.

Draft content should not render in production.

## Theme System

Phase 1 includes four layout-level themes. Theme switching must change more than colors: background treatment, density, card surfaces, navigation feel, and content rhythm should shift.

Themes:

- `Clear`: default, spacious, minimal, natural, editorial.
- `Voyage`: airy sky-inspired treatment, softer surfaces, gentle travel mood.
- `Night`: dark long-form reading theme with calmer contrast and fewer bright surfaces.
- `Archive`: denser index and notebook/catalog feeling for browsing saved material.

The selected theme should persist in `localStorage`. The site should respect system dark preference only as an initial hint, not override an explicit user choice.

Theme implementation should avoid duplicating page components. Use shared page structure with theme tokens and controlled layout variants.

## Responsive Requirements

The site must work well on mobile and desktop:

- Mobile navigation must not overflow.
- Blog cards and portal sections must stack cleanly.
- Article pages must remain comfortable to read on narrow screens.
- Long words, slugs, tags, and titles must not break layout.
- The first viewport should communicate the current section clearly.
- Desktop layouts should use available width without feeling sparse.

No text may overlap controls, cards, or decorative assets. Font sizes should use stable responsive breakpoints rather than viewport-width scaling.

## Search

Phase 1 search should be static and client-side. It should index blog posts and optionally projects/updates.

Minimum searchable fields:

- title
- description
- tags
- category
- plain text excerpt

Search results should show title, section, date when available, and a short description. Search should work without a backend.

## RSS

Generate `/rss.xml` from published blog posts. It should include title, description, canonical URL, publication date, and post link. Draft posts must be excluded.

## Accessibility

- Use semantic landmarks for navigation, main content, lists, and articles.
- Theme switch controls need accessible names and visible focus states.
- Links and buttons need keyboard focus and sufficient contrast in all four themes.
- Article pages should expose a clear heading hierarchy.
- Decorative imagery should not be required to understand content.

## Testing And Verification

Minimum verification before release:

- Unit or integration tests for content parsing and visible navigation.
- Build succeeds.
- RSS route renders valid XML.
- Search index includes published posts and excludes drafts.
- Desktop and mobile browser screenshots show no horizontal overflow.
- Theme switching persists and changes layout-level presentation.

## Deployment

Future release flow:

1. Commit locally.
2. Push to GitHub repository `viacold/voyage.moe`.
3. Let Vercel deploy from GitHub.
4. Verify Vercel production status and `voyage.moe`.

Avoid direct local production deploys unless GitHub or Vercel Git deployment is unavailable.

## Future Phases

Phase 2 can add admin management:

- Admin login
- Article CRUD
- Draft/publish workflow
- Site settings
- Theme configuration

Phase 3 can add user accounts:

- Registration and login
- Profiles
- Comments
- Likes or bookmarks
- Notifications

Phase 4 can add advanced features:

- Analytics
- Email subscriptions
- Private posts
- AI summaries
- AI tag suggestions
- Recommendation feeds
