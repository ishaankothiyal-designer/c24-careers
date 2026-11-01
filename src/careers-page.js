// Reuse the homepage role cards so the listing has the same content and destinations.
import { roleLabels } from './role-labels.js';
const departments = ['Customer Experience', 'People', 'Operations', 'Engineering'];
export function careersPage(pathname, header, footer, roleSource) {
  if (!/^\/careers\/?$/.test(pathname)) return null;
  const cards = [...roleSource.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map(([html]) => {
    const department = html.match(/class="tier__chip"[^>]*>([^<]+)/)?.[1] || '';
    const title=html.match(/<h3\b[^>]*>[\s\S]*?<\/h3>/)?.[0] || '';
    const labels=roleLabels(department).replace('class="role-labels', 'class="tier__head role-labels');
    return html.replace('class="craft-work__card" tabindex="0"', `class="careers-card" data-department="${department}"`).replace('class="tier"', 'class="careers-card__inner"').replace(/<div class="tier__head"[^>]*>[\s\S]*?<\/div>\s*<h3\b[^>]*>[\s\S]*?<\/h3>/,title+labels).replace(/(<p class="tier__lead"[^>]*>)[^<]+/, (match, opening) => opening + match.slice(opening.length).replace(department + ' · ', '')).replaceAll('role-card-', 'careers-role-');
  }).join('');
  return {html:`${header}<main class="careers-page"><section class="hero careers-hero" data-astro-cid-lcdefpme="" aria-labelledby="careers-title"><div class="hero__stage" data-astro-cid-lcdefpme="" data-live-dither-host><div class="container hero__inner" data-astro-cid-lcdefpme=""><h1 class="hero__title" id="careers-title" data-astro-cid-lcdefpme="">Find your next role.</h1><p class="hero__sub" data-astro-cid-lcdefpme="">Explore illustrative roles across Cars24 and find a problem you’d like to own. Live openings will appear here when published.</p></div><div class="hero__art" data-astro-cid-lcdefpme="" aria-hidden="true"><canvas class="craft-hero-field" data-craft-field aria-hidden="true"></canvas></div></div></section><section class="section careers-listing" aria-label="Open roles"><div class="container"><div class="careers-listing__head"><div class="careers-filters" role="group" aria-label="Filter roles by department">${['All',...departments].map((name,i)=>`<button type="button" class="careers-filter" data-department-filter="${name}" aria-pressed="${i===0}">${name}</button>`).join('')}</div></div><p class="careers-listing__status" role="status" aria-live="polite" aria-atomic="true">4 role previews · All departments</p><div class="careers-grid">${cards}</div></div></section></main>${footer}`};
}

export function initializeCareersFilters() {
  const root = document.querySelector('.careers-listing');
  if (!root || root.dataset.filtersReady) return;
  root.dataset.filtersReady = 'true';
  const buttons = [...root.querySelectorAll('[data-department-filter]')];
  const cards = [...root.querySelectorAll('[data-department]')];
  const status = root.querySelector('[role=status]');
  const apply = (value, updateUrl=false) => {
    const selected = departments.includes(value) ? value : 'All';
    buttons.forEach(button=>button.setAttribute('aria-pressed', String(button.dataset.departmentFilter===selected)));
    let count = 0;
    cards.forEach(card=>{card.hidden=selected!=='All' && card.dataset.department!==selected;if(!card.hidden)count++;});
    status.textContent=`${count} ${count===1?'role preview':'role previews'} · ${selected==='All'?'All departments':selected}`;
    if(updateUrl){const url=new URL(location.href);selected==='All'?url.searchParams.delete('department'):url.searchParams.set('department',selected);history.replaceState(null,'',url);}
    window.dispatchEvent(new Event('resize'));
  };
  buttons.forEach(button=>button.addEventListener('click',()=>apply(button.dataset.departmentFilter,true)));
  apply(new URLSearchParams(location.search).get('department'));
}
