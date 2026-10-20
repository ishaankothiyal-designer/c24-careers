// Design Society's published reveal: 8×8 cells, .4s randomized cover,
// swap to an individually illustrated portrait, .4s randomized uncover.
export function initializeBuilderPixels(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  document.querySelectorAll('#builder [data-builder-pixel-reveal]').forEach(media=>{
    if(media.dataset.pixelRevealInitialized)return;
    const source=media.dataset.builderPixelSrc,card=media.closest('article');
    if(!source||!card)return;
    media.dataset.pixelRevealInitialized='true';
    const portrait=new Image();
    portrait.className='builder-pixel-illustration';
    portrait.alt='';portrait.setAttribute('aria-hidden','true');portrait.decoding='async';
    const grid=document.createElement('span');grid.className='builder-pixel-grid';grid.setAttribute('aria-hidden','true');
    const blocks=Array.from({length:64},(_,i)=>{const block=document.createElement('i');block.style.left=`${i%8*12.5}%`;block.style.top=`${Math.floor(i/8)*12.5}%`;grid.append(block);return block;});
    media.append(portrait,grid);
    let active=false,wanted=false,hovered=false,focused=false,tapped=false,timers=[],revision=0,dragStart=null;
    // Decode before covering the photograph. A missing or invalid alternate never
    // conceals the original, including when the pointer arrives during loading.
    const ready=new Promise(resolve=>{
      portrait.onload=async()=>{try{await portrait.decode();resolve(true);}catch{resolve(false);}};
      portrait.onerror=()=>resolve(false);
      portrait.src=source;
    });
    function cancel(){timers.forEach(clearTimeout);timers=[];blocks.forEach(b=>b.style.display='none');}
    const shuffled=()=>{const order=[...blocks];for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}return order;};
    function swap(on){active=on;portrait.classList.toggle('is-active',on);media.dataset.pixelRevealActive=String(on);}
    async function transition(on){
      wanted=on;const current=++revision;cancel();
      if(on&&!await ready)return;
      if(current!==revision||wanted!==on)return;
      if(active===on)return;
      if(reduce.matches){swap(on);return;}
      shuffled().forEach((block,i)=>timers.push(setTimeout(()=>block.style.display='block',i*400/64)));
      timers.push(setTimeout(()=>swap(on),400));
      shuffled().forEach((block,i)=>timers.push(setTimeout(()=>block.style.display='none',400+i*400/64)));
    }
    const update=()=>transition(hovered||focused||tapped);
    // Keep the illustrated face visible across the photo, name and story copy.
    // The whole moving card owns hover, so crossing its internal elements does
    // not reverse the reveal while the user is reading.
    card.addEventListener('pointerenter',()=>{if(fine.matches){hovered=true;update();}});
    card.addEventListener('pointerleave',()=>{if(hovered){hovered=false;update();}});
    card.addEventListener('focusin',()=>{focused=true;update();});
    card.addEventListener('focusout',event=>{if(!card.contains(event.relatedTarget)){focused=false;update();}});
    // Track actual touch taps without cancelling or capturing carousel drags.
    media.addEventListener('pointerdown',event=>{if(!fine.matches&&event.isPrimary)dragStart={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};});
    window.addEventListener('pointermove',event=>{if(dragStart&&event.pointerId===dragStart.id&&Math.hypot(event.clientX-dragStart.x,event.clientY-dragStart.y)>=6)dragStart.moved=true;});
    window.addEventListener('pointerup',event=>{if(!dragStart||event.pointerId!==dragStart.id)return;const start=dragStart;dragStart=null;if(!start.moved&&Math.hypot(event.clientX-start.x,event.clientY-start.y)<6){tapped=!tapped;update();}});
    window.addEventListener('pointercancel',()=>dragStart=null);
    reduce.addEventListener('change',()=>transition(wanted));
  });
}
