import { useEffect,useMemo,useRef } from 'react';
import { useFrame,useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from './store';
import { useExpedition } from './expeditionStore';
import { consume,keys,steering,resetInput } from './input';
import { resolveGround,terrainHeight } from './mars';
import { stepRover } from './surfacePhysics';
export default function Rover(){
  const rover=useGame(s=>s.mars.rover),root=useRef<THREE.Group>(null),wheels=useRef<THREE.Group>(null),local=useRef(rover),clock=useRef(0),view=useRef(0);const camera=useThree(s=>s.camera);
  const lightTarget=useMemo(()=>{const object=new THREE.Object3D();object.position.set(0,.1,-10);return object;},[]);
  useEffect(()=>{local.current=rover;resetInput();},[rover.occupied]);
  useFrame((_,delta)=>{const s=useGame.getState(),m=s.mars,dt=Math.min(.04,delta);if(s.paused||s.uiBlocked||!s.started||useExpedition.getState().mode!=='flight')return;
    if(m.stage==='eva'&&m.rover.occupied){const ship:[number,number]=[m.landing.x,m.landing.z];local.current=stepRover(local.current,(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0),(keys.has('KeyA')?1:0)-(keys.has('KeyD')?1:0),keys.has('Space'),dt,(x,z,ox,oz)=>resolveGround(x,z,ox,oz,ship));view.current-=steering.x*.002;steering.x=0;steering.y=0;
      const r=local.current,y=terrainHeight(r.x,r.z);const desired=new THREE.Vector3(0,s.cockpit?1.45:3.3,s.cockpit?-.3:6).applyAxisAngle(new THREE.Vector3(0,1,0),r.yaw+view.current).add(new THREE.Vector3(r.x,y,r.z));desired.y=Math.max(desired.y,terrainHeight(desired.x,desired.z)+.8);camera.position.lerp(desired,1-Math.exp(-dt*6));camera.lookAt(r.x-Math.sin(r.yaw+view.current)*8,y+1,r.z-Math.cos(r.yaw+view.current)*8);
      if(wheels.current)for(const wheel of wheels.current.children)wheel.rotation.x+=r.speed*dt/.38;
      clock.current+=dt;if(clock.current>.1||keys.has('KeyE')){clock.current=0;s.updateRover(r);}if(consume('KeyE')){s.updateRover(r);useGame.getState().interact();}
    }
    if(root.current){const r=m.rover.occupied?local.current:m.rover;root.current.position.set(r.x,terrainHeight(r.x,r.z),r.z);root.current.rotation.y=r.yaw;}
  });
  return <group ref={root} position={[rover.x,terrainHeight(rover.x,rover.z),rover.z]} rotation={[0,rover.yaw,0]}>
    <mesh position={[0,.75,0]}><boxGeometry args={[1.65,.7,2.4]}/><meshStandardMaterial color="#d5cfbc" metalness={.3}/></mesh><mesh position={[0,1.25,-.3]}><boxGeometry args={[1.2,.55,1.2]}/><meshStandardMaterial color="#3b6674" metalness={.65} roughness={.2}/></mesh><mesh position={[0,1.55,0]}><boxGeometry args={[1.5,.06,1.8]}/><meshStandardMaterial color="#274f6b"/></mesh>
    <group ref={wheels}>{[-1,1].flatMap(x=>[-.8,0,.8].map(z=><group key={`${x}-${z}`} position={[x*.96,.38,z]}><mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.38,.38,.28,12]}/><meshStandardMaterial color="#343537" roughness={.95}/></mesh><mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.15,.15,.3,10]}/><meshStandardMaterial color="#969d9b" metalness={.6}/></mesh></group>))}</group>
    <mesh position={[.45,1.9,.5]}><cylinderGeometry args={[.045,.045,1.2,8]}/><meshStandardMaterial color="#c9ccbf"/></mesh><mesh position={[.45,2.45,.5]}><boxGeometry args={[.35,.2,.22]}/><meshStandardMaterial color="#647c83"/></mesh><mesh position={[-.55,1.1,.75]}><boxGeometry args={[.5,.5,.5]}/><meshStandardMaterial color="#c88457"/></mesh>
    <primitive object={lightTarget}/>{[-1,1].map(x=><group key={x}><mesh position={[x*.55,.9,-1.22]}><sphereGeometry args={[.1,10,8]}/><meshBasicMaterial color="#e4f5ee"/></mesh><spotLight position={[x*.55,.9,-1.24]} target={lightTarget} color="#e4f5ee" intensity={rover.occupied?12:0} distance={20} angle={.55} penumbra={.5}/></group>)}
    {!rover.occupied&&<Html position={[0,3.1,0]} center distanceFactor={18} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker">PAMIR SCIENCE ROVER · E TO DRIVE</div></Html>}
  </group>;
}
