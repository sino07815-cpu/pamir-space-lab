import { Html } from '@react-three/drei';
import { terrainHeight } from './mars';
import { useGame } from './store';
import { useExpedition } from './expeditionStore';
import { baseRooms,baseTerminals,type BuildKind } from './expedition';
function Solar({x,z}:{x:number;z:number}){return <group position={[x,terrainHeight(x,z),z]}><mesh position={[0,.8,0]}><cylinderGeometry args={[.08,.1,1.6,8]}/><meshStandardMaterial color="#a5a49a"/></mesh><mesh position={[0,1.6,0]} rotation={[.25,0,0]}><boxGeometry args={[4,.1,2.3]}/><meshStandardMaterial color="#244963" metalness={.6}/></mesh>{[-1,0,1].map(i=><mesh key={i} position={[i*1.2,1.65,0]} rotation={[.25,0,0]}><boxGeometry args={[.04,.03,2.3]}/><meshBasicMaterial color="#93afbc"/></mesh>)}</group>;}
function Structure({kind,x,z}:{kind:BuildKind;x:number;z:number}){return kind==='solar'?<Solar x={x} z={z}/>:<group position={[x,0,z]}><mesh position={[0,1,0]}><cylinderGeometry args={[kind==='oxygen'?.6:.9,1,2,12]}/><meshStandardMaterial color={kind==='oxygen'?'#d9ddd2':'#aaa99c'} metalness={.45}/></mesh>{kind==='comms'?<><mesh position={[0,3,0]}><cylinderGeometry args={[.05,.09,4,8]}/><meshStandardMaterial color="#b4b9b1"/></mesh><mesh position={[0,4.7,0]} rotation={[.5,0,0]}><coneGeometry args={[1,.4,16,1,true]}/><meshStandardMaterial color="#c3c7bc" side={2}/></mesh></>:<mesh position={[0,2.2,0]}><sphereGeometry args={[.2,12,8]}/><meshBasicMaterial color={kind==='oxygen'?'#8ed3a7':'#ddac72'}/></mesh>}</group>;}
export default function Base(){
  const player=useGame(s=>s.mars.player),built=useExpedition(s=>s.built);return <>
    {baseRooms.map(room=>{const inside=Math.abs(player[0]-room.x)<4.2&&Math.abs(player[2]-room.z)<4.2;return <group key={room.name} position={[room.x,0,room.z]}>
      <mesh position={[0,.03,0]}><boxGeometry args={[8,.1,8]}/><meshStandardMaterial color="#7c7b70"/></mesh>
      {[-1,1].map(side=><mesh key={side} position={[side*4,1.6,0]}><boxGeometry args={[.2,3.2,8]}/><meshStandardMaterial color="#d3cbb8" roughness={.7}/></mesh>)}
      <mesh position={[0,1.6,-4]}><boxGeometry args={[8,3.2,.2]}/><meshStandardMaterial color="#c5c0b0"/></mesh>{[-1,1].map(side=><mesh key={side} position={[side*2.65,1.6,4]}><boxGeometry args={[2.7,3.2,.2]}/><meshStandardMaterial color="#c5c0b0"/></mesh>)}
      {!inside&&<mesh position={[0,3.25,0]}><boxGeometry args={[8.3,.2,8.3]}/><meshStandardMaterial color="#e0d7c3"/></mesh>}
      <mesh position={[0,3,0]}><boxGeometry args={[5,.05,.12]}/><meshBasicMaterial color="#c1e4dc"/></mesh>
      <Html position={[0,4,4.2]} center distanceFactor={24} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker">PAMIR BASE · {room.name}</div></Html>
    </group>;})}
    {baseTerminals.map(t=><group key={t.id} position={[t.x,0,t.z]}><mesh position={[0,.6,0]}><boxGeometry args={[.8,1.2,.5]}/><meshStandardMaterial color="#53636a"/></mesh><mesh position={[0,1.2,.27]}><planeGeometry args={[.65,.5]}/><meshBasicMaterial color="#9ad0d1"/></mesh><Html position={[0,2.4,0]} center distanceFactor={18} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker">{t.name}</div></Html></group>)}
    <Solar x={29} z={12}/><Solar x={29} z={16}/><Structure kind="comms" x={65} z={26}/><Structure kind="oxygen" x={60} z={33}/>
    {built.map((kind,i)=><Structure key={`${kind}-${i}`} kind={kind} x={70+(i%3)*7} z={6+Math.floor(i/3)*9}/>)}
    {[0,1,2].map(i=><mesh key={i} position={[28,1,24+i*2]}><boxGeometry args={[2,2,1.5]}/><meshStandardMaterial color="#ae8e65" roughness={.8}/></mesh>)}
    <group position={[38,.4,33]}><mesh><boxGeometry args={[2.2,.8,3]}/><meshStandardMaterial color="#c4b8a0"/></mesh>{[-1,1].flatMap(x=>[-1,1].map(z=><mesh key={`${x}${z}`} position={[x*1.2,-.1,z*.9]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.45,.45,.3,12]}/><meshStandardMaterial color="#45423c"/></mesh>))}</group>
  </>;
}
