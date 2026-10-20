import { initializeClosingPixels } from './runtime/closing-pixels.js';
import { useEffect, useRef } from 'react';
import { initializePaperLetter } from './runtime/paper-letter.js';
import { initializeFaq } from './runtime/faq.js';
import { initializeConsent } from './runtime/consent.js';
import sectionIndex from './sections.json';
import { initializeCraftWork } from './runtime/craft-work.js';
import { ACTIVE_NAVBAR } from './navbar-config.js';
import { initializeCraftField } from './runtime/craft-field.js';
import { initializeCraftButtons } from './runtime/craft-buttons.js';
import { initializeSocietyFooter } from './runtime/society-footer.js';

// Original semantic sections are kept as separate editable source files.
const sections = import.meta.glob('./sections/*.html', { query: '?raw', import: 'default', eager: true });
const page = sectionIndex.reduce((state, item, index) => {
  const wasMain = sectionIndex[index - 1]?.main;
  if (item.main && !wasMain) state += '<main>';
  if (!item.main && wasMain) state += '</main>';
  const fragment = sections['./sections/' + item.file];
  // Preserve inactive versions as inert templates: no hidden focus targets or runtime binding.
  if (item.navbarVersion && item.navbarVersion !== ACTIVE_NAVBAR) {
    return state + `<template data-preserved-navbar="${item.navbarVersion}">${fragment}</template>`;
  }
  return state + fragment;
}, '');

export function App() {
  const started = useRef(false);
  useEffect(() => {
    initializePaperLetter();
    initializeClosingPixels();
    initializeCraftField();
    initializeCraftButtons();
    initializeCraftWork();
    initializeSocietyFooter();
    if (started.current) return;
    started.current = true;
    initializeConsent();
    initializeFaq();
    // Source modules initialize against the restored semantic DOM. The visual
    // runtime retains the captured GSAP, Lenis, and WebGL implementations.
    for (const src of [
      '/_astro/Nav.astro_astro_type_script_index_0_lang.BTi8Y4C0.js',
      '/_astro/Base.astro_astro_type_script_index_0_lang.BUtqXeGZ.js',
    ]) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = src;
      document.body.appendChild(script);
    }
  }, []);
  return <div className="page-root" dangerouslySetInnerHTML={{ __html: page }} />;
}
