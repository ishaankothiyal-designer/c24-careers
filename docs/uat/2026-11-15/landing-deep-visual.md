# Full landing visual UAT — 15 November 2026

**Accepted locally within the tested scope after fixes.** The review covered the hero, five ambition stickers, working principles, builder stories, job cards, seven support cards, letter, FAQ, closing section and footer. No product source was edited by this reviewer and no deployment/application submission was performed.

## Responsive coverage

Rendered section screenshots were captured and inspected for 320, 375, 390, 414, 768, 834, 1024, 1100, 1280 and 1440px. Eight content sections were independently rechecked in 844×390 landscape; the closing/footer also received targeted landscape checks. Actual viewport width and document width were read. No horizontal document overflow was found.

The card anatomy matrix additionally covered **767, 900, 901, 1023 and 1728px**, for fifteen widths total. It includes **all twelve expanded builder cards, all seven roles, all seven support programmes and all five stickers**. Every card and text block was checked for horizontal overflow, rather than counting intentional carousel peeks as defects. No card/text overflow was found. Expanded builder cards were individually opened and closed at 390 and 1100px. Existing portrait pixel-reveal animation appears in some captures; those intermediate frames are not broken-image evidence.

## Support card recheck

The reported padding/action problem is resolved. At every matrix width, all seven support cards have matching heights within their row, consistent title/body/action insets, and identical CTA distance from the card bottom. Measured insets include the 1px border:

| Width range | Title/body/action left and right | CTA bottom |
| --- | --- | --- |
| 320–767px tested | 21px | 21px |
| 768–1728px tested | 25px | 25px |

Long titles such as Autonaut Future Fund and Compassionate Support wrap within the available width. No copy was shortened or clipped to obtain alignment. The shared title size/line-height now matches the card family. Builder names retain weight500 while support/role headings compute550; this existing distinction was not a visible alignment defect and was not normalized solely on source inspection.

All seven support programmes were opened and closed at phone and desktop widths. The inspected viewport captures show readable descriptions and aligned actions, including the Wellbeing/Compassionate Support comparison requested by the user.

## Findings corrected and independently rechecked

- **Support card anatomy:** the action originally lacked the title/body inset, and the copy wrapper did not fill remaining card height. Coordinator introduced one padded flex column, consistent heading space and an anchored action. All-card measurements above pass.
- **Mobile footer collision:** the Cars24 Careers heading overlapped the legal links at375/390/414px;320px nearly hid the heading. Coordinator corrected the footer grid to its two actual rows, separated legal content and constrained title animation to its own inner region. Rechecked320/375/390/414/767 and844×390: title and legal links are visible in separate rows, including a390px scroll transition. No overlap remains.
- **Builder popup solution flow:** inherited sticky positioning was inappropriate for the single-column popup. The corrected lead computes `position:static`. Anshul at4of12 was inspected through solution/outcomes at1024/1440/390; no heading overlay or horizontal reading overflow remains.
- **Popup surface and backdrop:** builder body is white; outcome cards use quiet backgrounds and content-driven heights. Current backdrop computes60% dark scrim with10px blur; outer title, position and hint remain readable over bright content. The earlier56% state was superseded after the independent contrast review.

## Interaction regression and motion limits

All six FAQ questions expanded correctly at390px. Builder/support popup open-close and focus restoration were exercised repeatedly during card review; the earlier shared-popup report records drag, boundary, adjacent-card, Escape, background lock, role application and shared URL refresh checks. The final captured console warnings/errors were empty. Sticker pause/resume and pixel/paper motion retain their existing interaction pattern.

The available browser advertised viewport and management capabilities only; no supported reduced-motion emulation was exposed. Actual OS reduced-motion, physical phone touch/soft keyboards and Safari/Firefox were **not verified**. These remain explicit coverage limits. This pass does not certify every possible intermediate viewport.

## Evidence

Ignored evidence is in `output/full-landing-uat/`:

- `all-card-matrix.json`: all card families at fifteen widths; `matrix-<width>x<height>.json`: initial section/card geometry at principal widths. The initial844×390 record became invalid after an automated click navigated to the careers listing and is excluded; the eight landscape section screenshots were subsequently overwritten by the verified landing recheck.
- `support-card-1100-compassion.jpg`: recommended full viewport proof with Wellbeing and Compassionate Support, including aligned actions.
- `support-card-390-health.jpg`: recommended phone proof showing the full Compassionate Support card. The filename describes the triggering sequence, not the final centred programme; the loop can reposition neighbouring cards after dismissal.
- `footer-fixed-375x844.jpg`, other `footer-fixed-*` captures and `footer-fixed-matrix.json`: final footer proof. Earlier `*-footer.jpg` captures and footer contact sheet preserve the pre-fix defect.
- `anshul-solution-1440.jpg`, `anshul-outcomes-1440.jpg`, `anshul-outcomes-390.jpg`: final popup surface, backdrop and flow proof.
- Ten `contact-<section>.jpg` sheets and their source viewport images cover full-page section review. They include deliberate animation intermediate frames; settled targeted evidence takes precedence for fixed findings.

Full-page capture experiments are retained as working evidence but are not recommended as user-facing proof. Browser ownership was released and temporary viewport override reset.
