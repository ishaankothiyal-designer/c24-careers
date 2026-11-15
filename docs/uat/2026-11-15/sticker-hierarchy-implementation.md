# Sticker hierarchy and responsive principles · 15 November 2026

The latest user correction supersedes the briefly explored principle carousel: keep all four principle cards visible in a responsive grid, four across at 1024px and above, two by two at 601–1023px, and four vertically stacked cards at 600px and below. Remove step-number badges and principle navigation controls.

All five ambition cards now have the actual DOM order unique phrase → decorative illustration → headline → supporting paragraph. Repeated CARS24 · BUILDERS branding and the pause/resume control are removed. Default sticker cards stay static; their carousel arrows still browse the five cards. Existing statement copy, colours and illustrations remain intact.

Copy now has an additional 16px inner inset and a 24ch paragraph measure. The sticker height is 520px to preserve breathing room with the new order. The shield's phrase wraps within an 18ch measure so it stays inside the upper curve, while its lower copy stays above the tapered foot. Small desktop principle grids reserve enough title space for three-line labels without stretching the white badge itself.

The letter's Keep scrolling cue uses a cream paper-sticker surface, dark outline, light offset shadow and the existing mouse illustration restyled to the same palette. Only its wheel dot animates, for three 1.6-second cycles while the scene is active. Reduced motion disables it, and static/small-screen letter fallbacks keep the cue hidden as before. It is informational, not an interactive button.

Independent source/copy checks and browser evidence are recorded in the companion reports. Current source package is `output/c24-careers-preproduction-2026-11-15.zip`. This work is local; no commit, push or deployment is performed by this review pass.


## Later final styling and footer correction

The later user correction replaces colourful principle surfaces with neutral paper and translucent torn-tape title strips. The illustrations retain their designs. All five ambition illustrations use cropped SVG viewports and the same display-height slot, enlarging their actual painted content consistently. The outer silhouette viewports also share consistent painted top/bottom bounds; no silhouette paths or illustration paths were redrawn.

The deep footer investigation found two separate failures: glyph line boxes exceeded the monogram row, and stale scroll-trigger progress left the footer translated upward at actual document end. Final CSS bounds each monogram glyph by row height and cell width. The reveal now derives progress from current wrapper geometry, retaining the original curve and completing for full-height, compact-phone and short-landscape footers after dynamic content changes. A focused geometry regression protects the endpoint.

## Final automated verification

`npm run build` passed and all 180 tests passed, including the new footer endpoint regression. The final landing geometry matrix covers 19 widths from 320 to 1728 plus 844×390 landscape, with all 35 content cards checked. Independent source review verified that the illustration paths are unchanged and that the tape-title text remains live and readable. Final footer endpoints and subpage journeys are documented by the visual reviewer in the deep UAT report.

Reusable UAT guidance now explicitly requires actual document-end footer checks and painted SVG scale checks. The repository guidance is mirrored to `/Users/a39236/.codex/skills/uat-agent/references/feedback.md`, the only modified file outside the project in this pass.

## Deep rendered acceptance

The frozen landing matrix covers 20 viewport cases; the careers listing matrix covers 19 widths. Phone/desktop detail checks cover all seven role records, all fourteen sourced builder stories (including the two historical direct routes), and all seven support programmes. Listing keyword/department/location filters, empty-state reset, shared builder refresh/neighbor/dismissal, supported application required-field validation, Escape/focus/draft retention and unsupported application notices were exercised without submitting an application.

Final home and listing footer checks reach transform zero at true document end, including 844×390 landscape. C24 glyph line boxes fit inside their cells, legal content remains separate, and the blank translated band is gone. A partial-scroll check preserves a continuous reveal before the endpoint. New neutral tape cards and larger consistent illustrations pass their painted appearance checks. All seven support photos retain natural proportions and their marked highlights panels remain readable.

Coverage remains Chrome viewport simulation with mouse/keyboard. Physical touch, soft keyboards, Safari/Firefox and actual OS reduced-motion preference changes are not certified by this pass. Original source/configuration dependencies remain as documented. No commit, push, deployment or communication to others was performed.

Final independent visual acceptance is complete. See `final-deep-visual.md`: 20 home viewport cases, 19 listing widths plus landscape, all seven roles, fourteen sourced project routes and seven programme overlays, plus seven actual footer endpoints and required-field validation without application delivery. No unresolved material issue remains within the documented Chrome scope.
