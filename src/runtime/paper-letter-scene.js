// VAT loader/animation data adapted from Toi Nagasawa's MIT Paper Crumple demo.
import * as THREE from 'three';
import {loadVATData} from './paper-vat.js';

export async function createPaperLetterScene(root) {
  const host = root.querySelector('[data-paper-canvas]');
  const stage = root.querySelector('[data-paper-stage]');
  const sheet = root.querySelector('[data-paper-sheet]');
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000,0);
  renderer.domElement.setAttribute('aria-hidden','true');
  let data;
  try { data = await loadVATData('/paper-crumple/vat/'); }
  catch (error) { renderer.dispose(); throw error; }
  const geometry = new THREE.BufferGeometry();
  const position = new THREE.BufferAttribute(new Float32Array(data.vertexCount*3),3).setUsage(THREE.DynamicDrawUsage);
  const normal = new THREE.BufferAttribute(new Float32Array(data.vertexCount*3),3).setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position',position);geometry.setAttribute('normal',normal);
  geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(data.uvs),2));
  geometry.setIndex(data.indices);
  const textureCanvas = document.createElement('canvas');
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.rotation = Math.PI;texture.center.set(.5,.5);texture.repeat.set(1,-1);
  const material = new THREE.MeshStandardMaterial({map:texture,roughness:.94,metalness:0,side:THREE.DoubleSide});
  const paper = new THREE.Mesh(geometry,material);paper.frustumCulled = false;paper.castShadow=true;paper.receiveShadow=true;
  const scene = new THREE.Scene();scene.add(paper);
  scene.add(new THREE.AmbientLight(0xffffff,1.25));
  const key = new THREE.DirectionalLight(0xffffff,1.5);key.position.set(-3,4,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=4;key.shadow.camera.bottom=-4;key.shadow.camera.near=.1;key.shadow.camera.far=20;key.shadow.bias=-.001;key.shadow.normalBias=.03;scene.add(key);
  const fill = new THREE.DirectionalLight(0xe5eaff,.65);fill.position.set(4,-2,2);scene.add(fill);
  const camera = new THREE.OrthographicCamera(-1,1,1,-1,.01,50);camera.position.set(0,0,8);
  const face = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(-1,0,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,1,0)));
  let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity,sumY=0;
  for(const vertex of data.indices){const o=vertex*3;minX=Math.min(minX,data.positions[o]);maxX=Math.max(maxX,data.positions[o]);minZ=Math.min(minZ,data.positions[o+2]);maxZ=Math.max(maxZ,data.positions[o+2]);sumY+=data.positions[o+1];}
  const flatCenter = new THREE.Vector3((minX+maxX)/2,sumY/data.indices.length,(minZ+maxZ)/2);
  const closedCenter = new THREE.Vector3(...data.crumple.center);
  const center = new THREE.Vector3();let scale=1,last=1,lastWriting=0,paintedWriting=-1;
  function wrap(ctx,text,maxWidth){const lines=[];let line='';for(const word of text.split(/\s+/)){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);return lines;}
  function drawTexture(writing=lastWriting){
    const rect=sheet.getBoundingClientRect();const factor=1440/rect.width;
    textureCanvas.width=1440;textureCanvas.height=Math.round(rect.height*factor);
    const ctx=textureCanvas.getContext('2d');ctx.scale(factor,factor);ctx.fillStyle=getComputedStyle(sheet).backgroundColor;ctx.fillRect(0,0,rect.width,rect.height);
    const style=getComputedStyle(sheet),pad=parseFloat(style.paddingLeft),lines=[];let y=pad,totalWidth=0;
    for(const el of sheet.children){
      const cs=getComputedStyle(el),fontSize=parseFloat(cs.fontSize),font=`${cs.fontWeight} ${fontSize}px ${cs.fontFamily}`;
      ctx.font=font;ctx.letterSpacing=cs.letterSpacing==='normal'?'0px':cs.letterSpacing;
      y+=parseFloat(cs.marginTop)||0;const lineHeight=parseFloat(cs.lineHeight)||fontSize*1.5;
      const text=cs.textTransform==='uppercase'?el.textContent.trim().toUpperCase():el.textContent.trim();
      const signature=el.hasAttribute('data-paper-signature'),body=el.hasAttribute('data-paper-paragraph');
      for(const line of wrap(ctx,text,rect.width-2*pad)){
        const width=ctx.measureText(line).width;lines.push({line,y,width,lineHeight,font,color:cs.color,spacing:ctx.letterSpacing,signature,body});if(body)totalWidth+=width;y+=lineHeight;
      }
      y+=parseFloat(cs.marginBottom)||0;
    }
    const bodyProgress=Math.min(1,writing/.86),signatureProgress=Math.max(0,Math.min(1,(writing-.86)/.14));let remaining=totalWidth*bodyProgress;
    for(const line of lines){
      ctx.save();ctx.font=line.font;ctx.fillStyle=line.color;ctx.textBaseline='top';ctx.letterSpacing=line.spacing;
      let fraction=1;if(line.body){fraction=Math.max(0,Math.min(1,remaining/line.width));remaining-=line.width;}if(line.signature)fraction=signatureProgress;
      if(fraction>0){
        if(line.signature){ctx.translate(pad,line.y);ctx.rotate(-Math.PI/60);ctx.beginPath();ctx.rect(-8,-12,(line.width+16)*fraction,line.lineHeight+28);ctx.clip();ctx.fillText(line.line,0,0);ctx.strokeStyle=line.color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(2,line.lineHeight-7);ctx.quadraticCurveTo(line.width*.45,line.lineHeight-13,line.width*.82,line.lineHeight-9);ctx.stroke();}
        else{ctx.beginPath();ctx.rect(pad-8,0,(line.width+16)*fraction,rect.height);ctx.clip();ctx.fillText(line.line,pad,line.y);}
      }
      ctx.restore();
    }
    root.dataset.paperSignature=signatureProgress.toFixed(3);root.dataset.paperInkBottom=y.toFixed(1);root.dataset.paperInkHeight=rect.height.toFixed(1);
    paintedWriting=writing;texture.needsUpdate=true;
  }
  function update(amount,writing=lastWriting){
    last=amount;lastWriting=writing;if(Math.abs(writing-paintedWriting)>.001)drawTexture(writing);const frame=amount*(data.frameCount-1),a=Math.floor(frame),b=Math.min(a+1,data.frameCount-1),mix=frame-a,stride=data.vertexCount*3;
    for(let i=0;i<stride;i++){position.array[i]=data.positions[a*stride+i]*(1-mix)+data.positions[b*stride+i]*mix;normal.array[i]=data.normals[a*stride+i]*(1-mix)+data.normals[b*stride+i]*mix;}
    position.needsUpdate=true;normal.needsUpdate=true;
    paper.quaternion.copy(face);paper.rotateY(amount*.18);paper.rotateZ(-amount*.25);
    paper.scale.setScalar(scale);center.copy(flatCenter).lerp(closedCenter,amount);
    paper.position.copy(center).applyQuaternion(paper.quaternion).multiplyScalar(-scale);
    renderer.render(scene,camera);
  }
  function resize(){const width=stage.clientWidth,height=stage.clientHeight;if(!width||!height)return;const aspect=width/height;camera.left=-aspect;camera.right=aspect;camera.top=1;camera.bottom=-1;camera.updateProjectionMatrix();renderer.setSize(width,height);
    scale=Math.min(2*aspect*.9/data.flat.width,2*.9/data.flat.depth);
    root.style.setProperty('--paper-width',`${data.flat.width*scale*height/2}px`);root.style.setProperty('--paper-height',`${data.flat.depth*scale*height/2}px`);drawTexture();update(last);
  }
  host.append(renderer.domElement);new ResizeObserver(resize).observe(stage);resize();
  // A later font load must refresh the same canvas rather than reveal a second UI.
  document.fonts.addEventListener('loadingdone',resize);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();root.classList.remove('is-paper-ready');root.dataset.paperState='fallback';});
  return {update};
}
