import RoboticWorld from './RoboticWorld';
import { usePlanetMissions } from './planetMissionStore';
import { PlanetMissionRuntime,MissionProbe } from './PlanetMissionUI';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { planets, useGame, type PlanetName } from './store';
import Ship from './Ship';
import PerformanceBudget from './PerformanceBudget';
import EarthPort from './EarthPort';
import ReflectionEnvironment from './ReflectionEnvironment';
import { ORBITAL_SCALE,transferSpeed } from './orbitalScale';
import Planet from './PlanetBody';
import EarthSatellites from './EarthSatellites';
import { useEarthOrbit } from './earthOrbitStore';
import MoonWorld from './MoonWorld';
import ExpeditionWorld, { StationOrbit, ExpeditionRuntime } from './ExpeditionWorld';
import { useExpedition } from './expeditionStore';
import { PORT,guideRendezvous } from './expedition';
import MarsWorld from './MarsWorld';
import { keys, steering, useInputs } from './input';
import { onMars } from './mars';
import { steerFlight, accelerateFlight } from './flight';

function Inputs() { useInputs(); return null; }

function Flight(){
  const ship=useRef<THREE.Group>(null);const pos=useRef(new THREE.Vector3(...useGame.getState().flightPosition));const velocity=useRef(new THREE.Vector3());const quat=useRef(new THREE.Quaternion(...useGame.getState().flightRotation));const tick=useRef(0);
  const pilotMode=useExpedition(s=>s.mode);useEffect(()=>{velocity.current.set(0,0,0);},[pilotMode]);const approach=useRef(0);const demoClock=useRef(0);const previousStage=useRef('space');const reset=useGame(s=>s.flightReset);
  const camera=useThree(s=>s.camera);const started=useGame(s=>s.started);const surface=useGame(s=>s.surface);
  useEffect(()=>{const s=useGame.getState();pos.current.fromArray(s.flightPosition);quat.current.fromArray(s.flightRotation);velocity.current.set(0,0,0);approach.current=0;demoClock.current=0;},[reset]);
  useEffect(()=>{if(!surface){velocity.current.set(0,0,0);}},[surface]);
  useFrame((state,delta)=>{
    const dt=Math.min(delta,.04),s=useGame.getState();
    if(!started){const previewCamera=camera as THREE.PerspectiveCamera;if(previewCamera.fov!==48){previewCamera.fov=48;previewCamera.updateProjectionMatrix();}camera.up.set(0,1,0);const preview=planets.find(p=>p.name===s.target)!;const [x,y,z]=preview.position;const r=preview.radius;camera.position.set(x*ORBITAL_SCALE,y*ORBITAL_SCALE+r*ORBITAL_SCALE*.367,z*ORBITAL_SCALE+r*ORBITAL_SCALE*(preview.name==='Saturn'?4.8:3));camera.lookAt((x-r*.5)*ORBITAL_SCALE,(y+r*.083)*ORBITAL_SCALE,z*ORBITAL_SCALE);if(ship.current){ship.current.position.set((x+r*.9)*ORBITAL_SCALE,(y-r*.45)*ORBITAL_SCALE,(z+r*1.5)*ORBITAL_SCALE);ship.current.rotation.set(.15,-.5,-.15);ship.current.scale.setScalar(1);}return;}
    if(s.surface||s.paused||s.uiBlocked||useExpedition.getState().mode!=='flight')return;
    if(useEarthOrbit.getState().focus&&!useExpedition.getState().presentation){velocity.current.set(0,0,0);return;}
    if(previousStage.current!==s.mars.stage){demoClock.current=0;previousStage.current=s.mars.stage;}
    if(s.mars.demo){demoClock.current+=dt;if(s.mars.stage==='space'&&demoClock.current>4)s.enterOrbit();if(s.mars.stage==='orbit'&&demoClock.current>4)s.beginLanding();}
    const p=planets.find(p=>p.name===s.target)!;const destination=new THREE.Vector3(...p.position);
    const expedition=useExpedition.getState();if((expedition.events.navigation||expedition.events.comms)&&(s.autopilot||expedition.navStation)){s.set({autopilot:false,notice:'Navigation / uplink interrupted. Brake and repair from the cabin.'});expedition.set({navStation:false});}
    if(expedition.dock!=='free'){velocity.current.set(0,0,0);quat.current.identity();pos.current.lerp(new THREE.Vector3(PORT[0],PORT[1],PORT[2]+.3),1-Math.exp(-dt*2));
    }else if(expedition.navStation){guideRendezvous(pos.current,quat.current,velocity.current,dt);
    }else if(s.mars.stage==='approach'){approach.current+=dt;const t=Math.min(1,approach.current/10);pos.current.set(58,4+3*(1-t),-55+13-7.5*t);quat.current.setFromRotationMatrix(new THREE.Matrix4().lookAt(pos.current,new THREE.Vector3(58,4,-55),new THREE.Vector3(0,1,0)));velocity.current.set(0,0,-.75);steering.x=0;steering.y=0;if(t>=1){s.atmosphere();approach.current=0;}
    }else if(s.moon.stage==='approach'&&s.target==='Moon'){approach.current+=dt;const t=Math.min(1,approach.current/8);pos.current.set(-23,2+2*(1-t),-20+11-7.7*t);quat.current.setFromRotationMatrix(new THREE.Matrix4().lookAt(pos.current,new THREE.Vector3(-23,2,-20),new THREE.Vector3(0,1,0)));velocity.current.set(0,0,-.4);if(t>=1){s.moonAtmosphere();approach.current=0;}
    }else if(s.mars.stage==='orbit'){velocity.current.set(0,0,0);steering.x=0;steering.y=0;
    }else if(s.autopilot){steering.x=0;steering.y=0;
      const dir=destination.clone().sub(pos.current);const distance=dir.length();
      if(distance<p.radius+9){s.set({autopilot:false,notice:`Arrived at ${p.name}. Press F to survey${p.name==='Moon'||p.name==='Mars'?' or use Land to explore.':'.'}`});velocity.current.set(0,0,0);}
      else{const desired=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(pos.current,destination,new THREE.Vector3(0,1,0)));quat.current.slerp(desired,1-Math.exp(-dt*3));velocity.current.copy(dir.normalize().multiplyScalar(transferSpeed(distance,p.radius)));}
    }else if(s.mars.demo){velocity.current.set(0,0,0);steering.x=0;steering.y=0;quat.current.setFromRotationMatrix(new THREE.Matrix4().lookAt(pos.current,destination,new THREE.Vector3(0,1,0)));
    }else{
      steerFlight(quat.current,keys,steering.x,steering.y,dt);steering.x=0;steering.y=0;
      const research=usePlanetMissions.getState(),record=research.records[s.target];const flightKeys=keys.has('KeyE')&&record?.done.includes('probe')&&!record.done.includes('complete')?new Set([...keys].filter(key=>key!=='KeyE')):keys;
      accelerateFlight(velocity.current,quat.current,flightKeys,dt,expedition.events.damage?.45:1);
    }
    pos.current.addScaledVector(velocity.current,dt);
    for(const planet of planets){const center=new THREE.Vector3(...planet.position),offset=pos.current.clone().sub(center);if(offset.length()<planet.radius+1.4){pos.current.copy(center.add((offset.lengthSq()<.000001?offset.set(0,0,1):offset).normalize().multiplyScalar(planet.radius+1.4)));velocity.current.set(0,0,0);}}
    if(ship.current){ship.current.visible=!s.cockpit;ship.current.scale.setScalar(1);ship.current.position.copy(pos.current);ship.current.quaternion.copy(quat.current);}
    const renderPosition=pos.current.clone().multiplyScalar(ORBITAL_SCALE);if(ship.current)ship.current.position.copy(renderPosition);
    const offset=new THREE.Vector3(0,s.cockpit?.32:1.6,s.cockpit?-.6:10).applyQuaternion(quat.current).add(renderPosition);
    camera.position.lerp(offset,1-Math.exp(-dt*7));const look=new THREE.Vector3(0,.2,-20).applyQuaternion(quat.current).add(renderPosition);camera.up.copy(new THREE.Vector3(0,1,0).applyQuaternion(quat.current));camera.lookAt(look);
    tick.current+=dt;if(tick.current>.1){tick.current=0;s.set({speed:velocity.current.length(),distance:Math.max(0,pos.current.distanceTo(destination)-p.radius),flightPosition:pos.current.toArray(),flightRotation:quat.current.toArray()});}
    state.invalidate();
  });
  return <group ref={ship} visible={!started||(!surface&&useExpedition.getState().mode==='flight')}><Ship boost={keys.has('ShiftLeft')}/></group>;
}
function Starfield(){const group=useRef<THREE.Group>(null),camera=useThree(s=>s.camera),quality=useExpedition(s=>s.graphics);useFrame(()=>{group.current?.position.copy(camera.position);});return <group ref={group}><Stars radius={8000} depth={2000} count={quality==='LOW'?1500:quality==='MEDIUM'?3500:6500} factor={60} saturation={.1} fade speed={.025}/></group>;}
function World(){const robot=usePlanetMissions(s=>s.robot);const surface=useGame(s=>s.surface);const stage=useGame(s=>s.mars.stage);const started=useGame(s=>s.started);const target=useGame(s=>s.target);const mode=useExpedition(s=>s.mode);const graphics=useExpedition(s=>s.graphics);const robotSurface=started&&!!robot&&surface===robot.planet;const marsSurface=started&&onMars(stage);const interior=started&&(mode==='station'||mode==='cabin');return <><ReflectionEnvironment/><Inputs/><ExpeditionRuntime/><PlanetMissionRuntime/>{interior?<ExpeditionWorld/>:<>{!robotSurface&&!marsSurface&&surface!=='Earth'&&<Starfield/>}{robotSurface?<RoboticWorld/>:marsSurface?<MarsWorld/>:started&&surface?(surface==='Earth'?<EarthPort/>:<MoonWorld/>):<><ambientLight intensity={.055}/><directionalLight position={[30,20,25]} intensity={3.3} color="#fffaf3"/><group scale={!started||mode==='flight'?ORBITAL_SCALE:1}>{planets.map(p=><Planet key={p.name} data={p} visible={started||p.name===target}/>)}{started&&<><StationOrbit/><EarthSatellites/><MissionProbe/></>}</group>{started&&mode==='eva'&&<ExpeditionWorld/>}</>}</>}<Flight/></>;}
export default function Scene(){const [resolutionScale,setResolutionScale]=useState(1);const quality=useExpedition(s=>s.graphics);return <Canvas shadows camera={{position:[0,2,24],fov:48,near:.05,far:40000}} dpr={(quality==='LOW'?1:quality==='MEDIUM'?1.25:1.75)*resolutionScale} gl={{antialias:true,alpha:false}} onCreated={({gl})=>{gl.setClearColor('#03070e');}} onPointerDown={(e)=>{const s=useGame.getState();if(s.started&&!s.paused&&!s.uiBlocked){const canvas=e.target as HTMLCanvasElement;canvas.requestPointerLock?.()?.catch(()=>useGame.getState().set({notice:'Mouse capture unavailable. Click and drag in space, or use arrow keys.'}));}}}><World/><PerformanceBudget key={quality} scale={resolutionScale} onScale={setResolutionScale}/></Canvas>;}
