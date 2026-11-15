# Swipeable role popup · visual UAT · 15 November 2026

## Scope and reference

Independent frontend, QA and design review of the local role-popup carousel at `http://127.0.0.1:5173/`. The supplied recording, `ScreenRecording_11-15-2026 12-31-06_1.MP4`, was inspected at representative frames. Its relevant pattern is one centred, vertically readable detail card with adjacent cards peeking into view, a dark surrounding stage and a persistent action area. Retail product content and retail actions were not treated as careers requirements.

Only evidence and this report were written by the reviewer. Product fixes are owned by the coordinator. No application was submitted, no file uploaded, and no deployment performed.

## Coverage completed

- Chrome viewport simulation at **320, 375, 390, 414, 768, 834, 1024, 1280 and 1440px**. The actual viewport was read for each measurement.
- Application popup and outer role sheets remained open during the valid post-fix matrix. Dialogs/close controls fit the viewport at every size. All close controls measured 44×44px. Document and reading/form content widths did not exceed their available width.
- Short-height **844×390 landscape**: outer role sheet fits vertically, with fixed close/navigation/action areas and a 169px vertically scrollable reading area in the tested role.
- Actual horizontal mouse drag at 390px moved Evaluation → Key Accounts, updated the live position to 2 of 7 and changed the URL to the correct role.
- Actual vertical scrolling moved the current role reading area by 1688px while horizontal position remained at 368px and background page scroll remained zero.
- Supported Key Accounts opens a separate application popup. Focus stays inside it. Escape closes only that nested popup and restores focus to the Apply button in the still-open role carousel.
- A synthetic first-name value `UAT` survived closing the application popup, browsing to another role and returning to Key Accounts. No submission was attempted.
- No duplicate DOM IDs were found with three loaded role bodies plus the open application form. Application labels target their correct input IDs.
- Keyboard Home reached role 1 of 7 with Previous disabled; End reached role 7 of 7 with Next disabled. These were checked after native smooth scrolling settled, rather than treating an intermediate scroll frame as a failure.
- The unavailable Evaluation role displays a disabled application action with a truthful availability note.

Evidence is kept in ignored `output/role-carousel-uat/`. Earlier zero-size measurements caused by development reload during source edits were discarded and overwritten; only the open-dialog post-freeze matrices are valid.

## Findings and resolution

| Priority | Finding | Status |
| --- | --- | --- |
| P2 | The initial 64% scrim allowed the underlying fixed header and listing status to compete with the outer carousel’s white toolbar/footer text. | Fixed by the coordinator using a named 94% scrim token. Rechecked at phone, tablet and desktop sizes; the carousel text now reads clearly. |
| P2 | Clicking the visible strip of an inert neighbouring role card at 1440px dismissed the entire popup. The click retargeted to the track and was handled as backdrop dismissal. | Confirmed with a real click at (120,300) on the previous-card peek while role 7 was active; dialog closed and URL returned to `/careers/`. Fixed by the coordinator: a click within a neighbouring card’s visible rectangle selects that role; a true dark gap dismisses. Independent 1440px recheck passed both behaviours. |

The UX-copy reviewer independently reproduced and retested recovery from a role-list failure. Normal instructions are now input-neutral: “Swipe or use the arrows to explore.” Duplicate role names in the detail header, persistent action area and position status serve distinct context/navigation purposes; no blind CTA removal was recommended.

## Visual assessment

The responsive sheet widths, adjacent peeks, rounded panel edges, persistent application action and distinct outer/nested close controls follow the supplied interaction reference while retaining Cars24 typography and colours. Phone headline wraps and application heading wraps remained readable down to 320px. Tablet and desktop sheets use additional width for readable descriptions and form fields, rather than stretching the mobile form indefinitely.

## Remaining checks / limits

Final direct-role refresh, close/back/forward navigation and the adjacent-peek fix were independently rechecked and passed. This is Chrome viewport simulation and mouse/keyboard input, not a physical iPhone/Android touch or soft-keyboard test. No separate Safari/Firefox or OS reduced-motion-setting pass was performed. The current application availability restrictions are retained.


## Final acceptance after fixes

**Accepted locally within the tested coverage.** No material unresolved visual or interaction blocker remains in the inspected scope.

- Direct Key Accounts entry and refresh retained the correct role path and displayed 2 of 7 with the correct role content. Closing a directly visited role returned to `/careers/`.
- In a clean source-list journey, opening Key Accounts pushed its role URL; browser Back closed the popup and restored focus to that same source card; browser Forward reopened Key Accounts at 2 of 7; the explicit Close action again returned to the listing and originating card focus.
- The adjacent-peek regression passed: at 1440px, clicking the visible previous-card strip selected Evaluation and kept the popup open. Clicking the actual dark gap then dismissed it to the listing.
- The final clean browser journey emitted no captured console warnings or errors.
- Application/modal focus, synthetic draft preservation, disabled unavailable-role action, vertical reading, actual horizontal drag, first/last controls, all nine role/application viewport sizes and landscape checks are covered above. Native smooth-scroll intermediate states were allowed to settle before evaluating the selected role.
- Browser ownership was released and the viewport override reset. This was a local-only pass; production was not changed.

Final evidence in ignored `output/role-carousel-uat/` includes `final-carousel-mobile.jpg`, `final-carousel-desktop.jpg`, `application-320.jpg`, `application-834.jpg`, `application-1440.jpg`, `carousel-landscape.jpg`, `carousel-matrix.json`, `application-matrix.json` and `history-checks.json`.
