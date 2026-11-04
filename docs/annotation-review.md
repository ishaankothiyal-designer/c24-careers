# Browser annotation review

Reviewed the supplied annotation history against the merged source on 3 November 2026. This records source and responsive-cascade checks; it is not a visual certification of the production page.

| Requested change | Source result |
| --- | --- |
| Role card context gets 8px top padding | Present in the shared role card styles. |
| Homepage department filters remain one sliding row without gutter clipping | Present in the full-width `#problems` filter track. |
| Selected filter uses black, weight 600, light gray | Present; the latest requested `#E8E8E8` supersedes `#CECECE`. |
| Desktop roles introduction breaks before “and see” | Present at 768px and wider. |
| Full-width navbar and background blur | Present, with desktop and mobile navbar heights accounted for. |
| Hero artwork moves up; homepage copy has zero top padding | Present; the separate careers heading retains navbar clearance. |
| Ambition list has 32px bottom padding | Corrected the short-screen and reduced-motion override, which still used 0. |
| Each ambition statement has an animated visual | Hairline Vault, Exploded, Relay, a custom crate stack and Elevator now fill the five cards, with reduced-motion and offscreen controls. |
| Ambition copy is top aligned; large visual sits below | Present in the shared column layout. |
| Ownership number/category rail removed | Present; the rails are absent from the cards. |
| Updated letter copy fits inside the paper | Present, including all three supplied paragraphs and measured text fitting. |
| Keep scrolling label and microinteraction | Updated to one viewport-bottom cue, visible only while the letter is on screen; 18px on desktop and 16px on phones. Animated scenes retain the nudge; reduced-motion scenes keep it static. |
| Craft-style closing text | Archived-style horizontal pixel marquee is present. Exact reference parity has not been visually verified. |
| Roles heading animation on desktop and mobile | Present in the shared scroll-driven heading runtime. |
| No full stops in headings | Annotated headings were already corrected; remaining empty-state headings and the exchange heading are now corrected too. |
| Role loader, problem statement, official title, plain context | Present in the live role renderer. |
| Full-width role introduction and divider; sticky scrollable form below | Updated to one dialog scroll at the two-column breakpoint of 900px. The form has 40px vertical padding; a tall form scrolls until its bottom is reachable before sticking. |
| Country default and compact labels with dial codes | Present: valid role-country default and IND +91 / AUS +61 / UAE +971 labels in a 100px selector, preserving API values. |
| Dropdown icon inset, placeholders, shared submit button | Present in the shared application controls. |
| Careers page opens without navbar overlap or endless loading | Navbar clearance and bounded read timeout/retry are present. |
| Direct job submission | V3 contract is implemented server-side. Required Applied for Location submissions remain blocked pending the tenant's verified backend field key. |

The sliding filters and gray selected state belong to the annotated homepage `#problems` section. The separate `/careers/` filters retain their existing wrapped layout. Compact closing layouts retain readable static text.
