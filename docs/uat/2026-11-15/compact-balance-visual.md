# Compact card balance — visual acceptance

**Accepted.** The final compact ambition stickers, centered working-principle cards and intentionally oversized footer match the latest correction. No unresolved material finding remains in this targeted pass. This supersedes the 520px height and fully contained C24 expectations in earlier reports; the wider route coverage remains documented in `final-deep-visual.md`.

## Before and after

The earlier 520px ambition cards contained their copy, but the composition was uneven: desktop caption-top clearance was 40px against 103–142px below the body; tablet clearance was 40px above versus 138–161px below. Containment alone did not satisfy the user's request for balanced padding.

The final intrinsic rows are substantially shorter and center the regular sticker content. The shield retains additional lower space because its outline tapers; its copy must clear that taper rather than use mechanically equal rectangular padding.

| Actual viewport | Ambition height, before → final | Final regular-sticker top/bottom clearance | Principle heights, before → final |
| --- | --- | --- | --- |
| 320×844 | 520 → 409.7px | 50.5–70.2px, paired top/bottom within 0.01px | 268–292 → 252.5–276.7px |
| 834×955 | 520 → 404.6px | 60.5–71.4px, paired within 0.01px | 326.6 → 259.4px |
| 1440×955 | 520 → 421.9px | 60.5–71.4px, paired within 0.01px | 337.3 → 264.5px |

All four principle cards have equal 21px top and bottom content clearance at the three principal review widths. Artwork, tape headings and body text are centered. Natural text wrapping determines mobile height; there is no tall reserved heading slot. The sharp corners and larger painted illustrations are visible in the final screenshots.

## Painted review and resolved finding

The first compact phone shield left a long body line almost against the sloped edge. Reducing its width to 17ch changed the line breaks but initially placed another long line near the lower taper. The final 80px phone foot reserve resolves that painted problem while keeping the overall row at approximately 410px, about 21% shorter than the rejected 520px version.

At 320px the final shield body computes to 14px/20.3px Geist, max-width 157.794px, actual width 157.789px inside a 184.797px copy wrapper. Actual screenshot inspection confirms approximately 10–14px of dark silhouette beside the final line, a clear caption above the illustration and readable art. The desktop shield remains comfortably inside its broader silhouette with the 20ch body measure and 56px lower reserve. No copy was removed to obtain the fit.

The final 20-case responsive matrix covers 320/375/390/414/600/601/767/768/834/900/901/1023/1024/1100/1199/1200/1280/1440/1728px and 844×390 landscape. Actual viewport/document widths match; none of the five ambition cards or four principles has horizontal text overflow. The 1/2/4-column principle layout remains correct at 600/601 and 1023/1024 boundaries. All final measurements are in ignored `output/compact-balance-uat/final-matrix.json`.

## Footer correction

The user explicitly prefers oversized, slightly cropped C24 glyphs. That controlled crop is accepted as intentional artwork. The meaningful completion check remains that the footer finishes its reveal and does not leave an empty blue band below.

At the actual home document end, 1100×955 reached scroll 8667/8667 with footer transform exactly zero and bottom 955.74px. Its 574.91px monogram font intentionally exceeds the 343.8px cell. At 390×844 the footer transform was also zero and bottom 844.09px. The tiny fractional differences are layout rounding, not a visible band. These checks followed the compact CSS change; earlier full route/end-state evidence remains in the deep report.

## Final evidence

- `output/compact-balance-uat/final-shield-320.jpg` — final narrow shield and safe tapered-edge copy.
- `output/compact-balance-uat/final-stickers-1440.jpg` — compact desktop cards including the final shield.
- `output/compact-balance-uat/final-principles-1440.jpg` — centered sharp-corner desktop cards.
- `output/compact-balance-uat/final-principles-834.jpg` — centered tablet grid.
- `output/compact-balance-uat/final-principles-320.jpg` — natural-height phone stack.
- `output/compact-balance-uat/final-footer-oversize-1100.jpg` — approved oversized footer treatment with complete reveal.
- `output/compact-balance-uat/final-footer-390.jpg` — phone endpoint.

The `candidate-*` screenshots and `candidate-metrics.json` are diagnostic iterations, not final acceptance evidence. The final screenshots were opened and inspected rather than accepted only from bounding boxes. No warning/error entries were captured in the inspected session. The coordinator independently reports the build and all 180 tests passing; this reviewer did not duplicate them. Browser viewport overrides were reset and browser ownership released. No deployment or form submission was performed.
