// The deployment sets this base without changing the application's route names.
export function routePath(pathname, base = '/') {
  if (base === '/') return pathname;
  if (pathname === base.slice(0, -1)) return '/';
  return pathname.startsWith(base) ? '/' + pathname.slice(base.length) : pathname;
}

export function siteLinks(html, base = '/') {
  if (base === '/') return html;
  return html.replace(/\b(href|data-builder-href)="(\/(?!\/)[^"]*)"/g, (match, attribute, value) => {
    return `${attribute}="${value.startsWith(base) ? value : base + value.slice(1)}"`;
  });
}
