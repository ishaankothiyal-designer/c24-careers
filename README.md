# C24 Careers

[Live app: c24-careers-chi.vercel.app](https://c24-careers-chi.vercel.app)

[Private review preview — staging-mynk](https://c24-careers-preview-mayank.cars24.chatgpt.site/)

Use the private preview to review our branch changes before Ishaan merges them. Work is made and pushed on `staging-mynk`; Ishaan handles the merge to production. The preview is published separately and is updated during our review workflow, rather than automatically on every GitHub push. It requires the preview owner's signed-in access.

The separate review host uses `preview/worker.js` with the branch's compiled frontend. It reads public job listings and details from the existing live careers API, so it reflects staging frontend changes rather than copying the production frontend. Application submissions are disabled on the review host; use the live app to apply. Production hosting and server credentials are unchanged.

The Vercel app remains the production destination. The separate private preview above is for reviewing branch changes before a merge. Keep production on the existing Vercel project and URL unless the project owner explicitly changes it.

## Vercel deployment

The checked-in `vercel.json` configures Vite, `npm ci`, `npm run build`, and the `dist/client` output directory. It also rewrites builder and careers routes to the app shell. The application runs at the domain root with `site-base` set to `/`; no repository subpath transformation is needed.

Before deploying, run `npm run build` and `npm test`. Use the existing Vercel project's configured Git integration or deploy from a checkout linked to that project. Check the project's Production Branch setting before relying on a push to publish; this setting is managed in Vercel, not in this repo. If using the Vercel CLI, link to the existing project before running `vercel --prod`; do not create a replacement project.

After deployment, verify the home page, `/careers/`, and a `/builders/<slug>/` detail page, including direct visits and refreshes. Share the stable live URL above for production reviews.

The workflow in `.github/workflows/ci.yml` runs build and regression checks on pushes to `main`, pull requests, and manual runs. It does not publish the site. The former automatic GitHub Pages deployment has been removed.

Builder cards open projects in an accessible sidebar. Shared `/builders/<slug>/` URLs open the matching sidebar over the homepage. See [Code ownership and dependency audit](docs/code-ownership.md) for editing locations and inherited dependencies.

## Local development

```sh
npm ci
npm run dev
```

For a production build, run `npm run build`. To review it locally, run `npm run preview`.

The build emits static entry documents for `/careers/`, legacy role previews, and builder URLs. The Sites build wrapper is retained for compatibility; Vercel publishes `dist/client` and deploys the Node functions in `api/`. Do not run the legacy GitHub Pages postprocessor for Vercel.

The homepage and `/careers/` now load public Darwinbox openings through server-side routes. Role dialogs show live descriptions and the job's application requirements. Key Accounts and Listing retain inline contact/resume submission. Required-location roles show their approved location choices but remain unavailable for submission until engineering supplies the verified Darwinbox location field mapping. Applicants are not redirected to an external application flow. See [Darwinbox integration](docs/darwinbox-integration.md) for server-only environment variables, local development, field mapping, resume limits, verification boundaries, and submission handling. Legacy `preview-*` links remain illustrative and cannot accept applications. Original source URLs remain in `src/role-previews.json`.

Fonts and core media are local. Builder cards use local pixel portraits and reveal their corresponding local uniform-background photographs on interaction. Third-party license files remain with their assets, including the paper-crumple VAT and Three.js notices. The expected lazy Three.js chunk size warning does not fail the build.

Run `npm test` after building for the route, hosting, loading, and performance regressions. The letter uses its original scroll-driven paper animation, with the original readable fallback for small screens, reduced motion, or unavailable WebGL/assets. Alternate builder portraits load on interaction, and resource-constrained devices use reduced rendering work.
