# Role-card stickers · source and copy review

**Accepted in the current source; no material copy/accessibility finding.** No product edits or browser use. Visual motif fidelity, sticker placement and viewport fit remain with the visual reviewer.

| Exact reviewed official title | Motif | Meaning against approved summary |
| --- | --- | --- |
| Builder - Evaluation Engineer | Car inspection / magnifier | Inspecting cars and documenting condition. |
| Builder - Key Accounts | Dealer network / handshake | Dealer relationships and car-sourcing opportunities. |
| Builder - Retail Associate | Customer phone/chat | Calling leads, following up and supporting sales. |
| Builder - Procurement Associate | Dealer auction / gavel | Dealer participation, bids and repeat auction transactions. |
| Builder - Listing | Car listing / publish | Helping sellers list cars and coordinating enquiries. |
| Builder - Closure | Purchase completion / key handover | Symbolic completion of the buyer's purchase. It must not be described as a new physical-delivery duty. |
| Builder - Procurement | Inspection records / magnifier | Reviewing reports, photos, videos and service records for risks. |

The exact normalized-title mapping in `src/role-stickers.js` avoids inferring responsibilities from department. In particular, Procurement Associate and Procurement retain distinct motifs. Unknown titles use a neutral work subject rather than an invented role responsibility.

`liveJobCard()` keeps the existing problem headline, official title, approved work summary, accessible role-link name and `View role details` action. The decorative image has empty `alt`, `aria-hidden="true"`, `draggable="false"` and no pointer events. It is contained within the existing single card link, with no additional button or CTA. Landing and listing reuse the same implementation.

All eight role SVGs contain no text nodes, links or scripts. No numerical target, new role claim or extra copy is introduced. `node --test tests/role-cards.test.mjs tests/role-summary.test.mjs`: **10 passed, 0 failed**.
