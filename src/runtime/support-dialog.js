import programmes from '../support-programmes.json' with {type:'json'};
import {escape} from './live-jobs.js';

export const supportProgramme = id => programmes.find(programme => programme.id === id);
export const requestSupport = (id, trigger) => document.dispatchEvent(new CustomEvent('open-support-programme',{detail:{id,trigger}}));
export function supportProgrammeHtml(programme) {
  const photos=programme.photos||[], hero=photos[0]||{src:programme.image,alt:''};
  return `<div class="support-dialog__media"><img src="${escape(hero.src)}" alt="${escape(hero.alt)}" width="1280" height="720"></div><div class="support-dialog__copy"><p class="support-dialog__eyebrow">${escape(programme.eyebrow)}</p><h2 id="support-dialog-title" data-no-roll>${escape(programme.title)}</h2><p class="support-dialog__summary">${escape(programme.summary)}</p><p>${escape(programme.body)}</p><ul>${programme.details.map(detail=>`<li>${escape(detail)}</li>`).join('')}</ul>${photos.length>1?`<div class="support-dialog__gallery">${photos.slice(1).map(photo=>`<img src="${escape(photo.src)}" alt="${escape(photo.alt)}" loading="lazy" width="1280" height="720">`).join('')}</div>`:''}<p class="support-dialog__note">${escape(programme.note)}</p></div>`;
}
export function initializeSupportDialog() {
  if(document.querySelector('[data-support-dialog]'))return;
  const dialog=document.createElement('dialog');
  dialog.className='support-dialog';dialog.dataset.supportDialog='';
  dialog.setAttribute('aria-labelledby','support-dialog-title');
  dialog.innerHTML='<button class="support-dialog__close" type="button" aria-label="Close programme details">×</button><div class="support-dialog__body" data-lenis-prevent></div>';
  document.body.append(dialog);
  const body=dialog.querySelector('.support-dialog__body');
  let trigger,previousOverflow,controller,restart;
  document.addEventListener('open-support-programme',event=>{
    const programme=supportProgramme(event.detail.id);
    if(!programme)return;
    body.innerHTML=supportProgrammeHtml(programme);body.scrollTop=0;
    if(!dialog.open){
      trigger=event.detail.trigger||document.activeElement;
      previousOverflow=document.documentElement.style.overflow;
      controller=window.lenis;restart=controller&&!controller.isStopped;
      controller?.stop?.();document.documentElement.style.overflow='hidden';
      dialog.showModal();
    }
    dialog.querySelector('button').focus();
  });
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const r=dialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
  });
  dialog.addEventListener('close',()=>{
    document.documentElement.style.overflow=previousOverflow||'';
    if(restart)controller?.start?.();
    body.innerHTML='';trigger?.focus({preventScroll:true});
  });
}
export function initializeBuilderSelection() {
  const root=document.querySelector('#builder'),button=root?.querySelector('[data-builder-selection]');
  if(!button||button.dataset.ready)return;
  button.dataset.ready='true';
  button.addEventListener('click',()=>{
    const expanded=button.getAttribute('aria-expanded')!=='true';
    root.querySelectorAll('[data-additional-builder]').forEach(card=>{card.hidden=!expanded;});
    button.setAttribute('aria-expanded',String(expanded));
    button.textContent=expanded?'Show selected builder stories ↗':'Show all builder stories ↗';
    root.dispatchEvent(new Event('reel-content-change'));
  });
}
