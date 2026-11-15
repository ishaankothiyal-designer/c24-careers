# Local role-popup carousel · 15 November 2026

Reference: user-supplied 15.6-second mobile recording showing whole product-detail panels swiping horizontally. The recording and contact sheet remain local; no third-party product copy or imagery was added to Careers.

## Result

- The real job postings now occupy separate rounded popup panels, with a sliver of adjacent roles visible.
- Native horizontal touch scrolling/snap, desktop drag, previous/next buttons and keyboard navigation on the carousel track browse the same deck.
- Each panel has its own vertical reading surface and footer action. The background page stays locked.
- Supported roles open their application in a separate native modal. Its heading identifies the role; close/Escape returns to that role’s action. The same cached form node is retained per role, keeping draft inputs and selected files associated with that job while browsing.
- Existing required-location/backend restrictions remain in place. Unavailable application actions are disabled and explained rather than collecting details for an unsupported submission.
- Browsing replaces the current role URL instead of adding one history entry per role. Direct links and refresh use the same carousel, and closing returns to the original page/history entry or the roles listing.
- Role details and nearby roles load on demand using the existing shared jobs request. Offscreen responses cannot change the active title; dismissed sessions and requests cannot reopen a popup. Details retain the source description, all locations and requirements.

## Editable files

- `src/runtime/role-dialog.js`: popup deck, history, form popup and per-role cache.
- `src/runtime/role-carousel.js`: native scrolling, accessible selection, boundaries, arrows and desktop drag.
- `src/styles/role-carousel.css`: responsive panels, peeks, dark stage, navigation and form popup.
- `src/runtime/live-role.js`: optional background-title isolation and successful-load callback, including retries.
- `src/runtime/live-jobs.js`: exports the existing shared job-list promise for reuse.

## Acceptance evidence

See [visual review](role-carousel-visual.md), [copy review](role-carousel-copy.md) and [brief/code review](role-carousel-brief.md). Browser evidence is retained in ignored `output/role-carousel-uat/`. Additional regressions cover navigation/history, late-session cancellation, per-role application drafts, recovered-list messaging and inert preview taps. No application was submitted.

This iteration is local and has not been committed, pushed or deployed. The previous hero-continuity edit is preserved. Final build/test results and visual coverage are summarized in the task’s completion reply and reviewer reports. Physical-phone/Safari verification remains separate from Chrome viewport testing.

## Final local validation

Production build passed; all 169 tests passed; `git diff --check` passed. Independent copy and brief/code reviews accepted the final implementation. Visual review passed 320/375/390/414/768/834/1024/1280/1440px and 844×390 landscape. Actual drag, independent vertical scrolling, supported application popup/draft return, unavailable-role action, adjacent-preview taps, direct role refresh, browser Back/Forward, close and focus restoration passed in Chrome. The final clean browser journey reported no console warnings or errors. No application was submitted.

Final local previews: `output/role-carousel-uat/final-carousel-desktop.jpg` and `final-carousel-mobile.jpg`.
