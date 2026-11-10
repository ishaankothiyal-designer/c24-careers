import assets from '../ambition-motion-assets.json' with {type:'json'};

const byId=new Map(assets.map(asset=>[asset.id,asset]));

// Shares the original figures' small lifecycle contract, so the carousel's
// visibility, device-budget and reduced-motion policies also govern video.
export function createAmbitionFigure(host, options={}) {
  const asset=byId.get(host.dataset.ambitionMotion);
  if(!asset)return null;
  const doc=host.ownerDocument;
  const frame=doc.createElement('div');
  frame.className='ambition-motion';
  const poster=doc.createElement('img');
  poster.className='ambition-motion__poster';
  poster.src=asset.poster;
  poster.alt='';
  poster.width=640;poster.height=512;
  poster.loading='lazy';poster.decoding='async';
  const video=doc.createElement('video');
  video.className='ambition-motion__video';
  video.muted=true;video.defaultMuted=true;video.loop=true;
  video.playsInline=true;video.preload='none';video.hidden=true;
  video.setAttribute('muted','');
  video.setAttribute('playsinline','');
  video.setAttribute('aria-hidden','true');
  video.setAttribute('disablepictureinpicture','');
  video.tabIndex=-1;
  frame.append(poster,video);host.replaceChildren(frame);
  const card=host.closest('.ambition-stack__card');
  const originalSurface=card?.style.getPropertyValue('--ambition-surface');
  card?.style.setProperty('--ambition-surface',asset.background);
  let disposed=false,playing=false,request=0;
  const reveal=()=>{
    if(!disposed&&playing&&video.readyState>=2){
      video.hidden=false;poster.hidden=true;
    }
  };
  const stop=()=>{
    playing=false;request++;
    video.pause();video.hidden=true;poster.hidden=false;
  };
  video.addEventListener('playing',reveal);
  video.addEventListener('error',stop);
  const update=({play=false}={})=>{
    if(disposed)return;
    if(!play){stop();return;}
    if(playing)return;
    playing=true;
    const current=++request;
    // Do not fetch a movie for a hidden card or a static-motion preference.
    if(!video.hasAttribute('src'))video.src=asset.video;
    Promise.resolve(video.play()).then(()=>{
      if(disposed||!playing||current!==request){
        if(disposed||!playing)video.pause();
        return;
      }
      reveal();
    }).catch(()=>{if(!disposed&&current===request)stop();});
  };
  update(options);
  return {update,destroy(){
    if(disposed)return;
    stop();disposed=true;
    video.removeEventListener('playing',reveal);
    video.removeEventListener('error',stop);
    video.removeAttribute('src');video.load();
    frame.remove();
    if(originalSurface)card?.style.setProperty('--ambition-surface',originalSurface);
    else card?.style.removeProperty('--ambition-surface');
  }};
}

