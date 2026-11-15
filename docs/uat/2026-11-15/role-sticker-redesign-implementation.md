> Historical exploration — superseded by the user’s subsequent request to remove all role-card stickers. The current implementation and acceptance are in `role-card-removal-implementation.md` and its companion reviews.

# Softer role illustration redesign · 15 November 2026

The latest user correction replaces the small dark-outline role stickers. Core concepts were written and independently checked before generation; see role-sticker-redesign-concepts.md.

## Artwork

One cohesive eight-subject native SVG sheet was generated through Higgsfield GPT Image2.6. The direction uses generous Flatland violet/lilac/green/cream shapes, muted-purple1.8-unit contours, quiet paper edges and light offsets. Auction paddles replace the ambiguous gavel/car composition; linked partner cards replace dense handshake anatomy; key/ribbon symbolism replaces detailed handover anatomy. The reviewed role context remains authoritative.

All subject shapes and styles are preserved from the source sheet. Export isolates each named group, removes its sheet translation/title metadata and centers/scales it on a consistent300×300 canvas using browser-measured geometric bounds, with stroke safety room. Assets contain no raster data, scripts, filters, external references or embedded text. Source sheet, prompt and measurements remain locally under ignored output/role-sticker-redesign.

## Responsive layout

The84px illustration frame occupies a real footer row with zero negative margin. It does not cross the divider or sit in the summary’s space. Wider-card footers are101px including padding/divider; this intentionally allocates space to the larger illustration rather than overlaying it. The measured desktop landing row grows from340.05px to396.05px; a768px tablet row grows from336px to364.89px. Readable type and card insets are unchanged.

Phone viewport widths through767px and card-content widths260px or narrower hide decorative art entirely. The action row returns to44px, with no reserved illustration slot; tested375/390/414px landing cards remain336px. The conditional fallback prioritizes full copy and the role-details link. Role mapping, neutral-title fallback, accessible names, facts and application flow are unchanged.

## Verification

The20-case landing/listing matrix covers all seven current roles per case. It reports no copy/image/CTA intersection, document overflow or hidden-art residual space. Visible-art cases have about38.86px minimum summary clearance and63.59px minimum CTA gap. See role-sticker-redesign-visual.md for final artwork inspection and navigation checks.

The required build and188tests pass; git diff --check passes. Independent creative/copy and brief/source reviews accompany this record. This task does not deploy the redesign. Separate concurrent footer-file edits in the workspace are outside this role-art change and were left untouched.
