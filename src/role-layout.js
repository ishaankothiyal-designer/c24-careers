// Live openings and previews share a full-width introduction above two columns.
export function roleDetailLayout({ header, facts = '', content, recovery = '', application }) {
  return `<div class="container role-detail__header">${header}</div><div class="container role-detail__layout">
    <div class="role-detail__content">${facts}${content}${recovery}</div>
    <aside class="role-detail__application" aria-label="Role application">${application}</aside>
  </div>`;
}

export function roleLoadingHtml(headingId = 'role-title') {
  return `<section class="container role-loading" role="status" aria-live="polite"><span class="role-loading__spinner" aria-hidden="true"></span><h1 id="${headingId}" data-no-roll>Loading role…</h1><p>Fetching the latest details and application fields.</p><div class="role-loading__skeleton" aria-hidden="true"><span></span><span></span><span></span></div></section>`;
}
