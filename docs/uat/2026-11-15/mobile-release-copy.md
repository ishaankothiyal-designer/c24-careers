# Final mobile release · independent copy/source check

**Verdict: no material copy blocker found.** Source review only; mobile visual/runtime acceptance is owned by the visual UAT reviewer. No product files were edited by this reviewer.

- All seven role summaries remain the reviewed, source-grounded work descriptions. Landing and listing share the same problem/title/summary renderer and exact role links; full source facts and job descriptions remain in details.
- Card actions promise `View role details`. The separate application popup is named with the actual role title and returns to role details. Unsupported application actions are disabled and accompanied by a plain availability explanation. Supported forms accurately explain any uncollected optional location preference. No generic application destination or misleading apply promise was introduced.
- Shared popup controls retain collection-specific names: role details, builder projects and support programmes. Close and previous/next labels distinguish these contexts; counters retain the current item’s label, and normal exploration/retry instructions remain clear.
- The builder expansion appears once as `View more stories` inside the card sequence. Removed standalone expansion/collapse and sticker-pause controls have not returned. All five ambition captions and their reading order remain intact. Principle headings stay live h3 text on decorative tape, with complete body copy.
- Search/filter, fallback and unavailable-state wording remains consistent with the earlier accepted review. The current compact CSS changes presentation without shortening approved content.

Validation: **31 tests passed, 0 failed** across role summaries, shared card content/accessibility names, role detail/application notices, shared content popups and role-dialog interactions. Direct source assertions also confirmed five ambition captions, one builder expansion label and no removed pause/standalone story-toggle labels.

This verdict does not replace the final mobile viewport, keyboard/focus, dragging or production smoke checks. Those require runtime evidence from the coordinator and visual reviewer.
