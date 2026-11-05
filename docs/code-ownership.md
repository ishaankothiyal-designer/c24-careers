# Code ownership and dependency audit

The source repository is `ishaankothiyal-designer/c24-careers`. Staging review uses `staging-ishaan`; Vercel production tracks `main` at `https://c24-careers-chi.vercel.app`. No CMS or admin editor is included. Darwinbox integration lives in `api/`, `server/`, and `src/runtime/live-jobs.js` / `live-role.js`; credentials are server-only environment variables, never repository content. See [integration setup](darwinbox-integration.md).

## Where to make changes

The ambition story uses five sticky cards: edit `src/sections/career-02-ambition.html` for copy, `src/styles/ambition-stack.css` for card layout and responsive fallbacks, and `src/runtime/ambition-stack.js` for stack scaling and lazy figure lifecycle. `src/runtime/hairline-figures.js` imports Vault, Slow and Elevator from pinned Hairline 0.5.1, plus the official Cursor Tab and Funnel skill examples adapted in `src/runtime/hairline-examples/`. Those examples use `src/runtime/hairline-reference.js` and the shared original core in `src/vendor/hairline-kernel.js` for styling, automatic pointer tours, motion preferences and cleanup. Card figures disable pointer hit-testing so real hover does not interrupt autoplay. The uploaded crate-stack experiment remains an unbundled reference in `src/runtime/crate-stack.js`. At widths of 900px and above, copy sits on the left and figures fill the larger right column. Smaller layouts stack copy above the figures. Card containers have zero padding at every width; spacing belongs to the copy blocks (80px 32px 32px 56px on desktop and the responsive 24–48px inset on smaller screens), so figures use the full available area. Figures fill the available card area; screens up to 800px high use normal-flow cards so the artwork is not squeezed beneath the copy. Reduced motion and short viewports retain an ordinary reading order.

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
| Build and hosting | `vite.config.mjs`, `scripts/prepare-sites-build.mjs`, `vercel.json`, `.github/workflows/ci.yml` |

`builder-detail.js` keeps its original name for compatibility; builder cards now open a native modal sidebar rather than navigating to separate project pages. Previously shared `/builders/<slug>/` links render home and open the corresponding sidebar. The sidebar uses native dialog focus management and Escape dismissal, restores focus on close, pauses the page's existing smooth-scroll controller, and keeps the sidebar content independently scrollable.

The desktop letter scene, VAT decoder, and letter content remain as restored from commit `8dcbc74`. Tablet widths from 768–1050px now use the same animation in a one-column layout. Phones, reduced motion, and short landscape viewports retain the readable fallback.

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

- Role and problem cards open local illustrative previews. Applications are unavailable for these previews. Original external source URLs remain recorded in `src/role-previews.json`; they are not rendering dependencies.

### Local third-party code

- Hairline figures are bundled locally from `@lucasmarkes/hairline`; no runtime CDN request is needed. Its MIT notice ships at `/licenses/hairline-LICENSE.txt`.
- React and Three.js are installed from npm during builds and bundled into local application assets.
- GSAP, ScrollTrigger, SplitText, Lenis, Draggable, and ScrambleText implementations are served from the local `_astro` and `vendor` directories. They are not being loaded from a CDN by the active application code.
- Fonts, paper-animation files, other portraits, and project images are local.
- The retained Unicorn Studio loader contains external service/CDN URLs. Its initializer is conditional on `data-us-project` / `data-us-project-src` markup; the active section list has no such scene hooks. It remains a dormant reference capability, not a verified browser request. Do not enable it without reviewing those remote dependencies.
- `http://www.w3.org/2000/svg` and XHTML strings are XML namespaces; they are not network downloads. GSAP documentation/license URLs in library files likewise do not prove outgoing requests.

The authored consent module still contains legacy Google Analytics naming and a measurement ID, but its script target is the local `runtime/analytics-disabled.js` placeholder, and the consent popover is disabled. This inventory found no active Google or LinkedIn script target. The unused LinkedIn loader has been removed. This is a source inspection, not a captured browser network trace.

## Confirmed cleanup

- Replaced the eager wildcard import of every HTML fragment with explicit imports of the indexed fragments. The careers listing separately imports its role-card source in `src/App.jsx`. Other unindexed reference/experiment fragments stay editable in Git without being bundled.
- The preserved Navbar-V1 fragment remains inside an inert template while Navbar-V2 is selected. Its original navigation script now loads only when Navbar-V1 is selected, rather than doing unused work on every visit.
- Removed five unreferenced legacy JavaScript files: the old footer, unused attribution entry point/helper, old consent entry point, and LinkedIn loader. The active footer uses `src/runtime/society-footer.js` instead.
- Removed three selectors for the absent Navbar-V2 roles CTA, plus 12 obsolete selectors for the unused builder detail side card, client badge/logo, and credit markup. Active project cards and their dynamic selectors remain.
- Main application JavaScript was about 414 KB before these changes and about 343 KB after the sidebar was added and unused fragments were excluded (uncompressed build output). The lazy paper/Three.js chunk is unchanged.

## Remaining CSS candidates

Run `npm run audit:source` to regenerate `docs/source-audit.json`. The current static scan flags 185 class/file combinations for review across 16 CSS files. These are **candidates**, not 185 proven dead classes. For example, `sol-card` and `out-card` are produced by a template using a variable prefix and can be missed by a literal scan.

Original styles also include rules for archived reference sections and earlier review overrides. They have not been bulk-purged: runtime classes, pseudo-elements, mobile states, and animation-generated DOM require browser coverage before removal. A full CSS purge or a claim of zero external network activity would need that additional verification. Browser automation is unavailable in this session; no fresh visual or Safari verification is claimed.

## Shared typography and responsive cards (November 2026)

`src/styles/typography.css` owns the self-hosted Geist variable font and heading/body/subtext roles. Heading weight 550 retains the previous medium heading emphasis; body 400 and controls 500 share the same family. Letter handwriting and signature remain illustration fonts. Mobile is below 768px, tablet 768–1023px, desktop starts at 1024px; tablet role dialogs cap at 560px.

Ambition figures use 1.15× framing, with copy above art on tablet and columns on desktop. `src/vendor/hairline-figures.js` is an MIT-attributed tree-shaken copy of the pinned Hairline 0.5.1 Vault/Slow/Elevator exports. Its scheduler dt and tween durations/delays run at 1.3×, matching the local reference kernel. This is a local timing adaptation because the upstream public API has no speed option. Keep these changes when updating the pinned library. Visibility, reduced-motion and autoplay lifecycle remain managed by the existing controllers.

The ambition section uses sticky stacking below 768px (normal flow on short screens and reduced motion), one native horizontal row with 2.8s automatic advancement at 768–1023px, and a pinned horizontal row from 1024px. Text stays above art throughout. All five convictions are preserved. Tablet scrolling pauses during pointer/focus interaction, for six seconds after manual inputs, offscreen, in hidden tabs, and under reduced motion. Cards enter once with a 320ms fade/lift and 45ms stagger. Reduced motion shows every card immediately.

The ambition container is full-width with zero horizontal padding and zero card gaps at every breakpoint; internal text insets remain on the copy block. Tablet cards each occupy 50% of the track with no gutter.

Desktop ambition cards are 38vw wide from 1024px and all five share one row. Tablet/mobile widths remain owned by their existing media rules.

Desktop ambition now uses one 38vw-per-card row, including all five cards. `desktop-card-scroll.js` gives the section a vertical runway equal to the measured horizontal overflow and maps native page position into a translated track inside a sticky scene. It never cancels wheel/touch events or locks the body, so reaching either end releases naturally and reverse scrolling retraces the same path. Width ≥1024px and height ≥680px enable pinning; reduced motion and shorter desktops retain a manually scrollable row to keep all content reachable. Resize/media changes remeasure the runway, and cleanup removes listeners, observer, scheduled frame and inline state.

Desktop card height is owned by `--ambition-card-desktop-height:calc(100svh - 80px)`. The sticky scene fills the viewport directly beneath the 80px navbar, and pins at an 80px offset. Desktop copy has 64px top padding; headings use a shared clamp(40px, 3.6vw, 68px) scale. Tablet and mobile sizes are unchanged.

The ambition section has zero bottom padding at every breakpoint. Scroll progress reads the computed sticky top, including its full-viewport zero offset, so forward/reverse handoff uses the same position.

The ambition bottom divider is removed by resetting its bottom border and the following section’s top border. A computed sticky offset of 0px is explicitly preserved by the scroll controller rather than replaced with a fallback.

Ambition’s left inset matches the hero container: the shared `--pad-x` plus any centering space beyond `--max-w` (1728px). The right inset matches the left. Cards have zero gap in all modes; the previous gap-closing translations and travel adjustment were removed. Desktop subtext uses clamp(20px, 1.45vw, 24px); smaller screens start at 18px. The existing 80px navbar entry margin and full-viewport pinned scene remain.

Active desktop tracks use visible overflow and translate the list with `--ambition-slide-x`, so cards remain visible through the left gutter instead of being clipped at the container edge. Existing document-level horizontal clipping limits painting at the browser edge without introducing page-wide horizontal scrolling. Tablet and manual fallbacks retain native scrolling and hidden scrollbars. The offset is cleared on mode changes and teardown.

Pinned desktop cards stay opaque, including partially visible cards at the edges; visibility observers continue to manage figure playback without hiding the card copy. Other responsive modes retain their entrance reveals.

Navbar spacing is outside the desktop cards: `--ambition-nav-clearance` (80px) plus `--ambition-top-gap` (0px) sets both the entry margin and sticky offset. Cards fill the remaining viewport height so the row fits beneath the header without extra bottom clearance. Horizontal progress reads the computed 80px sticky offset in both directions.

Card copy has 64px top padding on desktop and 40px on smaller screens. Headings use the user-specified explicit line breaks in the section HTML, preserving the current card order. Automatic balancing and final-phrase wrappers have been removed. The figure scale is 1.05 (previously 1.15), and its flexible area can shrink to 180px so the added copy spacing does not clip content.

Ambition now has symmetric hero-container insets. Active desktop translation retains visible overflow through both gutters and measures the narrower inner width, so the final card aligns to the right inset. On tablet, negative margins expand the native scrollport to the viewport edges while internal padding and scroll-padding preserve the same start/end gutters. Tablet cards stay opaque, including edge peeks; touch, keyboard, auto-scroll and reduced-motion behavior remain native.
