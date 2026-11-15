import {LText} from './Locale';
import { useEffect,useMemo,useRef } from 'react';
import { useFrame,useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePort,launchEarth,finishEarthLaunch } from './earthPortState';
import { useGame } from './store';
import { useExpedition } from './expeditionStore';
import { consume,keys,resetInput,steering } from './input';
import Astronaut from './Astronaut';
import ModernRocket from './ModernRocket';
import EarthCampus from './EarthCampus';
import { stepWalker,type Walker } from './mars';
import { PORT_SPAWN,spaceportHeight,resolveSpaceport,boardingDistance,launchAltitude } from './spaceport';

export function EarthHUD(){
  const g=useGame(),p=usePort();if(!g.started||g.surface!=='Earth'||g.paused||g.uiBlocked)return null;
  const portrait=()=>{g.set({cockpit:false});usePort.setState({portrait:!p.portrait,overview:false});resetInput();};
  return <section className="earth-port-hud spaceport-hud"><div className="eyebrow"><LText>{"PAMIR LAUNCH COMPLEX 01 / EARTH"}</LText></div><h2><LText>{p.phase==='launch'?(p.time<1.7?'IGNITION SEQUENCE':'BEYOND THE HORIZON'):p.phase==='landing'?'WELCOME HOME':p.portrait?'THE FIRST EXPLORER':p.overview?'BEYOND THE HORIZON':'READY FOR DEPARTURE'}</LText></h2><p><LText>{p.phase==='walk'?(p.portrait?'GAGARIN-INSPIRED COSMONAUT · MOUSE TO ROTATE':'WASD WALK · SHIFT RUN · MOUSE LOOK · SPACE JUMP'):'GUIDED EDUCATIONAL FLIGHT · ESC PAUSE'}</LText></p>
    <LText>{p.phase==='walk'?<div className="spaceport-actions"><button className="suit-view-button" onClick={()=>{usePort.setState({overview:!p.overview,portrait:false});resetInput();}}><LText>{p.overview?'EXPLORE CAMPUS':'B · CAMPUS OVERVIEW'}</LText></button><button className="primary" disabled={p.range>6} onClick={launchEarth}><LText>{p.range>6?`BOARDING ACCESS · ${p.range.toFixed(0)} m`:'E · BOARD & LAUNCH'}</LText></button><button className="suit-view-button" onClick={portrait}><LText>{p.portrait?'RETURN TO EXPLORATION':'V · VIEW COSMONAUT'}</LText></button></div>:<div className="port-flight-data"><span><LText>{"FLIGHT PROGRESS "}</LText><b><LText>{Math.min(100,p.time/(p.phase==='launch'?12:8)*100).toFixed(0)}</LText><LText>{"%"}</LText></b></span><span><LText>{"ALTITUDE "}</LText><b><LText>{(p.phase==='launch'?launchAltitude(p.time):Math.max(0,100*(1-p.time/8)**2)).toFixed(0)}</LText><LText>{" m"}</LText></b></span></div>}</LText>
    <small><LText>{"SK-1-inspired visual tribute · PAMIR reusable vehicle · fictional spaceport"}</LText></small></section>;
}
function Exhaust({power}:{power:React.RefObject<number>}){
  const group=useRef<THREE.Group>(null);useFrame(({clock})=>{if(group.current){group.current.visible=power.current>0;group.current.scale.set(1+Math.sin(clock.elapsedTime*41)*.04,power.current*(1+Math.sin(clock.elapsedTime*53)*.04),1);}});
  return <group ref={group} visible={false}><mesh position={[0,-2.6,0]}><cylinderGeometry args={[.65,1.1,5.2,24,1,true]}/><meshBasicMaterial color="#c8e7ff" transparent opacity={.65} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh><mesh position={[0,-4.3,0]}><cylinderGeometry args={[.7,1.8,8.6,20,1,true]}/><meshBasicMaterial color="#efb78b" transparent opacity={.22} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh></group>;
}
function LaunchSmoke({time}:{time:React.RefObject<number>}){
  const points=useRef<THREE.Points>(null),positions=useMemo(()=>new Float32Array(60*3),[]),map=useMemo(()=>{const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d')!,g=ctx.createRadialGradient(32,32,0,32,32,31);g.addColorStop(0,'rgba(225,231,229,.7)');g.addColorStop(1,'rgba(225,231,229,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);},[]);
  useEffect(()=>()=>map.dispose(),[map]);useFrame(()=>{if(!points.current)return;const t=time.current;points.current.visible=t>0;if(!t)return;const a=points.current.geometry.attributes.position;for(let i=0;i<60;i++){const phase=(t*.17+i*.017)%1,r=2+phase*Math.min(19,t*3),angle=i*2.399;a.setXYZ(i,Math.cos(angle)*r,.3+phase*phase*6,Math.sin(angle)*r);}a.needsUpdate=true;});
  return <points ref={points} visible={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial map={map} transparent opacity={.28} size={6} depthWrite={false} sizeAttenuation/></points>;
}
export default function EarthPort(){
  const camera=useThree(s=>s.camera),body=useRef<THREE.Group>(null),ship=useRef<THREE.Group>(null),portraitLight=useRef<THREE.PointLight>(null),engineLight=useRef<THREE.PointLight>(null),portrait=usePort(s=>s.portrait);
  const walker=useRef<Walker>({x:PORT_SPAWN[0],y:0,z:PORT_SPAWN[2],vx:0,vz:0,vy:0}),view=useRef({yaw:.25,pitch:0}),moving=useRef(0),jumping=useRef(0),interacting=useRef(false),power=useRef(0),flightTime=useRef(0),smokeTime=useRef(0),timer=useRef(0);
  useEffect(()=>{const perspective=camera as THREE.PerspectiveCamera,previousFov=perspective.fov;perspective.fov=58;perspective.updateProjectionMatrix();camera.up.set(0,1,0);resetInput();if(usePort.getState().phase==='launch')usePort.setState({phase:'walk',time:0});if(usePort.getState().phase==='landing'){camera.position.set(32,120,58);camera.lookAt(0,116,0);}else{camera.position.set(PORT_SPAWN[0]+2.5,2.7,PORT_SPAWN[2]+9.7);camera.lookAt(PORT_SPAWN[0]-2.5,5.2,PORT_SPAWN[2]-9.7);}if(body.current)body.current.rotation.y=.25;return()=>{perspective.fov=previousFov;perspective.updateProjectionMatrix();};},[camera]);
  useEffect(()=>{view.current.yaw=(body.current?.rotation.y??.25)+(portrait?Math.PI:0);view.current.pitch=0;const perspective=camera as THREE.PerspectiveCamera;perspective.fov=portrait?48:58;perspective.updateProjectionMatrix();resetInput();},[portrait,camera]);
  useFrame((_,delta)=>{
    const g=useGame.getState(),p=usePort.getState(),dt=Math.min(delta,.04);if(!g.started||g.paused||g.uiBlocked||useExpedition.getState().mode!=='flight')return;
    if(p.phase!=='walk'){
      const time=p.time+dt;usePort.setState({time});const altitude=p.phase==='launch'?launchAltitude(time):Math.max(0,100*(1-time/8)**2);flightTime.current=time;smokeTime.current=p.phase==='launch'?time:altitude<18?8-time:0;power.current=p.phase==='launch'?Math.min(1,time/1.3):.7;
      if(ship.current)ship.current.position.y=1.9+altitude;if(body.current)body.current.visible=false;if(portraitLight.current)portraitLight.current.intensity=0;if(engineLight.current){engineLight.current.position.y=2+altitude;engineLight.current.intensity=power.current*100;}
      const angle=.45+time*.032;camera.position.lerp(new THREE.Vector3(Math.sin(angle)*63,altitude+20,Math.cos(angle)*63),1-Math.exp(-dt*3));camera.lookAt(0,altitude+16,0);
      if(p.phase==='launch'&&time>=12){finishEarthLaunch();resetInput();}else if(p.phase==='landing'&&time>=8){usePort.setState({phase:'walk',time:0,portrait:false});g.set({notice:'Welcome to PAMIR launch complex. Explore the campus or board for another expedition.'});}return;
    }
    power.current=0;flightTime.current=0;smokeTime.current=0;if(ship.current)ship.current.position.y=1.9;if(engineLight.current)engineLight.current.intensity=0;
    if(consume('KeyB')){usePort.setState({overview:!p.overview,portrait:false});resetInput();return;}
    if(p.overview){if(body.current)body.current.visible=false;camera.position.lerp(new THREE.Vector3(76,39,106),1-Math.exp(-dt*2));camera.lookAt(-2,15,-25);if(portraitLight.current)portraitLight.current.intensity=0;return;}
    if(consume('KeyV')){g.set({cockpit:false});usePort.setState({portrait:!p.portrait,overview:false});return;}
    view.current.yaw-=steering.x*.002;view.current.yaw+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt;view.current.pitch=THREE.MathUtils.clamp(view.current.pitch+steering.y*.002,-.65,.65);steering.x=0;steering.y=0;
    const input=new THREE.Vector3((keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),0,(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0)).applyAxisAngle(new THREE.Vector3(0,1,0),view.current.yaw);
    if(p.portrait&&input.lengthSq()>0){usePort.setState({portrait:false});return;}
    walker.current=stepWalker(walker.current,{x:input.x,z:input.z,jump:consume('Space'),sprint:keys.has('ShiftLeft')||keys.has('ShiftRight')},dt,{gravity:9.81,height:spaceportHeight,resolve:resolveSpaceport});
    const w=walker.current;moving.current=Math.hypot(w.vx,w.vz);jumping.current=w.vy;if(body.current){body.current.visible=!g.cockpit;body.current.position.set(w.x,w.y,w.z);if(moving.current>.1)body.current.rotation.y=Math.atan2(-w.vx,-w.vz);}
    let desired:THREE.Vector3;
    if(p.portrait){desired=new THREE.Vector3(0,1.35,3.2).applyAxisAngle(new THREE.Vector3(0,1,0),view.current.yaw).add(new THREE.Vector3(w.x,w.y,w.z));}
    else desired=new THREE.Vector3(0,g.cockpit?1.7:2.7,g.cockpit?0:10).applyAxisAngle(new THREE.Vector3(0,1,0),view.current.yaw).add(new THREE.Vector3(w.x,w.y,w.z));
    const [cx,cz]=resolveSpaceport(desired.x,desired.z,w.x,w.z);desired.x=cx;desired.z=cz;desired.y=Math.max(desired.y,spaceportHeight(cx,cz)+.8);camera.position.lerp(desired,1-Math.exp(-dt*8));
    if(g.cockpit)camera.rotation.set(-view.current.pitch,view.current.yaw,0,'YXZ');else if(p.portrait)camera.lookAt(w.x,w.y+1.05-view.current.pitch*.8,w.z);else camera.lookAt(new THREE.Vector3(0,5.2-view.current.pitch*16,-10).applyAxisAngle(new THREE.Vector3(0,1,0),view.current.yaw).add(new THREE.Vector3(w.x,w.y,w.z)));
    if(portraitLight.current){portraitLight.current.intensity=p.portrait?14:0;portraitLight.current.position.copy(camera.position).add(new THREE.Vector3(0,.4,0));}
    const pressed=consume('KeyE');timer.current+=dt;if(timer.current>.1||pressed){timer.current=0;usePort.setState({range:boardingDistance(w.x,w.z),speed:moving.current});}if(pressed)launchEarth();
  });
  return <><EarthCampus flightTime={flightTime}/><LaunchSmoke time={smokeTime}/><group ref={ship} position={[0,1.9,0]}><ModernRocket/><Exhaust power={power}/></group><group ref={body}><Astronaut moving={moving} jumping={jumping} interacting={interacting}/></group><pointLight ref={portraitLight} intensity={0} distance={8} color="#e4eff7"/><pointLight ref={engineLight} position={[0,2,0]} intensity={0} distance={30} color="#bedfff"/>
    <mesh position={[4.8,.8,3]}><boxGeometry args={[.5,1.5,.35]}/><meshStandardMaterial color="#536d78" metalness={.55}/></mesh><mesh position={[4.8,1.48,3.19]} rotation={[-.25,0,0]}><planeGeometry args={[.38,.28]}/><meshBasicMaterial color="#8bd0cf"/></mesh>
  </>;
}
