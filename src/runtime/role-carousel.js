// Shared popup drag and snap logic; touch panning stays native.
export function nearestRoleIndex(positions, left) {
  if (!positions.length) return -1;
  return positions.reduce((best, position, index) => Math.abs(position-left) < Math.abs(positions[best]-left) ? index : best, 0);
}
export function initializeRoleCarousel(track, {onChange, reduce = matchMedia('(prefers-reduced-motion: reduce)'), viewport = window} = {}) {
  let active=0, frame=0, gestureFrame=0, pending=null, drag=null, touch=null, dragged=false;
  const intentDistance=6, commitDistance=18;
  const slides=()=>[...track.children];
  const positions=()=>{const items=slides(),start=items[0]?.offsetLeft||0;return items.map(item=>item.offsetLeft-start);};
  const select=index=>{
    const items=slides();
    if(!items.length)return;
    index=Math.max(0,Math.min(items.length-1,index));
    items.forEach((slide,i)=>{slide.inert=i!==index;slide.setAttribute('aria-hidden',String(i!==index));});
    if(index!==active){active=index;onChange?.(index);}
  };
  const update=()=>{
    frame=0;
    if(pending!==null){
      if(Math.abs(track.scrollLeft-positions()[pending])>2)return;
      pending=null;
    }
    select(nearestRoleIndex(positions(),track.scrollLeft));
  };
  const scroll=()=>{if(!frame)frame=viewport.requestAnimationFrame(update);};
  const go=(index,instant=false)=>{
    const items=slides();if(!items.length)return;
    index=Math.max(0,Math.min(items.length-1,index));
    pending=instant||reduce.matches?null:index;
    select(index);
    track.scrollTo({left:positions()[index],behavior:instant||reduce.matches?'instant':'smooth'});
  };
  const key=event=>{
    if(event.target!==track || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    go(event.key==='Home'?0:event.key==='End'?slides().length-1:active+(event.key==='ArrowRight'?1:-1));
  };
  const interactive=target=>target.isContentEditable||target.closest?.('a,button,input,select,textarea,summary');
  const start=()=>{
    viewport.cancelAnimationFrame(gestureFrame);gestureFrame=0;pending=null;
    track.scrollTo({left:track.scrollLeft,behavior:'instant'});
    const index=nearestRoleIndex(positions(),track.scrollLeft);select(index);
    return index;
  };
  const finish=(gesture,dx,dy,cancelled=false)=>{
    const nearest=nearestRoleIndex(positions(),track.scrollLeft);
    const horizontal=Math.abs(dx)>=commitDistance&&Math.abs(dx)>Math.abs(dy)*1.2;
    if(!cancelled&&horizontal){
      const direction=dx<0?1:-1;
      go(direction>0?Math.max(gesture.index+1,nearest):Math.min(gesture.index-1,nearest));
    }else go(nearest);
  };
  const down=event=>{
    dragged=false;
    if(!['mouse','pen'].includes(event.pointerType)||event.button!==0||interactive(event.target))return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:track.scrollLeft,index:start(),moving:false};
  };
  const move=event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.moving){
      if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>intentDistance){drag=null;return;}
      if(Math.abs(dx)<intentDistance||Math.abs(dx)<Math.abs(dy)*1.2)return;
      drag.moving=true;dragged=true;track.setPointerCapture(event.pointerId);
      track.classList.add('is-dragging');track.style.scrollSnapType='none';
    }
    event.preventDefault();track.scrollLeft=drag.left-dx;
  };
  const up=event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const gesture=drag;drag=null;
    track.classList.remove('is-dragging');track.style.scrollSnapType='';
    if(track.hasPointerCapture(event.pointerId))track.releasePointerCapture(event.pointerId);
    if(gesture.moving)finish(gesture,event.clientX-gesture.x,event.clientY-gesture.y,event.type!=='pointerup');
  };
  // Native touch owns direction, momentum, vertical reading and pinch zoom.
  // A small deliberate horizontal flick only adjusts the final snap destination.
  const touchStart=event=>{
    dragged=false;touch=null;
    if(event.touches.length!==1||interactive(event.target))return;
    const point=event.touches[0];
    touch={id:point.identifier,x:point.clientX,y:point.clientY,index:start()};
  };
  const touchMove=event=>{if(event.touches.length!==1)touch=null;};
  const touchEnd=event=>{
    if(!touch)return;
    const gesture=touch;touch=null;
    const point=[...event.changedTouches].find(point=>point.identifier===gesture.id);
    if(!point||event.touches.length)return;
    const dx=point.clientX-gesture.x,dy=point.clientY-gesture.y;
    if(Math.abs(dx)<commitDistance||Math.abs(dx)<=Math.abs(dy)*1.2)return;
    dragged=true;
    gestureFrame=viewport.requestAnimationFrame(()=>{gestureFrame=0;finish(gesture,dx,dy);});
  };
  const touchCancel=()=>{touch=null;};
  const nativeDrag=event=>{if(drag)event.preventDefault();};
  const settled=()=>{pending=null;scroll();};
  const click=event=>{if(dragged){event.preventDefault();event.stopPropagation();dragged=false;}};
  track.addEventListener('scroll',scroll,{passive:true});track.addEventListener('keydown',key);
  track.addEventListener('pointerdown',down);track.addEventListener('pointermove',move);track.addEventListener('pointerup',up);track.addEventListener('pointercancel',up);track.addEventListener('lostpointercapture',up);track.addEventListener('click',click,true);
  track.addEventListener('touchstart',touchStart,{passive:true});track.addEventListener('touchmove',touchMove,{passive:true});track.addEventListener('touchend',touchEnd,{passive:true});track.addEventListener('touchcancel',touchCancel,{passive:true});track.addEventListener('dragstart',nativeDrag);track.addEventListener('scrollend',settled);
  const resize=new ResizeObserver(()=>go(active,true));resize.observe(track);
  return {go,refresh(index=active){active=index;go(index,true);},destroy(){
    viewport.cancelAnimationFrame(frame);viewport.cancelAnimationFrame(gestureFrame);resize.disconnect();
    for(const [name,handler] of [['scroll',scroll],['keydown',key],['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['lostpointercapture',up]])track.removeEventListener(name,handler);
    track.removeEventListener('click',click,true);
    for(const [name,handler] of [['touchstart',touchStart],['touchmove',touchMove],['touchend',touchEnd],['touchcancel',touchCancel],['dragstart',nativeDrag],['scrollend',settled]])track.removeEventListener(name,handler);
  }};
}
