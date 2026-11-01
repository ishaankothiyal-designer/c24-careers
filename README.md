# C24 Careers

[Live app: c24-careers-chi.vercel.app](https://c24-careers-chi.vercel.app)

As of 28 October 2026, this Vercel app is the active destination for development reviews, shared links, and all future deployments. Deploy updates to the existing Vercel project serving this domain. Keep production on this URL unless the project owner explicitly changes it.

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

The build emits static entry documents for `/careers/` and all `/builders/<slug>/` project pages. The existing Sites build wrapper is retained for compatibility; it also copies the Sites worker/config into `dist/server` and `dist/.openai`. Vercel publishes only `dist/client`. The legacy `scripts/prepare-github-pages.mjs` helper is retained for compatibility and must not run for Vercel deployments. No backend or real application form is included. Role cards open local `/careers/roles/preview-*/` details in a modal overlay: a right side panel above 1024px and an inset popover on tablet/mobile. Close, Escape, backdrop click and browser Back dismiss the overlay; shared URLs reopen it over the careers listing. These are explicitly illustrative previews, with applications unavailable until live Darwin records and canonical application URLs are supplied. Original source URLs are retained in `src/role-previews.json`.

Fonts and core media are local. Ishaan's builder card uses his Slack profile image with a local initials fallback. Third-party license files remain with their assets, including the paper-crumple VAT and Three.js notices. The expected lazy Three.js chunk size warning does not fail the build.

Run `npm test` after building for the route, hosting, loading, and performance regressions. The letter uses its original scroll-driven paper animation, with the original readable fallback for small screens, reduced motion, or unavailable WebGL/assets. Alternate builder portraits load on interaction, and resource-constrained devices use reduced rendering work.
