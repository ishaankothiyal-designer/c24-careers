# Layout and responsive design audit

Reviewed 1 November 2026 in `/Users/a39236/Desktop/AI Workflow/Careers Page V3 `.

Scope: the current homepage, careers listing, role details and application
surfaces, all 14 builder stories, FAQ, closing section and footer. This is a
spacing and responsive refinement of the existing design. Fonts, colours,
imagery, copy, section order, pixel treatments, animations, routes and external
application/attribution links retain their existing implementation.

## Findings and fixes

| Priority | Finding | Resolution |
| --- | --- | --- |
| High | Fixed listing tracks left unused space at the right edge: at 320px, a roughly 250px track sat inside 280px of available content; at 1440px, three 368px tracks occupied a roughly 1357px container. | Listing tracks now grow to fill their container while retaining the shared card minimum. Carousel cards retain their existing widths and next-card previews. |
| High | Tablet editorial sections changed layout at different widths, leaving ambition, hiring and FAQ in narrow two-column layouts between 768px and 900px. | Those sections collapse together at 900px. The exchange cards also stack at that width. Desktop compositions are preserved. |
| Medium | Builder tracks added 42px above and below the cards, versus different padding on the other two carousels, even though navigation now sits below every track. | All three tracks use the same small inset and the same spacing before their controls. Shared responsive tokens govern introduction-to-content spacing. |
| Medium | Role and builder panels used different horizontal insets for toolbars, headings and content. Builder details also inherited a desktop sticky heading inside an always-stacked drawer layout. | Both flows use a shared 20–32px responsive panel inset. Builder section leads flow normally within the drawer. Close controls keep a 44px minimum height. |
| Medium | The careers card body referenced an undefined gap variable. The later CTA rule also replaced the original bottom alignment. | Define the shared body gap and restore `margin-top: auto` on the CTA area, keeping actions aligned across cards with different copy lengths. |
| Medium | Long titles, labels and metadata could widen constrained children. Small application inputs could inherit text sizes below 16px. | Add shrink/wrap constraints to relevant layout children and metadata. Application text fields use the existing 16px body token. |
| Medium | Most section anchors lacked the builder section's fixed-header clearance. Short landscape footers depended entirely on viewport height. | Reuse the existing builder clearance for section anchors. Let the footer maintain a 500px minimum height on short screens; mobile legal links receive 44px touch areas. |

## Shared implementation

`src/styles/responsive-layout.css` is imported last in `src/main.jsx`, after
the preserved section styling. It centralizes layout geometry without adding
a UI dependency or duplicating templates. Reuse these tokens for future flows:

- `--layout-head-gap`: introduction to content.
- `--layout-column-gap`: editorial column separation.
- `--layout-track-inset`: carousel breathing room.
- `--layout-panel-inset`: detail toolbar, title and content alignment.
- `--layout-anchor-clearance`: fixed navigation clearance.
- Existing `--career-card-*`, `--sp-*` and `--story-control` tokens remain the
  common source for cards, spacing and touch targets.

New editorial splits should collapse at the shared 900px breakpoint. Card grids
should use tracks that can shrink to 100% of the container and expand into
remaining space. Carousel card widths remain independent from listing tracks.

## Verification

The production output from `npm run build` was served with `npm run preview`
at `http://127.0.0.1:5176/` and checked in headless Chromium.

| Viewport width | Listing columns | Home, listing, role overlay and builder drawer |
| --- | --- | --- |
| 320, 375, 414px | 1 | Passed |
| 768, 834, 900px | 2 | Passed |
| 1024px | 2 | Passed |
| 1280, 1440px | 3 | Passed |
| 1920px | 4 | Passed |

Checks included page and panel horizontal overflow, full-width listing rows,
search with no matches and clear-filter recovery, support carousel movement
and boundaries, builder carousel movement, FAQ expansion/collapse, direct
detail URLs, Escape dismissal and all 14 builder stories at 320px and 1440px.
Normal and reduced-motion modes were exercised. A 900×400 landscape footer
check confirmed that the title and legal row did not overlap.

The public jobs response was captured from the local read-only API and replayed
for repeatable layout checks. An actual role response exercised the external
application flow. The supported-form renderer was checked at 320, 375, 768 and
1440px using the same public field schema with support enabled only in the
browser fixture. No applications were submitted. This verifies form layout,
not live submission support for that role.

`npm run build`: passed. The existing lazy Three.js chunk warning remains.
`npm test`: all 47 tests passed. `git diff --check`: passed.

Safari, Firefox and physical devices were not tested. Changes are local and
have not been deployed. Existing uncommitted changes were preserved. Production
remains the existing Vercel project at https://c24-careers-chi.vercel.app.

For local work: `npm ci`, then `npm run dev`. To reproduce the production build:
`npm run build`, `npm test`, then `npm run preview`. This audit changed no files
outside this project; temporary browser verification files were kept in `/tmp`.
