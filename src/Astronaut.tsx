import { useEffect,useMemo,useRef,type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from './store';
import { labelTexture,surfaceTexture } from './visualTextures';
export default function Astronaut({moving,jumping,interacting}:{moving:RefObject<number>;jumping:RefObject<number>;interacting:RefObject<boolean>}){
  const root=useRef<THREE.Group>(null),arms=useRef<(THREE.Group|null)[]>([]),legs=useRef<(THREE.Group|null)[]>([]),knees=useRef<(THREE.Group|null)[]>([]);
  const resources=useMemo(()=>{
    const weave=surfaceTexture('cloth');weave.repeat.set(6,6);const helmet=labelTexture('СССР','#b93426'),patch=labelTexture('Ю. ГАГАРИН','#252b2d','#d6cbb3',512,128);
    const cloth=new THREE.MeshStandardMaterial({color:'#d86d2f',roughness:.88,bumpMap:weave,bumpScale:.004});
    const white=new THREE.MeshStandardMaterial({color:'#e9e9de',roughness:.36,metalness:.1});
    const rubber=new THREE.MeshStandardMaterial({color:'#30383c',roughness:.9});
    const skin=new THREE.MeshStandardMaterial({color:'#d6a482',roughness:.63});
    const metal=new THREE.MeshStandardMaterial({color:'#b7c1be',roughness:.3,metalness:.72});
    const torso=new THREE.LatheGeometry([new THREE.Vector2(.16,0),new THREE.Vector2(.205,.05),new THREE.Vector2(.23,.18),new THREE.Vector2(.235,.33),new THREE.Vector2(.205,.46),new THREE.Vector2(.14,.52)],32);
    const smile=new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.045,1.653,-.153),new THREE.Vector3(0,1.635,-.166),new THREE.Vector3(.045,1.653,-.153)),12,.004,6,false);
    const hose=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.12,1.15,-.18),new THREE.Vector3(-.29,1.03,-.10),new THREE.Vector3(-.30,1.10,.17),new THREE.Vector3(-.14,1.23,.26)]),18,.018,8,false);
    return {weave,helmet,patch,cloth,white,rubber,skin,metal,torso,smile,hose};
  },[]);
  useEffect(()=>()=>{Object.values(resources).forEach(item=>item.dispose());},[resources]);
  useFrame(({clock},delta)=>{const g=useGame.getState();if(g.paused||g.uiBlocked)return;const speed=moving.current,run=speed>4,air=Math.abs(jumping.current)>.2,wave=Math.sin(clock.elapsedTime*(run?11:7.5))*Math.min(1,speed/3)*(run?.78:.48),blend=1-Math.exp(-delta*12);
    legs.current.forEach((leg,i)=>{if(leg)leg.rotation.x=THREE.MathUtils.lerp(leg.rotation.x,air?(i?.35:-.32):(i?-wave:wave),blend);});
    knees.current.forEach((knee,i)=>{if(knee)knee.rotation.x=air?.35:Math.max(0,i?wave:-wave)*.65;});
    arms.current.forEach((arm,i)=>{if(arm)arm.rotation.x=THREE.MathUtils.lerp(arm.rotation.x,interacting.current&&i===1?1.05:air?-.6:(i?wave:-wave)*.8,blend);});
    if(root.current){root.current.position.y=interacting.current?-.08:speed<.1?Math.sin(clock.elapsedTime*1.7)*.005:Math.abs(wave)*.025;root.current.rotation.x=interacting.current?-.18:run?-.10:0;}
  });
  const r=resources;
  return <group ref={root} name="Gagarin-inspired-cosmonaut">
    <mesh geometry={r.torso} material={r.cloth} position={[0,.96,0]} scale={[1,1,.72]} castShadow/>
    <mesh position={[0,.98,0]} rotation={[0,0,Math.PI/2]} material={r.cloth} castShadow><capsuleGeometry args={[.14,.20,8,20]}/></mesh>
    <mesh position={[0,1.45,0]} rotation={[Math.PI/2,0,0]} material={r.rubber}><torusGeometry args={[.143,.025,8,32]}/></mesh>
    <mesh position={[0,1.50,0]} rotation={[Math.PI/2,0,0]} material={r.metal}><torusGeometry args={[.151,.025,8,32]}/></mesh>
    <mesh position={[0,1.69,-.025]} scale={[.133,.174,.126]} material={r.skin} castShadow><sphereGeometry args={[1,32,24]}/></mesh>
    <mesh position={[0,1.72,.016]} material={r.white} castShadow><sphereGeometry args={[.224,40,28,-Math.PI*.15,Math.PI*1.3]}/></mesh>
    <mesh position={[0,1.72,.016]} material={r.white} castShadow><sphereGeometry args={[.225,40,20,0,Math.PI*2,0,.83]}/></mesh>
    <mesh position={[0,1.72,-.153]} scale={[1,.94,1]} material={r.rubber}><torusGeometry args={[.176,.013,8,40]}/></mesh>
    <mesh position={[0,1.72,-.012]} scale={[1,.94,.86]}><sphereGeometry args={[.205,36,24,Math.PI,Math.PI]}/><meshPhysicalMaterial color="#d9eef4" transparent opacity={.13} roughness={.07} metalness={.05} clearcoat={1} depthWrite={false}/></mesh>
    <mesh position={[0,1.883,-.148]} rotation={[.65,Math.PI,0]}><planeGeometry args={[.20,.053]}/><meshBasicMaterial map={r.helmet} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1}/></mesh>
    {[-1,1].map(side=><group key={side}>
      <mesh position={[side*.216,1.70,-.018]} rotation={[0,0,Math.PI/2]} material={r.metal}><cylinderGeometry args={[.033,.033,.035,12]}/></mesh>
      <mesh position={[side*.052,1.733,-.139]} scale={[1,.68,.35]}><sphereGeometry args={[.019,16,10]}/><meshStandardMaterial color="#e7e6db" roughness={.5}/></mesh>
      <mesh position={[side*.052,1.732,-.147]}><sphereGeometry args={[.008,12,8]}/><meshStandardMaterial color="#547483" roughness={.4}/></mesh>
      <mesh position={[side*.052,1.732,-.153]}><sphereGeometry args={[.004,8,6]}/><meshBasicMaterial color="#22282a"/></mesh>
      <mesh position={[side*.052,1.757,-.143]} rotation={[0,0,Math.PI/2+side*-.13]}><capsuleGeometry args={[.005,.039,4,8]}/><meshStandardMaterial color="#654c3c"/></mesh>
      <mesh position={[side*.093,1.687,-.114]} scale={[.034,.041,.017]} material={r.skin}><sphereGeometry args={[1,12,10]}/></mesh>
      <group ref={node=>{arms.current[side<0?0:1]=node;}} position={[side*.265,1.405,0]} rotation={[0,0,side*.11]}>
        <mesh position={[0,-.12,0]} material={r.cloth} castShadow><capsuleGeometry args={[.083,.20,8,16]}/></mesh>
        <mesh position={[0,-.29,0]} material={r.cloth}><sphereGeometry args={[.087,16,12]}/></mesh>
        <group position={[0,-.30,0]} rotation={[-.09,0,0]}><mesh position={[0,-.12,0]} material={r.cloth} castShadow><capsuleGeometry args={[.073,.18,8,16]}/></mesh><mesh position={[0,-.255,0]} material={r.rubber}><cylinderGeometry args={[.078,.075,.045,16]}/></mesh>
          <mesh position={[0,-.33,-.01]} scale={[.077,.10,.067]} material={r.white} castShadow><sphereGeometry args={[1,16,12]}/></mesh>
          {[0,1,2,3].map(i=><mesh key={i} position={[(i-1.5)*.027,-.405,-.018]} material={r.white}><capsuleGeometry args={[.016,.045,4,8]}/></mesh>)}
          <mesh position={[-side*.071,-.32,-.026]} rotation={[0,0,side*.5]} material={r.white}><capsuleGeometry args={[.022,.055,4,10]}/></mesh>
          {side<0&&<mesh position={[0,-.17,-.076]}><boxGeometry args={[.08,.08,.012]}/><meshStandardMaterial color="#b1c5c7" metalness={.95} roughness={.12}/></mesh>}
        </group>
      </group>
      <group ref={node=>{legs.current[side<0?0:1]=node;}} position={[side*.128,.98,0]}>
        <mesh position={[0,-.20,0]} material={r.cloth} castShadow><capsuleGeometry args={[.096,.24,8,18]}/></mesh>
        <group ref={node=>{knees.current[side<0?0:1]=node;}} position={[0,-.43,0]}><mesh position={[0,-.16,0]} material={r.cloth} castShadow><capsuleGeometry args={[.083,.25,8,18]}/></mesh><mesh position={[0,-.31,0]} material={r.rubber}><cylinderGeometry args={[.085,.09,.055,16]}/></mesh><mesh position={[0,-.43,-.045]} scale={[.105,.13,.185]} material={r.rubber} castShadow><sphereGeometry args={[1,20,12]}/></mesh><mesh position={[0,-.52,-.045]} material={r.rubber}><boxGeometry args={[.21,.045,.36]}/></mesh></group>
      </group>
      <mesh position={[side*.14,1.245,-.172]} rotation={[0,0,side*.06]} material={r.rubber}><boxGeometry args={[.027,.36,.013]}/></mesh>
    </group>)}
    <mesh position={[0,1.706,-.16]} scale={[.026,.035,.023]} material={r.skin}><sphereGeometry args={[1,16,12]}/></mesh>
    <mesh geometry={r.smile}><meshStandardMaterial color="#8b5a4d" roughness={.7}/></mesh>
    <mesh position={[0,1.815,-.073]} scale={[.119,.055,.09]}><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color="#66503e" roughness={.9}/></mesh>
    <mesh position={[0,1.30,-.18]} rotation={[0,Math.PI,0]}><planeGeometry args={[.17,.044]}/><meshBasicMaterial map={r.patch}/></mesh>
    <mesh position={[.03,1.19,-.184]} material={r.metal}><boxGeometry args={[.135,.10,.025]}/></mesh>
    {[-1,1].map(side=><mesh key={side} position={[side*.035+.03,1.19,-.202]} rotation={[Math.PI/2,0,0]} material={r.rubber}><cylinderGeometry args={[.017,.017,.015,12]}/></mesh>)}
    <mesh position={[0,1.22,.22]} scale={[.175,.235,.10]} material={r.white} castShadow><sphereGeometry args={[1,24,16]}/></mesh>
    <mesh position={[0,1.23,.315]} material={r.cloth}><boxGeometry args={[.20,.15,.025]}/></mesh><mesh geometry={r.hose} material={r.rubber}/>
  </group>;
}
