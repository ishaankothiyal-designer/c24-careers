# Role-card sticker removal · source/copy acceptance

**Accepted; no material copy or accessibility finding.** This is the final user correction and supersedes the role-sticker and role-sticker-redesign acceptance reports. No product edits, browser use or deployment by this reviewer.

Independent current-source review confirms `liveJobCard()` no longer imports or renders role artwork. No `roleSticker`, `role-card__sticker` or role-sticker sizing token remains in active source. Both landing and listing share the same text-only card implementation.

Each card retains one native link covering the entire card, one visible `View role details` action and an accessible name containing the problem headline and official title. There is no nested button, empty artwork affordance, additional focus stop or redundant CTA. Landing h3 / listing h2 heading levels remain appropriate to their respective page hierarchies.

All seven approved role summaries remain unchanged, including the distinct dealer-auction and technical-review procurement descriptions. Official titles, problem headlines, source destinations and full details/application behavior are unaffected. Removing the decorative artwork loses no meaning because the complete information remains real HTML.

`node --test tests/role-cards.test.mjs tests/role-summary.test.mjs`: **11 passed, 0 failed**. Final compact spacing and wrapping remain the visual reviewer's runtime checks.
