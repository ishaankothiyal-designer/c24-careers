const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

// One geography + department treatment for the landing, listing and detail view.
export function roleLabels(role) {
  const job = typeof role === 'string' ? { department: role } : role;
  const country = String(job.country || '').trim();
  const geography = /^(united arab emirates|uae|u\.a\.e\.)$/i.test(country) ? 'UAE' : country || job.cities?.[0] || job.locations?.[0] || '';
  const tag = (value, className, label) => value ? `<span class="${className}" aria-label="${label}: ${escape(value)}">${escape(value)}</span>` : '';
  return `<div class="role-labels craft-experiments__tags">${tag(geography, 'craft-tag--claude', 'Geography')}${tag(job.department, 'craft-tag--framer', 'Department')}</div>`;
}

// Card context is plain text; detail-page labels retain their existing styling.
export function roleCardContext(job) {
  const country=String(job.country||'').trim();
  const geography=/^(united arab emirates|uae|u\.a\.e\.)$/i.test(country)?'UAE':country||job.cities?.[0]||job.locations?.[0]||'';
  const values=[geography,job.department].filter(Boolean).map(escape);
  return `<p class="role-card__context">${values.join(' <span aria-hidden="true">▪</span> ')}</p>`;
}
