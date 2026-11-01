import { roleLabels } from '../role-labels.js';
import { initializeProblemCarousel } from './problem-filters.js';
import { initializeCraftButtons } from './craft-buttons.js';

export const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
export async function apiJson(path, options = {}) {
  const fallback = 'The careers service is temporarily unavailable. We couldn’t load the open roles. Please try again.';
  let response, body;
  try {
    response = await fetch(path, options);
    body = await response.json();
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error(fallback);
  }
  if (!response.ok) throw new Error(typeof body?.error === 'string' ? body.error : fallback);
  return body;
}
let jobsPromise;
const jobs = () => jobsPromise ||= apiJson('/api/jobs').then(body => {
  if (!Array.isArray(body?.jobs)) throw new Error('We couldn’t load the open roles. Please try again.');
  return body.jobs;
}).catch(error => { jobsPromise = null; throw error; });
export const roleMetadata = job => [job.cities.length > 3 ? `${job.cities.slice(0,3).join(', ')} + ${job.cities.length - 3} more` : job.cities.join(', '), job.employmentType, job.remote ? 'Remote' : ''].filter(Boolean).join(' · ');

export function liveJobCard(job, listing = false) {
  const href = `/careers/roles/${encodeURIComponent(job.id)}/`;
  const title = escape(job.title), department = escape(job.department);
  const heading = listing ? 'h2' : 'h3';
  const experience = job.experienceFrom || job.experienceTo ? `${escape(job.experienceFrom || '0')}–${escape(job.experienceTo)} years of experience` : '';
  return `<a class="${listing ? 'careers-card' : 'problem-card'} role-card" href="${href}" data-transition-prevent aria-label="View role: ${title}" data-job-id="${escape(job.id)}" ${listing ? 'data-department' : 'data-problem-craft'}="${department}">${roleLabels(job)}<${heading} class="role-card__title" data-no-roll>${title}</${heading}><p class="role-card__metadata">${escape(roleMetadata(job))}</p>${experience ? `<p class="role-card__experience">${experience}</p>` : ''}<span class="role-card__link" aria-hidden="true">View role <span>↗</span></span></a>`;
}

export function jobsEmptyStateHtml() {
  return `<section class="jobs-empty" data-job-empty hidden aria-labelledby="jobs-empty-title">
    <svg class="jobs-empty__illustration" viewBox="0 0 240 176" fill="none" aria-hidden="true" focusable="false">
      <path class="jobs-empty__paper" d="M48 16h96v8h8v8h8v112H48z"/>
      <path class="jobs-empty__outline" d="M64 8h80v8h-80v-8ZM56 16h8v8h-8v-8ZM48 24h8v112h-8V24ZM56 136h72v8H56v-8ZM144 16h8v8h-8v-8ZM152 24h8v64h-8V24Z"/>
      <path class="jobs-empty__lines" d="M72 40h56v8H72zM72 60h40v8H72zM72 80h24v8H72z"/>
      <path class="jobs-empty__accent" d="M128 80h40v8h16v16h8v32h-8v16h-16v8h-40v-8h-16v-16h-8v-32h8V88h16z"/>
      <path class="jobs-empty__lens" d="M132 96h32v8h12v28h-12v12h-32v-8h-12v-32h12z"/>
      <path class="jobs-empty__outline" d="M176 144h16v8h8v8h8v8h-16v-8h-8v-8h-8z"/>
      <path class="jobs-empty__spark" d="M192 32h8v8h8v8h-8v8h-8v-8h-8v-8h8zM24 96h8v8h-8z"/>
    </svg>
    <h2 id="jobs-empty-title" data-job-empty-title data-no-roll>No matching roles. Yet.</h2>
    <p data-job-empty-copy>Try a different keyword, location or department. Your next role might be one filter away.</p>
    <button class="craft-button btn-bubble-arrow btn-bubble-arrow--black" type="button" data-job-reset><span class="craft-button-label">View all open roles ↗</span></button>
  </section>`;
}

export function initializeLiveJobs() {
  document.querySelectorAll('[data-live-jobs]').forEach(root => {
    if (root.dataset.jobsReady) return;
    root.dataset.jobsReady = 'true';
    const listing = root.dataset.liveJobs === 'listing';
    const results = root.querySelector('[data-job-results]'), status = root.querySelector('[data-job-status]');
    const filters = root.querySelector('[data-job-filters]'), search = root.querySelector('[data-job-search]'), location = root.querySelector('[data-job-location]');
    const retry = root.querySelector('[data-job-retry]'), clear = root.querySelector('[data-job-clear]');
    results.insertAdjacentHTML('afterend', jobsEmptyStateHtml());
    const empty = root.querySelector('[data-job-empty]');
    // IDs must remain unique if more than one role feed is mounted.
    const emptyTitle = `jobs-empty-title-${root.dataset.liveJobs}`;
    empty.setAttribute('aria-labelledby', emptyTitle);
    empty.querySelector('[data-job-empty-title]').id = emptyTitle;
    initializeCraftButtons(empty);
    let all = [], selected = 'All', carousel;
    const render = (updateUrl = false) => {
      const query = search?.value.trim().toLowerCase() || '', city = location?.value || '';
      const visible = all.filter(job => (selected === 'All' || job.department === selected) && (!city || job.cities.includes(city)) && (!query || `${job.title} ${job.department} ${job.cities.join(' ')}`.toLowerCase().includes(query)));
      [...results.children].forEach(card => { card.hidden = !visible.some(job => job.id === card.dataset.jobId); });
      status.textContent = visible.length ? `${visible.length} ${visible.length === 1 ? 'open role' : 'open roles'} · ${selected === 'All' ? 'All departments' : selected}` : all.length ? 'No open roles match these filters.' : 'There are no public openings right now. Please check back soon.';
      results.hidden = visible.length === 0;
      empty.hidden = visible.length > 0;
      empty.querySelector('[data-job-empty-title]').textContent = all.length ? 'No matching roles. Yet.' : 'More opportunities ahead.';
      empty.querySelector('[data-job-empty-copy]').textContent = all.length ? 'Try a different keyword, location or department. Your next role might be one filter away.' : 'There are no open roles right now. Check back soon to find the work you’d like to own.';
      empty.querySelector('[data-job-reset]').hidden = !all.length;
      const controls = root.querySelector('.problem-carousel__controls');
      if (controls) controls.hidden = visible.length === 0;
      filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.jobDepartment === selected)));
      clear.hidden = selected === 'All' && !query && !city;
      carousel?.reset();
      if (updateUrl && listing) {
        const url = new URL(window.location.href);
        for (const [name, value] of [['department', selected === 'All' ? '' : selected], ['q', search.value.trim()], ['location', city]]) value ? url.searchParams.set(name, value) : url.searchParams.delete(name);
        history.replaceState(history.state, '', url);
      }
      window.dispatchEvent(new Event('resize'));
    };
    const load = async () => {
      empty.hidden = true; status.textContent = 'Loading open roles…'; retry.hidden = true; results.setAttribute('aria-busy', 'true');
      try {
        all = await jobs();
        filters.hidden = false;
        const departments = [...new Set(all.map(job => job.department).filter(Boolean))].sort();
        filters.innerHTML = ['All', ...departments].map(department => `<button type="button" class="careers-filter" data-job-department="${escape(department)}" aria-pressed="${department === 'All'}">${escape(department)}</button>`).join('');
        results.innerHTML = all.map(job => liveJobCard(job, listing)).join('');
        initializeCraftButtons(results);
        if (location) {
          location.innerHTML = '<option value="">All locations</option>' + [...new Set(all.flatMap(job => job.cities))].sort().map(city => `<option value="${escape(city)}">${escape(city)}</option>`).join('');
          const params = new URLSearchParams(window.location.search);
          selected = departments.includes(params.get('department')) ? params.get('department') : 'All';
          search.value = params.get('q') || ''; location.value = params.get('location') || '';
        }
        if (!listing && !carousel) carousel = initializeProblemCarousel(root, [...results.children]);
        render();
      } catch (error) { results.hidden = true; filters.hidden = true; clear.hidden = true; const controls = root.querySelector('.problem-carousel__controls'); if (controls) controls.hidden = true; status.textContent = error.message; retry.hidden = false; }
      finally { results.setAttribute('aria-busy', 'false'); }
    };
    filters.addEventListener('click', event => { const button = event.target.closest('[data-job-department]'); if (button) { selected = button.dataset.jobDepartment; render(true); } });
    search?.addEventListener('input', () => render(true)); location?.addEventListener('change', () => render(true));
    const reset = () => { selected = 'All'; if (search) search.value = ''; if (location) location.value = ''; render(true); (search || filters.querySelector('button'))?.focus(); };
    clear.addEventListener('click', reset);
    empty.querySelector('[data-job-reset]').addEventListener('click', reset);
    retry.addEventListener('click', load);
    load();
  });
}
