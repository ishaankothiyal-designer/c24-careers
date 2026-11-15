# Shared landing popups · UX copy/source UAT · 15 November 2026

Scope: `content-popup.js`, `popup-shell.js`, `project-drawer.js`, `support-dialog.js`, their generated detail content and the new shared-frame CSS. Source audit only; browser ownership stays with visual UAT. No product edits or deployment actions were taken.

## P2 · Default builder swipe deck includes two deliberately omitted landing stories

`project-drawer.js` builds `items` by mapping every record in `builder-stories.json`. There are **14** source records, but the landing gallery contains **12**. `tests/builder-stories.test.mjs` explicitly verifies that Mayank and Ishaan Kothiyal are absent from the landing gallery.

Opening a landing builder now creates a 14-item counter/deck and lets readers swipe into those two omitted records. This changes the advertised collection and reintroduces entries that the landing selection deliberately excludes. It is a source-scope and count-consistency issue, not a recommendation to delete historical records.

**Required treatment:** Use the landing-approved twelve records for the default landing builder deck. Preserve deliberately retained shared routes separately if required; an explicitly requested historical story can open a distinct route/deck without entering every ordinary landing carousel. Keep the selected-four / show-all-twelve gallery behaviour intact.

**Acceptance:** A normal landing builder opens a counter/deck containing twelve approved landing stories, in a deliberate order, with no swipe into the two omitted entries. Existing historical links remain usable according to the intended route policy. Add a regression connecting the default popup IDs to the landing-card IDs.

## Accepted

- The common frame keeps a specific collection title, current-item heading, `n of total · item name` position status, and Previous/Next controls with collection-specific accessible names.
- Builder configuration uses `Builder projects`, `Close project`, `Previous project` and `Next project`; support uses the equivalent programme terms. These labels match their content and actions.
- The shared instruction `Swipe or use the arrows to explore` works for both mobile and desktop input. There is no newly invented unsupported action in the support or builder popups.
- Heading ID references align with the generated content: builder items use `${slug}-story-title`; support items use `${id}-support-dialog-title`. The shared population code prefixes the actual IDs and their ARIA/fragment references consistently.
- The builder content remains sourced through `builderDetailPage`; programme content remains sourced through `supportProgrammeHtml`. Images, headings, summaries and detail paragraphs are preserved rather than replaced by generic carousel copy.
- `.builder-popup .builder-story-next { display:none }` correctly suppresses the legacy inner previous/next navigation, leaving the shared frame as the visible navigation pattern. No extra CTA deletion is recommended.
- Close labels remain clear. Counters and the repeated item name provide navigation context rather than redundant calls to action.
- Shell parameters are HTML-escaped. Item names in counters use `textContent`, and content-specific escape helpers remain in place.

## Verification

Direct module assertions passed for escaped shell headings, collection-specific control labels, the polite position-status region, all seven support heading targets and all fourteen source builder heading targets. A source comparison independently confirmed the twelve-versus-fourteen collection mismatch described above.

The visual reviewer was informed of the count/scope issue and is checking the common frame, carousel motion, text fitting and focus behaviour. This source audit makes no unverified visual claims. The prior flowing hero change is outside these popup files and remains untouched.

## Source recheck after collection-scope fix

The P2 collection mismatch is **resolved in source**. The default builder deck now filters the same twelve records represented by landing cards. An explicitly incoming historical builder URL adds only that requested legacy record, preserving shared-link access without adding the other omitted record to ordinary browsing.

Independent fixture assertions passed for equality of the default deck IDs and the twelve landing-card IDs. Each of the two retained historical routes was also checked: the requested story opens, the deck contains the twelve landing stories plus that one requested record, and the other omitted story remains excluded. Collection labels, heading references and counter naming remain consistent. Shared-popup image dragging is now disabled to support the intended desktop carousel gesture.

The first focused test run exposed three old adapter expectations that still assumed the prior fourteen-record default or opened an omitted story through ordinary navigation. These are a **test-update gap**, not a remaining copy/source defect; the brief reviewer owns their correction and historical-route regression. Final test acceptance belongs to the coordinator after those updates run.

Copy/source acceptance for the common builder/support frame is **passed**. No product files were edited by this reviewer. Browser visual/gesture/focus acceptance remains with visual UAT, and the prior hero flow is unchanged.
