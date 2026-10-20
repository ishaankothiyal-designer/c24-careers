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
  const material = new THREE.MeshStandardMaterial({map:texture,roughness:.9,metalness:0,side:THREE.DoubleSide});
  const paper = new THREE.Mesh(geometry,material);paper.frustumCulled = false;paper.castShadow=true;paper.receiveShadow=true;
  const scene = new THREE.Scene();scene.add(paper);
  // Use the reference's actual directional/PCF floor shadow. The transparent
  // floor is angled for this front-facing camera and retains the white CSS floor.
  const shadowReceiver = new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.ShadowMaterial({opacity:0,depthWrite:false}));
  shadowReceiver.rotation.x=-Math.PI*.35;
  shadowReceiver.receiveShadow=true;scene.add(shadowReceiver);
  scene.add(new THREE.AmbientLight(0xffffff,1.25));
  const key = new THREE.DirectionalLight(0xffffff,1.15);key.position.set(-2,2.6,1.4);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=4;key.shadow.camera.bottom=-3;key.shadow.camera.near=.1;key.shadow.camera.far=12;key.shadow.bias=-.001;key.shadow.normalBias=.03;scene.add(key);
  const camera = new THREE.OrthographicCamera(-1,1,1,-1,.01,50);camera.position.set(0,0,8);
  const face = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(-1,0,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,1,0)));
  const center = new THREE.Vector3();let scale=1,last=1,lastWriting=0,paintedWriting=-1;
  const visibleBounds=new THREE.Box3(),visibleVertex=new THREE.Vector3();
  const closedPose=new THREE.Object3D();closedPose.quaternion.copy(face);closedPose.rotateY(.18);closedPose.rotateZ(-.25);
  function wrap(ctx,text,maxWidth){const lines=[];let line='';for(const word of text.split(/\s+/)){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);return lines;}
  function drawTexture(writing=lastWriting){
    const rect=sheet.getBoundingClientRect();const factor=1440/rect.width;
    textureCanvas.width=1440;textureCanvas.height=Math.round(rect.height*factor);
    const ctx=textureCanvas.getContext('2d');ctx.scale(factor,factor);ctx.fillStyle=getComputedStyle(sheet).backgroundColor;ctx.fillRect(0,0,rect.width,rect.height);
    // Source graph-paper proportions: 64px cells/2px strokes at1024px.
    // The lighter review surface is shared with the readable DOM fallback.
    const cell=rect.width/16;ctx.strokeStyle='rgba(130,150,135,.3)';ctx.lineWidth=rect.width/512;ctx.beginPath();
    for(let x=cell/2;x<=rect.width;x+=cell){ctx.moveTo(x,0);ctx.lineTo(x,rect.height);}
    for(let y=cell/2;y<=rect.height;y+=cell){ctx.moveTo(0,y);ctx.lineTo(rect.width,y);}
    ctx.stroke();
    const style=getComputedStyle(sheet),pad=parseFloat(style.paddingLeft),lines=[];let y=parseFloat(style.paddingTop),totalWidth=0;
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
        if(line.signature){ctx.translate(rect.width-pad-line.width,line.y);ctx.rotate(-Math.PI/60);ctx.beginPath();ctx.rect(-8,-12,(line.width+16)*fraction,line.lineHeight+28);ctx.clip();ctx.fillText(line.line,0,0);ctx.strokeStyle=line.color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(2,line.lineHeight-7);ctx.quadraticCurveTo(line.width*.45,line.lineHeight-13,line.width*.82,line.lineHeight-9);ctx.stroke();}
        else{ctx.beginPath();ctx.rect(pad-8,0,(line.width+16)*fraction,rect.height);ctx.clip();ctx.fillText(line.line,pad,line.y);}
      }
      ctx.restore();
    }
    root.dataset.paperSignature=signatureProgress.toFixed(3);root.dataset.paperInkBottom=y.toFixed(1);root.dataset.paperInkHeight=rect.height.toFixed(1);
    paintedWriting=writing;texture.needsUpdate=true;
  }
  function update(amount,writing=lastWriting){
    root.style.setProperty('--paper-shadow-opacity',`${.07*(1-amount)}`);
    // The reference rests at frame 4: open, with softly curled corners. Keep the
    // existing normalized fold/writing timing and only change its visual pose.
    const openFrame = Math.min(4,data.frameCount-1);
    last=amount;lastWriting=writing;if(Math.abs(writing-paintedWriting)>.001)drawTexture(writing);const frame=openFrame+amount*(data.frameCount-1-openFrame),a=Math.floor(frame),b=Math.min(a+1,data.frameCount-1),mix=frame-a,stride=data.vertexCount*3;
    for(let i=0;i<stride;i++){position.array[i]=data.positions[a*stride+i]*(1-mix)+data.positions[b*stride+i]*mix;normal.array[i]=data.normals[a*stride+i]*(1-mix)+data.normals[b*stride+i]*mix;}
    position.needsUpdate=true;normal.needsUpdate=true;
    paper.quaternion.copy(face);paper.rotateY(amount*.18);paper.rotateZ(-amount*.25);
    paper.scale.setScalar(scale);paper.position.set(0,0,0);
    // Lock the rendered silhouette to the open sheet's visual center. VAT frame
    // centers drift as vertices fold; endpoint interpolation cannot cancel it.
    paper.updateMatrixWorld(true);
    // VAT includes unused vertices; measure only the rendered index set.
    visibleBounds.makeEmpty();
    for(const index of data.indices)visibleBounds.expandByPoint(visibleVertex.fromBufferAttribute(position,index).applyMatrix4(paper.matrixWorld));
    visibleBounds.getCenter(center);paper.position.copy(center).negate();
    shadowReceiver.position.set(0,visibleBounds.min.y-center.y-.015,0);
    shadowReceiver.material.opacity=.24*amount*amount;
    renderer.render(scene,camera);
  }
  function resize(){const width=stage.clientWidth,height=stage.clientHeight;if(!width||!height)return;const aspect=width/height;camera.left=-aspect;camera.right=aspect;camera.top=1;camera.bottom=-1;camera.updateProjectionMatrix();renderer.setSize(width,height);
    scale=Math.min(2*aspect*.9/data.flat.width,2*.9/data.flat.depth);
    // A fixed horizon crosses 70% of the closed silhouette. Calculate it once
    // per resize, never from the animated frame, so the floor cannot drift.
    closedPose.scale.setScalar(scale);closedPose.updateMatrixWorld(true);visibleBounds.makeEmpty();
    const stride=data.vertexCount*3,closedFrame=(data.frameCount-1)*stride;
    for(const index of data.indices)visibleBounds.expandByPoint(visibleVertex.fromArray(data.positions,closedFrame+index*3).applyMatrix4(closedPose.matrixWorld));
    const closedHeight=visibleBounds.max.y-visibleBounds.min.y,pin=root.querySelector('.paper-letter__pin');
    const stageTop=stage.getBoundingClientRect().top-pin.getBoundingClientRect().top;
    const horizon=(stageTop+height/2+closedHeight*height*.1)/pin.clientHeight*100;
    root.style.setProperty('--paper-horizon',`${horizon}%`);
    root.style.setProperty('--paper-intro-center',`${pin.clientHeight*horizon/200-stageTop}px`);
    root.style.setProperty('--paper-width',`${data.flat.width*scale*height/2}px`);root.style.setProperty('--paper-height',`${data.flat.depth*scale*height/2}px`);drawTexture();update(last);
  }
  host.append(renderer.domElement);new ResizeObserver(resize).observe(stage);resize();
  // A later font load must refresh the same canvas rather than reveal a second UI.
  document.fonts.addEventListener('loadingdone',resize);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();root.classList.remove('is-paper-ready');root.dataset.paperState='fallback';});
  return {update};
}
