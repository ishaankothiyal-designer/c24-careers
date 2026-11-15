# Neutral principle cards, footer and role-listing copy review

Source-only review. No browser use, product changes or deployment by this reviewer.

## Footer and role flows accepted

- `src/sections/03-site-footer.html` retains the real `Cars24 Careers` heading, the 2026 legal line, Terms and Conditions and Privacy Policy links, and the three-letter C24 home link with the accessible name `Cars24 careers home`. The hidden legacy sitemap windows remain both `hidden` and `inert`, preventing their unused controls from entering normal keyboard navigation. No footer text or legal destination was removed. The requested bottom clearance and empty-band correction require the visual reviewer's rendered evidence.
- Landing and `/careers/` share `liveJobCard()` and therefore the same problem headline, official title, grounded summary and role-ID destination. The listing correctly uses h2 cards while the landing uses h3 cards. A card is one native link with no nested button; its accessible name includes both the problem and official title. Its visible action remains `View role details`.
- `/careers/` search explicitly promises job title, team or city, matching the fields actually searched. Department controls use `aria-pressed`; the location selector and search input have real wrapping labels. Loading, no-match, no-opening and recoverable-error states have meaningful messages and polite status announcements. Clear/reset actions describe real filter recovery.
- Role popup headers preserve the same problem headline and official title. Full location, employment and experience facts and the published job description remain in role details. Popup navigation deliberately explores the current open-role collection; no label promises that listing filters restrict that collection. Supported application actions and unavailable-application notes remain explicit and consistent with previous copy acceptance.

## Verification

`node --test tests/role-summary.test.mjs tests/role-cards.test.mjs tests/live-jobs-states.test.mjs`: **15 passed, 0 failed**. These cover source-grounded summaries, identical landing/listing content, accessible role names, retained detail facts, loading/errors/retry and filter reset recovery.

## Final tape, footer and illustration recheck

**Source/copy acceptance: passed. No outstanding finding in this scope.**

- The last-loaded stylesheet now sets all four principle cards to the same neutral `--principle-paper:#f3f2ee` and dark `--sticker-edge:#201c36`. It resets the former white heading badge background, border, radius and shadow. Torn tape is decoration from empty `::before` / `::after` pseudo-elements, with `pointer-events:none`; heading text remains a real unchanged h3 in the DOM. No text is converted to artwork or pseudo-content, and no new CTA or number label is introduced.
- Source-colour calculation gives **14.64:1** for the dark title/body against neutral paper and **12.58:1** for the title against `rgb(225 214 168 / .58)` composited over that paper. This exceeds 4.5:1 for the specified text colours. Tape-edge treatment and rendered antialiasing remain visual checks; these numbers are source calculations, not a screenshot audit.
- Footer text and links remain unchanged. Its monogram glyph size is now bounded by the actual row height with internal padding. The geometry-based reveal restores title/letters at its fully revealed endpoint, and reduced motion sets footer/title/letters to their visible state. No meaningful content is replaced by the sizing/reveal change. Final bottom clearance and absence of the blue band require runtime evidence from the visual reviewer.
- All five ambition phrases, headings and descriptions remain intact in their accepted reading order. Decorative images retain empty alternative text within `aria-hidden` wrappers. The final CSS normalizes the illustration slot to 128px / 112px on mobile and the sticker wrapper to **520px**, superseding the previous 480px value. Those presentational changes add no new copy or control and do not change the role summaries or sources.

Final inspection covered the principle section, the final CSS cascade, footer markup/reveal helper, listing renderer/filters and role-popup labels. This is source acceptance only; no browser was used.

## Compact-pass source recheck

**Accepted; no material copy/source-layout issue found.** The final compact CSS supersedes the earlier fixed 520px wrapper and 128/112px artwork-slot observations above: ambition cards now have intrinsic `height:auto`, with shared 112px desktop / 100px mobile art slots. All five actual DOM sequences remain caption → decorative art → headline → body, with the same words and no line clamp or newly fixed text-height constraint.

Principle cards center their content group and retain all four live h3 titles and complete body paragraphs. Title alignment is centered; paragraph measure is capped at 28ch with 1.45 line height and no clipping rule. Tape/paper colours are unchanged, so the source contrast calculation above remains applicable. The four normalized principle SVG viewBoxes contain no text nodes, and their corresponding HTML images retain empty alt text; the meaningful words stay outside the artwork. Four/two/one grid breakpoints remain intact. Rendered wrapping, tape-edge fit and illustration clipping continue to be visual/runtime checks. No product edits were made by this reviewer.
