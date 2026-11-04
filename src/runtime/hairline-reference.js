import HL from '../vendor/hairline-kernel.js';

export { HL };

// Adapt official standalone Hairline examples to the cards' common lifecycle.
// Their demo controls stay out of the page; the existing visibility controller
// decides when the examples' pointer tours may play.
export function createReferenceFigure(host, spec, options = {}) {
  const root=host.getRootNode();
  HL.inject(root.nodeType===9||'host' in root?root:host.ownerDocument);
  host.setAttribute('data-hairline',spec.name);
  host.setAttribute('data-hairline-theme',options.theme==='dark'?'dark':'light');
  const svg=HL.mk('svg',{viewBox:'0 0 400 320','aria-hidden':'true'},host);
  let opts={...options},text='',tour=null,destroyed=false;
  const read={
    get textContent(){return text;},
    set textContent(value){
      if(value===text)return;
      text=value;
      if(typeof opts.onRead==='function')opts.onRead(value);
    },
  };
  const parameter=()=>{
    const input=typeof opts.intensity==='number'&&Number.isFinite(opts.intensity)?opts.intensity:.5;
    const intensity=Math.max(0,Math.min(1,input));
    const [low,middle,high]=spec.range;
    return intensity<=.5?low+(middle-low)*intensity*2:middle+(high-middle)*(intensity-.5)*2;
  };
  const handle=spec.mount({stage:host,svg,read},parameter());
  const playback=()=>{
    if(opts.play===true){if(!tour)tour=HL.tour(host,spec.tour||HL.LAP);}
    else if(tour){tour.stop();tour=null;}
  };
  playback();
  return {
    update(next={}){
      if(destroyed)return;
      opts={...opts,...next};
      if('intensity' in next)handle.set(parameter());
      playback();
    },
    destroy(){
      if(destroyed)return;
      destroyed=true;
      tour?.stop();
      handle.destroy();
      svg.remove();
      host.removeAttribute('data-hairline');
      host.removeAttribute('data-hairline-theme');
    },
  };
}
