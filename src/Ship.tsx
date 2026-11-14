import { UpperStage } from './ModernRocket';
export default function Ship({boost=false}:{boost?:boolean}){
  return <group name="Odyssey-modern-spacecraft">
    <group rotation={[-Math.PI/2,0,0]} scale={.25}><group position={[0,-6.2,0]}><UpperStage/></group></group>
    {boost&&<group position={[0,0,2.25]} rotation={[Math.PI/2,0,0]}><mesh><coneGeometry args={[.23,1.8,20]}/><meshBasicMaterial color="#8bd9ff" transparent opacity={.65}/></mesh></group>}
  </group>;
}
