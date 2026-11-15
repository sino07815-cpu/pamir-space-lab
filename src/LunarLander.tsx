import {useMemo} from 'react';
import * as THREE from 'three';
import {UpperStage} from './ModernRocket';
function Strut({a,b,thin=false}:{a:[number,number,number];b:[number,number,number];thin?:boolean}){
 const {position,quaternion,length}=useMemo(()=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);return{position:start.add(end).multiplyScalar(.5),quaternion:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize()),length:d.length()};},[a,b]);
 return <mesh position={position} quaternion={quaternion} castShadow><cylinderGeometry args={[thin?.026:.05,thin?.026:.065,length,10]}/><meshStandardMaterial color="#bac2c4" metalness={.82} roughness={.3}/></mesh>;
}
export default function LunarLander(){return <group name="PAMIR-Lunar-reusable-lander"><group position={[0,.72,0]} scale={.72}><UpperStage lunar/></group>
 {[0,1,2,3].map(i=><group key={i} rotation={[0,Math.PI/4+i*Math.PI/2,0]}><Strut a={[.65,2,0]} b={[2.2,.12,0]}/><Strut a={[.7,.95,0]} b={[2.2,.12,0]} thin/><mesh position={[2.2,.055,0]} castShadow receiveShadow><cylinderGeometry args={[.29,.33,.11,20]}/><meshStandardMaterial color="#9fa7aa" metalness={.75} roughness={.46}/></mesh><mesh position={[1.1,1.6,0]} rotation={[0,0,.65]}><cylinderGeometry args={[.09,.09,.45,12]}/><meshStandardMaterial color="#454e53" metalness={.7} roughness={.3}/></mesh></group>)}
 <Strut a={[-.22,.18,1.5]} b={[-.22,2.25,.86]} thin/><Strut a={[.22,.18,1.5]} b={[.22,2.25,.86]} thin/>{Array.from({length:8},(_,i)=><mesh key={i} position={[0,.3+i*.24,1.46-i*.074]} castShadow><boxGeometry args={[.5,.045,.085]}/><meshStandardMaterial color="#acb4b8" metalness={.8} roughness={.4}/></mesh>)}
 </group>;}
