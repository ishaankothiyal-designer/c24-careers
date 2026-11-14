# Whole-card ambition stickers

Implemented 14 November 2026 from Ishaan’s updated point 3 and the Flatland reference pages archived under `docs/feedback-2026-11-13/references/flatland-sticker-reference-*.jpg`.

The references are actual local pages from the Flatland document. They show shaped headline panels, heavy outlines, offset print edges, arrows, badges and flat backgrounds. A distinct Marketing sticker pack was not found in the connected search results; those searches mainly returned hub/logo stickers. Do not attribute this implementation to an unverified Marketing asset pack.

## Implementation

`src/sections/career-02-ambition.html` contains five original SVG card silhouettes with semantic HTML lettering. `src/styles/feedback-nov13.css` owns their tokens and motion. `src/runtime/ambition-stack.js` uses the existing visibility/device-budget lifecycle and skips loading the previous video renderer for the default sticker version.

The cards retain the prior cream, violet, lilac, green and dark surfaces. An arrow, 10× badge, loop, numbered opportunity ticket and compass star make each conviction explicit. Whole cards tilt by one degree and settle by three pixels; offscreen cards do not animate, hidden tabs pause, and reduced-motion/data-constrained states are still. The visible pause/resume button lets the reader stop the motion.

The $100bn-in-five-years claim is replaced by the draft’s “Build from India for the world” pending the canonical company target. “Create 100 founders” explicitly describes opportunity, not a hiring prerequisite.

## Optional Higgsfield study

The working site uses native SVG/CSS animation. No new Higgsfield generation was requested or run for this pass. Prior movie assets remain available via `?ambition-art=generated`, and earlier vector studies via `?ambition-art=refined` or `?ambition-art=original`.

For a later image-to-video study, use a screenshot of the finished card and the archived Flatland pages as visual references. Keep the entire sticker silhouette, palette, outline, text and composition fixed. Use a gentle one-degree tilt with a three-pixel settling motion over a seamless 6–8 second loop. Maintain the exact wording with no added words, objects, lighting effects, camera movement, stretching or shape morphing. Export a transparent or flat-colour background appropriate to the final placement, a poster still, and a compressed web movie. Validate every frame for text fidelity before replacing live HTML lettering; keeping type in HTML remains preferable for accessibility and responsive layout.
