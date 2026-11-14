import { useEffect,useMemo,useRef } from 'react';
import * as THREE from 'three';
import { useExpedition } from './expeditionStore';
import { terrainHeight,boulders } from './mars';
import { moonHeight,moonRocks,type SurfacePlanet } from './surfacePhysics';
export default function PlanetTerrain({planet}:{planet:SurfacePlanet}){
  const quality=useExpedition(s=>s.graphics),segments=quality==='LOW'?90:quality==='HIGH'?180:150;
  const height=planet==='Mars'?terrainHeight:moonHeight,rocks=planet==='Mars'?boulders:moonRocks;
  const mesh=useRef<THREE.InstancedMesh>(null);
  const geometry=useMemo(()=>{const g=new THREE.PlaneGeometry(260,260,segments,segments);g.rotateX(-Math.PI/2);const p=g.attributes.position,colors=new Float32Array(p.count*3),c=new THREE.Color();for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=height(x,z),grain=Math.sin(x*7+z*11)*.018;p.setY(i,y);if(planet==='Mars')c.setHSL(.055+Math.sin(x*.41+z)*.008,.38,.29+y*.009+grain);else c.setHSL(.62,.035,.33+y*.012+grain);c.toArray(colors,i*3);}g.setAttribute('color',new THREE.BufferAttribute(colors,3));g.computeVertexNormals();return g;},[planet,segments,height]);
  useEffect(()=>{const dummy=new THREE.Object3D();rocks.forEach((b,i)=>{dummy.position.set(b.x,height(b.x,b.z)+b.r*.35,b.z);dummy.rotation.set(i*.7,i*.3,i*.2);dummy.scale.set(b.r,b.r*.7,b.r);dummy.updateMatrix();mesh.current?.setMatrixAt(i,dummy.matrix);});if(mesh.current)mesh.current.instanceMatrix.needsUpdate=true;},[height,rocks]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <><mesh geometry={geometry}><meshStandardMaterial vertexColors roughness={1}/></mesh><instancedMesh ref={mesh} args={[undefined,undefined,rocks.length]}><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color={planet==='Mars'?'#805441':'#77797b'} roughness={1}/></instancedMesh>{Array.from({length:22},(_,i)=>{const a=i/22*Math.PI*2,r=150+(i%4)*10;return <mesh key={i} position={[Math.sin(a)*r,5,Math.cos(a)*r]} rotation={[0,i,0]} scale={[1.5,1,.9]}><coneGeometry args={[15+(i%3)*5,23+(i%5)*5,7]}/><meshStandardMaterial color={planet==='Mars'?'#815845':'#65666a'} roughness={1}/></mesh>;})}</>;
}
