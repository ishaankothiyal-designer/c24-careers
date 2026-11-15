# Role-context card stickers · 15 November 2026

The user requested a small Flatland illustration on every role card, customized to the actual work. The shared live renderer now adds one decorative56px SVG to the lower-right footer on both landing and careers-listing cards. The footer’s negative block margin lets the sticker sit across the divider without expanding the row or changing the card insets. Visual acceptance measures actual summary/CTA clearance and card-height preservation.

Seven distinct subjects follow the reviewed official titles: car inspection, dealer relationships, customer calls, dealer auctions, car listing, purchase completion and inspection-record review. Exact normalized-title mapping prevents the two Procurement jobs from sharing the wrong context. Unknown titles receive a neutral work-folder illustration. Full copy, official titles, source URLs and application rules remain unchanged.

The eight assets are original native SVG drawings with the existing Flatland palette, dark linework, paper keyline and small offset shadow. They are self-contained, with no external references, scripts, embedded text or raster data. Images have empty alternatives, aria-hidden and no tab stop; the complete anchor remains the sole action. Asset provenance is recorded in public/img/stickers/roles/README.md.

The20-case route/viewport matrix checks all seven cards per case. Reported narrowest CTA clearance is29px and summary-to-painted-art clearance10.67px. At375/390/414px, landing-card heights remain336px, unchanged from the prior recorded baseline. No padding/type reduction or role-copy rewriting was used. See role-sticker-visual.md for the final visual evidence and limits.

Three added regressions verify distinct mapping/assets on both surfaces, title normalization and safe neutral fallbacks. The complete build and188tests pass, with git diff --check clean. The user has authorized publishing this with all other pending reviewed updates to main and the existing Vercel project.

Final fallback hardening uses an own-property check for the finite illustration registry. Unknown titles that match inherited object keys, including constructor and __proto__, receive the same neutral work illustration. The actual seven role mappings are unchanged; the fallback regression includes both cases. An independent recheck and the full188-test suite pass.
