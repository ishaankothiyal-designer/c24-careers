// Geometry only: native touch scrolling owns gesture direction and momentum.
export function nearestRoleIndex(positions, left) {
  if (!positions.length) return -1;
  return positions.reduce((best, position, index) => Math.abs(position-left) < Math.abs(positions[best]-left) ? index : best, 0);
}
export function initializeRoleCarousel(track, {onChange, reduce = matchMedia('(prefers-reduced-motion: reduce)'), viewport = window} = {}) {
  let active=0, frame=0, drag=null, dragged=false;
  const slides=()=>[...track.children];
  const positions=()=>{const items=slides(),start=items[0]?.offsetLeft||0;return items.map(item=>item.offsetLeft-start);};
  const select=index=>{
    const items=slides();
    if(!items.length)return;
    index=Math.max(0,Math.min(items.length-1,index));
    items.forEach((slide,i)=>{slide.inert=i!==index;slide.setAttribute('aria-hidden',String(i!==index));});
    if(index!==active){active=index;onChange?.(index);}
  };
  const update=()=>{frame=0;select(nearestRoleIndex(positions(),track.scrollLeft));};
  const scroll=()=>{if(!frame)frame=viewport.requestAnimationFrame(update);};
  const go=(index,instant=false)=>{
    const items=slides();if(!items.length)return;
    index=Math.max(0,Math.min(items.length-1,index));
    select(index);
    track.scrollTo({left:positions()[index],behavior:instant||reduce.matches?'instant':'smooth'});
  };
  const key=event=>{
    if(event.target!==track || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    go(event.key==='Home'?0:event.key==='End'?slides().length-1:active+(event.key==='ArrowRight'?1:-1));
  };
  const down=event=>{
    if(event.pointerType!=='mouse'||event.button!==0||event.target.closest('a,button,input,select,textarea,summary'))return;
    dragged=false;drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:track.scrollLeft,moving:false};
  };
  const move=event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.moving){
      if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>10){drag=null;return;}
      if(Math.abs(dx)<10)return;
      drag.moving=true;dragged=true;track.setPointerCapture(event.pointerId);
      track.classList.add('is-dragging');track.style.scrollSnapType='none';
    }
    event.preventDefault();track.scrollLeft=drag.left-dx;
  };
  const up=event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const moved=drag.moving;drag=null;
    track.classList.remove('is-dragging');track.style.scrollSnapType='';
    if(track.hasPointerCapture(event.pointerId))track.releasePointerCapture(event.pointerId);
    if(moved)go(nearestRoleIndex(positions(),track.scrollLeft));
  };
  const click=event=>{if(dragged){event.preventDefault();event.stopPropagation();dragged=false;}};
  track.addEventListener('scroll',scroll,{passive:true});track.addEventListener('keydown',key);
  track.addEventListener('pointerdown',down);track.addEventListener('pointermove',move);track.addEventListener('pointerup',up);track.addEventListener('pointercancel',up);track.addEventListener('click',click,true);
  const resize=new ResizeObserver(()=>go(active,true));resize.observe(track);
  return {go,refresh(index=active){active=index;go(index,true);},destroy(){
    viewport.cancelAnimationFrame(frame);resize.disconnect();
    for(const [name,handler] of [['scroll',scroll],['keydown',key],['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up]])track.removeEventListener(name,handler);
    track.removeEventListener('click',click,true);
  }};
}
