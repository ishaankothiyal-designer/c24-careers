import {builderDetailPage} from '../builder-detail.js';
import stories from '../builder-stories.json' with {type:'json'};
import {routePath,siteLinks} from '../site-routing.js';
import {createContentPopup} from './content-popup.js';

export function requestProject(href,trigger) {
  document.dispatchEvent(new CustomEvent('open-builder-project',{detail:{href,trigger}}));
}
export function initializeProjectDrawer({createPopup=createContentPopup}={}) {
  if(document.querySelector('[data-project-drawer]'))return;
  const base=document.querySelector('meta[name="site-base"]')?.content||'/';
  let sharedRoute=routePath(location.pathname,base).startsWith('/builders/');
  const initialSlug=routePath(location.pathname,base).match(/^\/builders\/([^/]+)\/?$/)?.[1];
  const items=stories.filter(story=>!['ishaan-kothiyal','mayank'].includes(story.slug)||story.slug===initialSlug).map(story=>({
    id:story.slug,label:story.name,headingId:`${story.slug}-story-title`,
    html:()=>siteLinks(builderDetailPage(`/builders/${story.slug}/`,'','').html.replace(/<main\b/,'<div').replace('</main>','</div>').replace(/<h2\b/g,'<h2 data-no-roll').replace(/<a\b/g,'<a data-transition-prevent'),base),
  }));
  const popup=createPopup({label:'Builder projects',title:'Ideas can come from anywhere',closeLabel:'Close project',previousLabel:'Previous project',nextLabel:'Next project',items,
    onSelect:item=>{if(sharedRoute&&routePath(location.pathname,base)!==`/builders/${item.id}/`)history.replaceState(history.state,'',`${base}builders/${item.id}/`);},
    onClose:()=>{if(sharedRoute){sharedRoute=false;history.replaceState(history.state,'',base+'#builders');}},
  });
  popup.dialog.dataset.projectDrawer='';popup.dialog.classList.add('builder-popup');
  const open=(href,trigger)=>{
    const url=new URL(href,location.href);if(url.origin!==new URL(location.href).origin)return;
    const path=routePath(url.pathname,base),match=path.match(/^\/builders\/([^/]+)\/?$/);
    if(match&&items.some(item=>item.id===match[1]))popup.open(match[1],trigger);
  };
  document.addEventListener('open-builder-project',event=>open(event.detail.href,event.detail.trigger));
  popup.dialog.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');
    if(!link||event.defaultPrevented||(event.button!=null&&event.button!==0)||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.hasAttribute?.('download')||(link.target&&link.target!=='_self'))return;
    const url=new URL(link.href,location.href);if(url.origin!==new URL(location.href).origin)return;
    const path=routePath(url.pathname,base);
    if(path.startsWith('/builders/')){
      const slug=path.match(/^\/builders\/([^/]+)\/?$/)?.[1];
      if(items.some(item=>item.id===slug)){event.preventDefault();event.stopPropagation();open(link.href);}
    }
    else if(['#builder','#builders'].includes(url.hash)){event.preventDefault();event.stopPropagation();popup.close();}
  });
  if(sharedRoute)open(location.href);
}
