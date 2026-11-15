import { useEffect,useMemo,useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { planets,useGame } from './store';
import { useExpedition } from './expeditionStore';
import texture,{cloudTexture,localTexture} from './planetTextures';
import { planetVisuals } from './planetVisuals';
import { SPACE_SUN_DIRECTION } from './solarLighting';

const sunlight=new THREE.Vector3(...SPACE_SUN_DIRECTION).normalize();
const atmosphereVertex=`varying vec3 worldNormal; varying vec3 worldPosition;
void main(){vec4 p=modelMatrix*vec4(position,1.);worldPosition=p.xyz;worldNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*p;}`;
const atmosphereFragment=`uniform vec3 tint;uniform vec3 sun;varying vec3 worldNormal;varying vec3 worldPosition;
void main(){vec3 n=normalize(worldNormal);vec3 view=normalize(cameraPosition-worldPosition);float rim=pow(1.-abs(dot(n,view)),2.8);float day=smoothstep(-.2,.45,dot(n,sun));gl_FragColor=vec4(tint,rim*(.06+.6*day));
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
const ringVertex=`varying vec2 ringUv;varying vec3 ringPosition;void main(){ringUv=uv;ringPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const ringFragment=`uniform sampler2D ringMap;uniform vec3 sun;uniform float bodyRadius;varying vec2 ringUv;varying vec3 ringPosition;
void main(){vec4 grain=texture2D(ringMap,ringUv);float along=dot(-ringPosition,sun);float closest=length(ringPosition+sun*max(0.,along));float shadow=mix(1.,smoothstep(bodyRadius*.97,bodyRadius*1.03,closest),step(0.,along));float light=.28+.72*abs(sun.z);gl_FragColor=vec4(grain.rgb*light*mix(.1,1.,shadow),grain.a*.94);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;

export default function PlanetBody({data,visible=true}:{data:typeof planets[number];visible?:boolean}){
  const quality=useExpedition(s=>s.graphics),mesh=useRef<THREE.Mesh>(null),clouds=useRef<THREE.Mesh>(null),ring=useRef<THREE.Mesh>(null);
  const config=planetVisuals[data.name],segments=quality==='LOW'?48:quality==='MEDIUM'?80:128;
  const maps=useMemo(()=>({day:texture(data.name),cloud:data.name==='Earth'?cloudTexture():null,night:data.name==='Earth'?localTexture('earth-night.jpg'):null,ring:data.name==='Saturn'?localTexture('saturn-ring.png'):null}),[data.name]);
  const atmosphere=useMemo(()=>({tint:{value:new THREE.Color(config.atmosphere??'#000')},sun:{value:sunlight}}),[config.atmosphere]);
  const rings=useMemo(()=>{
    if(!maps.ring)return null;const inner=data.radius*1.24,outer=data.radius*2.35,geometry=new THREE.RingGeometry(inner,outer,quality==='LOW'?128:256);
    const uv=geometry.attributes.uv,pos=geometry.attributes.position;for(let i=0;i<pos.count;i++)uv.setXY(i,(Math.hypot(pos.getX(i),pos.getY(i))-inner)/(outer-inner),.5);
    return {geometry,uniforms:{ringMap:{value:maps.ring},sun:{value:sunlight.clone()},bodyRadius:{value:data.radius}}};
  },[maps.ring,data.radius,quality]);
  useEffect(()=>()=>{Object.values(maps).forEach(map=>map?.dispose());},[maps]);
  useEffect(()=>()=>rings?.geometry.dispose(),[rings]);
  useFrame((_,delta)=>{
    if(useGame.getState().paused||useGame.getState().uiBlocked)return;
    const dt=Math.min(delta,.05),rate=.018*23.934/config.dayHours;
    if(mesh.current)mesh.current.rotation.y+=dt*rate;if(clouds.current)clouds.current.rotation.y+=dt*rate*1.04;
    if(ring.current&&rings){ring.current.updateWorldMatrix(true,false);rings.uniforms.sun.value.copy(sunlight).transformDirection(new THREE.Matrix4().copy(ring.current.matrixWorld).invert());}
  });
  const select=(event:{stopPropagation:()=>void})=>{if(!visible||document.pointerLockElement)return;event.stopPropagation();const s=useGame.getState(),e=useExpedition.getState();if(s.started&&(s.surface||s.mars.stage==='approach'||s.moon.stage==='approach'||e.mode!=='flight'||e.dock!=='free'))return;e.set({navStation:false});s.set({target:data.name,autopilot:false,mars:s.mars.stage==='orbit'&&s.started?{...s.mars,stage:'space'}:s.mars});};
  const rocky=['Mercury','Moon','Mars'].includes(data.name);
  return <group visible={visible} position={[...data.position]} rotation={[config.tilt*Math.PI/180,0,0]}>
    <mesh ref={mesh} rotation={[0,data.name==='Earth'?-Math.PI/2:.8,0]} scale={[1,config.polarRatio,1]} onClick={select}>
      <sphereGeometry args={[data.radius,segments,segments/2]}/>
      <meshStandardMaterial map={maps.day} roughness={config.roughness} metalness={0} bumpMap={rocky?maps.day:undefined} bumpScale={data.radius*.003}
        customProgramCacheKey={()=>data.name==='Earth'?'earth-night-oceans-v1':data.name==='Neptune'?'neptune-colour-v1':'planet-standard'}
        onBeforeCompile={shader=>{
          if(data.name==='Neptune')shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat grey=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));diffuseColor.rgb=mix(vec3(grey),diffuseColor.rgb,.52);');
          if(data.name!=='Earth'||!maps.night)return;
          shader.uniforms.uNightMap={value:maps.night};shader.uniforms.uSun={value:sunlight};
          shader.vertexShader='varying vec3 planetNormal;\n'+shader.vertexShader;
          shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nplanetNormal=normalize(mat3(modelMatrix)*objectNormal);');
          shader.fragmentShader='uniform sampler2D uNightMap;uniform vec3 uSun;varying vec3 planetNormal;\n'+shader.fragmentShader;
          shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat darkness=1.-smoothstep(-.2,.1,dot(normalize(planetNormal),uSun));totalEmissiveRadiance+=texture2D(uNightMap,vMapUv).rgb*darkness*1.3;');
          shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nfloat water=smoothstep(.025,.12,diffuseColor.b-max(diffuseColor.r,diffuseColor.g));roughnessFactor=mix(.88,.28,water);');
        }}/>
    </mesh>
    {maps.cloud&&<mesh ref={clouds} rotation={[0,data.name==='Earth'?-Math.PI/2:.8,0]} scale={[1.008,config.polarRatio*1.008,1.008]} raycast={()=>{}}><sphereGeometry args={[data.radius,segments,segments/2]}/><meshStandardMaterial color="#f3f6f8" alphaMap={maps.cloud} transparent opacity={.84} depthWrite={false} roughness={1}/></mesh>}
    {config.atmosphere&&<mesh scale={[1.018,config.polarRatio*1.018,1.018]} raycast={()=>{}}><sphereGeometry args={[data.radius,segments,segments/2]}/><shaderMaterial vertexShader={atmosphereVertex} fragmentShader={atmosphereFragment} uniforms={atmosphere} transparent side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>}
    {rings&&<mesh ref={ring} geometry={rings.geometry} rotation={[-Math.PI/2,0,0]} raycast={()=>{}}><shaderMaterial vertexShader={ringVertex} fragmentShader={ringFragment} uniforms={rings.uniforms} transparent side={THREE.DoubleSide} depthWrite={false}/></mesh>}
    {data.name==='Uranus'&&[1.63,1.9,2].map((r,i)=><mesh key={r} rotation={[-Math.PI/2,0,0]} raycast={()=>{}}><ringGeometry args={[data.radius*r,data.radius*(r+.007),128]}/><meshBasicMaterial color="#9b9e95" transparent opacity={.16+i*.03} side={THREE.DoubleSide} depthWrite={false}/></mesh>)}
  </group>;
}
