# Careers staging release — 1 November 2026

This release updates the Cars24 careers experience for review on `staging-ishaan`, ahead of a proposed merge into `main`.

## Visitor-facing changes

- Rework the homepage narrative around ambition, builders, problems, support, hiring, and the exchange of expectations.
- Refine the opening pixel field, ambition section, section spacing, and responsive layouts.
- Show builder pixel portraits by default, revealing the matching real photographs on interaction. Keep the builder reel stable and manually navigable.
- Add horizontally scrollable problem and support carousels, with chevrons, keyboard navigation, boundary states, and reduced-motion support. Problem filters reset the carousel.
- Add seven support illustrations and retain their generation prompts for future editing.
- Give illustrative problems and role cards distinct internal detail previews with shared role and department labels.
- Open role details in a desktop side panel or a tablet/mobile popover, with direct links, browser-history support, Escape dismissal, scroll locking, and focus restoration.
- Link the closing call to action to the careers listing and simplify the four-step hiring explanation.

- Preserve the latest `main` builder-project sidebar, explicit section imports, source-audit tooling, and removal of unused legacy scripts.

## Hosting and maintenance

- Keep the existing Vercel project and production URL, `https://c24-careers-chi.vercel.app`.
- Document Vercel as the active hosting destination and retain the legacy Sites build wrapper only for compatibility.
- Remove automatic GitHub Pages deployment and add a build-and-test workflow for `main`, pull requests, and manual runs.
- Emit static documents for role previews as well as the careers listing and builder stories, supporting direct visits and refreshes.
- Record the planned Darwinbox problem-carousel mapping without introducing credentials or live API calls into the app.

## Validation

- `npm run build`
- `npm test` — 35 tests passed after incorporating the latest `main` changes.
- `git diff --check`

The build retains the known warning about the lazy Three.js paper-animation chunk exceeding 500 kB.

## Release boundaries

- Roles are explicitly illustrative previews. Live Darwinbox listings, application forms, candidate submission, and server-side credential configuration are deferred to a separate change.
- Applications remain unavailable for preview roles.
- This staging release and its pull request do not merge into `main` or promote a deployment to production.
