# Preproduction polish visual UAT — 15 November 2026

**Accepted locally after fixes.** No material unresolved visual or interaction blocker remains in the tested scope. This pass reviews the new ambition illustrations, Flatland principle cards, compact support cards, role-summary cards and support popup photo/highlight changes, with shared-popup, letter, FAQ and footer regressions. No product source was edited by this reviewer and no deployment/application submission was performed.

## Responsive and all-card coverage

Actual viewport and document widths were read at **320,375,390,414,767,768,834,900,901,1023,1024,1100,1280,1440 and1728px**, plus **844×390 landscape**. Phone320/375/390 heights were844px; other portrait matrix cases used955px. Changed sections received rendered captures at these sizes. The final anatomy matrix includes **12 builder stories,7 live roles,7 support programmes,5 ambition stickers and4 principle cards**. No document, card or text horizontal overflow was found.

All nine new SVG illustrations loaded successfully. Every ambition illustration and principle illustration was individually brought into view at320 and1440px. Additional final art/badge checks covered390,834 and1100px. Bounds were treated as evidence to investigate, rather than proof of painted collisions: rotated image rectangles on the first two ambition cards overlap nearby block rectangles by1–4px at a few widths, but actual SVG paint has breathing room and does not touch copy or captions.

## Findings resolved

| Finding | Resolution and independent recheck |
| --- | --- |
| At320px the long fourth principle badge rose into the absolute04 number; the assumptions word had almost no badge-edge breathing room. | Coordinator reserved a separate mobile number zone, widened available title space and reduced mobile title size to21px. Final320px image shows04 clearly above its badge and assumptions fitting with padding. |
| Desktop principle descriptions started at different heights when one title used a single line. | Coordinator reserved a consistent title grid row while keeping the white badge’s own natural height. All four paragraph tops match at every tested multi-column width767–1728px. |
| The shield’s new house/world art was recognizable but too small at320px. | Coordinator recovered approximately24px of internal vertical space with shield-only copy margins and lower padding adjustment. Painted art is now approximately50px, readable, separated from the caption and contained in the dark silhouette. |
| Compact support presentation needed consistent insets and anchored actions after title spacing/image changes. | All seven cards retain equal heights within each viewport row and identical left/right/action-bottom insets:21px including border below768px,25px from768px. Current heights are approximately371px at320,383px at390 and486px at1440. No title or body was truncated. |

## Role cards and full details

Landing cards now show the problem headline, official role title, grounded summary and View role details action. Final390px and1440px proof captures show actual landing cards after modal entry/exit paint settled. Summaries fit their available width and actions align at the bottom.

All seven roles were opened at390 and1440px and explicitly awaited loaded facts before inspection. Each retained its full detail text, facts and content sections: approximately2300–3150 visible text characters and4–5 section headings in the inspected states. No detail-reading overflow was found. The early loading-only inspection was discarded and overwritten in `role-details-regression.json`.

Key Accounts application regression passed: Apply opens a separate nested dialog; Escape closes only that dialog and restores the Apply button while leaving role details open. No application was submitted.

## Support popups and photography

All seven programme popups were checked at390 and1440px. Every photo preserves its natural aspect ratio, with measured ratio differences below0.00002 from fractional pixel rounding and `max-height:none`. All photos were confirmed loaded; the first desktop Future capture was rechecked after decoding completed. Every programme retains a semantic two-item highlight list.

The final Founders’ Awards photo was independently inspected after the dialog reached computed opacity1. Both people’s heads remain fully inside the image on phone and desktop. The highlight list uses a balanced quiet panel with readable checkmarks and padding; it remains within the reading area. Photos, content and highlights are vertically accessible inside the popup.

## Regression and evidence quality

The desktop letter still displays the complete handwritten content and signature; its shadow/FAQ exit remains intact. The mobile static letter signature and FAQ transition remain readable. Final390px footer title and legal links remain in distinct rows: inspected title bottom414.5px and legal top582.3px. Final captured browser warnings/errors were empty.

The shared popup has a finite160ms opacity entry animation. Several immediate-open screenshots caught only the blurred backdrop; those are **excluded as final appearance proof**. Settled proof was captured on a subsequent tool call after confirming opacity1. The browser’s read-only DOM interface does not expose getAnimations; no unsupported animation API was assumed. Earlier contact sheets also precede the final principle/support refinements; use files prefixed `final-` and `final-card-matrix.json` for acceptance.

## Recommended evidence

All screenshots and JSON evidence are ignored under `output/preproduction-polish-uat/`:

- `final-card-matrix.json`: final fifteen-width plus landscape anatomy results.
- `final-shield-320.jpg`: enlarged painted shield art and contained two-line caption.
- `final-principles-320.jpg`, `final-principles-1440.jpg`: number/badge clearance, live copy and aligned desktop descriptions.
- `ambition-risk-1280.jpg`: actual painted first-three ambition illustrations with clear text separation.
- `final-role-cards-390.jpg`, `final-role-cards-1440.jpg`: actual landing role summaries.
- `final-support-cards-1440.jpg`: compact card spacing and aligned actions.
- `final-awards-photo-390.jpg`, `final-awards-photo-1440.jpg`: settled uncropped photography.
- `final-awards-highlights-390.jpg`, `final-awards-highlights-1440.jpg`: balanced semantic highlight panels.
- `final-letter-1440.jpg`, `final-letter-faq-390.jpg`, `final-footer-390.jpg`: lower-page regression proof.
- `support-photo-matrix.json`, `role-details-regression.json`: loaded content/photo checks.

## Limits

Chrome viewport simulation with mouse and keyboard input. Physical touch, mobile keyboards, Safari, Firefox and actual OS reduced-motion settings were not tested. No supported reduced-motion emulation capability was exposed by this browser session. The exact tested widths are listed above; this does not certify every possible intermediate width. Browser ownership was released and the temporary viewport override reset.
