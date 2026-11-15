> Historical exploration — superseded by the user’s subsequent request to remove all role-card stickers. The current implementation and acceptance are in `role-card-removal-implementation.md` and its companion reviews.

# Role-sticker redesign · concept-to-source copy review

**Concept acceptance: passed.** No new role claim or copy change is required. Source-only review; no product edits or browser use. Visual craft, silhouette weight and small-size legibility remain the visual reviewer's scope.

| Reviewed role | Revised concept | Grounding / boundary |
| --- | --- | --- |
| Evaluation Engineer | Car + inspection lens | Directly reflects checking vehicle condition and recording findings. |
| Key Accounts | Interlinked partner cards + car | Reflects dealer relationships and car sourcing; distinguishes the role from consumer retail. No new partnership tier is implied. |
| Retail Associate | Chat bubble + phone | Reflects calling prospective customers and following up on leads. |
| Procurement Associate | Two auction paddles with car front | Reflects dealer participation and competitive bidding in car auctions. Distinct from technical procurement. |
| Listing | Car photo frame + publish arrow | Reflects helping sellers list cars. Avoid adding a promise about a specific publishing platform. |
| Closure | Key + open ribbon loop | A symbolic purchase-completion concept. Keep the open loop free of a certification/seal claim; do not describe this as physical car/key delivery. |
| Procurement | Reports + highlight lens | Reflects review of inspection reports/media/service records for risks and inconsistencies. |
| Unknown role | Neutral folder | Safe fallback without guessing responsibilities. |

Preserve exact normalized official-title mapping, all approved role copy and accessible single-link names. Empty alt text and `aria-hidden` are appropriate because the headline, official role and summary already communicate the work. Artwork should add no new focus stop, nested button or CTA.

The final dedicated 84px desktop footer allocation and hiding at viewport widths ≤767px or role-card content containers ≤260px are consistent with this decorative status: meaning remains available in HTML when artwork is hidden. Final CSS uses `margin:0` and no negative overlap. The HTML dimensions are also 84×84. The container query measures content width, rather than an assumed outer card width. This supersedes the earlier 56px implementation and the preliminary ≤300px container proposal.

## Final implementation recheck

**Source/copy implementation acceptance: passed. No material finding.** All eight installed SVGs use a 300×300 canvas. Exact-title mapping and neutral fallback remain unchanged. The real card headline, official title, summary, destination and accessible action name remain intact. Empty alt/aria-hidden/draggable-false treatment remains present, with no new control, numerical data or role responsibility introduced. The earlier pending implementation note is resolved. Visual motif fidelity and overlap at actual viewport sizes remain with the visual reviewer.
