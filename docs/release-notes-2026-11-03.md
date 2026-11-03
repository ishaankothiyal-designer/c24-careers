# Careers homepage update — 3 November 2026

The homepage now moves from open roles to Vikram’s letter, then “The support behind the work,” FAQs, and the existing closing section and footer.

## Changes

- Remove “Know what happens next” and “Know what the work asks of you” from the rendered homepage and active fragment imports.
- Move the support section below Vikram’s letter and place FAQs immediately after support.
- Point the footer’s “How we hire” and “What to expect” links to the FAQs so they retain a working destination.
- Update the existing story-flow regression check to enforce the new order and removal of both sections.

## Validation

- `npm run build` passed.
- `npm test` passed: 115 tests, zero failures.
- `git diff --check` passed.
- The local browser showed both removed sections absent and the revised section order.
- The build retains the documented warning for the lazy Three.js paper-animation chunk exceeding 500 kB.

## Release routing

Use `staging-ishaan` for staging, then merge the reviewed change into `main`. The existing Vercel project `design-ea38/c24-careers` tracks `main` for production, with automatic production domain assignment enabled. This setting was verified in Vercel before release. Keep production at https://c24-careers-chi.vercel.app.
