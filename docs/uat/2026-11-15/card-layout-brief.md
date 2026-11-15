# Deep landing-page brief and structure review

Independent source/acceptance review of the support-card corrections and shared-popup refinements. Product files were not edited by this reviewer. Browser operation and final screenshot judgment belong to the visual reviewer.

## Acceptance evidence

| Requirement | Evidence | Result |
|---|---|---|
| Support heading, body and action share consistent padding | The growing copy wrapper owns padding; scoped heading/paragraph margin and width resets prevent inherited extra insets. Independently read all-card-matrix.json: all seven cards have matching 21px left/right inset at phone widths and 25px at tablet/desktop widths, including the border. | Pass |
| Support actions share a stable bottom edge | Copy wrapper flexes, image does not shrink, action uses the remaining space. Every measured support action has the same 21px/25px bottom inset across the seven cards. Content was not shortened. | Pass |
| Support card heading scale follows the other career cards | Explicit scoped size, line-height and tracking use shared career-card tokens and defeat the older section-heading rule. Existing heading weight differs between builders (500) and roles/support (550); this is not independently identified as a visual defect. | Pass |
| All card collections retain their content and fit across breakpoint boundaries | Independently inspected the visual reviewer’s all-card matrix at 320,375,390,414,767,768,834,900,901,1023,1024,1100,1280,1440,1728 widths. Each entry measures 12 builders,7 roles,5 stickers,7 support cards; none flags card overflow or a broken image. Document width matches viewport width. | Pass for recorded geometry |
| Shared popup backdrop remains lighter and readable | 60% RGB(20,21,35) plus 10px blur; white hints now fully opaque. Worst-case compositing over white gives RGB(114,114.6,123), with 4.734:1 white-text contrast. | Pass |
| Builder popup content has a coherent reading surface | White reading sections, subtle outcome divider and compact outcome cards are applied. Explicit position:static clears the inherited desktop sticky solution lead within the popup. | Pass in source; screenshot judgment owned by visual reviewer |
| Shared popup flow and source URLs survive changes | Independently reran project-drawer, content-popup, role-carousel and role-dialog tests: 24/24 pass. Includes normal12/legacydirect13 builder decks, external/nondeck navigation, shared URL selection/close, async cancellation, role draft retention and neighbor-preview clicks. | Pass |
| Mobile footer title avoids legal content | Mobile stage now has normal-flow title and legal areas. The title clamp intersects the actual stage-inner rectangle instead of the full stage, excluding the legal row. Feedback CSS imports after the previous footer layout and wins the cascade. | Pass; companion visual recheck accepted320/375/390/414/767 and844×390, including390px mid-scroll |

## Review coverage and limits

The previous popup-focused acceptance did not prove card anatomy across all landing-page cards. This pass explicitly measures title/body/action insets and bottom alignment for every support item, checks all card collections, and includes widths adjacent to the 767/768,900/901 and1023/1024 breakpoints. The artifact matrix is browser geometry evidence; it does not substitute for the visual reviewer’s screenshot, footer-animation and short-landscape checks.

No remaining brief/source blocker was identified in this pass. The companion visual reviewer subsequently accepted the footer at320/375/390/414/767 widths and844×390 landscape, with distinct title/legal rows and143–169px separation on mobile and111px in landscape;390px mid-scroll was also checked. Anshul’s builder popup was accepted at390/1024/1440 with the corrected background and non-sticky solution heading. Final control-interaction evidence is owned by the visual reviewer. Physical touch devices and non-Chromium browsers are not proven by this audit. Earlier source-dependent limitations in brief-review.md remain unchanged. This review authorizes no deployment.
