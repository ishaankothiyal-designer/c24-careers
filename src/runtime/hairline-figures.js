import { vault, slow, elevator } from '@lucasmarkes/hairline';
import { funnel } from './hairline-examples/funnel.js';
import { cursorTab } from './hairline-examples/cursor-tab.js';

// Import only the figures used by the ambition story. Vite keeps them in
// the lazy illustration chunk rather than the opening page bundle.
const figures = { vault, 'cursor-tab':cursorTab, funnel, slow, elevator };

export function createAmbitionFigure(host, options = {}) {
  const create = figures[host.dataset.hairlineFigure];
  if (!create) return null;
  return create(host, {
    intensity: .6,
    theme: 'light',
    label: host.getAttribute('aria-label'),
    ...options,
  });
}
