# UAT feedback and acceptance rules

## 15 November 2026 · user-defined workflow

**Request:** Run UAT as a frontend developer, professional QA tester and designer together, working with a UX copywriter and a reviewer of brief completion. Check phones, tablets and desktop; consistent typography and padding; clean sections and no residual extra CTAs. Retain feedback and improve future passes.

**Acceptance rule:** Every UAT invocation runs all three independent passes and reconciles their findings. Evidence must include rendered visuals and interactions, not only passing unit tests. Treat repeated calls to action by their role in the journey; remove misleading or unnecessary ones, rather than every repeated entry point. Keep explicit corrections in this versioned log. The current request authorizes this release to main; later UAT invocations do not automatically authorize deployment.

**Skill:** `.agents/skills/uat-agent/SKILL.md`, also installed at `~/.codex/skills/uat-agent`.

## November 2026 · source feedback retained for Careers

- **Point 3, whole-card stickers:** Keep the established palette. The complete ambition card should read as a sticker, using actual Flatland and located internal sticker references. Motion must preserve reading and offer a still/reduced-motion path.
- **Role intent:** Lead with a concrete problem and visibly name the real role; screen-reader names should carry both. Keep API requirements/source URLs intact. Do not advertise a working application path where submission is unavailable.
- **Support:** Programme cards need a useful destination and accurate details, with relevant existing imagery where available.
- **Responsive quality:** No broken words, excessive footer gaps, laggy or blank reels, sticky overlap, cramped controls or inconsistent section typography.
- **Truthfulness:** New people/stories, role-specific outcomes, hiring timelines and the canonical numerical ambition need source evidence. Missing content is an open dependency, not an excuse to invent it.

Evidence: `docs/feedback-2026-11-13/README.md`, original screenshot/PDF references and `docs/uat/2026-11-15/` reviewer reports. These are project-scoped rules, not universal preferences for unrelated sites.

## 15 November 2026 · verified findings from the first UAT run

These are observed implementation defects, not newly inferred user preferences.

- **Shrinking an animated reel:** clamping the displayed position is insufficient if an older target or momentum can move it outside the new bounds on the next frame. Clamp/cancel the target and reset momentum; exercise every frame after shrinking, then re-expand and navigate. Evidence: `tests/reel-collapse.test.mjs` and the independent brief recheck.
- **Action-label truthfulness:** a card can guarantee opening role details while the role's application may be unavailable. Use destination-accurate wording and test blocked states. The accessible name must retain both the problem and real role. Evidence: copy findings COPY-01/02/05 and the recheck.
- **Rendered text stability:** a heading can pass width/overflow checks yet be unreadable halfway through a character animation. Inspect the normal reading position during scroll, not only its settled end state. Evidence: visual review and stable-heading fixes.
