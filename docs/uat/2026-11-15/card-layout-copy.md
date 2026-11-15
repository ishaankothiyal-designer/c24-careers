# Repeated cards and heading blocks · content/source UAT

Scope: the full active landing sequence, repeated ambition/builder/role/support cards, section introductions, numbered working-principle blocks, FAQs and closing invitation. Source audit only; the visual reviewer owns viewport measurements and screenshots. No product files were edited by this reviewer.

## Required layout fixes identified from source

### CARD-01 · P2 · Support action does not inherit the text inset

Selectors: `.policy-card__copy`, `.policy-card h3`, `.policy-card__copy>p`, `.support-card__action`.

The legacy shared-card rules set the copy container to `padding:0`, then create the heading and body inset through individual margins. The later action span has only top padding and `margin-top:auto`; it does not receive the same inline margin. This explains the screenshot’s flush-left action while the title and body are inset.

Use a single shared padded content container and reset the child heading/body margins within it. Apply the same inset to title, paragraph and action. Fix geometry rather than adding spaces or shortening copy.

### CARD-02 · P2 · Variable support text pushes actions to different heights

Selectors: `#support .policy-card`, `.policy-card__copy`, `.support-card__action`.

The action's `margin-top:auto` cannot align repeated actions unless the copy column grows into the card’s available height. Current titles legitimately occupy one or two lines; descriptions may occupy two or three lines at narrow widths. Give the content column the appropriate flex growth and reserve a consistent title row if the visual review confirms it is needed. Let long text increase natural height rather than clipping or line-clamping it.

Acceptance: all seven cards share the same content inset and bottom action baseline at each tested viewport; longer titles/descriptions remain fully readable. Test `Autonaut Future Fund` and `Compassionate Support` beside single-line titles such as `CareHer` and `Health`.

### CARD-03 · P2/P3 · Repeated card heading sizes come from competing token families

Selectors: `#builder .craft-work__title`, `.role-card .role-card__title`, `.policy-card h3`, and the `typography.css` rule `:is(.problem-card,.policy-card,.careers-card,.role-card) h3`.

Builder and role titles use `--career-card-title-size`; the later typography rule can put support headings on `--type-h3`. These are different scales. This is a cascade consistency problem, not a reason to rewrite the headings. Normalize repeated card title roles with a deliberate common token after measuring the winning styles. The sticker cards can retain their intentionally larger editorial headline treatment.

The visual reviewer was asked to confirm computed title sizes before treating every visual difference as a bug.

## Text/content checks accepted

- All seven support cards contain the same structure and action wording: heading, description, `Explore the programme ↗`. The action is an `aria-hidden` cue inside a single clickable card, not a second nested button. It should stay as a clearly inset signal of the whole-card action.
- All role cards retain a problem headline, actual role label, source facts and the same `View role details` action. Broad experience ranges are deferred explicitly rather than silently invented or clipped.
- Builder cards preserve names, team labels and full project descriptions. Long descriptions should wrap and extend naturally; do not use ellipsis to force equal-looking cards.
- The selected-four / expanded-twelve story control is a stateful collection control, not a residual role CTA.
- Hero, opening-section and final role actions have distinct long-page navigation purposes. No further action removal is recommended without an actual duplicate destination/control in the same decision point.
- The old inner builder previous/next navigation remains hidden in the shared popup, leaving one visible frame control set.
- The hero retains natural sentence flow with an accent span. Do not reintroduce a forced `<br>` to align a screenshot at one width.
- The section titles and numbered working-principle headings are complete phrases; no stray single-character fragments or accidental split words exist in their source text. Actual rendered wrapping remains a visual acceptance check.
- The intentionally larger sticker lettering, normal card titles and section headings are different semantic levels; consistency should be assessed within each role rather than making every heading the same size.

## Additional visual recheck targets

- Check the four working-principle heading/body blocks as a group: `See the problem clearly`, `Look beneath it`, `Test the assumptions`, `Change what matters` have different natural line counts. Avoid a fixed height that clips a third line at 320px. A shared grid/minimum row can align text without hiding it if needed.
- Check the longest official job titles and department tags at 320px and 200% zoom. Preserve all source text and the actual role label.
- Check `Explore the programme` remains one coherent action label at the narrowest supported card width, with its arrow and visible focus belonging to the same whole-card target.
- Confirm the support introduction uses the same title/body column rhythm as comparable page introductions, while allowing it to stack naturally on narrow screens.

## Coordination and limits

The coordinator received the exact support inset/flex causes and the heading-token cascade finding. Visual UAT received the same selectors and the longest-content cases. No source-only claim is made that every viewport now passes; the final approval requires post-fix rendered measurements across the requested mobile, tablet and desktop matrix.

## Recheck after shared-card fixes

All three source causes are **resolved** in the reviewed stylesheet revision:

| Finding | Source resolution |
| --- | --- |
| CARD-01 | `.policy-card__copy` now owns `padding:var(--career-card-inset)`. The more specific `#support .policy-card__copy>h3` and `>p` rules reset their inherited child margins/max widths, so the title, body and action share one actual inset rather than accumulating mixed margins. |
| CARD-02 | The copy container now has `flex:1`, stays a column, and stretches its children. The action retains `margin-top:auto` with its top separation. The outer card’s old bottom padding is removed to avoid doubling the content-container inset. Headings use a two-line **minimum** (`2.3em` at `1.15` line height), allowing longer text to grow rather than clipping it. |
| CARD-03 | The support title’s ID-scoped rule explicitly uses the shared `--career-card-title-size`, line-height and letter-spacing tokens. Its specificity wins over the later generic typography rule, matching the repeated-card title role deliberately. |

No programme copy was shortened, line-clamped or removed to force alignment. All seven labels and actions remain intact. The prior natural-flow hero change remains unchanged.

Validation: `node --test tests/support-reel.test.mjs tests/story-flow.test.mjs` — **8 passed, 0 failed**; `git diff --check` passed. These checks establish structural/regression continuity, not a rendered baseline measurement. The copy/source pass is **accepted**, with final multi-viewport alignment and wrapping acceptance reserved for visual UAT.

## In-carousel “View more stories” source/copy check

Accepted. The former standalone toggle is removed. A single native button card now follows the four selected builders and precedes the eight additional stories. Its visible label, `View more stories`, accurately describes a one-way reveal; `Keep exploring what people are building at Cars24.` provides relevant supporting context without implying a new route or a separate submission action.

Source checks confirm twelve original story links remain, eight carry the additional-story marker, exactly one reveal button exists, and no external `container builder-selection` remains. On activation, all eight stories are revealed, the button hides, and the first newly revealed story is Vishal Thakur. Focus moves to that card with `preventScroll:true` after the carousel-reveal event. The old “show selected” collapse promise is no longer exposed.

The arrow mark is decorative and hidden from assistive technology. The control is a native `button`, so there is no nested/extra action inside a story card. No copy/source defect or lost story content was found. Actual carousel alignment, keyboard focus visibility and absence of a page jump remain visual-interaction acceptance checks.
