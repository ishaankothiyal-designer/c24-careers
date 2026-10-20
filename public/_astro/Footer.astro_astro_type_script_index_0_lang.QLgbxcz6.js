function e(e){let t=e.trim().replace(/^#/,``);t.length===3&&(t=t.replace(/./g,e=>e+e));let n=parseInt(t,16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]}function t(t,n){let r=n.getContext(`webgl2`,{antialias:!1,alpha:!1});if(!r)return null;let i=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,a=(e,t)=>{let n=r.createShader(e);return n?(r.shaderSource(n,t),r.compileShader(n),r.getShaderParameter(n,r.COMPILE_STATUS)?n:(console.error(`[dithered-wave] shader error:`,r.getShaderInfoLog(n)),r.deleteShader(n),null)):null},o=a(r.VERTEX_SHADER,`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`),s=a(r.FRAGMENT_SHADER,`#version 300 es
precision highp float;

uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_pointer;
uniform float u_ripple;
uniform float u_pxSize;
uniform vec3  u_bg;
uniform vec3  u_fg;

out vec4 fragColor;

const float BAYER[64] = float[64](
   0.0,48.0,12.0,60.0, 3.0,51.0,15.0,63.0,
  32.0,16.0,44.0,28.0,35.0,19.0,47.0,31.0,
   8.0,56.0, 4.0,52.0,11.0,59.0, 7.0,55.0,
  40.0,24.0,36.0,20.0,43.0,27.0,39.0,23.0,
   2.0,50.0,14.0,62.0, 1.0,49.0,13.0,61.0,
  34.0,18.0,46.0,30.0,33.0,17.0,45.0,29.0,
  10.0,58.0, 6.0,54.0, 9.0,57.0, 5.0,53.0,
  42.0,26.0,38.0,22.0,41.0,25.0,37.0,21.0
);

float bayer8(vec2 cell) {
  int x = int(mod(cell.x, 8.0));
  int y = int(mod(cell.y, 8.0));
  return BAYER[y * 8 + x] / 64.0;
}

float waveField(vec2 p, float t) {
  float w = 0.0;
  w += sin(p.x * 3.0 + t * 1.15);
  w += sin(p.x * 1.7 - p.y * 2.3 + t * 0.9);
  w += 0.75 * sin(p.y * 4.0 + p.x * 1.1 - t * 1.7);
  w += 0.55 * sin((p.x + p.y) * 2.4 + t * 0.5);
  return w * 0.28;
}

void main() {
  vec2 res = u_resolution;
  float px = max(u_pxSize, 1.0);

  vec2 cell = floor(gl_FragCoord.xy / px);
  vec2 cellPx = cell * px + 0.5 * px;

  vec2 uv = (cellPx - 0.5 * res) / res.y;

  float w = waveField(uv, u_time);

  vec2 m = (u_pointer - 0.5 * res) / res.y;
  float d = length(uv - m);
  w += u_ripple * 0.6 * sin(d * 16.0 - u_time * 3.2) * exp(-d * 2.2);

  // Centred glow (matches the halftone texture): bright behind the mark,
  // fading to black at the edges, gently pushed around by the wave field.
  float r = length(uv * vec2(0.85, 1.0));
  float glow = smoothstep(0.66, 0.0, r + 0.12 * w);
  float intensity = clamp(mix(glow, 0.5 + 0.5 * w, 0.3) * 0.85 - 0.12, 0.0, 1.0);

  float bit = step(bayer8(cell), intensity);
  fragColor = vec4(mix(u_bg, u_fg, bit), 1.0);
}`);if(!o||!s)return null;let c=r.createProgram();if(!c)return null;if(r.attachShader(c,o),r.attachShader(c,s),r.linkProgram(c),!r.getProgramParameter(c,r.LINK_STATUS))return console.error(`[dithered-wave] link error:`,r.getProgramInfoLog(c)),null;r.useProgram(c);let l=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,l),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),r.STATIC_DRAW);let u=r.getAttribLocation(c,`a_pos`);r.enableVertexAttribArray(u),r.vertexAttribPointer(u,2,r.FLOAT,!1,0,0);let d=e=>r.getUniformLocation(c,e),f=d(`u_resolution`),p=d(`u_time`),m=d(`u_pointer`),h=d(`u_ripple`),g=d(`u_pxSize`);r.uniform3fv(d(`u_bg`),e(`#000000`)),r.uniform3fv(d(`u_fg`),e(`#0004F6`));let _=1,v=()=>{_=Math.min(window.devicePixelRatio||1,2);let e=Math.max(1,Math.round(n.clientWidth*_)),t=Math.max(1,Math.round(n.clientHeight*_));(n.width!==e||n.height!==t)&&(n.width=e,n.height=t,r.viewport(0,0,e,t),r.uniform2f(f,e,t),r.uniform1f(g,4*_))};window.addEventListener(`resize`,v),v();let y={x:n.width/2,y:n.height/2},b={x:y.x,y:y.y},x=0,S=0,C=e=>{let t=n.getBoundingClientRect();b.x=(e.clientX-t.left)*_,b.y=(t.height-(e.clientY-t.top))*_,S=1},w=()=>{S=0};i||(t.addEventListener(`pointermove`,C),t.addEventListener(`pointerleave`,w));let T=performance.now(),E=0,D=!0,O=e=>{let t=(e-T)*.001;y.x+=(b.x-y.x)*.12,y.y+=(b.y-y.y)*.12,x+=(S-x)*.06,r.uniform1f(p,t),r.uniform2f(m,y.x,y.y),r.uniform1f(h,x),r.drawArrays(r.TRIANGLES,0,6),E=requestAnimationFrame(O)},k=new IntersectionObserver(([e])=>{let t=e.isIntersecting;t!==D&&(D=t,!i&&(D?E=requestAnimationFrame(O):cancelAnimationFrame(E)))});return k.observe(t),i?(r.uniform1f(p,2),r.uniform2f(m,n.width/2,n.height/2),r.uniform1f(h,0),r.drawArrays(r.TRIANGLES,0,6)):E=requestAnimationFrame(O),()=>{cancelAnimationFrame(E),k.disconnect(),window.removeEventListener(`resize`,v),i||(t.removeEventListener(`pointermove`,C),t.removeEventListener(`pointerleave`,w)),r.deleteProgram(c),r.deleteShader(o),r.deleteShader(s),r.deleteBuffer(l)}}var n=document.querySelector(`[data-dithered-wave]`),r=n?.closest(`.closer`);n&&r&&t(r,n)&&n.classList.add(`is-live`);