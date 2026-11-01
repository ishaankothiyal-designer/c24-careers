// Live openings and illustrative previews share the same responsive shell.
// All role content stays in the left grid; the right column is for applying.
export function roleDetailLayout({ header, facts = '', content, recovery = '', application }) {
  return `<div class="container role-detail__layout">
    <div class="role-detail__content">${header}${facts}${content}${recovery}</div>
    <aside class="role-detail__application" aria-label="Role application">${application}</aside>
  </div>`;
}
