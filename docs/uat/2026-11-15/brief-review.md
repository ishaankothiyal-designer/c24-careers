# Independent brief-compliance UAT · 15 November 2026

Reviewer: `brief_uat`. Scope: the current local careers revision, the original November 13 feedback, November 14 replies and later sticker-card direction. Source/code review and a deterministic interaction reproduction; rendered-site inspection belongs to the separate visual reviewer. This report does not claim physical-device or production verification.

## Release assessment

**The initial carousel release hold is now resolved; see the independent recheck below.** Most of the website work matches the documented local implementation scope. The full original brief is not completely satisfied: real-phone first-load measurement, a broader builder roster, complete role ownership/outcome content and the paired About implementation remain partial or source-dependent. Those limits are already disclosed in the implementation report and should remain explicit in any release summary.

## Verified material finding

### P1 · Collapsing the builder selection during arrow motion can leave an empty reel

- Source: `src/runtime/craft-work.js`, `bounds()` (initial review lines 53–58) and the active-target branch in `animate()` (76–78).
- Trigger: expand to the full twelve builder stories, move several cards to the right, start another Next movement, then activate Show selected builder stories while that movement is in flight.
- Cause: the content-change handler recomputes the smaller scroll range and clamps `x`, but leaves the active `target` outside the new range. The next animation frame interpolates back toward the obsolete target. This branch does not clamp the offset.
- Reproduction: the actual `initializeCraftWork()` module ran against a deterministic DOM/RAF harness at `/tmp/uat-reel-repro.mjs`. The expanded reel settled at `translate3d(-2296px,0,0)`. After starting Next and collapsing to four stories, the new maximum travel was 418px and the immediate position correctly became -418px. After twenty frames it moved to -2434px, beyond the remaining content.
- Required fix: when content changes, clear/clamp the active target and velocity as well as the current position, or reset the selected view to the first card. Preserve normal resize behaviour and native touch scrolling.
- Regression expectation: collapse during an in-flight animation; advance every queued frame and require the position to stay inside the new range on **every frame**, not just immediately after the collapse. Check the final arrow-disabled states and verify re-expansion remains usable.
- Status at report creation: sent to coordinator for repair; no product edits made by this reviewer.

## Acceptance matrix

| Original item | Assessment | Evidence and limits |
| --- | --- | --- |
| 01 · Problem-led openings | Partially met | `liveJobCard()` leads with `roleProblem(job)`, then visibly renders the official title and a single whole-card native link. Role-specific decisions, measurable outcomes and the prototype’s first-90-days information are not supplied. Existing descriptions remain authoritative. |
| 02 · Hero placeholder copy/em dash | Met for this local draft | `02-00-hero.html` uses the AI opportunity invitation from the paired-page draft. The previous hero em dash is removed. Production editorial approval is not inferred from implementation. |
| 03 · More relevant moat imagery and whole-card stickers | Met in the chosen native implementation | Five SVG silhouettes, live text and full-card CSS motion preserve the established palette. Flatland reference pages are archived. Pause/resume, reduced-motion/device-budget and visibility policies are present. A distinct Marketing sticker pack is not found; Higgsfield was optional and was not run. Do not claim generated Higgsfield assets. Visual fidelity is for the visual reviewer to judge. |
| 04 · Isolated first-letter heading | Implemented; rendered check required | The openings heading is revised and marked `data-no-roll`; CSS uses normal word breaking. The visual pass must verify actual mobile rendering. |
| 05 · Excess footer space | Implemented; rendered check required | The phone footer is capped using `min(100svh, 34rem)`. Source alone cannot establish whether all short-height layouts remain comfortable. |
| 06 · Support cards fail to open | Met at code/behaviour level | All seven cards have support IDs and activation routing. Native modal drawer supports descriptions, images, Escape, outside click, close button, scroll lock and return focus. Programme details are sourced without invented grants or eligibility. |
| 07 · Initial horizontal lag and role-card clicks | Partially met | Roles are full-card anchors; arrow controls are outside links. Coarse-pointer builder/support reels use native scrolling. The user-requested real-phone cold-load measurement has not been supplied, so the original performance complaint is not proven resolved. |
| 08 · Vague experience/location facts | Presentation met; source fix open | The card summarizes long location lists and defers experience ranges wider than five years to the role detail. That is presentation handling, not correction of the underlying Darwinbox ranges. Source review by the content owner remains needed. |
| 09 · Clear filters placement | Implemented; rendered check required | Reset is in the carousel toolbar rather than a loose control below the entire section. Filter/reset behaviour has regressions; final placement is a visual-pass question. |
| 10 · Healthier builder representation | Partial mitigation | The initial four-story selection includes the existing Manvi and Saumy stories. Expanding still reveals the same twelve-person roster, so the broader two-of-twelve feedback is not fully resolved. No new people should be invented to close it. The new selection control currently has the P1 motion defect above. |
| 11 · Joint copy pass and candidate clarity | Implemented draft; independent copy pass pending | Hero, working principles, founder clarification and FAQs follow the supplied draft. Actual hiring stages and timing are not invented. The UX-copy reviewer should check CTA promises against applications that remain unavailable. |
| 12 · Paired About/Careers storyline | Careers side met; About side deliberately scoped | Careers follows invitation → convictions → working principles → proof → roles → support → letter → FAQ → close. It links the existing About page; a new matched About page was not built. |
| Later request · all updates and local source | Local source delivered, with disclosed limits | Source archive and editable code exist. This should be described as the documented careers iteration rather than unconditional completion of every source-dependent brief item. |

## Source-dependent items versus release defects

The carousel motion defect is a code regression within the current release and should be repaired before publication. Remaining real-content work should not be silently marked passed or fabricated. It can be released as a scoped careers update only with the documented limitations preserved: full roster improvement, approved role ownership/outcomes, real-phone measurement, canonical ambition number and the paired About project.

The existing backend restriction on jobs requiring an unmapped application location is not introduced by this change. However, cards currently say “View role & apply” even when the detail form is blocked; that wording has been flagged to the UX-copy reviewer for consistency review.

Inactive legacy fragments and illustrative preview routes should not automatically be classified as residual candidate CTAs. Audit the actual live composition in `sections.json` and rendered journeys before deleting retained source.

## Reusable UAT skill forward evaluation

Scenario: **“Run UAT on the careers changes and report readiness without deploying.”** Evaluated independently against `/Users/a39236/.codex/skills/uat-agent/SKILL.md` and `references/feedback.md`.

- **Trigger/scope:** Pass. The skill recognizes UAT and keeps this as an active-task website review, not a background monitor.
- **Three disciplines:** Pass. It directs independent visual/front-end/QA, UX-copy, and brief-compliance passes. It explicitly says DOM width checks alone do not constitute visual QA and asks reviewers to collaborate on CTAs/layout.
- **Review independence and concurrency:** Pass. Raw brief/site are given to reviewers; browser ownership and product-file ownership are controlled. If delegation is unavailable, sequential passes are disclosed.
- **Feedback learning:** Pass. User corrections are dated, scoped, evidence-backed and preserved. Agent hypotheses do not become user preferences; credentials and private personal data are excluded. This is a maintained acceptance log, not a claim of model retraining.
- **No-deploy scenario:** The operational outcome must be audit/fixes/report only. The release section correctly states that UAT itself does not authorize deployment and respects an explicit instruction in the active task.
- **Recommended small correction:** Remove the installed skill’s final sentence referring to “the current task’s explicit ‘deploy on main’ instruction”. That approval belongs to the dated release record, not a reusable instruction. Although the sentence says it is not standing approval, “current task” becomes ambiguous when loaded later. Replace it with a durable rule that historical approvals never authorize a future release. The present user’s deployment authorization can remain in this release report/parent task.
- **Reporting:** Pass. It asks for an acceptance matrix, severity-ranked findings, rechecks, exact deployed revision when authorized, and explicit limitations instead of zero-defect promises.

This was a forward decision-path evaluation against the real source and brief. It did not launch a second redundant browser audit or make any deployment.


## Independent recheck · 15 November 2026

**P1 carousel finding: resolved.** After the coordinator’s change, `bounds()` clamps both the current offset and active animation target to the recomputed range and clears velocity. I reran the original independent `/tmp/uat-reel-repro.mjs` against the current module: the expanded position was still −2296px, the collapsed limit became −418px, and the position stayed at −418px after twenty queued animation frames. It no longer moved beyond the remaining cards.

I reviewed and ran `node --test tests/reel-collapse.test.mjs`: **1 test passed**. The test uses the actual initializer, enters the expanded section, collapses during an active Next movement and checks the valid range on all 150 subsequent RAF frames. It also confirms that the Next arrow is disabled and the animation queue settles. An additional independent harness re-expanded the stories and used Next successfully: the offset advanced to −656px and Next was enabled.

**Reusable skill recommendation: resolved.** I read both the installed and repository copies after the change. Both now say: “Historical deployment approvals never authorize a later release; use only authorization that applies to the active task.” The ambiguous task-specific approval sentence is removed. The no-deploy scenario remains audit/fixes/readiness reporting only.

**Updated brief-pass verdict:** no unresolved release-blocking code defect from this independent pass. The source-dependent and deliberately scoped items in the acceptance matrix remain partial; they should stay visible in the final release report. Visual and UX-copy findings require their own reviewers’ sign-off, and deployment/production verification belongs to the coordinator.

**Cross-review CTA correction:** the UX-copy reviewer confirmed COPY-01 resolved, and I independently checked the current card source. It now says “View role details” rather than promising application availability, while the accessible link name includes both the problem and official title. The existing backend restriction remains unchanged. This closes the wording concern identified above without implying that the underlying submission mapping has been completed.

## Shared builder URL refresh recheck · 15 November 2026

The coordinator’s production smoke check found an additional pre-existing route-state defect: a direct `/builders/<slug>/` visit opened the correct drawer but immediately replaced the URL with `/#builders`. Refresh therefore lost the selected project.

I independently inspected the patch to `src/runtime/project-drawer.js`. It now distinguishes a drawer opened from an incoming shared route from one opened normally on the homepage. An incoming shared path is retained while its drawer is open; selecting a neighboring story replaces it with that story’s path; closing returns to the base homepage’s `#builders` anchor. Ordinary homepage-card opening retains its existing non-navigating behaviour. The implementation uses the current `site-base` for the dismiss path and preserves source links.

I ran `node --test tests/project-drawer.test.mjs`: **all 11 tests passed**. Coverage includes direct shared-route initialization without a history rewrite, dismissal to the homepage, neighboring shared stories under a deployment subpath, normal homepage opening without navigation, focus/scroll restoration, modified-link behaviour, animated close and reopening during exit. The new subpath-neighbor regression exercises `/c24-careers/builders/manvi-mehrotra/` → `/c24-careers/builders/nishant-arora/` → `/c24-careers/#builders`.

**Code/test verdict: resolved.** The actual local refresh and later deployed-route smoke checks belong to the visual reviewer/coordinator. This focused pass does not independently assert a production deployment or browser refresh result.
