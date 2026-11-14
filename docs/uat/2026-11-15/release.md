# Careers UAT release · 15 November 2026

The user authorized three independent acceptance passes, fixes, and deployment of the resulting Careers changes from `main`. This is task-specific release authorization; it does not authorize future UAT deployments.

## Review coverage

- [Visual/front-end/QA review](visual-review.md): phone, tablet and desktop, a short-height landscape case, every changed section, listing and representative support/builder/role dialogs. Source screenshots and viewport measurements are in `screenshots/`.
- [UX-copy review and recheck](copy-review.md): six actionable findings resolved and accepted after independent recheck.
- [Brief-compliance review and recheck](brief-review.md): 12-item acceptance matrix, independent regression reproduction and fix confirmation, plus skill forward-evaluation.

## Verified fixes

- Clamp both current reel offset and active animation target when the builder roster shrinks; reset momentum. A regression checks all 150 animation frames after collapse. Independent reproduction stays within the smaller reel, and re-expansion/navigation works.
- Stabilise builder, support and founder-letter headings, so readable words do not depend on a character animation's progress.
- Ensure the mobile logo home target is at least 44px high and footer legal copy is at least 12px.
- Use “View role details” on role cards, reserving application wording for the real application flow. Accessible card names include the problem and official role title.
- Remove the unavailable-submit instruction to an unspecified application page; make its recovery message truthful.
- Replace Health/Wellbeing research-note prose with direct candidate-facing descriptions, retaining source metadata.
- Route the persistent Open roles link to `/careers/`; correct unknown-role recovery to refer to current openings.

Intentional role entry points in the hero, navigation, openings section and final invitation are retained because they serve different points in the long-page journey. No unsupported application URL or fabricated content was introduced to remove a source dependency.

## Automated validation

- `npm run build`: passed. Vercel output is `dist/client`. Existing lazy paper/Three.js chunk warning remains informational.
- `npm test`: **160 passed, 0 failed**.
- `git diff --check`: passed.
- Skill frontmatter/scaffold validator: passed for installed and repository `uat-agent` copies. Independent brief reviewer forward-tested the no-deploy scenario and historical authorization boundary.

## Hosting verification

Before pushing, the visual reviewer checked the existing authenticated Vercel settings read-only:

- Project: `design-ea38/c24-careers`.
- Connected Git repository: `ishaankothiyal-designer/c24-careers`.
- Production → Branch Tracking: “Every commit pushed to the main branch will create a Production Deployment.” Matching pattern: `main`.
- Production domain listed: `c24-careers-chi.vercel.app`; automatic production domain assignment enabled.
- No project settings or environment variables were modified or revealed.

Settings checked: `https://vercel.com/design-ea38/c24-careers/settings/environments/production` and the project's Git settings.

## Scope limits retained

The broader approved builder roster, role-specific ownership/decision scope/90-day outcomes and canonical numerical company target remain content-owner dependencies. The first four stories improve the initial mix; expanding still reveals the original twelve. Careers links the existing About page; the paired About implementation remains separate. A distinct Marketing sticker pack was not found, actual Flatland pages informed the native stickers, and no new Higgsfield generation was run.

Browser viewport tests are not a physical-phone cold-load/frame-time recording. Required-location application submission remains unavailable where backend mapping is unverified.

The repository is public. Original private Slack screenshots, the paired-page source PDF and local source ZIP/output packages remain local and are excluded from the release. The site source, programme media, reusable UAT workflow, release findings and public-page QA evidence are included.

## Reusable workflow

Invoke **UAT agent**, **UAT**, or `$uat-agent`. The skill coordinates visual, copy and brief reviews, fixes/rechecks, and a scoped feedback log. It is installed at `~/.codex/skills/uat-agent` and mirrored at `.agents/skills/uat-agent`. `docs/uat/feedback.md` retains explicit corrections and acceptance rules. It does not run in the background or self-modify model weights.

Deployment outcome is recorded in `deployment.md` after production verification.
