# Repository Guidelines

## Project Structure

This repository publishes Nicolas Mendes’s static portfolio. The Astro source is in `site/`: reusable UI in `site/src/components/`, page layouts in `site/src/layouts/`, routes in `site/src/pages/`, content records in `site/src/data/`, and client behavior in `site/src/scripts/`. Legacy Jinja, Flask, and React authoring tools remain under `@src/`; do not edit them for public-site changes unless maintaining that legacy workflow.

Root HTML, `blog/`, `case-studies/`, `static/redesign/`, `sitemap.xml`, and `robots.txt` are generated deployable output. The `.portfolio-output.json` manifest identifies files the guarded publisher may replace.

## Development and Build Commands

Run commands from the repository root:

- `npm ci` installs the pinned toolchain.
- `npm run dev` prepares responsive media and starts Astro locally.
- `npm run check` type-checks Astro and TypeScript.
- `npm run test` runs unit, route, interaction, reduced-motion, and accessibility checks against staging.
- `npm run build:stage` creates and validates `.site-build/` without changing published files.
- `npm run build` validates staging, then copies only manifest-owned output into the root.
- `npm run check:output` verifies the current root output.

Do not manually edit generated root pages. Add project images under `static/images/`, reference them in typed data, then let `prepare-assets.mjs` create responsive WebP variants.

## Style and Content Rules

Use two-space indentation. Keep Astro components PascalCase, data IDs lowercase kebab-case, and public routes exactly as established, including capitalization. Use Newsreader for editorial headings, Geist for body copy, and Geist Mono for navigation and metadata. Preserve real project facts, confidentiality notices, destinations, and meaningful alt text. Never ship reference-site assets, copy, or identity.

## Testing, Commits, and Deployment

Check layouts at 390px, 768px, 1440px, and 1920px when changing presentation. Keyboard navigation and core content must work without JavaScript; respect `prefers-reduced-motion`.

Use concise, imperative commits such as `Redesign Teamwork case study`. PRs need a summary, route/content impact, screenshots, and test results. Netlify deploys automatically when reviewed work is merged or pushed to GitHub `main`; do not change dashboard settings or push directly without approval.

## Case Study Galleries

Case-study galleries are rendered by `site/src/components/CaseStudyGallery.astro` from each page's typed `gallery` data. `setupCaseGalleries()` creates a client-side duplicate sequence for a seamless 10px/s loop, pauses while the pointer or keyboard focus is inside the gallery, and resumes when that interaction ends while the tab is active. Keep the gallery static under `prefers-reduced-motion`; the native horizontal track remains manually scrollable. Preserve the borderless, title-free, full-viewport presentation, keep desktop slides within `clamp(28rem, 30vw, 44rem)`, and keep cloned links out of the focus order. Update the gallery interaction test whenever this behavior changes.
