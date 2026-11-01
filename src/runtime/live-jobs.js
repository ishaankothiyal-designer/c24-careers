import { roleLabels } from '../role-labels.js';
import { initializeProblemCarousel } from './problem-filters.js';
import { initializeCraftButtons } from './craft-buttons.js';

export const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
export async function apiJson(path, options = {}) {
  const response = await fetch(path, options);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'We couldn’t load the open roles. Please try again.');
  return body;
}
let jobsPromise;
const jobs = () => jobsPromise ||= apiJson('/api/jobs').then(body => body.jobs).catch(error => { jobsPromise = null; throw error; });
export const roleMetadata = job => [job.cities.length > 3 ? `${job.cities.slice(0,3).join(', ')} + ${job.cities.length - 3} more` : job.cities.join(', '), job.employmentType, job.remote ? 'Remote' : ''].filter(Boolean).join(' · ');

export function liveJobCard(job, listing = false) {
  const href = `/careers/roles/${encodeURIComponent(job.id)}/`;
  const title = escape(job.title), department = escape(job.department);
  if (!listing) return `<article class="problem-card" data-job-id="${escape(job.id)}" data-problem-craft="${department}"><h3 data-no-roll>${title}</h3>${roleLabels(job.department)}<p>${escape(roleMetadata(job))}</p><a class="problem-card__detail" href="${href}" data-transition-prevent aria-label="View role: ${title}">View role <span aria-hidden="true">↗</span></a></article>`;
  const experience = job.experienceFrom || job.experienceTo ? `${escape(job.experienceFrom || '0')}–${escape(job.experienceTo)} years of experience` : '';
  return `<article class="careers-card" data-job-id="${escape(job.id)}" data-department="${department}"><div class="careers-card__inner"><h2 class="tier__title" data-no-roll>${title}</h2>${roleLabels(job.department)}<div class="tier__body"><p class="tier__lead">${escape(roleMetadata(job))}</p><p class="tier__note">${experience}</p><div class="tier__cta"><a class="craft-button btn-bubble-arrow btn-bubble-arrow--black" href="${href}" data-transition-prevent aria-label="View role: ${title}"><span class="craft-button-label">View role ↗</span></a></div></div></div></article>`;
}

export function initializeLiveJobs() {
  document.querySelectorAll('[data-live-jobs]').forEach(root => {
    if (root.dataset.jobsReady) return;
    root.dataset.jobsReady = 'true';
    const listing = root.dataset.liveJobs === 'listing';
    const results = root.querySelector('[data-job-results]'), status = root.querySelector('[data-job-status]');
    const filters = root.querySelector('[data-job-filters]'), search = root.querySelector('[data-job-search]'), location = root.querySelector('[data-job-location]');
    const retry = root.querySelector('[data-job-retry]'), clear = root.querySelector('[data-job-clear]');
    let all = [], selected = 'All', carousel;
    const render = (updateUrl = false) => {
      const query = search?.value.trim().toLowerCase() || '', city = location?.value || '';
      const visible = all.filter(job => (selected === 'All' || job.department === selected) && (!city || job.cities.includes(city)) && (!query || `${job.title} ${job.department} ${job.cities.join(' ')}`.toLowerCase().includes(query)));
      [...results.children].forEach(card => { card.hidden = !visible.some(job => job.id === card.dataset.jobId); });
      status.textContent = visible.length ? `${visible.length} ${visible.length === 1 ? 'open role' : 'open roles'} · ${selected === 'All' ? 'All departments' : selected}` : all.length ? 'No open roles match these filters.' : 'There are no public openings right now. Please check back soon.';
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
      status.textContent = 'Loading open roles…'; retry.hidden = true; results.setAttribute('aria-busy', 'true');
      try {
        all = await jobs();
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
      } catch (error) { status.textContent = error.message; retry.hidden = false; }
      finally { results.setAttribute('aria-busy', 'false'); }
    };
    filters.addEventListener('click', event => { const button = event.target.closest('[data-job-department]'); if (button) { selected = button.dataset.jobDepartment; render(true); } });
    search?.addEventListener('input', () => render(true)); location?.addEventListener('change', () => render(true));
    clear.addEventListener('click', () => { selected = 'All'; if (search) search.value = ''; if (location) location.value = ''; render(true); });
    retry.addEventListener('click', load);
    load();
  });
}
