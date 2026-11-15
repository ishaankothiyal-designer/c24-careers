# Independent role-popup carousel brief/code UAT · 15 November 2026

Scope: the later user request to make full role details a popup carousel, swipe left/right between postings, and keep the experience responsive on mobile. The supplied reference is `ScreenRecording_11-15-2026 12-31-06_1.MP4`; the parent extracted `output/role-carousel-reference/contact-sheet.jpg`. This pass independently reviews implementation, lifecycle and behaviour against the described request. Browser/visual inspection belongs to the visual reviewer. Authorization for this iteration is local only; no deployment was attempted by this reviewer.

## Verdict

**No unresolved code/brief blocker found after the recovery fix below.** The implementation provides a full-role popup deck rather than only making the small landing-page cards horizontally scrollable. It keeps live descriptions and application logic, supports both touch and non-touch navigation, and maintains the selected posting’s URL for direct refresh. Final responsive/swipe sign-off requires the visual reviewer’s rendered evidence.

## Finding discovered and rechecked

### P2 · Reopening after a role-list failure kept a stale failure hint — resolved

Initial reproduction: first `loadJobs()` rejects, close the popup, then reopen after the next `loadJobs()` succeeds. The carousel correctly mounted two postings and hid Retry, but still displayed **“Other roles couldn’t load.”** The success path did not restore the normal hint; only clicking Retry reset the text.

The independent failing harness was `/tmp/role-dialog-uat.test.mjs`, using the real `initializeRoleDialog()` with the repository’s deterministic DOM fixture. It logged: `recovered deck: 2; retry hidden: true; hint: Other roles couldn’t load.`

The coordinator corrected both fresh-open and successful-deck-load state. Current source now restores **“Swipe or use the arrows to explore”** and resets Retry when beginning a new session. The new repository regression verifies failure → dismiss → reopen → successful deck recovery. The current focused suite passes; no stale error remains in the independent recovery check.

## Acceptance matrix

| Requirement / invariant | Assessment | Independent evidence |
| --- | --- | --- |
| Full role details inside the popup | Met in source | Each slide mounts the full `roleDetailPage()` / `loadLiveRole()` output. The header, facts, description and location details remain in its vertical reading area. The application is moved to a separate modal rather than duplicated. |
| Browse other postings from the same popup | Met in source and focused behaviour | `getLiveJobs()` supplies the current live IDs; the deck deduplicates paths and retains the initially requested path. Previous/Next and nearest-scroll selection update the active entry. Tests verify multiple live postings, edge controls and position state. The actual number of live postings is data-dependent rather than hardcoded. |
| Native mobile swipe | Implemented; rendered test delegated | The track uses native overflow scrolling and snap positions with `pan-x pan-y`. Pointer logic only captures a mouse after a horizontal drag threshold, so touch remains native. A focused test confirms touch pointerdown is not consumed. Physical-phone gesture performance is not established by these code tests. |
| Desktop/tablet alternatives | Met in source and focused behaviour | Mouse drag, Previous/Next, and Arrow/Home/End keys on the carousel track are available. Only the nearest active slide is accessible/interactable. Responsive dimensions, reading overflow and controls are in `role-carousel.css`; visual fit still requires the matrix review. |
| Preserve actual descriptions and locations | Met | `liveRoleHtml()` remains the full-description renderer. Compact location summary now reuses `roleMetadata()`, while the full location section and source description are retained. No new role outcomes, requirements or policy claims are invented. |
| Correct application per role | Met in source and focused behaviour | The selected entry owns its detached application DOM. Only a supported form produces an enabled Apply action. The application popup displays that role’s official title. The added onLoaded regression proves that browsing away/back reuses the same form section and draft object, not another role’s form. |
| Existing application restrictions | Preserved | Unsupported required-location mappings remain unavailable. The carousel does not enable unsupported submissions or replace the original submission/uncertain-outcome protection. No application was submitted during this audit. |
| No residual duplicate application CTA | Met in source | The inline jump action is removed and the original application section is detached before the slide footer action is created. The footer supplies one Apply or unavailable state. |
| Modal close/focus/scroll lifecycle | Met in source and focused behaviour | The role popup locks background scrolling and restores the origin. The application popup has its own native modal trap, close/Escape/backdrop handling and return focus to the same role action. Closing the role popup closes the application popup first. |
| IDs and accessible names | Coherent source design; DOM evidence delegated | Each slide gets a unique heading ID and non-active slides become inert/aria-hidden. Remaining detail IDs and references are namespaced after the form is detached. Only one detached application section is mounted at once, keeping its field-label IDs singular. The visual reviewer is responsible for actual rendered duplicate-ID/focus checks. |
| Role URL and browser history | Met in source and focused behaviour | Opening from a page pushes once; browsing replaces that entry. Closing uses Back for a pushed popup and returns a direct initial role route to `/careers/`. `popstate` opens/reselects a role without pushing again. Direct-role paths are retained while open, supporting a fresh route visit/refresh. Browser history and actual refresh require rendered verification. |
| Async list cancellation | Met in independent stress checks | The session token and `dialog.open` check reject late results from a closed session. An additional harness closed session A, opened B, then resolved A’s deck: B remained a single active role until its own deck resolved; subsequent Next selected B’s neighbor. |
| Async detail cancellation and title isolation | Met in independent stress checks | Dismiss aborts every entry controller. The onLoaded handler immediately ignores an aborted entry. A separate harness invoked an old callback and resolved its promise after dismissal: the popup stayed closed, track stayed empty and title stayed restored. Background `loadLiveRole()` uses `updateTitle:false`; the focused retry test proves callback continuity without replacing the active title. |
| Hero flow change preserved | Met in source | The current hero keeps “The internet brought cars online.” followed directly by the accent sentence in the same heading, with the former forced `<br/>` removed. This UAT pass made no product edits. |
| Local-only iteration | Preserved by this pass | No remote message, commit, push or deployment was made. Previous deployment authorization is not reused for this later local-only change. |

## Independent execution

- `node --test tests/live-role-detail.test.mjs tests/role-dialog.test.mjs tests/role-carousel.test.mjs`: **20 tests passed**.
- `/tmp/role-dialog-uat-expanded.test.mjs`: the current seven role-dialog scenarios plus two additional independent session/detail-cancellation stress cases all passed. These overlap the repository cases and are not counted as extra full-suite coverage.
- `git diff --check`: passed at review time.

The full-suite count is the coordinator’s responsibility; this report does not infer complete responsiveness or zero defects from unit-test output. The remaining visual matrix, real native gestures, direct refresh and browser Back/Forward results should be cited from the visual reviewer’s report before calling this local iteration fully signed off.

## Inert neighboring-slide click recheck · 15 November 2026

The visual reviewer found another P2 interaction defect: tapping a visible sliver of the neighboring slide dismissed the whole popup. Non-active slides are intentionally inert, so the browser retargeted that click to the track, which the old handler treated as blanket backdrop dismissal.

I independently inspected the correction in `role-dialog.js`. A click retargeted to the track is now hit-tested against the slides’ actual viewport rectangles. A point within a visible slide rectangle selects that posting; only a point in a genuine gap dismisses. Direct dialog-backdrop clicks still dismiss, and the carousel’s capture-phase drag-click suppression remains in place.

I ran `node --test tests/role-dialog.test.mjs tests/role-carousel.test.mjs`: **all 10 focused tests passed**. The new regression explicitly sends a track-retargeted click inside the neighboring rectangle and verifies that the dialog stays open and the selected role URL changes, then sends a point in the inter-slide gap and verifies dismissal through the single history entry.

**Code/test verdict: resolved.** No new blocker found in this patch. The visual reviewer is independently rechecking real inert-event retargeting and the visible peek area in the browser; this code pass does not substitute for that evidence. Local-only scope remains unchanged.
