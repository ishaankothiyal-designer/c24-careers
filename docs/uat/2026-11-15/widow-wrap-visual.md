# Divider and widow-wrap visual UAT

**Accepted locally.** The requested divider, desktop builder heading and Manvi teaser are fixed. Responsive line measurements and targeted final screenshots found no unresolved material wrap or overflow defect in the verified scope. No deployment was performed for this pass.

## Method and scope

Chrome viewports were verified at **320, 375, 390, 414, 834, 1100 and 1440px**. The audit measured actual rendered word lines with DOM Ranges, then inspected appearance screenshots. It covered the landing page with all twelve builder cards expanded, the careers listing, all twelve builder popup stories, all seven loaded job descriptions and all seven support popups across these widths. Final fixes were rechecked at the widths that reproduced each finding.

Measurements use individual `Range.getClientRects()` fragments when a hyphenated word spans lines. A bounding rectangle for a whole hyphenated token can incorrectly classify a line such as **“support capabilities.”** as a lone **“capabilities.”** Such false positives were checked and excluded. Structured city/address values, screen-reader-only 1px elements, and intentional two-word programme labels are not treated as prose widows.

## Findings and final verification

| Finding and exact context | Final result |
| --- | --- |
| `#working-principles` lacked its expected visible top divider because a more specific adjacent-section rule removed it. | Accepted. The shared divider now computes to **1px solid**, approximately RGB 215/214/214. It spans x=0 to the full viewport edge at both 320px and 1440px, matching adjacent section treatment. |
| `#builder-title` wrapped “Ideas can come from” / “anywhere” at 375/390/414/834/1100/1440px. Its 1440px box was only 513.9px wide. | Accepted. At 834/1100/1440 the complete heading is a clean single line; painted text is 728.9px at 1440. Phones use two balanced lines: “Ideas can come” / “from anywhere.” No smaller heading font was required. |
| `#builder [data-builder-href="/builders/manvi-mehrotra/"] .craft-work__description` ended with isolated “AI.” at 1100/1440. | Accepted. The approved concise teaser now reads “Built HTMLHub so teammates can securely host and share AI-built HTML prototypes.” It occupies two clean desktop lines and three phone lines. Canonical builder data and landing teaser agree. |
| Several landing descriptions and outcome paragraphs ended with isolated words despite `text-wrap:pretty`. | Accepted in the measured cases. Short prose uses balance; thirteen authored builder paragraph endings use specific safe phrase guards. All 84 builder-popup width/content cases were checked after those guards, with no horizontal overflow. Remaining apparent flags were hyphen continuations, not actual one-word final lines. |
| At 320px the support section introduction ended “responsibility.” alone; letter, FAQ and working-principle headings could end “yet”, “leap?” or “it.” alone. | Accepted. Specific phrase guards retain meaningful final units such as “beside responsibility”, “there yet”, “the leap?” and “causing it.” The intended phrase hierarchy and heading scale remain intact. |
| The original Closure headline required isolated long words at 320px. | Accepted. Copy-reviewed “Help buyers complete a purchase” fits without shrinking the card type or changing padding. Role facts and source job descriptions remain intact. |
| Short builder popup headings at 320px ended with “campaigns”, “receipts”, “records” or redundant “together”. | Accepted. Specific phrase guards and the approved concise Suraj heading resolve the observed cases. Final 320px Ayush Upadhyay and Suraj scans have no true one-word heading endings. |
| A first support highlight guard joined “generation’s opportunities”, creating **16px overflow** at 320px. | Resolved and accepted. The source-grounded wording is now “A programme focused on opportunities for the next generation.” Its safe final pair fits: **client width 198px, scroll width 198px**. CareHer and Mission Elevate paragraph/note endings also pass. |
| Live ATS content retained some one-word tails after CSS balancing. | Accepted in targeted final checks. The bounded tail guard preserves words/markup and joins the final whitespace only when the measured phrase fits the reading width and a 180px cap. Key Accounts 320 “network/collaboration”, Listing/Closure 320 “journey/goals”, and Retail/Procurement Associate 375/414 “success” cases were rechecked and resolved. The latter required including plain-text `li` elements, not only paragraphs. |

The careers listing had no true one-word final lines across the seven checked widths after balancing. The final author-controlled landing remnants are intentional label/phrase compositions: the shield’s two-line caption, “Opportunity, not a prerequisite” on the smallest sticker, and “Compassionate Support.” At narrow desktop widths, a two-word phrase such as “Test the / assumptions” remains a readable heading composition rather than a lone trailing word in body prose.

## Evidence

Ignored evidence lives under `output/widow-wrap-uat/`:

- `builder-heading-final-1440.jpg` — the complete desktop heading on one line.
- `divider-heading-final-320.jpg` and `divider-heading-1440.jpg` — section divider and heading context.
- `future-highlight-final-320.jpg` — final safe support highlight; `future-guard-overflow-320.jpg` records the rejected intermediate guard.
- `landing-before-lines.json`, `landing-after-loaded-lines.json`, `landing-final-lines.json` — before/after rendered line evidence.
- `listing-after-lines.json` — seven-width listing pass.
- `builders-final-lines.json`, `authored-builder-guard-candidates.json` — all builder cases and deduplicated finding text.
- `support-final-lines.json` — all support cases; its initial Future overflow record is superseded by the final 198/198px result above.
- `roles-jd-final-lines.json`, `roles-tail-guard-final.json`, `roles-success-final.json` — progressive live-job checks. The final success file supersedes its earlier four unresolved LI records.
- `small-headings-final-320.json` — final narrow popup-heading verification.

No type or inset reduction was used to conceal the findings. The principle body remains at the established readable card-copy scale. No warning/error entries were captured in the inspected final browser session. This is responsive Chrome evidence; it does not guarantee every future ATS sentence or arbitrary viewport will have ideal line endings. API job data, external links and semantic requirements remain preserved. Browser completion summary is recorded, viewport overrides are reset and browser ownership is released.

## Final divider breathing-room recheck

The coordinator caught that the first divider position touched the ambition controls too closely. After the shared bottom-padding correction, the measured arrow-bottom-to-divider gap is **24px at 390px** and **40px at 1440px**. Actual final screenshots show clear separation while retaining the full-width rule and established section rhythm. This does not alter the accepted text wrapping.

Use `output/widow-wrap-uat/divider-breathing-room-final-390.jpg` and `divider-breathing-room-final-1440.jpg` as the final divider evidence; they supersede the earlier flush-control captures. Measurements are in `divider-breathing-room-final.json`. The targeted two-width recheck is accepted and browser completion has been recorded again.
