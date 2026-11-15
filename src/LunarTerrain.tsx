import {useEffect,useLayoutEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {useExpedition} from './expeditionStore';
import {useGame} from './store';
import {moonHeight,moonRocks} from './surfacePhysics';
import {lunarNoise,lunarScenicHeight} from './lunarLandscape';

function rockShape(detail:number){const g=new THREE.IcosahedronGeometry(1,detail),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=1+(lunarNoise(x*3.7+9,z*3.7+y*2)-.5)*.28;p.setXYZ(i,x*r,y*r,z*r);}g.computeBoundingSphere();return g;}

function surface(inner:number,outer:number,rings:number,segments:number,scenic=false){
 const p:number[]=[],uv:number[]=[],colors:number[]=[],indices:number[]=[],c=new THREE.Color();
 for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){const radius=inner+(outer-inner)*j/rings,a=i/segments*Math.PI*2,x=Math.cos(a)*radius,z=Math.sin(a)*radius,y=(scenic?lunarScenicHeight:moonHeight)(x,z);p.push(x,y,z);uv.push(x/8,z/8);const v=.62+(lunarNoise(x*.09,z*.09)-.5)*.13;c.setRGB(v,v*.99,v*.98);colors.push(c.r,c.g,c.b);}
 for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,a+1,b,a+1,b+1,b);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(new Float32Array(p.length),3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();return g;
}
function regolith(){const n=256,data=new Uint8Array(n*n*4);let seed=917;for(let y=0;y<n;y++)for(let x=0;x<n;x++){seed=seed*16807%2147483647;const grain=seed/2147483647,coarse=lunarNoise(x*.08,y*.08),value=174+coarse*25+grain*16-(grain>.995?35:0),k=(y*n+x)*4;data[k]=value;data[k+1]=value;data[k+2]=value;data[k+3]=255;}const map=new THREE.DataTexture(data,n,n);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;map.generateMipmaps=true;map.anisotropy=4;map.needsUpdate=true;return map;}
export function LunarFootprints(){
 const mesh=useRef<THREE.InstancedMesh>(null),history=useRef({last:[NaN,NaN],count:0,side:1}),dummy=useMemo(()=>new THREE.Object3D(),[]);
 const texture=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=64;canvas.height=128;const c=canvas.getContext('2d')!;c.fillStyle='rgba(35,35,34,.48)';c.beginPath();c.ellipse(32,42,21,31,0,0,Math.PI*2);c.fill();c.fillRect(15,66,34,36);c.globalCompositeOperation='destination-out';for(let y=20;y<108;y+=12)c.fillRect(10,y,44,4);const t=new THREE.CanvasTexture(canvas);return t;},[]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 useLayoutEffect(()=>{if(mesh.current)mesh.current.count=0;},[]);
 useFrame(()=>{const g=useGame.getState(),m=g.moon,h=history.current;if(!mesh.current||g.paused||g.uiBlocked||m.stage!=='eva'||m.motion.airborne||m.motion.speed<.3)return;const [x,,z]=m.player;if(!Number.isFinite(h.last[0])||Math.hypot(x-h.last[0],z-h.last[1])>5){h.last=[x,z];return;}if(Math.hypot(x-h.last[0],z-h.last[1])<.65)return;
  const angle=-Math.atan2(x-h.last[0],-(z-h.last[1])),px=x+Math.cos(angle)*h.side*.10,pz=z-Math.sin(angle)*h.side*.10;h.side*=-1;h.last=[x,z];const n=new THREE.Vector3((moonHeight(px-.05,pz)-moonHeight(px+.05,pz))/.1,1,(moonHeight(px,pz-.05)-moonHeight(px,pz+.05))/.1).normalize();dummy.position.set(px,moonHeight(px,pz)+.022,pz);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),n);dummy.rotateZ(angle);dummy.updateMatrix();mesh.current.setMatrixAt(h.count%96,dummy.matrix);h.count++;mesh.current.count=Math.min(96,h.count);mesh.current.instanceMatrix.needsUpdate=true;
 });
 return <instancedMesh name="Lunar-boot-trail" ref={mesh} args={[undefined,undefined,96]} frustumCulled={false}><planeGeometry args={[.18,.35]}/><meshStandardMaterial map={texture} transparent opacity={.6} roughness={1} depthWrite={false} polygonOffset polygonOffsetFactor={-2}/></instancedMesh>;
}
export default function LunarTerrain(){
 const quality=useExpedition(s=>s.graphics),rocks=useRef<THREE.InstancedMesh>(null);
 const resources=useMemo(()=>({near:surface(0,160,quality==='LOW'?72:quality==='HIGH'?128:104,quality==='LOW'?144:224),far:surface(160,850,quality==='LOW'?28:56,quality==='LOW'?144:224,true),map:regolith(),rock:rockShape(quality==='LOW'?1:2)}),[quality]);
 useEffect(()=>()=>{resources.near.dispose();resources.far.dispose();resources.map.dispose();resources.rock.dispose();},[resources]);
 useLayoutEffect(()=>{const d=new THREE.Object3D();moonRocks.forEach((r,i)=>{d.position.set(r.x,moonHeight(r.x,r.z)+r.r*.3,r.z);d.rotation.set(i*.73,i*1.17,i*.21);d.scale.set(r.r,r.r*(.48+(i%4)*.08),r.r*.9);d.updateMatrix();rocks.current?.setMatrixAt(i,d.matrix);});if(rocks.current)rocks.current.instanceMatrix.needsUpdate=true;},[]);
 return <group name="Lunar-cratered-highlands"><mesh geometry={resources.near} receiveShadow><meshStandardMaterial map={resources.map} bumpMap={resources.map} bumpScale={.016} vertexColors roughness={1}/></mesh><mesh geometry={resources.far} receiveShadow><meshStandardMaterial map={resources.map} vertexColors roughness={1}/></mesh><instancedMesh ref={rocks} geometry={resources.rock} args={[undefined,undefined,moonRocks.length]} castShadow receiveShadow><meshStandardMaterial color="#777570" map={resources.map} bumpMap={resources.map} bumpScale={.025} roughness={1}/></instancedMesh><LunarFootprints/></group>;
}
