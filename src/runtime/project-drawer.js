import {builderDetailPage} from '../builder-detail.js';
import {routePath,siteLinks} from '../site-routing.js';

export function requestProject(href,trigger) {
  document.dispatchEvent(new CustomEvent('open-builder-project',{detail:{href,trigger}}));
}

export function initializeProjectDrawer() {
  if(document.querySelector('[data-project-drawer]'))return;
  const base=document.querySelector('meta[name="site-base"]')?.content || '/';
  const dialog=document.createElement('dialog');
  dialog.className='project-drawer';dialog.dataset.projectDrawer='';
  dialog.setAttribute('aria-labelledby','story-title');
  dialog.innerHTML='<button type="button" class="project-drawer__close" aria-label="Close project"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg></button><div class="project-drawer__content" data-lenis-prevent></div>';
  document.body.append(dialog);
  const body=dialog.querySelector('.project-drawer__content');
  let trigger,previousOverflow,scrollController,restartScroll,closeTimer;
  const animate=()=>typeof matchMedia==='function' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const close=()=>{
    if(!dialog.open || dialog.dataset.motion==='exit')return;
    if(!animate()){dialog.close();return;}
    // Start from the current position if the user dismisses during entry.
    if(typeof getComputedStyle==='function')dialog.style?.setProperty('--drawer-exit-from',getComputedStyle(dialog).transform);
    dialog.dataset.motion='exit';
    // Keep the modal and scroll lock until the exit ends; timer covers lost events.
    closeTimer=setTimeout(()=>{if(dialog.open)dialog.close();},300);
  };
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('animationend',event=>{
    if(event.target===dialog && event.animationName==='project-drawer-out' && dialog.dataset.motion==='exit')dialog.close();
  });
  const open=(href,opener)=>{
    const path=routePath(new URL(href,location.href).pathname,base);
    const page=builderDetailPage(path,'','');
    if(!page || page.title==='Builder story not found')return;
    if(closeTimer){clearTimeout(closeTimer);closeTimer=undefined;}
    if(dialog.dataset.motion==='exit')delete dialog.dataset.motion;
    body.innerHTML=siteLinks(page.html.replace(/<main\b/,'<div').replace('</main>','</div>').replace(/<h2\b/g,'<h2 data-no-roll').replace(/<a\b/g,'<a data-transition-prevent'),base);
    body.scrollTop=0;
    if(!dialog.open){
      trigger=opener || document.activeElement;previousOverflow=document.documentElement.style.overflow;
      scrollController=globalThis.window?.lenis;
      restartScroll=scrollController && !scrollController.isStopped;
      scrollController?.stop?.();
      document.documentElement.style.overflow='hidden';
      if(animate())dialog.dataset.motion='enter';
      dialog.showModal();
      dialog.querySelector('button').focus();
    } else body.querySelector?.('#story-title')?.focus({preventScroll:true});
  };
  document.addEventListener('open-builder-project',event=>open(event.detail.href,event.detail.trigger));
  dialog.querySelector('button').addEventListener('click',close);
  dialog.addEventListener('click',event=>{
    if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom)close();}
    const link=event.target.closest('a[href]');
    if(!link || event.defaultPrevented || (event.button != null && event.button !== 0) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute?.('download') || (link.target && link.target !== '_self'))return;
    const path=routePath(new URL(link.href,location.href).pathname,base);
    if(path.startsWith('/builders/')){event.preventDefault();event.stopPropagation();open(link.href);}
    else if(['#builder','#builders'].includes(new URL(link.href,location.href).hash)){event.preventDefault();event.stopPropagation();close();}
  });
  dialog.addEventListener('close',()=>{clearTimeout(closeTimer);closeTimer=undefined;delete dialog.dataset.motion;dialog.style?.removeProperty('--drawer-exit-from');document.documentElement.style.overflow=previousOverflow || '';if(restartScroll)scrollController?.start?.();body.innerHTML='';trigger?.focus({preventScroll:true});});
  // Existing shared project URLs still work, opening the same sidebar on home.
  if(routePath(location.pathname,base).startsWith('/builders/')) {
    const href=location.href;
    history.replaceState(null,'',base+'#builders');
    open(href);
  }
}
