# Sticker micro-motion · copy and accessibility source check

**Accepted; no material copy/accessibility finding.** Reviewed the final motion block in `src/styles/preproduction-polish.css` and the ambition section markup. No product edits or browser use.

The arrival is a short `.985` → `1` scale transition, not a repeating animation. The additional hover response is restricted to fine pointers that support hover: a small card lift/scale and decorative artwork rotation/scale. All new motion is inside `prefers-reduced-motion:no-preference`; touch receives no hover behavior. No flashing, continuous movement or automatic content advance is introduced by this CSS.

The cards retain article semantics, real headings/body text and decorative images. The motion adds no button role, pointer cursor, link, hidden action or wording that promises a click result. A mild response to pointer presence does not require making the informational cards interactive. Existing carousel arrows remain the explicit navigation affordance. Copy and accessible names are unchanged.

No new pause CTA is needed for these brief transitions, and reintroducing one would add an unnecessary control. Rendered clipping at the motion edges and actual reduced-motion behavior remain runtime checks for the visual reviewer.
