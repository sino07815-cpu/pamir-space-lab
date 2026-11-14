import HeritageWorld from './Heritage';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from './store';
import Ship from './Ship';
import Base from './Base';
import PlanetTerrain from './PlanetTerrain';
import Rover from './Rover';
import { useExpedition } from './expeditionStore';
import { insideBase,presentationBaseRoute,safeBaseSpawn } from './expedition';
import { consume, keys, resetInput, steering } from './input';
import { boulders, sites, stepLanding, stepWalker, terrainHeight,resolveGround,type Walker } from './mars';

import Astronaut from './Astronaut';
export { default as Astronaut } from './Astronaut';
function Landscape(){return <><PlanetTerrain planet="Mars"/><mesh rotation={[-Math.PI/2,0,0]} position={[0,.02,0]}><ringGeometry args={[5.7,5.85,64]}/><meshBasicMaterial color="#d9ad76"/></mesh></>;}
function Dust({active}:{active:React.RefObject<number>}){
  const points=useRef<THREE.Points>(null);const positions=useMemo(()=>new Float32Array(80*3),[]);
  useFrame(({clock})=>{if(!points.current)return;const intensity=active.current;points.current.visible=intensity>0;if(!intensity)return;const a=points.current.geometry.attributes.position;for(let i=0;i<80;i++){const t=(clock.elapsedTime*.4+i*.037)%1,r=t*10*intensity,angle=i*2.4;a.setXYZ(i,Math.cos(angle)*r,.15+Math.sin(t*Math.PI)*intensity*2,Math.sin(angle)*r);}a.needsUpdate=true;});
  return <points ref={points}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial color="#d2a17c" size={.7} transparent opacity={.35} depthWrite={false}/></points>;
}
export default function MarsWorld(){
  const surfaceReset=useExpedition(s=>s.surfaceReset);const storm=useExpedition(s=>s.events.storm);const presentationRoute=useRef(0);
  const mars=useGame(s=>s.mars),cockpit=useGame(s=>s.cockpit);const camera=useThree(s=>s.camera);
  const lander=useRef<THREE.Group>(null),flames=useRef<THREE.Group>(null),astronaut=useRef<THREE.Group>(null);
  const walker=useRef<Walker>({x:mars.player[0],y:terrainHeight(mars.player[0],mars.player[2]),z:mars.player[2],vx:0,vz:0,vy:0});
  const view=useRef({yaw:0,pitch:.14}),moving=useRef(0),jumping=useRef(0),interacting=useRef(false),dust=useRef(0),telemetry=useRef(0),stageClock=useRef(0),lastStage=useRef(mars.stage),dwell=useRef(0);
  const landingSim=useRef(mars.landing),landingTick=useRef(0);
  useEffect(()=>{const p=useGame.getState().mars.player;const [x,z]=safeBaseSpawn(p[0],p[2]);walker.current={x,y:terrainHeight(x,z),z,vx:0,vz:0,vy:0};presentationRoute.current=surfaceReset>0?3:0;},[surfaceReset]);
  useEffect(()=>{if(!mars.rover.occupied){const p=useGame.getState().mars.player;const [x,z]=safeBaseSpawn(p[0],p[2]);walker.current={x,y:terrainHeight(x,z),z,vx:0,vz:0,vy:0};resetInput();}},[mars.rover.occupied]);
  useEffect(()=>{camera.up.set(0,1,0);resetInput();},[camera]);
  useFrame((_,delta)=>{
    const s=useGame.getState(),m=s.mars,dt=Math.min(.04,delta);if(s.paused||s.uiBlocked||!s.started||useExpedition.getState().mode!=='flight')return;
    if(lastStage.current!==m.stage){stageClock.current=0;lastStage.current=m.stage;resetInput();if(m.stage==='eva'&&!m.rover.occupied){const [x,z]=safeBaseSpawn(m.player[0],m.player[2]);walker.current={x,y:terrainHeight(x,z),z,vx:0,vz:0,vy:0};view.current={yaw:0,pitch:.14};}}
    stageClock.current+=dt;
    if(m.stage==='descent'){
      landingSim.current.assisted=m.landing.assisted;const landing=stepLanding(landingSim.current,dt,keys.has('Space'),{x:(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),z:(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0)});landingSim.current=landing;landingTick.current+=dt;if(landingTick.current>.1||landing.result!=='flying'){s.updateLanding(landing);landingTick.current=0;}
      const altitude=landing.altitude;if(lander.current){lander.current.position.set(landing.x,altitude+1.1,landing.z);lander.current.rotation.set(landing.vz*.025,0,-landing.vx*.025);}
      if(flames.current){flames.current.visible=landing.throttle>.05;flames.current.scale.y=.4+landing.throttle*2;}
      dust.current=altitude<25?(1-altitude/25)*landing.throttle:0;
      const desired=new THREE.Vector3(landing.x+14,altitude+8,landing.z+20);camera.position.lerp(desired,1-Math.exp(-dt*2));camera.lookAt(landing.x,altitude+1,landing.z);
    }else{
      const bounce=m.stage==='landed'?Math.sin(stageClock.current*12)*Math.exp(-stageClock.current*5)*.12:0;
      if(lander.current){lander.current.position.set(m.landing.x,1.1+bounce,m.landing.z);lander.current.rotation.set(0,0,0);}if(flames.current)flames.current.visible=false;
      dust.current=useExpedition.getState().events.storm&&!insideBase(m.player[0],m.player[2])?.65:m.stage==='landed'?Math.max(0,1-stageClock.current/4):0;
      if(m.stage==='eva'&&!m.rover.occupied){
        const w=walker.current;const expedition=useExpedition.getState();const presenting=expedition.presentation&&expedition.demoPhase==='science';const pending=sites.find(site=>!m.objectives.includes(site.id)&&(!presenting||site.id!=='research'));let inputX=0,inputZ=0;
        if(m.demo||presenting){const route=presentationBaseRoute;const target=pending??(presenting?route[Math.min(3,presentationRoute.current)]:{x:0,z:5});const dx=target.x-w.x,dz=target.z-w.z,d=Math.hypot(dx,dz);view.current.yaw=Math.atan2(-dx,-dz);
          if(d>1.8){inputX=dx/d*(presenting?.75:.42);inputZ=dz/d*(presenting?.75:.42);dwell.current=0;}else{dwell.current+=dt;if(dwell.current>(presenting?1:4)){s.set({mars:{...m,player:[w.x,w.y,w.z]}});if(presenting&&!pending){if(presentationRoute.current<3)presentationRoute.current++;else if(!expedition.analyzing&&expedition.missions.mars.status==='active')expedition.analyze();}else useGame.getState().interact();dwell.current=0;}}
        }else{
          view.current.yaw-=steering.x*.002;view.current.pitch=THREE.MathUtils.clamp(view.current.pitch+steering.y*.002,-.65,.8);view.current.yaw+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt;
          const x=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),z=(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0);inputX=x*Math.cos(view.current.yaw)+z*Math.sin(view.current.yaw);inputZ=z*Math.cos(view.current.yaw)-x*Math.sin(view.current.yaw);
        }
        steering.x=0;steering.y=0;interacting.current=s.elapsed<m.interactionUntil;
        walker.current=stepWalker(w,{x:interacting.current?0:inputX,z:interacting.current?0:inputZ,jump:m.suit.energy>2&&!m.demo&&!presenting&&consume('Space'),sprint:m.suit.energy>5&&!m.demo&&!presenting&&(keys.has('ShiftLeft')||keys.has('ShiftRight'))},dt,{resolve:(x,z,ox,oz)=>resolveGround(x,z,ox,oz,[m.landing.x,m.landing.z])});
        const p=walker.current;moving.current=Math.hypot(p.vx,p.vz);jumping.current=p.vy;
        if(astronaut.current){astronaut.current.visible=!s.cockpit;astronaut.current.position.set(p.x,p.y,p.z);if(moving.current>.1)astronaut.current.rotation.y=Math.atan2(-p.vx,-p.vz);}
        if(!m.demo&&!presenting&&consume('KeyE')){s.set({mars:{...useGame.getState().mars,player:[p.x,p.y,p.z]}});if(!expedition.interactBase())useGame.getState().interact();}
        const offset=new THREE.Vector3(0,s.cockpit?1.7:3.1,s.cockpit?0:6.5).applyAxisAngle(new THREE.Vector3(0,1,0),view.current.yaw);
        const desired=new THREE.Vector3(p.x,p.y,p.z).add(offset);desired.y=Math.max(desired.y,terrainHeight(desired.x,desired.z)+.8);const room=insideBase(p.x,p.z);if(room){desired.x=Math.max(room.x-3.3,Math.min(room.x+3.3,desired.x));desired.z=Math.max(room.z-3.3,Math.min(room.z+3.3,desired.z));desired.y=Math.min(2.8,desired.y);}camera.position.lerp(desired,1-Math.exp(-dt*8));
        if(s.cockpit){camera.rotation.set(-view.current.pitch,view.current.yaw,0,'YXZ');}else camera.lookAt(p.x,p.y+1.3-view.current.pitch*3,p.z);
        telemetry.current+=dt;if(telemetry.current>.1){telemetry.current=0;s.updateSurfaceMotion('Mars',[p.x,p.y,p.z],{speed:moving.current,heading:view.current.yaw,airborne:p.y>terrainHeight(p.x,p.z)+.05});}
      }else if(m.stage==='eva'){moving.current=0;if(astronaut.current)astronaut.current.visible=false;}else{moving.current=0;if(astronaut.current)astronaut.current.visible=false;camera.position.lerp(new THREE.Vector3(m.landing.x+12,6,m.landing.z+15),1-Math.exp(-dt*2));camera.lookAt(m.landing.x,1,m.landing.z);if(m.stage==='landed'&&(consume('KeyE')||(m.demo&&stageClock.current>6)))s.exitShip();}
    }
  });
  return <><color attach="background" args={['#a07458']}/><fog attach="fog" args={['#a07458',storm?15:45,storm?75:220]}/><hemisphereLight args={['#ffe0b7','#6b3e30',1.35]}/><directionalLight position={[-35,55,-25]} intensity={3.2} color="#ffddaf"/>
    <Landscape/><HeritageWorld planet="Mars"/><Base/><Rover/><group position={storm?mars.player:[mars.landing.x,0,mars.landing.z]}><Dust active={dust}/></group>
    <group ref={lander} position={[mars.landing.x,mars.stage==='descent'?mars.landing.altitude+1.1:1.1,mars.landing.z]}>
      <group position={[0,2.1,0]} rotation={[Math.PI/2,0,0]} scale={2}><Ship/></group>
      {[-1,1].flatMap(x=>[-1,1].map(z=><group key={`${x}${z}`} position={[x*1.8,-.5,z*1.7]}><mesh><cylinderGeometry args={[.07,.11,1.2,8]}/><meshStandardMaterial color="#a3aaa8"/></mesh><mesh position={[0,-.55,0]}><cylinderGeometry args={[.38,.38,.08,12]}/><meshStandardMaterial color="#65716e"/></mesh></group>))}
      <group ref={flames} position={[0,-.6,0]}>{[-1,1].map(x=><mesh key={x} position={[x*1.2,-.5,1]} rotation={[Math.PI,0,0]}><coneGeometry args={[.23,1.4,12]}/><meshBasicMaterial color="#ffbc67" transparent opacity={.75}/></mesh>)}</group>
    </group>
    <group ref={astronaut} visible={mars.stage==='eva'&&!cockpit}><Astronaut moving={moving} jumping={jumping} interacting={interacting}/></group>
    {!mars.objectives.includes('zone')&&<mesh position={[8,terrainHeight(8,6)+.04,6]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[5.8,6,48]}/><meshBasicMaterial color="#8fc9c0" transparent opacity={.55}/></mesh>}
    {sites.map(site=>{const done=mars.objectives.includes(site.id),near=Math.hypot(mars.player[0]-site.x,mars.player[2]-site.z)<3;return <group key={site.id} position={[site.x,terrainHeight(site.x,site.z),site.z]}>
      {site.id==='research'?<group>{[0,1,2,3].map(i=><mesh key={i} position={[0,.3+i*.42,0]} rotation={[0,i*.08,0]}><boxGeometry args={[3-i*.3,.4,1.4]}/><meshStandardMaterial color={i%2?'#ad7957':'#80543d'} roughness={1}/></mesh>)}</group>:!done&&<mesh position={[0,.35,0]} rotation={[.2,.4,.1]}><dodecahedronGeometry args={[.48,0]}/><meshStandardMaterial color={near?'#e5c27f':'#bb8a5d'} emissive={near?'#a86c2d':'#292017'} emissiveIntensity={.5} roughness={.8}/></mesh>}
      {!done&&<><mesh rotation={[-Math.PI/2,0,0]} position={[0,.04,0]}><ringGeometry args={[.8,near?1: .86,32]}/><meshBasicMaterial color={near?'#ffe1a2':'#9fbeaa'} transparent opacity={.7}/></mesh>{mars.stage==='eva'&&<Html position={[0,2.8,0]} center distanceFactor={20} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className={'world-marker '+(near?'near':'')}><strong>{site.id==='research'?'RESEARCH TARGET':`SAMPLE ${site.id}`}</strong><span>{Math.round(Math.hypot(mars.player[0]-site.x,mars.player[2]-site.z))} m</span></div></Html>}</>}
    </group>;})}
    {mars.stage==='eva'&&<Html position={[mars.landing.x,4,mars.landing.z+5]} center distanceFactor={25} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker">ODYSSEY · AIRLOCK</div></Html>}
  </>;
}
