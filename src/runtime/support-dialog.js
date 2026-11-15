import {createContentPopup} from './content-popup.js';
import programmes from '../support-programmes.json' with {type:'json'};
import {escape} from './live-jobs.js';

export const supportProgramme = id => programmes.find(programme => programme.id === id);
export const requestSupport = (id, trigger) => document.dispatchEvent(new CustomEvent('open-support-programme',{detail:{id,trigger}}));
export function supportProgrammeHtml(programme) {
  const photos=programme.photos||[], hero=photos[0]||{src:programme.image,alt:''};
  return `<div class="support-dialog__media"><img src="${escape(hero.src)}" alt="${escape(hero.alt)}" width="1280" height="720"></div><div class="support-dialog__copy"><p class="support-dialog__eyebrow">${escape(programme.eyebrow)}</p><h2 id="support-dialog-title" data-no-roll>${escape(programme.title)}</h2><p class="support-dialog__summary">${escape(programme.summary)}</p><p>${escape(programme.body)}</p><ul class="support-benefits" aria-label="Programme highlights">${programme.details.map(detail=>`<li>${escape(detail)}</li>`).join('')}</ul>${photos.length>1?`<div class="support-dialog__gallery">${photos.slice(1).map(photo=>`<img src="${escape(photo.src)}" alt="${escape(photo.alt)}" loading="lazy" width="1280" height="720">`).join('')}</div>`:''}<p class="support-dialog__note">${escape(programme.note)}</p></div>`;
}
export function initializeSupportDialog() {
  if(document.querySelector('[data-support-dialog]'))return;
  const popup=createContentPopup({label:'Support programmes',title:'The support behind the work',closeLabel:'Close programme details',previousLabel:'Previous programme',nextLabel:'Next programme',
    items:programmes.map(programme=>({id:programme.id,label:programme.title,headingId:`${programme.id}-support-dialog-title`,html:()=>supportProgrammeHtml(programme)})),
  });
  popup.dialog.dataset.supportDialog='';popup.dialog.classList.add('support-popup');
  document.addEventListener('open-support-programme',event=>popup.open(event.detail.id,event.detail.trigger));
}
export function initializeBuilderSelection() {
  const root=document.querySelector('#builder'),button=root?.querySelector('[data-builder-selection]');
  if(!button||button.dataset.ready)return;
  button.dataset.ready='true';
  button.addEventListener('click',()=>{
    if(button.hidden)return;
    const additional=[...root.querySelectorAll('[data-additional-builder]')];
    additional.forEach(card=>{card.hidden=false;});
    button.hidden=true;button.setAttribute('aria-expanded','true');
    root.dispatchEvent(new Event('reel-content-change'));
    if(additional[0]){
      root.dispatchEvent(new CustomEvent('reel-reveal-card',{detail:{card:additional[0]}}));
      additional[0].focus({preventScroll:true});
    }
  });
}
