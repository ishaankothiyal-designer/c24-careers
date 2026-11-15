> Historical exploration — superseded by the user’s subsequent request to remove all role-card stickers. The current implementation and acceptance are in `role-card-removal-implementation.md` and its companion reviews.

# Softer, larger role artwork — visual acceptance

**Accepted locally.** This supersedes the earlier 56px role-sticker treatment. The generated family is larger and softer, each illustration has a real footer row, and phone cards hide the art without reserving its space. No deployment was performed.

## Visual judgment

All seven current role illustrations were opened in actual card screenshots at their final **84px canvas size**. The cream, lilac, violet and green family has softer gray contours and shadows rather than the previous heavy black outline. The car inspection, dealer-network exchange, customer call, auction paddles, car listing, purchase key and report-review concepts remain distinct and recognizable. No artwork or shadow is clipped.

The **396px desktop landing composition** was inspected as a complete row, not accepted only from bounds. The 101px footer feels proportionate: approximately 64–70px of painted artwork has breathing room, with the CTA centered beside it. Common divider/action alignment keeps the taller cards coherent. The additional height buys real separation instead of allowing art to intrude into the summary or divider. The 336px phone composition retains its previous density.

Fresh asset inspection confirms the new **300×300 viewBox**, with the old heavy `#201c36` ink absent. The generated source-sheet group bounds were normalized before extraction; all seven images read as one family at the final display size.

## Responsive measurements

The final matrix covers landing and careers at **320/375/390/414/768/834/1024/1280/1440px**, plus **844×390 landscape**: twenty route/viewport cases, all seven cards in every case.

- All phone widths through 767px compute `display:none` on the illustration, with zero image box and **0px margin**. The footer collapses to **44px**; no hidden 84px art row remains.
- At larger tested widths the artwork is **84px**, with **no negative margin**, inside a **101px footer including padding/divider**. Minimum measured summary-to-art clearance is **38.86px**, and the minimum CTA-label-to-art gap is **63.59px**. No image intersects copy, CTA or the divider above its row.
- There is no text or document overflow in the twenty cases. Body type remains **14.5px/21.75px** and existing card insets/copy are preserved.
- The narrow-container guard uses a content-width threshold of 260px. The tested tablet cards have adequate content width and display the art. The 844×390 case follows the wider-viewport layout and also displays it; the phone fallback is width-based.

| Representative case | Previous 56px treatment | Final treatment | Interpretation |
| --- | --- | --- | --- |
| Landing 1440px | 340.05px card / 45px footer | 396.05px / 101px | +56px creates the real larger-art row |
| Landing 768px | 336px / 45px | 364.89px / 101px | +28.89px; existing spare room absorbs part of the increase |
| Careers 1440px | 336px / 45px | 361.55px / 101px | +25.55px overall |
| Landing 375/390/414px | 336px / 45px, tiny art present | 336px / 44px, art hidden | No card growth or reserved illustration row |
| Careers 320–414px | 336px | 336px, art hidden | Phone density preserved |

The current 320px landing card is 346.94px due to the existing narrow copy wrapping. Its art is hidden and its footer is 44px. This change intentionally allows taller illustrated desktop/tablet cards; the prior no-height-growth expectation for a small negative-margin sticker no longer applies.

## Interaction and evidence

Landing Closure filtering reports one role and the filtered card opens **Help buyers complete a purchase** at the correct direct role URL. Careers Retail filtering reports two roles. No action or accessibility label was replaced by the decorative art. No warning/error entries were captured in the inspected session.

Ignored evidence is under `output/role-sticker-redesign/`:

- `soft-role-0-1440.jpg` through `soft-role-6-1440.jpg` — all seven complete careers cards, opened and inspected.
- `soft-landing-1440.jpg`, `soft-landing-card-1440.jpg` — actual full-row and individual 396px landing composition.
- `soft-phone-no-art-320.jpg` — compact phone fallback, opened and inspected.
- `soft-card-matrix.json` — complete rendered measurements.
- `source-sheet-browser.png`, `group-bounds.json` — generated-family and extraction framing evidence.

The coordinator separately reports the build, 188 tests and diff checks passing. This reviewer made no product edits, did not inspect or modify the unrelated concurrent footer changes, and did not deploy or package them. Browser completion summary is recorded, viewport overrides are reset and browser ownership is released.
