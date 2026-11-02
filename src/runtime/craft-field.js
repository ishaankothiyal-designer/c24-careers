import { performanceProfile } from './performance-profile.js';
// Ambient hero artwork only. No page-wide cursor, trails or pointer listeners.
export function initializeCraftField() {
  const hero=document.querySelector('.hero__stage');
  const field=document.querySelector('[data-craft-field]');
  if(!hero || !field)return;
  if(window.__craftFieldCanvas===field && window.__craftFieldCleanup)return;
  window.__craftFieldCleanup?.();
  const background=field.getContext('2d');if(!background)return;
  window.__craftFieldCanvas=field;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const profile=performanceProfile();
  const openingArt=hero.closest('.hero')?.nextElementSibling?.id==='ambition'?hero.querySelector('.hero__art'):null;
  const CELL=profile.constrained?12:9;
  const COLORS=['#1c2541','#4736fe','#f5c518','#e0492a'];
  const seed=Math.random()*1000;
  const events=new AbortController();
  const listen=(node,type,callback)=>node.addEventListener(type,callback,{passive:true,signal:events.signal});
  let width,height,fieldWidth,fieldHeight,parallaxRate=0,parallaxLimit=0;
  let animation=0,lastFrame=0,firstFrame=performance.now();
  const clamp=(n,low=0,high=1)=>Math.max(low,Math.min(high,n));
  const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7+seed*.13)*43758.5453;return n-Math.floor(n);};
  function resize(){
    if(openingArt){const style=getComputedStyle(openingArt);parallaxRate=parseFloat(style.getPropertyValue('--opening-parallax-rate'))||0;parallaxLimit=parseFloat(style.getPropertyValue('--opening-parallax-limit'))||0;}
    width=innerWidth;height=innerHeight;
    const rect=field.getBoundingClientRect(),density=Math.min(devicePixelRatio||1,profile.pixelRatio);
    fieldWidth=Math.max(1,rect.width);fieldHeight=Math.max(1,rect.height);
    field.width=Math.round(fieldWidth*density);field.height=Math.round(fieldHeight*density);
    background.setTransform(density,0,0,density,0,0);delete field.dataset.staticRendered;
  }
  function ambientField(x, y, time) {
    const seconds = motion.matches ? 2 : time * .001;
    let nx = x / width, ny = y / height;
      nx += Math.sin(ny * 5 + seconds * .5 + seed) * .05;
      ny += Math.cos(nx * 5 - seconds * .4) * .05;
      const wave = Math.sin(nx * 5.6 + seed * 1.3 + seconds * .3) * Math.cos(ny * 4.7 - seed * .7 + seconds * .22)
        + Math.sin((nx * 1.4 + ny * 1.7) * 4.1 - seed + seconds * .16)
        + Math.sin(ny * 9 + seed * 2.1 + nx * 3) * .5 + Math.sin(nx * 13 - seed * 1.7) * .28;
    const column = x / CELL, row = y / CELL;
    const ragged = Math.max(0, (Math.sin(column * .5 + seed) + Math.sin(column * .21 - seed * 1.3)) * .16 + hash(Math.floor(column / 2) + 3.3, Math.floor(row / 4)) * .6 + .15) * fieldHeight * .14;
    const threshold = clamp((y + ragged - fieldHeight * .48) / (fieldHeight * .42));
    const region = .5 + .5 * Math.sin(x / width * 2.1 + seconds * .12 + seed * .7) * Math.cos(y / height * 1.8 - seconds * .09 + seed * .3);
    if (region <= threshold) return 0;
    return .5 + .5 * (wave / 2.55) + (hash(x / CELL, y / CELL) - .5) * .12
      + Math.sin((x / CELL * .6 + y / CELL * .8) + seconds * 1.7) * .045;
  }
  function drawField(time, jitterX = 0, jitterY = 0) {
    background.clearRect(0, 0, fieldWidth, fieldHeight);
    background.save(); background.translate(jitterX, jitterY);
    const entrance = motion.matches ? 1 : clamp((time - firstFrame) / 1600);
    for (let y = 0; y < fieldHeight; y += CELL) for (let x = 0; x < fieldWidth; x += CELL) {
      const value = ambientField(x, y, time);
      if (value < .3 || hash(x / CELL + 11, y / CELL) > entrance) continue;
      background.fillStyle = value > .86 && value < 1.02 ? '#d8ff00' : COLORS[value >= .78 ? 3 : value >= .62 ? 2 : value >= .46 ? 1 : 0];
      background.fillRect(x, y, CELL - 1, CELL - 1);
    }
    background.restore();
  }

  function frame(now){
    animation=requestAnimationFrame(frame);
    if(document.hidden || (lastFrame && now-lastFrame<profile.frameInterval-1))return;
    lastFrame=now;
    if(openingArt){const rect=hero.getBoundingClientRect();const offset=motion.matches||profile.constrained?0:Math.min(parallaxLimit,Math.max(0,-rect.top)*parallaxRate);openingArt.style.transform=`translate3d(0,${offset}px,0)`;}
    const rect=field.getBoundingClientRect();
    if(rect.bottom<=0 || rect.top>=height)return;
    if(motion.matches && field.dataset.staticRendered)return;
    drawField(now);if(motion.matches)field.dataset.staticRendered='true';
  }
  listen(window,'resize',resize);
  listen(motion,'change',()=>{delete field.dataset.staticRendered;});
  const observer=new ResizeObserver(resize);observer.observe(field);
  resize();animation=requestAnimationFrame(frame);
  window.__craftFieldCleanup=()=>{cancelAnimationFrame(animation);events.abort();observer.disconnect();openingArt?.style.removeProperty('transform');delete window.__craftFieldCleanup;delete window.__craftFieldCanvas;};
}
