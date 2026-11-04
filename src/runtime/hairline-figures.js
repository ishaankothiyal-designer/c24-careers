import { vault, exploded, relay, elevator } from '@lucasmarkes/hairline';
import { createCrateStack } from './crate-stack.js';

// Import only the figures used by the ambition story. Vite keeps them in
// the lazy illustration chunk rather than the opening page bundle.
const figures = { vault, exploded, relay, 'crate-stack':createCrateStack, elevator };

export function createAmbitionFigure(host, options = {}) {
  const create = figures[host.dataset.hairlineFigure];
  if (!create) return null;
  return create(host, {
    intensity: host.dataset.hairlineFigure === 'relay' ? .25 : .6,
    theme: 'light',
    label: host.getAttribute('aria-label'),
    ...options,
  });
}
