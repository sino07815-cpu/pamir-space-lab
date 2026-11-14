import { useLayoutEffect,useMemo,useRef } from 'react';
import * as THREE from 'three';

function Facade({x,z,width,height,depth}:{x:number;z:number;width:number;height:number;depth:number}){
  return <group position={[x,0,z]}>
    {Array.from({length:Math.floor(width/2)},(_,i)=><mesh key={i} position={[-width/2+1+i*2,height/2,depth/2+.07]}><boxGeometry args={[.035,height,.07]}/><meshStandardMaterial color="#7d8787" metalness={.45}/></mesh>)}
    {[1,2,3].map(i=><mesh key={i} position={[0,i*height/4,depth/2+.075]}><boxGeometry args={[width,.035,.08]}/><meshStandardMaterial color="#7c8889" metalness={.4}/></mesh>)}
    {[-1,1].map(side=><group key={side} position={[side*width*.28,height+.65,-depth*.18]}><mesh castShadow><boxGeometry args={[2.3,1.3,3]}/><meshStandardMaterial color="#c6cbc7" metalness={.35} roughness={.65}/></mesh>{[0,1,2,3,4].map(i=><mesh key={i} position={[0,-.4+i*.19,1.51]}><boxGeometry args={[1.9,.07,.03]}/><meshStandardMaterial color="#4b5c63" metalness={.5}/></mesh>)}</group>)}
  </group>;
}
export default function CampusArchitecture(){
  const grass=useRef<THREE.InstancedMesh>(null),flowers=useRef<THREE.InstancedMesh>(null);
  const blades=useMemo(()=>{let seed=493;const random=()=>{seed=seed*16807%2147483647;return seed/2147483647;};return Array.from({length:1600},()=>{let x=(random()-.5)*210,z=76+random()*38;if(Math.abs(x)<19)x+=x<0?-22:22;return{x,z,h:.15+random()*.35};});},[]);
  useLayoutEffect(()=>{const d=new THREE.Object3D();blades.forEach((b,i)=>{d.position.set(b.x,b.h/2,b.z);d.rotation.set(0,i*2.4,.15*Math.sin(i));d.scale.set(.12,b.h,.12);d.updateMatrix();grass.current?.setMatrixAt(i,d.matrix);if(i<160){d.position.y=b.h;d.scale.set(.07,.05,.07);d.updateMatrix();flowers.current?.setMatrixAt(i,d.matrix);flowers.current?.setColorAt(i,new THREE.Color(i%3?'#d7c8e3':'#ecdac0'));}});if(grass.current)grass.current.instanceMatrix.needsUpdate=true;if(flowers.current){flowers.current.instanceMatrix.needsUpdate=true;if(flowers.current.instanceColor)flowers.current.instanceColor.needsUpdate=true;}},[blades]);
  return <><Facade x={31} z={-8} width={20} height={7.6} depth={26}/><Facade x={-29} z={-19} width={22} height={15.6} depth={25}/>
    <instancedMesh ref={grass} args={[undefined,undefined,blades.length]}><coneGeometry args={[1,1,3]}/><meshStandardMaterial color="#6b7e3e" roughness={1}/></instancedMesh><instancedMesh ref={flowers} args={[undefined,undefined,160]}><icosahedronGeometry args={[1,0]}/><meshStandardMaterial roughness={1}/></instancedMesh>
    {[-1,1].flatMap(side=>Array.from({length:6},(_,i)=><mesh key={`${side}${i}`} position={[side*20,.035,28+i*5]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[7,.12]}/><meshStandardMaterial color="#dedbc5" roughness={1}/></mesh>))}
    {Array.from({length:9},(_,i)=><mesh key={i} position={[-3.2+i*.8,.04,64]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.4,3]}/><meshStandardMaterial color="#e3e0cf" roughness={1}/></mesh>)}
    {[-1,1].map(side=><mesh key={side} position={[side*15,.15,47]} receiveShadow><boxGeometry args={[.35,.3,48]}/><meshStandardMaterial color="#b5b5a6" roughness={.9}/></mesh>)}
  </>;
}
