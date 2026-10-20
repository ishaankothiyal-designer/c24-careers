# C24 Careers — Backup Version 2

The preserved Version 2 careers prototype, prepared for GitHub Pages at:

https://mayank12-dotcom.github.io/c24-careers/

The original source and public assets are unchanged. GitHub Pages has a repository subpath, so a deployment-only postprocessor prefixes local asset URLs in the generated build. Fonts, native runtime imports, media, scene JSON, and paper-animation assets are included.

## GitHub Pages

In repository Settings → Pages, select **GitHub Actions** as the source. The workflow in `.github/workflows/pages.yml` builds and deploys on pushes to `main`, and also supports a manual run. No personal access token or custom secret is required by the workflow; it uses GitHub’s scoped workflow token and Pages OIDC permissions.

The workflow runs Node.js 22, `npm ci`, `npm run build`, and `node scripts/prepare-github-pages.mjs /c24-careers/`, then publishes `dist/client` through GitHub’s official Pages actions. Keep the final slash in the site URL.

If the repository is renamed or a custom domain is added, update the postprocessor base path in the workflow. Do not change the original source URLs just to adapt hosting.

## Local development

```sh
npm ci
npm run dev
```

For a production build at a root-domain URL, run `npm run build`. For the GitHub Pages repository URL, also run `node scripts/prepare-github-pages.mjs /c24-careers/` after building.

The existing Sites build wrapper is retained; Vite generates `dist/client`, and the wrapper copies the Sites worker/config into `dist/server` and `dist/.openai`. GitHub Pages publishes only the static client. No backend or real application form is included; role buttons link to the existing external careers site.

All fonts and media are local. Third-party license files remain with their assets, including the paper-crumple VAT and Three.js notices. The expected lazy Three.js chunk size warning does not fail the build.
