import { careersPage, initializeCareersFilters } from './careers-page.js';
import { initializeCareBandCursor } from './runtime/care-band-cursor.js';
import { initializeClosingPixels } from './runtime/closing-pixels.js';
import { useEffect, useRef } from 'react';
import { initializePaperLetter } from './runtime/paper-letter.js';
import { initializeFaq } from './runtime/faq.js';
import { initializeConsent } from './runtime/consent.js';
import sectionIndex from './sections.json';
import { initializeCraftWork } from './runtime/craft-work.js';
import { initializeBuilderPixels } from './runtime/builder-pixels.js';
import { initializeAiAdoption } from './runtime/ai-adoption.js';
import { ACTIVE_NAVBAR } from './navbar-config.js';
import { initializeCraftField } from './runtime/craft-field.js';
import { initializeCraftButtons } from './runtime/craft-buttons.js';
import { initializeSocietyFooter } from './runtime/society-footer.js';
import { initializeExchangeDither } from './runtime/exchange-dither.js';
import { configureSmoothScrolling } from './runtime/smooth-scroll.js';
import { builderDetailPage } from './builder-detail.js';

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

const detail = careersPage(location.pathname, page.split('<main>')[0], page.split('</main>')[1]?.replace(/href="#/g, 'href="/#') || '', sections['./sections/career-08-roles.html']) || builderDetailPage(location.pathname, page.split('<main>')[0], page.split('</main>')[1]?.replace(/href="#/g, 'href="/#') || '');

export function App() {
  const started = useRef(false);
  useEffect(() => {
    if (detail) {
      document.title = 'Cars24 Careers';
      document.querySelector('meta[name="description"]')?.setAttribute('content', location.pathname.startsWith('/careers') ? 'Explore Cars24 roles by department and find a problem to own.' : 'Meet the Cars24 builders and explore the workflows, tools and automation they built.');
    }
    initializeCareersFilters();
    initializePaperLetter();
    initializeClosingPixels();
    initializeCraftField();
    initializeCraftButtons();
    initializeCraftWork();
    initializeBuilderPixels();
    initializeAiAdoption();
    initializeExchangeDither();
    initializeCareBandCursor();
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
      script.addEventListener('load',configureSmoothScrolling,{once:true});
      document.body.appendChild(script);
    }
  }, []);
  return <div className="page-root" dangerouslySetInnerHTML={{ __html: detail?.html || page }} />;
}
