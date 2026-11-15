# Shared popup side controls and gentle gestures — visual UAT

**Accepted locally. No unresolved material finding in the verified scope.** This covers the shorter centered images, side pixel controls, hidden visual footer/counter, preview blur, gentle drag behavior, illustrated View more card and green shield shadow. No deployment was performed.

## Responsive and content verification

The final matrix contains **30 cases**: role, builder and support popups at **320/375/390/414/768/834/1024/1280/1440px**, plus **844×390 landscape**. Actual viewport widths were verified. The phone cases were rerun after the card widened from `vw−80` to `vw−64`; `output/popup-side-controls/three-family-final-matrix.json` supersedes the earlier candidate matrix.

- Every case has zero document/text overflow, no arrow intersection with active copy and no duplicate popup IDs. Normal side controls are 44×44px and centered vertically. At 320px their inner edges stop at x46/x274, while text begins/ends at x52/x268, leaving **6px clear**.
- The narrow Key Accounts title initially isolated “with” on a line. The wider phone column resolves it without reducing type: the final 216px reading width gives “Build lasting” / “relationships with” / “key accounts” at 28px/31.36px.
- Active slides remain sharp (`filter:none`, opacity 1); inactive previews use 3px blur and remain inert. No visible page counter or footer navigation remains. Status/hint text is visually hidden rather than occupying the reading area.
- All seven support hero images, plus the Future Fund gallery image, were captured and opened for actual inspection at 320px. Faces and illustrated subjects remain complete. Centered `contain` framing and its white sidebars are intentional. Phone frames are approximately 152px at 844px viewport height, capped at 160px; desktop frames cap at 260px. The final 1440px Founders’ Awards screenshot confirms the complete centered photograph.
- Vertical role reading, close/Escape, direct builder routes and normal side navigation remain usable. A nested Key Accounts application fits on phone; fictional first-name input works and Escape restores focus to Apply. No application was submitted.

## Error-state and focus checks

The ignored local fixture uses the real role dialog/component imports and current application styles while making only the neighboring-job list fail. The first fixture capture lacked global styles and is **excluded**. The fully styled final capture is `role-retry-fully-styled-final-320.jpg`.

In the final styled fixture, Apply is **216×53px** and ends at y764; Retry is **160×58px** and begins at y770. The **6px separation** prevents the error action covering Apply. Retry is clickable and retains the already loaded Key Accounts role. This verifies component error-state layout; it is not a claim that a real network failure occurred during normal browsing.

Keyboard focus on a side pixel arrow is visible: blue background with a 3px white ring inset 7px. Close controls retain a 44px target. Interactive form controls remain usable.

## Gesture verification and limits

Actual **24px horizontal mouse drags** advanced exactly one neighbor for all three popup families at both 320px and 1440px. Each result had one active slide and no residual blur. After the final interruption/cancellation fix, focused checks confirmed:

- A 4px tiny drag and a 2px-horizontal/70px-vertical drag retain the current selection.
- Outward 24px drags at the first and last support slides stay at their boundaries.
- Role PageDown scrolls its reading container independently (682px observed).
- Wheel input during smooth snapping settles with selected and nearest cards agreeing; subsequent controls continue to work.

The browser API does **not** expose documented touch/pen injection or multi-touch cancellation. These are mouse/browser viewport checks, not hardware touch certification. The exact divergent-target interruption could not be forced through the browser wheel adapter; the coordinator independently reproduced and tested it with event regressions, together with editable-target and lost-pointer-capture cancellation. The coordinator reports the final build, **185 tests** and diff checks passing.

## Additional artwork and reveal behavior

The dark shield’s green 5px shadow is visible at 320/1440px without clipping the copy. The View more card’s lilac grid, illustrated open book, green arrow/sparkles and cream label read clearly at both sizes. Keyboard Enter still exposes all twelve builder stories and focuses Vishal. Page Y is unchanged at both sizes; measured section-height variation is below 0.4px. The artwork changes do not introduce a separate expansion link.

## Final evidence

All screenshots below are ignored local artifacts under `output/popup-side-controls/`:

- `support-{future,care,health,wellbeing,compassion,growth,recognition}-final-320.jpg`
- `support-future-gallery-final-320.jpg`
- `support-recognition-final-1440.jpg`
- `role-keyaccounts-final-320.jpg`
- `role-retry-fully-styled-final-320.jpg`
- `green-shield-final-320.jpg`, `green-shield-final-1440.jpg`
- `view-more-final-320.jpg`, `view-more-final-1440.jpg`
- `three-family-final-matrix.json`, `support-photo-checks-320.json`, `gentle-drag-checks.json`

The final 1440px artwork captures were recreated in a fresh selected tab after an interrupted navigation; the named final files now contain valid appearance proof. Earlier candidate geometry and the unstyled retry fixture do not determine acceptance. No warning/error entries were captured in the final inspected session. Viewport overrides are reset, the browser completion summary is recorded and browser ownership is released.
