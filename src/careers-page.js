// Reuse the homepage role cards so the listing has the same content and destinations.
const departments = ['Customer Experience', 'People', 'Operations', 'Engineering'];
export function careersPage(pathname, header, footer, roleSource) {
  if (!/^\/careers\/?$/.test(pathname)) return null;
  const cards = [...roleSource.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map(([html]) => {
    const department = html.match(/class="tier__chip"[^>]*>([^<]+)/)?.[1] || '';
    return html.replace('class="craft-work__card" tabindex="0"', `class="careers-card" data-department="${department}"`).replace('class="tier"', 'class="careers-card__inner"').replaceAll('role-card-', 'careers-role-');
  }).join('');
  return {html:`${header}<main class="careers-page"><section class="section careers-listing" aria-labelledby="careers-title"><div class="container"><div class="careers-listing__head"><h1 id="careers-title">Find your next role.</h1><div class="careers-filters" role="group" aria-label="Filter roles by department">${['All',...departments].map((name,i)=>`<button type="button" class="careers-filter" data-department-filter="${name}" aria-pressed="${i===0}">${name}</button>`).join('')}</div></div><p class="careers-listing__status" role="status" aria-live="polite" aria-atomic="true">4 roles · All departments</p><div class="careers-grid">${cards}</div></div></section></main>${footer}`};
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
    status.textContent=`${count} ${count===1?'role':'roles'} · ${selected==='All'?'All departments':selected}`;
    if(updateUrl){const url=new URL(location.href);selected==='All'?url.searchParams.delete('department'):url.searchParams.set('department',selected);history.replaceState(null,'',url);}
    window.dispatchEvent(new Event('resize'));
  };
  buttons.forEach(button=>button.addEventListener('click',()=>apply(button.dataset.departmentFilter,true)));
  apply(new URLSearchParams(location.search).get('department'));
}
