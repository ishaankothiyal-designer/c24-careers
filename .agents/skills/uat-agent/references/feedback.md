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

Cars24 typography correction (15 November 2026): audit actual line endings on landing, careers and shared popups. Preserve gutters and readable type; use available heading width, balanced short text and pretty prose, then narrowly scoped safe phrase guards for verified widows. Remove stale border exceptions so section boundaries use the shared divider. Do not force all text onto one line or shrink it to hide a rag.

Cars24 popup direction (15 November 2026): use landing-style pixel arrows at viewport side centers, no visible page count/bottom footer, subtle blur only on inert neighboring cards, and shorter centered full-image frames. Preserve reading width and 44px control targets; test retry/Apply separation. Dark Flatland cards can use a contrasting palette-colour offset shadow when the ink shadow disappears. Decorative continuation-card graphics must retain live copy and the original reveal behavior.

Cars24 popup gesture correction (15 November 2026): short deliberate horizontal drags should advance a card smoothly; vertical reading, controls, editable content and pinch gestures remain native. A cancelled or interrupted smooth snap must leave the actually visible card active. Verify both light drag behavior and final selection, not only arrow navigation.

Cars24 ambition-motion correction (15 November 2026): the user now prefers a restrained one-time arrival scale and fine-pointer hover lift/sticker tilt. This supersedes wholly static card behavior, but not the ban on distracting loops/redundant pause controls. Keep reduced-motion still, touch free of sticky hover, and scale/rotation within paint gutters without layout movement.

Cars24 role-card direction (15 November 2026): small consistent Flatland stickers should reflect the actual job context, match placement and visible scale across cards, and preserve existing card height, copy and CTA clearance. Map reviewed titles distinctly and use a neutral fallback instead of inventing future-role work.

Cars24 role-art correction (15 November2026): the miniature dark-outline set was rejected as too small/stark. Start from clear job concepts; use larger colour shapes and softer restrained contours. Give art a real flow slot; avoid negative-margin overlays. Hide decorative art on compact phone/narrow cards rather than squeezing or overlapping the role text. This supersedes the all-width56px sticker treatment.


### 15 November 2026 — Remove role-card stickers

User correction: “Remove the stickers, fix the cards, the layout, everything else.” Scope: job cards on the landing page and careers listing. This supersedes the previous role-illustration sizing/redesign direction. Acceptance: text-only role cards at every width, compact footer with a single detail action, consistent insets and equal row heights, no reserved illustration space or overlapping artwork. Preserve approved role copy, filters and detail links. Other editorial sticker collections remain unchanged.
