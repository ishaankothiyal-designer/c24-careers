// Footer-specific source behavior from Design Society's Slater + Webflow IX3.
// Reuse the existing GSAP/ScrollTrigger module; no second scrolling controller.
export async function initializeSocietyFooter() {
  const footer = document.querySelector('[data-society-footer]');
  if (!footer || footer.dataset.initialized) return;
  footer.dataset.initialized = 'true';
  const wrap = footer.closest('[data-society-footer-parallax]');
  const dark = wrap.querySelector('[data-society-footer-dark]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const title = footer.querySelector('.society-title');
  const words = [...title.querySelectorAll('.society-title-mask > span')];
  const letters = [...footer.querySelectorAll('[data-society-letter]')];
  let gsap, ScrollTrigger, Draggable, triggers = [], zIndex = 100;
  const addScript = src => new Promise((resolve, reject) => {
    const script = document.createElement('script'); script.src = src;
    script.onload = resolve; script.onerror = reject; document.head.append(script);
  });
  try {
    // Public recovered modules are referenced via native HTML module tags, as
    // with App's existing Base script; this also preserves browser module identity.
    const shared = await new Promise((resolve, reject) => {
      const eventName = 'society-footer-runtime-ready';
      addEventListener(eventName, event => resolve(event.detail), {once:true});
      const bridge = document.createElement('script'); bridge.type = 'module';
      bridge.src = '/vendor/society-footer/runtime-bridge.js';
      bridge.onerror = reject; document.head.append(bridge);
    });
    gsap = shared.gsap; ScrollTrigger = shared.ScrollTrigger; gsap.registerPlugin(ScrollTrigger);
    if (!window.gsap) window.gsap = gsap;
    if (!window.ScrollTrigger) window.ScrollTrigger = ScrollTrigger;
    await Promise.all([
      window.Draggable ? Promise.resolve() : addScript('/vendor/society-footer/Draggable.min.js'),
      window.ScrambleTextPlugin ? Promise.resolve() : addScript('/vendor/society-footer/ScrambleTextPlugin.min.js'),
    ]);
    Draggable = window.Draggable; gsap.registerPlugin(Draggable, window.ScrambleTextPlugin);
  } catch (error) {
    footer.classList.add('society-motion-fallback'); dark.style.opacity='0';
    footer.dataset.motionState = 'fallback';
    console.warn('Footer motion unavailable; showing static footer.', error.message);
    return;
  }
  footer.dataset.motionState = 'ready'; footer.dataset.gsapVersion = gsap.version;

  const labelReveals = [...footer.querySelectorAll('.society-window-handle')].map(handle => {
    const label = handle.firstElementChild, holder = document.createElement('span'), mask = document.createElement('span');
    holder.className = 'society-window-label-reveal'; mask.className = 'society-window-label-mask'; mask.setAttribute('aria-hidden','true');
    label.before(holder); holder.append(label,mask); return {label,holder,mask};
  });

  // Published initFooterParallax: entire footer -55% -> 0, power1.in.
  // IX3 mapping is data-animation, not the unrelated initTitleReveal helper.
  function configureMotion() {
    triggers.forEach(tween => {tween.scrollTrigger?.kill();tween.kill();}); triggers = [];
    gsap.killTweensOf([footer, dark, title, ...words, ...letters]);
    if (reduce.matches) {
      gsap.set(footer, {yPercent:0}); gsap.set(dark, {opacity:0});
      gsap.set(words, {y:0,yPercent:0,opacity:1}); gsap.set(letters, {yPercent:0,opacity:1});
      gsap.set(title, {clearProps:'transform'}); labelReveals.forEach(({label,mask})=>{gsap.set(label,{autoAlpha:1});gsap.set(mask,{scaleX:0});}); footer.dataset.parallaxProgress = '1.000'; return;
    }
    const parallax = gsap.timeline({scrollTrigger:{trigger:wrap,start:'clamp(top bottom)',end:'clamp(top top)',scrub:true,invalidateOnRefresh:true,onUpdate:self=>{footer.dataset.parallaxProgress=self.progress.toFixed(3);}}});
    parallax.fromTo(footer,{yPercent:-55},{yPercent:0,ease:'power1.in'});
    parallax.fromTo(dark,{opacity:.3},{opacity:0,ease:'power1.in'},'<'); triggers.push(parallax);
    triggers.push(gsap.fromTo(words,{opacity:0,y:0,yPercent:100},{opacity:1,y:0,yPercent:0,duration:.45,stagger:.05,ease:'power1.in',scrollTrigger:{trigger:title,start:'clamp(top bottom)',end:'clamp(bottom top)',scrub:.8,invalidateOnRefresh:true}}));
    letters.forEach(letter=>triggers.push(gsap.fromTo(letter,{opacity:1,yPercent:-40},{yPercent:0,duration:.45,ease:'power1.in',scrollTrigger:{trigger:letter,start:'clamp(top bottom)',end:'clamp(bottom top)',scrub:.8,invalidateOnRefresh:true}})));
    // Footer window labels carry the source data-effect=swipe-reveal mapping.
    labelReveals.forEach(({label,holder,mask})=>{
      gsap.set(label,{autoAlpha:0});gsap.set(mask,{scaleX:0,transformOrigin:'left'});
      const reveal=gsap.timeline({scrollTrigger:{trigger:holder,start:'top 80%',toggleActions:'play none none reverse'}});
      reveal.to(mask,{duration:.5,scaleX:1,transformOrigin:'left',ease:'power2.inOut'}).set(label,{autoAlpha:1}).to(mask,{duration:.5,scaleX:0,transformOrigin:'right',ease:'power2.inOut'});
      triggers.push(reveal);
    });
    ScrollTrigger.refresh();
  }
  configureMotion();
  // Same pointer deformation parameters as source, including return curve.
  title.addEventListener('pointermove', event => {
    if (reduce.matches || event.pointerType === 'touch') return;
    const rect = title.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width/2)/(rect.width/2);
    const y = (event.clientY - rect.top - rect.height/2)/(rect.height/2);
    title.style.transition = 'transform .1s ease-out';
    title.style.transform = `perspective(1000px) scale(1.05) rotateX(${-y*15}deg) rotateY(${x*15}deg) skew(${x*5}deg, ${y*5}deg)`;
  });
  title.addEventListener('pointerleave', () => {
    title.style.transition = 'transform .6s cubic-bezier(.25,1,.5,1)';
    title.style.transform = 'perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg) skew(0deg,0deg)';
  });

  // Original scramble plugin: enter 1.2s, leave 1s (rather than instant reset).
  const scrambleLabels = [];
  footer.querySelectorAll('[data-society-scramble]').forEach(link => {
    const label = link.querySelector('span'), original = label.textContent;
    scrambleLabels.push({label, original});
    link.setAttribute('aria-label',original.replace(/[\[\]]/g,'')); label.setAttribute('aria-hidden','true');
    const scramble = duration => {
      gsap.killTweensOf(label);
      if (reduce.matches) { label.textContent=original; return; }
      gsap.to(label,{duration,scrambleText:{text:original,chars:'ABCDEFGHIJKLMNOPQRSTUVWXYZ&@#',...(duration===1?{speed:1}:{})}});
    };
    link.addEventListener('pointerenter',()=>scramble(1.2)); link.addEventListener('pointerleave',()=>scramble(1));
    link.addEventListener('focus',()=>scramble(1.2)); link.addEventListener('blur',()=>scramble(1));
  });

  // Source stickers drag as whole windows, with magnetism + lift + velocity tilt.
  footer.querySelectorAll('[data-society-window]').forEach(panel => {
    const handle=panel.querySelector('[data-society-drag]');
    gsap.set(panel,{xPercent:0,yPercent:0});
    const [drag]=Draggable.create(panel,{bounds:document.body,dragResistance:.1,minimumMovement:8,allowEventDefault:true,zIndexBoost:false,dragClickables:false,
      clickableTest:element=>!!element.closest?.('a[href],input,select,textarea,summary,button:not([data-society-drag])'),
      onDragStart(){panel.classList.add('is-dragging');panel.style.zIndex=zIndex<990?++zIndex:990;if(!reduce.matches)gsap.to(panel,{scale:1.05,rotation:gsap.utils.random(-1,1),filter:'drop-shadow(0px 12px 24px rgba(0,0,0,.12))',duration:.25});},
      onDrag(){if(!reduce.matches)gsap.to(panel,{rotation:gsap.utils.clamp(-14,14,.08*this.deltaX),duration:.2,ease:'power3.out',overwrite:true});},
      onRelease(event){panel.classList.remove('is-dragging');gsap.to(panel,{scale:1,rotation:0,filter:'drop-shadow(0px 0px 0px rgba(0,0,0,0))',duration:reduce.matches?0:.25,ease:'power3.out',overwrite:true});
        // Native links and controls bypass dragging, preserving exactly one click.
      }});
    panel.addEventListener('pointermove',event=>{
      if(reduce.matches||drag.isDragging||event.pointerType==='touch')return;
      const r=panel.getBoundingClientRect(),signedPower=value=>Math.sign(value)*Math.pow(Math.abs(value),.9);
      const px=Math.round(signedPower(gsap.utils.clamp(-1,1,(event.clientX-r.left-r.width/2)/(r.width/2)))*5);
      const py=Math.round(signedPower(gsap.utils.clamp(-1,1,(event.clientY-r.top-r.height/2)/(r.height/2)))*5);
      gsap.to(panel,{xPercent:px/r.width*100,yPercent:py/r.height*100,duration:.22,ease:'power3.out',overwrite:'auto'});
    });
    panel.addEventListener('pointerleave',()=>gsap.to(panel,{xPercent:0,yPercent:0,duration:reduce.matches?0:.28,ease:'power3.out',overwrite:'auto'}));
    // Preserve the existing accessible keyboard equivalent of dragging.
    handle.addEventListener('keydown',event=>{
      const moves={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]};
      if(event.key==='Home'){event.preventDefault();gsap.set(panel,{x:0,y:0,xPercent:0,yPercent:0,scale:1,rotation:0});drag.update(true);return;}
      if(moves[event.key]){event.preventDefault();const [x,y]=moves[event.key];gsap.set(panel,{x:Number(gsap.getProperty(panel,'x'))+x,y:Number(gsap.getProperty(panel,'y'))+y});drag.update(true);drag.applyBounds();}
    });
  });

  // Source CSS marquee moves at a constant 75px/s and pauses offscreen.
  const marquee=footer.querySelector('.society-marquee'),track=footer.querySelector('.society-marquee-track');
  let list=track.querySelector('.society-marquee-list');
  if(!list){list=document.createElement('div');list.className='society-marquee-list';while(track.firstChild)list.append(track.firstChild);track.append(list);const clone=list.cloneNode(true);clone.setAttribute('aria-hidden','true');track.append(clone);}
  const lists=[...track.children];let marqueeVisible=false;
  const updateMarquee=()=>{lists.forEach(el=>{el.style.animationDuration=`${el.offsetWidth/75}s`;el.style.animationPlayState=marqueeVisible&&!document.hidden&&!reduce.matches?'running':'paused';});};
  const marqueeObserver=new IntersectionObserver(entries=>{marqueeVisible=entries.some(e=>e.isIntersecting);updateMarquee();},{threshold:0});marqueeObserver.observe(marquee);
  const footerObserver=new IntersectionObserver(entries=>{const visible=entries.some(e=>e.isIntersecting);footer.classList.toggle('is-in-view',visible);document.body.classList.toggle('society-footer-visible',visible);},{threshold:0});footerObserver.observe(wrap);
  document.addEventListener('visibilitychange',updateMarquee);
  reduce.addEventListener('change',()=>{configureMotion();updateMarquee();scrambleLabels.forEach(({label,original})=>{gsap.killTweensOf(label);label.textContent=original;});});
  document.fonts.ready.then(()=>{ScrollTrigger.refresh();updateMarquee();});
  addEventListener('resize',updateMarquee,{passive:true});
}
