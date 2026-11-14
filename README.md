# C24 Careers

[Live app: c24-careers-chi.vercel.app](https://c24-careers-chi.vercel.app)

Production releases are made from `main` to the existing Vercel project after the requested UAT pass. Verify the project's actual Production Branch setting before relying on a Git-triggered release. The stable production URL remains the live app above.

The prior private `staging-mynk` preview is a separate historical review workflow. Its `preview/worker.js` compatibility source remains, but it is not the production deployment target.

## Vercel deployment

The checked-in `vercel.json` configures Vite, `npm ci`, `npm run build`, and the `dist/client` output directory. It also rewrites builder and careers routes to the app shell. The application runs at the domain root with `site-base` set to `/`; no repository subpath transformation is needed.

Before deploying, run `npm run build` and `npm test`. Use the existing Vercel project's configured Git integration or deploy from a checkout linked to that project. Check the project's Production Branch setting before relying on a push to publish; this setting is managed in Vercel, not in this repo. If using the Vercel CLI, link to the existing project before running `vercel --prod`; do not create a replacement project.

After deployment, verify the home page, `/careers/`, and a `/builders/<slug>/` detail page, including direct visits and refreshes. Share the stable live URL above for production reviews.

The workflow in `.github/workflows/ci.yml` runs build and regression checks on pushes to `main`, pull requests, and manual runs. It does not publish the site. The former automatic GitHub Pages deployment has been removed.

Builder cards open projects in an accessible sidebar. Shared `/builders/<slug>/` URLs open the matching sidebar over the homepage. See [Code ownership and dependency audit](docs/code-ownership.md) for editing locations and inherited dependencies.

## UAT-reviewed careers update · 15 November 2026

The current revision adds whole-card animated Flatland stickers, the AI-led invitation, practical working principles, selected builder stories with the full gallery available, programme drawers with existing photography, revised FAQs, and role-card/mobile fixes. Independent visual/responsive, UX-copy and brief-compliance reviews are recorded under [the UAT release record](docs/uat/2026-11-15/release.md). Explicit user corrections and reusable acceptance rules live in [the UAT feedback log](docs/uat/feedback.md).

Invoke **UAT agent** or **UAT** to run the workflow in [the repository skill](.agents/skills/uat-agent/SKILL.md). It reviews and fixes the active task; deployment requires explicit authorization for that release.

Start locally with `npm run dev` and review `http://127.0.0.1:5173/`. Live role fetching requires the server-only Darwinbox environment configuration described below. Private Slack/PDF feedback archives and local output packages are retained locally and excluded from this public source repository.

## Local development

```sh
npm ci
npm run dev
```

For a production build, run `npm run build`. To review it locally, run `npm run preview`.

The build emits static entry documents for `/careers/`, legacy role previews, and builder URLs. The Sites build wrapper is retained for compatibility; Vercel publishes `dist/client` and deploys the Node functions in `api/`. Do not run the legacy GitHub Pages postprocessor for Vercel.

The homepage and `/careers/` now load public Darwinbox openings through server-side routes. Role dialogs show live descriptions and the job's application requirements. Key Accounts and Listing retain inline contact/resume submission. Required-location roles show their approved location choices but remain unavailable for submission until engineering supplies the verified Darwinbox location field mapping. Applicants are not redirected to an external application flow. See [Darwinbox integration](docs/darwinbox-integration.md) for server-only environment variables, local development, field mapping, resume limits, verification boundaries, and submission handling. Legacy `preview-*` links remain illustrative and cannot accept applications. Original source URLs remain in `src/role-previews.json`.

Role-card problem statements are maintained in `src/role-problems.js`, using the official title and department with a general department fallback for new roles. This is local editorial mapping, with no AI API dependency. Official Darwinbox titles remain in the job API, accessible card names and role details. Card geography/department text is maintained in `roleCardContext()` in `src/role-labels.js`.

Fonts and core media are local. Builder cards use local pixel portraits and reveal their corresponding local uniform-background photographs on interaction. Third-party license files remain with their assets, including the paper-crumple VAT and Three.js notices. The expected lazy Three.js chunk size warning does not fail the build.

Run `npm test` after building for the route, hosting, loading, and performance regressions. The letter uses its original scroll-driven paper animation, with the original readable fallback for small screens, reduced motion, or unavailable WebGL/assets. Alternate builder portraits load on interaction, and resource-constrained devices use reduced rendering work.
