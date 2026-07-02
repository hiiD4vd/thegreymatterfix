/**
 * brain-particle.js — vanilla-JS port of ParticleBrain.tsx
 * Usage: import { initParticleBrain } from './brain-particle.js'
 *        const destroy = initParticleBrain(containerEl)
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function sampleMeshSurface(geometry, matrix, count) {
  const pos = geometry.attributes.position;
  const idx = geometry.index;
  const triCount = idx ? idx.count / 3 : pos.count / 3;
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3();
  const ab = new THREE.Vector3(), ac = new THREE.Vector3();
  const areas = new Array(triCount);
  let total = 0;
  for (let t = 0; t < triCount; t++) {
    const i0 = idx ? idx.getX(t*3) : t*3;
    const i1 = idx ? idx.getX(t*3+1) : t*3+1;
    const i2 = idx ? idx.getX(t*3+2) : t*3+2;
    vA.fromBufferAttribute(pos,i0); vB.fromBufferAttribute(pos,i1); vC.fromBufferAttribute(pos,i2);
    ab.subVectors(vB,vA); ac.subVectors(vC,vA);
    const area = ab.clone().cross(ac).length()*0.5;
    areas[t] = area; total += area;
  }
  for (let t=1;t<triCount;t++) areas[t]+=areas[t-1];
  const out=[], p=new THREE.Vector3(), a=new THREE.Vector3(), b=new THREE.Vector3(), c=new THREE.Vector3();
  for (let i=0;i<count;i++) {
    const r=Math.random()*total; let lo=0,hi=triCount-1;
    while(lo<hi){const mid=(lo+hi)>>1;if(areas[mid]<r)lo=mid+1;else hi=mid;}
    const t=lo;
    const i0=idx?idx.getX(t*3):t*3, i1=idx?idx.getX(t*3+1):t*3+1, i2=idx?idx.getX(t*3+2):t*3+2;
    a.fromBufferAttribute(pos,i0); b.fromBufferAttribute(pos,i1); c.fromBufferAttribute(pos,i2);
    const r1=Math.sqrt(Math.random()),r2=Math.random();
    p.set(0,0,0).addScaledVector(a,1-r1).addScaledVector(b,r1*(1-r2)).addScaledVector(c,r1*r2);
    p.applyMatrix4(matrix); out.push(p.clone());
  }
  return out;
}

export function initParticleBrain(container, opts={}) {
  const modelUrl = opts.modelUrl || '/brain.glb';
  const particlesCount = opts.particlesCount || 10000;
  const speed = opts.speed !== undefined ? opts.speed : 0.015;

  let W = container.clientWidth||200, H = container.clientHeight||200;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({antialias:true,alpha:true}); } catch { return ()=>{}; }
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48,W/H,0.1,1000);
  camera.position.set(0,0.2,2.4); camera.lookAt(0,0,0);

  const pointerNdc = new THREE.Vector2(2,2);
  const raycaster = new THREE.Raycaster();
  let dragging=false, lastX=0, baseRotY=0, targetRotY=0, currentRotY=0, clicked=false;
  const baseLocal=[], disp=[], vel=[], colorInfo=[];
  let mesh=null;
  const m4=new THREE.Matrix4(), Y=new THREE.Vector3(0,1,0);

  new GLTFLoader().load(modelUrl, (gltf) => {
    const sceneObj=gltf.scene; sceneObj.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(sceneObj);
    const size=box.getSize(new THREE.Vector3()), center=box.getCenter(new THREE.Vector3());
    const maxDim=Math.max(size.x,size.y,size.z)||1;
    const s=(0.55*2)/maxDim;
    const holder=new THREE.Group(); holder.add(sceneObj);
    holder.scale.setScalar(s); holder.position.copy(center).multiplyScalar(-s);
    holder.updateMatrixWorld(true); gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((obj)=>{
      if(!obj.isMesh) return;
      const geom=obj.geometry; if(!geom.attributes.position) return;
      const mat=Array.isArray(obj.material)?obj.material[0]:obj.material;
      const col=new THREE.Color(1,1,1); if(mat&&mat.color) col.copy(mat.color);
      const triCount=geom.index?geom.index.count/3:geom.attributes.position.count/3;
      const share=Math.max(1,Math.round((triCount/50000)*particlesCount));
      sampleMeshSurface(geom,obj.matrixWorld,share).forEach(pt=>{
        baseLocal.push(pt.clone()); colorInfo.push(col.clone());
        disp.push(new THREE.Vector3()); vel.push(new THREE.Vector3());
      });
    });
    if(baseLocal.length<100) return;
    const small=Math.min(W,H)<500;
    const geo=new THREE.SphereGeometry(small?0.0032:0.005,8,8);
    const mat=new THREE.MeshBasicMaterial({color:0xffffff,blending:THREE.AdditiveBlending,transparent:true,opacity:small?0.75:0.92,depthWrite:false});
    mesh=new THREE.InstancedMesh(geo,mat,baseLocal.length);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const inst=new Float32Array(baseLocal.length*3);
    for(let i=0;i<baseLocal.length;i++){const cc=colorInfo[i];inst[i*3]=Math.min(1,cc.r*1.5);inst[i*3+1]=Math.min(1,cc.g*1.3);inst[i*3+2]=Math.min(1,cc.b*1.6);}
    mesh.instanceColor=new THREE.InstancedBufferAttribute(inst,3);
    scene.add(mesh);
  }, undefined, e=>console.error('brain.glb load fail',e));

  const onDown=e=>{dragging=true;lastX=e.clientX;baseRotY=targetRotY;clicked=true;};
  const onUp=()=>{dragging=false;clicked=false;};
  const onMove=e=>{
    const rect=renderer.domElement.getBoundingClientRect();
    pointerNdc.x=((e.clientX-rect.left)/rect.width)*2-1;
    pointerNdc.y=-((e.clientY-rect.top)/rect.height)*2+1;
    if(dragging){targetRotY=baseRotY+(e.clientX-lastX)*0.006;lastX=e.clientX;}
  };
  renderer.domElement.addEventListener('pointerdown',onDown);
  window.addEventListener('pointerup',onUp);
  window.addEventListener('pointermove',onMove);

  const FRICTION=0.90,SPRING=0.055,CURSOR_R=0.15,PUSH=0.11,CLICK=0.45,MAX_DISP=0.18;
  let rafId, lastTime=performance.now();
  const rest=new THREE.Vector3(),cur=new THREE.Vector3(),closest=new THREE.Vector3(),dv=new THREE.Vector3(),push=new THREE.Vector3();
  const animate=()=>{
    rafId=requestAnimationFrame(animate);
    const now=performance.now(), dt=Math.min((now-lastTime)/1000,0.05); lastTime=now;
    if(!dragging) targetRotY+=speed*dt;
    currentRotY+=(targetRotY-currentRotY)*0.05;
    if(mesh){
      raycaster.setFromCamera(pointerNdc,camera);
      for(let i=0;i<baseLocal.length;i++){
        rest.copy(baseLocal[i]).applyAxisAngle(Y,currentRotY);
        cur.copy(rest).add(disp[i]);
        vel[i].addScaledVector(dv.subVectors(rest,cur),SPRING);
        dv.copy(cur).sub(raycaster.ray.origin);
        const tAlong=dv.dot(raycaster.ray.direction);
        closest.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction,tAlong);
        const dist=cur.distanceTo(closest);
        if(dist<CURSOR_R){push.subVectors(cur,closest).normalize().multiplyScalar((CURSOR_R-dist)*PUSH);vel[i].add(push);}
        if(clicked&&dist<CURSOR_R*1.6){push.subVectors(cur,closest).normalize().multiplyScalar(CLICK*(1-dist/(CURSOR_R*1.6)));vel[i].add(push);}
        vel[i].multiplyScalar(FRICTION); disp[i].add(vel[i]);
        const dl=disp[i].length(); if(dl>MAX_DISP) disp[i].multiplyScalar(MAX_DISP/dl);
        m4.makeTranslation(cur.x,cur.y,cur.z); mesh.setMatrixAt(i,m4);
      }
      mesh.instanceMatrix.needsUpdate=true;
    }
    renderer.render(scene,camera);
  };
  animate();

  const ro=new ResizeObserver(()=>{
    const w=container.clientWidth,h=container.clientHeight;
    if(!w||!h) return; W=w;H=h;
    renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix();
  });
  ro.observe(container);
  renderer.domElement.style.cursor='grab';

  return function destroy(){
    cancelAnimationFrame(rafId); ro.disconnect();
    renderer.domElement.removeEventListener('pointerdown',onDown);
    window.removeEventListener('pointerup',onUp);
    window.removeEventListener('pointermove',onMove);
    if(renderer.domElement.parentElement===container) container.removeChild(renderer.domElement);
    renderer.dispose();
  };
}