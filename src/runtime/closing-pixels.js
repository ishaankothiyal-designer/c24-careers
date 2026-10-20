// Craft's 18px text-mask / colored-cell marquee, scoped to the closing section.
// Adapted from the inspected craft.wild.as stampText/buildTxt source.
export function initializeClosingPixels(){
  document.querySelectorAll('[data-closing-pixels]').forEach(root=>{
    if(root.dataset.pixelsInitialized)return;
    root.dataset.pixelsInitialized='true';
    const canvas=root.querySelector('[data-closing-pixel-canvas]');
    const stage=root.querySelector('[data-closing-pixel-stage]');
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const mask=document.createElement('canvas'),paint=mask.getContext('2d');
    const reduce=matchMedia('(prefers-reduced-motion: reduce)');
    let cells=[],maskWidth=1,width=0,height=0,cell=9,scroll=0,frame=0,previous=0,visible=false;
    const colors=['#1c2541',getComputedStyle(root).getPropertyValue('--blue').trim()||'#4736fe','#f5c518','#e0492a','#d8ff00'];
    function build(){
      const text=root.querySelector('h2').textContent.trim()+'     ';
      const family=getComputedStyle(root.querySelector('h2')).fontFamily;
      paint.font=`400 18px ${family}`;maskWidth=Math.ceil(paint.measureText(text).width);
      mask.width=maskWidth;mask.height=24;paint.font=`400 18px ${family}`;paint.textBaseline='middle';paint.fillStyle='#000';paint.fillText(text,0,12);
      const data=paint.getImageData(0,0,maskWidth,24).data;cells=[];
      for(let y=0;y<24;y++)for(let x=0;x<maskWidth;x++)if(data[(y*maskWidth+x)*4+3]>80)cells.push([x,y]);
    }
    function size(){
      width=stage.clientWidth;height=stage.clientHeight;cell=innerWidth<=900?6:9;
      const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);draw(performance.now());
    }
    function draw(time){
      ctx.clearRect(0,0,width,height);
      const period=maskWidth*cell,offset=scroll*cell,top=Math.round((height-24*cell)/2);
      for(const [x,y] of cells){
        let px=((x*cell-offset)%period+period)%period;
        // Source shimmer changes the heat band independently in each square.
        const heat=.63+.33*Math.sin((x*.6+y*.6)-time*.006);
        const index=heat>=.86?4:heat>=.78?3:heat>=.62?2:heat>=.46?1:0;
        ctx.fillStyle=colors[index];
        while(px<width){ctx.fillRect(px,top+y*cell,cell-1,cell-1);px+=period;}
      }
    }
    function tick(time){frame=0;if(!visible||document.hidden||reduce.matches)return;const delta=previous?Math.min(time-previous,50):0;previous=time;scroll+=delta*.0084;draw(time);frame=requestAnimationFrame(tick);}
    function request(){previous=0;if(!frame&&visible&&!reduce.matches&&!document.hidden)frame=requestAnimationFrame(tick);}
    function preference(){root.classList.toggle('is-pixels-ready',!reduce.matches);cancelAnimationFrame(frame);frame=0;if(!reduce.matches){size();request();}}
    new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)request();else{cancelAnimationFrame(frame);frame=0;}}).observe(root);
    new ResizeObserver(size).observe(stage);
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else request();});
    reduce.addEventListener('change',preference);
    document.fonts.ready.then(()=>{build();preference();});
  });
}
