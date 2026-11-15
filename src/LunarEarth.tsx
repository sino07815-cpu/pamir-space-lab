import {useEffect,useMemo} from 'react';
import {useTexture} from '@react-three/drei';
import * as THREE from 'three';
import {planetTextureUrl} from './planetVisuals';
import {lunarEarth} from './lunarLandscape';
export default function LunarEarth(){const source=useTexture(planetTextureUrl('Earth')),map=useMemo(()=>{const t=source.clone();t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;},[source]);useEffect(()=>()=>map.dispose(),[map]);return <group name="Earth-distant-lunar-sky" position={lunarEarth.position} rotation={[0,-.7,.18]}><mesh><sphereGeometry args={[lunarEarth.radius,40,28]}/><meshStandardMaterial map={map} roughness={1}/></mesh><mesh><sphereGeometry args={[lunarEarth.radius*1.012,32,20]}/><meshBasicMaterial color="#67aaff" transparent opacity={.07} side={THREE.BackSide} depthWrite={false}/></mesh></group>;}
