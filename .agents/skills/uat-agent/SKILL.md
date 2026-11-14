---
name: uat-agent
description: Coordinate detailed website acceptance testing with independent visual/responsive, UX-copy and brief-compliance reviewers. Activate when the user asks for the UAT agent, UAT, user acceptance testing, or the combined frontend-QA-designer release pass. Retain explicit user feedback for future passes; deployment still requires task-specific authorization.
---

# UAT Agent

Use this skill to establish and improve release readiness for the user's website. “UAT agent” and “UAT” invoke this workflow. Run during the active task; it is not a background monitor or a scheduled automation.

Read the current project's AGENTS.md, README, applicable design instructions, source brief, changed files and `docs/uat/feedback.md` when present. Read [learned guidance](references/feedback.md) for scoped preferences from previous runs. Preserve project content, source URLs and existing hosting constraints.

## Independent passes

Delegate three independent reviews when sub-agents are available. User invocation of this skill requests this delegation. Give reviewers the brief and raw site/source, not the desired verdict. If delegation is unavailable, perform the three passes sequentially and disclose that limitation.

- **Visual/front-end/QA:** inspect the live rendered site on phone, tablet and desktop. Check actual viewport dimensions, typography, line breaks, padding/rhythm, alignment, image crops, sticky headers, horizontal overflow, visual hierarchy, visible focus, motion/reduced-motion, and duplicate/residual CTAs. Test meaningful navigation, carousels, dialogs, filters and empty/error states. A DOM width check alone is not visual QA.
- **UX copywriter:** check the same user journeys for consistent terminology, direct labels, readable sentences, useful action wording, truthful requirements, source-grounded claims, errors, empty states and accessibility names. Work directly with the visual reviewer on CTA hierarchy and copy-driven layout issues.
- **Brief compliance:** map each original requirement and subsequent correction to implementation and evidence. Distinguish fully met, partial, blocked by missing source data, and intentionally out of scope. Independently challenge release claims and test coverage.

Give browser ownership to one reviewer at a time if they share browser state. Do not let independent agents mutate the same product files concurrently. Reviewers should write findings/evidence; the coordinator owns fixes unless file ownership is explicitly partitioned.

## Coverage and fixes

Use a viewport matrix appropriate to the product. For Cars24 Careers, cover at least 320/375/390/414 phone, 768/834/1024 tablet, and 1280/1440 desktop widths, including a short-height/landscape case. Verify the viewport actually applied to the inspected tab. Inspect every changed section and representative related routes/dialogs. Save key screenshots with route, width and finding context.

Rank verified findings by user impact: broken flow/data, accessibility, responsive clipping/overlap, misleading or redundant action, then consistency/polish. Fix material issues within the authorized scope. Preserve real source content; do not invent people, outcomes, hiring stages, policy details or assets to fill a brief. Record genuine content dependencies rather than silently passing them.

After fixes, rerun affected checks and ask reviewers to recheck their findings. Run the project's required build/tests. Keep a concise acceptance matrix, resolved/open findings and evidence under `docs/uat/<date>/`. Do not claim zero defects or complete physical-device testing from browser emulation. Release readiness means no unresolved material defects within the verified scope, with limitations explicit.

## Feedback-driven learning

The user authorizes this skill to retain their UAT feedback and improve this workflow. On explicit correction, record the date, wording/intent, project scope, resulting acceptance rule, and evidence in `docs/uat/feedback.md`. Promote stable reusable preferences into [learned guidance](references/feedback.md); keep project-specific facts scoped to that project. Update this skill only when feedback demonstrates a useful change. Do not copy credentials or personal data into learning logs, overwrite history, or treat an agent hypothesis as a user preference. A later explicit correction supersedes an earlier rule and should be recorded as such.

## Release

A UAT invocation authorizes audit and necessary reversible fixes, not a deployment by itself. Follow an explicit deployment instruction already in the active task without asking again. Before publishing, check repository instructions, target branch, existing hosting project and actual production-branch setting. Commit only the requested work, exclude private environment files/unrelated artifacts, and never force-push shared history. Verify the exact deployed revision, build state, stable production URL and representative direct routes after release. An inability to verify production is a reported limitation, not a successful release.

For Cars24 Careers, keep the existing Vercel project and `https://c24-careers-chi.vercel.app`, use `npm run build` and `npm test`, publish `dist/client` at root, and do not use Sites or GitHub Pages. Historical deployment approvals never authorize a later release; use only authorization that applies to the active task.
