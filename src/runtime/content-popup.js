import {popupShellHtml} from './popup-shell.js';
import {initializeRoleCarousel} from './role-carousel.js';

// Shared native-dialog lifecycle and carousel behaviour for editorial details.
export function createContentPopup({label,title,closeLabel,previousLabel,nextLabel,items,onSelect,onClose}) {
  const dialog=document.createElement('dialog');
  dialog.className='role-carousel-dialog content-popup';
  dialog.setAttribute('aria-label',label);dialog.setAttribute('data-lenis-prevent','');
  dialog.innerHTML=popupShellHtml({label,title,closeLabel,previousLabel,nextLabel});
  document.body.append(dialog);
  const track=dialog.querySelector('.role-carousel__track'),previous=dialog.querySelector('[data-role-previous]'),next=dialog.querySelector('[data-role-next]'),position=dialog.querySelector('[data-role-position]');
  let active=0,trigger,overflow,controller,restart;
  const entries=new Map();
  const select=index=>{
    active=index;
    // Populate only the selected panel and its neighbors; source links stay intact.
    for(const i of [index-1,index,index+1]) {
      if(!items[i]||entries.has(i))continue;
      const body=track.children[i].firstElementChild;
      body.innerHTML=typeof items[i].html==='function'?items[i].html():items[i].html;
      for(const image of body.querySelectorAll('img'))image.draggable=false;
      // Each neighboring panel owns its IDs and fragment/ARIA references.
      const ids=new Map();
      for(const node of body.querySelectorAll('[id]')){const old=node.id;node.id=`${items[i].id}-${old}`;ids.set(old,node.id);}
      for(const node of body.querySelectorAll('[aria-labelledby],[aria-describedby],[aria-controls],[for],a[href^="#"]')){
        for(const attribute of ['aria-labelledby','aria-describedby','aria-controls','for']){
          const value=node.getAttribute(attribute);if(value)node.setAttribute(attribute,value.split(/\s+/).map(id=>ids.get(id)||id).join(' '));
        }
        const href=node.getAttribute('href');if(href?.startsWith('#')&&ids.has(href.slice(1)))node.setAttribute('href','#'+ids.get(href.slice(1)));
      }
      entries.set(i,body);
    }
    previous.disabled=index===0;next.disabled=index===items.length-1;
    position.textContent=items[index].label;
    dialog.setAttribute('aria-labelledby',items[index].headingId);
    onSelect?.(items[index]);
  };
  const carousel=initializeRoleCarousel(track,{onChange:select});
  const open=(id,opener)=>{
    const index=items.findIndex(item=>item.id===id);if(index<0)return;
    if(!dialog.open){
      trigger=opener||document.activeElement;overflow=document.documentElement.style.overflow;
      controller=window.lenis;restart=controller&&!controller.isStopped;
      controller?.stop?.();document.documentElement.style.overflow='hidden';
      track.replaceChildren();entries.clear();
      for(const item of items){
        const slide=document.createElement('article');slide.className='role-carousel__slide';
        const reading=document.createElement('div');reading.className='role-carousel__reading';reading.setAttribute('data-lenis-prevent','');
        slide.append(reading);track.append(slide);
      }
      dialog.showModal();
    }
    select(index);carousel.refresh(index);
    dialog.querySelector('.role-dialog__close').focus({preventScroll:true});
  };
  const close=()=>dialog.close();
  previous.addEventListener('click',()=>carousel.go(active-1));next.addEventListener('click',()=>carousel.go(active+1));
  dialog.querySelector('.role-dialog__close').addEventListener('click',close);
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog&&event.target!==track)return;
    const index=[...track.children].findIndex(slide=>{const r=slide.getBoundingClientRect();return event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom;});
    if(index>=0){if(index!==active)carousel.go(index);return;}
    close();
  });
  dialog.addEventListener('close',()=>{
    document.documentElement.style.overflow=overflow||'';if(restart)controller?.start?.();
    track.replaceChildren();entries.clear();onClose?.();trigger?.focus({preventScroll:true});
  });
  return {dialog,open,close};
}
