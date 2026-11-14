import { useEffect,useMemo,useRef } from 'react';
import { useFrame,useThree } from '@react-three/fiber';
import { Html,Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from './store';
import { useExpedition } from './expeditionStore';
import { PORT,REPAIR,STATION_FLIGHT_SCALE,distance,docking,stepEva,interiorAllowed,stationTerminals,cabinTerminals,type Suit } from './expedition';
import { consume,keys,steering,resetInput } from './input';
import { Astronaut } from './MarsWorld';

export function ExpeditionRuntime(){const accumulator=useRef(0);useFrame((_,dt)=>{const g=useGame.getState();if(!g.started||g.paused||g.uiBlocked){accumulator.current=0;return;}accumulator.current+=Math.min(.1,dt);if(accumulator.current>=.1){useExpedition.getState().advance(accumulator.current);accumulator.current=0;}});return null;}
export function StationOrbit(){
  const repaired=useExpedition(s=>s.repaired),position=useGame(s=>s.flightPosition),rotation=useGame(s=>s.flightRotation),speed=useGame(s=>s.speed),mode=useExpedition(s=>s.mode);
  const indicator=docking(position,rotation,speed),scale=mode==='flight'?STATION_FLIGHT_SCALE:1;return <group position={[PORT[0],PORT[1],PORT[2]-5*scale]} scale={scale}>
    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[1.3,1.3,7,20]}/><meshStandardMaterial color="#aebbc4" metalness={.65} roughness={.4}/></mesh>
    {[-1,1].map(side=><group key={side}>
      <mesh position={[side*3.2,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.9,.9,4,16]}/><meshStandardMaterial color="#e1ded2" metalness={.45} roughness={.45}/></mesh>
      <mesh position={[side*5.8,0,0]}><boxGeometry args={[4,.12,11]}/><meshStandardMaterial color="#244c74" metalness={.7} roughness={.3}/></mesh>
      {Array.from({length:6},(_,i)=><mesh key={i} position={[side*5.8,.07,-5+i*2]}><boxGeometry args={[4,.025,.04]}/><meshBasicMaterial color="#7e9aaa"/></mesh>)}
      <mesh position={[0,side*1.6,0]}><boxGeometry args={[.15,3.2,.2]}/><meshStandardMaterial color="#88959e"/></mesh>
    </group>)}
    <mesh position={[0,0,4.4]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.8,.8,2,16]}/><meshStandardMaterial color="#d2d8d7"/></mesh>
    <mesh position={[0,0,5]}><torusGeometry args={[.85,.09,8,40]}/><meshBasicMaterial color={indicator.ready?'#9cf0b9':'#dfac71'}/></mesh>
    <mesh position={[6,2,2]}><boxGeometry args={[.8,.7,.7]}/><meshStandardMaterial color={repaired?'#6eab96':'#ca7853'} emissive={repaired?'#163a29':'#7b2b13'} emissiveIntensity={.6}/></mesh>
    {mode==='flight'&&indicator.range<40&&<Html position={[0,2.5,5]} center distanceFactor={24} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className={'world-marker '+(indicator.ready?'near':'')}>PAMIR GATEWAY<strong>{indicator.range.toFixed(1)} u · {indicator.angle.toFixed(0)}° · {speed.toFixed(1)} u/s</strong></div></Html>}
  </group>;
}
function Room({x,z,label,window=false}:{x:number;z:number;label:string;window?:boolean}){
  return <group position={[x,0,z]}><mesh position={[0,-.12,0]}><boxGeometry args={[8,.22,8.5]}/><meshStandardMaterial color="#243747" metalness={.4}/></mesh><mesh position={[x>0?4:-4,1.7,0]}><boxGeometry args={[.18,3.4,8.5]}/><meshStandardMaterial color={window?'#335d72':'#7a8b95'} transparent={window} opacity={window?.28:1}/></mesh>{[-1,1].map(side=><mesh key={side} position={[0,1.7,side*4.25]}><boxGeometry args={[8,3.4,.15]}/><meshStandardMaterial color="#647680" metalness={.25}/></mesh>)}<mesh position={[0,3.35,0]}><boxGeometry args={[7.8,.12,8.5]}/><meshStandardMaterial color="#455a68"/></mesh><mesh position={[0,3.15,0]}><boxGeometry args={[5,.06,.18]}/><meshBasicMaterial color="#b5e1e9"/></mesh><Html position={[0,2.8,0]} center distanceFactor={15} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker">{label}</div></Html></group>;
}
function Interior({cabin}:{cabin:boolean}){
  const camera=useThree(s=>s.camera),mode=useExpedition(s=>s.mode),cockpit=useGame(s=>s.cockpit),terminals=cabin?cabinTerminals:stationTerminals;
  const position=useRef(new THREE.Vector3(useExpedition.getState().interior[0],0,useExpedition.getState().interior[1])),view=useRef({yaw:0,pitch:0}),body=useRef<THREE.Group>(null),moving=useRef(0),jumping=useRef(0),interacting=useRef(false),timer=useRef(0);
  useEffect(()=>{resetInput();camera.up.set(0,1,0);},[camera]);
  useFrame((_,delta)=>{const g=useGame.getState(),s=useExpedition.getState();if(g.paused||g.uiBlocked||!g.started)return;const dt=Math.min(.04,delta);view.current.yaw-=steering.x*.002;view.current.pitch=THREE.MathUtils.clamp(view.current.pitch-steering.y*.002,-1,1);steering.x=0;steering.y=0;view.current.yaw+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt;
    const input=new THREE.Vector3((keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),0,(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0));if(s.presentation){input.set(0,0,0);const target=new THREE.Vector3(5,0,8).sub(position.current);if(target.length()>1)input.copy(target.normalize().multiplyScalar(.5));}else if(input.lengthSq()>0)input.normalize();if(!s.presentation)input.applyAxisAngle(new THREE.Vector3(0,1,0),view.current.yaw);const old=position.current.clone(),next=old.clone().addScaledVector(input,dt*(keys.has('ShiftLeft')?4:2.4));
    if(interiorAllowed(next.x,old.z,cabin))position.current.x=next.x;if(interiorAllowed(position.current.x,next.z,cabin))position.current.z=next.z;
    for(const terminal of terminals){const offset=new THREE.Vector2(position.current.x-terminal.x,position.current.z-terminal.z);if(offset.length()<.65){offset.normalize().multiplyScalar(.65);position.current.x=terminal.x+offset.x;position.current.z=terminal.z+offset.y;}}
    moving.current=position.current.distanceTo(old)/Math.max(.001,dt);if(body.current){body.current.visible=!g.cockpit;body.current.position.copy(position.current);if(moving.current>.1)body.current.rotation.y=Math.atan2(-input.x,-input.z);}
    const desired=position.current.clone().add(new THREE.Vector3(0,g.cockpit?1.7:2.6,g.cockpit?0:3.3).applyAxisAngle(new THREE.Vector3(0,1,0),view.current.yaw));if(!interiorAllowed(desired.x,desired.z,cabin)){desired.x=position.current.x;desired.z=position.current.z;desired.y=1.9;}camera.position.lerp(desired,1-Math.exp(-dt*9));if(g.cockpit)camera.rotation.set(view.current.pitch,view.current.yaw,0,'YXZ');else camera.lookAt(position.current.x,1.2,position.current.z);
    timer.current+=dt;if(timer.current>.1||consume('KeyE')){timer.current=0;s.set({interior:[position.current.x,position.current.z]});if(keys.has('KeyE'))s.interactInterior();}
  });
  return <><color attach="background" args={['#030912']}/><ambientLight intensity={1.2}/><hemisphereLight args={['#c3e5f0','#1d2b35',1]}/><directionalLight position={[2,8,3]} intensity={2}/><Stars radius={120} count={1200} factor={2}/>
    {cabin?<><mesh position={[0,-.1,0]}><boxGeometry args={[8,.2,15]}/><meshStandardMaterial color="#1b2f40"/></mesh>{[-1,1].map(side=><mesh key={side} position={[side*3.8,1.7,0]}><boxGeometry args={[.2,3.4,15]}/><meshStandardMaterial color="#657885"/></mesh>)}<mesh position={[0,1.5,-7]}><boxGeometry args={[7.6,3,.15]}/><meshStandardMaterial color="#1c3c50" metalness={.6}/></mesh><mesh position={[0,.5,-5]}><boxGeometry args={[.8,1,.8]}/><meshStandardMaterial color="#6e7a7d"/></mesh></>:<><mesh position={[0,-.1,-3]}><boxGeometry args={[5.5,.2,32]}/><meshStandardMaterial color="#1c2f40"/></mesh>{[-14,-3,8].flatMap(z=>[-1,1].map(side=><Room key={`${z}${side}`} x={side*6.7} z={z} label={side>0?(z===8?'COMMAND CENTER':z===-3?'SYSTEMS':'ENGINEERING'):(z===8?'CREW QUARTERS':z===-3?'SCIENCE LAB':'OBSERVATION')} window={side<0&&z===-14}/>))}<mesh position={[-21,5,-14]}><sphereGeometry args={[7,32,24]}/><meshStandardMaterial color="#3679a0" emissive="#103448" emissiveIntensity={.3}/></mesh><mesh position={[-9,.4,8]}><boxGeometry args={[2,.8,3]}/><meshStandardMaterial color="#607888"/></mesh></>}
    {terminals.map(t=><group key={t.id} position={[t.x,0,t.z]}><mesh position={[0,.65,0]}><boxGeometry args={[.9,1.3,.55]}/><meshStandardMaterial color="#344c5e" metalness={.4}/></mesh><mesh position={[0,1.25,.29]} rotation={[-.15,0,0]}><planeGeometry args={[.75,.55]}/><meshBasicMaterial color="#80c9d4"/></mesh><Html position={[0,2.1,0]} center distanceFactor={13} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker">{t.name}</div></Html></group>)}
    <group ref={body} visible={!cockpit}><Astronaut moving={moving} jumping={jumping} interacting={interacting}/></group><Html position={[0,3,cabin?5:12]} center distanceFactor={15} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker">{mode==='cabin'?'ODYSSEY CREW CABIN':'PAMIR GATEWAY · MAGNETIC BOOTS'}</div></Html>
  </>;
}
function Spacewalk(){
  const camera=useThree(s=>s.camera),body=useRef<THREE.Group>(null),tether=useRef<THREE.LineSegments>(null),plume=useRef<THREE.Mesh>(null),local=useRef<Suit>(useExpedition.getState().suit),view=useRef({yaw:0,pitch:0}),timer=useRef(0),moving=useRef(0),jumping=useRef(.5),interacting=useRef(false);
  const positions=useMemo(()=>new Float32Array(6),[]);useEffect(()=>{resetInput();camera.up.set(0,1,0);},[camera]);
  useFrame((_,delta)=>{const s=useExpedition.getState(),g=useGame.getState();if(g.paused||g.uiBlocked||!g.started)return;const dt=Math.min(.04,delta);if(Math.abs(s.suit.oxygen-local.current.oxygen)>2)local.current.oxygen=s.suit.oxygen;
    view.current.yaw-=steering.x*.002;view.current.pitch=THREE.MathUtils.clamp(view.current.pitch-steering.y*.002,-1,1);steering.x=0;steering.y=0;view.current.yaw+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt;
    let input=new THREE.Vector3((keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),(keys.has('Space')?1:0)-(keys.has('ControlLeft')||keys.has('ControlRight')?1:0),(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0)).applyEuler(new THREE.Euler(view.current.pitch,view.current.yaw,0,'YXZ'));
    if(s.presentation){const target=new THREE.Vector3(...(s.repaired?s.anchor:REPAIR)).sub(new THREE.Vector3(...local.current.position));input=target.length()>(s.repaired?1.8:1.6)?target.normalize():new THREE.Vector3();}
    local.current=stepEva(local.current,input.toArray(),!s.presentation&&(keys.has('ShiftLeft')||keys.has('ShiftRight')),s.anchor,dt,s.badges.includes('EVA CERTIFIED')?.8:1);
    const p=new THREE.Vector3(...local.current.position);if(body.current){body.current.visible=!g.cockpit;body.current.position.copy(p).add(new THREE.Vector3(0,-1,0));body.current.rotation.set(view.current.pitch,view.current.yaw,0);}
    interacting.current=distance(local.current.position,REPAIR)<2.2&&(keys.has('KeyE')||s.presentation)&&!s.repaired;
    if(interacting.current){s.set({suit:{...local.current,repair:s.suit.repair}});s.repair(dt);}
    if(plume.current)plume.current.visible=input.lengthSq()>.01;
    if(tether.current){const a=tether.current.geometry.attributes.position;a.setXYZ(0,...s.anchor);a.setXYZ(1,...local.current.position);a.needsUpdate=true;}
    const desired=p.clone().add(new THREE.Vector3(0,g.cockpit?.6:1.5,g.cockpit?0:4).applyAxisAngle(new THREE.Vector3(0,1,0),view.current.yaw));camera.position.lerp(desired,1-Math.exp(-dt*7));if(g.cockpit)camera.rotation.set(view.current.pitch,view.current.yaw,0,'YXZ');else camera.lookAt(p);
    timer.current+=dt;if(timer.current>.1){timer.current=0;s.set({suit:{...local.current,repair:useExpedition.getState().suit.repair}});}
    const pressed=consume('KeyE');if((pressed||s.presentation)&&s.repaired&&distance(local.current.position,s.anchor)<2.7){s.set({suit:{...local.current,repair:useExpedition.getState().suit.repair}});s.recover();}
    if(!s.presentation&&pressed&&distance(local.current.position,s.anchor)<2.7){s.set({suit:{...local.current,repair:useExpedition.getState().suit.repair}});s.recover();}
  });
  return <><group ref={body}><Astronaut moving={moving} jumping={jumping} interacting={interacting}/><mesh ref={plume} position={[0,1,.65]} rotation={[Math.PI/2,0,0]}><coneGeometry args={[.15,.7,10]}/><meshBasicMaterial color="#96e6ff" transparent opacity={.7}/></mesh></group><lineSegments ref={tether}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><lineBasicMaterial color="#c8b173"/></lineSegments><Html position={REPAIR} center distanceFactor={20} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker">EXTERNAL RELAY · HOLD E TO REPAIR</div></Html><Html position={PORT} center distanceFactor={18} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker">AIRLOCK · E TO RETURN</div></Html></>;
}
export default function ExpeditionWorld(){const mode=useExpedition(s=>s.mode);return mode==='eva'?<Spacewalk/>:mode==='station'||mode==='cabin'?<Interior key={mode} cabin={mode==='cabin'}/>:null;}
