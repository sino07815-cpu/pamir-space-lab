import HeritageWorld from './Heritage';
import { useEffect,useMemo,useRef } from 'react';
import { useFrame,useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from './store';
import { useExpedition } from './expeditionStore';
import { stepLanding,stepWalker,type Walker } from './mars';
import { moonHeight,moonSamples,resolveMoonGround } from './surfacePhysics';
import { keys,consume,steering,resetInput } from './input';
import Ship from './Ship';
import { Astronaut } from './MarsWorld';
import PlanetTerrain from './PlanetTerrain';
import createPlanetTexture from './planetTextures';
import { LandingPanel } from './SurfaceHUD';
export function MoonHUD(){const g=useGame(),e=useExpedition(),m=g.moon;if(!g.started||g.surface!=='Moon'||e.mode!=='flight')return null;return <>
  <section className="mars-heading"><div className="eyebrow">LUNAR EXPLORATION / 1.62 m/s²</div><h2>{m.stage==='descent'?'LUNAR POWERED DESCENT':m.stage==='eva'?'BOOTS ON THE MOON':'LUNAR LANDER'}</h2><p role="status">{g.notice}</p></section>
  {m.stage==='descent'&&<LandingPanel planet="Moon"/>}
  {m.stage==='landed'&&<section className="surface-actions"><button className="primary" onClick={g.exitMoonShip}>PRESS E TO EXIT SPACECRAFT</button><button onClick={()=>{if(e.returnMoon())g.returnMoonOrbit();}}>RETURN TO SPACE</button></section>}
  {m.stage==='eva'&&<div className="lunar-interaction">E · SAMPLE / INSTRUMENT / AIRLOCK · SPACE JUMP · SHIFT RUN</div>}
  {(m.stage==='failed'||m.stage==='complete')&&<div className="mission-result-backdrop"><section className="mission-result success"><h2>{m.stage==='complete'?'LUNAR SURVEY COMPLETE':'LUNAR LANDING FAILED'}</h2><p>{m.stage==='complete'?'Geological samples secured. Expedition data saved.':'Reduce vertical and lateral speed, maintain stability, and align with the landing pad.'}</p><div className="result-grid"><div><small>SCIENCE EARNED</small><strong>{m.earned} PTS</strong></div><div><small>SAMPLES</small><strong>{g.samples.filter(id=>id.startsWith('Moon-')).length}</strong></div><div><small>TOUCHDOWN</small><strong>{m.landing.impact.toFixed(2)} m/s</strong></div><div><small>DURATION</small><strong>{Math.floor(m.elapsed/60)}:{String(Math.floor(m.elapsed)%60).padStart(2,'0')}</strong></div></div><div className="result-actions"><button className="primary" onClick={()=>{if(e.returnMoon())g.returnMoonOrbit();}}>RETURN TO SPACE</button>{m.stage==='failed'&&<button onClick={g.startMoonLanding}>RETRY LANDING</button>}{m.stage==='complete'&&<button onClick={()=>g.set({moon:{...m,stage:'landed'}})}>RETURN TO LANDER</button>}</div></section></div>}
  </>;}
export default function MoonWorld(){
  const moon=useGame(s=>s.moon),samples=useGame(s=>s.samples),deployed=useExpedition(s=>s.missions.lunar.done.includes('deploy'));const camera=useThree(s=>s.camera);
  const walker=useRef<Walker>({x:moon.player[0],y:moonHeight(moon.player[0],moon.player[2]),z:moon.player[2],vx:0,vz:0,vy:0}),sim=useRef(moon.landing),lander=useRef<THREE.Group>(null),flames=useRef<THREE.Group>(null),body=useRef<THREE.Group>(null),view=useRef({yaw:0,pitch:.1}),moving=useRef(0),jumping=useRef(0),interacting=useRef(false),telemetry=useRef(0);
  const earth=useMemo(()=>createPlanetTexture('Earth'),[]);useEffect(()=>()=>earth.dispose(),[earth]);
  useEffect(()=>{resetInput();camera.up.set(0,1,0);if(moon.stage==='descent')sim.current=moon.landing;if(moon.stage==='eva')walker.current={x:moon.player[0],y:moonHeight(moon.player[0],moon.player[2]),z:moon.player[2],vx:0,vz:0,vy:0};},[moon.stage,camera]);
  useFrame((_,delta)=>{const s=useGame.getState(),m=s.moon,e=useExpedition.getState(),dt=Math.min(.04,delta);if(!s.started||s.paused||s.uiBlocked||e.mode!=='flight')return;
    if(m.stage==='descent'){sim.current.assisted=m.landing.assisted;sim.current=stepLanding(sim.current,dt,keys.has('Space'),{x:(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),z:(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0)});const l=sim.current;if(lander.current){lander.current.position.set(l.x,l.altitude+1.1,l.z);lander.current.rotation.set(l.vz*.025,0,-l.vx*.025);}if(flames.current){flames.current.visible=l.throttle>.05;flames.current.scale.y=.5+l.throttle*2;}camera.position.lerp(new THREE.Vector3(l.x+14,l.altitude+8,l.z+20),1-Math.exp(-dt*2));camera.lookAt(l.x,l.altitude+1,l.z);telemetry.current+=dt;if(telemetry.current>.1||l.result!=='flying'){telemetry.current=0;s.updateMoonLanding(l);}return;}
    if(lander.current){lander.current.position.set(m.landing.x,1.1,m.landing.z);lander.current.rotation.set(0,0,0);}if(flames.current)flames.current.visible=false;
    if(m.stage!=='eva'){if(body.current)body.current.visible=false;camera.position.lerp(new THREE.Vector3(m.landing.x+12,6,m.landing.z+15),1-Math.exp(-dt*2));camera.lookAt(m.landing.x,1,m.landing.z);if(m.stage==='landed'&&consume('KeyE'))s.exitMoonShip();return;}
    view.current.yaw-=steering.x*.002;view.current.pitch=THREE.MathUtils.clamp(view.current.pitch+steering.y*.002,-.6,.8);steering.x=0;steering.y=0;view.current.yaw+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt;
    const input=new THREE.Vector3((keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),0,(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0)).applyAxisAngle(new THREE.Vector3(0,1,0),view.current.yaw);
    walker.current=stepWalker(walker.current,{x:input.x,z:input.z,jump:m.suit.energy>2&&consume('Space'),sprint:m.suit.energy>5&&(keys.has('ShiftLeft')||keys.has('ShiftRight'))},dt,{gravity:1.62,height:moonHeight,resolve:(x,z,ox,oz)=>resolveMoonGround(x,z,ox,oz,[m.landing.x,m.landing.z])});const p=walker.current;moving.current=Math.hypot(p.vx,p.vz);jumping.current=p.vy;
    if(body.current){body.current.visible=!s.cockpit;body.current.position.set(p.x,p.y,p.z);if(moving.current>.1)body.current.rotation.y=Math.atan2(-p.vx,-p.vz);}
    const desired=new THREE.Vector3(0,s.cockpit?1.7:3.1,s.cockpit?0:6).applyAxisAngle(new THREE.Vector3(0,1,0),view.current.yaw).add(new THREE.Vector3(p.x,p.y,p.z));desired.y=Math.max(desired.y,moonHeight(desired.x,desired.z)+.8);camera.position.lerp(desired,1-Math.exp(-dt*8));if(s.cockpit)camera.rotation.set(-view.current.pitch,view.current.yaw,0,'YXZ');else camera.lookAt(p.x,p.y+1.2-view.current.pitch*3,p.z);
    const pressed=consume('KeyE');telemetry.current+=dt;if(telemetry.current>.1||pressed){telemetry.current=0;s.updateSurfaceMotion('Moon',[p.x,p.y,p.z],{speed:moving.current,heading:view.current.yaw,airborne:p.y>moonHeight(p.x,p.z)+.05});e.set({moonPosition:[p.x,p.y,p.z]});}
    if(pressed){const nearby=moonSamples.some(site=>!s.samples.includes('Moon-'+site.id)&&Math.hypot(p.x-site.x,p.z-site.z)<3);const ship=Math.hypot(p.x-m.landing.x,p.z-m.landing.z-5)<3;if(nearby||ship){s.interactMoonSurface();if(ship)e.returnMoon(false);}else e.interactMoon();}
  });
  return <><color attach="background" args={['#030710']}/><ambientLight intensity={.35}/><directionalLight position={[-40,60,-25]} intensity={2.8} color="#f1f4ff"/><PlanetTerrain planet="Moon"/><HeritageWorld planet="Moon"/>
    <mesh position={[-45,35,-95]}><sphereGeometry args={[10,48,32]}/><meshStandardMaterial map={earth} roughness={.8}/></mesh>
    <mesh position={[0,.025,13]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[5.7,5.85,64]}/><meshBasicMaterial color="#d7b47f"/></mesh>
    <group ref={lander} position={[moon.landing.x,moon.landing.altitude+1.1,moon.landing.z]}><group position={[0,2.1,0]} rotation={[Math.PI/2,0,0]} scale={2}><Ship/></group>{[-1,1].flatMap(x=>[-1,1].map(z=><mesh key={`${x}${z}`} position={[x*1.8,-.55,z*1.7]}><cylinderGeometry args={[.08,.14,1.1,8]}/><meshStandardMaterial color="#b2b3aa"/></mesh>))}<group ref={flames} position={[0,-.5,0]}>{[-1,1].map(x=><mesh key={x} position={[x*1.2,-.5,1]} rotation={[Math.PI,0,0]}><coneGeometry args={[.2,1.4,12]}/><meshBasicMaterial color="#9fd9ef" transparent opacity={.7}/></mesh>)}</group></group>
    <group ref={body}><Astronaut moving={moving} jumping={jumping} interacting={interacting}/></group>
    {moonSamples.map(site=>!samples.includes('Moon-'+site.id)&&<group key={site.id} position={[site.x,moonHeight(site.x,site.z),site.z]}><mesh position={[0,.35,0]}><dodecahedronGeometry args={[.45,0]}/><meshStandardMaterial color="#abaeac" emissive={Math.hypot(moon.player[0]-site.x,moon.player[2]-site.z)<3?'#736946':'#20232a'} emissiveIntensity={.5}/></mesh><Html position={[0,2,0]} center distanceFactor={17} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker">LUNAR REGOLITH {site.id} · +50</div></Html></group>)}
    <group position={[16,moonHeight(16,-12),-12]}><mesh rotation={[-Math.PI/2,0,0]} position={[0,.03,0]}><ringGeometry args={[1,1.1,32]}/><meshBasicMaterial color="#9acfc0"/></mesh>{deployed&&<mesh position={[0,.8,0]}><cylinderGeometry args={[.08,.2,1.6,10]}/><meshStandardMaterial color="#cacbbf"/></mesh>}<Html position={[0,2.3,0]} center distanceFactor={18} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker">SEISMOMETER · {deployed?'DEPLOYED':'E TO DEPLOY'}</div></Html></group>
    {moon.stage==='eva'&&<Html position={[moon.landing.x,4,moon.landing.z+5]} center distanceFactor={18} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker">ODYSSEY AIRLOCK · E</div></Html>}
  </>;
}
