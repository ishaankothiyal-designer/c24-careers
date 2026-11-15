import { roleDetailPage } from '../role-detail.js';
import { routePath, siteLinks } from '../site-routing.js';
import { initializeCraftButtons } from './craft-buttons.js';
import { loadLiveRole } from './live-role.js';
import { getLiveJobs } from './live-jobs.js';
import { initializeRoleCarousel } from './role-carousel.js';

import {popupShellHtml,popupCloseIcon as closeIcon} from './popup-shell.js';
const rolePath=id=>`/careers/roles/${encodeURIComponent(id)}/`;
export function initializeRoleDialog({base='/',initialPath=null,loadJobs=getLiveJobs,loadRole=loadLiveRole}={}) {
  if(document.querySelector('[data-role-dialog]'))return;
  const dialog=document.createElement('dialog');
  dialog.className='role-dialog role-carousel-dialog';dialog.dataset.roleDialog='';
  dialog.setAttribute('aria-label','Explore open roles');dialog.setAttribute('data-lenis-prevent','');
  dialog.innerHTML=popupShellHtml({title:'Find a problem to own',closeLabel:'Close role details',label:'Job openings',previousLabel:'Previous role',nextLabel:'Next role',retry:true});
  document.body.append(dialog);
  const track=dialog.querySelector('.role-carousel__track'), previous=dialog.querySelector('[data-role-previous]'), next=dialog.querySelector('[data-role-next]'), position=dialog.querySelector('[data-role-position]'), hint=dialog.querySelector('[data-role-hint]'), retry=dialog.querySelector('[data-role-list-retry]');
  const application=document.createElement('dialog');
  application.className='role-application-dialog';application.dataset.roleApplicationDialog='';application.setAttribute('aria-labelledby','role-application-dialog-title');application.setAttribute('data-lenis-prevent','');
  application.innerHTML=`<header class="role-application-dialog__head"><div><p>Application</p><h2 id="role-application-dialog-title"></h2></div><button type="button" class="role-application-dialog__close" aria-label="Back to role details">${closeIcon}</button></header><div class="role-application-dialog__body role-detail" data-lenis-prevent></div>`;
  document.body.append(application);
  const applicationBody=application.querySelector('.role-application-dialog__body');
  let trigger,pushed=false,previousOverflow,previousTitle,restartScroll=false,active=0,entries=[],currentPath,session=0,applicationEntry,applicationTrigger;
  const cache=new Map();
  const urlFor=path=>base+path.slice(1);
  const closeApplication=(restore=true)=>{
    if(!application.open)return;
    application.close();applicationEntry?.application?.remove();applicationEntry=undefined;
    if(restore)applicationTrigger?.focus({preventScroll:true});
  };
  const openApplication=(entry,button)=>{
    if(!entry.application)return;
    applicationEntry=entry;applicationTrigger=button;
    application.querySelector('#role-application-dialog-title').textContent=entry.job.title;
    applicationBody.replaceChildren(entry.application);applicationBody.scrollTop=0;
    application.showModal();application.querySelector('button').focus({preventScroll:true});
  };
  const updateControls=()=>{
    previous.disabled=active<=0;next.disabled=active>=entries.length-1;
    const entry=entries[active];if(!entry)return;
    position.textContent=`${active+1} of ${entries.length}${entry.job?.title?' · '+entry.job.title:''}`;
    hint.hidden=entries.length<2;
    dialog.setAttribute('aria-labelledby',entry.headingId);
    if(entry.job)document.title=`${entry.job.title} | Cars24 Careers`;
  };
  const ensureLoaded=entry=>{
    if(entry.started)return;entry.started=true;
    const liveId=entry.path.match(/\/roles\/(a[a-f0-9]{12,32})\//)?.[1];
    if(!liveId){entry.footer.hidden=true;return;}
    entry.controller=new AbortController();
    const loaded=job=>{
      if(entry.controller.signal.aborted)return;
      entry.job=job;
      entry.body.querySelector('[data-application-jump]')?.remove();
      const section=entry.body.querySelector('.role-detail__application');
      if(section){section.remove();entry.application=section;}
      const form=section?.querySelector('[data-application-form]');
      const supported=!!form&&form.dataset.applicationBlocked!=='true';
      entry.footer.replaceChildren();
      const copy=document.createElement('p');copy.textContent=job.title;entry.footer.append(copy);
      const action=document.createElement('button');action.type='button';action.className='role-carousel__apply';
      action.textContent=supported?'Apply for this role ↗':'Applications unavailable';action.disabled=!supported;
      if(supported)action.addEventListener('click',()=>openApplication(entry,action));
      else {const note=document.createElement('span');note.className='role-carousel__availability';note.textContent='Applications for this role are not available on this page yet.';entry.footer.append(note);}
      entry.footer.append(action);entry.footer.hidden=false;
      for(const node of entry.body.querySelectorAll('[id]')) {
        if(node.id===entry.headingId)continue;
        const old=node.id;node.id=`${old}-${entry.headingId}`;
        for(const element of entry.body.querySelectorAll('[aria-labelledby],[aria-describedby],[aria-controls],label[for]')) {
          for(const attr of ['aria-labelledby','aria-describedby','aria-controls','for']) {
            const value=element.getAttribute(attr);
            if(value)element.setAttribute(attr,value.split(/\s+/).map(id=>id===old?node.id:id).join(' '));
          }
        }
      }
      if(entries[active]===entry)updateControls();
    };
    entry.loading=loadRole(entry.body,liveId,entry.controller.signal,{updateTitle:false,onLoaded:loaded}).then(job=>{
      if(!entry.controller.signal.aborted&&!job)entry.footer.hidden=true;
    });
  };
  const select=(index,updateHistory=true)=>{
    if(!entries.length)return;
    active=Math.max(0,Math.min(entries.length-1,index));
    const entry=entries[active];currentPath=entry.path;
    ensureLoaded(entry);
    for(const i of [active-1,active+1])if(entries[i])ensureLoaded(entries[i]);
    if(updateHistory&&dialog.open)history.replaceState({roleDialog:pushed},'',urlFor(entry.path));
    updateControls();
  };
  const carousel=initializeRoleCarousel(track,{onChange:index=>select(index)});
  const createEntry=path=>{
    if(cache.has(path))return cache.get(path);
    const page=roleDetailPage(path,'','');if(!page)return null;
    const headingId=`role-dialog-title-${cache.size}`;
    const slide=document.createElement('article');slide.className='role-carousel__slide';slide.setAttribute('role','group');slide.setAttribute('aria-roledescription','slide');
    const reading=document.createElement('div');reading.className='role-carousel__reading';reading.setAttribute('data-lenis-prevent-vertical','');
    const body=document.createElement('div');body.className='role-detail';
    body.innerHTML=siteLinks(page.html.replace(/^<main[^>]*>/,'').replace(/<\/main>$/,'').replace(/id="(?:role-title|role-dialog-title)"/g,`id="${headingId}"`).replace(/aria-labelledby="role-title"/g,`aria-labelledby="${headingId}"`).replace('<h1>Role not found.</h1>',`<h1 id="${headingId}">Role not found.</h1>`).replace(/<a class="role-detail__back" href="\/careers\/">← All roles<\/a>/,''),base);
    reading.append(body);
    const footer=document.createElement('footer');footer.className='role-carousel__action';footer.hidden=true;
    slide.append(reading,footer);
    const entry={path,slide,body,reading,footer,headingId,clearButtons:initializeCraftButtons(body)};
    cache.set(path,entry);return entry;
  };
  const mount=(paths,path)=>{
    const unique=[...new Set(paths)];if(!unique.includes(path))unique.unshift(path);
    entries=unique.map(createEntry).filter(Boolean);
    track.replaceChildren(...entries.map(entry=>entry.slide));
    active=Math.max(0,entries.findIndex(entry=>entry.path===path));
    carousel.refresh(active);select(active,false);
  };
  const loadDeck=async(path,token)=>{
    try {
      const jobs=await loadJobs();
      if(token!==session||!dialog.open)return;
      hint.textContent='Swipe or use the arrows to explore';
      mount(jobs.map(job=>rolePath(job.id)),currentPath||path);retry.hidden=true;
    } catch {
      if(token!==session||!dialog.open)return;
      retry.hidden=false;hint.hidden=false;hint.textContent='Other roles couldn’t load.';
    }
  };
  const open=(path,source,updateHistory=true)=>{
    const page=roleDetailPage(path,'','');if(!page)return false;
    path=path.endsWith('/')?path:path+'/';
    closeApplication(false);
    const fresh=!dialog.open;
    if(fresh){
      trigger=source||document.activeElement;previousOverflow=document.body.style.overflow;previousTitle=document.title;
      document.body.style.overflow='hidden';restartScroll=window.lenis&&!window.lenis.isStopped;window.lenis?.stop?.();
      retry.hidden=true;hint.textContent='Swipe or use the arrows to explore';
      dialog.showModal();session++;
    }
    currentPath=path;
    if(updateHistory){if(fresh){history.pushState({roleDialog:true},'',urlFor(path));pushed=true;}else history.replaceState({roleDialog:pushed},'',urlFor(path));}
    const index=entries.findIndex(entry=>entry.path===path);
    if(index>=0){carousel.go(index,true);select(index,false);}else mount([path],path);
    document.title=cache.get(path)?.job?`${cache.get(path).job.title} | Cars24 Careers`:page.title;
    dialog.querySelector('.role-dialog__close').focus({preventScroll:true});
    if(fresh&&/\/roles\/a[a-f0-9]{12,32}\//.test(path))loadDeck(path,session);
    return true;
  };
  const dismiss=(updateHistory=true)=>{
    if(!dialog.open)return;
    closeApplication(false);session++;
    for(const entry of cache.values()){entry.controller?.abort();entry.clearButtons?.();}
    cache.clear();entries=[];currentPath=null;track.replaceChildren();
    dialog.close();document.body.style.overflow=previousOverflow;
    if(restartScroll)window.lenis?.start?.();document.title=previousTitle;
    if(updateHistory){if(pushed)history.back();else history.replaceState(null,'',`${base}careers/`);}
    pushed=false;if(trigger?.isConnected)trigger.focus({preventScroll:true});
  };
  previous.addEventListener('click',()=>carousel.go(active-1));next.addEventListener('click',()=>carousel.go(active+1));
  retry.addEventListener('click',()=>{hint.textContent='Swipe or use the arrows to explore';loadDeck(currentPath,session);});
  dialog.querySelector('.role-dialog__close').addEventListener('click',()=>dismiss());
  application.querySelector('button').addEventListener('click',()=>closeApplication());
  application.addEventListener('cancel',event=>{event.preventDefault();closeApplication();});
  application.addEventListener('click',event=>{if(event.target===application){const r=application.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeApplication();}});
  dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
  dialog.addEventListener('click',event=>{
    if(event.target===dialog){dismiss();return;}
    if(!event.target.classList.contains('role-carousel__track'))return;
    // Inert neighbor previews retarget taps to the track. Treat their visible
    // area as navigation; only the actual gap is a backdrop dismissal.
    const index=entries.findIndex(entry=>{
      const r=entry.slide.getBoundingClientRect();
      return event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom;
    });
    if(index>=0)carousel.go(index);else dismiss();
  });
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest('a[href]');if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
    const url=new URL(link.href,location.href);if(url.origin!==location.origin)return;
    const path=routePath(url.pathname,base);if(!roleDetailPage(path,'',''))return;
    event.preventDefault();event.stopImmediatePropagation();open(path,link);
  },true);
  window.addEventListener('popstate',()=>{
    const path=routePath(location.pathname,base);
    if(roleDetailPage(path,'','')){pushed=Boolean(history.state?.roleDialog);open(path,trigger,false);}else dismiss(false);
  });
  if(initialPath)open(initialPath,null,false);
}
