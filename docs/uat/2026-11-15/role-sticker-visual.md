# Role-specific card stickers — visual acceptance

**Accepted locally. No unresolved material finding.** Every current job card has a legible role-specific sticker in the same bottom-right position on both the landing page and careers listing. The release visual/configuration gates are clear; production verification remains a separate step after deployment.

## Responsive card audit

The rendered audit covered both routes at **320/375/390/414/768/834/1024/1280/1440px**, plus **844×390 landscape**: twenty route/viewport cases and all seven cards in each case. Actual document widths equal the tested viewport widths.

- All sticker images retain the same **56×56px canvas**, white keyline, ink shadow and palette. Their fixed −5° tilt gives an approximately 60.67px painted bounding rectangle.
- The minimum measured gap between the CTA label and painted image is **28.99px**, on the 320px landing carousel. The minimum summary-to-image clearance is **10.67px**. No text or action is covered.
- Painted corner insets are consistent across all seven cards: approximately **18.67px** at phone widths and **22.67px** on desktop, including the tilt. The sticker can cross the footer divider as intended, while remaining inside the card.
- The footer remains **45px including its 1px top divider**, consistent with the existing 44px content/control row. At 375/390/414px the landing cards remain **336px high**, matching the recorded pre-sticker measurements: **0px growth**. The 320px landing cards are 347.94px with the current copy; the listing cards are 336px. No additional tall illustration row was introduced.
- The outer footer's visible overflow reports approximately 2px from the rotated decorative image. This is contained paint, not text overflow. The final matrix distinguishes it explicitly; actual CTA text remains inside its available space.

## Actual illustration review

All seven SVGs loaded and were opened in actual card screenshots at their 56px display size. The distinct imagery reads correctly in context:

| Role | Observed sticker |
| --- | --- |
| Evaluation Engineer | Car and inspection magnifier |
| Key Accounts | Car/network relationship and handshake |
| Retail Associate | Customer phone and conversation bubble |
| Procurement Associate | Auction gavel and car |
| Listing | Listing/image card and upload arrow |
| Closure | Hand receiving a purchase key |
| Procurement | Inspection/report document and review magnifier |

The illustration weights are consistent enough to read as one set. Details remain recognizable; none requires text baked into the art. The title, official role, summary and CTA continue to supply the meaning and accessible card name. Stickers are decorative and do not create a separate action.

## Bounded release regression

Prior full landing, shared-popup, image, gesture and micro-motion passes remain applicable; they were not repeated across every content/width combination after a footer-image addition. The final representative regression confirms:

- Careers Closure filtering returns one role; its sticker-bearing card opens the correct role. The direct role URL and selected content survive refresh.
- Direct Manvi survives refresh. An actual **18px** mouse drag advances to Nishant and updates the shared URL; Escape dismisses normally.
- The existing side controls and gentle carousel gesture remain functional. The accepted separate 30-case shared-popup matrix and micro-motion report cover those unchanged components.
- At the actual 320×844 home endpoint, scroll reaches **7944/7944**, footer transform is **zero**, footer bottom is **844.16px**, and document width remains 320px. No blank band appears.
- No warning/error entries were captured in the inspected final session. No application was submitted.

Immediately before release handoff, the authenticated [Vercel Environments UI](https://vercel.com/design-ea38/c24-careers/settings/environments) again showed existing project **design-ea38/c24-careers**, **Production tracking main**, primary domain **c24-careers-chi.vercel.app**. This was read-only; no settings or hosting project changed.

## Evidence and release visual summary

Ignored evidence under `output/role-card-stickers/`:

- `role-0-1440.jpg` through `role-6-1440.jpg` — all seven complete cards and actual-size art, opened and inspected.
- `landing-role-320.jpg` — narrow landing CTA/illustration clearance.
- `listing-rows-1-2-1440.jpg`, `listing-rows-2-3-1440.jpg` — listing context.
- `footer-320.jpg` — final home endpoint.
- `card-matrix-final.json` — final annotated twenty-case matrix. `card-matrix.json` preserves the raw measurements, including intentional outer-footer paint overflow.

The first clipped screenshot attempts used viewport rather than document clip coordinates and were replaced. The final named card screenshots were captured with the relevant row clear of the sticky header.

**Release visual summary:** job-card stickers, popup side controls/short images/gentle dragging, illustrated View more, green shield shadow and ambition micro-motion are locally accepted. The existing Vercel branch/domain is verified. The coordinator owns the final updated test/build results, authorized main push and exact-deployment smoke. This is responsive Chrome testing; touch/pen hardware and OS preference emulation limitations remain documented in the earlier reports. Browser completion is recorded, viewport overrides are reset and browser ownership is released pending production smoke.
