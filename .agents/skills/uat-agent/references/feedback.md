# Learned UAT guidance

## User preference · 15 November 2026

The user requested a reusable UAT agent combining a professional frontend developer, QA tester and designer, collaborating with a UX copywriter and an independent brief reviewer. Future invocations must include all three passes, not only automated test output.

Check mobile, tablet and desktop responsiveness, consistent typography/padding between sections, clean design and residual extra CTAs. Record corrections and update scoped acceptance rules over time. Run while actively handling the task; continuous background monitoring was not configured.

## Cars24 Careers · November 2026

- Review against the actual feedback screenshots and later user corrections. The whole ambition card should read as a sticker; retain the established card palette and use actual Flatland references.
- Role cards should lead with the problem and visibly identify the real role. Keep source job requirements and attribution URLs intact.
- Empty role metadata, support-card destinations, misleading CTAs, first-load scrolling, broken words and oversized footer gaps require rendered/interaction evidence.
- Content-dependent work (approved broader roster, measured 90-day outcomes, company target alignment) must stay explicit; do not fabricate it to make the acceptance matrix look complete.

## Verified Cars24 defects · 15 November 2026

These are observed failures, not inferred user preferences. When a carousel can shrink during motion, verify every subsequent animation frame and re-expansion; an old target can escape newly clamped bounds. Inspect text at its normal mid-scroll reading position, since overflow checks do not reveal disassembled character-animation states. Check CTA promises against blocked/unavailable destinations. Evidence and fixes live in `docs/uat/2026-11-15/` and `tests/reel-collapse.test.mjs` in the Cars24 Careers project.
