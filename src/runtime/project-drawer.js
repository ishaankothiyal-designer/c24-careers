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
  dialog.setAttribute('aria-labelledby','project-drawer-title');
  dialog.innerHTML='<div class="project-drawer__bar"><span id="project-drawer-title">Builder project</span><button type="button" class="project-drawer__close" aria-label="Close project">Close <span aria-hidden="true">×</span></button></div><div class="project-drawer__content" data-lenis-prevent></div>';
  document.body.append(dialog);
  const body=dialog.querySelector('.project-drawer__content');
  let trigger,previousOverflow,scrollController,restartScroll;
  const close=()=>dialog.close();
  const open=(href,opener)=>{
    const path=routePath(new URL(href,location.href).pathname,base);
    const page=builderDetailPage(path,'','');
    if(!page || page.title==='Builder story not found')return;
    body.innerHTML=siteLinks(page.html.replace(/<main\b/,'<div').replace('</main>','</div>').replace(/<h2\b/g,'<h2 data-no-roll').replace(/<a\b/g,'<a data-transition-prevent'),base);
    body.scrollTop=0;
    if(!dialog.open){
      trigger=opener || document.activeElement;previousOverflow=document.documentElement.style.overflow;
      scrollController=globalThis.window?.lenis;
      restartScroll=scrollController && !scrollController.isStopped;
      scrollController?.stop?.();
      document.documentElement.style.overflow='hidden';dialog.showModal();
      dialog.querySelector('button').focus();
    }
  };
  document.addEventListener('open-builder-project',event=>open(event.detail.href,event.detail.trigger));
  dialog.querySelector('button').addEventListener('click',close);
  dialog.addEventListener('click',event=>{
    if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom)close();}
    const link=event.target.closest('a[href]');
    if(!link)return;
    const path=routePath(new URL(link.href,location.href).pathname,base);
    if(path.startsWith('/builders/')){event.preventDefault();event.stopPropagation();open(link.href);}
    else if(new URL(link.href,location.href).hash==='#builders'){event.preventDefault();event.stopPropagation();close();}
  });
  dialog.addEventListener('close',()=>{document.documentElement.style.overflow=previousOverflow || '';if(restartScroll)scrollController?.start?.();body.innerHTML='';trigger?.focus({preventScroll:true});});
  // Existing shared project URLs still work, opening the same sidebar on home.
  if(routePath(location.pathname,base).startsWith('/builders/')) {
    const href=location.href;
    history.replaceState(null,'',base+'#builders');
    open(href);
  }
}
