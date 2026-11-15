# UAT feedback and acceptance rules

## 15 November 2026 · user-defined workflow

**Request:** Run UAT as a frontend developer, professional QA tester and designer together, working with a UX copywriter and a reviewer of brief completion. Check phones, tablets and desktop; consistent typography and padding; clean sections and no residual extra CTAs. Retain feedback and improve future passes.

**Acceptance rule:** Every UAT invocation runs all three independent passes and reconciles their findings. Evidence must include rendered visuals and interactions, not only passing unit tests. Treat repeated calls to action by their role in the journey; remove misleading or unnecessary ones, rather than every repeated entry point. Keep explicit corrections in this versioned log. The current request authorizes this release to main; later UAT invocations do not automatically authorize deployment.

**Skill:** `.agents/skills/uat-agent/SKILL.md`, also installed at `~/.codex/skills/uat-agent`.

## November 2026 · source feedback retained for Careers

- **Point 3, whole-card stickers:** Keep the established palette. The complete ambition card should read as a sticker, using actual Flatland and located internal sticker references. Motion must preserve reading and offer a still/reduced-motion path.
- **Role intent:** Lead with a concrete problem and visibly name the real role; screen-reader names should carry both. Keep API requirements/source URLs intact. Do not advertise a working application path where submission is unavailable.
- **Support:** Programme cards need a useful destination and accurate details, with relevant existing imagery where available.
- **Responsive quality:** No broken words, excessive footer gaps, laggy or blank reels, sticky overlap, cramped controls or inconsistent section typography.
- **Truthfulness:** New people/stories, role-specific outcomes, hiring timelines and the canonical numerical ambition need source evidence. Missing content is an open dependency, not an excuse to invent it.

Evidence: `docs/feedback-2026-11-13/README.md`, original screenshot/PDF references and `docs/uat/2026-11-15/` reviewer reports. These are project-scoped rules, not universal preferences for unrelated sites.

## 15 November 2026 · verified findings from the first UAT run

These are observed implementation defects, not newly inferred user preferences.

- **Shrinking an animated reel:** clamping the displayed position is insufficient if an older target or momentum can move it outside the new bounds on the next frame. Clamp/cancel the target and reset momentum; exercise every frame after shrinking, then re-expand and navigate. Evidence: `tests/reel-collapse.test.mjs` and the independent brief recheck.
- **Action-label truthfulness:** a card can guarantee opening role details while the role's application may be unavailable. Use destination-accurate wording and test blocked states. The accessible name must retain both the problem and real role. Evidence: copy findings COPY-01/02/05 and the recheck.
- **Rendered text stability:** a heading can pass width/overflow checks yet be unreadable halfway through a character animation. Inspect the normal reading position during scroll, not only its settled end state. Evidence: visual review and stable-heading fixes.
- **Shared-dialog refresh:** production smoke found that an incoming builder URL was replaced by a homepage anchor before dismissal, so a refresh lost the story. Require actual direct navigation and refresh for each instructed route type before release, including selected-neighbor URL and dismissal coherence. An HTTP-200 shell or an initially open drawer is insufficient evidence. Regression: `tests/project-drawer.test.mjs`.

## 15 November 2026 · hero heading continuity

**User correction:** The two hero sentences should flow continuously, without a paragraph-like forced break between them.

**Acceptance rule:** Keep “The internet brought cars online. AI can change how the world owns them.” in a single text flow. Preserve the colour emphasis on the second sentence, but do not insert a manual line break at the sentence boundary. Allow natural wrapping for the screen width. This applies to the Careers hero, not every heading on the site.

## 15 November 2026 · swipeable role popup and application popup

**User request:** Make the job detail experience a popup carousel, with left/right swipes revealing the other job postings, responsive on mobile. The supplied screen recording is an interaction reference for whole-detail panels, not content to copy.

**Acceptance rules:** Browse real openings in horizontally swipeable panels with a visible adjacent-card cue, previous/next controls and position. Keep vertical reading inside the selected panel. Direct role URLs must continue to load and refresh, and browsing must not add one browser-history entry per swipe. Application forms open separately for supported roles and retain their own drafts across browsing; unsupported application mappings remain unavailable. Preserve the normal-flow hero correction.

**Verified issues caught in this pass:** Recovered role-list loading must clear an earlier failure hint; background role requests must not change the active title; form drafts stay associated with their role; hidden neighbor IDs must remain unique; tapping an inert but visible neighbor preview should navigate rather than close the modal. Raw reference recording and generated review frames stay local in Downloads/output.

## 15 November 2026 · shield sticker caption

**User correction:** Fix the caption running outside the bottom of the “Build from India for the world” shield sticker.

**Acceptance rule:** Keep the entire caption inside the silhouette's wide area, above its tapered point, at phone, tablet and desktop widths. Reserve shape-specific bottom space rather than changing the copy or flattening the sticker shape.

## 15 November 2026 · support section introduction spacing

**User correction:** The support section's introduction spacing looks inconsistent with other sections.

**Acceptance rule:** Use the shared section introduction rhythm: aligned heading and supporting text in two columns on larger screens, stacked with the shared gap on phones, reset incidental text margins, and retain the shared heading-to-carousel spacing.

## 15 November 2026 · letter exit and moving shadow

**User corrections:** Too much whitespace before the FAQ; the animated letter's shadow breaks while scrolling.

**Acceptance rules:** Reclaim the animated letter's empty exit space before the FAQ while preserving readable letter content and static/mobile fallback spacing. Fade the projected floor shadow before the transparent renderer boundary, keeping the paper itself crisp. Inspect entrance, open and folded exit states for hard rectangular shadow edges.

## 15 November 2026 · consistent landing-page popups

**User correction:** Use the roles popup's style and the same component for builder stories and other landing-page popups.

**Acceptance rules:** Role, builder and support detail carousels share the modal shell, card geometry, backdrop, close control, navigation, swipe/drag behaviour and responsive insets. Preserve each source's content and links, direct builder routes and focus restoration. Keep the default builder deck limited to the twelve stories approved for the landing gallery; retain directly linked legacy stories without adding them to every gallery session. Disable native image dragging so the carousel gesture works over project imagery too.

## 15 November 2026 · full card anatomy and popup surfaces

**User corrections:** Support cards break the shared padding structure; recheck deeply across all viewports. Builder popup backgrounds clash; reduce backdrop opacity and blur the page behind it.

**Acceptance rules:** Card content belongs to one padded wrapper. Heading, description and action share the same left/right inset; support content fills the card height, and actions sit on a common bottom baseline even with different title/description lengths. Use the shared card title scale. Inspect every card, not only the first visible item, across phone/tablet/desktop and landscape. Popup reading sections use one light surface, with subtle boundaries instead of a heavy dark outcome block. The page remains slightly visible through a lighter blurred scrim while toolbar text stays readable. Page-level sticky headings must be disabled inside one-column popups.

**Coverage correction:** Earlier popup-focused passes did not catch the landing support-card action at the border. Full-page acceptance must include measured card anatomy (title/body/action insets and bottom alignment) across every item, in addition to popup geometry and page overflow.

**Additional deep-pass finding:** Phone footer title and legal links collided during scroll. Keep legal content in a separate normal-flow row and constrain title visibility/translation to the title's own area. Inspect both intermediate and settled animation states; fixed document dimensions alone do not catch animated element overlap.

## 15 November 2026 · inline builder View more card

**User correction:** Remove the standalone “Show all builder stories” link. Put “View more” in the carousel's last selected card so readers can keep going forward.

**Acceptance rule:** After the four selected stories, render a real keyboard-operable View more card with the shared carousel footprint. Activating it reveals the remaining eight stories in place, removes the action card and moves/focuses the first newly revealed story without scrolling the page vertically. Retain all twelve approved stories, normal carousel navigation and project popups. Do not restore an extra outside toggle or collapse link.

**Verified continuation issues:** Reserve full-roster row height before revealing cards so long descriptions do not shift the following section. In transform carousels, browser focus scrolling must not be added to the transform offset; inspect Tab/Enter/Space and following arrow navigation, not only mouse activation. The native-touch path must retain browser scrolling.

## 15 November 2026 · pre-production card polish and meaningful sticker art

**User corrections:** Reduce support-card height and excess title/subtext spacing; replace role-card metadata filler with a short explanation of the actual role, checked against Vikram's Friday feedback; make the working-principle steps more engaging with Flatland-themed cards and Higgsfield sticker titles; replace all five ambition symbols with simple illustrations derived from each card's meaning while retaining the palette/minimalism.

**Acceptance rules:** Keep support headings and summaries close without a forced empty title row; retain equal outer insets and bottom-aligned actions. Role cards lead with problem, visible official role and source-grounded work/purpose; full facts stay in details. Preserve DOM headlines/body text and the motion/static path. Each new illustration needs a written semantic brief, consistent simple style and legible actual painted area at phone size, not only non-overflowing image bounds. Number/title areas must not collide at 320px. Do not split long words to force a fit.

**Additional popup corrections:** Preserve complete source photos without cropping faces; use natural image proportions and top anchoring. Programme details must read as a deliberate, aligned highlights list, with markers and a subtle visual grouping.

**Verified fixes:** The smallest principle title needed extra room and an independent sequence-number area. The shield's transparent image box passed geometry but its painted illustration was too small; increase the visual slot while keeping the caption above the tapered foot. On larger principle grids, reserve a title slot so short label text does not shift its subtitle baseline upward.

## 15 November 2026 · final sticker hierarchy, safe text and responsive grid

**User corrections:** Remove repeated CARS24 · BUILDERS labels; put each ambition card's unique phrase above its illustration, then headline and subtext. Give copy ample clearance from sticker corners. Remove the pause CTA when there is no useful visible sticker motion. Remove working-principle 01–04 badges. The later grid request supersedes the earlier carousel exploration: four across on desktop, 2×2 on tablets and four vertical cards on phones. Restyle the letter's Keep scrolling cue as a lightly animated sticker.

**Acceptance rules:** Preserve all existing phrases and body copy in actual DOM reading order. Default ambition cards stay static without a pause control, with safe interior text margins around shaped edges and the shield's upper curve/taper. Keep all four principle cards visible in the 4/2/1 grid and align description baselines within a row without forced word breaks. No principle carousel controls or repeated number labels remain. The cue is an informational sticker, active only during the letter scene; any animation is finite and reduced-motion-safe.

## 15 November 2026 · neutral tape cards, larger consistent stickers and footer completion

**Latest user corrections:** Principle cards were too loud: use neutral surfaces, retain the illustrations, and make headings look written on stuck-on sellotape. Keep the 4/2/1 grid. Ambition illustrations should be a little larger and share a consistent visible height without redesigning them. Fix the footer's lower section and perform deep UAT on the landing page and subpages.

**Acceptance rules:** Tape is decorative behind unchanged live text, with readable contrast and no new controls. Normalize illustration framing rather than editing its paths, retain copy-safe interiors and consistent visible silhouette height. Verify the actual document-end footer state on home and listing: fully revealed wrapper, glyphs inside monogram cells, and no unintended translated blank band. Include direct role/project routes, refresh/neighbor/dismissal history, listings/search/filters/empty recovery, supported application validation, unsupported notices and all support overlays. Responsive widths alone do not establish subpage acceptance.

## 15 November 2026 · compact centered cards and intentional footer crop

**Latest user correction supersedes earlier fixed-height and uncropped-glyph guidance:** Tall520px stickers and forced empty title rows made the composition feel padded out. Use intrinsic content height with consistent outer insets and balanced centered groups; retain only shape-specific clearance such as the shield point. Principle illustrations, tape headings and paragraphs should be centered, with sharp card corners. The4/2/1grid remains.

**Footer distinction:** The user explicitly wants the previous large, slightly cropped C24 treatment. Intentional display-letter cropping inside its cells is an approved design choice, not a defect to normalize away. Preserve the geometry-driven completion fix: an unfinished whole-footer translation leaving an empty blue band at document end remains a defect. Judge these separately on home and listing, at phone/desktop/landscape, after animation and with reduced motion. Do not substitute a smaller fully contained wordmark solely to satisfy a generic overflow check.

**Acceptance:** Compare actual content groups and visible artwork, not only box sizes. Confirm intrinsic cards grow for the longest real text without oversized spacer slots, safe silhouette interiors and readable tape. Keep all copy in the DOM. Distinguish intended decorative clipping from unintended clipped copy, inaccessible controls or translated blank regions; document the user-approved exception before filing a regression.

## 15 November 2026 · white principle-card surfaces

The latest user correction supersedes the off-white neutral surface: all four working-principle cards must use the shared white background, matching other page cards. Preserve sharp corners, centered content, tape headings and the existing responsive grid.

## 15 November 2026 · principle-card body typography

User correction: the four principle-card descriptions look oversized. Use the same body treatment as other card descriptions: shared body font and regular weight, career-card-copy-size (14.5px), and story line height (1.5). Preserve the headings, centered alignment, white surfaces and responsive grid.

## 15 November 2026 · section boundaries and widow-free reading

User correction: add the shared divider above the working-principle section; let the builder heading read cleanly across available desktop width. Audit landing/careers/popup text for isolated last words while retaining padding and readable type. Remove stale section-border exceptions, use available heading width and natural balanced/pretty wrapping, then safe short phrase guards or meaning-preserving copy tightening for verified remaining cases. Do not use global nowrap, clipping, smaller fonts or reduced gutters to hide text problems. Distinguish short labels and factual metadata from prose widows.

## 15 November 2026 · shared popup side controls and Flatland accents

User corrections: reduce popup image height with centered focal content, use landing-page pixel arrows at the left/right viewport midpoint, remove page counts and blur inactive neighbors. Apply consistently to roles and content popups on all screen sizes. This supersedes the previous visible bottom navigation and unbounded natural-height hero images; complete source images still need to remain visible. Keep short full-image contain frames, clear 44px control lanes, independent reading/swipe, descriptive controls and current-item accessibility announcements. Check a failed deck load alongside a successful current role so retry cannot cover Apply.

Additional corrections: give the dark ambition shield a contrasting bright green or blue offset shadow; the chosen exploration is the existing Flatland green at the same 5px depth. Give the View more stories card a more interesting Flatland graphic while retaining its copy and reveal behavior. Native decorative artwork is based on the reference’s pinched/pill shapes, bold ink edges, arrow/sparkle motifs and restrained grid. Preserve sharp outer card edges and accessible live wording.

## 15 November 2026 · light shared-popup drag interactions

User correction: subtle drag interactions should move the popup carousel smoothly on desktop, tablet and mobile. Do not require moving half a card before snapping forward. The implementation distinguishes horizontal intent from vertical reading, advances on a short deliberate flick, preserves native touch/pinch and excludes interactive/editable controls. Test small movements, deliberate short drags, cancellation, endpoints and interruption of a smooth snap. The final visible card must always be the active/accessibility-exposed card when scrolling settles.

## 15 November 2026 · subtle ambition-sticker micro-motion

Latest user correction supersedes the earlier completely static card treatment: add very subtle hover tilt/sticker movement and a small scale-up as cards enter the viewport. Keep arrival brief and one-time, hover limited to a fine pointer, all text visible throughout, and reduced-motion fully still. Preserve card dimensions/padding and the green shield shadow. Do not restore looping sticker motion or a pause CTA for these short interactions. Reserve paint clearance without changing the section’s layout footprint.

## 15 November 2026 · consistent role-context stickers

User correction: put a small Flatland illustration on every job card, customized to the context of the work and placed consistently in the lower-right area. Apply the same renderer on the landing carousel and careers listing. Preserve all approved role copy, official titles, application restrictions and accessible link names. Use one consistent decorative canvas/placement with a neutral fallback for unreviewed titles; department alone must not conflate dealer auctions and technical inspection review. Keep the sticker clear of the summary and CTA and do not make cards taller just to accommodate art.

The user subsequently authorized a complete responsive pass and publishing all accumulated popup, illustration and motion changes to main and the existing Vercel project. “Version” was clarified to “Vercel”; no package-version bump is required.
