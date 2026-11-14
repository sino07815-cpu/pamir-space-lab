import { useEffect,useLayoutEffect,useMemo,useRef } from 'react';
import * as THREE from 'three';
import { labelTexture,surfaceTexture } from './visualTextures';

function Welds({radius,from,to,spacing=.65}:{radius:number;from:number;to:number;spacing?:number}){
  const mesh=useRef<THREE.InstancedMesh>(null),count=Math.floor((to-from)/spacing)+1;
  useLayoutEffect(()=>{if(!mesh.current)return;const dummy=new THREE.Object3D();for(let i=0;i<count;i++){dummy.position.set(0,from+i*spacing,0);dummy.rotation.x=Math.PI/2;dummy.updateMatrix();mesh.current.setMatrixAt(i,dummy.matrix);}mesh.current.instanceMatrix.needsUpdate=true;},[radius,from,spacing,count]);
  return <instancedMesh ref={mesh} args={[undefined,undefined,count]}><torusGeometry args={[radius,.006,4,64]}/><meshStandardMaterial color="#8f989c" metalness={.85} roughness={.42}/></instancedMesh>;
}
function Engines({booster=false}:{booster?:boolean}){
  const mesh=useRef<THREE.InstancedMesh>(null),positions=useMemo(()=>booster?[...[0,1,2].map(i=>[Math.cos(i*Math.PI*2/3)*.18,Math.sin(i*Math.PI*2/3)*.18]),...Array.from({length:10},(_,i)=>[Math.cos(i*Math.PI/5)*.52,Math.sin(i*Math.PI/5)*.52]),...Array.from({length:20},(_,i)=>[Math.cos(i*Math.PI/10)*.94,Math.sin(i*Math.PI/10)*.94])]:Array.from({length:6},(_,i)=>[Math.cos(i*Math.PI/3)*.57,Math.sin(i*Math.PI/3)*.57]),[booster]);
  useLayoutEffect(()=>{if(!mesh.current)return;const dummy=new THREE.Object3D();positions.forEach(([x,z],i)=>{dummy.position.set(x,.20,z);dummy.updateMatrix();mesh.current!.setMatrixAt(i,dummy.matrix);});mesh.current.instanceMatrix.needsUpdate=true;},[positions]);
  return <instancedMesh ref={mesh} args={[undefined,undefined,positions.length]} castShadow><cylinderGeometry args={[booster?.075:.12,booster?.13:.24,.38,12,1,true]}/><meshStandardMaterial color="#3d464e" metalness={.8} roughness={.35} side={THREE.DoubleSide}/></instancedMesh>;
}
export function UpperStage(){
  const r=useMemo(()=>{
    const brushed=surfaceTexture('steel');brushed.repeat.set(10,1);const tiles=surfaceTexture('tiles');tiles.repeat.set(9,15);
    const steel=new THREE.MeshStandardMaterial({color:'#c2c9cd',metalness:.92,roughness:.28,bumpMap:brushed,bumpScale:.004});
    const shield=new THREE.MeshStandardMaterial({map:tiles,color:'#b5b6bb',roughness:.86,metalness:.12});
    const nosePoints=Array.from({length:33},(_,i)=>{const t=i/32;return new THREE.Vector2(1.15*(1-t*t),8.8+t*3.6);});
    return {brushed,tiles,steel,shield,nose:new THREE.LatheGeometry(nosePoints,64),noseShield:new THREE.LatheGeometry(nosePoints.map(p=>new THREE.Vector2(p.x+.008,p.y)),48,Math.PI/2,Math.PI),wordmark:labelTexture('PAMIR','#202c34'),mission:labelTexture('BEYOND EARTH','#26343f',undefined,1024,128)};
  },[]);
  useEffect(()=>()=>Object.values(r).forEach(value=>value.dispose()),[r]);
  return <group name="Pamir-stainless-upper-stage">
    <mesh position={[0,4.65,0]} material={r.steel} castShadow><cylinderGeometry args={[1.15,1.15,8.3,64]}/></mesh>
    <mesh geometry={r.nose} material={r.steel} castShadow/>
    <mesh position={[0,4.65,0]} material={r.shield} castShadow><cylinderGeometry args={[1.159,1.159,8.3,48,1,true,Math.PI/2,Math.PI]}/></mesh><mesh geometry={r.noseShield} material={r.shield} castShadow/>
    <mesh position={[0,.55,0]} material={r.steel}><cylinderGeometry args={[1.15,1.11,.18,64]}/></mesh><Engines/>
    <Welds radius={1.153} from={1} to={8.7}/>
    {[-1,1].map(side=><group key={side}>
      <mesh position={[side*1.24,2.1,-.25]} rotation={[0,0,side*-.26]} material={r.shield} castShadow><boxGeometry args={[1.42,2.8,.13]}/></mesh>
      <mesh position={[side*1.08,9.05,-.18]} rotation={[0,0,side*.36]} material={r.shield} castShadow><boxGeometry args={[.95,1.65,.11]}/></mesh>
      <mesh position={[side*.37,8.15,1.105]} scale={[.18,.28,.05]}><sphereGeometry args={[1,24,16]}/><meshPhysicalMaterial color="#152b3c" roughness={.14} metalness={.5} clearcoat={1}/></mesh>
      <mesh position={[side*.37,7.45,1.105]} scale={[.18,.28,.05]}><sphereGeometry args={[1,24,16]}/><meshPhysicalMaterial color="#152b3c" roughness={.14} metalness={.5} clearcoat={1}/></mesh>
    </group>)}
    <mesh position={[0,5.6,1.158]}><planeGeometry args={[1.35,.30]}/><meshBasicMaterial map={r.wordmark} transparent depthWrite={false}/></mesh>
    <mesh position={[0,5.16,1.159]}><planeGeometry args={[1.3,.15]}/><meshBasicMaterial map={r.mission} transparent depthWrite={false}/></mesh>
    <mesh position={[0,1.4,1.159]}><planeGeometry args={[.22,.4]}/><meshStandardMaterial color="#9eacb3" metalness={.9} roughness={.2}/></mesh>
  </group>;
}
export default function ModernRocket(){
  const r=useMemo(()=>{const brushed=surfaceTexture('steel');brushed.repeat.set(12,2);return {brushed,steel:new THREE.MeshStandardMaterial({color:'#b8c2c9',metalness:.92,roughness:.30,bumpMap:brushed,bumpScale:.005}),mark:labelTexture('PAMIR / HEAVY','#26313b')};},[]);
  useEffect(()=>()=>Object.values(r).forEach(value=>value.dispose()),[r]);
  return <group name="Pamir-modern-reusable-launch-vehicle">
    <mesh position={[0,8.85,0]} material={r.steel} castShadow><cylinderGeometry args={[1.17,1.17,17.1,64]}/></mesh><Engines booster/>
    <Welds radius={1.174} from={.8} to={17.3}/>
    <mesh position={[0,17.5,0]} material={r.steel}><cylinderGeometry args={[1.17,1.17,.75,64,1,true]}/></mesh>
    {[0,1,2,3].map(i=><group key={i} rotation={[0,i*Math.PI/2,0]}><mesh position={[0,16.9,1.6]} rotation={[-.15,0,0]}><boxGeometry args={[.9,.12,.9]}/><meshStandardMaterial color="#3a454a" metalness={.7}/></mesh>{[0,1,2,3].map(j=><mesh key={j} position={[-.32+j*.21,16.98,1.6]}><boxGeometry args={[.035,.10,.85]}/><meshStandardMaterial color="#9eafb7" metalness={.8}/></mesh>)}</group>)}
    <mesh position={[0,10.5,1.177]}><planeGeometry args={[1.2,.23]}/><meshBasicMaterial map={r.mark} transparent depthWrite={false}/></mesh>
    <group position={[0,17.8,0]}><UpperStage/></group>
  </group>;
}
