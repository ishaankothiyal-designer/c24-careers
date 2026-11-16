# Caveat letter trial · source/copy review

**Accepted for a local typeface trial; no material source/copy finding.** No product edits, browser use or deployment by this reviewer. Actual handwriting character, small-screen legibility and visual contrast remain the visual reviewer's rendered checks.

The three letter paragraphs and their punctuation are unchanged. Only paragraph typography changes from Pine Words 400 to Caveat 500, at 1.2em with 1.55 line height. The signature remains a separate span in Motterdam, retaining `Vikram Chopra` and its explicit typeset-signature accessible label. No new claim, attribution or CTA is introduced.

The self-hosted font-face covers weights 400–700 and uses `font-display:swap`; its 500 weight matches the runtime preload. The canvas scene reads each paragraph's computed font family, weight, size, line height and colour after the matching font load. The readable HTML fallback uses the same paragraph rule, preserving content and typography consistency. A system cursive fallback remains available if the font cannot load. The font and its SIL OFL licence are present locally, with provenance recorded in the font README.

Text/paper colour rules are unchanged by this trial. The increased weight and size can support visibility, but the typeface's apparent legibility should be judged in the rendered phone, tablet and desktop letter states rather than inferred from CSS alone. Confirm full paragraph/signature fit and keep the unchanged fallback readable if canvas setup fails.

`node --test tests/paper-text-layout.test.mjs tests/paper-tablet-mode.test.mjs`: **9 passed, 0 failed**. This scoped acceptance does not authorize deployment.
