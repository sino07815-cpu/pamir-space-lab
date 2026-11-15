import {useEffect,useMemo,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {useGame} from './store';
import {useExpedition} from './expeditionStore';
import {SPACE_SUN_DIRECTION,LUNAR_SUN_DIRECTION} from './solarLighting';

const vertex=`varying vec3 solarLocal;varying vec3 solarWorld;varying vec3 solarNormal;
void main(){solarLocal=position;vec4 p=modelMatrix*vec4(position,1.);solarWorld=p.xyz;solarNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*p;}`;
const fragment=`uniform float solarTime;varying vec3 solarLocal;varying vec3 solarWorld;varying vec3 solarNormal;
float solarHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float solarNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(solarHash(i),solarHash(i+vec3(1,0,0)),f.x),mix(solarHash(i+vec3(0,1,0)),solarHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(solarHash(i+vec3(0,0,1)),solarHash(i+vec3(1,0,1)),f.x),mix(solarHash(i+vec3(0,1,1)),solarHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){vec3 p=normalize(solarLocal);float t=solarTime*.025;float granules=solarNoise(p*24.+vec3(t,-t,t*.4))*.55+solarNoise(p*51.-vec3(t))* .3+solarNoise(p*103.)*.15;float limb=pow(max(0.,dot(normalize(solarNormal),normalize(cameraPosition-solarWorld))),.28);vec3 gold=mix(vec3(1.,.35,.055),vec3(1.,.96,.7),smoothstep(.2,.83,granules));gold*=mix(.55,1.3,limb);gl_FragColor=vec4(gold,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
function corona(){const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d')!,g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,238,190,0)');g.addColorStop(.14,'rgba(255,238,190,0)');g.addColorStop(.18,'rgba(255,231,174,.42)');g.addColorStop(.34,'rgba(255,185,93,.12)');g.addColorStop(.65,'rgba(255,158,60,.025)');g.addColorStop(1,'rgba(255,158,60,0)');c.fillStyle=g;c.fillRect(0,0,128,128);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;}

export default function Sun({lunar=false}:{lunar?:boolean}){
 const camera=useThree(s=>s.camera),quality=useExpedition(s=>s.graphics),root=useRef<THREE.Group>(null);
 const direction=useMemo(()=>new THREE.Vector3(...(lunar?LUNAR_SUN_DIRECTION:SPACE_SUN_DIRECTION)).normalize(),[lunar]);
 const uniforms=useMemo(()=>({solarTime:{value:0}}),[]),map=useMemo(corona,[]),radius=lunar?40:620,distance=lunar?9000:36000;
 useEffect(()=>()=>map.dispose(),[map]);
 useFrame((_,delta)=>{root.current?.position.copy(camera.position).addScaledVector(direction,distance);const g=useGame.getState();if(!g.paused&&!g.uiBlocked)uniforms.solarTime.value+=Math.min(.05,delta);});
 // Draw after transparent stars, but retain depth testing so planets, hills and
 // buildings occlude the distant Sun. This is a sky object, not a landing target.
 return <group ref={root} name={lunar?'Lunar-visible-sun':'Solar-visible-sun'}>
  <mesh scale={radius} renderOrder={50} frustumCulled={false} raycast={()=>{}}><sphereGeometry args={[1,quality==='LOW'?24:48,quality==='LOW'?16:32]}/><shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} toneMapped={false}/></mesh>
  <sprite scale={[radius*12,radius*12,1]} renderOrder={51} frustumCulled={false} raycast={()=>{}}><spriteMaterial map={map} transparent opacity={lunar?.7:.9} blending={THREE.AdditiveBlending} depthWrite={false} depthTest toneMapped={false}/></sprite>
 </group>;
}
