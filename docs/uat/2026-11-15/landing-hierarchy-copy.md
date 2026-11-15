# Landing hierarchy and controls · copy/accessibility source recheck

Scope: the requested ambition-card hierarchy, four working-principle cards in the final responsive grid and the letter’s sticker cue. Source-only review; no browser use or product edits.

## Accepted changes

- All five ambition cards retain their original unique phrase, headline and supporting text. The actual DOM order is now **unique phrase → decorative illustration → headline → subtext**. This is the reading order as well as the intended visual hierarchy; no meaning depends solely on CSS reordering.
- `CARS24 · BUILDERS` is removed from all five cards. The `Pause sticker motion` button is absent from the active fragment; only the meaningful previous/next ambition controls remain.
- The five leading phrases remain distinct: `Think bigger`, `Learn by building`, `Make it count`, `Opportunity, not a prerequisite`, and `Built here. Goes everywhere.` No new marketing claim or rewritten role/source content was introduced.
- Illustrations remain decorative with empty image alternative text inside an `aria-hidden` visual wrapper. Adjacent real HTML communicates the card meaning without redundant image descriptions.
- All four working-principle titles and descriptions remain intact. The visible `01`–`04` labels are removed. The final user override is implemented as a normal ordered-list grid: four columns at **1024px and above**, two columns at **601–1023px**, and one column at **600px and below**.
- Principle carousel markup, navigation controls and controller wiring are absent. All four cards remain present in document order, without a hidden navigation requirement or extra CTA. This supersedes the earlier manual-carousel proposal.
- Ambition supporting copy now has an additional inline inset (`var(--sp-2)`) and a `24ch` maximum width inside the shaped cards. The final `--sticker-height:520px` provides more vertical space (superseding the earlier 480px value). These source changes address the requested corner clearance without shortening the approved copy; rendered fit remains the visual reviewer’s check.
- The letter instruction remains the plain, understandable `Keep scrolling`. The mouse artwork is decorative; the sticker frame does not pretend to be an interactive button. Its animation is limited to the active letter scene and is finite: **1.6 seconds × 3 cycles = 4.8 seconds**, with reduced-motion disabling the animation.
- The removed pause control is not replaced by indefinitely moving card text. The final preproduction rule sets ambition-card animation to none, and the default sticker lifecycle is static. This preserves readability while respecting the requested cleaner control set.

## Checks

Direct source assertions passed for five ambition cards, each phrase and its DOM hierarchy; absence of the brand label and pause control; four intact principle cards in the responsive grid; removed number labels and principle-carousel controls/wiring; the 1023px and 600px grid breakpoints; the extra ambition copy inset/24ch measure/520px final height; the unchanged letter instruction; and the finite/reduced-motion cue rule.

The old pause-control unit-test expectation was still present during the initial source read and should be updated by the coordinator to the new explicit no-pause/static-card requirement before final regression sign-off. This is a test-maintenance item, not a remaining copy/source defect in the reviewed implementation.

Copy/accessibility **source acceptance: passed**. Final multi-viewport spacing, illustration fit, ambition swipe/drag boundaries, visible focus and the letter cue’s actual position/visibility remain visual/runtime checks. The hero’s natural flow and the existing role copy were not altered by this reviewer.

## Final grid override recheck

Re-read the final section, last-loaded preproduction stylesheet and application/runtime wiring after the user replaced the principle carousel with a responsive grid. The current report reflects that grid; the earlier carousel acceptance is superseded. All four titles and complete descriptions remain selectable HTML, and no principle-specific navigation or controller remains. Ambition hierarchy and the finite letter cue are unchanged. **No outstanding copy or source-hierarchy finding.** Full regression results are owned by the coordinator.

Final neutral-paper/tape-header and larger uniform illustration-slot source acceptance is recorded in `tape-footer-listing-copy.md`. Principle headings remain real h3 text; all ambition wording and hierarchy remain unchanged.
