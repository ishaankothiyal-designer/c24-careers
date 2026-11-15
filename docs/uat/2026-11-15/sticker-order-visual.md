# Revised sticker hierarchy and principle grid UAT — 15 November 2026

**Accepted locally after fixes.** This pass follows the latest revision: principles remain a responsive grid, superseding the earlier proposed carousel. No product files were changed by this reviewer and no deployment was performed.

## Coverage and resulting behaviour

Geometry was checked at320,375,390,414,600,601,767,768,834,900,901,1023,1024,1100,1280,1440 and1728px, plus844×390 landscape. Follow-up checks added1199/1200px at the corrected title-slot boundary. Actual viewport/document widths match; no card or text horizontal overflow was found.

All five ambition cards were brought into view at320,390,834,1024 and1440px. Their DOM and visual reading order is now **unique phrase → illustration → headline → body**. All five images load and the body text remains within the painted silhouettes. The shield’s lower body text ends approximately331px down its480px card at320, and377px down at1440, safely above its taper. Its illustration remains readable.

The Pause sticker motion control, repeated Cars24 Builders edition labels and principle01–04 numbers are absent. The remaining ambition carousel arrows work; ArrowRight on its focusable track independently advanced the settled horizontal position from325px to650px. Principles have no carousel controls under the latest accepted scope.

The principle grid was verified at its exact boundaries:

| Viewport | Layout |
| --- | --- |
| Through600px | Four cards stacked vertically |
| 601–1023px | Two columns, two rows |
| From1024px | All four cards in one row |

## Findings corrected and rechecked

1. At320px the shield’s top phrase initially ran into the curved upper corners and lost contrast on the white area outside the silhouette. Coordinator capped that caption at18ch. Final painted inspection shows a clean two-line phrase entirely inside the curve; illustration, headline and lower body remain clear.
2. At1024px the first principle title used three lines while the others used two, placing the first paragraph about25px lower. Coordinator reserves a shared three-line title row from1024–1199px while retaining natural white badge heights. Final paragraph tops match across all four cards at1024,1100 and1199px. At1200px the maximum difference is below0.01px from rounding; larger desktop baselines also match.

## Letter cue

The Keep scrolling cue renders as a small sticker beside the active desktop/tablet letter scene. It was inspected at834 and1024px. At834 its right edge is184px while the flat paper starts at234px; at1024 the cue ends190px while the paper starts329px. It does not cover handwritten words or the signature.

While the letter was active, the wheel dot had a changing transform and computed animation `paper-letter-mouse-scroll`,1.6s,3 iterations. After the finite cycles it returned to its unanimated state. Outside the letter, the cue computes opacity0 and visibility hidden. The static390px phone letter also keeps it hidden.

Source inspection confirms the exact active-letter selector is overridden to animation:none under prefers-reduced-motion. Actual OS reduced-motion emulation was unavailable through the supported browser capabilities, so runtime reduced-motion is not claimed.

## Evidence and limits

Ignored evidence is in `output/sticker-order-uat/`:

- `geometry.json` and `final-recheck.json`: initial responsive geometry and corrected caption/title-slot checks.
- `final-shield-320.jpg`: final phrase and lower-body fit within the shield.
- `ambition-320-0.jpg` through `ambition-320-3.jpg`: the other four reordered stickers.
- `final-shield-1440.jpg`: final desktop card order and fit.
- `principles-320.jpg`, `principles-834.jpg`, `final-principles-1024.jpg`, `final-principles-1200.jpg`:1/2/4-column layouts and corrected paragraph alignment.
- `cue-834.jpg`, `cue-1024.jpg`, `cue-hidden-phone-390.jpg`: cue position and phone absence.

Earlier `ambition-320-4.jpg` preserves the pre-fix shield caption issue; earlier `principles-1024.jpg` preserves the pre-fix baseline issue. Use the `final-` versions for those findings.

Final captured console warnings/errors were empty. Chrome viewport simulation and keyboard/mouse input only; physical touch, Safari and Firefox were not tested. Browser ownership was released and the viewport override reset.
