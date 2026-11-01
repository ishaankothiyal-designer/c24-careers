const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

// The same type + department labels appear on cards and in role details.
export function roleLabels(department) {
  return `<div class="role-labels craft-experiments__tags"><span class="craft-tag--claude">Role</span><span class="craft-tag--framer">${escape(department)}</span></div>`;
}
