import previews from './role-previews.json' with { type: 'json' };
import { roleDetailLayout } from './role-layout.js';
import { roleLabels } from './role-labels.js';

const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

// Preview slugs are local design references, never Darwin role IDs.
export function roleDetailPage(pathname, header, footer) {
  const match = pathname.match(/^\/careers\/roles\/([^/]+)\/?$/);
  if (!match) return null;
  if (/^a[a-f0-9]{12,32}$/.test(match[1])) return {
    title: 'Loading role | Cars24 Careers',
    html: `${header}<main class="role-detail" data-live-role="${match[1]}"><section class="container role-detail__hero" aria-labelledby="role-title"><h1 id="role-title" data-no-roll>Loading role…</h1><p role="status">Fetching the latest details.</p></section></main>${footer}`,
  };
  const role = previews.find(item => item.slug === match[1]);
  if (!role) return {
    title: 'Role not found | Cars24 Careers',
    html: `${header}<main class="role-detail"><section class="container role-detail__hero"><a class="role-detail__back" href="/careers/">← All roles</a><h1>Role not found.</h1><p>This role may no longer be available. Explore the role previews to find another problem.</p></section></main>${footer}`,
  };
  const sections = [...role.sections,
    { title: 'About the role', text: 'The full role description will appear here when this opening is published.' },
    { title: 'What you’ll bring', text: 'Experience and requirements will be shared with the published role.' },
  ];
  return {
    title: `${role.title} | Cars24 Careers`,
    html: `${header}<main class="role-detail">${roleDetailLayout({
      header: `<header class="role-detail__hero" aria-labelledby="role-title">
        <a class="role-detail__back" href="/careers/">← All roles</a>
        ${roleLabels(role)}<h1 id="role-title" data-no-roll>${escape(role.title)}</h1>
        <p class="role-detail__summary">${escape(role.summary)}</p>
        <p class="role-detail__preview">Role preview · Illustrative, not a current opening.</p>
        <p class="role-detail__availability">Applications aren’t open for this preview.</p>
        <p>Applications will be available here when a live role is published.</p>
      </header>`,
      content: sections.map((section, index) => `<section aria-labelledby="role-section-${index}"><h2 id="role-section-${index}" data-no-roll>${escape(section.title)}</h2><p>${escape(section.text)}</p></section>`).join(''),
      application: '<a class="craft-button btn-bubble-arrow btn-bubble-arrow--black role-detail__apply" data-craft-static href="/careers/" data-transition-prevent><span class="craft-button-label">View all roles <span aria-hidden="true">↗</span></span></a>',
    })}</main>${footer}`,
  };
}
