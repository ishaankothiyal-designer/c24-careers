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

A production smoke pass also found an existing shared-builder-link defect that the initial local checks missed: replacing the deep URL immediately made refresh lose the drawer. Future pre-release passes must directly load and refresh instructed route types, including shared-dialog neighbor/dismissal URL behaviour. An HTTP-200 app shell is not a semantic route check. This is an observed coverage improvement, not a new standing deployment approval.

## Card anatomy coverage · 15 November 2026

A later user screenshot exposed support-card actions at the card border and inconsistent vertical placement after a popup-focused pass had succeeded. For repeated cards, inspect every item and measure title/body/action insets against the actual content wrapper, plus action-to-card-bottom distance. Equal outer card heights and zero document overflow do not prove consistent internal padding. Check long titles and summaries, first/middle/last items, normal mid-scroll reading states, and source-to-popup transitions. When moving page layouts into a shared popup, audit inherited page-level sticky positioning and section backgrounds in the new single-column context.

## Settled appearance evidence · 15 November 2026

A batch of popup screenshots was captured during the first frame of the finite entry animation: geometry and image-load measurements passed, but screenshots showed only a blurred backdrop. Never use these as appearance proof. Wait for the specific dialog's finite entry animation to finish, then inspect the actual screenshot before accepting framing, colour or alignment. Do not await unrelated infinite sticker animations. Replace or explicitly exclude transient captures, and obtain separate settled evidence for cropped faces, title/body placement and every materially changed visual family. A loaded image and correct natural aspect ratio do not prove that the painted face is visible.

## Footer completion and painted scale · 15 November 2026

A footer can pass title/legal separation and document-overflow checks yet still clip oversized monogram glyphs and leave an unintended blue band. Test at the actual document maximum scroll on home and listing after fonts/API content and gallery expansion settle. Record wrapper/footer bottom, transform/progress, row height and glyph line/paint bounds; a near-bottom screenshot is insufficient. Recheck compact phone and short landscape footers, where a top/top scroll trigger may be unreachable.

Equal SVG image boxes do not ensure equal visible sticker sizes because transparent viewBox gutters differ. Inspect actual painted heights; normalize framing/display sizes while preserving artwork when the user asks for consistent illustration scale. Check both text-safe shaped interiors and the shield's upper caption curve after changing hierarchy.

## Latest Cars24 card balance and footer intent · 15 November 2026

The user rejected the 520px fixed sticker height: it solved containment by adding excessive, uneven empty space. Use intrinsic content height with a centered reading group and balanced actual top/bottom clearance. Measure those clearances, not just outer width or non-overflow. Principle-card content should be centered, compact and square-cornered; keep larger painted illustrations by normalizing transparent artwork gutters, not reserving tall empty image/title rows.

The user explicitly prefers the large, slightly cropped C24 footer display. This supersedes a fully-contained-small-glyph acceptance criterion. Intentional glyph cropping inside the three monogram cells is approved; an unfinished whole-footer reveal leaving an unintended blank band is still a defect. Keep the legal row separate and verify true document-end completion.

Latest Cars24 correction (15 November 2026): principle-card backgrounds should use shared white, matching other cards. This supersedes off-white neutral paper surfaces; retain tape labels and sharp corners.
