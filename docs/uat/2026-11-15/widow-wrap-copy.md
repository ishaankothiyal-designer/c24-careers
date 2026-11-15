# Widow and wrapping source-copy audit

Scope: active landing, `/careers/`, role popups, builder popups and programme popups. Source-only review; no product edits or browser use. The visual reviewer owns actual line-ending observations. A short final line cannot be classified reliably from character count alone.

## Recommended changes within the existing geometry

1. **Manvi’s teaser: safe editorial tightening.** In `src/sections/career-01-invitation.html` and the matching `description` of `manvi-mehrotra` in `src/builder-stories.json`, current copy is “Built HTMLHub so teammates can securely host and share the HTML prototypes they create with AI.” Proposed: **“Built HTMLHub so teammates can securely host and share AI-built HTML prototypes.”** This retains builder, product, audience, secure hosting/sharing and AI provenance. It removes the weak final “with AI.” construction without inventing a claim. Update both copies together if adopted. The longer case-study body should remain intact.
2. **Use typographic wrapping before changing text measures.** Apply `text-wrap:pretty` to short card prose and summaries; use `text-wrap:balance` on headings where visual review confirms a stranded word. These should be progressive enhancements within the current padding and width. Avoid blanket nonbreaking final-word pairs: on narrow viewports they can force overflow or unusually ragged lines. The existing hero final-phrase guard is a separate, deliberately scoped case.
3. **Treat hard breaks as candidates for visual validation.** `career-02-ambition.html` explicitly breaks all five h3s: `Audacity is / the only moat`, `Become an / AI-native builder`, `10yrs of work / in one year`, `Create / 100 founders`, and `Build from India / for the world`. If the second phrase splits again at a tested width, first try replacing that specific `<br>` with a space plus balanced wrapping. Preserve the accepted words, DOM order and card geometry. Do not shorten claims or hide copy solely to obtain two lines.

## Other wrapping pressure points

| Source / selector | Source constraint | Recommendation |
| --- | --- | --- |
| `career-04-support.html` section heading | Explicit break after `The support` | Check the second phrase at 320px; prefer natural/balanced wrapping only if it creates a stranded `work`. |
| `career-03-how-we-work.html` main h2 | Explicit sentence break, plus 21ch maximum in feedback CSS | Keep the purposeful sentence separation unless the visual matrix shows poor intra-sentence wrapping. |
| `career-10-closing.html`, `career-08-roles.html` headings | Explicit phrase/sentence breaks | Validate narrow widths; do not change approved wording preemptively. |
| `.role-card__title` / `.role-card__summary` | Available card width determines wrapping; summary has no narrow max-width | Balance title / pretty-wrap summary. Keep official role titles and source-grounded summary meaning. |
| `.role-carousel-dialog .role-detail h1` | Maximum 29ch in `role-carousel.css` | Balance within existing width; do not add manual breaks to dynamic role names. |
| `.builder-popup .builder-detail .cs-hero__title` | Maximum 29ch | Balance within existing measure; retain full case-study title. |
| Ambition body | 26ch, with tapered fifth card 20ch / 17ch on mobile | Pretty-wrap within those shape-safe measures; do not widen into the silhouette edge to hide a widow. |
| Programme title and `Programme highlights` list | Content can vary by programme | Use balanced title wrapping and normal/pretty prose; preserve every benefit and any qualifying wording. |

No source-only material copy blocker is established beyond the specific Manvi tightening opportunity. Hard breaks and maximum widths are not themselves defects; line endings require the visual evidence.

## Protected current body style

Confirmed `.working-principles__steps .principle-card>p` in `src/styles/preproduction-polish.css` retains `font-size:var(--career-card-copy-size)`, body font/weight and `line-height:var(--story-line)`. `--career-card-copy-size` is **14.5px** in `src/styles/story-flow.css`. Preserve this shared card-body typography, centered alignment, 28ch measure and current padding during widow cleanup. No clamp, truncation or text deletion is recommended.

All five ambition cards retain caption → decorative illustration → headline → body in DOM order. The role/application and shared-popup wording accepted in `mobile-release-copy.md` remains unchanged by this audit.
