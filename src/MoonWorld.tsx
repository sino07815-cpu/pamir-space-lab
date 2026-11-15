import HeritageWorld from './Heritage';
import { Suspense,useEffect,useRef } from 'react';
import { useFrame,useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from './store';
import { useExpedition } from './expeditionStore';
import { stepLanding,stepWalker,type Walker } from './mars';
import { moonHeight,moonSamples,resolveMoonGround } from './surfacePhysics';
import { keys,consume,steering,resetInput } from './input';
import LunarLander from './LunarLander';
import LunarEarth from './LunarEarth';
import LunarTerrain from './LunarTerrain';
import { Astronaut } from './MarsWorld';

export {default as MoonHUD} from './LunarHUD';
export default function MoonWorld(){
  const moon=useGame(s=>s.moon),samples=useGame(s=>s.samples),deployed=useExpedition(s=>s.missions.lunar.done.includes('deploy'));const camera=useThree(s=>s.camera);const quality=useExpedition(s=>s.graphics);const history=useRef<THREE.Group>(null);
  const walker=useRef<Walker>({x:moon.player[0],y:moonHeight(moon.player[0],moon.player[2]),z:moon.player[2],vx:0,vz:0,vy:0}),sim=useRef(moon.landing),lander=useRef<THREE.Group>(null),flames=useRef<THREE.Group>(null),body=useRef<THREE.Group>(null),view=useRef({yaw:0,pitch:0}),moving=useRef(0),jumping=useRef(0),interacting=useRef(false),telemetry=useRef(0);
  useEffect(()=>{history.current?.traverse(object=>{if((object as THREE.Mesh).isMesh){object.castShadow=true;object.receiveShadow=true;}});},[]);
  useEffect(()=>{resetInput();camera.up.set(0,1,0);const lens=camera as THREE.PerspectiveCamera;lens.fov=48;lens.updateProjectionMatrix();
    if(moon.stage==='descent'){sim.current=moon.landing;const l=moon.landing,h=moonHeight(l.x,l.z);camera.position.set(l.x+16,h+l.altitude+10,l.z+24);camera.lookAt(l.x,h+l.altitude+4,l.z);}
    else if(moon.stage==='eva'){const [x,,z]=moon.player,y=moonHeight(x,z);walker.current={x,y,z,vx:0,vz:0,vy:0};view.current={yaw:0,pitch:0};camera.position.set(x,y+2.1,z+7.3);camera.lookAt(x,y+1.6,z);}
    else{const l=moon.landing;camera.position.set(l.x+13,7,l.z+20);camera.lookAt(l.x,3.5,l.z);}
  },[moon.stage,camera]);
  useFrame((_,delta)=>{const s=useGame.getState(),m=s.moon,e=useExpedition.getState(),dt=Math.min(.04,delta);if(!s.started||s.paused||s.uiBlocked||e.mode!=='flight')return;
    if(m.stage==='descent'){if(body.current)body.current.visible=false;sim.current.assisted=m.landing.assisted;sim.current=stepLanding(sim.current,dt,keys.has('Space'),{x:(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),z:(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0)});const l=sim.current;if(lander.current){lander.current.position.set(l.x,moonHeight(l.x,l.z)+l.altitude,l.z);lander.current.rotation.set(l.vz*.025,0,-l.vx*.025);}if(flames.current){flames.current.visible=l.throttle>.05;flames.current.scale.y=.5+l.throttle*2;}camera.position.lerp(new THREE.Vector3(l.x+16,moonHeight(l.x,l.z)+l.altitude+10,l.z+24),1-Math.exp(-dt*2));camera.lookAt(l.x,moonHeight(l.x,l.z)+l.altitude+4,l.z);telemetry.current+=dt;if(telemetry.current>.1||l.result!=='flying'){telemetry.current=0;s.updateMoonLanding(l);}return;}
    if(lander.current){lander.current.position.set(m.landing.x,moonHeight(m.landing.x,m.landing.z),m.landing.z);lander.current.rotation.set(0,0,0);}if(flames.current)flames.current.visible=false;
    if(m.stage!=='eva'){if(body.current)body.current.visible=false;camera.position.lerp(new THREE.Vector3(m.landing.x+13,7,m.landing.z+20),1-Math.exp(-dt*2));camera.lookAt(m.landing.x,3.5,m.landing.z);if(m.stage==='landed'&&consume('KeyE'))s.exitMoonShip();return;}
    view.current.yaw-=steering.x*.002;view.current.pitch=THREE.MathUtils.clamp(view.current.pitch+steering.y*.002,-.6,.8);steering.x=0;steering.y=0;view.current.yaw+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt;
    const input=new THREE.Vector3((keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),0,(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0)).applyAxisAngle(new THREE.Vector3(0,1,0),view.current.yaw);
    walker.current=stepWalker(walker.current,{x:input.x,z:input.z,jump:m.suit.energy>2&&consume('Space'),sprint:m.suit.energy>5&&(keys.has('ShiftLeft')||keys.has('ShiftRight'))},dt,{gravity:1.62,height:moonHeight,resolve:(x,z,ox,oz)=>resolveMoonGround(x,z,ox,oz,[m.landing.x,m.landing.z])});const p=walker.current;moving.current=Math.hypot(p.vx,p.vz);jumping.current=p.vy;
    if(body.current){body.current.visible=!s.cockpit;body.current.position.set(p.x,p.y,p.z);if(moving.current>.1)body.current.rotation.y=Math.atan2(-p.vx,-p.vz);}
    const desired=new THREE.Vector3(0,s.cockpit?1.7:2.1,s.cockpit?0:7.3).applyAxisAngle(new THREE.Vector3(0,1,0),view.current.yaw).add(new THREE.Vector3(p.x,p.y,p.z));desired.y=Math.max(desired.y,moonHeight(desired.x,desired.z)+.8);camera.position.lerp(desired,1-Math.exp(-dt*8));if(s.cockpit)camera.rotation.set(-view.current.pitch,view.current.yaw,0,'YXZ');else camera.lookAt(p.x,p.y+1.6-view.current.pitch*3,p.z);
    const pressed=consume('KeyE');telemetry.current+=dt;if(telemetry.current>.1||pressed){telemetry.current=0;s.updateSurfaceMotion('Moon',[p.x,p.y,p.z],{speed:moving.current,heading:view.current.yaw,airborne:p.y>moonHeight(p.x,p.z)+.05});e.set({moonPosition:[p.x,p.y,p.z]});}
    if(pressed){const nearby=moonSamples.some(site=>!s.samples.includes('Moon-'+site.id)&&Math.hypot(p.x-site.x,p.z-site.z)<3);const ship=Math.hypot(p.x-m.landing.x,p.z-m.landing.z-5)<3;if(nearby||ship){s.interactMoonSurface();if(ship)e.returnMoon(false);}else e.interactMoon();}
  });
  return <><color attach="background" args={['#010204']}/><ambientLight intensity={.045}/><hemisphereLight args={['#bdc9d7','#77716a',.16]}/><directionalLight name="Lunar-low-angle-sun" castShadow position={[-65,38,45]} intensity={3.5} color="#fff6e8" shadow-mapSize-width={quality==='LOW'?1024:2048} shadow-mapSize-height={quality==='LOW'?1024:2048} shadow-camera-left={-75} shadow-camera-right={75} shadow-camera-top={75} shadow-camera-bottom={-75} shadow-camera-near={.5} shadow-camera-far={220} shadow-normalBias={.035} shadow-bias={-.00015}/><LunarTerrain/><group ref={history}><HeritageWorld planet="Moon"/></group>
    <Suspense fallback={null}><LunarEarth/></Suspense>
    <mesh position={[0,.018,13]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[5.74,5.8,96]}/><meshBasicMaterial color="#c4ad79" transparent opacity={.28} depthWrite={false}/></mesh>
    <group ref={lander} name="Lunar-lander-root" position={[moon.landing.x,moonHeight(moon.landing.x,moon.landing.z)+moon.landing.altitude,moon.landing.z]}><LunarLander/><group ref={flames} position={[0,.6,0]}>{[-1,1].map(x=><mesh key={x} position={[x*.36,-.65,0]} rotation={[Math.PI,0,0]}><coneGeometry args={[.18,1.5,16]}/><meshBasicMaterial color="#b0e4ff" transparent opacity={.65} depthWrite={false}/></mesh>)}</group></group>
    <group ref={body} name="Lunar-explorer" visible={moon.stage==='eva'}><Astronaut moving={moving} jumping={jumping} interacting={interacting}/></group>
    {moonSamples.map(site=>!samples.includes('Moon-'+site.id)&&<group key={site.id} position={[site.x,moonHeight(site.x,site.z),site.z]}><mesh position={[0,.23,0]} castShadow receiveShadow><icosahedronGeometry args={[.32,1]}/><meshStandardMaterial color="#8e8980" roughness={1} emissive={Math.hypot(moon.player[0]-site.x,moon.player[2]-site.z)<3?'#72522d':'#000000'} emissiveIntensity={.14}/></mesh>{moon.stage==='eva'&&<Html position={[0,1.5,0]} center distanceFactor={16} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker lunar-world-marker"><strong>REGOLITH {site.id}</strong><span>{Math.round(Math.hypot(moon.player[0]-site.x,moon.player[2]-site.z))} m · +50 SCIENCE</span></div></Html>}</group>)}
    <group position={[16,moonHeight(16,-12),-12]}><mesh rotation={[-Math.PI/2,0,0]} position={[0,.02,0]}><ringGeometry args={[.9,.94,48]}/><meshBasicMaterial color="#9acfc0" transparent opacity={.45}/></mesh>{deployed&&<group><mesh position={[0,.25,0]} castShadow><cylinderGeometry args={[.26,.32,.5,12]}/><meshStandardMaterial color="#d0c6a5" metalness={.65} roughness={.4}/></mesh><mesh position={[0,.8,0]} castShadow><cylinderGeometry args={[.025,.025,1.2,8]}/><meshStandardMaterial color="#b9c2c7" metalness={.7}/></mesh></group>}{moon.stage==='eva'&&<Html position={[0,1.6,0]} center distanceFactor={18} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker lunar-world-marker">SEISMOMETER · {deployed?'ACTIVE':'RESEARCH SITE'}</div></Html>}</group>
    {moon.stage==='eva'&&<Html position={[moon.landing.x,1.8,moon.landing.z+4]} center distanceFactor={15} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker lunar-world-marker">ODYSSEY AIRLOCK</div></Html>}
  </>;
}
