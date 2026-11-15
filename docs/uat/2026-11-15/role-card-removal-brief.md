# Role-card sticker removal brief review

**Verdict:** Source/brief accepted. The user's latest instruction rejects role-card artwork and supersedes both prior role-sticker acceptance reports. Final card appearance remains subject to the visual reviewer's rendered checks. No deployment requested or performed for this local follow-up.

The shared liveJobCard renderer no longer imports the sticker helper or emits an image. Both landing and careers-listing cards retain the problem headline, official role title, source-grounded summary and View role details CTA inside one full-card anchor. Existing role URL construction, IDs, department/filter hooks and accessible card name are unchanged. No facts, role copy or application behavior is removed.

The role-specific helper, asset directory and obsolete sticker tests are deleted. Repository source/public searches find no dead import, role-art path, role-sticker variable or container-query reservation; the only remaining source-test mention asserts their absence. Historical UAT records describe rejected iterations and do not reintroduce runtime dependencies. The top-level sticker README and main README now describe the remaining editorial collection and text-only role cards accurately.

The art-specific84px/56px dimensions, negative margins, distribution override and container rules are removed. The existing text-only footer's44px minimum, bottom alignment and card insets apply again, with no empty image element or art slot. Pre-existing role-card sizing remains; this audit does not interpret the original card minimum height as residual artwork spacing.

The nine ambition/principle illustrations remain in public/img/stickers and their markup is unchanged by this removal. The ambition micro-motion, shield edge and illustrated builder View more card are retained. Concurrent footer files—styles.css, runtime/society-footer.js and sections/03-site-footer.html—were not edited by this reviewer and are outside the removal's product diff.

Independently ran role-cards, role-summary, ambition-stack and review-update regressions:23passed,0failed. Coverage includes the shared renderer's text-only/no-img/no-SVG check for landing and listing. git diff --check passed. No product edits, browser actions, application submissions or deployment performed by this reviewer.
