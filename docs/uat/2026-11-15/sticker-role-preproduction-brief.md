# Preproduction brief: role work summaries and nine meaningful stickers

This independent review compares the new direction with the archived November13 feedback and the current user's corrections. It is a brief/acceptance definition before the implementation is ready, not final UAT approval.

## Brief match

The archived feedback register, item01, says roles should lead with the problem and asks what needs to change and why it matters. The requested problem headline → official role title → short actual-work summary hierarchy fits that requirement. Summaries must come from each role's actual source description. Location, employment type and experience belong in the details; their removal from the landing summary must not remove those facts from the source record or detail view. Specific decision scope, first90day commitments and numerical outcomes remain source-dependent and must not be inferred from an attractive headline.

Item03 rejects abstract iconography and asks for illustration tied directly to the moat. The user's subsequent sticker direction preserves the existing palette and treats the whole card as a coherent composition, with readable live text and lightweight motion. Replacing the five generic glyphs with purpose-made, meaning-specific illustrations addresses that previously partial creative result. The latest request also adds four illustrated Flatland working-principle cards; it does not authorize rewriting the four-step method or baking their copy into generated images.

Vikram's paired-page draft supplies the current journey: invitation → convictions → how we work → builder proof → openings → support → founder letter → practical FAQs. Preserve that flow. The separate About page and canonical monetary ambition remain outside this implementation.

## Proposed nine-illustration creative brief

Use the existing cream, violet, lilac, green and dark inks. Keep each illustration legible as a small sticker: roughly two primary forms, one accent, consistent simple outlines, generous negative space and no typography within the bitmap. These are proposed creative directions, not claims about generated artwork.

| Card meaning | Suggested illustration | Meaning to preserve |
|---|---|---|
| Audacity is the only moat | A small plant breaking through a clean brick frame | Making something possible beyond an assumed boundary; avoid a generic upward arrow. |
| Become an AI-native builder | Two hands assembling a modular tool, with a small distinctive AI accent | Learning through making; avoid a numerical10×badge or magic replacing human agency. |
| Ten years of work in one year | A compact stack of calendar leaves becoming completed building blocks | Meaningful progress through repeated work; avoid a clock alone or an exaggerated speed promise. |
| Create100founders | An open workbench with a key and a small growing venture | Access and ownership opportunity; avoid a literal100ticket or implying founders are the only candidates. |
| Build from India for the world | A simplified India silhouette connected by one thread to a globe | Local origin and global reach; avoid a generic compass star or unsupported geographical claims. |
| See the problem clearly | A magnifier over one concrete snag in a simple system | Observe what happened and who is affected. |
| Look beneath it | A lifted floor tile exposing the shared root below | Discover the repeating cause rather than decorating the symptom. |
| Test the assumptions | Two transparent test cards compared against a concrete evidence sample | Check a belief using evidence; avoid an unqualified success checkmark. |
| Change what matters | A hand replacing one gear, with a restrained working indicator | Make a targeted change, observe the result and learn. |

Generated art may use other equally concrete metaphors if the final meaning reads without relying on the headline. Avoid repeated motifs, complex scenery, faux3D effects, baked-in text, broad drop shadows and decorative glyph substitutions. Use one coherent sticker family across all nine while retaining individually meaningful subjects.

## Final UAT gates after implementation

- Confirm every role summary against the source description and preserve the official title exactly; check fallback data as well as successful live data.
- Confirm all five original generic glyphs are actually removed, including stale accessible image labels, and each new illustration depicts its card's meaning.
- Confirm all four working-principle headings and explanatory paragraphs remain accessible DOM text; generated art must not duplicate them for screen readers.
- Check actual title/body/action geometry for every support card after height tightening, including long titles and paragraphs. Compactness must not produce clipping or squeeze the reading/action gap.
- Run the complete landing-page viewport matrix and shared-popup regression journey, including expanded builder continuation, role details/application, footer, pause/reduced motion and keyboard focus.
- Record actual generated assets and source references. Generation alone is not evidence of readability or successful delivery; review the final compositions at their real display sizes.

Final implementation and visual readiness are pending. No deployment authorization is conveyed by this document.

## Implementation source recheck

The ready implementation passes independent brief/source review. All nine `public/img/stickers/*.svg` files parse as XML and contain only vector primitives/groups, using the retained palette plus white; no embedded typography, raster image, external resource or executable SVG element was found. The five ambition cards use decorative images with empty alternative text inside hidden decorative wrappers; stale glyph descriptions are removed. The four principles retain their headings and explanatory paragraphs in the DOM. Vector structure does not establish how clearly a metaphor reads; the final visual reviewer must judge actual display-size artwork.

The integrated role renderer uses escaped problem headline, official title, source-grounded summary and role-details CTA for both landing and listing cards. The facts helper and full detail data are preserved. Independently reran role-summary, role-cards and review-update tests:13passed,0failed. The copy review records the exact current Darwinbox responsibilities and excludes invented outcomes.

Support tightening removes the artificial two-line heading minimum and reduces the content-to-action gap without shortening programme content. Popup hero images retain their natural aspect ratio with contain/top alignment. Programme details remain escaped list items, now grouped in the semantic Programme highlights panel.

One minor cascade observation was sent to the coordinator: the older `.working-principles__steps li>span` blue color rule outranks the newer single-class number color rule, potentially making the decorative fourth number blue on violet. The number is aria-hidden and the ordered list remains semantic; final visual review determines whether the decoration needs correction. No source-level release blocker was identified. Final responsive/artwork/popup UAT remains pending.

## Independent public-job source verification

Fetched the current public `/api/jobs` list and all seven `/api/jobs/<id>` detail responses through the running local API, then independently read each responsibility section rather than relying solely on the copy report or tests. The seven card summaries faithfully paraphrase the current work; no invented responsibility, ownership boundary, first90day commitment or quantified outcome was identified.

| Source ID and official title | Independently confirmed work |
|---|---|
| `a6a425523b4d48` · Builder - Evaluation Engineer | Customer-site vehicle inspections and detailed recorded findings. |
| `a6a477f915ac86` · Builder - Key Accounts | On-ground sourcing-partner/dealer relationships, field visits and procurement lead generation/conversion. |
| `a6a47c209bbcf9` · Builder - Retail Associate | Calling and engaging prospective leads, negotiation and conversion targets. |
| `a6a4bc7c73c3f6` · Builder - Procurement Associate | Dealer auction participation, stronger bids, retention through continuing platform transactions and transaction growth. |
| `a6a4cf2c585259` · Builder - Listing | Help sellers list cars, coordinate potential buyers and support negotiations/conversions. |
| `a6a4d1873e3f74` · Builder - Closure | Guide buyers through listed cars and support questions, negotiations and completed purchases. |
| `a6ad6faa9243f8` · Builder - Procurement | Review inspection reports, photos/videos and service history; identify risks, mismatches and inconsistent documentation before procurement decisions. |

The two Procurement roles are materially different and remain correctly distinguished. Retail Associate, Listing and Closure also retain their different calling, seller-listing and buyer-completion emphasis. Official titles match the current public records. Unknown titles retain the neutral full-description fallback rather than inheriting unrelated responsibilities. This is acceptance of the current seven titles; future upstream JD changes may require refreshing the editorial summaries.

The coordinator relayed final15widthpluslandscape geometry with zero overflow and all seven support hero-photo ratio checks accepted at390/1440. Final interactive regression evidence remains owned by the visual reviewer. No source edit, application submission or deployment was performed by this reviewer.

## Latest user revision: static conviction hierarchy and principles grid

Independent source review accepts the latest revision. All five ambition cards now place their unique phrase before decorative art, then heading and supporting paragraph. The repeated Cars24 Builders label and pause CTA are removed. Default sticker mode sets static artwork, skips generated/movie figure imports and remains static when reduced-motion settings change; the final stylesheet sets animation:none and transform:none. Existing ambition previous/next controls remain for browsing the horizontal ambition list and do not animate the sticker artwork.

The latest principles instruction supersedes the temporary carousel request. The final implementation has four columns from1024px, two columns from601–1023px and one column through600px. The four visible step numbers and principle carousel arrows/markup/runtime are absent; semantic ordered-list structure and all four headings/paragraphs remain.

The letter cue uses a warm cream sticker surface. Only its wheel dot animates while the paper scene is active:1.6seconds repeated three times, a finite4.8seconds. Reduced motion disables that animation. Existing scene-visibility checks suppress the cue before entry and as the next section arrives.

The final stylesheet increases sticker height to480px, applies an additional16px inline inset to the copy wrapper and limits paragraph measure to24ch. These source rules address corner collisions; actual silhouette clearance still requires the ongoing visual matrix, including the ticket notches and shield taper.

Independently ran ambition-stack, review-update and paper-tablet-mode regressions:19passed,0failed. No remaining brief/source blocker was identified. No product files were edited and no deployment was performed by this reviewer.

## Newest correction: neutral principles and footer anatomy

The latest user correction replaces the loud principle-card backgrounds with neutral cards and translucent torn-tape heading labels, while retaining the four illustrations and existing grid. The prior colored-card acceptance is superseded. Final styling and rendered text contrast remain under active review.

Independent footer source audit found a concrete desktop mismatch: review-home-oct21.css reserves36svh for the monogram but applies a font capped at60.2svh with0.82lineheight plus top padding. At1100×955 this permits an approximately575px font/471px line box inside a344px row. The cell, monogram and wrapper clip overflow, explaining cropped glyphs. Phone cells have a later, stronger font/centering rule and require separate verification. Recommended correction is one explicit two-row footer anatomy, a monogram row sized deliberately, centered cells, and font dimensions bounded by both the cell width and available row height, without inherited top padding. Keep GSAP letter translation isolated from the layout sizing. Final visible ink bounds must be measured after the animation completes and with reduced motion.

The newest DEEP request includes subpages as well as the landing page. Route families are the /careers listing, direct /careers/roles/:id role overlay on the listing, and direct /builders/:slug project overlay on the landing page. Support details are overlays, not separate routes. There are14sourced builder paths, including the two historical records omitted from the normal12story deck. Existing unit tests cover route/base handling, listing structure, summaries, detail/application states and popup URL lifecycles; they do not establish rendered subpage quality. The visual reviewer was asked to include listing viewport coverage, all role/support/builder content, direct refresh, shared navigation, focus/close, filter states and safe application-form validation without submission. The shared footer also needs listing-route verification.

## Footer, tape and enlarged-art source recheck

The coordinator’s final corrections pass independent source review. Compared each of the five ambition SVG art groups recursively against the original generated ambition-sheet.svg under output/preproduction-stickers: element structure and every group/shape attribute are identical. Only the root viewBox crop changes. The final CSS overrides the prior wrapper/art exceptions with520px card height and uniform128px desktop/112px phone art windows. Actual painted-height consistency remains a rendered check.

The final neutral principle-card rule matches the specificity of the former color variants and wins by source order. Heading tape is drawn with decorative pseudo-elements behind the existing live h3; the heading text is unchanged and remains selectable. Grid breakpoint rules remain intact.

The footer now has exactly two rows. Monogram cells center their content with24px total vertical padding, line-height1 and font sizing capped by row height minus24px as well as viewport width. This resolves the previous source-level line-box/row mismatch. Live reveal progress derives from current wrapper geometry rather than a stale top/top endpoint. It reaches completion when a compact footer is fully visible and tolerates a one-pixel rounding difference at document end; reverse scroll reduces progress again. Reduced motion resets footer/letter transforms and dark-overlay opacity, while restoring ordinary motion resets cached reveal progress. Independently ran footer-reveal and ambition-stack tests:10passed,0failed.

No remaining brief/source blocker was found. Visual proof of final glyph ink clearance, true end-scroll progress, reverse behavior, enlarged artwork and route coverage remains with the active visual reviewer. No product edits or deployment performed by this reviewer.

## Latest superseding direction: compact centered composition and intentional crop

The user rejected the520px card sizing and requested compact, centered content with consistent padding and sharp principle-card corners. The rewritten final stylesheet removes fixed/minimum sticker heights and empty grid slots, uses intrinsic flex content with balanced centering and consistent gaps, retains only the shield's decorative foot clearance, and centers principle art/tape/copy within20px square-corner cards. All four principle SVG groups compare identically to the original generated sheet; only framing changed.

The user also explicitly restored the earlier oversized, slightly cropped C24 visual treatment. Its intentional crop is now an approved design exception. Prior recommendations to contain every glyph are superseded; the still-valid footer requirement is full geometry-driven reveal at document end without an empty translated blue band. The live progress helper remains unchanged. Learned guidance in docs/uat/feedback.md now separates intentional display-letter cropping from unintended clipped reading content and unfinished footer translation.

Independently reran ambition-stack, footer-reveal and review-update tests:13passed,0failed. Source review identifies no remaining brief blocker. Final visual checks must establish compactness, balanced actual content groups, safe sticker interiors and the approved footer endpoint on landing/listing pages. No product edits or deployment performed by this reviewer.
