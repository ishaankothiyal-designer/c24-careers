# C24 Careers

Source and deployment branch: https://github.com/ishaankothiyal-designer/c24-careers/tree/staging-mynk

See [Code ownership and dependency audit](docs/code-ownership.md) for editing locations, inherited classes, external resources, and cleanup limits.

GitHub Pages has a repository subpath, so a deployment-only postprocessor prefixes local asset URLs and sets the application's navigation base in the generated build. Fonts, native runtime imports, media, scene JSON, and paper-animation assets are included.

## GitHub Pages

In repository Settings → Pages, select **GitHub Actions** as the source. The workflow in `.github/workflows/pages.yml` builds and deploys on pushes to `staging-mynk`, and also supports a manual run. No personal access token or custom secret is required by the workflow; it uses GitHub’s scoped workflow token and Pages OIDC permissions.

The workflow runs Node.js 22, `npm ci`, `npm run build`, and `node scripts/prepare-github-pages.mjs /c24-careers/`, then publishes `dist/client` through GitHub’s official Pages actions. Keep the final slash in the site URL.

If the repository is renamed or a custom domain is added, update the postprocessor base path in the workflow. Do not change the original source URLs just to adapt hosting.

The build emits static entry documents for `/careers/` and all legacy `/builders/<slug>/` project URLs, so links, direct visits, and refreshes work on GitHub Pages. Builder cards open projects in an accessible sidebar. Legacy project URLs open that sidebar over the homepage. The existing Find roles buttons and shared URLs stay under the configured repository base. Run `npm run test:routes` after building to verify route handling and the emitted documents.

## Local development

```sh
npm ci
npm run dev
```

For a production build at a root-domain URL, run `npm run build`. For the GitHub Pages repository URL, also run `node scripts/prepare-github-pages.mjs /c24-careers/` after building.

The existing Sites build wrapper is retained; Vite generates `dist/client`, and the wrapper copies the Sites worker/config into `dist/server` and `dist/.openai`. GitHub Pages publishes only the static client. No backend or real application form is included; role buttons link to the existing external careers site.

Fonts and core media are local. Ishaan's builder card uses his Slack profile image with a local initials fallback. Third-party license files remain with their assets, including the paper-crumple VAT and Three.js notices. The expected lazy Three.js chunk size warning does not fail the build.

Run `npm test` after building for the route, hosting, loading, and performance regressions. The letter uses its original scroll-driven paper animation, with the original readable fallback for small screens, reduced motion, or unavailable WebGL/assets. Alternate builder portraits load on interaction, and resource-constrained devices use reduced rendering work.
