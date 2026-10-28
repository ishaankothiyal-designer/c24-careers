# Code ownership and dependency audit

The deployment source for this work is `ishaankothiyal-designer/c24-careers`, branch `staging-mynk`. No CMS, admin editor, Darwinbox integration, or API credentials are included.

## Where to make changes

| Concern | Files you control |
| --- | --- |
| Homepage content and section order | `src/sections/*.html`, `src/sections.json` |
| Fragments included in the browser bundle | `src/page-sections.js`; keep its explicit imports in sync with `sections.json` |
| Builder cards and portraits | `src/sections/career-01-invitation.html` |
| Project content | `src/builder-stories.json` |
| Project content markup | `src/builder-detail.js`; its renderer is reused inside the sidebar |
| Sidebar behavior and appearance | `src/runtime/project-drawer.js`, `src/styles/project-drawer.css` |
| Carousel interactions | `src/runtime/craft-work.js` |
| Job content and listing | `src/sections/career-08-roles.html`, `src/careers-page.js`, `src/styles/careers-page.css` |
| Colors and typography | `src/styles/brand.css`, local font files, CSS variables in `public/_astro/global.Btqt_PqA.css` |
| Additional styles and overrides | `src/styles.css`, `src/styles/*.css`; import order is explicit in `src/main.jsx` |
| Original recovered styles | Local `public/_astro/*.css`, linked by `index.html` |
| Original recovered animation behavior | Local `public/_astro/Base.astro_astro_type_script_index_0_lang.BUtqXeGZ.js` |
| Build and hosting | `vite.config.js`, `scripts/prepare-sites-build.mjs`, `vercel.json`, `.github/workflows/pages.yml` |

`builder-detail.js` keeps its original name for compatibility; builder cards now open a native modal sidebar rather than navigating to separate project pages. Previously shared `/builders/<slug>/` links render home and open the corresponding sidebar. The sidebar uses native dialog focus management and Escape dismissal, restores focus on close, pauses the page's existing smooth-scroll controller, and keeps the sidebar content independently scrollable.

The restored letter files are unchanged from commit `8dcbc74`.

## Where the classes come from

| Classes / attributes | Origin and purpose |
| --- | --- |
| `hero__*`, `tier__*`, `cases__*`, generic layout classes | Inherited from the locally recovered Legency source; styled by the copied CSS and local overrides |
| `craft-work__*`, `craft-*`, `society-*` | Adapted reference components; their markup, styles, assets, and behavior live in this repository |
| `navbar-v2*`, `careers-*`, `builder-detail`, `project-drawer*` | Local application components |
| `roll-line`, `roll-char`, `lenis-*`, `is-*` | Classes generated or toggled by animation and interaction code; absence from the initial HTML does not make them unused |
| `data-astro-cid-*` | Original Astro **attributes**, not classes. Copied CSS uses them to scope selectors. No running Astro service or external stylesheet provider is required. Removing them alone would break matching rules. |
| `data-craft-*`, `data-paper-*`, `data-builder-*` | Local JavaScript hooks and state attributes. Keep their consumers in sync when changing markup. |

The project runs React and Vite. It does not need the original website, Webflow editor, or an Astro server to render. Some inherited JavaScript is already compiled/minified, so it is editable locally but less maintainable than the authored modules in `src/runtime`. Third-party libraries remain subject to their own licenses; locally storing a library does not make it original application code.

## External resources

### Active runtime resource

- Ishaan's portrait is requested from `avatars.slack-edge.com`. A local initials image is the existing fallback. To eliminate this dependency, replace the portrait URLs in both the builder card HTML and project JSON with a locally owned image.

### Outbound destination

- Apply buttons open `https://careers.cars24.com/`. This is an application destination after a user clicks; it is not a script, stylesheet, or rendering dependency.

### Local third-party code

- React and Three.js are installed from npm during builds and bundled into local application assets.
- GSAP, ScrollTrigger, SplitText, Lenis, Draggable, and ScrambleText implementations are served from the local `_astro` and `vendor` directories. They are not being loaded from a CDN by the active application code.
- Fonts, paper-animation files, other portraits, and project images are local.
- The retained Unicorn Studio loader contains external service/CDN URLs. Its initializer is conditional on `data-us-project` / `data-us-project-src` markup; the active section list has no such scene hooks. It remains a dormant reference capability, not a verified browser request. Do not enable it without reviewing those remote dependencies.
- `http://www.w3.org/2000/svg` and XHTML strings are XML namespaces; they are not network downloads. GSAP documentation/license URLs in library files likewise do not prove outgoing requests.

The authored consent module still contains legacy Google Analytics naming and a measurement ID, but its script target is the local `runtime/analytics-disabled.js` placeholder, and the consent popover is disabled. This inventory found no active Google or LinkedIn script target. The unused LinkedIn loader has been removed. This is a source inspection, not a captured browser network trace.

## Confirmed cleanup

- Replaced the eager wildcard import of every HTML fragment with explicit imports of the 16 indexed fragments. The 15 unindexed reference/experiment fragments stay editable in Git but are no longer shipped in the application JavaScript.
- The preserved Navbar-V1 fragment remains inside an inert template while Navbar-V2 is selected. Its original navigation script now loads only when Navbar-V1 is selected, rather than doing unused work on every visit.
- Removed five unreferenced legacy JavaScript files: the old footer, unused attribution entry point/helper, old consent entry point, and LinkedIn loader. The active footer uses `src/runtime/society-footer.js` instead.
- Removed three selectors for the absent Navbar-V2 roles CTA, plus 12 obsolete selectors for the unused builder detail side card, client badge/logo, and credit markup. Active project cards and their dynamic selectors remain.
- Main application JavaScript was about 414 KB before these changes and about 343 KB after the sidebar was added and unused fragments were excluded (uncompressed build output). The lazy paper/Three.js chunk is unchanged.

## Remaining CSS candidates

Run `npm run audit:source` to regenerate `docs/source-audit.json`. The current static scan flags 185 class/file combinations for review across 16 CSS files. These are **candidates**, not 185 proven dead classes. For example, `sol-card` and `out-card` are produced by a template using a variable prefix and can be missed by a literal scan.

Original styles also include rules for archived reference sections and earlier review overrides. They have not been bulk-purged: runtime classes, pseudo-elements, mobile states, and animation-generated DOM require browser coverage before removal. A full CSS purge or a claim of zero external network activity would need that additional verification. Browser automation is unavailable in this session; no fresh visual or Safari verification is claimed.
