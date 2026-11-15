# Role carousel UX copy UAT · 15 November 2026

## Scope

Reviewed the new complete-role popup carousel, separate application popup and their source-rendered labels, instructions, availability states, recovery text and accessible names. Sources: `src/runtime/role-dialog.js`, `src/runtime/role-carousel.js`, `src/styles/role-carousel.css`, `src/runtime/live-role.js`, `src/role-layout.js` and the focused carousel/dialog/live-detail tests.

This pass did not use the browser, edit product files or deploy anything. The visual reviewer owns desktop/mobile gesture and layout verification. The earlier hero-flow change is preserved: the heading uses normal flowing text and the accent span, with no hard `<br>` reintroduced by this review.

## Actionable finding

### RC-COPY-01 · P2 · A recovered role list can still announce failure after reopening

**Trigger:** Role-list fetching fails on the first modal open. The reader closes the modal, then opens a role again when the list request succeeds.

**Current result:** `loadDeck()` failure sets the shared hint to `Other roles couldn’t load.` Its success branch mounts the roles and hides Retry, but never restores the hint text. When two or more roles load, `updateControls()` reveals that same stale hint. The reader sees an error even though all roles are available and navigation works.

**Source:** `src/runtime/role-dialog.js`, the `loadDeck` success/catch branches and `updateControls` hint visibility.

**Reproduction:** Ran the repository’s `tests/role-dialog.test.mjs` setup with an injected `loadJobs` implementation that rejects once, then resolves to two roles. Open → await failure → close → reopen → await success produced:

```text
Failed first open: hint="Other roles couldn’t load.", retryHidden=false
Successful second open: roles=2, hint="Other roles couldn’t load.", hintHidden=false, retryHidden=true
```

**Required treatment:** On successful role-list recovery, restore the normal navigation instruction before showing the hint, and hide the stale retry control. A fresh open should not display an old session’s failure as current progress. Add a regression for failure → close → successful reopen, distinct from clicking Retry.

**Acceptance:** The recovered carousel displays the correct role count/title and a navigation hint, with no failure message or retry control remaining. A genuinely failed load still explains that other roles could not load and retains a working retry action.

## Non-blocking copy refinements

1. **Hint across input types.** Current `Swipe left or right to explore` is clear on mobile but instructionally narrow on desktop. `Swipe or use the arrows to explore` would describe the visible controls on all devices without enumerating every gesture. Keep Previous role / Next role accessible names.
2. **Retry action.** `Retry role list` is understandable but implementation-oriented. `Load other roles` makes its task clearer beside `Other roles couldn’t load.` This is polish, not a reason to block an otherwise accurate recovery state.
3. **Detail loading text.** `Fetching the latest details and application fields.` can become `Loading the latest role details.` now that application fields appear in a separate popup. This avoids explaining background API work that does not affect the reader’s next action.

Do not add a disclaimer or invent a hiring/application timeline to fill space. The current source accurately marks unsupported roles unavailable.

## Accepted copy and flow decisions

- The main popup clearly frames the task as exploring openings, and the visible problem headline remains paired with the official role title.
- `Previous role`, `Next role`, the position announcement and the visible swipe instruction describe distinct navigation jobs.
- The active role’s `n of total · official title` status is useful orientation. Repeating the official title in the page content and contextual status is purposeful, not residual CTA copy. The mobile visual reviewer reports that these fit at 390px.
- `Apply for this role` appears only when a supported form is present and usable. Unsupported role slides instead say `Applications unavailable` and explain that applying on this page is not currently available.
- The application popup uses `Application` plus the selected official role title, so candidates can identify what they are applying for. Its `Back to role details` close label describes the destination and keeps browsing distinct from submitting.
- Privacy consent, resume requirements, validation messages and application outcome/retry precautions remain intact. There is no invented external submission destination.
- Moving an existing form node into and out of its own application popup preserves its fields within the open role-browsing session. Draft retention is not presented as a promise of persistent storage after the entire carousel is closed.
- Role navigation replaces the current role URL rather than building a separate browser-history entry for every swipe. The focused history tests verify this behaviour.
- Direct/legacy preview pages remain explicitly illustrative. Their availability is not advertised as a live vacancy.

## Validation

`node --test tests/role-carousel.test.mjs tests/role-dialog.test.mjs tests/live-role-detail.test.mjs`: **17 tests passed, 0 failed**.

The recovery reproduction used the test setup with injected loading functions and made no network calls or application submissions. Existing passing tests do not cover RC-COPY-01, hence the explicit additional state-path reproduction.

## Coordination and recheck scope

The coordinator and visual reviewer were informed of RC-COPY-01. Visual UAT is checking actual swipe/drag behaviour, small-screen text fitting, separate application-popup presentation, focus and the backdrop contrast against the underlying page. No browser claims are made by this source-only report.

After the recovery fix, recheck the failure → close → successful reopen path, the direct Retry recovery path, single-role hint visibility, and the ordinary two-or-more-role navigation instruction. Optional wording refinements should be checked at 320px before adoption; do not solve readability with shorter but misleading labels.

## Recheck after recovery fix · 15 November 2026

**RC-COPY-01 is resolved.** The successful `loadDeck()` path restores `Swipe or use the arrows to explore` before mounting the recovered list. A fresh dialog session also clears the prior retry/error state. The coordinator added a regression for failure → close → successful reopen; it passes.

The normal instruction is now input-neutral, and the retry action reads `Try loading other roles`. These changes address the two navigation-copy refinements without shortening the text into an unclear action. The earlier loading-copy refinement remains optional and is not a blocker.

Recheck validation:

- `node --test tests/role-carousel.test.mjs tests/role-dialog.test.mjs tests/live-role-detail.test.mjs` — **20 passed, 0 failed**.
- The focused tests now cover recovered hints after reopening, per-role form/draft retention while browsing, and background-role retry callbacks without changing the active document title.
- Additional injected-loader checks passed for direct Retry recovery: after a failure, success restores the navigation instruction, hides Retry and shows two roles.
- An additional single-role check confirmed that the navigation hint is hidden and both boundary arrows are disabled.

Copy acceptance for the new role carousel and separated application popup is **passed** for the reviewed source. No product files were changed by this reviewer; source remained frozen during the visual matrix. This source-only sign-off does not replace the visual/gesture/device review or authorize deployment.
